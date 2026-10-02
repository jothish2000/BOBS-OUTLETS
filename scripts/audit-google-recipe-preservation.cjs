'use strict';
const fs=require('node:fs');
const K=require('../recipe-market-google-store.js');
const cfg=fs.readFileSync('bobs-config.js','utf8');
const url=cfg.match(/DATA_VAULT_WEB_APP_URL:\s*'([^']+)'/)[1];
async function read(outletId,module,recordKey){
 const u=new URL(url);for(const [k,v] of Object.entries({action:'moduleGet',outletId,module,recordKey,_bobs:String(Date.now())}))u.searchParams.set(k,v);
 const start=Date.now();
 const response=await fetch(u,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('HTTP '+response.status);
 let r;try{r=JSON.parse(await response.text())}catch(e){throw Error('Non-JSON response')}
 if(r?.ok!==true)throw Error('Backend did not verify read');
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
   if(!m)continue;
   const result=await K.loadModule(api,module);
   if(!result){console.log(JSON.stringify({kind,complete:false,reason:'UNUSABLE_MANIFEST'}));continue}
   const idli=result.records.find(r=>K.norm(r.name||r.recipeName)==='idli');
   console.log(JSON.stringify({kind,complete:true,count:result.records.length,idliPresent:!!idli,idliYield120:kind==='standard'?Number(idli?.yieldQty)===120:kind==='calibration'?Number(idli?.selectedYield)===120:null,idliEvidencePresent:kind==='evidence'?!!idli?.sources?.length:null}));
  }catch(e){console.log(JSON.stringify({kind,complete:false,error:e.name==='TimeoutError'?'READ_TIMEOUT':e.message}));process.exitCode=1}
 }
 try{const old=await read('COMPANY','RECIPE_MASTER','STANDARD_V1');console.log(JSON.stringify({legacyPresent:!!old,sharded:old?.storageMode==='SHARDED_RECIPE_MASTER_V2',count:old?.recipeCount??old?.recipes?.length??null}));}catch(e){console.log(JSON.stringify({legacyReadError:e.name==='TimeoutError'?'READ_TIMEOUT':e.message}));process.exitCode=1}
})();
