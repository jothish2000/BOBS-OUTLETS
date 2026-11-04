const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=p=>fs.readFileSync(p,'utf8');
test('only the bot presents current Idli delivery review; legacy first/step-one blocks remain hidden',()=>{
 const html=source('method2-item.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://bobs.test/method2-item.html?outlet=1&mode=production'}),w=dom.window;
 try{
 const d=w.document,style=d.createElement('style');style.textContent=source('bobs-roadmap.css');d.head.append(style);
 d.getElementById('title').textContent='Idli';d.getElementById('controls').disabled=false;d.getElementById('editor').hidden=false;d.getElementById('itemGuide').hidden=false;d.getElementById('mode').value='production';
 const production=d.createElement('section');production.id='productionEntry';production.dataset.bobsPageGuide='';production.innerHTML='<h2>First: plan quantity, recipes, equipment and time</h2><a href="production-plan.html?outlet=1">Open Idli production plan →</a>';d.getElementById('itemGuide').before(production);
 const full=d.createElement('section');full.id='idliLabourCost';d.getElementById('editor').append(full);full.dataset.guideState='ready';full.dataset.productionReady='true';full.innerHTML='<p class="flow-current" data-bobs-page-guide>Next: save this item’s delivery / no-delivery choice below.</p><label><input id="itemDelivery" type="checkbox">Delivery needed</label><button id="saveItemDelivery">Save item delivery choice to Google</button>';
 const guide=d.createElement('aside');guide.id='bobsCompanion';const host=d.createElement('div');guide.append(host);d.body.append(guide);let saves=0;d.getElementById('saveItemDelivery').onclick=()=>saves++;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.eval(source('bobs-item-guide.js'));w.eval(source('bobs-guide-bot.js'));
 const bot=w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>({ctx:{page:'method2-item.html',outlet:'1'},itemHelp:w.BOBS_ITEM_GUIDE.snapshot()}),minimise(){},work(){}});
 assert.equal(w.getComputedStyle(production).display,'none');assert.equal(w.getComputedStyle(d.getElementById('itemGuide')).display,'none');
 assert.match(host.textContent,/delivery \/ no-delivery|delivery \/ no-delivery|delivery.*choice/);
 assert.doesNotMatch(host.textContent,/Step 1 of 3|First: plan quantity/);
 host.querySelector('[data-guide-choice=item-next-control]').click();assert.equal(d.activeElement.id,'itemDelivery');assert.equal(saves,0);
 full.dataset.deliverySaved='true';full.querySelector('.flow-current').textContent='Next: review and save item allocations below, then confirm selling price and save this item.';bot.update();
 assert.match(host.textContent,/review and save item allocations/);assert.equal(saves,0);
 }finally{w.close()}
});
test('identified page-only guides are hidden without hiding operational controls',()=>{
 const cases=[['method2.html','pageGuide'],['method2-item.html','itemGuide'],['production-plan.html','recipeReviewGuide'],['kitchen-flow.html','kitchenNextPreview']];
 for(const [file,id]of cases){
  const dom=new JSDOM(source(file).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')),w=dom.window;try{const style=w.document.createElement('style');style.textContent=source('bobs-roadmap.css');w.document.head.append(style);const n=w.document.getElementById(id);assert(n.hasAttribute('data-bobs-page-guide'),file);n.hidden=false;assert.equal(w.getComputedStyle(n).display,'none',file);}finally{w.close()}
 }
 for(const f of ['equipment-planner.html','idli-staffing.html','workload-planner.html'])assert.match(source(f),/data-bobs-page-guide/);
});
test('standalone Method2 guide uses the same current item state as the embedded workflow',()=>{
 const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only',url:'https://bobs.test/method2.html?outlet=1'}),w=dom.window;try{
 let focus=0;w.BOBS_METHOD2_GUIDE={focus(){focus++}};w.eval(source('bobs-guide-bot.js'));const host=w.document.getElementById('host');
 w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>({ctx:{page:'method2.html'},method2:{ready:true,item:{name:'Idli',mode:'production'},action:'Go to Idli — Edit item ↗'}}),minimise(){}});
 assert.match(host.textContent,/Idli is selected/);assert.match(host.textContent,/supplying kitchen/);host.querySelector('[data-guide-choice=method-flow-work]').click();assert.equal(focus,1);
 }finally{w.close()}
});

test('an active field review takes priority over an earlier saved kitchen handoff',()=>{
 const dom=new JSDOM('<div id="host"></div><button id="kitchenNextGo"></button>',{runScripts:'outside-only',url:'https://bobs.test/kitchen-flow.html?stage=locations&outlet=1'}),w=dom.window;try{
 let active=null,confirmed=0;w.BOBS_KITCHEN_GUIDE={snapshot:()=>({verified:true})};w.BOBS_REVIEW={snapshot:()=>({rows:[],active}),confirmField(){confirmed++},returnToChoices(){}};
 w.eval(source('bobs-guide-bot.js'));const host=w.document.getElementById('host'),bot=w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>({ctx:{outlet:'1',page:'kitchen-flow.html'}}),minimise(){}});
 bot.kitchenNext();active={currentTitle:'Reviewing field 2 of 3: Shift end',individual:true,method:'guided'};bot.update();
 assert.equal(host.querySelectorAll('[data-guide-choice=review-next]').length,1);assert.match(host.textContent,/field 2 of 3: Shift end/);assert.doesNotMatch(host.textContent,/Choose your next step/);
 host.querySelector('[data-guide-choice=review-next]').click();assert.equal(confirmed,1);
 }finally{w.close()}
});
