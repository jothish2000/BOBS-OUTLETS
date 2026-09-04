/* BOBS PHASE 1 FLOW CONTROLLER
 * Enforces the approved one-outlet-at-a-time sequence without deleting data:
 * Outlet Setup -> Shifts -> M1/M2 -> Staff -> HR Allocation -> Expenses -> Complete Outlet Analysis -> Break-even.
 */
(function(){
  const path=(location.pathname.split('/').pop()||'').toLowerCase();
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  function wrapSave(buttonId,nextUrl,statusId){
    ready(function(){
      const btn=document.getElementById(buttonId); if(!btn)return;
      const original=btn.onclick;
      if(typeof original!=='function')return;
      btn.onclick=async function(){
        const result=await original.call(btn);
        const status=statusId?document.getElementById(statusId):null;
        const text=(status?.textContent||'').toLowerCase();
        if(/saved|verified|complete/.test(text) && !/failed|error|❌/.test(text)){
          const outlet=new URLSearchParams(location.search).get('outlet')||localStorage.getItem('selected-outlet-id')||'';
          location.href=nextUrl+(outlet?'?outlet='+encodeURIComponent(outlet):'');
        }
        return result;
      };
    });
  }
  ready(function(){
    if(path==='outlet-method-flow.html'){
      const observer=new MutationObserver(function(){
        const finish=document.getElementById('finishPanel');
        const fixed=document.getElementById('fixedExpensesBtn');
        const next=document.getElementById('nextOutletBtn');
        if(finish && !finish.dataset.phase1){
          finish.dataset.phase1='1';
          if(next)next.style.display='none';
          if(fixed){
            fixed.textContent='Continue to Staff Details →';
            fixed.onclick=function(){location.href='staff.html?outlet='+encodeURIComponent(new URLSearchParams(location.search).get('outlet')||localStorage.getItem('selected-outlet-id')||'1')};
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
              if(/saved and verified/.test(text) && !/error|failed|❌/.test(text)){
                const outlet=new URLSearchParams(location.search).get('outlet')||localStorage.getItem('selected-outlet-id')||'';
                location.href='hr-allocation.html?outlet='+encodeURIComponent(outlet);
              }
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
              if(/saved and verified/.test(text) && !/error|failed|❌/.test(text)){
                const outlet=new URLSearchParams(location.search).get('outlet')||localStorage.getItem('selected-outlet-id')||'1';
                location.href='fixed-expenses.html?outlet='+encodeURIComponent(outlet);
              }
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
                location.href='complete-outlet-analysis.html?outlet='+encodeURIComponent(document.getElementById('outletSelect')?.value||localStorage.getItem('selected-outlet-id')||'1');
              }
            };
          }
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
  });
})();
