/* BOBS RECOVERY BOOT — recover Method 1 / Method 2 before module initialization.
 * Recovery order: protected browser vault -> emergency recovery copy -> Google Data Vault snapshots -> legacy Google module records.
 * This script never deletes or overwrites permanent Google records.
 */
(function(){
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const configs={
  'method1.html':{key:'method1-hourly-state',label:'Method 1',module:'METHOD1'},
  'method2.html':{key:'method2-item-state',label:'Method 2',module:'METHOD2'}
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
function restoreModulePayload(data){
  if(!data||typeof data!=='object')return false;
  /* Legacy BOBS_MODULE_DATA stores the actual module payload in data. */
  if(cfg.key==='method1-hourly-state'){
    if(Array.isArray(data.custVals)||Array.isArray(data.basketVals))return setRaw(cfg.key,data);
    if(data.data&&typeof data.data==='object'&&(Array.isArray(data.data.custVals)||Array.isArray(data.data.basketVals)))return setRaw(cfg.key,data.data);
  }
  if(cfg.key==='method2-item-state'){
    if(data.qtys||data.prod||data.production)return setRaw(cfg.key,data);
    if(data.data&&typeof data.data==='object'&&(data.data.qtys||data.data.prod||data.data.production))return setRaw(cfg.key,data.data);
  }
  return false;
}
function restoreLocalSnapshot(){
  try{
    const emergency=localStorage.getItem('bobs-recovery-'+cfg.key);
    if(valid(emergency)){localStorage.setItem(cfg.key,emergency);return true}
  }catch(e){}
  try{
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
async function recoverLegacyModule(){
  /* The original BOBS Google-first backend stored Method 1 / Method 2 in
     BOBS_MODULE_DATA and exposed moduleList through the same Web App URL. */
  let outletId='';
  try{const selected=JSON.parse(localStorage.getItem('outlet-selection')||'null');outletId=String(selected&&selected.id||'')}catch(e){}
  if(!outletId){
    try{const ol=await call('outletList',{});const first=(ol.outlets||[])[0];if(first)outletId=String(first.outletId||'')}catch(e){}
  }
  if(!outletId)return false;
  try{
    const r=await call('moduleList',{outletId,module:cfg.module});
    const records=Array.isArray(r.records)?r.records.slice().sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))):[];
    for(const rec of records){if(String(rec.status||'').toUpperCase()==='DELETED')continue;if(restoreModulePayload(rec.data||{})){console.info('BOBS legacy Google module recovery restored '+cfg.key+' for outlet '+outletId);return true}}
  }catch(e){console.warn('BOBS legacy module recovery unavailable:',e)}
  return false;
}
async function recover(){
  if(localHas()){clearReloadFlag();return}
  if(wasReloaded()){clearReloadFlag();return}
  if(restoreLocalSnapshot()){
    console.info('BOBS local protected recovery restored '+cfg.key);
    setReloadFlag();location.reload();return;
  }
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
  if(await recoverLegacyModule()){
    setReloadFlag();location.reload();return;
  }
  clearReloadFlag();
}
recover();
})();