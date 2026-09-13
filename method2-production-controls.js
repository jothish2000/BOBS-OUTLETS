/* BOBS Method 2 — definitive production batch controls.
   Visible, editable batches/day + automatic production capacity.
   Safe/additive: uses the existing Method 2 fields/state; does not touch Method 1. */
(function(){
'use strict';
const KEY='method2-item-state';
const n=v=>{const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0};
function panel(cat,i){return document.getElementById('batch-'+String(cat).replace(/\s+/g,'_')+'-'+i)}
function save(){try{if(typeof window.saveState==='function')window.saveState()}catch(e){}}
function refresh(cat,i){try{if(typeof window.updateBatchPanel==='function')window.updateBatchPanel(cat,i);if(typeof window.recalc==='function')window.recalc()}catch(e){}}
function ensure(cat,i){
 const p=panel(cat,i);if(!p)return;
 const fmt=p.querySelector('.formatSelect');if(!fmt||fmt.value!=='batch')return;
 const units=p.querySelector('.batchSizeInput');if(!units)return;
 const key=String(cat).replace(/\s+/g,'_');
 let row=p.querySelector('.m2-definitive-batch-count-row');
 let batches=p.querySelector('.numBatchesInput');
 if(!row){
   row=p.querySelector('#numBatchesRow-'+key+'-'+i);
   if(row){row.classList.add('m2-definitive-batch-count-row')}
   else{
     row=document.createElement('div');row.className='batchRow m2-definitive-batch-count-row';
     row.innerHTML='<span><b>No. of batches per day</b></span><input class="numBatchesInput" data-cat="'+String(cat).replace(/"/g,'&quot;')+'" data-i="'+i+'" type="number" min="0" step="1" value="1">';
     p.appendChild(row);
   }
 }
 batches=row.querySelector('.numBatchesInput')||p.querySelector('.numBatchesInput');
 if(!batches)return;
 const label=row.querySelector('span');if(label)label.innerHTML='<b>No. of batches per day</b>';
 if(batches.value===''||Number(batches.value)<0)batches.value='1';
 const sizeRow=p.querySelector('#batchSizeRow-'+key+'-'+i);if(sizeRow){const s=sizeRow.querySelector('span');if(s)s.innerHTML='<b>Units per batch</b>'}
 let cap=p.querySelector('.capacityInput');
 const capRow=p.querySelector('#capacityRow-'+key+'-'+i);
 if(!cap){
   if(capRow)cap=capRow.querySelector('input');
   if(cap)cap.classList.add('capacityInput');
 }
 if(!cap){
   const r=document.createElement('div');r.className='batchRow m2-definitive-capacity-row';
   r.innerHTML='<span><b>Production capacity / day</b> <small>(AUTO)</small></span><input class="capacityInput m2-auto" data-cat="'+String(cat).replace(/"/g,'&quot;')+'" data-i="'+i+'" type="number" min="0" step="1" readonly>';
   p.appendChild(r);cap=r.querySelector('.capacityInput');
 }
 cap.readOnly=true;cap.setAttribute('readonly','readonly');cap.classList.add('m2-auto');cap.title='Automatically calculated: Units per batch × No. of batches per day';
 const capLabel=(cap.closest('.batchRow')||capRow||p).querySelector('span');if(capLabel)capLabel.innerHTML='<b>Production capacity / day</b> <small>(AUTO)</small>';
 const calc=()=>{cap.value=String(Math.round(n(units.value)*n(batches.value)*1000)/1000);refresh(cat,i);save()};
 if(units.dataset.m2DefBound!=='1'){units.dataset.m2DefBound='1';units.addEventListener('input',calc)}
 if(batches.dataset.m2DefBound!=='1'){batches.dataset.m2DefBound='1';batches.addEventListener('input',calc)}
 calc();
}
function scan(){
 document.querySelectorAll('.batchPanel').forEach(p=>{
   const fmt=p.querySelector('.formatSelect');
   if(!fmt||fmt.value!=='batch')return;
   const units=p.querySelector('.batchSizeInput');
   if(!units)return;
   const cat=fmt.dataset.cat;
   const i=Number(fmt.dataset.i);
   if(cat!==undefined&&!Number.isNaN(i))ensure(cat,i);
 });
}
function boot(){
 scan();
 document.addEventListener('change',e=>{
   const t=e.target;
   if(t&&t.classList){
     if(t.classList.contains('modeSelect'))setTimeout(()=>{if(t.value==='production')ensure(t.dataset.cat,Number(t.dataset.i));},20);
     if(t.classList.contains('formatSelect'))setTimeout(()=>ensure(t.dataset.cat,Number(t.dataset.i)),20);
   }
 },true);
 document.addEventListener('input',e=>{
   const t=e.target;
   if(t&&t.classList&&t.classList.contains('batchSizeInput'))setTimeout(()=>ensure(t.dataset.cat,Number(t.dataset.i)),0);
 },true);
 let tries=0;const timer=setInterval(()=>{scan();if(++tries>=60)clearInterval(timer)},250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
