(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),outlet=q.get('outlet'),cat=q.get('cat'),i=Number(q.get('i'));let item;
 $('sharedOrderLink').href='method2-overall.html?outlet='+encodeURIComponent(outlet||'');
const fields=['mode','batchSize','batches','capacity','purchaseRate','spoilage','uuwp','uuwpPolicy','markup','price','sold','servingQty','servingUnit','pricingBasis'];
let baseline,recipes=[],d,dirty=false,busy=false,soldTouched=false;
const money=n=>n===null?'—':'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function status(t){$('status').textContent=t}
function link(name){const a=document.createElement('a');a.href='recipe-cost-editor.html?item='+encodeURIComponent(M2.canonicalRecipeName(name));a.target='_blank';a.textContent=name+' · recipe & cost';return a}
function purchaseLink(name,unit){const a=document.createElement('a');a.href='purchase-cost-editor.html?'+new URLSearchParams({outlet,item:name,unit:unit||'piece'});a.target='_blank';a.textContent=name+' · Purchase Master COGS';return a}
function primaryCostLink(label){const a=d.mode==='production'?link(item.recipeName||item.name):purchaseLink(item.recipeName||item.name,item.side?d.servingUnit:d.unit);a.textContent=label;return a}
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
 grid.append(pick('Cost source',x.source,[['recipe','Production Mode — Recipe Master'],['purchase','Purchase Mode — Purchase Master']],v=>x.source=v),
 field('Portion per sales unit',x.portion,v=>x.portion=v),
 pick('Portion unit',x.portionUnit,[['g','grams'],['kg','kg'],['ml','ml'],['L','litres'],['piece','pieces']],v=>x.portionUnit=v));
 box.append(grid);
 if(x.source==='purchase')box.append(purchaseFields(x,x.rateUnit||x.portionUnit));
 const sideCost=document.createElement('output');sideCost.className='side-cost';sideCost.side=x;box.append(sideCost);
 box.append(M2PackingUI.create(x,{name:x.recipeName,salesUnit:d.unit,main:false,changed}));
 const b=document.createElement('button');b.type='button';b.className='secondary remove-side';b.textContent='Remove side';b.onclick=()=>{d.condiments=d.condiments.filter(y=>y!==x);dirty=true;renderComponents();calculate()};box.append(b);$('condiments').append(box);
 }
}
function consolidatedCosts(c){
 $('costs').replaceChildren();
 c.components.forEach((component,index)=>{
  const details=document.createElement('details');details.className='cost-component';
  const summary=document.createElement('summary');summary.className='line';
  const label=component.name+(index===0?(d.mode==='production'?' Recipe Master COGS':' Purchase COGS'):' COGS')+' per '+d.unit+' · food + packing';
  const a=index===0?primaryCostLink(label):component.source==='purchased'?purchaseLink(component.name,d.condiments[index-1].portionUnit):link(component.name);a.textContent=label;
  const amount=document.createElement('strong');amount.textContent=component.incomplete?'Incomplete':money(component.subtotal);summary.append(a,amount);
  const breakdown=document.createElement('p');breakdown.className='muted';breakdown.textContent='Food: '+(component.foodMissing?'Incomplete':money(component.food))+' + packing: '+(component.packingCost.missing.length?'Incomplete':money(component.packing))+'. '+(component.packingCost.mode==='included'?'Packing is already in the supplier price; no second charge.':component.packingCost.mode==='none'?'No extra packing for this component.':'Packing is allocated from this component’s whole packing sets.');
  details.append(summary,breakdown);$('costs').append(details);
 });
 for(const [label,value] of [['Common / order packing per '+d.unit,c.commonCost.missing.length?'Incomplete':money(c.commonPacking)],['Food spoilage allowance — food only',money(c.spoil)],['Overall COGS per '+d.unit,c.missing.length?'Incomplete':money(c.final)]]){const row=document.createElement('div');row.className='line';const span=document.createElement('span'),amount=document.createElement('strong');span.textContent=label;amount.textContent=value;row.append(span,amount);$('costs').append(row)}
 lines('packingConsolidation',[...c.components.map(x=>[x.name+' packing per '+d.unit,x.packingCost.missing.length?'Incomplete':money(x.packing)]),['Common / order packing per '+d.unit,c.commonCost.missing.length?'Incomplete':money(c.commonPacking)],['Total packing already included per '+d.unit,c.components.some(x=>x.packingCost.missing.length)||c.commonCost.missing.length?'Incomplete':money(c.pack)],['Total packing for Sold Today',money(c.totalPacking)]]);
}
function pull(){for(const id of fields)d[id]=$(id).value}
function changed(){pull();dirty=true;d.soldConfirmed=false;$('saveStatus').textContent='Unsaved changes';calculate()}
function lines(id,entries){$(id).replaceChildren();for(const [index,[label,value]] of entries.entries()){const row=document.createElement('div');row.className='line';const span=document.createElement('span'),b=document.createElement('strong');span.textContent=label;if(id==='costs'&&index===0)span.replaceChildren(primaryCostLink(label));b.textContent=value;row.append(span,b);$(id).append(row)}}
function calculate(){
 const c=M2.calculate(d,item,recipes),production=d.mode==='production';
 document.querySelectorAll('.side-cost').forEach(el=>{const x=el.side,component=c.components[d.condiments.indexOf(x)+1];el.textContent=component.incomplete?'Complete this side’s cost inputs and packing choice.':x.portion+' '+x.portionUnit+' complimentary: food '+money(component.food)+' + packing '+money(component.packing)+' = '+money(component.subtotal)+' per '+d.unit+(c.sold===null?'':'; '+money(component.subtotal*c.sold)+' for '+c.sold+' sold')+'. No separate revenue.'});
 document.querySelectorAll('.packing-editor').forEach(el=>{const cost=el.packingData===d.commonPacking?{packingCost:c.commonCost}:el.packingData===d.mainPacking?c.components[0]:c.components[d.condiments.indexOf(el.packingData)+1];M2PackingUI.update(el,cost,c.sold)});
 $('standaloneServing').hidden=!item.side;$('standaloneNote').hidden=!item.side;$('servingQty').required=!!item.side;$('condimentSection').hidden=!!item.side;
 $('pricingPercentLabel').textContent=d.pricingBasis==='margin'?'Target gross margin %':'Markup %';$('markup').max=d.pricingBasis==='margin'?'99.999999':'';
 document.querySelectorAll('.purchase-summary').forEach(el=>{const p=el.purchase,rate=M2.purchaseRate(p),unit=M2.convert(1,p.unit,'ml')!==null?'ml':M2.convert(1,p.unit,'g')!==null?'g':p.unit;el.textContent=rate===null?'Enter quantity and total supplier price.':money(Number(p.total))+' ÷ '+p.qty+' '+p.unit+' = ₹'+(rate/M2.convert(1,p.unit,unit)).toFixed(4)+' / '+unit});
 $('supplyRecipeLink').replaceChildren(primaryCostLink(item.name+(production?' – recipe & cost':' – Purchase Master COGS')));
 const purchase=M2.purchaseConfig(d,item.side?d.servingUnit:d.unit),bulkPurchase=!production&&purchase.basis==='batch',supplyUnit=purchase.supplyUnit||purchase.unit,supplyLabel={piece:'Pieces',dozen:'Dozens',pack:'Packs',batch:'Batches',box:'Boxes',carton:'Cartons',kg:'kg',g:'g',L:'Litres',ml:'ml'}[supplyUnit]||supplyUnit;$('batchLabel').hidden=!production;$('purchasedTodayHeading').hidden=production;$('batchCaption').textContent='Quantity per production batch';$('batchesCaption').textContent=production?'Number of production batches today':'Quantity Purchased Today ('+supplyLabel+')';$('rateLabel').hidden=production;$('capacityLabel').hidden=!production;if($('maxBatchesLabel'))$('maxBatchesLabel').hidden=!production;
 $('purchaseRate').required=false;if(!production)$('purchaseRate').value=c.components[0].foodMissing?'':c.base;$('soldUnit').textContent='('+d.unit+')';$('sold').step=d.unit==='kg'?'any':'1';$('batchSize').step=d.unit==='kg'?'any':'1';$('batchSize').min=d.unit==='kg'?'0.001':'1';
 $('quantitySummary').textContent=(production?'Produced today: ':'Purchased Today: ')+c.made+' '+d.unit+(!production&&bulkPurchase?' ('+d.batches+' '+supplyLabel+' × '+purchase.qty+' '+purchase.unit+')':'')+' · Left over: '+(c.unsold===null?'enter sold quantity':c.unsold);
 $('sold').className=M2.number(d.sold)===null||!soldTouched?'pending':'entered';$('soldError').textContent='';
 $('recipeLinks').replaceChildren();
 const incomplete=c.missing.length>0;
 consolidatedCosts(c);
 if(incomplete){const p=document.createElement('p');p.className='error';p.textContent='Complete: '+c.missing.join(', ');$('costs').append(p)}
 lines('pricing',[['UUWP pricing allowance',c.apply?d.uuwp+'%':'Not applied — known production leftovers'],['COGS with UUWP',incomplete?'Incomplete':money(c.withUuwp)],['Suggested price with '+(d.pricingBasis==='margin'?'target margin':'markup'),incomplete?'Incomplete':money(c.suggested)]]);
 lines('totals',[['Sold today',c.sold===null?'Not entered':c.sold+' '+d.unit],[item.name+' food + its packing × sold',c.components[0].incomplete?'Incomplete':money(c.sold===null?null:c.baseWithPacking*c.sold)],['Included condiments + their packing × sold',c.components.slice(1).some(x=>x.incomplete)?'Incomplete':money(c.sold===null?null:c.condWithPacking*c.sold)],['Common / order packing × sold',c.commonCost.missing.length?'Incomplete':money(c.commonCost.total)],['Food-only spoilage × sold',incomplete?'Incomplete':money(c.sold===null?null:c.spoil*c.sold)],['Overall sold COGS',incomplete?'Incomplete':money(c.soldCost)],['Sales',money(c.revenue)],['Gross profit before fixed expenses',incomplete?'Incomplete':money(c.sold===null?null:c.revenue-c.soldCost)],['Base food '+(production?'production':'purchase')+' commitment',c.components[0].foodMissing?'Incomplete':money(c.made*c.base)]]);
}
function show(){for(const id of fields)$(id).value=d[id]??'';$('unit').value=d.unit;$('editor').hidden=false;renderComponents();calculate()}
function back(){
 if(dirty&&!confirm('This item is not saved to Google. Leave without saving?'))return;dirty=false;
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
 e.preventDefault();if(busy)return;pull();
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
 const master=await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1');recipes=master?.recipes||[];calculate();
 const saved=await M2.saveItem(outlet,cat,i,item,d,baseline,recipes);baseline=M2.state(saved);dirty=false;
 try{M2.cache(outlet,saved)}catch(e){/* A blocked browser cache does not undo a verified Google save. */}
 $('saveStatus').textContent='Verified in Google';status('Saved and read back from Google.');
 busy=false;
 if(window.opener&&!window.opener.closed){window.opener.postMessage({type:'bobs-method2-item-saved',outlet,key:M2.keys(cat,i).k},location.origin);window.opener.focus();window.close()}
 else location.href='method2.html?outlet='+encodeURIComponent(outlet);
 }catch(err){status(err.message);$('saveStatus').textContent='Not verified — keep this page open'}finally{busy=false;controls.disabled=false}
};
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
async function refreshRecipes(){try{const master=await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1');recipes=master?.recipes||[];if(d)calculate()}catch(e){status(e.message)}}
async function refreshPurchases(){try{const latest=M2.state(await M2.read(outlet));if(dirty&&!confirm('Use the newly saved Purchase Master rates? This replaces unsaved supplier cost edits only.')){status('Purchase Master changed. Reload its rates before saving this item.');return}baseline.purchaseMasters=latest.purchaseMasters;M2.hydratePurchases(d,item,latest.purchaseMasters);renderComponents();calculate();status('Purchase rates reloaded from Google. Save This Item to confirm this setup.')}catch(e){status(e.message)}}
let lastPurchaseToken;
function receivePurchase(data){if(data?.type!=='bobs-purchase-master-saved'||String(data.outlet)!==String(outlet)||data.token===lastPurchaseToken)return;lastPurchaseToken=data.token;refreshPurchases()}
window.addEventListener('message',e=>{if(e.origin===location.origin)receivePurchase(e.data)});
if(window.BroadcastChannel){const purchaseChannel=new BroadcastChannel('bobs-purchase-master');purchaseChannel.onmessage=e=>receivePurchase(e.data)}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='bobs-recipe-master-saved')refreshRecipes()});
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-recipe-master');channel.onmessage=()=>refreshRecipes()}
(async()=>{try{
 if(!outlet)throw Error('Open an item from Method 2 after selecting an outlet.');
 const [data,master]=await Promise.all([M2.read(outlet),M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1')]);
 baseline=M2.state(data);recipes=master?.recipes||[];M2.installSides(baseline,recipes);item=ITEM_DATA[cat]?.[i];if(!item)throw Error('Select this item from its category first.');d=M2.draft(baseline,cat,i,item);d.pricingBasis=d.pricingBasis||'markup';
 soldTouched=!!d.soldConfirmed;
 if(['purchased','production'].includes(q.get('mode')))d.mode=q.get('mode');
 if(!d.packingPer)d.packingPer=1;if(item.standaloneSide&&item.recipePortion&&!baseline.itemEditors[M2.keys(cat,i).k]){d.batchSize=d.batchSize||1;d.batches=d.batches||1;}
 if(M2.norm(item.name)==='idli'&&!d.packaging.length&&!baseline.itemEditors[M2.keys(cat,i).k])d.packingPer=2;
 $('title').textContent=item.name;$('outletLabel').textContent='Outlet '+outlet+' · Google-backed item editor';
 $('supplyHeading').textContent='01 · '+item.name;
 const canonical=M2.sideRecipes(recipes),seen=new Set(canonical.map(r=>M2.purchaseKey(r.name))),choices=[...canonical,...BOBS_PORIYAL.filter(r=>!seen.has(M2.purchaseKey(r.name)))].filter(r=>M2.purchaseKey(r.name)!==M2.purchaseKey(item.recipeName||item.name));
 choices.forEach(r=>{const o=document.createElement('option');o.value=r.name;o.textContent=r.name;$('condimentChoice').append(o)});
 show();status('Loaded from Google. Save This Item confirms permanent storage. Unsaved edits are not permanent.');dirty=false;
 }catch(e){status(e.message)}})();
})();
