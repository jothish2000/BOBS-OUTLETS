/* BOBS Global Saved-Data Decision Layer — Phase 1 protected Start Fresh */
(function(){
const path=(location.pathname.split('/').pop()||'').toLowerCase();
const configs={
'method1.html':{title:'Existing Method 1 data found',key:'method1-hourly-state',research:true,label:'Method 1'},
'method2.html':{title:'Existing Method 2 data found',key:'method2-item-state',research:true,label:'Method 2'},
'staff.html':{title:'Existing Staff / HR data found',key:'staff-data',research:false,label:'Staff / HR'},
'fixed-expenses.html':{title:'Existing Fixed Expense data found',key:'fixed-expenses-data',research:false,label:'Fixed Expenses'},
'production.html':{title:'Existing Production data found',key:'production-data',research:true,label:'Production'},
'roster.html':{title:'Existing Roster data found',key:'roster-data',research:false,label:'Roster'}};
const cfg=configs[path];if(!cfg)return;
function hasSaved(){try{const v=localStorage.getItem(cfg.key);return !!v&&v!=='{}'&&v!=='[]'&&v!=='null'}catch(e){return false}}
function datasets(){try{return JSON.parse(localStorage.getItem('bobs-research-datasets')||'[]')||[]}catch(e){return []}}
function loadProtection(){
  return new Promise((resolve,reject)=>{
    if(window.BOBSProtection){resolve();return;}
    const s=document.createElement('script');
    s.src='bobs-protection.js';
    s.onload=()=>window.BOBSProtection?resolve():reject(new Error('Protection controller unavailable'));
    s.onerror=()=>reject(new Error('Protection controller could not be loaded'));
    document.head.appendChild(s);
  });
}
function modal(){
  const s=document.createElement('style');
  s.textContent='.bobs-decision-overlay{position:fixed;inset:0;background:rgba(0,0,0,.52);display:flex;align-items:center;justify-content:center;padding:18px;z-index:100000}.bobs-decision{width:min(560px,100%);background:var(--paper,#fff);color:var(--ink,#222);border-radius:14px;padding:22px;box-shadow:0 20px 70px rgba(0,0,0,.3)}.bobs-decision h2{margin:0 0 8px;font-size:20px}.bobs-decision p{font-size:13px;line-height:1.5;color:var(--ink-soft,#666)}.bobs-decision-actions{display:grid;gap:9px;margin-top:16px}.bobs-decision-actions button{min-height:48px;border:1px solid rgba(0,0,0,.15);border-radius:9px;padding:9px 13px;text-align:left;cursor:pointer;font-weight:600}.bobs-keep{background:var(--profit,#2f7d32);color:#fff}.bobs-new{background:transparent}.bobs-research{background:var(--paper-dark,#f5f5f5)}.bobs-dataset-list{margin-top:10px;max-height:160px;overflow:auto}.bobs-dataset-list button{width:100%;margin:4px 0}';
  document.head.appendChild(s);
  const ov=document.createElement('div');ov.className='bobs-decision-overlay';
  const box=document.createElement('div');box.className='bobs-decision';
  box.innerHTML='<h2>'+cfg.title+'</h2><p>BOBS has saved information for <b>'+cfg.label+'</b>. Business analysis should normally continue from the information already established.</p><p><b>What would you like to do?</b></p><div class="bobs-decision-actions"><button class="bobs-keep">A. Continue with existing saved data</button><button class="bobs-new">B. Start fresh for this module</button>'+(cfg.research?'<button class="bobs-research">C. Use a saved research dataset</button>':'')+'<div class="bobs-dataset-list" style="display:none"></div></div>';
  ov.appendChild(box);document.body.appendChild(ov);
  box.querySelector('.bobs-keep').onclick=()=>ov.remove();
  box.querySelector('.bobs-new').onclick=async()=>{
    if(!confirm('Start Fresh will first protect this module in the BOBS Data Vault, then clear only the current working data. Separate research datasets will not be deleted. Continue?'))return;
    const btn=box.querySelector('.bobs-new');btn.disabled=true;btn.textContent='Protecting snapshot…';
    try{
      await loadProtection();
      await window.BOBSProtection.protectAndPrepareFresh('Start Fresh — '+cfg.label,[cfg.key]);
      btn.textContent='Protected ✓';
      location.reload();
    }catch(e){
      btn.disabled=false;btn.textContent='B. Start fresh for this module';
      alert('BOBS did not clear the data because the protection step was not completed. Your saved working data remains intact.\n\n'+e.message);
    }
  };
  const rb=box.querySelector('.bobs-research');
  if(rb)rb.onclick=()=>{const list=box.querySelector('.bobs-dataset-list'),ds=datasets();list.style.display='block';if(!ds.length){list.innerHTML='<p>No saved research datasets are available yet.</p>';return}list.innerHTML=ds.map((d,i)=>'<button data-i="'+i+'">'+(d.name||('Research dataset '+(i+1)))+(d.location?' — '+d.location:'')+'</button>').join('');list.querySelectorAll('button').forEach(b=>b.onclick=()=>{localStorage.setItem('bobs-active-research-dataset',JSON.stringify(ds[+b.dataset.i]));ov.remove();location.reload()})};
}
document.addEventListener('DOMContentLoaded',()=>{if(hasSaved())modal()});
})();
