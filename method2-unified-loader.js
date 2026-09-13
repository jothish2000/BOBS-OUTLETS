/* BOBS Method 2 unified layer loader. Prevents the legacy startup poll from rebuilding controls while the user edits. */
(function(){
'use strict';
if(window.__BOBS_M2_UNIFIED_LOADER)return;window.__BOBS_M2_UNIFIED_LOADER=1;
const realSetInterval=window.setInterval,realClearInterval=window.clearInterval,watched=[];
window.setInterval=function(fn,ms){const id=realSetInterval(fn,ms);if(ms===400)watched.push(id);return id};
const s=document.createElement('script');s.src='method2-unified-wastage.js?v=2026-09-13-2';s.defer=true;s.onload=()=>setTimeout(()=>{watched.splice(0).forEach(id=>realClearInterval(id));window.setInterval=realSetInterval;window.clearInterval=realClearInterval},700);document.head.appendChild(s);
})();
