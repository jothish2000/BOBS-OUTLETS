/* Google-backed BOBS recipe knowledge chain.
 * Evidence -> Calibration -> Approved Standard. Legacy Recipe Master is backup/history only.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.BOBS_RECIPE_KNOWLEDGE=api;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){'use strict';
 const VERSION='2026-10-02-GOOGLE-KNOWLEDGE-V1',MANIFEST_KEY='ACTIVE_V1';
 const MODULES={evidence:'RECIPE_MARKET_EVIDENCE',calibration:'RECIPE_CALIBRATION',standard:'BOBS_STANDARD_RECIPE'};
 const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
 const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').replace(/\s+/g,' ').trim();
 const key=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'recipe';
 const ingKey=a=>norm(a?.[0])+'|'+String(a?.[2]||'').toLowerCase().trim();
 const finite=v=>Number.isFinite(Number(v))&&Number(v)>=0;
 function preserveRates(ref,old){
   const oldBy=new Map((old?.ingredients||[]).map(a=>[ingKey(a),a]));
   return (ref?.ingredients||[]).map(a=>{const z=clone(a),p=oldBy.get(ingKey(a));if(p&&finite(p[3]))z[3]=Number(p[3]);return z;});
 }
 function build(references,legacyRecipes=[]){
   const legacy=new Map((legacyRecipes||[]).map(r=>[norm(r.name||r.recipeId),r]));
   const evidence=[],calibration=[],standard=[];
   for(const ref0 of references||[]){
     const ref=clone(ref0),name=String(ref.name||ref.recipeId||'').trim();if(!name)continue;
     const recipeKey=key(name),old=legacy.get(norm(name));
     evidence.push({
       schema:'BOBS_RECIPE_MARKET_EVIDENCE_V1',version:VERSION,recipeKey,recipeName:name,
       reviewedAt:ref.referenceReviewedAt||null,region:ref.referenceRegion||null,
       referenceKind:ref.referenceKind||null,
       sources:clone(ref.referenceEvidence||[]),
       capturedFrom:'BOBS audited market-reference library'
     });
     calibration.push({
       schema:'BOBS_RECIPE_CALIBRATION_V1',version:VERSION,recipeKey,recipeName:name,
       marketFamily:ref.marketFamily||null,auditStatus:ref.auditStatus||null,
       confidence:ref.referenceConfidence||null,evidenceBasis:ref.evidenceBasis||null,
       calibrationNotes:ref.calibrationNotes||ref.guideNote||null,
       selectedYield:Number(ref.yieldQty??ref.standardYield)||null,yieldUnit:ref.yieldUnit||null,
       portionGrams:Number(ref.portionGrams)||null,referenceEquipment:clone(ref.referenceEquipment||null),
       energyConfidence:ref.energyConfidence||null,reviewedAt:ref.referenceReviewedAt||null,
       evidenceVersion:VERSION,decisionRole:'BOBS small-hotel benchmark'
     });
     const approved={...ref,ingredients:preserveRates(ref,old)};
     approved.schema='BOBS_STANDARD_RECIPE_V1';approved.standardVersion=VERSION;
     approved.standardSource='BOBS_GOOGLE_RECIPE_KNOWLEDGE';
     approved.operationalRecipeStatus='APPROVED_MARKET_BASELINE';
     approved.recipeKey=recipeKey;approved.marketEvidenceModule=MODULES.evidence;
     approved.calibrationModule=MODULES.calibration;approved.approvedAt='2026-10-02';
     approved.legacyRateImport=old?'MATCHING_INGREDIENT_RATES_COPIED_ON_MIGRATION':'NO_LEGACY_MATCH';
     standard.push(approved);
   }
   return {version:VERSION,evidence,calibration,standard};
 }
 function shard(records,maxChars=30000){
   const chunks=[];let cur=[];
   for(const r of records||[]){
     const next=[...cur,r];
     if(cur.length&&JSON.stringify(next).length>maxChars){chunks.push(cur);cur=[r]}else cur=next;
   }
   if(cur.length)chunks.push(cur);return chunks;
 }
 function chunkData(kind,records,token,index,total){
   return {schema:'BOBS_RECIPE_KNOWLEDGE_CHUNK_V1',kind,version:VERSION,token,index,total,records:clone(records)};
 }
 function manifest(kind,chunkKeys,token,count){
   return {schema:'BOBS_RECIPE_KNOWLEDGE_MANIFEST_V1',kind,version:VERSION,token,chunkKeys:[...chunkKeys],recordCount:Number(count)||0,activatedAt:new Date().toISOString()};
 }
 async function loadModule(dataApi,module){
   const m=await dataApi.getRawModule('COMPANY',module,MANIFEST_KEY);
   if(!m||m.schema!=='BOBS_RECIPE_KNOWLEDGE_MANIFEST_V1'||!Array.isArray(m.chunkKeys)||!m.chunkKeys.length)return null;
   const chunks=await Promise.all(m.chunkKeys.map(k=>dataApi.getRawModule('COMPANY',module,k)));
   if(chunks.some(x=>!x))throw Error(module+' knowledge chunks are incomplete.');
   const ordered=[...chunks].sort((a,b)=>Number(a.index)-Number(b.index));
   for(let i=0;i<ordered.length;i++){const c=ordered[i];if(c.schema!=='BOBS_RECIPE_KNOWLEDGE_CHUNK_V1'||String(c.token)!==String(m.token)||Number(c.index)!==i||Number(c.total)!==ordered.length||!Array.isArray(c.records))throw Error(module+' knowledge chunk integrity failed.');}
   const records=ordered.flatMap(c=>c.records);
   if(records.length!==Number(m.recordCount))throw Error(module+' knowledge record count mismatch.');
   return {manifest:m,records};
 }
 async function loadStandards(dataApi){return loadModule(dataApi,MODULES.standard)}
 return {VERSION,MANIFEST_KEY,MODULES,norm,key,preserveRates,build,shard,chunkData,manifest,loadModule,loadStandards};
});