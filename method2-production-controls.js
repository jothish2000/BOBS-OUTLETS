/* BOBS Method 2 — definitive production batch controls.
   Visible, editable batches/day + automatic production capacity.
   Safe/additive: uses the existing Method 2 fields/state; does not touch Method 1. */
(function(){
'use strict';
const esc=s=>CSS.escape(String(s));
const n=v=>{const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0};
const KEY='method2-item-state';
function panel(cat,i){return document.getElementById('batch-'+String(cat).replace(/\s+/g,'_')+'-'+i)}
function find(p,c){return p&&p.querySelector('.'+c)}
function save(){try{if(typeof window.saveState==='function')window.saveState();else{const raw=localStorage.getItem(KEY)||'{}';localStorage.setItem(KEY,raw)}}catch(e){}}
function refresh(cat,i){try{if(typeof window.updateBatchPanel==='function')window.updateBatchPanel(cat,i);if(typeof window.recalc==='function')window.recalc();}catch(e){}}
function ensure(cat,i){
 const p=panel(cat,i);if(!p)return;
 const fmt=p.querySelector('.formatSelect[data-cat="'+esc(cat)+'"][data-i="'+i+'"]');if(!fmt||fmt.value!=='batch')return;
 let units=find(p,'batchSizeInput');if(!units)return;
 let row=find(p,'m2-definitive-batch-count-row');
 let batches=find(p,'numBatchesInput');
 if(!row){
   row=document.createElement('div');row.className='batchRow m2-definitive-batch-count-row';
   row.innerHTML='<span><b>No. of batches per day</b></span><input class="numBatchesInput" data-cat="'+cat.replace(/"/g,'&quot;')+'" data-i="'+i+'" type="number" min="0" step="1" value="1">';
   const old=p.querySelector('#numBatchesRow-'+String(cat).replace(/\s+/g,'_')+'-'+i);
   if(old){old.replaceWith(row)}else p.insertBefore(row,p.querySelector('.m2-commercial')||null);
   batches=row.querySelector('.numBatchesInput');
 } else { batches=find(row,'numBatchesInput') }
 if(!batches)return;
 if(batches.value===''||Number(batches.value)<0)batches.value='1';
 const oldLabel=p.querySelector('#batchSizeRow-'+String(cat).replace(/\s+/g,'_')+'-'+i+' span');if(oldLabel)oldLabel.innerHTML='<b>Units per batch</b>';
 let cap=find(p,'capacityInput');
 const capRow=p.querySelector('#capacityRow-'+String(cat).replace(/\s+/g,'_')+'-'+i);
 if(!cap){
   if(capRow)cap=capRow.querySelector('input');
   if(cap){cap.className+=' m2-auto';}
 }
 if(!cap){
   const r=document.createElement('div');r.className='batchRow m2-definitive-capacity-row';r.innerHTML='<span>Production capacity / day <small>(AUTO)</small></span><input class="capacityInput m2-auto" data-cat="'+cat.replace(/"/g,'&quot;')+'" data-i="'+i+'" type="number" min="0" step="1" readonly>';p.insertBefore(r,p.querySelector('.m2-commercial')||null);cap=r.querySelector('.capacityInput');
 }
 cap.readOnly=true;cap.setAttribute('readonly','readonly');cap.title='Automatically calculated: Units per batch × No. of batches per day';
 if(capRow)capRow.querySelector('span').innerHTML='<b>Production capacity / day</b> <small>(AUTO)</small>';
 const calc=()=>{cap.value=String(Math.round(n(units.value)*n(batches.value)*1000)/1000);refresh(cat,i);save()};
 if(units.dataset.m2DefBound!=='1'){units.dataset.m2DefBound='1';units.addEventListener('input',calc)}
 if(batches.dataset.m2DefBound!=='1'){batches.dataset.m2DefBound='1';batches.addEventListener('input',calc)}
 calc();
}
function boot(){
 const run=()=>{if(window.CAT_ORDER&&Array.isArray(window.CAT_ORDER))window.CAT_ORDER.forEach(cat=>window.ITEM_DATA&&window.ITEM_DATA[cat]&&window.ITEM_DATA[cat].forEach((it,i)=>{if(it&&it.eligible)ensure(cat,i)}))};
 run();
 document.addEventListener('change',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('formatSelect'))setTimeout(()=>ensure(e.target.dataset.cat,Number(e.target.dataset.i)),0)},true);
 let tries=0;const timer=setInterval(()=>{run();if(++tries>=40)clearInterval(timer)},300);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
