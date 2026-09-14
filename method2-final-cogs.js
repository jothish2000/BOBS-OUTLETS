/* BOBS Method 2 — final COGS/revenue synchronizer. Keeps the top totals aligned with the pricing card. */
(function(){
'use strict';
const KEY='method2-item-state';
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function norm(s){return String(s||'').toLowerCase().replace(/idly/g,'idli').replace(/[^a-z0-9]+/g,' ').trim()}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function unitCost(r){if(!r)return 0;for(const k of ['unitCost','costPerUnit','perUnitCost','productionCost']){const v=num(r[k]);if(v>0)return v}const b=num(r.batchCost||r.totalCost)||((r.ingredients||[]).reduce((total,x)=>total+num(x&&x[1])*num(x&&x[3]),0)),y=num(r.standardYield||r.yieldQty||r.yield);return b>0&&y>0?b/y:0}
function recipe(name){const a=window.BOBS_METHOD2_RM_RECIPES||[],n=norm(name);return a.find(r=>norm(r.name)===n)||a.find(r=>norm(r.name).includes(n)||n.includes(norm(r.name)))||null}
function condiment(cat,i){const s=state(),a=s.condiments&&Array.isArray(s.condiments[String(cat)+'::'+i])?s.condiments[String(cat)+'::'+i]:[];return a.reduce((z,x)=>z+unitCost(recipe(x.recipeName||x.name))*num(x.qty),0)}
function parcel(cat,i){if(typeof window.BOBS_METHOD2_PACKAGING_COST==='function')return num(window.BOBS_METHOD2_PACKAGING_COST(cat,i));const a=state().packaging&&state().packaging[String(cat)+'::'+i]||[];return a.reduce((z,x)=>z+num(x.qty)*num(x.unitCost),0)}
function spoil(cat,i){const e=document.querySelector('.spoilInput[data-cat="'+CSS.escape(cat)+'"][data-i="'+i+'"]');return e?num(e.value):0}
function price(cat,i,item){const s=state(),o=s.pricing&&s.pricing[String(cat)+'::'+i]||{};return o.currentPrice==null||o.currentPrice===''?num(item.price):num(o.currentPrice)}
function recalcFinal(){if(!window.ITEM_DATA||!window.CAT_ORDER)return;let sale=0,cost=0;CAT_ORDER.forEach(cat=>{(ITEM_DATA[cat]||[]).forEach((item,i)=>{const inp=document.querySelector('.qtyInput[data-cat="'+CSS.escape(cat)+'"][data-i="'+i+'"]');if(!inp)return;const q=num(inp.value);if(q<=0)return;const unitSale=price(cat,i,item);sale+=unitSale*(inp.dataset.unit==='g'?q/1000:q);const sel=document.querySelector('.modeSelect[data-cat="'+CSS.escape(cat)+'"][data-i="'+i+'"]');if(sel&&sel.value==='production'){const food=(unitCost(recipe(item.name))+condiment(cat,i))*(1+spoil(cat,i)/100);cost+=(food+parcel(cat,i))*q}else cost+=num(item.purchasedCost)*q});});window.currentTotal=sale;const a=document.getElementById('grandTotalSale'),b=document.getElementById('grandTotalCost'),c=document.getElementById('grandTotalProfit');if(a)a.textContent='₹'+Math.round(sale).toLocaleString('en-IN');if(b)b.textContent='₹'+Math.round(cost).toLocaleString('en-IN');if(c)c.textContent='₹'+Math.round(sale-cost).toLocaleString('en-IN')}
window.BOBS_METHOD2_FINAL_RECALC=recalcFinal;
function boot(){document.addEventListener('input',()=>setTimeout(recalcFinal,0),true);document.addEventListener('change',()=>setTimeout(recalcFinal,0),true);document.addEventListener('bobs-method2-condiment-change',()=>setTimeout(recalcFinal,20));document.addEventListener('bobs-method2-packaging-change',()=>setTimeout(recalcFinal,20));document.addEventListener('bobs-method2-rm-ready',()=>setTimeout(recalcFinal,20));setTimeout(recalcFinal,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
