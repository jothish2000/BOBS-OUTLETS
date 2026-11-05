/* Read-only saved-progress diagnostic. Never logs business payloads or sends writes. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const reads=[];let writes=0;
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.route('**/*',route=>{
   const r=route.request(),u=new URL(r.url()),action=u.searchParams.get('action');
   if(!['GET','HEAD'].includes(r.method())||(u.hostname==='script.google.com'&&action&&!['moduleGet','moduleList','outletList'].includes(action))){writes++;return route.abort();}
   if(process.env.BOBS_PROGRESS_CANDIDATE==='1'&&u.hostname==='jothish2000.github.io'&&['bobs-roadmap.js','bobs-google-data.js','bobs-kitchen-store.js','bobs-roadmap-outlet-flow.js','bobs-operational-recipes.js'].includes(path.basename(u.pathname)))return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'..',path.basename(u.pathname)),'utf8')});
   return route.continue();
  });
  await page.goto('https://jothish2000.github.io/BOBS-OUTLETS/outlet-plan.html?stage=baseline&outlet=1&outlets=1%2C2&guide=continue',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('mandatoryCount')&&window.BOBS_DATA&&window.BOBS_ROADMAP,null,{timeout:90000});
  await page.exposeFunction('recordProgressRead',x=>reads.push(x));
  const diagnosis=process.env.BOBS_PROGRESS_DIAGNOSIS==='1';
  await page.evaluate(diagnosis=>{
   if(diagnosis){const original=setTimeout;window.setTimeout=(fn,ms,...args)=>original(fn,ms===45000?240000:ms,...args);}
   const read=BOBS_DATA.jsonp;
   BOBS_DATA.jsonp=async p=>{const started=performance.now();try{const value=await read(p);recordProgressRead({action:p.action,module:p.module||'',owner:p.outletId==='COMPANY'?'company':'outlet',ms:Math.round(performance.now()-started),ok:value?.ok===true,found:value?.found});return value;}catch(e){recordProgressRead({module:p.module||'',ms:Math.round(performance.now()-started),error:e.message});throw e;}};
  },diagnosis);
  const start=Date.now();
  await page.evaluate(()=>{window.__progressProbe=BOBS_ROADMAP.refresh(true)});
  await page.waitForFunction(()=>!BOBS_ROADMAP.getState().busy,null,{timeout:250000});
  const state=await page.evaluate(()=>BOBS_ROADMAP.getState());
  console.log('SAVED_PROGRESS_RESULT',JSON.stringify({elapsedMs:Date.now()-start,state,readCount:reads.length,writes,reads}));
  assert.equal(state.progress.status,'ready',state.progress.message);assert.equal(writes,0);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
