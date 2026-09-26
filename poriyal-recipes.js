/* BOBS small-outlet poriyal standards + Recipe Master V2 completeness layer.
   Planning recipes for about 100 lunch-side portions at ~60 g cooked each.
   All timing/ingredient/yield values are reference planning standards, not measured outlet truth.
   Calibrate raw yield, trimming loss, local RM rates, energy and actual minutes after outlet trials. */
(function(root){'use strict';
const STD_VERSION='2026-09-SMALL-OUTLET-V2';
const LPG=2916.50/19;
const R={oil:140,onion:55,coconut:120,mustard:120,urad:140,chilli:100,turmeric:220,hing:700,salt:20,
 cabbage:45,carrot:60,beans:90,beetroot:50,potato:35,peas:120};
const ing=(n,q,u,r)=>[n,q,u,r];
const base=(name,veg,rawQty,vegRate,lpgKg=.27,extra=[])=>({
 recipeId:'PORIYAL_'+name.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,''),
 name,kind:'CONDIMENT',category:'Poriyal',yieldQty:6,yieldUnit:'kg',
 ingredients:[
  ing(veg,rawQty,'kg',vegRate),...extra,ing('Onion',.50,'kg',R.onion),ing('Fresh coconut',.45,'kg',R.coconut),
  ing('Cooking oil',.28,'L',R.oil),ing('Mustard seeds',.03,'kg',R.mustard),ing('Urad dal',.05,'kg',R.urad),
  ing('Green / dry chilli',.08,'kg',R.chilli),ing('Curry leaves',.05,'kg',80),ing('Turmeric',.015,'kg',R.turmeric),
  ing('Asafoetida',.004,'kg',R.hing),ing('Salt',.10,'kg',R.salt),ing('LPG fuel',lpgKg,'kg',LPG)
 ],
 standardVersion:STD_VERSION,standardSource:'BOBS_REFERENCE_SMALL_OUTLET_V2',guideAssumption:false,
 guideDailyQty:6,defaultPortionGrams:60,
 productionTiming:{prePreparationMin:0,setupMin:25,activeMinPerCycle:25,machineMinPerCycle:25,finishMinPerCycle:10,cleanupMin:10,
  role:'Cook / Tiffin Master',equipment:'Kadai / cooking vessel',canParallelize:true,
  prePreparationNote:'Helper can wash, peel and cut vegetables before cooking.'},
 helperEligible:['wash','peel','cut','measure','portion','cleanup'],fuel:{type:'LPG',usageKg:lpgKg,ratePerKg:LPG},
 planningNote:'BOBS opening-standard batch: approx. 6 kg cooked poriyal = about 100 portions at 60 g. Reweigh cooked yield and fuel after trial production.'
});

function clone(x){return JSON.parse(JSON.stringify(x||{}));}
function finite(v){return v!==''&&v!=null&&Number.isFinite(Number(v))&&Number(v)>=0;}
function categoryKey(r){return String(r.category||r.kind||'').toUpperCase();}
function defaultTiming(r){
 const c=categoryKey(r),cond=String(r.kind||'').toUpperCase()==='CONDIMENT'||/PORIYAL|CONDIMENT/.test(c);
 if(cond)return {prePreparationMin:0,setupMin:15,activeMinPerCycle:20,machineMinPerCycle:20,finishMinPerCycle:8,cleanupMin:10,role:'Cook / Tiffin Master',equipment:'Kadai / stock pot / mixer as applicable',canParallelize:true,prePreparationNote:'Wash, cut, measure and stage ingredients before cooking.'};
 if(/SNACK/.test(c))return {prePreparationMin:0,setupMin:12,activeMinPerCycle:25,machineMinPerCycle:18,finishMinPerCycle:5,cleanupMin:10,role:'Vada / Snack Master',equipment:'Frying kadai / tawa as applicable',canParallelize:false,prePreparationNote:'Prepare batter/filling and frying station before service.'};
 if(/HOT_BEVERAGE/.test(c))return {prePreparationMin:0,setupMin:5,activeMinPerCycle:10,machineMinPerCycle:8,finishMinPerCycle:2,cleanupMin:5,role:'Tea Master',equipment:'Tea boiler / saucepan',canParallelize:true,prePreparationNote:'Measure milk/water/powder before service.'};
 if(/COLD_BEVERAGE/.test(c))return {prePreparationMin:0,setupMin:5,activeMinPerCycle:12,machineMinPerCycle:5,finishMinPerCycle:3,cleanupMin:5,role:'Tea / Beverage Master',equipment:'Mixer / blender',canParallelize:false,prePreparationNote:'Chill and stage ingredients before blending.'};
 if(/RICE|LUNCH/.test(c))return {prePreparationMin:0,setupMin:20,activeMinPerCycle:30,machineMinPerCycle:30,finishMinPerCycle:10,cleanupMin:12,role:'Cook / Tiffin Master',equipment:'Rice pot / pressure cooker / kadai',canParallelize:true,prePreparationNote:'Wash rice/dal and prepare vegetables/seasonings before cooking.'};
 return {prePreparationMin:0,setupMin:15,activeMinPerCycle:30,machineMinPerCycle:25,finishMinPerCycle:5,cleanupMin:10,role:'Cook / Tiffin Master',equipment:'Kadai / tawa / steamer as applicable',canParallelize:true,prePreparationNote:'Stage ingredients and equipment before production.'};
}
function defaultHelper(r){
 const c=categoryKey(r),role=String(r.productionTiming?.role||'').toLowerCase();
 if(/TEA|BEVERAGE/.test(c)||/tea master/.test(role))return ['measure','cup setup','carry','portion','cleanup'];
 if(/SNACK/.test(c)||/snack|vada/.test(role))return ['wash','cut','measure','mix support','tray setup','portion','packing','cleanup'];
 return ['wash','peel','cut','measure','carry','vessel setup','portion','packing','cleanup'];
}
function stageLabels(r){
 const cond=String(r.kind||'').toUpperCase()==='CONDIMENT'||/PORIYAL|CONDIMENT/.test(categoryKey(r));
 return cond?{
  pre:'Soak / pre-prepare ingredients',setup:'Wash, cut, measure and ready vessel',active:'Active cooking / grinding / tempering',
  machine:'Simmer / pressure-cook / equipment time',finish:'Finish, temper and check consistency',clean:'Clean vessel and work area'
 }:{
  pre:'Pre-preparation / soak / ferment / rest',setup:'Ingredient and equipment setup',active:'Active production work',
  machine:'Cooking / machine elapsed time',finish:'Finish / unload / quality check',clean:'Clean equipment and work area'
 };
}
function energyType(r){
 const names=(r.ingredients||[]).map(x=>String(x?.[0]||'').toLowerCase());
 const hasLpg=names.some(x=>x.includes('lpg fuel')),hasPower=names.some(x=>x.includes('electricity'));
 return hasLpg&&hasPower?'LPG + Electricity':hasLpg?'LPG':hasPower?'Electricity':String(r.fuel?.type||'').trim();
}
function completeRecipe(input){
 const r=clone(input),fallback=defaultTiming(r),old=r.productionTiming||{},tim={...fallback,...old};
 for(const k of ['prePreparationMin','setupMin','activeMinPerCycle','machineMinPerCycle','finishMinPerCycle','cleanupMin']){
  if(!finite(tim[k]))tim[k]=fallback[k];else tim[k]=Number(tim[k]);
 }
 tim.role=String(tim.role||fallback.role).trim();tim.equipment=String(tim.equipment||fallback.equipment).trim();
 tim.canParallelize=typeof tim.canParallelize==='boolean'?tim.canParallelize:!!fallback.canParallelize;
 tim.prePreparationNote=String(tim.prePreparationNote||fallback.prePreparationNote||'').trim();r.productionTiming=tim;
 r.helperEligible=Array.isArray(r.helperEligible)&&r.helperEligible.length?[...new Set(r.helperEligible)]:defaultHelper(r);
 const labels=stageLabels(r),stages=[];
 const add=(id,label,duration,type,role,equipment,helperEligible=false,attention='ACTIVE')=>{if(duration>0)stages.push({id,label,durationMin:duration,stageType:type,role,equipment,helperEligible,attention});};
 add('pre-preparation',labels.pre,tim.prePreparationMin,'PREREQUISITE',tim.role,tim.equipment,false,'PASSIVE_OR_ADVANCE_PREP');
 add('setup',labels.setup,tim.setupMin,'ACTIVE',tim.role,tim.equipment,r.helperEligible.some(x=>/wash|peel|cut|measure|setup/.test(String(x).toLowerCase())),'ACTIVE');
 add('active',labels.active,tim.activeMinPerCycle,'ACTIVE',tim.role,tim.equipment,false,'ACTIVE');
 add('machine',labels.machine,tim.machineMinPerCycle,'EQUIPMENT',tim.role,tim.equipment,false,tim.canParallelize?'SUPERVISION_WITH_PARALLEL_WORK_POSSIBLE':'DEDICATED_SUPERVISION');
 add('finish',labels.finish,tim.finishMinPerCycle,'ACTIVE',tim.role,tim.equipment,false,'ACTIVE');
 add('cleanup',labels.clean,tim.cleanupMin,'ACTIVE',tim.role,tim.equipment,true,'ACTIVE');
 r.productionStages=stages;
 const eType=energyType(r);if(eType)r.fuel={...(r.fuel||{}),type:eType};
 r.standardVersion=STD_VERSION;r.standardSource='BOBS_REFERENCE_SMALL_OUTLET_V2';
 r.timingBasis='REFERENCE_SMALL_OUTLET_V2';
 r.planningStandard={
  type:'REFERENCE_SMALL_OUTLET',version:STD_VERSION,measuredAtOutlet:false,calibrationRequired:true,
  basis:'Published recipe process times + small commercial batch scaling + BOBS equipment assumptions',
  foodSafetyBasis:'FSSAI catering hygiene/time-temperature controls apply independently of these planning minutes.'
 };
 r.foodSafetyNote='Planning minutes are for workload/costing, not proof of food safety. Use potable water, clean/sanitised equipment, prevent cross-contamination and follow applicable FSSAI cooking/holding controls.';
 r.planningNote=String(r.planningNote||r.guideNote||'Reference opening-batch recipe. Verify actual yield, labour minutes, equipment cycle and energy use in the outlet before locking.');
 const timingComplete=['prePreparationMin','setupMin','activeMinPerCycle','machineMinPerCycle','finishMinPerCycle','cleanupMin'].every(k=>finite(tim[k]))&&!!tim.role&&!!tim.equipment;
 const ingredientsComplete=Array.isArray(r.ingredients)&&r.ingredients.length>0&&r.ingredients.every(x=>String(x?.[0]||'').trim()&&finite(x?.[1])&&String(x?.[2]||'').trim()&&finite(x?.[3]));
 const yieldComplete=finite(r.yieldQty)&&Number(r.yieldQty)>0&&!!String(r.yieldUnit||'').trim();
 r.standardCompleteness={yield:yieldComplete,ingredients:ingredientsComplete,timing:timingComplete,roleEquipment:!!tim.role&&!!tim.equipment,energy:!!eType,complete:yieldComplete&&ingredientsComplete&&timingComplete&&!!tim.role&&!!tim.equipment&&!!eType};
 return r;
}
function audit(recipes){
 const list=(recipes||[]).map(completeRecipe),bad=list.filter(x=>!x.standardCompleteness.complete);
 return {version:STD_VERSION,total:list.length,complete:list.length-bad.length,incomplete:bad.map(x=>({name:x.name,checks:x.standardCompleteness}))};
}

root.BOBS_PORIYAL=[
 base('Cabbage Poriyal','Cabbage',7.0,R.cabbage,.25),
 base('Carrot Poriyal','Carrot',6.6,R.carrot,.27),
 base('Beans Poriyal','French beans',6.7,R.beans,.28),
 base('Beetroot Poriyal','Beetroot',6.6,R.beetroot,.28),
 base('Carrot Beans Poriyal','Carrot',3.3,R.carrot,.28,[ing('French beans',3.1,'kg',R.beans),ing('Green peas',.35,'kg',R.peas)]),
 base('Potato Poriyal','Potato',7.0,R.potato,.30)
].map(completeRecipe);

if(Array.isArray(root.BOBS_GUIDE_RECIPES))root.BOBS_GUIDE_RECIPES=root.BOBS_GUIDE_RECIPES.map(completeRecipe);
root.BOBS_SMALL_OUTLET_STANDARD_VERSION=STD_VERSION;
root.BOBS_COMPLETE_RECIPE_STANDARD=completeRecipe;
root.BOBS_RECIPE_STANDARD_AUDIT=audit([...(root.BOBS_GUIDE_RECIPES||[]),...(root.BOBS_PORIYAL||[])]);
})(window);
