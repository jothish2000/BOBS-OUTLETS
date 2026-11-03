const review=require('./review-test-helper.cjs');
/* Isolated Google fixture: exercise real scripts, protected writes and reload without live data changes. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),K=require('../recipe-market-google-store.js'),root=path.resolve(__dirname,'..');
const timing={role:'Cook',equipment:'Steamer',setupMin:0,activeMinPerCycle:1,machineMinPerCycle:10,finishMinPerCycle:1,cleanupMin:1};
const recipes=[{name:'Idli',yieldQty:60,yieldUnit:'piece',ingredients:[['Rice',1,'kg',60],['Urad dal',0.25,'kg',100]],productionTiming:timing},{name:'Idli Sambar',yieldQty:9,yieldUnit:'L',ingredients:[['Toor dal',1,'kg',100]],productionTiming:{...timing,equipment:'Stock pot and stove'}},{name:'Coconut Chutney',yieldQty:1,yieldUnit:'kg',ingredients:[['Coconut',500,'g',20]],productionTiming:{...timing,equipment:'Mixer'}}];
const key='Breakfast Catalogue::0',db={'1/METHOD2/default':{itemEditors:{[key]:{mode:'production',unit:'piece',batchSize:120,batches:1,sold:80,soldConfirmed:true,price:10,condiments:[{recipeName:'Idli Sambar',source:'production',portion:50,portionUnit:'ml'},{recipeName:'Coconut Chutney',source:'production',portion:20,portionUnit:'g'}]}}},'1/ASSET_MASTER/default':{assets:[{id:'G',name:'Existing grinder',quantity:1,ownedQty:1}]},'COMPANY/BOBS_STANDARD_RECIPE/ACTIVE_V1':K.manifest('standard',['test-chunk'],'guidance',3),'COMPANY/BOBS_STANDARD_RECIPE/test-chunk':K.chunkData('standard',recipes,'guidance',0,1)};
db['COMPANY/KITCHEN_MASTER/default']={reviewed:true,kitchens:[{id:'Kitchen-Elimedu',name:'Elimedu Production Kitchen',status:'operating',outletId:'',shiftTimes:[{start:'04:30',end:'13:30'}]}],outletDecisions:{'1':{hasKitchen:false}}};
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
 await p.fill('#intendedQuantity','360');await p.fill('#readyBy','07:00');
 await review(p.locator('#quantityReviewed'));await review(p.locator('#sideServingReviewed'));
 assert.equal(await p.locator('#sideExtraYes').isChecked(),false);assert.equal(await p.locator('#sideExtraNo').isChecked(),false);
 await p.locator('[data-guide-choice=extra-no]').click();await p.waitForFunction(()=>BOBS_PRODUCTION_GUIDE.snapshot().journey.stage==='source');
 assert.match(await p.locator('#bobsGuideDialogue').innerText(),/supplying kitchen/);assert(await p.locator('#capacitySection').isHidden());assert.equal(writes.length,0);
 await p.click('#chooseProductionSource');await p.waitForURL('**/kitchen-flow.html?**stage=demand**');await p.waitForFunction(()=>document.getElementById('saveKitchen')?.disabled===false);
 assert.equal(db['1/METHOD2/default'].itemEditors[key].batchSize,360);assert.equal(db['1/METHOD2/default'].itemEditors[key].sold,80);assert.equal(db['1/OUTLET_PRODUCTION_PLAN/default'],undefined);
 assert.equal(await p.locator('[data-demand]').count(),3);assert.equal(await p.locator('[data-field=kitchenId]').first().inputValue(),'');
 await review(p.locator('#kitchenReviewed'));await p.click('#saveKitchen');await p.waitForFunction(()=>document.getElementById('kitchenStatus').textContent.startsWith('Not saved:'));assert.match(await p.locator('#kitchenStatus').innerText(),/Choose an operating production kitchen/);
 for(const row of await p.locator('[data-demand]').all()){await row.locator('[data-field=kitchenId]').selectOption('Kitchen-Elimedu');await row.locator('[data-field=readyBy]').fill('07:00');await review(row.locator('[data-field=away]'));}
 await review(p.locator('#kitchenReviewed'));await p.click('#saveKitchen');await p.waitForFunction(()=>document.getElementById('kitchenStatus').textContent.includes('read back'));
 await p.waitForSelector('#nextAction a');assert.match(await p.locator('#nextAction').innerText(),/Elimedu.*next required action/);
 const saved=db['1/METHOD2/default'];assert.equal(Object.keys(saved.kitchenSources).length,3);assert(Object.values(saved.kitchenSources).every(x=>x.kitchenId==='Kitchen-Elimedu'));assert.equal(saved.itemEditors[key].sideExtraFivePercent,false);assert.equal(db['1/ASSET_MASTER/default'].assets.length,1);
 const context=await p.evaluate(()=>BOBS_KITCHENS.context('Kitchen-Elimedu'));assert.equal(context.jobs.length,3);assert.equal(context.jobs.find(j=>j.name==='Idli').quantity,360);assert.equal(context.jobs.find(j=>j.name==='Idli Sambar').quantity,18);assert.equal(context.jobs.find(j=>j.name==='Coconut Chutney').quantity,7.2);
 const local=await p.evaluate(async()=>{const items=BOBS_OUTLET_FLOW.selected(M2.state(await M2.read('1')),ITEM_DATA,M2),recipes=(await BOBS_OPERATIONAL_RECIPES.load()).recipes;return BOBS_OUTLET_FLOW.requirements(items,recipes,M2)});assert.equal(local.length,0,'kitchen production must not also count at the shop');
 await p.locator('#nextAction > section > a').click();await p.waitForURL('**/outlet-plan.html?**');assert.equal(new URL(p.url()).searchParams.get('outlet'),'Kitchen-Elimedu');
 assert(!owner.isClosed());assert.equal(owner.url(),parentURL);assert.deepEqual(errors,[]);
 console.log('PASS production sourcing: confirmed demand, explicit per-side kitchen, missing choice blocked, exact quantities, no shop equipment writes, verified next kitchen step and retained parent.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
