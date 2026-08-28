/* BOBS GOOGLE-FIRST DATA VAULT — MODULE DATA */

function saveModuleData_(body) {
  const sheets = ensureSheets_();
  const sheet = sheets.module;
  const outletId = String(body.outletId || '');
  const module = String(body.module || '').trim().toUpperCase();
  const recordKey = String(body.recordKey || 'default').trim();
  if (!outletId) return { ok: false, error: 'outletId is required' };
  if (!module) return { ok: false, error: 'module is required' };
  const payload = body.data !== undefined ? body.data : {};
  const now = new Date().toISOString();
  const values = sheet.getDataRange().getValues();
  let row = -1;
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === outletId && String(values[r][1]) === module && String(values[r][2]) === recordKey) { row = r + 1; break; }
  }
  let createdAt = now;
  if (row === -1) {
    sheet.appendRow([outletId, module, recordKey, createdAt, now, 'ACTIVE', JSON.stringify(payload)]);
  } else {
    createdAt = values[row - 1][3] || now;
    sheet.getRange(row, 1, 1, 7).setValues([[outletId, module, recordKey, createdAt, now, 'ACTIVE', JSON.stringify(payload)]]);
  }
  return { ok: true, source: 'GOOGLE_SHEETS', sheet: MODULE_SHEET, outletId: outletId, module: module, recordKey: recordKey, createdAt: createdAt, updatedAt: now, saved: true, verified: true };
}

function getModuleData_(body) {
  const sheets = ensureSheets_();
  const sheet = sheets.module;
  const outletId = String(body.outletId || '');
  const module = String(body.module || '').trim().toUpperCase();
  const recordKey = String(body.recordKey || 'default').trim();
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === outletId && String(values[r][1]) === module && String(values[r][2]) === recordKey && String(values[r][5]) !== 'DELETED') {
      let data = {};
      try { data = JSON.parse(String(values[r][6] || '{}')); } catch (err) { data = {}; }
      return { ok: true, source: 'GOOGLE_SHEETS', sheet: MODULE_SHEET, found: true, outletId: outletId, module: module, recordKey: recordKey, createdAt: values[r][3], updatedAt: values[r][4], status: values[r][5], data: data };
    }
  }
  return { ok: true, source: 'GOOGLE_SHEETS', sheet: MODULE_SHEET, found: false, outletId: outletId, module: module, recordKey: recordKey, data: null };
}

function listModuleData_(body) {
  const sheets = ensureSheets_();
  const sheet = sheets.module;
  const outletId = String(body.outletId || '');
  const module = String(body.module || '').trim().toUpperCase();
  const values = sheet.getDataRange().getValues();
  const records = [];
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === outletId && String(values[r][1]) === module && String(values[r][5]) !== 'DELETED') {
      let data = {};
      try { data = JSON.parse(String(values[r][6] || '{}')); } catch (err) { data = {}; }
      records.push({ outletId: outletId, module: module, recordKey: String(values[r][2]), createdAt: values[r][3], updatedAt: values[r][4], status: values[r][5], data: data });
    }
  }
  return { ok: true, source: 'GOOGLE_SHEETS', sheet: MODULE_SHEET, outletId: outletId, module: module, count: records.length, records: records };
}

function deleteModuleData_(body) {
  const sheets = ensureSheets_();
  const sheet = sheets.module;
  const outletId = String(body.outletId || '');
  const module = String(body.module || '').trim().toUpperCase();
  const recordKey = String(body.recordKey || 'default').trim();
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === outletId && String(values[r][1]) === module && String(values[r][2]) === recordKey) {
      sheet.getRange(r + 1, 5).setValue(new Date().toISOString());
      sheet.getRange(r + 1, 6).setValue('DELETED');
      return { ok: true, source: 'GOOGLE_SHEETS', outletId: outletId, module: module, recordKey: recordKey, deleted: true };
    }
  }
  return { ok: false, error: 'Module record not found' };
}