(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),outlet=q.get('outlet'),cat=q.get('cat'),i=Number(q.get('i')),item=ITEM_DATA[cat]?.[i];
const fields=['mode','batchSize','batches','capacity','purchaseRate','spoilage','uuwp','markup','price','packingPer','sold'];
let baseline,recipes=[],d,dirty=false,busy=false,soldTouched=false;
const money=n=>n===null?'—':'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function status(t){$('status').textContent=t}
function link(name){const a=document.createElement('a');a.href='recipe-cost-editor.html?item='+encodeURIComponent(name);a.target='_blank';a.textContent=name+' · recipe & cost';return a}
function field(label,value,oninput,type='number'){
 const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.value=value??'';if(type==='number'){input.min='0';input.step='any';input.required=true}input.oninput=()=>{oninput(input.value);changed()};l.append(input);return l;
}
function pick(label,value,options,change){const l=document.createElement('label');l.textContent=label;const e=document.createElement('select');for(const [v,t] of options){const o=document.createElement('option');o.value=v;o.textContent=t;e.append(o)}e.value=value;e.onchange=()=>{change(e.value);dirty=true;renderComponents();calculate()};l.append(e);return l}
function renderComponents(){
 $('condiments').replaceChildren();for(const x of d.condiments){
 const box=document.createElement('div');box.className='component';const title=document.createElement('h3');title.append(link(x.recipeName));box.append(title);
 const grid=document.createElement('div');grid.className='fields';
 grid.append(pick('Cost source',x.source,[['recipe','Recipe Master'],['purchase','Purchased separately']],v=>x.source=v),
 field('Portion per sales unit',x.portion,v=>x.portion=v),
 pick('Portion unit',x.portionUnit,[['g','grams'],['kg','kg'],['ml','ml'],['L','litres'],['piece','pieces']],v=>x.portionUnit=v));
 if(x.source==='purchase')grid.append(field('Supplier rate ₹',x.purchaseRate,v=>x.purchaseRate=v),pick('Rate per',x.rateUnit||'kg',[['kg','kg'],['L','litre'],['g','gram'],['ml','ml'],['piece','piece']],v=>x.rateUnit=v));
 box.append(grid);
 const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Remove side';b.onclick=()=>{d.condiments=d.condiments.filter(y=>y!==x);dirty=true;renderComponents();calculate()};box.append(b);$('condiments').append(box);
 }
 $('packing').replaceChildren();for(const x of d.packaging){const box=document.createElement('div');box.className='component fields';box.append(field('Empty container / packing material',x.name||x.label,v=>x.name=v,'text'),field('Number used for this serving',x.qty,v=>x.qty=v),field('Price ₹ each',x.unitCost,v=>x.unitCost=v));const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Remove';b.onclick=()=>{d.packaging=d.packaging.filter(y=>y!==x);dirty=true;renderComponents();calculate()};box.append(b);const perItem=document.createElement('output');perItem.className='packing-row-cost';box.append(perItem);$('packing').append(box)}
}
function pull(){for(const id of fields)d[id]=$(id).value}
function changed(){pull();dirty=true;d.soldConfirmed=false;$('saveStatus').textContent='Unsaved changes';calculate()}
function lines(id,entries){$(id).replaceChildren();for(const [label,value] of entries){const row=document.createElement('div');row.className='line';const span=document.createElement('span'),b=document.createElement('strong');span.textContent=label;if(id==='costs'&&label.startsWith('Item / Recipe')&&d.mode==='production'){const a=link(item.name);a.textContent=label;span.replaceChildren(a)}b.textContent=value;row.append(span,b);$(id).append(row)}}
function calculate(){
 const c=M2.calculate(d,item,recipes),production=d.mode==='production';
 const idli=M2.norm(item.name)==='idli',unitName=idli?'idli':d.unit;
 $('idliPackingPreset').hidden=!idli;$('packingShareLabel').textContent=idli?'How many idlis share ONE packed serving?':d.unit==='kg'?'How many kg share ONE packed serving?':'How many items share ONE packed serving?';
 $('packingPer').min=d.unit==='kg'?'0.001':'1';$('packingPer').step=d.unit==='kg'?'any':'1';
 const pc=c.packingCost;
 $('packingSummary').textContent=pc.missing.length?'Enter every packing price and a positive sharing quantity to calculate.':!d.packaging.length?'No packing selected. Add your containers or use the 2-idli setup above.':money(pc.perPack)+' for ONE serving ÷ '+pc.per+' '+(idli?'idlis':d.unit)+' = '+money(pc.perItem)+' packing per '+unitName+(c.sold===null?'':'. For '+c.sold+' sold: '+money(c.totalPacking)+' for '+c.parcels+' whole packs; actual packing per '+unitName+': '+money(c.pack)+'.');
 document.querySelectorAll('.packing-row-cost').forEach((output,n)=>{const x=d.packaging[n],valid=M2.number(x.qty)!==null&&M2.number(x.unitCost)!==null&&pc.per>0;output.textContent=valid?x.qty+' × '+money(Number(x.unitCost))+' ÷ '+pc.per+' = '+money(Number(x.qty)*Number(x.unitCost)/pc.per)+' per '+unitName:'Enter the container price.'});
 $('rateLabel').hidden=production;$('capacityLabel').hidden=!production;if($('maxBatchesLabel'))$('maxBatchesLabel').hidden=!production;
 $('purchaseRate').required=!production;$('soldUnit').textContent='('+d.unit+')';$('sold').step=d.unit==='kg'?'any':'1';$('batchSize').step=d.unit==='kg'?'any':'1';$('batchSize').min=d.unit==='kg'?'0.001':'1';
 $('quantitySummary').textContent=(production?'Produced':'Purchased')+' today: '+c.made+' '+d.unit+' · Left over: '+(c.unsold===null?'enter sold quantity':c.unsold);
 $('sold').className=M2.number(d.sold)===null||!soldTouched?'pending':'entered';$('soldError').textContent='';
 $('recipeLinks').replaceChildren();
 const incomplete=c.missing.length>0;
 lines('costs',[['Item / Recipe Master COGS per '+d.unit,production&&!M2.recipe(recipes,item.name)?'Recipe missing':money(c.base)],['Condiments per '+d.unit,money(c.cond)],['Food spoilage allowance',money(c.spoil)],['Packing per '+d.unit,pc.missing.length?'Incomplete':money(c.pack)],['Overall COGS per '+d.unit,incomplete?'Incomplete':money(c.final)]]);
 if(incomplete){const p=document.createElement('p');p.className='error';p.textContent='Complete: '+c.missing.join(', ');$('costs').append(p)}
 lines('pricing',[['UUWP applied',c.apply?'Yes':'No — known production leftovers'],['COGS with UUWP',incomplete?'Incomplete':money(c.withUuwp)],['Suggested price with markup',incomplete?'Incomplete':money(c.suggested)]]);
 lines('totals',[['Sold today',c.sold===null?'Not entered':c.sold+' '+d.unit],['Base Item COGS / '+item.name+' × Sold Qty '+(c.sold??'—'),incomplete?'Incomplete':money(c.sold===null?null:c.base*c.sold)],['Condiment COGS / '+item.name+' × Sold Qty '+(c.sold??'—'),incomplete?'Incomplete':money(c.sold===null?null:c.cond*c.sold)],['Packing COGS / '+item.name+' × Sold Qty '+(c.sold??'—'),pc.missing.length?'Incomplete':money(c.sold===null?null:c.pack*c.sold)],['Overall sold COGS',incomplete?'Incomplete':money(c.soldCost)],['Sales',money(c.revenue)],['Gross profit before fixed expenses',incomplete?'Incomplete':money(c.sold===null?null:c.revenue-c.soldCost)],['Base food '+(production?'production':'purchase')+' commitment',incomplete?'Incomplete':money(c.made*c.base)]]);
}
function show(){for(const id of fields)$(id).value=d[id]??'';$('unit').value=d.unit;$('editor').hidden=false;renderComponents();calculate()}
function back(){
 if(dirty&&!confirm('This item is not saved to Google. Leave without saving?'))return;dirty=false;
 if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}
 else location.href='method2.html?outlet='+encodeURIComponent(outlet);
}
$('back').onclick=e=>{e.preventDefault();back()};
$('addCondiment').onclick=()=>{
 const name=$('condimentChoice').value;if(!name||d.condiments.some(x=>x.recipeName===name))return;
 const r=M2.recipe(recipes,name)||BOBS_PORIYAL.find(x=>x.name===name),poriyal=/poriyal/i.test(name),sambar=/sambar/i.test(name);
 d.condiments.push({recipeName:name,source:d.mode==='purchased'?'purchase':'recipe',portion:poriyal?50:sambar?20:8,portionUnit:poriyal?'g':sambar?'ml':'g',purchaseRate:'',rateUnit:sambar?'L':'kg'});
 dirty=true;renderComponents();calculate();
};
$('addPacking').onclick=()=>{d.packaging.push({name:'Packing',qty:1,unitCost:''});dirty=true;renderComponents();calculate()};
$('idliPackingPreset').onclick=()=>{if(d.packaging.length&&!confirm('Replace the current packing setup with 1 empty sambar pouch and 1 aluminium box shared by 2 idlis? Saved Google data is unchanged until Save This Item.'))return;d.packaging=[{name:'Sambar pouch (empty)',qty:1,unitCost:''},{name:'Aluminium box / plate',qty:1,unitCost:''}];d.packingPer=2;$('packingPer').value='2';dirty=true;$('saveStatus').textContent='Unsaved changes';renderComponents();calculate()};
for(const id of fields)$(id).addEventListener('input',changed);
$('sold').addEventListener('input',()=>{soldTouched=true;calculate()});
$('mode').addEventListener('change',changed);
$('editor').onsubmit=async e=>{
 e.preventDefault();if(busy)return;pull();
 if(M2.number(d.sold)===null){$('sold').className='invalid';$('sold').setAttribute('aria-invalid','true');$('soldError').textContent='Please enter Sold Today quantity.';$('sold').focus();return}
 $('sold').removeAttribute('aria-invalid');
 if(!$('editor').reportValidity())return;
 const c=M2.calculate(d,item,recipes);
 if(!(c.made>0))return status('Enter batch quantity and number of batches.');
 if(c.sold>c.made)return status('Sold Today cannot exceed the quantity produced or purchased.');
 if(d.mode==='production'&&Number(d.capacity)>0&&c.made>Number(d.capacity))return status('Production exceeds the stated daily capacity.');
 if(c.missing.length)return status('Complete cost inputs before saving: '+c.missing.join(', '));
 if(c.sold===0&&!confirm('You entered 0 units sold for '+item.name+'. Confirm?'))return;
 if(c.sold>0&&!soldTouched&&!confirm('Confirm Sold Today is '+c.sold+' for '+item.name+'? This quantity has not been confirmed today.'))return;
 busy=true;$('controls').disabled=true;$('saveStatus').textContent='Saving & verifying…';
 try{
 // Re-read rates at save time so a recipe edit in another window cannot leave stale costs.
 const master=await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1');recipes=master?.recipes||[];calculate();
 const saved=await M2.saveItem(outlet,cat,i,item,d,baseline,recipes);baseline=M2.state(saved);dirty=false;
 try{M2.cache(outlet,saved)}catch(e){/* A blocked browser cache does not undo a verified Google save. */}
 $('saveStatus').textContent='Verified in Google';status('Saved and read back from Google.');
 if(window.opener&&!window.opener.closed){window.opener.postMessage({type:'bobs-method2-item-saved',outlet,key:M2.keys(cat,i).k},location.origin);window.opener.focus();window.close()}
 else location.href='method2.html?outlet='+encodeURIComponent(outlet);
 }catch(err){status(err.message);$('saveStatus').textContent='Not verified — keep this page open'}finally{busy=false;$('controls').disabled=false}
};
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
async function refreshRecipes(){try{const master=await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1');recipes=master?.recipes||[];if(d)calculate()}catch(e){status(e.message)}}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='bobs-recipe-master-saved')refreshRecipes()});
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-recipe-master');channel.onmessage=()=>refreshRecipes()}
(async()=>{try{
 if(!item||!outlet)throw Error('Open an item from Method 2 after selecting an outlet.');
 const [data,master]=await Promise.all([M2.read(outlet),M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1')]);
 baseline=M2.state(data);recipes=master?.recipes||[];d=M2.draft(baseline,cat,i,item);
 soldTouched=!!d.soldConfirmed;
 if(['purchased','production'].includes(q.get('mode')))d.mode=q.get('mode');
 if(!d.packingPer)d.packingPer=1;
 if(M2.norm(item.name)==='idli'&&!d.packaging.length&&!baseline.itemEditors[M2.keys(cat,i).k])d.packingPer=2;
 $('title').textContent=item.name;$('outletLabel').textContent='Outlet '+outlet+' · Google-backed item editor';
 const choices=[...recipes.filter(r=>/CONDIMENT/i.test(r.kind||'')||/sambar|chutney|poriyal|raita|kurma/i.test(r.name)),...BOBS_PORIYAL.filter(r=>!M2.recipe(recipes,r.name))];
 choices.forEach(r=>{const o=document.createElement('option');o.value=r.name;o.textContent=r.name;$('condimentChoice').append(o)});
 show();status('Loaded from Google. Save This Item confirms permanent storage. Unsaved edits are not permanent.');dirty=false;
 }catch(e){status(e.message)}})();
})();
