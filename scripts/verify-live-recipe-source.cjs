'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext();
  await context.route('**/*',route=>route.request().method()==='GET'?route.continue():route.abort());
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const url='https://jothish2000.github.io/BOBS-OUTLETS/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production';
  for(const kind of ['cold','reload']){
   if(kind==='cold')await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});else await p.reload({waitUntil:'domcontentloaded',timeout:90000});
   await p.waitForFunction(()=>!document.getElementById('controls')?.disabled||!document.getElementById('retryGoogle')?.hidden,{},{timeout:120000});
   const title=await p.locator('#guideSourceTitle').textContent();
   assert.equal(title,'BOBS standard recipe loaded from Google Sheets');
   assert(await p.locator('#editor').isVisible());
   assert.equal(await p.locator('#itemGuide ol > li').count(),3);
   const link=new URL(await p.locator('#guideCostLink a').getAttribute('href'),url);
   assert.equal(link.searchParams.get('item').toLowerCase(),'idli');assert.equal(link.searchParams.get('outlet'),'1');
   console.log(JSON.stringify({liveRead:kind,standardSourceConfirmed:true,threeSteps:true,recipeLink:true,postRequestsAllowed:false}));
  }
  assert.equal(errors.length,0,'Runtime error observed');await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('LIVE READ CHECK FAILED: '+e.message);process.exitCode=1});
