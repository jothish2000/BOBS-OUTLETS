const assert=require('node:assert/strict');
const M=require('../recipe-master-market-migration.js');

const existing=[
 {recipeId:'IDLI',name:'Idli',yieldQty:50,yieldUnit:'pieces',ingredients:[['Idli rice',3.5,'kg',61],['Urad dal',.9,'kg',151],['Salt',.02,'kg',22],['Legacy only',1,'kg',99]],condiments:[['Chutney',.05,'kg']]},
 {recipeId:'CUSTOM',name:'Owner Custom Soup',yieldQty:10,yieldUnit:'servings',ingredients:[['Vegetable',1,'kg',77]]}
];
const market=[
 {recipeId:'IDLI_REF',name:'Idli',yieldQty:120,yieldUnit:'pieces',ingredients:[['Idli rice',1.6,'kg',55],['Urad dal',.48,'kg',140],['Thick poha',.08,'kg',60],['Salt',.024,'kg',20],['LPG fuel - provisional engineering estimate',.2,'kg',153.5]],auditStatus:'DIRECTLY_CALIBRATED',referenceKind:'MARKET_RESEARCHED',referenceConfidence:'HIGH',marketFamily:'IDLI',evidenceBasis:'evidence',calibrationNotes:'note',marketReferenceVersion:'V2'},
 {recipeId:'TEA_REF',name:'Tea',yieldQty:20,yieldUnit:'cups',ingredients:[['Milk',2,'L',60]],auditStatus:'FAMILY_CHECKED',referenceKind:'MARKET_FAMILY_REFERENCE',referenceConfidence:'MEDIUM',marketFamily:'TEA'}
];
const next=M.migrate(existing,market,'V3');
const idli=next.find(x=>x.name==='Idli'),custom=next.find(x=>x.name==='Owner Custom Soup'),tea=next.find(x=>x.name==='Tea');
assert(idli&&custom&&tea);
assert.equal(idli.yieldQty,120,'known-wrong legacy yield must be replaced by approved market yield');
assert.equal(idli.ingredients.find(x=>x[0]==='Idli rice')[1],1.6,'market quantity must become operational quantity');
assert.equal(idli.ingredients.find(x=>x[0]==='Idli rice')[3],61,'matching ingredient+unit supplier rate must be preserved');
assert.equal(idli.ingredients.find(x=>x[0]==='Urad dal')[3],151);
assert.equal(idli.ingredients.some(x=>x[0]==='Legacy only'),false,'obsolete ingredient not in approved reference must not remain in standardized recipe');
assert.deepEqual(idli.condiments,[['Chutney',.05,'kg']],'business association not supplied by market reference must be preserved');
assert.equal(idli.standardVersion,'V3');
assert.equal(idli.standardSource,'BOBS_MARKET_AUDITED_OPERATIONAL_MASTER');
assert.equal(idli.operationalRecipeStatus,'APPROVED_MARKET_BASELINE');
assert.equal(custom.ingredients[0][3],77,'custom/non-market recipe must remain untouched');
assert.equal(tea.ingredients[0][3],60,'new recipe uses market/default rate when no operational rate exists');

const unitMismatch=M.preserveRates({ingredients:[['Milk',2,'L',60]]},{ingredients:[['Milk',2000,'ml',75]]});
assert.equal(unitMismatch[0][3],60,'rate must not cross-copy when units differ');
const d=M.diff(existing,next);
assert(d.changed.includes('Idli'));
assert(d.added.includes('Tea'));
console.log('PASS Recipe Master market migration: corrected quantities promoted; matching supplier rates preserved; unit mismatches/custom recipes protected.');
