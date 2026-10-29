/* Capacity and time planning. Google record owners remain METHOD2 and ASSET_MASTER. */
(function(root){'use strict';const P={};
const n=x=>x===null||x===undefined||String(x).trim()===''?null:Number.isFinite(+x)&&+x>=0?+x:null;
const need=(v,label,positive=false)=>{const x=n(v);if(x===null||(positive&&x<=0))throw Error(label+': enter '+(positive?'a positive':'a non-negative')+' value.');return x};
// Demand and materials use the same effective recipe as the price builder.
// Never derive liquid volume from ingredient mass or from a machine's drum size.
P.requirements=(items,recipes,F,M2)=>items.flatMap(x=>{
 const effective=root.BOBS_COST_FLOW.effectiveRecipes(recipes,x.d.recipeOverrides||{});
 return F.requirements([x],effective,M2).map(req=>{
  const side=(x.d.condiments||[]).find(s=>req.key===x.key+':'+s.recipeName);
  const portion=side?side.portion:x.item.side?x.d.servingQty:1;
  const portionUnit=side?side.portionUnit:x.item.side?x.d.servingUnit:x.d.unit;
  const made=n(x.d.batchSize)!==null&&n(x.d.batches)!==null?+x.d.batchSize*+x.d.batches:null;
  const recipe=req.recipe,override=x.d.recipeOverrides?.[root.BOBS_COST_FLOW.norm(recipe?.name)];
  let problem=recipe?.costBlocked||(!recipe?'Saved recipe missing.':n(recipe.yieldQty??recipe.standardYield)>0?'':'Recipe yield is missing.');
  if(!(made>0))problem='Enter the intended production quantity.';
  else if(!(n(portion)>0))problem='Review the saved portion for '+req.name+'.';
  else if(!(req.qty>0))problem='Review the portion unit and recipe yield unit for '+req.name+'.';
  return {...req,qty:problem?null:req.qty,problem,made,salesUnit:x.d.unit,portion,portionUnit,
   source:override?'Saved outlet recipe':'Google company recipe',isSide:!!side};
 });
});
P.materials=req=>{
 if(!req?.recipe||req.problem||!(req.qty>0))return [];
 const factor=req.qty/(req.recipe.yieldQty??req.recipe.standardYield);
 return (req.recipe.ingredients||[]).map((a,i)=>({key:JSON.stringify([i,a[0],a[2]]),name:a[0],unit:a[2],quantity:n(a[1])===null?null:+a[1]*factor}))
  .filter(a=>!/(^|\b)(lpg|fuel|electricity|energy|gas|firewood)(\b|$)/i.test(a.name));
};
P.processQuantity=(p,req,M2)=>{
 if(req?.problem)throw Error(req.problem);
 if(p.quantityMode==='manual')return need(p.quantity,p.name+' process quantity',true);
 if(p.quantityMode==='ingredient'){
  const keys=[...new Set(p.ingredientKeys||[])],materials=P.materials(req);
  if(!keys.length)throw Error('Select the saved recipe ingredient(s) for '+p.name+'.');
  return keys.reduce((sum,key)=>{const a=materials.find(a=>a.key===key);
   if(!a||n(a.quantity)===null)throw Error('Recipe ingredients changed or are incomplete. Review '+p.name+'.');
   const converted=M2.convert(a.quantity,a.unit,p.unit);
   if(converted===null)throw Error('Ingredient and process units are incompatible. No kg-to-litre conversion is assumed.');
   return sum+converted;
  },0);
 }
 if(p.quantityMode!=='demand')throw Error('Choose the quantity basis for '+p.name+'.');
 return M2.convert(req?.qty,req?.unit,p.unit);
};
P.clock=(t,day=0)=>{if(!/^\d{2}:\d{2}$/.test(t||''))throw Error('Enter a complete time.');const [h,m]=t.split(':').map(Number);if(h>23||m>59||![-1,0,1,2].includes(+day))throw Error('Invalid time or day.');return h*60+m+(+day)*1440};
P.time=x=>{const d=Math.floor(x/1440),m=((x%1440)+1440)%1440;return (d<0?'Previous day ':d>0?'Day +'+d+' ':'')+String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0')};
P.assetsStamp=(assets,F)=>F.stamp((assets?.assets||[]).map(a=>({id:a.id,name:a.name,quantity:a.quantity,ownedQty:a.ownedQty,capacityNote:a.capacityNote,capacity:a.capacity,capacityUnit:a.capacityUnit})));
P.source=(items,recipes,assets,F,M2)=>F.stamp({menu:F.menuStamp(items),recipes:F.recipeStamp(items,recipes,M2),equipment:P.assetsStamp(assets,F)});
P.itemSource=(x,F)=>F.menuStamp([x]);
P.reconcile=(record,items,recipes,assets,F,M2,date)=>{if(!F.requirements(items,recipes,M2).length)return {tasks:[],warnings:[],activeMinutes:0};if(!record?.reviewed||record.date!==date||record.sourceStamp!==P.source(items,recipes,assets,F,M2))throw Error('Review equipment capacity, intended quantities, recipes and production time for the current menu.');const assessment=P.assess(record,items,recipes,assets,F,M2);if(assessment.warnings.length)throw Error(assessment.warnings.join(" "));return assessment};
P.draftState=(raw,plans,catalogue,M2,date)=>{const state=M2.state(M2.clone(raw));for(const p of plans){if(!M2.selected(state,p.cat,p.i))throw Error('A planned item is no longer selected.');const item=catalogue[p.cat]?.[p.i],d=M2.draft(state,p.cat,p.i,item),k=M2.keys(p.cat,p.i).k;const qty=need(p.quantity,item.name+' intended quantity',true);if(p.unit!==d.unit)throw Error(item.name+': sales unit changed. Reload.');const changed=+d.batchSize*+d.batches!==qty||(p.mode&&p.mode!==d.mode);state.itemEditors[k]={...d,...(typeof p.sideExtraFivePercent==='boolean'?{sideExtraFivePercent:p.sideExtraFivePercent}:{}),...(p.mode?{mode:p.mode}:{}),batchSize:qty,batches:1,productionPlanDate:date,...(changed?{soldConfirmed:false}:{})};delete state.itemEditors[k].recipeOverrides;}return state};
P.assess=(record,items,recipes,assets,F,M2)=>{
 const requirements=P.requirements(items,recipes,F,M2),groups=new Map(),warnings=[],physical=new Set();
 for(const a of assets?.assets||[]){for(let i=1;i<=+a.quantity;i++)physical.add(a.id+'#'+i)}
 for(const req of requirements){const owner=items.find(x=>req.key===x.key||req.key.startsWith(x.key+':')),plan=record.items?.[owner?.key];if(!plan?.capacityReviewed||!plan?.recipeReviewed)throw Error(req.name+': review capacity and recipe before assessing time.');if(req.problem)throw Error(req.name+': '+req.problem);if(!(req.qty>0))throw Error(req.name+': intended quantity is missing.');if(!(record.processes||[]).some(s=>s.requirementKey===req.key&&s.primary))throw Error(req.name+': add a main production process.');}
 const ids=new Set();for(const s of record.processes||[]){if(ids.has(s.id))throw Error('Duplicate process ID.');ids.add(s.id);const req=requirements.find(x=>x.key===s.requirementKey);if(!req)throw Error(s.name+': process belongs to a removed requirement.');if(+s.preparationElapsed>0&&(!s.preparationReviewed||!(record.processes||[]).some(p=>p.requirementKey===s.requirementKey&&!p.primary)))throw Error(s.name+': add and review preparation stages, including active grinding / washing and passive waiting as applicable.');if(!s.reviewed)throw Error(s.name+': review its timing and required skill.');if(!s.name?.trim()||!s.role?.trim())throw Error('Every process needs a name and required skill.');if(s.capacityBasisRequired&&!s.capacityBasisReviewed)throw Error(s.name+': confirm the capacity uses the same material and weighing basis as the recipe.');const qty=P.processQuantity(s,req,M2);if(!(qty>0))throw Error(s.name+': process unit must match recipe output, or enter a reviewed input quantity.');const capacity=need(s.capacity,s.name+' capacity per cycle',true),start=P.clock(s.start,s.startDay),deadline=P.clock(s.deadline,s.deadlineDay),fields=['setup','active','machine','supervision','finish','clean','passive'];fields.forEach(k=>need(s[k],s.name+' '+k));if(+s.supervision>+s.machine)throw Error(s.name+': supervised minutes cannot exceed machine elapsed minutes.');if(!s.assetSlots?.length&&!s.manualReason?.trim())throw Error(s.name+': select equipment, or explain why this is manual work.');for(const a of s.assetSlots||[])if(!physical.has(a))throw Error(s.name+': selected equipment is missing or its quantity changed.');if(s.group&&!s.sharedConfirmed)throw Error(s.name+': confirm that this is one compatible shared preparation.');if(s.group&&/idli|idly|vada/i.test(req.name)&&/cooked.?rice/i.test(s.group+' '+s.name))throw Error('Idli and Vada cannot use a cooked-rice preparation group.');
 const key=s.group?'shared:'+s.group:s.id,signature=F.stamp({materials:s.quantityMode==='ingredient'?P.materials(req).filter(a=>s.ingredientKeys?.includes(a.key)).map(a=>a.name.toLowerCase()).sort():null,unit:s.unit,capacity,role:s.role,assetSlots:[...(s.assetSlots||[])].sort(),start,deadline,...Object.fromEntries(fields.map(k=>[k,+s[k]])),passiveUsesAsset:!!s.passiveUsesAsset});let g=groups.get(key);if(g&&g.signature!==signature)throw Error(s.name+': shared rows must use the same unit, machines, capacity, times and required skill.');if(!g){g={...s,key,signature,quantity:0,start,deadline,capacity,members:[]};groups.set(key,g)}g.quantity+=qty;g.members.push({id:s.id,requirementKey:req.key,quantity:qty});g.after=[...new Set([...(g.after||'').split(','),...(s.after||'').split(',')].map(x=>x.trim()).filter(Boolean))].join(',');}
 const tasks=[];for(const g of groups.values()){const cycles=Math.ceil(g.quantity/g.capacity);if(cycles>10000)throw Error(g.name+': too many cycles; check capacity and units.');let cursor=g.start+(+g.passive);const labor=[],add=(minutes,label)=>{if(minutes>0)labor.push({start:cursor,end:cursor+minutes,label});cursor+=minutes};const workStart=cursor;add(+g.setup,'setup');for(let i=0;i<cycles;i++){add(+g.active,'load / active work');const machineStart=cursor;if(+g.supervision)labor.push({start:machineStart,end:machineStart+(+g.supervision),label:'machine supervision'});cursor+=+g.machine;add(+g.finish,'unload / finish')}add(+g.clean,'clean / changeover');if(cursor===g.start)throw Error(g.name+': production time is missing.');if(cursor>g.deadline)warnings.push(g.name+': finishes '+P.time(cursor)+' after deadline '+P.time(g.deadline)+'.');const occupancy={start:g.passiveUsesAsset?g.start:workStart,end:cursor};tasks.push({...g,cycles,end:cursor,labor,occupancy,activeMinutes:labor.reduce((s,x)=>s+x.end-x.start,0),equipmentMinutes:occupancy.end-occupancy.start,elapsedMinutes:cursor-g.start});}
 const overlap=(a,b)=>a.start<b.end&&b.start<a.end;for(let i=0;i<tasks.length;i++)for(let j=i+1;j<tasks.length;j++){const a=tasks[i],b=tasks[j],shared=(a.assetSlots||[]).filter(x=>b.assetSlots?.includes(x));if(shared.length&&overlap(a.occupancy,b.occupancy))warnings.push('Equipment conflict: '+a.name+' / '+b.name+' use '+shared.join(', ')+' at the same time.');}
 // A dependency names one actual process row, even if it is part of a shared batch.
 for(const t of tasks)for(const id of String(t.after||'').split(',').map(x=>x.trim()).filter(Boolean)){const predecessor=tasks.find(x=>x.members.some(m=>m.id===id));if(!predecessor||predecessor===t)throw Error(t.name+': invalid predecessor process.');if(t.start<predecessor.end)warnings.push(t.name+': starts before '+predecessor.name+' is ready.');}
 for(const t of tasks)for(const member of t.members){const owner=items.find(x=>member.requirementKey===x.key||member.requirementKey.startsWith(x.key+':')),plan=record.items?.[owner?.key];if(plan?.deadline&&t.end>P.clock(plan.deadline,plan.deadlineDay||0))warnings.push(owner.item.name+': shared production finishes after the item ready-by time.');}return {tasks,warnings,activeMinutes:tasks.reduce((s,x)=>s+x.activeMinutes,0)};
};
P.propose=(assessment,shifts,mandatory,F,shared=[])=>{
 const overlap=(a,b)=>a.start<b.end&&b.start<a.end,warnings=[...assessment.warnings],positions=mandatory.map(p=>({...p,mandatory:true,tasks:[],skills:F.roleSkills(p.role)}));
 const shiftWindows=(shifts||[]).map((s,i)=>{const start=P.clock(s.start);let end=P.clock(s.end);if(end<=start)end+=1440;return {i,start,end}});
 if(!shiftWindows.length)throw Error('Save complete shift timings first.');
 for(const s of shared){if(!s.id||positions.some(p=>p.id===s.id)||!s.role?.trim()||!s.skills?.length)throw Error('Shared staff needs a unique position ID, designation and approved skills.');let start=P.clock(s.start,s.startDay),end=P.clock(s.end,s.endDay);if(end<=start)throw Error(s.id+': availability must end after it starts.');positions.push({...s,skills:s.skills.flatMap(F.roleSkills),tasks:[],shared:true,availability:{start,end},maxActive:need(s.maxActive,s.id+' active-work limit',true),maxSpan:need(s.maxSpan,s.id+' attendance-span limit',true),breaks:(s.breaks||[]).map(b=>{const pause={start:P.clock(b.start,b.day),end:P.clock(b.end,b.endDay??b.day)};if(pause.end<=pause.start||pause.start<start||pause.end>end)throw Error(s.id+': enter a complete break within staff availability, ending after it starts.');return pause;})});}
 for(const t of [...assessment.tasks].sort((a,b)=>a.start-b.start)){if(!t.labor.length)continue;const skill=F.roleSkills(t.role);let intervals=t.labor;const shift=shiftWindows.find(w=>intervals.every(a=>a.start>=w.start&&a.end<=w.end));const accepts=p=>{const allowed=p.skills||F.roleSkills(p.role);if(!skill.some(k=>allowed.includes(k)))return false;const w=p.shared?p.availability:shiftWindows[+p.shift];if(!w||!intervals.every(a=>a.start>=w.start&&a.end<=w.end))return false;if(intervals.some(a=>(p.breaks||[]).some(b=>overlap(a,b))||p.tasks.some(x=>x.labor.some(b=>overlap(a,b)))))return false;const span=[...p.tasks.flatMap(x=>x.labor),...intervals];return !p.shared||(p.tasks.reduce((s,x)=>s+x.activeMinutes,0)+t.activeMinutes<=p.maxActive&&Math.max(...span.map(x=>x.end))-Math.min(...span.map(x=>x.start))<=p.maxSpan);};let p=positions.find(accepts);if(!p){if(!shift){warnings.push(t.name+': active work is outside one shift; assign a reviewed shared position with availability covering this work, or revise the timing.');continue}let id='Production1',num=1;while(positions.some(x=>x.id===id))id='Production'+(++num);p={id,role:t.role,skills:skill,shift:shift.i,tasks:[]};positions.push(p)}p.tasks.push(t);}
 return {positions:positions.filter(p=>!p.mandatory&&p.tasks.length),baselineAssignments:positions.filter(p=>p.mandatory&&p.tasks.length),warnings};
};
P.breakEven=({price,variable,fixed,depreciation=0,unit,capacity})=>{price=need(price,'Selling price',true);variable=need(variable,'Variable cost per sold unit');fixed=need(fixed,'Allocated fixed daily costs');depreciation=need(depreciation,'Daily depreciation');const contribution=price-variable;if(contribution<=0)return {possible:false,contribution};const continuous=/^(kg|g|l|litre|liter|litres|liters|ml)$/i.test(unit||''),units=(fixed+depreciation)/contribution,cashUnits=fixed/contribution,rounded=continuous?units:Math.ceil(units-1e-10),cash=continuous?cashUnits:Math.ceil(cashUnits-1e-10);return {possible:true,contribution,units:rounded,revenue:rounded*price,cashUnits:cash,cashRevenue:cash*price,aboveCapacity:n(capacity)!==null&&rounded>+capacity};};
root.BOBS_PRODUCTION_PLAN=P;if(typeof module!=='undefined')module.exports=P;
})(typeof window==='undefined'?globalThis:window);
