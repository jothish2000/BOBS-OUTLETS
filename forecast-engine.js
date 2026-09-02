/* BOBS Business Forecast & Scenario Engine — v1.1
 * Pure calculation layer. No Google writes. No accounting-entry logic.
 */
(function(global){'use strict';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0},pct=v=>n(v)/100,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function forecast(input){
 const sales=n(input.baseDailySales),cogs=n(input.baseDailyCogs),gp=sales-cogs,gpMargin=sales>0?gp/sales:0;
 const staff=n(input.baseDailyStaffCost),fixed=n(input.baseDailyFixedExpense),variable=n(input.baseDailyVariableExpense),depreciation=n(input.baseDailyDepreciation),finance=n(input.baseDailyFinanceCost);
 const taxRate=clamp(pct(input.taxRate),0,1),vf=Math.max(0,1+pct(input.salesVolumeChangePct)),pf=Math.max(0,1+pct(input.salesPriceChangePct));
 const cf=Math.max(0,1+pct(input.cogsChangePct)),sf=Math.max(0,1+pct(input.staffCostChangePct)),ff=Math.max(0,1+pct(input.fixedExpenseChangePct)),vfExp=Math.max(0,1+pct(input.variableExpenseChangePct));
 const df=Math.max(0,1+pct(input.depreciationChangePct)),finf=Math.max(0,1+pct(input.financeCostChangePct));
 const eventDaily=n(input.eventExtraDailyRevenue),bulkDaily=n(input.bulkRevenueDaily||input.bulkRevenue);
 const forecastSales=sales*vf*pf+eventDaily+bulkDaily;
 const forecastCogs=cogs*vf*cf;
 const forecastGp=forecastSales-forecastCogs;
 const forecastStaff=staff*sf,forecastFixed=fixed*ff,forecastVariable=variable*vf*vfExp,forecastDep=depreciation*df,forecastFinance=finance*finf;
 const pbdit=forecastGp-forecastStaff-forecastFixed-forecastVariable, pbit=pbdit-forecastDep,pbt=pbit-forecastFinance,tax=Math.max(0,pbt*taxRate),netProfit=pbt-tax;
 const grossMargin=forecastSales>0?forecastGp/forecastSales:0,contribution=forecastSales-forecastCogs-forecastVariable,contributionRatio=forecastSales>0?contribution/forecastSales:0;
 const fixedBurden=forecastStaff+forecastFixed+forecastDep+forecastFinance,breakEvenRevenue=contributionRatio>0?fixedBurden/contributionRatio:Infinity;
 return {sales:forecastSales,cogs:forecastCogs,grossProfit:forecastGp,grossMargin,staff:forecastStaff,fixed:forecastFixed,variable:forecastVariable,depreciation:forecastDep,finance:forecastFinance,pbdit,pbit,pbt,tax,netProfit,contribution,contributionRatio,breakEvenRevenue,breakEvenGap:Math.max(0,breakEvenRevenue-forecastSales),requiredSalesForPBDIT:forecastCogs+forecastVariable+forecastStaff+forecastFixed,requiredSalesForEBIT:forecastCogs+forecastVariable+forecastStaff+forecastFixed+forecastDep,baseGrossMargin:gpMargin};
}
function periods(daily,days){const d=n(days);return {daily,period:daily*d,days:d};}
function requiredExtraSalesForCostIncrease(input,costKey,changePct){
 const base=forecast({...input,salesVolumeChangePct:0,salesPriceChangePct:0,cogsChangePct:0,staffCostChangePct:0,fixedExpenseChangePct:0,variableExpenseChangePct:0,depreciationChangePct:0,financeCostChangePct:0});
 const stressed=forecast({...input,[costKey]:changePct});
 const ratio=Math.max(0.000001,stressed.contributionRatio);const extra=Math.max(0,(base.pbdit-stressed.pbdit)/ratio);
 return {base,stressed,extraDailySales:extra};
}
function sensitivity(input,steps){
 const changes=Array.isArray(steps)&&steps.length?steps:[-20,-10,10,15,20,30],keys=[['Sales volume','salesVolumeChangePct'],['Sales price','salesPriceChangePct'],['COGS / raw material','cogsChangePct'],['Staff cost','staffCostChangePct'],['Fixed expense','fixedExpenseChangePct'],['Variable expense','variableExpenseChangePct']],base=forecast(input),rows=[];
 keys.forEach(([label,key])=>changes.forEach(ch=>{const r=forecast({...input,[key]:ch}),extra=Math.max(0,(base.pbdit-r.pbdit)/Math.max(0.000001,r.contributionRatio));rows.push({label,key,changePct:ch,...r,requiredAdditionalDailySales:extra,requiredAdditionalMonthlySales:extra*n(input.periodDays||30)});}));return {base,rows};
}
function eventScenario(input,event){const e=event||{},uplift=pct(e.salesUpliftPct);return forecast({...input,salesVolumeChangePct:uplift*100,eventExtraDailyRevenue:n(e.extraDailyRevenue)});}
function bulkScenario(input,order){const o=order||{},q=n(o.quantity),price=n(o.pricePerUnit),revenue=n(o.revenue)||q*price,extraMaterial=n(o.extraMaterialCost),extraLabour=n(o.extraLabourCost),extraDelivery=n(o.extraDeliveryCost),extraCost=extraMaterial+extraLabour+extraDelivery,r=forecast({...input,bulkRevenueDaily:revenue/Math.max(1,n(input.periodDays||1))});r.bulkOrder={quantity:q,revenue,extraMaterialCost:extraMaterial,extraLabourCost:extraLabour,extraDeliveryCost:extraDelivery,extraCost,bulkGrossContribution:revenue-extraMaterial,bulkNetIncrement:revenue-extraCost};return r;}
function capacity(order){const o=order||{},q=n(o.quantity),limits=[n(o.productionCapacity),n(o.staffCapacity),n(o.equipmentCapacity),n(o.rawMaterialCapacity)].filter(x=>x>0),lim=limits.length?Math.min(...limits):Infinity;return {quantity:q,productionCapacity:n(o.productionCapacity),staffCapacity:n(o.staffCapacity),equipmentCapacity:n(o.equipmentCapacity),rawMaterialCapacity:n(o.rawMaterialCapacity),feasible:q<=lim,maximumFeasibleQuantity:lim===Infinity?null:lim,shortfall:lim===Infinity?0:Math.max(0,q-lim)};}
global.BOBSForecastEngine={version:'1.1',forecast,periods,sensitivity,eventScenario,bulkScenario,capacity,requiredExtraSalesForCostIncrease};
})(window);
