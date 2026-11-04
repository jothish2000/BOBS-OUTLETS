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


function savedPageContext(s,href){
 const blocked=s.loading||s.readError||s.progress?.status!=='ready'||!!(s.savedChecklist?.owner&&s.ctx?.outlet&&String(s.savedChecklist.owner)!==String(s.ctx.outlet));
 const owner=s.savedChecklist?.name||s.ctx?.outlet&&'Outlet '+s.ctx.outlet||'the selected scope';
 let current;try{
 const here=new URL(href),matches=[];
 function visit(rows){for(const row of rows||[]){if(row.href){try{const u=new URL(row.href,here),page=u.pathname.split('/').pop();
 if(u.origin===here.origin&&page===here.pathname.split('/').pop()&&['stage','cat','i','item'].every(key=>{
 const wanted=u.searchParams.get(key),actual=here.searchParams.get(key);
 return wanted==null?!(key==='stage'&&page==='outlet-plan.html'&&actual):wanted===actual||(key==='stage'&&wanted==='baseline'&&!actual);
 }))matches.push(row);}catch(_){}}
 visit(row.children);}}
 visit(s.savedChecklist?.stages);
 // Ambiguous shared routes must never invent a page-completion result.
 current=matches.length===1?matches[0]:null;
 }catch(_){}
 return {owner,blocked,current:blocked?null:current,title:s.pageHelp?.title||current?.title||'this page'};
}


function currentAction(s){
 if(root.BOBS_OUTLET_PLAN_GUIDE)return root.BOBS_OUTLET_PLAN_GUIDE.snapshot();
 const ids={'outlets.html':['outletsReviewed','save','status'],'kitchen-flow.html':['kitchenReviewed','saveKitchen','kitchenStatus'],'asset-master.html':['planningReviewed','planningSave','planningStatus'],'working-capital.html':['planningReviewed','planningSave','planningStatus'],'salary-editor.html':['salaryReviewed','saveSalaryPackage','salaryActionStatus'],'kitchen-equipment.html':['equipmentReviewed','saveEquipment','equipmentStatus'],'capital-expenditure.html':['capexReviewed','capexSave','capexStatus']};
 const fields=ids[s.ctx.page];if(!fields)return null;
 const review=document.getElementById(fields[0]),save=document.getElementById(fields[1]),status=document.getElementById(fields[2]);if(!review||!save)return null;
 const message=status?.textContent||'',saving=save.closest('[aria-busy=true]')||save.matches(':disabled')&&review.checked;
 return {title:s.pageHelp?.title||'This page',name:s.savedChecklist?.name||'',phase:saving?'saving':(status?.dataset.tone==='error'||/^(Not saved:|Could not load:|Incomplete)/.test(message))?'error':review.checked?'reviewed':'review',message,review:'#'+fields[0],save:'#'+fields[1],saveLabel:save.textContent};
}

function mount(host,options){
 options.work=options.work||options.minimise;
 let state,scope='',draft={},error='',methodPhase='',recipeWatch=null,recipeWatched=null,lastConfirmedNode=null,revealContinuation=false;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const adapter=()=>root.BOBS_PRODUCTION_GUIDE;
 function snapshot(){const s=options.snapshot();return {...s,currentAction:currentAction(s),recipeHelp:root.BOBS_RECIPE_GUIDE?.snapshot(),production:adapter()?.snapshot(),equipmentHelp:root.BOBS_EQUIPMENT_GUIDE?.snapshot(),kitchenSetup:root.BOBS_KITCHEN_GUIDE?.snapshot()};}
 function restore(s){
  const key='bobs-guide-conversation-v1:'+String(s.ctx.outlet||'company');
  if(key===scope)return;scope=key;draft={};state={step:'start',history:[]};
  try{const saved=JSON.parse(sessionStorage.getItem(key));if(saved&&steps.has(saved.step))state={...state,...saved,history:Array.isArray(saved.history)?saved.history.slice(-8):[]};}catch(_){}
  if(options.journey||s.methodFlow||s.method2||s.pageSupport||s.itemHelp||(s.ctx.page==='production-plan.html'&&s.production?.journey&&state.step==='start')){
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
 function focus(id){if(root.BOBS_REVIEW?.request('#'+id))return;options.minimise();adapter()?.focus(id);}
 function pageFocus(selector){if(root.BOBS_REVIEW?.request(selector))return;const target=document.querySelector(selector);if(!target)throw Error('This control is not ready yet. Wait for the page to load, or use its Retry button.');options.work();if(!target.matches('input,select,button,a'))target.tabIndex=-1;target.scrollIntoView?.({block:'center'});target.focus();}
 function needProduction(s){
  if(s.ctx.page==='recipe-cost-editor.html'&&s.recipeHelp){
   const h=s.recipeHelp,a=root.BOBS_RECIPE_GUIDE,focus=(label,id)=>button(label,'recipe-step-'+id,()=>{if(root.BOBS_REVIEW?.request('#'+id))return;options.work();a.focus(id);});
   host.append(el('p','You are reviewing a recipe.','guide-question'));
   if(h.stage==='loading'){host.append(el('p','Loading '+h.name+' — wait for the saved reference.'));return true;}
   host.append(el('p',h.name+' · one reference batch produces '+h.referenceYield+' '+h.unit+' · your required total '+h.target+' '+h.unit));
   if(h.extra==='yes')host.append(el('p','The parent plan selected 5% extra produced sides. The linked total already includes it; do not add it again.'));
   if(h.extra==='no')host.append(el('p','The parent plan selected normal side quantities only. No extra is added.'));
   if(h.stage==='serving-return'){host.append(el('p',h.servingReturn));host.append(button('Use updated total and review recipe','recipe-serving-apply',()=>a.applyServingTotal()));}
   else if(h.stage==='reference'){host.append(el('p',(h.bulk||h.volume)?'First check how much ONE reference recipe batch produces and its unit. This is separate from the quantity you need for this plan. Tick the reference review when correct.':'First check the reference batch output and the grams in ONE cooked piece / serving. This is not the total batch weight. Tick the reference review when correct.'));host.append(focus('Review the reference and its confirmation','referenceWeightReviewed'));}
   else if(h.stage==='intended'){host.append(el('p',(h.bulk||h.volume)?'Now check your required total production and serving quantity per menu item, then tick the second review.':'Now check your required piece count and the grams you want in ONE cooked piece / serving, then tick the second review.'));if(h.serving)host.append(el('p',h.serving));host.append(focus('Review intended quantity and serving choice','intendedWeightReviewed'));}
   else if(h.stage==='calculate'){host.append(el('p','Both checks are complete. Calculate the ingredient quantities now. This creates a preview and does not save.'));host.append(button('Calculate quantities from reference','recipe-step-calculate',()=>a.calculate()));}
   else if(h.stage==='review'){host.append(el('p','Calculation is ready. Review ingredient quantities, rates and energy use. Tick the final recipe review only when they are correct.'));host.append(focus('Review the calculated ingredients','productionRows'),focus('Show final recipe review','confirmed'));}
   else if(h.stage==='save'){host.append(el('p','Your recipe review is ticked. Save explicitly; after verification I will guide the next unfinished recipe in the parent plan.'));host.append(button('Save reviewed recipe and return →','recipe-step-save',()=>a.save()));}
   else host.append(el('p',h.stage==='saving'?'Saving and verifying — keep this page open.':'✓ Recipe saved and verified. Returning to the parent plan.'));
   if(h.servingHref&&h.stage!=='saving')host.append(button('Change '+h.name+' serving quantity →','recipe-change-serving',()=>a.openServing()));
   if(h.message)host.append(el('small',h.message));
   const overview=el('details');overview.append(el('summary','See the full recipe checklist'),el('p','Reference → intended quantity / portion → Calculate → ingredients and rates → review confirmation → Save and return.'));host.append(overview);return true;
  }
  if(s.production?.ready)return false;
  const help={
   'recipe-cost-editor.html':['You are reviewing a recipe. Check the reference batch yield and intended total quantity in their displayed units. For sambar, review litres and serving ml; for Idli, review portion weights in grams. Calculate quantities from reference, review ingredients and rates, then Save. After verification, return to the production plan.',[['Show batch and serving details','referenceSection'],['Show Calculate quantities','scale'],['Show final recipe confirmation','confirmed']]],
   'asset-master.html':['Review each machine’s capacity, required and owned units, price, useful life and product shares. Your production-plan additions use this same Asset Master. Save after reviewing the values.',[['Show equipment details','planningBody'],['Show final asset review','planningReviewed']]],
   'working-capital.html':['Review ingredient, wage and operating-cash requirements against the saved menu and costs, then confirm and save.',[['Show cash requirements','planningBody'],['Show final cash review','planningReviewed']]],
   'outlet-plan.html':['Review this stage’s staffing, coverage and salary inputs. Confirm and save before proceeding to the next stage.',[['Show stage review','flowReviewed']]]
  }[s.ctx.page];
  if(help){host.append(el('p',help[0],'guide-question'));for(const [label,id]of help[1])host.append(button(label,'page-'+id,()=>{const target=document.getElementById(id);if(!target)throw Error('Wait for this page to load its review controls.');options.minimise();if(!target.matches('input,select,button,a'))target.tabIndex=-1;target.scrollIntoView?.({block:'center'});target.focus();}));return true;}
  host.append(el('p',s.ctx.page==='production-plan.html'?'Planning records are not ready yet. Use Retry on the page if loading failed; I will not assume a quantity.':'Open the selected item’s production plan so I can use its recipe, quantity and equipment.'));
  host.append(productionRoute(s,'Open this production plan →'));
  return true;
 }


 // Reuse this page's real next action. The checklist must not invent a second flow.
 function continuation(s,reviewNode){
  const kitchenSource=root.BOBS_KITCHEN_SOURCE_GUIDE?.snapshot();
  if(kitchenSource?.busy)return {message:'Saving and verifying supplying kitchens in Google. Keep this page open.'};
  if(kitchenSource?.saved){const links=[...document.querySelectorAll('#nextAction a')].filter(a=>!a.closest('details'));return links.length?{choices:links}:{message:'Supplying kitchens saved and verified. Next actions are loading.'};}
  // Report reviews have one independent Save per outlet; use its explicit association.
  const reportSave=reviewNode?.id&&[...document.querySelectorAll('[data-review-save]')].find(n=>n.dataset.reviewSave===reviewNode.id);
  if(reportSave){
   if(reportSave.disabled)return {message:'Saving and verifying this outlet review in Google. Keep this page open.'};
   if(reportSave.dataset.reviewSaved==='true'){const next=reportSave.closest('section')?.querySelector('[data-review-next]');return next?{choices:[next]}:{message:'This outlet review is saved and verified.'};}
   return {label:reportSave.textContent,run:()=>{options.minimise();reportSave.scrollIntoView?.({block:'center'});reportSave.focus();}};
  }
  const a=s.currentAction,stage=s.recipeHelp?.stage||s.production?.journey?.stage||s.equipmentHelp?.stage;
  if(a?.phase==='saving'||stage==='saving')return {message:'Saving and verifying in Google. Keep this page open.'};
  if(a?.phase==='error'||stage==='error'||stage==='load-error')return {message:a?.message||'Resolve the page’s error before continuing.'};
  const saved=a?.phase==='saved'||stage==='saved';
  if(!saved&&a?.phase==='reviewed')return {label:a.saveLabel,show:true,run:()=>pageFocus(a.save)};
  // This is the same action (including recipe links and Yes/No choices) already offered above.
  const candidates=[...host.querySelectorAll('button[data-guide-choice],a.guide-action')].filter(n=>!n.closest('.guide-checklist,.guide-nav,details')&&!n.disabled);
  const first=candidates[0];if(!first)return saved?{message:a?.next||'Saved and verified. Follow the next action shown on this page.'}:null;
  const choices=stage==='extra-sides'?candidates.filter(n=>['extra-yes','extra-no'].includes(n.dataset.guideChoice)):[first];
  return {choices};
 }
 function appendContinuation(s,list){
  const done=[...list.children].filter(n=>n.classList.contains('guide-checklist-done'));if(!done.length)return;
  const current=s.currentAction?.review&&document.querySelector(s.currentAction.review);
  const target=(current&&done.find(n=>n.reviewNode===current))||(lastConfirmedNode&&done.find(n=>n.reviewNode===lastConfirmedNode))||done.at(-1);
  const next=continuation(s,target.reviewNode);if(!next)return;
  const box=el('div',undefined,'guide-confirmation-next');box.dataset.confirmationNext='true';box.setAttribute('aria-live','polite');
  if(next.message)box.append(el('p',next.message));
  else if(next.label){box.append(el('strong','Next: '+next.label));box.append(button('Go to “'+next.label+'”','confirmation-next',next.run));}
  else {
   box.append(el('strong',next.choices.length>1?'Next: choose one option':'Next: '+next.choices[0].textContent));
   for(const original of next.choices){
    const b=button(original.textContent,'confirmation-next-'+(original.dataset.guideChoice||'link'),()=>{
     if(original.isConnected&&!original.disabled)original.click();else update();
    });box.append(b);
   }
  }
  // Directly below the tick, before any explanatory note or the secondary review button.
  target.children[0].after(box);

 }


 function revealNext(){
  if(!revealContinuation)return;
  const pane=host.parentElement,next=host.querySelector('[data-confirmation-next]');
  if(pane)pane.style.overflowAnchor='none';
  if(!next||!pane?.clientHeight)return;
  const b=next.getBoundingClientRect(),p=pane.getBoundingClientRect();
  const top=Math.max(p.top,pane.querySelector('.companion-head')?.getBoundingClientRect().bottom||p.top);
  if(b.bottom>p.bottom)pane.scrollTop+=b.bottom-p.bottom+12;
  else if(b.top<top)pane.scrollTop-=top-b.top+12;
 }
 if(root.ResizeObserver){const resize=new root.ResizeObserver(()=>{if(revealContinuation)root.requestAnimationFrame(revealNext);});resize.observe(host);if(host.parentElement)resize.observe(host.parentElement);}
 function restoreGuideScroll(top){
  if(host.parentElement)host.parentElement.scrollTop=top;
  revealNext();
  if(revealContinuation){if(root.requestAnimationFrame)root.requestAnimationFrame(revealNext);else setTimeout(revealNext,0);}
 }

 function renderChecklist(s){
  const scrollBefore=host.parentElement?.scrollTop||0;
  let box=host.querySelector('.guide-checklist');
  // The verified kitchen handoff already has a tick; keep both next-action cards in view.
  if(state?.step==='kitchen-next'||root.BOBS_REVIEW?.snapshot()?.active){box?.remove();return;}
  const opened=box?.querySelector('details')?.open;
  if(!box){box=el('section',undefined,'guide-checklist');box.setAttribute('aria-label','Your progress checklist');host.append(box);}
  box.replaceChildren();
  const m=checklistModel(s),local=root.BOBS_REVIEW?.snapshot();
  box.append(el('strong','Your actions on this page'));
  box.append(el('p','A green tick below means you confirmed that specific review or choice. Saving to Google is a separate action.'));
  const localList=el('ol',undefined,'guide-checklist-local');
  const add=(title,done,selector,detail)=>{const li=el('li',undefined,done?'guide-checklist-done':'guide-checklist-next');li.append(el('span',(done?'✓ ':'○ ')+title));if(detail)li.append(el('small',detail));if(selector){li.reviewNode=document.querySelector(selector);const b=button(done?'Review again':'Review these inputs','review-inputs-'+localList.children.length,()=>pageFocus(selector));if(done)b.classList.add('guide-review-again');li.append(b);}localList.append(li);};
  if(s.production?.ready){
   const p=s.production,c=p.checks||{};
   add(c.quantity?'You confirmed: '+p.quantity+' '+p.unit+' of '+p.name+', ready by '+p.readyBy+' '+(String(p.readyDay)==='1'?'tomorrow':'today'):'Confirm quantity and ready-by time',!!c.quantity,'#intendedQuantity');
   if(p.sides?.needed)add('Sides and serving quantities',!!p.sides.reviewed,'#sideServingSection',p.sides.summary);
   if(p.sources?.needed)add('Producing kitchens',!!p.sources.reviewed,'#productionSourceStep',p.sources.summary);
   if(p.extraSides?.needed)add(typeof p.extraSides.choice==='boolean'?'You selected: '+(p.extraSides.choice?'5% extra produced sides':'normal side quantities; no extra'):'Choose Yes or No for 5% extra sides',typeof p.extraSides.choice==='boolean','#sideExtraSection');
   add('Recipe review',!!p.recipeReviewed,'#recipeReviewed');
   let nextRecipe=false;for(const r of p.recipeSteps||[]){const next=!r.reviewed&&!nextRecipe;if(next)nextRecipe=true;add(r.name+' — '+(r.reviewed?(r.reviewMethod==='saved'?'saved and verified':'you confirmed the saved recipe still applies'):next?'next recipe to complete':'not reviewed yet'),!!r.reviewed,'#recipePlanLinks');}
   add('Equipment and capacity review',!!p.capacityReviewed,'#capacityReviewed');
   add('Process timing reviews',!!c.timing,'#processes');
   add('Capacity calculation completed without warnings',!!c.assessment,'#timeAssessment');
   add('Delivery choice confirmed',!!c.delivery,'#deliveryNeeded');
   box.append(el('p',p.journey?.stage==='saved'&&!p.dirty?'✓ Production plan saved and verified in Google.':'Production plan not saved yet. Finish the remaining reviews, then use Save reviewed plan to Google & continue.'));
  }
  const omit=s.production?.ready?new Set(['recipeReviewed','capacityReviewed','quantityReviewed','sideServingReviewed','productionSourceReviewed','deliveryReviewed']):new Set();
  for(const r of local?.rows||[])if(!omit.has(r.node.id)){
   const li=el('li',undefined,r.checked?'guide-checklist-done':'guide-checklist-next');li.reviewNode=r.node;
   li.append(el('span',(r.checked?'✓ Confirmation ticked: ':'○ Confirm: ')+r.title));
   if(r.checked&&r.method)li.append(el('small',r.method==='already-reviewed'?'You chose to confirm previously reviewed inputs without repeating the walkthrough.':'You confirmed after the guided input review.'));
   if(r.changed&&!r.checked)li.append(el('small','An input changed. Review the current values again.'));
   const reviewButton=button(r.checked?'Review again':'Review these inputs','review-field-'+localList.children.length,()=>root.BOBS_REVIEW.request(r.node));if(r.checked)reviewButton.classList.add('guide-review-again');li.append(reviewButton);localList.append(li);
  }
  if(s.recipeHelp&&!['loading','saving'].includes(s.recipeHelp.stage))add('Ingredient calculation complete',!!s.recipeHelp.calculated,'#scale');
  if(localList.children.length){box.append(localList);appendContinuation(s,localList);}
  if(local?.active){const a=local.active;box.append(el('p',a.currentTitle||'Current review: '+a.title));if(a.method==='guided'&&!a.ready)box.append(button(a.individual?'Go to the highlighted field':'Go to the highlighted section','review-current',()=>root.BOBS_REVIEW.focusCurrent()),button(a.individual?'Confirm this field & continue':'Confirm this section & continue','review-next',()=>root.BOBS_REVIEW.confirmField()),button('Return to review choices','review-choices',()=>root.BOBS_REVIEW.returnToChoices()));}
  const savedBox=el('details');savedBox.dataset.savedProgress='true';savedBox.open=!!opened;savedBox.append(el('summary','View overall saved progress'));box.append(savedBox);
  savedBox.append(el('strong','Previously saved Google progress'+(m.name?' — '+m.name:m.owner?' — '+m.owner:'')));
  if(m.message)savedBox.append(el('p',m.message));
  if(m.dirty)savedBox.append(el('p','The saved checklist below does not include unsaved edits on this page.','guide-checklist-draft'));
  if(!m.rows.length){restoreGuideScroll(scrollBefore);return;}
  const details=savedBox;details.append(el('p',m.done+' of '+m.rows.length+' saved stages verified'));
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
  if(!m.blocked){const completed=m.rows.filter(n=>n.status==='done');if(completed.length)savedBox.append(el('p','✓ Saved and verified: '+completed.at(-1).title,'guide-checklist-done'));const next=m.rows.find(n=>!['done','na'].includes(n.status));savedBox.append(el('p',next?'→ Next incomplete saved stage: '+next.title:'✓ All listed saved stages are verified or not required.',next?'guide-checklist-next':'guide-checklist-done'));}

  restoreGuideScroll(scrollBefore);
 }

 function render(){
  const scrollBefore=host.parentElement?.scrollTop||0;
  const s=snapshot();restore(s);const p=s.production;
  if(s.methodFlow){const phase=s.methodFlow.outlet+':'+s.methodFlow.phase;if(phase!==methodPhase){methodPhase=phase;state.step='page-task';state.history=[];}}
  if(p?.ready&&state.itemKey&&state.itemKey!==p.itemKey){state.step=p.journey?'production-flow':'quantity';state.history=[];draft={};}
  if(p?.ready)state.itemKey=p.itemKey;
  const sourceState=root.BOBS_KITCHEN_SOURCE_GUIDE?.snapshot();if(sourceState?.saved||sourceState?.busy){state.step='page-task';state.history=[];}
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
  const review=root.BOBS_REVIEW?.snapshot()?.active;
  if(review){
   if(review.currentTitle){
    const box=el('section',undefined,'guide-current-review');box.append(el('strong',review.currentTitle),el('p','Check or edit the yellow-highlighted input in its original location.'));
    box.append(button(review.individual?'Confirm this field & continue':'Confirm this section & continue','review-next',()=>root.BOBS_REVIEW.confirmField()),button('Return to review choices','review-choices',()=>root.BOBS_REVIEW.returnToChoices()));
    host.append(box);
   }
   // Choices/final confirmation are in the persistent review workspace within this same frame.
   persist();host.parentElement?.scrollTo?.({top:0});return;
  }
  const h=el('h3','Let’s plan your next step');h.tabIndex=-1;host.append(h);
  if(state.history.length){const transcript=el('details'),summary=el('summary','Your answers so far');transcript.append(summary);for(const x of state.history.slice(-6))transcript.append(el('p','You: '+x.answer));host.append(transcript);}
  const ask=text=>{const q=el('p',text,'guide-question');host.append(q);};
  const choices=(...buttons)=>{const box=el('div',undefined,'guide-choices');box.append(...buttons);host.append(box);};
  const choose=(text,id,next,action)=>button(text,id,()=>{action?.();go(next,text);});
  if(['outlet-details','locations','location-details','outlet-kitchen-existing','outlet-kitchen-details','outlet-kitchen-summary','page-task'].includes(state.step)&&['outlets.html','kitchen-flow.html'].includes(s.ctx.page)&&['reviewed','saving'].includes(s.currentAction?.phase))state.step='page-task';
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
    const work=(label,id)=>button(label,'plan-'+id,()=>{if(root.BOBS_REVIEW?.request('#'+id))return;options.work();adapter().focus(id);});
    if(stage==='loading'||stage==='load-error'){ask(stage==='loading'?'Loading your production plan…':'Production records need attention');host.append(el('p',j.message||'Wait for the saved quantities, recipes and equipment to load.'));if(stage==='load-error')choices(work('Show Retry Google reads','plannerRetry'));break;}
    if(stage==='saving'||stage==='saved'){ask(stage==='saving'?'Saving and verifying your plan…':'Production plan saved and verified');host.append(el('p',j.message));if(stage==='saving')host.append(el('p','Please keep this window open. I will guide the next step after verification.'));break;}
    if(stage==='error'){ask('The plan is not fully saved');host.append(el('p',j.message));choices(button('Review the unfinished step','plan-retry-step',()=>adapter().retryStep()),work('Show save message','planSaveStatus'));break;}
    if(stage==='quantity'){ask(name+' — how much, and ready by when?');host.append(el('p','Review the intended production quantity, ready-by time and day. These are planning inputs; Sold Today is entered separately as the actual result.'));choices(work('Review quantity and ready-by time','intendedQuantity'),button('Quantity and time reviewed — continue','plan-quantity-next',()=>adapter().continueQuantity()));}
    else if(stage==='side-servings'){ask(name+' — review sides and serving quantities first');host.append(el('p',p.sides.summary),el('p','Review which sides are supplied, whether each is produced or purchased, and the amount per main item. Edit the serving amounts in this section. Review the serving examples in the help popup, then confirm this review. Next, choose the producing kitchens.'));choices(work('Review sides and serving quantities','sideServingSection'),work('Confirm the sides review','sideServingReviewed'));}
    else if(stage==='source-save'){ask(name+' — save demand and kitchen choices');host.append(el('p','Serving quantities and producing kitchens are confirmed for this draft. Save to verify them in Google and show the selected kitchen’s next required step.'));choices(work('Show Save demand & selected kitchen’s next step','chooseProductionSource'));}
    else if(stage==='source-saved'){ask('✓ Demand and supplying kitchens saved and verified');host.append(el('p','Continue using the selected kitchen’s next action below. Its equipment and workers serve the combined outlet demand.'));choices(work('Show selected kitchen’s next step','sourceNextActions'));}
    else if(stage==='source'){ask(name+' — choose the supplying kitchen');host.append(el('p','Choose a named kitchen from the dropdown for each produced item and side. Nothing is selected automatically. You may explicitly use the first selected kitchen for all produced items. Confirm the choices here before the optional extra allowance.'));choices(work('Choose producing kitchens','productionSourceStep'),work('Confirm producing kitchens','productionSourceReviewed'));}
    else if(stage==='extra-sides'){ask('Would you like 5% extra produced sides and condiments?');host.append(el('p','Choose Yes or No for '+name+'. No is a complete choice. Neither is preselected; main quantity and normal serving portions stay unchanged.'));choices(button('Yes — prepare 5% extra','extra-yes',()=>adapter().chooseExtra(true)),button('No — normal requirement only','extra-no',()=>adapter().chooseExtra(false)));}
    else if(stage==='recipes'){const rows=p.recipeSteps||p.recipes,current=rows.find(r=>!r.reviewed);if(current){ask('Next recipe: '+current.name);host.append(el('p','Review this recipe now. I will guide the next unfinished recipe after its verified save or your explicit review of an unchanged saved recipe.'),el('small',current.status));const a=el('a','Open '+current.name+' recipe →','guide-action');a.href=current.href;a.target='_blank';a.rel='opener';host.append(a);if(current.current)choices(button('Saved recipe still applies — continue','recipe-reuse',()=>adapter().confirmRecipe(current.reviewKey)));}else{ask('Each recipe has been reviewed');host.append(el('p','Tick the final recipe confirmation to continue with equipment and capacity.'));choices(work('Show recipe confirmation','recipeReviewed'));}const all=el('details');all.append(el('summary','See all recipes in this plan'));for(const r of rows)all.append(el('p',(r.reviewed?'◐ Reviewed: ':'○ To review: ')+r.name));host.append(all);if(p.extraSides?.needed)host.append(el('p',p.extraSides.summary));}
    else if(stage==='equipment'){ask(name+' — choose equipment and usable capacity');host.append(el('p','For each process, reuse suitable existing equipment or compare the equipment references. Enter the usable capacity per cycle and compatible unit. After checking every process, tick the equipment review confirmation.'));choices(work('Review process equipment and capacity','capacitySection'),work('Show equipment confirmation','capacityReviewed'));}
    else if(stage==='timing'){ask('Review timing for '+j.process);host.append(el('p','Check start and finish times, hands-on work, machine time, supervision and cleaning. Include preparation stages where needed. Tick this process’s timing/skill review only when it is correct.'));choices(button('Review '+j.process+' timings','plan-process',()=>{options.work();adapter().focusProcess(j.processId);}));}
    else if(stage==='assessment'){ask(name+' — check whether production fits');host.append(el('p',j.message||'Calculate the reviewed processes to check completion time and shared equipment. Resolve any warning before continuing.'));choices(button('Calculate time and equipment usage','plan-calculate',()=>adapter().calculate()),work('Show timings and calculation result','timeAssessment'));}
    else if(stage==='delivery'){ask(name+' — review delivery');host.append(el('p','Check whether delivery staff are needed. If Yes, enter the shared rider ID and count. If No, leave Delivery staff needed unticked. This review remains a draft until the final save.'));choices(work('Review delivery choice','deliveryNeeded'),button('Delivery reviewed — continue to save','plan-delivery-next',()=>adapter().continueDelivery()));}
    else if(stage==='save'){ask(name+' — ready to save your reviewed plan');host.append(el('p','Save the reviewed plan to Google. After verification, return to the item editor, where I will explain its next required review. Other menu items may still need planning.'));choices(button('Save reviewed plan to Google & continue →','plan-save',()=>adapter().save()),work('Review the final save area','saveProductionPlan'));}
    const overview=document.getElementById('productionPlanningHelp');if(overview){const d=el('details');d.append(el('summary','How production planning works'),el('p',overview.textContent));host.append(d);}
    break;
   }

   case 'page-task':{
    const sourceGuide=root.BOBS_KITCHEN_SOURCE_GUIDE?.snapshot();if(sourceGuide){ask(sourceGuide.title);host.append(el('p',sourceGuide.instruction));if(sourceGuide.saved){for(const line of sourceGuide.summary||[])host.append(el('p',line));for(const entry of sourceGuide.history||[]){const d=el('details');d.append(el('summary',entry.title));for(const line of entry.text||[])d.append(el('p',line));for(const link of entry.links||[]){const a=el('a',link.label,'guide-action');a.href=link.href;d.append(a);}host.append(d);}for(const next of sourceGuide.next||[]){const a=el('a',next.label,'guide-action');a.href=next.href;host.append(a);}}else choices(button('Review producing kitchens, batch choices and dispatch','source-review',()=>pageFocus(sourceGuide.selector)));break;}
    if(s.equipmentHelp){const h=s.equipmentHelp,work=(label,id)=>button(label,'inventory-'+id,()=>{options.work();root.BOBS_EQUIPMENT_GUIDE.focus(id);});
     ask(h.stage==='empty'?'No equipment recorded for '+h.name:h.stage==='saved'?'Equipment saved — choose your next step':h.name+' — existing equipment');
     if(h.stage==='loading')host.append(el('p','Reading the saved equipment. Wait for the result before adding anything.'));
     else if(h.stage==='load-error'){host.append(el('p','The equipment could not be loaded. This does not mean the inventory is empty.'));choices(work('Show Retry Google load','equipmentRetry'));}
     else if(h.stage==='saving')host.append(el('p','Saving and verifying in Google. Keep this page open.'));
     else if(h.stage==='saved'){host.append(el('p','✓ Inventory saved and verified. Next, review outlet expenses and mandatory staff. Capacity and costing will be assessed against the menu later.'));choices(work('Show Continue to outlet expenses','equipmentContinue'));}
     else if(s.currentAction?.phase==='reviewed'){host.append(el('p','✓ Inventory review confirmed. Next: '+s.currentAction.saveLabel));choices(work('Go to “'+s.currentAction.saveLabel+'”','saveEquipment'));}
     else if(h.stage==='empty'){host.append(el('p','No equipment has been added here yet. Start with the food you produce, then identify the machines you already own. This does not mean your kitchen has no machines.'));choices(button('Help me identify my existing equipment →','inventory-help',()=>{options.minimise();document.getElementById('openEquipmentHelp').click();}));}
     else{host.append(el('p',h.stage==='draft'?'Your equipment changes are not saved. Check each machine name, existing units and capacity status. Unknown capacity can stay pending.':'There are '+h.count+' equipment entries. Review existing units and capacity status. Estimates are different from confirmed measurements.'));choices(work('Review equipment entries','equipmentRows'),work('Show inventory confirmation and Save','equipmentReviewed'));}
     host.append(el('small',h.message||''));break;
    }
    if(s.itemHelp){const help=s.itemHelp;if(help.notice)host.append(el('p',help.notice,'guide-confirmed'));ask(help.title);host.append(el('p',help.instruction));
     if(help.href){const u=new URL(help.href,location.href);if(u.origin!==location.origin)throw Error('Planner link must stay within BOBS.');u.searchParams.set('guide','continue');const a=el('a',help.action,'guide-action');a.href=u.href;a.target='_blank';a.rel='opener';a.dataset.guideChoice='item-open-production';host.append(a);}
     else choices(button(help.action,'item-next-control',()=>{options.work();root.BOBS_ITEM_GUIDE.focus();}));
     if(help.continueAction)choices(button(help.continueAction.label,'item-continue',()=>root.BOBS_ITEM_GUIDE.continue()));
     if(help.earlier){const earlier=el('details');earlier.append(el('summary','Review earlier planning'));const a=el('a',help.earlier.label,'guide-action');a.href=help.earlier.href;a.target='_blank';a.dataset.guideChoice='item-review-production';earlier.append(a);host.append(earlier);}
     if(help.source?.title){const source=el('details');source.append(el('summary','Recipe / purchase source'),el('strong',help.source.title),el('p',help.source.text));host.append(source);}
     break;}
    const flow=s.methodFlow||(s.method2?{phase:'method2',baselineReady:true,workspace:s.method2}:null);
    if(flow){
     const work=flow.workspace;
     if(!flow.baselineReady){ask('Check the outlet prerequisites.');host.append(el('p',flow.baselineMessage));}
     else if(flow.phase==='method2'){
      ask(work?.ready?'Continue Method 2 — your selected items':'Method 2 — checking selected items');
      if(work?.item){const x=work.item;host.append(el('p',x.name+' is selected. Its current Mode is '+(x.mode==='production'?'Production':'Purchase')+'.'),el('p','Review the Mode in the '+x.name+' row, then click “Edit item ↗” in that same row. '+(x.mode==='production'?'The item window first confirms demand and the supplying kitchen, then guides recipes, capacity and production time.':'The item window guides you through supplier costs, quantities and any sides prepared here.')),el('p','Save your reviewed changes in the item window, then return here for the next requirement.'));}
      else host.append(el('p',work?.instruction||'Wait for the Method 2 item list to load. If it reports a read failure, use Reload Google records inside Method 2.'));
      choices(button(work?.action||'Show Method 2 workspace','method-flow-work',()=>{options.minimise();(root.BOBS_METHOD_FLOW_GUIDE||root.BOBS_METHOD2_GUIDE).focus();}));
     }else{
      const copy=flow.phase==='method1'?['Continue Method 1 — hourly analysis','Review the hourly customer and basket inputs in Method 1. Complete its save and review before using Save & Continue below the workspace.','Show Method 1 workspace']:flow.phase==='other'?['Method review saved — choose what to do next','Use the choices on this page to review another method or finish this outlet. Analysing both methods is optional.','Show the next decision']:flow.phase==='finish'?['Continue to outlet profitability','The selected methods have been reviewed. Use Review outlet profit & break-even to continue.','Show outlet profitability action']:['Choose an analysis method','The outlet prerequisites are verified. Choose Method 1 for hourly footfall or Method 2 for selected items.','Show method choices'];
      ask(copy[0]);host.append(el('p',copy[1]));choices(button(copy[2],'method-flow-work',()=>{options.minimise();root.BOBS_METHOD_FLOW_GUIDE.focus();}));
     }
     break;
    }
    const action=s.currentAction;
    if(action){
     ask((action.name?action.name+' — ':'')+action.title);
     host.append(el('p',action.phase==='reviewed'?'✓ Review confirmed. These entries have not been saved by ticking the box.':action.phase==='saving'?'Saving and verifying in Google. Keep this page open.':action.phase==='saved'?'✓ Saved and verified in Google.':action.phase==='error'?'The current step could not be completed.':action.phase==='loading'?'Loading the current page records. Please wait.':'Review the existing entries in the highlighted sections.'));
     if(action.phase==='error'||action.phase==='saving')host.append(el('p',action.message||'Check the page status.'));
     if(action.phase==='reviewed'){host.append(el('p','Next: click “'+action.saveLabel+'”. '+(action.next||'')));choices(button('Go to “'+action.saveLabel+'”','current-save',()=>pageFocus(action.save)));}
     else if(action.phase==='review')choices(button('Review my previously entered inputs','current-review',()=>root.BOBS_REVIEW?root.BOBS_REVIEW.request(action.review):pageFocus(action.review)));
     else if(action.phase==='saved')host.append(el('p',action.next||'Follow the verified save continuation on this page.'));
     if(action.phase==='error')choices(button('Show the current entries and save status','current-error',()=>pageFocus(action.save||action.review)));
     const other=el('details');other.dataset.otherChecks='true';other.append(el('summary','Other checks — previously saved progress'),el('p','This checks saved Google records. It does not save or replace your current entries.'),choose('Check saved progress & show what’s incomplete','page-progress','resume',()=>options.refresh()));host.append(other);
     break;
    }
    if(s.pageSupport){
     const support=s.pageSupport;ask(support.title);host.append(el('p',support.instruction));
     choices(...support.actions.map((a,i)=>button(a.label,'page-support-'+i,()=>root.BOBS_PAGE_GUIDANCE.focus(a))));
     if(support.overview?.length){const overview=el('details',undefined,'guide-page-overview');overview.append(el('summary','How this planning step works'));for(const text of support.overview)overview.append(el('p',text));host.append(overview);}
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
    const info=savedPageContext(s,location.href),current=info.current;
    ask('Saved progress check — separate from your current review');
    host.append(el('p','Checking saved records for '+info.owner+'. This does not save your current entries or move you to another page.'));
    host.append(el('p','You are reviewing: '+info.title+'.','guide-current-page'));
    if(s.ctx.selected?.length>1)host.append(el('p','This result is for the selected outlet, not confirmation that all selected outlets are complete.'));
    if(s.dirty)host.append(el('p','You have unsaved changes on this page. The result below describes the saved version only. Review and save here before relying on those changes.','guide-draft-note'));
    const notice=el('p',s.loading?(s.progress?.message||'Checking saved Google records…'):s.readError?(s.progress?.message||'Saved progress could not be verified. Please retry.'):'Saved records checked.');notice.setAttribute('role','status');host.append(notice);
    if(!info.blocked){
     if(current?.status==='done')host.append(el('p','Saved status of this section: complete — '+current.title+'. Its saved inputs passed the current checks. This does not mean you have reviewed it again today.','guide-current-status'));
     else if(current?.status==='na')host.append(el('p','Saved status of this section: not applicable to the saved selection.','guide-current-status'));
     else if(current)host.append(el('p','Saved status of this section: '+(current.status==='unknown'?'could not be verified':current.status==='review'?'needs review':'not complete')+'. '+(current.reason||''),'guide-current-status'));
     else host.append(el('p','This page has no single matching saved-completion check. No completion is assumed.','guide-current-status'));
     if(s.next){
      host.append(el('p','Next incomplete step: '+s.next.title));
      if(current?.status==='done'&&current!==s.next)host.append(el('p','Why another step is shown: this section is already complete in the saved records, while the step below still needs attention.'));
      host.append(el('p',s.next.reason||'Review this saved requirement.'));
      host.append(el('p','If you are testing or reviewing the flow from the beginning, stay on this page and finish your review. Opening the saved-data requirement is optional.'));
      host.append(route(s.next.href,'Open this saved-data requirement →'));
     }else host.append(el('p','No next incomplete step was identified for this selection. Continue reviewing this page or open BOBS progress.'));
    }else if(!s.loading&&!s.readError)host.append(el('p','Run the check to see what is saved. No completion is assumed yet.'));
    const retry=button(s.readError?'Retry saved-progress check':s.loading?'Checking saved progress…':'Check saved progress again','refresh',()=>{options.refresh();host.parentElement?.scrollTo?.({top:0});});retry.disabled=!!s.loading;
    choices(button('Stay here — review this page','resume-edit',()=>{const target=s.pageHelp?.anchor;if(target&&document.querySelector(target))pageFocus(target);else options.minimise();}),retry);
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
  persist();restoreGuideScroll(scrollBefore);
 }
 function update(){if(host.contains(document.activeElement)&&/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName))return;render();}
 function kitchenNext(){const s=snapshot();restore(s);if(s.ctx.page!=='kitchen-flow.html'||!s.kitchenSetup?.verified||!document.getElementById('kitchenNextGo'))return false;error='';state.step='kitchen-next';persist();render();return true;}
 // Update only the read-only checklist after page edits; keep action buttons attached during clicks.
 let checklistTimer,actionStamp='';
 const actionKey=s=>JSON.stringify([root.BOBS_KITCHEN_SOURCE_GUIDE?.snapshot(),s.currentAction,s.recipeHelp?.stage,s.recipeHelp?.calculated,s.production?.journey,s.equipmentHelp?.stage,s.itemHelp,s.method2,s.pageSupport,root.BOBS_REVIEW?.snapshot()?.active]);
 function refreshAction(){const s=snapshot(),stamp=actionKey(s);if(stamp!==actionStamp){actionStamp=stamp;update();}else renderChecklist(s);}
 const checklistUpdate=e=>{if(host.contains(e.target))return;if(e.type==='input'||e.type==='change')revealContinuation=false;if(e.type==='change'&&e.target.matches?.('input[type=checkbox]')&&e.target.checked&&(root.BOBS_REVIEW?.isReview?.(e.target)??true)){lastConfirmedNode=e.target;revealContinuation=true;}clearTimeout(checklistTimer);checklistTimer=setTimeout(refreshAction,0);};
 // Keep the new action visible through asynchronous saved-progress refreshes,
 // but yield immediately when the user scrolls, navigates or clicks in the guide.
 for(const type of ['wheel','touchstart','pointerdown','keydown'])host.parentElement?.addEventListener(type,()=>{revealContinuation=false;},{passive:true});
 for(const type of ['input','change','click'])document.addEventListener(type,checklistUpdate);
 let handlingReview=false;root.addEventListener('bobs-review-context',()=>{clearTimeout(checklistTimer);if(handlingReview)return;handlingReview=true;try{refreshAction();}finally{handlingReview=false;}});
 const actionObserver=new MutationObserver(records=>{if(records.every(r=>host.contains(r.target)||r.target.closest?.('#bobsCompanion,#bobsRoadmap,[data-review-ui],#bobsFlowGuide,#bobsReferenceDialog,#bobsNextActionBar')))return;clearTimeout(checklistTimer);checklistTimer=setTimeout(refreshAction,30);});
 actionObserver.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','aria-busy','data-tone']});
 actionStamp=actionKey(snapshot());render();return {update,kitchenNext};
}
root.BOBS_GUIDE_BOT={mount,checklistModel,savedPageContext};
})(window);
