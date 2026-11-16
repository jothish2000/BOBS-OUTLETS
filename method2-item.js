(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),outlet=q.get('outlet'),cat=q.get('cat'),i=Number(q.get('i'));let item;
 $('sharedOrderLink').href='method2-overall.html?outlet='+encodeURIComponent(outlet||'');
const fields=['mode','batchSize','batches','capacity','purchaseRate','spoilage','uuwp','uuwpPolicy','markup','price','sold','servingQty','servingUnit','pricingBasis'];
let baseline,recipes=[],d,dirty=false,busy=false,soldTouched=false,loading=false,ready=false,loadEpoch=0,standardRecipes=[];
const servingRecipe=q.get('servingRecipe');let servingStatus='edit',servingStart=null;
function servingSide(source){const rows=(source?.condiments||[]).filter(x=>M2.purchaseKey(x.recipeName)===M2.purchaseKey(servingRecipe||''));return rows.length===1?rows[0]:null;}
function focusServing(){const field=$('servingShortcutQuantity');if(!field)throw Error('The requested side is not uniquely present. Return to the recipe and review the item settings.');for(let p=field.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;field.scrollIntoView({block:'center'});field.focus({preventScroll:true});}
function setupServingShortcut(){
 if(!servingRecipe)return;
 $('servingReferenceHelp')?.remove();
 const side=servingSide(d),field=[...$('condiments').querySelectorAll('.component')].find(el=>M2.purchaseKey(el.querySelector('h3')?.dataset.recipeName||'')===M2.purchaseKey(servingRecipe))?.querySelector('.fields input');
 let box=$('servingShortcut');if(!box){box=document.createElement('section');box.id='servingShortcut';box.className='notice';$('condiments').before(box);}
 box.replaceChildren();const h=document.createElement('h2');h.textContent='Change '+servingRecipe+' serving quantity';box.append(h);
 const info=document.createElement('p');info.textContent='Edit QUANTITY SERVED PER UNIT SOLD and its portion unit below. Save only this serving change, then return to the previous step to review its new total before calculating. Other item entries are not saved by this button.';box.append(info);
 if(!side||!field){info.textContent='The requested side was not found uniquely. Nothing has been changed. Return to the recipe and review this item’s sides.';return;}
 field.id='servingShortcutQuantity';field.setAttribute('aria-label',servingRecipe+' quantity served per unit sold');
 const unit=field.closest('.fields').querySelectorAll('select')[1];unit.id='servingShortcutUnit';

 const helper=document.createElement('div');helper.id='servingReferenceHelp';
 const note=document.createElement('p');note.textContent='Choose a serving amount per ONE '+(d.unit||'menu item')+'. Use a measured trial of your ladle/spoon and customer service needs. Examples below are planning choices, not a universal small-hotel standard. No suggestion is selected automatically.';helper.append(note);
 const label=document.createElement('label');label.textContent='Optional serving-size examples ';
 const select=document.createElement('select');select.id='servingExample';
 const volume=M2.convert(1,unit.value,'ml')!==null,mass=M2.convert(1,unit.value,'g')!==null,exampleUnit=volume?'ml':mass?'g':unit.value;
 for(const v of ['',...(volume?[20,30,40,50]:mass?[5,10,15,20]:[])]){const o=document.createElement('option');o.value=v;o.textContent=v===''?'Choose an example, or type your own amount':v+' '+exampleUnit+' per '+(d.unit||'menu item');select.append(o);}
 select.onchange=()=>{if(!select.value)return;const amount=M2.convert(+select.value,exampleUnit,unit.value);if(amount===null)return;field.value=amount;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));focusServing();};label.append(select);helper.append(label);
 const source=/sambar/i.test(servingRecipe)?['Tiffin sambar recipe and serving context','https://www.indianhealthyrecipes.com/idli-sambar-recipe-tiffin-sambar/']:/chutney/i.test(servingRecipe)?['Chutney recipe and serving context','https://www.indianhealthyrecipes.com/coriander-coconut-chutney/']:null;
 if(source){const a=document.createElement('a');a.href=source[1];a.textContent=source[0]+' — optional external reference ↗';a.target='_blank';a.rel='noopener noreferrer';helper.append(a);const p=document.createElement('p');p.textContent='This reference describes the recipe and servings; it does not prescribe the example amounts per individual item. You do not need to open it to continue.';helper.append(p);}
 else {const p=document.createElement('p');p.textContent='No verified external serving-size reference is linked for this side. Use your measured serving amount; no industry-standard amount is assumed.';helper.append(p);}
 field.closest('.fields').before(helper);

 const button=document.createElement('button');button.type='button';button.id='saveServingShortcut';button.textContent='Save serving quantity & return to previous step →';button.onclick=saveServingShortcut;box.append(button);
 const message=document.createElement('p');message.id='servingShortcutStatus';message.role='status';box.append(message);
}
async function saveServingShortcut(){
 if(busy||loading||!ready)return;
 if(window.BOBS_REFERENCE?.ensureServing(saveServingShortcut))return;
 const side=servingSide(d);if(!side||!(M2.number(side.portion)>0))return status('Enter a positive serving quantity before saving.');
 const originalDraft=M2.draft(baseline,cat,i,item),next=M2.clone(originalDraft),target=servingSide(next);
 if(!target)return status('Saved side changed. Reload before saving.');
 if(M2.convert(Number(side.portion),side.portionUnit,target.portionUnit)===null)return status('Choose a compatible serving unit: use ml/litres for a volume or g/kg for a weight. No weight-to-volume conversion is assumed.');
 target.portion=side.portion;target.portionUnit=side.portionUnit;
 // The shortcut saves only the named serving; leave other local edits open.
 const remainder=M2.clone(d),before=M2.clone(servingStart||originalDraft),local=servingSide(remainder),old=servingSide(before);
 local.portion=old.portion;local.portionUnit=old.portionUnit;delete remainder.soldConfirmed;delete before.soldConfirmed;
 // Compare actual item fields, ignoring display-normalised scalar types.
 const otherFields=fields;
 if(otherFields.some(id=>String(remainder[id]??'')!==String(before[id]??''))||['condiments','mainPacking','commonPacking','packaging','purchase'].some(key=>JSON.stringify(remainder[key])!==JSON.stringify(before[key])))return status('Other item fields were changed too. Keep this draft open and save those separately before using the serving-only shortcut.');
 busy=true;servingStatus='saving';$('controls').disabled=true;$('servingShortcutStatus').textContent='Saving serving quantity and verifying in Google…';window.dispatchEvent(new Event('bobs-guide-context'));
 try{
 const saved=await M2.savePlanning(outlet,cat,i,item,next,baseline);baseline=M2.state(saved);dirty=false;servingStatus='saved';const token=baseline.itemEditors[M2.keys(cat,i).k].planningToken;
 $('servingShortcutStatus').textContent='Serving quantity saved and verified. Returning to the previous step…';
 const receipt={type:'bobs-side-serving-saved',outlet,key:M2.keys(cat,i).k,recipeName:servingRecipe,token};
 busy=false;BOBS_WINDOW_RETURN.notify(receipt,['bobs-side-serving']);BOBS_WINDOW_RETURN.afterSave('method2.html?outlet='+encodeURIComponent(outlet));
 }catch(e){servingStatus='edit';$('servingShortcutStatus').textContent='Not saved — '+e.message;}finally{busy=false;$('controls').disabled=false;window.dispatchEvent(new Event('bobs-guide-context'));}
}
window.BOBS_SERVING_GUIDE={snapshot:()=>servingRecipe?{name:servingRecipe,stage:!ready?'loading':servingStatus,available:!!$('servingShortcutQuantity'),message:$('servingShortcutStatus')?.textContent||$('status').textContent}:null,focus:focusServing,save:saveServingShortcut};
let activeGuideStep=1,costReviewComplete=false;
const progressKey='bobs-cost-reviews:'+JSON.stringify([outlet,cat,i]);
let localReviews={};
try {localReviews=JSON.parse(sessionStorage.getItem(progressKey)||'{}')||{}} catch {}
function costRequirements(){
 const main={name:item.recipeName||item.name,source:d.mode==='production'?'recipe':'purchase'};
 const sides=(d.condiments||[]).map(s=>({name:s.recipeName,source:s.source==='purchase'?'purchase':'recipe',portion:s.portion,unit:s.portionUnit}));
 return [main,...sides];
}
const identifier=x=>x.source+':'+M2.purchaseKey(x.name);
function costVersion(x){
 if(x.source==='purchase')return M2.masterEntry(baseline.purchaseMasters,x.name)?.saveToken;
 const recipe=M2.recipe(recipes,x.name);
 const saved=recipe&&baseline.recipeOverrides?.[M2.norm(recipe.name)];
 if(saved?.referenceStamp===BOBS_COST_FLOW.recipeStamp(recipe||{}))return saved.savedAt;
}
function reviewKey(x){
 const version=costVersion(x);
 return version&&JSON.stringify([version,String(x.portion??d.servingQty??1),x.unit||d.servingUnit||d.unit]);
}
function costReviewed(x){
 const signature=reviewKey(x);
 return !!signature&&(localReviews[identifier(x)]===signature||d.costReviews?.[identifier(x)]===signature);
}
function markReviewed(x){
 const signature=reviewKey(x);
 if(!signature)return;
 localReviews[identifier(x)]=signature;
 d.costReviews={...d.costReviews,[identifier(x)]:signature};
 try {sessionStorage.setItem(progressKey,JSON.stringify(localReviews))} catch {}
}
function pendingCosts(){return costRequirements().filter(x=>!costReviewed(x))}
function focusPendingCost(){
 const next=$('guideCostLink').querySelector('[data-next-cost]');
 if(next){activeGuideStep=1;guideProgress();next.scrollIntoView?.({block:'center'});next.focus()}
 else continueItemDetails();
}
function renderCostChecklist(){
 const host=$('guideCostLink'),list=document.createElement('ul'),pending=pendingCosts();
 $('itemRecipeChecklist').hidden=!!servingRecipe;
 costReviewComplete=!pending.length;
 for(const x of costRequirements()){
  const li=document.createElement('li'),done=costReviewed(x);
  const a=x.source==='recipe'?link(x.name):purchaseLink(x.name,x.unit||d.unit);
  a.textContent=(done?'Reviewed — ':'Review — ')+x.name;
  if(!done&&!list.querySelector('[data-next-cost]'))a.dataset.nextCost='true';
  li.append(a);
  if(!done&&costVersion(x)){
   const keep=document.createElement('button');keep.type='button';keep.className='secondary';
   keep.textContent='Keep reviewed '+x.name;
   keep.onclick=()=>{markReviewed(x);calculate();focusPendingCost()};
   li.append(' ',keep);
  }
  list.append(li);
 }
 const note=document.createElement('p');
 if(pending.length)note.textContent='Review incomplete — pending: '+pending.map(x=>x.name).join(', ');
 else {
  const c=M2.calculate(d,item,recipes),complete=c.components.every(x=>!x.foodMissing);
  note.textContent='Combined serving food cost: '+(complete?money(c.components.reduce((sum,x)=>sum+x.food,0))+' per '+d.unit:'pending ingredient prices')+'.';
 }
 host.replaceChildren(list,note);
}
function guideProgress(){for(let step=1;step<=3;step++)$('guideStep'+step).setAttribute('aria-current',activeGuideStep===step?'step':'false');$('guideProgress').textContent='Step '+activeGuideStep+' of 3: '+['','review recipe or purchase costs','enter today’s quantities, sides and packing','save this item and continue the parent flow'][activeGuideStep];}
function continueItemDetails(){if(pendingCosts().length){status('Review all selected recipes and supplier costs first: '+pendingCosts().map(x=>x.name).join(', '));focusPendingCost();return}activeGuideStep=2;guideProgress();const u=new URL(location.href);u.hash='supplyHeading';history.replaceState(history.state,'',u);const field=d.mode==='production'?$('batchSize'):$('batches');field.scrollIntoView?.({behavior:'smooth',block:'center'});field.focus({preventScroll:true});}
$('continueItemDetails').onclick=e=>{e.preventDefault();continueItemDetails()};
$('continueItemSave').onclick=()=>{if(pendingCosts().length){focusPendingCost();return}activeGuideStep=3;guideProgress();$('save').scrollIntoView({behavior:'smooth',block:'center'});$('save').focus({preventScroll:true})};
const money=n=>n===null?'—':'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function status(t){$('status').textContent=t}
function link(name){const a=document.createElement('a');const isMain=M2.purchaseKey(name)===M2.purchaseKey(item.recipeName||item.name),side=(d.condiments||[]).find(x=>M2.purchaseKey(x.recipeName)===M2.purchaseKey(name)),r=M2.recipe(recipes,name);let qty=Number(d.batchSize)*Number(d.batches);if(isMain){const per=M2.convert(item.side?M2.number(d.servingQty):1,item.side?d.servingUnit:d.unit,r?.yieldUnit);qty=per==null?0:qty*per;}if(!isMain){const per=side&&M2.convert(Number(side.portion),side.portionUnit,r?.yieldUnit);qty=per==null?0:qty*per;}a.href='recipe-cost-editor.html?'+new URLSearchParams({item:M2.canonicalRecipeName(name),outlet,qty:String(qty),cat,i:String(i)});a.target='_blank';a.textContent=name+' · recipe & cost';return a}
function purchaseLink(name,unit){const a=document.createElement('a');a.href='purchase-cost-editor.html?'+new URLSearchParams({outlet,item:name,unit:unit||'piece'});a.target='_blank';a.textContent=name+' · Purchase Master COGS';return a}
function primaryCostLink(label){const a=d.mode==='production'?link(item.recipeName||item.name):purchaseLink(item.recipeName||item.name,item.side?d.servingUnit:d.unit);a.textContent=label;return a}
// A saved Google plan describes the business. This record describes this visit to the item.
function planScope(){
 return JSON.stringify([String(outlet),cat,String(i),q.get('serviceDate')||BOBS_COST_FLOW.today()]);
}
function plannerCaller(){
 try {
  const ref=new URL(document.referrer);
  if(ref.origin!==location.origin||!/\/(production-plan|kitchen-flow|outlet-plan)\.html$/.test(ref.pathname))return false;
  const params=ref.searchParams,routeDate=params.get('serviceDate');
  if(params.get('outlet')===outlet){
   return (!params.has('cat')||params.get('cat')===cat)&&(!params.has('i')||params.get('i')===String(i))&&
    (!routeDate||routeDate===(q.get('serviceDate')||BOBS_COST_FLOW.today()));
  }
  const parent=new URL(params.get('returnTo'));
  return !!window.BOBS_KITCHENS?.isKitchen(params.get('outlet'))&&parent.origin===location.origin&&parent.pathname===location.pathname&&
   parent.searchParams.get('outlet')===outlet&&parent.searchParams.get('cat')===cat&&parent.searchParams.get('i')===String(i)&&
   parent.searchParams.get('serviceDate')===q.get('serviceDate');
 } catch {return false}
}
let visit;
function planVisit(){
 const scope=planScope();
 if(visit?.scope===scope)return visit;
 const prior=history.state?.bobsPlanReview;
 visit=prior?.scope===scope?{...prior}:{scope,opened:false,savedAt:null};
 if(visit.opened||plannerCaller()){
  try {
   const handoff=JSON.parse(sessionStorage.getItem('bobs-plan-handoff:'+scope)||'null');
   if(handoff?.savedAt||handoff?.demand?.token){visit.opened=true;Object.assign(visit,handoff);history.replaceState({...history.state,bobsPlanReview:visit},'');sessionStorage.removeItem('bobs-plan-handoff:'+scope);}
  } catch {}
 }
 return visit;
}
function rememberPlan(savedAt,demand){
 const v=planVisit();v.opened=true;
 if(savedAt)v.savedAt=savedAt;
 if(demand)v.demand=demand;
 try {history.replaceState({...history.state,bobsPlanReview:v},'')} catch {}
}
function planEvidence(data){
 const visit=planVisit(),plan=data?.production,key=M2.keys(cat,i).k;
 if(!visit.opened||!visit.savedAt||plan?.savedAt!==visit.savedAt||plan.date!==(q.get('serviceDate')||BOBS_COST_FLOW.today()))return;
 const record=plan.items?.[key],row=data.items?.find(x=>x.key===key);
 if(!record?.capacityReviewed||!record.recipeReviewed||!row||record.itemStamp!==BOBS_OUTLET_FLOW.menuStamp([row]))return;
 if(record.itemStamp!==BOBS_OUTLET_FLOW.menuStamp([{...row,d:{...d,kitchenSources:row.d.kitchenSources}}]))return;
 if(!Array.isArray(data.recipes)||record.recipeStamp!==BOBS_OUTLET_FLOW.recipeStamp([row],data.recipes,M2))return;
 return record;
}
function inheritPlanRecipes(data){
 const record=planEvidence(data);
 if(!record||!Array.isArray(record.reviewedRecipes))return;
 const rows=costRequirements().filter(x=>x.source==='recipe');
 const selected=data.items.find(row=>row.key===M2.keys(cat,i).k);
 const required=BOBS_PRODUCTION_PLAN.requirements([selected],data.recipes,BOBS_OUTLET_FLOW,M2);
 for(const key of record.reviewedRecipes){
  try {
   const [itemKey,name,quantity,reference,savedAt]=JSON.parse(key);
   const source=rows.find(x=>M2.purchaseKey(x.name)===M2.purchaseKey(name));
   const recipe=source&&M2.recipe(recipes,name);
   const expected=required.find(r=>M2.purchaseKey(r.recipe?.name||r.name)===M2.purchaseKey(name));
   if(expected&&Number(quantity)===Number(expected.qty)&&itemKey===M2.keys(cat,i).k&&recipe&&savedAt&&costVersion(source)===savedAt&&reference===BOBS_COST_FLOW.recipeStamp(recipe)&&!costReviewed(source))markReviewed(source);
  }catch {}
 }
}
// Capture both ordinary page links and the matching link presented by the guide.
function notePlannerLink(e){
 const a=e.target.closest?.('a[href]');if(!a||!d||e.button>1)return;
 const url=new URL(a.href),params=url.searchParams;
 const host=a.closest('#itemKitchenSteps');
 if(host&&host.dataset.view===kitchenSignature&&a.dataset.kitchenName&&url.origin===location.origin){
  const current=planVisit();
  if(current.demand)try{sessionStorage.setItem('bobs-plan-handoff:'+current.scope,JSON.stringify({demand:current.demand}))}catch{}
  return;
 }
 if(url.origin!==location.origin||!url.pathname.endsWith('/production-plan.html')||
   params.get('outlet')!==outlet||params.get('cat')!==cat||params.get('i')!==String(i)||
   (params.get('serviceDate')||BOBS_COST_FLOW.today())!==(q.get('serviceDate')||BOBS_COST_FLOW.today()))return;
 const current=planVisit();
 if(!current.opened){try{sessionStorage.removeItem('bobs-plan-handoff:'+current.scope)}catch{}}
 rememberPlan();
 const box=$('productionEntry');if(box&&box.dataset.planReview==='unopened')box.dataset.planReview='opened';
}
window.addEventListener('click',notePlannerLink,true);
window.addEventListener('auxclick',notePlannerLink,true);
let kitchenSignature='';
function updateKitchenState(){
 const box=$('productionEntry'),host=$('itemKitchenSteps');
 if(!box||box.hidden||!host||host.hidden||!host.dataset.state||host.dataset.view!==kitchenSignature)return;
 const state=host.dataset.state;
 if(box.dataset.kitchenState!==state)box.dataset.kitchenState=state;
 const currentDay=planVisit().demand?.date===(q.get('serviceDate')||BOBS_COST_FLOW.today());
 const kitchensReviewed=currentDay&&state==='complete';
 if(kitchensReviewed&&box.dataset.sourceRequired!=='false')box.dataset.sourceRequired='false';
 const reviewed=kitchensReviewed||!!planEvidence(fullCostData);
 const result=reviewed?'verified':'opened';
 if(box.dataset.planReview!==result)box.dataset.planReview=result;
 if(kitchensReviewed&&ready&&activeGuideStep===1&&location.hash!=='#idliLabourCost'&&!pendingCosts().length){
  activeGuideStep=2;guideProgress();
 }
}
function servingShape(item){
 return JSON.stringify([item.mode,String(item.unit),Number(item.batchSize)*Number(item.batches),
  (item.condiments||[]).map(s=>[M2.purchaseKey(s.recipeName),s.source==='purchase'?'purchase':'recipe',Number(s.portion),s.portionUnit])]);
}
window.addEventListener('bobs-guide-context',updateKitchenState);
async function showKitchenDemand(required,sourceKey,refresh=false){
 const demand=planVisit().demand,box=$('productionEntry');
 if(!demand||!window.BOBS_KITCHENS?.showDemandContinuation)return;
 let host=$('itemKitchenSteps');
 if(!host){host=document.createElement('section');host.id='itemKitchenSteps';host.className='card';box.after(host)}
 const signature=JSON.stringify([planScope(),sourceKey,demand,required,servingShape(d),baseline.itemEditors?.[sourceKey]?.planningToken]);
 if(signature===kitchenSignature&&!refresh){updateKitchenState();return}
 if(kitchenSignature&&(signature!==kitchenSignature||refresh)){
  const replacement=host.cloneNode(false);host.replaceWith(replacement);host=replacement;
 }
 kitchenSignature=signature;host.dataset.view=signature;host.dataset.state='checking';host.hidden=false;
 host.textContent='Checking saved demand and supplying kitchens…';updateKitchenState();
 try{
  const saved=await M2.read(outlet);
  const daily=await BOBS_VERIFIED.read(outlet,'OUTLET_DEMAND',demand.date);
  if(signature!==kitchenSignature||host!==$('itemKitchenSteps'))return;
  const record=BOBS_KITCHENS.applyOrders(saved,daily,demand.date);
  const editor=record?.itemEditors?.[sourceKey];
  if(!editor||!demand.token||demand.token!==editor.planningToken)throw Error('The saved demand changed. Open the production plan to review its current quantities and kitchens.');
  const keys=[...(editor.mode==='production'?[sourceKey]:[]),...(editor.condiments||[]).filter(s=>s.source!=='purchase').map(s=>sourceKey+':'+s.recipeName)];
  if(demand.date===(q.get('serviceDate')||BOBS_COST_FLOW.today())&&servingShape(editor)!==servingShape(d))throw Error('The item quantities or sides differ from the saved demand. Open the production plan to check the current demand.');
  if(!keys.length||!keys.every(key=>record.kitchenSources?.[key]?.date===demand.date&&BOBS_KITCHENS.isKitchen(record.kitchenSources[key].kitchenId)))throw Error('Review the saving outlet’s supplying kitchen choices in the production plan.');
  await BOBS_KITCHENS.showDemandContinuation(host,{record,keys,itemKey:sourceKey,date:demand.date,productionOutlet:outlet,returnTo:location.href,refresh,retry:()=>showKitchenDemand(required,sourceKey,true)});
  updateKitchenState();
 }catch(e){
  if(signature!==kitchenSignature||host!==$('itemKitchenSteps'))return;
  host.dataset.state='next';host.textContent=e.message+' ';
  const retry=document.createElement('button');retry.type='button';retry.dataset.kitchenRetry='true';retry.textContent='Retry kitchen progress';
  retry.onclick=()=>showKitchenDemand(required,sourceKey,true);host.append(retry);
  updateKitchenState();window.dispatchEvent(new Event('bobs-guide-context'));
 }
}
window.addEventListener('pageshow',event=>{
 if(event.persisted&&visit?.opened&&ready){visit=null;planVisit();refreshFullCost()}
});
window.addEventListener('focus',()=>{if(visit?.demand&&ready&&!busy)productionEntry(true)});
function productionEntry(refreshKitchen=false){let box=$('productionEntry');if(!box){box=document.createElement('section');box.id='productionEntry';box.className='card';$('itemGuide').before(box)}box.hidden=d.mode!=='production'&&!d.condiments?.some(x=>x.source!=='purchase');if(box.hidden){kitchenSignature='';if(box.dataset.kitchenState)delete box.dataset.kitchenState;$('itemKitchenSteps')?.remove();return}const sourceKey=M2.keys(cat,i).k,sources=fullCostData?.state?.kitchenSources||baseline?.kitchenSources||{},required=[...(d.mode==='production'?[sourceKey]:[]),...(d.condiments||[]).filter(x=>x.source!=='purchase').map(x=>sourceKey+':'+x.recipeName)];box.dataset.planReview=planEvidence(fullCostData)?'verified':planVisit().opened?'opened':'unopened';box.dataset.sourceRequired=String(required.some(key=>!sources[key]?.kitchenId));const a=document.createElement('a');a.href='production-plan.html?'+new URLSearchParams({outlet,cat,i,mode:d.mode,...(q.has('serviceDate')?{serviceDate:q.get('serviceDate')}:{}),returnTo:location.href});a.target='_blank';a.textContent='Open '+item.name+' production plan →';box.removeAttribute('data-bobs-page-guide');box.replaceChildren(a);showKitchenDemand(required,sourceKey,refreshKitchen);}
function renderItemGuide(){productionEntry();inheritPlanRecipes(fullCostData);renderCostChecklist();
 if(location.hash!=='#idliLabourCost'&&$('productionEntry')?.dataset.planReview==='verified'&&costReviewComplete&&activeGuideStep===1)activeGuideStep=2;
 const production=d.mode==='production',name=item.recipeName||item.name;$('itemGuide').dataset.costReviewed=String(costReviewComplete);guideProgress();
 const reference=M2.recipe(recipes,name),standard=reference&&standardRecipes.includes(reference);
 let title='Cost source: supplier purchase details',message='This item uses your supplier’s quantity and price. Check these against your current purchase details.';
 if(production){
  if(standard){
   title='BOBS standard recipe loaded from Google Sheets';
   message='This page retrieved the BOBS standard recipe for this item from Google Sheets. Review its ingredients, quantities and current prices before saving.';
  }else if(reference){
   title='BOBS standard recipe unavailable';
   message='This page could not retrieve the BOBS standard recipe for this item from Google Sheets. It is currently using a previously prepared market-reference recipe. Check its ingredients, quantities and current prices before saving.';
  }else{
   title='Recipe unavailable for this item';
   message='This page could not retrieve a BOBS standard recipe for this item from Google Sheets, and no previously prepared market-reference recipe is available for it. Open the recipe link below to review the missing details before saving.';
  }
  message+=' Saved outlet recipe changes may also apply. Check each side’s recipe separately.';
 }
 $('guideSourceTitle').textContent=title;
 $('guideSourceText').textContent=message;
 $('guideCheckTitle').textContent=costReviewComplete?'Cost review saved and verified — continue to step 2.':production?'Check the recipe and prices.':'Check the supplier quantity and price.';
 $('guideCheckText').textContent=costReviewComplete?'All selected cost sources have been reviewed. Continue to quantities or view the combined serving cost below.':'Save each reviewed recipe or supplier cost, return here, then follow the next pending accompaniment. Your item draft stays open.';
}
function field(label,value,oninput,type='number'){
 const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.value=value??'';if(type==='number'){input.min='0';input.step='any';input.required=true}input.oninput=()=>{oninput(input.value);changed()};l.append(input);return l;
}
function pick(label,value,options,change){const l=document.createElement('label');l.textContent=label;const e=document.createElement('select');for(const [v,t] of options){const o=document.createElement('option');o.value=v;o.textContent=t;e.append(o)}e.value=value;e.onchange=()=>{change(e.value);dirty=true;renderComponents();calculate()};l.append(e);return l}
function purchaseFields(x,unit){
 x.purchase=M2.purchaseConfig(x,unit);const p=x.purchase,box=document.createElement('div');box.className='component purchase-fields';
 const title=document.createElement('h3');title.textContent='Purchase Master — supplier definition';box.append(title);
 const grid=document.createElement('div');grid.className='fields';
 const supply=p.supplyUnit||(p.basis==='batch'?'batch':p.unit||unit),grouped=['pack','batch','box','carton'].includes(supply);
 grid.append(pick('How does the supplier supply this item?',supply,[['piece','Piece'],['dozen','Dozen'],['pack','Pack'],['batch','Batch'],['box','Box'],['carton','Carton'],['kg','kg'],['g','g'],['L','Litre'],['ml','ml']],v=>{
  p.supplyUnit=v;
  if(v==='dozen'){p.basis='batch';p.qty=12;p.unit='piece'}
  else if(['pack','batch','box','carton'].includes(v)){p.basis='batch';if(!(M2.number(p.qty)>0))p.qty='';if(!['piece','pack','g','kg','ml','L'].includes(p.unit)||p.unit===v)p.unit=unit||'piece'}
  else{p.basis='unit';p.qty=1;p.unit=v}
 }));
 if(grouped){
  grid.append(field('What does ONE '+supply+' contain?',p.qty,v=>p.qty=v),
   pick('Contents unit',p.unit,[['piece','pieces'],['pack','packets / sale packs'],['ml','ml'],['L','litres'],['g','grams'],['kg','kg']],v=>p.unit=v));
 }else if(supply==='dozen'){
  const note=document.createElement('p');note.className='notice';note.textContent='1 Dozen = 12 Pieces — BOBS applies this automatically.';box.append(note);
 }
 grid.append(field('Supplier price ₹ / '+supply,p.total,v=>p.total=v),
  field('Supplier (optional)',p.supplier,v=>p.supplier=v,'text'),field('Invoice date (optional)',p.date,v=>p.date=v,'date'));
 const summary=document.createElement('output');summary.className='purchase-summary';summary.purchase=p;
 box.append(grid,summary);return box;
}
function renderComponents(){
 $('purchaseInputs').replaceChildren();if(d.mode==='purchased')$('purchaseInputs').append(purchaseFields(d,item.side?d.servingUnit:d.unit));
 const previous=baseline.itemEditors?.[M2.keys(cat,i).k];
 $('mainPacking').replaceChildren(M2PackingUI.create(d.mainPacking,{name:item.name,salesUnit:d.unit,main:true,legacy:!previous?.packingSchemaVersion&&!!baseline.packaging?.[M2.keys(cat,i).k]?.length,changed}));
 $('commonPacking').replaceChildren(M2PackingUI.create(d.commonPacking,{name:'Common / order',salesUnit:d.unit,common:true,legacy:!!d.commonPacking.packaging?.length,changed}));
 $('condiments').replaceChildren();for(const x of d.condiments){
 const box=document.createElement('div');box.className='component';const title=document.createElement('h3');title.dataset.recipeName=x.recipeName;title.append(x.source==='purchase'?purchaseLink(x.recipeName,x.portionUnit):link(x.recipeName));box.append(title);
 const grid=document.createElement('div');grid.className='fields';
 grid.append(pick('Cost source',x.source,[['recipe','Production Mode — BOBS Standard Recipe'],['purchase','Purchase Mode — Purchase Master']],v=>x.source=v),
 field('QUANTITY SERVED PER UNIT SOLD',x.portion,v=>x.portion=v),
 pick('Portion unit',x.portionUnit,[['g','grams'],['kg','kg'],['ml','ml'],['L','litres'],['piece','pieces']],v=>x.portionUnit=v));
 box.append(grid);
 if(x.source==='purchase')box.append(purchaseFields(x,x.rateUnit||x.portionUnit));
 const sideCost=document.createElement('output');sideCost.className='side-cost';sideCost.side=x;box.append(sideCost);
 box.append(M2PackingUI.create(x,{name:x.recipeName,salesUnit:d.unit,main:false,changed}));
 const b=document.createElement('button');b.type='button';b.className='secondary remove-side';b.textContent='Remove side';b.onclick=()=>{d.condiments=d.condiments.filter(y=>y!==x);dirty=true;renderComponents();calculate()};box.append(b);$('condiments').append(box);
 }
 setupServingShortcut();
}
function consolidatedCosts(c){
 const day=q.get('date')||BOBS_COST_FLOW.today(),key=M2.keys(cat,i).k,stored=baseline.commercial?.[key],entry=baseline.itemEditors?.[key];
 const recorded=stored?.costEvidence?.date===day?stored.costEvidence.direct:entry?.soldConfirmed&&entry.businessDate===day?stored?.actualDayCost:null;
 if($('dailyCostBasis'))$('dailyCostBasis').textContent=(Number.isFinite(recorded)?'Saved direct COGS for '+day+': '+money(recorded)+'. ':'No confirmed direct COGS saved for '+day+'. ')+'The editor below calculates from the current form. View links open saved costs for this item and date.';
 window.BOBS_COST_DETAIL?.links($('dailyCostViews'),{outlet,cat,i,date:day});
 $('costs').replaceChildren();
 c.components.forEach((component,index)=>{
  const details=document.createElement('details');details.className='cost-component';
  const summary=document.createElement('summary');summary.className='line';
  const outletRecipe=recipes.find(r=>M2.purchaseKey(r.name)===M2.purchaseKey(component.name)),hasOverride=!!d.recipeOverrides?.[String(outletRecipe?.name||'').trim().toLowerCase().replace(/idly/g,'idli')];const label=component.name+(index===0?(d.mode==='production'?(hasOverride?' Outlet production COGS':' Standard recipe COGS'):' Purchase COGS'):' COGS')+' per '+d.unit+' · food + packing';
  const a=window.BOBS_COST_DETAIL?.link(index===0?'production':'sides',{outlet,cat,i,date:q.get('date')||BOBS_COST_FLOW.today()})||document.createElement('span');a.textContent=label+(a.tagName==='A'?' · View saved details':'');
  const amount=document.createElement('strong');amount.textContent=component.incomplete?'Incomplete':money(component.subtotal);summary.append(a,amount);
  const breakdown=document.createElement('p');breakdown.className='muted';breakdown.textContent='Food: '+(component.foodMissing?'Incomplete':money(component.food))+' + packing: '+(component.packingCost.missing.length?'Incomplete':money(component.packing))+'. '+(component.packingCost.mode==='included'?'Packing is already in the supplier price; no second charge.':component.packingCost.mode==='none'?'No extra packing for this component.':'Packing is allocated from this component’s whole packing sets.');
  details.append(summary,breakdown);$('costs').append(details);
 });
 for(const [label,value] of [['Common / order packing per '+d.unit,c.commonCost.missing.length?'Incomplete':money(c.commonPacking)],['ACTUAL COGS per '+d.unit,c.missing.length?'Incomplete':money(c.final)]]){const row=document.createElement('div');row.className='line';const span=document.createElement('span'),amount=document.createElement('strong');span.textContent=label;amount.textContent=value;row.append(span,amount);$('costs').append(row)}
 lines('packingConsolidation',[...c.components.map(x=>[x.name+' packing per '+d.unit,x.packingCost.missing.length?'Incomplete':money(x.packing)]),['Common / order packing per '+d.unit,c.commonCost.missing.length?'Incomplete':money(c.commonPacking)],['Total packing already included per '+d.unit,c.components.some(x=>x.packingCost.missing.length)||c.commonCost.missing.length?'Incomplete':money(c.pack)],['Total packing for Sold Today',money(c.totalPacking)]]);
}
function pull(){for(const id of fields)d[id]=$(id).value}
function changed(){pull();dirty=true;d.soldConfirmed=false;$('saveStatus').textContent='Unsaved changes';calculate()}
function lines(id,entries){$(id).replaceChildren();for(const [index,[label,value]] of entries.entries()){const row=document.createElement('div');row.className='line';const span=document.createElement('span'),b=document.createElement('strong');span.textContent=label;if(id==='costs'&&index===0)span.replaceChildren(primaryCostLink(label));b.textContent=value;row.append(span,b);$(id).append(row)}}
let supportRecord=null,supportError='',fullCostData=null;
function calculate(){
 const c=M2.calculate(d,item,recipes),production=d.mode==='production';
 renderItemGuide();if($('idealBuilderJump'))$('idealBuilderJump').hidden=false;
 document.querySelectorAll('.side-cost').forEach(el=>{const x=el.side,component=c.components[d.condiments.indexOf(x)+1];el.textContent=component.incomplete?'Complete this side’s cost inputs and packing choice.':BOBS_NUMBERS.quantity(x.portion,x.portionUnit)+' '+x.portionUnit+' complimentary: food '+money(component.food)+' + packing '+money(component.packing)+' = '+money(component.subtotal)+' per '+d.unit+(c.sold===null?'':'; '+money(component.subtotal*c.sold)+' for '+BOBS_NUMBERS.quantity(c.sold,d.unit)+' sold')+'. No separate revenue.'});
 document.querySelectorAll('.packing-editor').forEach(el=>{const cost=el.packingData===d.commonPacking?{packingCost:c.commonCost}:el.packingData===d.mainPacking?c.components[0]:c.components[d.condiments.indexOf(el.packingData)+1];M2PackingUI.update(el,cost,c.sold)});
 $('standaloneServing').hidden=!item.side;$('standaloneNote').hidden=!item.side;$('servingQty').required=!!item.side;$('condimentSection').hidden=!!item.side;
 $('pricingPercentLabel').textContent=d.pricingBasis==='margin'?'Target gross margin %':'Markup %';$('markup').max=d.pricingBasis==='margin'?'99.999999':'';
 document.querySelectorAll('.purchase-summary').forEach(el=>{const p=el.purchase,rate=M2.purchaseRate(p),unit=M2.convert(1,p.unit,'ml')!==null?'ml':M2.convert(1,p.unit,'g')!==null?'g':p.unit;el.textContent=rate===null?'Enter quantity and total supplier price.':money(Number(p.total))+' ÷ '+BOBS_NUMBERS.quantity(p.qty,p.unit)+' '+p.unit+' = ₹'+(rate/M2.convert(1,p.unit,unit)).toFixed(4)+' / '+unit});
 $('supplyRecipeLink').replaceChildren(primaryCostLink(item.name+(production?' – recipe & cost':' – Purchase Master COGS')));
 const purchase=M2.purchaseConfig(d,item.side?d.servingUnit:d.unit),bulkPurchase=!production&&purchase.basis==='batch',supplyUnit=purchase.supplyUnit||purchase.unit,supplyLabel={piece:'Pieces',dozen:'Dozens',pack:'Packs',batch:'Batches',box:'Boxes',carton:'Cartons',kg:'kg',g:'g',L:'Litres',ml:'ml'}[supplyUnit]||supplyUnit;$('batchLabel').hidden=!production;$('purchasedTodayHeading').hidden=production;$('batchCaption').textContent='Quantity per production batch';$('batchesCaption').textContent=production?'Number of production batches today':'Quantity Purchased Today ('+supplyLabel+')';$('rateLabel').hidden=production;$('capacityLabel').hidden=!production;if($('maxBatchesLabel'))$('maxBatchesLabel').hidden=!production;
 $('purchaseRate').required=false;if(!production)$('purchaseRate').value=c.components[0].foodMissing?'':c.base;$('soldUnit').textContent='('+d.unit+')';$('sold').step=d.unit==='kg'?'any':'1';$('batchSize').step=d.unit==='kg'?'any':'1';$('batchSize').min=d.unit==='kg'?'0.001':'1';if(!production){const measured=['kg','g','L','ml'].includes(supplyUnit);$('batches').step=measured?'any':'1';$('batches').min=measured?'0.000001':'1'}else{$('batches').step='1';$('batches').min='1'}
 $('quantitySummary').textContent=(production?'Produced today: ':'Purchased Today: ')+BOBS_NUMBERS.quantity(c.made,d.unit)+' '+d.unit+(!production&&bulkPurchase?' ('+BOBS_NUMBERS.quantity(d.batches,supplyUnit)+' '+supplyLabel+' × '+BOBS_NUMBERS.quantity(purchase.qty,purchase.unit)+' '+purchase.unit+')':'')+' · Left over: '+(c.unsold===null?'enter sold quantity':BOBS_NUMBERS.quantity(c.unsold,d.unit));
 $('sold').className=M2.number(d.sold)===null||!soldTouched?'pending':'entered';$('soldError').textContent='';
 $('recipeLinks').replaceChildren();
 const incomplete=c.missing.length>0;
 consolidatedCosts(c);
 {let box=$('idliLabourCost');if(!box){box=document.createElement('section');box.id='idliLabourCost';box.className='card';$('pricing').closest('section').after(box);}BOBS_FULL_COST.render(box,fullCostData,c,d,recipes,item,outlet,refreshFullCost);}
 if(incomplete){const p=document.createElement('p');p.className='error';p.textContent='Complete: '+c.missing.join(', ');$('costs').append(p)}
 const pricingIncomplete=incomplete||c.uuwpPctApplied===null;
 const uuwpSource=c.uuwpPctApplied===null?'Enter Sold Today':c.unsold>0?'Actual leftovers: '+BOBS_NUMBERS.quantity(c.unsold,d.unit)+' unsold ÷ '+BOBS_NUMBERS.quantity(c.made,d.unit)+' produced × 100':'Default allowance — 100% sold';
 lines('pricing',[['Actual COGS — reference starting point',incomplete?'Incomplete':money(c.final)],['Food spoilage allowance % — editable',d.spoilage+'%'],['Calculated spoilage allowance',incomplete?'Incomplete':money(c.spoil)],['Pricing COGS after spoilage',incomplete?'Incomplete':money(c.pricingAfterSpoilage)],['UUWP source',uuwpSource],['UUWP applied % of Pricing COGS after spoilage',c.uuwpPctApplied===null?'Incomplete':c.uuwpPctApplied.toFixed(2)+'%'],['Calculated UUWP allowance',pricingIncomplete?'Incomplete':money(c.pricingAfterSpoilage)+' × '+c.uuwpPctApplied.toFixed(2)+'% = '+money(c.uuwpAmount)],['Optional extra produced sides — planning allowance (not actual usage)',incomplete?'Incomplete':money(c.extraSidesPerItem||0)],['FINAL PRICING COGS',pricingIncomplete?'Incomplete':money(c.withUuwp)],['Direct-cost reference price with '+(d.pricingBasis==='margin'?'target margin':'markup'),pricingIncomplete?'Incomplete':money(c.suggested)],['Original catalogue price',money(M2.basePrice(baseline,cat,i,item))]]);
 lines('currentVsIdeal',[['Current vs direct-cost reference',pricingIncomplete||M2.number(d.price)===null?'Incomplete':((M2.number(d.price)-c.suggested)>=0?'+':'')+money(M2.number(d.price)-c.suggested)]]);
 lines('totals',[['Sold today',c.sold===null?'Not entered':BOBS_NUMBERS.quantity(c.sold,d.unit)+' '+d.unit],['Main food — full '+(production?'production':'purchase')+' commitment',c.components[0].foodMissing?'Incomplete':money(c.actualMainFood)],['Main-item packing actually used',c.components[0].packingCost.missing.length?'Incomplete':money(c.actualMainPacking)],['Included condiments + their packing actually served',c.components.slice(1).some(x=>x.incomplete)?'Incomplete':money(c.actualCondiments)],['Common / order packing actually used',c.commonCost.missing.length?'Incomplete':money(c.actualCommonPacking)],['Pricing spoilage / UUWP added to actual cost','₹0.00'],['ACTUAL DAY INCURRED COGS',incomplete?'Incomplete':money(c.actualDayCost)],['Sales',money(c.revenue)],['Actual day gross profit before fixed expenses',incomplete?'Incomplete':money(c.sold===null?null:c.revenue-c.actualDayCost)],['Unsold main food value (already inside commitment — NOT added again)',c.components[0].foodMissing||c.unsold===null?'Incomplete':money(Math.max(0,c.unsold)*c.base)]]);
 if(window.BOBS_COST_DETAIL){
  const topics={1:'production',2:'packing',3:'sides',4:'packing',6:'production'};
  for(const [index,part] of Object.entries(topics)){
   const row=$('totals').children[index];if(!row)continue;
   const a=BOBS_COST_DETAIL.link(part,{outlet,cat,i,date:q.get('date')||BOBS_COST_FLOW.today()});
   row.append(a);
  }
 }

}
function show(){for(const id of fields)$(id).value=d[id]??'';$('unit').value=d.unit;$('editor').hidden=false;renderComponents();calculate()}
function back(){
 if(busy)return;if(dirty&&!confirm('This item is not saved to Google. Leave without saving?'))return;dirty=false;
 if(window.BOBS_WINDOW_RETURN){BOBS_WINDOW_RETURN.returnToParent('method2.html?outlet='+encodeURIComponent(outlet));return;}
 if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}
 else location.href='method2.html?outlet='+encodeURIComponent(outlet);
}
$('back').onclick=e=>{e.preventDefault();back()};
$('addCondiment').onclick=()=>{
 const name=$('condimentChoice').value;if(!name||d.condiments.some(x=>M2.purchaseKey(x.recipeName)===M2.purchaseKey(name)))return;
 const r=M2.recipe(recipes,name)||BOBS_PORIYAL.find(x=>x.name===name),poriyal=/poriyal/i.test(name),sambar=/sambar/i.test(name);
 d.condiments.push({recipeName:name,source:d.mode==='purchased'?'purchase':'recipe',portion:poriyal?50:sambar?20:8,portionUnit:poriyal?'g':sambar?'ml':'g',purchaseRate:'',rateUnit:sambar?'L':'kg',purchaseBasis:'unit',purchaseBatchQty:'',purchaseBatchCost:'',purchaseBatchUnit:sambar?'L':'kg',packingMode:'',packingPer:1,packaging:[],componentPacking:true});
 const savedPurchase=M2.masterEntry(baseline.purchaseMasters,name);if(savedPurchase)d.condiments[d.condiments.length-1].purchase=M2.purchaseConfig(savedPurchase,sambar?'L':'kg');
 dirty=true;renderComponents();calculate();
};
for(const id of fields)$(id).addEventListener('input',changed);
$('sold').addEventListener('input',()=>{soldTouched=true;calculate()});
$('mode').addEventListener('change',()=>{pull();renderComponents();changed()});
$('editor').onsubmit=async e=>{
 e.preventDefault();if(busy||loading||!ready)return;pull();
 if(d.condiments?.length&&pendingCosts().length){status('Complete the serving review before saving: '+pendingCosts().map(x=>x.name).join(', '));focusPendingCost();return;}
 if(M2.number(d.sold)===null){$('sold').className='invalid';$('sold').setAttribute('aria-invalid','true');$('soldError').textContent='Please enter Sold Today quantity.';$('sold').focus();return}
 $('sold').removeAttribute('aria-invalid');
 if(!$('editor').reportValidity())return;
 const c=M2.calculate(d,item,recipes);
 if(!(c.made>0))return status(d.mode==='production'?'Enter production batch quantity and number of batches.':'Enter Purchase Master costing and today’s purchased quantity / batches.');
 if(c.sold>c.made)return status('Sold Today cannot exceed the quantity produced or purchased.');
 if(d.mode==='production'&&Number(d.capacity)>0&&c.made>Number(d.capacity))return status('Production exceeds the stated daily capacity.');
 if(c.missing.length)return status('Complete cost inputs before saving: '+c.missing.join(', '));
 if(c.sold===0&&!confirm('You entered 0 units sold for '+item.name+'. Confirm?'))return;
 if(c.sold>0&&!soldTouched&&!confirm('Confirm Sold Today is '+c.sold+' for '+item.name+'? This quantity has not been confirmed today.'))return;
 const controls=$('controls');busy=true;controls.disabled=true;$('saveStatus').textContent='Saving & verifying…';
 try{
 // Re-read rates at save time so a recipe edit in another window cannot leave stale costs.
 const master=await BOBS_OPERATIONAL_RECIPES.load();recipes=master.recipes;standardRecipes=master.standardRecipes||[];calculate();
 const saved=await M2.saveItem(outlet,cat,i,item,d,baseline,recipes);baseline=M2.state(saved);dirty=false;
 try{M2.cache(outlet,saved)}catch(e){/* A blocked browser cache does not undo a verified Google save. */}
 $('saveStatus').textContent='Verified in Google';status('Saved and read back from Google.');
 busy=false;
 const itemMessage={type:'bobs-method2-item-saved',outlet,key:M2.keys(cat,i).k};
 const priceMessage={type:'bobs-method2-price-saved',outlet,key:M2.keys(cat,i).k,price:Number(d.price)};
 if(window.BOBS_WINDOW_RETURN){BOBS_WINDOW_RETURN.notify(itemMessage,['bobs-method2']);BOBS_WINDOW_RETURN.notify(priceMessage,['bobs-method2']);BOBS_WINDOW_RETURN.afterSave('method2.html?outlet='+encodeURIComponent(outlet));}
 else{try{if(window.opener&&!window.opener.closed){window.opener.postMessage(itemMessage,location.origin);window.opener.postMessage(priceMessage,location.origin)}}catch(e){}if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}else location.href='method2.html?outlet='+encodeURIComponent(outlet);}

 }catch(err){status(err.message);$('saveStatus').textContent='Not verified — keep this page open'}finally{busy=false;controls.disabled=false}
};
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
let recipeReads=Promise.resolve();
function refreshRecipes(receipt){
 recipeReads=recipeReads.then(async()=>{
  if(!ready||busy)return;
  const master=await BOBS_OPERATIONAL_RECIPES.load(),current=M2.state(await M2.read(outlet));
  recipes=master.recipes;standardRecipes=master.standardRecipes||[];
  baseline.recipeOverrides=current.recipeOverrides;d.recipeOverrides=current.recipeOverrides||{};
  const x=receipt?.outlet===outlet&&costRequirements().find(x=>x.source==='recipe'&&M2.purchaseKey(x.name)===M2.purchaseKey(receipt.recipeName||''));
  const verified=x&&receipt.savedAt&&costVersion(x)===receipt.savedAt;
  const first=verified&&!costReviewed(x);
  if(first)markReviewed(x);
  calculate();
  if(first){
   status(pendingCosts().length?'Recipe saved. Next: '+pendingCosts()[0].name:'All serving recipes saved and verified.');
   focusPendingCost();
  }
  return verified?($('guideCostLink').querySelector('[data-next-cost]')?.href||null):null;
 }).catch(e=>{status(e.message);return null});
 return recipeReads;
}
window.BOBS_NEXT_RECIPE=async receipt=>{
 const next=await refreshRecipes(receipt);
 if(!ready||busy)return {pendingMessage:'The item checklist is still loading.'};
 const reviewed=costRequirements().find(x=>x.source==='recipe'&&M2.purchaseKey(x.name)===M2.purchaseKey(receipt.recipeName));
 if(!reviewed||costVersion(reviewed)!==receipt.savedAt||!costReviewed(reviewed)){
  return {pendingMessage:'The item could not confirm this saved version against its current reference. Reopen the pending recipe from the serving checklist.'};
 }
 return next;
};
async function refreshPurchases(receipt){if(!ready||busy)return;try{const latest=M2.state(await M2.read(outlet));if(dirty&&!confirm('Use the newly saved Purchase Master rates? This replaces unsaved supplier cost edits only.')){status('Purchase Master changed. Reload its rates before saving this item.');return}baseline.purchaseMasters=latest.purchaseMasters;M2.hydratePurchases(d,item,latest.purchaseMasters);const requirement=costRequirements().find(x=>x.source==='purchase'&&M2.purchaseKey(x.name)===M2.purchaseKey(receipt?.item));const verified=requirement&&M2.masterEntry(latest.purchaseMasters,receipt.item)?.saveToken===receipt.token;if(verified)markReviewed(requirement);renderComponents();calculate();status('Purchase rates reloaded from Google. Continue with today’s quantities, then Save This Item.');if(verified)focusPendingCost()}catch(e){status(e.message)}}
let lastPurchaseToken;
function receivePurchase(data){if(data?.type!=='bobs-purchase-master-saved'||String(data.outlet)!==String(outlet)||data.token===lastPurchaseToken)return;lastPurchaseToken=data.token;refreshPurchases(data)}
window.addEventListener('message',e=>{if(e.origin===location.origin)receivePurchase(e.data)});
if(window.BroadcastChannel){const purchaseChannel=new BroadcastChannel('bobs-purchase-master');purchaseChannel.onmessage=e=>receivePurchase(e.data)}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='bobs-recipe-master-saved')refreshRecipes(e.data)});
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-recipe-master');channel.onmessage=e=>{if(e.data?.type==='bobs-recipe-master-saved')refreshRecipes(e.data)}}
async function loadEditor(){if(loading||busy)return;loading=true;ready=false;$('itemRecipeChecklist').hidden=true;const epoch=++loadEpoch;$('controls').disabled=true;$('editor').hidden=true;$('retryGoogle').hidden=true;$('itemGuide').hidden=true;status('Checking Google records…');try{
 if(!outlet)throw Error('Open an item from Method 2 after selecting an outlet.');
 const [data,master]=await Promise.all([M2.read(outlet),BOBS_OPERATIONAL_RECIPES.load()]);
 baseline=M2.state(data);recipes=master.recipes;standardRecipes=master.standardRecipes||[];M2.installSides(baseline,recipes);item=ITEM_DATA[cat]?.[i];if(!item)throw Error('Select this item from its category first.');d=M2.draft(baseline,cat,i,item);d.pricingBasis=d.pricingBasis||'markup';
 soldTouched=!!d.soldConfirmed;
 if(['purchased','production'].includes(q.get('mode')))d.mode=q.get('mode');
 if(!d.packingPer)d.packingPer=1;if(item.standaloneSide&&item.recipePortion&&!baseline.itemEditors[M2.keys(cat,i).k]){d.batchSize=d.batchSize||1;d.batches=d.batches||1;}
 if(M2.norm(item.name)==='idli'&&!d.packaging.length&&!baseline.itemEditors[M2.keys(cat,i).k])d.packingPer=2;
 $('title').textContent=item.name;$('outletLabel').textContent='Outlet '+outlet+' · Google-backed item editor';
 $('supplyHeading').textContent='01 · '+item.name;
 const canonical=M2.sideRecipes(recipes),seen=new Set(canonical.map(r=>M2.purchaseKey(r.name))),choices=[...canonical,...BOBS_PORIYAL.filter(r=>!seen.has(M2.purchaseKey(r.name)))].filter(r=>M2.purchaseKey(r.name)!==M2.purchaseKey(item.recipeName||item.name));
 $('condimentChoice').replaceChildren();choices.forEach(r=>{const o=document.createElement('option');o.value=r.name;o.textContent=r.name;$('condimentChoice').append(o)});
 supportRecord=null;supportError='';fullCostData={pending:true};
 show();servingStart=M2.clone(d);ready=true;$('controls').disabled=false;status('Loaded from Google — your outlet information is ready to review.');$('itemGuide').hidden=false;dirty=false;
 if(servingRecipe)setTimeout(()=>{try{window.dispatchEvent(new Event('bobs-guide-resume'));focusServing();}catch(e){status(e.message)}},0);
 loadOptionalCosts(epoch);
 }catch(e){status('Could not load and verify this item: '+e.message+'. Click “Retry Google read” below. No item was saved by this attempt.');$('retryGoogle').hidden=false}
 finally{loading=false}}
async function loadOptionalCosts(epoch){
 const [full,support]=await Promise.allSettled([
   Promise.resolve().then(()=>BOBS_FULL_COST.load(outlet)),
   Promise.resolve().then(()=>M2.read(outlet,'IDLI_SUPPORT','default'))
 ]);
 if(epoch!==loadEpoch||!ready)return;
 fullCostData=full.status==='fulfilled'?full.value:{error:'Full-cost Google read failed: '+full.reason.message};
 supportRecord=support.status==='fulfilled'?support.value:null;
 supportError=support.status==='rejected'?'Support Google read failed: '+support.reason.message:'';
 try{calculate()}catch(e){status('Item data loaded; supporting cost display is unavailable: '+e.message)}
}
let fullCostRefresh=null;
async function refreshFullCost(){if(!ready||busy)return;if(fullCostRefresh)return fullCostRefresh;const epoch=loadEpoch;fullCostData={pending:true};calculate();fullCostRefresh=(async()=>{try{const data=await BOBS_FULL_COST.load(outlet);if(epoch===loadEpoch&&ready){fullCostData=data;calculate()}}finally{fullCostRefresh=null}})();return fullCostRefresh;}
function receiveFullCost(data){if(data?.type==='bobs-full-cost-saved'&&String(data.outlet)===String(outlet)){const action=refreshFullCost();if(data.next==='item-allocation')Promise.resolve(action).then(()=>{const u=new URL(location.href);u.hash='idliLabourCost';history.replaceState(history.state,'',u);const box=$('idliLabourCost');box?.scrollIntoView({behavior:'smooth',block:'start'})})}}
window.addEventListener('message',e=>{if(e.origin===location.origin)receiveFullCost(e.data)});
if(window.BroadcastChannel){const fullCostChannel=new BroadcastChannel('bobs-full-cost');fullCostChannel.onmessage=e=>receiveFullCost(e.data)}
let lastProductionReceipt='';
async function receiveProduction(message){
 const isPlan=message?.type==='bobs-production-plan-saved';
 if(!isPlan&&message?.type!=='bobs-production-demand-saved')return;
 const key=M2.keys(cat,i).k;
 if(String(message.outlet)!==String(outlet)||message.key!==key||busy||!ready||!planVisit().opened)return;
 const date=q.get('serviceDate')||BOBS_COST_FLOW.today();
 if(isPlan&&(!message.savedAt||message.savedAt===lastProductionReceipt))return;
 if(!isPlan){
  if(!message.token)return;
  const serviceDate=message.serviceDate||BOBS_COST_FLOW.today();
  rememberPlan(null,{date:serviceDate,token:message.token});productionEntry();
  if(serviceDate!==date){status('Demand received for '+serviceDate+'. Check its supplying kitchen below.');return}
 }
 try{
  if(isPlan){
   await refreshFullCost();
   const plan=fullCostData?.production,row=fullCostData?.items?.find(x=>x.key===key),record=plan?.items?.[key];
   if(!row||!record?.capacityReviewed||!record.recipeReviewed||plan.date!==date||plan.savedAt!==message.savedAt||
     record.itemStamp!==BOBS_OUTLET_FLOW.menuStamp([row])||record.recipeStamp!==BOBS_OUTLET_FLOW.recipeStamp([row],fullCostData.recipes,M2))return;
  }
  const raw=M2.state(await M2.read(outlet));
  let state=raw;
  if(!isPlan){
   state=BOBS_KITCHENS.applyOrders(raw,await BOBS_VERIFIED.read(outlet,'OUTLET_DEMAND',date),date);
   if(state.itemEditors?.[key]?.planningToken!==message.token||planVisit().demand?.token!==message.token)return;
  }
  const saved=M2.draft(state,cat,i,item),before=M2.draft(baseline,cat,i,item);
  const portions=[];
  for(const side of saved.condiments||[]){
   const match=x=>M2.purchaseKey(x.recipeName)===M2.purchaseKey(side.recipeName);
   const local=d.condiments?.find(match),old=before.condiments?.find(match);
   if(!local||!old||(String(side.portion)===String(old.portion)&&side.portionUnit===old.portionUnit))continue;
   if((String(local.portion)!==String(old.portion)||local.portionUnit!==old.portionUnit)&&
     (String(local.portion)!==String(side.portion)||local.portionUnit!==side.portionUnit))throw Error('Serving quantity changed in another window. Your draft is retained; reload and review before saving.');
   portions.push([local,side]);
  }
  for(const [local,side] of portions){local.portion=side.portion;local.portionUnit=side.portionUnit}
  // Preserve actuals already entered on the item when the plan updates intended quantities.
  for(const field of ['batchSize','batches','sideExtraFivePercent']){
   if(saved[field]!==undefined&&String(d[field])===String(before[field]))d[field]=saved[field];
  }
  if(String(d.sold)===String(before.sold)){d.soldConfirmed=saved.soldConfirmed;soldTouched=!!saved.soldConfirmed}
  baseline=raw;d.recipeOverrides=saved.recipeOverrides||{};renderComponents();
  $('batchSize').value=d.batchSize;$('batches').value=d.batches;calculate();
  if(!isPlan){status('Saved demand received. Check the supplying kitchen below.');return}
  rememberPlan(message.savedAt);calculate();
  if(!planEvidence(fullCostData))return;
  lastProductionReceipt=message.savedAt;
  const pending=pendingCosts(),slot=$('itemCompanionGuide');
  if(slot)slot.dataset.returnMessage='Production plan saved and verified.';
  status('Production plan saved and verified.');
  history.replaceState(history.state,'',pending.length?'#itemRecipeChecklist':'#supplyHeading');
  if(pending.length)focusPendingCost();else continueItemDetails();
  window.dispatchEvent(new Event('bobs-guide-resume'));
 }catch(e){status(e.message)}
}
window.addEventListener('message',e=>{if(e.origin===location.origin)receiveProduction(e.data)});if(window.BroadcastChannel){const ch=new BroadcastChannel('bobs-production-plan');ch.onmessage=e=>receiveProduction(e.data)}
$('savePlanningInputs').onclick=async()=>{if(busy||loading||!ready)return;pull();busy=true;$('controls').disabled=true;$('planningInputsStatus').textContent='Saving planning inputs to Google…';try{const saved=await M2.savePlanning(outlet,cat,i,item,d,baseline);baseline=M2.state(saved);d.soldConfirmed=false;soldTouched=false;dirty=false;$('planningInputsStatus').textContent='Planning inputs saved and verified. Sold Today remains unconfirmed. Continue with capacity and time.';const a=document.createElement('a');a.href='production-plan.html?'+new URLSearchParams({outlet,cat,i,mode:d.mode,...(q.has('serviceDate')?{serviceDate:q.get('serviceDate')}:{}),returnTo:location.href});a.target='_blank';a.textContent='Continue production plan →';$('planningInputsStatus').append(' ',a);calculate();refreshFullCost()}catch(e){$('planningInputsStatus').textContent=e.message}finally{busy=false;$('controls').disabled=false}};
$('retryGoogle').onclick=loadEditor;
loadEditor();
})();
