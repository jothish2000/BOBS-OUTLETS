/* Additive Google kitchen records; ordinary outlet records retain their existing owners. */
(function(){'use strict';if(window.BOBS_KITCHENS)return;const K=BOBS_KITCHEN_CORE,F=BOBS_OUTLET_FLOW,P=BOBS_PRODUCTION_PLAN,V=BOBS_VERIFIED,C=BOBS_COST_FLOW;
const rawRead=M2.read.bind(M2),selected=F.selected.bind(F),requirements=F.requirements.bind(F),menuStamp=F.menuStamp.bind(F);
const S={isKitchen:K.isKitchen};
S.serviceDate=C.serviceDate;
S.pageDate=id=>{
 const p=new URLSearchParams(window.location?.search||''),d=p.get('serviceDate');
 return K.isKitchen(id)&&p.get('outlet')===id&&/^\d{4}-\d{2}-\d{2}$/.test(d||'')?d:C.today();
};
// A service-day order carries only the reviewed production inputs for each menu item.
S.applyOrders=(raw,daily,date)=>{
 const view=M2.state(raw);view.kitchenSources=Object.fromEntries(Object.entries(view.kitchenSources||{}).filter(([,s])=>s?.date===date));
 for(const [key,order] of Object.entries(daily?.items||{})){
  const selection=view.selection[order.cat] ||= {};
  if(Array.isArray(selection.names)&&order.cat===M2.SIDES){
   if(!selection.names.includes(order.name))selection.names.push(order.name);
  }else{
   if(!Array.isArray(selection.indices))selection.indices=(ITEM_DATA[order.cat]||[]).flatMap((item,i)=>M2.selected(view,order.cat,i)?[i]:[]);
   if(!selection.indices.includes(order.i))selection.indices.push(order.i);
  }
  view.itemEditors[key]={...view.itemEditors[key],...order.inputs};
  for(const k of Object.keys(view.kitchenSources))if(k===key||k.startsWith(key+':'))delete view.kitchenSources[k];
  Object.assign(view.kitchenSources,order.sources);
 }
 return view;
};
const datedModules=new Set(['OUTLET_PRODUCTION_PLAN','OUTLET_ITEM_REQUIREMENTS','OUTLET_STAFFING']);
S.readPlan=async(id,module,date,read=V.read)=>{
 if(!K.isKitchen(id)||!datedModules.has(module))return read(id,module);
 const scoped=await read(id,module,date);
 if(scoped||date!==C.today())return scoped;
 const legacy=await read(id,module);
 return legacy?.date&&legacy.date!==date?null:legacy;
};
S.pageStore={...V,
 read:(id,module,key)=>key&&key!=='default'||!K.isKitchen(id)||!datedModules.has(module)?V.read(id,module,key):S.readPlan(id,module,S.pageDate(id)),
 async save(id,module,key,payload,old){
  if(K.isKitchen(id)&&datedModules.has(module)&&key==='default'){
   const date=S.pageDate(id);
   if(date!==C.today()||await V.read(id,module,date))key=date;
   else{const legacy=await V.read(id,module);if(legacy?.date&&legacy.date!==date)key=date;}
  }
  return V.save(id,module,key,payload,old);
 }
};
S.pageClock={...C,today:()=>S.pageDate(new URLSearchParams(window.location?.search||'').get('outlet'))};
S.registry=()=>V.read('COMPANY','KITCHEN_MASTER');
S.locations=async()=>{const [outlets,record]=await Promise.all([BOBS_DATA.listOutlets(),S.registry()]);return {outlets,record,kitchens:record?.kitchens||[]}};
S.allDemands=async(master,read,date=C.today())=>{const [locations]=await Promise.all([S.locations()]);const rows=await Promise.all(locations.outlets.map(async o=>{const raw=read?await read(o.id,'METHOD2'):await rawRead(o.id),daily=await (read||V.read)(o.id,'OUTLET_DEMAND',date),items=F.selected(S.applyOrders(raw,daily,date),ITEM_DATA,M2);return {outlet:o,raw,daily,items,demands:K.demands(o.id,items,master.recipes,P,F,M2,date)}}));return {...locations,rows,demands:rows.flatMap(r=>r.demands)}};
S.context=async(id,read,date=S.pageDate(id))=>{
 const master=await BOBS_OPERATIONAL_RECIPES.load(read?{getRawModule:read}:undefined),all=await S.allDemands(master,read,date),kitchen=all.kitchens.find(k=>k.id===id);if(!kitchen)throw Error('Saved kitchen identity not found. Review production locations.');
 const jobs=K.jobs(all.demands,kitchen,date,F),items=K.virtualItems(jobs),recipes=jobs.map(j=>({...j.recipe,name:'Kitchen recipe '+j.key,kitchenOriginalName:j.name}));
 for(const item of items){item.item.recipeName='Kitchen recipe '+item.key;item.d.price=0;item.d.sold=item.d.batchSize;item.d.markup=0;item.d.pricingBasis='markup';item.d.packingMode='none';item.d.packingReason='Packing is budgeted at the selling outlet';item.d.uuwpPolicy='always';item.d.spoilage=0;}
 return {...all,date,kitchen,jobs,items,recipes,raw:{kitchenItems:items,kitchenSourceStamp:F.stamp({date,kitchen,jobs}),kitchenRecipes:recipes},outlet:{...kitchen,name:kitchen.name+' · Production kitchen',id:kitchen.id,shiftTimes:kitchen.shiftTimes}};
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
S.costData=async(id,scanRead,date=S.pageDate(id))=>{
 const read=scanRead||V.read,context=await S.context(id,scanRead,date);const [baseline,staffing,expenses,production,assets,staff,hr,norms,costs,requirements]=await Promise.all([read(id,'OUTLET_BASELINE'),S.readPlan(id,'OUTLET_STAFFING',date,read),read(id,'FIXED_EXPENSES'),S.readPlan(id,'OUTLET_PRODUCTION_PLAN',date,read),read(id,'ASSET_MASTER'),read('COMPANY','STAFF_MASTER'),read('COMPANY','HR_OUTLET_ALLOCATION'),read('COMPANY','THP_NORMS'),read(id,'KITCHEN_COST_PLAN',date),S.readPlan(id,'OUTLET_ITEM_REQUIREMENTS',date,read)]);return {context,baseline,staffing,expenses,production,assets,staff,hr,norms,costs,requirements};
};
S.calculate=(data,choices)=>{
 const {context,baseline,staffing,expenses,production,assets,staff,hr,norms,requirements}=data,{jobs,items,recipes,kitchen}=context;
 const assessment=P.reconcile(production,items,recipes,assets,F,M2,context.date);
 if(!baseline?.reviewed||baseline.shiftStamp!==F.stamp(kitchen.shiftTimes)||!staffing?.reviewed||!staffing.salaryReviewed||staffing.date!==context.date||staffing.menuStamp!==F.menuStamp(items)||staffing.recipeStamp!==F.recipeStamp(items,recipes,M2)||staffing.productionStamp!==F.stamp(production)||staffing.requirementsStamp!==F.stamp(requirements)||!F.baselineMatches(staffing,baseline))throw Error('Review kitchen baseline, current workload and salaries first.');
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
 return {rows,deliveries,tripValues,sourceStamp:S.costSnapshot(data),date:context.date};
};
S.itemCosts=async(outlet,items,scanRead)=>{
 const kitchenIds=[...new Set(items.flatMap(x=>Object.entries(x.d.kitchenSources||{}).filter(([key,v])=>(key===x.key||key.startsWith(x.key+':'))&&v.kitchenId).map(([,v])=>v.kitchenId)))];const totals={items:{},sources:[]};
 const needsReview=message=>Object.assign(Error(message),{code:'BOBS_KITCHEN_COST_REVIEW'});
 for(const id of kitchenIds){
  // Verified absence of today's cost plan is an unfinished step. There is no
  // saved calculation to reconcile, so do not load every contributing order.
  if(scanRead&&!await scanRead(id,'KITCHEN_COST_PLAN',C.today()))throw needsReview('Review and save today’s shared kitchen costs.');
  const data=await S.costData(id,scanRead),saved=data.costs;if(!saved||saved.sourceStamp!==S.costSnapshot(data))throw needsReview('Shared kitchen costs changed or are incomplete: '+data.context.kitchen.name+'. Review its combined plan.');const value=S.calculate(data,saved.choices);if(F.stamp(value)!==F.stamp(saved.result))throw needsReview('Shared kitchen calculation changed. Review and save.');totals.sources.push({id,stamp:saved.sourceStamp});for(const row of Object.values(value.deliveries).filter(d=>d.outlet===String(outlet))){const item=totals.items[row.itemKey]||(totals.items[row.itemKey]={labour:0,overhead:0,fixedOverhead:0,variableOverhead:0,transport:0,depreciation:0});for(const key of ['labour','overhead','fixedOverhead','variableOverhead','transport','depreciation'])item[key]+=row[key];}}
 return totals;
};
S.progress=async(id,scanRead,date=S.pageDate(id))=>{
 const data=await S.costData(id,scanRead,date),{context,baseline,staffing,production,assets}=data,steps=[];
 const add=(title,page,args,verify)=>{try{verify();steps.push({title,status:'done',reason:'Saved source verified',href:page+'?'+new URLSearchParams({outlet:id,...args})})}catch(e){steps.push({title,status:'review',reason:e.message,href:page+'?'+new URLSearchParams({outlet:id,...args})})}};
 add('Kitchen identity and shifts','kitchen-flow.html',{stage:'locations'},()=>K.validateLocations({kitchens:[context.kitchen]},context.outlets));
 add('Kitchen expenses and existing positions','outlet-plan.html',{stage:'baseline'},()=>{if(!baseline?.reviewed||baseline.shiftStamp!==F.stamp(context.kitchen.shiftTimes))throw Error('Review kitchen baseline and current shifts.');});
 add('Combined orders, capacity and production time','production-plan.html',{},()=>{if(!context.jobs.length)throw Error('Assign outlet items / sides to this kitchen first.');P.reconcile(production,context.items,context.recipes,assets,F,M2,date);});
 add('Production staff and individual salary packages','outlet-plan.html',{stage:'workforce'},()=>{if(!staffing?.reviewed||!staffing.salaryReviewed||staffing.date!==context.date||staffing.menuStamp!==F.menuStamp(context.items)||staffing.productionStamp!==F.stamp(production)||!F.baselineMatches(staffing,baseline))throw Error('Assess current production tasks and save salaries.');F.fund(staffing,data.staff,data.hr,id,data.norms);});
 add('Shared equipment depreciation','asset-master.html',{},()=>BOBS_CAPITAL.depreciation(assets,context.items,context.recipes,F,M2,context.items[0]?.key));
 add('Shared batch labour, expenses and journeys','kitchen-flow.html',{stage:'cost'},()=>{if(!data.costs||data.costs.sourceStamp!==S.costSnapshot(data))throw Error('Review and save costs for current orders and sources.');S.calculate(data,data.costs.choices);});
 // Funding plans share the same kitchen owner and recipes; they are verified separately from batch prices.
 for(const [module,title,page] of [['CAPITAL_EXPENDITURE','Kitchen capital expenditure','capital-expenditure.html'],['WORKING_CAPITAL','Kitchen working capital','working-capital.html']]){
  let saved;try{saved=await (scanRead||V.read)(id,module)}catch(e){steps.push({title,status:'unknown',reason:e.message,href:page+'?'+new URLSearchParams({outlet:id})});continue}
  add(title,page,{},()=>{if(module==='CAPITAL_EXPENDITURE'){BOBS_CAPITAL.savedCapital(saved,assets,context.items,context.recipes,F,M2);return}
   const op=BOBS_CAPITAL.operating({...data,state:M2.state(context.raw),items:context.items,recipes:context.recipes},id,F,M2,C);
   if(!saved?.reviewed||saved.date!==date||saved.sourceStamp!==op.sourceStamp)throw Error('Review and save working capital for current kitchen orders and staffing.');
   BOBS_CAPITAL.workingCapital(op,saved.inputs);
  });
 }
 return {name:context.kitchen.name,steps,completed:steps.filter(s=>s.status==='done').length,next:steps.find(s=>s.status!=='done')};
};

// Both the selling item and the saved-demand receipt display the same kitchen progress.
const continuationViews = new WeakMap();
S.showDemandContinuation = function(host, {record, keys, itemKey, returnTo, child = false, refresh = false,date = C.today()}) {
 const sources = keys.map(key => record?.kitchenSources?.[key]);
 const ids = sources.length && sources.every(s => s?.date === date && K.isKitchen(s.kitchenId))
   ? [...new Set(sources.map(s => s.kitchenId))] : [];
 const signature = JSON.stringify([date, itemKey, record?.itemEditors?.[itemKey]?.planningToken, ids, returnTo]);
 const prior = continuationViews.get(host);
 if (prior?.signature === signature && (!refresh || prior.loading)) return prior.task;
 const view = {signature, loading: ids.length > 0};
 continuationViews.set(host, view);
 host.hidden = !ids.length;
 host.replaceChildren();
 const changed = () => window.dispatchEvent(new Event('bobs-guide-context'));
 if (!ids.length) { changed(); return; }
 host.textContent = 'Checking the supplying kitchen’s next step…';
 host.dataset.state = 'checking';
 changed();
 const task = async () => {
   const steps = await Promise.all(ids.map(async id => {
     try {
       const {name, next} = await S.progress(id,undefined,date);
       if (!next) return {id, name};
       const url = new URL(next.href, location.href);
       if (url.origin !== location.origin) throw Error('Kitchen route is outside BOBS.');
       const parent = window.BOBS_WINDOW_RETURN?.safe(returnTo);
       if (parent) url.searchParams.set('returnTo', parent);
       url.searchParams.set('guide', 'continue');
        if(date!==C.today())url.searchParams.set('serviceDate',date);
       return {id, name, title:next.title, href:url.href};
     } catch (e) { return {id, name:id, error:e.message}; }
   }));
   if (continuationViews.get(host) !== view) return;
   view.loading = false;
   host.replaceChildren();
   host.dataset.state = steps.some(s => s.error || s.href) ? 'next' : 'complete';
   for (const step of steps) {
     const section = document.createElement('section');
     const heading = document.createElement('h3');
     heading.textContent = step.name + (step.href ? ' — next required action' : '');
     section.append(heading);
      const deadline=document.createElement('p');deadline.textContent='Saved demand for '+date+' · '+[...new Set(sources.filter(s=>s.kitchenId===step.id).map(s=>s.readyBy))].join(', ');section.append(deadline);
     if (step.href) {
       const link = document.createElement('a');
       link.className = 'guide-action';
       link.dataset.kitchenName = step.name;
       link.href = step.href;
       if (child) link.target = '_blank';
       link.textContent = step.title + ' →';
       section.append(link);
     } else {
       const note = document.createElement('p');
       note.textContent = step.error ? 'Could not check the kitchen’s next step: ' + step.error :
         'All saved kitchen stages are verified. Continue reviewing the item costs.';
       section.append(note);
     }
     host.append(section);
   }
   if (steps.some(step => step.error)) {
     const retry = document.createElement('button');
     retry.type='button';retry.dataset.kitchenRetry='true';retry.textContent='Retry kitchen progress';
     retry.onclick=()=>S.showDemandContinuation(host,{record,keys,itemKey,returnTo,child,date,refresh:true});
     host.append(retry);
   }
   if (child && host.dataset.state === 'complete') host.hidden = true;
   changed();
 };
 view.task = task();
 return view.task;
};

window.BOBS_KITCHENS=S;
})();
