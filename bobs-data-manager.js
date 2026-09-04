/* BOBS DATA MANAGER — GOOGLE-FIRST RECOVERY
 * Google Data Vault / permanent outlet master is the permanent source of truth.
 * localStorage is only a temporary UI cache.
 */
(function(){
  if(window.BOBSDataManager) return;
  const OUTLET_MASTER='bobs-permanent-outlet-master';
  const LEGACY_OUTLET_MASTER='outlets-master';
  const ACTIVE_OUTLET='outlet-selection';
  const WORKING_PREFIX='bobs-working-assessment:';
  const VERSION=15;
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
  async function post(action,payload){if(!VAULT_URL)throw new Error('Google Data Vault URL is not configured');return await fetch(VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload}),keepalive:true})}
  function normalizeOutlet(item){const o=item&&item.record?item.record:(item&&item.data?item.data:item||{});const id=String(item&&item.outletId!=null?item.outletId:(o.id||''));if(!id)return null;const normalized={...o,id,shortCode:o.shortCode||o.code||(item&&item.shortCode)||item&&item.outletCode||'',name:o.name||(item&&item.outletName)||'',createdAt:(item&&item.createdAt)||o.createdAt||now(),updatedAt:(item&&item.updatedAt)||o.updatedAt||now(),numShifts:o.numShifts||item&&item.numShifts||2,shiftTimes:o.shiftTimes||item&&item.shiftTimes||[]};return {...normalized,outletId:id,outletName:normalized.name,outletCode:normalized.shortCode,data:normalized};}
  function cacheOutlets(arr){const d=db();(arr||[]).forEach(item=>{const o=normalizeOutlet(item);if(o)d[o.id]={...(d[o.id]||{}),...o}});saveCache(d);return Object.values(d);}
  function snapshotOutlets(data){
    const found=[];
    if(!data||typeof data!=='object')return found;
    const direct=data[OUTLET_MASTER]||data[LEGACY_OUTLET_MASTER];
    if(direct&&typeof direct==='object'&&!Array.isArray(direct)) Object.keys(direct).forEach(id=>{const o=normalizeOutlet(direct[id]);if(o)found.push(o)});
    const sel=data[ACTIVE_OUTLET];
    const candidates=Array.isArray(sel)?sel:[sel];
    candidates.forEach(x=>{if(!x||typeof x!=='object')return;const o=normalizeOutlet(x);if(o)found.push(o)});
    const analysis=data['outlet-analysis-data'];
    if(Array.isArray(analysis)) analysis.forEach(x=>{if(!x||typeof x!=='object')return;const o=normalizeOutlet(x);if(o)found.push(o)});
    else if(analysis&&typeof analysis==='object'){Object.keys(analysis).forEach(id=>{const o=normalizeOutlet({...analysis[id],id:analysis[id]&&analysis[id].id||id});if(o)found.push(o)})}
    return found;
  }
  async function recoverProtectedOutlets(){
    const listed=await jsonp('list',{},12000);
    if(!listed||!listed.ok||!Array.isArray(listed.snapshots))return [];
    const snaps=listed.snapshots.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    const found={};
    for(const s of snaps){
      if(!s||!s.snapshotId)continue;
      try{const r=await jsonp('restore',{snapshotId:s.snapshotId},12000);if(!r||!r.ok)continue;for(const o of snapshotOutlets(r.data||{})){if(o&&o.id&&!found[o.id])found[o.id]=o}}
      catch(e){}
      if(Object.keys(found).length)break;
    }
    const arr=Object.values(found);if(arr.length){const d=db();arr.forEach(o=>d[o.id]={...(d[o.id]||{}),...o});saveCache(d)}
    return arr;
  }
  async function recoverLegacyOutletMaster(){
    try{
      const result=await jsonp('outletList',{},12000);
      if(result&&result.ok&&Array.isArray(result.outlets)&&result.outlets.length){return cacheOutlets(result.outlets)}
    }catch(e){}
    return [];
  }
  async function saveToGoogle(outlet){if(!outlet||!outlet.id)throw new Error('Outlet ID is required');await post('outletMaster',{outlets:[outlet]});return outlet}
  async function ensureOutlet(outlet,options){const local=mergeLocal(outlet);if(options&&options.localOnly)return local;return await saveToGoogle(local)}
  function mergeLocal(outlet){const d=db(),id=String(outlet.id),old=d[id]||{},merged={...old,...outlet,id,shortCode:outlet.shortCode||outlet.code||old.shortCode||old.code||'',updatedAt:now()};if(!merged.createdAt)merged.createdAt=now();d[id]=merged;saveCache(d);return merged}
  async function saveMethod2(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');const p=profile(id)||{id,createdAt:now()};return await ensureOutlet({...p,method2:state,method2SavedAt:now(),updatedAt:now()})}
  async function recoverFromGoogle(onDone){
    try{
      const result=await jsonp('listOutletMaster',{},12000);
      if(!result||!result.ok)throw new Error((result&&result.error)||'Google returned an invalid outlet master');
      const d={};(result.outlets||[]).forEach(item=>{const o=normalizeOutlet(item);if(o)d[o.id]=o});
      if(Object.keys(d).length){saveCache(d);if(onDone)onDone(true,Object.keys(d).length,'Google OUTLET_MASTER loaded');return Object.values(d)}
      const legacy=await recoverLegacyOutletMaster();
      if(legacy.length){if(onDone)onDone(true,legacy.length,'Recovered existing outlets from legacy Google OUTLET_MASTER');return legacy}
      const recovered=await recoverProtectedOutlets();
      if(recovered.length){if(onDone)onDone(true,recovered.length,'Recovered protected outlet profile from BOBS Data Vault snapshot');return recovered}
      saveCache({});if(onDone)onDone(true,0,'Google OUTLET_MASTER contains no permanent outlets');return [];
    }catch(e){
      const legacy=await recoverLegacyOutletMaster();
      if(legacy.length){if(onDone)onDone(true,legacy.length,'Recovered existing outlets from legacy Google OUTLET_MASTER');return legacy}
      try{const recovered=await recoverProtectedOutlets();if(recovered.length){if(onDone)onDone(true,recovered.length,'Recovered protected outlet profile from BOBS Data Vault snapshot');return recovered}}catch(x){}
      if(onDone)onDone(false,0,String(e));throw e;
    }
  }
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