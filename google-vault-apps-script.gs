/* ============================================================
 * BOBS GOOGLE-FIRST DATA VAULT
 * GOOGLE SHEETS = PERMANENT SOURCE OF TRUTH
 * Single-file deployable Apps Script source.
 * ============================================================ */

const VAULT_SPREADSHEET_ID='19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8';
const OUTLET_SHEET='OUTLET_MASTER';
const MODULE_SHEET='BOBS_MODULE_DATA';
const SNAPSHOT_SHEET='BOBS_SNAPSHOT_VAULT';
const INDEX_SHEET='VAULT_INDEX';

function json_(data){
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(callback,data){
  callback=String(callback||'').replace(/[^A-Za-z0-9_.$]/g,'');
  if(!callback)return json_(data);
  return ContentService.createTextOutput(callback+'('+JSON.stringify(data)+');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function vault_(){return SpreadsheetApp.openById(VAULT_SPREADSHEET_ID);}

function outletSheet_(){
  const ss=vault_();
  let sheet=ss.getSheetByName(OUTLET_SHEET);
  if(!sheet){
    sheet=ss.insertSheet(OUTLET_SHEET);
    sheet.appendRow(['outletId','outletCode','outletName','createdAt','updatedAt','data']);
  }
  return sheet;
}

function ensureSheets_(){
  const ss=vault_();
  const outlet=outletSheet_();
  let module=ss.getSheetByName(MODULE_SHEET);
  if(!module){
    module=ss.insertSheet(MODULE_SHEET);
    module.appendRow(['outletId','module','recordKey','createdAt','updatedAt','status','payload']);
  }
  let snapshot=ss.getSheetByName(SNAPSHOT_SHEET);
  if(!snapshot){
    snapshot=ss.insertSheet(SNAPSHOT_SHEET);
    snapshot.appendRow(['snapshotId','createdAt','reason','payload']);
  }
  let index=ss.getSheetByName(INDEX_SHEET);
  if(!index){
    index=ss.insertSheet(INDEX_SHEET);
    index.appendRow(['snapshotId','createdAt','reason','status']);
  }
  return {ss:ss,outlet:outlet,module:module,snapshot:snapshot,index:index};
}

/* ======================== WEB API ======================== */
function doGet(e){
  try{
    const p=(e&&e.parameter)||{};
    const action=String(p.action||'');
    if(action==='outletList')return jsonp_(p.callback,listOutlets_());
    if(action==='outletGet'&&p.outletId)return jsonp_(p.callback,getOutlet_(p.outletId));
    if(action==='outletVerify'&&p.outletId)return jsonp_(p.callback,verifyOutlet_(p.outletId));
    if(action==='moduleGet'&&p.outletId&&p.module)return jsonp_(p.callback,getModuleData_(p));
    if(action==='moduleList'&&p.outletId&&p.module)return jsonp_(p.callback,listModuleData_(p));
    if(action==='list')return jsonp_(p.callback,listSnapshots_());
    if(action==='snapshotList')return jsonp_(p.callback,listSnapshots_());
    if(action==='restore'&&p.snapshotId)return jsonp_(p.callback,restoreSnapshot_(p.snapshotId));
    if(action==='verify'&&p.snapshotId)return jsonp_(p.callback,verifySnapshot_(p.snapshotId));
    return jsonp_(p.callback,{ok:true,service:'BOBS Google-First Data Vault',version:'2026-09-10',sheets:{outletMaster:OUTLET_SHEET,moduleData:MODULE_SHEET,snapshotVault:SNAPSHOT_SHEET,snapshotIndex:INDEX_SHEET},capabilities:['outletSave','outletList','outletGet','outletUpdate','outletDelete','outletVerify','moduleSave','moduleGet','moduleList','moduleDelete','snapshot','list','verify','restore']});
  }catch(err){
    return jsonp_(e&&e.parameter?e.parameter.callback:'',{ok:false,error:String(err)});
  }
}

function doPost(e){
  try{
    const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    const action=String(body.action||'');
    if(action==='outletSave')return json_(saveOutlet_(body));
    if(action==='outletUpdate')return json_(saveOutlet_(body));
    if(action==='outletDelete')return json_(deleteOutlet_(body.outletId));
    if(action==='moduleSave')return json_(saveModuleData_(body));
    if(action==='moduleDelete')return json_(deleteModuleData_(body));
    if(action==='snapshot')return json_(saveSnapshot_(body));
    if(action==='restore')return json_(restoreSnapshot_(body.snapshotId));
    if(action==='list'||action==='snapshotList')return json_(listSnapshots_());
    if(action==='outletList')return json_(listOutlets_());
    return json_({ok:false,error:'Unknown action: '+action});
  }catch(err){return json_({ok:false,error:String(err)});}
}

/* ======================== OUTLET MASTER ======================== */
function listOutlets_(){
  const sheet=outletSheet_();
  const values=sheet.getDataRange().getValues();
  const outlets=[];
  for(let r=1;r<values.length;r++){
    if(values[r][0]===''||values[r][0]===null)continue;
    let data={};
    try{data=JSON.parse(String(values[r][5]||'{}'));}catch(err){data={};}
    outlets.push({outletId:String(values[r][0]),outletCode:String(values[r][1]||''),outletName:String(values[r][2]||''),createdAt:String(values[r][3]||''),updatedAt:String(values[r][4]||''),data:data});
  }
  return {ok:true,source:'GOOGLE_SHEETS',sheet:OUTLET_SHEET,count:outlets.length,outlets:outlets};
}

function getOutlet_(outletId){
  const result=listOutlets_();
  const id=String(outletId);
  const outlet=result.outlets.find(x=>String(x.outletId)===id);
  if(!outlet)return {ok:true,source:'GOOGLE_SHEETS',sheet:OUTLET_SHEET,found:false,outletId:id,outlet:null};
  return {ok:true,source:'GOOGLE_SHEETS',sheet:OUTLET_SHEET,found:true,outlet:outlet};
}

function verifyOutlet_(outletId){
  const result=getOutlet_(outletId);
  return {ok:result.ok,verified:!!result.found,source:'GOOGLE_SHEETS',outletId:String(outletId),outlet:result.outlet||null};
}

function saveOutlet_(body){
  const sheet=outletSheet_();
  const data=body.data||{};
  const outletId=String(body.outletId||data.outletId||data.id||'');
  if(!outletId)return {ok:false,error:'outletId is required'};
  const outletCode=String(body.outletCode||data.outletCode||data.code||data.shortCode||'');
  const outletName=String(body.outletName||data.outletName||data.name||'');
  const now=new Date().toISOString();
  const values=sheet.getDataRange().getValues();
  let row=-1;
  for(let r=1;r<values.length;r++)if(String(values[r][0])===outletId){row=r+1;break;}
  let createdAt=now;
  if(row===-1)sheet.appendRow([outletId,outletCode,outletName,createdAt,now,JSON.stringify(data)]);
  else{createdAt=values[row-1][3]||now;sheet.getRange(row,1,1,6).setValues([[outletId,outletCode,outletName,createdAt,now,JSON.stringify(data)]]);}
  return {ok:true,source:'GOOGLE_SHEETS',sheet:OUTLET_SHEET,outletId:outletId,outletCode:outletCode,outletName:outletName,createdAt:createdAt,updatedAt:now,saved:true};
}

function deleteOutlet_(outletId){
  const sheet=outletSheet_();
  const id=String(outletId||'');
  const values=sheet.getDataRange().getValues();
  for(let r=1;r<values.length;r++)if(String(values[r][0])===id){sheet.deleteRow(r+1);return {ok:true,source:'GOOGLE_SHEETS',outletId:id,deleted:true};}
  return {ok:false,outletId:id,deleted:false,error:'Outlet not found'};
}

/* ======================== MODULE DATA ======================== */
function saveModuleData_(body){
  const sheets=ensureSheets_(),sheet=sheets.module;
  const outletId=String(body.outletId||'');
  const module=String(body.module||'').trim().toUpperCase();
  const recordKey=String(body.recordKey||'default').trim();
  if(!outletId)return {ok:false,error:'outletId is required'};
  if(!module)return {ok:false,error:'module is required'};
  const payload=body.data!==undefined?body.data:{};
  const now=new Date().toISOString();
  const values=sheet.getDataRange().getValues();
  let row=-1;
  for(let r=1;r<values.length;r++)if(String(values[r][0])===outletId&&String(values[r][1])===module&&String(values[r][2])===recordKey){row=r+1;break;}
  let createdAt=now;
  if(row===-1)sheet.appendRow([outletId,module,recordKey,createdAt,now,'ACTIVE',JSON.stringify(payload)]);
  else{createdAt=values[row-1][3]||now;sheet.getRange(row,1,1,7).setValues([[outletId,module,recordKey,createdAt,now,'ACTIVE',JSON.stringify(payload)]]);}
  return {ok:true,source:'GOOGLE_SHEETS',sheet:MODULE_SHEET,outletId:outletId,module:module,recordKey:recordKey,createdAt:createdAt,updatedAt:now,saved:true,verified:true};
}

function getModuleData_(body){
  const sheet=ensureSheets_().module;
  const outletId=String(body.outletId||''),module=String(body.module||'').trim().toUpperCase(),recordKey=String(body.recordKey||'default').trim();
  const values=sheet.getDataRange().getValues();
  for(let r=1;r<values.length;r++)if(String(values[r][0])===outletId&&String(values[r][1])===module&&String(values[r][2])===recordKey&&String(values[r][5])!=='DELETED'){
    let data={};try{data=JSON.parse(String(values[r][6]||'{}'));}catch(err){data={};}
    return {ok:true,source:'GOOGLE_SHEETS',sheet:MODULE_SHEET,found:true,outletId:outletId,module:module,recordKey:recordKey,createdAt:values[r][3],updatedAt:values[r][4],status:values[r][5],data:data};
  }
  return {ok:true,source:'GOOGLE_SHEETS',sheet:MODULE_SHEET,found:false,outletId:outletId,module:module,recordKey:recordKey,data:null};
}

function listModuleData_(body){
  const sheet=ensureSheets_().module;
  const outletId=String(body.outletId||''),module=String(body.module||'').trim().toUpperCase();
  const values=sheet.getDataRange().getValues(),records=[];
  for(let r=1;r<values.length;r++)if(String(values[r][0])===outletId&&String(values[r][1])===module&&String(values[r][5])!=='DELETED'){
    let data={};try{data=JSON.parse(String(values[r][6]||'{}'));}catch(err){data={};}
    records.push({outletId:outletId,module:module,recordKey:String(values[r][2]),createdAt:values[r][3],updatedAt:values[r][4],status:values[r][5],data:data});
  }
  return {ok:true,source:'GOOGLE_SHEETS',sheet:MODULE_SHEET,outletId:outletId,module:module,count:records.length,records:records};
}

function deleteModuleData_(body){
  const sheet=ensureSheets_().module;
  const outletId=String(body.outletId||''),module=String(body.module||'').trim().toUpperCase(),recordKey=String(body.recordKey||'default').trim();
  const values=sheet.getDataRange().getValues();
  for(let r=1;r<values.length;r++)if(String(values[r][0])===outletId&&String(values[r][1])===module&&String(values[r][2])===recordKey){sheet.getRange(r+1,5).setValue(new Date().toISOString());sheet.getRange(r+1,6).setValue('DELETED');return {ok:true,source:'GOOGLE_SHEETS',outletId:outletId,module:module,recordKey:recordKey,deleted:true};}
  return {ok:false,error:'Module record not found'};
}

/* ======================== SNAPSHOTS ======================== */
function saveSnapshot_(body){
  const sheets=ensureSheets_(),snapshotId=String(body.snapshotId||('GS-SNAP-'+Date.now())),now=new Date().toISOString(),reason=String(body.reason||'BOBS protected snapshot');
  sheets.snapshot.appendRow([snapshotId,now,reason,JSON.stringify(body.data||{})]);
  sheets.index.appendRow([snapshotId,now,reason,'PROTECTED']);
  return {ok:true,snapshotId:snapshotId,saved:true};
}

function listSnapshots_(){
  const values=ensureSheets_().index.getDataRange().getValues(),snapshots=[];
  for(let r=1;r<values.length;r++)if(values[r][0])snapshots.push({snapshotId:values[r][0],createdAt:values[r][1],reason:values[r][2],status:values[r][3]});
  return {ok:true,source:'GOOGLE_SHEETS',snapshots:snapshots};
}

function verifySnapshot_(snapshotId){
  const values=ensureSheets_().snapshot.getDataRange().getValues();
  for(let r=1;r<values.length;r++)if(String(values[r][0])===String(snapshotId))return {ok:true,verified:true,snapshotId:String(snapshotId),status:'FOUND'};
  return {ok:false,verified:false,snapshotId:String(snapshotId),error:'Snapshot not found'};
}

function restoreSnapshot_(snapshotId){
  const values=ensureSheets_().snapshot.getDataRange().getValues();
  for(let r=1;r<values.length;r++)if(String(values[r][0])===String(snapshotId)){
    let data={};try{data=JSON.parse(String(values[r][3]||'{}'));}catch(err){return {ok:false,error:'Snapshot payload is invalid'};}
    return {ok:true,snapshotId:String(snapshotId),data:data};
  }
  return {ok:false,error:'Snapshot not found'};
}
