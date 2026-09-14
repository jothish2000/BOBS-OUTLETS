/* BOBS Method 2 — RM-to-Production sync bridge. Additive and Method-2-only. */
(function(){'use strict';
  function kick(){
    if(!Array.isArray(window.BOBS_METHOD2_RM_RECIPES)||!window.BOBS_METHOD2_RM_RECIPES.length)return false;
    document.querySelectorAll('.batchPanel').forEach(function(p){
      const f=p.querySelector('.formatSelect');
      if(f&&f.value==='batch')f.dispatchEvent(new Event('change',{bubbles:true}));
    });
    return true;
  }
  document.addEventListener('bobs-method2-rm-ready',function(){setTimeout(kick,30);setTimeout(kick,250);});
  document.addEventListener('bobs-method2-condiment-change',function(){setTimeout(kick,30);});
  const timer=setInterval(function(){if(kick())clearInterval(timer)},500);
  setTimeout(function(){clearInterval(timer)},15000);
})();