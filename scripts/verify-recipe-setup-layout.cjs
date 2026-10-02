'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 for(const width of [1366,615,390]){
 const page=await browser.newPage({viewport:{width,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.abort());
 const html=fs.readFileSync('recipe-master-market-migrate.html','utf8');
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
 await page.setContent(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<link[^>]+>/g,''));
 await page.addStyleTag({content:fs.readFileSync('style.css','utf8')});
 await page.addStyleTag({content:html.match(/<style>([\s\S]*?)<\/style>/)[1]});
 await page.evaluate(()=>{window.reads=0;window.writes=0;window.BOBS_RECIPE_KNOWLEDGE={MODULES:{evidence:'evidence'},MANIFEST_KEY:'ACTIVE_V1'};window.BOBS_RECIPE_SYNC={};window.BOBS_DATA={getRawModule:async()=>{window.reads++;return {token:'saved'}},saveModule:async()=>{window.writes++}}});
 await page.addScriptTag({content:inline});
 await page.waitForFunction(()=>document.getElementById('summary').textContent.includes('Saved recipe records found'));
 assert.equal(await page.locator('#run').isDisabled(),true);
 assert.equal(await page.locator('#reload').getAttribute('aria-describedby'),'reloadHelp');
 assert.match(await page.locator('#reloadHelp').innerText(),/does not save, replace, or delete/);
 await page.locator('#reload').click();await page.waitForFunction(()=>window.reads===2&&!document.getElementById('reload').disabled);
 assert.equal(await page.evaluate(()=>window.writes),0);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert(await page.evaluate(()=>document.getElementById('summary').getBoundingClientRect().top<document.getElementById('reload').getBoundingClientRect().top));
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'recipe-setup-'+width+'.png',fullPage:true});
 console.log('PASS isolated Chrome: '+width+'px, result-first layout, help association, read-only recheck, disabled save, no horizontal overflow/runtime errors');
 await page.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
