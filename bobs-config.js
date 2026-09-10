/* BOBS central configuration. Google Sheets and Data Vault are authoritative. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec',
  VERSION: '2026-09-10-data-vault-save-fix'
});

/* GitHub Pages cannot read Google Apps Script JSON with fetch because the
   Apps Script web-app response is cross-origin. Keep browser reads on JSONP.
   For the Outlet Setup save operation, route the existing batch payload to
   the new Data Vault deployment and save each outlet individually because
   the Apps Script API expects outletId + data for outletSave/outletUpdate. */
(function(){
  const nativeFetch=window.fetch.bind(window);
  const targets=[window.BOBS_CONFIG.SHEETS_WEB_APP_URL,window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL];
  function isTarget(input){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    return targets.some(t=>url.indexOf(t)===0);
  }
  function jsonpRead(url){
    return new Promise((resolve,reject)=>{
      const cb='bobsConfig_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const s=document.createElement('script');
      let done=false;
      const finish=(ok,value)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();ok?resolve(value):reject(value)};
      const timer=setTimeout(()=>finish(false,new Error('Apps Script JSONP timeout')),7000);
      window[cb]=data=>finish(true,new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}}));
      s.onerror=()=>finish(false,new Error('Apps Script JSONP request failed'));
      const join=url.indexOf('?')>=0?'&':'?';
      s.src=url+join+'callback='+encodeURIComponent(cb)+'&_bobs='+Date.now();
      document.head.appendChild(s);
    });
  }
  async function saveBatch(input,init){
    let body={};
    try{body=JSON.parse((init&&init.body)||'{}')}catch(e){throw new Error('Invalid outlet save payload')}
    if(body.action!=='outletSave'&&body.action!=='outletUpdate')return nativeFetch(input,init);
    const list=Array.isArray(body.outlets)?body.outlets:[];
    if(!list.length)return new Response(JSON.stringify({ok:false,error:'No outlets supplied'}),{status:400,headers:{'Content-Type':'application/json'}});
    const results=[];
    for(const outlet of list){
      const data=Object.assign({},outlet);
      const payload={action:body.action==='outletUpdate'?'outletUpdate':'outletSave',outletId:String(outlet.id||outlet.outletId||''),outletCode:String(outlet.shortCode||outlet.code||''),outletName:String(outlet.name||outlet.outletName||''),data:data,source:body.source||'BOBS-OUTLETS',event:body.event||'OUTLET_SETUP_SAVED',timestamp:body.timestamp||new Date().toISOString()};
      if(!payload.outletId)throw new Error('Outlet ID is required');
      await nativeFetch(window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
      results.push({outletId:payload.outletId,sent:true});
    }
    return new Response(JSON.stringify({ok:true,saved:true,source:'GOOGLE_SHEETS',count:results.length,results:results}),{status:200,headers:{'Content-Type':'application/json'}});
  }
  window.fetch=function(input,init){
    const method=String((init&&init.method)||'GET').toUpperCase();
    if(method==='GET'&&isTarget(input))return jsonpRead(typeof input==='string'?input:input.url);
    if(method==='POST'&&isTarget(input))return saveBatch(input,init);
    return nativeFetch(input,init);
  };
})();
