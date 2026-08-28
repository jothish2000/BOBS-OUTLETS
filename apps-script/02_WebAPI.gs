/* ============================================================
 * BOBS GOOGLE-FIRST DATA VAULT — SPLIT SOURCE
 * Web entry points. Same Apps Script project; not a second backend.
 * ============================================================ */

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = String(p.action || '');

    if (action === 'outletList') {
      return jsonp_(p.callback, listOutlets_());
    }

    if (action === 'outletGet' && p.outletId) {
      return jsonp_(p.callback, getOutlet_(p.outletId));
    }

    if (action === 'outletVerify' && p.outletId) {
      return jsonp_(p.callback, verifyOutlet_(p.outletId));
    }

    if (action === 'moduleGet' && p.outletId && p.module) {
      return jsonp_(p.callback, getModuleData_(p));
    }

    if (action === 'moduleList' && p.outletId && p.module) {
      return jsonp_(p.callback, listModuleData_(p));
    }

    if (action === 'list') {
      return jsonp_(p.callback, listSnapshots_());
    }

    if (action === 'verify' && p.snapshotId) {
      return jsonp_(p.callback, verifySnapshot_(p.snapshotId));
    }

    return jsonp_(p.callback, {
      ok: true,
      service: 'BOBS Google-First Data Vault',
      version: '2026-08-28-google-first-modules-2',
      sheets: {
        outletMaster: OUTLET_SHEET,
        moduleData: MODULE_SHEET,
        snapshotVault: SNAPSHOT_SHEET,
        snapshotIndex: INDEX_SHEET
      },
      capabilities: [
        'outletSave', 'outletList', 'outletGet', 'outletUpdate', 'outletDelete', 'outletVerify',
        'moduleSave', 'moduleGet', 'moduleList', 'moduleDelete',
        'snapshot', 'list', 'verify', 'restore'
      ]
    });

  } catch (err) {
    return jsonp_(
      e && e.parameter ? e.parameter.callback : '',
      { ok: false, error: String(err) }
    );
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(
      (e && e.postData && e.postData.contents) || '{}'
    );
    const action = String(body.action || '');

    if (action === 'outletSave') return json_(saveOutlet_(body));
    if (action === 'outletUpdate') return json_(saveOutlet_(body));
    if (action === 'outletDelete') return json_(deleteOutlet_(body.outletId));
    if (action === 'moduleSave') return json_(saveModuleData_(body));
    if (action === 'moduleDelete') return json_(deleteModuleData_(body));
    if (action === 'snapshot') return json_(saveSnapshot_(body));
    if (action === 'restore') return json_(restoreSnapshot_(body.snapshotId));

    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}