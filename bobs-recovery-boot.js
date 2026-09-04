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
function isM1(v){return !!(v&&typeof v==='object'&&(Array.isArray(v.custVals)||Array.isArray(v.basketVals)))}
function isM2(v){return !!(v&&typeof v==='object'&&(v.qtys||v.prod||v.production))}
function restoreObject(data){
  if(!data||typeof data!=='object')return false;
  let restored=false;
  if(data[cfg.key]&&typeof data[cfg.key]==='object') restored=setRaw(cfg.key,data[cfg.key]);
  const seen=new Set(),walk=(v,depth)=>{
    if(restored||depth>8||v===null||v===undefined||typeof v!=='object')return;
    if(seen.has(v))return;seen.add(v);
    if((cfg.key==='method1-hourly-state'&&isM1(v))||(cfg.key==='method2-item-state'&&isM2(v))){restored=setRaw(cfg.key,v);return}
    if(Array.isArray(v)){for(const x of v)walk(x,depth+1)}else{for(const k of Object.keys(v))walk(v[k],depth+1)}
  };
  walk(data,0);
  return restored;
}
function restoreModulePayload(data){
  if(!data||typeof data!=='object')return false;
  if(cfg.key==='method1-hourly-state'&&isM1(data))return setRaw(cfg.key,data);
  if(cfg.key==='method1-hourly-state'&&data.data&&isM1(data.data))return setRaw(cfg.key,data.data);
  if(cfg.key==='method2-item-state'&&isM2(data))return setRaw(cfg.key,data);
  if(cfg.key==='method2-item-state'&&data.data&&isM2(data.data))return setRaw(cfg.key,data.data);
  return restoreObject(data);
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
      for(const s of snaps){if(s&&restoreObject(s.data||s))return true}
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
  let outletId='';
  try{const selected=JSON.parse(localStorage.getItem('outlet-selection')||'null');outletId=String(selected&&selected.id||'')}catch(e){}
  if(!outletId){try{const ol=await call('outletList',{});const first=(ol.outlets||[])[0];if(first)outletId=String(first.outletId||first.id||'')}catch(e){}}
  if(!outletId)return false;
  try{
    const r=await call('moduleList',{outletId,module:cfg.module});
    const records=Array.isArray(r.records)?r.records.slice().sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))):[];
    for(const rec of records){if(String(rec.status||'').toUpperCase()==='DELETED')continue;if(restoreModulePayload(rec.data||rec)){console.info('BOBS legacy Google module recovery restored '+cfg.key+' for outlet '+outletId);return true}}
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