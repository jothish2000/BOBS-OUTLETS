/* BOBS Google-First Data Layer
 * Permanent business data lives in Google Sheets / Data Vault.
 * This helper provides JSONP reads and no-cors writes for GitHub Pages.
 * It deliberately does not use localStorage, sessionStorage, IndexedDB, or cache
 * for permanent business storage.
 */
(function(){
  'use strict';
  const cfg=window.BOBS_CONFIG||{};
  const VAULT_URL=cfg.DATA_VAULT_WEB_APP_URL||'';
  function jsonp(params){
    return new Promise(function(resolve,reject){
      if(!VAULT_URL)return reject(new Error('Data Vault URL is not configured'));
      const cb='bobsData_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const s=document.createElement('script');
      const q=Object.keys(params||{}).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(params[k]==null?'':params[k])}).join('&');
      let done=false;
      function finish(fn,v){if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();fn(v)}
      const timer=setTimeout(function(){finish(reject,new Error('Google Data Vault timeout'))},12000);
      window[cb]=function(v){finish(resolve,v)};
      s.onerror=function(){finish(reject,new Error('Google Data Vault request failed'))};
      s.src=VAULT_URL+'?'+q+'&callback='+cb+'&_bobs='+Date.now();
      document.head.appendChild(s);
    });
  }
  function latestVersion(){return Date.now()*1000+Math.floor(Math.random()*1000)}
  async function saveModule(outletId,module,recordKey,data){
    if(window.BOBS_TRANSITION_GUARD&&typeof window.BOBS_TRANSITION_GUARD.prepareSave==='function')window.BOBS_TRANSITION_GUARD.prepareSave();
    if(!outletId)throw new Error('outletId is required');
    const d=(data&&typeof data==='object')?data:{};
    const stateVersion=latestVersion();
    const payload=Object.assign({},d,{_bobsMeta:Object.assign({},d._bobsMeta||{}, {stateVersion:stateVersion,savedBy:'BOBS',savedAt:new Date().toISOString()})});
    const body={action:'moduleSave',outletId:String(outletId),module:String(module),recordKey:String(recordKey||'default'),data:payload,stateVersion:stateVersion,timestamp:new Date().toISOString()};
    await fetch(VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(body)});
    return {ok:true,saved:true,source:'GOOGLE_SHEETS',module:module,outletId:String(outletId),stateVersion:stateVersion};
  }
  async function getModule(outletId,module,recordKey){
    const r=await jsonp({action:'moduleGet',outletId:String(outletId),module:String(module),recordKey:String(recordKey||'default')});
    return r&&r.data!=null?r.data:(r&&r.record&&r.record.data!=null?r.record.data:null);
  }
  async function listModule(outletId,module){
    const r=await jsonp({action:'moduleList',outletId:String(outletId),module:String(module)});
    return (r&&Array.isArray(r.records)?r.records:[]).filter(function(x){return String(x.status||'ACTIVE').toUpperCase()!=='DELETED'});
  }
  async function listOutlets(){
    const r=await jsonp({action:'outletList'});
    const a=Array.isArray(r&&r.outlets)?r.outlets:Array.isArray(r&&r.records)?r.records:[];
    return a.filter(function(x){return String(x.status||'ACTIVE').toUpperCase()!=='DELETED'}).map(function(o,i){
      const d=o.data||o;
      return Object.assign({},o,d,{id:String(o.outletId||o.id||i+1),name:String(o.outletName||d.name||o.name||''),shortCode:String(o.outletCode||d.shortCode||d.code||o.shortCode||'').toUpperCase(),numShifts:Number(d.numShifts||o.numShifts||2),shiftTimes:Array.isArray(d.shiftTimes)?d.shiftTimes:[]});
    });
  }
  window.BOBS_DATA={jsonp:jsonp,saveModule:saveModule,getModule:getModule,listModule:listModule,listOutlets:listOutlets,VAULT_URL:VAULT_URL};
})();
