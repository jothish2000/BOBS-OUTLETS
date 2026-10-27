const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=p=>fs.readFileSync(p,'utf8');
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r))};
test('opening the index itself welcomes the user automatically with the real setup entry',async()=>{
 for(const url of ['https://bobs.test/index.html','https://bobs.test/']){
 const dom=new JSDOM('<main>BOBS</main>',{runScripts:'outside-only',url}),w=dom.window;
 try{w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
  assert.equal(w.document.getElementById('bobsCompanion').hidden,false);assert.match(w.document.getElementById('bobsGuideDialogue').textContent,/Welcome to BOBS/);const a=[...w.document.querySelectorAll('#bobsGuideDialogue a')].find(a=>a.textContent==='Start guided outlet setup →');assert.equal(new URL(a.href).pathname,'/outlets.html');assert.equal(new URL(a.href).searchParams.get('guide'),'start');assert.equal(a.target,'_self');
 }finally{w.close()}
 }
});
test('index starts the guided journey; outlet choice hands off once and minimising survives page edits',async()=>{
 assert.match(source('index.html'),/href="outlets.html\?guide=start"/);
 const dom=new JSDOM('<div id="savedModal"><button>Choose saved work</button></div><input id="count" value="2"><div id="cards"><input class="name"></div><input type="checkbox" id="outletsReviewed">',{runScripts:'outside-only',url:'https://bobs.test/outlets.html?guide=start'}),w=dom.window;
 try{
 w.eval(source('bobs-roadmap-core.js'));w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
 const panel=w.document.getElementById('bobsCompanion');assert(panel.hidden,'Saved-data choice stays foremost');assert.equal(w.sessionStorage.getItem('bobs-guide-journey-v1'),'active');
 w.document.getElementById('savedModal').classList.add('hidden');w.dispatchEvent(new w.Event('bobs-outlet-choice'));await settle();
 assert(!panel.hidden);assert.match(panel.textContent,/How many outlets/);w.document.querySelector('[data-guide-choice=outlet-count]').click();assert(panel.hidden);assert.equal(w.document.activeElement.id,'count');
 w.document.getElementById('count').value='3';w.document.getElementById('count').dispatchEvent(new w.Event('input',{bubbles:true}));w.dispatchEvent(new w.Event('bobs-outlet-choice'));assert(panel.hidden);assert.equal(w.document.getElementById('count').value,'3');assert.equal(w.document.getElementById('outletsReviewed').checked,false);
 }finally{w.close()}
});
test('guided navigation adapts to the page instead of resuming a stale production question',()=>{
 for(const [page,expected]of [['kitchen-flow.html?stage=locations','Does this outlet have a kitchen'],['outlet-plan.html?stage=baseline','outlet expenses and mandatory staff'],['recipe-cost-editor.html','You are reviewing a recipe']]){
  const dom=new JSDOM('<div id="host"></div><div id="locationRows"></div><button id="addKitchen"></button><input type="checkbox" id="kitchenReviewed">',{runScripts:'outside-only',url:'https://bobs.test/'+page}),w=dom.window;
  try{w.sessionStorage.setItem('bobs-guide-conversation-v1:1',JSON.stringify({step:'equipment',history:[]}));w.eval(source('bobs-guide-bot.js'));
   const bot=w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{journey:true,snapshot:()=>({ctx:{outlet:'1',page:page.split('?')[0]},pageHelp:{title:'Outlet expenses and mandatory staff',instruction:'Review expenses and coverage.',next:'After this: menu quantities'}}),minimise(){},refresh(){}});
   assert.match(w.document.getElementById('host').textContent,new RegExp(expected));
   if(page.startsWith('kitchen-flow')){w.document.querySelector('[data-guide-choice=shared-kitchen]').click();bot.update();assert.match(w.document.getElementById('host').textContent,/Which kitchen will supply/);w.document.querySelector('[data-guide-choice=kitchen-review]').click();assert.equal(w.document.activeElement.id,'kitchenReviewed');assert.equal(w.document.getElementById('kitchenReviewed').checked,false);}
  }finally{w.close()}
 }
});
test('companion follows the owner, displays real pending requirements, and never treats a draft as verified',async()=>{
 const dom=new JSDOM('<main><input id="quantity" value="540"></main>',{runScripts:'outside-only',url:'https://bobs.test/production-plan.html?outlet=1'}),w=dom.window;let writes=0;
 try{
 for(const p of ['shared_data.js','method2-core.js','bobs-cost-flow.js','idli-support-core.js','bobs-outlet-flow-core.js','bobs-salary-package-core.js','bobs-production-plan-core.js','bobs-capital-core.js','bobs-outlet-report.js','bobs-roadmap-core.js','bobs-kitchen-core.js','bobs-roadmap-outlet-flow.js'])w.eval(source(p));
 w.BOBS_CONFIG={DATA_VAULT_WEB_APP_URL:'https://fixture.invalid'};w.BOBS_VERIFIED={save(){writes++}};w.BOBS_RECIPE_KNOWLEDGE={};w.BOBS_OPERATIONAL_RECIPES={};w.BOBS_KITCHENS={isKitchen:()=>false};
 w.BOBS_DATA={jsonp:async p=>p.action==='outletList'?{ok:true,outlets:[{outletId:'1',outletName:'Trial',data:{shiftTimes:[{start:'06:00',end:'14:00'}]}}]}:{ok:true,found:false}};
 w.eval(source('bobs-guide-bot.js'));w.eval(source('bobs-roadmap.js'));await settle();
 const button=w.document.getElementById('bobsCompanionToggle'),panel=w.document.getElementById('bobsCompanion');assert(panel.hidden);button.click();await settle();assert(!panel.hidden);assert.match(panel.textContent,/Next: Outlet count/);assert.match(panel.textContent,/Working capital/);assert.match(panel.textContent,/Ideal Price Builder/);
 assert.match(panel.textContent,/What are you trying to do/);
 const assets=[...panel.querySelectorAll('a')].find(a=>a.textContent==='Open Asset Master →');assert.equal(new URL(assets.href).searchParams.get('outlet'),'1');
 const quantity=w.document.getElementById('quantity');quantity.value='1200';quantity.dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(panel.textContent,/Unsaved changes/);assert.equal(quantity.value,'1200');assert.equal(writes,0);
 panel.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(panel.hidden);assert.equal(w.document.activeElement,button);
 }finally{w.close()}
});
test('asset capacity reference remains estimated, validates evidence, and price selection does not confirm a quotation',()=>{
 const dom=new JSDOM('<section><h3>Steamer</h3><input data-field="unitCost"><input type="checkbox" data-field="costConfirmed" checked></section>',{runScripts:'outside-only'}),w=dom.window;
 try{w.eval(source('bobs-equipment-references.js'));w.eval(source('bobs-asset-guidance.js'));const a={id:'machine1',name:'Idli steamer'},row=w.document.querySelector('section');let changes=0;w.BOBS_ASSET_GUIDANCE.render(row,a,()=>changes++);
 [...row.querySelectorAll('button')].find(b=>b.textContent.includes('120 Idlis')).click();w.BOBS_ASSET_GUIDANCE.read(row,a);assert.equal(a.capacityFacts.status,'estimate');assert.equal(a.capacityFacts.value,'120');assert.match(a.capacityNote,/Reference estimate/);
 [...row.querySelectorAll('button')].find(b=>b.textContent==='Use this price as an estimate').click();assert.equal(row.querySelector('[data-field="unitCost"]').value,'26000');assert.equal(row.querySelector('[data-field="costConfirmed"]').checked,false);assert.equal(a.priceReference.status,'estimate');assert.equal(changes,2);
 row.querySelector('[data-capacity-field="status"]').value='confirmed';row.querySelector('[data-capacity-field="evidence"]').value='';w.BOBS_ASSET_GUIDANCE.read(row,a);assert.throws(()=>w.BOBS_ASSET_GUIDANCE.validate(a),/confirming capacity/);
 }finally{w.close()}
});


test('a recipe child resumes with its own controls, without returning to production or confirming anything',()=>{
 const dom=new JSDOM('<div id="host"></div><section id="referenceSection"></section><button id="scale">Calculate</button><input type="checkbox" id="confirmed">',{runScripts:'outside-only',url:'https://bobs.test/recipe-cost-editor.html?outlet=1'}),w=dom.window;let clicks=0;
 try{w.sessionStorage.setItem('bobs-guide-conversation-v1:1',JSON.stringify({step:'recipes',history:[]}));w.document.getElementById('scale').onclick=()=>clicks++;w.eval(source('bobs-guide-bot.js'));
 w.BOBS_GUIDE_BOT.mount(w.document.getElementById('host'),{snapshot:()=>({ctx:{outlet:'1',page:'recipe-cost-editor.html'}}),minimise(){},refresh(){}});
 assert.match(w.document.getElementById('host').textContent,/You are reviewing a recipe/);w.document.querySelector('[data-guide-choice=page-scale]').click();assert.equal(w.document.activeElement.id,'scale');assert.equal(clicks,0);assert.equal(w.document.getElementById('confirmed').checked,false);
 }finally{w.close()}
});
