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
test('production confirmation keeps explicit Yes and No choices and then offers the actual kitchen-source action',async()=>{
 const d=new JSDOM('<main><input id="quantityReviewed" type="checkbox" checked><input id="sideServingReviewed" type="checkbox" checked><section id="sideExtraSection"></section><button id="chooseProductionSource">Save confirmed demand & choose supplying kitchens</button></main><aside><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/production-plan.html?guide=continue'}),w=d.window;
 try{let stage='extra-sides',choice,selected;w.HTMLElement.prototype.scrollIntoView=function(){};w.BOBS_PRODUCTION_GUIDE={snapshot:()=>({ready:true,itemKey:'Idli',name:'Idli',journey:{stage},checks:{quantity:true},sides:{needed:true,reviewed:true},extraSides:{needed:true,choice}}),chooseExtra:v=>{choice=v;selected=v;stage='source';w.dispatchEvent(new w.Event('bobs-review-context'));},focus:id=>w.document.getElementById(id).focus()};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));const host=w.document.getElementById('guide');w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:'production-plan.html'},progress:{status:'idle'}})});
 let next=host.querySelector('[data-confirmation-next]');assert.equal(next.querySelectorAll('button').length,2);assert.equal(selected,undefined);next.querySelectorAll('button')[1].click();await settle();assert.equal(selected,false);
 next=host.querySelector('[data-confirmation-next]');assert.match(next.textContent,/choose supplying kitchens/);next.querySelector('button').click();assert.equal(w.document.activeElement.id,'chooseProductionSource');
 }finally{w.close();}
});
