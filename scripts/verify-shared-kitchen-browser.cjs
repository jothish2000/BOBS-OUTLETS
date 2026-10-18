/* Real page scripts against an isolated Google fixture; never writes live business records. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),G=require('../recipe-market-google-store.js'),root=path.resolve(__dirname,'..');
const date=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),id='Kitchen-Elimedu',key='Breakfast Catalogue::0',shiftTimes=[{start:'04:30',end:'13:30'}],recipe={name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',1,'kg',60]],productionTiming:{role:'Cook',equipment:'Steamer',setupMin:10,activeMinPerCycle:5,machineMinPerCycle:15,finishMinPerCycle:5,cleanupMin:10}},norms={...require('../tests/fixtures/thp-norms.json'),payrollRules:require('../tests/fixtures/payroll-rules.json')},db={
 'COMPANY/KITCHEN_MASTER/default':{schema:1,reviewed:true,kitchens:[{id,name:'Elimedu shop kitchen',outletId:'3',status:'operating',shiftTimes}]},
 'COMPANY/BOBS_STANDARD_RECIPE/ACTIVE_V1':G.manifest('standard',['test-chunk'],'kitchen',1),
 'COMPANY/BOBS_STANDARD_RECIPE/test-chunk':G.chunkData('standard',[recipe],'kitchen',0,1),
 'COMPANY/STAFF_MASTER/default':{staff:[{staffId:'E1',name:'Kitchen cook',monthlyCtc:31000}]},
 'COMPANY/HR_OUTLET_ALLOCATION/default':{allocations:{E1:{'1':0,'2':0,'3':0,[id]:100}}},
 'COMPANY/THP_NORMS/default':norms,
 [id+'/ASSET_MASTER/default']:{assets:[{id:'S',name:'Idli steamer',quantity:1,ownedQty:1,unitCost:30000,residual:0,usefulYears:10,annualDays:300,costConfirmed:true,uses:{},unallocatedReason:''}]},
 [id+'/OUTLET_BASELINE/default']:{reviewed:true,positions:[],noCounter:true,workingDays:30,shiftStamp:require('../bobs-outlet-flow-core.js').stamp(shiftTimes)},[id+'/FIXED_EXPENSES/default']:{expenses:[]}
};
for(const [outlet,qty] of [['1',360],['2',180]])db[outlet+'/METHOD2/default']={itemEditors:{[key]:{mode:'production',unit:'piece',batchSize:qty,batches:1,sold:100,soldConfirmed:true,price:10,condiments:[],packaging:[]}},kitchenSources:{[key]:{kitchenId:id,shared:true,group:'Breakfast-Idli',date,readyBy:'10:00',away:false}}};
(async()=>{const browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true});try{const ctx=await browser.newContext({viewport:{width:1280,height:900}}),errors=[],writes=[];ctx.setDefaultTimeout(60000);ctx.setDefaultNavigationTimeout(120000);await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='bobs.test'){const file=path.join(root,decodeURIComponent(u.pathname.slice(1)));return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:'missing'});}if(u.hostname!=='script.google.com')return route.abort();if(req.method()==='POST'){const b=JSON.parse(req.postData());writes.push(b.outletId+'/'+b.module);db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return route.fulfill({body:'ok'});}const record=u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey'),data=u.searchParams.get('action')==='outletList'?{ok:true,outlets:[['1','Rasipuram'],['2','Gurusamypalayam'],['3','Elimedu']].map(([outletId,outletName])=>({outletId,outletName,data:{shiftTimes}}))}:{ok:true,found:record in db,data:db[record]??null};return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify(data)+')'});});const p=await ctx.newPage();p.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});p.on('dialog',d=>d.accept());
 console.log('Opening next fixture page');await p.goto('https://bobs.test/kitchen-flow.html?stage=locations');await p.waitForFunction(()=>{const t=document.querySelector('#kitchenStatus').textContent;if(t.startsWith('Could not load'))throw Error(t);return document.querySelector('#saveKitchen')?.disabled===false;});assert.match(await p.locator('#locationRows').innerText(),/Elimedu shop kitchen/);assert.equal(writes.length,0);

 // Kitchen time selectors: isolated fixture saves only; retain exact HH:MM and split shifts.
 const originalKitchen=JSON.parse(JSON.stringify(db['COMPANY/KITCHEN_MASTER/default']));
 const setTime=async(row,side,hour,minute,period)=>{const box=row.locator('[data-shift-'+side+']');await box.locator('[data-time-part=hour]').selectOption(hour);await box.locator('[data-time-part=minute]').selectOption(minute);await box.locator('[data-time-part=period]').selectOption(period);};
 const saveLocations=async()=>{await p.check('#kitchenReviewed');await p.click('#saveKitchen');await p.waitForFunction(()=>{const t=document.querySelector('#kitchenStatus').textContent;if(t.startsWith('Not saved:'))throw Error(t);return t.includes('saved and verified');});};
 const reloadLocations=async()=>{await p.reload();await p.waitForFunction(()=>document.querySelector('#saveKitchen')?.disabled===false);};
 assert.equal(await p.locator('textarea[data-field=shifts]').count(),0);
 const firstShift=p.locator('[data-kitchen-shift]').first();
 assert.equal(await firstShift.locator('[data-shift-start] [data-time-part=hour]').inputValue(),'04');
 assert.equal(await firstShift.locator('[data-shift-start] [data-time-part=minute]').inputValue(),'30');
 assert.equal(await firstShift.locator('[data-shift-start] [data-time-part=period]').inputValue(),'AM');
 assert.equal(await firstShift.locator('[data-shift-end] [data-time-part=hour]').inputValue(),'01');
 assert.equal(await firstShift.locator('[data-shift-end] [data-time-part=period]').inputValue(),'PM');
 await p.fill('[data-field=name]','Elimedu split-shift fixture');
 await p.check('#kitchenReviewed');await p.click('[data-add-shift]');
 assert.equal(await p.isChecked('#kitchenReviewed'),false);
 assert.equal(await p.inputValue('[data-field=name]'),'Elimedu split-shift fixture');
 assert.equal(await p.locator('[data-kitchen-shift]').count(),2);
 const writesBeforeIncomplete=writes.length;
 await p.check('#kitchenReviewed');await p.click('#saveKitchen');
 await p.waitForFunction(()=>document.querySelector('#kitchenStatus').textContent.startsWith('Not saved:'));
 assert.match(await p.locator('#kitchenStatus').innerText(),/complete shift start and end/);
 assert.equal(writes.length,writesBeforeIncomplete);
 const secondShift=p.locator('[data-kitchen-shift]').nth(1);
 await setTime(secondShift,'start','03','00','PM');await setTime(secondShift,'end','06','30','PM');
 await saveLocations();
 assert.deepEqual(db['COMPANY/KITCHEN_MASTER/default'].kitchens[0].shiftTimes,[{start:'04:30',end:'13:30'},{start:'15:00',end:'18:30'}]);
 assert(writes.includes('COMPANY/KITCHEN_MASTER_BACKUPS'));
 await reloadLocations();assert.equal(await p.locator('[data-kitchen-shift]').count(),2);
 assert.equal(await p.locator('[data-kitchen-shift]').nth(1).locator('[data-shift-start] [data-time-part=hour]').inputValue(),'03');
 assert.equal(await p.locator('[data-kitchen-shift]').nth(1).locator('[data-shift-end] [data-time-part=period]').inputValue(),'PM');
 // Existing exact minutes and extra shift metadata survive a render and an unchanged save.
 db['COMPANY/KITCHEN_MASTER/default'].kitchens[0].shiftTimes[0]={start:'00:07',end:'12:53',name:'Exact saved minutes'};
 await reloadLocations();
 assert.equal(await firstShift.locator('[data-shift-start] [data-time-part=hour]').inputValue(),'12');
 assert.equal(await firstShift.locator('[data-shift-start] [data-time-part=period]').inputValue(),'AM');
 assert.equal(await firstShift.locator('[data-shift-end] [data-time-part=hour]').inputValue(),'12');
 assert.equal(await firstShift.locator('[data-shift-end] [data-time-part=period]').inputValue(),'PM');
 await saveLocations();
 assert.deepEqual(db['COMPANY/KITCHEN_MASTER/default'].kitchens[0].shiftTimes[0],{start:'00:07',end:'12:53',name:'Exact saved minutes'});
 await p.check('#kitchenReviewed');await p.click('[data-remove-shift="1"]');assert.equal(await p.isChecked('#kitchenReviewed'),false);
 assert.equal(await p.locator('[data-kitchen-shift]').count(),1);
 assert(await p.locator('[data-remove-shift="0"]').isDisabled());
 await saveLocations();await reloadLocations();
 assert.equal(db['COMPANY/KITCHEN_MASTER/default'].kitchens[0].shiftTimes.length,1);
 await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 // Adding another identity must preserve unsaved fields on the first one.
 await p.fill('[data-field=name]','Unsaved name retained');await p.click('#addKitchen');
 assert.equal(await p.locator('[data-field=name]').first().inputValue(),'Unsaved name retained');
 assert.equal(await p.locator('[data-kitchen]').nth(1).locator('[data-time-part=hour]').first().inputValue(),'');
 assert.equal(await p.locator('[data-kitchen]').nth(1).locator('[data-time-part=minute]').first().inputValue(),'');
 await p.setViewportSize({width:1280,height:900});
 db['COMPANY/KITCHEN_MASTER/default']=originalKitchen; // Restore our fixture before the existing production journey.
 console.log('PASS kitchen shift dropdowns: split shifts, backup/readback, exact minutes, noon/midnight, metadata, incomplete-save guard, add/remove, unsaved fields and mobile.');

 console.log('Opening next fixture page');await p.goto('https://bobs.test/kitchen-flow.html?stage=demand&outlet=2');await p.waitForFunction(()=>{const t=document.querySelector('#kitchenStatus').textContent;if(t.startsWith('Could not load'))throw Error(t);return document.querySelector('#saveKitchen')?.disabled===false;});assert.match(await p.locator('[data-demand]').innerText(),/180 piece/);await p.check('#kitchenReviewed');await p.click('#saveKitchen');await p.waitForFunction(()=>document.querySelector('#kitchenStatus').textContent.includes('read back'));assert(writes.includes('2/METHOD2_BACKUPS'));assert.equal(db['2/METHOD2/default'].itemEditors[key].batchSize,180);
 console.log('Opening next fixture page');await p.goto('https://bobs.test/production-plan.html?outlet='+id);await p.waitForFunction(()=>document.querySelector('#plannerFields')?.disabled===false);assert.equal(await p.inputValue('#intendedQuantity'),'540');assert(await p.locator('#intendedQuantity').isDisabled());assert.equal(await p.locator('.equipment-help').first().evaluate(e=>e.open),false);await p.fill('.process-capacity','120');await p.check('[data-slot="S#1"]');await p.fill('#readyBy','10:00');await p.fill('[data-field=deadline]','10:00');await p.fill('[data-field=supervision]','0');await p.check('#capacityReviewed');await p.check('#recipeReviewed');await p.check('[data-field=reviewed]');await p.click('#assessTime');assert.match(await p.locator('#timeAssessment').innerText(),/5/);await p.click('#saveProductionPlan');await p.waitForURL('**/outlet-plan.html?*');assert.equal(db['1/METHOD2/default'].itemEditors[key].batchSize,360);assert.equal(db['2/METHOD2/default'].itemEditors[key].batchSize,180);assert(!writes.includes(id+'/METHOD2'));
 await p.waitForSelector('#proposeStaff');await p.click('#proposeStaff');await p.check('#dutiesComplete');await p.check('#flowReviewed');await p.click('#flowSave');await p.waitForURL('**stage=salary*');await p.waitForSelector('[data-field=staffId]');await p.selectOption('[data-field=staffId]','E1');await p.check('#flowReviewed');await p.click('#flowSave');await p.waitForURL('**/kitchen-flow.html?*');
 console.log('Opening next fixture page');await p.goto('https://bobs.test/asset-master.html?outlet='+id);await p.waitForFunction(()=>{const t=document.querySelector('#planningStatus').textContent;if(t.startsWith('Incomplete'))throw Error(t);return document.querySelector('#planningFields')?.disabled===false;});const share=p.locator('[data-item]').first();await share.locator('input[type=checkbox]').check();await share.locator('input[type=number]').fill('100');await p.check('#planningReviewed');await p.click('#planningSave');await p.waitForFunction(()=>document.querySelector('#planningStatus').textContent.includes('verified'));
 console.log('Opening next fixture page');await p.goto('https://bobs.test/kitchen-flow.html?stage=cost&outlet='+id);await p.waitForFunction(()=>{const t=document.querySelector('#kitchenStatus').textContent;if(t.startsWith('Could not load'))throw Error(t);return document.querySelector('#saveKitchen')?.disabled===false;});await p.check('[data-field=productionOnlyConfirmed]');await p.check('#kitchenReviewed');await p.click('#saveKitchen');await p.waitForFunction(()=>{const text=document.querySelector('#kitchenStatus').textContent;if(text.startsWith('Not saved:'))throw Error(text);return text.includes('saved and verified');});const result=db[id+'/KITCHEN_COST_PLAN/'+date].result;assert.equal(Object.values(result.deliveries).reduce((n,r)=>n+r.labour,0),1000);assert(Math.abs(result.deliveries['1|'+key].labour/360-result.deliveries['2|'+key].labour/180)<1e-9);assert.equal(Object.values(result.deliveries).reduce((n,r)=>n+r.depreciation,0),10);
 await p.click('#bobsRoadmapToggle');await p.waitForFunction(()=>document.querySelector('#bobsRoadmapStatus').textContent.includes('Saved progress checked'));assert.match(await p.locator('#bobsRoadmapContent').innerText(),/shared production/);await p.getByRole('button',{name:'Close BOBS roadmap',exact:true}).click();await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);console.log('PASS shared kitchen browser: protected assignment,540 output, five cycles, existing worker, shared asset, salary/depreciation splits, verified roadmap and mobile. No live data writes.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
