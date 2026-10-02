'use strict';
const fs=require('node:fs');
const K=require('../recipe-market-google-store.js');
const cfg=fs.readFileSync('bobs-config.js','utf8');
const url=cfg.match(/DATA_VAULT_WEB_APP_URL:\s*'([^']+)'/)[1];
async function request(params){
 let last;
 for(let attempt=0;attempt<3;attempt++){try{return await requestOnce(params)}catch(e){last=e;if(attempt<2)await new Promise(r=>setTimeout(r,1500*(attempt+1)))}}
 throw last;
}
async function requestOnce(params){
 const u=new URL(url);for(const [k,v] of Object.entries({...params,_bobs:String(Date.now())}))u.searchParams.set(k,v);
 const start=Date.now();
 const response=await fetch(u,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('HTTP '+response.status);
 let r;try{r=JSON.parse(await response.text())}catch(e){throw Error('Non-JSON response')}
 if(r?.ok!==true)throw Error('Backend did not verify read');
 return r;
}
async function read(outletId,module,recordKey){
 const r=await request({action:'moduleGet',outletId,module,recordKey});
 let d=r.data??r.record?.data;
 if(d!=null){if(typeof d==='string'){try{d=JSON.parse(d)}catch(e){throw Error('Record JSON invalid')}}return d}
 if(r.found===false)return null;
 throw Error('Record existence unconfirmed');
}
const api={getRawModule:read};
(async()=>{
 for(const [kind,module] of Object.entries(K.MODULES)){
  try{
   const m=await read('COMPANY',module,K.MANIFEST_KEY);
   console.log(JSON.stringify({kind,manifest:m===null?'ABSENT':m.schema=== 'BOBS_RECIPE_KNOWLEDGE_MANIFEST_V1'?'PRESENT':'UNRECOGNIZED',chunkCount:m?.chunkKeys?.length??null,recordCount:m?.recordCount??null}));
   const listed=await request({action:'moduleList',outletId:'COMPANY',module});
   if(!Array.isArray(listed.records))throw Error('Unverified module inventory');
   console.log(JSON.stringify({kind,storedRecords:listed.records.length,hasInactiveChunks:listed.records.some(r=>r.recordKey!==K.MANIFEST_KEY)}));
   if(!m)continue;
   const result=await K.loadModule(api,module);
   if(!result){console.log(JSON.stringify({kind,complete:false,reason:'UNUSABLE_MANIFEST'}));continue}
   const idli=result.records.find(r=>K.norm(r.name||r.recipeName)==='idli');
   console.log(JSON.stringify({kind,complete:true,count:result.records.length,idliPresent:!!idli,idliYield120:kind==='standard'?Number(idli?.yieldQty)===120:kind==='calibration'?Number(idli?.selectedYield)===120:null,idliEvidencePresent:kind==='evidence'?!!idli?.sources?.length:null}));
  }catch(e){console.log(JSON.stringify({kind,complete:false,error:e.name==='TimeoutError'?'READ_TIMEOUT':e.message}));process.exitCode=1}
 }
 try{const inventory=await request({action:'moduleList',outletId:'COMPANY',module:'RECIPE_KNOWLEDGE_BACKUPS'});const rows=inventory.records.filter(r=>r.recordKey.startsWith('PRESERVE_20261002_37045857257'));console.log(JSON.stringify({preservationAttemptRecords:rows.length,keys:rows.map(r=>r.recordKey)}));}catch(e){console.log(JSON.stringify({preservationInventoryError:e.message}));process.exitCode=1}
 try{const old=await read('COMPANY','RECIPE_MASTER','STANDARD_V1');console.log(JSON.stringify({legacyPresent:!!old,sharded:old?.storageMode==='SHARDED_RECIPE_MASTER_V2',count:old?.recipeCount??old?.recipes?.length??null}));
 if(old?.storageMode==='SHARDED_RECIPE_MASTER_V2'){
 const chunks=[];for(const key of old.chunkKeys||[])chunks.push(await read('COMPANY',old.chunkModule||'RECIPE_MASTER_CHUNKS',key));
 const ordered=chunks.sort((a,b)=>Number(a?.index)-Number(b?.index));
 const valid=ordered.length===old.chunkKeys.length&&ordered.every((c,i)=>c&&c.schema==='RECIPE_MASTER_CHUNK_V2'&&String(c.token)===String(old.migrationToken)&&Number(c.index)===i&&Number(c.total)===ordered.length&&Array.isArray(c.recipes));
 if(!valid||ordered.flatMap(c=>c.recipes).length!==Number(old.recipeCount))throw Error('Historical master incomplete');
 console.log(JSON.stringify({legacyComplete:true,verifiedChunks:ordered.length}));
 }}catch(e){console.log(JSON.stringify({legacyReadError:e.name==='TimeoutError'?'READ_TIMEOUT':e.message}));process.exitCode=1}
})();
