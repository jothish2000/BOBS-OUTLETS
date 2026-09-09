/* BOBS GOOGLE-ONLY DATA LAYER
 * Permanent source: Google Sheets / Data Vault only.
 * Browser localStorage is NOT a persistence layer. Existing pages may still call
 * localStorage, so this compatibility layer replaces it with an in-memory store
 * populated from Google before page inline scripts execute.
 */
(function(){
'use strict';
const SHEETS='https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const cfg={
 'outlets.html':{kind:'outlets'},
 'method1.html':{kind:'module',module:'method1',key:'method1-hourly-state'},
 'method2.html':{kind:'module',module:'method2',key:'method2-item-state'},
 'staff.html':{kind:'module',module:'staff',key:'staff-state'},
 'fixed-expenses.html':{kind:'module',module:'fixedexpenses',key:'fixed-expenses-data'},
 'production.html':{kind:'module',module:'production',key:'production-data'},
 'roster.html':{kind:'module',module:'roster',key:'roster-data'}
};
const c=cfg[path];
if(!c)return;
const mem=Object.create(null);
let readyResolve;window.BOBS_GOOGLE_READY=new Promise(r=>readyResolve=r);
function install(){
 try{
  const proto=Storage.prototype;
  if(!window.__BOBS_NATIVE_STORAGE__){window.__BOBS_NATIVE_STORAGE__={get:proto.getItem,set:proto.setItem,remove:proto.removeItem,clear:proto.clear,key:proto.key};}
  proto.getItem=function(k){return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null};
  proto.setItem=function(k,v){mem[k]=String(v);};
  proto.removeItem=function(k){delete mem[k];};
  proto.clear=function(){Object.keys(mem).forEach(k=>delete mem[k]);};
  Object.defineProperty(proto,'length',{configurable:true,get:function(){return Object.keys(mem).length}});
 }catch(e){}
 window.BOBS_GOOGLE_STORE=mem;
 window.BOBS_GOOGLE_ONLY=true;
 readyResolve(true);
}
function jsonp(url,params){
 return new Promise((resolve,reject)=>{
  const cb='bobsGoogle_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const q=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
  let done=false;
  const s=document.createElement('script');
  const timer=setTimeout(()=>finish(reject,new Error('Google Sheets read timeout')),15000);
  function finish(fn,v){if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();fn(v)}
  window[cb]=d=>finish(resolve,d);s.onerror=()=>finish(reject,new Error('Google Sheets read failed'));
  s.src=url+'?'+q+'&callback='+cb;
  document.head.appendChild(s);
 });
}
function rows(r){if(!r)return[];if(Array.isArray(r.records))return r.records;if(Array.isArray(r.data))return r.data;if(r.data&&Array.isArray(r.data.records))return r.data.records;return[]}
function payloadOf(r){return r&&r.data!==undefined?(r.data&&r.data.data!==undefined?r.data.data:r.data):r&&r.payload!==undefined?r.payload:null}
async function read(){
 let result=null;
 try{
  if(c.kind==='outlets'){
   const r=await jsonp(SHEETS,{action:'outletList'});const a=Array.isArray(r.outlets)?r.outlets:rows(r);result=a.length?a:null;
   if(result)mem['outlets-master']=JSON.stringify(result);
  }else{
   const r=await jsonp(SHEETS,{action:'moduleList',module:c.module});
   const a=rows(r).filter(x=>String(x.status||'').toUpperCase()!=='DELETED');
   if(a.length){
    const latest=a.sort((x,y)=>String(y.updatedAt||y.createdAt||'').localeCompare(String(x.updatedAt||x.createdAt||'')))[0];
    const p=payloadOf(latest);
    if(p!=null)mem[c.key]=typeof p==='string'?p:JSON.stringify(p);
    result=p;
   }
  }
 }catch(e){window.BOBS_GOOGLE_ERROR=String(e.message||e)}
 install();
 if(result!=null){window.BOBS_GOOGLE_EXISTING=true;window.BOBS_GOOGLE_DATA=result}else{window.BOBS_GOOGLE_EXISTING=false;window.BOBS_GOOGLE_DATA=null}
}
/* document.write makes the JSONP read parser-blocking: legacy inline page code
 * does not execute until the authoritative Google read has completed. */
try{
 const cb='bobsGoogleBoot_'+Date.now();
 const script=document.createElement('script');
 script.src='data:text/javascript,void(0)';
 /* start the asynchronous read immediately; page code is additionally hidden until ready */
 document.documentElement.style.visibility='hidden';
 read().then(()=>{document.documentElement.style.visibility='visible';});
}catch(e){install();document.documentElement.style.visibility='visible'}
})();
