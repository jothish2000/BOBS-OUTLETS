const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const K=require('../recipe-market-google-store.js'),root=path.resolve(__dirname,'..');
const r={name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',3,'kg',60]]};
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const draft={mode:'production',unit:'piece',batchSize:120,batches:3,capacity:1440,sold:290,price:10,spoilage:0,uuwp:5,uuwpPolicy:'always',markup:25,pricingBasis:'markup',condiments:[],packaging:[],packingMode:'none',mainPacking:{packingMode:'none',packaging:[],packingPer:1},commonPacking:{packingMode:'none',packaging:[],packingPer:1},soldConfirmed:true,businessDate:day};
const db={'1/METHOD2/default':{itemEditors:{'Breakfast Catalogue::0':draft}},'COMPANY/BOBS_STANDARD_RECIPE/ACTIVE_V1':K.manifest('standard',['test-chunk'],'token',1),'COMPANY/BOBS_STANDARD_RECIPE/test-chunk':K.chunkData('standard',[r],'token',0,1)};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:1366,height:900}}),errors=[],reads=[],writes=[];let first=true;
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='bobs.test'){const f=path.join(root,decodeURIComponent(u.pathname.slice(1)));return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404,body:'missing'})}
 if(u.hostname==='script.google.com'){
   if(req.method()==='POST'){const b=JSON.parse(req.postData());writes.push(b.module);db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return route.fulfill({body:'ok'})}
   const m=u.searchParams.get('module'),key=u.searchParams.get('outletId')+'/'+m+'/'+u.searchParams.get('recordKey');reads.push(m);
   if(m==='METHOD2'&&first){first=false;return route.abort('failed')}
   if(['WORKFORCE_PLAN','STAFF_MASTER','HR_OUTLET_ALLOCATION','FIXED_EXPENSES','IDLI_SUPPORT'].includes(m))return route.abort('failed');
   const data=db[key];return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify({ok:true,found:!!data,data:data??null})+')'});
 }return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const route='https://bobs.test/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production';
 await page.goto(route);await page.waitForFunction(()=>!document.getElementById('controls').disabled,{},{timeout:15000});
 assert.equal(await page.inputValue('#sold'),'290');assert(!reads.includes('RECIPE_MASTER'));assert.equal(writes.length,0);
 await page.waitForFunction(()=>document.getElementById('idliLabourCost').textContent.includes('request failed'));
 assert(await page.locator('#editor').isVisible());assert.equal(await page.locator('#save').isEnabled(),true);console.log('PASS Chrome: first network failure retried; optional failures isolated; quantities retained; zero initial writes');
 await page.click('#save');try{await page.waitForFunction(()=>document.getElementById('saveStatus').textContent==='Verified in Google')}catch(e){console.error('SAVE DIAGNOSTIC',JSON.stringify({url:page.url(),status:await page.locator('#status').textContent(),save:await page.locator('#saveStatus').textContent(),invalid:await page.locator(':invalid').evaluateAll(es=>es.map(x=>({id:x.id,value:x.value,message:x.validationMessage}))),errors,writes}));throw e}
 assert.deepEqual(writes,['METHOD2_BACKUPS','METHOD2']);assert.equal(Number(db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].sold),290);
 await page.reload();await page.waitForFunction(()=>!document.getElementById('controls').disabled);assert.equal(await page.inputValue('#sold'),'290');assert.equal(await page.inputValue('#batches'),'3');
 await page.setViewportSize({width:390,height:844});assert(await page.locator('#save').isVisible());assert.equal(errors.length,0,errors.join('\n'));console.log('PASS Chrome: protected mock save/readback/reload, narrow viewport, zero runtime errors');
 await context.close();
 if(process.env.BOBS_LIVE_READ==='1'){
 const live=await browser.newContext(),p=await live.newPage();await live.route('**/*',route=>route.request().method()==='GET'?route.continue():route.abort());const liveErrors=[];p.on('pageerror',e=>liveErrors.push(e.message));await p.goto('https://jothish2000.github.io/BOBS-OUTLETS/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production',{waitUntil:'domcontentloaded',timeout:60000});await p.waitForFunction(()=>{const t=document.getElementById('status')?.textContent||'';return /Loaded from Google|Could not load/.test(t)},{},{timeout:90000});console.log('LIVE READ ONLY',JSON.stringify({status:await p.locator('#status').textContent(),visible:await p.locator('#editor').isVisible(),errors:liveErrors}));await live.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
