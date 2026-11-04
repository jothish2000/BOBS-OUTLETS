const review=require('./review-test-helper.cjs');
/* Full browser fixture: all requests are intercepted; no live Google writes. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),shifts=[{start:'04:30',end:'13:30'},{start:'13:30',end:'22:30'}];
const originalOutlets=['1','2'].map(id=>({outletId:id,outletName:'Fixture outlet '+id,data:{id,name:'Fixture outlet '+id,shortCode:'F'+id,numShifts:2,shiftTimes:id==='1'?shifts:[{start:'06:00',end:'12:00'},{start:'16:00',end:'20:30'}],keep:'outlet metadata'}}));
let outletRows=JSON.parse(JSON.stringify(originalOutlets)),legacyReads=0,failOutletRead=false;
const vaultPath=new URL(fs.readFileSync(path.join(root,'bobs-config.js'),'utf8').match(/DATA_VAULT_WEB_APP_URL: '([^']+)'/)[1]).pathname;
const db={'COMPANY/KITCHEN_MASTER/default':{reviewed:true,kitchens:[],noSeparateKitchens:true,outletDecisions:{'1':{hasKitchen:false},'2':{hasKitchen:false}}},'COMPANY/THP_NORMS/default':require('../tests/fixtures/thp-norms.json'),'1/OUTLET_BASELINE/default':{schema:1,reviewed:true,workingDays:30,mandatoryCount:1,noCounter:true,ownerCounterShifts:[0,1],positions:[{id:'Mandatory1',role:'Cashier',shift:0,takeHome:15000}],expenseSelections:[]},'1/FIXED_EXPENSES/default':{expenses:[]}};
(async()=>{const browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true,timeout:30000});try{
 const ctx=await browser.newContext({viewport:{width:668,height:580}}),errors=[],writes=[];ctx.setDefaultTimeout(30000);ctx.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept())});
 await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='bobs.test'){const f=path.join(root,decodeURIComponent(u.pathname.slice(1)));return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404,body:'missing'})}if(u.hostname!=='script.google.com')return route.abort();if(req.method()==='POST'){const b=JSON.parse(req.postData());if(b.action==='snapshot'){assert.equal(b.source,'BOBS-TRANSITION-GUARD');return route.fulfill({body:'ok'});}if(b.action==='outletSave'){writes.push('outletSave');const row=outletRows.find(o=>o.outletId===b.outletId);assert(row);row.data=b.data;row.outletName=b.outletName;row.outletCode=b.outletCode;return route.fulfill({body:'ok'});}assert(b.module,'Unexpected automatic write');writes.push(b.module);db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return route.fulfill({body:'ok'})}let response;if(u.searchParams.get('action')==='outletList'){if(u.pathname!==vaultPath)legacyReads++;response=failOutletRead?{ok:false,error:'fixture unavailable'}:{ok:true,outlets:u.pathname===vaultPath?outletRows:originalOutlets.map(o=>({...o,data:{...o.data,shiftTimes:[shifts[1],shifts[1]]}}))};}else{const k=u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey');response={ok:true,found:!!db[k],data:db[k]??null}}return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify(response)+')'})});
 const p=await ctx.newPage();
 // Index entry starts with the real saved-data choice, then follows the user's page navigation.
 const guided=await ctx.newPage();await guided.goto('https://bobs.test/index.html');await guided.waitForSelector('#bobsCompanion:not([hidden])');assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/Welcome to BOBS/);await guided.getByRole('link',{name:'Start here — guided outlet setup →',exact:true}).click();await guided.waitForSelector('#keep');
 assert.equal(new URL(guided.url()).searchParams.get('guide'),'start');assert.match(await guided.locator('#savedModal').innerText(),/BOBS Guide · start here/);assert(await guided.locator('#bobsCompanion').isHidden());
 await guided.click('#keep');await guided.waitForSelector('#bobsCompanion:not([hidden]) [data-guide-choice=outlet-count]');assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/How many outlets/);assert.equal(writes.length,0);

 // Confirmed checklist must show the next Save action where the tick is, not only above it.
 const confirmation=await ctx.newPage();await confirmation.setViewportSize({width:1071,height:580});
 await confirmation.goto('https://bobs.test/outlets.html?guide=start');await confirmation.click('#keep');await confirmation.waitForSelector('[data-guide-choice=outlet-count]');

 // Walk original outlet controls without inserting panels or changing their grid positions.
 await confirmation.evaluate(()=>{const box=document.getElementById('cards').getBoundingClientRect();window.originalOutletInputs=[...document.querySelectorAll('#cards input')].map(n=>({n,parent:n.parentNode,x:n.getBoundingClientRect().left-box.left,y:n.getBoundingClientRect().top-box.top}));BOBS_REVIEW.request('#outletsReviewed');});
 await confirmation.getByRole('button',{name:'Review each field individually →',exact:true}).click();
 let walked=0;while(await confirmation.evaluate(()=>document.activeElement.id!=='outletField-st-0-1')){
  assert(++walked<30,'must reach shift 2 start');
  await confirmation.locator('main #bobsReviewConfirmField').click();
 }
 await confirmation.waitForFunction(()=>document.activeElement.id==='outletField-st-0-1'&&document.getElementById('outletField-st-0-1').getBoundingClientRect().top>=document.querySelector('body > header').getBoundingClientRect().bottom);
 const shiftPosition=await confirmation.evaluate(()=>({scroll:scrollY,endTop:document.getElementById('outletField-en-0-1').getBoundingClientRect().top,endBottom:document.getElementById('outletField-en-0-1').getBoundingClientRect().bottom,headerBottom:document.querySelector('body > header').getBoundingClientRect().bottom,bottom:innerHeight-76}));
 await confirmation.locator('main #bobsReviewConfirmField').click();
 await confirmation.waitForFunction(()=>document.activeElement.id==='outletField-en-0-1');
 if(shiftPosition.endTop>=shiftPosition.headerBottom+12&&shiftPosition.endBottom<=shiftPosition.bottom)assert.equal(await confirmation.evaluate(()=>scrollY),shiftPosition.scroll,'an already visible next field must not be recentered');
 assert(await confirmation.evaluate(()=>{const r=document.getElementById('outletField-en-0-1').getBoundingClientRect();return r.top>=document.querySelector('body > header').getBoundingClientRect().bottom&&r.bottom<=innerHeight-76;}),'wrapped next field must be scrolled only enough to be visible');
 assert(await confirmation.evaluate(()=>{const box=document.getElementById('cards').getBoundingClientRect();return originalOutletInputs.every(({n,parent,x,y})=>n.parentNode===parent&&Math.abs(n.getBoundingClientRect().left-box.left-x)<1&&Math.abs(n.getBoundingClientRect().top-box.top-y)<1);}));
 assert.equal(await confirmation.locator('[data-review-ui=field]').count(),0);
 assert.equal(await confirmation.inputValue('#outletField-st-0-1'),'13:30');assert.equal(await confirmation.inputValue('#outletField-en-0-1'),'22:30');
 console.log('REVIEW_STATIONARY_SHIFTS_PNG '+(await confirmation.screenshot()).toString('base64'));
 await confirmation.locator('[data-guide-choice=review-choices]').click();
 await review(confirmation.locator('#outletsReviewed'));
 const next=confirmation.locator('.guide-checklist-local [data-confirmation-next]');await next.waitFor();
 assert.match(await next.innerText(),/Next: Save outlets & go to Kitchen Setup/);
 assert(await next.evaluate(el=>el.previousElementSibling?.textContent.startsWith('✓')));
 assert.equal(await confirmation.locator('.guide-checklist-local .guide-review-again').innerText(),'Review again');
 await confirmation.evaluate(()=>window.dispatchEvent(new Event('bobs-guide-context')));
await confirmation.waitForFunction(()=>{const a=document.querySelector('[data-confirmation-next]')?.getBoundingClientRect(),p=document.getElementById('bobsCompanion')?.getBoundingClientRect(),h=document.querySelector('#bobsCompanion .companion-head')?.getBoundingClientRect();return a&&p&&a.width>0&&a.height>0&&p.height>0&&a.y>=Math.max(p.y,h?.bottom||0)&&a.bottom<=p.bottom;});
 // The geometry wait above includes the pane and sticky heading; do not re-sample mid-layout in a separate assertion.
 assert.equal(writes.length,0,'Review confirmation must not save');
 await next.locator('button').click();assert.equal(await confirmation.locator('#bobsNextActionBar').count(),0);assert.equal(await confirmation.evaluate(()=>document.activeElement.id),'save');assert.equal(writes.length,0,'Show Save must not auto-save');
 await confirmation.locator('.guide-review-again').click();assert(await confirmation.locator('[data-review-ui=choices]').isVisible());
 assert.equal(writes.length,0);await confirmation.close();
 console.log('PASS laptop confirmation: next Save directly below tick, secondary Review again, guide-pane visibility, original Save focus, zero automatic writes.');
 await guided.click('[data-guide-choice=outlet-count]');assert.equal(await guided.evaluate(()=>document.activeElement.id),'count');await guided.fill('#count','3');assert(await guided.locator('#bobsCompanion').isVisible());assert.equal(await guided.locator('#outletsReviewed').isChecked(),false);
 await guided.getByRole('link',{name:'Set up attached / common kitchens and shared production →',exact:true}).click();await guided.waitForSelector('[data-guide-choice=outlet-kitchen-yes]');assert(await guided.locator('#bobsCompanion').isVisible());assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/Do you want a kitchen at Fixture outlet 1/);
 await guided.click('[data-guide-choice=outlet-kitchen-no]');assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/Do you want a kitchen at Fixture outlet 2/);await guided.click('[data-guide-choice=outlet-kitchen-no]');await guided.click('[data-guide-choice=kitchen-review]');assert(await guided.locator('[data-review-ui=choices]').isVisible());assert(await guided.locator('[data-review-ui=choices]').evaluate(el=>el===document.activeElement||el.contains(document.activeElement)));assert.equal(await guided.locator('#kitchenReviewed').isChecked(),false);assert.equal(writes.length,0);
 await guided.goto('https://bobs.test/outlet-plan.html?stage=baseline&outlet=1');await guided.waitForSelector('#bobsCompanion:not([hidden]) [data-guide-choice=current-review]');assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/expenses and mandatory staff/i);

 // Real outlet baseline uses the shared field review, with sticky header and compact reminder.
 await guided.setViewportSize({width:1071,height:580});
 await guided.waitForSelector('[data-field=workingDays]');
 await guided.evaluate(()=>BOBS_REVIEW.request('#flowReviewed'));
 await guided.getByRole('button',{name:'Review each field individually →',exact:true}).click();
 for(let i=0;i<3;i++){
  await guided.waitForFunction(()=>{
   const f=document.querySelector('.bobs-review-field-highlight'),p=document.querySelector('#bobsCompanion'),h=document.querySelector('body > header');
   if(!f||!p)return false;const fr=f.getBoundingClientRect(),pr=p.getBoundingClientRect(),hr=h.getBoundingClientRect();
   return fr.top>=Math.max(0,hr.bottom)&&fr.bottom<innerHeight-68&&fr.right<=pr.left&&document.activeElement===f&&!document.querySelector('[data-review-ui=field]');
  });
  assert.equal(await guided.locator('.guide-current-review strong').innerText(),await guided.locator('#bobsCurrentReviewTitle').innerText());
  if(i===1)console.log('REVIEW_BASELINE_PNG '+(await guided.screenshot()).toString('base64'));
  assert.equal(await guided.locator('.bobs-review-field-highlight').evaluate(n=>getComputedStyle(n).outlineWidth),'3px');
  await guided.locator('main #bobsReviewConfirmField').click();
 }
 await guided.locator('[data-guide-choice=review-choices]').click();await guided.getByRole('button',{name:'Return to page guide',exact:true}).click();assert.equal(writes.length,0);
 await guided.evaluate(()=>BOBS_GUIDE.open());
 // The bot's saved-progress action checks without saving or discarding the baseline draft.
 await guided.waitForSelector('[data-field=workingDays]');await guided.fill('[data-field=workingDays]','29');
 const beforeCheck=guided.url(),beforeWrites=writes.length;
 await guided.locator('[data-other-checks] > summary').click();await guided.click('[data-guide-choice=page-progress]');await guided.waitForFunction(()=>BOBS_ROADMAP.getState().progress.status==='ready');
 assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/does not save your current entries/);assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/You have unsaved changes/);assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/Next incomplete step/);
 assert.equal(await guided.inputValue('[data-field=workingDays]'),'29');assert.equal(guided.url(),beforeCheck);assert.equal(writes.length,beforeWrites);
 await guided.evaluate(()=>{window.__savedProgressRead=BOBS_DATA.jsonp;window.__savedProgressTimer=window.setTimeout;BOBS_DATA.jsonp=()=>new Promise(()=>{});window.setTimeout=(fn,ms,...args)=>window.__savedProgressTimer(fn,ms===45000?250:ms,...args)});
 await guided.click('[data-guide-choice=refresh]');await guided.waitForFunction(()=>BOBS_ROADMAP.getState().progress.status==='error');assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/45 seconds/);assert.equal(await guided.locator('#bobsGuideDialogue a').count(),0);
 assert.equal(await guided.inputValue('[data-field=workingDays]'),'29');assert.equal(writes.length,beforeWrites);
 await guided.evaluate(()=>{BOBS_DATA.jsonp=window.__savedProgressRead;window.setTimeout=window.__savedProgressTimer});
 await guided.click('[data-guide-choice=refresh]');await guided.waitForFunction(()=>BOBS_ROADMAP.getState().progress.status==='ready');assert.match(await guided.locator('#bobsGuideDialogue').innerText(),/Next incomplete step/);
 await guided.setViewportSize({width:1071,height:580});assert.equal(await guided.locator('#bobsCompanion').evaluate(el=>el.scrollTop),0,'Retry should reveal the explanation at the top');console.log('BOBS_PROGRESS_GUIDE:'+(await guided.screenshot({type:'jpeg',quality:65})).toString('base64'));
 await guided.click('[data-guide-choice=resume-edit]');assert(await guided.locator('#bobsCompanion').isVisible());assert.equal(await guided.inputValue('[data-field=workingDays]'),'29');
 await guided.setViewportSize({width:390,height:844});assert(await guided.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const guideBox=await guided.locator('#bobsCompanion').boundingBox();assert(guideBox.x>=0&&guideBox.x+guideBox.width<=390&&guideBox.y>=0&&guideBox.y+guideBox.height<=844);
 await guided.goto('https://bobs.test/outlets.html');await guided.click('#fresh');await guided.waitForSelector('#bobsCompanion:not([hidden]) [data-guide-choice=outlet-fields]');assert.equal(await guided.locator('#cards .id').inputValue(),'3');assert.equal(outletRows.length,2);assert.equal(writes.length,0);
 failOutletRead=true;await guided.goto('https://bobs.test/outlets.html');await guided.waitForFunction(()=>document.querySelector('#modalTitle').textContent==='Unable to verify saved outlet records');assert(await guided.locator('#bobsCompanion').isHidden());assert.equal(await guided.locator('#freshEmpty').count(),0);assert.equal(writes.length,0);failOutletRead=false;await guided.close();
 console.log('PASS guided index entry, saved/new choices, page-aware continuation, mobile bounds, minimise, read-failure gate and zero automatic writes.');
 // Setup and staff use Vault even when the legacy endpoint has different times.
 await p.goto('https://bobs.test/outlets.html');await p.click('#keep');
 await p.waitForSelector('.bobs-shift-start');
 assert.equal(legacyReads,0);
 const controlIds=await p.locator('.bobs-shift-start,.bobs-shift-duration').evaluateAll(nodes=>nodes.map(n=>n.id));
 assert(controlIds.every(Boolean));assert.equal(new Set(controlIds).size,controlIds.length);
 assert.equal(await p.locator('.st[data-i="0"][data-j="0"]').inputValue(),'04:30');
 assert.equal(await p.locator('.st[data-i="0"][data-j="1"]').inputValue(),'13:30');
 assert.equal(writes.length,0);
 const row=p.locator('#cards .shift').first(),other=JSON.stringify(outletRows[1].data);
 await row.locator('.bobs-shift-start').selectOption('05:00');
 await row.locator('.bobs-shift-duration').fill('7.5');await row.locator('.bobs-shift-duration').press('Tab');
 await p.waitForTimeout(1100); // Include every legacy delayed restore, not only the immediate DOM result.
 assert.equal(await row.locator('.en').inputValue(),'12:30');
 assert.equal(await p.locator('#cards .shift').nth(1).locator('.bobs-shift-start').inputValue(),'13:30');
 assert.equal(await p.locator('#cards .shift').nth(2).locator('.bobs-shift-duration').inputValue(),'6');
 assert.equal(await p.locator('.st[data-i="0"][data-j="1"]').inputValue(),'13:30');
 assert.equal(await p.locator('.st[data-i="1"][data-j="0"]').inputValue(),'06:00');
 await p.click('#save');assert.match(await p.locator('#status').innerText(),/tick the confirmation/);assert.equal(writes.length,0);assert.equal(await p.evaluate(()=>document.activeElement.id),'status');await review(p.locator('#outletsReviewed'));await p.click('#save');await p.waitForURL('**/kitchen-flow.html?**');
 assert(writes.includes('OUTLET_SETUP_BACKUPS'));
 assert.deepEqual(outletRows[0].data.shiftTimes,[{start:'05:00',end:'12:30',name:'Early Morning'},{start:'13:30',end:'22:30'}]);
 const savedOther={...outletRows[1].data};delete savedOther._bobsMeta;assert.deepEqual(savedOther,JSON.parse(other));
 assert.equal(legacyReads,0);
 await p.goto('https://bobs.test/outlets.html');await p.click('#keep');
 assert.equal(await p.locator('.st').first().inputValue(),'05:00');
 await p.goto('https://bobs.test/outlet-plan.html?stage=baseline&outlet=1');await p.waitForSelector('#plan-Mandatory1-shift');
 assert.deepEqual(await p.locator('#plan-Mandatory1-shift option').allTextContents(),['Shift 1 · 05:00–12:30','Shift 2 · 13:30–22:30']);
 // A failed authoritative read must not fall back to stale records or permit a fresh setup.
 failOutletRead=true;await p.goto('https://bobs.test/outlets.html');await p.waitForFunction(()=>document.querySelector('#modalTitle').textContent==='Unable to verify saved outlet records');
 assert.equal(await p.locator('#freshEmpty').count(),0);assert.equal(await p.locator('#cards .shift').count(),0);assert.equal(legacyReads,0);
 failOutletRead=false;outletRows=JSON.parse(JSON.stringify(originalOutlets));writes.length=0;
 console.log('PASS outlet times: authoritative-source agreement, independent editable rows, protected save/reopen and staff propagation; failed read never substitutes stale times. No live writes.');
 await p.goto('https://bobs.test/outlet-plan.html?stage=baseline&outlet=1&from=outlet-setup&outlets=1%2C2');await p.waitForSelector('#flowSave');
 assert.equal(await p.evaluate(()=>window.BOBS_OWNED_EDITOR),true);assert.equal(await p.evaluate(()=>!!window.__BOBS_TRANSITION_GUARD__),false);assert.equal(writes.length,0);
 await review(p.locator('#flowReviewed'));await p.click('#flowSave');assert.match(await p.locator('#flowActionStatus').innerText(),/Untick.*No paid mandatory staff/);assert.equal(await p.evaluate(()=>document.activeElement.id),'flowActionStatus');assert.equal(writes.length,0);assert.equal(await p.inputValue('[data-field=takeHome]'),'15000');assert.equal(await p.locator('#mandatoryPositions [data-position]').count(),1);
 const box=await p.locator('#flowActionStatus').boundingBox();assert(box.y>=0&&box.y+box.height<=580,'Save error must be visible in the user viewport');
 const screenshot=async name=>{if(process.env.BOBS_SAVE_HELP_SCREENSHOTS){fs.mkdirSync(process.env.BOBS_SAVE_HELP_SCREENSHOTS,{recursive:true});await p.screenshot({path:path.join(process.env.BOBS_SAVE_HELP_SCREENSHOTS,name+'.png')})}};await screenshot('outlet-save-error');
 const owner=p.locator('[data-flow-help=owner]').first();await owner.click();assert.match(await p.locator('#flowHelpBody').innerText(),/personally handle/);assert.match(await p.locator('#flowHelpTitle').innerText(),/04:30/);await p.keyboard.press('Escape');assert.equal(await p.locator('#flowHelpDialog').evaluate(el=>el.open),false);assert.equal(await owner.evaluate(el=>el===document.activeElement),true);
 await p.uncheck('#noCounter');assert(await p.locator('#noCounter').isDisabled());assert.equal(await p.locator('#flowReviewed').isChecked(),false);await p.uncheck('#ownerCounterShift0');await review(p.locator('#flowReviewed'));await p.fill('[data-field=workingDays]','29');await p.waitForTimeout(1100);assert.equal(await p.locator('#flowReviewed').isChecked(),false,'Editing must invalidate review after the old restoration delay');
 await p.click('#flowSave');assert.match(await p.locator('#flowActionStatus').innerText(),/final confirmation/);assert.equal(writes.length,0);await review(p.locator('#flowReviewed'));await p.click('#flowSave');await p.waitForURL('**/outlet-plan.html?outlet=2&**');assert.equal(db['1/OUTLET_BASELINE/default'].positions[0].takeHome,15000);assert.equal(db['1/OUTLET_BASELINE/default'].positions.length,1);assert.equal(db['1/OUTLET_BASELINE/default'].noCounter,false);assert.deepEqual(db['1/OUTLET_BASELINE/default'].ownerCounterShifts,[1]);assert(db['1/OUTLET_BASELINE/default'].saveToken);assert(writes.includes('OUTLET_BASELINE_BACKUPS'));
 await p.waitForSelector('#flowSave');await p.fill('[data-field=workingDays]','31');await review(p.locator('#noCounter'));assert.equal(await p.locator('.ownerCounterShift:checked:disabled').count(),2);await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('[data-flow-help=noPaid]').click();assert.match(await p.locator('#flowHelpBody').innerText(),/zero paid mandatory/);assert.match(await p.locator('#flowHelpBody').innerText(),/Production or delivery/);const dialog=await p.locator('#flowHelpDialog').boundingBox();assert(dialog.width<=390&&dialog.height<=844);await screenshot('outlet-coverage-help-mobile');await p.click('#flowHelpClose');await p.locator('[data-flow-help=review]').click();assert.match(await p.locator('#flowHelpBody').innerText(),/does not save/);await p.click('#flowHelpClose');
 await review(p.locator('#flowReviewed'));await p.click('#flowSave');await p.waitForURL('**/outlet-method-flow.html?**');assert.equal(db['2/OUTLET_BASELINE/default'].positions.length,0);assert.equal(db['2/OUTLET_BASELINE/default'].noCounter,true);assert.deepEqual(db['2/OUTLET_BASELINE/default'].ownerCounterShifts,[0,1]);assert.equal(new URL(p.url()).searchParams.get('outlets'),'1,2');assert.equal(errors.length,0,errors.join('; '));
 console.log('PASS outlet Save: visible conflict, retained paid salary, keyboard help, review invalidation, verified backup/save/forward to next outlet, owner-only save, mobile fit, zero runtime errors; intercepted fixtures only.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
