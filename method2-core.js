/* Method 2 v4: one owner for calculations and verified Google persistence. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)), number=x=>x!==''&&x!==null&&x!==undefined&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const keys=(cat,i)=>({k:cat+'::'+i,q:cat+'|'+i,legacy:cat.replace(/\s+/g,'_')+'-'+i});
const maps=['qtys','prod','condiments','packaging','pricing','commercial','itemEditors'];
const businessDate=(date=new Date())=>new Date(date).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
const SIDES='Sides & Extras';
const canonicalRecipeName=n=>({'general idly':'Idly','general idli':'Idly','general idly sambar':'Idli Sambar','general idli sambar':'Idli Sambar','general coconut chutney':'Coconut Chutney','general pudina chutney':'Pudina Chutney'}[String(n||'').toLowerCase().trim()]||n);
const purchaseKey=name=>norm(canonicalRecipeName(name));
// Accept both the published supplier schema and the component editor schema.
function purchaseConfig(x={},unit){
 if(x.purchase)return purchaseConfig(x.purchase,unit);
 if(Object.prototype.hasOwnProperty.call(x,'total'))return clone(x);
 const basis=x.purchaseBasis||x.basis||'unit',batch=basis==='batch';
 return {basis,qty:batch?(x.purchaseBatchQty??x.batchQty??''):1,unit:batch?(x.purchaseBatchUnit||x.batchUnit||x.rateUnit||unit):(x.rateUnit||x.batchUnit||unit),total:batch?(x.purchaseBatchCost??x.batchCost??''):(x.purchaseRate??x.unitCost??''),supplier:x.supplier||'',date:x.date||''};
}
function purchaseRate(p){const qty=number(p?.qty),total=number(p?.total);return qty>0&&total!==null?total/qty:null}
function masterEntry(masters={},name){return masters[norm(name)]||masters[purchaseKey(name)]||Object.entries(masters).find(([key])=>purchaseKey(key)===purchaseKey(name))?.[1]}
function masterFingerprint(masters={},name){return JSON.stringify(Object.entries(masters).filter(([key])=>purchaseKey(key)===purchaseKey(name)).sort(([a],[b])=>a.localeCompare(b)))}
function masterRecord(p,previous={},extra={}){return {...previous,...clone(p),unitCost:purchaseRate(p),batchQty:p.basis==='batch'?number(p.qty):null,batchCost:p.basis==='batch'?number(p.total):null,batchUnit:p.unit,...extra}}
function isSide(r){return /CONDIMENT/i.test(r.kind||r.category||'')||/sambar|chutney|poriyal|raita|kurma/i.test(r.name||'')}
function sideRecipes(recipes){const out=[],seen=new Set();for(const r of recipes||[]){if(!isSide(r))continue;const name=canonicalRecipeName(r.name),key=purchaseKey(name);if(seen.has(key))continue;seen.add(key);out.push({...r,name})}return out}
function sideItem(name,r={}){name=canonicalRecipeName(name);return {name,recipeName:name,recipeId:String(r.id||r.recipeId||purchaseKey(name)),side:true,standaloneSide:true,baseUnit:'pack',defaultMode:'production',servingQty:/sambar/i.test(name)?200:'',servingUnit:convert(1,r.yieldUnit,'ml')!==null||/sambar/i.test(name)?'ml':'g',recipePortion:/sambar/i.test(name)?200:null,recipePortionUnit:/sambar/i.test(name)?'ml':null,price:'',purchasedCost:''}}
function sideCatalogue(s,recipes=[]){
 // Keep saved slots in place: never deduplicate or reorder an existing index.
 const available=sideRecipes(recipes),old=s.sideCatalogue||[];
 const items=Array.isArray(s.sideCatalog)&&s.sideCatalog.length?s.sideCatalog.map((name,i)=>({...sideItem(name,recipe(recipes,name)),...(old[i]&&purchaseKey(old[i].name)===purchaseKey(name)?old[i]:{}),name:canonicalRecipeName(name),recipeName:canonicalRecipeName(name)})):clone(old);
 for(const r of available){const id=String(r.id||r.recipeId||purchaseKey(r.name)),found=items.find(x=>x.recipeId===id||purchaseKey(x.recipeName||x.name)===purchaseKey(r.name));if(found){found.recipeName=canonicalRecipeName(r.name);continue}items.push(sideItem(r.name,r))}
 return items;
}
function installSides(s,recipes=[]){
 // Retain compatibility with the published installSides(recipes,state) API.
 if(Array.isArray(s)){const old=s;s=recipes||{};recipes=old}
 const items=sideCatalogue(s,recipes);if(root.ITEM_DATA&&root.CAT_ORDER){root.ITEM_DATA[SIDES]=items;if(!root.CAT_ORDER.includes(SIDES))root.CAT_ORDER.push(SIDES)}return items;
}
function hydratePurchases(d,item,masters={}){
 normalizePacking(d);
 const main=masterEntry(masters,item.recipeName||item.name);
 d.purchase=main?purchaseConfig(main,item.side?d.servingUnit:d.unit):purchaseConfig(d,item.side?d.servingUnit:d.unit);
 for(const x of d.condiments||[]){const p=masterEntry(masters,x.recipeName);x.purchase=p?purchaseConfig(p,x.rateUnit||x.portionUnit):purchaseConfig(x,x.rateUnit||x.portionUnit)}
 return d;
}
function purchasedSources(d,item){const entries=[];if(d.mode==='purchased')entries.push([item.recipeName||item.name,purchaseConfig(d,item.side?d.servingUnit:d.unit)]);for(const x of d.condiments||[])if(x.source==='purchase')entries.push([x.recipeName,purchaseConfig(x,x.rateUnit||x.portionUnit)]);return entries}
function putMaster(latest,name,p,extra){const key=norm(name),previous=masterEntry(latest.purchaseMasters,name)||{};latest.purchaseMasters[key]=masterRecord(p,previous,{name,...extra});return key}
async function savePurchaseUnlocked(outlet,name,p,baseline){
 if(purchaseRate(p)===null||!['piece','pack','g','kg','ml','L'].includes(p.unit))throw Error('Enter a positive purchase quantity, its unit and total price.');
 const latest=state(await read(outlet)),original=clone(latest);
 if(masterFingerprint(latest.purchaseMasters,name)!==masterFingerprint(baseline.purchaseMasters,name))throw Error('This purchase master changed elsewhere. Reload before saving.');
 const token=Date.now()+'-'+Math.random().toString(36).slice(2),key=putMaster(latest,name,p,{saveToken:token,savedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
 return write(outlet,'METHOD2','default',latest,x=>x?.purchaseMasters?.[key]?.saveToken===token,original);
}
function savePurchase(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>savePurchaseUnlocked(...args)):savePurchaseUnlocked(...args)}
function state(s){s=clone(s||{});maps.forEach(k=>s[k]=s[k]||{});s.selection=s.selection||{};s.sideCatalog=Array.isArray(s.sideCatalog)?s.sideCatalog:[];s.purchaseMasters=s.purchaseMasters||{};return s}
function hasItem(s,cat,i){const {k,q,legacy}=keys(cat,i);return !!(s.itemEditors?.[k]||s.qtys?.[q]!==undefined||s.prod?.[legacy]||Number(s.prod?.[k]?.todaysProduction)>0||s.condiments?.[k]?.length||s.packaging?.[k]?.length)}
function selected(s,cat,i){const entry=s.selection?.[cat];if(cat===SIDES&&Array.isArray(entry?.names)){const item=root.ITEM_DATA?.[cat]?.[i]||sideCatalogue(s)[i];return !!item&&entry.names.some(n=>purchaseKey(n)===purchaseKey(item.name))}return Array.isArray(entry?.indices)?entry.indices.includes(Number(i)):hasItem(s,cat,i)}
async function saveSelectionUnlocked(outlet,cat,indices,baseline,catalogue){
 const latest=state(await read(outlet)),original=clone(latest);
 if(JSON.stringify(latest.selection[cat])!==JSON.stringify(baseline.selection?.[cat]))throw Error('This category selection changed in another window. Reload before saving.');
 if(cat===SIDES){
  if(JSON.stringify([latest.sideCatalog,latest.sideCatalogue||[]])!==JSON.stringify([baseline.sideCatalog,baseline.sideCatalogue||[]]))throw Error('The sides catalogue changed elsewhere. Reload before saving.');
  if(!Array.isArray(catalogue))throw Error('Load the sides catalogue first.');
  latest.sideCatalogue=clone(catalogue);
 }
 const token=Date.now()+'-'+Math.random().toString(36).slice(2);
 const clean=[...new Set(indices.filter(i=>Number.isInteger(i)&&i>=0))].sort((a,b)=>a-b);
 if(cat==='Sides & Extras'){latest.sideCatalog=(ITEM_DATA[cat]||[]).map(x=>x.name);latest.selection[cat]={names:clean.map(i=>ITEM_DATA[cat]?.[i]?.name).filter(Boolean),token,savedAt:new Date().toISOString()}}
 else latest.selection[cat]={indices:clean,token,savedAt:new Date().toISOString()};
 return write(outlet,'METHOD2','default',latest,s=>s?.selection?.[cat]?.token===token,original);
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
function packingOwners(d){
 const split=Object.prototype.hasOwnProperty.call(d,'itemPackaging');
 return {main:d.mainPacking||(split?{packaging:d.itemPackaging||[],packingPer:d.itemPackingPer??1,packingMode:d.itemPackingMode}:d),
 common:d.commonPacking||(split?{packaging:d.packaging||[],packingPer:d.packingPer??1,packingMode:d.packingMode}:{packaging:[],packingPer:1,packingMode:'none'})};
}
function normalizePacking(d){
 const owners=packingOwners(d);
 if(!d.mainPacking)d.mainPacking={packaging:clone(owners.main.packaging||[]),packingPer:owners.main.packingPer??1,packingMode:owners.main.packingMode};
 if(!d.commonPacking)d.commonPacking=clone(owners.common);
 return d;
}
function recipe(recipes,name){const target=purchaseKey(name);return recipes.find(r=>norm(r.name)===target)||recipes.find(r=>purchaseKey(r.name)===target)}
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
 const {k,q,legacy}=keys(cat,i);if(s.itemEditors?.[k]){const saved=clone(s.itemEditors[k]);if((saved.businessDate||businessDate(saved.savedAt))!==businessDate())saved.soldConfirmed=false;saved.condiments=saved.condiments||[];saved.packaging=saved.packaging||[];saved.servingQty=saved.servingQty??item.servingQty??item.recipePortion;saved.servingUnit=saved.servingUnit||item.servingUnit||item.recipePortionUnit;saved.uuwpPolicy=saved.uuwpPolicy||(saved.packingSchemaVersion?'always':'legacy');return hydratePurchases(normalizePacking(saved),item,s.purchaseMasters)}
 const p={...s.prod?.[legacy],...s.prod?.[k]},c=s.commercial?.[k]||{},price=s.pricing?.[k]||{};
 const raw=s.qtys?.[q],sold=raw&&typeof raw==='object'?(raw.unit==='g'?raw.qty/1000:raw.qty):raw;
 return hydratePurchases({mode:s.prod?.[legacy]||p.todaysProduction||item.standaloneSide?'production':item.defaultMode||'purchased',unit:item.side||item.standaloneSide?'pack':item.baseUnit==='Kg'?'kg':'piece',servingQty:item.servingQty??item.recipePortion,servingUnit:item.servingUnit||item.recipePortionUnit,pricingBasis:'markup',uuwpPolicy:hasItem(s,cat,i)?'legacy':'always',
 batchSize:p.unitsPerBatch??p.batchSize??p.kgBatchSize??'',batches:p.batchesToday??p.numBatches??p.kgNumBatches??'',
 capacity:p.productionCapacityPerDay??p.capacity??p.kgCapacity??'',purchaseRate:s.purchaseMasters?.[norm(item.name)]?.unitCost??(hasItem(s,cat,i)?item.purchasedCost??'':''),purchaseBasis:s.purchaseMasters?.[norm(item.name)]?.basis??'unit',purchaseBatchQty:s.purchaseMasters?.[norm(item.name)]?.batchQty??'',purchaseBatchCost:s.purchaseMasters?.[norm(item.name)]?.batchCost??'',purchaseBatchUnit:s.purchaseMasters?.[norm(item.name)]?.batchUnit??(item.baseUnit==='Kg'?'kg':'piece'),
 sold:sold??'',soldConfirmed:false,spoilage:c.foodSpoilagePct??c.spoilagePct??p.spoil??5,
 uuwp:c.safetyPct??5,markup:price.markupPct??25,price:price.currentPrice??item.price??'',
 condiments:clone(s.condiments?.[k]||[]).map(x=>({...x,source:x.source||'recipe',portion:x.portion??x.qty,portionUnit:x.portionUnit||x.unit||'kg'})),
 packaging:clone(s.packaging?.[k]||[]).filter(x=>x.packingOwner!=='condiment'),packingPer:1,packingMode:hasItem(s,cat,i)?undefined:''},item,s.purchaseMasters);
}
function calculate(d,item,recipes){
 const missing=[],sold=number(d.sold),made=(number(d.batchSize)||0)*(number(d.batches)||0);
 const name=item.recipeName||item.name,primary=d.mode==='production'?recipe(recipes,name):null;
 // purchaseConfig also reads published purchaseBasis / purchaseBatch* supplier fields.
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
  usage.push({name:canonicalRecipeName(n),source,quantity:sold===null||qty===null?null:convert(qty,unit,normalized)*sold,unit:normalized,role});
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
 const owners=packingOwners(d),commonCost=packingCharge(owners.common,sold),packingCost=packingCharge({...owners.main,mode:d.mode},sold),components=[{name:item.name,source:d.mode,food:baseCost,foodMissing:mainFoodMissing,packingCost},...sideComponents];
 for(const component of components){component.packing=component.packingCost.allocated;component.subtotal=component.food+component.packing;component.incomplete=component.foodMissing||component.packingCost.missing.length>0;missing.push(...component.packingCost.missing.map(m=>component.name+': '+m))}
 const parcelSize=packingCost.per||1,parcelPackCost=packingCost.perPack,parcels=packingCost.parcels,totalPacking=sold===null?null:commonCost.total+components.reduce((sum,x)=>sum+x.packingCost.total,0);
 missing.push(...commonCost.missing.map(m=>'Common / order packing: '+m));
 const pack=commonCost.allocated+components.reduce((sum,x)=>sum+x.packing,0);
 const spoil=(baseCost+cond)*(number(d.spoilage)||0)/100,final=baseCost+cond+spoil+pack;
 // UUWP is a visible pricing allowance for every source, never a second procurement expense.
 const apply=d.uuwpPolicy!=='legacy'||d.mode==='purchased'||sold===null||made===sold;
 const withUuwp=final*(1+(apply?(number(d.uuwp)||0)/100:0));
 const percent=number(d.markup),margin=d.pricingBasis==='margin';
 if(margin&&(percent===null||percent>=100))missing.push('Target margin must be at least 0 and below 100%');
 return {commonCost,commonPacking:commonCost.allocated,base:baseCost,baseQty,sourceUnit,usage,cond,pack,packingCost,components,baseWithPacking:components[0].subtotal,condWithPacking:sideComponents.reduce((sum,x)=>sum+x.subtotal,0),parcelSize,parcelPackCost,parcels,totalPacking,spoil,final,withUuwp,apply,made,sold,unsold:sold===null?null:made-sold,
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
 if(module==='METHOD2'&&key==='default'){
  const current=await read(outlet),expected=arguments[5];
  if(expected!==undefined&&JSON.stringify(state(current))!==JSON.stringify(state(expected)))throw Error('Google record changed while saving. Reload before retrying; nothing overwritten.');
  await backup(outlet,current,'Before Method 2 save');
  if(JSON.stringify(await read(outlet))!==JSON.stringify(current))throw Error('Google record changed while creating the backup. Reload before retrying.');
 }
 await BOBS_DATA.saveModule(outlet,module,key,data);
 for(let n=0;n<3;n++){const saved=await read(outlet,module,key);if(check(saved))return saved;await new Promise(r=>setTimeout(r,500))}
 throw Error('Save sent, but Google read-back is not confirmed. Keep this page open and retry verification.');
}
function orderPackingCost(s){
 const p=s?.orderPacking,missing=[];let total=0;
 if(!p?.enabled)return {total,missing};
 for(const row of p.rows||[]){const qty=number(row.qty),rate=number(row.unitCost);if(!String(row.name||'').trim()||qty===null||!Number.isInteger(qty)||rate===null)missing.push('Enter a material, whole bag count and price for every shared-packing row');else total+=qty*rate}
 if(!p.rows?.length)missing.push('Add shared packing materials or turn off shared packing');
 return {total,missing};
}
async function backup(outlet,data,reason){
 const key='m2-'+Date.now()+'-'+Math.random().toString(36).slice(2),snapshot={schema:1,outlet:String(outlet),createdAt:new Date().toISOString(),reason,backupToken:key,data:clone(data)};
 await write(outlet,'METHOD2_BACKUPS',key,snapshot,x=>x?.backupToken===key&&JSON.stringify(x.data)===JSON.stringify(data));
 return key;
}
async function backups(outlet){const r=await BOBS_DATA.jsonp({action:'moduleList',outletId:outlet,module:'METHOD2_BACKUPS'});if(r?.ok!==true||!Array.isArray(r.records))throw Error('Google backup list unavailable.');return r.records.filter(x=>x.status!=='DELETED'&&x.data?.schema===1).sort((a,b)=>String(b.data.createdAt).localeCompare(String(a.data.createdAt)))}
async function restoreUnlocked(outlet,key,expected){
 const snap=await read(outlet,'METHOD2_BACKUPS',key);
 if(snap?.schema!==1||String(snap.outlet)!==String(outlet)||!snap.backupToken||!snap.data||typeof snap.data!=='object')throw Error('This is not a restorable backup for this outlet.');
 const current=await read(outlet);if(JSON.stringify(current)!==JSON.stringify(expected))throw Error('Outlet data changed since preview. Reload recovery before restoring.');
 const data=clone(snap.data),token=Date.now()+'-'+Math.random().toString(36).slice(2);data._method2Restore={token,backupKey:key,restoredAt:new Date().toISOString()};
 return write(outlet,'METHOD2','default',data,x=>x?._method2Restore?.token===token&&JSON.stringify({...x,_bobsMeta:null})===JSON.stringify({...data,_bobsMeta:null}),current);
}
function restore(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>restoreUnlocked(...args)):restoreUnlocked(...args)}
async function saveOrderPackingUnlocked(outlet,p,baseline){
 const cost=orderPackingCost({orderPacking:p});if(cost.missing.length)throw Error(cost.missing.join('. '));
 const latest=state(await read(outlet)),original=clone(latest);
 if(JSON.stringify(latest.orderPacking)!==JSON.stringify(baseline.orderPacking))throw Error('Shared packing changed elsewhere. Reload before saving.');
 const token=Date.now()+'-'+Math.random().toString(36).slice(2);
 latest.orderPacking={...clone(p),saveToken:token,savedAt:new Date().toISOString(),businessDate:businessDate()};
 return write(outlet,'METHOD2','default',latest,x=>x?.orderPacking?.saveToken===token,original);
}
function saveOrderPacking(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>saveOrderPackingUnlocked(...args)):saveOrderPackingUnlocked(...args)}
function project(s,cat,i){const k=keys(cat,i);return Object.fromEntries(maps.map(m=>[m,m==='qtys'?s[m]?.[k.q]:m==='prod'?[s[m]?.[k.k],s[m]?.[k.legacy]]:s[m]?.[k.k]]))}
async function saveItemUnlocked(outlet,cat,i,item,d,baseline,recipes){
 const latest=state(await read(outlet)),original=clone(latest),{k,q,legacy}=keys(cat,i);
 if(JSON.stringify(project(latest,cat,i))!==JSON.stringify(project(baseline,cat,i)))throw Error('This item changed in another window. Reload before saving; your draft remains here.');
 const purchases=purchasedSources(d,item);
 for(const [name] of purchases)if(masterFingerprint(latest.purchaseMasters,name)!==masterFingerprint(baseline.purchaseMasters,name))throw Error(name+' purchase master changed elsewhere. Reload before saving.');
 const c=calculate(d,item,recipes);if(c.missing.length)throw Error('Complete cost inputs: '+c.missing.join(', '));
 if(number(d.sold)===null||c.sold>c.made||!(c.made>0))throw Error('Enter valid availability and Sold Today quantities.');
 const token=Date.now()+'-'+Math.random().toString(36).slice(2),savedDraft={...clone(d),packingSchemaVersion:3,savedAt:new Date().toISOString(),businessDate:businessDate(),saveToken:token,soldConfirmed:true};
 normalizePacking(savedDraft);
 // Mirror the published split fields; canonical objects retain inactive rows.
 savedDraft.itemPackaging=c.packingCost.mode==='required'?clone(savedDraft.mainPacking.packaging):[];
 savedDraft.itemPackingPer=savedDraft.mainPacking.packingPer;savedDraft.itemPackingMode=savedDraft.mainPacking.packingMode;
 savedDraft.packaging=c.commonCost.mode==='required'?clone(savedDraft.commonPacking.packaging):[];
 savedDraft.packingPer=savedDraft.commonPacking.packingPer;savedDraft.packingMode=savedDraft.commonPacking.packingMode;
 function mirror(owner,unit){const p=purchaseConfig(owner,unit);owner.purchaseBasis=p.basis;owner.purchaseBatchQty=p.basis==='batch'?p.qty:'';owner.purchaseBatchCost=p.basis==='batch'?p.total:'';owner.purchaseBatchUnit=p.unit;owner.purchaseRate=purchaseRate(p);owner.rateUnit=p.unit}
 if(d.mode==='purchased')mirror(savedDraft,item.side?d.servingUnit:d.unit);
 for(const x of savedDraft.condiments||[])if(x.source==='purchase')mirror(x,x.rateUnit||x.portionUnit);
 latest.itemEditors[k]=savedDraft;latest.qtys[q]=d.unit==='kg'?{qty:Number(d.sold)*1000,unit:'g'}:Number(d.sold);
 for(const [name,p] of purchases)putMaster(latest,name,p,{saveToken:token,savedAt:savedDraft.savedAt,updatedAt:savedDraft.savedAt});
 latest.condiments[k]=d.condiments.map(x=>({...x,qty:convert(Number(x.portion),x.portionUnit,recipe(recipes,x.recipeName)?.yieldUnit||x.rateUnit),unit:recipe(recipes,x.recipeName)?.yieldUnit||x.rateUnit}));
 const owners=packingOwners(d),packingEntries=[{owner:owners.main,pc:c.packingCost,kind:'main',name:item.name},...d.condiments.map((owner,index)=>({owner,pc:c.components[index+1].packingCost,kind:'condiment',name:owner.recipeName})),{owner:owners.common,pc:c.commonCost,kind:'common',name:'Common / order'}];
 latest.packaging[k]=packingEntries.flatMap(({owner,pc,kind,name})=>pc.mode!=='required'?[]:(owner.packaging||[]).map(x=>({...x,qty:Number(x.qty)*(c.sold>0?pc.parcels/c.sold:1/(pc.per||1)),packingOwner:kind,ownerName:name})));
 latest.pricing[k]={...latest.pricing[k],markupPct:Number(d.markup),pricingBasis:d.pricingBasis||'markup',currentPrice:Number(d.price)};
 latest.commercial[k]={...latest.commercial[k],mode:d.mode,finalCogs:c.final,cogsWithUuwp:c.withUuwp,foodSpoilagePct:Number(d.spoilage),safetyPct:Number(d.uuwp),uuwpApplies:c.apply,unsold:c.unsold,todaysProduction:d.mode==='production'?c.made:0,purchasedQuantity:d.mode==='purchased'?c.made:0,totalProductionCost:d.mode==='production'?c.made*c.final:0,soldQuantity:c.sold,totalSoldCogs:c.soldCost,packingParcelSize:c.parcelSize,packingParcels:c.parcels,totalPackingCost:c.totalPacking,packingCogsPerUnit:c.pack,commonPackingCogsPerUnit:c.commonPacking,totalCommonPackingCost:c.commonCost.total,packingBreakdown:c.components.map(x=>({name:x.name,mode:x.packingCost.mode,unitsPerSet:x.packingCost.per,sets:x.packingCost.parcels,perUnit:x.packing,total:x.packingCost.total}))};
 latest.prod[k]={...latest.prod[k],mode:d.mode,unitsPerBatch:Number(d.batchSize),batchesToday:Number(d.batches),todaysProduction:d.mode==='production'?c.made:0};
 if(d.mode==='production')latest.prod[legacy]={...latest.prod[legacy],format:d.unit==='kg'?'kg':'batch',batchSize:d.batchSize,numBatches:d.batches,kgBatchSize:d.batchSize,kgNumBatches:d.batches,spoil:d.spoilage,capacity:d.capacity};
 else delete latest.prod[legacy];
 return write(outlet,'METHOD2','default',latest,x=>x?.itemEditors?.[k]?.saveToken===token,original);
}
function saveItem(...args){return root.navigator?.locks?root.navigator.locks.request('bobs-method2-'+args[0],()=>saveItemUnlocked(...args)):saveItemUnlocked(...args)}
function cache(outlet,s){
 // Compatibility mirror only. Every new editor always reads Google first.
 const old=localStorage.getItem('method2-item-state');if(old&&!localStorage.getItem('method2-before-v4'))localStorage.setItem('method2-before-v4',old);
 localStorage.setItem('method2-verified-'+outlet,JSON.stringify(s));
 localStorage.setItem('method2-item-state',JSON.stringify(s));
 const all=JSON.parse(localStorage.getItem('outlet-analysis-data')||'{}');
 const savedKeys=Object.keys(s.itemEditors||{}),summary=(savedKeys.length||s.orderPacking)?{method2DailySales:savedKeys.reduce((sum,k)=>sum+(number(s.commercial?.[k]?.soldQuantity)||0)*(number(s.pricing?.[k]?.currentPrice)||0),0),method2PurchaseCost:orderPackingCost(s).total+savedKeys.reduce((sum,k)=>sum+(number(s.commercial?.[k]?.totalSoldCogs)||0),0)}:{};
 all[outlet]={...all[outlet],method2:s,...summary};localStorage.setItem('outlet-analysis-data',JSON.stringify(all));
}
root.M2={orderPackingCost,saveOrderPacking,backup,backups,restore,clone,number,norm,keys,state,hasItem,selected,saveSelection,packing,packingCharge,recipe,unitCost,convert,draft,calculate,read,write,project,saveItem,cache,SIDES,purchaseKey,purchaseConfig,purchaseRate,isSide,sideCatalogue,installSides,hydratePurchases,savePurchase,sideRecipes,canonicalRecipeName,masterEntry};
})(typeof window==='undefined'?globalThis:window);
