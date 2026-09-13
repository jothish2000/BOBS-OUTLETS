/* BOBS Method 2 — per-item Google save checkpoint.
   The visible button is created by method2-commercial-layout.js.
   This file only handles the click and sends the COMPLETE Method 2 state.
   Method 1 is untouched; existing data is preserved. */
(function(){
'use strict';
if(window.__BOBS_M2_ITEM_SAVE_V2)return;
window.__BOBS_M2_ITEM_SAVE_V2=true;
const KEY='method2-item-state';
const VAULT='https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThcY1j4A9Pf4A/exec';
function state(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');s.qtys=s.qtys||{};s.prod=s.prod||{};s.condiments=s.condiments||{};s.packaging=s.packaging||{};s.pricing=s.pricing||{};s.commercial=s.commercial||{};return s}catch(e){return{qtys:{},prod:{},condiments:{},packaging:{},pricing:{},commercial:{}}}}
function outletId(){try{const q=new URLSearchParams(location.search);const direct=q.get('outletId')||q.get('outlet');if(direct)return direct;const raw=localStorage.getItem('outlet-selection');if(!raw)return '';const s=JSON.parse(raw);if(typeof s==='string')return s;if(Array.isArray(s))return s.length===1?String(s[0]):String(s[0]||'');if(s&&typeof s==='object')return s.outletId||s.id||s.selectedOutletId||'';return ''}catch(e){return ''}}
async function saveItem(btn){const id=outletId();if(!id){btn.textContent='⚠ SELECT OUTLET';setTimeout(()=>btn.textContent='💾 SAVE THIS ITEM',1800);return}const old=btn.textContent;const s=state();const payload={action:'moduleSave',outletId:String(id),module:'METHOD2',recordKey:'default',data:s,state:s,stateVersion:s.stateVersion||2,source:'method2-item-save',event:'item-save',timestamp:new Date().toISOString(),savedItem:{category:btn.dataset.cat||'',itemIndex:Number(btn.dataset.i||0)}};btn.disabled=true;btn.textContent='Saving…';try{await fetch(VAULT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});btn.textContent='✓ SAVED TO GOOGLE';btn.style.background='#245c3d';setTimeout(()=>{btn.textContent=old;btn.style.background='#173f2b';btn.disabled=false},1800)}catch(e){btn.textContent='⚠ SAVE FAILED';btn.style.background='#8a3b2f';setTimeout(()=>{btn.textContent=old;btn.style.background='#173f2b';btn.disabled=false},2200)}}
document.addEventListener('click',e=>{const b=e.target?.closest?.('.m2-item-save-btn');if(b){e.preventDefault();e.stopPropagation();saveItem(b)}});
})();
