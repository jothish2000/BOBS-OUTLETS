/* BOBS Method 2 — compact commercial breakdown layout.
   Places the useful COGS/pricing information into the blank right-hand area
   of each production/purchase panel and makes Food Spoilage explicitly editable.
   Safe/additive: Method 1 untouched; no polling or recursive observers. */
(function(){
'use strict';
function money(v){const n=Number(String(v||'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?'₹'+n.toFixed(2):'—'}
function text(el){return el?String(el.textContent||'').trim():''}
function panelRows(){return Array.from(document.querySelectorAll('.batchPanel'))}
function findBreak(panel){return panel.querySelector('.m2-commercial .m2-break')}
function valueFromMini(mini){return text(mini&&mini.querySelector('b'))}
function removeLegacyText(panel){
  panel.querySelectorAll('.m2-cogs-break,.m2-inline-cogs,.m2-price-grid,.m2-risk-panel').forEach(x=>x.remove());
  panel.querySelectorAll('*').forEach(el=>{
    if(el.dataset.m2LayoutLegacy==='1')return;
    const t=text(el).toLowerCase();
    if(!t||el.children.length>0)return;
    if(/^(idli|item) cost$/.test(t)||/^condiment\s*\d+\s*cost/.test(t)||/^raw combine cogs$/.test(t)){
      el.dataset.m2LayoutLegacy='1';el.style.display='none';
    }
  });
}
function spoilageEdit(panel){
  const input=panel.querySelector('.spoilInput');
  if(!input)return;
  const row=input.closest('.batchRow,label,.spoilageRow')||input.parentElement;
  if(row){
    row.classList.add('m2-spoilage-edit-row');
    const label=row.querySelector('span,label');
    if(label)label.innerHTML='<b>Food Spoilage %</b> <small>(editable)</small>';
  }
  input.title='Applied Food Spoilage % — editable';
  input.style.display='inline-block';
  input.style.width='64px';
  input.style.boxSizing='border-box';
}
function build(panel){
  const box=panel.querySelector('.m2-commercial');
  if(!box)return;
  const br=findBreak(panel);
  if(!br)return;
  const minis=Array.from(br.querySelectorAll('.m2-mini'));
  const item=valueFromMini(minis[0]);
  const condiment=valueFromMini(minis[1]);
  const spoilage=valueFromMini(minis[2]);
  const packing=valueFromMini(minis[3]);
  const overall=valueFromMini(minis[4]);
  const uuwp=valueFromMini(minis[5]);
  const raw=(Number(String(item).replace(/[^0-9.-]/g,''))||0)+(Number(String(condiment).replace(/[^0-9.-]/g,''))||0);
  const spoilAmt=Number(String(spoilage).replace(/[^0-9.-]/g,''))||0;
  const food=raw+spoilAmt;
  const flow=box.querySelector('.m2-flow');
  const grid=box.querySelector('.m2-commercial-grid');
  const ubox=box.querySelector('.m2-uuwp-box');
  const account=box.querySelector('.m2-account');
  const foot=box.querySelector('.m2-commercial-foot');
  [flow,grid,ubox,br,account,foot].forEach(x=>{if(x)x.style.display='none'});
  let right=panel.querySelector('.m2-right-breakdown');
  if(!right){right=document.createElement('div');right.className='m2-right-breakdown';panel.appendChild(right)}
  const markup=box.querySelector('.m2-markup');
  const current=box.querySelector('.m2-current');
  const pref=box.querySelector('.m2-commercial-grid .m2-commercial-value');
  const industry=box.querySelector('.m2-commercial-ref');
  const uuwpInput=box.querySelector('.m2-uuwp-input');
  const prefText=box.querySelector('.m2-flow .m2-node:nth-of-type(3) b');
  const markupVal=markup?markup.value:'—';
  const currentVal=current?current.value:'—';
  const industryVal=text(industry);
  const preferredVal=prefText?text(prefText):'—';
  const uuwpPct=uuwpInput?uuwpInput.value:'5';
  right.innerHTML='<div class="m2-right-title">LIVE COGS BREAKDOWN</div>'+
    '<div class="m2-right-line"><span>Item / Recipe Master COGS</span><b>'+item+'</b></div>'+
    '<div class="m2-right-line"><span>Condiment COGS</span><b>'+condiment+'</b></div>'+
    '<div class="m2-right-line"><span>Raw Combined COGS</span><b>'+money(raw)+'</b></div>'+
    '<div class="m2-right-line"><span>Food Spoilage</span><b>'+spoilage+'</b></div>'+
    '<div class="m2-right-line"><span>Food COGS After Spoilage</span><b>'+money(food)+'</b></div>'+
    '<div class="m2-right-line"><span>Packing &amp; Other COGS</span><b>'+packing+'</b></div>'+
    '<div class="m2-right-line m2-right-final"><span>OVERALL / FINAL COGS</span><b>'+overall+'</b></div>'+
    '<div class="m2-right-line"><span>UUWP % — editable</span><b>'+uuwpPct+'%</b></div>'+
    '<div class="m2-right-line m2-right-final"><span>COGS WITH UUWP</span><b>'+uuwp+'</b></div>'+
    '<div class="m2-right-sep"></div>'+
    '<div class="m2-right-line"><span>MARKUP % — editable</span><b>'+markupVal+'%</b></div>'+
    '<div class="m2-right-line"><span>Selling Price Based on Markup</span><b>'+preferredVal+'</b></div>'+
    '<div class="m2-right-line"><span>Industry Standard Selling Price</span><b>'+industryVal+'</b></div>'+
    '<div class="m2-right-line m2-right-price"><span>Current Selling Price — editable</span><b>'+money(currentVal)+'</b></div>';
  if(panel.querySelector('.formatSelect')?.value==='batch'){
    const today=panel.querySelector('.m2-today-production-value');
    const sold=panel.querySelector('.qtyInput');
    let acct=panel.querySelector('.m2-right-production');
    if(!acct){acct=document.createElement('div');acct.className='m2-right-production';right.appendChild(acct)}
    const batch=panel.querySelector('.numBatchesInput');
    const units=panel.querySelector('.batchSizeInput');
    const max=panel.querySelector('.maxBatchesPerDayInput');
    const cap=panel.querySelector('.productionCapacityInput');
    acct.innerHTML='<div class="m2-right-sep"></div><div class="m2-right-title">PRODUCTION ACCOUNTING</div>'+
      '<div class="m2-right-line"><span>Units per batch</span><b>'+text(units&&units.closest('.batchRow')?.querySelector('input'))+'</b></div>'+
      '<div class="m2-right-line"><span>Batches ran today</span><b>'+text(batch)+'</b></div>'+
      '<div class="m2-right-line"><span>Today\'s production</span><b>'+text(today)+'</b></div>'+
      '<div class="m2-right-line"><span>Maximum batches / day</span><b>'+text(max)+'</b></div>'+
      '<div class="m2-right-line"><span>Production capacity / day</span><b>'+text(cap)+'</b></div>';
  }
  spoilageEdit(panel);
}
function css(){
 if(document.getElementById('m2CommercialLayoutStyle'))return;
 const s=document.createElement('style');s.id='m2CommercialLayoutStyle';
 s.textContent='.batchPanel{position:relative!important}.m2-commercial{position:static!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;min-height:0!important}.m2-right-breakdown{position:absolute;top:104px;right:10px;width:50%;box-sizing:border-box;padding:8px 10px;background:rgba(255,255,255,.72);border:1px solid #c9c3b4;border-radius:7px;font-size:10px;z-index:5}.m2-right-title{font-size:10px;font-weight:900;margin-bottom:5px}.m2-right-line{display:flex;justify-content:space-between;gap:10px;line-height:1.25;padding:2px 0}.m2-right-line span{color:#444}.m2-right-line b{color:#111;font-weight:900;text-align:right;white-space:nowrap}.m2-right-final{font-weight:900;border-top:1px solid #ddd;margin-top:2px;padding-top:4px}.m2-right-price{border-top:1px solid #ddd;margin-top:3px;padding-top:4px}.m2-right-sep{border-top:1px dashed #c9c3b4;margin:5px 0}.m2-right-production{margin-top:2px}.m2-spoilage-edit-row input{font-weight:900}.m2-commercial-title{display:none!important}@media(max-width:850px){.m2-right-breakdown{position:static;width:100%;margin-top:8px}.batchPanel{padding-bottom:8px!important}}';
 document.head.appendChild(s);
}
function run(){css();panelRows().forEach(p=>{removeLegacyText(p);build(p)})}
function boot(){setTimeout(run,150);setTimeout(run,700);setTimeout(run,1500);document.addEventListener('input',e=>{if(e.target.matches&&e.target.matches('.spoilInput,.m2-markup,.m2-current,.m2-uuwp-input,.batchSizeInput,.numBatchesInput,.maxBatchesPerDayInput'))setTimeout(run,40)},true);document.addEventListener('change',e=>{if(e.target.matches&&e.target.matches('.modeSelect,.formatSelect,.spoilInput,.m2-markup,.m2-current,.m2-uuwp-input,.batchSizeInput,.numBatchesInput,.maxBatchesPerDayInput,.productionCapacityInput'))setTimeout(run,60)},true);document.addEventListener('bobs-method2-condiment-change',()=>setTimeout(run,60));document.addEventListener('bobs-method2-packaging-change',()=>setTimeout(run,60))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
