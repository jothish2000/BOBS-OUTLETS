/* BOBS central configuration. Google Sheets and Data Vault are authoritative. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNd7WjIFepJuRhz02Sch8WDQP4wQPeH38jv80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  VERSION: '2026-09-09-jsonp-read-transport'
});

/* GitHub Pages cannot read Google Apps Script JSON with fetch because the
   Apps Script web-app response is cross-origin. Keep POST writes unchanged;
   transparently route only GET reads for our two Apps Script endpoints through
   JSONP, which is the browser-compatible Apps Script transport. */
(function(){
  const nativeFetch=window.fetch.bind(window);
  const targets=[window.BOBS_CONFIG.SHEETS_WEB_APP_URL,window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL];
  function isTarget(input,init){
    const method=String((init&&init.method)||'GET').toUpperCase();
    if(method!=='GET')return false;
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
  window.fetch=function(input,init){return isTarget(input,init)?jsonpRead(typeof input==='string'?input:input.url):nativeFetch(input,init)};
})();
