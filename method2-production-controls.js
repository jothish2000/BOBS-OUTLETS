/* BOBS Method 2 — definitive production batch controls.
   Units/batch, batches today, today's production, max batches/day and derived capacity.
   Method 1 is untouched. */
(function(){
'use strict';
const esc=v=>String(v).replace(/"/g,'&quot;');
const num=v=>{const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0};
function panel(cat,i){return document.getElementById('batch-'+String(cat).replace(/\s+/g,'_')+'-'+i)}
function ensure(cat,i){
 const p=panel(cat,i);if(!p)return;
 const f=p.querySelector('.formatSelect');if(!f||f.value!=='batch')return;
 const units=p.querySelector('.batchSizeInput');if(!units)return;
 const oldB=p.querySelector('.numBatchesInput');
 let todayRow=p.querySelector('.m2-def-batches-row');
 if(!todayRow){todayRow=oldB&&oldB.closest('.batchRow');if(todayRow)todayRow.classList.add('m2-def-batches-row')}
 if(!todayRow){todayRow=document.createElement('div');todayRow.className='batchRow m2-def-batches-row';todayRow.innerHTML='<span><b>No. of batches ran today</b></span><input class="numBatchesInput" data-cat="'+esc(cat)+'" data-i="'+i+'" type="number" min="0" step="1" value="1">';p.appendChild(todayRow)}
 const batches=todayRow.querySelector('.numBatchesInput');if(!batches)return;
 const bl=todayRow.querySelector('span');if(bl)bl.innerHTML='<b>No. of batches ran today</b>';if(batches.value===''||num(batches.value)<0)batches.value='1';
 const ul=units.closest('.batchRow')?.querySelector('span');if(ul)ul.innerHTML='<b>Units per batch</b>';
 let today=p.querySelector('.m2-final-today');if(!today){today=document.createElement('div');today.className='batchRow m2-final-today';today.innerHTML='<span><b>Today\'s production</b></span><strong class="m2-final-today-value">0</strong>';todayRow.parentNode.insertBefore(today,todayRow.nextSibling)}
 let maxRow=p.querySelector('.m2-def-max-row'),max=p.querySelector('.maxBatchesPerDayInput');
 if(!maxRow){maxRow=document.createElement('div');maxRow.className='batchRow m2-def-max-row';maxRow.innerHTML='<span><b>Maximum No. of batches / day</b></span><input class="maxBatchesPerDayInput" data-cat="'+esc(cat)+'" data-i="'+i+'" type="number" min="0" step="1" value="12">';today.parentNode.insertBefore(maxRow,today.nextSibling);max=maxRow.querySelector('.maxBatchesPerDayInput')}
 const ml=maxRow.querySelector('span');if(ml)ml.innerHTML='<b>Maximum No. of batches / day</b>';if(max.value===''||num(max.value)<0)max.value='12';
 let cap=p.querySelector('.productionCapacityInput')||p.querySelector('.capacityInput');
 if(!cap){const r=document.createElement('div');r.className='batchRow m2-def-cap-row';r.innerHTML='<span><b>Production capacity / day</b> <small>(capacity limit)</small></span><input class="productionCapacityInput" type="number" readonly>';maxRow.parentNode.insertBefore(r,maxRow.nextSibling);cap=r.querySelector('.productionCapacityInput')}
 cap.readOnly=true;cap.setAttribute('readonly','readonly');cap.classList.add('m2-auto-capacity');
 const cr=cap.closest('.batchRow'),cl=cr&&cr.querySelector('span');if(cl)cl.innerHTML='<b>Production capacity / day</b> <small>(capacity limit)</small>';
 function calc(){const q=Math.round(num(units.value)*num(max.value)*1000)/1000;cap.value=q;cap.dataset.m2CapacityValue=q;cap.dataset.m2CapacityAuthority='derived';const t=Math.round(num(units.value)*num(batches.value)*1000)/1000;const tv=today.querySelector('.m2-final-today-value');if(tv)tv.textContent=t.toLocaleString('en-IN');p.dataset.m2TodayProduction=String(t)}
 if(!units.dataset.m2FinalBound){units.dataset.m2FinalBound='1';units.addEventListener('input',calc)}
 if(!batches.dataset.m2FinalBound){batches.dataset.m2FinalBound='1';batches.addEventListener('input',calc)}
 if(!max.dataset.m2FinalBound){max.dataset.m2FinalBound='1';max.addEventListener('input',calc)}
 calc();
}
function load(src){const s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
function boot(){document.querySelectorAll('.batchPanel').forEach(p=>{const f=p.querySelector('.formatSelect');if(f&&f.value==='batch')ensure(f.dataset.cat,Number(f.dataset.i))});document.addEventListener('change',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('modeSelect')&&t.value==='production')setTimeout(()=>ensure(t.dataset.cat,Number(t.dataset.i)),20);if(t&&t.classList&&t.classList.contains('formatSelect'))setTimeout(()=>ensure(t.dataset.cat,Number(t.dataset.i)),20)},true);document.addEventListener('input',e=>{const t=e.target;if(!t||!t.classList)return;if(t.classList.contains('batchSizeInput')||t.classList.contains('numBatchesInput')||t.classList.contains('maxBatchesPerDayInput'))setTimeout(()=>ensure(t.dataset.cat,Number(t.dataset.i)),0)},true);load('method2-permanent-sync.js?v=2026-09-13-3');load('method2-definitive-commercial-ui.js?v=2026-09-13-7');load('method2-production-cogs-guard.js?v=2026-09-13-6');load('method2-commercial-layout.js?v=2026-09-13-8');load('method2-item-save.js?v=2026-09-13-3');setTimeout(()=>document.dispatchEvent(new Event('bobs-method2-production-ready')),80)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
