/* BOBS METHOD 2 — permanent Google Sheets sync bridge
 * Adds normalized rows to the existing Google-first moduleSave request.
 * localStorage remains only a transient UI/state bridge; Google Sheets is the
 * permanent recovery store. Method 1 is untouched.
 */
(function(){
'use strict';
if(window.__BOBS_M2_PERMANENT_SYNC)return;
window.__BOBS_M2_PERMANENT_SYNC=true;
const KEY='method2-item-state';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const esc=v=>CSS.escape(String(v));
const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
const k=(cat,i)=>String(cat)+'::'+String(i);
function item(cat,i){return window.ITEM_DATA&&window.ITEM_DATA[cat]&&window.ITEM_DATA[cat][i]}
function panel(cat,i){return document.getElementById('batch-'+String(cat).replace(/\s+/g,'_')+'-'+i)}
function input(p,cls){return p&&p.querySelector('.'+cls)}
function val(p,cls){const e=input(p,cls);return e&&e.value!==''?n(e.value):''}
function lineValue(p,label){const lines=p?Array.from(p.querySelectorAll('.m2-right-line')):[];const target=String(label).toLowerCase();for(const line of lines){const s=line.querySelector('span'),b=line.querySelector('b');if(s&&b&&String(s.textContent||'').trim().toLowerCase()===target)return String(b.textContent||'').replace(/[₹,%]/g,'').trim()}return ''}
function rowFor(cat,i){
 const it=item(cat,i);if(!it||!it.eligible)return null;const p=panel(cat,i),s=state(),key=k(cat,i),c=s.commercial&&s.commercial[key]||{},pr=s.pricing&&s.pricing[key]||{};const sel=document.querySelector('.modeSelect[data-cat="'+esc(cat)+'"][data-i="'+i+'"]');const mode=sel&&sel.value==='production'?'production':'purchased';
 const fmt=input(p,'formatSelect');const units=val(p,'batchSizeInput');const batches=val(p,'numBatchesInput');const max=val(p,'maxBatchesPerDayInput');const cap=val(p,'productionCapacityInput')||val(p,'capacityInput');const today=units!==''&&batches!==''?Math.round(units*batches*1000)/1000:'';const soldEl=document.querySelector('.qtyInput[data-cat="'+esc(cat)+'"][data-i="'+i+'"]');const sold=soldEl&&String(soldEl.value||'').trim()!==''?n(soldEl.value):'';const unsold=mode==='production'&&sold!==''&&today!==''?Math.max(0,today-sold):'';
 const itemC=lineValue(p,mode==='production'?'Item / Recipe Master COGS':'Purchase Item COGS');
 const cond=lineValue(p,'Condiment COGS');const raw=lineValue(p,'Raw Combined COGS');const spoilAmt=lineValue(p,'Food Spoilage');const food=lineValue(p,'Food COGS After Spoilage');const pack=lineValue(p,'Packing & Other COGS');const overall=lineValue(p,'Overall / Final COGS');const uuwp=lineValue(p,'COGS With UUWP');
 const spoilEl=input(p,'spoilInput');
 const markup=input(p,'m2-markup'),current=input(p,'m2-current'),industry=p&&p.querySelector('.m2-commercial-ref');const pref=p&&p.querySelector('.m2-flow .m2-node:nth-of-type(3) b');const uuwpIn=input(p,'m2-uuwp-input');
 return{itemKey:key,category:cat,itemIndex:i,itemName:it.name||'',mode:mode,productionFormat:fmt?fmt.value:'',unitsPerBatch:units,batchesRanToday:batches,todaysProduction:today,maxBatchesPerDay:max,productionCapacityPerDay:cap,soldToday:sold,unsoldQty:unsold,purchaseUnit:c.purchaseUnit||'',packQuantity:c.packQty==null?'':c.packQty,purchasePrice:c.purchasePrice==null?'':c.purchasePrice,minimumOrderQuantity:c.minOrderQty==null?'':c.minOrderQty,costingBaseUnit:c.costingBaseUnit||'',salesUnit:c.salesUnit||'',salesConversionFactor:c.salesConversion==null?'':c.salesConversion,shelfLifeDays:c.shelfLifeDays==null?'':c.shelfLifeDays,shelfLifeCondition:c.shelfLifeCondition||'',carryForwardAllowed:c.carryForwardAllowed==null?'':c.carryForwardAllowed,purchaseItemCogs:mode==='purchased'?itemC:'',recipeMasterCogs:mode==='production'?itemC:'',condimentCogs:cond,rawCombinedCogs:raw,foodSpoilagePct:spoilEl?spoilEl.value:'',foodSpoilageAmount:spoilAmt,foodCogsAfterSpoilage:food,packingOtherCogs:pack,overallFinalCogs:overall,uuwpPct:uuwpIn?uuwpIn.value:'',uuwpApplied:mode==='purchased'?true:(String(lineValue(p,'COGS With UUWP')).trim()!==''&&!String(lineValue(p,'UUWP % — editable')).includes('NOT')),cogsWithUUWP:uuwp,markupPct:markup?markup.value:(pr.markupPct==null?'':pr.markupPct),priceFromMarkup:pref?String(pref.textContent||'').replace(/[₹,]/g,'').trim():'',industryStandardSellingPrice:industry?String(industry.textContent||'').replace(/[₹,]/g,'').trim():(pr.industryStandardPrice==null?'':pr.industryStandardPrice),currentSellingPrice:current?current.value:(pr.currentPrice==null?'':pr.currentPrice),totalProductionCost:lineValue(p,'Total Production Cost'),soldCogs:lineValue(p,'Sold COGS'),unsoldValue:lineValue(p,'Unsold Value'),condiments:Array.isArray(s.condiments&&s.condiments[key])?s.condiments[key].map(x=>({condimentName:x.condimentName||x.name||'',recipeName:x.recipeName||'',quantity:x.quantity==null?x.qty:x.quantity,unitCost:x.unitCost==null?'':x.unitCost})):[],packaging:Array.isArray(s.packaging&&s.packaging[key])?s.packaging[key].map(x=>({packingName:x.packingName||x.name||'',quantity:x.quantity==null?x.qty:x.quantity,unitCost:x.unitCost==null?'':x.unitCost})):[]};
}
function rows(){const out=[];if(!window.CAT_ORDER||!window.ITEM_DATA)return out;window.CAT_ORDER.forEach(cat=>(window.ITEM_DATA[cat]||[]).forEach((it,i)=>{const r=rowFor(cat,i);if(r)out.push(r)}));return out}
if(typeof window.fetch==='function'){
 const original=window.fetch;
 window.fetch=function(input,init){try{const body=init&&init.body;if(typeof body==='string'&&body.indexOf('"action":"moduleSave"')!==-1&&body.indexOf('"module":"METHOD2"')!==-1){const payload=JSON.parse(body);payload.method2Rows=rows();init=Object.assign({},init,{body:JSON.stringify(payload)})}}catch(e){}return original.call(this,input,init)};
}
})();
