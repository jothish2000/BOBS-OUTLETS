/* BOBS Google-first entry gate — recover data, then let Outlet Setup show its original popup */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const DEFAULT_URL='https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec';
const URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||DEFAULT_URL;
const cfg={
 'outlets.html':{kind:'outlets',key:'outlets-master'},
 'method1.html':{kind:'module',module:'METHOD1',key:'method1-hourly-state'},
 'method2.html':{kind:'module',module:'METHOD2',key:'method2-item-state'},
 'staff.html':{kind:'module',module:'STAFF',key:'staff-data'},
 'fixed-expenses.html':{kind:'module',module:'FIXED_EXPENSES',key:'fixed-expenses-data'}
}[path];
if(!cfg)return;
const OUTLET_RECOVERED='bobs-outlet-google-recovered-once';
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
async function init(){
 try{
  if(cfg.kind==='outlets' && sessionStorage.getItem(OUTLET_RECOVERED)==='1'){
   sessionStorage.removeItem(OUTLET_RECOVERED);
   return;
  }
  const g=await googleState();
  if(g){
   const d=extract(g);
   if(d!==null){try{localStorage.setItem(cfg.key,JSON.stringify(d))}catch(e){}}
   if(cfg.kind==='outlets'){
    /* Reload once so the existing Outlet Setup page initializes its own original popup.
       No permanent Google record is written, changed, or deleted here. */
    try{sessionStorage.setItem(OUTLET_RECOVERED,'1')}catch(e){}
    location.reload();
    return;
   }
   window.dispatchEvent(new Event('bobs-data-restored'));
   return;
  }
  if(cfg.kind!=='outlets'&&localHas()){
   const d=localValue();try{localStorage.setItem(cfg.key,JSON.stringify(d))}catch(e){}
   window.dispatchEvent(new Event('bobs-data-restored'));
  }
 }catch(e){
  /* Read failure is non-destructive. Never clear local data or write to Google. */
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
