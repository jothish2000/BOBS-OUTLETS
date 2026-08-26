/* BOBS DATA MANAGER — Phase 1
 * Central ownership rules for permanent outlet profiles, working assessments,
 * and protected snapshots. This layer does not change calculation logic.
 * Compatibility: keeps the legacy outlets-master list synchronized so existing
 * BOBS pages can see the same permanent outlet records.
 */
(function(){
  const OUTLET_MASTER='bobs-permanent-outlet-master';
  const LEGACY_OUTLET_MASTER='outlets-master';
  const ACTIVE_OUTLET='outlet-selection';
  const WORKING_PREFIX='bobs-working-assessment:';
  const VERSION=1;

  function read(k,fallback){try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function db(){return read(OUTLET_MASTER,null)||migrateLegacy()||{}}
  function saveDb(v){write(OUTLET_MASTER,v);syncLegacy(v)}
  function syncLegacy(v){const arr=Object.values(v||{}).map(p=>({...p,shortCode:p.shortCode||p.code||''}));write(LEGACY_OUTLET_MASTER,arr)}
  function migrateLegacy(){const arr=read(LEGACY_OUTLET_MASTER,null);if(!Array.isArray(arr)||!arr.length)return null;const d={};arr.forEach(o=>{if(o&&o.id)d[String(o.id)]={...o,id:String(o.id),createdAt:o.createdAt||now(),updatedAt:o.updatedAt||now()}});if(Object.keys(d).length){write(OUTLET_MASTER,d);return d}return null}
  function activeId(){const x=read(ACTIVE_OUTLET,null);return x&&x.id?String(x.id):null}
  function profile(id){return db()[String(id)]||null}

  function ensureProfile(outlet){
    if(!outlet||!outlet.id) throw new Error('Outlet ID is required');
    const d=db(),id=String(outlet.id),old=d[id]||{};
    d[id]={...old,...outlet,id,shortCode:outlet.shortCode||outlet.code||old.shortCode||old.code||'',updatedAt:now()};
    if(!d[id].createdAt)d[id].createdAt=now();
    saveDb(d);return d[id];
  }

  function saveMethod2(id,state){
    id=String(id||activeId()||'');
    if(!id)throw new Error('No outlet selected');
    const d=db(),p=d[id]||{id:id,createdAt:now()};
    d[id]={...p,method2:state,method2SavedAt:now(),updatedAt:now()};
    saveDb(d);return d[id];
  }

  function list(){return db()}
  function hasSaved(id){const p=profile(id||activeId());return !!p}
  function hasMethod2(id){const p=profile(id||activeId());return !!(p&&p.method2)}

  function workingKey(id){return WORKING_PREFIX+String(id||activeId()||'')}
  function getWorking(id){return read(workingKey(id),null)}
  function setWorking(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');write(workingKey(id),{version:VERSION,outletId:id,updatedAt:now(),data:state});return getWorking(id)}
  function clearWorking(id){id=String(id||activeId()||'');if(id)localStorage.removeItem(workingKey(id));}

  function activate(id){
    id=String(id||'');const p=profile(id);if(!p)throw new Error('Permanent outlet profile not found: '+id);
    write(ACTIVE_OUTLET,{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',activatedAt:now()});
    localStorage.setItem('selected-outlet-id',String(p.id));
    return p;
  }

  function summary(id){
    const p=profile(id||activeId());
    if(!p)return null;
    return {id:p.id,code:p.code||p.shortCode||'',name:p.name||'',hasMethod2:!!p.method2,method2SavedAt:p.method2SavedAt||null,updatedAt:p.updatedAt||null};
  }

  window.BOBSDataManager={
    version:VERSION,
    outletMasterKey:OUTLET_MASTER,
    ensureOutlet:ensureProfile,
    saveMethod2,
    getOutlet:profile,
    listOutlets:list,
    hasSaved,
    hasMethod2,
    getWorking,
    setWorking,
    clearWorking,
    activateOutlet:activate,
    summary
  };
})();
