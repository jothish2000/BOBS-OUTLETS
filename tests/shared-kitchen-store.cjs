const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
async function fixture(){const dom=new JSDOM('',{runScripts:'outside-only',url:'https://bobs.test/'}),w=dom.window;for(const n of ['shared_data.js','method2-core.js','bobs-cost-flow.js','bobs-outlet-flow-core.js','bobs-production-plan-core.js','bobs-capital-core.js','bobs-kitchen-core.js'])w.eval(fs.readFileSync(n,'utf8'));const date=w.BOBS_COST_FLOW.today(),key='Breakfast Catalogue::0',kitchen={id:'Kitchen-Elimedu',name:'Elimedu kitchen',outletId:'3',status:'operating',shiftTimes:[{start:'04:30',end:'13:30'}]},recipe={name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',1,'kg',60]],productionTiming:{role:'Cook',setupMin:10,activeMinPerCycle:5,machineMinPerCycle:15,finishMinPerCycle:5,cleanupMin:10}},db={'COMPANY/KITCHEN_MASTER/default':{kitchens:[kitchen]}};
 for(const [outlet,qty] of [['1',360],['2',180]])db[outlet+'/METHOD2/default']={itemEditors:{[key]:{mode:'production',unit:'piece',batchSize:qty,batches:1,condiments:[],packaging:[],sold:qty-10}},kitchenSources:{[key]:{kitchenId:kitchen.id,shared:true,group:'Breakfast-Idli',date,readyBy:'10:00',away:false}}};
 const reads=[],writes=[];w.BOBS_DATA={listOutlets:async()=>[{id:'1',name:'Rasipuram'},{id:'2',name:'GP'},{id:'3',name:'Elimedu'}],jsonp:async p=>{const k=p.outletId+'/'+p.module+'/'+p.recordKey;reads.push(k);return {ok:true,found:k in db,data:clone(db[k]??null)}},saveModule:async(o,m,k,value)=>{writes.push(o+'/'+m+'/'+k);db[o+'/'+m+'/'+k]=clone(value)}};w.eval(fs.readFileSync('bobs-verified-store.js','utf8'));w.BOBS_OPERATIONAL_RECIPES={load:async()=>({recipes:[clone(recipe)]})};w.eval(fs.readFileSync('bobs-kitchen-store.js','utf8'));return {dom,w,db,reads,writes,date,key,kitchen,recipe};}
test('Google adapter derives540 without writing either outlet or inventing Elimedu retail demand',async()=>{const f=await fixture(),S=f.w.BOBS_KITCHENS,F=f.w.BOBS_OUTLET_FLOW,M=f.w.M2,P=f.w.BOBS_PRODUCTION_PLAN,c=await S.context(f.kitchen.id);assert.equal(c.items.length,1);assert.equal(c.items[0].d.batchSize,540);assert.equal(P.requirements(c.items,c.recipes,F,M)[0].qty,540);assert.equal(P.materials(P.requirements(c.items,c.recipes,F,M)[0])[0].quantity,4.5);assert.equal(f.db['1/METHOD2/default'].itemEditors[f.key].batchSize,360);assert.equal(f.writes.length,0);const local=F.selected(M.state(await M.read('1')),f.w.ITEM_DATA,M);assert.equal(F.requirements(local,[f.recipe],M).length,0);assert.equal((await S.allDemands({recipes:[f.recipe]})).demands.length,2);f.dom.window.close();});
test('virtual plan can use existing equipment/time/staff engines and cost each outlet share once',async()=>{const f=await fixture(),w=f.w,{BOBS_KITCHENS:S,BOBS_OUTLET_FLOW:F,BOBS_PRODUCTION_PLAN:P,M2:M,BOBS_CAPITAL:A}=w,c=await S.context(f.kitchen.id),item=c.items[0],key=item.key,assets={reviewed:true,noAssets:true,noAssetsReason:'Manual demonstration without machinery allowance',assets:[],sourceStamp:A.assetSource(c.items,c.recipes,F,M)},production={date:f.date,reviewed:true,items:{[key]:{capacityReviewed:true,recipeReviewed:true,deadline:'10:00'}},processes:[{id:'steam',primary:true,requirementKey:key,name:'Idli',role:'Cook',unit:'piece',quantityMode:'demand',capacity:120,start:'05:00',deadline:'10:00',setup:10,active:5,machine:15,supervision:0,finish:5,clean:10,passive:0,assetSlots:[],manualReason:'Isolated test process',reviewed:true}]};production.sourceStamp=P.source(c.items,c.recipes,assets,F,M);const assessment=P.reconcile(production,c.items,c.recipes,assets,F,M,f.date);assert.equal(assessment.tasks[0].cycles,5);const proposal=P.propose(assessment,c.kitchen.shiftTimes,[],F),baseline={reviewed:true,positions:[],workingDays:30,shiftStamp:F.stamp(c.kitchen.shiftTimes)},requirements={items:{[key]:{delivery:false}}},staffing={reviewed:true,salaryReviewed:true,date:f.date,menuStamp:F.menuStamp(c.items),recipeStamp:F.recipeStamp(c.items,c.recipes,M),baselineStamp:F.baselineWorkforceStamp(baseline),requirementsStamp:F.stamp(requirements),productionStamp:F.stamp(production),positions:proposal.positions.map(p=>({...p,takeHome:31000,deductions:0,employerAdditions:0})),baselineAssignments:[]},data={context:c,baseline,staffing,requirements,production,assets,expenses:{expenses:[]},staff:{staff:[]},hr:{},norms:null},choices={reviewed:true,productionOnlyConfirmed:true,pools:{},trips:[]},result=S.calculate(data,choices);assert.equal(Object.values(result.deliveries).reduce((n,r)=>n+r.labour,0),1000);assert.equal(result.rows[key].labour,1000);for(const [module,value] of Object.entries({OUTLET_BASELINE:baseline,OUTLET_STAFFING:staffing,OUTLET_ITEM_REQUIREMENTS:requirements,OUTLET_PRODUCTION_PLAN:production,ASSET_MASTER:assets,FIXED_EXPENSES:data.expenses}))f.db[c.kitchen.id+'/'+module+'/default']=clone(value);f.db['COMPANY/STAFF_MASTER/default']=data.staff;f.db['COMPANY/HR_OUTLET_ALLOCATION/default']=data.hr;f.db[c.kitchen.id+'/KITCHEN_COST_PLAN/'+f.date]={choices,result,sourceStamp:result.sourceStamp};const local=F.selected(M.state(await M.read('1')),w.ITEM_DATA,M),share=await S.itemCosts('1',local);assert(Math.abs(share.items[f.key].labour-1000*360/540)<1e-9);f.db['2/METHOD2/default'].itemEditors[f.key].batchSize=240;await assert.rejects(()=>S.itemCosts('1',local),/changed|incomplete/);assert.equal(f.writes.length,0);f.dom.window.close();});
test('kitchen roadmap includes capital and cash funding, and failed reads remain unknown',async()=>{const f=await fixture();try{const S=f.w.BOBS_KITCHENS,V=f.w.BOBS_VERIFIED;let p=await S.progress(f.kitchen.id);assert.equal(p.steps.length,8);assert.notEqual(p.steps.find(x=>x.href.includes('capital-expenditure.html')).status,'done');assert.notEqual(p.steps.find(x=>x.href.includes('working-capital.html')).status,'done');const read=V.read;V.read=async(o,m,...args)=>{if(m==='WORKING_CAPITAL')throw Error('Funding read unavailable');return read(o,m,...args)};p=await S.progress(f.kitchen.id);assert.equal(p.steps.find(x=>x.href.includes('working-capital.html')).status,'unknown');assert.equal(f.writes.length,0)}finally{f.dom.window.close()}});

test('progress distinguishes an absent cost plan from a failed read without loading all kitchen records',async()=>{
 const f=await fixture();try{
  const items=[{key:f.key,d:{kitchenSources:{[f.key]:{kitchenId:f.kitchen.id}}}}],S=f.w.BOBS_KITCHENS;
  const reads=[];await assert.rejects(S.itemCosts('1',items,async(o,m,k)=>{reads.push([o,m,k]);return null}),e=>e.code==='BOBS_KITCHEN_COST_REVIEW');
  assert.deepEqual(reads,[[f.kitchen.id,'KITCHEN_COST_PLAN',f.date]]);
  await assert.rejects(S.itemCosts('1',items,async()=>{throw Error('network unavailable')}),e=>!e.code&&e.message==='network unavailable');
  assert.equal(f.reads.length,0);assert.equal(f.writes.length,0);
 }finally{f.dom.window.close()}
});

test('verified demand shows every distinct supplying kitchen; an unreadable step can retry without writing',async()=>{
 const f=await fixture(),w=f.w,S=w.BOBS_KITCHENS,host=w.document.createElement('div');
 try{
  const side=f.key+':Sambar',side2=f.key+':Chutney',keys=[f.key,side,side2];
  const record={kitchenSources:{[f.key]:{date:f.date,kitchenId:f.kitchen.id},[side]:{date:f.date,kitchenId:f.kitchen.id},[side2]:{date:f.date,kitchenId:'Kitchen-Second'}}};
  let failed=true;const ids=[];
  S.progress=async id=>{ids.push(id);if(id==='Kitchen-Second'&&failed)throw Error('Fixture read failure');return {name:id,next:{title:'Kitchen expenses',href:'outlet-plan.html?outlet='+id+'&stage=baseline'}}};
  const opts={record,keys,itemKey:f.key};
  await S.showDemandContinuation(host,opts);
  assert.deepEqual(ids,[f.kitchen.id,'Kitchen-Second']);assert.equal(host.querySelectorAll('a').length,1);assert(host.querySelector('[data-kitchen-retry]'));assert.match(host.textContent,/Fixture read failure/);
  failed=false;host.querySelector('[data-kitchen-retry]').click();await S.showDemandContinuation(host,opts);
  assert.equal(host.querySelectorAll('a').length,2);assert.equal(host.querySelector('[data-kitchen-retry]'),null);
  S.progress=async id=>({name:id,next:null});await S.showDemandContinuation(host,{...opts,child:true,refresh:true});assert(host.hidden);
  const before=ids.length;record.kitchenSources[side].date='1999-01-01';await S.showDemandContinuation(host,opts);
  assert(host.hidden);assert.equal(host.querySelectorAll('a').length,0);assert.equal(ids.length,before);assert.equal(f.writes.length,0);
 }finally{f.dom.window.close()}
});
test('a delayed previous assignment cannot replace the current kitchen link',async()=>{
 const f=await fixture(),w=f.w,S=w.BOBS_KITCHENS,host=w.document.createElement('div');
 try{
  let finish;S.progress=id=>id===f.kitchen.id?new Promise(r=>finish=r):Promise.resolve({name:id,next:{title:'Combined orders',href:'production-plan.html?outlet='+id}});
  const show=id=>S.showDemandContinuation(host,{record:{kitchenSources:{[f.key]:{kitchenId:id,date:f.date}}},keys:[f.key],itemKey:f.key});
  const first=show(f.kitchen.id);await show('Kitchen-Second');finish({name:'Old',next:null});await first;
  assert.equal(new URL(host.querySelector('a').href).searchParams.get('outlet'),'Kitchen-Second');assert.equal(f.writes.length,0);
 }finally{f.dom.window.close()}
});

test('tomorrow demand is separate from today and retains its service date through the kitchen handoff',async()=>{
 const f=await fixture();try{
  const S=f.w.BOBS_KITCHENS, tomorrow=S.serviceDate(f.date,1);
  assert.equal(S.serviceDate('2026-12-31',1),'2027-01-01');
  assert.equal(S.serviceDate('2028-02-28',1),'2028-02-29');
  const source={kitchenId:f.kitchen.id,date:tomorrow,readyBy:'07:00',away:true};
  const daily={date:tomorrow,items:{[f.key]:{cat:'Breakfast Catalogue',i:0,name:'Idli',inputs:{mode:'production',unit:'piece',batchSize:240,batches:1,condiments:[]},sources:{[f.key]:source}}}};
  f.db['1/OUTLET_DEMAND/'+tomorrow]=daily;
  const todayJobs=await S.context(f.kitchen.id),next=await S.context(f.kitchen.id,undefined,tomorrow);
  assert.equal(todayJobs.jobs[0].quantity,540);assert.equal(next.jobs.length,1);assert.equal(next.jobs[0].quantity,240);
  assert.equal(next.jobs[0].readyBy,'07:00');assert.equal(next.jobs[0].orders[0].source.date,tomorrow);
  f.db[f.kitchen.id+'/OUTLET_PRODUCTION_PLAN/default']={date:f.date};
  assert.equal(await S.readPlan(f.kitchen.id,'OUTLET_PRODUCTION_PLAN',tomorrow),null);
  const record=S.applyOrders(f.db['1/METHOD2/default'],daily,tomorrow),host=f.w.document.createElement('div');
  await S.showDemandContinuation(host,{record,date:tomorrow,keys:[f.key],itemKey:f.key});
  assert.equal(new URL(host.querySelector('a').href).searchParams.get('serviceDate'),tomorrow);
  assert.equal(f.writes.length,0);
 }finally{f.dom.window.close();}
});
