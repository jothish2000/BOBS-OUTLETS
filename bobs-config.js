/* BOBS central configuration. Keep the Google Apps Script endpoints here.
   Normal users should never have to paste either URL into individual pages. */
window.BOBS_CONFIG = Object.freeze({
  SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxhGWezXpQy5VBuQ7FDRuTntHFiZjHm5BkEIXUwFppW1w82mw955vV2zGPwkF3wXUb2ww/exec',
  DATA_VAULT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec',
  VERSION: '2026-08-26-phase1-protection-2'
});
try {
  if (!localStorage.getItem('sheets-sync-url')) {
    localStorage.setItem('sheets-sync-url', window.BOBS_CONFIG.SHEETS_WEB_APP_URL);
  }
} catch (e) {}

/* Permanent outlet master is loaded centrally so existing pages can use it
   without requiring a redesign of each page. */
(function(){
  if(window.BOBSOutletMaster) return;
  const s=document.createElement('script');
  s.src='bobs-outlet-master.js?v=phase1-2';
  s.async=false;
  s.onload=function(){ window.dispatchEvent(new Event('bobs-outlet-master-ready')); };
  document.head.appendChild(s);
})();
