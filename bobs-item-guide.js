/* Read-only companion adapter: existing item steps and full-cost evaluator own progress. */
(function(root){'use strict';
 const $=id=>document.getElementById(id);
 function snapshot(){
  const name=$('title')?.textContent||'This item',status=$('status')?.textContent||'Loading item…';
  const result=(title,instruction,selector,action)=>({name,title,instruction,selector,action});
  if(!$('controls')||$('controls').disabled||$('editor').hidden)return result(name+' — checking item records',status,$('retryGoogle')&&!$('retryGoogle').hidden?'#retryGoogle':'#status','Show item status / Retry');
  if($('guideStep3')?.getAttribute('aria-current')==='step')return result(name+' — save the reviewed item','Click SAVE THIS ITEM only after reviewing the actual quantities, sides, packing and costs. Wait for Verified in Google or the return to your opening Method 2 window.','#save','Show SAVE THIS ITEM');
  if($('guideStep2')?.getAttribute('aria-current')==='step')return result(name+' — review actual quantities','Review the quantity produced or purchased, Sold Today, sides and packing. Use actual figures; do not enter intended sales as Sold Today. Then use Continue to Save This Item in the page steps.','#continueItemDetails','Show Continue to item quantities');
  const full=$('idliLabourCost'),production=$('productionEntry')&&!$('productionEntry').hidden;
  if(production){
   if(full?.dataset.guideState==='error')return result(name+' — saved plan could not be checked',$('fullCostStatus')?.textContent+' Use Refresh verified cost records before deciding what is complete.','#refreshFullCost','Show Refresh verified cost records');
   if(full?.dataset.productionReady!=='true')return result(name+' — first, review production capacity','Click “Start / review production capacity, quantity and time →” below. In that planner, review equipment, intended quantity, recipes and production time, then save the reviewed plan and return here. '+(full?.dataset.guideState==='loading'?'Saved planning checks are still loading.':''),'#productionEntry a','Show production capacity link');
  }
  if(production||location.hash==='#idliLabourCost'){
   const next=full?.querySelector('.flow-current');
   if(next){const link=next.querySelector('a');return result(name+' — next required review',next.textContent+' Review sides and packing as needed; enter Sold Today only when actual sales are known.',link?'#idliLabourCost .flow-current a':$('itemDelivery')&&!full?.dataset.deliverySaved?'#itemDelivery':'#idliLabourCost .flow-current',link?'Show '+link.textContent:'Show next item review');}
  }
  const link=$('guideCostLink')?.querySelector('a');
  return result(name+' — review '+($('mode')?.value==='production'?'recipe and prices':'supplier quantity and price'),'Click “'+(link?.textContent||'Review cost details')+'”. Review and save those costs in the child window. After the verified return, continue with this item’s quantities.', '#guideCostLink a','Show recipe / supplier review link');
 }
 function focus(){
  const s=snapshot(),el=document.querySelector(s.selector);if(!el)throw Error('This control is still loading. Wait or use Retry on the page.');
  for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  if(!el.matches('input,select,button,a'))el.tabIndex=-1;
  el.scrollIntoView({block:'center',inline:'nearest'});el.focus({preventScroll:true});
 }
 root.BOBS_ITEM_GUIDE={snapshot,focus};
 const main=document.querySelector('main');
 if(main)new MutationObserver(()=>root.dispatchEvent(new Event('bobs-guide-context'))).observe(main,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','disabled','aria-current','data-production-ready','data-guide-state','data-delivery-saved']});
 root.dispatchEvent(new Event('bobs-guide-context'));
})(window);
