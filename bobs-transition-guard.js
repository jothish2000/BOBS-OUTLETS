/* BOBS 111Q GLOBAL TRANSITION GUARD
 * Purpose: changing a toggle/select/mode must never silently erase unrelated user-entered data.
 * This is a compatibility/protection layer, not a replacement for each module's own save logic.
 */
(function(){
'use strict';
if(window.__BOBS_TRANSITION_GUARD__)return;
window.__BOBS_TRANSITION_GUARD__=true;
const VERSION='2026-09-12-111Q-transition-guard-v2';
const VAULT=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec';
let lastGoogleSnapshot=0;
function stableKey(el){
  if(!el||el.nodeType!==1)return null;
  const parts=[el.tagName||'',el.id||'',el.name||'',el.dataset&&el.dataset.cat||'',el.dataset&&el.dataset.i||'',el.dataset&&el.dataset.key||'',el.type||''];
  const s=parts.join('|');
  return s==='||||||' ? null : s;
}
function valueOf(el){
  if(el instanceof HTMLInputElement){
    if(el.type==='checkbox'||el.type==='radio')return {type:el.type,checked:!!el.checked,value:el.value};
    return {type:el.type,value:el.value};
  }
  if(el instanceof HTMLSelectElement)return {type:'select',value:Array.from(el.selectedOptions).map(o=>o.value)};
  if(el instanceof HTMLTextAreaElement)return {type:'textarea',value:el.value};
  return null;
}
function setValue(el,v){
  if(!el||!v)return;
  try{
    if(el instanceof HTMLInputElement){if(el.type==='checkbox'||el.type==='radio')el.checked=!!v.checked;else el.value=v.value==null?'':String(v.value)}
    else if(el instanceof HTMLSelectElement){const vals=Array.isArray(v.value)?v.value:[v.value];Array.from(el.options).forEach(o=>o.selected=vals.includes(o.value))}
    else if(el instanceof HTMLTextAreaElement)el.value=v.value==null?'':String(v.value);
  }catch(e){}
}
function collect(){
  const m=new Map();
  document.querySelectorAll('input,select,textarea').forEach(el=>{const k=stableKey(el),v=valueOf(el);if(k&&v)m.set(k,{el,v})});
  return m;
}
function localData(){
  const critical=['outlets-master','outlet-selection','method1-hourly-state','method2-item-state','staff-data','staff-state','fixed-expenses-data','production-data','roster-data','outlet-analysis-data'];
  const data={};critical.forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)data[k]=v}catch(e){}});return data;
}
function snapshotLocal(reason){
  try{if(window.BOBSProtection&&typeof window.BOBSProtection.snapshot==='function')window.BOBSProtection.snapshot(reason)}catch(e){}
  const payload={snapshotId:'TRANS-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:new Date().toISOString(),reason:reason||'Protected transition checkpoint',version:VERSION,data:localData()};
  try{sessionStorage.setItem('bobs-transition-ledger',JSON.stringify(payload))}catch(e){}
  /* A durable pre-change copy goes to Google Vault. Throttle only duplicate page-exit snapshots. */
  const now=Date.now();if(now-lastGoogleSnapshot<500)return;lastGoogleSnapshot=now;
  try{fetch(VAULT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'snapshot',snapshotId:payload.snapshotId,reason:payload.reason,data:payload.data,source:'BOBS-TRANSITION-GUARD',timestamp:payload.createdAt})}).catch(()=>{})}catch(e){}
}
function valueChanged(el,v){
  const n=valueOf(el);if(!n||!v)return false;
  if(n.type==='checkbox'||n.type==='radio')return n.checked!==!!v.checked||n.value!==v.value;
  if(n.type==='select')return JSON.stringify(n.value)!==JSON.stringify(v.value);
  return n.value!==v.value;
}
function restoreUnrelated(before,target){
  before.forEach((entry,k)=>{
    if(entry.el===target)return;
    let found=null;document.querySelectorAll('input,select,textarea').forEach(el=>{if(!found&&stableKey(el)===k)found=el});
    if(found&&valueChanged(found,entry.v))setValue(found,entry.v);
  });
}
function protectTransition(target){
  if(!target||!target.matches||!target.matches('select,input[type="checkbox"],input[type="radio"]'))return;
  const before=collect();snapshotLocal('Before toggle transition: '+(stableKey(target)||target.tagName));
  const restore=()=>restoreUnrelated(before,target);
  setTimeout(restore,0);setTimeout(restore,50);setTimeout(restore,250);setTimeout(restore,800);
}
document.addEventListener('change',e=>protectTransition(e.target),true);
document.addEventListener('click',e=>{
  const t=e.target&&e.target.closest?e.target.closest('button,[role="button"]'):null;if(!t)return;
  const text=(t.textContent||'').trim().toLowerCase();
  if(/start fresh|reset|clear all|delete|remove all/.test(text))snapshotLocal('Before destructive-looking action: '+text.slice(0,80));
},true);
window.addEventListener('beforeunload',()=>snapshotLocal('Protected page exit checkpoint'));
window.BOBS_TRANSITION_GUARD={version:VERSION,protect:function(reason){snapshotLocal(reason||'Manual protection checkpoint')}};
})();
