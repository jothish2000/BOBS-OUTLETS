/* BOBS Business Forecast & Scenario Engine — v1.0
 * Pure calculation layer. No Google writes. No accounting-entry logic.
 */
(function(global){
  'use strict';
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
  const pct=v=>n(v)/100;
  const round=(v,d=2)=>{const p=Math.pow(10,d);return Math.round((n(v)+Number.EPSILON)*p)/p};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function forecast(input){
    const sales=n(input.baseDailySales);
    const cogs=n(input.baseDailyCogs);
    const gp=Math.max(0,sales-cogs);
    const gpMargin=sales>0?gp/sales:0;
    const staff=n(input.baseDailyStaffCost);
    const fixed=n(input.baseDailyFixedExpense);
    const variable=n(input.baseDailyVariableExpense);
    const depreciation=n(input.baseDailyDepreciation);
    const finance=n(input.baseDailyFinanceCost);
    const taxRate=clamp(pct(input.taxRate),0,1);
    const volumeFactor=1+pct(input.salesVolumeChangePct);
    const priceFactor=1+pct(input.salesPriceChangePct);
    const cogsFactor=1+pct(input.cogsChangePct);
    const staffFactor=1+pct(input.staffCostChangePct);
    const fixedFactor=1+pct(input.fixedExpenseChangePct);
    const variableFactor=1+pct(input.variableExpenseChangePct);
    const depFactor=1+pct(input.depreciationChangePct);
    const financeFactor=1+pct(input.financeCostChangePct);
    const eventRevenue=n(input.eventRevenue);
    const bulkRevenue=n(input.bulkRevenue);
    const additionalRevenue=eventRevenue+bulkRevenue;
    const forecastSales=sales*volumeFactor*priceFactor+additionalRevenue;
    const forecastCogs=cogs*volumeFactor*cogsFactor;
    const forecastGp=forecastSales-forecastCogs;
    const forecastStaff=staff*staffFactor;
    const forecastFixed=fixed*fixedFactor;
    const forecastVariable=variable*volumeFactor*variableFactor;
    const forecastDep=depreciation*depFactor;
    const forecastFinance=finance*financeFactor;
    const pbd=forecastGp-forecastStaff-forecastFixed-forecastVariable;
    const ebit= pbd-forecastDep;
    const pbt= ebit-forecastFinance;
    const tax=Math.max(0,pbt*taxRate);
    const net=pbt-tax;
    const margin=forecastSales>0?forecastGp/forecastSales:0;
    const fixedBurden=forecastStaff+forecastFixed+forecastDep+forecastFinance;
    const contribution=forecastSales-forecastCogs-forecastVariable;
    const contributionRatio=forecastSales>0?contribution/forecastSales:0;
    const breakEvenRevenue=contributionRatio>0?fixedBurden/contributionRatio:Infinity;
    const gap=Math.max(0,breakEvenRevenue-forecastSales);
    const requiredSalesForPbd=forecastCogs+forecastVariable+forecastStaff+forecastFixed;
    const requiredSalesForEbit=requiredSalesForPbd+forecastDep;
    return {sales:forecastSales,cogs:forecastCogs,grossProfit:forecastGp,grossMargin:margin,staff:forecastStaff,fixed:forecastFixed,variable:forecastVariable,depreciation:forecastDep,finance:forecastFinance,pbdit:pbd,pbit:ebit,pbt, tax, netProfit:net,contribution,contributionRatio,breakEvenRevenue,breakEvenGap:gap,requiredSalesForPBDIT:requiredSalesForPbd,requiredSalesForEBIT:requiredSalesForEbit,baseGrossMargin:gpMargin};
  }

  function periods(daily,days){const d=n(days);return {daily,period:daily*d,days:d};}
  function requiredExtraSalesForCostIncrease(input,costKey,changePct){
    const base=forecast({...input,salesVolumeChangePct:0,salesPriceChangePct:0,cogsChangePct:0,staffCostChangePct:0,fixedExpenseChangePct:0,variableExpenseChangePct:0,depreciationChangePct:0,financeCostChangePct:0});
    const stressed=forecast({...input,[costKey]:changePct});
    const target=base.pbdit;
    const ratio=Math.max(0.000001,1-stressed.cogs/stressed.sales-stressed.variable/stressed.sales);
    const extra=Math.max(0,(target+stressed.staff+stressed.fixed+stressed.cogs+stressed.variable)-stressed.sales*ratio);
    return {base,stressed,extraDailySales:Math.max(0,extra)};
  }
  function sensitivity(input,steps){
    const changes=Array.isArray(steps)&&steps.length?steps:[-20,-10,10,15,20,30];
    const keys=[['Sales volume','salesVolumeChangePct'],['Sales price','salesPriceChangePct'],['COGS / raw material','cogsChangePct'],['Staff cost','staffCostChangePct'],['Fixed expense','fixedExpenseChangePct'],['Variable expense','variableExpenseChangePct']];
    const base=forecast(input);
    const rows=[];
    keys.forEach(([label,key])=>changes.forEach(ch=>{const r=forecast({...input,[key]:ch});const extra=Math.max(0,base.pbdit-r.pbdit)/Math.max(0.000001,r.contributionRatio);rows.push({label,key,changePct:ch,...r,requiredAdditionalDailySales:extra,requiredAdditionalMonthlySales:extra*n(input.periodDays||30)});}));
    return {base,rows};
  }
  function eventScenario(input,event){
    const e=event||{};
    const days=Math.max(1,n(e.days||input.periodDays||1));
    const uplift=pct(e.salesUpliftPct);
    const normalDaily=n(input.baseDailySales);
    const eventDaily=normalDaily*(1+uplift)+n(e.extraDailyRevenue);
    return forecast({...input,baseDailySales:normalDaily,salesVolumeChangePct:uplift*100,eventRevenue:n(e.extraDailyRevenue)*days});
  }
  function bulkScenario(input,order){
    const q=n(order.quantity), price=n(order.pricePerUnit), revenue=n(order.revenue)||q*price;
    const extraMaterial=n(order.extraMaterialCost),extraLabour=n(order.extraLabourCost),extraDelivery=n(order.extraDeliveryCost);
    const extraCost=extraMaterial+extraLabour+extraDelivery;
    const r=forecast({...input,bulkRevenue:revenue});
    r.bulkOrder={quantity:q,revenue,extraMaterialCost:extraMaterial,extraLabourCost:extraLabour,extraDeliveryCost:extraDelivery,extraCost,bulkGrossContribution:revenue-extraMaterial,bulkNetIncrement:revenue-extraCost};
    return r;
  }
  function capacity(order){
    const q=n(order.quantity), production=n(order.productionCapacity), staff=n(order.staffCapacity), equipment=n(order.equipmentCapacity), raw=n(order.rawMaterialCapacity);
    const limits=[production,staff,equipment,raw].filter(x=>x>0);const limiting=limits.length?Math.min(...limits):Infinity;
    return {quantity:q,productionCapacity:production,staffCapacity:staff,equipmentCapacity:equipment,rawMaterialCapacity:raw,feasible:q<=limiting,maximumFeasibleQuantity:limiting===Infinity?null:limiting,shortfall:limiting===Infinity?0:Math.max(0,q-limiting)};
  }
  global.BOBSForecastEngine={version:'1.0',forecast,periods,sensitivity,eventScenario,bulkScenario,capacity,requiredExtraSalesForCostIncrease};
})(window);
