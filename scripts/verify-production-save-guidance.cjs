'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{for(const width of [1366,615,390]){
 const page=await browser.newPage({viewport:{width,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));
 await page.goto('https://bobs.test/recipe-cost-editor.html?item=Idli&outlet=1&qty=360&cat=Breakfast+Catalogue&i=0');
 const html=fs.readFileSync('recipe-cost-editor.html','utf8');
 await page.setContent(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<link[^>]+>/g,''));
 await page.addStyleTag({content:fs.readFileSync('style.css','utf8')});
 await page.addScriptTag({content:fs.readFileSync('bobs-cost-flow.js','utf8')});
 await page.evaluate(()=>{
 window.saves=0;window.failSave=false;window.recipe={name:'Idli',yieldQty:120,yieldUnit:'pieces',ingredients:[['Rice',1.6,'kg',55]],referenceEvidence:[]};
 window.M2={purchaseKey:s=>s.toLowerCase()};
 window.BOBS_RECIPE_KNOWLEDGE={loadStandards:async()=>({records:[window.recipe]})};window.BOBS_DATA={};
 window.BOBS_VERIFIED={clone:x=>JSON.parse(JSON.stringify(x)),read:async()=>({recipeOverrides:{}}),save:async(outlet,module,key,next)=>{window.saves++;if(window.failSave)throw Error('Simulated verification failure');return next}};
 });
 await page.addScriptTag({content:fs.readFileSync('recipe-production-editor.js','utf8')});await page.evaluate(()=>BOBSRecipeProduction.start());
 assert.match(await page.locator('#productionStatus').innerText(),/Preview calculated — not saved/);
 assert.equal(await page.locator('.production-save-row #saveProduction').count(),1);assert.equal(await page.locator('.production-save-row #productionStatus').count(),1);
 assert.match(await page.locator('#productionSaveHelp').innerText(),/Ticking the checkbox does not save/);
 await page.locator('#saveProduction').click();assert.match(await page.locator('#productionStatus').innerText(),/Check the reference/);assert.equal(await page.evaluate(()=>window.saves),0);
 await page.locator('#confirmed').check();assert.equal(await page.evaluate(()=>window.saves),0);
 await page.locator('#targetQty').fill('480');assert.equal(await page.locator('#confirmed').isChecked(),false);assert.match(await page.locator('#productionStatus').innerText(),/Click Calculate/);
 await page.locator('#confirmed').check();await page.locator('#saveProduction').click();assert.equal(await page.evaluate(()=>window.saves),0);
 await page.locator('#scale').click();await page.locator('#confirmed').check();await page.locator('#saveProduction').click();
 await page.waitForFunction(()=>document.getElementById('productionStatus').textContent.includes('saved and verified'));
 assert.equal(await page.evaluate(()=>window.saves),1);assert.match(await page.locator('#productionStatus a').getAttribute('href'),/mode=production/);
 await page.locator('.rate').fill('60');assert.equal(await page.locator('#confirmed').isChecked(),false);assert.match(await page.locator('#productionStatus').innerText(),/Edits are not saved/);
 await page.evaluate(()=>window.failSave=true);await page.locator('#confirmed').check();await page.locator('#saveProduction').click();
 await page.waitForFunction(()=>document.getElementById('productionStatus').textContent.includes('Simulated verification failure'));
 assert.deepEqual(errors,[]);console.log('PASS production save guidance '+width+'px: preview, checkbox/no auto-save, recalculate gate, mock save success/return, edits and failure status');await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
