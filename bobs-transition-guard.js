/* BOBS 111Q GLOBAL TRANSITION GUARD
 * Purpose: changing a toggle/select/mode must never silently erase unrelated user-entered data.
 * This is a compatibility/protection layer, not a replacement for each module's own save logic.
 */
(function(){
'use strict';
if(window.__BOBS_TRANSITION_GUARD__)return;
window.__BOBS_TRANSITION_GUARD__=true;
const VERSION='2026-09-12-111Q-transition-guard-v1';
const SAFE_TYPES=new Set(['SELECT-ONE','SELECT-MULTIPLE','CHECKBOX','RADIO']);
const transientKeys=['bobs-transition-ledger'];
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
    if(el instanceof HTMLInputElement){
      if(el.type==='checkbox'||el.type==='radio')el.checked=!!v.checked;else el.value=v.value==null?'':String(v.value);
    }else if(el instanceof HTMLSelectElement){
      const vals=Array.isArray(v.value)?v.value:[v.value];Array.from(el.options).forEach(o=>o.selected=vals.includes(o.value));
    }else if(el instanceof HTMLTextAreaElement)el.value=v.value==null?'':String(v.value);
  }catch(e){}
}
function collect(){
  const m=new Map();
  document.querySelectorAll('input,select,textarea').forEach(el=>{const k=stableKey(el),v=valueOf(el);if(k&&v)m.set(k,{el,v})});
  return m;
}
function snapshotLocal(reason){
  try{
    if(window.BOBSProtection&&typeof window.BOBSProtection.snapshot==='function')window.BOBSProtection.snapshot(reason);
  }catch(e){}
  try{
    const raw={createdAt:new Date().toISOString(),reason,version:VERSION};
    const critical=['outlet-selection','method1-hourly-state','method2-item-state','staff-data','fixed-expenses-data','production-data','roster-data','outlet-analysis-data'];
    raw.data={};critical.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)raw.data[k]=v});
    sessionStorage.setItem('bobs-transition-ledger',JSON.stringify(raw));
  }catch(e){}
}
function restoreUnrelated(before,target){
  before.forEach((entry,k)=>{
    if(entry.el===target) return;
    const now=document.querySelectorAll('input,select,textarea');
    let found=null;
    for(const el of now){if(stableKey(el)===k){found=el;break}}
    if(found && valueChanged(found,entry.v)) setValue(found,entry.v);
  });
}
function valueChanged(el,v){
  const n=valueOf(el);if(!n||!v)return false;
  if(n.type==='checkbox'||n.type==='radio')return n.checked!==!!v.checked || n.value!==v.value;
  if(n.type==='select')return JSON.stringify(n.value)!==JSON.stringify(v.value);
  return n.value!==v.value;
}
function protectTransition(target){
  if(!target||!target.matches||!target.matches('select,input[type="checkbox"],input[type="radio"]'))return;
  const before=collect();
  const old=valueOf(target);
  snapshotLocal('Before toggle transition: '+(stableKey(target)||target.tagName));
  const restore=()=>{
    restoreUnrelated(before,target);
    /* If the application rebuilt the target's row, preserve the newly selected value only. */
    if(target.isConnected && old){/* target intentionally remains changed */}
  };
  setTimeout(restore,0);
  setTimeout(restore,50);
  setTimeout(restore,250);
  setTimeout(restore,800);
}
document.addEventListener('change',e=>protectTransition(e.target),true);
document.addEventListener('click',e=>{
  const t=e.target&&e.target.closest?e.target.closest('button,[role="button"]'):null;
  if(!t)return;
  const text=(t.textContent||'').trim().toLowerCase();
  if(/start fresh|reset|clear all|delete|remove all/.test(text))snapshotLocal('Before destructive-looking action: '+text.slice(0,80));
},true);
window.addEventListener('beforeunload',()=>snapshotLocal('Protected page exit checkpoint'));
window.BOBS_TRANSITION_GUARD={version:VERSION,protect:function(reason){snapshotLocal(reason||'Manual protection checkpoint')}};
})();
