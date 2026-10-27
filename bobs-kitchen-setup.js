/* One draft of the per-outlet kitchen decisions, shared by the page and BOBS Guide. */
(function(root){'use strict';
function mount(options){
 const {model,outlets}=options,saved=()=>options.saved(),K=root.BOBS_KITCHEN_CORE,host=document.getElementById('outletKitchenChoices');
 model.outletDecisions=model.outletDecisions||{};
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const outlet=id=>{const o=outlets.find(o=>String(o.id)===String(id));if(!o)throw Error('This outlet is no longer in the loaded setup. Reload before continuing.');return o;};
 const attached=(record,id)=>(record?.kitchens||[]).find(k=>String(k.outletId)===String(id));
 function before(id){if(options.busy())throw Error('Wait for the current save to finish.');options.read();return outlet(id);}
 function changed(){options.changed();options.render();root.dispatchEvent(new Event('bobs-guide-context'));}
 function focus(id){const row=[...document.querySelectorAll('[data-kitchen]')].find(el=>el.dataset.kitchen===id);if(!row)throw Error('The kitchen details are not available yet.');row.scrollIntoView({block:'center'});row.querySelector('[data-field=name]')?.focus();}
 function answer(id,yes){const o=before(id),existing=attached(model,o.id);if(!yes&&attached(saved(),o.id))throw Error(o.name+' already has a registered kitchen. Review or reassign its location before choosing No; this answer will not delete it.');if(!yes&&existing)model.kitchens=model.kitchens.filter(k=>k.id!==existing.id);model.outletDecisions[String(o.id)]={hasKitchen:yes,kitchenId:''};changed();}
 function reuse(id){const o=before(id),existing=attached(saved(),o.id),draft=attached(model,o.id);if(!existing)throw Error('No saved kitchen was found for '+o.name+'.');if(!draft||draft.id!==existing.id)throw Error('This kitchen location changed in the draft. Review its details first.');model.kitchens=model.kitchens.map(k=>k.id===existing.id?JSON.parse(JSON.stringify(existing)):k);model.outletDecisions[String(o.id)]={hasKitchen:true,kitchenId:existing.id,setup:'reuse'};changed();}
 function fresh(id){const o=before(id),old=attached(model,o.id),prior=attached(saved(),o.id);if(old&&!prior){model.outletDecisions[String(o.id)]={hasKitchen:true,kitchenId:old.id,setup:'new'};changed();return old.id;}
  const kitchen={...(old||{}),id:old?.id||'Kitchen-'+crypto.randomUUID(),name:o.name+' kitchen',outletId:String(o.id),status:'operating',shiftTimes:[{start:'',end:''}]};
  if(old)model.kitchens=model.kitchens.map(k=>k.id===old.id?kitchen:k);else model.kitchens.push(kitchen);
  model.outletDecisions[String(o.id)]={hasKitchen:true,kitchenId:kitchen.id,setup:prior?'fresh':'new'};changed();return kitchen.id;
 }
 function snapshot(){options.read();let verified=false;try{const current=saved();K.requireRegistration(current,outlets);verified=root.BOBS_VERIFIED.equal(current.kitchens,model.kitchens)&&root.BOBS_VERIFIED.equal(current.outletDecisions,model.outletDecisions);}catch(_){}return {ready:true,verified,outlets:outlets.map(o=>({id:String(o.id),name:o.name,choice:model.outletDecisions[String(o.id)]||null,savedKitchen:attached(saved(),o.id)||null,kitchen:attached(model,o.id)||null,error:K.outletDecisionError(model,o,outlets)})),saved:!!saved()};}
 function validate(id){options.read();const error=K.outletDecisionError(model,outlet(id),outlets);if(error)throw Error(error);}
 function render(){
  host.replaceChildren();host.append(node('h2','Kitchen choice for every outlet'),node('p','Answer Yes or No for each outlet. A saved kitchen at one outlet does not answer for any other outlet. Answers remain a draft until you review and save below.'));
  for(const o of outlets){const id=String(o.id),choice=model.outletDecisions[id],old=attached(saved(),id),draft=attached(model,id),card=node('section');card.className='card';card.dataset.outletKitchen=id;card.append(node('h3',o.name+' — do you want a kitchen at this outlet?'));
   const label=node('label','Kitchen at '+o.name),select=node('select');select.dataset.outletKitchenAnswer=id;select.setAttribute('aria-label','Kitchen at '+o.name);
   for(const [value,text]of [['','Choose Yes or No'],['yes','Yes — prepare food in this outlet’s kitchen'],['no','No — food will come from another kitchen or supplier']]){const option=node('option',text);option.value=value;select.append(option);}select.value=typeof choice?.hasKitchen==='boolean'?(choice.hasKitchen?'yes':'no'):'';
   const notice=node('p');notice.setAttribute('role','status');const action=(text,kind,fn)=>{const b=node('button',text);b.type='button';b.dataset.kitchenSetupAction=kind;b.onclick=()=>{try{fn();}catch(e){notice.textContent=e.message;}};return b;};
   select.onchange=()=>{try{if(!select.value){before(id);delete model.outletDecisions[id];changed();}else answer(id,select.value==='yes');}catch(e){select.value=typeof choice?.hasKitchen==='boolean'?(choice.hasKitchen?'yes':'no'):'';notice.textContent=e.message;}};label.append(select);card.append(label);
   if(old)card.append(node('p','Saved kitchen for '+o.name+': '+old.name+'. Its saved details remain available.'));
   if(choice?.hasKitchen){if(old)card.append(action('Review and use saved kitchen','reuse',()=>{reuse(id);focus(old.id);}),action('Set up this kitchen again','fresh',()=>{const key=fresh(id);focus(key);}));else if(draft)card.append(action('Enter / review kitchen details','details',()=>focus(draft.id)));else card.append(action('Set up a kitchen for '+o.name,'new',()=>focus(fresh(id))));
    if(old)card.append(node('p','“Set up again” starts a fresh name/status/shift draft for this outlet. Saved details are replaced only after your reviewed Save and backup.'));
   }
   card.append(node('p',K.outletDecisionError(model,o,outlets)||((choice?.hasKitchen?'Kitchen details entered':'No kitchen selected')+' — review and Save to confirm.')),notice);host.append(card);
  }
 }
 const api={snapshot,answer,reuse,fresh,focus,validate,render};render();root.BOBS_KITCHEN_GUIDE=api;root.dispatchEvent(new Event('bobs-guide-context'));return api;
}
root.BOBS_KITCHEN_SETUP={mount};
})(window);
