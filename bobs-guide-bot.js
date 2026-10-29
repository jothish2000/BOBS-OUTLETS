/* Question-led companion. Session state is navigation only, never business data or completion. */
(function(root){'use strict';
const steps=new Set(['start','setup','outlet-details','locations','location-details','outlet-kitchen-existing','outlet-kitchen-details','outlet-kitchen-summary','kitchen-next','production-flow','page-task','kitchen','quantity','target','time','recipes','assets','equipment','next','resume','route']);

// Completion is projected from the existing saved-record evaluator, never from visits or answers.
function checklistModel(s){
 const saved=s.savedChecklist||{},blocked=s.loading||s.readError||s.progress?.status!=='ready';
 const rows=(saved.stages||[]).map(function copy(n){
  return {title:n.title||'Review step',status:blocked?'unknown':n.status,reason:blocked?'Saved progress is not verified yet.':n.reason||'',children:(n.children||[]).map(copy)};
 });
 return {owner:saved.owner,name:saved.name,rows,blocked,dirty:!!s.dirty,done:rows.filter(n=>n.status==='done').length,
 message:s.loading?'Checking saved progress…':s.readError?'Saved progress could not be verified. Retry the saved-progress check.':!rows.length?'Use “Check saved progress & show what’s incomplete” to load the checklist.':s.progress?.status!=='ready'?'Saved progress has not been checked yet.':''};
}

function mount(host,options){
 options.work=options.work||options.minimise;
 let state,scope='',draft={},error='',methodPhase='',recipeWatch=null,recipeWatched=null;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const adapter=()=>root.BOBS_PRODUCTION_GUIDE;
 function snapshot(){const s=options.snapshot();return {...s,production:adapter()?.snapshot(),kitchenSetup:root.BOBS_KITCHEN_GUIDE?.snapshot()};}
 function restore(s){
  const key='bobs-guide-conversation-v1:'+String(s.ctx.outlet||'company');
  if(key===scope)return;scope=key;draft={};state={step:'start',history:[]};
  try{const saved=JSON.parse(sessionStorage.getItem(key));if(saved&&steps.has(saved.step))state={...state,...saved,history:Array.isArray(saved.history)?saved.history.slice(-8):[]};}catch(_){}
  if(options.journey||s.methodFlow||s.itemHelp||(s.ctx.page==='production-plan.html'&&s.production?.journey&&state.step==='start')){
   const page=s.ctx.page,stage=new URLSearchParams(location.search).get('stage');
   state.step=page==='outlets.html'?'outlet-details':page==='kitchen-flow.html'&&(!stage||stage==='locations')?'locations':page==='production-plan.html'?'production-flow':page==='recipe-cost-editor.html'?'recipes':page==='index.html'?'start':'page-task';
   state.history=[];if(state.step==='locations')state.setupOutletId='';
  }
 }
 function persist(){try{sessionStorage.setItem(scope,JSON.stringify({step:state.step,setupOutletId:state.setupOutletId,itemKey:state.itemKey,task:state.task,kitchen:state.kitchen,history:state.history.slice(-8)}));}catch(_){} }
 function go(step,answer){error='';if(answer)state.history.push({step:state.step,answer});state.step=step;persist();render();host.querySelector('h3')?.focus({preventScroll:true});host.parentElement?.scrollTo?.({top:0});}
 function button(label,id,action){const b=el('button',label);b.type='button';b.dataset.guideChoice=id;b.onclick=()=>{try{error='';action();}catch(e){error=e.message;render();}};return b;}
 function route(page,label,extra={}){const s=snapshot(),u=new URL(page,location.href);if(s.ctx.outlet)u.searchParams.set('outlet',s.ctx.outlet);for(const [k,v]of Object.entries(extra))if(v!==''&&v!=null)u.searchParams.set(k,v);u.searchParams.set('returnTo',location.href);if(options.journey&&!u.searchParams.has('guide'))u.searchParams.set('guide','continue');const a=el('a',label,'guide-action');a.href=u.href;a.target=extra.guide==='start'?'_self':'_blank';a.rel='opener';return a;}
 function item(s){return s.items?.find(x=>x.key===state.itemKey)||s.items?.find(x=>x.cat===s.ctx.cat&&String(x.i)===String(s.ctx.index))||s.items?.[0];}
 function productionRoute(s,label){const x=item(s);return route('production-plan.html',label,x?{cat:x.cat,i:x.i}:{});}
 function input(label,name,type,value){const l=el('label',label),i=el('input');i.id='bobsGuide-'+name;i.type=type;i.value=draft[name]??value??'';if(type==='number'){i.min='0.001';i.step='any';}i.oninput=()=>{draft[name]=i.value;};l.append(i);return l;}
 function focus(id){options.minimise();adapter()?.focus(id);}
 function pageFocus(selector){const target=document.querySelector(selector);if(!target)throw Error('This control is not ready yet. Wait for the page to load, or use its Retry button.');options.minimise();if(!target.matches('input,select,button,a'))target.tabIndex=-1;target.scrollIntoView?.({block:'center'});target.focus();}
 function needProduction(s){
  if(s.production?.ready)return false;
  const help={
   'recipe-cost-editor.html':['You are reviewing a recipe. Check reference and intended portions, Calculate quantities from reference, review ingredients and rates, then Save. After verification, return to the production plan and review the next recipe.',[['Show portion sizes','referenceSection'],['Show Calculate quantities','scale'],['Show final recipe confirmation','confirmed']]],
   'asset-master.html':['Review each machine’s capacity, required and owned units, price, useful life and product shares. Your production-plan additions use this same Asset Master. Save after reviewing the values.',[['Show equipment details','planningBody'],['Show final asset review','planningReviewed']]],
   'working-capital.html':['Review ingredient, wage and operating-cash requirements against the saved menu and costs, then confirm and save.',[['Show cash requirements','planningBody'],['Show final cash review','planningReviewed']]],
   'outlet-plan.html':['Review this stage’s staffing, coverage and salary inputs. Confirm and save before proceeding to the next stage.',[['Show stage review','flowReviewed']]]
  }[s.ctx.page];
  if(help){host.append(el('p',help[0],'guide-question'));for(const [label,id]of help[1])host.append(button(label,'page-'+id,()=>{const target=document.getElementById(id);if(!target)throw Error('Wait for this page to load its review controls.');options.minimise();if(!target.matches('input,select,button,a'))target.tabIndex=-1;target.scrollIntoView?.({block:'center'});target.focus();}));return true;}
  host.append(el('p',s.ctx.page==='production-plan.html'?'Planning records are not ready yet. Use Retry on the page if loading failed; I will not assume a quantity.':'Open the selected item’s production plan so I can use its recipe, quantity and equipment.'));
  host.append(productionRoute(s,'Open this production plan →'));
  return true;
 }

 function renderChecklist(s){
  let box=host.querySelector('.guide-checklist');
  // The verified kitchen handoff already has a tick; keep both next-action cards in view.
  if(state?.step==='kitchen-next'){box?.remove();return;}
  const opened=box?.querySelector('details')?.open;
  if(!box){box=el('section',undefined,'guide-checklist');box.setAttribute('aria-label','Your progress checklist');host.append(box);}
  box.replaceChildren();
  const m=checklistModel(s);
  box.append(el('strong','Your saved progress'+(m.name?' — '+m.name:m.owner?' — '+m.owner:'')));
  if(m.message)box.append(el('p',m.message));
  if(m.dirty)box.append(el('p','Save pending: your current changes are not included in these ticks. Ticks below describe the last verified saved version.','guide-checklist-draft'));
  const checks=[];
  if(s.ctx.page==='recipe-cost-editor.html'&&document.getElementById('productionEditor')){
   const confirmation=document.getElementById('confirmed');
   if(confirmation&&confirmation!==recipeWatched){recipeWatch?.disconnect();recipeWatched=confirmation;recipeWatch=new MutationObserver(()=>renderChecklist(snapshot()));recipeWatch.observe(confirmation,{attributes:true,attributeFilter:['aria-disabled']});}
   const checked=id=>!!document.getElementById(id)?.checked;
   checks.push(['Review reference portion weight',checked('referenceWeightReviewed')],['Review intended portion weight',checked('intendedWeightReviewed')],
    ['Calculate quantities from reference',document.getElementById('confirmed')?.getAttribute('aria-disabled')==='false'],
    ['Review ingredient rates and energy',checked('confirmed')]);
  }
  if(s.production?.ready){
   const p=s.production,order=['quantity','recipes','equipment','timing','assessment','delivery','save'];
   const at=p.journey?.stage==='saved'?order.length:order.indexOf(p.journey?.stage);
   for(const [i,title]of ['Quantity and ready-by time','Recipes and sides','Equipment capacity','Process timings','Capacity assessment','Delivery choice'].entries())checks.push([title,at>i]);
  }
  if(checks.length){
   const verified=s.production?.journey?.stage==='saved'&&!s.production?.dirty;
   box.append(el('p',verified?'This production plan was saved and verified:':'On this page — review checkpoints (not saved completion):'));
   const list=el('ol',undefined,'guide-checklist-local');
   let next=false;
   for(const [title,reviewed] of checks){const current=!reviewed&&!next;if(current)next=true;const li=el('li',(reviewed?(verified?'✓ Saved and verified: ':'◐ Reviewed — save pending: '):current?'→ Next: ':'○ To review: ')+title,reviewed?(verified?'guide-checklist-done':'guide-checklist-draft'):current?'guide-checklist-next':'');if(current)li.setAttribute('aria-current','step');list.append(li);}
   box.append(list);
  }
  if(!m.rows.length)return;
  const details=el('details'),summary=el('summary',m.done+' of '+m.rows.length+' saved stages verified — show checklist');
  details.open=!!opened;details.append(summary);
  let nextMarked=false;
  function row(n){
   const done=n.status==='done',na=n.status==='na',unknown=n.status==='unknown';
   const next=!m.blocked&&!nextMarked&&!done&&!na;
   if(next)nextMarked=true;
   const label=done?'✓ Saved and verified: ':na?'— Not required: ':unknown?'? Not verified: ':next?'→ Next incomplete: ':n.status==='review'?'! Needs review: ':'○ Not completed: ';
   const li=el('li',undefined,done?'guide-checklist-done':next?'guide-checklist-next':'');
   li.append(el('span',label+n.title));
   if(next)li.setAttribute('aria-current','step');
   if(n.reason)li.append(el('small',n.reason));
   if(n.children.length){const nested=el('details');nested.append(el('summary','Show checks for this stage'));const list=el('ul');n.children.forEach(c=>list.append(row(c)));nested.append(list);li.append(nested);}
   return li;
  }
  const list=el('ol');m.rows.forEach(n=>list.append(row(n)));details.append(list);
  if(!m.blocked){const completed=m.rows.filter(n=>n.status==='done');if(completed.length)box.append(el('p','✓ Saved and verified: '+completed.at(-1).title,'guide-checklist-done'));const next=m.rows.find(n=>!['done','na'].includes(n.status));box.append(el('p',next?'→ Next incomplete saved stage: '+next.title:'✓ All listed saved stages are verified or not required.',next?'guide-checklist-next':'guide-checklist-done'));}
  box.append(details);
 }

 function render(){
  const s=snapshot();restore(s);const p=s.production;
  if(s.methodFlow){const phase=s.methodFlow.outlet+':'+s.methodFlow.phase;if(phase!==methodPhase){methodPhase=phase;state.step='page-task';state.history=[];}}
  if(p?.ready&&state.itemKey&&state.itemKey!==p.itemKey){state.step=p.journey?'production-flow':'quantity';state.history=[];draft={};}
  if(p?.ready)state.itemKey=p.itemKey;
  host.replaceChildren();host.className='bobs-guide-dialogue';
  if(state.step==='kitchen-next'){
   if(s.ctx.page==='kitchen-flow.html'&&s.kitchenSetup?.verified&&document.getElementById('kitchenNextGo')){
    host.append(el('p','✓ Kitchen Setup saved and verified. Choose your next step.','guide-question guide-checklist-done'));
    if(document.getElementById('kitchenNext-equipment'))host.append(el('p','Optional now: record existing equipment and capacity.'));
    host.append(el('p','Next required: review outlet expenses and mandatory staff.'),el('p','Choose a card below, then use the highlighted button.'));
    renderChecklist(s);return;
   }
   state.step=s.ctx.page==='kitchen-flow.html'?'outlet-kitchen-summary':'page-task';
  }
  const h=el('h3','Let’s plan your next step');h.tabIndex=-1;host.append(h);
  if(state.history.length){const transcript=el('details'),summary=el('summary','Your answers so far');transcript.append(summary);for(const x of state.history.slice(-6))transcript.append(el('p','You: '+x.answer));host.append(transcript);}
  const ask=text=>{const q=el('p',text,'guide-question');host.append(q);};
  const choices=(...buttons)=>{const box=el('div',undefined,'guide-choices');box.append(...buttons);host.append(box);};
  const choose=(text,id,next,action)=>button(text,id,()=>{action?.();go(next,text);});
  switch(state.step){
   case 'outlet-details':
    ask('How many outlets are you setting up, and what are their working shifts?');
    host.append(el('p','Review the outlet count, names and codes, then each outlet’s independent shift start and end times. Existing details are available on this page.'));
    choices(button('Help me set the outlet count','outlet-count',()=>pageFocus('#count')),button('Show outlet names and shifts','outlet-fields',()=>pageFocus('#cards .name')),button('Show the final review and Save','outlet-review',()=>pageFocus('#outletsReviewed')));
    host.append(el('p','When the details are correct, tick the page confirmation and Save outlets & go to Kitchen Setup. I’ll meet you there to ask where the food will be prepared.'));
    break;
   case 'locations':
   case 'location-details':
   case 'outlet-kitchen-existing':
   case 'outlet-kitchen-details':
   case 'outlet-kitchen-summary':{
    const setup=s.kitchenSetup,a=root.BOBS_KITCHEN_GUIDE;
    if(!setup?.ready){ask('I’m checking the saved outlets and kitchens before asking about each outlet.');host.append(el('p','If loading fails, use Retry on this page. I will not assume that an outlet has no kitchen.'));break;}
    if(!setup.outlets.length){ask('Save at least one outlet first.');host.append(route('outlets.html','Open Outlet Setup →',{guide:'start'}));break;}
    const selected=setup.outlets.find(o=>o.id===state.setupOutletId)||setup.outlets.find(o=>o.error)||setup.outlets[0];state.setupOutletId=selected.id;
    const index=setup.outlets.indexOf(selected),next=()=>{a.validate(selected.id);const following=setup.outlets[index+1];state.setupOutletId=following?.id||selected.id;go(following?'locations':'outlet-kitchen-summary','Kitchen choice reviewed for '+selected.name);};
    if(state.step==='outlet-kitchen-summary'){
     ask('Review the kitchen decision for every outlet, then save.');
     for(const o of setup.outlets){host.append(el('p',o.name+': '+(o.error?'Pending — '+o.error:o.choice.hasKitchen?'Kitchen: '+o.kitchen.name:'No kitchen at this outlet')));choices(button('Review '+o.name,'review-outlet-'+o.id,()=>{state.setupOutletId=o.id;go('locations');}));}
     host.append(el('p',setup.verified?'These outlet choices are saved and verified. Continue to outlet expenses and menu quantities; required equipment will follow the intended items and production quantities.':'These answers are drafts until you tick the final review and Save Kitchen Setup. Continue to outlet expenses and menu quantities after the verified save. We will gather required equipment from the intended items and production quantities.'));
     if(setup.verified)choices(button('Show the next step','kitchen-next',()=>pageFocus('input[name="kitchenNextChoice"]')));
     choices(button('Show final review and Save','kitchen-review',()=>pageFocus('#kitchenReviewed')));break;
    }
    host.append(el('p','Outlet '+(index+1)+' of '+setup.outlets.length+' · '+selected.name,'guide-outlet-name'));
    if(['locations','location-details'].includes(state.step)){
     ask('Do you want a kitchen at '+selected.name+'?');
     host.append(el('p','Yes means food is prepared at this outlet. No means it receives food from another kitchen or a supplier; we will choose that source after the menu.'));
     if(selected.savedKitchen)host.append(el('p','Saved kitchen found for this outlet: '+selected.savedKitchen.name+'.'));
     if(selected.choice)host.append(el('p','Current choice: '+(selected.choice.hasKitchen?'Yes — kitchen at this outlet.':'No kitchen at this outlet.')+' Review before saving.'));
     choices(button('Yes — kitchen at '+selected.name,'outlet-kitchen-yes',()=>{a.answer(selected.id,true);if(selected.savedKitchen)go('outlet-kitchen-existing','Yes — '+selected.name);else{a.fresh(selected.id);go('outlet-kitchen-details','Yes — '+selected.name);}}),button('No — no kitchen at '+selected.name,'outlet-kitchen-no',()=>{a.answer(selected.id,false);next();}));
    }else if(state.step==='outlet-kitchen-existing'){
     ask('A saved kitchen already exists for '+selected.name+'. Would you like to review and use it, or set it up again?');
     host.append(el('p',selected.savedKitchen?.name||'Review this outlet’s saved kitchen on the page.'));
     choices(button('Review and use the saved kitchen','use-saved-kitchen',()=>{a.reuse(selected.id);go('outlet-kitchen-details','Use saved kitchen for '+selected.name);}),button('Set up this kitchen again','new-kitchen-setup',()=>{a.fresh(selected.id);go('outlet-kitchen-details','New kitchen details for '+selected.name);}));
     host.append(el('p','Starting again creates a fresh details draft for this outlet. The saved setup remains available until you review and save the replacement details.'));
    }else{
     ask('Review the kitchen name, status and working shifts for '+selected.name+'.');
     host.append(el('p','Equipment comes later, from the items and quantities you intend to produce. Complete the kitchen details below before moving to the next outlet.'));
     if(selected.error)host.append(el('p',selected.error));
     choices(button('Show '+selected.name+' kitchen details','show-outlet-kitchen',()=>{if(!selected.kitchen)throw Error('Choose Yes and set up this kitchen first.');options.minimise();a.focus(selected.kitchen.id);}),button(index+1<setup.outlets.length?'Next outlet →':'Review all outlet decisions →','next-outlet',next));
    }
    if(index>0)choices(button('Previous outlet','previous-outlet',()=>{state.setupOutletId=setup.outlets[index-1].id;go('locations');}));
    break;
   }

   case 'production-flow':{
    const stage=p?.journey?.stage||'loading',name=p?.name||'Production plan',j=p?.journey||{};
    const work=(label,id)=>button(label,'plan-'+id,()=>{options.work();adapter().focus(id);});
    if(stage==='loading'||stage==='load-error'){ask(stage==='loading'?'Loading your production plan…':'Production records need attention');host.append(el('p',j.message||'Wait for the saved quantities, recipes and equipment to load.'));if(stage==='load-error')choices(work('Show Retry Google reads','plannerRetry'));break;}
    if(stage==='saving'||stage==='saved'){ask(stage==='saving'?'Saving and verifying your plan…':'Production plan saved and verified');host.append(el('p',j.message));if(stage==='saving')host.append(el('p','Please keep this window open. I will guide the next step after verification.'));break;}
    if(stage==='error'){ask('The plan is not fully saved');host.append(el('p',j.message));choices(button('Review the unfinished step','plan-retry-step',()=>adapter().retryStep()),work('Show save message','planSaveStatus'));break;}
    if(stage==='quantity'){ask(name+' — how much, and ready by when?');host.append(el('p','Review the intended production quantity, ready-by time and day. These are planning inputs; Sold Today is entered separately as the actual result.'));choices(work('Review quantity and ready-by time','intendedQuantity'),button('Quantity and time reviewed — continue','plan-quantity-next',()=>adapter().continueQuantity()));}
    else if(stage==='recipes'){ask(name+' — review the main recipe and every side');host.append(el('p','Open each recipe below, check portions, calculate quantities from reference, review ingredients and rates, then save and return. When all are reviewed, tick the recipe confirmation on the page. Opening links alone does not complete a review.'));for(const r of p.recipes){const a=el('a',r.name,'guide-action');a.href=r.href;a.target='_blank';a.rel='opener';host.append(a,el('small',r.status));}choices(work('Show recipe confirmation','recipeReviewed'));}
    else if(stage==='equipment'){ask(name+' — choose equipment and usable capacity');host.append(el('p','For each process, reuse suitable existing equipment or compare the equipment references. Enter the usable capacity per cycle and compatible unit. After checking every process, tick the equipment review confirmation.'));choices(work('Review process equipment and capacity','capacitySection'),work('Show equipment confirmation','capacityReviewed'));}
    else if(stage==='timing'){ask('Review timing for '+j.process);host.append(el('p','Check start and finish times, hands-on work, machine time, supervision and cleaning. Include preparation stages where needed. Tick this process’s timing/skill review only when it is correct.'));choices(button('Review '+j.process+' timings','plan-process',()=>{options.work();adapter().focusProcess(j.processId);}));}
    else if(stage==='assessment'){ask(name+' — check whether production fits');host.append(el('p',j.message||'Calculate the reviewed processes to check completion time and shared equipment. Resolve any warning before continuing.'));choices(button('Calculate time and equipment usage','plan-calculate',()=>adapter().calculate()),work('Show timings and calculation result','timeAssessment'));}
    else if(stage==='delivery'){ask(name+' — review delivery');host.append(el('p','Check whether delivery staff are needed. If Yes, enter the shared rider ID and count. If No, leave Delivery staff needed unticked. This review remains a draft until the final save.'));choices(work('Review delivery choice','deliveryNeeded'),button('Delivery reviewed — continue to save','plan-delivery-next',()=>adapter().continueDelivery()));}
    else if(stage==='save'){ask(name+' — ready to save your reviewed plan');host.append(el('p','Save the reviewed plan to Google. After verification, return to the item editor, where I will explain its next required review. Other menu items may still need planning.'));choices(button('Save reviewed plan to Google & continue →','plan-save',()=>adapter().save()),work('Review the final save area','saveProductionPlan'));}
    break;
   }

   case 'page-task':{
    if(s.itemHelp){const help=s.itemHelp;if(help.notice)host.append(el('p',help.notice,'guide-confirmed'));ask(help.title);host.append(el('p',help.instruction));
     if(help.href){const u=new URL(help.href,location.href);if(u.origin!==location.origin)throw Error('Planner link must stay within BOBS.');u.searchParams.set('guide','continue');const a=el('a',help.action,'guide-action');a.href=u.href;a.target='_blank';a.rel='opener';a.dataset.guideChoice='item-open-production';host.append(a);}
     else choices(button(help.action,'item-next-control',()=>{options.work();root.BOBS_ITEM_GUIDE.focus();}));break;}
    const flow=s.methodFlow;
    if(flow){
     const work=flow.workspace;
     if(!flow.baselineReady){ask('Check the outlet prerequisites.');host.append(el('p',flow.baselineMessage));}
     else if(flow.phase==='method2'){
      ask(work?.ready?'Continue Method 2 — your selected items':'Method 2 — checking selected items');
      if(work?.item){const x=work.item;host.append(el('p',x.name+' is selected. Its current Mode is '+(x.mode==='production'?'Production':'Purchase')+'.'),el('p','Review the Mode in the '+x.name+' row, then click “Edit item ↗” in that same row. '+(x.mode==='production'?'The item window guides you through capacity, intended quantity, recipes and production time.':'The item window guides you through supplier costs, quantities and any sides prepared here.')),el('p','Save your reviewed changes in the item window, then return here for the next requirement.'));}
      else host.append(el('p',work?.instruction||'Wait for the Method 2 item list to load. If it reports a read failure, use Reload Google records inside Method 2.'));
      choices(button(work?.action||'Show Method 2 workspace','method-flow-work',()=>{options.minimise();root.BOBS_METHOD_FLOW_GUIDE.focus();}));
     }else{
      const copy=flow.phase==='method1'?['Continue Method 1 — hourly analysis','Review the hourly customer and basket inputs in Method 1. Complete its save and review before using Save & Continue below the workspace.','Show Method 1 workspace']:flow.phase==='other'?['Method review saved — choose what to do next','Use the choices on this page to review another method or finish this outlet. Analysing both methods is optional.','Show the next decision']:flow.phase==='finish'?['Continue to outlet profitability','The selected methods have been reviewed. Use Review outlet profit & break-even to continue.','Show outlet profitability action']:['Choose an analysis method','The outlet prerequisites are verified. Choose Method 1 for hourly footfall or Method 2 for selected items.','Show method choices'];
      ask(copy[0]);host.append(el('p',copy[1]));choices(button(copy[2],'method-flow-work',()=>{options.minimise();root.BOBS_METHOD_FLOW_GUIDE.focus();}));
     }
     break;
    }
    const help=s.pageHelp;
    ask(help?'Shall we work through '+help.title.toLowerCase()+'?':'What would you like to complete on this page?');
    if(help){host.append(el('p',help.instruction));if(help.steps?.length){const list=el('ol');for(const text of help.steps)list.append(el('li',text));host.append(list);}else if(help.next)host.append(el('p',help.next));choices(button('Show me where to work on this step','page-work',()=>pageFocus(help.anchor||'main, #flowApp, #itemEditor, form, section:not(#bobsFlowGuide)')));}
    if(['asset-master.html','working-capital.html'].includes(s.ctx.page))needProduction(s);
    host.append(el('p','Check previously saved Google records to find what is incomplete. This does not save your current entries.','guide-saved-explanation'));
    choices(choose('Check saved progress & show what’s incomplete','page-progress','resume',()=>options.refresh()),choose('Help me plan quantities and equipment','page-production','kitchen'));
    break;
   }
   case 'start':
    if(s.ctx.page==='index.html'){
     ask('Welcome to BOBS');
     host.append(el('p','Begin with your outlets and kitchens. I’ll check saved details and ask whether you want to continue them or start a new assessment.'));
     const start=route('outlets.html','Start here — guided outlet setup →',{guide:'start'});start.classList.add('guide-primary');host.append(start);
     const other=el('div',undefined,'guide-secondary-actions');other.append(el('p','Other tasks'),choose('Plan production and equipment','production','kitchen',()=>state.task='production'),choose('Check saved progress','resume','resume'));host.append(other);break;
    }
    ask('What are you trying to do?');
    host.append(el('p','Tell me your goal. I’ll ask one question at a time and take you to the matching controls.'));
    choices(choose('Set up an outlet','setup','setup',()=>state.task='setup'),choose('Plan production and equipment','production','kitchen',()=>state.task='production'),choose('Continue my saved work','resume','resume'));
    break;
   case 'setup':
    ask('Are you setting up a new outlet or using your existing details?');
    choices(choose('Use existing outlet details','existing','kitchen'),choose('Add a new outlet','fresh','route',()=>state.task='new-outlet'));
    host.append(el('p','A new setup starts with adding an outlet. Your existing outlets and assets remain available.'));
    break;
   case 'kitchen':{
    const owner=s.kitchens?.find(k=>String(k.id)===String(s.ctx.outlet)||String(k.outletId)===String(s.ctx.outlet));
    if(owner)host.append(el('p','Saved kitchen: '+owner.name+' ('+owner.status+').'));
    ask('Where will this outlet’s food be prepared?');
    choices(choose('In this outlet’s kitchen','own','quantity',()=>state.kitchen='own'),choose('In another / shared kitchen','shared','route',()=>{state.kitchen='shared';state.task='shared';}),choose('I need to set up a kitchen','new-kitchen','route',()=>{state.kitchen='proposed';state.task='kitchen';}),choose('No cooking — purchased items','purchase','route',()=>{state.kitchen='none';state.task='purchase';}));
    break;
   }
   case 'quantity':{
    if(!p?.ready){
     if(s.loading)host.append(el('p','Reading saved category quantities…'));
     else if(s.items?.length){
      ask('Which saved item do you want to plan?');const l=el('label','Production item'),select=el('select');select.id='bobsGuide-item';
      for(const x of s.items){const o=el('option',x.item.name);o.value=x.key;o.selected=x.key===item(s)?.key;select.append(o);}select.onchange=()=>{state.itemKey=select.value;persist();};l.append(select);host.append(l,productionRoute(s,'Open the selected item’s production plan →'));
      select.addEventListener('change',()=>render());
     }else{ask('Save your menu first, so I can read the intended quantities from the category section.');host.append(route('method2.html','Open menu and item quantities →'));}
     if(s.readError)host.append(el('p','Saved data could not be verified. Retry progress reads before choosing a saved quantity.'));
     break;
    }
    ask('How many '+p.name+' do you intend to produce?');
    if(p.kitchen){host.append(el('p','This kitchen’s target comes from the receiving outlet orders. Change those orders to change the combined quantity.'),route('kitchen-flow.html','Review receiving outlet quantities →',{stage:'demand'}));choices(choose('Use the combined saved orders','combined','time'));break;}
    host.append(el('p','Current plan: '+p.quantity+' '+p.unit+'. '+(p.savedQuantity!=null?'Saved category quantity: '+p.savedQuantity+' '+p.unit+'.':'No positive saved category quantity is available.')));
    const b=[];if(p.savedQuantity!=null)b.push(choose('Use saved category quantity ('+p.savedQuantity+' '+p.unit+')','saved-quantity','time',()=>{adapter().quantity(String(p.savedQuantity));draft={};}));
    b.push(choose('Set a new production target here','new-target','target'),choose('Keep the quantity already on this page','keep-quantity','time',()=>{if(!(Number(p.quantity)>0))throw Error('Enter a positive quantity first.');}));choices(...b);
    break;
   }
   case 'target':
    if(needProduction(s))break;
    ask('What production quantity should the equipment handle?');
    host.append(input('Intended '+p.name+' ('+p.unit+')','quantity','number',p.quantity));
    choices(button('Apply target to this plan','apply-target',()=>{adapter().quantity(draft.quantity??p.quantity);draft={};go('time','Set a new production target');}));
    host.append(el('p','This changes the planning draft. Review and save the plan to update the category quantity; actual sales are kept separately.'));
    break;
   case 'time':{
    if(needProduction(s))break;
    ask('When should '+p.quantity+' '+p.unit+' of '+p.name+' be ready?');
    host.append(input('Ready by','time','time',p.readyBy));const l=el('label','Deadline day'),select=el('select');select.id='bobsGuide-day';
    for(const [v,t]of [['0','Today'],['1','Tomorrow']]){const o=el('option',t);o.value=v;o.selected=v===String(draft.day??p.readyDay);select.append(o);}select.onchange=()=>draft.day=select.value;l.append(select);host.append(l);
    choices(button('Use this ready-by time','apply-time',()=>{adapter().ready(draft.time??p.readyBy,draft.day??p.readyDay);draft={};go('recipes','Ready-by time selected');}));
    break;
   }
   case 'recipes':
    if(needProduction(s))break;
    ask(p.recipes.length?'Next, have you reviewed every recipe and selected side?':'This item has no in-house recipe requirements.');
    if(p.recipes.length){host.append(el('p','Yes — complete each link below, one at a time. Check portions → Calculate quantities from reference → review ingredients and rates → Save → return here. Reuse an unchanged saved recipe only after checking it still applies.'));
     const list=el('ol');for(const r of p.recipes){const li=el('li'),a=el('a',r.name);const url=new URL(r.href,location.href);if(url.origin!==location.origin)continue;a.href=url.href;a.target='_blank';a.rel='opener';li.append(a,el('small',r.status));list.append(li);}host.append(list);
     host.append(el('p',p.recipeReviewed?'The page confirmation is ticked. The plan still needs its verified Save.':'After completing the reviews, tick the confirmation below the recipe links on the page.'));
     choices(button('Show recipe instructions on the page','show-recipes',()=>focus('recipeReviewHeading')),button('Continue to equipment questions','recipe-next',()=>{if(!adapter().snapshot().recipeReviewed)throw Error('Complete the recipe reviews and tick the page confirmation first. Opening links alone does not finish the review.');go('assets','Recipe review confirmed on the page');}));
    }else host.append(route('kitchen-flow.html','Review production sources →',{stage:'demand'}));
    break;
   case 'assets':
    if(needProduction(s))break;
    ask('Do you already own the equipment needed for '+p.name+' and its sides?');
    host.append(el('p',p.assets.length?'Current inventory: '+p.assets.map(a=>a.name+' — '+a.ownedQty+' owned / '+a.quantity+' required').join('; ')+'.':'No equipment is recorded in this plan yet.'));
    choices(choose('Yes — use my existing machines','owned','equipment'),choose('Some — add the missing machines','some','equipment'),choose('No — help me choose equipment','none','equipment'));
    break;
   case 'equipment':{
    if(needProduction(s))break;
    ask('Choose a process. Shall we reuse a machine or add suitable equipment now?');
    host.append(el('p','Required loads come from your quantity and recipes. Equipment options are capacity references; check the usable capacity and cycle time. Set “Already owned units” accurately.'));
    for(const process of p.processes){const box=el('div',undefined,'guide-process');box.append(el('strong',process.name),el('p','Recipe equipment: '+process.equipment));
     box.append(button('Use / review existing equipment for '+process.name,'reuse-'+process.id,()=>{const card=[...document.querySelectorAll('[data-capacity]')].find(x=>x.dataset.capacity===process.id);if(!card)throw Error('This process changed. Refresh the guide.');options.minimise();card.scrollIntoView?.({block:'center'});card.querySelector('[data-slot],.process-capacity')?.focus();}));
     for(const r of process.references)box.append(button('Compare / add '+r.name,'equipment-'+process.id+'-'+r.index,()=>{options.minimise();adapter().equipment(process.id,r.index);}));
     box.append(button('Add / name another machine','custom-'+process.id,()=>{options.minimise();adapter().equipment(process.id,null);}));host.append(box);
    }
    host.append(el('p','Additions remain in the draft until you save the reviewed production plan. That save adds them to Asset Master; then review their price, useful life and product shares there. Reuse the same asset for a shared machine.'));
    choices(choose('What should I do after equipment?','after-equipment','next'));break;
   }
   case 'next':
    ask('Next, check whether the production can finish on time.');
    host.append(el('p','Review every process’s capacity, start/finish time and active staff work. Calculate time and equipment usage. Resolve conflicts, confirm the required reviews, then Save reviewed plan to Google & continue.'));
    if(p?.ready)choices(button('Take me to the time assessment','assess',()=>focus('assessTime')));
    host.append(route('outlet-plan.html','After saving: assess workforce →',{stage:'workforce'}),route('asset-master.html','Review Asset Master values →'),route('capital-expenditure.html','Review equipment purchase budget →'),route('working-capital.html','Review working capital →'));
    choices(choose('Check my next saved requirement','next-saved','resume'));break;
   case 'resume':{
    ask('Check saved progress — what is incomplete?');
    host.append(el('p','This checks records already saved in Google. It does not save your current entries or move you to another page.'));
    if(s.dirty)host.append(el('p','You have unsaved changes on this page. This result describes the saved version. Save this page first if you want those changes included.','guide-draft-note'));
    const notice=el('p',s.loading?(s.progress?.message||'Checking saved Google records…'):s.readError?(s.progress?.message||'Saved progress could not be verified. Please retry.'):'Saved records checked.');notice.setAttribute('role','status');
    if(s.loading||s.readError)host.append(notice);
    else if(s.next){host.append(notice,el('p','Next incomplete step: '+s.next.title),el('p',s.next.reason));host.append(route(s.next.href,'Open this incomplete step →'));}
    else host.append(el('p',s.progress?.status==='ready'?'No next incomplete step was identified for this selection. You can keep reviewing this page or open BOBS progress for the full list.':'Run the check to find the next incomplete step in your saved records.'));
    const retry=button(s.readError?'Retry saved-progress check':s.loading?'Checking saved progress…':'Check saved progress again','refresh',()=>{options.refresh();host.parentElement?.scrollTo?.({top:0});});retry.disabled=!!s.loading;
    choices(retry,button('Keep editing this page','resume-edit',()=>options.minimise()));
    break;
   }
   case 'route':{
    if(state.task==='new-outlet'){ask('Add the outlet’s details, then I’ll guide its kitchen and production setup.');host.append(route('outlets.html','Open Outlet Setup →'));}
    else if(state.task==='shared'){ask('Which kitchen will supply this outlet?');host.append(el('p','Choose the supplying kitchen for each item and side, then enter the receiving outlets’ quantities and ready-by times. The kitchen’s total comes from those orders.'),route('kitchen-flow.html','Choose supplying kitchen and outlet quantities →',{stage:'demand'}));}
    else if(state.task==='purchase'){ask('Choose purchased supply for the relevant items.');host.append(el('p','Purchased-only items use supplier quantities and costs. Any side made here still needs its own production review.'),route('method2.html','Review item production / purchase choices →'));}
    else {ask('Register the kitchen and its working shifts first.');host.append(route('kitchen-flow.html','Open Kitchen Setup →',{stage:'locations'}));}
    choices(choose('Continue with production questions','continue-production','quantity'),choose('Check what is saved','route-resume','resume'));break;
   }
  }
  if(error){const notice=el('p',error,'guide-error');notice.setAttribute('role','alert');host.append(notice);}
  renderChecklist(s);
  const nav=el('div',undefined,'guide-nav');
  if(state.history.length)nav.append(button('Back one question','back',()=>{const previous=state.history.pop();state.step=steps.has(previous.step)?previous.step:'start';draft={};error='';persist();render();}));
  if(state.step!=='start')nav.append(button('Choose a different task','restart',()=>{state={step:'start',history:[]};draft={};persist();render();}));host.append(nav);
  persist();
 }
 function update(){if(host.contains(document.activeElement)&&/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName))return;render();}
 function kitchenNext(){const s=snapshot();restore(s);if(s.ctx.page!=='kitchen-flow.html'||!s.kitchenSetup?.verified||!document.getElementById('kitchenNextGo'))return false;error='';state.step='kitchen-next';persist();render();return true;}
 // Update only the read-only checklist after page edits; keep action buttons attached during clicks.
 let checklistTimer;
 const checklistUpdate=e=>{if(host.contains(e.target))return;clearTimeout(checklistTimer);checklistTimer=setTimeout(()=>renderChecklist(snapshot()),0);};
 for(const type of ['input','change','click'])document.addEventListener(type,checklistUpdate);
 render();return {update,kitchenNext};
}
root.BOBS_GUIDE_BOT={mount,checklistModel};
})(window);
