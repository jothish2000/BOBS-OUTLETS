/* BOBS CENTRAL CONFIGURATION — GOOGLE-FIRST
 * Google Sheets is the permanent source of truth.
 * Browser storage is only a temporary UI cache.
 */
window.BOBS_CONFIG = Object.freeze({
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  VERSION: '2026-09-04-outlet-recovery-2'
});

/* CENTRAL STAFF MASTER */
(function(){
  const MASTER_ID='MASTER', MODULE='STAFF_MASTER';
  window.BOBS_STAFF_MASTER={outletId:MASTER_ID,recordKey:'staff-list'};
  function nextId(used){let n=1;while(used.has('E'+String(n).padStart(3,'0')))n++;return'E'+String(n).padStart(3,'0')}
  function normalizeStaff(data){
    if(!data||!Array.isArray(data.staff))return data;
    const used=new Set(data.staff.map(s=>String(s.staffId||'').trim().toUpperCase()).filter(x=>/^E\d+$/.test(x)));
    const out=data.staff.map(s=>{const x={...s},old=String(x.staffId||'').trim().toUpperCase();if(!/^E\d+$/.test(old)){const id=nextId(used);used.add(id);x.staffId=id;if(old)x.legacyStaffId=old;x.updatedAt=new Date().toISOString()}x.staffId=String(x.staffId||'').toUpperCase();x.monthlyAttachments=x.monthlyAttachments||{};return x});
    return {...data,staff:out};
  }
  function parseScriptSrc(src){try{return new URL(src,location.href)}catch(e){return null}}
  const originalAppend=HTMLHeadElement.prototype.appendChild;
  HTMLHeadElement.prototype.appendChild=function(node){try{if(node&&node.tagName==='SCRIPT'&&node.src){const u=parseScriptSrc(node.src);if(u&&u.searchParams.get('action')==='moduleGet'&&u.searchParams.get('module')===MODULE&&u.searchParams.get('recordKey')==='staff-list'&&u.searchParams.get('outletId')!==MASTER_ID){const legacyId=u.searchParams.get('outletId'),cb=u.searchParams.get('callback');if(cb&&typeof window[cb]==='function'){const originalCb=window[cb],finishedState={done:false};window[cb]=function(payload){if(finishedState.done)return;if(payload&&payload.ok&&payload.found&&payload.data&&Array.isArray(payload.data.staff)){finishedState.done=true;window[cb]=originalCb;originalCb(normalizeStaff(payload));return}const legacy=new URL(u.href);legacy.searchParams.set('outletId',legacyId);legacy.searchParams.set('t',Date.now());const sc=document.createElement('script');sc.src=legacy.href;sc.async=true;sc.onerror=function(){finishedState.done=true;window[cb]=originalCb;originalCb(payload)};window[cb]=function(p2){finishedState.done=true;window[cb]=originalCb;originalCb(normalizeStaff(p2))};originalAppend.call(document.head,sc)}u.searchParams.set('outletId',MASTER_ID);u.searchParams.set('t',Date.now());node.src=u.href}}}catch(e){}return originalAppend.call(this,node)};
  const originalFetch=window.fetch;
  window.fetch=function(input,init){try{const body=init&&init.body;if(typeof body==='string'&&body.indexOf('STAFF_MASTER')!==-1&&body.indexOf('moduleSave')!==-1){const p=JSON.parse(body);if(p.module===MODULE){p.outletId=MASTER_ID;p.recordKey='staff-list';if(p.data)p.data=normalizeStaff(p.data);init={...init,body:JSON.stringify(p)}}}}catch(e){}return originalFetch.call(this,input,init)};
})();

/* METHOD + WORKING DATA SAFETY GUARD */
(function(){
  if(window.__BOBS_WORKING_DELETE_GUARD)return;
  window.__BOBS_WORKING_DELETE_GUARD=true;
  const KEYS=new Set(['outlet-analysis-data','outlet-selection','method1-hourly-state','method2-item-state']);
  const nativeRemove=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key){
    try{
      const k=String(key);
      if(KEYS.has(k)){
        const value=this.getItem(k);
        if(value && value!=='{}' && value!=='null')this.setItem('bobs-recovery-'+k,value);
        return;
      }
    }catch(e){}
    return nativeRemove.call(this,key);
  };
})();

/* Phase 1 flow controller */
try { const s=document.createElement('script'); s.src='bobs-phase1-flow.js?v='+encodeURIComponent(window.BOBS_CONFIG.VERSION); s.defer=true; document.head.appendChild(s); } catch(e) {}
