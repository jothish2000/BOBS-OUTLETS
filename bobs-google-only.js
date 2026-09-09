/* BOBS GOOGLE-ONLY DATA LAYER
 * Google Sheets is the only persistent source. Browser localStorage is never read
 * or used as a persistence layer. Existing legacy page code is given an in-memory
 * Storage-compatible working surface populated from Google before inline page code runs.
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
const c=cfg[path]; if(!c)return;
const mem=Object.create(null);
window.BOBS_GOOGLE_ONLY=true;
function install(){
 try{
  const proto=Storage.prototype;
  if(!window.__BOBS_NATIVE_STORAGE__){window.__BOBS_NATIVE_STORAGE__={get:proto.getItem,set:proto.setItem,remove:proto.removeItem,clear:proto.clear};}
  proto.getItem=function(k){return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null};
  proto.setItem=function(k,v){mem[k]=String(v);};
  proto.removeItem=function(k){delete mem[k];};
  proto.clear=function(){Object.keys(mem).forEach(k=>delete mem[k]);};
  window.BOBS_GOOGLE_STORE=mem;
 }catch(e){}
}
function rows(r){if(!r)return[];if(Array.isArray(r.outlets))return r.outlets;if(Array.isArray(r.records))return r.records;if(Array.isArray(r.data))return r.data;if(r.data&&Array.isArray(r.data.records))return r.data.records;return[]}
function payloadOf(r){return r&&r.data!==undefined?(r.data&&r.data.data!==undefined?r.data.data:r.data):r&&r.payload!==undefined?r.payload:null}
function finish(result,error){
 if(error)window.BOBS_GOOGLE_ERROR=String(error.message||error);
 if(result!==null&&result!==undefined){window.BOBS_GOOGLE_EXISTING=true;window.BOBS_GOOGLE_DATA=result}else window.BOBS_GOOGLE_EXISTING=false;
 install();
}
/* Parser-blocking JSONP: the HTML parser waits for this script response before
 * executing the page's own inline scripts. Thus legacy code sees Google data,
 * never stale browser data. */
try{
 const cb='bobsGoogleBoot_'+Date.now();
 window[cb]=function(r){try{
  if(c.kind==='outlets'){
   const a=rows(r);if(a.length)mem['outlets-master']=JSON.stringify(a);finish(a.length?a:null);
  }else{
   const a=rows(r).filter(x=>String(x.status||'').toUpperCase()!=='DELETED');
   if(!a.length){finish(null);return;}
   a.sort((x,y)=>String(y.updatedAt||y.createdAt||'').localeCompare(String(x.updatedAt||x.createdAt||'')));
   const p=payloadOf(a[0]);if(p!==null&&p!==undefined)mem[c.key]=typeof p==='string'?p:JSON.stringify(p);
   finish(p);
  }
 }catch(e){finish(null,e)}};
 document.write('<script src="'+SHEETS+'?action='+encodeURIComponent(c.kind==='outlets'?'outletList':'moduleList')+(c.kind==='module'?'&module='+encodeURIComponent(c.module):'')+'&callback='+encodeURIComponent(cb)+'"><\\/script>');
}catch(e){finish(null,e)}
})();
