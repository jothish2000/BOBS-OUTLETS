const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');require(path.join(root,'method2-core.js'));
assert.equal(M2.packing({packingPer:2,packaging:[{qty:1,unitCost:1},{qty:1,unitCost:3}]}).perItem,2);
assert.equal(M2.packing({packingPer:0,packaging:[{qty:1,unitCost:1}]}).missing.length,1);
assert.equal(M2.packing({packingPer:2,packaging:[{qty:1,unitCost:''}]}).missing.length,1);
assert.equal(M2.packing({packingPer:2,packaging:[{qty:1,unitCost:0}]}).perItem,0);
const odd=M2.calculate({mode:'purchased',purchaseRate:7,unit:'piece',sold:3,packingPer:2,packaging:[{qty:1,unitCost:1},{qty:1,unitCost:3}]},{},[]);
assert.equal(odd.parcels,2);assert.equal(odd.totalPacking,8);assert.equal(odd.pack,8/3);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:1366,height:900}});
 const db={'1/METHOD2/default':{custom:'KEEP',condiments:{unrelated:[{name:'KEEP'}]}},'2/METHOD2/default':{custom:'OTHER OUTLET'},'COMPANY/RECIPE_MASTER/STANDARD_V1':{recipes:[
 {name:'Idly',kind:'PRIMARY',yieldQty:120,yieldUnit:'pieces',ingredients:[['Rice',1,'kg',120]]},
 {name:'Idli Sambar',kind:'CONDIMENT',yieldQty:1,yieldUnit:'L',ingredients:[['Dal',1,'kg',50]]}
 ]}};
 let failWrites=false,masterReads=0,methodReads=0,nextReadDelay=0;const errors=[],requested=[];
 const clone=x=>JSON.parse(JSON.stringify(x));
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());requested.push(u.pathname);
  if(u.hostname==='script.google.com'){
   if(req.method()==='POST'){const body=JSON.parse(req.postData());if(body.action==='moduleSave'&&!failWrites)db[body.outletId+'/'+body.module+'/'+body.recordKey]=body.data;return route.fulfill({body:'ok'})}
   const cb=u.searchParams.get('callback');if(u.searchParams.get('action')==='outletList')return route.fulfill({contentType:'application/javascript',body:cb+'('+JSON.stringify({ok:true,outlets:[{outletId:'1',outletName:'Test outlet',data:{id:'1',name:'Test outlet'}}]})+')'});
   const mod=u.searchParams.get('module');if(mod==='RECIPE_MASTER')masterReads++;if(mod==='METHOD2')methodReads++;
   const data=db[u.searchParams.get('outletId')+'/'+mod+'/'+u.searchParams.get('recordKey')],response=JSON.stringify({ok:true,found:!!data,data});
   if(mod==='METHOD2'&&nextReadDelay){const ms=nextReadDelay;nextReadDelay=0;await new Promise(r=>setTimeout(r,ms))}
   return route.fulfill({contentType:'application/javascript',body:cb+'('+response+')'});
  }
  if(u.hostname==='bobs.test'){const name=decodeURIComponent(u.pathname.slice(1)),file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'missing'});return route.fulfill({contentType:name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html',body:fs.readFileSync(file)})}
  return route.abort();
 });
 context.on('page',page=>page.on('pageerror',e=>errors.push(e.message)));
 const page=await context.newPage();
 await page.goto('https://bobs.test/method2.html?outlet=1');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 assert.equal(await page.locator('#catList tr').count(),0);assert.equal(masterReads,0);
 async function chooser(){const opened=page.waitForEvent('popup');await page.locator('#chooseItems').click();const p=await opened;await p.waitForSelector('.category-tile');await p.getByRole('link',{name:/^Breakfast/}).click();await p.waitForSelector('#selectionForm:not([hidden])');return p}
 let choose=await chooser();assert.equal(masterReads,0);const cat='Breakfast Catalogue';
 const itemNames=await choose.evaluate(()=>ITEM_DATA['Breakfast Catalogue'].map(x=>x.name));assert.equal(await choose.locator('#items tr').count(),itemNames.length);
 await choose.getByRole('checkbox',{name:'Select '+itemNames[0],exact:true}).check();
 await choose.getByRole('checkbox',{name:'Select '+itemNames[1],exact:true}).check();
 await choose.locator('#filter').fill('Idli');assert.equal(await choose.locator('#items input:checked').count(),2);
 failWrites=true;await choose.locator('#saveReturn').click();await choose.waitForFunction(()=>document.getElementById('status').textContent.includes('could not')||document.getElementById('status').textContent.includes('not confirmed'));
 assert.equal(db['1/METHOD2/default'].selection,undefined);failWrites=false;
 const closed=choose.waitForEvent('close');await choose.locator('#saveReturn').click();await closed;
 await page.waitForFunction(()=>document.querySelectorAll('#catList tr').length===2);
 assert.deepEqual(db['1/METHOD2/default'].selection[cat].indices,[0,1]);assert.equal(db['1/METHOD2/default'].custom,'KEEP');
 assert.equal(await page.evaluate(()=>BOBS_METHOD2_REVIEW()),false);assert.equal(await page.locator('#reviewItems button').count(),2);await page.locator('#closeReview').click();
 await page.waitForTimeout(300);await page.setViewportSize({width:1100,height:380});
 const scrollBefore=await page.evaluate(()=>{document.querySelector('#catList tr').dataset.probe='original';window.scrollTo(0,400);return scrollY}),readsBefore=methodReads;
 await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('focus'))});
 await page.waitForTimeout(450);assert.equal(methodReads,readsBefore);assert.equal(await page.evaluate(()=>scrollY),scrollBefore);assert.equal(await page.locator('#catList tr').first().getAttribute('data-probe'),'original');
 await page.setViewportSize({width:1366,height:900});await page.locator('#catList tr').first().locator('select').selectOption('production');
 assert.equal(context.pages().length,1);const editorOpened=page.waitForEvent('popup');await page.locator('#catList tr').first().getByRole('button',{name:'Edit item'}).click();const editor=await editorOpened;await editor.waitForSelector('#editor:not([hidden])');
 assert.equal(await editor.locator('#mainPackingChoice').inputValue(),'');
 await editor.locator('#batchSize').fill('120');await editor.locator('#batches').fill('5');await editor.locator('#sold').fill('600');await editor.locator('#spoilage').fill('0');
 await editor.locator('#idliPackingPreset').click();await editor.getByLabel('Price ₹ each',{exact:true}).fill('3');
 assert.match(await editor.locator('#packingSummary').textContent(),/₹3.00.*2 sales units.*₹1.50.*900.00/);
 await editor.locator('#m2SideChecks input[value="Idli Sambar"]').check();
 const sidePacking=editor.locator('#condiments > .component').first();await sidePacking.getByLabel('Packing choice',{exact:true}).selectOption('required');await sidePacking.getByLabel('Sales units sharing ONE packing set',{exact:true}).fill('2');await sidePacking.getByRole('button',{name:'+ Add packing material',exact:true}).click();await sidePacking.getByLabel('Price ₹ each',{exact:true}).fill('1');
 assert.match(await editor.locator('#totals').textContent(),/2,400.00/);
 await editor.screenshot({path:path.join(root,'method2-packing-test.png'),fullPage:true});
 await editor.getByLabel('Price ₹ each',{exact:true}).nth(1).fill('');assert.match(await sidePacking.locator('.packing-summary').textContent(),/price/);
 await editor.getByLabel('Price ₹ each',{exact:true}).nth(1).fill('1');
 const editorClosed=editor.waitForEvent('close');await editor.locator('#save').click();await editorClosed;
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 const key=cat+'::0',savedItem=clone(db['1/METHOD2/default'].itemEditors[key]);assert.equal(Number(savedItem.mainPacking.packingPer),2);assert.equal(savedItem.condiments[0].packingMode,'required');assert.equal(db['1/METHOD2/default'].commercial[key].totalPackingCost,1200);assert.equal(db['1/METHOD2/default'].packaging[key][0].qty,.5);assert.equal(db['1/METHOD2/default'].commercial[key].totalSoldCogs,2400);
 choose=await chooser();await choose.getByRole('checkbox',{name:'Select '+itemNames[0],exact:true}).uncheck();const secondClosed=choose.waitForEvent('close');await choose.locator('#saveReturn').click();await secondClosed;await page.waitForFunction(()=>document.querySelectorAll('#catList tr').length===1);
 assert.deepEqual(db['1/METHOD2/default'].itemEditors[key],savedItem);assert.equal(db['2/METHOD2/default'].custom,'OTHER OUTLET');
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await page.reload();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 assert.equal(await page.locator('#catList tr').count(),1);assert.match(await page.locator('#catList').textContent(),new RegExp(itemNames[1]));
 // A slower earlier read cannot replace the newer selection.
 nextReadDelay=700;const delayed=page.waitForRequest(r=>r.url().includes('module=METHOD2'));await page.locator('#refresh').click();await delayed;
 db['1/METHOD2/default'].selection[cat].indices=[0,1];
 await page.evaluate(()=>window.postMessage({type:'bobs-method2-selection-saved',outlet:'1'},location.origin));
 await page.waitForFunction(()=>document.querySelectorAll('#catList tr').length===2);await page.waitForTimeout(850);assert.equal(await page.locator('#catList tr').count(),2);
 // Real parent button opens the category window on the user's click.
 await page.goto('https://bobs.test/outlet-method-flow.html?outlets=1');await page.waitForFunction(()=>!document.getElementById('method2Btn').disabled);
 const firstScreen=page.waitForEvent('popup');await page.locator('#method2Btn').click();const menu=await firstScreen;await menu.waitForSelector('.category-tile');assert.equal(await menu.locator('.category-tile').count(),14);
 const mainFrame=page.frameLocator('#methodFrame');await mainFrame.locator('#catList tr').first().waitFor();
 const menuClosed=menu.waitForEvent('close');await menu.locator('#returnToMethod').click();await menuClosed;
 assert(!requested.some(x=>/method2-production-(runtime|input-fix)|method2-condiments\.js/.test(x)));
 await page.goto('https://bobs.test/method2.html?outlet=1');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Loaded from Google'));
 await page.evaluate(()=>{document.getElementById('refresh').click();document.body.replaceChildren()});
 await page.waitForTimeout(900);
 assert.deepEqual(errors,[]);
 console.log('PASS: category window/table, selection persistence and failure, selected-only rendering, no focus reload/scroll jump, stale read protection, two-idli packing, no double-counted sambar, preserved hidden data and other outlet, real parent flow.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
