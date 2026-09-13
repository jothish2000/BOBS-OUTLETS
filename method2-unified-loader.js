/* BOBS Method 2 unified layer loader. Loads the stable v2 layer and compact inline COGS summary. */
(function(){
'use strict';
if(window.__BOBS_M2_UNIFIED_LOADER)return;window.__BOBS_M2_UNIFIED_LOADER=1;
const a=document.createElement('script');a.src='method2-unified-wastage-v2.js?v=2026-09-13-3';a.defer=true;document.head.appendChild(a);
const b=document.createElement('script');b.src='method2-inline-cogs.js?v=2026-09-13-1';b.defer=true;document.head.appendChild(b);
})();
