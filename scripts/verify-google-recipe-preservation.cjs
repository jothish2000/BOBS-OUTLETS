'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),K=require('../recipe-market-google-store.js');
const api=require('./google-recipe-preservation-client.cjs'),{equal}=require('./recipe-knowledge-bootstrap.cjs');
const token='PRESERVE_20261002_37045857257',B='RECIPE_KNOWLEDGE_BACKUPS';
(async()=>{
 const recovery=await api.getRawModule('COMPANY',B,token);
 assert.equal(recovery?.schema,'BOBS_RECIPE_PRESERVATION_V1');
 const raw=[];
 for(const k of recovery.legacyCopies){
  const r=await api.getRawModule('COMPANY',B,k);assert.equal(r?.schema,'BOBS_RECIPE_RAW_RECOVERY_V1');
  assert(equal(await api.getRawModule('COMPANY',r.module,r.key),r.data),'Historical master changed since recovery');raw.push(r);
 }
 const primary=raw.find(r=>r.module==='RECIPE_MASTER').data;
 const old=primary.storageMode==='SHARDED_RECIPE_MASTER_V2'?raw.filter(r=>r.module===(primary.chunkModule||'RECIPE_MASTER_CHUNKS')).sort((a,b)=>a.data.index-b.data.index).flatMap(r=>r.data.recipes):primary.recipes;
 assert.equal(old.length,recovery.legacyCount);
 const groups=[];
 for(const k of recovery.referenceCopies)groups.push(await api.getRawModule('COMPANY',B,k));
 groups.sort((a,b)=>a.index-b.index);
 assert(groups.every((g,i)=>g.schema==='BOBS_MARKET_REFERENCE_RECOVERY_V1'&&g.index===i&&g.total===groups.length));
 const refs=groups.flatMap(g=>g.records);assert.equal(refs.length,recovery.referenceCount);
 const ctx={window:{},console,queueMicrotask:()=>{},setTimeout,clearTimeout};vm.createContext(ctx);
 for(const f of ['shared_data.js','recipe-guide-seeds.js','recipe-market-references.js','poriyal-recipes.js','recipe-market-poriyal-references.js']){
  vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});if(f==='shared_data.js')vm.runInContext('window.ITEM_DATA=ITEM_DATA',ctx);
 }
 assert.deepEqual(refs,JSON.parse(JSON.stringify(ctx.window.BOBS_MARKET_REFERENCES)),'Reference archive differs from approved source library');
 const built=K.build(refs,old);
 for(let i=0;i<built.standard.length;i++){
  const prior=old.find(r=>K.norm(r.name||r.recipeId)===K.norm(refs[i].name));
  for(let j=0;j<built.standard[i].ingredients.length;j++){
   const a=refs[i].ingredients[j],p=prior?.ingredients?.find(p=>K.norm(p[0])===K.norm(a[0])&&String(p[2]).toLowerCase().trim()===String(a[2]).toLowerCase().trim());
   if(p&&(p[3]==null||String(p[3]).trim()===''))built.standard[i].ingredients[j][3]=a[3];
  }
 }
 // Read each module again independently of the publication process.
 for(const [kind,m] of Object.entries(K.MODULES)){
  const current=await api.getRawModule('COMPANY',m,K.MANIFEST_KEY);assert(equal(current,recovery.knowledgeManifests[m]),'Active pointer differs from preservation index');
  const loaded=await K.loadModule(api,m);assert.deepEqual(loaded.records,built[kind]);
  console.log(JSON.stringify({layer:kind,records:loaded.records.length,fullContentVerified:true}));
 }
 const idli=built.standard.find(r=>K.norm(r.name)==='idli');assert.equal(Number(idli.yieldQty),120);assert.equal(idli.ingredients.find(a=>a[0]==='Idli rice')[1],1.6);
 console.log(JSON.stringify({recoveryKey:token,historicalRecordsPreserved:old.length,fullReferenceArchive:refs.length,idli120Reference:true,idli360ScaleFactor:360/idli.yieldQty,allDataReadOnly:true}));
})().catch(e=>{console.error('INDEPENDENT VERIFICATION FAILED: '+e.message);process.exitCode=1});
