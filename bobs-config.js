/* BOBS central configuration. Keep the Google Apps Script Web App endpoint here.
   Normal users should never have to paste this URL into individual pages. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  VERSION: '2026-08-25-foundation-1'
});
try {
  if (!localStorage.getItem('sheets-sync-url')) {
    localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.SHEETS_WEB_APP_URL);
  }
} catch (e) {}
