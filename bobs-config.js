/* BOBS CENTRAL CONFIGURATION — GOOGLE-FIRST
 * Google Sheets is the permanent source of truth.
 * Browser storage is only a temporary UI cache.
 */
window.BOBS_CONFIG = Object.freeze({
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  VERSION: '2026-08-27-google-first-2'
});
try { localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL); } catch (e) {}
