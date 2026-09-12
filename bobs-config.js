/* BOBS central configuration. Google Sheets and Data Vault are authoritative. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec',
  VERSION: '2026-09-12-111Q-transition-guard-v3'
});

(function(){
  const nativeFetch=window.fetch.bind(window);
  const targets=[window.BOBS_CONFIG.SHEETS_WEB_APP_URL,window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL];
  function isTarget(input){const url=typeof input==='string'?input:(input&&input.url)||'';return targets.some(t=>url.indexOf(t)===0)}
  function jsonpRead(url){return new Promise((resolve,reject)=>{const cb='bobsConfig_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;const finish=(ok,value)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();ok?resolve(value):reject(value)};const timer=setTimeout(()=>finish(false,new Error('Apps Script JSONP timeout')),7000);window[cb]=data=>finish(true,new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}}));s.onerror=()=>finish(false,new Error('Apps Script JSONP request failed'));s.src=url+(url.indexOf('?')>=0?'&':'?')+'callback='+encodeURIComponent(cb)+'&_bobs='+Date.now();document.head.appendChild(s)})}
  async function postToVault(payload){await nativeFetch(window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});return new Response(JSON.stringify({ok:true,saved:true,source:'GOOGLE_SHEETS',module:payload.module,outletId:payload.outletId,recordKey:payload.recordKey}),{status:200,headers:{'Content-Type':'application/json'}})}
  async function saveBatch(input,init){
    if(window.BOBS_TRANSITION_GUARD&&typeof window.BOBS_TRANSITION_GUARD.prepareSave==='function')window.BOBS_TRANSITION_GUARD.prepareSave();
    let body={};try{body=JSON.parse((init&&init.body)||'{}')}catch(e){throw new Error('Invalid Google save payload')}
    if(body.action==='outletSave'||body.action==='outletUpdate'){const list=Array.isArray(body.outlets)?body.outlets:[];if(!list.length)return new Response(JSON.stringify({ok:false,error:'No outlets supplied'}),{status:400});const results=[];for(const outlet of list){const payload={action:body.action,outletId:String(outlet.id||outlet.outletId||''),outletCode:String(outlet.shortCode||outlet.code||''),outletName:String(outlet.name||outlet.outletName||''),data:Object.assign({},outlet),source:'BOBS-OUTLETS',event:'OUTLET_SETUP_SAVED',timestamp:new Date().toISOString()};if(!payload.outletId)throw new Error('Outlet ID is required');await nativeFetch(window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});results.push({outletId:payload.outletId,sent:true})}return new Response(JSON.stringify({ok:true,saved:true,source:'GOOGLE_SHEETS',count:results.length,results}),{status:200})}
    const legacy=String(body.method||'').toLowerCase();const map={method1:'METHOD1',method2:'METHOD2',fixedexpenses:'FIXED_EXPENSES',staffroster:'STAFF_MASTER',hroutletallocation:'HR_OUTLET_ALLOCATION'};const module=map[legacy];if(module){const company=(module==='STAFF_MASTER'||module==='HR_OUTLET_ALLOCATION');const outletId=company?'COMPANY':String(body.outletId||body.outletID||'');if(!outletId)throw new Error('Outlet ID is required for '+module);const recordKey=company?'COMPANY':String(body.recordKey||outletId);return postToVault({action:'moduleSave',outletId,module,recordKey,data:body,source:'BOBS-OUTLETS',event:'LEGACY_MODULE_SYNC',timestamp:body.timestamp||new Date().toISOString()})}
    if(body.action==='moduleSave'&&String(body.module||'').toUpperCase()==='RECIPE_MASTER')return postToVault({action:'moduleSave',outletId:'COMPANY',module:'RECIPE_MASTER',recordKey:String(body.recordKey||'STANDARD_V1'),data:body.data||{},source:'BOBS-OUTLETS',event:'RECIPE_MASTER_SAVED',timestamp:new Date().toISOString()});
    return nativeFetch(input,init)}
  window.fetch=function(input,init){const method=String((init&&init.method)||'GET').toUpperCase();if(method==='GET'&&isTarget(input))return jsonpRead(typeof input==='string'?input:input.url);if(method==='POST'&&isTarget(input))return saveBatch(input,init);return nativeFetch(input,init)};
})();

document.addEventListener('click',function(e){const btn=e.target&&e.target.closest?e.target.closest('#nextOutletBtn'):null;if(btn){e.preventDefault();e.stopImmediatePropagation();const q=new URLSearchParams(window.location.search);const outletIds=q.get('outlets')||'';const target='cogs-outlet-analysis.html'+(outletIds?'?outlets='+encodeURIComponent(outletIds):'');window.location.href=target;return}const saveBtn=e.target&&e.target.closest?e.target.closest('#saveContinueBtn'):null;if(saveBtn){const frame=document.getElementById('methodFrame');try{if(frame&&frame.contentWindow&&typeof frame.contentWindow.BOBS_SAVE_METHOD1==='function')frame.contentWindow.BOBS_SAVE_METHOD1()}catch(err){}}},true);
document.addEventListener('DOMContentLoaded',function(){const btn=document.getElementById('nextOutletBtn');if(btn){btn.textContent='Continue to COGS Outlet Analysis →';btn.setAttribute('aria-label','Continue to COGS Outlet Analysis')}const analysis=document.querySelector('#finishPanel a[href="outlet-analysis.html"]');if(analysis)analysis.style.display='none';
  const guard=document.createElement('script');guard.src='bobs-transition-guard.js?v=2026-09-12-111Q-transition-guard-v3';document.head.appendChild(guard);
  if((location.pathname.split('/').pop()||'').toLowerCase()==='outlets.html'){
    const s=document.createElement('script');s.src='outlet-shift-presets.js?v=2026-09-12-111Q-hour-based-shifts-2';document.head.appendChild(s);
  }
  if((location.pathname.split('/').pop()||'').toLowerCase()==='method2.html'){
    const s=document.createElement('script');s.src='method2-condiments-fix.js?v=2026-09-12-111Q-condiment-fix-2';document.head.appendChild(s);
  }
  if((location.pathname.split('/').pop()||'').toLowerCase()==='outlet-method-flow.html'){
    const s=document.createElement('script');s.src='flow-shift-selector.js?v=2026-09-12-111Q-shift-selector';document.head.appendChild(s);
  }
});
