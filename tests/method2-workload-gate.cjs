const test=require('node:test');
const assert=require('node:assert/strict');
const gate=require('../method2-workload-gate.js');

function fakeM2(){
 return {
  state:x=>x||{},installSides:()=>{},
  selected:(s,cat,i)=>!!s.selection?.[cat]?.[i],
  draft:(s,cat,i,item)=>s.drafts?.[item.name]||{mode:'purchased',batchSize:0,batches:0}
 };
}
const ITEM_DATA={'Breakfast Catalogue':[{name:'Idli'},{name:'Tea'}]};
const CAT_ORDER=['Breakfast Catalogue'];

test('production item creates workload requirement at current quantity',()=>{
 const s={selection:{'Breakfast Catalogue':{0:true,1:true}},drafts:{Idli:{mode:'production',batchSize:120,batches:3},Tea:{mode:'purchased'}}};
 assert.deepEqual(gate.requirements(s,fakeM2(),ITEM_DATA,CAT_ORDER),[{name:'Idli',qty:360}]);
});

test('all-purchased menu does not require workload plan',()=>{
 const s={selection:{'Breakfast Catalogue':{0:true}},drafts:{Idli:{mode:'purchased'}}};
 const req=gate.requirements(s,fakeM2(),ITEM_DATA,CAT_ORDER);
 assert.equal(gate.evaluate(req,null).ok,true);
 assert.equal(gate.evaluate(req,null).reason,'NO_PRODUCTION');
});

test('production is blocked until workload is owner-reviewed and complete',()=>{
 const req=[{name:'Idli',qty:360}];
 assert.equal(gate.evaluate(req,null).reason,'NO_WORKLOAD_PLAN');
 assert.equal(gate.evaluate(req,{profiles:[{name:'Idli',qty:360}],review:{ownerReviewed:false},calculation:{complete:true}}).reason,'NOT_OWNER_REVIEWED');
 assert.equal(gate.evaluate(req,{profiles:[{name:'Idli',qty:360}],review:{ownerReviewed:true},calculation:{complete:false}}).reason,'CALCULATION_INCOMPLETE');
});

test('stale workload quantity is blocked',()=>{
 const req=[{name:'Idli',qty:360}];
 const r=gate.evaluate(req,{profiles:[{name:'Idli',qty:120}],review:{ownerReviewed:true},calculation:{complete:true}});
 assert.equal(r.ok,false);assert.equal(r.reason,'STALE_OR_MISSING_PROFILE');assert.deepEqual(r.missing,['Idli']);
});

test('matching owner-reviewed workload passes and Idly spelling normalizes',()=>{
 const req=[{name:'Idli',qty:360}];
 const r=gate.evaluate(req,{profiles:[{name:'Idly',qty:'360'}],review:{ownerReviewed:true},calculation:{complete:true}});
 assert.equal(r.ok,true);assert.equal(r.reason,'COMPLETE');
});
