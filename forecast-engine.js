/* BOBS Business Forecast & Scenario Engine v1.3 — pure planning calculations, no writes */
(function(global){'use strict';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0},pct=v=>n(v)/100,safe=v=>Math.max(0,n(v));
function forecast(i){
 const s=safe(i.baseDailySales),c=safe(i.baseDailyCogs),st=safe(i.baseDailyStaffCost),f=safe(i.baseDailyFixedExpense),v=safe(i.baseDailyVariableExpense),d=safe(i.baseDailyDepreciation),fin=safe(i.baseDailyFinanceCost);
 const vol=Math.max(0,1+pct(i.salesVolumeChangePct)),price=Math.max(0,1+pct(i.salesPriceChangePct));
 const cogs=c*Math.max(0,1+pct(i.cogsChangePct)),staff=st*Math.max(0,1+pct(i.staffCostChangePct)),fixed=f*Math.max(0,1+pct(i.fixedExpenseChangePct)),variable=v*vol*Math.max(0,1+pct(i.variableExpenseChangePct));
 const dep=d*Math.max(0,1+pct(i.depreciationChangePct)),finance=fin*Math.max(0,1+pct(i.financeCostChangePct));
 const eventPct=Math.max(0,1+pct(i.eventSalesUpliftPct));
 const sales=s*vol*price*eventPct+safe(i.eventExtraDailyRevenue)+safe(i.bulkRevenueDaily);
 const cogsValue=c*vol*eventPct*Math.max(0,1+pct(i.cogsChangePct));
 const bulkExtra=safe(i.bulkExtraDailyCost);
 const gp=sales-cogsValue,grossMargin=sales?gp/sales:0,contribution=sales-cogsValue-variable-bulkExtra,cr=sales?contribution/sales:0;
 const pbdit=gp-staff-fixed-variable-bulkExtra,pbit=pbdit-dep,pbt=pbit-finance,tax=Math.max(0,pbt*pct(i.taxRate)),net=pbt-tax;
 const be=cr>0?(staff+fixed+dep+finance)/cr:Infinity;
 const target=n(i.targetPbdit),den=1-(s?(c/s):0)-(s?(v/s):0),req=den>0?(staff+fixed+target+bulkExtra)/den:Infinity;
 return{sales,cogs:cogsValue,grossProfit:gp,grossMargin,staff,fixed,variable,bulkExtraCost:bulkExtra,depreciation:dep,finance,pbdit,pbit,pbt,tax,netProfit:net,contribution,contributionRatio:cr,breakEvenRevenue:be,breakEvenGap:safe(be-sales),requiredSalesForPBDIT:req,requiredAdditionalSalesForPBDIT:safe(req-sales)};
}
function period(r,days){const d=safe(days);return{days:d,sales:r.sales*d,cogs:r.cogs*d,grossProfit:r.grossProfit*d,staff:r.staff*d,fixed:r.fixed*d,variable:r.variable*d,bulkExtraCost:r.bulkExtraCost*d,depreciation:r.depreciation*d,finance:r.finance*d,pbdit:r.pbdit*d,pbit:r.pbit*d,pbt:r.pbt*d,tax:r.tax*d,netProfit:r.netProfit*d}}
function sensitivity(i,steps){const changes=steps||[-20,-10,10,15,20,30],base=forecast(i),keys=[['Sales volume','salesVolumeChangePct'],['Sales price','salesPriceChangePct'],['COGS / raw material','cogsChangePct'],['Staff cost','staffCostChangePct'],['Fixed expense','fixedExpenseChangePct'],['Variable expense','variableExpenseChangePct']],rows=[];keys.forEach(k=>changes.forEach(ch=>{const x={...i};x[k[1]]=ch;const r=forecast(x);const extra=Math.max(0,(base.pbdit-r.pbdit)/Math.max(.000001,r.contributionRatio));rows.push({label:k[0],changePct:ch,result:r,extraDailySales:extra})}));return{base,rows}}
function eventScenario(i,e){return forecast({...i,eventSalesUpliftPct:n(e?.salesUpliftPct),eventExtraDailyRevenue:safe(e?.extraDailyRevenue)})}
function bulkScenario(i,o){const q=safe(o?.quantity),price=safe(o?.pricePerUnit),revenue=safe(o?.revenue)||q*price,extra=safe(o?.extraMaterialCost)+safe(o?.extraLabourCost)+safe(o?.extraDeliveryCost);const days=Math.max(1,n(o?.days||i.periodDays||1));const r=forecast({...i,bulkRevenueDaily:revenue/days,bulkExtraDailyCost:extra/days});return{...r,bulkOrder:{quantity:q,revenue,extraCost:extra,incrementalContribution:revenue-extra,netIncrement:r.netProfit}}}
function capacity(o){const q=safe(o?.quantity),limits=[o?.productionCapacity,o?.staffCapacity,o?.equipmentCapacity,o?.rawMaterialCapacity].map(n).filter(x=>x>0),max=limits.length?Math.min(...limits):null;return{quantity:q,productionCapacity:n(o?.productionCapacity),staffCapacity:n(o?.staffCapacity),equipmentCapacity:n(o?.equipmentCapacity),rawMaterialCapacity:n(o?.rawMaterialCapacity),maximumFeasibleQuantity:max,feasible:max===null||q<=max,shortfall:max===null?0:Math.max(0,q-max)}}
global.BOBSForecastEngine={version:'1.3',forecast,period,sensitivity,eventScenario,bulkScenario,capacity};
})(window);
