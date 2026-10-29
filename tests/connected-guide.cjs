const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=p=>fs.readFileSync(p,'utf8');
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r))};
test('opening the index itself welcomes the user automatically with the real setup entry',async()=>{
 for(const url of ['https://bobs.test/index.html','https://bobs.test/']){
 const dom=new JSDOM('<main>BOBS</main>',{runScripts:'outside-only',url}),w=dom.window;
 try{w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
  assert.equal(w.document.getElementById('bobsCompanion').hidden,false);assert.match(w.document.getElementById('bobsGuideDialogue').textContent,/Welcome to BOBS/);const a=[...w.document.querySelectorAll('#bobsGuideDialogue a')].find(a=>a.textContent==='Start here — guided outlet setup →');assert.equal(new URL(a.href).pathname,'/outlets.html');assert.equal(new URL(a.href).searchParams.get('guide'),'start');assert.equal(a.target,'_self');
 }finally{w.close()}
 }
});
test('index starts the guided journey; outlet choice hands off once and minimising survives page edits',async()=>{
 assert.match(source('index.html'),/href="outlets.html\?guide=start"/);
 const dom=new JSDOM('<div id="savedModal"><button>Choose saved work</button></div><input id="count" value="2"><div id="cards"><input class="name"></div><input type="checkbox" id="outletsReviewed">',{runScripts:'outside-only',url:'https://bobs.test/outlets.html?guide=start'}),w=dom.window;
 try{
 w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
 const panel=w.document.getElementById('bobsCompanion');assert(panel.hidden,'Saved-data choice stays foremost');assert.equal(w.sessionStorage.getItem('bobs-guide-journey-v1'),'active');
 w.document.getElementById('savedModal').classList.add('hidden');w.dispatchEvent(new w.Event('bobs-outlet-choice'));await settle();
 assert(!panel.hidden);assert.match(panel.textContent,/How many outlets/);w.document.querySelector('[data-guide-choice=outlet-count]').click();assert(panel.hidden);assert.equal(w.document.activeElement.id,'count');
 w.document.getElementById('count').value='3';w.document.getElementById('count').dispatchEvent(new w.Event('input',{bubbles:true}));w.dispatchEvent(new w.Event('bobs-outlet-choice'));assert(panel.hidden);assert.equal(w.document.getElementById('count').value,'3');assert.equal(w.document.getElementById('outletsReviewed').checked,false);
 }finally{w.close()}
});
test('guided navigation adapts to the page instead of resuming a stale production question',()=>{
 for(const [page,expected]of [['kitchen-flow.html?stage=locations','checking the saved outlets and kitchens'],['outlet-plan.html?stage=baseline','outlet expenses and mandatory staff'],['recipe-cost-editor.html','You are reviewing a recipe']]){
  const dom=new JSDOM('<div id="host"></div><div id="locationRows"></div><button id="addKitchen"></button><input type="checkbox" id="kitchenReviewed">',{runScripts:'outside-only',url:'https://bobs.test/'+page}),w=dom.window;
  try{w.sessionStorage.setItem('bobs-guide-conversation-v1:1',JSON.stringify({step:'equipment',history:[]}));w.eval(source('bobs-guide-bot.js'));
   const bot=w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{journey:true,snapshot:()=>({ctx:{outlet:'1',page:page.split('?')[0]},pageHelp:{title:'Outlet expenses and mandatory staff',instruction:'Review expenses and coverage.',next:'After this: menu quantities'}}),minimise(){},refresh(){}});
   assert.match(w.document.getElementById('host').textContent,new RegExp(expected));
   if(page.startsWith('kitchen-flow')){bot.update();assert.equal(w.document.querySelector('[data-guide-choice=outlet-kitchen-no]'),null);assert.equal(w.document.getElementById('kitchenReviewed').checked,false);}
  }finally{w.close()}
 }
});
test('companion follows the owner, displays real pending requirements, and never treats a draft as verified',async()=>{
 const dom=new JSDOM('<main><input id="quantity" value="540"></main>',{runScripts:'outside-only',url:'https://bobs.test/production-plan.html?outlet=1'}),w=dom.window;let writes=0;
 try{
 for(const p of ['shared_data.js','method2-core.js','bobs-cost-flow.js','idli-support-core.js','bobs-outlet-flow-core.js','bobs-salary-package-core.js','bobs-production-plan-core.js','bobs-capital-core.js','bobs-outlet-report.js','bobs-roadmap-core.js','bobs-kitchen-core.js','bobs-roadmap-outlet-flow.js'])w.eval(source(p));
 w.BOBS_CONFIG={DATA_VAULT_WEB_APP_URL:'https://fixture.invalid'};w.BOBS_VERIFIED={save(){writes++}};w.BOBS_RECIPE_KNOWLEDGE={};w.BOBS_OPERATIONAL_RECIPES={};w.BOBS_KITCHENS={isKitchen:()=>false};
 w.BOBS_DATA={jsonp:async p=>p.action==='outletList'?{ok:true,outlets:[{outletId:'1',outletName:'Trial',data:{shiftTimes:[{start:'06:00',end:'14:00'}]}}]}:{ok:true,found:false}};
 w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
 const button=w.document.getElementById('bobsCompanionToggle'),panel=w.document.getElementById('bobsCompanion');assert(!panel.hidden,'Planner guide opens on entry');await settle();assert.match(panel.textContent,/Next: Outlet count/);assert.match(panel.textContent,/Working capital/);assert.match(panel.textContent,/Ideal Price Builder/);
 assert.match(panel.textContent,/Loading your production plan/);
 const assets=[...panel.querySelectorAll('a')].find(a=>a.textContent==='Open Asset Master →');assert.equal(new URL(assets.href).searchParams.get('outlet'),'1');
 const quantity=w.document.getElementById('quantity');quantity.value='1200';quantity.dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(panel.textContent,/Unsaved changes/);assert.equal(quantity.value,'1200');assert.equal(writes,0);
 panel.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(panel.hidden);assert.equal(w.document.activeElement,button);
 }finally{w.close()}
});
test('asset capacity reference remains estimated, validates evidence, and price selection does not confirm a quotation',()=>{
 const dom=new JSDOM('<section><h3>Steamer</h3><input data-field="unitCost"><input type="checkbox" data-field="costConfirmed" checked></section>',{runScripts:'outside-only'}),w=dom.window;
 try{w.eval(source('bobs-equipment-references.js'));w.eval(source('bobs-asset-guidance.js'));const a={id:'machine1',name:'Idli steamer'},row=w.document.querySelector('section');let changes=0;w.BOBS_ASSET_GUIDANCE.render(row,a,()=>changes++);
 [...row.querySelectorAll('button')].find(b=>b.textContent.includes('120 Idlis')).click();w.BOBS_ASSET_GUIDANCE.read(row,a);assert.equal(a.capacityFacts.status,'estimate');assert.equal(a.capacityFacts.value,'120');assert.match(a.capacityNote,/Reference estimate/);
 [...row.querySelectorAll('button')].find(b=>b.textContent==='Use this price as an estimate').click();assert.equal(row.querySelector('[data-field="unitCost"]').value,'26000');assert.equal(row.querySelector('[data-field="costConfirmed"]').checked,false);assert.equal(a.priceReference.status,'estimate');assert.equal(changes,2);
 row.querySelector('[data-capacity-field="status"]').value='confirmed';row.querySelector('[data-capacity-field="evidence"]').value='';w.BOBS_ASSET_GUIDANCE.read(row,a);assert.throws(()=>w.BOBS_ASSET_GUIDANCE.validate(a),/confirming capacity/);
 }finally{w.close()}
});


test('a recipe child resumes with its own controls, without returning to production or confirming anything',()=>{
 const dom=new JSDOM('<div id="host"></div><section id="referenceSection"></section><button id="scale">Calculate</button><input type="checkbox" id="confirmed">',{runScripts:'outside-only',url:'https://bobs.test/recipe-cost-editor.html?outlet=1'}),w=dom.window;let clicks=0;
 try{w.sessionStorage.setItem('bobs-guide-conversation-v1:1',JSON.stringify({step:'recipes',history:[]}));w.document.getElementById('scale').onclick=()=>clicks++;w.eval(source('bobs-guide-bot.js'));
 w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{snapshot:()=>({ctx:{outlet:'1',page:'recipe-cost-editor.html'}}),minimise(){},refresh(){}});
 assert.match(w.document.getElementById('host').textContent,/You are reviewing a recipe/);w.document.querySelector('[data-guide-choice=page-scale]').click();assert.equal(w.document.activeElement.id,'scale');assert.equal(clicks,0);assert.equal(w.document.getElementById('confirmed').checked,false);
 }finally{w.close()}
});

test('verified kitchen handoff opens inline, explains actual options, and clears without a write or lost companion',async()=>{
 const dom=new JSDOM('<div id="nextAction"><div id="kitchenNextGuide"></div><input id="kitchenNext-equipment" type="radio" name="kitchenNextChoice"><input id="kitchenNext-baseline" type="radio" name="kitchenNextChoice"><button id="kitchenNextGo" disabled>Choose first</button></div>',{runScripts:'outside-only',url:'https://bobs.test/kitchen-flow.html?stage=locations&outlet=1'}),w=dom.window;let verified=false;
 try{
  w.BOBS_KITCHEN_GUIDE={snapshot:()=>({ready:true,verified,outlets:[]})};
  w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
  const next=w.document.getElementById('nextAction'),guide=w.document.getElementById('bobsCompanion'),first=w.document.getElementById('kitchenNext-equipment');
  next.dataset.guideRequested='true';w.dispatchEvent(new w.Event('bobs-kitchen-next-ready'));assert(guide.hidden,'Unverified state cannot announce success');
  verified=true;first.focus();w.dispatchEvent(new w.Event('bobs-kitchen-next-ready'));
  assert(!guide.hidden);assert.equal(guide.parentElement.id,'kitchenNextGuide');assert(guide.classList.contains('kitchen-next-inline'));
  assert.match(w.document.getElementById('bobsGuideDialogue').textContent,/saved and verified.*Optional now:.*Next required:/s);
  assert.equal(w.document.activeElement,first,'Opening guide must not steal choice focus');assert.equal(first.checked,false);assert(w.document.getElementById('kitchenNextGo').disabled);
  w.dispatchEvent(new w.Event('bobs-flow-saved'));await settle();assert.equal(w.document.activeElement,first);
  w.dispatchEvent(new w.Event('bobs-kitchen-next-cleared'));delete next.dataset.guideRequested;next.replaceChildren();verified=false;
  assert(guide.isConnected);assert(guide.hidden);assert(!guide.classList.contains('kitchen-next-inline'));assert.equal(w.document.querySelectorAll('#bobsCompanion').length,1);
 }finally{w.close();}
});
test('handoff requested before guide loads is retained, and zero kitchens offers required expenses only',async()=>{
 const dom=new JSDOM('<div id="nextAction" data-guide-requested="true"><div id="kitchenNextGuide"></div><input id="kitchenNext-baseline" type="radio" name="kitchenNextChoice"><button id="kitchenNextGo" disabled></button></div>',{runScripts:'outside-only',url:'https://bobs.test/kitchen-flow.html?stage=locations'}),w=dom.window;
 try{
  w.BOBS_KITCHEN_GUIDE={snapshot:()=>({ready:true,verified:true,outlets:[]})};
  w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
  const guide=w.document.getElementById('bobsCompanion');assert(!guide.hidden);assert.equal(guide.parentElement.id,'kitchenNextGuide');
  const text=w.document.getElementById('bobsGuideDialogue').textContent;assert.match(text,/Next required: review outlet expenses/);assert.doesNotMatch(text,/Optional now/);
  guide.querySelector('button').click();assert(guide.hidden);assert(!w.document.getElementById('bobsCompanionToggle').hidden);
  w.document.getElementById('bobsCompanionToggle').click();assert(!guide.hidden);assert.equal(guide.parentElement.id,'kitchenNextGuide');
 }finally{w.close();}
});

test('menu selection guide names the real save, mode and item-editor controls without changing a selection',async()=>{
 const dom=new JSDOM('<main><input type="checkbox" id="selectedItem" checked><button id="saveReturn">Save selection & return to Method 2</button></main>',{runScripts:'outside-only',url:'https://bobs.test/method2-select.html?outlet=1&cat=Breakfast+Catalogue&guide=continue'}),w=dom.window;let saves=0;
 try{
  w.document.getElementById('saveReturn').onclick=()=>saves++;
  w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
  const steps=[...w.document.querySelectorAll('#bobsGuideDialogue ol li')].map(el=>el.textContent);
  assert.equal(steps.length,4);assert.match(steps[1],/bottom.*Save selection & return to Method 2/);assert.match(steps[2],/Mode column/);assert.match(steps[3],/Edit item ↗/);
  assert.equal(w.document.getElementById('selectedItem').checked,true);assert.equal(saves,0);assert.doesNotMatch(w.document.getElementById('bobsGuideDialogue').textContent,/After this: Item quantities/);
 }finally{w.close();}
});

test('method-flow guide follows active workspace and item without restarting baseline or claiming completion',()=>{
 const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only',url:'https://bobs.test/outlet-method-flow.html?outlets=1,2,3'}),w=dom.window;let focus=0,minimise=0;
 let flow={outlet:'1',phase:'method2',baselineReady:true,workspace:{ready:true,item:{name:'Idli',mode:'production'},action:'Show Idli — Edit item ↗'}};
 try{
 w.BOBS_METHOD_FLOW_GUIDE={focus(){focus++}};w.eval(source('bobs-guide-bot.js'));
 const bot=w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{snapshot:()=>({ctx:{page:'outlet-method-flow.html',outlet:'1'},methodFlow:flow}),minimise(){minimise++},refresh(){}});
 const text=()=>w.document.getElementById('host').textContent;
 assert.match(text(),/Idli is selected.*Production.*Edit item/s);assert.doesNotMatch(text(),/Complete the saved outlet baseline|Shall we work through method selection/);
 w.document.querySelector('[data-guide-choice=method-flow-work]').click();assert.equal(focus,1);assert.equal(minimise,1);
 flow.workspace.item={name:'Vada',mode:'purchased'};flow.workspace.action='Show Vada — Edit item ↗';bot.update();assert.match(text(),/Vada is selected.*Purchase.*supplier/s);assert.doesNotMatch(text(),/Idli/);
 flow.workspace={ready:false,instruction:'GOOGLE READ FAILED — Reload Google records',action:'Show Reload Google records'};bot.update();assert.match(text(),/GOOGLE READ FAILED/);assert.doesNotMatch(text(),/Vada is selected/);
 flow.workspace={ready:true,items:[],instruction:'Choose categories & items',action:'Choose categories & items'};bot.update();assert.match(text(),/Choose categories & items/);
 flow.phase='method1';bot.update();assert.match(text(),/Continue Method 1/);assert.doesNotMatch(text(),/Idli|Choose categories/);
 flow.phase='other';bot.update();assert.match(text(),/Method review saved/);
 flow.phase='choice';flow.baselineReady=false;flow.baselineMessage='Review outlet expenses for 2';bot.update();assert.match(text(),/Review outlet expenses for 2/);assert.doesNotMatch(text(),/prerequisites are verified/);
 assert.equal(focus,1,'Guide updates never activate navigation or item controls');
 }finally{w.close()}
});

test('item guide follows capacity, saved next requirement, verified recipe return and explicit save step',async()=>{
 const dom=new JSDOM('<div id="host"></div><h1 id="title">Idli</h1><main><p id="status">Loaded from Google</p><button id="retryGoogle" hidden>Retry</button><form id="editor"><fieldset id="controls"><select id="mode"><option value="production">Production</option><option value="purchased">Purchase</option></select><section id="productionEntry"><a href="production-plan.html">Start / review production capacity, quantity and time →</a></section><div id="idliLabourCost" data-guide-state="ready" data-production-ready="false"><p id="fullCostStatus">Pending capacity</p><button id="refreshFullCost">Refresh</button></div><div id="guideStep2" aria-current="false"></div><div id="guideStep3" aria-current="false"></div><a id="continueItemDetails" href="#supplyHeading">Continue to item quantities</a><div id="guideCostLink"><a href="purchase-cost-editor.html">Review Idli purchase costs ↗</a></div><button id="save">SAVE THIS ITEM</button></fieldset></form></main>',{runScripts:'outside-only',url:'https://bobs.test/method2-item.html?outlet=1'}),w=dom.window;let clicks=0,events=0;
 try{
 w.HTMLElement.prototype.scrollIntoView=function(){};w.document.querySelectorAll('a,button').forEach(x=>x.onclick=e=>{e.preventDefault();clicks++});w.addEventListener('bobs-guide-context',()=>events++);
 w.eval(source('bobs-item-guide.js'));w.eval(source('bobs-guide-bot.js'));
 const bot=w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{snapshot:()=>({ctx:{page:'method2-item.html',outlet:'1'},itemHelp:w.BOBS_ITEM_GUIDE.snapshot()}),minimise(){},refresh(){}});
 let state=w.BOBS_ITEM_GUIDE.snapshot();assert.match(state.title,/Idli.*production capacity/);
 const direct=w.document.querySelector('[data-guide-choice=item-open-production]');assert.equal(direct.tagName,'A');assert.match(direct.textContent,/Open Idli production planner/);assert.equal(new URL(direct.href).pathname,'/production-plan.html');assert.equal(new URL(direct.href).searchParams.get('guide'),'continue');assert.equal(direct.target,'_blank');assert.equal(clicks,0);
 const full=w.document.getElementById('idliLabourCost');
 full.dataset.productionReady='true';full.innerHTML='<p class="flow-current"><a href="outlet-plan.html?stage=workforce">Next: review combined menu workforce and riders →</a></p>';await settle();bot.update();
 assert.match(w.document.getElementById('host').textContent,/review combined menu workforce/);assert.doesNotMatch(w.document.getElementById('host').textContent,/first, review production capacity/);w.BOBS_ITEM_GUIDE.focus();assert.equal(w.document.activeElement,full.querySelector('a'));
 full.dataset.guideState='error';full.innerHTML='<p id="fullCostStatus">Read failed</p><button id="refreshFullCost">Refresh verified cost records</button>';state=w.BOBS_ITEM_GUIDE.snapshot();assert.match(state.title,/could not be checked/);assert.equal(state.selector,'#refreshFullCost');
 w.document.getElementById('guideStep2').setAttribute('aria-current','step');state=w.BOBS_ITEM_GUIDE.snapshot();assert.match(state.title,/actual quantities/);
 w.document.getElementById('guideStep3').setAttribute('aria-current','step');state=w.BOBS_ITEM_GUIDE.snapshot();assert.equal(state.selector,'#save');assert.equal(clicks,0);
 w.document.getElementById('guideStep2').setAttribute('aria-current','false');w.document.getElementById('guideStep3').setAttribute('aria-current','false');w.document.getElementById('productionEntry').hidden=true;w.document.getElementById('mode').value='purchased';assert.match(w.BOBS_ITEM_GUIDE.snapshot().title,/supplier quantity/);
 w.document.getElementById('controls').disabled=true;w.document.getElementById('retryGoogle').hidden=false;assert.equal(w.BOBS_ITEM_GUIDE.snapshot().selector,'#retryGoogle');await settle();assert(events>1);
 }finally{w.close()}
});

test('production bot follows current step and never confirms reviews or saves on its own',()=>{
 const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only',url:'https://bobs.test/production-plan.html?outlet=1'}),w=dom.window;let calls=[],p={ready:true,itemKey:'Breakfast::0',name:'Idli',recipes:[],journey:{stage:'quantity'}};
 try{w.BOBS_PRODUCTION_GUIDE={snapshot:()=>p,continueQuantity(){calls.push('quantity');},continueDelivery(){calls.push('delivery')},calculate(){calls.push('calculate')},save(){calls.push('save')},retryStep(){calls.push('retry')},focus(){},focusProcess(){}};
 w.eval(source('bobs-guide-bot.js'));const bot=w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{snapshot:()=>({ctx:{page:'production-plan.html',outlet:'1'}}),minimise(){},work(){},refresh(){}});
 const text=()=>w.document.getElementById('host').textContent;
 assert.match(text(),/how much, and ready by when/);assert.deepEqual(calls,[]);
 for(const [stage,match]of [['recipes',/Each recipe has been reviewed/],['equipment',/usable capacity/],['timing',/Review timing/],['assessment',/check whether production fits/],['delivery',/review delivery/],['save',/ready to save/],['saving',/Saving and verifying/],['error',/not fully saved/]]){p.journey={stage,process:'Idli',message:'fixture status'};bot.update();assert.match(text(),match);}
 assert.deepEqual(calls,[]);p.journey={stage:'save'};bot.update();w.document.querySelector('[data-guide-choice=plan-save]').click();assert.deepEqual(calls,['save']);
 }finally{w.close()}
});

test('saved-progress bot explains its purpose, explicitly checks, preserves drafts and exposes truthful retry',()=>{
 const dom=new JSDOM('<input id="draft" value="unsaved"><div id="host"></div>',{runScripts:'outside-only',url:'https://bobs.test/outlet-plan.html?outlet=1&stage=baseline'}),w=dom.window;let checks=0,closed=0;
 let snapshot={ctx:{outlet:'1',page:'outlet-plan.html'},dirty:true,progress:{status:'idle'}};
 try{w.eval(source('bobs-guide-bot.js'));const host=w.document.getElementById('host'),ui=w.BOBS_GUIDE_BOT.mount(host,{journey:true,snapshot:()=>snapshot,minimise(){closed++},refresh(){checks++}});
 const choose=host.querySelector('[data-guide-choice=page-progress]');assert.equal(choose.textContent,'Check saved progress & show what’s incomplete');assert.match(host.textContent,/does not save your current entries/);choose.click();assert.equal(checks,1);assert.match(host.textContent,/You have unsaved changes/);assert.equal(w.document.getElementById('draft').value,'unsaved');
 snapshot={...snapshot,loading:true,progress:{status:'loading',message:'Reading saved Google records.'}};ui.update();assert(host.querySelector('[data-guide-choice=refresh]').disabled);assert.equal(host.querySelector('a'),null);
 snapshot={...snapshot,loading:false,readError:true,next:{title:'STALE',href:'outlets.html'},progress:{status:'error',message:'The check did not finish within 45 seconds.'}};ui.update();assert.match(host.textContent,/45 seconds/);assert.equal(host.querySelector('a'),null,'Failed check must not offer a stale recommendation');assert.equal(host.querySelector('[data-guide-choice=refresh]').textContent,'Retry saved-progress check');host.querySelector('[data-guide-choice=refresh]').click();assert.equal(checks,2);
 snapshot={...snapshot,readError:false,progress:{status:'ready'},next:{title:'Outlet expenses',reason:'Review saved coverage.',href:'outlet-plan.html?outlet=1&stage=baseline'}};ui.update();assert.match(host.textContent,/Next incomplete step: Outlet expenses/);assert.equal(new URL(host.querySelector('a').href).searchParams.get('outlet'),'1');host.querySelector('[data-guide-choice=resume-edit]').click();assert.equal(closed,1);assert.equal(w.document.getElementById('draft').value,'unsaved');assert.equal(w.location.pathname,'/outlet-plan.html');
 }finally{w.close()}
});

test('saved-progress scan times out, retries, rejects late results and preserves unsaved input without writes',async()=>{
 const dom=new JSDOM('<main><input id="draft" value="15000"></main>',{runScripts:'outside-only',url:'https://bobs.test/outlet-plan.html?outlet=1&stage=baseline&guide=continue'}),w=dom.window;
 const timers=new Map(),realSet=w.setTimeout.bind(w),realClear=w.clearTimeout.bind(w);let timerId=100000;w.setTimeout=(fn,ms,...args)=>{if(ms===45000||ms===12000){const id=++timerId;timers.set(id,{fn,ms});return id}return realSet(fn,ms,...args)};w.clearTimeout=id=>{timers.delete(id);realClear(id)};
 let release,mode='hang',writes=0;const blocked=new Promise(resolve=>release=resolve);
 try{
 for(const p of ['shared_data.js','method2-core.js','bobs-cost-flow.js','idli-support-core.js','bobs-outlet-flow-core.js','bobs-salary-package-core.js','bobs-production-plan-core.js','bobs-capital-core.js','bobs-outlet-report.js','bobs-roadmap-core.js','bobs-kitchen-core.js','bobs-roadmap-outlet-flow.js'])w.eval(source(p));
 w.BOBS_CONFIG={DATA_VAULT_WEB_APP_URL:'https://fixture.invalid'};w.BOBS_VERIFIED={save(){writes++}};w.BOBS_RECIPE_KNOWLEDGE={};w.BOBS_OPERATIONAL_RECIPES={};w.BOBS_KITCHENS={isKitchen:()=>false};
 w.BOBS_DATA={saveModule(){writes++},jsonp:async p=>{if(p.action==='outletList'){if(mode==='hang')return blocked;if(mode==='fail')throw Error('fixture read failure');return {ok:true,outlets:[{outletId:'1',outletName:'Current saved outlet',data:{shiftTimes:[{start:'04:30',end:'13:30'}]}}]}}return {ok:true,found:false}}};
 w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
 const draft=w.document.getElementById('draft');draft.value='17000';draft.dispatchEvent(new w.Event('input',{bubbles:true}));const progressButton=w.document.querySelector('[data-guide-choice=page-progress]');draft.dispatchEvent(new w.Event('change',{bubbles:true}));assert(progressButton.isConnected,'Blur must not replace the guide button before click');progressButton.click();await settle();
 assert(w.BOBS_ROADMAP.getState().busy);const slow=[...timers.values()].filter(t=>t.ms===12000).at(-1);slow.fn();assert.match(w.document.getElementById('bobsGuideDialogue').textContent,/taking longer/);
 const timeout=[...timers.values()].filter(t=>t.ms===45000).at(-1);timeout.fn();await settle();assert.equal(w.BOBS_ROADMAP.getState().busy,false);assert.equal(w.BOBS_ROADMAP.getState().progress.status,'error');assert.match(w.document.getElementById('bobsGuideDialogue').textContent,/Retry saved-progress/);
 mode='fail';w.document.querySelector('[data-guide-choice=refresh]').click();await settle();assert.equal(w.BOBS_ROADMAP.getState().progress.status,'error');assert.equal(w.document.querySelector('#bobsGuideDialogue a'),null);
 mode='ok';w.document.querySelector('[data-guide-choice=refresh]').click();await settle();assert.equal(w.BOBS_ROADMAP.getState().progress.status,'ready');assert.match(w.document.getElementById('bobsGuideDialogue').textContent,/Next incomplete step/);
 release({ok:true,outlets:[{outletId:'9',outletName:'OLD OUTLET'}]});await settle();assert.equal(w.BOBS_ROADMAP.getState().progress.status,'ready');assert.doesNotMatch(w.document.getElementById('bobsCompanion').textContent,/OLD OUTLET/);assert.equal(draft.value,'17000');assert.equal(writes,0);
 w.document.querySelector('[data-guide-choice=resume-edit]').click();assert(w.document.getElementById('bobsCompanion').hidden);assert.equal(draft.value,'17000');
 }finally{w.close()}
});

test('guide checklist never promotes visits, stale reads or unknown status to green completion',()=>{
 const dom=new JSDOM('<div id="guide"></div>',{runScripts:'outside-only',url:'https://bobs.test/method2.html?outlet=1'}),w=dom.window;
 try{w.eval(source('bobs-guide-bot.js'));const model=w.BOBS_GUIDE_BOT.checklistModel;
 const s={ctx:{page:'method2.html',outlet:'1'},progress:{status:'ready'},savedChecklist:{owner:'1',name:'Rasipuram',stages:[{title:'Outlet setup',status:'done'},{title:'Menu review',status:'review'},{title:'Method 1',status:'na'}]}};
 assert.equal(model(s).done,1);assert.equal(model({...s,dirty:true}).dirty,true);
 for(const overrides of [{loading:true},{readError:true},{progress:{status:'idle'}}]){const x=model({...s,...overrides});assert.equal(x.done,0);assert(x.rows.every(r=>r.status==='unknown'));}
 assert.equal(model({...s,savedChecklist:{owner:'2',name:'Elimedu',stages:[]}}).done,0);
 }finally{w.close()}
});
test('shared checklist keeps saved ticks separate from draft and leaves action buttons attached',async()=>{
 const dom=new JSDOM('<input id="amount"><div id="guide"></div>',{runScripts:'outside-only',url:'https://bobs.test/outlet-plan.html?outlet=1'}),w=dom.window;
 try{w.HTMLElement.prototype.scrollIntoView=function(){};w.eval(source('bobs-guide-bot.js'));
 const state={ctx:{page:'outlet-plan.html',outlet:'1'},progress:{status:'ready'},pageHelp:{title:'Review expenses',instruction:'Review then save.'},savedChecklist:{owner:'1',name:'Rasipuram',stages:[{title:'Outlet setup',status:'done',children:[{title:'Kitchen registration',status:'done'}]},{title:'Expenses',status:'review',reason:'Review expenses.'}]}};
 const host=w.document.getElementById('guide');const bot=w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>state,minimise(){},refresh(){},journey:true});
 assert.match(host.textContent,/✓ Saved and verified: Outlet setup/);
 assert.match(host.textContent,/Next incomplete saved stage: Expenses/);
 assert.equal(host.querySelectorAll('.guide-checklist').length,1);
 const action=host.querySelector('button');state.dirty=true;
 w.document.getElementById('amount').dispatchEvent(new w.Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,10));
 assert.equal(host.querySelector('button'),action);assert(action.isConnected);assert.match(host.textContent,/Save pending: your current changes/);
 state.readError=true;bot.update();assert.equal(host.querySelectorAll('.guide-checklist-done').length,0);assert.match(host.textContent,/could not be verified/);
 }finally{w.close()}
});
test('recipe review ticks are draft checkpoints and update without claiming a saved recipe',async()=>{
 const dom=new JSDOM('<section id="productionEditor"><input id="referenceWeightReviewed" type="checkbox"><input id="intendedWeightReviewed" type="checkbox"><input id="confirmed" type="checkbox" aria-disabled="true"></section><div id="guide"></div>',{runScripts:'outside-only',url:'https://bobs.test/recipe-cost-editor.html?outlet=1&item=Idli'}),w=dom.window;
 try{w.HTMLElement.prototype.scrollIntoView=function(){};w.eval(source('bobs-guide-bot.js'));
 const host=w.document.getElementById('guide');w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>({ctx:{page:'recipe-cost-editor.html',outlet:'1'},progress:{status:'idle'},pageHelp:{}}),minimise(){},refresh(){},journey:true});
 assert.match(host.textContent,/Next: Review reference portion weight/);
 w.document.getElementById('referenceWeightReviewed').checked=true;
 w.document.getElementById('referenceWeightReviewed').dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,10));
 assert.match(host.textContent,/Reviewed — save pending: Review reference portion weight/);assert.match(host.textContent,/Next: Review intended portion weight/);
 assert.equal(host.querySelectorAll('.guide-checklist-done').length,0);
 }finally{w.close()}
});

test('recipe guide presents one current action and advances from actual adapter state',()=>{
 const dom=new JSDOM('<div id="guide"></div>',{runScripts:'outside-only',url:'https://bobs.test/recipe-cost-editor.html?outlet=1&item=Idli'}),w=dom.window;
 try{w.eval(source('bobs-guide-bot.js'));let stage='reference',calculated=0,saves=0;w.BOBS_RECIPE_GUIDE={snapshot:()=>({stage,name:'Idli',referenceYield:120,target:360,unit:'piece'}),focus(){},calculate(){calculated++;stage='review';},save(){saves++;stage='saving';}};
 const host=w.document.getElementById('guide'),bot=w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>({ctx:{page:'recipe-cost-editor.html',outlet:'1'},progress:{status:'idle'}}),minimise(){},refresh(){},journey:true});
 assert(host.querySelector('[data-guide-choice=recipe-step-referenceWeightReviewed]'));assert(!host.querySelector('[data-guide-choice=recipe-step-save]'));
 stage='intended';bot.update();assert(host.querySelector('[data-guide-choice=recipe-step-intendedWeightReviewed]'));
 stage='calculate';bot.update();host.querySelector('[data-guide-choice=recipe-step-calculate]').click();assert.equal(calculated,1);bot.update();assert(host.querySelector('[data-guide-choice=recipe-step-confirmed]'));
 stage='save';bot.update();host.querySelector('[data-guide-choice=recipe-step-save]').click();assert.equal(saves,1);bot.update();assert.match(host.textContent,/Saving and verifying/);
 stage='saved';bot.update();assert.match(host.textContent,/Recipe saved and verified/);
 }finally{w.close()}
});
