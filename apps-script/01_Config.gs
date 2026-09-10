/* BOBS GOOGLE-FIRST DATA VAULT — DEPLOYMENT CONFIG
 * ONE Apps Script project. Google Sheets is permanent source of truth.
 */
const VAULT_SPREADSHEET_ID='19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8';
const OUTLET_SHEET='OUTLET_MASTER';
const MODULE_SHEET='BOBS_MODULE_DATA';
const SNAPSHOT_SHEET='BOBS_SNAPSHOT_VAULT';
const INDEX_SHEET='VAULT_INDEX';
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)}
function jsonp_(callback,data){callback=String(callback||'').replace(/[^A-Za-z0-9_.$]/g,'');if(!callback)return json_(data);return ContentService.createTextOutput(callback+'('+JSON.stringify(data)+');').setMimeType(ContentService.MimeType.JAVASCRIPT)}
function vault_(){return SpreadsheetApp.openById(VAULT_SPREADSHEET_ID)}
function outletSheet_(){const ss=vault_();let s=ss.getSheetByName(OUTLET_SHEET);if(!s){s=ss.insertSheet(OUTLET_SHEET);s.appendRow(['outletId','outletCode','outletName','createdAt','updatedAt','data'])}return s}
function ensureSheets_(){const ss=vault_(),outlet=outletSheet_();let module=ss.getSheetByName(MODULE_SHEET);if(!module){module=ss.insertSheet(MODULE_SHEET);module.appendRow(['outletId','module','recordKey','createdAt','updatedAt','status','payload'])}let snapshot=ss.getSheetByName(SNAPSHOT_SHEET);if(!snapshot){snapshot=ss.insertSheet(SNAPSHOT_SHEET);snapshot.appendRow(['snapshotId','createdAt','reason','payload'])}let index=ss.getSheetByName(INDEX_SHEET);if(!index){index=ss.insertSheet(INDEX_SHEET);index.appendRow(['snapshotId','createdAt','reason','status'])}return{ss:ss,outlet:outlet,module:module,snapshot:snapshot,index:index}}
