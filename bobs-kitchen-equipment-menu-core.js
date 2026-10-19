/* Menu-led inventory guidance. Reads shared catalogue/recipes; never writes Method 2. */
(function(root){'use strict';
const norm=x=>String(x||'').toLowerCase().replace(/\bidly\b/g,'idli').replace(/\s+/g,' ').trim();
function equipment(text){
 const key=norm(text);
 const types=[
  [/^idli steamer$/,'idli-steamer','Idli steamer',0],
  [/^wet grinder$/,'wet-grinder','Wet grinder',1],
  [/^(?:stock ?pot|cooking vessels?|boiling vessel|sambar pot|masala pot|rice pot|cooking pots|multiple pots)$/,'cooking-vessel',text,2],
  [/^(?:mixer grinder|mixer|blender)$/,'mixer','Mixer / blender',3],
  [/^frying kadai$/,'frying-kadai','Frying kadai',null],
  [/^pressure cooker$/,'pressure-cooker','Pressure cooker',null],
  [/^(?:tawa|dosa tawa)$/,'tawa',text,null]
 ];
 const match=types.find(x=>x[0].test(key));
 return match?{key:match[1],name:match[2],reference:match[3]}:{key,name:text.trim(),reference:null};
}
function catalogue(data,order,recipes,M2){
 const categories=order.filter(cat=>cat!==M2.SIDES&&Array.isArray(data[cat])).map(cat=>({name:cat,items:data[cat].map((item,i)=>({...item,key:cat+'::'+i}))}));
 const sides=M2.sideRecipes(recipes).map(r=>({name:r.name,recipeName:r.name,key:M2.SIDES+'::'+M2.purchaseKey(r.name)}));
 if(sides.length)categories.push({name:M2.SIDES,items:sides});
 return categories;
}
function suggestions(items,loaded,M2){
 const groups=new Map(),missing=[],preparation=[];
 const add=(options,reason,conditional=false)=>{
  const unique=[...new Map(options.filter(x=>x.key).map(x=>[x.key,x])).values()];
  if(!unique.length)return;
  const key=unique.map(x=>x.key).sort().join('|'),group=groups.get(key)||{key,options:unique,reasons:[],conditional};
  group.conditional=group.conditional&&conditional;
  if(!group.reasons.some(r=>r.itemKey===reason.itemKey&&r.note===reason.note))group.reasons.push(reason);
  groups.set(key,group);
 };
 for(const item of items){
  const recipe=M2.recipe(loaded.recipes||[],item.recipeName||item.name);
  if(!recipe){missing.push({name:item.name,reason:'No recipe equipment reference is available. If bought ready-made, no production equipment is inferred.'});continue;}
  const text=typeof recipe.productionTiming?.equipment==='string'?recipe.productionTiming.equipment.trim():'';
  const isStandard=!!M2.recipe(loaded.standardRecipes||[],recipe.name);
  const reason={itemKey:item.key,item:item.name,recipe:recipe.name,source:isStandard?'Google BOBS Standard Recipe':'Audited small-hotel reference',note:text};
  if(!text||/^(?:unknown|pending|tbd|n\/?a|none)$/i.test(text)){
   missing.push({name:item.name,reason:'Recipe equipment is not defined. Review the recipe or name your existing equipment manually.'});continue;
  }
  // '+' describes separate equipment. '/' describes alternatives, never two required purchases.
  const parts=text.split(/\s*\+\s*/);
  parts.forEach(part=>add(part.split(/\s*\/\s*/).map(equipment),reason));
  const note=String(recipe.productionTiming?.prePreparationNote||'').trim();
  if(note){
   preparation.push({name:item.name,note});
   if(/grind/i.test(note)&&!/(?:grinder|mixer|blender)/i.test(text)){
    add([equipment('Wet grinder')],{...reason,note:'Preparation mentions grinding: '+note+'. Consider a wet grinder only if you grind this batter here; confirm suitability with your cook.'},true);
   }
  }
 }
 return {groups:[...groups.values()],missing,preparation};
}
function estimate(reference,choice){
 if(!reference||!choice)return {status:'unknown'};
 return {status:'estimate',value:choice.capacity??choice.nominal,unit:reference.unit,
  basis:choice.material?choice.material+' input per separate cycle — confirm dry / soaked basis':reference.working?'Nominal vessel / jar volume — usable recipe output pending':'Idlis per batch — confirm tray and portion size',
  evidence:'',referenceUrl:choice.url||reference.url};
}
const api={catalogue,suggestions,estimate};
root.BOBS_EQUIPMENT_MENU=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
