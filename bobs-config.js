/* BOBS central configuration. Keep the Google Apps Script endpoints here. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jEFIPerRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  VERSION: '2026-08-26-phase1-permanent-master-6'
});
try { if (!localStorage.getItem('sheets-sync-url')) localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.SHEETS_WEB_APP_URL); } catch (e) {}

(function(){
  if(window.BOBSDataManager) return;
  const OUTLET_MASTER='bobs-permanent-outlet-master';
  const LEGACY_OUTLET_MASTER='outlets-master';
  const ACTIVE_OUTLET='outlet-selection';
  const WORKING_PREFIX='bobs-working-assessment:';
  const VERSION=6;
  const VAULT_URL=window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL;
  const read=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const now=()=>new Date().toISOString();
  function syncLegacy(d){write(LEGACY_OUTLET_MASTER,Object.values(d||{}).map(p=>({...p,shortCode:p.shortCode||p.code||''})))}
  function db(){
    let d=read(OUTLET_MASTER,null);
    if(!d||typeof d!=='object'||Array.isArray(d))d={};
    const legacy=read(LEGACY_OUTLET_MASTER,[]);
    if(Object.keys(d).length===0&&Array.isArray(legacy)&&legacy.length){legacy.forEach(o=>{if(o&&o.id)d[String(o.id)]={...o,id:String(o.id),createdAt:o.createdAt||now(),updatedAt:o.updatedAt||now()}});write(OUTLET_MASTER,d)}
    syncLegacy(d);
    return d;
  }
  function saveDb(d){d=d||{};write(OUTLET_MASTER,d);syncLegacy(d)}
  function queueGoogleOutletSave(outlet){
    if(!VAULT_URL||!outlet||!outlet.id)return;
    try{fetch(VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'outletSave',outlet:outlet}),keepalive:true}).catch(()=>{});}catch(e){}
  }
  function ensureOutlet(o){
    if(!o||!o.id)throw new Error('Outlet ID is required');
    const d=db(),id=String(o.id),old=d[id]||{};
    d[id]={...old,...o,id,shortCode:o.shortCode||o.code||old.shortCode||old.code||'',updatedAt:now()};
    if(!d[id].createdAt)d[id].createdAt=now();
    saveDb(d);queueGoogleOutletSave(d[id]);return d[id];
  }
  function saveMethod2(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');const d=db(),p=d[id]||{id,createdAt:now()};d[id]={...p,method2:state,method2SavedAt:now(),updatedAt:now()};saveDb(d);queueGoogleOutletSave(d[id]);return d[id]}
  function activeId(){const x=read(ACTIVE_OUTLET,null);return x&&x.id?String(x.id):localStorage.getItem('selected-outlet-id')||null}
  function profile(id){return db()[String(id)]||null}
  function getWorking(id){return read(WORKING_PREFIX+String(id||activeId()||''),null)}
  function setWorking(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');write(WORKING_PREFIX+id,{version:VERSION,outletId:id,updatedAt:now(),data:state});return getWorking(id)}
  function clearWorking(id){id=String(id||activeId()||'');if(id)localStorage.removeItem(WORKING_PREFIX+id)}
  function activateOutlet(id){const p=profile(id);if(!p)throw new Error('Permanent outlet profile not found: '+id);write(ACTIVE_OUTLET,{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',activatedAt:now()});localStorage.setItem('selected-outlet-id',String(p.id));return p}
  function summary(id){const p=profile(id||activeId());if(!p)return null;return{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',hasMethod2:!!p.method2,method2SavedAt:p.method2SavedAt||null,updatedAt:p.updatedAt||null}}
  function recoverFromGoogle(onDone){
    if(!VAULT_URL){if(onDone)onDone(false,0);return;}
    const cb='bobsOutletRecovery_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    let finished=false;
    const finish=(ok,count)=>{if(finished)return;finished=true;try{delete window[cb]}catch(e){};const s=document.getElementById(cb+'_script');if(s)s.remove();if(onDone)onDone(ok,count)};
    window[cb]=function(result){
      try{
        if(result&&result.ok&&Array.isArray(result.outlets)&&result.outlets.length){
          const d=db();
          result.outlets.forEach(item=>{
            const o=item.data||{},id=String(item.outletId||o.id||'');if(!id)return;
            const existing=d[id]||{};
            d[id]={...existing,...o,id,shortCode:o.shortCode||o.code||item.outletCode||existing.shortCode||'',name:o.name||item.outletName||existing.name||'',createdAt:existing.createdAt||item.createdAt||now(),updatedAt:item.updatedAt||o.updatedAt||now()};
          });
          saveDb(d);finish(true,result.outlets.length);return;
        }
        finish(true,0);
      }catch(e){finish(false,0)}
    };
    const s=document.createElement('script');s.id=cb+'_script';s.src=VAULT_URL+'?action=outletList&callback='+encodeURIComponent(cb)+'&t='+Date.now();s.async=true;s.onerror=()=>finish(false,0);document.head.appendChild(s);
    setTimeout(()=>finish(false,0),8000);
  }
  window.BOBSDataManager={version:VERSION,outletMasterKey:OUTLET_MASTER,legacyOutletMasterKey:LEGACY_OUTLET_MASTER,ensureOutlet,saveMethod2,getOutlet:profile,listOutlets:()=>db(),hasSaved:id=>!!profile(id||activeId()),hasMethod2:id=>!!(profile(id||activeId())||{}).method2,getWorking,setWorking,clearWorking,activateOutlet,summary,recoverFromGoogle};
  db();
})();

(function(){if(window.BOBSOutletMaster)return;const s=document.createElement('script');s.src='bobs-outlet-master.js?v=phase1-6';s.async=false;s.onload=function(){window.dispatchEvent(new Event('bobs-outlet-master-ready'))};document.head.appendChild(s)})();
(function(){const s=document.createElement('script');s.src='bobs-module-gate.js?v=phase1-3';s.async=false;document.head.appendChild(s)})();
