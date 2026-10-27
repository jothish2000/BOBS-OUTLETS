/* Full browser fixture: all requests are intercepted; no live Google writes. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),shifts=[{start:'04:30',end:'13:30'},{start:'13:30',end:'22:30'}];
const originalOutlets=['1','2','3'].map(id=>({outletId:id,outletName:'Fixture outlet '+id,data:{id,name:'Fixture outlet '+id,shortCode:'F'+id,numShifts:2,shiftTimes:id==='1'?shifts:[{start:'06:00',end:'12:00'},{start:'16:00',end:'20:30'}],keep:'outlet metadata'}}));
let outletRows=JSON.parse(JSON.stringify(originalOutlets)),legacyReads=0,failOutletRead=false;
const vaultPath=new URL(fs.readFileSync(path.join(root,'bobs-config.js'),'utf8').match(/DATA_VAULT_WEB_APP_URL: '([^']+)'/)[1]).pathname;
const db={'COMPANY/KITCHEN_MASTER/default':{reviewed:true,kitchens:[],noSeparateKitchens:true,outletDecisions:{'1':{hasKitchen:false},'2':{hasKitchen:false}}},'COMPANY/THP_NORMS/default':require('../tests/fixtures/thp-norms.json'),'1/OUTLET_BASELINE/default':{schema:1,reviewed:true,workingDays:30,mandatoryCount:1,noCounter:true,ownerCounterShifts:[0,1],positions:[{id:'Mandatory1',role:'Cashier',shift:0,takeHome:15000}],expenseSelections:[]},'1/FIXED_EXPENSES/default':{expenses:[]}};
(async()=>{const browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true,timeout:30000});try{
 const ctx=await browser.newContext({viewport:{width:1071,height:580}}),errors=[],writes=[];ctx.setDefaultTimeout(30000);ctx.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept())});
 await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname==='bobs.test'){const f=path.join(root,decodeURIComponent(u.pathname.slice(1)));return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404,body:'missing'})}if(u.hostname!=='script.google.com')return route.abort();if(req.method()==='POST'){const b=JSON.parse(req.postData());if(b.action==='snapshot'){assert.equal(b.source,'BOBS-TRANSITION-GUARD');return route.fulfill({body:'ok'});}if(b.action==='outletSave'){writes.push('outletSave');const row=outletRows.find(o=>o.outletId===b.outletId);assert(row);row.data=b.data;row.outletName=b.outletName;row.outletCode=b.outletCode;return route.fulfill({body:'ok'});}assert(b.module,'Unexpected automatic write');writes.push(b.module);db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return route.fulfill({body:'ok'})}let response;if(u.searchParams.get('action')==='outletList'){if(u.pathname!==vaultPath)legacyReads++;response=failOutletRead?{ok:false,error:'fixture unavailable'}:{ok:true,outlets:u.pathname===vaultPath?outletRows:originalOutlets.map(o=>({...o,data:{...o.data,shiftTimes:[shifts[1],shifts[1]]}}))};}else{const k=u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey');response={ok:true,found:!!db[k],data:db[k]??null}}return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify(response)+')'})});

 const dataBefore=JSON.stringify(outletRows);
 const snapshot=page=>page.locator('#cards > .stack').evaluateAll(cards=>cards.map(card=>({
   id:card.querySelector('.id').value,name:card.querySelector('.name').value,code:card.querySelector('.code').value,
   shifts:[...card.querySelectorAll('.shift')].map(row=>({start:row.querySelector('.st').value,end:row.querySelector('.en').value,name:row.querySelector('.sn').value}))
 })));
 const show=async(page,label,expected=['1','2','3'])=>{
   await page.waitForSelector('.bobs-shift-start');
   const before=await snapshot(page);
   assert.deepEqual(before.map(x=>x.id),expected,label+' IDs before Show');
   if(await page.locator('#bobsCompanion').isHidden())await page.click('#bobsCompanionToggle');
   await page.click('[data-guide-choice=outlet-fields]');
   await page.waitForTimeout(1200);
   assert.deepEqual(await snapshot(page),before,label+' Show altered outlets');
   assert.equal(await page.locator('#cards .name').first().evaluate(el=>el===document.activeElement),true,label+' focus');
   assert.equal(writes.length,0,label+' automatic business write');
   console.log('PASS '+label+': IDs '+expected.join(',')+' unchanged; correct focus; no business write');
 };
 const url='https://bobs.test/outlets.html?guide=start&returnTo=https%3A%2F%2Fbobs.test%2Findex.html';
 const p=await ctx.newPage();
 await p.goto(url);await p.click('#keep');await show(p,'Continue existing');
 await show(p,'Repeated Show');
 await p.locator('#cards .name').first().fill('Unsaved edited outlet name');
 await p.locator('#cards .name').first().press('Tab');
 await show(p,'Existing unsaved input and delayed restore');
 assert.equal(JSON.stringify(outletRows),dataBefore);
 failOutletRead=true;
 const retry=await ctx.newPage();await retry.goto(url);await retry.waitForSelector('#retry');
 assert.equal(await retry.locator('#cards .id').count(),0);
 failOutletRead=false;await retry.click('#retry');await retry.click('#keep');
 await show(retry,'Failed read then Retry then Continue existing');
 console.log('OBSERVATION recovered read status: '+await retry.locator('#sync').innerText());
 // Previous working-state storage must not replace verified Google-backed outlets.
 await ctx.addInitScript(()=>localStorage.setItem('outlets-master',JSON.stringify([{id:'4',name:'Stale local draft',numShifts:2,shiftTimes:[]}])));
 const stale=await ctx.newPage();await stale.goto(url);await stale.click('#keep');await show(stale,'Stale local Outlet 4 ignored');
 // Control cases distinguish a new draft from a record that was already saved.
 const fresh=await ctx.newPage();await fresh.goto(url);await fresh.click('#fresh');await show(fresh,'Explicit Start New control',['4']);
 assert.equal(JSON.stringify(outletRows),dataBefore);
 outletRows.push({outletId:'4',outletName:'Pre-existing fixture',data:{id:'4',name:'Pre-existing fixture',shortCode:'F4',numShifts:2,shiftTimes:shifts}});
 const prior=await ctx.newPage();await prior.goto(url);await prior.click('#keep');await show(prior,'Already-saved Outlet 4 control',['1','2','3','4']);
 assert.equal(errors.length,0,errors.join('; '));
 console.log('PASS fixture diagnosis complete; all network traffic intercepted; no production data used or changed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
