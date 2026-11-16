/* Read-only companion adapter: existing item steps and full-cost evaluator own progress. */
(function(root){'use strict';
 const $=id=>document.getElementById(id);
 function snapshot(){
  const serving=root.BOBS_SERVING_GUIDE?.snapshot();if(serving)return {name:serving.name,title:serving.name+' — '+(serving.stage==='saving'?'saving and verifying':'change serving quantity'),instruction:serving.stage==='saving'?'Keep this page open until Google verification finishes.':serving.stage==='saved'?'Saved and verified. Returning to your recipe.':'Change the highlighted serving quantity and check its unit. Then click Save serving quantity & return to recipe. You do not need to enter Sold Today for this change. '+serving.message,selector:serving.available?'#servingShortcutQuantity':'#servingShortcut',action:'Go to serving quantity'};
  const name=$('title')?.textContent||'This item',status=$('status')?.textContent||'Loading item…';
  const entry=$('productionEntry');
  const planLink=entry && !entry.hidden ? entry.querySelector('a[href]') : null;
  const verifiedPlan=entry?.dataset.planReview==='verified';
  function result(title,instruction,selector,action,onPage=false){
   const control=document.querySelector(selector);
   const help={name,title,instruction,selector,action,onPage,notice:$('itemCompanionGuide')?.dataset.returnMessage||'',
    source:{title:$('guideSourceTitle')?.textContent,text:$('guideSourceText')?.textContent}};
   if(control?.matches('a[href]')){
    help.action=control.textContent;
    if(!onPage)help.href=control.href;
   }
   if(verifiedPlan && planLink && control!==planLink)help.earlier={href:planLink.href,label:'Review earlier production plan'};
   if(selector==='#batchSize'||selector==='#batches')help.continueAction={label:'Continue to Save This Item'};
   return help;
  }
  if(!$('controls')||$('controls').disabled||$('editor').hidden)return result(name+' — checking item records',status,$('retryGoogle')&&!$('retryGoogle').hidden?'#retryGoogle':'#status','Show item status / Retry');
  const full=$('idliLabourCost');
  const costView=location.hash==='#idliLabourCost';
  const pending=document.querySelector('#guideCostLink [data-next-cost]');
  if(planLink && !costView && !verifiedPlan && entry.dataset.kitchenState){
   const panel=$('itemKitchenSteps');
   const link=panel?.querySelector('a[href]');
   if(link){
    const kitchen=link.dataset.kitchenName;
    return result(name+' — supplying kitchen','Demand is saved. '+(kitchen?'Under '+kitchen+', select ':'Select ')+'“'+link.textContent+'”.',
     '#itemKitchenSteps a[href]',link.textContent,true);
   }
   const retry=panel?.querySelector('button');
   if(retry)return result(name+' — check the supplying kitchen','Select “'+retry.textContent+'” to check the kitchen’s saved progress.','#itemKitchenSteps button',retry.textContent,true);
   if(entry.dataset.kitchenState==='checking' && panel)return result(name+' — checking the supplying kitchen','Demand is saved. Checking the kitchen’s production plan.','#itemKitchenSteps','Kitchen progress',true);
  }
  if(planLink && !costView && (!verifiedPlan || entry.dataset.sourceRequired==='true')){
   const instruction=entry.dataset.planReview==='opened'
    ? 'Resume the production review from this link.'
    : 'Start by confirming the intended quantity and supplying kitchen.';
   return result(name+' — production plan','Click “'+planLink.textContent+'”. '+instruction,'#productionEntry a',planLink.textContent,true);
  }
  if(!costView && pending){
   return result(name+' — serving cost review','Under Serving recipe checklist, select “'+pending.textContent+'”.',
    '#guideCostLink [data-next-cost]',pending.textContent,true);
  }
  if(!costView && $('guideStep3')?.getAttribute('aria-current')==='step')return result(name+' — save the reviewed item','Click SAVE THIS ITEM only after reviewing the actual quantities, sides, packing and costs. Wait for Verified in Google or the return to your opening Method 2 window.','#save','Go to SAVE THIS ITEM');
  if(!costView && $('guideStep2')?.getAttribute('aria-current')==='step')return result(name+' — review actual quantities','Review the quantity produced or purchased, Sold Today, sides and packing. Use actual figures; do not enter intended sales as Sold Today. Then use Continue to Save This Item in BOBS Guide.',$('mode')?.value==='production'?'#batchSize':'#batches','Review actual item quantities');
  if(planLink || costView){
   if(full?.dataset.guideState==='error')return result(name+' — saved plan could not be checked',($('fullCostStatus')?.textContent||'')+' Use Refresh verified cost records.','#refreshFullCost','Show Refresh verified cost records');
   if(full?.dataset.guideState==='loading')return result(name+' — checking saved costs','Wait while the saved production and cost records load.','#idliLabourCost','View cost status',true);
   const next=full?.querySelector('.flow-current');
   if(next){const link=next.querySelector('a');return result(name+' — next required review',next.textContent+' Review sides and packing as needed; enter Sold Today only when actual sales are known.',link?'#idliLabourCost .flow-current a':$('itemDelivery')&&!full?.dataset.deliverySaved?'#itemDelivery':'#idliLabourCost',link?link.textContent:!full?.dataset.deliverySaved?'Review delivery / no-delivery choice':'Review item cost allocations');}
  }
  if(costView)return result(name+' — item costs','View the saved allocation and pricing information in the cost section.','#idliLabourCost','View item costs',true);
  const link=pending||$('guideCostLink')?.querySelector('a');
  return result(name+' — review '+($('mode')?.value==='production'?'recipe and prices':'supplier quantity and price'),'Click “'+(link?.textContent||'Review cost details')+'”. Review and save those costs in the child window. After the verified return, continue with this item’s quantities.', pending?'#guideCostLink [data-next-cost]':'#guideCostLink a','Show recipe / supplier review link');
 }
 function focus(){
  const s=snapshot(),el=document.querySelector(s.selector);if(!el)throw Error('This control is still loading. Wait or use Retry on the page.');
  for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  if(!el.matches('input,select,button,a'))el.tabIndex=-1;
  el.scrollIntoView({block:'center',inline:'nearest'});el.focus({preventScroll:true});
 }
 root.BOBS_ITEM_GUIDE={snapshot,focus,continue(){const s=snapshot();if(!s.continueAction)throw Error('Complete the current required step first.');$('continueItemSave').click();}};
 document.querySelector('#editor')?.addEventListener('input',()=>{const slot=$('itemCompanionGuide');if(slot)delete slot.dataset.returnMessage;});
 root.addEventListener('hashchange',()=>root.dispatchEvent(new Event('bobs-guide-context')));
 const main=document.querySelector('main');
 if(main)new MutationObserver(()=>root.dispatchEvent(new Event('bobs-guide-context'))).observe(main,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','disabled','aria-current','data-plan-review','data-kitchen-state','data-source-required','data-next-cost','data-production-ready','data-guide-state','data-delivery-saved']});
 root.dispatchEvent(new Event('bobs-guide-context'));
})(window);
