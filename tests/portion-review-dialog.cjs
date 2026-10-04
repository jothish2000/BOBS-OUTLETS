'use strict';
// DOM integration only: native dialog focus containment/layout is tested by the Chrome fixture.
const {JSDOM}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
const dom=new JSDOM(fs.readFileSync('recipe-cost-editor.html','utf8'),{url:'https://bobs.test/recipe-cost-editor.html?item=Idli&outlet=1&qty=360',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document,$=id=>d.getElementById(id);let writes=0;
w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.querySelector('[autofocus]').focus();};
w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
w.M2={purchaseKey:s=>s.toLowerCase()};w.BOBS_DATA={};
const recipe={name:'Idli',yieldQty:120,yieldUnit:'pieces',portionGrams:50,ingredients:[['Rice',1.6,'kg',55]],referenceEvidence:[]};
w.BOBS_RECIPE_KNOWLEDGE={loadStandards:async()=>({records:[recipe]})};
w.BOBS_VERIFIED={clone:x=>JSON.parse(JSON.stringify(x)),read:async()=>({recipeOverrides:{}}),save:async()=>{writes++;}};
for(const path of ['bobs-number-format.js','bobs-cost-flow.js','recipe-production-editor.js'])w.eval(fs.readFileSync(path,'utf8'));
await w.BOBSRecipeProduction.start();
assert.equal($('portionReviewDialog').open,false);
const preview=$('calculationStatus').textContent,rows=$('productionRows').innerHTML;
for(const action of [()=> $('confirmed').click(),()=> $('confirmed').dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',cancelable:true})),()=> $('saveProduction').click(),()=> $('goToReference').click()]){
action();assert($('portionReviewDialog').open);assert(!$('confirmed').checked);assert.match($('portionReviewOutput').textContent,/360 pieces/);assert.equal(writes,0);$('reviewPortions').click();assert(!$('portionReviewDialog').open);assert.equal(d.activeElement.id,'scale');assert.equal($('calculationStatus').textContent,preview);assert.equal($('productionRows').innerHTML,rows);
}
$('portion').value='custom';$('portion').dispatchEvent(new w.Event('input',{bubbles:true}));$('customPortion').value='100';$('customPortion').dispatchEvent(new w.Event('input',{bubbles:true}));
$('confirmed').click();$('closePortionReview').click();assert.equal($('customPortion').value,'100');assert.equal(writes,0);
$('scale').click();await new Promise(r=>setTimeout(r,100));assert.equal($('confirmed').getAttribute('aria-disabled'),'false');assert.equal(d.querySelector('.quantity').value,'9.600');assert(!$('portionReviewDialog').open);$('confirmed').click();assert($('confirmed').checked);
$('targetQty').value='480';$('targetQty').dispatchEvent(new w.Event('input',{bubbles:true}));assert(!$('confirmed').checked);$('confirmed').click();assert($('portionReviewDialog').open);assert.match($('portionReviewOutput').textContent,/480 pieces/);assert.equal(writes,0);
dom.window.close();console.log('PASS real-editor DOM: early click/Space/save/navigation dialogue, dismiss focus, unchanged preview/inputs/no writes, explicit scale unlock, stale target relock/dynamic output');
})().catch(e=>{console.error(e);process.exitCode=1});
