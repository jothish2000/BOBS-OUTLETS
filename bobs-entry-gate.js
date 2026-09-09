/* BOBS 111Q ENTRY GATE
 * Authoritative order: Google Sheets -> Data Vault -> genuinely blank.
 * LocalStorage is never consulted to decide whether permanent data exists.
 * Recovered data may be copied to localStorage only after authoritative recovery,
 * as temporary working state for the existing page UI.
 */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const SHEETS_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec';
const VAULT_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jv80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
const cfg={'outlets.html':{kind:'outlets',key:'outlets-master'}}[path];
if(!cfg)return;
const ONCE='bobs-outlet-authoritative-recovery-once';
const SUMMARY='bobs-outlet-recovery-summary';
function jsonp(url,params){return new Promise((resolve,reject)=>{const cb='bobsGate_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');let done=false;const q=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');function finish(fn,v){if(done)return;done=true;clearTimeout(t);try{delete window[cb]}catch(e){}s.remove();fn(v)}const t=setTimeout(()=>finish(reject,Error('timeout')),12000);window[cb]=d=>finish(resolve,d);s.onerror=()=>finish(reject,Error('request failed'));s.src=url+'?'+q+'&callback='+cb;document.head.appendChild(s);});}
function pick(o,n){for(const k of n){if(o&&o[k]!=null&&String(o[k]).trim()!=='')return o[k]}return ''}
function normalize(o,i){return Object.assign({},o,{id:String(pick(o,['id','outletId','outletID','outlet_id','Outlet ID','ID'])||i+1),name:String(pick(o,['name','outletName','outlet_name','Outlet Name','Name'])||''),shortCode:String(pick(o,['shortCode','outletCode','outlet_code','code','Outlet Code','Code'])||'').toUpperCase(),numShifts:+pick(o,['numShifts','numberOfShifts','number_of_shifts','shifts'])||2,shiftTimes:Array.isArray(o&&o.shiftTimes)?o.shiftTimes:[]});}
function rows(r){if(!r)return[];if(Array.isArray(r.outlets))return r.outlets;if(Array.isArray(r.records))return r.records;if(Array.isArray(r.data))return r.data;if(r.data&&Array.isArray(r.data.records))return r.data.records;return[]}
function clean(a){return (a||[]).filter(x=>String(x.status||'').toUpperCase()!=='DELETED').map(normalize);}
function saveRecovered(a,source){try{localStorage.setItem(cfg.key,JSON.stringify(a));sessionStorage.setItem(SUMMARY,JSON.stringify({source,outlets:a}));sessionStorage.setItem(ONCE,'1');}catch(e){}}
function decoratePopup(){try{const raw=sessionStorage.getItem(SUMMARY);if(!raw)return;const d=JSON.parse(raw);const box=document.getElementById('mextra');if(box&&d.outlets&&d.outlets.length){box.innerHTML='<div style="margin:12px 0;padding:11px 13px;background:var(--paper-dark,#f3f3f3);border-radius:9px;max-height:180px;overflow:auto"><b>Recovered permanent outlet records</b>'+d.outlets.map(o=>`<div style="padding:5px 0;font-size:12px"><strong>${o.id||''}</strong> — ${o.name||'Unnamed outlet'}${o.shortCode?' ('+o.shortCode+')':''}</div>`).join('')+'</div>';}}catch(e){}}
function showGateError(msg){document.body.style.visibility='visible';let d=document.createElement('div');d.style='position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:100000;padding:20px';d.innerHTML='<div style="max-width:520px;background:white;border-radius:14px;padding:22px;font:14px system-ui;line-height:1.5"><h2 style="margin-top:0">BOBS data recovery could not be completed</h2><p>'+msg+'</p><p><b>No permanent Google/Data Vault record was deleted.</b></p><button style="padding:10px 16px" onclick="this.parentElement.parentElement.remove();document.body.style.visibility=\'visible\'">Continue</button></div>';document.body.appendChild(d);}
async function authoritativeOutlets(){
 try{const r=await jsonp(SHEETS_URL,{action:'outletList'});const a=clean(rows(r));if(a.length)return{source:'GOOGLE_SHEETS',outlets:a};}catch(e){}
 try{const r=await jsonp(VAULT_URL,{action:'outletList'});const a=clean(rows(r));if(a.length)return{source:'DATA_VAULT',outlets:a};}catch(e){}
 return{source:'NONE',outlets:[]};
}
async function init(){
 if(sessionStorage.getItem(ONCE)==='1'){sessionStorage.removeItem(ONCE);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{decoratePopup();document.body.style.visibility='visible';});else{decoratePopup();document.body.style.visibility='visible';}return;}
 document.body.style.visibility='hidden';
 const r=await authoritativeOutlets();
 if(r.outlets.length){saveRecovered(r.outlets,r.source);location.reload();return;}
 sessionStorage.setItem(SUMMARY,JSON.stringify({source:'NONE',outlets:[]}));
 document.body.style.visibility='visible';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
