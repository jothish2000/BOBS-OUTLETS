/* BOBS central configuration. Keep the Google Apps Script endpoints here.
   Normal users should never have to paste either URL into individual pages. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  VERSION: '2026-08-26-phase1-protection-4'
});
try { if (!localStorage.getItem('sheets-sync-url')) localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.SHEETS_WEB_APP_URL); } catch (e) {}

/* Phase 1 central data ownership layer. */
(function(){
  if(window.BOBSDataManager) return;
  const OUTLET_MASTER='bobs-permanent-outlet-master', ACTIVE_OUTLET='outlet-selection', WORKING_PREFIX='bobs-working-assessment:', VERSION=1;
  const read=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}}, write=(k,v)=>localStorage.setItem(k,JSON.stringify(v)), now=()=>new Date().toISOString();
  const db=()=>read(OUTLET_MASTER,{})||{}, saveDb=v=>write(OUTLET_MASTER,v), activeId=()=>{const x=read(ACTIVE_OUTLET,null);return x&&x.id?String(x.id):null}, profile=id=>db()[String(id)]||null;
  function ensureOutlet(o){if(!o||!o.id)throw new Error('Outlet ID is required');const d=db(),id=String(o.id),old=d[id]||{};d[id]={...old,...o,id,updatedAt:now()};if(!d[id].createdAt)d[id].createdAt=now();saveDb(d);return d[id]}
  function saveMethod2(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');const d=db(),p=d[id]||{id,createdAt:now()};d[id]={...p,method2:state,method2SavedAt:now(),updatedAt:now()};saveDb(d);return d[id]}
  function getWorking(id){return read(WORKING_PREFIX+String(id||activeId()||''),null)}
  function setWorking(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');write(WORKING_PREFIX+id,{version:VERSION,outletId:id,updatedAt:now(),data:state});return getWorking(id)}
  function clearWorking(id){id=String(id||activeId()||'');if(id)localStorage.removeItem(WORKING_PREFIX+id)}
  function activateOutlet(id){const p=profile(id);if(!p)throw new Error('Permanent outlet profile not found: '+id);write(ACTIVE_OUTLET,{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',activatedAt:now()});return p}
  function summary(id){const p=profile(id||activeId());if(!p)return null;return {id:p.id,code:p.code||p.shortCode||'',name:p.name||'',hasMethod2:!!p.method2,method2SavedAt:p.method2SavedAt||null,updatedAt:p.updatedAt||null}}
  window.BOBSDataManager={version:VERSION,ensureOutlet,saveMethod2,getOutlet:profile,listOutlets:db,hasSaved:id=>!!profile(id||activeId()),hasMethod2:id=>!!(profile(id||activeId())||{}).method2,getWorking,setWorking,clearWorking,activateOutlet,summary};
  try{const existing=read('outlets-master',[]);if(Array.isArray(existing))existing.forEach(o=>{if(o&&o.id)ensureOutlet({id:String(o.id),code:o.shortCode||o.code||'',name:o.name||'',shiftTimes:o.shiftTimes||[],numShifts:o.numShifts||2})})}catch(e){}
})();

/* Existing permanent outlet helper remains available to pages that use it. */
(function(){if(window.BOBSOutletMaster)return;const s=document.createElement('script');s.src='bobs-outlet-master.js?v=phase1-4';s.async=false;s.onload=function(){window.dispatchEvent(new Event('bobs-outlet-master-ready'))};document.head.appendChild(s)})();

/* Central module-entry protection gate. */
(function(){const s=document.createElement('script');s.src='bobs-module-gate.js?v=phase1-1';s.async=false;document.head.appendChild(s)})();
