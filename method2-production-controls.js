/* BOBS Method 2 — definitive production batch controls.
   Production has FOUR separate concepts:
   1) Units per batch
   2) No. of batches ran today -> today's actual production
   3) Maximum No. of batches / day -> operating capacity limit
   4) Production capacity / day -> Units per batch × Maximum No. of batches / day
   Production COGS uses TODAY'S actual production only, never capacity.
   Safe/additive: does not touch Method 1. */
(function(){
'use strict';
function panel(cat,i){return document.getElementById('batch-'+String(cat).replace(/\s+/g,'_')+'-'+i)}
function n(v){const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0}
function esc(v){return String(v).replace(/"/g,'&quot;')}
function ensure(cat,i){
 const p=panel(cat,i);if(!p)return;
 const fmt=p.querySelector('.formatSelect');if(!fmt||fmt.value!=='batch')return;
 const units=p.querySelector('.batchSizeInput');if(!units)return;
 const key=String(cat).replace(/\s+/g,'_');
 let todayRow=p.querySelector('.m2-definitive-batch-count-row'),batches=p.querySelector('.numBatchesInput');
 if(!todayRow){
   todayRow=p.querySelector('#numBatchesRow-'+key+'-'+i);
   if(todayRow)todayRow.classList.add('m2-definitive-batch-count-row');
   else{
     todayRow=document.createElement('div');todayRow.className='batchRow m2-definitive-batch-count-row';
     todayRow.innerHTML='<span><b>No. of batches ran today</b></span><input class="numBatchesInput" data-cat="'+esc(cat)+'" data-i="'+i+'" type="number" min="0" step="1" value="1">';
     p.appendChild(todayRow);
   }
 }
 batches=todayRow.querySelector('.numBatchesInput')||p.querySelector('.numBatchesInput');if(!batches)return;
 const todayLabel=todayRow.querySelector('span');if(todayLabel)todayLabel.innerHTML='<b>No. of batches ran today</b>';
 if(batches.value===''||Number(batches.value)<0)batches.value='1';
 const sizeRow=p.querySelector('#batchSizeRow-'+key+'-'+i);if(sizeRow){const s=sizeRow.querySelector('span');if(s)s.innerHTML='<b>Units per batch</b>'}
 /* Today's production is a visible calculated value, never an input. */
 let todayProdRow=p.querySelector('.m2-today-production-row'),todayProd=todayProdRow&&todayProdRow.querySelector('.m2-today-production-value');
 if(!todayProdRow){
   todayProdRow=document.createElement('div');todayProdRow.className='batchRow m2-today-production-row';
   todayProdRow.innerHTML='<span><b>Today\'s production</b></span><strong class="m2-today-production-value" style="font-weight:800;">0</strong>';
   todayRow.parentNode.insertBefore(todayProdRow,todayRow.nextSibling);
   todayProd=todayProdRow.querySelector('.m2-today-production-value');
 }
 /* NEW: maximum batches/day is a separate operating-capacity input. */
 let maxRow=p.querySelector('.m2-max-batches-row'),maxB=p.querySelector('.maxBatchesPerDayInput');
 if(!maxRow){
   maxRow=document.createElement('div');maxRow.className='batchRow m2-max-batches-row';
   maxRow.innerHTML='<span><b>Maximum No. of batches / day</b></span><input class="maxBatchesPerDayInput" data-cat="'+esc(cat)+'" data-i="'+i+'" type="number" min="0" step="1" value="12">';
   todayProdRow.parentNode.insertBefore(maxRow,todayProdRow.nextSibling);
   maxB=maxRow.querySelector('.maxBatchesPerDayInput');
 }
 const maxLabel=maxRow.querySelector('span');if(maxLabel)maxLabel.innerHTML='<b>Maximum No. of batches / day</b>';
 if(maxB.value===''||Number(maxB.value)<0)maxB.value='12';
 /* Capacity is derived ONLY from units/batch × maximum batches/day. */
 let cap=p.querySelector('.productionCapacityInput')||p.querySelector('.capacityInput');
 if(!cap){
   const capRow=document.createElement('div');capRow.className='batchRow m2-production-capacity-row';
   capRow.innerHTML='<span><b>Production capacity / day</b> <small>(capacity limit)</small></span><input class="productionCapacityInput" type="number" readonly>';
   p.insertBefore(capRow,maxRow.nextSibling);cap=capRow.querySelector('.productionCapacityInput');
 }
 cap.readOnly=true;cap.setAttribute('readonly','readonly');cap.classList.add('m2-auto-capacity');
 const capLabel=(cap.closest('.batchRow')||p).querySelector('span');if(capLabel)capLabel.innerHTML='<b>Production capacity / day</b> <small>(capacity limit)</small>';
 const calcCapacity=()=>{cap.value=Math.round(n(units.value)*n(maxB.value)*1000)/1000;cap.dataset.m2CapacityAuthority='derived';cap.dataset.m2CapacityValue=cap.value};
 const markToday=()=>{const q=Math.round(n(units.value)*n(batches.value)*1000)/1000;p.dataset.m2TodayProduction=String(q);if(todayProd)todayProd.textContent=q.toLocaleString('en-IN')};
 if(units.dataset.m2DefBound!=='1'){units.dataset.m2DefBound='1';units.addEventListener('input',()=>{markToday();calcCapacity()})}
 if(batches.dataset.m2DefBound!=='1'){batches.dataset.m2DefBound='1';batches.addEventListener('input',markToday)}
 if(maxB.dataset.m2MaxBound!=='1'){maxB.dataset.m2MaxBound='1';maxB.addEventListener('input',calcCapacity)}
 markToday();calcCapacity();
}
function repair(p){
 if(!p)return;
 const f=p.querySelector('.formatSelect');if(!f||f.value!=='batch')return;
 const units=p.querySelector('.batchSizeInput'),maxB=p.querySelector('.maxBatchesPerDayInput'),cap=p.querySelector('.productionCapacityInput')||p.querySelector('.capacityInput');
 if(!units||!maxB||!cap)return;
 cap.readOnly=true;cap.setAttribute('readonly','readonly');cap.classList.add('m2-auto-capacity');
 const v=Math.round(n(units.value)*n(maxB.value)*1000)/1000;cap.value=v;cap.dataset.m2CapacityAuthority='derived';cap.dataset.m2CapacityValue=v;
 const row=cap.closest('.batchRow');const label=row&&row.querySelector('span');if(label)label.innerHTML='<b>Production capacity / day</b> <small>(capacity limit)</small>';
 const maxLabel=maxB.closest('.batchRow')?.querySelector('span');if(maxLabel)maxLabel.innerHTML='<b>Maximum No. of batches / day</b>';
 const todayProd=p.querySelector('.m2-today-production-value');if(todayProd)todayProd.textContent=Math.round(n(units.value)*n(p.querySelector('.numBatchesInput')?.value)*1000)/1000 .toLocaleString?.('en-IN')||String(Math.round(n(units.value)*n(p.querySelector('.numBatchesInput')?.value)*1000)/1000);
}
function boot(){
 document.querySelectorAll('.batchPanel').forEach(p=>{const f=p.querySelector('.formatSelect');if(f&&f.value==='batch'&&f.dataset.cat!==undefined){ensure(f.dataset.cat,Number(f.dataset.i));repair(p)}});
 document.addEventListener('input',e=>{const t=e.target;if(!t||!t.classList)return;const p=t.closest('.batchPanel');if(!p)return;if(t.classList.contains('capacityInput')||t.classList.contains('productionCapacityInput'))repair(p);else if(t.classList.contains('batchSizeInput')||t.classList.contains('maxBatchesPerDayInput')||t.classList.contains('numBatchesInput'))setTimeout(()=>{ensure(t.dataset.cat,Number(t.dataset.i));repair(p)},0)},true);
 document.addEventListener('change',e=>{const t=e.target;if(!t||!t.classList)return;if(t.classList.contains('modeSelect')&&t.value==='production')setTimeout(()=>{ensure(t.dataset.cat,Number(t.dataset.i));repair(panel(t.dataset.cat,Number(t.dataset.i)))},20);if(t.classList.contains('formatSelect'))setTimeout(()=>{ensure(t.dataset.cat,Number(t.dataset.i));repair(panel(t.dataset.cat,Number(t.dataset.i)))},20)},true);
 const s=document.createElement('script');s.src='method2-definitive-commercial-ui.js?v=2026-09-13-4';s.defer=true;document.head.appendChild(s);
 const g=document.createElement('script');g.src='method2-production-cogs-guard.js?v=2026-09-13-3';g.defer=true;document.head.appendChild(g);
 setTimeout(()=>document.dispatchEvent(new Event('bobs-method2-production-ready')),60);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
