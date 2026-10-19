const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../bobs-kitchen-equipment-core.js'),K=require('../bobs-kitchen-core.js');
const outs=[{id:'1',name:'Rasipuram'}],k={id:'Kitchen-E',name:'Elimedu',status:'operating',shiftTimes:[{start:'04:30',end:'13:30'},{start:'15:00',end:'18:30'}]};
test('registration is explicit; absence and old empty registers never become completion',()=>{
 for(const r of [null,{}, {reviewed:true,kitchens:[]}])assert.throws(()=>K.requireRegistration(r,outs));
 assert.doesNotThrow(()=>K.requireRegistration({reviewed:true,kitchens:[],noSeparateKitchens:true},outs));
 assert.doesNotThrow(()=>K.requireRegistration({reviewed:true,kitchens:[k]},outs));
 assert.throws(()=>K.requireRegistration({reviewed:true,kitchens:[k],reviewedOutletIds:['1','2']},outs),/outlet list changed/);
 assert.throws(()=>K.requireRegistration({reviewed:true,kitchens:[{...k,shiftTimes:[{start:'',end:''}]}]},outs),/shift/);
});
test('early inventory reuses IDs and preserves financial fields, allocation and planned quantity',()=>{
 const old={reviewed:true,sourceStamp:'old',assets:[{id:'A',name:'Steamer',quantity:3,ownedQty:1,unitCost:50000,residual:1000,usefulYears:10,annualDays:300,costConfirmed:true,uses:{Idli:100},custom:'keep'}]};
 const next=E.merge(old,[{id:'A',name:'Existing steamer',ownedQty:2,capacityFacts:{status:'unknown',value:''}}]);
 assert.equal(next.assets.length,1);assert.equal(next.assets[0].quantity,3);assert.equal(next.assets[0].ownedQty,2);
 for(const key of ['unitCost','residual','usefulYears','annualDays','costConfirmed','uses','custom'])assert.deepEqual(next.assets[0][key],old.assets[0][key]);
 assert.equal(next.reviewed,false);assert.equal(next.inventoryReviewed,true);assert.equal(old.reviewed,true);assert.equal(old.assets[0].ownedQty,1);
});
test('unknown stays pending; estimates require basis; confirmation requires actual evidence',()=>{
 const a={id:'A',name:'Grinder',ownedQty:1};
 assert.equal(E.merge(null,[{...a,capacityFacts:{status:'unknown',value:''}}]).assets[0].capacityFacts.value,'');
 assert.throws(()=>E.merge(null,[{...a,capacityFacts:{status:'estimate',value:3,unit:'kg'}}]),/basis/);
 const estimate={status:'estimate',value:3,unit:'kg',basis:'Rice input, separate cycle — dry/soaked basis pending',referenceUrl:'https://example.test/model'};
 const x=E.merge(null,[{...a,capacityFacts:estimate}]).assets[0];assert.equal(x.capacityFacts.status,'estimate');assert.equal(x.costConfirmed,false);assert.equal(x.unitCost,'');assert.equal(x.quantity,1);
 assert.throws(()=>E.merge(null,[{...a,capacityFacts:{...estimate,status:'confirmed'}}]),/evidence/);
 assert.doesNotThrow(()=>E.merge(null,[{...a,capacityFacts:{...estimate,status:'confirmed',evidence:'Owner checked model and trial input weight'}}]));
});
test('invalid unit counts and duplicate identities cannot enter saved inventory',()=>{
 for(const ownedQty of ['',-1,1.5,'bad'])assert.throws(()=>E.merge(null,[{id:'A',name:'Steamer',ownedQty}]));
 assert.throws(()=>E.merge(null,[{id:'A',name:'Steamer',ownedQty:1},{id:'A',name:'Again',ownedQty:1}]),/unique/);
 const x=E.merge(null,[{id:'A',name:'Steamer',ownedQty:0}]);assert.equal(x.assets[0].ownedQty,0);
});
