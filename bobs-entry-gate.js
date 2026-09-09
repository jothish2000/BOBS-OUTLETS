/* BOBS 111Q ENTRY GATE — Outlet Setup authoritative recovery
 * Order: Google Sheets -> Data Vault -> genuinely blank.
 * LocalStorage is NEVER consulted to decide whether permanent data exists.
 * Recovered records may be copied to localStorage only after authoritative recovery.
 */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
if(path!=='outlets.html')return;
const SHEETS_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec';
const VAULT_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jv80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
const KEY='outlets-master',ONCE='bobs-outlet-authoritative-recovery-once',SUMMARY='bobs-outlet-recovery-summary';
const recovered=sessionStorage.getItem(ONCE)==='1';
/* On the first entry, prevent the page's legacy initializer from treating stale localStorage as authoritative. */
if(!recovered){try{const p=Storage.prototype.getItem;window.__bobsOriginalGetItem=p;Storage.prototype.getItem=function(k){if(k===KEY)return null;return p.call(this,k)};}catch(e){}document.documentElement.style.visibility='hidden';}
function jsonp(url,params){return new Promise((resolve,reject)=>{const cb='bobsGate_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');let done=false;const q=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');function finish(fn,v){if(done)return;done=true;clearTimeout(t);try{delete window[cb]}catch(e){}s.remove();fn(v)}const t=setTimeout(()=>finish(reject,Error('timeout')),12000);window[cb]=d=>finish(resolve,d);s.onerror=()=>finish(reject,Error('request failed'));s.src=url+'?'+q+'&callback='+cb;document.head.appendChild(s);});}
function rows(r){if(!r)return[];if(Array.isArray(r.outlets))return r.outlets;if(Array.isArray(r.records))return r.records;if(Array.isArray(r.data))return r.data;if(r.data&&Array.isArray(r.data.records))return r.data.records;return[]}
function pick(o,n){for(const k of n){if(o&&o[k]!=null&&String(o[k]).trim()!=='')return o[k]}return ''}
function normalize(o,i){return Object.assign({},o,{id:String(pick(o,['id','outletId','outletID','outlet_id','Outlet ID','ID'])||i+1),name:String(pick(o,['name','outletName','outlet_name','Outlet Name','Name'])||''),shortCode:String(pick(o,['shortCode','outletCode','outlet_code','code','Outlet Code','Code'])||'').toUpperCase(),numShifts:+pick(o,['numShifts','numberOfShifts','number_of_shifts','shifts'])||2,shiftTimes:Array.isArray(o&&o.shiftTimes)?o.shiftTimes:[]});}
function clean(a){return(a||[]).filter(x=>String(x.status||'').toUpperCase()!=='DELETED').map(normalize)}
function decorate(){try{const raw=sessionStorage.getItem(SUMMARY);if(!raw)return;const d=JSON.parse(raw);const box=document.getElementById('mextra');if(box&&d.outlets&&d.outlets.length){box.innerHTML='<div style="margin:12px 0;padding:11px 13px;background:var(--paper-dark,#f3f3f3);border-radius:9px;max-height:180px;overflow:auto"><b>Recovered permanent outlet records — '+d.source+'</b>'+d.outlets.map(o=>`<div style="padding:5px 0;font-size:12px"><strong>${o.id}</strong> — ${o.name||'Unnamed outlet'}${o.shortCode?' ('+o.shortCode+')':''}</div>`).join('')+'</div>';}}catch(e){}}
async function recover(){
 try{const r=await jsonp(SHEETS_URL,{action:'outletList'});const a=clean(rows(r));if(a.length)return{source:'GOOGLE SHEETS',outlets:a};}catch(e){}
 try{const r=await jsonp(VAULT_URL,{action:'outletList'});const a=clean(rows(r));if(a.length)return{source:'DATA VAULT',outlets:a};}catch(e){}
 return{source:'NONE',outlets:[]};
}
async function firstEntry(){const r=await recover();if(r.outlets.length){try{localStorage.setItem(KEY,JSON.stringify(r.outlets));sessionStorage.setItem(SUMMARY,JSON.stringify(r));sessionStorage.setItem(ONCE,'1');}catch(e){}location.reload();return;}sessionStorage.setItem(SUMMARY,JSON.stringify(r));document.documentElement.style.visibility='visible';}
function secondEntry(){sessionStorage.removeItem(ONCE);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{decorate();document.documentElement.style.visibility='visible';});else{decorate();document.documentElement.style.visibility='visible';}}
if(recovered)secondEntry();else firstEntry();
})();
