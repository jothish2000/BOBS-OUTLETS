/* BOBS GOOGLE SHEETS DATA VAULT
 * Deploy this Apps Script as a Web App.
 * This spreadsheet is a SEPARATE backup/vault spreadsheet.
 * 111Q: read/recovery is non-destructive; permanent vault records are never deleted by entry decisions.
 */
const VAULT_SPREADSHEET_ID = '19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8';
const VAULT_SHEET = 'BOBS_SNAPSHOT_VAULT';
const INDEX_SHEET = 'VAULT_INDEX';
function doPost(e){try{const b=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');if(b.action==='snapshot')return json_(saveSnapshot_(b));if(b.action==='list'||b.action==='snapshotList')return json_(listSnapshots_());if(b.action==='restore')return json_(restoreSnapshot_(b.snapshotId));if(b.action==='outletList')return json_(listOutletRecords_());return json_({ok:false,error:'Unknown action'});}catch(err){return json_({ok:false,error:String(err)});}}
function doGet(e){try{const a=String((e&&e.parameter&&e.parameter.action)||'').trim();if(a==='outletList')return json_(listOutletRecords_());if(a==='snapshotList'||a==='list')return json_(listSnapshots_());if(a==='restore')return json_(restoreSnapshot_(e.parameter.snapshotId));return json_({ok:true,service:'BOBS Google Sheets Data Vault',readActions:['outletList','snapshotList','restore']});}catch(err){return json_({ok:false,error:String(err)});}}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function vault_(){return SpreadsheetApp.openById(VAULT_SPREADSHEET_ID);}
function ensure_(){const ss=vault_();let v=ss.getSheetByName(VAULT_SHEET);if(!v){v=ss.insertSheet(VAULT_SHEET);v.appendRow(['snapshotId','createdAt','reason','payload']);}let i=ss.getSheetByName(INDEX_SHEET);if(!i){i=ss.insertSheet(INDEX_SHEET);i.appendRow(['snapshotId','createdAt','reason','status']);}return{ss,v,i};}
function saveSnapshot_(b){const x=ensure_(),id=b.snapshotId||('GS-SNAP-'+Date.now());x.v.appendRow([id,new Date().toISOString(),b.reason||'BOBS protected snapshot',JSON.stringify(b.data||{})]);x.i.appendRow([id,new Date().toISOString(),b.reason||'','PROTECTED']);return{ok:true,snapshotId:id};}
function listSnapshots_(){const x=ensure_(),vals=x.i.getDataRange().getValues();return{ok:true,snapshots:vals.slice(1).map(r=>({snapshotId:r[0],createdAt:r[1],reason:r[2],status:r[3]}))};}
function restoreSnapshot_(id){const x=ensure_(),vals=x.v.getDataRange().getValues();for(let n=1;n<vals.length;n++){if(String(vals[n][0])===String(id))return{ok:true,snapshotId:id,data:JSON.parse(vals[n][3])};}return{ok:false,error:'Snapshot not found'};}
/* Read the newest protected outlet master found in the Vault. This never writes/deletes data. */
function listOutletRecords_(){const x=ensure_(),vals=x.v.getDataRange().getValues();for(let n=vals.length-1;n>=1;n--){let p;try{p=JSON.parse(vals[n][3]||'{}');}catch(e){continue;}const c=[p['bobs-permanent-outlet-master'],p['outlets-master'],p.outlets,p.outletMaster];for(const v of c){if(Array.isArray(v)&&v.length)return{ok:true,source:'DATA_VAULT',snapshotId:vals[n][0],createdAt:vals[n][1],outlets:v};if(v&&Array.isArray(v.outlets)&&v.outlets.length)return{ok:true,source:'DATA_VAULT',snapshotId:vals[n][0],createdAt:vals[n][1],outlets:v.outlets};}}return{ok:true,source:'DATA_VAULT',outlets:[]};}
