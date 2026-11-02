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
 await p.click('#confirmed',{force:true});assert.equal(await p.isChecked('#confirmed'),false);assert.match(await p.locator('[data-review-ui]').innerText(),/not available yet/);
 await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 // Same controller covers existing outlet, kitchen, equipment, expenses, salary, assets and report reviews.
 for(const [id,scope]of [['outletsReviewed','cards'],['kitchenReviewed','kitchenBody'],['equipmentReviewed','equipmentRows'],['flowReviewed','flowApp'],['planningReviewed','planningBody'],['salaryReviewed','salaryFields'],['outletReview-1','report']]){
  await p.evaluate(({id,scope})=>{document.querySelector('main').innerHTML='<section id="'+scope+'"><label>Existing amount<input id="amount" value="100"></label><label><input type="checkbox" id="'+id+'"> I reviewed these inputs.</label></section>';},{id,scope});
  await p.click('#'+id);assert.equal(await p.isChecked('#'+id),false,id+' blind click blocked');
  await p.check('[data-review-shortcut]');await p.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).click();assert(await p.isChecked('#'+id));
  await p.fill('#amount','101');assert.equal(await p.isChecked('#'+id),false,id+' review invalidated after input edit');
 }
 // A review inside an equipment dialog must inspect that dialog, not the page behind it.
 await p.evaluate(()=>{document.querySelector('main').innerHTML='<label>Outside quantity<input id="outside" value="360"></label><dialog id="equipmentTest"><label>Usable capacity<input id="machineAmount" value="120"></label><label><input type="checkbox" id="machineBasis">I checked the equipment capacity.</label></dialog>';document.getElementById('equipmentTest').showModal();});
 await p.click('#machineBasis');await p.getByRole('button',{name:'Review my previously entered inputs',exact:true}).click();assert.equal(await p.evaluate(()=>document.activeElement.id),'machineAmount');
 await p.getByRole('button',{name:'I have checked this input — next',exact:true}).click();await p.getByRole('button',{name:'Confirm this review and continue',exact:true}).click();assert(await p.isChecked('#machineBasis'));await p.evaluate(()=>document.getElementById('equipmentTest').close());
 // Product allocation edits do not change the separately confirmed asset cost assumptions.
 await p.evaluate(()=>{document.querySelector('main').innerHTML='<section data-asset="S"><label>Cost<input data-field="unitCost" id="cost" value="100"></label><label>Share<input id="share" value="50"></label><label><input type="checkbox" id="costCheck" data-field="costConfirmed">I checked cost assumptions.</label></section>';});
 await p.click('#costCheck');await p.check('[data-review-shortcut]');await p.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).click();await p.fill('#share','100');assert(await p.isChecked('#costCheck'),'allocation does not invalidate cost assumptions');await p.fill('#cost','101');assert.equal(await p.isChecked('#costCheck'),false,'changed cost does invalidate cost review');
 // Selection checkboxes are business choices, not review gates.
 await p.evaluate(()=>{document.querySelector('main').innerHTML='<label><input type="checkbox" id="includeSide">Include sambar</label>';});
 await p.check('#includeSide');assert(await p.isChecked('#includeSide'));

 const r=await browser.newPage();await r.setContent('<main><section id="referenceSection"><h2>Recipe reference</h2><p id="referenceInfo">Trial batch assumption</p><div id="referenceEvidence"><a href="https://example.org/reference">Optional source</a></div><label>Reference output<input id="referenceYield" value="3.8"></label><label>Piece grams<input id="referencePortion" value="40"></label><label><input type="checkbox" id="referenceWeightReviewed">I checked this reference.</label></section></main>');
 await r.addScriptTag({path:path.resolve(__dirname,'../bobs-reference-help.js')});await r.addScriptTag({path:path.resolve(__dirname,'../bobs-guided-review.js')});
 await r.evaluate(()=>BOBS_REVIEW.request('#referenceWeightReviewed'));
 assert(await r.locator('#bobsReferenceDialog').isVisible());assert(await r.locator('#bobsReferenceContinue').isDisabled());assert.equal(await r.isChecked('#referenceWeightReviewed'),false);
 assert.equal(await r.locator('#bobsReferenceContent a').getAttribute('href'),'https://example.org/reference');
 await r.click('#bobsReferenceClose');assert.equal(await r.isChecked('#referenceWeightReviewed'),false);assert.equal(await r.inputValue('#referenceYield'),'3.8');
 await r.evaluate(()=>BOBS_REVIEW.request('#referenceWeightReviewed'));await r.check('#bobsReferenceAcknowledged');await r.click('#bobsReferenceContinue');
 await r.check('[data-review-shortcut]');await r.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).click();assert(await r.isChecked('#referenceWeightReviewed'));
 await r.fill('#referenceYield','4');await r.evaluate(()=>BOBS_REVIEW.request('#referenceWeightReviewed'));assert(await r.locator('#bobsReferenceDialog').isVisible(),'changed reference requires renewed assessment');
 assert.equal(await r.locator('dialog[open]').count(),1);await r.close();

 assert.deepEqual(errors,[]);console.log('Guided review browser tests passed: sequential focus, explicit shortcut, no default, invalidation, locked checks, all mapped stages and narrow screen.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
