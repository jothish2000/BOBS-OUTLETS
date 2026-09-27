(function(root){'use strict';
const E={};
const n=v=>{v=Number(v);return Number.isFinite(v)&&v>=0?v:null};
const norm=s=>String(s||'').toLowerCase().trim();
const slug=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const CATEGORY={PREP:'PREP',PRODUCTION:'PRODUCTION',HOLDING:'HOLDING',DISPLAY:'DISPLAY',COLD_STORAGE:'COLD STORAGE',SERVICE:'SERVICE',CLEANING:'CLEANING',COMMON:'COMMON UTILITY'};
const HOLDING_RULES=[
 {re:/idli|idly/i,name:'Idli hot box / insulated hot holding',category:CATEGORY.HOLDING,shareGroup:'TIFFIN_HOT_HOLD',powerW:0,hours:0,cost:4500,note:'Hold cooked idli near service; avoid using production steamer as routine storage.'},
 {re:/vada|bonda|bajji|samosa|kachori/i,name:'Heated snack / puff warmer rack',category:CATEGORY.HOLDING,shareGroup:'DRY_HOT_SNACK_HOLD',powerW:1000,hours:8,cost:12000,note:'Compatible dry fried snacks may share fixed rack capacity if quality/temperature permit.'},
 {re:/puff/i,name:'3-rack puff warmer',category:CATEGORY.HOLDING,shareGroup:'DRY_HOT_SNACK_HOLD',powerW:1000,hours:8,cost:12000,note:'Powered hot holding is part of the puff process and its electricity must be counted.'},
 {re:/cake|pastry|mousse|pudding/i,name:'Refrigerated cake showcase',category:CATEGORY.DISPLAY,shareGroup:'CHILLED_DISPLAY',powerW:500,hours:16,cost:65000,note:'Chilled display/holding; use actual nameplate wattage and operating hours when known.'},
 {re:/rose milk|badam milk|lassi|buttermilk|falooda|jigarthanda|milkshake|cold coffee/i,name:'Chilled beverage refrigerator / visi cooler',category:CATEGORY.COLD_STORAGE,shareGroup:'CHILLED_BEVERAGE',powerW:250,hours:18,cost:32000,note:'Cold holding after preparation; capacity and food-safety practice must be confirmed.'}
];
const alias=s=>{s=norm(s);if(/frying kadai/.test(s))return {name:'Fixed frying station — burner + kadai',group:'FRYING_STATION',category:CATEGORY.PRODUCTION,cost:12000};if(/idli steamer/.test(s))return {name:'Idli steamer',group:'IDLI_STEAM',category:CATEGORY.PRODUCTION,cost:25000};if(/wet grinder/.test(s))return {name:'Wet grinder',group:'WET_GRINDER',category:CATEGORY.PREP,cost:18000};if(/oven/.test(s))return {name:'Bakery oven',group:'BAKERY_OVEN',category:CATEGORY.PRODUCTION,cost:50000};if(/tea boiler|milk boiler/.test(s))return {name:'Tea / milk boiler station',group:'TEA_BOILER',category:CATEGORY.PRODUCTION,cost:12000};if(/sandwich grill/.test(s))return {name:'Sandwich grill',group:'SANDWICH_GRILL',category:CATEGORY.PRODUCTION,cost:7000};if(/tawa/.test(s))return {name:'Fixed tawa burner station',group:'TAWA_STATION',category:CATEGORY.PRODUCTION,cost:10000};if(/pressure cooker|stock pot/.test(s))return {name:'Stock-pot / pressure-cooking station',group:'STOCKPOT_STATION',category:CATEGORY.PRODUCTION,cost:12000};if(/kadai/.test(s))return {name:'Fixed kadai burner station',group:'KADAI_STATION',category:CATEGORY.PRODUCTION,cost:10000};if(/mixer|blender/.test(s))return {name:'Mixer / blender',group:'MIXER',category:CATEGORY.PREP,cost:5000};if(/refrigerator|freezer/.test(s))return {name:s,group:slug(s),category:CATEGORY.COLD_STORAGE,cost:30000};return {name:String(s||'Equipment').replace(/\b\w/g,c=>c.toUpperCase()),group:slug(s)||'equipment',category:CATEGORY.PRODUCTION,cost:10000}};
E.CATEGORY=CATEGORY;
E.splitEquipment=value=>String(value||'').split(/\s*\+\s*|\s*,\s*/).map(x=>x.trim()).filter(Boolean);
E.selectedItems=(state,itemData,catOrder)=>{
 const out=[];for(const cat of catOrder||[]){const items=itemData?.[cat]||[];items.forEach((item,i)=>{if(root.M2?.selected(state,cat,i))out.push({cat,index:i,item})})}return out;
};
E.recipeFor=(recipes,name)=>{const k=norm(name).replace(/idly/g,'idli');return (recipes||[]).find(r=>norm(r.name).replace(/idly/g,'idli')===k)};
E.requirements=(selected,recipes)=>{
 const rows=[];
 const add=x=>rows.push({...x,id:x.id||slug([x.category,x.name,x.shareGroup].join('-')),sourceItems:x.sourceItems||[x.itemName].filter(Boolean)});
 for(const s of selected||[]){
  const item=s.item||s, name=item.recipeName||item.name, r=E.recipeFor(recipes,name);
  if(r?.productionTiming?.equipment)for(const raw of E.splitEquipment(r.productionTiming.equipment)){const a=alias(raw);add({name:a.name,category:a.category,shareGroup:a.group,itemName:name,source:'Recipe Master',estimatedCost:a.cost,powerW:0,hours:0,sharePossible:true,note:'Production equipment from Recipe Master. Sharing is only a suggestion and must not require moving equipment or disruptive cleaning/changeover.'})}
  for(const h of HOLDING_RULES)if(h.re.test(name))add({...h,itemName:name,source:'Process / holding rule',estimatedCost:h.cost,sharePossible:true});
 }
 return E.merge(rows);
};
E.merge=rows=>{
 const by=new Map();for(const r of rows){const key=[r.category,r.name,r.shareGroup].join('|');if(!by.has(key))by.set(key,{...r,sourceItems:[],requiredCount:0});const x=by.get(key);x.requiredCount++;for(const i of r.sourceItems||[r.itemName])if(i&&!x.sourceItems.includes(i))x.sourceItems.push(i)}
 return [...by.values()].map(x=>({...x,individualCount:Math.max(1,x.sourceItems.length),suggestedSharedCount:1,defaultMode:x.sourceItems.length>1?'AUTO':'INDIVIDUAL'}));
};
E.applyDecisions=(requirements,plan={})=>(requirements||[]).map(r=>{const d=plan.decisions?.[r.id]||{},mode=d.mode||r.defaultMode||'INDIVIDUAL';let finalCount=mode==='INDIVIDUAL'?r.individualCount:r.suggestedSharedCount;if(mode==='AUTO')finalCount=r.suggestedSharedCount;const owned=n(d.ownedQty)||0,unitCost=n(d.unitCost)??n(r.estimatedCost)??0,powerW=n(d.powerW)??n(r.powerW)??0,hours=n(d.hours)??n(r.hours)??0;return {...r,...d,mode,finalCount,ownedQty:owned,toBuy:Math.max(0,finalCount-owned),unitCost,powerW,hours,capex:Math.max(0,finalCount-owned)*unitCost,dailyKwh:finalCount*powerW*hours/1000,dailyPowerCost:finalCount*powerW*hours/1000*(n(plan.ebRate)??11)}}); 
E.summary=rows=>({capex:rows.reduce((a,x)=>a+x.capex,0),dailyKwh:rows.reduce((a,x)=>a+x.dailyKwh,0),dailyPowerCost:rows.reduce((a,x)=>a+x.dailyPowerCost,0),toBuy:rows.reduce((a,x)=>a+x.toBuy,0)});
root.BOBS_EQUIPMENT=E;
})(typeof window!=='undefined'?window:globalThis);