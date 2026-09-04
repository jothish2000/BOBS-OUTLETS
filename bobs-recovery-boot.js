/* BOBS RECOVERY BOOT — recover Method 1 / Method 2 before module initialization.
 * Recovery order: protected browser vault -> emergency recovery copy -> Google Data Vault.
 * This script never deletes or overwrites permanent Google records.
 */
(function(){
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const configs={
  'method1.html':{key:'method1-hourly-state',label:'Method 1'},
  'method2.html':{key:'method2-item-state',label:'Method 2'}
};
const cfg=configs[path]; if(!cfg)return;
const VAULT='https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
const FLAG='bobs-recovery-reload:'+cfg.key;
function valid(v){return !!v&&v!=='{}'&&v!=='[]'&&v!=='null'}
function localHas(){try{return valid(localStorage.getItem(cfg.key))}catch(e){return false}}
function setRaw(key,value){try{localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value));return true}catch(e){return false}}
function restoreObject(data){
  if(!data||typeof data!=='object')return false;
  let restored=false;
  Object.keys(data).forEach(k=>{
    if(data[k]===null||data[k]===undefined)return;
    if(setRaw(k,data[k])&&k===cfg.key)restored=true;
  });
  return restored;
}
function restoreLocalSnapshot(){
  try{
    /* Emergency copy created by the earlier deletion guard. */
    const emergency=localStorage.getItem('bobs-recovery-'+cfg.key);
    if(valid(emergency)){localStorage.setItem(cfg.key,emergency);return true}
  }catch(e){}
  try{
    /* Browser-side BOBS Data Vault snapshots. */
    const list=JSON.parse(localStorage.getItem('bobs-data-vault')||'[]');
    if(Array.isArray(list)){
      const snaps=list.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
      for(const s of snaps){if(s&&restoreObject(s.data||{}))return true}
    }
  }catch(e){}
  return false;
}
function call(action,params,timeout){return new Promise((resolve,reject)=>{
  const cb='bobsRecovery_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const s=document.createElement('script');let done=false;
  const clean=()=>{done=true;try{delete window[cb]}catch(e){}s.remove();clearTimeout(t)};
  const t=setTimeout(()=>{if(!done){clean();reject(new Error('Recovery request timed out'))}},timeout||12000);
  window[cb]=v=>{if(done)return;clean();if(v&&v.ok)resolve(v);else reject(new Error((v&&v.error)||'Recovery request failed'))};
  s.onerror=()=>{if(!done){clean();reject(new Error('Unable to contact BOBS Data Vault'))}};
  s.src=VAULT+'?action='+encodeURIComponent(action)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now()+(params?'&'+new URLSearchParams(params):'');
  s.async=true;document.head.appendChild(s);
})}
function setReloadFlag(){try{sessionStorage.setItem(FLAG,'1')}catch(e){}}
function wasReloaded(){try{return sessionStorage.getItem(FLAG)==='1'}catch(e){return false}}
function clearReloadFlag(){try{sessionStorage.removeItem(FLAG)}catch(e){}}
async function recover(){
  if(localHas()){clearReloadFlag();return}
  if(wasReloaded()){clearReloadFlag();return}
  /* First use anything that is still present in this browser. This is the safest
     recovery path and does not require the Google deployment to be current. */
  if(restoreLocalSnapshot()){
    console.info('BOBS local protected recovery restored '+cfg.key);
    setReloadFlag();location.reload();return;
  }
  /* Then use the Google Data Vault. */
  try{
    const listed=await call('list',{});
    const snaps=(listed.snapshots||[]).filter(s=>String(s.status||'')==='PROTECTED').sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    for(const s of snaps.slice(0,80)){
      try{
        const full=await call('restore',{snapshotId:s.snapshotId});
        if(restoreObject(full.data||{})){
          console.info('BOBS Google protected recovery restored '+cfg.key+' from '+s.snapshotId);
          setReloadFlag();location.reload();return;
        }
      }catch(e){}
    }
  }catch(e){console.warn('BOBS Google protected recovery unavailable:',e)}
  clearReloadFlag();
}
recover();
})();