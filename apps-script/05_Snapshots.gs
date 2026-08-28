/* BOBS GOOGLE-FIRST DATA VAULT — SNAPSHOTS */

function saveSnapshot_(body) {
  const sheets = ensureSheets_();
  const snapshotId = String(body.snapshotId || ('GS-SNAP-' + Date.now()));
  const now = new Date().toISOString();
  const reason = String(body.reason || 'BOBS protected snapshot');
  sheets.snapshot.appendRow([snapshotId, now, reason, JSON.stringify(body.data || {})]);
  sheets.index.appendRow([snapshotId, now, reason, 'PROTECTED']);
  return { ok: true, snapshotId: snapshotId, saved: true };
}

function listSnapshots_() {
  const sheets = ensureSheets_();
  const values = sheets.index.getDataRange().getValues();
  const snapshots = [];
  for (let r = 1; r < values.length; r++) {
    if (!values[r][0]) continue;
    snapshots.push({ snapshotId: values[r][0], createdAt: values[r][1], reason: values[r][2], status: values[r][3] });
  }
  return { ok: true, source: 'GOOGLE_SHEETS', snapshots: snapshots };
}

function verifySnapshot_(snapshotId) {
  const sheets = ensureSheets_();
  const values = sheets.snapshot.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === String(snapshotId)) return { ok: true, verified: true, snapshotId: String(snapshotId), status: 'FOUND' };
  }
  return { ok: false, verified: false, snapshotId: String(snapshotId), error: 'Snapshot not found' };
}

function restoreSnapshot_(snapshotId) {
  const sheets = ensureSheets_();
  const values = sheets.snapshot.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === String(snapshotId)) {
      let data = {};
      try { data = JSON.parse(String(values[r][3] || '{}')); }
      catch (err) { return { ok: false, error: 'Snapshot payload is invalid' }; }
      return { ok: true, snapshotId: String(snapshotId), data: data };
    }
  }
  return { ok: false, error: 'Snapshot not found' };
}