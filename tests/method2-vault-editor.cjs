const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=f=>fs.readFileSync(f,'utf8'),clone=x=>JSON.parse(JSON.stringify(x));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
async function until(fn){for(let n=0;n<100;n++){if(fn())return;await new Promise(r=>setTimeout(r,5))}throw Error('Expected editor state did not arrive')}
function fixture({mode='production',initial=null,optional=null,standardUnavailable=false,standardRecords,marketRecords,packingRequired=false,condiments=[],savedReviews=null,setupPlan,hash="",historyState,referrer}={}){
 const dom=new JSDOM(source('method2-item.html'),{url:'https://bobs.test/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode='+mode+hash,referrer,runScripts:'outside-only'}),w=dom.window,$=id=>w.document.getElementById(id);
 if(historyState)w.history.replaceState(historyState,"",w.location.href);
 if(savedReviews){for(const [k,v] of savedReviews)w.sessionStorage.setItem(k,v)}w.confirm=()=>true;w.close=()=>{};w.opener={closed:false,focus(){},postMessage(){}};w.BroadcastChannel=class{postMessage(){}close(){}};
 w.eval(source('bobs-number-format.js'));w.eval(source('shared_data.js')+';window.ITEM_DATA=ITEM_DATA;');w.eval(source('method2-core.js'));
 const recipes=[{name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',3,'kg',60]]}];
 const draft={mode,unit:'piece',batchSize:120,batches:mode==='purchased'?360:3,capacity:1000,sold:290,price:10,spoilage:0,uuwp:5,uuwpPolicy:'always',markup:25,pricingBasis:'markup',condiments,packaging:[],packingMode:'none',mainPacking:{packingMode:'none',packaging:[],packingPer:1},commonPacking:{packingMode:'none',packaging:[],packingPer:1},purchase:{basis:'unit',supplyUnit:'piece',unit:'piece',qty:1,total:2},soldConfirmed:true};
 if(packingRequired){draft.mainPacking={packingMode:'required',packingPer:2,packaging:[{name:'Box',qty:1,unitCost:2}]};draft.commonPacking={packingMode:'required',packingPer:3,packaging:[{name:'Bag',qty:1,unitCost:1}]};}
 let db={'1/METHOD2/default':{itemEditors:{'Breakfast Catalogue::0':draft}}},fail=false,standardCalls=0;const reads=[],writes=[];
 w.BOBS_DATA={jsonp:async p=>{reads.push(p.module);if(p.module==='RECIPE_MASTER')throw Error('Legacy recipe access forbidden');if(p.module==='METHOD2'&&initial){const v=initial;initial=null;return v.promise}if(p.module==='METHOD2'&&fail)throw Error('Google Data Vault timeout');if(p.module==='IDLI_SUPPORT'&&optional)return optional.promise;const data=db[p.outletId+'/'+p.module+'/'+p.recordKey];return {ok:true,found:!!data,data:clone(data??null)}},saveModule:async(o,m,k,d)=>{writes.push(m);db[o+'/'+m+'/'+k]=clone(d)}};
 w.BOBS_RECIPE_KNOWLEDGE={loadStandards:async()=>{standardCalls++;if(standardUnavailable)throw Error('Google standard timeout');return standardRecords===null?null:{records:clone(standardRecords===undefined?recipes:standardRecords)}}};w.BOBS_MARKET_REFERENCES=clone(marketRecords===undefined?recipes:marketRecords);w.BOBS_PORIYAL=[];
 for(const path of ['bobs-cost-flow.js','idli-support-core.js','bobs-verified-store.js','bobs-full-cost-reader.js'])w.eval(source(path));w.BOBS_FULL_COST.load=()=>optional?optional.promise:Promise.resolve({error:'No cost plan'});w.IdliSupportReaders={renderItem:(box,r,e)=>box.textContent=e||'Support'};
 w.eval(source('bobs-operational-recipes.js'));w.eval(source('method2-packing-ui.js'));
 if(setupPlan){for(const path of ['bobs-outlet-flow-core.js','bobs-production-plan-core.js','bobs-item-full-cost.js','bobs-cost-detail-links.js'])w.eval(source(path));setupPlan(w,db);}
 w.eval(source('method2-item.js'));
 return {dom,w,$,reads,writes,recipes,get db(){return db},setFail:v=>fail=v,get standardCalls(){return standardCalls}};
}
test('cold required read gates Save; optional pending/failure never blocks editor; no legacy reads',async()=>{
 const initial=deferred(),optional=deferred(),x=fixture({initial,optional});assert(x.$('controls').disabled);assert(x.$('editor').hidden);await x.$('editor').onsubmit({preventDefault(){}});assert.equal(x.writes.length,0);
 initial.resolve({ok:true,data:x.db['1/METHOD2/default']});await until(()=>!x.$('controls').disabled);assert.equal(x.$('sold').value,'290');assert.match(x.$('idliLabourCost').textContent,/Loading staffing/);
 optional.reject(Error('optional timeout'));await until(()=>x.$('idliLabourCost').textContent.includes('optional timeout'));assert(!x.$('editor').hidden);assert.equal(x.writes.length,0);assert(!x.reads.includes('RECIPE_MASTER'));x.dom.window.close();
});
test('failed required read stays disabled; manual retry fresh load succeeds',async()=>{
 const initial=deferred(),x=fixture({initial});initial.reject(Error('Google Data Vault timeout'));await until(()=>!x.$('retryGoogle').hidden);assert(x.$('controls').disabled);assert(x.$('editor').hidden);assert(x.$('itemGuide').hidden);x.$('retryGoogle').click();await until(()=>!x.$('controls').disabled);assert.match(x.$('status').textContent,/Loaded from Google/);assert.equal(x.writes.length,0);x.dom.window.close();
});
test('normal save uses fresh standard, verified backup and readback; reload retains quantity; refresh never reads legacy',async()=>{
 const x=fixture();await until(()=>!x.$('controls').disabled);const before=x.standardCalls;
 await x.$('editor').onsubmit({preventDefault(){}});assert.equal(x.$('saveStatus').textContent,'Verified in Google',x.$('status').textContent);assert(x.standardCalls>before);assert.deepEqual(x.writes,['METHOD2_BACKUPS','METHOD2']);assert(x.reads.filter(x=>x==='METHOD2').length>=4);assert.equal(Number(x.db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].sold),290);
 x.w.dispatchEvent(new x.w.MessageEvent('message',{origin:'https://bobs.test',data:{type:'bobs-recipe-master-saved'}}));await until(()=>x.standardCalls>before+1);assert(!x.reads.includes('RECIPE_MASTER'));x.dom.window.close();
});
test('save-time failed required Google read cannot write; both mode routes and native recipe quantity survive',async()=>{
 for(const mode of ['production','purchased']){const x=fixture({mode});await until(()=>!x.$('controls').disabled);assert.equal(x.$('mode').value,mode);assert.equal(x.$('idealBuilderJump').hidden,false);const link=new URL(x.$('supplyRecipeLink').querySelector('a').href);assert.equal(link.searchParams.get('outlet'),'1');assert.equal(link.pathname,mode==='production'?'/recipe-cost-editor.html':'/purchase-cost-editor.html');if(mode==='production')assert.equal(link.searchParams.get('qty'),'360');x.setFail(true);await x.$('editor').onsubmit({preventDefault(){}});assert.equal(x.writes.length,0);assert.match(x.$('status').textContent,/timeout/);x.dom.window.close();}
});

test('plain-language guide distinguishes fallback and purchase, shows three steps, and never saves on load',async()=>{
 for(const opts of [{},{standardUnavailable:true},{mode:'purchased',standardUnavailable:true}]){
  const x=fixture(opts);assert(x.$('itemGuide').hidden);await until(()=>!x.$('controls').disabled);
  assert(!x.$('itemGuide').hidden);assert.equal(x.$('itemGuide').querySelectorAll('ol > li').length,3);
  assert.match(x.$('itemGuide').textContent,/Edits are not saved automatically/);
  const title=x.$('guideSourceTitle').textContent;
  assert.match(title,opts.mode==='purchased'?/supplier/:opts.standardUnavailable?/BOBS standard recipe unavailable/:/BOBS standard recipe loaded from Google Sheets/);
  assert.equal(x.$('guideCostLink').querySelector('a').href,x.$('supplyRecipeLink').querySelector('a').href);
  assert.equal(x.writes.length,0);
  x.$('mode').value=opts.mode==='purchased'?'production':'purchased';x.$('mode').dispatchEvent(new x.w.Event('change'));
  assert.match(x.$('guideSourceTitle').textContent,opts.mode==='purchased'?/BOBS standard recipe unavailable/:/supplier/);
  x.dom.window.close();
 }
});

test('guide reports this item source for empty, failed and mixed standard reads without implying deletion or search',async()=>{
 const other={name:'Sambar',yieldQty:5,yieldUnit:'L',ingredients:[['Dal',1,'kg',100]]};
 for(const opts of [{standardRecords:null},{standardRecords:[]},{standardUnavailable:true},{standardRecords:[other]}]){
  const x=fixture(opts);await until(()=>!x.$('controls').disabled);
  assert.equal(x.$('guideSourceTitle').textContent,'BOBS standard recipe unavailable');
  assert.match(x.$('guideSourceText').textContent,/for this item from Google Sheets/);
  assert.match(x.$('guideSourceText').textContent,/previously prepared market-reference recipe/);
  assert.doesNotMatch(x.$('guideSourceText').textContent,/deleted|Google standard|search/i);
  assert.equal(x.writes.length,0);x.dom.window.close();
 }
 const x=fixture({marketRecords:[other]});await until(()=>!x.$('controls').disabled);
 assert.equal(x.$('guideSourceTitle').textContent,'BOBS standard recipe loaded from Google Sheets');
 assert.match(x.$('guideSourceText').textContent,/retrieved the BOBS standard recipe for this item from Google Sheets/);
 assert.match(x.$('guideSourceText').textContent,/Check each side/);x.dom.window.close();
});
test('guide does not claim a fallback exists for an item missing from both collections',async()=>{
 const other={name:'Sambar',yieldQty:5,yieldUnit:'L',ingredients:[['Dal',1,'kg',100]]};
 const x=fixture({standardRecords:[other],marketRecords:[]});await until(()=>!x.$('controls').disabled);
 assert.equal(x.$('guideSourceTitle').textContent,'Recipe unavailable for this item');
 assert.match(x.$('guideSourceText').textContent,/no previously prepared market-reference recipe is available/);
 assert.equal(x.writes.length,0);x.dom.window.close();
});

test('complete required main/common packing loads, recalculates and saves without salesUnit crash',async()=>{
 const x=fixture({packingRequired:true});await until(()=>!x.$('controls').disabled);
 assert.match(x.$('status').textContent,/Loaded from Google/);
 assert.match(x.$('packingSummary').textContent,/2 sales units/);
 assert.match(x.$('commonPacking').textContent,/3 sales units/);
 assert.equal(x.writes.length,0);
 x.$('sold').value='288';x.$('sold').dispatchEvent(new x.w.Event('input'));
 assert.match(x.$('packingSummary').textContent,/288 sold → 144 whole sets/);
 await x.$('editor').onsubmit({preventDefault(){}});
 assert.equal(x.$('saveStatus').textContent,'Verified in Google',x.$('status').textContent);
 assert.equal(x.db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].mainPacking.packingPer,2);
 assert.deepEqual(x.writes,['METHOD2_BACKUPS','METHOD2']);x.dom.window.close();
});
test('packing summaries use each main, side and common element unit; display never changes raw values',async()=>{
 const x=fixture();await until(()=>!x.$('controls').disabled);
 for(const [name,unit,per,sold,expected,flags] of [
 ['Idli','piece',2,3,['2 sales units','3 sold'],{main:true}],
 ['Sambar','kg',0.002,0.006,['0.002 sales units','0.006 sold'],{}],
 ['Common / order','carton',2,4,['2 sales units','4 sold'],{common:true}]
 ]){
  const data={packingMode:'required',packingPer:per,packaging:[{name:'Container',qty:1,unitCost:2}]},before=clone(data);
  const el=x.w.M2PackingUI.create(data,{name,salesUnit:unit,changed(){},...flags});
  const p={missing:[],mode:'required',perPack:2,per,perItem:2/per,parcels:3,total:6,allocated:6/sold};
  x.w.M2PackingUI.update(el,{packingCost:p},sold);
  for(const text of expected)assert(el.textContent.includes(text),el.textContent);
  x.w.M2PackingUI.update(el,{packingCost:p},null);assert(!el.querySelector('.packing-summary').textContent.includes('sold →'));
  assert.deepEqual(JSON.parse(JSON.stringify(data)),before);
 }
 x.dom.window.close();
});

 test('Idli save advances to Sambar and Chutney, duplicate or stale receipts cannot skip a side',async()=>{
 const sides=[{name:'Idli Sambar',yieldQty:10,yieldUnit:'L',ingredients:[['Dal',2,'kg',80]]},{name:'Coconut Chutney',yieldQty:2,yieldUnit:'kg',ingredients:[['Coconut',1,'kg',60]]}];
 const standardRecords=[{name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',3,'kg',60]]},...sides],condiments=sides.map((r,i)=>({recipeName:r.name,source:'recipe',portion:i?20:50,portionUnit:i?'g':'ml',packingMode:'none'}));
 const f=fixture({standardRecords,condiments});await until(()=>!f.$('controls').disabled);
 async function verified(r,index){
  const record={recipe:r,referenceStamp:f.w.BOBS_COST_FLOW.recipeStamp(r),savedAt:'verified-'+index};
  const store=f.db['1/METHOD2/default'];store.recipeOverrides={...store.recipeOverrides,[r.name.toLowerCase()]:record};
  return {type:'bobs-recipe-master-saved',outlet:'1',recipeName:r.name,savedAt:record.savedAt};
 }
 const idli=await verified(standardRecords[0],0);
 let next=await f.w.BOBS_NEXT_RECIPE(idli);
 assert.equal(new URL(next).searchParams.get('item'),'Idli Sambar');
 assert.equal(new URL(next).searchParams.get('qty'),'18');assert.equal(f.$('guideStep1').getAttribute('aria-current'),'step');
 assert.equal(await f.w.BOBS_NEXT_RECIPE(idli),next);
 const sambar=await verified(sides[0],1);assert.match((await f.w.BOBS_NEXT_RECIPE({...sambar,savedAt:'stale'})).pendingMessage,/could not confirm/);
 next=await f.w.BOBS_NEXT_RECIPE(sambar);assert.equal(new URL(next).searchParams.get('item'),'Coconut Chutney');
 assert.equal(new URL(next).searchParams.get('qty'),'7.2');
 assert.equal(await f.w.BOBS_NEXT_RECIPE(await verified(sides[1],2)),null);
 assert.match(f.$('guideCostLink').textContent,/Combined serving food cost: ₹2.90 per piece/);
 assert.equal(f.$('guideStep2').getAttribute('aria-current'),'step');
 f.dom.window.close();
});

const servingRecipes=[
 {name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',3,'kg',60]]},
 {name:'Idli Sambar',yieldQty:10,yieldUnit:'L',ingredients:[['Dal',2,'kg',80]]},
 {name:'Coconut Chutney',yieldQty:2,yieldUnit:'kg',ingredients:[['Coconut',1,'kg',60]]}
];
const selectedKey='Breakfast Catalogue::0',planTime=new Date().toISOString();
async function itemGuideWithSavedPlan(options={}){
 const condiments=options.mode==='purchased'?[]:servingRecipes.slice(1).map((recipe,i)=>({
  recipeName:recipe.name,source:'recipe',portion:i?20:50,portionUnit:i?'g':'ml',packingMode:'none'
 }));
 const f=fixture({...options,standardRecords:servingRecipes,condiments,setupPlan(w,db){
  w.HTMLElement.prototype.scrollIntoView=function(){};
  const raw=db['1/METHOD2/default'];
  raw.selection={'Breakfast Catalogue':{indices:[0]}};
  raw.recipeOverrides=Object.fromEntries(servingRecipes.map(r=>[w.M2.norm(r.name),{
   recipe:r,referenceStamp:w.BOBS_COST_FLOW.recipeStamp(r),savedAt:'saved-'+r.name
  }]));
  raw.kitchenSources=Object.fromEntries([selectedKey,...condiments.map(c=>selectedKey+':'+c.recipeName)].map(key=>[key,{kitchenId:'Kitchen 1'}]));
  const F=w.BOBS_OUTLET_FLOW,P=w.BOBS_PRODUCTION_PLAN,M=w.M2;
  const items=F.selected(M.state(raw),w.ITEM_DATA,M),date=w.BOBS_COST_FLOW.today(),assets={assets:[]};
  if(options.handoff)w.sessionStorage.setItem('bobs-plan-handoff:'+JSON.stringify(['1','Breakfast Catalogue','0',date]),JSON.stringify({savedAt:options.handoff}));
  const requirements=P.requirements(items,servingRecipes,F,M);
  const production={reviewed:true,date,savedAt:planTime,sourceStamp:P.source(items,servingRecipes,assets,F,M),
   items:{[selectedKey]:{capacityReviewed:true,recipeReviewed:true,itemStamp:F.menuStamp(items),recipeStamp:F.recipeStamp(items,servingRecipes,M),deadline:'10:00'}},
   processes:requirements.map(req=>({id:req.key,primary:true,requirementKey:req.key,name:req.name,role:'Cook',unit:req.unit,
    quantityMode:'demand',capacity:req.qty,start:'05:00',deadline:'10:00',setup:5,active:5,machine:0,supervision:0,finish:5,
    clean:5,passive:0,assetSlots:[],manualReason:'Manual preparation',reviewed:true}))};
  if(options.reviewedRecipes){
   const evidence=requirements.map(req=>[selectedKey,req.recipe.name,req.qty,w.BOBS_COST_FLOW.recipeStamp(req.recipe),'saved-'+req.recipe.name]);
   production.items[selectedKey].reviewedRecipes=options.reviewedRecipes(evidence).map(row=>JSON.stringify(row));
  }
  P.reconcile(production,items,servingRecipes,assets,F,M,date);
  db['1/ASSET_MASTER/default']=assets;
  db['1/OUTLET_PRODUCTION_PLAN/default']=production;
  db['1/OUTLET_BASELINE/default']={reviewed:true,positions:[]};
  if(options.kitchen){
   for(const file of ['bobs-kitchen-core.js','bobs-kitchen-store.js'])w.eval(source(file));
   const id='Kitchen-Elimedu',token='reviewed-demand';
   const sources=Object.fromEntries(Object.keys(raw.kitchenSources).map(key=>[key,{kitchenId:id,date,readyBy:'07:00'}]));
   raw.kitchenSources=sources;raw.itemEditors[selectedKey].planningToken=token;
   db['1/OUTLET_DEMAND/'+date]={date,items:{[selectedKey]:{cat:'Breakfast Catalogue',i:0,name:'Idli',inputs:{...raw.itemEditors[selectedKey]},sources}}};
   w.BOBS_KITCHENS.progress=options.kitchen;
   w.BOBS_KITCHENS.itemCosts=async()=>({items:{}});
  }
 }});
 const {w,$}=f;
 await until(()=>!$('controls').disabled&&$('idliLabourCost')?.dataset.guideState==='ready');
 assert.equal($('idliLabourCost').dataset.productionReady,'true','saved shared production plan reconciles for all required recipes');
 assert.match($('idliLabourCost').querySelector('.flow-current').textContent,/delivery \/ no-delivery/);
 w.eval(source('bobs-item-guide.js'));w.eval(source('bobs-guide-bot.js'));
 const guide=w.document.createElement('aside');w.document.body.append(guide);
 const snapshot=()=>w.BOBS_ITEM_GUIDE.snapshot();
 const bot=w.BOBS_GUIDE_BOT.mount(guide,{snapshot:()=>({ctx:{page:'method2-item.html',outlet:'1'},itemHelp:snapshot()}),minimise(){},work(){}});
 function openPlan(){
  const link=$('productionEntry').querySelector('a');
  w.addEventListener('click',e=>e.preventDefault(),{once:true});
  link.click();
 }
 const receipt={type:'bobs-production-plan-saved',outlet:'1',key:selectedKey,savedAt:planTime};
 async function message(overrides={},origin=w.location.origin){
  w.dispatchEvent(new w.MessageEvent('message',{origin,data:{...receipt,...overrides}}));
  for(let n=0;n<5;n++)await new Promise(r=>setImmediate(r));
  bot.update();
 }
 function expectPlan(phase){
  bot.update();
  assert.equal($('productionEntry').dataset.planReview,phase);
  assert.equal(snapshot().selector,'#productionEntry a');
  assert.match(guide.textContent,/Open Idli production plan/);
  assert.equal(guide.querySelector('a[href*="production-plan.html"]'),null,'The real page control opens the planner');
  assert.doesNotMatch(guide.textContent,/save this item’s delivery|review delivery \/ no-delivery choice/i);
 }
 function expectPending(name){
  const h=snapshot();assert.equal(h.selector,'#guideCostLink [data-next-cost]');
  assert.equal(new URL(w.document.querySelector(h.selector).href).searchParams.get('item'),name);
  bot.update();assert(guide.textContent.includes(name));
  assert.doesNotMatch(guide.textContent,/save this item’s delivery|review delivery \/ no-delivery choice/i);
 }
 return {...f,snapshot,expectPlan,expectPending,openPlan,message,guide};
}

test('saved plan and missing delivery still start at Open Idli production plan; only its verified return advances',async()=>{
 const f=await itemGuideWithSavedPlan();
 try{
  assert.deepEqual(Array.from(f.$('guideCostLink').querySelectorAll('li > a'),a=>a.textContent),servingRecipes.map(r=>'Review — '+r.name));
  assert.equal(f.$('productionEntry').dataset.sourceRequired,'false');
  f.expectPlan('unopened');
  await f.message();f.expectPlan('unopened');
  f.openPlan();f.expectPlan('opened');
  for(const [update,origin] of [[{outlet:'2'}],[{key:'Breakfast Catalogue::1'}],[{savedAt:'older-save'}],
   [{type:'bobs-production-demand-saved'}],[{},'https://other.test']]){
   await f.message(update,origin);f.expectPlan('opened');
  }
  const plan=f.db['1/OUTLET_PRODUCTION_PLAN/default'].items[selectedKey],stamp=plan.itemStamp;
  plan.itemStamp='obsolete';await f.message();f.expectPlan('opened');
  plan.itemStamp=stamp;await f.message();
  assert.equal(f.$('productionEntry').dataset.planReview,'verified');
  f.expectPending('Idli');
  assert.notEqual(f.w.location.hash,'#idliLabourCost');
  assert.deepEqual(f.writes,[]);
 }finally{f.dom.window.close();}
});

test('verified plan guides Idli, Sambar and Chutney in order as each saved recipe is explicitly kept',async()=>{
 const f=await itemGuideWithSavedPlan();
 try{
  f.openPlan();await f.message();f.expectPending('Idli');
  for(const [index,recipe] of servingRecipes.entries()){
   const keep=Array.from(f.$('guideCostLink').querySelectorAll('button')).find(b=>b.textContent==='Keep reviewed '+recipe.name);
   assert(keep);keep.click();
   if(index+1<servingRecipes.length){
    f.expectPending(servingRecipes[index+1].name);
    await f.message();f.expectPending(servingRecipes[index+1].name);
   }
  }
  assert.equal(f.$('guideCostLink').querySelector('[data-next-cost]'),null);
  assert.match(f.$('guideCostLink').textContent,/Combined serving food cost/);
  assert.equal(f.snapshot().selector,'#batchSize');
  assert.equal(f.$('sold').value,'290');
  assert.deepEqual(f.writes,[]);
 }finally{f.dom.window.close();}
});

test('purchased-only item proceeds directly to its supplier, and an explicit cost link opens the delivery choice',async()=>{
 const purchase=await itemGuideWithSavedPlan({mode:'purchased'});
 try{
  assert(purchase.$('productionEntry').hidden);
  const h=purchase.snapshot(),supplier=purchase.w.document.querySelector(h.selector);
  assert.equal(h.onPage,true);assert.equal(new URL(supplier.href).pathname,'/purchase-cost-editor.html');
  assert(purchase.guide.textContent.includes(supplier.textContent));assert.equal(purchase.guide.querySelector('a[href*="purchase-cost-editor.html"]'),null);
  assert.equal(purchase.guide.querySelector('a[href*="production-plan.html"]'),null);
  assert.deepEqual(purchase.writes,[]);
 }finally{purchase.dom.window.close();}
 const cost=await itemGuideWithSavedPlan({hash:'#idliLabourCost'});
 try{
  assert.equal(cost.snapshot().selector,'#itemDelivery');
  assert.match(cost.guide.textContent,/delivery/i);
  assert.deepEqual(cost.writes,[]);
 }finally{cost.dom.window.close();}
});

test('the current planner return inherits only this item and quantity’s verified recipe evidence',async()=>{
 const f=await itemGuideWithSavedPlan({reviewedRecipes:rows=>[
  rows[0],['other item',...rows[1].slice(1)],[...rows[1].slice(0,4),'superseded save'],[...rows[2].slice(0,2),rows[2][2]*2,...rows[2].slice(3)]
 ]});
 try{
  f.expectPlan('unopened');
  f.openPlan();await f.message();f.expectPending('Idli Sambar');
  const rows=Array.from(f.$('guideCostLink').querySelectorAll('li > a'),a=>a.textContent);
  assert.deepEqual(rows,['Reviewed — Idli','Review — Idli Sambar','Review — Coconut Chutney']);
  const keep=f.$('guideCostLink').querySelector('li:nth-child(2) button');keep.click();f.expectPending('Coconut Chutney');
  assert.deepEqual(f.writes,[]);
 }finally{f.dom.window.close();}
 const all=await itemGuideWithSavedPlan({reviewedRecipes:rows=>rows});
 try{
  all.expectPlan('unopened');all.openPlan();await all.message();
  assert.equal(all.$('guideCostLink').querySelector('[data-next-cost]'),null);
  assert.equal(all.snapshot().selector,'#batchSize');assert.deepEqual(all.writes,[]);
 }finally{all.dom.window.close();}
});

test('same-item reload resumes the verified plan and remaining recipe; a new visit still starts at its production plan',async()=>{
 const original=await itemGuideWithSavedPlan();
 let session,historyState;
 try{
  original.openPlan();await original.message();original.expectPending('Idli');
  original.$('guideCostLink').querySelector('button').click();original.expectPending('Idli Sambar');
  session=Object.entries(original.w.sessionStorage);
  historyState=structuredClone(original.w.history.state);
 }finally{original.dom.window.close();}
 const resumed=await itemGuideWithSavedPlan({savedReviews:session,historyState});
 try{resumed.expectPending('Idli Sambar');assert.deepEqual(resumed.writes,[]);}finally{resumed.dom.window.close();}
 const fresh=await itemGuideWithSavedPlan({savedReviews:session});
 try{fresh.expectPlan('unopened');assert.deepEqual(fresh.writes,[]);}finally{fresh.dom.window.close();}
});

test('same-window planner handoff requires a matching saved version and leaves a plain checklist bookmark at plan setup',async()=>{
 const planner='https://bobs.test/production-plan.html?outlet=1&cat=Breakfast+Catalogue&i=0';
 for(const [referrer,handoff,expected] of [[planner,planTime,'verified'],[planner,'older','opened'],
  ['https://other.test/production-plan.html',planTime,'unopened'],[undefined,planTime,'unopened']]){
  const f=await itemGuideWithSavedPlan({hash:'#itemRecipeChecklist',referrer,handoff});
  try{
   assert.equal(f.$('productionEntry').dataset.planReview,expected);
   if(expected==='verified')f.expectPending('Idli');else f.expectPlan(expected);
   assert.deepEqual(f.writes,[]);
  }finally{f.dom.window.close();}
 }
 const complete=await itemGuideWithSavedPlan({hash:'#itemRecipeChecklist',referrer:planner,handoff:planTime,reviewedRecipes:rows=>rows});
 try{
  assert.equal(complete.$('productionEntry').dataset.planReview,'verified');
  assert.equal(complete.$('guideCostLink').querySelector('[data-next-cost]'),null);
  assert.equal(complete.snapshot().selector,'#batchSize','the same-window return with all serving costs reviewed resumes actual quantities');
  assert.deepEqual(complete.writes,[]);
 }finally{complete.dom.window.close();}
});

test('verified shared demand names the supplying kitchen and waits for evidence covering all three orders',async()=>{
 const hold=deferred(),id='Kitchen-Elimedu';
 const orders=servingRecipes.map((r,n)=>({outlet:'1',itemKey:selectedKey,key:n?selectedKey+':'+r.name:selectedKey}));
 const next={title:'Equipment, capacity and production time',href:'production-plan.html?outlet='+id};
 let response=hold.promise;
 const f=await itemGuideWithSavedPlan({kitchen:async(owner,scan,date)=>{
  assert.equal(owner,id);assert.equal(date,f.w.BOBS_COST_FLOW.today());return response;
 }});
 try{
  f.openPlan();await f.message({type:'bobs-production-demand-saved',serviceDate:f.w.BOBS_COST_FLOW.today(),token:'reviewed-demand'});
  assert.equal(f.snapshot().selector,'#itemKitchenSteps');
  assert.equal(f.$('productionEntry').dataset.planReview,'opened');
  hold.resolve({name:'Elimedu kitchen',productionNext:next,orders});
  await until(()=>f.snapshot().selector==='#itemKitchenSteps a[href]');
  const link=f.w.document.querySelector(f.snapshot().selector);
  assert.equal(link.dataset.kitchenName,'Elimedu kitchen');assert.equal(new URL(link.href).searchParams.get('outlet'),id);
  assert(f.snapshot().instruction.includes(link.textContent));assert(f.snapshot().instruction.includes('Elimedu kitchen'));
  for(const proof of [{orders:orders.slice(0,2)}, {orders:orders.map(x=>({...x,outlet:'2'}))}]){
   response={name:'Elimedu kitchen',...proof};
   f.w.dispatchEvent(new f.w.Event('focus'));
   await until(()=>f.snapshot().selector==='#itemKitchenSteps button');
   assert.equal(f.$('productionEntry').dataset.planReview,'opened');
   assert.match(f.$('itemKitchenSteps').textContent,/every selected item and accompaniment/);
  }
  response={name:'Elimedu kitchen',orders};
  f.w.document.querySelector(f.snapshot().selector).click();
  await until(()=>f.$('productionEntry').dataset.planReview==='verified');
  f.expectPending('Idli');
  const daily=f.db['1/OUTLET_DEMAND/'+f.w.BOBS_COST_FLOW.today()];
  daily.items[selectedKey].inputs.planningToken='changed-after-kitchen-review';
  f.w.dispatchEvent(new f.w.Event('focus'));
  await until(()=>f.snapshot().selector==='#itemKitchenSteps button');
  assert.equal(f.$('productionEntry').dataset.planReview,'opened');
  assert.match(f.$('itemKitchenSteps').textContent,/saved demand changed/);assert.deepEqual(f.writes,[]);
 }finally{f.dom.window.close();}
});
