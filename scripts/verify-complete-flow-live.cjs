/* Live verification is read-only: block writes, including JSONP write actions. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..'),base='https://jothish2000.github.io/BOBS-OUTLETS/',out=process.env.BOBS_LIVE_REPORT_DIR||path.join(root,'complete-flow-live-report');
const result={sourceMatches:[],checks:[],errors:[],blockedWrites:0,blockedCheckpoints:0};
const review=require('./review-test-helper.cjs');
const files=['bobs-window-return.js','bobs-guided-review.js','bobs-page-guidance.js','bobs-reference-help.js','bobs-item-guide.js','method2-core.js','bobs-outlet-flow-core.js','bobs-capital-core.js','recipe-production-editor.js','recipe-cost-editor.html','method2-item.js','outlet-method-flow.html','method2.html','method2-list.js','bobs-item-guide.js','method2-select.html','bobs-guide-bot.js','bobs-kitchen-setup.js','bobs-kitchen-equipment-menu-core.js','bobs-kitchen-equipment-menu.js','bobs-kitchen-equipment-menu.css','kitchen-equipment.html','bobs-kitchen-equipment.js','bobs-kitchen-equipment-core.js','bobs-equipment-references.js','bobs-roadmap.css','outlets.html','outlet-shift-presets.js','bobs-config.js','kitchen-flow.html','bobs-kitchen-core.js','bobs-kitchen-store.js','bobs-kitchen-pages.js','bobs-kitchen.css','bobs-staff-table.js','bobs-staff-table.css','bobs-roadmap.js','production-plan.html','bobs-production-plan-core.js','bobs-production-plan.js','outlet-plan.html','bobs-outlet-plan.js','bobs-google-data.js','google-records.html','bobs-google-record-view.js','method2-item.html','bobs-item-full-cost.js','bobs-roadmap-outlet-flow.js'];
async function captureRendered(page,options){if(typeof options==='string')options={path:path.join(out,options)};const session=await page.context().newCDPSession(page);try{const shot=await session.send('Page.captureScreenshot',{format:options.type||'png',...(options.quality?{quality:options.quality}:{}),captureBeyondViewport:false}),buffer=Buffer.from(shot.data,'base64');if(options.path)fs.writeFileSync(options.path,buffer);if(options.path?.endsWith('interactive-planner-live.png'))console.log('BOBS_LIVE_INTERACTIVE_PLAN:'+shot.data);return buffer;}finally{await session.detach();}}
async function served(){let last;for(let attempt=0;attempt<20;attempt++){try{for(const f of files){const r=await fetch(base+f+'?liveVerify='+Date.now(),{signal:AbortSignal.timeout(45000)});assert(r.ok,f+' HTTP '+r.status);assert.equal((await r.text()).replace(/\r\n/g,'\n'),fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n'),f+' differs from deployed release');}result.sourceMatches=[...files];return;}catch(e){last=e;console.log('Waiting for Pages publication:',e.message.slice(0,180));await new Promise(r=>setTimeout(r,15000));}}throw last;}
(async()=>{let browser;try{fs.mkdirSync(out,{recursive:true});await served();console.log('PASS served release files:',files.length);browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true,timeout:60000});const ctx=await browser.newContext({viewport:{width:1280,height:900}});ctx.setDefaultTimeout(90000);ctx.on('page',p=>{p.on('pageerror',e=>result.errors.push(e.message));p.on('dialog',d=>d.dismiss());});await ctx.route('**/*',r=>{const req=r.request(),u=new URL(req.url()),action=u.searchParams.get('action');if(!['GET','HEAD'].includes(req.method())||(u.hostname==='script.google.com'&&action&&!['moduleGet','moduleList','outletList'].includes(action))){result.blockedWrites++;let body;try{body=JSON.parse(req.postData()||'{}')}catch{}if(u.hostname==='script.google.com'&&body?.action==='snapshot'&&body?.source==='BOBS-TRANSITION-GUARD')result.blockedCheckpoints++;console.log('BLOCKED request',JSON.stringify({method:req.method(),host:u.hostname,action:action||body?.action||null,source:body?.source||null}));return r.abort();}return r.continue();});
const baseline=await ctx.newPage();await baseline.goto(base+'outlet-plan.html?stage=baseline&outlet=1&from=outlet-setup&outlets=1%2C2&guide=continue',{waitUntil:'domcontentloaded'});const records=baseline.locator('#recordsLink');assert.match(await records.getAttribute('href'),/google-records.*OUTLET_BASELINE/);assert.doesNotMatch(await records.innerText(),/^Open Google records/);await baseline.waitForSelector('#mandatoryCount');result.checks.push('Real Google-backed baseline loaded; explanatory records link available');
// Read-only current-field UAT before the independent Google progress query.
await baseline.waitForFunction(()=>!!window.BOBS_REVIEW&&!!window.BOBS_GUIDE);
await baseline.evaluate(()=>BOBS_REVIEW.request('#flowReviewed'));
await baseline.getByRole('button',{name:'Review each field individually →',exact:true}).click();
for(let index=0;index<3;index++){
 await baseline.waitForFunction(()=>{
  const f=document.querySelector('.bobs-review-field-highlight'),p=document.querySelector('#bobsCompanion'),h=document.querySelector('body > header');
  if(!f||!p)return false;const r=f.getBoundingClientRect(),a=p.getBoundingClientRect(),top=h.getBoundingClientRect().bottom;
  return document.activeElement===f&&getComputedStyle(f).outlineWidth==='3px'&&!document.querySelector('[data-review-ui=field]')&&r.top>=Math.max(0,top)&&r.right<=a.left&&r.bottom<innerHeight-68;
 });
 if(index===1)await captureRendered(baseline,'review-field-focus-live.png');
 await baseline.locator('[data-guide-choice=review-next]').click();
}
await baseline.locator('[data-guide-choice=review-choices]').click();await baseline.getByRole('button',{name:'Return to page guide',exact:true}).click();
assert.equal(await baseline.locator('.bobs-review-field-highlight').count(),0);
result.checks.push('Live outlet baseline: three exact fields highlighted; review controls and field visible below sticky outlet ribbon; original values unchanged; no Save');
console.log('PASS live original-field review: no per-field panel, exact highlight, sticky ribbon clearance, existing guide action, no operational writes.');
await baseline.evaluate(()=>BOBS_GUIDE.open());
await baseline.locator('[data-other-checks] > summary').click();await baseline.locator('[data-guide-choice=page-progress]').waitFor();assert.equal(await baseline.locator('[data-guide-choice=page-progress]').innerText(),'Check saved progress & show what’s incomplete');
const beforeProgressURL=baseline.url();await baseline.click('[data-guide-choice=page-progress]');await baseline.waitForFunction(()=>!BOBS_ROADMAP.getState().busy);
const progressState=await baseline.evaluate(()=>BOBS_ROADMAP.getState().progress);assert.equal(progressState.status,'ready',progressState.message);assert.match(await baseline.locator('#bobsGuideDialogue').innerText(),/does not save your current entries/);assert.match(await baseline.locator('#bobsGuideDialogue').innerText(),/Next incomplete step/);assert.equal(baseline.url(),beforeProgressURL);assert.match(await baseline.locator('#bobsGuideDialogue').innerText(),/You are reviewing: Outlet expenses/);assert.match(await baseline.locator('.guide-current-status').innerText(),/Saved status of this section:/);assert.match(await baseline.locator('#bobsGuideDialogue').innerText(),/Opening the saved-data requirement is optional/);assert.equal(await baseline.locator('[data-guide-choice=resume-edit]').innerText(),'Stay here — review this page');
await captureRendered(baseline,'saved-progress-guide-live.png');await baseline.click('[data-guide-choice=resume-edit]');assert(await baseline.locator('#bobsCompanion').isHidden());result.checks.push('Live baseline bot uses self-explanatory saved-progress caption, returns actual saved next requirement, explains no save/navigation, and Stay here returns to the current review without a write');


const sambarBefore=await baseline.evaluate(async()=>{const state=await BOBS_VERIFIED.read('1','METHOD2');return JSON.stringify(state?.recipeOverrides?.['idli sambar']??null);});
const savedSambar=JSON.parse(sambarBefore),sambarQuantity=savedSambar?.recipe?.yieldQty||9.5;
const sambarUnitsPage=await ctx.newPage();
await sambarUnitsPage.goto(base+'recipe-cost-editor.html?'+new URLSearchParams({outlet:'1',item:'Idli Sambar',cat:'Breakfast Catalogue',i:'0',qty:String(sambarQuantity)}),{waitUntil:'domcontentloaded'});
await sambarUnitsPage.waitForFunction(()=>document.getElementById('status')?.textContent.includes('data loaded'));
assert.match(await sambarUnitsPage.locator('#referenceYield').evaluate(el=>el.parentElement.textContent),/litres/);
assert(await sambarUnitsPage.locator('#referencePortion').isHidden());
assert.match(await sambarUnitsPage.locator('#portionHelp').innerText(),/ml/);
result.sambarReferenceAudit=await sambarUnitsPage.evaluate(async()=>{
 const standards=await BOBS_RECIPE_KNOWLEDGE.loadStandards(BOBS_DATA),r=standards.records.find(x=>M2.purchaseKey(x.name)==='idli sambar'),raw=await BOBS_VERIFIED.read('1','METHOD2'),saved=raw?.recipeOverrides?.['idli sambar'];
 return {standard:{yieldQty:r?.yieldQty,yieldUnit:r?.yieldUnit,portionGrams:r?.portionGrams??null},saved:saved?{referenceYield:saved.referenceYield,referencePortion:saved.referencePortion,portion:saved.portion,yieldQty:saved.recipe?.yieldQty,yieldUnit:saved.recipe?.yieldUnit,savedAt:saved.savedAt}:null,servingText:document.getElementById('portionHelp').textContent};
});
const sambarAfter=await sambarUnitsPage.evaluate(async()=>JSON.stringify((await BOBS_VERIFIED.read('1','METHOD2'))?.recipeOverrides?.['idli sambar']??null));
assert.equal(sambarAfter,sambarBefore,'Saved sambar override changed during read-only verification; inspect concurrent editing before attributing cause');
result.checks.push('Live sambar: batch litres and saved serving ml, gram controls hidden; saved recipe override byte-for-byte unchanged across read-only opening');
await captureRendered(sambarUnitsPage,'sambar-volume-live.png');
const [servingLive]=await Promise.all([sambarUnitsPage.waitForEvent('popup'),sambarUnitsPage.click('#changeServingQuantity')]);
await servingLive.waitForFunction(()=>document.activeElement?.id==='servingShortcutQuantity');
assert.match(await servingLive.locator('#servingShortcutQuantity').getAttribute('aria-label'),/Idli Sambar/);assert.equal(await servingLive.inputValue('#servingShortcutUnit'),'ml');await servingLive.waitForFunction(()=>document.getElementById('bobsGuideDialogue')?.textContent.includes('change serving quantity'));
result.checks.push('Live serving shortcut opens the existing Idli Sambar quantity field, focuses it with ml unit and explains save-and-return; no edit or save attempted');
await captureRendered(servingLive,'serving-shortcut-live.png');await servingLive.close();await sambarUnitsPage.close();

const savedOutlets=await baseline.evaluate(async()=>(await BOBS_DATA.listOutlets()).map(o=>({id:String(o.id),shiftTimes:o.shiftTimes.map(s=>({start:s.start,end:s.end}))})));
result.outletShifts=savedOutlets;
const staffShiftOptions=baseline.locator('#mandatoryPositions [data-field=shift]').first();
if(await staffShiftOptions.count())assert.deepEqual(await staffShiftOptions.locator('option').allTextContents(),savedOutlets.find(o=>o.id==='1').shiftTimes.map((s,i)=>'Shift '+(i+1)+' · '+s.start+'–'+s.end));
const setup=await ctx.newPage();await setup.goto(base+'outlets.html',{waitUntil:'domcontentloaded'});await setup.click('#keep');
await setup.waitForSelector('.bobs-shift-start');assert(await setup.locator('#bobsFlowGuide').isHidden());assert.match(await setup.locator('#bobsFlowGuide').textContent(),/Kitchen Setup/);assert(await setup.locator('#outletsReviewed').count());assert.match(await setup.locator('#save').innerText(),/Kitchen Setup/);result.checks.push('Single BOBS guide metadata and explicit outlet review present');
const shownOutlets=await setup.locator('#cards > .stack').evaluateAll(cards=>cards.map(card=>({id:card.querySelector('.id').value,shiftTimes:[...card.querySelectorAll('.shift')].map(row=>({start:row.querySelector('.st').value,end:row.querySelector('.en').value}))})));
assert.deepEqual(shownOutlets,savedOutlets);
result.checks.push('Live Outlet Setup and staff choices agree with the same saved Vault times; no schedule assigned and no save attempted');
await captureRendered(setup,{path:path.join(out,'outlet-times-desktop.png')});
await setup.setViewportSize({width:1071,height:580});
await review(setup.locator('#outletsReviewed'));
const confirmedNext=setup.locator('.guide-checklist-local [data-confirmation-next]');await confirmedNext.waitFor();
assert.match(await confirmedNext.innerText(),/Next: Save outlets & go to Kitchen Setup/);
assert(await confirmedNext.evaluate(el=>el.previousElementSibling?.textContent.startsWith('✓')));
assert.equal(await setup.locator('.guide-checklist-local .guide-review-again').innerText(),'Review again');
await setup.waitForFunction(()=>{const a=document.querySelector('[data-confirmation-next]')?.getBoundingClientRect(),p=document.getElementById('bobsCompanion')?.getBoundingClientRect(),h=document.querySelector('#bobsCompanion .companion-head')?.getBoundingClientRect();return a&&p&&a.width>0&&a.height>0&&p.height>0&&a.y>=Math.max(p.y,h?.bottom||0)&&a.bottom<=p.bottom;});
assert(await confirmedNext.evaluate(el=>{const a=el.getBoundingClientRect(),p=document.getElementById('bobsCompanion').getBoundingClientRect();return a.width>0&&a.y>=p.y&&a.bottom<=p.bottom;}));
await captureRendered(setup,'outlet-confirmation-next-live.png');
await confirmedNext.locator('button').click();assert.equal(await setup.evaluate(()=>document.activeElement.id),'save');assert.equal(result.blockedWrites,result.blockedCheckpoints);
result.checks.push('All attempted protection checkpoints remain blocked; no operational write is permitted.');
result.checks.push('Live outlet confirmation shows exact next Save beneath the green tick, with secondary Review again; continuation is visible and focuses the original Save without writing.');
await baseline.setViewportSize({width:390,height:844});assert(await baseline.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await captureRendered(baseline,{path:path.join(out,'baseline-mobile.png')});
assert(await baseline.locator('.staff-entry-tools').count()>0);assert(await baseline.locator('#mandatoryPositions [data-position]:visible').count()<=3);result.checks.push('Per-person staff table loads with at most three visible people');const kitchens=await ctx.newPage();await kitchens.goto(base+'kitchen-flow.html?stage=locations',{waitUntil:'domcontentloaded'});await kitchens.waitForFunction(()=>document.getElementById('saveKitchen')?.disabled===false);assert(await kitchens.locator('#addKitchen').isVisible());assert.match(await kitchens.locator('#kitchenRecords').innerText(),/identity register.*read-only/);result.checks.push('Real Google kitchen register loaded without creating locations or orders');
const savedRegister=await kitchens.evaluate(()=>BOBS_VERIFIED.read('COMPANY','KITCHEN_MASTER'));
const registrationValid=await kitchens.evaluate(async()=>{try{BOBS_KITCHEN_CORE.requireRegistration(await BOBS_VERIFIED.read('COMPANY','KITCHEN_MASTER'),await BOBS_DATA.listOutlets());return true;}catch(e){return false;}});
if(registrationValid){
 await kitchens.setViewportSize({width:1071,height:580});assert(await kitchens.locator('#kitchenNextGo').isDisabled());assert(await kitchens.locator('.kitchen-saved-check').isVisible());
 assert.equal(await kitchens.locator('#kitchenReviewed').isChecked(),false);
 await kitchens.click('#saveKitchen');await kitchens.waitForTimeout(1500);
 const choice=kitchens.locator('input[name="kitchenNextChoice"]').first();
 assert.equal(await kitchens.evaluate(()=>document.activeElement.id),await choice.getAttribute('id'));
 const focusBounds=await kitchens.locator('.kitchen-next-choices').boundingBox();const guide=kitchens.locator('#kitchenNextGuide #bobsCompanion');assert(await guide.isVisible());const guideBounds=await guide.boundingBox();assert(guideBounds.y>=50&&guideBounds.y<160);assert(focusBounds.y>=guideBounds.y+guideBounds.height);assert(focusBounds.y+focusBounds.height<=580);assert.match(await kitchens.locator('#bobsGuideDialogue').innerText(),/Optional now: record existing equipment/);assert.match(await kitchens.locator('#bobsGuideDialogue').innerText(),/Next required: review outlet expenses/);assert.equal(result.blockedWrites,result.blockedCheckpoints,'Unchanged verified continuation must not write');
 await captureRendered(kitchens,{path:path.join(out,'kitchen-save-focus-desktop.png')});console.log('BOBS_LIVE_SAVE_FOCUS:'+(await captureRendered(kitchens,{type:'jpeg',quality:70})).toString('base64'));
 result.checks.push('Clicking Save on reopened verified Kitchen Setup focuses the actual next choice and keeps both cards in the laptop viewport after settling, with no write');
 await choice.check();assert.equal(await kitchens.locator('.kitchen-choice-selected:visible').count(),1);assert(await kitchens.locator('#kitchenNextGo').isEnabled());
 assert.equal(await choice.evaluate(el=>getComputedStyle(el.closest('label')).outlineWidth),'4px');
 await kitchens.locator('.kitchen-next-panel').scrollIntoViewIfNeeded();await captureRendered(kitchens,{path:path.join(out,'kitchen-next-actions-desktop.png')});
 console.log('BOBS_LIVE_NEXT_PANEL:'+(await captureRendered(kitchens,{type:'jpeg',quality:70})).toString('base64'));
 await kitchens.setViewportSize({width:390,height:844});assert(await kitchens.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await captureRendered(kitchens,{path:path.join(out,'kitchen-next-actions-mobile.png')});await kitchens.setViewportSize({width:1280,height:900});
 result.checks.push('Saved Kitchen Setup exposes coloured next-action choices on reload, visible selection tick and keyboard outline on laptop/mobile; choosing performs no save');
}else{assert.equal(await kitchens.locator('#kitchenNextGo').count(),0);result.checks.push('Unreviewed kitchen registration correctly withholds next actions');}
if(savedRegister?.kitchens?.length){const equipment=await ctx.newPage();await equipment.goto(base+'kitchen-equipment.html?outlet='+encodeURIComponent(savedRegister.kitchens[0].id),{waitUntil:'domcontentloaded'});await equipment.waitForFunction(()=>!document.getElementById('equipmentEditor').disabled);assert(await equipment.locator('#bobsFlowGuide').isHidden());assert(await equipment.locator('#addEquipment').isEnabled());
const savedAsset=await equipment.evaluate(id=>BOBS_VERIFIED.read(id,'ASSET_MASTER'),savedRegister.kitchens[0].id),count=(savedAsset?.assets||[]).length;
assert.equal(await equipment.locator('[data-equipment]').count(),count);assert.match(await equipment.locator('#equipmentInventorySummary').innerText(),count?/saved equipment/:/No equipment has been added/);
const records=await ctx.newPage();await records.goto(base+'google-records.html?'+new URLSearchParams({outlet:savedRegister.kitchens[0].id,module:'ASSET_MASTER',returnTo:equipment.url()}));await records.waitForFunction(()=>!document.getElementById('retry').disabled);assert.match(await records.locator('#status').innerText(),/loaded and verified|no record has been saved/);assert((await records.locator('#description').innerText()).includes(savedRegister.kitchens[0].name));assert.equal(await records.locator('#equipmentList tbody tr').count(),count);if(savedAsset)assert.match(await records.locator('#summary').innerText(),/Equipment inventory review.*Asset costing review/s);assert(await records.locator('#recordGuide a').isVisible());assert.deepEqual(await equipment.evaluate(id=>BOBS_VERIFIED.read(id,'ASSET_MASTER'),savedRegister.kitchens[0].id),savedAsset);await captureRendered(records,'saved-equipment-records-live.png');await records.close();result.checks.push('Kitchen name, equipment count/list, separate inventory/costing review and next-step guide verified against real saved assets; record unchanged');
await equipment.setViewportSize({width:1071,height:580});
assert(await equipment.locator('#openEquipmentHelp').isVisible());
await equipment.click('#openEquipmentHelp');await equipment.waitForSelector('#equipmentCategories button');
await equipment.getByRole('button',{name:/^Breakfast /}).click();await equipment.getByLabel('Idli',{exact:true}).check();
await equipment.click('#showEquipmentSuggestions');assert(await equipment.locator('[data-suggestion]').count()>0);
assert.match(await equipment.locator('#equipmentSuggestions').innerText(),/Idli/);
assert.equal(await equipment.locator('[data-decision]').first().inputValue(),'');
await captureRendered(equipment,{path:path.join(out,'menu-equipment-desktop.png')});
console.log('BOBS_LIVE_MENU_EQUIPMENT:'+(await captureRendered(equipment,{type:'jpeg',quality:70})).toString('base64'));
await equipment.setViewportSize({width:390,height:844});assert(await equipment.locator('#equipmentMenuDialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
await equipment.click('#equipmentBackToItems');assert(await equipment.getByLabel('Idli',{exact:true}).isChecked());
await captureRendered(equipment,{path:path.join(out,'menu-equipment-mobile.png')});await equipment.click('#equipmentHelpClose');
result.checks.push('Menu-led existing-equipment help uses real recipe references; category/item selection and laptop/mobile dialog verified with no inventory mutation or Google write');
await equipment.setViewportSize({width:390,height:844});assert(await equipment.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await captureRendered(equipment,{path:path.join(out,'existing-equipment-mobile.png')});result.checks.push('Existing kitchen equipment reads the real Asset Master without writes; guide and mobile layout verified');}
const previewOnly=await kitchens.locator('[data-kitchen-shift]').count()===0;
if(previewOnly)await kitchens.click('#addKitchen'); // Unsaved browser-only draft; every network write remains blocked.
assert.equal(await kitchens.locator('textarea[data-field=shifts]').count(),0);
assert(await kitchens.locator('.bobs-shift-start').first().isVisible());
assert(await kitchens.locator('.bobs-shift-duration').first().isVisible());
assert(await kitchens.locator('[data-kitchen-shift] .st').first().isVisible());
assert(await kitchens.locator('[data-kitchen-shift] .en').first().isVisible());
const savedKitchens=await kitchens.evaluate(async()=>(await BOBS_KITCHENS.locations()).kitchens.map(k=>({id:k.id,shiftTimes:k.shiftTimes.map(s=>({start:s.start,end:s.end}))})));
if(!previewOnly){
 const shownKitchens=await kitchens.locator('[data-kitchen]').evaluateAll(cards=>cards.map(card=>({id:card.dataset.kitchen,shiftTimes:[...card.querySelectorAll('[data-kitchen-shift]')].map(row=>({start:row.querySelector('.st').value,end:row.querySelector('.en').value}))})));
 assert.deepEqual(shownKitchens,savedKitchens);
}
result.kitchenShifts=savedKitchens;
assert(await kitchens.locator('[data-add-shift]').first().isVisible());
result.checks.push('Shared start-list/duration/exact-time controls visible; saved kitchen times preserved on deployed page; '+(previewOnly?'blank unsaved preview only':'existing saved locations displayed')+'; no save attempted');
await captureRendered(kitchens,{path:path.join(out,'kitchen-locations-desktop.png')});await kitchens.setViewportSize({width:390,height:844});assert(await kitchens.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await captureRendered(kitchens,{path:path.join(out,'kitchen-locations-mobile.png')});const source=await ctx.newPage();await source.goto(base+'kitchen-flow.html?stage=demand&outlet=1',{waitUntil:'domcontentloaded'});await source.waitForFunction(()=>document.getElementById('saveKitchen')?.disabled===false);assert(await source.locator('[data-demand]').count()>0);assert.match(await source.locator('#kitchenBody').innerText(),/shared production/i);result.checks.push('Live menu requirements show per-component kitchen and shared-batch choices; no save performed');const viewer=await ctx.newPage();await viewer.goto(new URL(await records.getAttribute('href'),baseline.url()).href,{waitUntil:'domcontentloaded'});await viewer.waitForFunction(()=>document.body.innerText.includes('Read-only')||document.body.innerText.includes('read-only'));await viewer.waitForFunction(()=>document.getElementById('status').textContent==='Saved Google record loaded and verified.');result.checks.push('Google record viewer rendered the saved baseline with read-only explanation');await captureRendered(viewer,{path:path.join(out,'records-desktop.png')});
const production=await ctx.newPage();await production.goto(base+'production-plan.html?outlet=1&cat=Breakfast+Catalogue&i=0',{waitUntil:'domcontentloaded'});
await production.waitForFunction(()=>document.getElementById('plannerFields')?.disabled===false);
assert(await production.locator('#productionSourceStep').isVisible(),'Selling outlet must choose its producing kitchen before equipment');
assert(await production.locator('#capacitySection').isHidden(),'Outlet demand must not expose local equipment planning');
assert(await production.locator('#intendedQuantity').isEnabled());
assert.match(await production.locator('#productionSourceStep').innerText(),/producing kitchen/i);
if(!+(await production.inputValue('#intendedQuantity')))await production.fill('#intendedQuantity','360');
if(!await production.inputValue('#readyBy'))await production.fill('#readyBy','07:00');
await review(production.locator('#quantityReviewed'));
assert(await production.evaluate(()=>!!window.BOBS_PRODUCTION_PLAN));
assert.match(await production.locator('#selectedPlanContext').innerText(),/Idli/i);
result.checks.push('Live selling-outlet demand is editable and reviewable; required kitchen routing is visible and local equipment planning stays hidden. No save performed.');
await production.setViewportSize({width:390,height:844});assert(await production.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await captureRendered(production,{path:path.join(out,'production-mobile.png')});

const methodFlow=await ctx.newPage();await methodFlow.setViewportSize({width:1071,height:580});await methodFlow.goto(base+'outlet-method-flow.html?outlet=0&outlets=1&guide=continue',{waitUntil:'domcontentloaded'});
await methodFlow.waitForFunction(()=>document.getElementById('baselineGate')?.textContent&&!document.getElementById('baselineGate').textContent.startsWith('Checking'));
if(await methodFlow.evaluate(()=>!!window.BOBS_BASELINE_READY)){
 await methodFlow.waitForFunction(()=>document.getElementById('outletHeading').textContent.includes('Outlet 1'));
 const selectionPromise=methodFlow.waitForEvent('popup');await methodFlow.click('#method2Btn');const selection=await selectionPromise;await selection.close();
 await methodFlow.waitForFunction(()=>window.BOBS_METHOD_FLOW_GUIDE?.snapshot().workspace?.ready);
 const workspace=await methodFlow.evaluate(()=>BOBS_METHOD_FLOW_GUIDE.snapshot().workspace);
 await methodFlow.waitForFunction(()=>document.getElementById('bobsGuideDialogue').textContent.includes('Continue Method 2'));
 assert.equal(await methodFlow.locator('#bobsCompanion').evaluate(el=>getComputedStyle(el).position),'fixed');
 if(workspace.item){assert((await methodFlow.locator('#bobsGuideDialogue').innerText()).includes(workspace.item.name+' is selected'));await methodFlow.click('[data-guide-choice=method-flow-work]');
 const active=await methodFlow.frameLocator('#methodFrame').locator('[data-edit-item]').evaluateAll(buttons=>buttons.some(el=>document.activeElement===el));assert(active);assert(await methodFlow.locator('#bobsCompanion').isHidden());}
 result.checks.push('Live parent recognises Method2 and its actual selected-item state; guide is inline and Show focuses the existing Edit button without opening/saving it');
 await captureRendered(methodFlow,{path:path.join(out,'method2-guide-focus.png')});
}else result.checks.push('Method2 live active-context check not run: saved baseline gate requires review; no bypass performed.');
await methodFlow.close();

const item=await ctx.newPage();await item.goto(base+'method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production#idliLabourCost',{waitUntil:'domcontentloaded'});await item.waitForFunction(()=>document.getElementById('controls')?.disabled===false);await item.waitForFunction(()=>/Break.even/i.test(document.body.innerText));assert.match(await item.locator('body').innerText(),/Ideal Price Builder/);assert(await item.locator('a[href*="production-plan.html"]').count()>0);assert(await item.locator('a[href*="asset-master.html"]').count()>0);result.checks.push('Ideal Price Builder exposes production, assets and break-even with truthful current prerequisites');
await item.waitForFunction(()=>!!window.BOBS_ITEM_GUIDE);await item.evaluate(()=>BOBS_GUIDE.open());
const itemHelp=await item.evaluate(()=>BOBS_ITEM_GUIDE.snapshot());assert((await item.locator('#bobsGuideDialogue').innerText()).includes(itemHelp.title));
assert.equal(await item.locator('#bobsCompanion').evaluate(el=>getComputedStyle(el).position),'fixed');
const guideBounds=await item.locator('#bobsCompanion').boundingBox(),mainBounds=await item.locator('main').boundingBox();assert(mainBounds.x+mainBounds.width<=guideBounds.x,'Laptop work area is outside guide column');
if(itemHelp.href){
 const nextPage=item.waitForEvent('popup');await item.click('[data-guide-choice=item-open-production]');const planner=await nextPage;await planner.waitForURL(u=>u.pathname.endsWith('/production-plan.html'),{waitUntil:'domcontentloaded'});
 assert.equal(new URL(planner.url()).searchParams.get('returnTo'),item.url());await planner.waitForFunction(()=>window.BOBS_PRODUCTION_GUIDE?.snapshot().ready);await planner.locator('[data-guide-choice=plan-quantity-next]').waitFor();
 assert.match(await planner.locator('#bobsGuideDialogue').innerText(),/how much, and ready by when/);
 await captureRendered(planner,'interactive-planner-live.png');result.checks.push('Live Idli: direct planner popup preserves immediate parent and automatically asks quantity/time');
 if(!+(await planner.inputValue('#intendedQuantity')))await planner.fill('#intendedQuantity','360');if(!await planner.inputValue('#readyBy'))await planner.fill('#readyBy','07:00');await review(planner.locator('#quantityReviewed'));await review(planner.locator('#sideServingReviewed'));
 const liveOptions=await planner.locator('[data-source-key]').first().locator('option:not([value=""]):not(:disabled)').evaluateAll(xs=>xs.map(x=>({value:x.value,name:x.textContent})));
 assert(liveOptions.length,'An operating kitchen is needed for this live source review');assert.equal(await planner.locator('[data-source-key]').first().inputValue(),'');
 await planner.locator('[data-source-key]').first().selectOption(liveOptions[0].value);await planner.click('#useSameKitchen');await review(planner.locator('#productionSourceReviewed'));
 result.checks.push('Registered kitchens listed by name, no automatic selection; explicit same-kitchen draft choice reviewed before optional extra. No Save clicked.');
 const optional=await planner.evaluate(()=>BOBS_PRODUCTION_GUIDE.snapshot().extraSides);
 if(optional?.needed){if(optional.choice===undefined){assert.equal(await planner.locator('#sideExtraYes').isChecked(),false);assert.equal(await planner.locator('#sideExtraNo').isChecked(),false);}
 await planner.evaluate(()=>BOBS_PRODUCTION_GUIDE.chooseExtra(false));const normal=await planner.locator('#recipePlanLinks a[href*="recipe-cost-editor"]').evaluateAll(as=>as.map(a=>({name:new URL(a.href).searchParams.get('item'),qty:Number(new URL(a.href).searchParams.get('qty'))})));
 await planner.evaluate(()=>BOBS_PRODUCTION_GUIDE.chooseExtra(true));const extra=await planner.locator('#recipePlanLinks a[href*="recipe-cost-editor"]').evaluateAll(as=>as.map(a=>({name:new URL(a.href).searchParams.get('item'),qty:Number(new URL(a.href).searchParams.get('qty'))})));
 assert.equal(normal[0].qty,extra[0].qty);for(let i=1;i<normal.length;i++)assert(Math.abs(extra[i].qty-normal[i].qty*1.05)<1e-8);
 await planner.evaluate(()=>BOBS_PRODUCTION_GUIDE.chooseExtra(false));assert(await planner.locator('#sideExtraNo').isChecked());result.checks.push('Live optional reserve: no invented default, Yes adds 5% to sides only, No restores base; draft-only check, no saves');}
 await planner.close();
}else{await item.click('[data-guide-choice=item-next-control]');assert(await item.locator('#bobsCompanion').isVisible());assert(await item.locator(itemHelp.selector).evaluate(el=>document.activeElement===el));result.checks.push('Live Idli next saved requirement: '+itemHelp.title+'; actual control focused with guide remaining open');}
result.checks.push('Live Idli bot reserves laptop space outside the form; zero writes');

await captureRendered(item,'idli-next-guide.png');await item.click('#bobsRoadmapToggle');await item.waitForFunction(()=>document.getElementById('bobsRoadmapStatus').textContent.includes('Saved progress checked'));assert.equal(await item.locator('#bobsRoadmapContent > ol > li').count(),10);assert.equal(await item.locator('.guide-checklist').count(),1);const savedProgress=item.locator('[data-saved-progress]');if(!await savedProgress.evaluate(el=>el.open))await savedProgress.locator(':scope > summary').click();assert.match(await savedProgress.innerText(),/saved stages verified/);assert.equal(await savedProgress.locator('ol > li').count(),10);result.checks.push('Live guide checklist shares the ten verified roadmap stages; no navigation or writes required');const setupStep=item.locator('#bobsRoadmapContent > ol > li[data-step="1"] > details');if(!await setupStep.evaluate(el=>el.open))await setupStep.locator(':scope > summary').click();assert(await item.locator('[data-step="kitchen-register"] > details > summary').isVisible());assert.match(await item.locator('[data-step="kitchen-register"]').innerText(),/Kitchen identities/);assert.match(await item.locator('#bobsRoadmapContent').innerText(),/Production time, shared equipment and staff assessment/);result.checks.push('Entire-project roadmap has ten saved-data stages and capacity/time/staff links');await captureRendered(item,'roadmap-desktop.png');await item.setViewportSize({width:390,height:844});await captureRendered(item,'roadmap-mobile.png');assert.equal(result.errors.length,0,result.errors.join('\n'));assert.equal(result.blockedWrites,result.blockedCheckpoints,'Unexpected write attempted');console.log('PASS live read-only:',JSON.stringify(result));await ctx.close();}catch(e){result.failure=e.stack;console.error(e);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));if(browser)await browser.close();}})();
