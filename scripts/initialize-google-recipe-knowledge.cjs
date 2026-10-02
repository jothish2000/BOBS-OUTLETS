'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {bootstrap}=require('./recipe-knowledge-bootstrap.cjs'),api=require('./google-recipe-preservation-client.cjs');
const ctx={window:{},console,queueMicrotask:()=>{},setTimeout,clearTimeout};vm.createContext(ctx);
for(const f of ['shared_data.js','recipe-guide-seeds.js','recipe-market-references.js','poriyal-recipes.js','recipe-market-poriyal-references.js']){
 vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 if(f==='shared_data.js')vm.runInContext('window.ITEM_DATA=ITEM_DATA',ctx);
}
const refs=JSON.parse(JSON.stringify(ctx.window.BOBS_MARKET_REFERENCES));
const idli=refs.find(r=>r.name==='Idli');assert.equal(idli.yieldQty,120);assert.equal(idli.ingredients.find(a=>a[0]==='Idli rice')[1],1.6);
const token='PRESERVE_20261002_'+process.env.GITHUB_RUN_ID;
bootstrap(api,refs,{token,progress:msg=>console.log(msg)}).then(r=>{
 const idli=r.built.standard.find(x=>x.name==='Idli');
 console.log(JSON.stringify({result:'COMPLETE_FULL_READBACK_VERIFIED',recoveryModule:'RECIPE_KNOWLEDGE_BACKUPS',recoveryKey:r.token,recordsPerLayer:r.count,historicalRecipesPreserved:r.legacyCount,idliYield120:idli.yieldQty===120,idliCalibratedRice:idli.ingredients.find(a=>a[0]==='Idli rice')[1]===1.6,operationalOutletWrites:0}));
}).catch(e=>{console.error('PRESERVATION NOT CONFIRMED: '+e.message);process.exitCode=1});
