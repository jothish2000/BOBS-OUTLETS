const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function loadMarket(){
  const ctx={console};ctx.window=ctx;
  ctx.BOBS_GUIDE_RECIPES=[
    {name:'Idli',category:'TIFFIN',yieldQty:120,yieldUnit:'pieces',ingredients:[['Idli rice',3.5,'kg',55],['Urad dal',.9,'kg',140],['Fenugreek',.03,'kg',160],['Salt',.08,'kg',20],['LPG fuel',.2,'kg',153.5]]},
    {name:'Dosa',category:'TIFFIN',yieldQty:25,yieldUnit:'pieces',ingredients:[['Dosa rice',1.6,'kg',55],['Urad dal',.4,'kg',140],['Fenugreek',.015,'kg',160],['Cooking oil',.18,'L',140],['Salt',.04,'kg',20],['LPG fuel',.14,'kg',153.5]]},
    {name:'Vada',category:'SNACK',yieldQty:50,yieldUnit:'pieces',ingredients:[['Urad dal',1,'kg',140],['Ginger',.04,'kg',160],['Green chilli',.035,'kg',100],['Curry leaves',.02,'kg',80],['Cumin / pepper',.018,'kg',350],['Salt',.025,'kg',20],['Cooking oil - frying consumption',.45,'L',140],['LPG fuel',.2,'kg',153.5]]},
    {name:'Pongal',category:'TIFFIN',yieldQty:25,yieldUnit:'servings',ingredients:[['Raw rice',1.6,'kg',55],['Moong dal',.65,'kg',120],['Ghee',.22,'kg',650],['Pepper + cumin + ginger',.10,'kg',220],['Cashew',.08,'kg',700],['Salt',.05,'kg',20],['LPG fuel',.18,'kg',153.5]]},
    {name:'Poori',category:'TIFFIN',yieldQty:25,yieldUnit:'servings',ingredients:[['Wheat flour',1.8,'kg',48],['Salt',.04,'kg',20],['Cooking oil - frying consumption',.55,'L',140],['Potato',2.2,'kg',35],['Onion',.45,'kg',55],['Masala / tempering',.10,'kg',220],['LPG fuel',.24,'kg',153.5]]},
    {name:'Chapati',category:'TIFFIN',yieldQty:30,yieldUnit:'pieces',ingredients:[['Wheat flour',1.5,'kg',48],['Oil',.08,'L',140],['Salt',.025,'kg',20],['LPG fuel',.10,'kg',153.5]]},
    {name:'Curd Rice',category:'RICE',yieldQty:25,yieldUnit:'servings',ingredients:[['Raw rice',1.5,'kg',55],['Curd',2,'kg',70],['Milk',.5,'L',62],['Ginger + chilli + curry leaf',.08,'kg',220],['Mustard + urad dal',.05,'kg',220],['Oil',.08,'L',140],['Salt',.045,'kg',20],['LPG fuel',.15,'kg',153.5]]},
    {name:'Lemon Rice',category:'RICE',yieldQty:25,yieldUnit:'servings',ingredients:[['Raw rice',1.8,'kg',55],['Lemon',.45,'kg',80],['Peanuts',.20,'kg',150],['LPG fuel',.18,'kg',153.5]]},
    {name:'Jalebi',category:'SNACK',yieldQty:1.5,yieldUnit:'kg',ingredients:[['Maida',.5,'kg',50],['Sugar',.75,'kg',48],['Curd / ferment starter',.08,'kg',70],['Cooking oil - frying consumption',.30,'L',140],['LPG fuel',.18,'kg',153.5]]},
    {name:'Tea',category:'HOT_BEVERAGE',yieldQty:20,yieldUnit:'cups',ingredients:[['Milk',1.6,'L',62],['Water',.8,'L',1],['Tea powder',.06,'kg',420],['Sugar',.32,'kg',48],['LPG fuel',.05,'kg',153.5]]},
    {name:'Onion Bajji',category:'SNACK',yieldQty:30,yieldUnit:'pieces',ingredients:[['Onion',.65,'kg',55],['Gram flour',.45,'kg',90],['Rice flour',.15,'kg',55],['Cooking oil - frying consumption',.30,'L',140],['LPG fuel',.16,'kg',153.5]]},
    {name:'Unmatched In-house Item',category:'SNACK',yieldQty:30,yieldUnit:'pieces',ingredients:[['Primary base',.75,'kg',90],['Cooking oil',.30,'L',140],['LPG fuel',.15,'kg',153.5]]}
  ];
  vm.runInNewContext(fs.readFileSync(path.join(root,'recipe-market-references.js'),'utf8'),ctx,{filename:'recipe-market-references.js'});
  return ctx;
}

const qty=(r,name)=>r.ingredients.find(a=>a[0]===name)?.[1];

test('direct market corrections are non-destructive and remove known overweight seeds',()=>{
  const c=loadMarket(),find=n=>c.BOBS_MARKET_REFERENCES.find(r=>r.name===n);
  const idli=find('Idli'),dosa=find('Dosa'),vada=find('Vada'),chapati=find('Chapati'),curd=find('Curd Rice');
  assert.equal(idli.referenceKind,'MARKET_RESEARCHED');
  assert.equal(idli.referenceConfidence,'HIGH');
  assert.equal(qty(idli,'Idli rice'),1.6);
  assert.equal(qty(idli,'Urad dal'),.48);
  assert.equal(idli.referenceEquipment.capacityIsNotRecipeYield,true);
  assert.match(idli.referenceEquipment.marketCapacityRange,/60.*360/);
  assert(qty(dosa,'Dosa rice')<.5,'25-dosa rice should be far below the old 1.6 kg seed');
  assert(qty(vada,'Urad dal')<.8,'50-vada urad should be below the old 1 kg seed');
  assert.equal(qty(chapati,'Wheat flour'),.72);
  assert(qty(curd,'Raw rice')<1,'25-serving curd-rice raw rice should be below the old 1.5 kg seed');
  assert.equal(c.BOBS_GUIDE_RECIPES[0].ingredients[0][1],3.5,'legacy guide input must not be mutated');
});

test('every generated market reference has family, audit status and evidence',()=>{
  const c=loadMarket();
  assert.equal(c.BOBS_MARKET_REFERENCE_AUDIT.total,c.BOBS_MARKET_REFERENCES.length);
  assert.deepEqual(c.BOBS_MARKET_REFERENCE_AUDIT.missingFamily,[]);
  assert.deepEqual(c.BOBS_MARKET_REFERENCE_AUDIT.missingEvidence,[]);
  for(const r of c.BOBS_MARKET_REFERENCES){
    assert(r.marketFamily,`${r.name}: family`);
    assert(['DIRECTLY_CALIBRATED','FAMILY_CHECKED'].includes(r.auditStatus),`${r.name}: audit status`);
    assert(['MARKET_RESEARCHED','MARKET_FAMILY_REFERENCE'].includes(r.referenceKind),`${r.name}: reference kind`);
    assert(r.referenceEvidence.length>0,`${r.name}: evidence`);
    assert(r.evidenceBasis,`${r.name}: basis`);
    assert(r.calibrationNotes,`${r.name}: calibration notes`);
  }
});

test('family-checked items remain market references without pretending direct research',()=>{
  const c=loadMarket();
  const bajji=c.BOBS_MARKET_REFERENCES.find(r=>r.name==='Onion Bajji');
  const tea=c.BOBS_MARKET_REFERENCES.find(r=>r.name==='Tea');
  const unmatched=c.BOBS_MARKET_REFERENCES.find(r=>r.name==='Unmatched In-house Item');
  assert.equal(bajji.referenceKind,'MARKET_FAMILY_REFERENCE');
  assert.equal(bajji.marketFamily,'BAJJI_BONDA_PAKODA');
  assert.equal(tea.marketFamily,'TEA');
  assert.equal(unmatched.auditStatus,'FAMILY_CHECKED');
  assert.match(unmatched.guideNote,/retained provisionally|family/i);
});

test('production editor uses Google standard first and audited market fallback only',()=>{
  const s=fs.readFileSync(path.join(root,'recipe-production-editor.js'),'utf8');
  assert.match(s,/K\?\.loadStandards\(BOBS_DATA\)\.catch\(\(\)=>null\)/);
  assert.match(s,/BOBS_MARKET_REFERENCES\|\|window\.BOBS_GUIDE_RECIPES/);
  assert.match(s,/knowledgeSource='google'/);
  assert.match(s,/knowledgeSource='market'/);
  assert.match(s,/Historical Recipe Master is backup only/);
  assert.doesNotMatch(s,/value="saved">Legacy saved Recipe Master/);
  assert.match(s,/marketReferenceVersion/);
  assert.match(s,/standardVersion/);
});
