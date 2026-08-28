/* ============================================================
 * BOBS GOOGLE-FIRST DATA VAULT — SPLIT SOURCE
 * This split preserves the existing 2026-08-28-GOOGLE-FIRST-MODULES-2 logic.
 * All .gs files belong to ONE Apps Script project.
 * ============================================================ */

/* ============================================================
 * BOBS GOOGLE-FIRST DATA VAULT
 * VERSION: 2026-08-28-GOOGLE-FIRST-MODULES-2
 *
 * GOOGLE SHEETS = PERMANENT SOURCE OF TRUTH
 *
 * Existing:
 *   OUTLET_MASTER
 *   BOBS_SNAPSHOT_VAULT
 *   VAULT_INDEX
 *
 * New:
 *   BOBS_MODULE_DATA
 *
 * Modules supported:
 *   STAFF_MASTER
 *   METHOD1
 *   METHOD2
 *   FIXED_EXPENSES
 *   BREAK_EVEN
 *   and future modules
 * ============================================================ */

const VAULT_SPREADSHEET_ID =
  '19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8';

const OUTLET_SHEET = 'OUTLET_MASTER';
const MODULE_SHEET = 'BOBS_MODULE_DATA';
const SNAPSHOT_SHEET = 'BOBS_SNAPSHOT_VAULT';
const INDEX_SHEET = 'VAULT_INDEX';

/* ============================================================
 * JSON RESPONSE
 * ============================================================ */

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
 * JSONP RESPONSE
 * ============================================================ */

function jsonp_(callback, data) {

  callback = String(callback || '')
    .replace(/[^A-Za-z0-9_.$]/g, '');

  if (!callback) {
    return json_(data);
  }

  return ContentService
    .createTextOutput(
      callback + '(' + JSON.stringify(data) + ');'
    )
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/* ============================================================
 * OPEN VAULT
 * ============================================================ */

function vault_() {
  return SpreadsheetApp.openById(VAULT_SPREADSHEET_ID);
}

/* ============================================================
 * ENSURE OUTLET MASTER
 * ============================================================ */

function outletSheet_() {

  const ss = vault_();

  let sheet = ss.getSheetByName(OUTLET_SHEET);

  if (!sheet) {

    sheet = ss.insertSheet(OUTLET_SHEET);

    sheet.appendRow([
      'outletId',
      'outletCode',
      'outletName',
      'createdAt',
      'updatedAt',
      'data'
    ]);
  }

  return sheet;
}

/* ============================================================
 * ENSURE ALL VAULT SHEETS
 * ============================================================ */

function ensureSheets_() {

  const ss = vault_();
  const outlet = outletSheet_();

  let module = ss.getSheetByName(MODULE_SHEET);
  if (!module) {
    module = ss.insertSheet(MODULE_SHEET);
    module.appendRow([
      'outletId',
      'module',
      'recordKey',
      'createdAt',
      'updatedAt',
      'status',
      'payload'
    ]);
  }

  let snapshot = ss.getSheetByName(SNAPSHOT_SHEET);
  if (!snapshot) {
    snapshot = ss.insertSheet(SNAPSHOT_SHEET);
    snapshot.appendRow([
      'snapshotId',
      'createdAt',
      'reason',
      'payload'
    ]);
  }

  let index = ss.getSheetByName(INDEX_SHEET);
  if (!index) {
    index = ss.insertSheet(INDEX_SHEET);
    index.appendRow([
      'snapshotId',
      'createdAt',
      'reason',
      'status'
    ]);
  }

  return {
    ss: ss,
    outlet: outlet,
    module: module,
    snapshot: snapshot,
    index: index
  };
}