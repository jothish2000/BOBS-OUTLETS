/* Reuses each position's live controls and salary package; pagination never deletes draft fields. */
(function(){'use strict';const T={};
T.mount=({host,positions,norms,onChange,onAdd,roles})=>{
 if(!host)return;host.classList.add('staff-entry-table');
 const toolbar=document.createElement('div');toolbar.className='staff-entry-tools';
 toolbar.innerHTML='<p>Enter each person’s own THP and benefits. Up to three people are shown together; the remaining entries stay in this form.</p><label>Add role <select class="staff-add-role"></select></label><label>Number of people <input class="staff-add-count" type="number" min="1" max="100" value="1"></label><button type="button" class="staff-add">Add these positions</button><div class="staff-pages"><button type="button" class="staff-prev">Previous people</button><span role="status"></span><button type="button" class="staff-next">Next people</button></div>';
 const select=toolbar.querySelector('select');for(const r of roles||[]){const o=document.createElement('option');o.value=r;o.textContent=r;select.append(o)}
 if(!onAdd)toolbar.querySelectorAll('label,.staff-add').forEach(el=>el.hidden=true);
 host.before(toolbar);host._toolbar?.remove();host._toolbar=toolbar;
 toolbar.querySelector('.staff-add').onclick=()=>{const n=Number(toolbar.querySelector('.staff-add-count').value);if(Number.isInteger(n)&&n>0&&n<=100)onAdd?.(select.value,n);};
 let page=0;const columns=[...host.children].filter(el=>el.hasAttribute('data-position'));
 for(const [i,col] of columns.entries()){
  col.setAttribute('aria-label','Person '+(i+1));col.classList.add('staff-person-column');
  const p=positions.find(p=>p.id===col.dataset.position);if(!p)continue;
  const perks=document.createElement('fieldset');perks.className='staff-perks';const legend=document.createElement('legend');legend.textContent='This person’s package';perks.append(legend);
  let pkg;try{pkg=p.salaryPackage||BOBS_SALARY_PACKAGE.defaults(norms)}catch(_){const note=document.createElement('p');note.textContent='Load Google salary norms to edit benefits.';perks.append(note);col.append(perks);continue;}
  const fields=[['consolidated','Consolidated salary',pkg.payType==='consolidated'],['pf','PF applies',pkg.pf==='yes'],['esi','ESI applies',pkg.esi==='yes'],...(pkg.components||[]).map(c=>['component:'+c.id,c.name,c.enabled])];
  for(const [key,label,value] of fields){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!!value;input.dataset.packageField=key;input.disabled=!!p.staffId;input.onchange=()=>{
   p.salaryPackage=BOBS_VERIFIED.clone(p.salaryPackage||pkg);const draft=p.salaryPackage;
   if(key==='consolidated')draft.payType=input.checked?'consolidated':'structured';else if(key==='pf'||key==='esi')draft[key]=input.checked?'yes':'no';else draft.components.find(c=>c.id===key.slice(10)).enabled=input.checked;
   draft.eligibilityConfirmed=false;onChange?.(p);col.querySelector('.fundingPreview')?.remove();col.querySelector('[data-field=takeHome]')?.dispatchEvent(new Event('input',{bubbles:true}));
  };l.append(input,' '+label);perks.append(l);}
  const note=document.createElement('small');note.textContent='Consolidated pay does not remove statutory eligibility. Review this person’s package to confirm eligibility, exclusion reasons and rates after changes. Linked employee packages are edited in their salary window.';perks.append(note);col.append(perks);
 }
 function show(){const pages=Math.max(1,Math.ceil(columns.length/3));page=Math.min(page,pages-1);columns.forEach((el,i)=>el.hidden=Math.floor(i/3)!==page);toolbar.querySelector('[role=status]').textContent=columns.length?'People '+(page*3+1)+'–'+Math.min(page*3+3,columns.length)+' of '+columns.length:'No paid positions';toolbar.querySelector('.staff-prev').disabled=page===0;toolbar.querySelector('.staff-next').disabled=page>=pages-1;}
 toolbar.querySelector('.staff-prev').onclick=()=>{page--;show()};toolbar.querySelector('.staff-next').onclick=()=>{page++;show()};show();
};window.BOBS_STAFF_TABLE=T;})();
