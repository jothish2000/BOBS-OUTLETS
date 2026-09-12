/* BOBS 111Q GLOBAL INPUT / TRANSITION GUARD v3
 * Universal rule:
 * 1) Any user-entered value is protected when another control changes the UI.
 * 2) The user's latest toggle/input remains the latest value.
 * 3) Before Save, the page is synchronised from the protected DOM state so the
 *    module's existing save handler receives the latest values.
 * 4) No permanent Google record is deleted or overwritten by the guard itself.
 */
(function(){
'use strict';
if(window.__BOBS_TRANSITION_GUARD__)return;
window.__BOBS_TRANSITION_GUARD__=true;
const VERSION='2026-09-12-111Q-transition-guard-v3';
const VAULT=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'';
let restoring=false,lastSnapshot=0,lastBefore=null,lastChangedKey=null,lastChangedValue=null;
function stableKey(el){
  if(!el||el.nodeType!==1)return null;
  const d=el.dataset||{};
  const parts=[el.tagName||'',el.id||'',el.name||'',d.cat||'',d.i||'',d.key||'',d.oid||'',d.si||'',el.type||''];
  const s=parts.join('|');
  return /^\|+$/.test(s)?null:s;
}
function valueOf(el){
  if(el instanceof HTMLInputElement){
    if(el.type==='checkbox'||el.type==='radio')return{type:el.type,checked:!!el.checked,value:el.value};
    return{type:el.type,value:el.value};
  }
  if(el instanceof HTMLSelectElement)return{type:'select',value:Array.from(el.selectedOptions).map(o=>o.value)};
  if(el instanceof HTMLTextAreaElement)return{type:'textarea',value:el.value};
  return null;
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
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
  const keys=['outlets-master','outlet-selection','method1-hourly-state','method2-item-state','staff-data','staff-state','fixed-expenses-data','production-data','roster-data','outlet-analysis-data'];
  const data={};keys.forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)data[k]=v}catch(e){}});return data;
}
function checkpoint(reason){
  const payload={snapshotId:'TRANS-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:new Date().toISOString(),reason:reason||'Protected transition checkpoint',version:VERSION,data:localData()};
  try{if(window.BOBSProtection&&typeof window.BOBSProtection.snapshot==='function')window.BOBSProtection.snapshot(reason)}catch(e){}
  try{sessionStorage.setItem('bobs-transition-ledger',JSON.stringify(payload))}catch(e){}
  /* Best-effort durable safety copy. The normal module save remains responsible for business data. */
  const now=Date.now();if(VAULT&&now-lastSnapshot>500){lastSnapshot=now;try{fetch(VAULT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'snapshot',snapshotId:payload.snapshotId,reason:payload.reason,data:payload.data,source:'BOBS-TRANSITION-GUARD',timestamp:payload.createdAt})}).catch(()=>{})}catch(e){}}
}
function find(key){let found=null;document.querySelectorAll('input,select,textarea').forEach(el=>{if(!found&&stableKey(el)===key)found=el});return found}
function emitSync(el){
  if(!el)return;
  try{el.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){}
  try{el.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}
}
function restoreAll(before,changedKey,changedValue){
  if(restoring)return;
  restoring=true;
  try{
    before.forEach((entry,key)=>{
      if(key===changedKey)return;
      const now=find(key);if(now&&!same(valueOf(now),entry.v)){setValue(now,entry.v);emitSync(now)}
    });
    /* If the application rebuilt the changed control, preserve the user's new choice too. */
    if(changedKey&&changedValue){const now=find(changedKey);if(now&&!same(valueOf(now),changedValue)){setValue(now,changedValue);emitSync(now)}}
  }finally{restoring=false}
}
function protectChange(target){
  if(restoring||!target||!target.matches)return;
  if(!target.matches('input,select,textarea'))return;
  const before=collect();
  lastBefore=before;
  lastChangedKey=stableKey(target);
  lastChangedValue=valueOf(target);
  checkpoint('Before user input transition: '+(lastChangedKey||target.tagName));
  const restore=()=>restoreAll(before,lastChangedKey,lastChangedValue);
  /* UI modules may rebuild synchronously, in a microtask, or after a timer. */
  setTimeout(restore,0);setTimeout(restore,40);setTimeout(restore,150);setTimeout(restore,500);setTimeout(restore,1000);
}
function prepareSave(){
  if(restoring)return;
  if(lastBefore){restoreAll(lastBefore,lastChangedKey,lastChangedValue)}
}
function isSaveAction(t){
  if(!t)return false;
  const id=((t.id||'')+' '+(t.className||'')).toLowerCase();
  const text=(t.textContent||t.value||'').trim().toLowerCase();
  return /save|submit|finish|continue/.test(id)||/save|submit|finish|continue/.test(text);
}
document.addEventListener('change',e=>protectChange(e.target),true);
document.addEventListener('input',e=>{
  if(restoring)return;
  const t=e.target;if(t&&t.matches&&t.matches('input,select,textarea')){
    /* Do not rebuild the page on every keystroke; record the newest DOM state. */
    lastChangedKey=stableKey(t);lastChangedValue=valueOf(t);
  }
},true);
document.addEventListener('click',e=>{
  const t=e.target&&e.target.closest?e.target.closest('button,input[type="submit"],[role="button"]'):null;
  if(!t)return;
  const text=(t.textContent||'').trim().toLowerCase();
  if(/start fresh|reset|clear all|delete|remove all/.test(text))checkpoint('Before destructive-looking action: '+text.slice(0,80));
  if(isSaveAction(t))prepareSave();
},true);
window.addEventListener('beforeunload',()=>checkpoint('Protected page exit checkpoint'));
window.BOBS_TRANSITION_GUARD={
  version:VERSION,
  protect:function(reason){checkpoint(reason||'Manual protection checkpoint')},
  prepareSave:prepareSave,
  getVersion:function(){return VERSION}
};
})();
