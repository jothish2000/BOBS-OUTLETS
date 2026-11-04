/* Page-only guidance joins the single BOBS Guide. Reads current controls; no data writes. */
(function(root){'use strict';const doc=root.document,$=id=>doc.getElementById(id),page=location.pathname.split('/').pop();
const action=(label,selector,run=false)=>({label,selector,run});
function snapshot(){
 if(page==='equipment-planner.html'){
  const ready=$('save')&&!$('save').disabled;
  return {title:'Equipment and holding plan',instruction:ready?'Review the equipment required by the saved menu, your sharing decision and the units already owned. Use actual unit costs, wattage and daily hours.':$('status')?.textContent||'Loading equipment requirements.',
   actions:ready?[action('Review equipment decisions','#rows input'),action('Go to Save equipment decisions','#save')]:[action('Go to Reload equipment records','#reload')],
   overview:['BOBS uses selected menu items and recipe process equipment, including holding and display requirements.','Sharing is a planning choice. Choose INDIVIDUAL for dedicated equipment. Confirm that shared equipment can remain at the same suitable station.']};
 }
 if(page==='workload-planner.html'){
  const hasRows=!!$('profiles')?.children.length,confirmed=!!$('approved')?.checked;
  return {title:'Menu workload and staffing',instruction:confirmed?'Your scenario review is ticked. Save the staffing plan explicitly and wait for verification.':hasRows?'Review imported production quantities and process timings in the existing workload rows, then calculate staffing. Confirm only after checking the result.':'Import the saved Method 2 menu to start the staffing review.',
   actions:confirmed?[action('Go to Save staffing plan','#save')]:hasRows?[action('Review workload inputs','#profiles input'),action('Calculate staffing','#calc',true),action('Review timeline and position capacity','#result'),action('Review the scenario confirmation','#approved')]:[action('Import selected Method 2 menu','#import',true)],
   overview:['Saved production quantity drives the workload; Sold Today is not the production target.','Recipe output and machine capacity are separate. Shared preparation means one compatible physical batch; shared equipment alone does not combine recipes.']};
 }
 if(page==='idli-staffing.html'){
  const loaded=$('app')&&!$('app').hidden,confirmed=!!$('reviewed')?.checked;
  return {title:'Idli workforce coverage',instruction:!loaded?$('status')?.textContent||'Loading staffing records.':confirmed?'Your practical review is ticked. Resolve any coverage warnings, then save the covered workforce and continue to salaries.':'Review the saved production target, process timings, proposed positions and duty coverage. Use additional support only for uncovered work.',
   actions:!loaded?[]:confirmed?[action('Go to Save covered workforce','#saveWorkforce'),action('Review coverage warnings','#issues')]:[action('Review production target and deadline','#qty'),action('Review production timings','#sideMinutes'),action('Review proposed positions','#cook'),action('Review chronological duties','#timeline'),action('Review the practical confirmation','#reviewed')],
   overview:['The target comes from the saved item plan. Timings and position coverage must fit that quantity and deadline.','An optional emergency plan covers actual unavailable positions. It does not create employees or silently add wages.','After verified workforce saving, continue through combined menu duties and salaries before full-cost pricing.']};
 }
 return null;
}
function focus(a){
 const n=doc.querySelector(a.selector);if(!n)throw Error('This section is still loading. Check the page status before continuing.');
 for(let p=n.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
 if(a.run){if(n.disabled)throw Error('Complete the required inputs before using this action.');n.click();return;}
 if(root.BOBS_REVIEW?.isReview(n)){root.BOBS_REVIEW.request(n);return;}
 if(!n.matches('input,select,textarea,button,a'))n.tabIndex=-1;n.scrollIntoView({block:'center',inline:'nearest'});n.focus({preventScroll:true});
}
root.BOBS_PAGE_GUIDANCE={snapshot,focus};
})(window);
