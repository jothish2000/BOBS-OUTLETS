'use strict';
const fs=require('node:fs');
const url=fs.readFileSync('bobs-config.js','utf8').match(/DATA_VAULT_WEB_APP_URL:\s*'([^']+)'/)[1];
const pause=()=>new Promise(r=>setTimeout(r,2000));
async function request(params){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const u=new URL(url);for(const [k,v] of Object.entries({...params,_bobs:String(Date.now())}))u.searchParams.set(k,v);
   const res=await fetch(u,{signal:AbortSignal.timeout(60000)});if(!res.ok)throw Error('Google read HTTP '+res.status);
   let r;try{r=JSON.parse(await res.text())}catch(e){throw Error('Google response is not JSON')}
   if(r?.ok!==true)throw Error('Google read not verified');return r;
  }catch(e){if(attempt===2)throw Error(e.name==='TimeoutError'?'Google read timed out':e.message);await pause()}
 }
}
async function getRawModule(outletId,module,recordKey){
 const r=await request({action:'moduleGet',outletId,module,recordKey});
 let d=r.data??r.record?.data;if(d!=null){if(typeof d==='string'){try{d=JSON.parse(d)}catch(e){throw Error('Invalid saved JSON')}}return d}
 if(r.found===false)return null;throw Error('Google record existence unknown');
}
async function listModule(outletId,module){
 const r=await request({action:'moduleList',outletId,module});
 if(!Array.isArray(r.records)||Number(r.count)!==r.records.length)throw Error('Google inventory unverified');
 return r.records;
}
async function saveModule(outletId,module,recordKey,data){
 if(process.env.BOBS_CREATE_MISSING_KNOWLEDGE!=='OWNER_APPROVED_20261002'||outletId!=='COMPANY'||!['RECIPE_KNOWLEDGE_BACKUPS','RECIPE_MARKET_EVIDENCE','RECIPE_CALIBRATION','BOBS_STANDARD_RECIPE'].includes(module))throw Error('Write scope denied');
 const stateVersion=Date.now()*1000+Math.floor(Math.random()*1000);
 const body={action:'moduleSave',outletId,module,recordKey,stateVersion,data:{...data,_bobsMeta:{stateVersion,savedBy:'BOBS protected knowledge initialization',savedAt:new Date().toISOString()}}};
 const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
 if(!res.ok)throw Error('Google write response failed; readback required');
 // No retry of a write; the caller verifies its actual stored content.
}
module.exports={getRawModule,listModule,saveModule,pause};
