/* BOBS PERMANENT OUTLET DATA LIBRARY — Phase 1
 * Permanent outlet identity + outlet-specific saved Method 2 data.
 * This is NOT a snapshot vault and is NOT cleared by Start Fresh.
 */
(function(){
  const KEY='bobs-permanent-outlet-master';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}};
  const write=v=>localStorage.setItem(KEY,JSON.stringify(v));
  function outletId(){
    try{const o=JSON.parse(localStorage.getItem('outlet-selection')||'null');return o&&o.id?String(o.id):null}catch(e){return null}
  }
  function upsertOutlet(outlet){
    if(!outlet||!outlet.id) throw new Error('Outlet ID is required');
    const db=read(),id=String(outlet.id),old=db[id]||{};
    db[id]={...old,...outlet,id};
    write(db); return db[id];
  }
  function saveMethod2(state,id){
    const outletIdValue=String(id||outletId()||'');
    if(!outletIdValue) throw new Error('No outlet selected');
    const db=read(),old=db[outletIdValue]||{id:outletIdValue};
    db[outletIdValue]={...old,method2:state,method2SavedAt:new Date().toISOString()};
    write(db); return db[outletIdValue];
  }
  function get(id){const db=read();return db[String(id||outletId()||'')]||null}
  function all(){return read()}
  function hasMethod2(id){const x=get(id);return !!(x&&x.method2)}
  window.BOBSOutletMaster={
    key:KEY,
    upsertOutlet,
    saveMethod2,
    get,
    all,
    hasMethod2,
    currentOutletId:outletId
  };
})();
