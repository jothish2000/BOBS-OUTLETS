/* Additive Google kitchen records; ordinary outlet records retain their existing owners. */
(function(){'use strict';if(window.BOBS_KITCHENS)return;const K=BOBS_KITCHEN_CORE,F=BOBS_OUTLET_FLOW,P=BOBS_PRODUCTION_PLAN,V=BOBS_VERIFIED,C=BOBS_COST_FLOW;
const rawRead=M2.read.bind(M2),selected=F.selected.bind(F),requirements=F.requirements.bind(F),menuStamp=F.menuStamp.bind(F);
const S={isKitchen:K.isKitchen};
S.registry=()=>V.read('COMPANY','KITCHEN_MASTER');
S.locations=async()=>{const [outlets,record]=await Promise.all([BOBS_DATA.listOutlets(),S.registry()]);return {outlets,record,kitchens:record?.kitchens||[]}};
S.allDemands=async(master)=>{const [locations]=await Promise.all([S.locations()]);const rows=await Promise.all(locations.outlets.map(async o=>{const raw=await rawRead(o.id),items=F.selected(M2.state(raw),ITEM_DATA,M2);return {outlet:o,raw,items,demands:K.demands(o.id,items,master.recipes,P,F,M2,C.today())}}));return {...locations,rows,demands:rows.flatMap(r=>r.demands)}};
S.context=async id=>{
 const master=await BOBS_OPERATIONAL_RECIPES.load(),all=await S.allDemands(master),kitchen=all.kitchens.find(k=>k.id===id);if(!kitchen)throw Error('Saved kitchen identity not found. Review production locations.');
 const jobs=K.jobs(all.demands,kitchen,C.today(),F),items=K.virtualItems(jobs),recipes=jobs.map(j=>({...j.recipe,name:'Kitchen recipe '+j.key,kitchenOriginalName:j.name}));
 for(const item of items){item.item.recipeName='Kitchen recipe '+item.key;item.d.price=0;item.d.sold=item.d.batchSize;item.d.markup=0;item.d.pricingBasis='markup';item.d.packingMode='none';item.d.packingReason='Packing is budgeted at the selling outlet';item.d.uuwpPolicy='always';item.d.spoilage=0;}
 return {...all,kitchen,jobs,items,recipes,raw:{kitchenItems:items,kitchenSourceStamp:F.stamp({date:C.today(),kitchen,jobs}),kitchenRecipes:recipes},outlet:{...kitchen,name:kitchen.name+' · Production kitchen',id:kitchen.id,shiftTimes:kitchen.shiftTimes}};
};
S.readMenu=async id=>K.isKitchen(id)?(await S.context(id)).raw:rawRead(id);
// These adapters are read-only. Writes still pass through BOBS_VERIFIED and explicit page handlers.
M2.read=S.readMenu;
F.selected=(state,catalogue,m)=>state?.kitchenItems?V.clone(state.kitchenItems):selected(state,catalogue,m).map(x=>({...x,d:{...x.d,...(state.kitchenSources?{kitchenSources:V.clone(state.kitchenSources)}:{})}}));
F.requirements=(items,recipes,m)=>requirements(items,recipes,m).filter(r=>{const owner=items.find(x=>r.key===x.key||r.key.startsWith(x.key+':'));return !owner?.d.kitchenSources?.[r.key]?.kitchenId});
F.menuStamp=items=>{const extras=items.map(x=>({key:x.key,sources:Object.fromEntries(Object.entries(x.d.kitchenSources||{}).filter(([key])=>key===x.key||key.startsWith(x.key+':'))),demand:x.d.kitchenDemandStamp}));return extras.some(x=>Object.keys(x.sources).length||x.demand)?F.stamp({menu:menuStamp(items),sources:extras}):menuStamp(items)};
S.owner=async id=>K.isKitchen(id)?(await S.context(id)).outlet:(await BOBS_DATA.listOutlets()).find(o=>String(o.id)===String(id));
S.costSnapshot=data=>F.stamp({source:data.context.raw.kitchenSourceStamp,baseline:data.baseline,staffing:data.staffing,expenses:data.expenses,production:data.production,assets:data.assets,staff:data.staff,hr:data.hr,norms:data.norms});
S.automaticPositions=(data,assessment)=>{const keys=new Set(assessment.tasks.map(t=>t.key));return new Set([...data.baseline.positions,...data.staffing.positions].filter(p=>p.kind!=='delivery'&&(data.staffing.baselineAssignments?.find(a=>a.id===p.id)?.tasks||p.tasks||[]).some(t=>keys.has(t.key))).map(p=>(data.baseline.positions.some(x=>x.id===p.id)?'counter:':'position:')+p.id));};
S.costData=async id=>{
 const context=await S.context(id);const [baseline,staffing,expenses,production,assets,staff,hr,norms,costs,requirements]=await Promise.all([V.read(id,'OUTLET_BASELINE'),V.read(id,'OUTLET_STAFFING'),V.read(id,'FIXED_EXPENSES'),V.read(id,'OUTLET_PRODUCTION_PLAN'),V.read(id,'ASSET_MASTER'),V.read('COMPANY','STAFF_MASTER'),V.read('COMPANY','HR_OUTLET_ALLOCATION'),V.read('COMPANY','THP_NORMS'),V.read(id,'KITCHEN_COST_PLAN',C.today()),V.read(id,'OUTLET_ITEM_REQUIREMENTS')]);return {context,baseline,staffing,expenses,production,assets,staff,hr,norms,costs,requirements};
};
S.calculate=(data,choices)=>{
 const {context,baseline,staffing,expenses,production,assets,staff,hr,norms,requirements}=data,{jobs,items,recipes,kitchen}=context;
 const assessment=P.reconcile(production,items,recipes,assets,F,M2,C.today());
 if(!baseline?.reviewed||baseline.shiftStamp!==F.stamp(kitchen.shiftTimes)||!staffing?.reviewed||!staffing.salaryReviewed||staffing.date!==C.today()||staffing.menuStamp!==F.menuStamp(items)||staffing.recipeStamp!==F.recipeStamp(items,recipes,M2)||staffing.productionStamp!==F.stamp(production)||staffing.requirementsStamp!==F.stamp(requirements)||!F.baselineMatches(staffing,baseline))throw Error('Review kitchen baseline, current workload and salaries first.');
 const b=F.fund(baseline,staff,hr,kitchen.id,norms),s=F.fund(staffing,staff,hr,kitchen.id,norms),pools=F.pools(b,s,expenses,staff,hr,kitchen.id),positions=[...b.positions,...s.positions];
 const ids=positions.filter(p=>p.staffId).map(p=>String(p.staffId));if(new Set(ids).size!==ids.length)throw Error('One employee cannot fund several positions.');
 const rows=Object.fromEntries(jobs.map(j=>[j.key,{labour:0,overhead:0,fixedOverhead:0,variableOverhead:0,transport:0,depreciation:0}]));
 for(const person of positions.filter(p=>p.staffId)){const shares=(hr?.allocations||hr||{})[person.staffId],total=Object.values(shares||{}).reduce((n,v)=>n+(F.number(v)??0),0);if(Math.abs(total-100)>0.000001)throw Error(person.id+': employee cost shares across shops and kitchens must total100%.');}
 const autoIds=S.automaticPositions(data,assessment),auto=K.labour(positions.filter(p=>autoIds.has((b.positions.some(x=>x.id===p.id)?'counter:':'position:')+p.id)),staffing.baselineAssignments||[],assessment,jobs,F);
 for(const j of jobs)rows[j.key].labour=auto[j.key]||0;
 for(const pool of pools.filter(p=>!autoIds.has(p.id))){const allocation=choices.pools?.[pool.id];if(!allocation?.confirmed)throw Error('Review kitchen cost shares: '+pool.name);let total=0;for(const job of jobs){const val=F.number(allocation.shares?.[job.key]);if(val===null||val>100)throw Error(pool.name+': enter each job share (explicit0 if excluded).');total+=val;const labour=['labour','deliverySalary'].includes(pool.kind);rows[job.key][labour?'labour':'overhead']+=pool.daily*val/100;if(!labour){if(!['fixed','variable'].includes(allocation.behavior))throw Error(pool.name+': choose fixed or variable cost behavior.');rows[job.key][allocation.behavior==='fixed'?'fixedOverhead':'variableOverhead']+=pool.daily*val/100;}}if(Math.abs(total-100)>0.000001)throw Error(pool.name+': job shares must total100%.');}
 for(const job of jobs)rows[job.key].depreciation=BOBS_CAPITAL.depreciation(assets,items,recipes,F,M2,job.key).itemDaily;
 if(!choices.reviewed||!choices.productionOnlyConfirmed)throw Error('Confirm assigned production staff costs and all shared costs before saving.');
 const deliveries=Object.fromEntries(jobs.flatMap(j=>j.orders).map(d=>[d.id,{labour:0,overhead:0,fixedOverhead:0,variableOverhead:0,transport:0,depreciation:0,outlet:d.outlet,itemKey:d.itemKey,quantity:d.quantity,name:d.name}]));
 for(const job of jobs)for(const kind of ['labour','overhead','fixedOverhead','variableOverhead','depreciation'])for(const share of K.split(rows[job.key][kind],job))deliveries[share.id][kind]+=share.amount;
 const demands=jobs.flatMap(j=>j.orders),tripValues=K.trips(choices.trips||[],demands,P);for(const trip of tripValues)for(const share of trip.allocations)deliveries[share.demandId].transport+=share.amount;
 for(const demand of demands)if(demand.source.away&&!tripValues.some(t=>t.allocations.some(a=>a.demandId===demand.id)))throw Error(demand.name+': select this remote delivery on a shared journey.');
 return {rows,deliveries,tripValues,sourceStamp:S.costSnapshot(data),date:C.today()};
};
S.itemCosts=async(outlet,items)=>{
 const kitchenIds=[...new Set(items.flatMap(x=>Object.entries(x.d.kitchenSources||{}).filter(([key,v])=>(key===x.key||key.startsWith(x.key+':'))&&v.kitchenId).map(([,v])=>v.kitchenId)))];const totals={items:{},sources:[]};
 for(const id of kitchenIds){const data=await S.costData(id),saved=data.costs;if(!saved||saved.sourceStamp!==S.costSnapshot(data))throw Error('Shared kitchen costs changed or are incomplete: '+data.context.kitchen.name+'. Review its combined plan.');const value=S.calculate(data,saved.choices);if(F.stamp(value)!==F.stamp(saved.result))throw Error('Shared kitchen calculation changed. Review and save.');totals.sources.push({id,stamp:saved.sourceStamp});for(const row of Object.values(value.deliveries).filter(d=>d.outlet===String(outlet))){const item=totals.items[row.itemKey]||(totals.items[row.itemKey]={labour:0,overhead:0,fixedOverhead:0,variableOverhead:0,transport:0,depreciation:0});for(const key of ['labour','overhead','fixedOverhead','variableOverhead','transport','depreciation'])item[key]+=row[key];}}
 return totals;
};
S.progress=async id=>{
 const data=await S.costData(id),{context,baseline,staffing,production,assets}=data,steps=[];
 const add=(title,page,args,verify)=>{try{verify();steps.push({title,status:'done',reason:'Saved source verified',href:page+'?'+new URLSearchParams({outlet:id,...args})})}catch(e){steps.push({title,status:'review',reason:e.message,href:page+'?'+new URLSearchParams({outlet:id,...args})})}};
 add('Kitchen identity and shifts','kitchen-flow.html',{stage:'locations'},()=>K.validateLocations({kitchens:[context.kitchen]},context.outlets));
 add('Kitchen expenses and existing positions','outlet-plan.html',{stage:'baseline'},()=>{if(!baseline?.reviewed||baseline.shiftStamp!==F.stamp(context.kitchen.shiftTimes))throw Error('Review kitchen baseline and current shifts.');});
 add('Combined orders, capacity and production time','production-plan.html',{},()=>{if(!context.jobs.length)throw Error('Assign outlet items / sides to this kitchen first.');P.reconcile(production,context.items,context.recipes,assets,F,M2,C.today());});
 add('Production staff and individual salary packages','outlet-plan.html',{stage:'workforce'},()=>{if(!staffing?.reviewed||!staffing.salaryReviewed||staffing.date!==C.today()||staffing.menuStamp!==F.menuStamp(context.items)||staffing.productionStamp!==F.stamp(production)||!F.baselineMatches(staffing,baseline))throw Error('Assess current production tasks and save salaries.');F.fund(staffing,data.staff,data.hr,id,data.norms);});
 add('Shared equipment depreciation','asset-master.html',{},()=>BOBS_CAPITAL.depreciation(assets,context.items,context.recipes,F,M2,context.items[0]?.key));
 add('Shared batch labour, expenses and journeys','kitchen-flow.html',{stage:'cost'},()=>{if(!data.costs||data.costs.sourceStamp!==S.costSnapshot(data))throw Error('Review and save costs for current orders and sources.');S.calculate(data,data.costs.choices);});
 return {name:context.kitchen.name,steps,completed:steps.filter(s=>s.status==='done').length,next:steps.find(s=>s.status!=='done')};
};
window.BOBS_KITCHENS=S;
})();
