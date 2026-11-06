const review=require('./review-test-helper.cjs');
/* Isolated Google fixture: exercise real scripts, protected writes and reload without live data changes. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),K=require('../recipe-market-google-store.js'),root=path.resolve(__dirname,'..');
const timing={role:'Cook',equipment:'Steamer',setupMin:0,activeMinPerCycle:1,machineMinPerCycle:10,finishMinPerCycle:1,cleanupMin:1};
const recipes=[{name:'Idli',yieldQty:60,yieldUnit:'piece',ingredients:[['Rice',1,'kg',60],['Urad dal',0.25,'kg',100]],productionTiming:timing},{name:'Idli Sambar',yieldQty:9,yieldUnit:'L',ingredients:[['Toor dal',1,'kg',100]],productionTiming:{...timing,equipment:'Stock pot and stove'}},{name:'Coconut Chutney',yieldQty:1,yieldUnit:'kg',ingredients:[['Coconut',500,'g',20]],productionTiming:{...timing,equipment:'Mixer'}}];
const key='Breakfast Catalogue::0',db={'1/METHOD2/default':{itemEditors:{[key]:{mode:'production',unit:'piece',batchSize:120,batches:1,sold:80,soldConfirmed:true,price:10,sideExtraFivePercent:false,condiments:[{recipeName:'Idli Sambar',source:'production',portion:50,portionUnit:'ml'},{recipeName:'Coconut Chutney',source:'production',portion:20,portionUnit:'g'}]}}},'1/ASSET_MASTER/default':{assets:[{id:'G',name:'Existing grinder',quantity:1,ownedQty:1}]},'COMPANY/BOBS_STANDARD_RECIPE/ACTIVE_V1':K.manifest('standard',['test-chunk'],'guidance',3),'COMPANY/BOBS_STANDARD_RECIPE/test-chunk':K.chunkData('standard',recipes,'guidance',0,1)};
db['COMPANY/KITCHEN_MASTER/default']={reviewed:true,kitchens:[{id:'Kitchen-Elimedu',name:'Elimedu Production Kitchen',status:'operating',outletId:'',shiftTimes:[{start:'04:30',end:'13:30'}]}],outletDecisions:{'1':{hasKitchen:false}}};
db['COMPANY/KITCHEN_MASTER/default'].kitchens.push({id:'Kitchen-Second',name:'Second Kitchen',status:'operating',shiftTimes:[{start:'04:30',end:'13:30'}]},{id:'Kitchen-Future',name:'Future Kitchen',status:'proposed',shiftTimes:[]});
(async()=>{const browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true});try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900}}),errors=[],writes=[];let failPlanSave=false;ctx.setDefaultTimeout(60000);
 await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='bobs.test'){const f=path.join(root,decodeURIComponent(u.pathname.slice(1)));return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404,body:'missing'});}
  if(u.hostname!=='script.google.com')return route.abort();
  if(req.method()==='POST'){const b=JSON.parse(req.postData());writes.push(b.module);if(b.module==='OUTLET_PRODUCTION_PLAN'){await new Promise(r=>setTimeout(r,500));if(failPlanSave)return route.abort();}db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return route.fulfill({body:'ok'});}
  const data=u.searchParams.get('action')==='outletList'?{ok:true,outlets:[{outletId:'1',outletName:'Rasipuram',data:{shiftTimes:[{start:'04:30',end:'13:30'}]}}]}:{ok:true,found:!!db[u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey')],data:db[u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey')]??null};
  return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify(data)+')'});
 });

 const owner=await ctx.newPage();owner.on('pageerror',e=>errors.push(e.message));owner.on('dialog',d=>d.accept());
 await owner.goto('https://bobs.test/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production');
 await owner.waitForFunction(()=>document.getElementById('controls')?.disabled===false);
 await owner.locator('[data-guide-choice=item-open-production]').waitFor();
 const parentURL=owner.url(),opening=owner.waitForEvent('popup');await owner.locator('[data-guide-choice=item-open-production]').click();
 const p=await opening;p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
 await p.waitForURL(u=>u.pathname.endsWith('/production-plan.html'),{waitUntil:'domcontentloaded'});const url=p.url();assert.equal(new URL(url).searchParams.get('returnTo'),parentURL);assert.equal(new URL(url).searchParams.get('cat'),'Breakfast Catalogue');assert.equal(new URL(url).searchParams.get('i'),'0');
 await p.waitForFunction(()=>document.getElementById('plannerFields')?.disabled===false);
 await p.locator('[data-guide-choice=plan-quantity-next]').waitFor();
 assert(await p.locator('#bobsCompanion').isVisible());assert.match(await p.locator('#bobsGuideDialogue').innerText(),/how much, and ready by when/);
 await p.locator('[data-guide-choice=plan-quantity-next]').click();assert.match(await p.locator('.guide-error').innerText(),/ready-by time/);
 await p.selectOption('#readyDay','1');await p.click('#chooseProductionSource');
 await p.waitForFunction(()=>BOBS_PRODUCTION_GUIDE.snapshot().journey.stage==='deadline');
 assert.match(await p.locator('#bobsGuideDialogue').innerText(),/Choose Today in Deadline day/);
 const deadlineLink=p.getByRole('button',{name:'Go to Deadline day — choose Today',exact:true});await deadlineLink.click();
 assert.equal(await p.evaluate(()=>document.activeElement.id),'readyDay');assert.equal(writes.length,0);
 await p.selectOption('#readyDay','0');
 await p.fill('#intendedQuantity','360');await p.fill('#readyBy','06:24');await p.setViewportSize({width:1071,height:580});

 // The production review uses one guide frame; all three controls stay in place.
 await p.waitForFunction(()=>!!window.BOBS_REVIEW);
 await p.evaluate(()=>{window.reviewNodes=['intendedQuantity','readyBy','readyDay'].map(id=>{const n=document.getElementById(id),box=document.getElementById('quantitySection').getBoundingClientRect(),r=n.getBoundingClientRect();return {n,parent:n.parentNode,x:r.left-box.left,y:r.top-box.top};});BOBS_REVIEW.request('#quantityReviewed');});
 assert(await p.locator('main [data-review-ui=choices]').isVisible());assert.equal(await p.locator('#bobsCompanion [data-review-ui],#bobsCompanion [data-review-shortcut]').count(),0);
 await p.getByRole('button',{name:'Review each field individually →',exact:true}).click();
 for(const id of ['intendedQuantity','readyBy','readyDay']){
  await p.waitForFunction(id=>document.activeElement.id===id,id);
  assert.match(await p.locator('.guide-current-review strong').innerText(),new RegExp(id==='intendedQuantity'?'field 1 of 3':id==='readyBy'?'field 2 of 3':'field 3 of 3'));
  assert(await p.locator('#bobsCompanion').isVisible());
  assert(await p.locator('#bobsCompanion [data-guide-choice=review-next]').isVisible());
  assert.equal(await p.locator('#bobsNextActionBar').count(),0);
  assert.equal(await p.locator('[data-review-ui=field]').count(),0);
  assert(await p.evaluate(()=>{const b=document.getElementById('quantitySection').getBoundingClientRect();return reviewNodes.every(({n,parent,x,y})=>n.parentNode===parent&&Math.abs(n.getBoundingClientRect().left-b.left-x)<1&&Math.abs(n.getBoundingClientRect().top-b.top-y)<1);}));
  if(id==='readyBy')console.log('SINGLE_GUIDE_PRODUCTION_PNG '+(await p.screenshot()).toString('base64'));
  await p.locator('[data-guide-choice=review-next]').click();
  assert.equal(await p.evaluate(()=>document.activeElement.id),'bobsReviewConfirmField');assert(await p.locator('#'+id).evaluate(n=>n.classList.contains('bobs-review-field-highlight')));
  await p.locator('main #bobsReviewConfirmField').click();
 }
 assert.equal(await p.locator('#quantityReviewed').isChecked(),false);
 await p.getByRole('button',{name:'Confirm this review and continue',exact:true}).click();
 assert(await p.locator('#quantityReviewed').isChecked());
 const current=p.locator('.guide-checklist-local [aria-current="step"]');
 await p.waitForFunction(()=>document.querySelector('.guide-checklist-local [aria-current="step"]')?.dataset.plannerStep==='side-servings');
 assert.equal(await p.locator('.guide-checklist-local .guide-checklist-next').count(),1);
 const previous=p.locator('[data-planner-step=extra-sides]');assert.match(await previous.innerText(),/Previously saved: No/);assert(!await previous.evaluate(n=>n.classList.contains('guide-checklist-done')));
 await p.waitForFunction(()=>{const row=document.querySelector('[data-planner-next]'),pane=document.querySelector('#bobsCompanion');if(!row||!pane)return false;const rr=row.getBoundingClientRect(),pr=pane.getBoundingClientRect(),top=pane.querySelector('.companion-head')?.getBoundingClientRect().bottom||pr.top;return rr.top>=top-1&&rr.bottom<=pr.bottom+1;});
 assert.equal(await current.locator('button').innerText(),'Review sides and serving quantities');assert.equal(writes.length,0);
 console.log('PASS confirmed 360 / 06:24: only sides is current and visible; previously saved No is not ticked.');
 assert(await owner.locator('#productionEntry a').isVisible());assert.equal(await owner.locator('#productionEntry h2,#productionEntry p').count(),0);assert(await owner.locator('#itemGuide').isHidden());

 // Existing item window is reused without reload or draft loss.
 await owner.fill('#batchSize','121');
 const count=ctx.pages().length;await owner.locator('[data-guide-choice=item-open-production]').click();await owner.waitForTimeout(150);
 assert.equal(ctx.pages().length,count);assert.equal(await p.inputValue('#intendedQuantity'),'360');assert.equal(await owner.inputValue('#batchSize'),'121');
 assert.equal(await p.locator('[data-serving-row]').count(),2);
 await p.locator('#servingAmount-0').fill('20');await p.locator('#servingAmount-1').fill('8');
 assert.equal(await p.locator('#servingAmount-1').inputValue(),'8');
 // Reference assessment is one popup at a time; external source visits are optional.
 await p.evaluate(()=>BOBS_REVIEW.request('#sideServingReviewed'));
 for(let i=0;i<2;i++){await p.locator('#bobsReferenceDialog[open]').waitFor();await p.check('#bobsReferenceAcknowledged');await p.click('#bobsReferenceContinue');}
 assert.equal(await p.evaluate(()=>BOBS_REFERENCE.reviewed('serving:0')&&BOBS_REFERENCE.reviewed('serving:1')),true,'reviewed references must remain confirmed after popup closes');
 await review(p.locator('#sideServingReviewed'));
 assert.equal(await p.locator('#sideExtraYes').isChecked(),false);assert.equal(await p.locator('#sideExtraNo').isChecked(),false);
 await p.waitForFunction(()=>BOBS_PRODUCTION_GUIDE.snapshot().journey.stage==='source');
 assert.equal(await p.locator('[data-source-key]').count(),3);assert.equal(await p.locator('[data-source-key]').first().inputValue(),'');assert(await p.locator('#useSameKitchen').isDisabled());assert.equal(await p.locator('[data-source-key]').first().locator('option').count(),4);assert.equal(await p.locator('[data-source-key]').first().locator('option[value="Kitchen-Future"]').evaluate(n=>n.disabled),true);
 assert.match(await p.locator('#bobsGuideDialogue').innerText(),/supplying kitchen/);assert(await p.locator('#capacitySection').isHidden());assert.equal(writes.length,0);
 await p.click('#chooseProductionSource');assert.match(await p.locator('#sourceSaveStatus').innerText(),/Select an operating/);assert.equal(writes.length,0);
 await p.locator('[data-source-key]').first().selectOption('Kitchen-Elimedu');await p.locator('[data-source-key]').nth(1).selectOption('Kitchen-Second');assert.equal(await p.locator('[data-source-key]').nth(1).inputValue(),'Kitchen-Second');await p.click('#useSameKitchen');
 assert.deepEqual(await p.locator('[data-source-key]').evaluateAll(xs=>xs.map(x=>x.value)),['Kitchen-Elimedu','Kitchen-Elimedu','Kitchen-Elimedu']);
 await review(p.locator('#productionSourceReviewed'));await p.waitForFunction(()=>document.querySelector('[data-planner-next]')?.dataset.plannerStep==='extra-sides');assert(await p.locator('#keepSideExtra').isEnabled());assert.equal(await p.locator('#sideExtraNo').isChecked(),false);await p.click('#keepSideExtra');assert.equal(await p.locator('#sideExtraNo').isChecked(),true);
 await p.waitForFunction(()=>BOBS_PRODUCTION_GUIDE.snapshot().journey.stage==='source-save');
 await p.click('#chooseProductionSource');await p.waitForFunction(()=>document.getElementById('sourceSaveStatus').textContent.includes('saved and verified'));
 assert.equal(p.url(),url);assert.equal(db['1/METHOD2/default'].itemEditors[key].batchSize,360);assert.equal(db['1/METHOD2/default'].itemEditors[key].sold,80);assert.equal(db['1/OUTLET_PRODUCTION_PLAN/default'],undefined);
 await p.waitForSelector('#sourceNextActions a');assert.match(await p.locator('#sourceNextActions').innerText(),/Elimedu.*next required action/);
 const saved=db['1/METHOD2/default'];assert.equal(Object.keys(saved.kitchenSources).length,3);assert(Object.values(saved.kitchenSources).every(x=>x.kitchenId==='Kitchen-Elimedu'));assert.equal(saved.itemEditors[key].sideExtraFivePercent,false);assert.equal(db['1/ASSET_MASTER/default'].assets.length,1);
 const context=await p.evaluate(()=>BOBS_KITCHENS.context('Kitchen-Elimedu'));assert.equal(context.jobs.length,3);assert.equal(context.jobs.find(j=>j.name==='Idli').quantity,360);assert.equal(context.jobs.find(j=>j.name==='Idli Sambar').quantity,7.2);assert.equal(context.jobs.find(j=>j.name==='Coconut Chutney').quantity,2.88);
 const local=await p.evaluate(async()=>{const items=BOBS_OUTLET_FLOW.selected(M2.state(await M2.read('1')),ITEM_DATA,M2),recipes=(await BOBS_OPERATIONAL_RECIPES.load()).recipes;return BOBS_OUTLET_FLOW.requirements(items,recipes,M2)});assert.equal(local.length,0,'kitchen production must not also count at the shop');
 await p.locator('#sourceNextActions > section > a').click();await p.waitForURL('**/outlet-plan.html?**');assert.equal(new URL(p.url()).searchParams.get('outlet'),'Kitchen-Elimedu');
 assert(!owner.isClosed());assert.equal(owner.url(),parentURL);assert.deepEqual(errors,[]);
 console.log('PASS production sourcing: confirmed demand, explicit per-side kitchen, missing choice blocked, exact quantities, no shop equipment writes, verified next kitchen step and retained parent.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
