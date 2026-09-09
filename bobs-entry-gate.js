/* BOBS Google-first entry gate — Outlet Setup recovery without replacing the page popup */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const DEFAULT_URL='https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec';
const URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||DEFAULT_URL;
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
function jsonp(params){return new Promise((resolve,reject)=>{if(!URL)return reject(Error('Google URL missing'));const cb='bobsGate_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');let done=false;function finish(fn,v){if(done)return;done=true;clearTimeout(t);try{delete window[cb]}catch(e){}s.remove();fn(v)}const q=Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');const t=setTimeout(()=>finish(reject,Error('Google response timeout')),10000);window[cb]=d=>finish(resolve,d);s.onerror=()=>finish(reject,Error('Google request failed'));s.src=URL+'?'+q+'&callback='+cb;document.head.appendChild(s)})}
function rowsFrom(r){if(!r)return[];if(Array.isArray(r.outlets))return r.outlets;if(Array.isArray(r.records))return r.records;if(Array.isArray(r.data))return r.data;if(r.data&&Array.isArray(r.data.records))return r.data.records;return[]}
function pick(o,names){for(const n of names){if(o&&o[n]!=null&&String(o[n]).trim()!=='')return o[n]}return ''}
function normalizeOutlet(o,i){
 const id=pick(o,['id','outletId','outletID','outlet_id','Outlet ID','ID'])||String(i+1);
 const name=pick(o,['name','outletName','outlet_name','Outlet Name','Name']);
 const code=pick(o,['shortCode','outletCode','outlet_code','code','Outlet Code','Code']);
 const shifts=pick(o,['numShifts','numberOfShifts','number_of_shifts','shifts']);
 const shiftTimes=o&&Array.isArray(o.shiftTimes)?o.shiftTimes:[];
 return Object.assign({},o,{id:String(id),name:String(name||''),shortCode:String(code||'').toUpperCase(),numShifts:+shifts||2,shiftTimes});
}
function googleState(){
 const request=cfg.kind==='outlets'?jsonp({action:'outletList'}):jsonp({action:'moduleList',outletId:outletId(),module:cfg.module});
 return request.then(r=>{const rows=rowsFrom(r).filter(x=>String(x.status||'').toUpperCase()!=='DELETED');if(!rows.length)return null;return cfg.kind==='outlets'?rows.map(normalizeOutlet):rows[rows.length-1]});
}
function extract(data){if(cfg.kind==='outlets')return data;if(!data)return null;const v=data.data;try{return typeof v==='string'?JSON.parse(v):v}catch(e){return v}}
function showModuleGate(data){
 const d=extract(data);if(d===null)return;
 try{localStorage.setItem(cfg.key,JSON.stringify(d))}catch(e){}
 window.dispatchEvent(new Event('bobs-data-restored'));
}
function showOutletPopupAfterGoogle(data){
 const d=extract(data);if(!Array.isArray(d)||!d.length)return false;
 try{localStorage.setItem('outlets-master',JSON.stringify(d))}catch(e){}
 /* Do not replace the Outlet Setup page's original saved-setup popup.
    Its own popup is the UI the user already knows and contains the outlet summary. */
 if(typeof window.showModal==='function'){
   const saved=d;
   const summary=saved.map((o,i)=>{const name=o.name||('Outlet '+(i+1));const code=o.shortCode?` (${o.shortCode})`:'';return `<div><strong>${o.id||i+1}</strong> — ${name}${code}</div>`}).join('');
   window.showModal('Existing BOBS setup found',`BOBS found ${saved.length} saved outlet${saved.length===1?'':'s'} in Google. The saved outlet details have been restored without overwriting them.`,`<button class="keep" id="continue">Use Existing Setup</button><button class="add" id="add">Add Another Outlet (next: Outlet ${Math.max(...saved.map(x=>+x.id).filter(Number.isFinite),saved.length)+1})</button><button class="new" id="new">Start New</button>`,`<div class="warning"><b>Saved outlets recovered from Google:</b><br>${summary}</div>`);
   const c=document.getElementById('continue'),a=document.getElementById('add'),n=document.getElementById('new');
   if(c)c.onclick=()=>{window.outlets=saved;window.outlets.forEach(o=>{if(typeof window.shifts==='function')window.shifts(o)});const count=document.getElementById('count');if(count)count.value=saved.length;if(typeof window.render==='function')window.render();if(typeof window.closeModal==='function')window.closeModal()};
   if(a&&typeof window.addMore==='function')a.onclick=window.addMore;
   if(n&&typeof window.confirmNew==='function')n.onclick=window.confirmNew;
   return true;
 }
 return false;
}
async function init(){
 try{
  const g=await googleState();
  if(g){if(cfg.kind==='outlets'){showOutletPopupAfterGoogle(g);return}showModuleGate(g);return}
  if(cfg.kind!=='outlets'&&localHas()){showModuleGate(localValue());return}
  /* Outlet Setup owns its popup. Do not replace it with a diagnostic popup. */
 }catch(e){
  /* Never erase or overwrite local/permanent data on a read failure. */
  if(cfg.kind!=='outlets'&&localHas())showModuleGate(localValue());
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
