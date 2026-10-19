/* All network requests intercepted: writes touch this fixture only. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),root=path.resolve(__dirname,'..');
const clone=x=>JSON.parse(JSON.stringify(x)),id='Kitchen-Elimedu',db={},writes=[],errors=[],shifts=[{start:'04:30',end:'13:30'},{start:'15:00',end:'18:30'}];
const register={reviewed:true,kitchens:[{id,name:'Elimedu kitchen',status:'operating',outletId:'3',shiftTimes:shifts}]};
let failAssetSave=false,failRegisterRead=false,slowKitchenSave=false,failKitchenSave=false;
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const ctx=await browser.newContext({viewport:{width:1071,height:580}});ctx.setDefaultTimeout(30000);ctx.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());});
await ctx.route('**/*',async r=>{const req=r.request(),u=new URL(req.url());if(u.hostname==='bobs.test'){const f=path.join(root,decodeURIComponent(u.pathname.slice(1)));return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:'missing'});}if(u.hostname!=='script.google.com')return r.abort();
if(req.method()==='POST'){const b=JSON.parse(req.postData());if(b.action==='snapshot')return r.fulfill({body:'ok'});writes.push(b.module);if(b.module==='KITCHEN_MASTER'){if(slowKitchenSave)await new Promise(resolve=>setTimeout(resolve,600));if(failKitchenSave)return r.abort();}if(b.module==='ASSET_MASTER'&&failAssetSave)return r.abort();db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return r.fulfill({body:'ok'});}
const key=u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey'),data=u.searchParams.get('action')==='outletList'?{ok:true,outlets:['1','2','3'].map(outletId=>({outletId,outletName:'Shop '+outletId,data:{shiftTimes:shifts}}))}:failRegisterRead&&u.searchParams.get('module')==='KITCHEN_MASTER'?{ok:false,error:'fixture register unavailable'}:{ok:true,found:key in db,data:db[key]??null};return r.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify(data)+')'});});
const p=await ctx.newPage();
await p.goto('https://bobs.test/kitchen-flow.html?stage=locations&outlets=1,2,3');await p.waitForFunction(()=>!document.getElementById('saveKitchen').disabled);
assert(await p.locator('#bobsFlowGuide').isVisible());assert.match(await p.locator('#bobsFlowGuide').innerText(),/Outlet expenses/);
await p.locator('#bobsFlowGuide button').first().click();assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenReviewed');
await p.check('#kitchenReviewed');await p.click('#saveKitchen');await p.waitForFunction(()=>document.getElementById('kitchenStatus').textContent.startsWith('Not saved:'));
assert.equal(writes.length,0);assert.match(await p.locator('#kitchenStatus').innerText(),/add a kitchen|separate kitchen/i);assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenStatus');
await p.check('#noSeparateKitchens');await p.check('#kitchenReviewed');await p.click('#saveKitchen');await p.waitForSelector('#kitchenNextGo');assert.equal(db['COMPANY/KITCHEN_MASTER/default'].noSeparateKitchens,true);assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenNext-baseline');assert(await p.locator('#kitchenNextGo').isDisabled());assert.equal(await p.locator('#kitchenNext-equipment').count(),0);await p.check('#kitchenNext-baseline');assert(await p.locator('.kitchen-choice-selected').isVisible());assert(await p.locator('#kitchenNextGo').isEnabled());
await p.click('#addKitchen');assert.equal(await p.locator('#kitchenNextGo').count(),0);assert(await p.locator('#kitchenNextPreview').isVisible());assert.equal(await p.locator('#kitchenReviewed').isChecked(),false);
// Direct method entry cannot skip an unreviewed/missing kitchen register.
delete db['COMPANY/KITCHEN_MASTER/default'];await p.goto('https://bobs.test/outlet-method-flow.html?outlet=0&outlets=1,2,3');await p.waitForFunction(()=>document.getElementById('baselineGate').textContent.includes('Cannot continue'));
assert(await p.locator('#method1Btn').isDisabled());assert(await p.locator('#method2Btn').isDisabled());assert.match(await p.locator('#baselineGate').innerText(),/Kitchen Setup/);
// Saved-register reload exposes the choices without another write; choosing is not a save.
db['COMPANY/KITCHEN_MASTER/default']=clone(register);writes.length=0;
const kitchenUrl='https://bobs.test/kitchen-flow.html?stage=locations&outlet=3&outlets=3%2C1%2C2';
await p.goto(kitchenUrl);await p.waitForSelector('#kitchenNextGo');
assert.equal(writes.length,0);assert(await p.locator('.kitchen-saved-check').isVisible());
assert(await p.locator('#kitchenNextGo').isDisabled());assert.equal(await p.locator('.kitchen-choice-selected:visible').count(),0);
assert.equal(await p.locator('#kitchenReviewed').isChecked(),false);
await p.click('#saveKitchen');
await p.waitForTimeout(1200);
assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenNext-equipment','Reopened verified setup must focus next choices, not the top status');
assert.equal(writes.length,0,'Continuing unchanged verified setup must not write again');
const choiceBounds=await p.locator('.kitchen-next-choices').boundingBox();
assert(choiceBounds.y>=50&&choiceBounds.y<160,'Next choices must settle below the fixed progress control');
assert(choiceBounds.y+choiceBounds.height<=580,'Both laptop choice cards must be in the viewport');
console.log('PASS reopened verified setup keeps next choices in view without another save');

assert.match(await p.locator('.kitchen-next-choice.equipment').innerText(),/OPTIONAL NOW[\s\S]*reference help[\s\S]*later/);
// Edited forms still require review; the reminder must stay beside Save, not at the page top.
await p.fill('[data-field=name]','Elimedu kitchen reviewed');await p.click('#saveKitchen');
assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenReviewed');
assert.match(await p.locator('#kitchenSaveHint').innerText(),/Tick the review checkbox/);assert.equal(writes.length,0);assert.equal(await p.locator('#kitchenNextGo').count(),0);
await p.check('#kitchenReviewed');failKitchenSave=true;await p.click('#saveKitchen');await p.waitForFunction(()=>document.getElementById('kitchenStatus').textContent.startsWith('Not saved:'));
assert.equal(await p.locator('#kitchenNextGo').count(),0);assert.equal(db['COMPANY/KITCHEN_MASTER/default'].kitchens[0].name,'Elimedu kitchen');failKitchenSave=false;slowKitchenSave=true;
await p.click('#saveKitchen');await p.waitForFunction(()=>document.activeElement.id==='kitchenNext-equipment');slowKitchenSave=false;
await p.waitForTimeout(1500);
assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenNext-equipment','Delayed save completion must not reclaim focus at the top');
const settled=await p.locator('.kitchen-next-choices').boundingBox();assert(settled.y>=50&&settled.y<160);assert(settled.y+settled.height<=580);assert(await p.locator('#saveKitchen').isEnabled());
console.log('BOBS_KITCHEN_SAVE_FOCUS:'+(await p.screenshot({type:'jpeg',quality:75})).toString('base64'));
const afterSaveWrites=writes.length;
// A later user choice is respected; there is no ongoing focus/scroll lock.
await p.check('#kitchenNext-baseline');await p.waitForTimeout(1200);assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenNext-baseline');
await p.locator('#kitchenNext-equipment').focus();
assert.equal(await p.locator('.kitchen-next-choice.equipment').evaluate(el=>getComputedStyle(el).outlineWidth),'4px');
assert.equal(await p.locator('.kitchen-next-choice.equipment').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 240, 181)');
await p.check('#kitchenNext-equipment');assert.equal(await p.locator('.kitchen-choice-selected:visible').count(),1);
await p.click('#bobsRoadmapToggle');assert(await p.getByText('This page has unsaved edits. Ticks below describe the saved version.',{exact:true}).isHidden());await p.getByRole('button',{name:'Close BOBS roadmap',exact:true}).click();
assert(await p.locator('#kitchenNextEquipment').isVisible());assert.match(await p.locator('#kitchenNextGo').innerText(),/Open existing equipment/);
await p.locator('.kitchen-next-panel').scrollIntoViewIfNeeded();console.log('BOBS_KITCHEN_NEXT_DESKTOP:'+(await p.screenshot({type:'jpeg',quality:75})).toString('base64'));
await p.setViewportSize({width:390,height:844});await p.uncheck('#kitchenReviewed');await p.click('#saveKitchen');await p.waitForTimeout(1200);assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenNext-equipment');assert.equal(writes.length,afterSaveWrites);const mobileChoice=await p.locator('.kitchen-next-choice.equipment').boundingBox();assert(mobileChoice.y>=50&&mobileChoice.y<160);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
console.log('BOBS_KITCHEN_NEXT_MOBILE:'+(await p.locator('.kitchen-next-panel').screenshot({type:'jpeg',quality:70})).toString('base64'));
await p.setViewportSize({width:1071,height:580});
await p.check('#kitchenNext-baseline');assert.equal(await p.locator('.kitchen-choice-selected:visible').count(),1);assert(await p.locator('#kitchenNextEquipment').isHidden());
assert.equal(writes.length,afterSaveWrites);assert.deepEqual(db['COMPANY/KITCHEN_MASTER/default'].kitchens[0].shiftTimes,shifts);
await p.click('#kitchenNextGo');await p.waitForURL('**/outlet-plan.html?*');assert.equal(new URL(p.url()).searchParams.get('outlet'),'3');assert.equal(new URL(p.url()).searchParams.get('outlets'),'3,1,2');
await p.goto(kitchenUrl);await p.waitForSelector('#kitchenNextGo');await p.locator('#kitchenNext-equipment').focus();await p.keyboard.press('Space');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'kitchenNextOwner');
await p.click('#kitchenNextGo');await p.waitForURL('**/kitchen-equipment.html?*');assert.equal(new URL(p.url()).searchParams.get('returnTo'),kitchenUrl);
await p.waitForFunction(()=>!document.getElementById('equipmentEditor').disabled);assert.equal(await p.locator('header a').getAttribute('href'),kitchenUrl);
// Dirty fields and failed Google reads cannot retain a saved continuation.
await p.goto(kitchenUrl);await p.waitForSelector('#kitchenNextGo');await p.fill('[data-field=name]','Edited kitchen');assert.equal(await p.locator('#kitchenNextGo').count(),0);assert(await p.locator('#kitchenNextPreview').isVisible());
failRegisterRead=true;await p.reload();await p.waitForFunction(()=>!document.getElementById('kitchenRetry').hidden);assert.equal(await p.locator('#kitchenNextGo').count(),0);assert(await p.locator('#saveKitchen').isDisabled());failRegisterRead=false;
// Inventory loads saved assets, preserves ownership/financials and saves unknown/estimated values honestly.
db['COMPANY/KITCHEN_MASTER/default']=clone(register);
const old={reviewed:true,assets:[{id:'S',name:'Old steamer',quantity:2,ownedQty:1,unitCost:30000,residual:1000,usefulYears:10,annualDays:300,costConfirmed:true,uses:{Idli:100},custom:'preserve'}]};db[id+'/ASSET_MASTER/default']=clone(old);writes.length=0;
await p.goto('https://bobs.test/kitchen-equipment.html?'+new URLSearchParams({outlet:id,returnTo:kitchenUrl}));await p.waitForFunction(()=>!document.getElementById('equipmentEditor').disabled);
assert.equal(await p.locator('header a').evaluate(el=>getComputedStyle(el).color),'rgb(255, 243, 208)');assert.equal(writes.length,0);assert.equal(await p.locator('[data-field=status]').inputValue(),'unknown');assert.equal(await p.locator('[data-field=value]').inputValue(),'');
await p.locator('summary').filter({hasText:'I need help'}).click();await p.selectOption('.referenceType','0');await p.selectOption('.referenceChoice','1');await p.click('.applyReference');
assert.equal(await p.locator('[data-field=value]').inputValue(),'120');assert.equal(await p.locator('[data-field=status]').inputValue(),'estimate');assert.equal(await p.locator('#equipmentReviewed').isChecked(),false);
await p.selectOption('[data-field=status]','confirmed');await p.check('#equipmentReviewed');await p.click('#saveEquipment');assert.match(await p.locator('#equipmentStatus').innerText(),/specification or trial/);assert.equal(writes.length,0);
await p.selectOption('[data-field=status]','estimate');await p.check('#equipmentReviewed');failAssetSave=true;await p.click('#saveEquipment');await p.waitForFunction(()=>document.getElementById('equipmentStatus').textContent.startsWith('Not saved:'));assert.equal(await p.locator('#equipmentNext a').count(),0);assert.equal(await p.locator('[data-field=value]').inputValue(),'120');assert.equal(await p.evaluate(()=>document.activeElement.id),'equipmentStatus');
failAssetSave=false;await p.click('#saveEquipment');await p.waitForSelector('#equipmentNext a');const saved=db[id+'/ASSET_MASTER/default'];assert.equal(saved.assets.length,1);assert.equal(saved.assets[0].id,'S');assert.equal(saved.assets[0].quantity,2);assert.equal(saved.reviewed,false);assert.equal(saved.assets[0].capacityFacts.status,'estimate');for(const key of ['unitCost','residual','usefulYears','annualDays','costConfirmed','uses','custom'])assert.deepEqual(saved.assets[0][key],old.assets[0][key]);assert(writes.includes('ASSET_MASTER_BACKUPS'));
assert.deepEqual(db['COMPANY/KITCHEN_MASTER/default'],register);assert.equal(await p.evaluate(()=>document.activeElement.id),'equipmentContinue');assert.match(await p.locator('#equipmentNext').innerText(),/Next: outlet expenses/);assert.equal(new URL(await p.locator('#equipmentContinue').getAttribute('href'),p.url()).searchParams.get('outlets'),'3,1,2');assert.equal(await p.locator('#equipmentNext a').last().getAttribute('href'),kitchenUrl);
await p.reload();await p.waitForFunction(()=>!document.getElementById('equipmentEditor').disabled);assert.equal(await p.locator('[data-field=value]').inputValue(),'120');assert.equal(await p.locator('[data-field=status]').inputValue(),'estimate');
const writesBeforeConflict=writes.length;db[id+'/ASSET_MASTER/default'].assets[0].unitCost=31000;await p.fill('[data-field=value]','180');await p.check('#equipmentReviewed');await p.click('#saveEquipment');await p.waitForFunction(()=>document.getElementById('equipmentStatus').textContent.includes('changed elsewhere'));assert.equal(writes.length,writesBeforeConflict);assert.equal(await p.locator('#equipmentNext a').count(),0);assert.equal(await p.locator('[data-field=value]').inputValue(),'180');assert.equal(db[id+'/ASSET_MASTER/default'].assets[0].capacityFacts.value,'120');await p.reload();await p.waitForFunction(()=>!document.getElementById('equipmentEditor').disabled);
await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert(await p.locator('#bobsFlowGuide').isVisible());
await p.locator('#bobsFlowGuide button').first().click();assert.equal(await p.evaluate(()=>document.activeElement.id),'equipmentReviewed');
await p.evaluate(()=>scrollTo(0,0));console.log('BOBS_FLOW_PREVIEW:'+(await p.screenshot({type:'jpeg',quality:65})).toString('base64'));
const before=writes.length;failRegisterRead=true;await p.reload();await p.waitForFunction(()=>!document.getElementById('equipmentRetry').hidden);assert(await p.locator('#saveEquipment').isDisabled());assert(await p.locator('#addEquipment').isDisabled());assert.equal(writes.length,before);assert.equal(await p.locator('[data-equipment]').count(),0);
assert.deepEqual(errors,[]);console.log('PASS guided kitchen: visible next action, keyboard focus, explicit empty register, skipped-step gate, estimate/confirmation validation, protected inventory save/reload, failure retention, preserved financials and independent timings, mobile overflow, zero live writes.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
