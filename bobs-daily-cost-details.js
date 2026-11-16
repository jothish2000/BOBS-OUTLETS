(function(){
 'use strict';
 const C=BOBS_COST_FLOW,F=BOBS_OUTLET_FLOW;
 const q=new URLSearchParams(location.search),outlet=q.get('outlet'),cat=q.get('cat'),index=q.get('i'),date=q.get('date');
 const id=Number(index),key=M2.keys(cat,id).k,section=q.get('section')||'production';
 const labels=BOBS_COST_DETAIL.labels;
 const $=id=>document.getElementById(id),host=$('content');
 const money=n=>Number.isFinite(n)?n.toLocaleString('en-IN',{style:'currency',currency:'INR'}):'Unavailable';
 const qty=(n,u)=>BOBS_NUMBERS.quantity(n,u)+' '+u;
 function element(tag,value){const e=document.createElement(tag);e.textContent=value;return e}
 function note(message){host.append(element('p',message))}
 function table(headings,rows){
  if(!rows.length)return;
  const wrap=document.createElement('div'),table=document.createElement('table'),head=table.createTHead().insertRow(),body=table.createTBody();
  wrap.className='table-scroll';
  for(const label of headings){const th=element('th',label);th.scope='col';head.append(th)}
  for(const row of rows){const tr=body.insertRow();for(const value of row)tr.append(element('td',value))}
  wrap.append(table);host.append(wrap);
 }
 function summary(rows){const dl=document.createElement('dl');for(const [label,value] of rows)dl.append(element('dt',label),element('dd',value));host.append(dl)}
 function recorded(state){
  const commercial=state.commercial?.[key],saved=state.itemEditors?.[key];
  if(commercial?.costEvidence)return commercial.costEvidence.date===date?commercial.costEvidence:null;
  if(!commercial||!saved?.soldConfirmed||!saved.savedAt||!Number.isFinite(Date.parse(saved.savedAt)))return null;
  const day=saved.businessDate||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(saved.savedAt));
  if(day!==date||!Number.isFinite(commercial.actualDayCost))return null;
  return {legacy:true,unit:saved.unit,direct:commercial.actualDayCost,main:commercial.actualMainFoodCost,totalPacking:commercial.totalPackingCost,made:commercial.mode==='production'?commercial.todaysProduction:commercial.purchasedQuantity,sold:commercial.soldQuantity,packing:commercial.packingBreakdown?.map(x=>({name:x.name,mode:x.mode,sets:x.sets,amount:x.total})),common:commercial.totalCommonPackingCost};
 }
 function direct(e){
  if(!e){note('No confirmed item cost record is available for this business date.');return}
  if(section==='production'){
   summary([['Produced or purchased',qty(e.made,e.unit)],['Recorded sales quantity',qty(e.sold,e.unit)],['Main food cost for the day',money(e.main)],['Total direct COGS for the day',money(e.direct)]]);
   return;
  }
  if(section==='packing'){
   const rows=(e.packing||[]).map(x=>[x.name,x.mode,x.sets??'Unavailable',money(x.amount)]);
   if(e.legacy&&Number.isFinite(e.common))rows.push(['Common / order','Saved', '—',money(e.common)]);
   table(['Component','Packing choice','Sets','Daily amount'],rows);
   const materials=(e.packing||[]).flatMap(x=>(x.materials||[]).map(r=>[x.name,r.name,r.quantity,money(r.unitCost)]));
   table(['Component','Packing material','Quantity used','Price per unit'],materials);
   summary([['Total item packing',money(e.totalPacking)]]);
   return;
  }
  if(e.legacy){note('This saved result predates detailed ingredient and accompaniment records. The daily total remains available.');return}
  if(section==='sides'){
   table(['Accompaniment','Portion per unit sold','Quantity served','Food','Packing'],e.sides.map(x=>[x.name,qty(x.portion,x.unit),qty(x.quantity,x.unit),money(x.food),money(x.packing)]));
   if(!e.sides.length)note('No accompaniments were selected for this item.');
  }else if(section==='ingredients'||section==='utilities'){
   const rows=e.ingredients.filter(x=>section==='utilities'?x.energy:!x.energy);
   table(['Recipe','Input','Costed quantity','Rate per unit','Day cost'],rows.map(x=>[x.recipe,x.name,qty(x.quantity,x.unit),money(x.rate),money(x.amount)]));
   note(rows.length?'Quantities are derived from the recipe and recorded production or sales.':'No separate '+(section==='utilities'?'fuel or power':'ingredient')+' entries were recorded in the recipes for this item.');
  }
 }
 function allocated(data){
  if(data.error)throw Error(data.error);
  const {items,recipes,staffing,requirements,baseline,assets,production}=data;
  if(!data.sharedKitchen||data.sharedKitchen.error)throw Error(data.sharedKitchen?.error||'Shared-kitchen costs could not be checked.');
  if(staffing?.date!==date||!staffing.reviewed||!staffing.salaryReviewed||!F.baselineMatches(staffing,baseline)||staffing.menuStamp!==F.menuStamp(items)||staffing.recipeStamp!==F.recipeStamp(items,recipes,M2)||staffing.requirementsStamp!==F.stamp(requirements))throw Error('Verified staffing and cost inputs for this item and date are unavailable.');
  BOBS_PRODUCTION_PLAN.reconcile(production,items,recipes,assets,F,M2,date);
  if(production&&staffing.productionStamp!==F.stamp(production))throw Error('The saved staffing plan uses an earlier production timetable.');
  const saved=data.allocations?.items?.[key];
  if(!saved||saved.sourceStamp!==BOBS_FULL_COST.snapshot(data))throw Error('Current verified item allocation shares are unavailable.');
  const pools=F.pools(F.fund(baseline,data.staff,data.hr,outlet,data.norms),F.fund(staffing,data.staff,data.hr,outlet,data.norms),data.expenses,data.staff,data.hr,outlet);
  const others=Object.fromEntries(Object.entries(data.allocations.items).filter(([k])=>k!==key&&items.some(x=>x.key===k)));
  const totals=F.allocate(pools,saved.choices,others);
  const rows=pools.map(p=>({...p,percent:Number(saved.choices[p.id].percent),amount:p.daily*Number(saved.choices[p.id].percent)/100}));
  return {rows,totals,kitchen:data.sharedKitchen.items?.[key]||{labour:0,overhead:0,transport:0,depreciation:0}};
 }
 function overhead(data,e){
  if(!data||data.error)throw Error(data?.error||'Cost records are unavailable.');
  if(section==='assets'){
   const assets=BOBS_CAPITAL.depreciation(data.assets,data.items,data.recipes,F,M2,key);
   const rows=assets.lines.flatMap(x=>x.uses.filter(u=>u.key===key).map(u=>[x.name,money(x.daily),u.percent+'%',money(u.daily)]));
   table(['Asset','Total daily depreciation','Item share','Item allowance'],rows);
   if(!rows.length)note('No outlet asset is allocated to this item.');
   summary([['Allocated outlet depreciation per day',money(assets.itemDaily)]]);
   if(data.sharedKitchen?.error)throw Error(data.sharedKitchen.error);
   if(data.sharedKitchen)summary([['Shared kitchen depreciation per day',money(data.sharedKitchen.items?.[key]?.depreciation??0)]]);
   return;
  }
  const {rows,totals,kitchen}=allocated(data);
  const labour=totals.labour+kitchen.labour,expenses=totals.overhead+kitchen.overhead+kitchen.transport;
  if(section==='production'){
   host.append(element('h2','Daily allocated costs'));
   summary([['Labour allocation',money(labour)],['Allocated outlet expenses, kitchen overheads and transport',money(expenses)],['Cost including operating overheads',money(e?e.direct+labour+expenses:null)]]);
   const dep=BOBS_CAPITAL.depreciation(data.assets,data.items,data.recipes,F,M2,key).itemDaily+kitchen.depreciation;
   summary([['Allocated depreciation allowance',money(dep)],['Total cost including overheads and depreciation',money(e?e.direct+labour+expenses+dep:null)]]);
   return;
  }
  const isLabour=x=>x.kind==='labour'||x.kind==='deliverySalary';
  const filtered=rows.filter(x=>section==='labour'?isLabour(x):section==='utilities'?/fuel|gas|electric|power|water|utility|utilities|lpg/i.test(x.name):!isLabour(x));
  table(['Cost source','Per operating day','Item share','Allocated to item'],filtered.map(x=>[x.name,money(x.daily),x.percent+'%',money(x.amount)]));
  if(section==='labour')summary([['Shared kitchen labour',money(kitchen.labour)],['Total daily labour allocation',money(labour)]]);
  if(section==='expenses')summary([['Shared kitchen overheads',money(kitchen.overhead)],['Shared kitchen transport',money(kitchen.transport)],['Total daily expense allocation',money(expenses)]]);
  if(section==='utilities'&&!filtered.length)note('No separate utility allocation was identified in the outlet cost pools.');
  note('Monthly amounts use 12 months divided by 365 operating days. The item share applies to the resulting daily amount.');
 }
 let loading=false;
 async function load(){
  if(loading)return;loading=true;$('refresh').disabled=true;host.replaceChildren();
  try{
   C.days(date);if(!outlet||!cat||!/^\d+$/.test(index||'')||!Object.hasOwn(labels,section))throw Error('Open cost details from the item or outlet results.');
   const raw=await M2.read(outlet),state=M2.state(raw);
   M2.installSides(state);const item=ITEM_DATA[cat]?.[id];
   let evidence=recorded(state),archiveReadError='',source=state;
   if(!evidence&&date<C.today()){
    try{
     const history=await M2.backups(outlet);
     for(const backup of history){
      const snapshot=backup.data;if(!snapshot||String(snapshot.outlet)!==String(outlet)||!snapshot.data)continue;
      const snap=snapshot.data;
      evidence=recorded(snap);
      if(evidence){source=snap;break}
     }
    }catch(error){archiveReadError=error.message}
   }
   if(!item&&!evidence)throw Error('No matching item was found for this outlet.');
   $('heading').textContent=labels[section];
   $('context').textContent=(evidence?.name||item?.name||key)+' · Outlet '+outlet+' · '+date;
   $('status').textContent='Saved Google records · Read-only';
   if(['production','ingredients','sides','packing','utilities'].includes(section))direct(evidence);
   if(archiveReadError)note('Historical cost records could not be checked. '+archiveReadError);
   if(evidence?.legacy&&date===C.today()&&item&&['ingredients','sides','utilities'].includes(section)){
    const master=await BOBS_OPERATIONAL_RECIPES.load(),draft=M2.draft(source,cat,id,item),cost=M2.calculate(draft,item,master.recipes);
    if(!cost.missing.length&&cost.made===evidence.made&&cost.sold===evidence.sold){
     host.append(element('h2','Estimated breakdown from current recipes'));
     note('Uses the saved quantities and current ingredients, yields and rates. Earlier ingredient charges may differ.');
     direct(M2.directCostEvidence(draft,item,master.recipes,cost,date));
    }
   }
   if(['production','labour','expenses','assets','utilities'].includes(section)){
    if(date!==C.today()){note('Historical allocations and depreciation for this date are unavailable.');return}
    try{overhead(await BOBS_FULL_COST.load(outlet),evidence)}catch(error){note('Daily allocation detail unavailable. '+error.message)}
   }
  }catch(error){$('status').textContent=error.message}finally{loading=false;$('refresh').disabled=false}
 }
 for(const [part,label] of Object.entries(labels)){
  const u=new URL(location.href);u.searchParams.set('section',part);
  const a=element('a',label);a.href=u.href;
  if(part===section)a.setAttribute('aria-current','page');
  $('sections').append(a);
 }
 $('back').onclick=()=>BOBS_WINDOW_RETURN.returnToParent('method2-item.html?'+new URLSearchParams({outlet,cat,i:index}));
 $('refresh').onclick=load;load();
})();
