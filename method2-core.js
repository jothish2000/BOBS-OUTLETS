/* Method 2 v4: one owner for calculations and verified Google persistence. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)), number=x=>x!==''&&x!==null&&x!==undefined&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const keys=(cat,i)=>({k:cat+'::'+i,q:cat+'|'+i,legacy:cat.replace(/\s+/g,'_')+'-'+i});
const maps=['qtys','prod','condiments','packaging','pricing','commercial','itemEditors'];
const businessDate=(date=new Date())=>new Date(date).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
function state(s){s=clone(s||{});maps.forEach(k=>s[k]=s[k]||{});s.selection=s.selection||{};s.sideCatalog=Array.isArray(s.sideCatalog)?s.sideCatalog:[];return s}
function sideRecipes(recipes){return (recipes||[]).filter(r=>/CONDIMENT/i.test(r.kind||'')||/sambar|chutney|poriyal|raita|kurma/i.test(r.name||''))}
function installSides(recipes,s){
 const cat='Sides & Extras',known=(s?.sideCatalog||[]).slice(),available=sideRecipes(recipes),by=new Map(available.map(r=>[norm(r.name),r]));
 for(const r of available.sort((a,b)=>String(a.name).localeCompare(String(b.name))))if(!known.some(n=>norm(n)===norm(r.name)))known.push(r.name);
 const items=known.map(name=>{const r=by.get(norm(name)),sambar=/sambar/i.test(name);return {name,price:0,purchasedCost:null,productionCost:null,hasRecipe:true,eligible:true,standaloneSide:true,recipePortion:sambar?200:null,recipePortionUnit:sambar?'ml':null,baseUnit:'pack',recipeAvailable:!!r}});
 if(typeof ITEM_DATA!=='undefined')ITEM_DATA[cat]=items;if(typeof CAT_ORDER!=='undefined'&&!CAT_ORDER.includes(cat))CAT_ORDER.push(cat);return items
}
function hasItem(s,cat,i){const {k,q,legacy}=keys(cat,i);return !!(s.itemEditors?.[k]||s.qtys?.[q]!==undefined||s.prod?.[legacy]||Number(s.prod?.[k]?.todaysProduction)>0||s.condiments?.[k]?.length||s.packaging?.[k]?.length)}
function selected(s,cat,i){const entry=s.selection?.[cat];if(cat==='Sides & Extras'&&Array.isArray(entry?.names))return entry.names.some(n=>norm(n)===norm(ITEM_DATA?.[cat]?.[i]?.name));return Array.isArray(entry?.indices)?entry.indices.includes(Number(i)):hasItem(s,cat,i)}
async function saveSelectionUnlocked(outlet,cat,indices,baseline){
 const latest=state(await read(outlet));
 if(JSON.stringify(latest.selection[cat])!==JSON.stringify(baseline.selection?.[cat]))throw Error('This category selection changed in another window. Reload before saving.');
 const token=Date.now()+'-'+Math.random().toString(36).slice(2);
 const clean=[...new Set(indices.filter(i=>Number.isInteger(i)&&i>=0))].sort((a,b)=>a-b);
 if(cat==='Sides & Extras'){latest.sideCatalog=(ITEM_DATA[cat]||[]).map(x=>x.name);latest.selection[cat]={names:clean.map(i=>ITEM_DATA[cat]?.[i]?.name).filter(Boolean),token,savedAt:new Date().toISOString()}}
 else latest.selection[cat]={indices:clean,token,savedAt:new Date().toISOString()};
 return write(outlet,'METHOD2','default',latest,s=>s?.selection?.[cat]?.token===token);
}
function saveSelection(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>saveSelectionUnlocked(...args)):saveSelectionUnlocked(...args)}
function packing(d){
 const rows=d.packaging||[],per=number(d.packingPer),missing=[];
 if(rows.length&&!(per>0))missing.push('Items sharing one pack');
 let total=0;for(const x of rows){const qty=number(x.qty),rate=number(x.unitCost);if(qty===null||rate===null)missing.push((x.name||x.label||'Packing')+' quantity / price');else total+=qty*rate}
 return {per,perPack:total,perItem:per>0?total/per:0,missing};
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
 if(/^(piece|pieces|unit|units|nos|serving|servings|plate|plates|packet|packets)$/.test(from)&&/^(piece|pieces|unit|units|nos|serving|servings|plate|plates|packet|packets)$/.test(to))return q;
 return null;
}
function draft(s,cat,i,item){
 const {k,q,legacy}=keys(cat,i);if(s.itemEditors?.[k]){const saved=clone(s.itemEditors[k]);if((saved.businessDate||businessDate(saved.savedAt))!==businessDate())saved.soldConfirmed=false;return saved}
 const p={...s.prod?.[legacy],...s.prod?.[k]},c=s.commercial?.[k]||{},price=s.pricing?.[k]||{};
 const raw=s.qtys?.[q],sold=raw&&typeof raw==='object'?(raw.unit==='g'?raw.qty/1000:raw.qty):raw;
 return {mode:s.prod?.[legacy]||p.todaysProduction||item.standaloneSide?'production':'purchased',unit:item.standaloneSide?'pack':item.baseUnit==='Kg'?'kg':'piece',
 batchSize:p.unitsPerBatch??p.batchSize??p.kgBatchSize??'',batches:p.batchesToday??p.numBatches??p.kgNumBatches??'',
 capacity:p.productionCapacityPerDay??p.capacity??p.kgCapacity??'',purchaseRate:item.purchasedCost??'',
 sold:sold??'',soldConfirmed:false,spoilage:c.foodSpoilagePct??c.spoilagePct??p.spoil??5,
 uuwp:c.safetyPct??5,markup:price.markupPct??25,price:price.currentPrice??item.price??'',
 condiments:clone(s.condiments?.[k]||[]).map(x=>({...x,source:'recipe',portion:x.qty,portionUnit:x.unit||'kg'})),
 packaging:clone(s.packaging?.[k]||[]),packingPer:1};
}
function calculate(d,item,recipes){
 const missing=[],sold=number(d.sold),made=(number(d.batchSize)||0)*(number(d.batches)||0);
 const primary=d.mode==='production'?recipe(recipes,item.name):null;
 const base=d.mode==='production'?unitCost(primary):number(d.purchaseRate);
 if(base===null)missing.push(d.mode==='production'?'Primary recipe / ingredient rates':'Supplier price');
 if(primary&&!(item.standaloneSide&&item.recipePortion)&&convert(1,d.unit,primary.yieldUnit)===null)missing.push('Recipe yield unit does not match sales unit');
 if(primary&&item.standaloneSide&&item.recipePortion&&convert(item.recipePortion,item.recipePortionUnit,primary.yieldUnit)===null)missing.push('Standalone serving unit does not match Recipe Master yield');
 let primaryQty=1;if(primary&&item.standaloneSide&&item.recipePortion)primaryQty=convert(item.recipePortion,item.recipePortionUnit,primary.yieldUnit);else if(primary)primaryQty=convert(1,d.unit,primary.yieldUnit);
 const baseCost=base===null?0:base*(primary?(primaryQty||0):1);
 let cond=0;
 for(const x of d.condiments||[]){
  const r=recipe(recipes,x.recipeName),rate=x.source==='purchase'?number(x.purchaseRate):unitCost(r);
  const amount=number(x.portion),qty=amount===null?null:convert(amount,x.portionUnit,x.source==='purchase'?x.rateUnit:r?.yieldUnit);
  if(rate===null||qty===null)missing.push(x.recipeName+' rate / portion unit');else cond+=rate*qty;
 }
 const packingCost=packing(d);missing.push(...packingCost.missing);
 const parcelSize=packingCost.per||1,parcelPackCost=packingCost.perPack,parcels=sold===null?null:Math.ceil(sold/parcelSize),totalPacking=sold===null?null:parcels*parcelPackCost;
 const pack=sold>0?totalPacking/sold:packingCost.perItem;
 const spoil=(baseCost+cond)*(number(d.spoilage)||0)/100,final=baseCost+cond+spoil+pack;
 // Preserve the established rule: production with known leftovers does not add a second UUWP allowance.
 const apply=d.mode==='purchased'||sold===null||made===sold;
 const withUuwp=final*(1+(apply?(number(d.uuwp)||0)/100:0));
 return {base:baseCost,cond,pack,packingCost,parcelSize,parcelPackCost,parcels,totalPacking,spoil,final,withUuwp,apply,made,sold,unsold:sold===null?null:made-sold,
 suggested:withUuwp*(1+(number(d.markup)||0)/100),soldCost:sold===null?null:final*sold,
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
 const c=calculate(d,item,recipes);if(c.missing.length)throw Error('Complete cost inputs: '+c.missing.join(', '));
 const token=Date.now()+'-'+Math.random().toString(36).slice(2),savedDraft={...clone(d),savedAt:new Date().toISOString(),businessDate:businessDate(),saveToken:token,soldConfirmed:true};
 latest.itemEditors[k]=savedDraft;latest.qtys[q]=d.unit==='kg'?{qty:Number(d.sold)*1000,unit:'g'}:Number(d.sold);
 latest.condiments[k]=d.condiments.map(x=>({...x,qty:convert(Number(x.portion),x.portionUnit,recipe(recipes,x.recipeName)?.yieldUnit||x.rateUnit),unit:recipe(recipes,x.recipeName)?.yieldUnit||x.rateUnit}));
 latest.packaging[k]=d.packaging.map(x=>({...x,qty:Number(x.qty)/(Number(d.packingPer)||1)}));
 latest.pricing[k]={...latest.pricing[k],markupPct:Number(d.markup),currentPrice:Number(d.price)};
 latest.commercial[k]={...latest.commercial[k],mode:d.mode,finalCogs:c.final,cogsWithUuwp:c.withUuwp,foodSpoilagePct:Number(d.spoilage),safetyPct:Number(d.uuwp),uuwpApplies:c.apply,unsold:c.unsold,todaysProduction:d.mode==='production'?c.made:0,purchasedQuantity:d.mode==='purchased'?c.made:0,totalProductionCost:d.mode==='production'?c.made*c.final:0,soldQuantity:c.sold,totalSoldCogs:c.soldCost,packingParcelSize:c.parcelSize,packingParcels:c.parcels,totalPackingCost:c.totalPacking,packingCogsPerUnit:c.pack};
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
root.M2={clone,number,norm,keys,state,hasItem,selected,saveSelection,packing,recipe,unitCost,convert,draft,calculate,read,write,project,saveItem,cache,sideRecipes,installSides};
})(typeof window==='undefined'?globalThis:window);
