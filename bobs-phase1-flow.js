/* BOBS PHASE 1 FLOW CONTROLLER
 * Enforces the approved one-outlet-at-a-time sequence:
 * Outlet Setup -> Shifts -> M1 -> M2 decision -> M2 -> Staff -> HR -> Expenses -> Analysis -> Break-even.
 */
(function(){
  const path=(location.pathname.split('/').pop()||'').toLowerCase();
  const METHOD_KEYS=new Set(['method1-hourly-state','method2-item-state']);
  /* Never let the Phase-1 routing layer erase method work just because the
   * outlet-analysis summary cache has not been built yet. Keep a recovery copy. */
  if(!window.__BOBS_METHOD_CACHE_GUARD){
    window.__BOBS_METHOD_CACHE_GUARD=true;
    const nativeRemove=Storage.prototype.removeItem;
    Storage.prototype.removeItem=function(key){
      try{
        if(METHOD_KEYS.has(String(key))){
          const value=this.getItem(key);
          if(value && value!=='{}' && value!=='null') this.setItem('bobs-recovery-'+key,value);
          return;
        }
      }catch(e){}
      return nativeRemove.call(this,key);
    };
  }
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  function outletId(){
    return new URLSearchParams(location.search).get('outlet')||
      localStorage.getItem('selected-outlet-id')||
      (JSON.parse(localStorage.getItem('outlet-selection')||'null')||{}).id||'1';
  }
  function go(page){ location.href=page+'?outlet='+encodeURIComponent(outletId()); }
  function activeMethod(){
    const title=(document.getElementById('methodTitle')?.textContent||'').toLowerCase();
    if(title.indexOf('method 2')!==-1) return 'method2';
    if(title.indexOf('method 1')!==-1) return 'method1';
    const frame=document.getElementById('methodFrame');
    const src=frame?.getAttribute('src')||'';
    return src.indexOf('method2.html')!==-1?'method2':'method1';
  }
  function jsonp(url,params){
    return new Promise((resolve,reject)=>{
      const cb='bobsRecover_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const s=document.createElement('script'); let done=false;
      const finish=(err,data)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();err?reject(err):resolve(data)};
      const timer=setTimeout(()=>finish(new Error('timeout')),10000);
      window[cb]=d=>finish(null,d); s.onerror=()=>finish(new Error('unavailable'));
      s.src=url+'?'+new URLSearchParams({...params,callback:cb,t:Date.now()});s.async=true;document.head.appendChild(s);
    });
  }
  async function recoverMethodFrame(frame,method,oid){
    if(!frame||!oid)return;
    try{
      const url=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'';
      if(!url)return;
      const base=new Date();
      for(let back=0;back<6;back++){
        const d=new Date(base.getFullYear(),base.getMonth()-back,1);
        const key=d.toISOString().slice(0,7);
        const g=await jsonp(url,{action:'moduleGet',outletId:String(oid),module:method==='method1'?'METHOD1':'METHOD2',recordKey:key});
        if(!(g&&g.ok&&g.found&&g.data))continue;
        const doc=frame.contentDocument; if(!doc)continue;
        if(method==='method1' && Array.isArray(g.data.rows) && g.data.rows.length){
          const state={custVals:g.data.rows.map(r=>Number(r.customers)||0),basketVals:g.data.rows.map(r=>Number(r.basket)||0)};
          frame.contentWindow.localStorage.setItem('method1-hourly-state',JSON.stringify(state));
          g.data.rows.forEach((r,i)=>{
            const c=doc.querySelector(`.custInput[data-i="${i}"]`),b=doc.querySelector(`.basketInput[data-i="${i}"]`);
            if(c)c.value=Number(r.customers)||0;if(b)b.value=Number(r.basket)||0;
          });
          doc.querySelectorAll('.custInput,.basketInput').forEach(el=>el.dispatchEvent(new Event('input',{bubbles:true})));
          return;
        }
        if(method==='method2' && Array.isArray(g.data.rows) && g.data.rows.length){
          const state={rows:g.data.rows}; frame.contentWindow.localStorage.setItem('method2-item-state',JSON.stringify(state));
          g.data.rows.forEach(r=>{
            const sel=`.qtyInput[data-cat="${CSS.escape(String(r.category))}"][data-i="${r.i}"]`;
            const el=doc.querySelector(sel); if(el){el.value=Number(r.qty)||0;el.dispatchEvent(new Event('input',{bubbles:true}));}
            const m=doc.querySelector(`.modeSelect[data-cat="${CSS.escape(String(r.category))}"][data-i="${r.i}"]`);
            if(m&&r.mode){m.value=r.mode;m.dispatchEvent(new Event('change',{bubbles:true}));}
          });
          return;
        }
      }
    }catch(e){ console.warn('BOBS method recovery:',e); }
  }

  ready(function(){
    if(path==='outlet-method-flow.html'){
      const observer=new MutationObserver(function(){
        const saveBtn=document.getElementById('saveContinueBtn');
        if(saveBtn && !saveBtn.dataset.phase1Method){
          const original=saveBtn.onclick;
          if(typeof original==='function'){
            saveBtn.dataset.phase1Method='1';
            saveBtn.onclick=async function(){
              const method=activeMethod();
              await original.call(saveBtn);
              const status=document.getElementById('saveNote');
              const text=(status?.textContent||'').toLowerCase();
              if(/failed|error|❌/.test(text)) return;
              const ask=document.getElementById('askOtherPanel');
              const finish=document.getElementById('finishPanel');
              const methodPanel=document.getElementById('methodPanel');
              const choice=document.getElementById('choicePanel');
              const askTitle=document.getElementById('askTitle');
              const askText=document.getElementById('askText');
              const yes=document.getElementById('yesOtherBtn');
              const no=document.getElementById('noOtherBtn');
              if(!ask || !yes || !no) return;
              if(method==='method1'){
                methodPanel?.classList.add('hidden');choice?.classList.add('hidden');finish?.classList.add('hidden');ask.classList.remove('hidden');
                askTitle.textContent='Method 1 saved ✓';
                let d={};try{d=JSON.parse(localStorage.getItem('outlet-analysis-data')||'{}')||{}}catch(e){}
                const oid=outletId();
                const existing=!!(d?.[oid]?.method2Selected || d?.[oid]?.method2);
                askText.textContent=existing?'Method 2 data already exists for this outlet. Do you want to use the existing Method 2 data?':'Method 2 has not been completed for this outlet. Do you want to analyse Method 2 now?';
                yes.textContent=existing?'YES — Use Existing Method 2 Data':'YES — Analyse Method 2'; no.textContent='NO — Continue to Staff Master';
                yes.onclick=function(){ask.classList.add('hidden');if(typeof window.loadMethod==='function') window.loadMethod('method2');else document.getElementById('choicePanel')?.classList.remove('hidden');};
                no.onclick=function(){go('staff.html');};
              }else{methodPanel?.classList.add('hidden');choice?.classList.add('hidden');ask?.classList.add('hidden');finish?.classList.add('hidden');go('staff.html');}
            };
          }
        }
        const finish=document.getElementById('finishPanel');const fixed=document.getElementById('fixedExpensesBtn');const next=document.getElementById('nextOutletBtn');
        if(finish && !finish.dataset.phase1){finish.dataset.phase1='1';if(next)next.style.display='none';if(fixed){fixed.textContent='Continue to Staff Master →';fixed.onclick=function(){go('staff.html');};}}
      });
      observer.observe(document.body,{childList:true,subtree:true});
      const frame=document.getElementById('methodFrame');
      if(frame)frame.addEventListener('load',()=>recoverMethodFrame(frame,activeMethod(),outletId()));
    }
    if(path==='staff.html'){
      const observer=new MutationObserver(function(){const btn=document.getElementById('save');if(btn&&!btn.dataset.phase1){const original=btn.onclick;if(typeof original==='function'){btn.dataset.phase1='1';btn.onclick=async function(){await original.call(btn);const status=document.getElementById('status');const text=(status?.textContent||'').toLowerCase();if(/saved and verified/.test(text)&&!/error|failed|❌/.test(text))go('hr-allocation.html');};}}});observer.observe(document.body,{childList:true,subtree:true});
    }
    if(path==='hr-allocation.html'){
      const observer=new MutationObserver(function(){const btn=document.getElementById('save');if(btn&&!btn.dataset.phase1){const original=btn.onclick;if(typeof original==='function'){btn.dataset.phase1='1';btn.onclick=async function(){await original.call(btn);const status=document.getElementById('status');const text=(status?.textContent||'').toLowerCase();if(/saved and verified/.test(text)&&!/error|failed|❌/.test(text))go('fixed-expenses.html');};}}});observer.observe(document.body,{childList:true,subtree:true});
    }
    if(path==='fixed-expenses.html'){
      const observer=new MutationObserver(function(){const btn=document.getElementById('saveBtn');if(btn&&!btn.dataset.phase1){const original=btn.onclick;if(typeof original==='function'){btn.dataset.phase1='1';btn.onclick=async function(){await original.call(btn);const status=document.getElementById('saveStatus');const text=(status?.textContent||'').toLowerCase();if(/saved and verified|fixed expenses saved/.test(text)&&!/error|failed|❌/.test(text))location.href='complete-outlet-analysis.html?outlet='+encodeURIComponent(document.getElementById('outletSelect')?.value||outletId());};}}});observer.observe(document.body,{childList:true,subtree:true});
    }
  });
})();
