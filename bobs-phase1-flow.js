/* BOBS PHASE 1 FLOW CONTROLLER
 * Enforces the approved one-outlet-at-a-time sequence:
 * Outlet Setup -> Shifts -> M1 -> M2 decision -> M2 -> Staff -> HR -> Expenses -> Analysis -> Break-even.
 */
(function(){
  const path=(location.pathname.split('/').pop()||'').toLowerCase();
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  function outletId(){
    return new URLSearchParams(location.search).get('outlet')||
      localStorage.getItem('selected-outlet-id')||
      (JSON.parse(localStorage.getItem('outlet-selection')||'null')||{}).id||'1';
  }
  function go(page){ location.href=page+'?outlet='+encodeURIComponent(outletId()); }

  ready(function(){
    if(path==='outlet-method-flow.html'){
      let methodWrapped=false;
      const observer=new MutationObserver(function(){
        const saveBtn=document.getElementById('saveContinueBtn');
        if(saveBtn && !saveBtn.dataset.phase1Method){
          const original=saveBtn.onclick;
          if(typeof original==='function'){
            saveBtn.dataset.phase1Method='1';
            saveBtn.onclick=async function(){
              await original.call(saveBtn);
              const status=document.getElementById('saveNote');
              const text=(status?.textContent||'').toLowerCase();
              if(/failed|error|❌/.test(text)) return;
              const method=window.currentMethod||null;
              const ask=document.getElementById('askOtherPanel');
              const finish=document.getElementById('finishPanel');
              const methodPanel=document.getElementById('methodPanel');
              const choice=document.getElementById('choicePanel');
              const askTitle=document.getElementById('askTitle');
              const askText=document.getElementById('askText');
              const yes=document.getElementById('yesOtherBtn');
              const no=document.getElementById('noOtherBtn');
              if(!method || !ask || !yes || !no) return;

              if(method==='method1'){
                methodPanel?.classList.add('hidden');
                choice?.classList.add('hidden');
                finish?.classList.add('hidden');
                ask.classList.remove('hidden');
                askTitle.textContent='Method 1 saved ✓';
                const d=JSON.parse(localStorage.getItem('outlet-analysis-data')||'{}');
                const oid=outletId();
                const existing=!!(d?.[oid]?.method2Selected || d?.[oid]?.method2);
                askText.textContent=existing
                  ? 'Method 2 data already exists for this outlet. Do you want to use the existing Method 2 data?'
                  : 'Method 2 has not been completed for this outlet. Do you want to analyse Method 2 now?';
                yes.textContent=existing?'YES — Use Existing Method 2 Data':'YES — Analyse Method 2';
                no.textContent='NO — Continue to Staff Master';
                yes.onclick=function(){
                  ask.classList.add('hidden');
                  if(typeof window.loadMethod==='function') window.loadMethod('method2');
                  else { window.currentMethod='method2'; location.reload(); }
                };
                no.onclick=function(){ go('staff.html'); };
              }else if(method==='method2'){
                methodPanel?.classList.add('hidden');
                choice?.classList.add('hidden');
                ask?.classList.add('hidden');
                finish?.classList.add('hidden');
                go('staff.html');
              }
            };
          }
        }

        /* If the page's native logic exposes the old Finish panel, keep it from
         * bypassing the Phase 1 Staff step. */
        const finish=document.getElementById('finishPanel');
        const fixed=document.getElementById('fixedExpensesBtn');
        const next=document.getElementById('nextOutletBtn');
        if(finish && !finish.dataset.phase1){
          finish.dataset.phase1='1';
          if(next)next.style.display='none';
          if(fixed){
            fixed.textContent='Continue to Staff Master →';
            fixed.onclick=function(){go('staff.html');};
          }
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }

    if(path==='staff.html'){
      const observer=new MutationObserver(function(){
        const btn=document.getElementById('save');
        if(btn && !btn.dataset.phase1){
          const original=btn.onclick;
          if(typeof original==='function'){
            btn.dataset.phase1='1';
            btn.onclick=async function(){
              await original.call(btn);
              const status=document.getElementById('status');
              const text=(status?.textContent||'').toLowerCase();
              if(/saved and verified/.test(text) && !/error|failed|❌/.test(text)) go('hr-allocation.html');
            };
          }
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }

    if(path==='hr-allocation.html'){
      const observer=new MutationObserver(function(){
        const btn=document.getElementById('save');
        if(btn && !btn.dataset.phase1){
          const original=btn.onclick;
          if(typeof original==='function'){
            btn.dataset.phase1='1';
            btn.onclick=async function(){
              await original.call(btn);
              const status=document.getElementById('status');
              const text=(status?.textContent||'').toLowerCase();
              if(/saved and verified/.test(text) && !/error|failed|❌/.test(text)) go('fixed-expenses.html');
            };
          }
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }

    if(path==='fixed-expenses.html'){
      const observer=new MutationObserver(function(){
        const btn=document.getElementById('saveBtn');
        if(btn && !btn.dataset.phase1){
          const original=btn.onclick;
          if(typeof original==='function'){
            btn.dataset.phase1='1';
            btn.onclick=async function(){
              await original.call(btn);
              const status=document.getElementById('saveStatus');
              const text=(status?.textContent||'').toLowerCase();
              if(/saved and verified|fixed expenses saved/.test(text) && !/error|failed|❌/.test(text)){
                location.href='complete-outlet-analysis.html?outlet='+encodeURIComponent(document.getElementById('outletSelect')?.value||outletId());
              }
            };
          }
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
  });
})();
