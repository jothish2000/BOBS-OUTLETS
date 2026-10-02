'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const html=fs.readFileSync('recipe-master.html','utf8'),inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
assert.doesNotMatch(inline,/saveModule|saveMaster|backupMaster|mergeMaster|saveRecipe/);
assert.doesNotMatch(html,/recipe-guide-seeds\.js|poriyal-recipes\.js|shared_data\.js/);
const recipes=[{name:'Vada',category:'SNACK',yieldQty:77,yieldUnit:'pieces',ingredients:[['Saved urad',2.345,'kg',123]],standardVersion:'older-saved-version'},{name:'Idli',category:'BREAKFAST',yieldQty:120,yieldUnit:'pieces',ingredients:[['Saved rice',1.6,'kg',55]]}];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 for(const scenario of ['current','older','sharded-result','missing','failed','malformed']){
 const page=await browser.newPage({viewport:{width:615,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.abort());
 await page.setContent(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<link[^>]+>/g,''));
 await page.addStyleTag({content:fs.readFileSync('style.css','utf8')});
 await page.evaluate(({scenario,recipes})=>{
 window.writes=0;window.calls=[];window.BOBS_CONFIG={DATA_VAULT_WEB_APP_URL:'mock'};
 window.saved=scenario==='missing'?null:scenario==='malformed'?{}:{recipes,standardVersion:scenario==='older'?'v0':'2026-09-SMALL-OUTLET-V2',storageMode:scenario==='sharded-result'?'SHARDED_RECIPE_MASTER_V2':undefined};
 window.before=JSON.stringify(window.saved);
 window.BOBS_DATA={getModule:async(...args)=>{window.calls.push(args);if(scenario==='failed')throw Error('Simulated read failure');return window.saved},saveModule:async()=>{window.writes++;throw Error('Unexpected write')}};
 },{scenario,recipes});
 await page.addScriptTag({content:inline});await page.waitForFunction(()=>!document.getElementById('status').textContent.startsWith('Reading'));
 assert.equal(await page.evaluate(()=>window.writes),0);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.saved)===window.before),true);
 assert.deepEqual(await page.evaluate(()=>window.calls),[['COMPANY','RECIPE_MASTER','STANDARD_V1']]);
 assert.equal(await page.locator('.recipe-card input,.recipe-card select,.recipe-card button').count(),0);
 if(['current','older','sharded-result'].includes(scenario)){
 assert.equal(await page.locator('.recipe-card').count(),2);assert.match(await page.locator('.recipe-card').first().innerText(),/77 pieces/);
 assert.match(await page.locator('.recipe-card').first().innerText(),/2.345/);
 await page.locator('#search').fill('vada');assert.equal(await page.locator('.recipe-card:visible').count(),1);
 await page.locator('#search').fill('');await page.locator('#category').selectOption('BREAKFAST');
 assert.match(await page.locator('.recipe-card:visible').innerText(),/Idli/);
 }else{
 assert.equal(await page.locator('.recipe-card').count(),0);
 assert.match(await page.locator('#status').innerText(),/No saved historical record|could not be loaded/);
 }
 assert.deepEqual(errors,[]);console.log('PASS historical read-only '+scenario+': zero writes, saved values unchanged, no editing controls');
 await page.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
