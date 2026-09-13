/* BOBS Method 2 — definitive production batch controls.
   Today's production is driven by batches actually produced today.
   Production capacity/day is a separate capacity field and is NEVER derived from today's runs.
   This layer also prevents the older commercial renderer from reusing capacity as today's production.
   Safe/additive: does not touch Method 1. */
(function(){
'use strict';
function panel(cat,i){return document.getElementById('batch-'+String(cat).replace(/\s+/g,'_')+'-'+i)}
function n(v){const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0}
function ensure(cat,i){
 const p=panel(cat,i);if(!p)return;
 const fmt=p.querySelector('.formatSelect');if(!fmt||fmt.value!=='batch')return;
 const units=p.querySelector('.batchSizeInput');if(!units)return;
 const key=String(cat).replace(/\s+/g,'_');
 let row=p.querySelector('.m2-definitive-batch-count-row');
 let batches=p.querySelector('.numBatchesInput');
 if(!row){
   row=p.querySelector('#numBatchesRow-'+key+'-'+i);
   if(row)row.classList.add('m2-definitive-batch-count-row');
   else{
     row=document.createElement('div');row.className='batchRow m2-definitive-batch-count-row';
     row.innerHTML='<span><b>No. of batches produced today</b></span><input class="numBatchesInput" data-cat="'+String(cat).replace(/"/g,'&quot;')+'" data-i="'+i+'" type="number" min="0" step="1" value="1">';
     p.appendChild(row);
   }
 }
 batches=row.querySelector('.numBatchesInput')||p.querySelector('.numBatchesInput');if(!batches)return;
 const label=row.querySelector('span');if(label)label.innerHTML='<b>No. of batches produced today</b>';
 if(batches.value===''||Number(batches.value)<0)batches.value='1';
 const sizeRow=p.querySelector('#batchSizeRow-'+key+'-'+i);if(sizeRow){const s=sizeRow.querySelector('span');if(s)s.innerHTML='<b>Units per batch</b>'}
 /* Capacity is independent operating/master capacity. Preserve its value; never derive it from today's runs. */
 const cap=p.querySelector('.capacityInput')||(p.querySelector('#capacityRow-'+key+'-'+i)||{}).querySelector?.('input');
 if(cap){
   if(cap.dataset.m2CapacityAuthority!=='1'){
     cap.dataset.m2CapacityAuthority='1';
     cap.dataset.m2CapacityValue=cap.value;
     cap.addEventListener('input',()=>{cap.dataset.m2CapacityValue=cap.value});
   }
   cap.readOnly=false;
   cap.removeAttribute('readonly');
   cap.classList.remove('m2-auto');
   const capLabel=(cap.closest('.batchRow')||p).querySelector('span');
   if(capLabel)capLabel.innerHTML='<b>Production capacity / day</b> <small>(capacity limit)</small>';
 }
 /* Today's production is ONLY units per batch × batches produced today. */
 const mark=()=>{p.dataset.m2TodayProduction=String(Math.round(n(units.value)*n(batches.value)*1000)/1000)};
 if(units.dataset.m2DefBound!=='1'){units.dataset.m2DefBound='1';units.addEventListener('input',mark)}
 if(batches.dataset.m2DefBound!=='1'){batches.dataset.m2DefBound='1';batches.addEventListener('input',mark)}
 mark();
}
function restoreIndependentCapacity(p){
 const cap=p.querySelector('.capacityInput');
 if(!cap||cap.dataset.m2CapacityAuthority!=='1')return;
 const v=cap.dataset.m2CapacityValue;
 if(v!=null&&String(cap.value)!==String(v))cap.value=v;
 cap.readOnly=false;cap.removeAttribute('readonly');cap.classList.remove('m2-auto');
}
function scheduleRepair(p){setTimeout(()=>restoreIndependentCapacity(p),0);setTimeout(()=>restoreIndependentCapacity(p),40)}
function boot(){
 document.querySelectorAll('.batchPanel').forEach(p=>{const f=p.querySelector('.formatSelect');if(f&&f.value==='batch'&&f.dataset.cat!==undefined)ensure(f.dataset.cat,Number(f.dataset.i));scheduleRepair(p)});
 document.addEventListener('input',e=>{const t=e.target;if(!t||!t.classList)return;const p=t.closest('.batchPanel');if(!p)return;if(t.classList.contains('capacityInput'))t.dataset.m2CapacityValue=t.value;scheduleRepair(p)},true);
 document.addEventListener('change',e=>{const t=e.target;if(!t||!t.classList)return;if(t.classList.contains('modeSelect')&&t.value==='production')setTimeout(()=>{ensure(t.dataset.cat,Number(t.dataset.i));scheduleRepair(panel(t.dataset.cat,Number(t.dataset.i)))},20);if(t.classList.contains('formatSelect'))setTimeout(()=>{ensure(t.dataset.cat,Number(t.dataset.i));scheduleRepair(panel(t.dataset.cat,Number(t.dataset.i)))},20)},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
