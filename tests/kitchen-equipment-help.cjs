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
 assert.throws(()=>E.merge(null,[{...a,capacityFacts:{...estimate,status:'confirmed'}}]),/nameplate, specification or trial/);
 assert.doesNotThrow(()=>E.merge(null,[{...a,capacityFacts:{...estimate,status:'confirmed',evidence:'Owner checked model and trial input weight'}}]));
});
test('invalid unit counts and duplicate identities cannot enter saved inventory',()=>{
 for(const ownedQty of ['',-1,1.5,'bad'])assert.throws(()=>E.merge(null,[{id:'A',name:'Steamer',ownedQty}]));
 assert.throws(()=>E.merge(null,[{id:'A',name:'Steamer',ownedQty:1},{id:'A',name:'Again',ownedQty:1}]),/unique/);
 const x=E.merge(null,[{id:'A',name:'Steamer',ownedQty:0}]);assert.equal(x.assets[0].ownedQty,0);
});

const H=require('../bobs-kitchen-equipment-menu-core.js'),R=require('../bobs-equipment-references.js');
const M={SIDES:'Sides & Extras',purchaseKey:n=>n.toLowerCase(),recipe:(rs,n)=>rs.find(r=>r.name.toLowerCase()===n.toLowerCase()),sideRecipes:rs=>rs.filter(r=>r.side)};
test('equipment helper uses catalogue order and items without mutating Method 2 catalogue',()=>{
 const data={Breakfast:[{name:'Idli'}],Snacks:[{name:'Vada'}]},before=JSON.stringify(data),order=['Snacks','Breakfast'];
 const cats=H.catalogue(data,order,[{name:'Chutney',side:true}],M);
 assert.deepEqual(cats.map(c=>c.name),['Snacks','Breakfast',M.SIDES]);assert.equal(cats[0].items[0].key,'Snacks::0');assert.equal(cats[2].items[0].recipeName,'Chutney');
 assert.equal(JSON.stringify(data),before);assert.deepEqual(order,['Snacks','Breakfast']);
});
test('shared recipe equipment is grouped once; alternatives remain an explicit choice',()=>{
 const recipes=[{name:'Vada',productionTiming:{equipment:'Wet grinder + frying kadai'}},{name:'Bonda',productionTiming:{equipment:'Boiling vessel + frying kadai'}},{name:'Sambar',productionTiming:{equipment:'Pressure cooker / stock pot'}}];
 const s=H.suggestions(recipes.map((r,i)=>({name:r.name,key:String(i)})),{recipes,standardRecipes:[recipes[0]]},M);
 assert.equal(s.groups.filter(g=>g.key==='frying-kadai').length,1);assert.equal(s.groups.find(g=>g.key==='frying-kadai').reasons.length,2);
 assert.equal(s.groups.find(g=>g.key==='wet-grinder').reasons[0].source,'Google BOBS Standard Recipe');
 const alternatives=s.groups.find(g=>g.options.length===2);assert.equal(alternatives.options.length,2);assert(alternatives.options.some(o=>o.reference===null));assert(alternatives.options.some(o=>o.reference===2));
});
test('preparation suggestion is conditional and missing mappings never fabricate equipment',()=>{
 const recipes=[{name:'Idli',productionTiming:{equipment:'Idli steamer',prePreparationNote:'Soak/grind and ferment batter overnight.'}},{name:'Unknown',productionTiming:{}},{name:'Mini Idli',productionTiming:{equipment:'Mini-idli steamer'}}];
 const s=H.suggestions([...recipes.map(r=>({name:r.name,key:r.name})),{name:'Branded drink',key:'brand'}],{recipes},M);
 assert.equal(s.missing.length,2);assert(s.groups.find(g=>g.key==='wet-grinder').conditional);assert.equal(s.groups.find(g=>g.key==='mini-idli steamer').options[0].reference,null);
 assert.equal(s.groups.find(g=>g.key==='idli-steamer').options[0].reference,0);assert.equal(s.preparation.length,1);
});
test('equipment comes from the selected recipe, including renamed catalogue recipe keys',()=>{
 const recipes=[{name:'Shared recipe',productionTiming:{equipment:'Custom oven'}}];
 const s=H.suggestions([{name:'Sales label',recipeName:'Shared recipe',key:'B::1'}],{recipes,standardRecipes:recipes},M);
 assert.equal(s.groups[0].options[0].name,'Custom oven');assert.equal(s.groups[0].options[0].reference,null);
 assert.equal(s.groups[0].reasons[0].item,'Sales label');assert.equal(s.groups[0].reasons[0].recipe,'Shared recipe');
});
test('capacity application is explicit and never confirms a machine or assumes production throughput',()=>{
 assert.deepEqual(H.estimate(null,null),{status:'unknown'});
 const pot=H.estimate(R[2],R[2].choices[0]);assert.equal(pot.status,'estimate');assert.equal(pot.value,21.2);assert.equal(pot.unit,'L');assert.match(pot.basis,/Nominal/);assert.equal(pot.evidence,'');
 const rice=H.estimate(R[1],R[1].choices[0]);assert.match(rice.basis,/Rice input.*dry \/ soaked/);assert.equal(rice.value,3);assert.equal(rice.status,'estimate');
});
