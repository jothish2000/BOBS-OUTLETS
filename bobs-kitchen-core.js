/* Kitchen identity, demand aggregation and allocation. No storage or UI side effects. */
(function(root){'use strict';
const K={},copy=x=>JSON.parse(JSON.stringify(x)),positive=(n,label)=>{if(n===''||n==null||!Number.isFinite(+n)||+n<=0)throw Error(label+': enter a positive value.');return +n};
K.isKitchen=id=>/^Kitchen-[A-Za-z0-9_-]+$/.test(String(id));
K.validateLocations=(record,outlets)=>{
 const ids=new Set(),attached=new Set();
 for(const k of record.kitchens||[]){if(!K.isKitchen(k.id)||ids.has(k.id)||!k.name?.trim())throw Error('Every kitchen needs a unique identity and name.');ids.add(k.id);
  if(!['operating','proposed'].includes(k.status))throw Error(k.name+': choose operating or proposed.');
  if(k.outletId){if(!outlets.some(o=>String(o.id)===String(k.outletId)))throw Error(k.name+': attached shop no longer exists.');if(attached.has(String(k.outletId)))throw Error('One kitchen identity per attached shop; record its machines separately.');attached.add(String(k.outletId));}
  if(!k.shiftTimes?.length)throw Error(k.name+': enter kitchen working shifts.');
  for(const s of k.shiftTimes)if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.end))throw Error(k.name+': complete shift start and end.');
 }
 return record;
};
K.sourceFor=(item,requirementKey)=>item.d.kitchenSources?.[requirementKey];
K.demands=(outlet,items,recipes,P,F,M2,date)=>items.flatMap(item=>{
 const unassigned={...item,d:{...item.d}};delete unassigned.d.kitchenSources;
 return P.requirements([unassigned],recipes,F,M2).map(r=>({id:String(outlet)+'|'+r.key,outlet:String(outlet),itemKey:item.key,cat:item.cat,i:item.i,itemName:item.item.name,requirementKey:r.key,name:r.name,quantity:r.qty,unit:r.unit,recipe:copy(r.recipe||null),problem:r.problem,source:copy(K.sourceFor(item,r.key)||null),date}));
});
// Only an explicit group joins compatible requirements. Same machine never implies shared food.
K.jobs=(demands,kitchen,date,F)=>{
 const jobs=new Map();
 for(const d of demands.filter(d=>d.source?.kitchenId===kitchen.id)){
  const s=d.source;if(kitchen.status!=='operating')throw Error(kitchen.name+': proposed kitchens cannot supply today’s production.');
  if(s.date!==date)throw Error(d.name+': review the production location for today.');
  if(d.problem||!d.recipe)throw Error(d.name+': '+(d.problem||'Recipe missing.'));
  const qty=positive(d.quantity,d.name+' quantity');
  if(s.group&&!s.shared)throw Error(d.name+': confirm compatible shared production.');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.readyBy||''))throw Error(d.name+': enter ready-by time.');
  const identity=s.shared&&s.group?'Group:'+s.group:'Order:'+d.id;
  const key='KitchenJob-'+identity,signature=F.stamp({recipe:d.recipe,unit:d.unit});let job=jobs.get(key);
  if(job&&job.signature!==signature)throw Error(d.name+': shared production recipes, portions or units differ. Use separate groups or review the recipes.');
  if(!job){job={key,name:d.recipe.name,recipe:copy(d.recipe),quantity:0,unit:d.unit,signature,orders:[],readyBy:s.readyBy};jobs.set(key,job);}
  job.quantity+=qty;job.orders.push(copy(d));if(s.readyBy<job.readyBy)job.readyBy=s.readyBy;
 }
 return [...jobs.values()].map(j=>({...j,sourceStamp:F.stamp(j.orders.map(d=>({id:d.id,quantity:d.quantity,recipe:d.recipe,source:d.source})).sort((a,b)=>a.id.localeCompare(b.id)))}));
};
K.virtualItems=jobs=>jobs.map((j,i)=>({cat:'Kitchen production',i,key:j.key,item:{name:j.name,recipeName:j.name},d:{mode:'production',unit:j.unit,batchSize:j.quantity,batches:1,condiments:[],packaging:[],recipeOverrides:{},kitchenDemandStamp:j.sourceStamp},job:j}));
K.split=(amount,job)=>{if(!Number.isFinite(+amount)||+amount<0)throw Error('Invalid shared batch cost.');const total=positive(job.quantity,'Combined production');return job.orders.map(d=>({id:d.id,outlet:d.outlet,itemKey:d.itemKey,quantity:d.quantity,amount:+amount*d.quantity/total}));};
K.trip=(trip,demands,P)=>{
 if(!trip.enabled)return {total:0,allocations:[],interval:null};
 if(!trip.id||!trip.vehicleId?.trim()||!trip.confirmed||!trip.noDuplicateCharge)throw Error('Review vehicle, journey and exclusion of duplicate rider/fuel charges.');
 const distance=positive(trip.km,'Journey kilometres'),mileage=positive(trip.mileage,'Vehicle km per litre'),price=positive(trip.fuelPrice,'Fuel price per litre');
 if(!['oneWay','total'].includes(trip.distanceBasis))throw Error('Choose one-way distance or total journey distance.');
 if(trip.distanceBasis==='oneWay'&&!['yes','no'].includes(trip.returnLeg))throw Error('Confirm whether a return journey is included.');
 const km=distance*(trip.distanceBasis==='oneWay'&&trip.returnLeg==='yes'?2:1),start=P.clock(trip.start,trip.startDay||0),end=P.clock(trip.end,trip.endDay||0);if(end<=start)throw Error('Vehicle availability must include loading, travel, unloading and any return.');
 const loads=(trip.loads||[]).filter(l=>l.selected);if(!loads.length)throw Error('Select the items / sides carried on this trip.');let shares=0;const used=new Set();
 for(const l of loads){if(used.has(l.demandId)||!demands.some(d=>d.id===l.demandId))throw Error('Trip load no longer matches saved demand.');used.add(l.demandId);shares+=positive(l.percent,'Trip load share');}
 if(Math.abs(shares-100)>0.000001)throw Error('Journey cost shares must total100%.');
 return {total:km/mileage*price,km,interval:{start,end,vehicleId:trip.vehicleId},allocations:loads.map(l=>({...l,amount:km/mileage*price*(+l.percent)/100}))};
};
K.trips=(trips,demands,P)=>{const values=trips.map(t=>K.trip(t,demands,P));for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++){const a=values[i].interval,b=values[j].interval;if(a&&b&&a.vehicleId===b.vehicleId&&a.start<b.end&&b.start<a.end)throw Error('Shared vehicle has overlapping journeys.');}return values};
// Salary already resolved by the existing payroll engine. Task minutes apportion a day's cost once.
K.labour=(positions,assignments,assessment,jobs,F)=>{
 const result=Object.fromEntries(jobs.map(j=>[j.key,0])),people=new Set();
 for(const p of positions){const identity=p.staffId?'employee:'+p.staffId:'position:'+p.id;if(people.has(identity))throw Error('A person or position is funded twice in this kitchen.');people.add(identity);
  const own=assignments.find(a=>a.id===p.id),taskKeys=new Set((own?.tasks||p.tasks||[]).map(t=>t.key)),tasks=assessment.tasks.filter(t=>taskKeys.has(t.key));
  const minutes=tasks.reduce((n,t)=>n+t.activeMinutes,0);if(!minutes)throw Error(p.id+': no reviewed production duty; allocate non-production work separately.');
  const amount=F.salary(p)/31;for(const t of tasks){const members=t.members||[],sum=members.reduce((n,m)=>n+m.quantity,0);if(!(sum>0))throw Error('Shared task quantities are missing.');for(const m of members){const job=jobs.find(j=>j.key===m.requirementKey);if(!job)throw Error('Task belongs to an obsolete kitchen demand.');result[job.key]+=amount*t.activeMinutes/minutes*m.quantity/sum;}}
 }
 return result;
};
root.BOBS_KITCHEN_CORE=K;if(typeof module!=='undefined')module.exports=K;
})(typeof window==='undefined'?globalThis:window);
