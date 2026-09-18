const assert=require('node:assert/strict');
require('../method2-core.js');
const recipes=[{name:'Idli',yieldQty:1,yieldUnit:'piece',ingredients:[['Rice',1,'g',2]]},{name:'Sambar',yieldQty:1,yieldUnit:'L',ingredients:[['Dal',1,'kg',50]]}];
const d={mode:'production',unit:'piece',batchSize:120,batches:5,sold:3,spoilage:10,uuwp:5,markup:25,price:15,packingMode:'required',packingPer:2,packaging:[{name:'Box',qty:1,unitCost:3}],condiments:[{recipeName:'Sambar',source:'recipe',portion:20,portionUnit:'ml',packingMode:'required',packingPer:2,packaging:[{name:'Pouch',qty:1,unitCost:1}]}]};
let c=M2.calculate(d,{name:'Idli'},recipes);
assert.equal(c.missing.length,0);assert.equal(c.totalPacking,8);assert.equal(c.components[0].packingCost.total,6);assert.equal(c.components[1].packingCost.total,2);
assert.equal(c.spoil,.3);assert(Math.abs(c.soldCost-17.9)<1e-9);
assert(Math.abs(c.final-(c.components.reduce((sum,x)=>sum+x.subtotal,0)+c.spoil))<1e-9);
for(const mode of ['none','included']){
 const owner={...d,mode:'purchased',packingMode:mode};
 assert.equal(M2.packingCharge(owner,3).total,0);assert.equal(owner.packaging.length,1);
 assert.equal(M2.packingCharge({...owner,packingMode:'required'},3).total,6);
}
assert(M2.packing({...d,packingMode:'included'}).missing.length);
assert(M2.packing({...d.condiments[0],packingMode:'included'}).missing.length);
assert(M2.packing({...d,packingMode:''}).missing.length);
assert(M2.packing({...d,packaging:[]}).missing.length);
assert(M2.packing({...d,packaging:[{qty:1,unitCost:''}]}).missing.length);
assert.equal(M2.calculate({...d,sold:''},{name:'Idli'},recipes).pack,2);
assert.equal(M2.calculate({...d,sold:0},{name:'Idli'},recipes).totalPacking,0);
const legacy={...d,packingMode:undefined,packaging:[{qty:1,unitCost:3},{qty:1,unitCost:1}],condiments:[{...d.condiments[0],packingMode:undefined,packaging:[]}]};
assert.equal(M2.calculate(legacy,{name:'Idli'},recipes).totalPacking,8);
console.log('PASS: component-owned packing, odd quantities, food-only spoilage, no double charge, inactive rows retained, source validation, incomplete costs and legacy compatibility.');
