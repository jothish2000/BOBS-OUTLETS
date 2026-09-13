/* BOBS Method 2 — per-production-item save checkpoint.
   Adds one Save This Item button to each production item's definitive commercial panel.
   Uses the same Google moduleSave endpoint and full Method 2 state; existing data is preserved.
   Method 1 is untouched.
*/
(function(){
'use strict';
if(window.__BOBS_M2_ITEM_SAVE)return;
window.__BOBS_M2_ITEM_SAVE=true;
const KEY='method2-item-state';
const VAULT='https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec';
const esc=v=>CSS.escape(String(v));
function state(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');s.qtys=s.qtys||{};s.prod=s.prod||{};s.condiments=s.condiments||{};s.packaging=s.packaging||{};s.pricing=s.pricing||{};s.commercial=s.commercial||{};return s}catch(e){return{qtys:{},prod:{},condiments:{},packaging:{},pricing:{},commercial:{}}}}
function outletId(){try{const q=new URLSearchParams(location.search).get('outletId');if(q)return q;const s=JSON.parse(localStorage.getItem('outlet-selection')||'null');if(Array.isArray(s))return s[0]||'';if(s&&typeof s==='object')return s.outletId||s.id||s.selectedOutletId||'';return s||''}catch(e){return ''}}
function key(c,i){return String(c)+'::'+String(i)}
function addButtons(){document.querySelectorAll('.m2-def-commercial').forEach(box=>{const panel=box.closest('.batchPanel');if(!panel)return;const sel=panel.querySelector('.modeSelect');if(!sel||sel.value!=='production')return;if(box.querySelector('.m2-item-save-wrap'))return;const cat=sel.dataset.cat,i=Number(sel.dataset.i);const wrap=document.createElement('div');wrap.className='m2-item-save-wrap';wrap.style.cssText='display:flex;justify-content:flex-end;margin-top:9px;padding-top:8px;border-top:1px dashed #c9c3b4;';wrap.innerHTML='<button type="button" class="m2-item-save-btn" data-cat="'+esc(cat)+'" data-i="'+i+'" style="padding:7px 16px;border:0;border-radius:7px;font-weight:800;cursor:pointer;background:#173f2b;color:#fff;">💾 SAVE THIS ITEM</button>';box.appendChild(wrap)})}
async function saveItem(btn){const cat=btn.dataset.cat,i=Number(btn.dataset.i),id=outletId();if(!id){btn.textContent='⚠ SELECT OUTLET';setTimeout(()=>btn.textContent='💾 SAVE THIS ITEM',1800);return}const s=state(),payload={action:'moduleSave',outletId:id,module:'METHOD2',recordKey:'default',state:s,stateVersion:s.stateVersion||2,source:'method2-item-save',event:'item-save',timestamp:new Date().toISOString(),savedItem:{category:cat,itemIndex:i,itemKey:key(cat,i)}};const old=btn.textContent;btn.disabled=true;btn.textContent='Saving…';try{const r=await fetch(VAULT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});if(!r.ok)throw new Error('HTTP '+r.status);btn.textContent='✓ SAVED TO GOOGLE';btn.style.background='#245c3d';setTimeout(()=>{btn.textContent=old;btn.style.background='#173f2b';btn.disabled=false},1800)}catch(e){btn.textContent='⚠ SAVE FAILED';btn.style.background='#8a3b2f';setTimeout(()=>{btn.textContent=old;btn.style.background='#173f2b';btn.disabled=false},2200)}}
function boot(){addButtons();document.addEventListener('bobs-method2-production-ready',()=>setTimeout(addButtons,120));document.addEventListener('change',e=>{if(e.target?.matches?.('.modeSelect,.formatSelect'))setTimeout(addButtons,120)});document.addEventListener('click',e=>{const b=e.target?.closest?.('.m2-item-save-btn');if(b){e.preventDefault();saveItem(b)}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
