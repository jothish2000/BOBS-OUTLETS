/* BOBS OUTLET MASTER / START-NEW PROTECTION
 * Outlet records are permanent master data for the browser session/app.
 * Start New protects working assessment keys but deliberately preserves OUT.
 */
(function(){
  const OUT='outlets-master';
  const WORKING=['outlet-analysis-data','outlet-selection','method1-hourly-state','method2-item-state'];
  const VAULT_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
  function loadProtection(){return new Promise((resolve,reject)=>{if(window.BOBSProtection){resolve();return}const s=document.createElement('script');s.src='bobs-protection.js';s.onload=()=>window.BOBSProtection?resolve():reject(new Error('Protection controller unavailable'));s.onerror=()=>reject(new Error('Protection controller could not be loaded'));document.head.appendChild(s)})}
  async function protectedStartNew(dataset){
    await loadProtection();
    const result=await window.BOBSProtection.protectAndPrepareFresh('Start New Assessment — Outlet Setup', ['outlet-analysis-data','outlet-selection','method1-hourly-state','method2-item-state']);
    if(!result||!result.sync||result.sync.status!=='verified') throw new Error('Protected snapshot was not independently verified. No working data was cleared.');
    if(dataset)localStorage.setItem('bobs-selected-research-dataset',JSON.stringify(dataset));else localStorage.removeItem('bobs-selected-research-dataset');
    return result;
  }
  window.BOBSOutletProtection={protectedStartNew,permanentOutletKey:OUT,workingKeys:WORKING.slice()};
  document.addEventListener('DOMContentLoaded',()=>{
    const old=window.resetNew;
    if(typeof old!=='function')return;
    window.resetNew=async function(dataset){
      const status=document.getElementById('status');
      try{
        if(status)status.textContent='Protecting the current assessment before Start New…';
        await protectedStartNew(dataset);
        // IMPORTANT: outlets-master is intentionally preserved. It is the outlet master list,
        // not disposable assessment working data.
        let outlets=[];try{outlets=JSON.parse(localStorage.getItem(OUT)||'[]')||[]}catch(e){outlets=[]}
        window.outlets=outlets;
        document.getElementById('count').value=Math.max(1,outlets.length||1);
        if(!outlets.length){outlets=[{id:'1',name:'',shortCode:'',numShifts:2,shiftTimes:[]}];if(typeof shifts==='function')shifts(outlets[0]);window.outlets=outlets}
        if(typeof render==='function')render();
        if(typeof closeModal==='function')closeModal();
        if(status)status.textContent=dataset?'Fresh assessment started using the preserved research dataset. Outlet master data was retained.':'Fresh assessment started with blank working data. Outlet master data was retained.';
      }catch(e){
        if(status)status.textContent='Start New stopped — protection was not verified. Your data remains intact.';
        alert('BOBS did not start a new assessment because the protection step was not completed. Your outlet master and working data remain intact.\n\n'+e.message);
      }
    };
  });
})();
