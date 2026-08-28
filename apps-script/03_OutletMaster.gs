/* BOBS GOOGLE-FIRST DATA VAULT — OUTLET MASTER */

function listOutlets_() {
  const sheet = outletSheet_();
  const values = sheet.getDataRange().getValues();
  const outlets = [];
  for (let r = 1; r < values.length; r++) {
    if (values[r][0] === '' || values[r][0] === null) continue;
    let data = {};
    try { data = JSON.parse(String(values[r][5] || '{}')); } catch (err) { data = {}; }
    outlets.push({
      outletId: String(values[r][0]),
      outletCode: String(values[r][1] || ''),
      outletName: String(values[r][2] || ''),
      createdAt: String(values[r][3] || ''),
      updatedAt: String(values[r][4] || ''),
      data: data
    });
  }
  return { ok: true, source: 'GOOGLE_SHEETS', sheet: OUTLET_SHEET, count: outlets.length, outlets: outlets };
}

function getOutlet_(outletId) {
  const result = listOutlets_();
  const id = String(outletId);
  const outlet = result.outlets.find(x => String(x.outletId) === id);
  if (!outlet) return { ok: true, source: 'GOOGLE_SHEETS', sheet: OUTLET_SHEET, found: false, outletId: id, outlet: null };
  return { ok: true, source: 'GOOGLE_SHEETS', sheet: OUTLET_SHEET, found: true, outlet: outlet };
}

function verifyOutlet_(outletId) {
  const result = getOutlet_(outletId);
  return { ok: result.ok, verified: !!result.found, source: 'GOOGLE_SHEETS', outletId: String(outletId), outlet: result.outlet || null };
}

function saveOutlet_(body) {
  const sheet = outletSheet_();
  const data = body.data || {};
  const outletId = String(body.outletId || data.outletId || data.id || '');
  if (!outletId) return { ok: false, error: 'outletId is required' };
  const outletCode = String(body.outletCode || data.outletCode || data.code || data.shortCode || '');
  const outletName = String(body.outletName || data.outletName || data.name || '');
  const now = new Date().toISOString();
  const values = sheet.getDataRange().getValues();
  let row = -1;
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === outletId) { row = r + 1; break; }
  }
  let createdAt = now;
  if (row === -1) {
    sheet.appendRow([outletId, outletCode, outletName, createdAt, now, JSON.stringify(data)]);
  } else {
    createdAt = values[row - 1][3] || now;
    sheet.getRange(row, 1, 1, 6).setValues([[outletId, outletCode, outletName, createdAt, now, JSON.stringify(data)]]);
  }
  return { ok: true, source: 'GOOGLE_SHEETS', sheet: OUTLET_SHEET, outletId: outletId, outletCode: outletCode, outletName: outletName, createdAt: createdAt, updatedAt: now, saved: true };
}

function deleteOutlet_(outletId) {
  const sheet = outletSheet_();
  const id = String(outletId || '');
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === id) {
      sheet.deleteRow(r + 1);
      return { ok: true, source: 'GOOGLE_SHEETS', outletId: id, deleted: true };
    }
  }
  return { ok: false, outletId: id, deleted: false, error: 'Outlet not found' };
}