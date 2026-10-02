'use strict';
const K=require('../recipe-market-google-store.js');
const {isDeepStrictEqual}=require('node:util');
const copy=x=>JSON.parse(JSON.stringify(x));
const clean=x=>{if(!x)return x;const y=copy(x);delete y._bobsMeta;return y};
const equal=(a,b)=>isDeepStrictEqual(clean(a),clean(b));
const BACKUP='RECIPE_KNOWLEDGE_BACKUPS';
async function bootstrap(api,references,{token,progress=()=>{}}={}){
 if(!/^[a-zA-Z0-9_-]+$/.test(token||''))throw Error('Unique preservation token required');
 const read=(m,k)=>api.getRawModule('COMPANY',m,k);
 const modules=Object.values(K.MODULES);
 async function empty(){
  for(const m of modules){
   if(await read(m,K.MANIFEST_KEY)!==null)throw Error('Active knowledge already exists; reconciliation required');
   const rows=await api.listModule('COMPANY',m);
   if(!Array.isArray(rows)||rows.length)throw Error('Existing or unverified knowledge inventory; reconciliation required');
  }
 }
 await empty();
 if(!Array.isArray(references)||!references.length)throw Error('Reference library empty');
 const names=new Set();
 for(const r of references){
  const key=K.norm(r.name);
  if(!key||names.has(key)||!(Number(r.yieldQty)>0)||!r.yieldUnit||!r.ingredients?.length||!r.referenceEvidence?.length||!r.calibrationNotes)throw Error('Incomplete or duplicate calibrated reference');
  if(r.ingredients.some(a=>!a[0]||!a[2]||a[1]==null||a[1]===''||!Number.isFinite(Number(a[1]))||Number(a[1])<0))throw Error('Invalid reference ingredient');
  names.add(key);
 }
 const baseline=[];
 async function capture(m,k){const data=await read(m,k);if(!data)throw Error('Historical recovery record missing');baseline.push({module:m,key:k,data:copy(data)});return data}
 const legacy=await capture('RECIPE_MASTER','STANDARD_V1');
 let recipes=legacy.recipes;
 if(legacy.storageMode==='SHARDED_RECIPE_MASTER_V2'){
  if(!legacy.chunkKeys?.length||new Set(legacy.chunkKeys).size!==legacy.chunkKeys.length)throw Error('Historical manifest invalid');
  const chunks=[];
  for(const key of legacy.chunkKeys)chunks.push(await capture(legacy.chunkModule||'RECIPE_MASTER_CHUNKS',key));
  chunks.sort((a,b)=>Number(a.index)-Number(b.index));
  if(chunks.some((c,i)=>c.schema!=='RECIPE_MASTER_CHUNK_V2'||String(c.token)!==String(legacy.migrationToken)||Number(c.index)!==i||Number(c.total)!==chunks.length||!Array.isArray(c.recipes)))throw Error('Historical chunk integrity failed');
  recipes=chunks.flatMap(c=>c.recipes);
  if(recipes.length!==Number(legacy.recipeCount))throw Error('Historical recipe count mismatch');
 }
 if(!Array.isArray(recipes)||!recipes.length)throw Error('Historical master incomplete');
 const built=K.build(references,recipes);
 // Never convert a blank historical price into a zero price.
 for(let i=0;i<built.standard.length;i++){
  const old=recipes.find(r=>K.norm(r.name||r.recipeId)===K.norm(references[i].name));
  for(let j=0;j<built.standard[i].ingredients.length;j++){
   const a=references[i].ingredients[j],prior=old?.ingredients?.find(p=>K.norm(p[0])===K.norm(a[0])&&String(p[2]).toLowerCase().trim()===String(a[2]).toLowerCase().trim());
   if(prior&&(prior[3]==null||String(prior[3]).trim()===''))built.standard[i].ingredients[j][3]=a[3];
  }
 }
 async function putNew(m,k,data){
  if(JSON.stringify(data).length>45000)throw Error('Record exceeds safe cell size');
  if(await read(m,k)!==null)throw Error('Preservation key collision');
  let writeError;
  try{await api.saveModule('COMPANY',m,k,data)}catch(e){writeError=e}
  for(let attempt=0;attempt<4;attempt++){
   const got=await read(m,k);
   if(equal(got,data))return;
   if(api.pause)await api.pause();
  }
  throw Error(writeError?'Write not confirmed by exact readback':'Full-content readback mismatch');
 }
 const legacyCopies=[];
 for(let i=0;i<baseline.length;i++){
  const key=token+'_legacy_'+i;
  await putNew(BACKUP,key,{schema:'BOBS_RECIPE_RAW_RECOVERY_V1',...baseline[i]});
  legacyCopies.push(key);
 }
 const referenceCopies=[],groups=K.shard(references);
 for(let i=0;i<groups.length;i++){
  const key=token+'_references_'+i;
  await putNew(BACKUP,key,{schema:'BOBS_MARKET_REFERENCE_RECOVERY_V1',index:i,total:groups.length,records:groups[i]});
  referenceCopies.push(key);
 }
 progress('Historical master and complete calibrated library backed up with exact readback');
 // Recheck before staging; do not mix with a different publisher.
 await empty();
 const manifests={};
 for(const [kind,m] of Object.entries(K.MODULES)){
  const parts=K.shard(built[kind]),keys=[];
  for(let i=0;i<parts.length;i++){
   const key=token+'_'+kind+'_'+i;keys.push(key);
   await putNew(m,key,K.chunkData(kind,parts[i],token,i,parts.length));
  }
  manifests[m]=K.manifest(kind,keys,token,built[kind].length);
  progress(kind+' staged and fully verified: '+built[kind].length+' records');
 }
 const recovery={schema:'BOBS_RECIPE_PRESERVATION_V1',token,createdAt:new Date().toISOString(),previousManifests:Object.fromEntries(modules.map(m=>[m,null])),legacyCopies,referenceCopies,knowledgeManifests:manifests,legacyCount:recipes.length,referenceCount:references.length};
 await putNew(BACKUP,token,recovery);
 async function baselineUnchanged(){for(const r of baseline)if(!equal(await read(r.module,r.key),r.data))throw Error('Historical master changed during preservation; activation blocked')}
 await baselineUnchanged();
 // Re-read all staged content and immutable recovery copies before activation.
 for(let i=0;i<baseline.length;i++)if(!equal(await read(BACKUP,legacyCopies[i]),{schema:'BOBS_RECIPE_RAW_RECOVERY_V1',...baseline[i]}))throw Error('Recovery copy changed');
 for(let i=0;i<groups.length;i++)if(!equal(await read(BACKUP,referenceCopies[i]),{schema:'BOBS_MARKET_REFERENCE_RECOVERY_V1',index:i,total:groups.length,records:groups[i]}))throw Error('Reference recovery changed');
 for(const [kind,m] of Object.entries(K.MODULES)){
  const parts=K.shard(built[kind]);
  for(let i=0;i<parts.length;i++)if(!equal(await read(m,manifests[m].chunkKeys[i]),K.chunkData(kind,parts[i],token,i,parts.length)))throw Error('Staged data changed');
 }
 for(const [kind,m] of Object.entries(K.MODULES)){
  for(const pending of modules.filter(x=>!recovery.activated?.includes(x)))if(await read(pending,K.MANIFEST_KEY)!==null)throw Error('Concurrent knowledge activation detected');
  await putNew(m,K.MANIFEST_KEY,manifests[m]);
  (recovery.activated||(recovery.activated=[])).push(m);
 }
 for(const [kind,m] of Object.entries(K.MODULES)){
  const got=await K.loadModule(api,m);
  if(!got||!isDeepStrictEqual(got.records,built[kind]))throw Error('Final full knowledge readback mismatch');
 }
 await baselineUnchanged();
 progress('All three Google layers fully verified; historical master preserved');
 return {token,count:references.length,legacyCount:recipes.length,built,recovery};
}
module.exports={bootstrap,equal};
