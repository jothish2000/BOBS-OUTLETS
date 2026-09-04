/* BOBS RECOVERY BOOT — restore the newest protected Google snapshot when module working data is missing. */
(function(){
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const keys={'method1.html':'method1-hourly-state','method2.html':'method2-item-state'};
const key=keys[path];if(!key)return;
const VAULT='https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
function call(action,params,timeout){return new Promise((resolve,reject)=>{const cb='bobsRecovery_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');let done=false;const clean=()=>{done=true;try{delete window[cb]}catch(e){}s.remove();clearTimeout(t)};const t=setTimeout(()=>{if(!done){clean();reject(new Error('Recovery request timed out'))}},timeout||12000);window[cb]=v=>{if(done)return;clean();v&&v.ok?resolve(v):reject(new Error((v&&v.error)||'Recovery request failed'))};s.onerror=()=>{if(!done){clean();reject(new Error('Unable to contact BOBS Data Vault'))}};s.src=VAULT+'?action='+encodeURIComponent(action)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now()+(params?'&'+new URLSearchParams(params):'');s.async=true;document.head.appendChild(s)})}
function localHas(){try{const v=localStorage.getItem(key);return !!v&&v!=='{}'&&v!=='[]'&&v!=='null'}catch(e){return false}}
function restoreData(data){if(!data||typeof data!=='object')return false;let restored=false;Object.keys(data).forEach(k=>{if(data[k]!==null&&data[k]!==undefined){try{localStorage.setItem(k,typeof data[k]==='string'?data[k]:JSON.stringify(data[k]));restored=restored||k===key}catch(e){}}});return restored}
async function boot(){if(localHas())return;try{const listed=await call('list',{});const snaps=(listed.snapshots||[]).filter(s=>String(s.status||'')==='PROTECTED').sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));for(const s of snaps.slice(0,60)){try{const full=await call('restore',{snapshotId:s.snapshotId});if(restoreData(full.data)){console.info('BOBS recovery restored '+key+' from protected snapshot '+s.snapshotId);return}}catch(e){}}}catch(e){console.warn('BOBS protected recovery unavailable:',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
