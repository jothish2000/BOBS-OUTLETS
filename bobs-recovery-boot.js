/* BOBS RECOVERY BOOT — Method 1 uses the direct Google module store as its authoritative source.
 * It does not restore generic protected snapshots into Method 1 because those snapshots can
 * contain older/research/test states and must never masquerade as the current METHOD1 record.
 */
(function(){
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const configs={'method1.html':{key:'method1-hourly-state',label:'Method 1',module:'METHOD1'},'method2.html':{key:'method2-item-state',label:'Method 2',module:'METHOD2'}};
const cfg=configs[path];if(!cfg)return;
/* Method 1 has one authoritative normal load path: method1.html -> Google MODULE_DATA -> decision layer. */
if(cfg.key==='method1-hourly-state'){window.BOBS_RECOVERY_PROMISE=Promise.resolve(false);return;}
const CFG=window.BOBS_CONFIG||{};
const VAULT=String(CFG.DATA_VAULT_WEB_APP_URL||'');
const LEGACY=String(CFG.SHEETS_WEB_APP_URL||'');
const FLAG='bobs-recovery-reload:'+cfg.key;
function valid(v){return v!==null&&v!==undefined&&v!==''&&v!=='{}'&&v!=='[]'&&v!=='null'}
function localHas(){try{const v=JSON.parse(localStorage.getItem(cfg.key)||'null');return valid(v)}catch(e){return false}}
function selectedOutletId(){try{const x=JSON.parse(localStorage.getItem('outlet-selection')||'null');return String(x&&x.id||'')}catch(e){return ''}}
function setRaw(key,value){try{localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value));return true}catch(e){return false}}
function isM2(v){return !!(v&&typeof v==='object'&&(v.qtys||v.prod||v.production))}
function snapshotMatchesOutlet(data){const target=selectedOutletId();if(!target||!data||typeof data!=='object')return true;let sid='';try{const x=data['outlet-selection'];sid=String(x&&x.id||'')}catch(e){}return !sid||sid===target}
function restoreObject(data){if(!data||typeof data!=='object'||!snapshotMatchesOutlet(data))return false;let restored=false;const seen=new Set(),walk=(v,d)=>{if(restored||d>8||v===null||v===undefined||typeof v!=='object'||seen.has(v))return;seen.add(v);if(isM2(v)){restored=setRaw(cfg.key,v);return}if(Array.isArray(v))v.forEach(x=>walk(x,d+1));else Object.keys(v).forEach(k=>walk(v[k],d+1))};walk(data,0);return restored}
function restoreModulePayload(data){if(!data||typeof data!=='object')return false;if(isM2(data))return setRaw(cfg.key,data);if(data.data&&typeof data.data==='object')return restoreModulePayload(data.data);return restoreObject(data)}
function restoreLocalSnapshot(){try{const e=localStorage.getItem('bobs-recovery-'+cfg.key);if(valid(e)&&restoreModulePayload(JSON.parse(e)))return true}catch(e){}try{const list=JSON.parse(localStorage.getItem('bobs-data-vault')||'[]');if(Array.isArray(list))for(const s of list.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))))if(s&&restoreObject(s.data||s))return true}catch(e){}return false}
function call(url,action,params,timeout){return new Promise((resolve,reject)=>{if(!url)return reject(new Error('No endpoint'));const cb='bobsRecovery_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;const clean=()=>{done=true;try{delete window[cb]}catch(e){}s.remove();clearTimeout(t)},t=setTimeout(()=>{if(!done){clean();reject(new Error('Recovery request timed out'))}},timeout||12000);window[cb]=v=>{if(done)return;clean();if(v&&v.ok)resolve(v);else reject(new Error((v&&v.error)||'Recovery request failed'))};s.onerror=()=>{if(!done){clean();reject(new Error('Unable to contact Google recovery service'))}};s.src=url+'?action='+encodeURIComponent(action)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now()+(params?'&'+new URLSearchParams(params):'');s.async=true;document.head.appendChild(s)})}
function setReloadFlag(){try{sessionStorage.setItem(FLAG,'1')}catch(e){}}function wasReloaded(){try{return sessionStorage.getItem(FLAG)==='1'}catch(e){return false}}function clearReloadFlag(){try{sessionStorage.removeItem(FLAG)}catch(e){}}
async function recoverLegacyModule(){const outletId=selectedOutletId();if(!outletId)return false;try{const r=await call(LEGACY,'moduleList',{outletId,module:cfg.module});const records=Array.isArray(r.records)?r.records.slice().sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))):[];for(const rec of records){if(String(rec.status||'').toUpperCase()==='DELETED')continue;if(restoreModulePayload(rec.data||rec)){console.info('BOBS Google module recovery restored '+cfg.key+' for outlet '+outletId);return true}}}catch(e){console.warn('BOBS module recovery endpoint unavailable:',e)}return false}
async function recover(){if(localHas()){clearReloadFlag();return}if(wasReloaded()){clearReloadFlag();return}if(restoreLocalSnapshot()){setReloadFlag();location.reload();return}if(await recoverLegacyModule()){setReloadFlag();location.reload();return}clearReloadFlag()}
window.BOBS_RECOVERY_PROMISE=recover();
})();