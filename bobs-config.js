/* BOBS CENTRAL CONFIGURATION — GOOGLE-FIRST
 * Google Sheets is the permanent source of truth.
 * Browser storage is only a temporary UI cache.
 * SHEETS_WEB_APP_URL is retained as a compatibility alias for older modules.
 */
window.BOBS_CONFIG = Object.freeze({
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  VERSION: '2026-09-04-phase1-one-outlet-flow-1'
});
try { localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL); } catch (e) {}
/* Phase 1 flow controller: loaded on every page and acts only on approved navigation points. */
try { const s=document.createElement('script'); s.src='bobs-phase1-flow.js?v='+encodeURIComponent(window.BOBS_CONFIG.VERSION); s.defer=true; document.head.appendChild(s); } catch(e) {}
