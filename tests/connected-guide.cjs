const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=p=>fs.readFileSync(p,'utf8');
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r))};
test('companion follows the owner, displays real pending requirements, and never treats a draft as verified',async()=>{
 const dom=new JSDOM('<main><input id="quantity" value="540"></main>',{runScripts:'outside-only',url:'https://bobs.test/production-plan.html?outlet=1'}),w=dom.window;let writes=0;
 try{
 for(const p of ['shared_data.js','method2-core.js','bobs-cost-flow.js','idli-support-core.js','bobs-outlet-flow-core.js','bobs-salary-package-core.js','bobs-production-plan-core.js','bobs-capital-core.js','bobs-outlet-report.js','bobs-roadmap-core.js','bobs-kitchen-core.js','bobs-roadmap-outlet-flow.js'])w.eval(source(p));
 w.BOBS_CONFIG={DATA_VAULT_WEB_APP_URL:'https://fixture.invalid'};w.BOBS_VERIFIED={save(){writes++}};w.BOBS_RECIPE_KNOWLEDGE={};w.BOBS_OPERATIONAL_RECIPES={};w.BOBS_KITCHENS={isKitchen:()=>false};
 w.BOBS_DATA={jsonp:async p=>p.action==='outletList'?{ok:true,outlets:[{outletId:'1',outletName:'Trial',data:{shiftTimes:[{start:'06:00',end:'14:00'}]}}]}:{ok:true,found:false}};
 w.eval(source('bobs-roadmap.js'));await settle();
 const button=w.document.getElementById('bobsCompanionToggle'),panel=w.document.getElementById('bobsCompanion');assert(panel.hidden);button.click();await settle();assert(!panel.hidden);assert.match(panel.textContent,/Next: Outlet count/);assert.match(panel.textContent,/Working capital/);assert.match(panel.textContent,/Ideal Price Builder/);
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
