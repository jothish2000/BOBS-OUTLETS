/* BOBS central configuration. Keep the Google Apps Script endpoints here.
   Normal users should never have to paste either URL into individual pages. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  VERSION: '2026-08-26-phase1-protection-5'
});
try { if (!localStorage.getItem('sheets-sync-url')) localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.SHEETS_WEB_APP_URL); } catch (e) {}

/* Phase 1 central data ownership layer. */
(function(){
  if(window.BOBSDataManager) return;
  const OUTLET_MASTER='bobs-permanent-outlet-master', LEGACY_OUTLET_MASTER='outlets-master', ACTIVE_OUTLET='outlet-selection', WORKING_PREFIX='bobs-working-assessment:', VERSION=2;
  const read=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}}, write=(k,v)=>localStorage.setItem(k,JSON.stringify(v)), now=()=>new Date().toISOString();
  function db(){
    let d=read(OUTLET_MASTER,{})||{};
    if(!d||typeof d!=='object'||Array.isArray(d))d={};
    const legacy=read(LEGACY_OUTLET_MASTER,[]);
    if(Array.isArray(legacy)&&legacy.length){legacy.forEach(o=>{if(o&&o.id&&!d[String(o.id)])d[String(o.id)]={...o,id:String(o.id),shortCode:o.shortCode||o.code||'',createdAt:o.createdAt||now(),updatedAt:o.updatedAt||now()}});write(OUTLET_MASTER,d)}
    /* Always mirror the authoritative master to the legacy key because existing pages read it directly. */
    write(LEGACY_OUTLET_MASTER,Object.values(d).map(p=>({...p,shortCode:p.shortCode||p.code||''})));
    return d;
  }
  function saveDb(v){const d=v||{};write(OUTLET_MASTER,d);write(LEGACY_OUTLET_MASTER,Object.values(d).map(p=>({...p,shortCode:p.shortCode||p.code||''})));}
  const activeId=()=>{const x=read(ACTIVE_OUTLET,null);return x&&x.id?String(x.id):localStorage.getItem('selected-outlet-id')||null}, profile=id=>db()[String(id)]||null;
  function ensureOutlet(o){if(!o||!o.id)throw new Error('Outlet ID is required');const d=db(),id=String(o.id),old=d[id]||{};d[id]={...old,...o,id,updatedAt:now()};if(!d[id].createdAt)d[id].createdAt=now();saveDb(d);return d[id]}
  function saveMethod2(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');const d=db(),p=d[id]||{id,createdAt:now()};d[id]={...p,method2:state,method2SavedAt:now(),updatedAt:now()};saveDb(d);return d[id]}
  function getWorking(id){return read(WORKING_PREFIX+String(id||activeId()||''),null)}
  function setWorking(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');write(WORKING_PREFIX+id,{version:VERSION,outletId:id,updatedAt:now(),data:state});return getWorking(id)}
  function clearWorking(id){id=String(id||activeId()||'');if(id)localStorage.removeItem(workingKey(id))}
  function workingKey(id){return WORKING_PREFIX+String(id||activeId()||'')}
  function activateOutlet(id){const p=profile(id);if(!p)throw new Error('Permanent outlet profile not found: '+id);write(ACTIVE_OUTLET,{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',activatedAt:now()});localStorage.setItem('selected-outlet-id',String(p.id));return p}
  function summary(id){const p=profile(id||activeId());if(!p)return null;return {id:p.id,code:p.code||p.shortCode||'',name:p.name||'',hasMethod2:!!p.method2,method2SavedAt:p.method2SavedAt||null,updatedAt:p.updatedAt||null}}
  window.BOBSDataManager={version:VERSION,outletMasterKey:OUTLET_MASTER,legacyOutletMasterKey:LEGACY_OUTLET_MASTER,ensureOutlet,saveMethod2,getOutlet:profile,listOutlets:()=>db(),hasSaved:id=>!!profile(id||activeId()),hasMethod2:id=>!!(profile(id||activeId())||{}).method2,getWorking,setWorking,clearWorking,activateOutlet,summary};
  db();
})();

/* Existing permanent outlet helper remains available to pages that use it. */
(function(){if(window.BOBSOutletMaster)return;const s=document.createElement('script');s.src='bobs-outlet-master.js?v=phase1-5';s.async=false;s.onload=function(){window.dispatchEvent(new Event('bobs-outlet-master-ready'))};document.head.appendChild(s)})();

/* Central module-entry protection gate. */
(function(){const s=document.createElement('script');s.src='bobs-module-gate.js?v=phase1-2';s.async=false;document.head.appendChild(s)})();
