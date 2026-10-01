const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={window:{},console,queueMicrotask:()=>{},setTimeout,clearTimeout};
vm.createContext(ctx);
function run(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});}
run('shared_data.js');
vm.runInContext('window.ITEM_DATA=ITEM_DATA',ctx);
run('recipe-guide-seeds.js');
run('recipe-market-references.js');
run('poriyal-recipes.js');
run('recipe-market-poriyal-references.js');

const guide=ctx.window.BOBS_GUIDE_RECIPES||[];
const poriyal=ctx.window.BOBS_PORIYAL||[];
const market=ctx.window.BOBS_MARKET_REFERENCES||[];
const audit=ctx.window.BOBS_MARKET_REFERENCE_AUDIT||{};
const key=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const expectedNames=new Set([...guide,...poriyal].map(r=>key(r.name)));
const marketNames=new Set(market.map(r=>key(r.name)));
const missing=[...expectedNames].filter(n=>!marketNames.has(n));
assert.equal(missing.length,0,`Recipe Master rows missing from market reference library: ${missing.join(', ')}`);
assert.equal(market.length,expectedNames.size,`Market reference count ${market.length} does not match unique Recipe Master reference count ${expectedNames.size}`);

const failures=[];
for(const r of market){
 const why=[];
 if(!(Number(r.yieldQty)>0)||!String(r.yieldUnit||'').trim())why.push('yield');
 if(!Array.isArray(r.ingredients)||!r.ingredients.length)why.push('ingredients');
 else for(const a of r.ingredients){
  if(!String(a?.[0]||'').trim()||!Number.isFinite(Number(a?.[1]))||Number(a?.[1])<0||!String(a?.[2]||'').trim()||!Number.isFinite(Number(a?.[3]))||Number(a?.[3])<0){why.push('ingredient row');break;}
 }
 if(!r.marketFamily)why.push('market family');
 if(!['DIRECTLY_CALIBRATED','FAMILY_CHECKED'].includes(r.auditStatus))why.push('audit status');
 if(!['MARKET_RESEARCHED','MARKET_FAMILY_REFERENCE'].includes(r.referenceKind))why.push('reference kind');
 if(!['HIGH','MEDIUM','LOW'].includes(r.referenceConfidence))why.push('confidence');
 if(!Array.isArray(r.referenceEvidence)||!r.referenceEvidence.length)why.push('evidence');
 if(!String(r.evidenceBasis||'').trim())why.push('evidence basis');
 if(!String(r.calibrationNotes||'').trim())why.push('calibration notes');
 if(why.length)failures.push(`${r.name}: ${[...new Set(why)].join(', ')}`);
}
assert.equal(failures.length,0,`Invalid market references:\n${failures.join('\n')}`);
assert.equal((audit.missingFamily||[]).length,0,'Runtime market audit has missing family rows');
assert.equal((audit.missingEvidence||[]).length,0,'Runtime market audit has missing evidence rows');
assert.equal(audit.total,market.length,'Runtime market audit total mismatch');

function find(name){return market.find(r=>key(r.name)===key(name));}
const idli=find('Idli'),dosa=find('Dosa'),vada=find('Vada'),chapati=find('Chapati'),curd=find('Curd Rice'),por=find('Cabbage Poriyal');
assert(idli&&dosa&&vada&&chapati&&curd&&por,'Known direct/poriyal market references missing');
assert.equal(idli.ingredients.find(a=>a[0]==='Idli rice')?.[1],1.6);
assert(Number(dosa.ingredients.find(a=>a[0]==='Dosa rice')?.[1])<.5,'Dosa correction missing in real catalogue');
assert(Number(vada.ingredients.find(a=>a[0]==='Urad dal')?.[1])<.8,'Vada correction missing in real catalogue');
assert.equal(chapati.ingredients.find(a=>a[0]==='Wheat flour')?.[1],.72);
assert(Number(curd.ingredients.find(a=>a[0]==='Raw rice')?.[1])<1,'Curd Rice correction missing in real catalogue');
assert.equal(por.marketFamily,'PORIYAL');
assert.equal(por.referenceKind,'MARKET_FAMILY_REFERENCE');
console.log(`PASS Market Recipe Master: ${market.length} unique real references; ${audit.directlyCalibrated} directly calibrated; ${audit.familyChecked} family checked; no missing family/evidence/invalid rows.`);
