/* BOBS METHOD 2 — PERMANENT GOOGLE SHEETS MODEL
 *
 * Google Sheets is the permanent store. The existing BOBS_MODULE_DATA sheet
 * remains the recovery/source record; these normalized sheets give every
 * important Method 2 field a visible spreadsheet footprint.
 */
const M2_PERM_SHEET='BOBS_METHOD2_DATA';
const M2_COND_SHEET='BOBS_METHOD2_CONDIMENTS';
const M2_PACK_SHEET='BOBS_METHOD2_PACKAGING';

function ensureMethod2PermanentSheets_(){
  const ss=vault_();
  const mainHeaders=['savedAt','outletId','itemKey','category','itemIndex','itemName','mode','productionFormat','unitsPerBatch','batchesRanToday','todaysProduction','maxBatchesPerDay','productionCapacityPerDay','soldToday','unsoldQty','purchaseUnit','packQuantity','purchasePrice','minimumOrderQuantity','costingBaseUnit','salesUnit','salesConversionFactor','shelfLifeDays','shelfLifeCondition','carryForwardAllowed','purchaseItemCogs','recipeMasterCogs','condimentCogs','rawCombinedCogs','foodSpoilagePct','foodSpoilageAmount','foodCogsAfterSpoilage','packingOtherCogs','overallFinalCogs','uuwpPct','uuwpApplied','cogsWithUUWP','markupPct','priceFromMarkup','industryStandardSellingPrice','currentSellingPrice','totalProductionCost','soldCogs','unsoldValue'];
  const condHeaders=['savedAt','outletId','itemKey','category','itemIndex','itemName','condimentIndex','condimentName','recipeName','quantity','unitCost','lineCost'];
  const packHeaders=['savedAt','outletId','itemKey','category','itemIndex','itemName','packingIndex','packingName','quantity','unitCost','lineCost'];
  function get(name,headers){let s=ss.getSheetByName(name);if(!s){s=ss.insertSheet(name);s.getRange(1,1,1,headers.length).setValues([headers]);s.setFrozenRows(1)}else if(s.getLastRow()===0)s.getRange(1,1,1,headers.length).setValues([headers]);return s}
  return {main:get(M2_PERM_SHEET,mainHeaders),cond:get(M2_COND_SHEET,condHeaders),pack:get(M2_PACK_SHEET,packHeaders)};
}
function numM2_(v){const n=Number(v);return Number.isFinite(n)?n:''}
function objM2_(v){return v&&typeof v==='object'?v:{} }
function m2Key_(cat,i){return String(cat)+'::'+String(i)}
function saveMethod2Permanent_(body){
  const sheets=ensureMethod2PermanentSheets_(),outletId=String(body.outletId||''),rows=Array.isArray(body.method2Rows)?body.method2Rows:[],savedAt=new Date().toISOString();
  if(!outletId)return{ok:false,error:'outletId is required'};
  const main=sheets.main,cond=sheets.cond,pack=sheets.pack;
  const old=main.getDataRange().getValues();
  const oldRows=old.length>1?old.slice(1):[];
  const keep=oldRows.filter(r=>String(r[1])!==outletId);
  const mainOut=keep.concat(rows.map(r=>[savedAt,outletId,r.itemKey||'',r.category||'',r.itemIndex==null?'':r.itemIndex,r.itemName||'',r.mode||'',r.productionFormat||'',numM2_(r.unitsPerBatch),numM2_(r.batchesRanToday),numM2_(r.todaysProduction),numM2_(r.maxBatchesPerDay),numM2_(r.productionCapacityPerDay),numM2_(r.soldToday),numM2_(r.unsoldQty),r.purchaseUnit||'',numM2_(r.packQuantity),numM2_(r.purchasePrice),numM2_(r.minimumOrderQuantity),r.costingBaseUnit||'',r.salesUnit||'',numM2_(r.salesConversionFactor),numM2_(r.shelfLifeDays),r.shelfLifeCondition||'',r.carryForwardAllowed==null?'':r.carryForwardAllowed,numM2_(r.purchaseItemCogs),numM2_(r.recipeMasterCogs),numM2_(r.condimentCogs),numM2_(r.rawCombinedCogs),numM2_(r.foodSpoilagePct),numM2_(r.foodSpoilageAmount),numM2_(r.foodCogsAfterSpoilage),numM2_(r.packingOtherCogs),numM2_(r.overallFinalCogs),numM2_(r.uuwpPct),r.uuwpApplied==null?'':r.uuwpApplied,numM2_(r.cogsWithUUWP),numM2_(r.markupPct),numM2_(r.priceFromMarkup),numM2_(r.industryStandardSellingPrice),numM2_(r.currentSellingPrice),numM2_(r.totalProductionCost),numM2_(r.soldCogs),numM2_(r.unsoldValue)]));
  if(main.getMaxRows()<mainOut.length+1)main.insertRowsAfter(main.getMaxRows(),mainOut.length+1-main.getMaxRows());
  main.clearContents();main.getRange(1,1,1,44).setValues([['savedAt','outletId','itemKey','category','itemIndex','itemName','mode','productionFormat','unitsPerBatch','batchesRanToday','todaysProduction','maxBatchesPerDay','productionCapacityPerDay','soldToday','unsoldQty','purchaseUnit','packQuantity','purchasePrice','minimumOrderQuantity','costingBaseUnit','salesUnit','salesConversionFactor','shelfLifeDays','shelfLifeCondition','carryForwardAllowed','purchaseItemCogs','recipeMasterCogs','condimentCogs','rawCombinedCogs','foodSpoilagePct','foodSpoilageAmount','foodCogsAfterSpoilage','packingOtherCogs','overallFinalCogs','uuwpPct','uuwpApplied','cogsWithUUWP','markupPct','priceFromMarkup','industryStandardSellingPrice','currentSellingPrice','totalProductionCost','soldCogs','unsoldValue']]);
  if(mainOut.length)main.getRange(2,1,mainOut.length,44).setValues(mainOut.map(r=>r.slice(0,44)));
  const cOld=cond.getDataRange().getValues(),pOld=pack.getDataRange().getValues();
  const cKeep=cOld.length>1?cOld.slice(1).filter(r=>String(r[1])!==outletId):[],pKeep=pOld.length>1?pOld.slice(1).filter(r=>String(r[1])!==outletId):[];
  const cOut=cKeep.concat(rows.flatMap(r=>(Array.isArray(r.condiments)?r.condiments:[]).map((x,j)=>[savedAt,outletId,r.itemKey||'',r.category||'',r.itemIndex==null?'':r.itemIndex,r.itemName||'',j,x.condimentName||x.name||'',x.recipeName||'',numM2_(x.quantity==null?x.qty:x.quantity),numM2_(x.unitCost),numM2_((x.quantity==null?x.qty:x.quantity)*numM2_(x.unitCost))])));
  const pOut=pKeep.concat(rows.flatMap(r=>(Array.isArray(r.packaging)?r.packaging:[]).map((x,j)=>[savedAt,outletId,r.itemKey||'',r.category||'',r.itemIndex==null?'':r.itemIndex,r.itemName||'',j,x.packingName||x.name||'',numM2_(x.quantity==null?x.qty:x.quantity),numM2_(x.unitCost),numM2_((x.quantity==null?x.qty:x.quantity)*numM2_(x.unitCost))])));
  cond.clearContents();cond.getRange(1,1,1,12).setValues([['savedAt','outletId','itemKey','category','itemIndex','itemName','condimentIndex','condimentName','recipeName','quantity','unitCost','lineCost']]);if(cOut.length)cond.getRange(2,1,cOut.length,12).setValues(cOut);
  pack.clearContents();pack.getRange(1,1,1,11).setValues([['savedAt','outletId','itemKey','category','itemIndex','itemName','packingIndex','packingName','quantity','unitCost','lineCost']]);if(pOut.length)pack.getRange(2,1,pOut.length,11).setValues(pOut);
  return{ok:true,source:'GOOGLE_SHEETS',permanent:true,savedAt:savedAt,sheets:[M2_PERM_SHEET,M2_COND_SHEET,M2_PACK_SHEET],itemCount:rows.length};
}
