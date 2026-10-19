/* Category -> intended items -> recipe equipment -> reviewed existing inventory. */
(function(){'use strict';
const C=BOBS_EQUIPMENT_MENU,R=BOBS_EQUIPMENT_REFERENCES,$=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let inventory,loaded,categories=[],category,selected=new Set(),groups=[],assignments=new Map(),openingRow='',loading=false,opener,returnRow=null;
const dialog=$('equipmentMenuDialog');
function say(message){$('equipmentMenuStatus').textContent=message;}
function focus(id){const el=$(id);el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});}
function count(){$('equipmentMenuCount').textContent=selected.size+' items ticked across categories';$('showEquipmentSuggestions').disabled=!selected.size;}
function categoryList(){
 $('equipmentCategories').innerHTML=categories.map((c,i)=>'<button type="button" data-category="'+i+'" aria-pressed="'+(c===category)+'">'+esc(c.name.replace(' Catalogue',''))+' <small>'+c.items.length+' items</small></button>').join('');
 $('equipmentCategories').querySelectorAll('button').forEach(b=>b.onclick=()=>{category=categories[+b.dataset.category];$('equipmentItemSearch').value='';categoryList();itemList();focus('equipmentCategoryTitle');});
}
function itemList(){
 $('equipmentCategoryTitle').textContent=category?category.name.replace(' Catalogue','')+' — tick what you intend to make':'Choose a category above';
 const filter=$('equipmentItemSearch').value.trim().toLowerCase();
 $('equipmentMenuItems').innerHTML=(category?.items||[]).filter(i=>i.name.toLowerCase().includes(filter)).map(item=>{
  const recipe=M2.recipe(loaded.recipes,item.recipeName||item.name);
  return '<label class="equipment-menu-item"><input type="checkbox" data-menu-item="'+esc(item.key)+'" '+(selected.has(item.key)?'checked':'')+'> <span>'+esc(item.name)+(recipe?'':'<small>No recipe equipment reference — review needed</small>')+'</span></label>';
 }).join('')||(category?'<p>No items match this search.</p>':'');
 $('equipmentMenuItems').querySelectorAll('input').forEach(input=>input.onchange=()=>{if(input.checked)selected.add(input.dataset.menuItem);else selected.delete(input.dataset.menuItem);count();});
}
function existingOptions(value=''){
 return '<option value="">Choose equipment already recorded</option>'+inventory.list().map(e=>'<option value="'+esc(e.id)+'" '+(e.id===value?'selected':'')+'>'+esc(e.name||'Unnamed equipment')+' · '+esc(e.ownedQty===''?'units pending':e.ownedQty+' existing units')+'</option>').join('');
}
function refreshExisting(){
 for(const select of dialog.querySelectorAll('[data-existing]')){const value=select.value;select.innerHTML=existingOptions(value);}
}
function chosenType(card,group){
 const val=card.querySelector('[data-type]').value;
 return val===''?null:group.options[+val];
}
function examples(card,group){
 const type=chosenType(card,group),reference=type&&type.reference!==null?R[type.reference]:null;
 card.querySelector('[data-name]').value=type?.name||'';
 const box=card.querySelector('[data-examples]');
 box.innerHTML=reference?'<p>'+esc(reference.note)+'</p><label>Optional matching capacity example<select data-example><option value="">Keep capacity unknown / preserve the existing entry</option>'+reference.choices.map((c,i)=>'<option value="'+i+'">'+esc(c.label)+'</option>').join('')+'</select></label><p><a href="'+esc(reference.url)+'" target="_blank" rel="noopener">View manufacturer capacity reference ↗</a></p><p>Choosing an example records an estimate. Verify your model and usable recipe output later.</p>':'<p>No numeric capacity example is available for this equipment. Keep capacity pending or enter your specification / trial in the inventory.</p>';
}
function showResults(){
 groups=C.suggestions(categories.flatMap(c=>c.items).filter(i=>selected.has(i.key)),loaded,M2);
 $('equipmentItemStep').hidden=true;$('equipmentResultStep').hidden=false;
 $('equipmentSuggestions').innerHTML=groups.groups.map((group,i)=>{
  const previous=assignments.get(group.key),prior=previous&&inventory.list().some(e=>e.id===previous)?previous:openingRow;
  return '<article data-suggestion="'+i+'"><h3>'+esc(group.options.map(o=>o.name).join(' OR '))+'</h3>'+(group.conditional?'<p class="equipment-reference-warning">Optional preparation suggestion — confirm whether this work is done here.</p>':'')+'<ul>'+group.reasons.map(r=>'<li><strong>'+esc(r.item)+'</strong> · '+esc(r.source)+'<br>Recipe equipment / preparation: '+esc(r.note)+'</li>').join('')+'</ul>'+
  '<label>Equipment you actually have<select data-type>'+(group.options.length>1?'<option value="">Choose one alternative</option>':'')+group.options.map((o,j)=>'<option value="'+j+'">'+esc(o.name)+'</option>').join('')+'</select></label>'+
  '<label>Your existing equipment<select data-decision><option value="">Choose what applies</option><option value="reuse">Already recorded — reuse an existing asset</option><option value="new">I own this — add it to my inventory</option><option value="none">I do not have this / not needed here</option></select></label>'+
  '<div data-reuse hidden><label>Existing asset<select data-existing>'+existingOptions(prior)+'</select></label><p>Reusing keeps its name, units and costs. A capacity example changes its capacity only when explicitly chosen.</p></div>'+
  '<div data-new hidden><label>Machine / vessel name<input data-name></label><label>Existing units I own<input data-units type="number" min="1" step="1" inputmode="numeric"></label></div>'+
  '<div data-capacity hidden><div data-examples></div></div><p data-result role="status"></p><button type="button" data-use>Use this equipment choice</button></article>';
 }).join('');
 $('equipmentMissing').innerHTML=groups.missing.length?'<h3>Needs your review</h3>'+groups.missing.map(x=>'<p><strong>'+esc(x.name)+':</strong> '+esc(x.reason)+'</p>').join(''):'';
 $('equipmentPreparation').innerHTML=groups.preparation.length?'<details><summary>Review preparation described in the selected recipes</summary>'+groups.preparation.map(x=>'<p><strong>'+esc(x.name)+':</strong> '+esc(x.note)+'</p>').join('')+'</details>':'';
 for(const card of $('equipmentSuggestions').children){
  const group=groups.groups[+card.dataset.suggestion],decision=card.querySelector('[data-decision]');
  examples(card,group);
  card.querySelector('[data-type]').onchange=()=>examples(card,group);
  decision.onchange=()=>{
   card.querySelector('[data-reuse]').hidden=decision.value!=='reuse';
   card.querySelector('[data-new]').hidden=decision.value!=='new';
   card.querySelector('[data-capacity]').hidden=!['new','reuse'].includes(decision.value);
   card.querySelector('[data-result]').textContent='';
  };
  card.querySelector('[data-use]').onclick=()=>{
   const output=card.querySelector('[data-result]'),type=chosenType(card,group);
   try{
    if(!decision.value)throw Error('Choose whether this equipment is already recorded, owned, or not needed.');
    if(decision.value==='none'){output.textContent='✓ No equipment added by this choice. Any earlier inventory entries remain; review them before saving.';return;}
    if(!type)throw Error('Choose the equipment alternative you actually have.');
    const choice=card.querySelector('[data-example]')?.value;
    const facts=choice!==undefined&&choice!==''?C.estimate(R[type.reference],R[type.reference].choices[+choice]):null;
    let id;
    if(decision.value==='reuse'){
     id=card.querySelector('[data-existing]').value;
     if(!id)throw Error('Select the existing asset to reuse.');
     inventory.reuse(id,facts);
     output.textContent='✓ Existing equipment reused'+(facts?' with the selected capacity estimate':' without changing its details')+'. Review the inventory before saving.';
    }else{
     const prior=assignments.get(group.key);
     if(prior&&inventory.list().some(e=>e.id===prior))throw Error('This suggestion already uses an inventory entry. Choose Already recorded to reuse it.');
     const name=card.querySelector('[data-name]').value.trim(),qty=card.querySelector('[data-units]').value;
     if(!name)throw Error('Name the equipment you own.');
     if(qty===''||!Number.isInteger(+qty)||+qty<1)throw Error('Enter the positive whole number of units you already own.');
     id=inventory.add(name,+qty,facts||{status:'unknown'});
     output.textContent='✓ Added to the unsaved inventory. Review the details, then save to Google.';
    }
    assignments.set(group.key,id);refreshExisting();say('Equipment choice applied to the inventory. Continue with other suggestions or review the inventory.');
   }catch(e){output.textContent=e.message;output.tabIndex=-1;output.focus();}
  };
 }
 say(groups.groups.length+' equipment suggestions for '+selected.size+' ticked items. Shared suggestions are listed once; review alternatives and preparation.');
 focus('equipmentResultTitle');
}
async function open(rowId=''){
 openingRow=rowId;
 if(!dialog.open){opener=document.activeElement;dialog.showModal();}
 $('equipmentItemStep').hidden=false;$('equipmentResultStep').hidden=true;
 if(loaded){categoryList();itemList();count();say('Selections guide this visit only. No menu quantities or inventory are saved by ticking items.');focus('equipmentMenuTitle');return;}
 if(loading)return;loading=true;say('Loading recipe equipment references…');$('equipmentHelpRetry').hidden=true;$('showEquipmentSuggestions').disabled=true;
 try{
  loaded=await BOBS_OPERATIONAL_RECIPES.load();
  categories=C.catalogue(ITEM_DATA,CAT_ORDER,loaded.recipes,M2);
  category=null;categoryList();itemList();count();
  $('equipmentRecipeSource').textContent=loaded.notice||'Google recipe equipment is used where available; other items show their audited reference source.';
  say('Choose a category, then tick the food you intend to make. Selections guide this visit only.');
 }catch(e){loaded=null;say('Could not load recipe help: '+e.message+'. Your inventory remains available for manual entry.');$('equipmentHelpRetry').hidden=false;}
 finally{loading=false;}
}
window.BOBS_EQUIPMENT_MENU_UI={init(api){inventory=api;$('openEquipmentHelp').onclick=()=>open();},open};
$('equipmentItemSearch').oninput=itemList;
$('showEquipmentSuggestions').onclick=showResults;
$('equipmentBackToItems').onclick=()=>{$('equipmentItemStep').hidden=false;$('equipmentResultStep').hidden=true;categoryList();itemList();count();focus('equipmentMenuTitle');};
$('equipmentHelpRetry').onclick=()=>open(openingRow);
$('equipmentHelpClose').onclick=()=>dialog.close();
$('equipmentReviewInventory').onclick=()=>{returnRow=[...assignments.values()].find(id=>inventory.list().some(e=>e.id===id))||'';dialog.close();};
dialog.addEventListener('close',()=>{if(returnRow!==null){inventory.focus(returnRow);returnRow=null;}else if(opener?.isConnected)opener.focus({preventScroll:true});else inventory.focus(openingRow);});
dialog.addEventListener('input',e=>e.stopPropagation());
dialog.addEventListener('change',e=>e.stopPropagation());
})();
