/* BOBS Google-first entry gate — assessment/config separation */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||'';
const cfg={
 'outlets.html':{kind:'outlets',key:'outlets-master',label:'Outlet Setup'},
 'method1.html':{kind:'module',module:'METHOD1',key:'method1-hourly-state',label:'Method 1'},
 'method2.html':{kind:'module',module:'METHOD2',key:'method2-item-state',label:'Method 2'},
 'staff.html':{kind:'module',module:'STAFF',key:'staff-data',label:'Staff / HR'},
 'fixed-expenses.html':{kind:'module',module:'FIXED_EXPENSES',key:'fixed-expenses-data',label:'Fixed Expenses'}
}[path];
if(!cfg)return;
function outletId(){try{const a=JSON.parse(localStorage.getItem('outlet-selection')||'{}');return String(a.outletId||a.id||a.outletID||'1')}catch(e){return '1'}}
function localValue(){try{return JSON.parse(localStorage.getItem(cfg.key)||'null')}catch(e){return null}}
function localHas(){const v=localValue();return !!v&&!(Array.isArray(v)&&!v.length)&&!(typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length)}
function jsonp(params){return new Promise((resolve,reject)=>{if(!URL)return reject(Error('Google Data source is not configured'));const cb='bobsGate_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');const q=Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');const t=setTimeout(()=>{cleanup();reject(Error('Google Data source did not respond'))},9000);function cleanup(){clearTimeout(t);try{delete window[cb]}catch(e){}s.remove()}window[cb]=d=>{cleanup();resolve(d)};s.src=URL+'?'+q+'&callback='+cb;s.onerror=()=>{cleanup();reject(Error('Google Data source could not be reached'))};document.head.appendChild(s)})}
function parse(v){if(v==null)return null;if(typeof v==='string'){try{return JSON.parse(v)}catch(e){return v}}return v}
async function googleState(){try{
 if(cfg.kind==='outlets'){
   const r=await jsonp({action:'outletList'});if(!r)return null;
   const rows=Array.isArray(r.outlets)?r.outlets:(Array.isArray(r.records)?r.records:(Array.isArray(r.data)?r.data:[]));
   const good=rows.filter(x=>String(x.status||'').toUpperCase()!=='DELETED');
   return good.length?good:null;
 }
 const r=await jsonp({action:'moduleList',outletId:outletId(),module:cfg.module});if(!r)return null;
 const rows=Array.isArray(r.records)?r.records:(Array.isArray(r.data)?r.data:[]);
 const good=rows.filter(x=>String(x.status||'').toUpperCase()!=='DELETED');
 return good.length?good[good.length-1]:null;
}catch(e){return null}}
function extract(data){
 if(cfg.kind==='outlets')return data;
 if(!data)return null;
 return parse(data.data);
}
function show(data){
 const st=document.createElement('style');st.textContent='.bobs-entry-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px;z-index:999999}.bobs-entry-box{width:min(600px,100%);background:#fff;color:#222;border-radius:16px;padding:24px;box-shadow:0 20px 70px rgba(0,0,0,.3)}.bobs-entry-box h2{margin:0 0 8px}.bobs-entry-box p{line-height:1.5}.bobs-entry-actions{display:grid;gap:10px;margin-top:18px}.bobs-entry-actions button{min-height:50px;border:1px solid #ccc;border-radius:10px;padding:10px 14px;text-align:left;font-weight:700;cursor:pointer}.bobs-entry-continue{background:#2f7d32;color:white}.bobs-entry-modify{background:#f4f4f4}.bobs-entry-fresh{background:white}.bobs-entry-status{font-size:12px;color:#666;margin-top:12px}</style>';
 document.head.appendChild(st);const ov=document.createElement('div');ov.className='bobs-entry-overlay';const box=document.createElement('div');box.className='bobs-entry-box';
 const detail=cfg.kind==='outlets'?`BOBS found ${data.length} saved outlet${data.length===1?'':'s'} in the Google outlet master. This includes previously saved outlet sites such as Rasipuram / GP where present.`:`BOBS found saved ${cfg.label} assessment data in Google Data Vault for Outlet ${outletId()}.`;
 box.innerHTML='<h2>Existing '+cfg.label+' Data Available</h2><p>'+detail+'</p><p><b>Choose how to enter this module:</b></p><div class="bobs-entry-actions"><button class="bobs-entry-continue">A. Continue Using Existing Data</button><button class="bobs-entry-modify">B. Add / Modify Existing Data</button><button class="bobs-entry-fresh">C. Start Fresh Assessment</button></div><div class="bobs-entry-status">Google was checked first. Your permanent Google records are not being deleted by this popup.</div>';ov.appendChild(box);document.body.appendChild(ov);
 const d=extract(data);
 function load(){if(d!==null){try{localStorage.setItem(cfg.key,JSON.stringify(d))}catch(e){}}ov.remove();window.dispatchEvent(new Event('bobs-data-restored'))}
 box.querySelector('.bobs-entry-continue').onclick=load;box.querySelector('.bobs-entry-modify').onclick=load;
 box.querySelector('.bobs-entry-fresh').onclick=()=>{try{if(cfg.kind==='outlets'){localStorage.removeItem(cfg.key);localStorage.removeItem('outlet-selection')}else localStorage.removeItem(cfg.key)}catch(e){}ov.remove();window.dispatchEvent(new Event('bobs-start-fresh'))};
}
async function init(){
 const g=await googleState();
 if(g){show(g);return}
 if(localHas() && cfg.kind!=='outlets'){show(localValue());return}
 if(cfg.kind==='outlets'&&localHas()){show(localValue());}
 if(path==='method1.html'&&!localHas())window.dispatchEvent(new Event('bobs-first-method1'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
