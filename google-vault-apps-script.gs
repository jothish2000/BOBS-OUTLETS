/* BOBS GOOGLE SHEETS DATA VAULT
 * Deploy this Apps Script as a Web App beside the live BOBS spreadsheet.
 * Set VAULT_SPREADSHEET_ID to a SEPARATE backup spreadsheet ID.
 */
const VAULT_SPREADSHEET_ID = 'PASTE_SEPARATE_VAULT_SPREADSHEET_ID_HERE';
const VAULT_SHEET = 'BOBS_SNAPSHOT_VAULT';
const INDEX_SHEET = 'VAULT_INDEX';

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'snapshot') return json_(saveSnapshot_(body));
    if (body.action === 'list') return json_(listSnapshots_());
    if (body.action === 'restore') return json_(restoreSnapshot_(body.snapshotId));
    return json_({ok:false,error:'Unknown action'});
  } catch (err) { return json_({ok:false,error:String(err)}); }
}
function doGet(){ return json_({ok:true,service:'BOBS Google Sheets Data Vault'}); }
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function vault_(){ return SpreadsheetApp.openById(VAULT_SPREADSHEET_ID); }
function ensure_(){ const ss=vault_(); let v=ss.getSheetByName(VAULT_SHEET); if(!v){v=ss.insertSheet(VAULT_SHEET);v.appendRow(['snapshotId','createdAt','reason','payload']);} let i=ss.getSheetByName(INDEX_SHEET); if(!i){i=ss.insertSheet(INDEX_SHEET);i.appendRow(['snapshotId','createdAt','reason','status']);} return {ss,v,i}; }
function saveSnapshot_(b){ if(VAULT_SPREADSHEET_ID.indexOf('PASTE_')===0) throw new Error('Configure VAULT_SPREADSHEET_ID first'); const x=ensure_(),id=b.snapshotId||('GS-SNAP-'+Date.now()); x.v.appendRow([id,new Date().toISOString(),b.reason||'BOBS protected snapshot',JSON.stringify(b.data||{})]); x.i.appendRow([id,new Date().toISOString(),b.reason||'', 'PROTECTED']); return {ok:true,snapshotId:id}; }
function listSnapshots_(){ const x=ensure_(),vals=x.i.getDataRange().getValues(); return {ok:true,snapshots:vals.slice(1).map(r=>({snapshotId:r[0],createdAt:r[1],reason:r[2],status:r[3]}))}; }
function restoreSnapshot_(id){ const x=ensure_(),vals=x.v.getDataRange().getValues(); for(let n=1;n<vals.length;n++){if(String(vals[n][0])===String(id)) return {ok:true,snapshotId:id,data:JSON.parse(vals[n][3])};} return {ok:false,error:'Snapshot not found'}; }
