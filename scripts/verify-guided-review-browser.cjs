const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{const browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1071,height:580}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setContent('<main><section id="productionEditor"><label>Required pieces<input id="targetQty" type="number" min="1" value="360"></label><label>Reference batch<input id="referenceYield" value="120"></label><label>Reference grams<input id="referencePortion" value="40"></label><label>Chosen grams<select id="portion"><option value="40">40</option><option value="50">50</option></select></label><label><input type="checkbox" id="referenceWeightReviewed"> I checked reference output and piece weight.</label><label><input type="checkbox" id="intendedWeightReviewed"> I checked required piece count and chosen weight.</label><div id="productionRows">Rice: 3 kg</div><label><input type="checkbox" id="confirmed" aria-disabled="true"> I checked calculated ingredients.</label></section></main>');
 await p.addScriptTag({path:path.resolve(__dirname,'../bobs-guided-review.js')});
 await p.click('#intendedWeightReviewed');assert.equal(await p.isChecked('#intendedWeightReviewed'),false);
 assert.equal(await p.isChecked('[data-review-shortcut]'),false);assert(await p.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).isDisabled());
 await p.getByRole('button',{name:'Review my previously entered inputs',exact:true}).click();
 assert.equal(await p.evaluate(()=>document.activeElement.id),'targetQty');
 assert.equal(await p.isChecked('#intendedWeightReviewed'),false,'visiting a field is not confirmation');
 await p.getByRole('button',{name:'I have checked this input — next',exact:true}).click();
 assert.equal(await p.evaluate(()=>document.activeElement.id),'portion');
 await p.getByRole('button',{name:'I have checked this input — next',exact:true}).click();
 assert.equal(await p.isChecked('#intendedWeightReviewed'),false,'final confirmation is still explicit');
 await p.getByRole('button',{name:'Confirm this review and continue',exact:true}).click();
 assert.equal(await p.isChecked('#intendedWeightReviewed'),true);
 await p.fill('#targetQty','370');assert.equal(await p.isChecked('#intendedWeightReviewed'),false,'editing relevant input invalidates review');
 await p.evaluate(()=>BOBS_REVIEW.request('#referenceWeightReviewed'));
 await p.check('[data-review-shortcut]');assert(await p.locator('[data-review-ui] details').evaluate(n=>n.open));
 await p.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).click();assert(await p.isChecked('#referenceWeightReviewed'));
 await p.click('#confirmed');assert.equal(await p.isChecked('#confirmed'),false);assert.match(await p.locator('[data-review-ui]').innerText(),/not available yet/);
 await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 // Same controller covers existing outlet, kitchen, equipment, expenses, salary, assets and report reviews.
 for(const [id,scope]of [['outletsReviewed','cards'],['kitchenReviewed','kitchenBody'],['equipmentReviewed','equipmentRows'],['flowReviewed','flowApp'],['planningReviewed','planningBody'],['salaryReviewed','salaryFields'],['outletReview-1','report']]){
  await p.evaluate(({id,scope})=>{document.querySelector('main').innerHTML='<section id="'+scope+'"><label>Existing amount<input id="amount" value="100"></label><label><input type="checkbox" id="'+id+'"> I reviewed these inputs.</label></section>';},{id,scope});
  await p.click('#'+id);assert.equal(await p.isChecked('#'+id),false,id+' blind click blocked');
  await p.check('[data-review-shortcut]');await p.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).click();assert(await p.isChecked('#'+id));
  await p.fill('#amount','101');assert.equal(await p.isChecked('#'+id),false,id+' review invalidated after input edit');
 }
 // Selection checkboxes are business choices, not review gates.
 await p.evaluate(()=>{document.querySelector('main').innerHTML='<label><input type="checkbox" id="includeSide">Include sambar</label>';});
 await p.check('#includeSide');assert(await p.isChecked('#includeSide'));
 assert.deepEqual(errors,[]);console.log('Guided review browser tests passed: sequential focus, explicit shortcut, no default, invalidation, locked checks, all mapped stages and narrow screen.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
