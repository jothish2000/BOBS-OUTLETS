/* BOBS PHASE 1 FLOW CONTROLLER
 * Enforces the approved one-outlet-at-a-time sequence:
 * Outlet Setup -> Shifts -> M1 -> M2 decision -> M2 -> Staff -> HR -> Expenses -> Analysis -> Break-even.
 */
(function(){
  const path=(location.pathname.split('/').pop()||'').toLowerCase();
  const METHOD_KEYS=new Set(['method1-hourly-state','method2-item-state']);
  if(!window.__BOBS_METHOD_CACHE_GUARD){
    window.__BOBS_METHOD_CACHE_GUARD=true;
    const nativeRemove=Storage.prototype.removeItem;
    Storage.prototype.removeItem=function(key){
      try{if(METHOD_KEYS.has(String(key))){const value=this.getItem(key);if(value&&value!=='{}'&&value!=='null')this.setItem('bobs-recovery-'+key,value);return;}}catch(e){}
      return nativeRemove.call(this,key);
    };
  }
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
  function outletId(){return new URLSearchParams(location.search).get('outlet')||localStorage.getItem('selected-outlet-id')||(JSON.parse(localStorage.getItem('outlet-selection')||'null')||{}).id||'1';}
  function go(page){location.href=page+'?outlet='+encodeURIComponent(outletId());}
  function activeMethod(){const title=(document.getElementById('methodTitle')?.textContent||'').toLowerCase();if(title.indexOf('method 2')!==-1)return'method2';if(title.indexOf('method 1')!==-1)return'method1';const frame=document.getElementById('methodFrame');const src=frame?.getAttribute('src')||'';return src.indexOf('method2.html')!==-1?'method2':'method1';}
  function jsonp(url,params){return new Promise((resolve,reject)=>{if(!url)return reject(new Error('no endpoint'));const cb='bobsRecover_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;const finish=(err,data)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();err?reject(err):resolve(data)};const timer=setTimeout(()=>finish(new Error('timeout')),12000);window[cb]=d=>finish(null,d);s.onerror=()=>finish(new Error('unavailable'));s.src=url+'?'+new URLSearchParams({...params,callback:cb,t:Date.now()});s.async=true;document.head.appendChild(s);});}
  function findState(data,method){
    const key=method==='method1'?'method1-hourly-state':'method2-item-state';
    const seen=new Set();
    function walk(v){
      if(!v||typeof v!=='object'||seen.has(v))return null;seen.add(v);
      if(method==='method1'&&Array.isArray(v.custVals)&&Array.isArray(v.basketVals)&&v.custVals.length===17&&v.basketVals.length===17)return{type:'state',value:v};
      if(method==='method2'&&v.qtys&&typeof v.qtys==='object')return{type:'state',value:v};
      if(method==='method2'&&Array.isArray(v.rows)&&v.rows.length)return{type:'rows',value:v.rows};
      if(v[key]){const x=walk(v[key]);if(x)return x;}
      if(v.data){const x=walk(v.data);if(x)return x;}
      if(Array.isArray(v))for(const x of v){const y=walk(x);if(y)return y;}
      else for(const k of Object.keys(v)){const y=walk(v[k]);if(y)return y;}
      return null;
    }
    return walk(data);
  }
  function applyState(frame,method,found,oid){
    const doc=frame.contentDocument;if(!doc||!found)return false;
    let state=found.value;
    if(found.type==='rows'){
      if(method==='method1')state={custVals:state.map(r=>Number(r.customers)||0),basketVals:state.map(r=>Number(r.basket)||0),outletId:String(oid),source:'GOOGLE_SHEETS'};
      else state={rows:state,outletId:String(oid),source:'GOOGLE_SHEETS'};
    }
    try{frame.contentWindow.localStorage.setItem(method==='method1'?'method1-hourly-state':'method2-item-state',JSON.stringify(state));}catch(e){}
    if(method==='method1'){
      const rows=found.type==='rows'?found.value:(state.rows||[]);
      if(rows.length){rows.forEach((r,i)=>{const c=doc.querySelector(`.custInput[data-i="${i}"]`),b=doc.querySelector(`.basketInput[data-i="${i}"]`);if(c)c.value=Number(r.customers)||0;if(b)b.value=Number(r.basket)||0;});}
      else{state.custVals.forEach((v,i)=>{const c=doc.querySelector(`.custInput[data-i="${i}"]`);if(c)c.value=v});state.basketVals.forEach((v,i)=>{const b=doc.querySelector(`.basketInput[data-i="${i}"]`);if(b)b.value=v});}
      doc.querySelectorAll('.custInput,.basketInput').forEach(el=>el.dispatchEvent(new Event('input',{bubbles:true})));
    }else{
      const rows=found.type==='rows'?found.value:(state.rows||[]);
      rows.forEach(r=>{const cat=String(r.category||'');const i=Number(r.i);const el=doc.querySelector(`.qtyInput[data-cat="${CSS.escape(cat)}"][data-i="${i}"]`);if(el){el.value=Number(r.qty)||0;el.dispatchEvent(new Event('input',{bubbles:true}));}const m=doc.querySelector(`.modeSelect[data-cat="${CSS.escape(cat)}"][data-i="${i}"]`);if(m&&r.mode){m.value=r.mode;m.dispatchEvent(new Event('change',{bubbles:true}));}});
      if(typeof doc.defaultView.recalc==='function')doc.defaultView.recalc();
    }
    return true;
  }
  async function googleFind(method,oid){
    const endpoints=[(window.BOBS_CONFIG&&window.BOBS_CONFIG.SHEETS_WEB_APP_URL)||'',(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||''];
    const module=method==='method1'?'METHOD1':'METHOD2';
    for(const url of endpoints){
      if(!url)continue;
      try{
        const r=await jsonp(url,'moduleList'===undefined?{}:{action:'moduleList',outletId:String(oid),module});
        const records=Array.isArray(r.records)?r.records.slice().sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))):[];
        for(const rec of records){if(String(rec.status||'').toUpperCase()==='DELETED')continue;const found=findState(rec.data||rec,method);if(found)return found;}
      }catch(e){}
    }
    const vault=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'';
    if(vault){try{const listed=await jsonp(vault,{action:'list'});const snaps=(listed.snapshots||[]).slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));for(const s of snaps.slice(0,60)){try{const full=await jsonp(vault,{action:'restore',snapshotId:s.snapshotId});const found=findState(full.data||full,method);if(found)return found;}catch(e){}}}catch(e){}}
    return null;
  }
  function injectDecision(frame){try{const doc=frame.contentDocument;if(!doc||doc.getElementById('bobs-method-decision-loader'))return;const s=doc.createElement('script');s.id='bobs-method-decision-loader';s.src='bobs-data-decision.js?v=20260908-googlefirst1';doc.head.appendChild(s);}catch(e){}}
  async function recoverMethodFrame(frame,method,oid){if(!frame||!oid)return;try{const found=await googleFind(method,oid);if(!found)return;frame.contentWindow.BOBS_GOOGLE_LOAD_PROMISE=Promise.resolve({found:true});if(applyState(frame,method,found,oid)&&method==='method2')injectDecision(frame);}catch(e){console.warn('BOBS method Google load:',e);}}

  ready(function(){
    if(path==='outlet-method-flow.html'){
      const observer=new MutationObserver(function(){
        const saveBtn=document.getElementById('saveContinueBtn');
        if(saveBtn&&!saveBtn.dataset.phase1Method){
          const original=saveBtn.onclick;
          if(typeof original==='function'){
            saveBtn.dataset.phase1Method='1';
            saveBtn.onclick=async function(){
              const method=activeMethod();await original.call(saveBtn);const status=document.getElementById('saveNote');const text=(status?.textContent||'').toLowerCase();if(/failed|error|❌/.test(text))return;
              const ask=document.getElementById('askOtherPanel'),finish=document.getElementById('finishPanel'),methodPanel=document.getElementById('methodPanel'),choice=document.getElementById('choicePanel'),askTitle=document.getElementById('askTitle'),askText=document.getElementById('askText'),yes=document.getElementById('yesOtherBtn'),no=document.getElementById('noOtherBtn');if(!ask||!yes||!no)return;
              if(method==='method1'){methodPanel?.classList.add('hidden');choice?.classList.add('hidden');finish?.classList.add('hidden');ask.classList.remove('hidden');askTitle.textContent='Method 1 saved ✓';let d={};try{d=JSON.parse(localStorage.getItem('outlet-analysis-data')||'{}')||{}}catch(e){}const oid=outletId();const existing=!!(d?.[oid]?.method2Selected||d?.[oid]?.method2);askText.textContent=existing?'Method 2 data already exists for this outlet. Do you want to use the existing Method 2 data?':'Method 2 has not been completed for this outlet. Do you want to analyse Method 2 now?';yes.textContent=existing?'YES — Use Existing Method 2 Data':'YES — Analyse Method 2';no.textContent='NO — Continue to Staff Master';yes.onclick=function(){ask.classList.add('hidden');if(typeof window.loadMethod==='function')window.loadMethod('method2');else document.getElementById('choicePanel')?.classList.remove('hidden');};no.onclick=function(){go('staff.html');};
              }else{methodPanel?.classList.add('hidden');choice?.classList.add('hidden');ask?.classList.add('hidden');finish?.classList.add('hidden');go('staff.html');}
            };
          }
        }
        const finish=document.getElementById('finishPanel'),fixed=document.getElementById('fixedExpensesBtn'),next=document.getElementById('nextOutletBtn');
        if(finish&&!finish.dataset.phase1){finish.dataset.phase1='1';if(next)next.style.display='none';if(fixed){fixed.textContent='Continue to Staff Master →';fixed.onclick=function(){go('staff.html');};}}
      });
      observer.observe(document.body,{childList:true,subtree:true});
      const frame=document.getElementById('methodFrame');if(frame)frame.addEventListener('load',()=>recoverMethodFrame(frame,activeMethod(),outletId()));
    }
    if(path==='staff.html'){const observer=new MutationObserver(function(){const btn=document.getElementById('save');if(btn&&!btn.dataset.phase1){const original=btn.onclick;if(typeof original==='function'){btn.dataset.phase1='1';btn.onclick=async function(){await original.call(btn);const status=document.getElementById('status');const text=(status?.textContent||'').toLowerCase();if(/saved and verified/.test(text)&&!/error|failed|❌/.test(text))go('hr-allocation.html');};}}});observer.observe(document.body,{childList:true,subtree:true});}
    if(path==='hr-allocation.html'){const observer=new MutationObserver(function(){const btn=document.getElementById('save');if(btn&&!btn.dataset.phase1){const original=btn.onclick;if(typeof original==='function'){btn.dataset.phase1='1';btn.onclick=async function(){await original.call(btn);const status=document.getElementById('status');const text=(status?.textContent||'').toLowerCase();if(/saved and verified/.test(text)&&!/error|failed|❌/.test(text))go('fixed-expenses.html');};}}});observer.observe(document.body,{childList:true,subtree:true});}
    if(path==='fixed-expenses.html'){const observer=new MutationObserver(function(){const btn=document.getElementById('saveBtn');if(btn&&!btn.dataset.phase1){const original=btn.onclick;if(typeof original==='function'){btn.dataset.phase1='1';btn.onclick=async function(){await original.call(btn);const status=document.getElementById('saveStatus');const text=(status?.textContent||'').toLowerCase();if(/saved and verified|fixed expenses saved/.test(text)&&!/error|failed|❌/.test(text))location.href='complete-outlet-analysis.html?outlet='+encodeURIComponent(document.getElementById('outletSelect')?.value||outletId());};}}});observer.observe(document.body,{childList:true,subtree:true});}
  });
})();
