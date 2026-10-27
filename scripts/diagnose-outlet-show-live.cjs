/* Read-only diagnosis: all writes, including transition checkpoints, are blocked. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base='https://jothish2000.github.io/BOBS-OUTLETS/',root=path.resolve(__dirname,'..');
(async()=>{let browser;const blocked=[],errors=[];try{
 for(const file of ['outlets.html','bobs-guide-bot.js','bobs-roadmap.js','bobs-transition-guard.js']){
  const response=await fetch(base+file+'?diagnose='+Date.now(),{signal:AbortSignal.timeout(45000)});
  assert(response.ok);assert.equal((await response.text()).replace(/\r\n/g,'\n'),fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'),file+' live/source mismatch');
 }
 console.log('PASS live served source matches inspected commit');
 browser=await chromium.launch({channel:'chrome',headless:true,timeout:60000});
 const ctx=await browser.newContext({viewport:{width:1071,height:580},serviceWorkers:'block'});
 ctx.setDefaultTimeout(90000);
 await ctx.route('**/*',route=>{const req=route.request(),u=new URL(req.url()),action=u.searchParams.get('action');
  if(!['GET','HEAD'].includes(req.method())||(action&&!['moduleGet','moduleList','outletList'].includes(action))){blocked.push({method:req.method(),action:action||'POST'});return route.abort();}
  return route.continue();
 });
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'outlets.html?guide=start&returnTo='+encodeURIComponent(base+'index.html'),{waitUntil:'domcontentloaded'});
 await p.waitForSelector('#keep, #retry, #freshEmpty');
 if(await p.locator('#retry').count()&&!await p.locator('#keep').count()){
   console.log('OBSERVATION first live read: '+await p.locator('#modalTitle').innerText());
   await p.click('#retry');await p.waitForSelector('#keep');
 }
 const read=()=>p.evaluate(async()=>(await BOBS_DATA.listOutlets()).map(o=>({id:String(o.id),name:String(o.name),code:String(o.shortCode),shifts:o.shiftTimes.map(s=>({start:s.start||'',end:s.end||'',name:s.name||''}))})));
 const shown=()=>p.locator('#cards > .stack').evaluateAll(cards=>cards.map(c=>({id:c.querySelector('.id').value,name:c.querySelector('.name').value,code:c.querySelector('.code').value,shifts:[...c.querySelectorAll('.shift')].map(r=>({start:r.querySelector('.st').value,end:r.querySelector('.en').value,name:r.querySelector('.sn').value}))})));
 const savedBefore=await read();
 console.log('LIVE_SAVED_BEFORE '+JSON.stringify(savedBefore.map(o=>({id:o.id,hasName:!!o.name,shiftCount:o.shifts.length}))));
 await p.click('#keep');await p.waitForSelector('[data-guide-choice=outlet-fields]');
 const before=await shown();assert.deepEqual(before,savedBefore,'Continue must show verified saved records');
 await p.click('[data-guide-choice=outlet-fields]');await p.waitForTimeout(1500);
 assert.deepEqual(await shown(),before,'Show must preserve all saved fields');
 assert.equal(await p.locator('#cards .name').first().evaluate(el=>document.activeElement===el),true,'Focus should be first outlet name');
 const savedAfter=await read();assert.deepEqual(savedAfter,savedBefore,'Saved records changed during diagnosis');
 console.log('LIVE_SAVED_AFTER '+JSON.stringify(savedAfter.map(o=>({id:o.id,hasName:!!o.name,shiftCount:o.shifts.length}))));
 console.log('LIVE_STATUS '+await p.locator('#sync').innerText());
 console.log('PASS live Continue existing -> Show: saved records and screen unchanged; correct focus');
 console.log('BLOCKED_WRITE_ATTEMPTS '+blocked.length);
 assert.equal(errors.length,0,'Live runtime errors: '+errors.join('; '));
}finally{if(browser)await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
