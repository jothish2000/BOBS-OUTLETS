/* BOBS 111Q ENTRY GATE — authoritative Google recovery */
(function(){
'use strict';
const path=(location.pathname.split('/').pop()||'').toLowerCase();

/* Method 2 was the remaining legacy page whose working state lived only in
   localStorage. Keep its existing calculation/UI intact, but make Google/Data
   Vault authoritative on entry and automatically persist the working state to
   BOBS_MODULE_DATA under METHOD2 + outletId. */
if(path==='method2.html'){
  /* Additive 111Q layer: load condiment attachment UI without touching the
     existing 366-item Method 2 calculation engine. */
  try{const s=document.createElement('script');s.src='method2-condiments.js?v=2026-09-12-111Q-condiments';s.defer=true;document.head.appendChild(s)}catch(e){}
  const CFG={
    VERSION:'2026-09-12-111Q-method2-google-first',
    VAULT:'https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec'
  };
  const hydratedKey='bobs-method2-google-hydrated';
  const outletId=()=>{const q=new URLSearchParams(location.search);if(q.get('outlet'))return String(q.get('outlet'));try{const o=JSON.parse(localStorage.getItem('outlet-selection')||'{}');return String(o.id||'')}catch(e){return ''}};
  const jsonp=(params)=>new Promise((resolve,reject)=>{const cb='bobsM2Gate_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;const q=Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k]==null?'':params[k])).join('&');const finish=(ok,v)=>{if(done)return;done=true;clearTimeout(t);try{delete window[cb]}catch(e){}s.remove();ok?resolve(v):reject(v)};const t=setTimeout(()=>finish(false,new Error('Google Data Vault timeout')),12000);window[cb]=d=>finish(true,d);s.onerror=()=>finish(false,new Error('Google Data Vault request failed'));s.src=CFG.VAULT+'?'+q+'&callback='+cb+'&_bobs='+Date.now();document.head.appendChild(s)});
  const saveGoogle=(data,id)=>fetch(CFG.VAULT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'moduleSave',outletId:String(id),module:'METHOD2',recordKey:'default',data:data||{},source:'BOBS-OUTLETS',event:'METHOD2_AUTO_SAVE',timestamp:new Date().toISOString()})});
  document.documentElement.style.visibility='hidden';
  let autoTimer=null;
  function readLocal(){try{return JSON.parse(localStorage.getItem('method2-item-state')||'{"qtys":{},"prod":{}}')}catch(e){return{qtys:{},prod:{}}}}
  function attachAutoSave(){
    const id=outletId();
    if(!id)return;
    const queue=()=>{clearTimeout(autoTimer);autoTimer=setTimeout(()=>{const data=readLocal();saveGoogle(data,id).catch(()=>{});},1200)};
    document.addEventListener('input',queue,true);
    document.addEventListener('change',queue,true);
    document.addEventListener('bobs-method2-condiment-change',queue,true);
    window.addEventListener('beforeunload',()=>{try{const data=readLocal();navigator.sendBeacon(CFG.VAULT,new Blob([JSON.stringify({action:'moduleSave',outletId:String(id),module:'METHOD2',recordKey:'default',data,source:'BOBS-OUTLETS',event:'METHOD2_AUTO_SAVE',timestamp:new Date().toISOString()})],{type:'text/plain'}))}catch(e){}});
  }
  async function hydrate(){
    const id=outletId();
    if(!id){document.documentElement.style.visibility='visible';attachAutoSave();return;}
    if(sessionStorage.getItem(hydratedKey+'-'+id)==='1'){document.documentElement.style.visibility='visible';attachAutoSave();return;}
    try{
      const r=await jsonp({action:'moduleGet',outletId:id,module:'METHOD2',recordKey:'default'});
      const data=r&&r.data!=null?r.data:(r&&r.record&&r.record.data!=null?r.record.data:null);
      const working=data&&typeof data==='object'?data:{qtys:{},prod:{}};
      if(!working.qtys)working.qtys={};
      if(!working.prod)working.prod={};
      if(!working.condiments)working.condiments={};
      localStorage.setItem('method2-item-state',JSON.stringify(working));
      sessionStorage.setItem(hydratedKey+'-'+id,'1');
      location.reload();
    }catch(e){
      document.documentElement.style.visibility='visible';
      attachAutoSave();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hydrate);else hydrate();
  return;
}

if(path!=='outlets.html')return;
const SHEETS_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec';
const VAULT_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec';
const KEY='outlets-master',ONCE='bobs-outlet-authoritative-recovery-once',SUMMARY='bobs-outlet-recovery-summary';
const recovered=sessionStorage.getItem(ONCE)==='1';
if(!recovered){document.documentElement.style.visibility='hidden';}
function jsonp(url,params){return new Promise((resolve,reject)=>{const cb='bobsGate_'+Date.now()+'_'+Math.random().toString(36).slice(2);const s=document.createElement('script');let done=false;const q=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');function finish(fn,v){if(done)return;done=true;clearTimeout(t);try{delete window[cb]}catch(e){}s.remove();fn(v)}const t=setTimeout(()=>finish(reject,Error('timeout')),10000);window[cb]=d=>finish(resolve,d);s.onerror=()=>finish(reject,Error('request failed'));s.src=url+'?'+q+'&callback='+cb+'&_bobs='+Date.now();document.head.appendChild(s);});}
function rows(r){if(!r)return[];if(Array.isArray(r.outlets))return r.outlets;if(Array.isArray(r.records))return r.records;if(Array.isArray(r.data))return r.data;if(r.data&&Array.isArray(r.data.records))return r.data.records;return[]}
function pick(o,n){for(const k of n){if(o&&o[k]!=null&&String(o[k]).trim()!=='')return o[k]}return ''}
function normalize(o,i){return Object.assign({},o,{id:String(pick(o,['id','outletId','outletID','outlet_id','Outlet ID','ID'])||i+1),name:String(pick(o,['name','outletName','outlet_name','Outlet Name','Name'])||''),shortCode:String(pick(o,['shortCode','outletCode','outlet_code','code','Outlet Code','Code'])||'').toUpperCase(),numShifts:+pick(o,['numShifts','numberOfShifts','number_of_shifts','shifts'])||2,shiftTimes:Array.isArray(o&&o.shiftTimes)?o.shiftTimes:[]});}
function clean(a){return(a||[]).filter(x=>String(x.status||'').toUpperCase()!=='DELETED').map(normalize)}
function decorate(){try{const raw=sessionStorage.getItem(SUMMARY);if(!raw)return;const d=JSON.parse(raw);const box=document.getElementById('mextra');if(!box)return;if(d.outlets&&d.outlets.length){box.innerHTML='<div style="margin:12px 0;padding:11px 13px;background:var(--paper-dark,#f3f3f3);border-radius:9px;max-height:180px;overflow:auto"><b>'+((d.authoritative?'Recovered permanent outlet records — ':'Existing local working copy — ')+d.source)+'</b>'+d.outlets.map(o=>`<div style="padding:5px 0;font-size:12px"><strong>${o.id}</strong> — ${o.name||'Unnamed outlet'}${o.shortCode?' ('+o.shortCode+')':''}</div>`).join('')+'</div>';}else{box.innerHTML='<div style="margin:12px 0;padding:11px 13px;background:#fff7ed;border:1px solid #f59e0b;border-radius:9px"><b>Permanent outlet recovery did not return any records.</b><br><span style="font-size:12px">No data was deleted. If you expect saved RSP/GP records, the Google Apps Script deployment needs to be checked.</span></div>';}}catch(e){}}
async function recover(){try{const r=await jsonp(SHEETS_URL,{action:'outletList'});const a=clean(rows(r));if(a.length)return{source:'GOOGLE SHEETS',outlets:a,authoritative:true};}catch(e){}try{const r=await jsonp(VAULT_URL,{action:'outletList'});const a=clean(rows(r));if(a.length)return{source:'DATA VAULT',outlets:a,authoritative:true};}catch(e){}return{source:'NONE',outlets:[],authoritative:false};}
async function firstEntry(){const r=await recover();if(r.outlets.length){try{localStorage.setItem(KEY,JSON.stringify(r.outlets));sessionStorage.setItem(SUMMARY,JSON.stringify(r));sessionStorage.setItem(ONCE,'1');}catch(e){}location.reload();return;}try{const local=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(local)&&local.length){r.source='LOCAL WORKING COPY (AUTHORITATIVE RECOVERY UNAVAILABLE)';r.outlets=clean(local);sessionStorage.setItem(SUMMARY,JSON.stringify(r));}}catch(e){}document.documentElement.style.visibility='visible';}
function secondEntry(){sessionStorage.removeItem(ONCE);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{decorate();document.documentElement.style.visibility='visible';});else{decorate();document.documentElement.style.visibility='visible';}}
if(recovered)secondEntry();else firstEntry();
})();
