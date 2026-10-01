const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function loadMarket(){
  const ctx={console};ctx.window=ctx;
  ctx.BOBS_GUIDE_RECIPES=[
    {name:'Idli',yieldQty:120,yieldUnit:'pieces',ingredients:[['Idli rice',3.5,'kg',55],['Urad dal',.9,'kg',140],['Fenugreek',.03,'kg',160],['Salt',.08,'kg',20],['LPG fuel',.2,'kg',153.5]]},
    {name:'Vada',yieldQty:50,yieldUnit:'pieces',ingredients:[['Urad dal',1,'kg',140],['Oil',.45,'L',140]]},
    {name:'Unresearched snack',yieldQty:30,yieldUnit:'pieces',ingredients:[['Base',1,'kg',50]]}
  ];
  vm.runInNewContext(fs.readFileSync(path.join(root,'recipe-market-references.js'),'utf8'),ctx,{filename:'recipe-market-references.js'});
  return ctx;
}

test('Idli market reference is non-destructive and recalibrated',()=>{
  const c=loadMarket();
  const idli=c.BOBS_MARKET_REFERENCES.find(r=>r.name==='Idli');
  assert.equal(idli.referenceKind,'MARKET_RESEARCHED');
  assert.equal(idli.referenceConfidence,'HIGH');
  assert.equal(idli.yieldQty,120);
  assert.equal(idli.ingredients.find(a=>a[0]==='Idli rice')[1],1.6);
  assert.equal(idli.ingredients.find(a=>a[0]==='Urad dal')[1],.48);
  assert.equal(idli.ingredients.find(a=>a[0]==='Thick poha')[1],.08);
  assert.equal(idli.referenceEquipment.capacityIsNotRecipeYield,true);
  assert.match(idli.referenceEquipment.marketCapacityRange,/54.*120/);
  assert.equal(c.BOBS_GUIDE_RECIPES[0].ingredients[0][1],3.5,'legacy guide input must not be mutated');
});

test('Every market reference declares evidence status instead of pretending to be standard',()=>{
  const c=loadMarket();
  assert(c.BOBS_MARKET_REFERENCES.every(r=>['MARKET_RESEARCHED','ENGINEERING_ESTIMATE'].includes(r.referenceKind)));
  assert.equal(c.BOBS_MARKET_REFERENCES.find(r=>r.name==='Unresearched snack').referenceKind,'ENGINEERING_ESTIMATE');
  assert.match(c.BOBS_MARKET_REFERENCES.find(r=>r.name==='Unresearched snack').guideNote,/not yet individually market-calibrated/i);
});

test('Production editor uses market library and defaults new plans to market reference',()=>{
  const s=fs.readFileSync(path.join(root,'recipe-production-editor.js'),'utf8');
  assert.match(s,/BOBS_MARKET_REFERENCES\|\|window\.BOBS_GUIDE_RECIPES/);
  assert.match(s,/saved\?\.source\|\|\(guide\?'guide':'saved'\)/);
  assert.match(s,/BOBS researched market reference/);
  assert.match(s,/Legacy saved Recipe Master/);
  assert.match(s,/marketReferenceVersion/);
});
