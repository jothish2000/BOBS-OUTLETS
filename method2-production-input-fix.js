/* BOBS Method 2 production input focus + derived-calculation fix — additive, data-safe. */
(function(){'use strict';
function num(v){const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0;}
function key(cat,i){return String(cat)+'::'+String(i);}
function read(){try{return JSON.parse(localStorage.getItem('method2-item-state')||'{}')}catch(e){return {}}}
function write(s){try{localStorage.setItem('method2-item-state',JSON.stringify(s));}catch(e){}}
function sync(el){
  const panel=el.closest('.batchPanel');
  if(!panel)return;
  const u=panel.querySelector('.batchSizeInput'),b=panel.querySelector('.numBatchesInput'),m=panel.querySelector('.maxBatchesPerDayInput');
  const uv=u&&u.value!==''?num(u.value):null,bv=b&&b.value!==''?num(b.value):null,mv=m&&m.value!==''?num(m.value):null;
  const cat=el.dataset.cat||u?.dataset.cat||b?.dataset.cat||m?.dataset.cat||'';
  const iRaw=el.dataset.i??u?.dataset.i??b?.dataset.i??m?.dataset.i??'';
  const i=Number(iRaw);
  if(cat&&Number.isFinite(i)){
    const s=read();s.prod=s.prod||{};const k=key(cat,i),o=Object.assign({},s.prod[k]||{});
    if(uv!==null){o.unitsPerBatch=uv;o.batchSize=uv;}
    if(bv!==null){o.batchesToday=bv;o.numBatchesToday=bv;}
    if(mv!==null)o.maxBatchesPerDay=mv;
    if(uv!==null&&bv!==null)o.todaysProduction=uv*bv;
    if(uv!==null&&mv!==null)o.productionCapacityPerDay=uv*mv;
    s.prod[k]=o;write(s);
  }
  const today=panel.querySelector('.m2v-today-v')||panel.querySelector('.m2v4-today-v');
  if(today&&uv!==null&&bv!==null)today.textContent=(uv*bv).toLocaleString('en-IN');
  const cap=panel.querySelector('.productionCapacityInput')||panel.querySelector('.capacityInput');
  if(cap&&uv!==null&&mv!==null)cap.value=String(uv*mv);
  panel.dataset.m2TodayProduction=uv!==null&&bv!==null?String(uv*bv):'';
}
function refreshAll(){
  document.querySelectorAll('.batchPanel').forEach(function(panel){
    const u=panel.querySelector('.batchSizeInput'),b=panel.querySelector('.numBatchesInput'),m=panel.querySelector('.maxBatchesPerDayInput');
    if(!u||!b||!m)return;
    sync(u);
  });
}
function recalcAfterEdit(){
  if(typeof window.recalc==='function'){try{window.recalc();}catch(e){}}
  if(typeof window.saveState==='function'){try{window.saveState();}catch(e){}}
}
function install(){
  document.addEventListener('input',function(e){
    const t=e.target;if(!t||!t.classList)return;
    if(t.classList.contains('batchSizeInput')||t.classList.contains('numBatchesInput')||t.classList.contains('maxBatchesPerDayInput')){
      e.stopImmediatePropagation();
      t.readOnly=false;t.disabled=false;t.style.pointerEvents='auto';t.style.opacity='1';
      sync(t);
    }
  },true);
  document.addEventListener('change',function(e){
    const t=e.target;if(!t||!t.classList)return;
    if(t.classList.contains('batchSizeInput')||t.classList.contains('numBatchesInput')||t.classList.contains('maxBatchesPerDayInput')){
      t.readOnly=false;t.disabled=false;t.style.pointerEvents='auto';
      if(t.classList.contains('batchSizeInput')){const row=t.closest('.batchRow');if(row){const s=row.querySelector('span');if(s)s.innerHTML='<b>No. of pieces per batch</b>';}}
      sync(t);
      recalcAfterEdit();
      e.stopImmediatePropagation();
    }
  },true);
  function label(){document.querySelectorAll('.batchSizeRow .batchSizeInput').forEach(function(t){t.readOnly=false;t.disabled=false;t.style.pointerEvents='auto';const r=t.closest('.batchRow');if(r){const s=r.querySelector('span');if(s)s.innerHTML='<b>No. of pieces per batch</b>';}})}
  label();
  setTimeout(label,300);setTimeout(label,1000);
  setTimeout(refreshAll,700);
  setTimeout(refreshAll,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();