/* BOBS Method 2 — RM-to-Production sync bridge. Additive and Method-2-only. */
(function(){'use strict';
  function normalizeRecipes(){
    const src=window.BOBS_METHOD2_RM_RECIPES;
    if(!Array.isArray(src)||!src.length)return false;
    const out=src.slice();
    src.forEach(function(r){
      const n=String(r&&r.name||'');
      if(/idly/i.test(n)&&!src.some(x=>/idli/i.test(String(x&&x.name||''))))out.push(Object.assign({},r,{name:n.replace(/idly/ig,'Idli')}));
      if(/idli/i.test(n)&&!src.some(x=>/idly/i.test(String(x&&x.name||''))))out.push(Object.assign({},r,{name:n.replace(/idli/ig,'Idly')}));
    });
    window.BOBS_METHOD2_RM_RECIPES=out;
    return true;
  }
  function kick(){
    if(!normalizeRecipes())return false;
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