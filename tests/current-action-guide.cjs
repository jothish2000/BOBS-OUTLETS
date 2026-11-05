const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
test('kitchen confirmation names Save Kitchen Setup as the immediate next action',async()=>{
 const dom=new JSDOM('<main><div id="kitchenBody"></div><input id="kitchenReviewed" type="checkbox"><button id="saveKitchen">Save Kitchen Setup — choose Equipment & Capacity or Outlet Expenses & Staff →</button><p id="kitchenStatus">Loaded</p></main><aside id="bobsCompanion"><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/kitchen-flow.html?stage=locations&guide=continue'}),w=dom.window;
 try{
 w.HTMLElement.prototype.scrollIntoView=function(){};w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide');
 w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:'kitchen-flow.html',outlet:'1'},progress:{status:'idle'},pageHelp:{title:'Kitchen setup'},kitchens:[]})});
 const review=w.document.getElementById('kitchenReviewed');review.checked=true;review.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,60));
 assert.match(host.textContent,/✓ Review confirmed/);assert.match(host.textContent,/Next: click “Save Kitchen Setup/);assert.equal(review.checked,true);
 w.document.getElementById('saveKitchen').disabled=true;await new Promise(r=>setTimeout(r,60));assert.match(host.textContent,/Saving and verifying in Google/);
 }finally{w.close();}
});
test('current review gives named save action while historical roadmap stays collapsed',async()=>{
 const dom=new JSDOM('<main><input id="review" type="checkbox"><button id="save">Save Rasipuram expenses & review Gurusamypalayam →</button><p id="status"></p></main><aside id="bobsCompanion"><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/outlet-plan.html?outlet=1'}),w=dom.window;
 try{
 let phase='review';w.HTMLElement.prototype.scrollIntoView=function(){};
 w.BOBS_OUTLET_PLAN_GUIDE={snapshot:()=>({phase,name:'Rasipuram',title:'Expenses and mandatory staff',review:'#review',save:'#save',saveLabel:w.document.getElementById('save').textContent,message:'Saving expenses and verifying Google',next:'After verification, review Gurusamypalayam.'})};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));
 const host=w.document.getElementById('guide');w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:'outlet-plan.html',outlet:'1'},progress:{status:'ready'},savedChecklist:{name:'Rasipuram',stages:[{title:'Method selection',status:'done'},{title:'Menu and capacity',status:'review'}]}})});
 assert.equal(host.querySelector('[data-saved-progress]').open,false);
 phase='reviewed';w.document.getElementById('review').dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,60));
 assert.match(host.textContent,/Rasipuram.*Expenses and mandatory staff/);assert.match(host.textContent,/✓ Review confirmed/);assert.match(host.textContent,/Next: click “Save Rasipuram expenses/);
 assert.equal(host.querySelector('[data-saved-progress]').open,false);
 phase='saving';w.document.getElementById('status').textContent='Saving';await new Promise(r=>setTimeout(r,60));assert.match(host.textContent,/Saving and verifying in Google/);
 phase='error';w.document.getElementById('status').textContent='Failed';await new Promise(r=>setTimeout(r,60));assert.match(host.textContent,/could not be completed/);assert.doesNotMatch(host.textContent,/✓ Review confirmed/);
 }finally{w.close();}
});

const settle=()=>new Promise(r=>setTimeout(r,80));
function reviewRows(w,ids){w.BOBS_REVIEW={snapshot:()=>({rows:ids.map(id=>({node:w.document.getElementById(id),title:id+' inputs',checked:w.document.getElementById(id).checked}))}),request:n=>{w.__reviewedAgain=n;return true;}};}
test('outlet next Save action is immediately under the tick, Review again secondary; editing removes it',async()=>{
 const d=new JSDOM('<main><input id="outletsReviewed" type="checkbox"><button id="save">Save outlets & go to Kitchen Setup →</button><p id="status"></p></main><aside><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/outlets.html?guide=start'}),w=d.window;
 try{w.HTMLElement.prototype.scrollIntoView=function(){};reviewRows(w,['outletsReviewed']);w.BOBS_REVIEW.request=n=>{if(n==='#save')return false;w.__reviewedAgain=n;return true;};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide');
 w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:'outlets.html'},progress:{status:'idle'}})});
 const input=w.document.getElementById('outletsReviewed');input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));await settle();
 const row=host.querySelector('.guide-checklist-local .guide-checklist-done'),next=row.querySelector('[data-confirmation-next]');
 assert.equal(row.children[1],next);assert.match(next.textContent,/Next: Save outlets & go to Kitchen Setup/);
 const again=row.querySelector('.guide-review-again');assert.equal(again.textContent,'Review again');assert(next.compareDocumentPosition(again)&w.Node.DOCUMENT_POSITION_FOLLOWING);
 next.querySelector('button').click();assert.equal(w.document.activeElement.id,'save');assert(input.checked);
 again.click();assert.equal(w.__reviewedAgain,input);
 input.checked=false;input.dispatchEvent(new w.Event('change',{bubbles:true}));await settle();assert.equal(host.querySelector('[data-confirmation-next]'),null);
 }finally{w.close();}
});
test('recipe confirmations advance locally from intended review to Calculate to Save without a second flow',async()=>{
 const d=new JSDOM('<main><input id="referenceWeightReviewed" type="checkbox"><input id="intendedWeightReviewed" type="checkbox"><input id="confirmed" type="checkbox"></main><aside><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/recipe-cost-editor.html?guide=continue'}),w=d.window;
 try{let stage='reference',calculated=false,saves=0,calculates=0;reviewRows(w,['referenceWeightReviewed','intendedWeightReviewed','confirmed']);w.BOBS_RECIPE_GUIDE={snapshot:()=>({stage,name:'Idli',calculated}),focus(){},calculate(){calculates++;},save(){saves++;}};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide');
 w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:'recipe-cost-editor.html'},progress:{status:'idle'}})});
 async function confirm(id,next){stage=next;const n=w.document.getElementById(id);n.checked=true;n.dispatchEvent(new w.Event('change',{bubbles:true}));await settle();const row=[...host.querySelectorAll('.guide-checklist-local li')].find(li=>li.reviewNode===n);assert(row.querySelector('[data-confirmation-next]'));return row;}
 let row=await confirm('referenceWeightReviewed','intended');assert.match(row.querySelector('[data-confirmation-next]').textContent,/Review intended quantity/);
 row=await confirm('intendedWeightReviewed','calculate');row.querySelector('[data-confirmation-next] button').click();assert.equal(calculates,1);assert.equal(saves,0);
 calculated=true;row=await confirm('confirmed','save');assert.match(row.querySelector('[data-confirmation-next]').textContent,/Save reviewed recipe/);row.querySelector('[data-confirmation-next] button').click();assert.equal(saves,1);
 stage='saving';w.dispatchEvent(new w.Event('bobs-review-context'));await settle();assert.match(host.querySelector('[data-confirmation-next]').textContent,/Saving and verifying/);assert.equal(host.querySelector('[data-confirmation-next] button'),null);
 }finally{w.close();}
});
test('current production step guides the user to the original allowance control, then to Save demand',async()=>{
 const d=new JSDOM('<main><section id="sideExtraSection"><label><input type="radio" id="sideExtraNo">No — normal quantities only</label></section><button id="chooseProductionSource">Save demand</button></main><aside><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/production-plan.html?guide=continue'}),w=d.window;
 try{let stage='extra-sides',choice;w.HTMLElement.prototype.scrollIntoView=function(){};w.BOBS_PRODUCTION_GUIDE={snapshot:()=>({ready:true,itemKey:'Idli',name:'Idli',journey:{stage},checks:{quantity:true},sides:{needed:true,reviewed:true},sources:{needed:true,reviewed:true},extraSides:{needed:true,previous:false,choice}}),focus:id=>w.document.getElementById(id).focus()};
 w.document.getElementById('sideExtraNo').onchange=()=>{choice=false;stage='source-save';w.dispatchEvent(new w.Event('bobs-review-context'));};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide');w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},work(){},snapshot:()=>({ctx:{page:'production-plan.html'},progress:{status:'idle'}})});
 const current=()=>host.querySelector('.guide-checklist-local [aria-current="step"]');assert.match(current().textContent,/Previously saved: No/);current().querySelector('button').click();assert.equal(w.document.activeElement.id,'sideExtraSection');assert.equal(choice,undefined);
 w.document.getElementById('sideExtraNo').click();await settle();assert.equal(current().dataset.plannerStep,'source-save');current().querySelector('button').click();assert.equal(w.document.activeElement.id,'chooseProductionSource');assert.equal(host.querySelectorAll('.guide-checklist-local .guide-checklist-next').length,1);
 }finally{w.close();}
});

test('capital review and each outlet report keep their own Save and verified next action',async()=>{
 for(const capex of [true,false]){
 const markup=capex?'<input type="checkbox" id="capexReviewed"><button id="capexSave">Save capital plan</button><p id="capexStatus"></p>':'<section><label><input type="checkbox" id="outletReview-1">Review outlet one</label><button id="reportSave1" data-review-save="outletReview-1">Save outlet one review</button><a data-review-next href="/outlet-review.html">Next outlet / company review →</a></section>';
 const d=new JSDOM('<main>'+markup+'</main><aside><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/'+(capex?'capital-expenditure.html':'outlet-review.html')+'?guide=continue'}),w=d.window;
 try{const id=capex?'capexReviewed':'outletReview-1';reviewRows(w,[id]);w.HTMLElement.prototype.scrollIntoView=function(){};w.BOBS_REVIEW.request=()=>false;
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide'),bot=w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:capex?'capital-expenditure.html':'outlet-review.html'},progress:{status:'idle'}})});
 const n=w.document.getElementById(id);n.checked=true;n.dispatchEvent(new w.Event('change',{bubbles:true}));await settle();
 let next=host.querySelector('[data-confirmation-next]');assert.match(next.textContent,capex?/Save capital plan/:/Save outlet one review/);next.querySelector('button').click();assert.equal(w.document.activeElement.id,capex?'capexSave':'reportSave1');
 if(!capex){w.document.getElementById('reportSave1').dataset.reviewSaved='true';bot.update();next=host.querySelector('[data-confirmation-next]');assert.match(next.textContent,/Next outlet \/ company review/);assert.doesNotMatch(next.textContent,/Save outlet one/);}
 }finally{w.close();}
 }
});

test('verified kitchen source handoff replaces a remembered start question',()=>{
 const dom=new JSDOM('<main><input id="kitchenReviewed" type="checkbox" checked><button id="saveKitchen">Save supplying kitchens</button><p id="kitchenStatus">Saved</p><div id="nextAction"><a href="outlet-plan.html?outlet=Kitchen-E">Elimedu — Kitchen expenses and existing positions</a></div></main><aside id="bobsCompanion"><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/kitchen-flow.html?stage=demand&outlet=1'}),w=dom.window;
 try{
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.sessionStorage.setItem('bobs-guide-conversation-v1:1',JSON.stringify({step:'start',history:[]}));
 w.BOBS_KITCHEN_SOURCE_GUIDE={snapshot:()=>({saved:true,busy:false,title:'✓ Supplying kitchens saved and verified',instruction:'Continue with Elimedu.',next:[{label:'Elimedu — Kitchen expenses and existing positions',href:'outlet-plan.html?outlet=Kitchen-E'}]})};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide');
 w.BOBS_GUIDE_BOT.mount(host,{minimise(){},snapshot:()=>({ctx:{page:'kitchen-flow.html',outlet:'1'},progress:{status:'idle'}})});
 assert.match(host.textContent,/Supplying kitchens saved and verified/);
 assert.match(host.textContent,/Elimedu — Kitchen expenses/);
 assert.doesNotMatch(host.textContent,/Next: Save supplying/);
 }finally{dom.window.close();}
});
