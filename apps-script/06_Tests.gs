/* BOBS GOOGLE-FIRST DATA VAULT — TESTS */

function testDataVault() {
  const sheets = ensureSheets_();
  return {
    ok: true,
    message: 'BOBS Google-first Data Vault ready',
    version: '2026-08-28-google-first-modules-2',
    sheets: {
      outletMaster: sheets.outlet.getName(),
      moduleData: sheets.module.getName(),
      snapshotVault: sheets.snapshot.getName(),
      snapshotIndex: sheets.index.getName()
    }
  };
}