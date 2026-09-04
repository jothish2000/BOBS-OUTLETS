/* BOBS RECOVERY BOOT — Google Data Vault recovery for Method 1 / Method 2.
 * IMPORTANT: recovery runs before normal module data is accepted. If a protected
 * snapshot is found, restore it to temporary browser state and reload once so
 * the module itself reads the recovered dataset. Permanent Google records are
 * never deleted or overwritten by this script.
 */
(function(){
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const configs={
  'method1.html':{key:'method1-hourly-state',label:'Method 1'},
  'method2.html':{key:'method2-item-state',label:'Method 2'}
};
const cfg=configs[path];
if(!cfg)return;
const VAULT='https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
const FLAG='bobs-recovery-reload:'+cfg.key;
function localHas(){try{const v=localStorage.getItem(cfg.key);return !!v&&v!=='{}'&&v!=='[]'&&v!=='null'}catch(e){return false}}
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
function restoreData(data){
  if(!data||typeof data!=='object')return false;
  let restored=false;
  Object.keys(data).forEach(k=>{
    if(data[k]===null||data[k]===undefined)return;
    try{
      localStorage.setItem(k,typeof data[k]==='string'?data[k]:JSON.stringify(data[k]));
      if(k===cfg.key)restored=true;
    }catch(e){}
  });
  return restored;
}
function clearReloadFlag(){try{sessionStorage.removeItem(FLAG)}catch(e){}}
function setReloadFlag(){try{sessionStorage.setItem(FLAG,'1')}catch(e){}}
function wasReloaded(){try{return sessionStorage.getItem(FLAG)==='1'}catch(e){return false}}
function showStatus(msg){
  if(document.readyState==='loading')return;
  const p=document.createElement('div');p.textContent=msg;
  p.style='position:fixed;bottom:14px;right:14px;background:#fff7df;border:1px solid #e2a72b;padding:10px 13px;border-radius:9px;font:12px Arial;z-index:100002;box-shadow:0 5px 20px rgba(0,0,0,.15)';
  document.body.appendChild(p);setTimeout(()=>p.remove(),3500);
}
async function recover(){
  if(localHas()){clearReloadFlag();return false;}
  if(wasReloaded()){clearReloadFlag();return false;}
  try{
    const listed=await call('list',{});
    const snaps=(listed.snapshots||[])
      .filter(s=>String(s.status||'')==='PROTECTED')
      .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    for(const s of snaps.slice(0,80)){
      try{
        const full=await call('restore',{snapshotId:s.snapshotId});
        if(restoreData(full.data||{})){
          console.info('BOBS protected recovery restored '+cfg.key+' from '+s.snapshotId);
          setReloadFlag();
          location.reload();
          return true;
        }
      }catch(e){}
    }
  }catch(e){console.warn('BOBS protected recovery unavailable:',e)}
  clearReloadFlag();
  return false;
}
recover();
})();