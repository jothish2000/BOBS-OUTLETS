'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {bootstrap}=require('../scripts/recipe-knowledge-bootstrap.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
const ref={name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',1.6,'kg',55]],referenceEvidence:[{label:'Reference',url:'https://example.com/recipe'}],calibrationNotes:'Calibrated 120-piece batch',evidenceBasis:'Published ratio',auditStatus:'DIRECTLY_CALIBRATED'};
function fixture(){
 const db={'RECIPE_MASTER/STANDARD_V1':{recipes:[{name:'Idli',yieldQty:999,ingredients:[['Rice',99,'kg',61]]},{name:'Custom historical recipe',yieldQty:1,ingredients:[]}]}},writes=[];
 const api={getRawModule:async(o,m,k)=>clone(db[m+'/'+k]??null),listModule:async(o,m)=>Object.keys(db).filter(k=>k.startsWith(m+'/')).map(k=>({recordKey:k.slice(m.length+1)})),saveModule:async(o,m,k,d)=>{writes.push({o,m,k});db[m+'/'+k]=clone(d)}};
 return {api,db,writes};
}
test('create missing layers preserves complete history/references and matches every saved field',async()=>{
 const x=fixture(),old=clone(x.db);const r=await bootstrap(x.api,[ref],{token:'test'});
 assert.equal(r.count,1);assert.equal(r.legacyCount,2);assert.equal(r.built.standard[0].yieldQty,120);assert.equal(r.built.standard[0].ingredients[0][1],1.6);assert.equal(r.built.standard[0].ingredients[0][3],61);
 assert.deepEqual(x.db['RECIPE_MASTER/STANDARD_V1'],old['RECIPE_MASTER/STANDARD_V1']);
 assert.deepEqual(x.db['RECIPE_KNOWLEDGE_BACKUPS/test_legacy_0'].data,old['RECIPE_MASTER/STANDARD_V1']);
 assert.deepEqual(x.db['RECIPE_KNOWLEDGE_BACKUPS/test_references_0'].records,[ref]);
 assert.deepEqual(x.writes.filter(w=>w.k==='ACTIVE_V1').map(w=>w.m),['RECIPE_MARKET_EVIDENCE','RECIPE_CALIBRATION','BOBS_STANDARD_RECIPE']);
 assert(x.writes.every(w=>w.o==='COMPANY'&&!['RECIPE_MASTER','METHOD2'].includes(w.m)));
 await assert.rejects(bootstrap(x.api,[ref],{token:'again'}),/already exists/);
});
test('existing active or partial knowledge blocks all writes',async()=>{
 for(const key of ['BOBS_STANDARD_RECIPE/ACTIVE_V1','RECIPE_CALIBRATION/orphan']){
  const x=fixture();x.db[key]={saved:'keep'};await assert.rejects(bootstrap(x.api,[ref],{token:'test'}),/already exists|Existing/);assert.equal(x.writes.length,0);
 }
});
test('same-size corrupted backup prevents staging or activation',async()=>{
 const x=fixture(),save=x.api.saveModule;x.api.saveModule=async(o,m,k,d)=>{await save(o,m,k,d);if(k==='test_legacy_0')x.db[m+'/'+k].data.recipes[0].yieldQty=998};
 await assert.rejects(bootstrap(x.api,[ref],{token:'test'}),/readback mismatch/);assert(x.writes.every(w=>w.m==='RECIPE_KNOWLEDGE_BACKUPS'));
});
test('same-count corrupted knowledge chunk prevents activation',async()=>{
 const x=fixture(),save=x.api.saveModule;x.api.saveModule=async(o,m,k,d)=>{await save(o,m,k,d);if(m==='BOBS_STANDARD_RECIPE')x.db[m+'/'+k].records[0].ingredients[0][1]=99};
 await assert.rejects(bootstrap(x.api,[ref],{token:'test'}),/readback mismatch/);assert(!x.writes.some(w=>w.k==='ACTIVE_V1'));
});
test('historical edit during staging blocks activation',async()=>{
 const x=fixture(),save=x.api.saveModule;x.api.saveModule=async(o,m,k,d)=>{await save(o,m,k,d);if(m==='BOBS_STANDARD_RECIPE')x.db['RECIPE_MASTER/STANDARD_V1'].recipes[0].yieldQty=1000};
 await assert.rejects(bootstrap(x.api,[ref],{token:'test'}),/Historical master changed/);assert(!x.writes.some(w=>w.k==='ACTIVE_V1'));
});
test('blank historical price is not promoted as zero',async()=>{
 const x=fixture();x.db['RECIPE_MASTER/STANDARD_V1'].recipes[0].ingredients[0][3]='';
 const r=await bootstrap(x.api,[ref],{token:'test'});assert.equal(r.built.standard[0].ingredients[0][3],55);
});
test('unreadable historical data and incomplete references fail before writes',async()=>{
 for(const mode of ['history','reference']){
 const x=fixture();if(mode==='history')delete x.db['RECIPE_MASTER/STANDARD_V1'];
 await assert.rejects(bootstrap(x.api,mode==='reference'?[{...ref,referenceEvidence:[]}]:[ref],{token:'test'}));assert.equal(x.writes.length,0);
 }
});
test('lost write response accepts only exact subsequent readback without replay',async()=>{
 const x=fixture(),save=x.api.saveModule;x.api.saveModule=async(...args)=>{await save(...args);throw Error('response lost')};
 const r=await bootstrap(x.api,[ref],{token:'test'});assert.equal(r.count,1);assert.equal(new Set(x.writes.map(w=>w.m+'/'+w.k)).size,x.writes.length);
});
