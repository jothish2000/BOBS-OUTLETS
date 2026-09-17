const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve(__dirname,'..');
require(path.join(dir,'method2-core.js'));
const primary={name:'Idly',kind:'PRIMARY',yieldQty:120,yieldUnit:'pieces',ingredients:[['Rice',1,'kg',120]]};
const recipes=[primary,{name:'Idli Sambar',kind:'CONDIMENT',yieldQty:1,yieldUnit:'L',ingredients:[['Dal',1,'kg',50]]},{name:'Coconut Chutney',kind:'CONDIMENT',yieldQty:1,yieldUnit:'kg',ingredients:[['Coconut',1,'kg',100]]},{name:'Cabbage Poriyal',kind:'CONDIMENT',yieldQty:1,yieldUnit:'kg',ingredients:[['Cabbage',1,'kg',80]]}];
const d={mode:'production',unit:'piece',batchSize:120,batches:5,sold:600,spoilage:0,uuwp:5,markup:25,price:15,packingPer:1,packaging:[{qty:1,unitCost:3}],condiments:[{recipeName:'Cabbage Poriyal',source:'recipe',portion:50,portionUnit:'g'}]};
assert.equal(M2.calculate(d,{name:'Idli'},recipes).cond,4);
assert.equal(M2.calculate(d,{name:'Idli'},recipes).soldCost,4800);
assert.equal(M2.number(''),null);assert.equal(M2.number(0),0);
assert.equal(M2.convert(50,'g','kg'),.05);assert.equal(M2.convert(50,'g','L'),null);
assert.equal(M2.unitCost({...primary,ingredients:[['Rice',1,'kg',null]]}),null);
assert.equal(M2.calculate({...d,mode:'purchased',purchaseRate:7,condiments:[{recipeName:'Sambar',source:'purchase',portion:20,portionUnit:'ml',purchaseRate:50,rateUnit:'L'}]}, {},[]).final,11);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:900}});
 const db={'COMPANY/RECIPE_MASTER/STANDARD_V1':{recipes},'1/METHOD2/default':{qtys:{'Other|0':4},custom:'KEEP',condiments:{untouched:[{name:'keep'}]}}};
 const posts=[],errors=[];let failWrites=false,failReads=false;
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.hostname==='script.google.com'){
   if(req.method()==='POST'){const body=JSON.parse(req.postData());posts.push(body);if(body.action==='moduleSave'&&!failWrites)db[body.outletId+'/'+body.module+'/'+body.recordKey]=body.data;return route.fulfill({status:200,body:'ok'})}
   if(failReads)return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify({ok:false,error:'test offline'})+')'});
   const key=u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey'),data=db[key];
   return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify({ok:true,found:!!data,data})+')'});
  }
  if(u.hostname==='bobs.test'){
   const name=decodeURIComponent(u.pathname.slice(1))||'method2.html',file=path.join(dir,name);
   if(!file.startsWith(dir)||!fs.existsSync(file))return route.fulfill({status:404,body:'not found'});
   return route.fulfill({contentType:name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html',body:fs.readFileSync(file)});
  }
  return route.abort();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://bobs.test/method2.html?outlet=1');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 const info=await page.evaluate(()=>{const cat=Object.keys(ITEM_DATA).find(c=>ITEM_DATA[c].some(x=>/^idli$/i.test(x.name)));return {cat,i:ITEM_DATA[cat].findIndex(x=>/^idli$/i.test(x.name))}});
 const itemUrl='https://bobs.test/method2-item.html?'+new URLSearchParams({outlet:'1',...info,mode:'production'});
 await page.goto(itemUrl);await page.waitForSelector('#editor:not([hidden])');
 await page.locator('#batchSize').fill('120');await page.locator('#batches').fill('5');await page.locator('#spoilage').fill('0');
 await page.locator('#save').click();assert.match(await page.locator('#soldError').textContent(),/Please enter/);assert.equal(posts.length,0);
 for(const name of ['Idli Sambar','Coconut Chutney','Cabbage Poriyal'])await page.locator('#m2SideChecks input').filter({visible:true}).locator('xpath=..').filter({hasText:name}).getByRole('checkbox').check();
 await page.locator('#packingPer').fill('1');await page.locator('#addPacking').click();await page.getByLabel('Price ₹ each',{exact:true}).fill('3');
 await page.locator('#sold').fill('600');
 assert.match(await page.locator('#totals').textContent(),/5,880.00/);
 assert.equal(await page.locator('#condiments a').count(),3);
 await page.screenshot({path:path.join(dir,'method2-editor-test.png'),fullPage:true});
 await page.locator('#mode').selectOption('purchased');assert.equal(await page.locator('#rateLabel').isVisible(),true);assert.equal(await page.locator('#capacityLabel').isVisible(),false);
 await page.locator('#mode').selectOption('production');assert.match(await page.locator('#totals').textContent(),/5,880.00/);
 await page.locator('#sold').fill('0');page.once('dialog',dialog=>dialog.dismiss());await page.locator('#save').click();assert.equal(posts.length,0);
 await page.locator('#sold').fill('600');
 failWrites=true;await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('saveStatus').textContent.startsWith('Not verified'));
 assert.equal(await page.locator('#editor').isVisible(),true);assert.equal(db['1/METHOD2/default'].custom,'KEEP');failWrites=false;
 await page.locator('#save').click();await page.waitForURL('**/method2.html?outlet=1');
 const saved=db['1/METHOD2/default'];assert.equal(saved.custom,'KEEP');assert.deepEqual(saved.condiments.untouched,[{name:'keep'}]);
 const k=info.cat+'::'+info.i;assert.equal(saved.itemEditors[k].soldConfirmed,true);assert.equal(saved.commercial[k].totalSoldCogs,5880);
 await context.clearCookies();await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 await page.reload();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 assert.equal(await page.evaluate(()=>BOBS_METHOD2_REVIEW()),true);
 await page.goto(itemUrl);await page.waitForSelector('#editor:not([hidden])');assert.equal(await page.locator('#sold').inputValue(),'600');assert.equal(await page.locator('#condiments a').count(),3);
 // An independently saved change must not be overwritten.
 db['1/METHOD2/default'].itemEditors[k].price=99;await page.locator('#price').fill('16');await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('changed in another window'));
 assert.equal(db['1/METHOD2/default'].itemEditors[k].price,99);
 page.once('dialog',dialog=>dialog.accept());await page.goto('https://bobs.test/recipe-cost-editor.html?item=Beans%20Poriyal');await page.waitForSelector('#editor:not([hidden])');
 assert.match(await page.locator('#planningNote').textContent(),/planning assumptions/);assert.equal(await page.locator('#recipe').inputValue(),'PORIYAL_BEANS_PORIYAL');
 assert.equal(await page.locator('#lines input[type=number]').nth(1).inputValue(),'');
 const before=posts.length;await page.locator('#save').click();assert.equal(posts.length,before);
 // Import only the selected poriyal, retaining all existing recipes.
 for(const input of await page.locator('#lines tr td:nth-child(4) input').all())await input.fill('10');
 page.once('dialog',dialog=>dialog.accept());await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Saved and read back'));
 assert.equal(db['COMPANY/RECIPE_MASTER/STANDARD_V1'].recipes.length,5);
 assert.equal(db['COMPANY/RECIPE_MASTER/STANDARD_V1'].recipes[0].name,'Idly');
 // Legacy/unconfirmed zero must be reviewed; unused catalogue rows must not be listed.
 db['1/METHOD2/default'].itemEditors[k].sold=0;db['1/METHOD2/default'].itemEditors[k].soldConfirmed=false;
 await page.goto('https://bobs.test/method2.html?outlet=1');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 assert.equal(await page.evaluate(()=>BOBS_METHOD2_REVIEW()),false);
 assert.equal(await page.locator('#reviewItems button').count(),1);
 await page.locator('#closeReview').click();
 // Real popup flow: selecting Production opens the editor; zero confirmation saves and closes it.
 await page.locator('#search').fill('Idli');
 const popupPromise=page.waitForEvent('popup');
 await page.locator('.item').filter({has:page.getByText('Idli',{exact:true})}).getByRole('button',{name:'Edit item'}).click();
 const popup=await popupPromise;popup.on('pageerror',e=>errors.push(e.message));
 await popup.waitForSelector('#editor:not([hidden])');popup.once('dialog',dialog=>dialog.accept());await popup.locator('#save').click();await popup.waitForEvent('close');
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 assert.equal(db['1/METHOD2/default'].itemEditors[k].soldConfirmed,true);
 // The parent capture guard prevents its existing Save & Continue handler.
 await page.setContent('<iframe id="methodFrame" src="method2.html?outlet=1"></iframe><button id="saveContinueBtn" onclick="window.didContinue=true">Save & Continue</button>');
 await page.addScriptTag({url:'https://bobs.test/method2-flow-review.js'});
 const frame=page.frames().find(f=>f!==page.mainFrame());await frame.waitForFunction(()=>typeof BOBS_METHOD2_REVIEW==='function');
 await frame.evaluate(()=>window.BOBS_METHOD2_REVIEW=()=>false);await page.locator('#saveContinueBtn').click();assert.equal(await page.evaluate(()=>!!window.didContinue),false);
 await frame.evaluate(()=>window.BOBS_METHOD2_REVIEW=()=>true);await page.locator('#saveContinueBtn').click();assert.equal(await page.evaluate(()=>window.didContinue),true);
 failReads=true;await page.goto('https://bobs.test/method2.html?outlet=2');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Google read failed'));assert.equal(await page.locator('#catList button').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: calculations, grams, purchase/production switch, required sold, zero cancel, failed save, verified save, preservation, cache-free reload, concurrency conflict, template missing rates, Google read failure.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
