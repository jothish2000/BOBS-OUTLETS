/* BOBS Google-first entry gate — assessment/config separation */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||'';
const cfg={
 'outlets.html':{module:'OUTLET_MASTER',key:'outlets-master',label:'Outlet Setup',fresh:['outlet-analysis-data','outlet-selection','method1-hourly-state','method2-item-state']},
 'method1.html':{module:'METHOD1',key:'method1-hourly-state',label:'Method 1',fresh:['method1-hourly-state']},
 'method2.html':{module:'METHOD2',key:'method2-item-state',label:'Method 2',fresh:['method2-item-state']},
 'staff.html':{module:'STAFF',key:'staff-data',label:'Staff / HR',fresh:['staff-data']},
 'fixed-expenses.html':{module:'FIXED_EXPENSES',key:'fixed-expenses-data',label:'Fixed Expenses',fresh:['fixed-expenses-data']}
}[path];
if(!cfg)return;
function outletId(){try{const a=JSON.parse(localStorage.getItem('outlet-selection')||'{}');return String(a.outletId||a.id||a.outletID||'1')}catch(e){return '1'}}
function localHas(){try{const v=localStorage.getItem(cfg.key);return !!v&&v!=='{}'&&v!=='[]'&&v!=='null'}catch(e){return false}}
function jsonp(params){return new Promise((resolve,reject)=>{if(!URL)return reject(Error('Google Data source is not configured'));const cb='bobsGate_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');const q=Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');const t=setTimeout(()=>{cleanup();reject(Error('Google Data source did not respond'))},9000);function cleanup(){clearTimeout(t);try{delete window[cb]}catch(e){}s.remove()}window[cb]=d=>{cleanup();resolve(d)};s.src=URL+'?'+q+'&callback='+cb;s.onerror=()=>{cleanup();reject(Error('Google Data source could not be reached'))};document.head.appendChild(s)})}
function payload(r){if(!r)return null;let d=r.data;if(typeof d==='string'){try{d=JSON.parse(d)}catch(e){}}return d}
async function googleState(){try{const r=await jsonp({action:'moduleList',outletId:outletId(),module:cfg.module});if(!r)return null;const rows=Array.isArray(r.records)?r.records:(Array.isArray(r.data)?r.data:[]);const good=rows.filter(x=>String(x.status||'').toUpperCase()!=='DELETED');if(!good.length)return null;return good[good.length-1]}catch(e){return null}}
function show(data){
 const st=document.createElement('style');st.textContent='.bobs-entry-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px;z-index:999999}.bobs-entry-box{width:min(600px,100%);background:#fff;color:#222;border-radius:16px;padding:24px;box-shadow:0 20px 70px rgba(0,0,0,.3)}.bobs-entry-box h2{margin:0 0 8px}.bobs-entry-box p{line-height:1.5}.bobs-entry-actions{display:grid;gap:10px;margin-top:18px}.bobs-entry-actions button{min-height:50px;border:1px solid #ccc;border-radius:10px;padding:10px 14px;text-align:left;font-weight:700;cursor:pointer}.bobs-entry-continue{background:#2f7d32;color:white}.bobs-entry-modify{background:#f4f4f4}.bobs-entry-fresh{background:white}.bobs-entry-status{font-size:12px;color:#666;margin-top:12px}</style>';
 document.head.appendChild(st);const ov=document.createElement('div');ov.className='bobs-entry-overlay';const box=document.createElement('div');box.className='bobs-entry-box';box.innerHTML='<h2>Existing '+cfg.label+' Data Available</h2><p>BOBS found saved '+cfg.label+' data in Google Data Vault for Outlet '+outletId()+'.</p><p><b>Choose how to enter this module:</b></p><div class="bobs-entry-actions"><button class="bobs-entry-continue">A. Continue Using Existing Data</button><button class="bobs-entry-modify">B. Add / Modify Existing Data</button><button class="bobs-entry-fresh">C. Start Fresh Assessment</button></div><div class="bobs-entry-status"></div>';ov.appendChild(box);document.body.appendChild(ov);
 const d=payload(data);
 function load(){if(d!==null){try{localStorage.setItem(cfg.key,typeof d==='string'?d:JSON.stringify(d))}catch(e){}}ov.remove();window.dispatchEvent(new Event('bobs-data-restored'))}
 box.querySelector('.bobs-entry-continue').onclick=load;box.querySelector('.bobs-entry-modify').onclick=load;
 box.querySelector('.bobs-entry-fresh').onclick=()=>{if(!confirm('Start Fresh will clear only working assessment data. Permanent outlet configuration and Google records will not be deleted. Continue?'))return;cfg.fresh.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});ov.remove();window.dispatchEvent(new Event('bobs-start-fresh'))};
}
async function init(){
 let g=await googleState();
 if(g){show(g);return}
 if(localHas())show({data:JSON.parse(localStorage.getItem(cfg.key))});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
