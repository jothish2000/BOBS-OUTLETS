/* BOBS audited market-reference -> operational Recipe Master migration helper.
   Pure: no Google writes. The Recipe Master page owns backup/stage/verify/activate. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.BOBS_RECIPE_MARKET_MIGRATION=api;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){'use strict';
 const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
 const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').replace(/\s+/g,' ').trim();
 const unit=s=>String(s||'').toLowerCase().trim();
 const keyIng=a=>norm(a?.[0])+'|'+unit(a?.[2]);
 function finiteRate(v){return Number.isFinite(Number(v))&&Number(v)>=0;}
 function preserveRates(reference,old){
  const oldBy=new Map((old?.ingredients||[]).map(a=>[keyIng(a),a]));
  return (reference?.ingredients||[]).map(a=>{
   const z=clone(a),prev=oldBy.get(keyIng(a));
   if(prev&&finiteRate(prev[3]))z[3]=Number(prev[3]);
   return z;
  });
 }
 function identity(r){return norm(r?.name||r?.recipeId);}
 function approvedRecipe(reference,old,version){
  const ref=clone(reference||{}),prev=clone(old||{});
  const out={...prev,...ref};
  out.recipeId=prev.recipeId||ref.recipeId;
  out.ingredients=preserveRates(ref,prev);
  // Keep business associations/custom lists unless the audited reference intentionally supplies them.
  if(prev.condiments&&!ref.condiments)out.condiments=clone(prev.condiments);
  if(prev.vegetableOptions&&!ref.vegetableOptions)out.vegetableOptions=clone(prev.vegetableOptions);
  out.standardVersion=version;
  out.standardSource='BOBS_MARKET_AUDITED_OPERATIONAL_MASTER';
  out.operationalRecipeStatus='APPROVED_MARKET_BASELINE';
  out.marketReferenceVersion=ref.marketReferenceVersion||'2026-10-01-MARKET-V2';
  out.marketAuditStatus=ref.auditStatus||null;
  out.marketReferenceKind=ref.referenceKind||null;
  out.marketReferenceConfidence=ref.referenceConfidence||null;
  out.marketFamily=ref.marketFamily||null;
  out.marketEvidenceBasis=ref.evidenceBasis||null;
  out.marketCalibrationNotes=ref.calibrationNotes||null;
  out.approvedFromMarketAt='2026-10-01';
  return out;
 }
 function migrate(existingRecipes,marketReferences,version){
  const existing=Array.isArray(existingRecipes)?existingRecipes:[];
  const refs=Array.isArray(marketReferences)?marketReferences:[];
  const oldBy=new Map(existing.map(r=>[identity(r),r]));
  const recipes=[];
  for(const ref of refs){
   const k=identity(ref),old=oldBy.get(k);
   recipes.push(approvedRecipe(ref,old,version));
   oldBy.delete(k);
  }
  // Preserve non-market/custom legacy recipes rather than deleting user data.
  for(const old of oldBy.values())recipes.push(clone(old));
  return recipes;
 }
 function diff(existingRecipes,nextRecipes){
  const oldBy=new Map((existingRecipes||[]).map(r=>[identity(r),r]));
  const changed=[],added=[],unchanged=[];
  for(const r of nextRecipes||[]){
   const old=oldBy.get(identity(r));
   if(!old){added.push(r.name);continue;}
   const shape=x=>JSON.stringify({yieldQty:x?.yieldQty,yieldUnit:x?.yieldUnit,ingredients:x?.ingredients,standardVersion:x?.standardVersion,standardSource:x?.standardSource});
   (shape(old)===shape(r)?unchanged:changed).push(r.name);
  }
  return {changed,added,unchanged,total:(nextRecipes||[]).length};
 }
 return {norm,keyIng,preserveRates,approvedRecipe,migrate,diff};
});
