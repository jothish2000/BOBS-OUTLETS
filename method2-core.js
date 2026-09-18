/* Method 2 v4: one owner for calculations and verified Google persistence. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)), number=x=>x!==''&&x!==null&&x!==undefined&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const keys=(cat,i)=>({k:cat+'::'+i,q:cat+'|'+i,legacy:cat.replace(/\s+/g,'_')+'-'+i});
const maps=['qtys','prod','condiments','packaging','pricing','commercial','itemEditors'];
const businessDate=(date=new Date())=>new Date(date).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
const SIDES='Sides & Extras Catalogue';
const purchaseKey=name=>norm(name);
function purchaseConfig(x,unit){return x.purchase?clone(x.purchase):{basis:'unit',qty:1,unit:x.rateUnit||unit,total:x.purchaseRate??'',supplier:'',date:''}}
function purchaseRate(p){const qty=number(p?.qty),total=number(p?.total);return qty>0&&total!==null?total/qty:null}
function isSide(r){return /CONDIMENT/i.test(r.kind||r.category||'')||/sambar|chutney|poriyal|raita|kurma/i.test(r.name||'')}
function sideCatalogue(s,recipes=[]){
 const items=clone(s.sideCatalogue||[]);
 for(const r of recipes.filter(isSide)){
  const id=String(r.id||r.recipeId||purchaseKey(r.name));
  const found=items.find(x=>x.recipeId===id||purchaseKey(x.recipeName)===purchaseKey(r.name));
  if(found){found.name=r.name;found.recipeName=r.name;continue}
  const liquid=convert(1,r.yieldUnit,'ml')!==null;
  items.push({name:r.name,recipeName:r.name,recipeId:id,side:true,baseUnit:'pack',defaultMode:'production',servingQty:/sambar/i.test(r.name)?200:'',servingUnit:liquid?'ml':'g',price:'',purchasedCost:''});
 }
 return items;
}
function installSides(s,recipes=[]){const items=sideCatalogue(s,recipes);if(root.ITEM_DATA&&root.CAT_ORDER){root.ITEM_DATA[SIDES]=items;if(!root.CAT_ORDER.includes(SIDES))root.CAT_ORDER.push(SIDES)}return items}
function hydratePurchases(d,item,masters={}){
 const main=masters[purchaseKey(item.recipeName||item.name)];if(main)d.purchase=clone(main);
 for(const x of d.condiments||[]){const p=masters[purchaseKey(x.recipeName)];if(p)x.purchase=clone(p)}
 return d;
}
function purchasedSources(d,item){const entries=[];if(d.mode==='purchased')entries.push([item.recipeName||item.name,purchaseConfig(d,item.side?d.servingUnit:d.unit)]);for(const x of d.condiments||[])if(x.source==='purchase')entries.push([x.recipeName,purchaseConfig(x,x.rateUnit||x.portionUnit)]);return entries}
async function savePurchaseUnlocked(outlet,name,p,baseline){
 if(purchaseRate(p)===null||!['piece','pack','g','kg','ml','L'].includes(p.unit))throw Error('Enter a positive purchase quantity, its unit and total price.');
 const latest=state(await read(outlet)),key=purchaseKey(name);
 if(JSON.stringify(latest.purchaseMasters?.[key])!==JSON.stringify(baseline.purchaseMasters?.[key]))throw Error('This purchase master changed elsewhere. Reload before saving.');
 const token=Date.now()+'-'+Math.random().toString(36).slice(2);
 latest.purchaseMasters={...latest.purchaseMasters,[key]:{...clone(p),name,saveToken:token,savedAt:new Date().toISOString()}};
 return write(outlet,'METHOD2','default',latest,x=>x?.purchaseMasters?.[key]?.saveToken===token);
}
function savePurchase(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>savePurchaseUnlocked(...args)):savePurchaseUnlocked(...args)}
function state(s){s=clone(s||{});maps.forEach(k=>s[k]=s[k]||{});s.selection=s.selection||{};return s}
function hasItem(s,cat,i){const {k,q,legacy}=keys(cat,i);return !!(s.itemEditors?.[k]||s.qtys?.[q]!==undefined||s.prod?.[legacy]||Number(s.prod?.[k]?.todaysProduction)>0||s.condiments?.[k]?.length||s.packaging?.[k]?.length)}
function selected(s,cat,i){const entry=s.selection?.[cat];return Array.isArray(entry?.indices)?entry.indices.includes(Number(i)):hasItem(s,cat,i)}
async function saveSelectionUnlocked(outlet,cat,indices,baseline,catalogue){
 const latest=state(await read(outlet));
 if(JSON.stringify(latest.selection[cat])!==JSON.stringify(baseline.selection?.[cat]))throw Error('This category selection changed in another window. Reload before saving.');
 if(cat===SIDES){
  if(JSON.stringify(latest.sideCatalogue||[])!==JSON.stringify(baseline.sideCatalogue||[]))throw Error('The sides catalogue changed elsewhere. Reload before saving.');
  if(!Array.isArray(catalogue))throw Error('Load the sides catalogue first.');
  latest.sideCatalogue=clone(catalogue);
 }
 const token=Date.now()+'-'+Math.random().toString(36).slice(2);
 latest.selection[cat]={indices:[...new Set(indices.filter(i=>Number.isInteger(i)&&i>=0))].sort((a,b)=>a-b),token,savedAt:new Date().toISOString()};
 return write(outlet,'METHOD2','default',latest,s=>s?.selection?.[cat]?.token===token);
}
function saveSelection(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>saveSelectionUnlocked(...args)):saveSelectionUnlocked(...args)}
function packing(d){
 const rows=d.packaging||[],per=number(d.packingPer),missing=[],mode=d.packingMode??(rows.length?'required':'none');
 if(!['required','none','included'].includes(mode))missing.push('Choose whether packing is required');
 if(mode==='none'||mode==='included'){
  if(mode==='included'&&(d.mode==='production'||d.source==='recipe'))missing.push('Supplier-included packing requires Purchase mode');
  return {mode,per,perPack:0,perItem:0,missing};
 }
 if(mode==='required'&&!rows.length)missing.push('Add packing materials or choose no extra packing');
 if(rows.length&&!(per>0))missing.push('Items sharing one pack');
 let total=0;for(const x of rows){const qty=number(x.qty),rate=number(x.unitCost);if(qty===null||rate===null)missing.push((x.name||x.label||'Packing')+' quantity / price');else total+=qty*rate}
 return {mode,per,perPack:total,perItem:per>0?total/per:0,missing};
}
function packingCharge(d,sold){
 const p=packing(d),parcels=sold===null?null:p.mode==='required'?Math.ceil(sold/(p.per||1)):0,total=sold===null?null:parcels*p.perPack;
 return {...p,parcels,total,allocated:sold>0?total/sold:p.perItem};
}
function recipe(recipes,name){return recipes.find(r=>norm(r.name)===norm(name))}
function unitCost(r){
 if(!r)return null;
 const y=number(r.yieldQty||r.standardYield||r.yield);
 if(!y||!r.ingredients?.length)return null;
 if(r.ingredients.some(x=>number(x[1])===null||number(x[3])===null))return null;
 return r.ingredients.reduce((a,x)=>a+Number(x[1])*Number(x[3]),0)/y;
}
function convert(q,from,to){
 const units={g:['mass',1],kg:['mass',1000],ml:['volume',1],l:['volume',1000],litre:['volume',1000],litres:['volume',1000]};
 from=String(from).toLowerCase();to=String(to).toLowerCase();
 if(from===to)return q;
 if(units[from]&&units[to]&&units[from][0]===units[to][0])return q*units[from][1]/units[to][1];
 if(/^(piece|pieces|unit|units|nos|serving|servings|plate|plates|pack|packs|packet|packets)$/.test(from)&&/^(piece|pieces|unit|units|nos|serving|servings|plate|plates|pack|packs|packet|packets)$/.test(to))return q;
 return null;
}
function draft(s,cat,i,item){
 const {k,q,legacy}=keys(cat,i);if(s.itemEditors?.[k]){const saved=clone(s.itemEditors[k]);if((saved.businessDate||businessDate(saved.savedAt))!==businessDate())saved.soldConfirmed=false;return hydratePurchases(saved,item,s.purchaseMasters)}
 const p={...s.prod?.[legacy],...s.prod?.[k]},c=s.commercial?.[k]||{},price=s.pricing?.[k]||{};
 const raw=s.qtys?.[q],sold=raw&&typeof raw==='object'?(raw.unit==='g'?raw.qty/1000:raw.qty):raw;
 return hydratePurchases({mode:s.prod?.[legacy]||p.todaysProduction?'production':item.defaultMode||'purchased',unit:item.side?'pack':item.baseUnit==='Kg'?'kg':'piece',servingQty:item.servingQty,servingUnit:item.servingUnit,pricingBasis:'markup',
 batchSize:p.unitsPerBatch??p.batchSize??p.kgBatchSize??'',batches:p.batchesToday??p.numBatches??p.kgNumBatches??'',
 capacity:p.productionCapacityPerDay??p.capacity??p.kgCapacity??'',purchaseRate:item.purchasedCost??'',
 sold:sold??'',soldConfirmed:false,spoilage:c.foodSpoilagePct??c.spoilagePct??p.spoil??5,
 uuwp:c.safetyPct??5,markup:price.markupPct??25,price:price.currentPrice??item.price??'',
 condiments:clone(s.condiments?.[k]||[]).map(x=>({...x,source:x.source||'recipe',portion:x.portion??x.qty,portionUnit:x.portionUnit||x.unit||'kg'})),
 packaging:clone(s.packaging?.[k]||[]).filter(x=>x.packingOwner!=='condiment'),packingPer:1,packingMode:hasItem(s,cat,i)?undefined:''},item,s.purchaseMasters);
}
function calculate(d,item,recipes){
 const missing=[],sold=number(d.sold),made=(number(d.batchSize)||0)*(number(d.batches)||0);
 const name=item.recipeName||item.name,primary=d.mode==='production'?recipe(recipes,name):null;
 const mainPurchase=purchaseConfig(d,item.side?d.servingUnit:d.unit);
 const base=d.mode==='production'?unitCost(primary):purchaseRate(mainPurchase);
 if(base===null)missing.push(d.mode==='production'?'Primary recipe / ingredient rates':'Supplier quantity / total price');
 const serving=item.side?number(d.servingQty):1,servingUnit=item.side?d.servingUnit:d.unit;
 if(item.side&&!(serving>0))missing.push('Quantity in each separately sold pack');
 const sourceUnit=primary?.yieldUnit||mainPurchase.unit;
 const baseQty=d.mode==='purchased'&&item.side&&sourceUnit==='pack'?1:serving===null?null:convert(serving,servingUnit,sourceUnit);
 if(baseQty===null)missing.push('Recipe / purchase unit does not match serving unit');
 const baseCost=base===null||baseQty===null?0:base*baseQty;
 const mainFoodMissing=missing.length>0,sideComponents=[];
 const usage=[];
 function used(n,source,qty,unit,role){
  const normalized=convert(1,unit,'ml')!==null?'ml':convert(1,unit,'g')!==null?'g':unit;
  usage.push({name:n,source,quantity:sold===null||qty===null?null:convert(qty,unit,normalized)*sold,unit:normalized,role});
 }
 if(item.side)used(name,d.mode,serving,servingUnit,'separate');
 let cond=0;
 for(const x of d.condiments||[]){
  const r=recipe(recipes,x.recipeName),p=purchaseConfig(x,x.rateUnit||x.portionUnit),rate=x.source==='purchase'?purchaseRate(p):unitCost(r);
  const amount=number(x.portion),qty=amount===null?null:convert(amount,x.portionUnit,x.source==='purchase'?p.unit:r?.yieldUnit);
  if(rate===null||qty===null)missing.push(x.recipeName+' rate / portion unit');else cond+=rate*qty;
  sideComponents.push({name:x.recipeName,source:x.source==='purchase'?'purchased':'production',food:rate===null||qty===null?0:rate*qty,foodMissing:rate===null||qty===null,packingCost:packingCharge(x,sold)});
  used(x.recipeName,x.source==='purchase'?'purchased':'production',amount,x.portionUnit,'included');
 }
 const packingCost=packingCharge(d,sold),components=[{name:item.name,source:d.mode,food:baseCost,foodMissing:mainFoodMissing,packingCost},...sideComponents];
 for(const component of components){component.packing=component.packingCost.allocated;component.subtotal=component.food+component.packing;component.incomplete=component.foodMissing||component.packingCost.missing.length>0;missing.push(...component.packingCost.missing.map(m=>component.name+': '+m))}
 const parcelSize=packingCost.per||1,parcelPackCost=packingCost.perPack,parcels=packingCost.parcels,totalPacking=sold===null?null:components.reduce((sum,x)=>sum+x.packingCost.total,0);
 const pack=components.reduce((sum,x)=>sum+x.packing,0);
 const spoil=(baseCost+cond)*(number(d.spoilage)||0)/100,final=baseCost+cond+spoil+pack;
 // UUWP is a visible pricing allowance for every source, never a second procurement expense.
 const apply=true;
 const withUuwp=final*(1+(apply?(number(d.uuwp)||0)/100:0));
 const percent=number(d.markup),margin=d.pricingBasis==='margin';
 if(margin&&(percent===null||percent>=100))missing.push('Target margin must be at least 0 and below 100%');
 return {base:baseCost,baseQty,sourceUnit,usage,cond,pack,packingCost,components,baseWithPacking:components[0].subtotal,condWithPacking:sideComponents.reduce((sum,x)=>sum+x.subtotal,0),parcelSize,parcelPackCost,parcels,totalPacking,spoil,final,withUuwp,apply,made,sold,unsold:sold===null?null:made-sold,
 suggested:margin?(percent!==null&&percent<100?withUuwp/(1-percent/100):null):withUuwp*(1+(percent||0)/100),soldCost:sold===null?null:final*sold,
 revenue:sold===null?null:(number(d.price)||0)*sold,missing};
}
async function read(outlet,module='METHOD2',key='default'){
 const r=await BOBS_DATA.jsonp({action:'moduleGet',outletId:outlet,module,recordKey:key});
 if(!r||r.ok!==true)throw Error('Google read failed; nothing has been overwritten.');
 let d=r.data??r.record?.data;
 if(typeof d==='string')d=JSON.parse(d);
 if(d&&typeof d==='object')return d;
 if(r.found===false)return null;
 throw Error('Google did not confirm whether this record exists.');
}
async function write(outlet,module,key,data,check){
 await BOBS_DATA.saveModule(outlet,module,key,data);
 for(let n=0;n<3;n++){const saved=await read(outlet,module,key);if(check(saved))return saved;await new Promise(r=>setTimeout(r,500))}
 throw Error('Save sent, but Google read-back is not confirmed. Keep this page open and retry verification.');
}
function project(s,cat,i){const k=keys(cat,i);return Object.fromEntries(maps.map(m=>[m,m==='qtys'?s[m]?.[k.q]:m==='prod'?[s[m]?.[k.k],s[m]?.[k.legacy]]:s[m]?.[k.k]]))}
async function saveItemUnlocked(outlet,cat,i,item,d,baseline,recipes){
 const latest=state(await read(outlet)),{k,q,legacy}=keys(cat,i);
 if(JSON.stringify(project(latest,cat,i))!==JSON.stringify(project(baseline,cat,i)))throw Error('This item changed in another window. Reload before saving; your draft remains here.');
 const purchases=purchasedSources(d,item);
 for(const [name] of purchases){const key=purchaseKey(name);if(JSON.stringify(latest.purchaseMasters?.[key])!==JSON.stringify(baseline.purchaseMasters?.[key]))throw Error(name+' purchase master changed elsewhere. Reload before saving.')}
 const c=calculate(d,item,recipes);if(c.missing.length)throw Error('Complete cost inputs: '+c.missing.join(', '));
 if(number(d.sold)===null||c.sold>c.made||!(c.made>0))throw Error('Enter valid availability and Sold Today quantities.');
 const token=Date.now()+'-'+Math.random().toString(36).slice(2),savedDraft={...clone(d),packingSchemaVersion:2,savedAt:new Date().toISOString(),businessDate:businessDate(),saveToken:token,soldConfirmed:true};
 latest.itemEditors[k]=savedDraft;latest.qtys[q]=d.unit==='kg'?{qty:Number(d.sold)*1000,unit:'g'}:Number(d.sold);
 latest.purchaseMasters={...latest.purchaseMasters};
 for(const [name,p] of purchases)latest.purchaseMasters[purchaseKey(name)]={...p,name,saveToken:token,savedAt:savedDraft.savedAt};
 latest.condiments[k]=d.condiments.map(x=>({...x,qty:convert(Number(x.portion),x.portionUnit,recipe(recipes,x.recipeName)?.yieldUnit||x.rateUnit),unit:recipe(recipes,x.recipeName)?.yieldUnit||x.rateUnit}));
 latest.packaging[k]=[d,...d.condiments].flatMap((owner,index)=>{const pc=c.components[index].packingCost;if(pc.mode!=='required')return [];return (owner.packaging||[]).map(x=>({...x,qty:Number(x.qty)*(c.sold>0?pc.parcels/c.sold:1/(pc.per||1)),packingOwner:index?'condiment':'main',ownerName:c.components[index].name}))});
 latest.pricing[k]={...latest.pricing[k],markupPct:Number(d.markup),pricingBasis:d.pricingBasis||'markup',currentPrice:Number(d.price)};
 latest.commercial[k]={...latest.commercial[k],mode:d.mode,finalCogs:c.final,cogsWithUuwp:c.withUuwp,foodSpoilagePct:Number(d.spoilage),safetyPct:Number(d.uuwp),uuwpApplies:c.apply,unsold:c.unsold,todaysProduction:d.mode==='production'?c.made:0,purchasedQuantity:d.mode==='purchased'?c.made:0,totalProductionCost:d.mode==='production'?c.made*c.final:0,soldQuantity:c.sold,totalSoldCogs:c.soldCost,packingParcelSize:c.parcelSize,packingParcels:c.parcels,totalPackingCost:c.totalPacking,packingCogsPerUnit:c.pack,packingBreakdown:c.components.map(x=>({name:x.name,mode:x.packingCost.mode,unitsPerSet:x.packingCost.per,sets:x.packingCost.parcels,perUnit:x.packing,total:x.packingCost.total}))};
 latest.prod[k]={...latest.prod[k],mode:d.mode,unitsPerBatch:Number(d.batchSize),batchesToday:Number(d.batches),todaysProduction:d.mode==='production'?c.made:0};
 if(d.mode==='production')latest.prod[legacy]={...latest.prod[legacy],format:d.unit==='kg'?'kg':'batch',batchSize:d.batchSize,numBatches:d.batches,kgBatchSize:d.batchSize,kgNumBatches:d.batches,spoil:d.spoilage,capacity:d.capacity};
 else delete latest.prod[legacy];
 return write(outlet,'METHOD2','default',latest,x=>x?.itemEditors?.[k]?.saveToken===token);
}
function saveItem(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>saveItemUnlocked(...args)):saveItemUnlocked(...args)}
function cache(outlet,s){
 // Compatibility mirror only. Every new editor always reads Google first.
 const old=localStorage.getItem('method2-item-state');if(old&&!localStorage.getItem('method2-before-v4'))localStorage.setItem('method2-before-v4',old);
 localStorage.setItem('method2-verified-'+outlet,JSON.stringify(s));
 localStorage.setItem('method2-item-state',JSON.stringify(s));
 const all=JSON.parse(localStorage.getItem('outlet-analysis-data')||'{}');
 all[outlet]={...all[outlet],method2:s};localStorage.setItem('outlet-analysis-data',JSON.stringify(all));
}
root.M2={clone,number,norm,keys,state,hasItem,selected,saveSelection,packing,packingCharge,recipe,unitCost,convert,draft,calculate,read,write,project,saveItem,cache,SIDES,purchaseKey,purchaseConfig,purchaseRate,isSide,sideCatalogue,installSides,hydratePurchases,savePurchase};
})(typeof window==='undefined'?globalThis:window);
