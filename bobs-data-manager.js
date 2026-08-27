/* BOBS DATA MANAGER — Phase 1
 * CLEAN PERMANENT OUTLET MASTER
 *
 * The old browser key `outlets-master` is legacy data and is no longer used
 * as a source for the new permanent model. A one-time cut-over clears the
 * old local outlet list so the new model starts clean.
 *
 * Permanent profiles are mirrored to Google OUTLET_MASTER.
 * Working assessments and protection snapshots remain separate.
 */
(function(){
  const OUTLET_MASTER='bobs-permanent-outlet-master';
  const LEGACY_OUTLET_MASTER='outlets-master';
  const CUTOVER='bobs-clean-permanent-outlet-cutover-v1';
  const ACTIVE_OUTLET='outlet-selection';
  const WORKING_PREFIX='bobs-working-assessment:';
  const VERSION=8;
  const CFG=window.BOBS_CONFIG||{};
  const VAULT_URL=CFG.DATA_VAULT_WEB_APP_URL||'';

  function read(k,fallback){try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}

  /* One-time clean cut-over. This deliberately discards the OLD browser
     outlet list because the user chose to start the new permanent model. */
  function cleanCutover(){
    try{
      if(localStorage.getItem(CUTOVER)!=='done'){
        localStorage.removeItem(OUTLET_MASTER);
        localStorage.removeItem(LEGACY_OUTLET_MASTER);
        localStorage.removeItem(ACTIVE_OUTLET);
        localStorage.removeItem('selected-outlet-id');
        localStorage.setItem(CUTOVER,'done');
      }
    }catch(e){}
  }

  function db(){
    let d=read(OUTLET_MASTER,null);
    if(!d||typeof d!=='object'||Array.isArray(d))d={};
    return d;
  }

  function saveDb(v){
    write(OUTLET_MASTER,v||{});
    /* Keep the legacy working-list key as a MIRROR of the new master only.
       It is never read as a source of truth. */
    const d=v||{};
    write(LEGACY_OUTLET_MASTER,Object.values(d).map(p=>({...p,shortCode:p.shortCode||p.code||''})));
  }

  function activeId(){
    const x=read(ACTIVE_OUTLET,null);
    return x&&x.id?String(x.id):localStorage.getItem('selected-outlet-id')||null;
  }

  function profile(id){return db()[String(id)]||null}

  function ensureProfile(outlet){
    if(!outlet||!outlet.id)throw new Error('Outlet ID is required');
    const d=db(),id=String(outlet.id),old=d[id]||{};
    d[id]={...old,...outlet,id,shortCode:outlet.shortCode||outlet.code||old.shortCode||old.code||'',updatedAt:now()};
    if(!d[id].createdAt)d[id].createdAt=now();
    saveDb(d);
    queueGoogleOutletSave(d[id]);
    return d[id];
  }

  function saveMethod2(id,state){
    id=String(id||activeId()||'');
    if(!id)throw new Error('No outlet selected');
    const d=db(),p=d[id]||{id:id,createdAt:now()};
    d[id]={...p,method2:state,method2SavedAt:now(),updatedAt:now()};
    saveDb(d);queueGoogleOutletSave(d[id]);return d[id];
  }

  function list(){return db()}
  function hasSaved(id){return !!profile(id||activeId())}
  function hasMethod2(id){const p=profile(id||activeId());return !!(p&&p.method2)}
  function workingKey(id){return WORKING_PREFIX+String(id||activeId()||'')}
  function getWorking(id){return read(workingKey(id),null)}
  function setWorking(id,state){id=String(id||activeId()||'');if(!id)throw new Error('No outlet selected');write(workingKey(id),{version:VERSION,outletId:id,updatedAt:now(),data:state});return getWorking(id)}
  function clearWorking(id){id=String(id||activeId()||'');if(id)localStorage.removeItem(workingKey(id))}

  function activate(id){
    id=String(id||'');
    const p=profile(id);
    if(!p)throw new Error('Permanent outlet profile not found: '+id);
    write(ACTIVE_OUTLET,{id:p.id,code:p.code||p.shortCode||'',name:p.name||'',activatedAt:now()});
    localStorage.setItem('selected-outlet-id',id);return p;
  }

  function summary(id){
    const p=profile(id||activeId());
    if(!p)return null;
    return {id:p.id,code:p.code||p.shortCode||'',name:p.name||'',hasMethod2:!!p.method2,method2SavedAt:p.method2SavedAt||null,updatedAt:p.updatedAt||null};
  }

  function queueGoogleOutletSave(outlet){
    if(!VAULT_URL||!outlet||!outlet.id)return;
    try{
      fetch(VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'outletSave',outlet:outlet}),keepalive:true}).catch(()=>{});
    }catch(e){}
  }

  function recoverFromGoogle(force){
    if(!VAULT_URL)return;
    const marker='bobs-outlet-recovery-version';
    const attempted=sessionStorage.getItem(marker);
    if(!force&&attempted===String(VERSION))return;
    sessionStorage.setItem(marker,String(VERSION));
    const cb='bobsOutletRecovery_'+Date.now();
    window[cb]=function(result){
      try{
        const count=result&&Array.isArray(result.outlets)?result.outlets.length:0;
        if(result&&result.ok&&count){
          const d=db();
          result.outlets.forEach(item=>{
            const o=item.data||{},id=String(item.outletId||o.id||'');
            if(!id)return;
            const existing=d[id]||{};
            d[id]={...existing,...o,id,shortCode:o.shortCode||o.code||item.outletCode||existing.shortCode||'',name:o.name||item.outletName||existing.name||'',createdAt:existing.createdAt||item.createdAt||now(),updatedAt:item.updatedAt||o.updatedAt||now()};
          });
          saveDb(d);
          window.dispatchEvent(new CustomEvent('bobs-outlet-master-recovered',{detail:{count:count}}));
        }else{
          window.dispatchEvent(new CustomEvent('bobs-outlet-recovery-empty',{detail:{result:result||null}}));
        }
      }catch(e){window.dispatchEvent(new CustomEvent('bobs-outlet-recovery-error',{detail:{error:String(e)}}));}
      try{delete window[cb]}catch(e){}
    };
    const s=document.createElement('script');
    s.src=VAULT_URL+'?action=outletList&callback='+encodeURIComponent(cb)+'&t='+Date.now();
    s.async=true;
    s.onerror=()=>{window.dispatchEvent(new CustomEvent('bobs-outlet-recovery-error',{detail:{error:'Google outlet recovery request failed'}}));try{delete window[cb]}catch(e){}};
    document.head.appendChild(s);
  }

  cleanCutover();

  window.BOBSDataManager={version:VERSION,outletMasterKey:OUTLET_MASTER,legacyOutletMasterKey:LEGACY_OUTLET_MASTER,ensureOutlet:ensureProfile,saveMethod2,getOutlet:profile,listOutlets:list,hasSaved,hasMethod2,getWorking,setWorking,clearWorking,activateOutlet:activate,summary,recoverFromGoogle};

  recoverFromGoogle(false);
})();