/* BOBS DATA MANAGER — GOOGLE-FIRST
 * Google Sheets / Data Vault is the permanent source of truth.
 * localStorage is only a temporary UI cache and is never used to decide
 * whether a permanent outlet exists.
 */
(function(){
  if(window.BOBSDataManager) return;
  const OUTLET_MASTER='bobs-permanent-outlet-master';
  const LEGACY_OUTLET_MASTER='outlets-master';
  const ACTIVE_OUTLET='outlet-selection';
  const WORKING_PREFIX='bobs-working-assessment:';
  const VERSION=11;
  const DEFAULT_VAULT_URL='https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
  const CFG=window.BOBS_CONFIG||{};
  const VAULT_URL=String(CFG.DATA_VAULT_WEB_APP_URL||DEFAULT_VAULT_URL).trim();
  const read=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const now=()=>new Date().toISOString();
  const db=()=>{const d=read(OUTLET_MASTER,{});return d&&typeof d==='object'&&!Array.isArray(d)?d:{}};
  const saveCache=d=>write(OUTLET_MASTER,d||{});
  const activeId=()=>{const x=read(ACTIVE_OUTLET,null);return x&&x.id?String(x.id):localStorage.getItem('selected-outlet-id')||null};
  const profile=id=>db()[String(id)]||null;
  const workingKey=id=>WORKING_PREFIX+String(id||activeId()||'');
  function jsonp(action,params,timeout){return new Promise((resolve,reject)=>{if(!VAULT_URL)return reject(new Error('Google Data Vault URL is not configured'));const cb='bobsApi_'+Date.now()+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');let done=false;const finish=(err,data)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}script.remove();err?reject(err):resolve(data)};const timer=setTimeout(()=>finish(new Error('Google Data Vault request timed out')),timeout||12000);window[cb]=data=>finish(null,data);script.onerror=()=>finish(new Error('Unable to contact Google Data Vault'));script.src=VAULT_URL+'?'+new URLSearchParams({action,callback:cb,t:String(Date.now()),...(params||{})});script.async=true;document.head.appendChild(script)})}
  async function post(action,outlet){if(!VAULT_URL)throw new Error('Google Data Vault URL is not configured');return await fetch(VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,outlet}),keepalive:true})}
  async function saveToGoogle(outlet){if(!outlet||!outlet.id)throw new Error('Outlet ID is required');await post('outletSave',outlet);let lastError='';for(let attempt=0;attempt<5;attempt++){try{const result=await jsonp('outletGet',{outletId:String(outlet.id)},12000);if(result&&result.ok&&result.found&&result.outlet&&String(result.outlet.outletId)===String(outlet.id))return result.outlet;lastError='Google did not return the saved outlet yet'}catch(e){lastError=String(e)}await new Promise(r=>setTimeout(r,500*(attempt+1)))}throw new Error(lastError||'Google save verification failed')}
  function mergeLocal(outlet){const d=db(),id=String(outlet.id),old=d[id]||{},merged={...old,...outlet,id,shortCode:outlet.shortCode||outlet.code||old.shortCode||old.code||'',updatedAt:now()};if(!merged.createdAt)merged.createdAt=now();d[id]=merged;saveCache(d);return merged}
  async function ensureOutlet(outlet,options){const local=mergeLocal(outlet);if(options&&options.localOnly)return local;return await saveToGoogle(local)}
  async function saveMethod2(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');const p=profile(id)||{id,createdAt:now()};return await ensureOutlet({...p,method2:state,method2SavedAt:now(),updatedAt:now()})}
  async function recoverFromGoogle(onDone){try{const result=await jsonp('outletList',{},12000);if(!result||!result.ok)throw new Error((result&&result.error)||'Google returned an invalid outlet list');const d={};(result.outlets||[]).forEach(item=>{const o=item.data||{},id=String(item.outletId||o.id||'');if(!id)return;d[id]={...o,id,shortCode:o.shortCode||o.code||item.outletCode||'',name:o.name||item.outletName||'',createdAt:item.createdAt||o.createdAt||now(),updatedAt:item.updatedAt||o.updatedAt||now()}});saveCache(d);if(onDone)onDone(true,(result.outlets||[]).length,'Google OUTLET_MASTER loaded');return result.outlets||[]}catch(e){if(onDone)onDone(false,0,String(e));throw e}}
  function listOutlets(){return db()}
  function hasSaved(id){return !!profile(id||activeId())}
  function hasMethod2(id){const p=profile(id||activeId());return !!(p&&p.method2)}
  function getWorking(id){return read(workingKey(id),null)}
  function setWorking(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');write(workingKey(id),{version:VERSION,outletId:id,updatedAt:now(),data:state});return getWorking(id)}
  function clearWorking(id){id=String(id||activeId()||'');if(id)localStorage.removeItem(workingKey(id))}
  function activateOutlet(id){const p=profile(id);if(!p)throw new Error('Permanent outlet profile not found: '+id);write(ACTIVE_OUTLET,{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',activatedAt:now()});localStorage.setItem('selected-outlet-id',String(id));return p}
  function summary(id){const p=profile(id||activeId());if(!p)return null;return{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',hasMethod2:!!p.method2,method2SavedAt:p.method2SavedAt||null,updatedAt:p.updatedAt||null}}
  window.BOBSDataManager={version:VERSION,outletMasterKey:OUTLET_MASTER,legacyOutletMasterKey:LEGACY_OUTLET_MASTER,ensureOutlet,saveMethod2,saveToGoogle,getOutlet:profile,listOutlets,hasSaved,hasMethod2,getWorking,setWorking,clearWorking,activateOutlet,summary,recoverFromGoogle};
})();
