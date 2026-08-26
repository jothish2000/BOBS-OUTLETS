/* BOBS PERMANENT OUTLET DATA LIBRARY — Phase 1
 * Permanent outlet identity + outlet-specific saved Method 2 data.
 * This is NOT a snapshot vault and is NOT cleared by Start Fresh.
 */
(function(){
  const KEY='bobs-permanent-outlet-master',OUT='outlets-master',SEL='outlet-selection',M2='method2-item-state';
  const read=(k,fallback=null)=>{try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const db=()=>read(KEY,{})||{};
  const outletId=()=>{const o=read(SEL,null);return o&&o.id?String(o.id):null};
  function upsertOutlet(outlet){if(!outlet||!outlet.id)throw new Error('Outlet ID is required');const all=db(),id=String(outlet.id),old=all[id]||{};all[id]={...old,...outlet,id};write(KEY,all);return all[id]}
  function saveMethod2(state,id){const idv=String(id||outletId()||'');if(!idv)throw new Error('No outlet selected');const all=db(),old=all[idv]||{id:idv};all[idv]={...old,method2:state,method2SavedAt:new Date().toISOString()};write(KEY,all);return all[idv]}
  function get(id){const all=db();return all[String(id||outletId()||'')]||null}
  function all(){return db()}
  function hasMethod2(id){const x=get(id);return !!(x&&x.method2)}
  function mirrorOutlets(){const list=read(OUT,[]);if(!Array.isArray(list))return;list.forEach(o=>{if(o&&o.id)upsertOutlet({id:String(o.id),name:o.name||'',shortCode:o.shortCode||'',numShifts:o.numShifts,shiftTimes:o.shiftTimes||[]})})}
  function restorePermanentOutletsToWorkingList(){const all=db(),ids=Object.keys(all);if(!ids.length)return;const working=read(OUT,[]),arr=Array.isArray(working)?working.slice():[],byId={};arr.forEach(o=>{if(o&&o.id)byId[String(o.id)]=o});ids.forEach(id=>{const p=all[id];if(p&&!byId[id])byId[id]={id:p.id,name:p.name||'',shortCode:p.shortCode||'',numShifts:p.numShifts||2,shiftTimes:p.shiftTimes||[]}});const merged=Object.keys(byId).sort((a,b)=>(parseInt(a)||0)-(parseInt(b)||0)).map(k=>byId[k]);if(JSON.stringify(merged)!==JSON.stringify(working))write(OUT,merged)}
  function restoreCurrentMethod2(){const id=outletId();if(!id)return;const p=get(id);if(p&&p.method2&&localStorage.getItem(M2)===null)write(M2,p.method2)}
  function captureCurrentMethod2(){const id=outletId();if(!id)return;const state=read(M2,null);if(state!==null)saveMethod2(state,id)}
  function startBridge(){try{const page=(location.pathname.split('/').pop()||'').toLowerCase();if(page==='outlets.html'||page===''){restorePermanentOutletsToWorkingList();mirrorOutlets()}restoreCurrentMethod2();if(page==='method2.html')setInterval(captureCurrentMethod2,1200);if(page==='outlet-method-flow.html')setInterval(captureCurrentMethod2,1200)}catch(e){}}
  window.BOBSOutletMaster={key:KEY,upsertOutlet,saveMethod2,get,all,hasMethod2,currentOutletId:outletId,restorePermanentOutletsToWorkingList,restoreCurrentMethod2,captureCurrentMethod2};
  startBridge();
})();
