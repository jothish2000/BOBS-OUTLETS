(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
let outlet=q.get('outlet')||JSON.parse(localStorage.getItem('outlet-selection')||'{}').id||'',s=M2.state(),recipes=[],ready=false;
const pendingKey='method2-pending-'+outlet;let pending=JSON.parse(sessionStorage.getItem(pendingKey)||'{}');
function url(cat,i,mode){return 'method2-item.html?'+new URLSearchParams({outlet,cat,i,mode})}
function active(cat,i){const {k,q,legacy}=M2.keys(cat,i);return pending[k]||s.itemEditors[k]||s.qtys[q]!==undefined||s.prod[legacy]||s.condiments[k]?.length||s.packaging[k]?.length}
function open(cat,i,mode){
 const {k}=M2.keys(cat,i);pending[k]=s.itemEditors[k]?.saveToken||'new';sessionStorage.setItem(pendingKey,JSON.stringify(pending));
 const win=window.open(url(cat,i,mode),'bobs-item-'+outlet+'-'+CAT_ORDER.indexOf(cat)+'-'+i);
 if(!win){$('status').textContent='Allow the item window, or use this link.';const a=document.createElement('a');a.href=url(cat,i,mode);a.target='_top';a.textContent='Open item editor';$('status').append(' ',a)}
}
function render(){
 $('catList').replaceChildren();let sales=0,cost=0,unknown=false;const filter=$('search').value.toLowerCase();
 for(const cat of CAT_ORDER){
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=cat;details.append(summary);if(filter)details.open=true;let count=0;
  ITEM_DATA[cat].forEach((item,i)=>{
   const d=M2.draft(s,cat,i,item),k=M2.keys(cat,i).k,c=M2.calculate(d,item,recipes),isActive=active(cat,i);
   if(isActive){sales+=c.revenue||0;if(c.missing.length)unknown=true;else cost+=c.soldCost||0}
   if(filter&&!item.name.toLowerCase().includes(filter)&&!cat.toLowerCase().includes(filter))return;count++;
   const row=document.createElement('div');row.className='item';const text=document.createElement('div'),name=document.createElement('strong');name.textContent=item.name;text.append(name);
   const note=document.createElement('p');note.className='muted';note.textContent=isActive?'Sold: '+(d.sold===''?'not entered':d.sold)+' · '+(pending[k]?'Editor opened — save required':d.soldConfirmed?'Saved to Google':'Review Sold Today'):'Not selected';text.append(note);
   const actions=document.createElement('div');actions.className='actions';const select=document.createElement('select');select.setAttribute('aria-label',item.name+' mode');
   ['purchased','production'].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m==='purchased'?'Purchase':'Production';select.append(o)});select.value=d.mode;
   select.onchange=()=>open(cat,i,select.value);const button=document.createElement('button');button.textContent='Edit item ↗';button.onclick=()=>open(cat,i,select.value);button.disabled=!ready;
   actions.append(select,button);if(pending[k]){const cancel=document.createElement('button');cancel.className='secondary';cancel.textContent='Cancel edit';cancel.onclick=()=>{if(confirm('Ignore the unfinished editor for '+item.name+'? Previously saved Google data will be kept. Close that editor without saving.')){delete pending[k];sessionStorage.setItem(pendingKey,JSON.stringify(pending));render()}};actions.append(cancel)}row.append(text,actions);details.append(row);
  });if(count)$('catList').append(details);
 }
 $('grandTotalSale').textContent=money(sales);$('grandTotalCost').textContent=unknown?'Incomplete — review recipes':money(cost);$('grandTotalProfit').textContent=unknown?'Incomplete':money(sales-cost);
}
const money=n=>'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
async function reload(){
 ready=false;$('status').textContent='Checking Google…';
 try{if(!outlet)throw Error('Select an outlet in Outlet Setup first.');
 const [data,master]=await Promise.all([M2.read(outlet),M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1')]);
 s=M2.state(data);for(const k of Object.keys(pending))if(s.itemEditors[k]?.saveToken&&s.itemEditors[k].saveToken!==pending[k])delete pending[k];sessionStorage.setItem(pendingKey,JSON.stringify(pending));recipes=master?.recipes||[];try{M2.cache(outlet,s)}catch(e){}ready=true;$('status').textContent='Outlet '+outlet+' · Loaded from Google. Save each item in its editor.';render();
 }catch(e){$('status').textContent=e.message;ready=false}
}
window.BOBS_METHOD2_REVIEW=function(){
 if(!ready){alert('Google records must load before continuing.');return false}
 const problems=[];for(const cat of CAT_ORDER)ITEM_DATA[cat].forEach((item,i)=>{
  if(!active(cat,i))return;const d=M2.draft(s,cat,i,item),k=M2.keys(cat,i).k,c=M2.calculate(d,item,recipes);
  if(pending[k]||M2.number(d.sold)===null||!d.soldConfirmed||c.missing.length)problems.push({cat,i,item,d,reason:pending[k]?'Editor not saved':M2.number(d.sold)===null?'Sold Today is blank':!d.soldConfirmed?'Sold Today needs confirmation':'Recipe cost is incomplete'});
 });
 if(!problems.length){M2.cache(outlet,s);return true}
 $('reviewItems').replaceChildren();problems.forEach(x=>{const row=document.createElement('p'),b=document.createElement('button');b.textContent=x.item.name+' — '+x.reason;b.onclick=()=>{open(x.cat,x.i,x.d.mode);$('reviewDialog').close()};row.append(b);$('reviewItems').append(row)});$('reviewDialog').showModal();return false;
};
$('review').onclick=()=>{if(window.BOBS_METHOD2_REVIEW())$('status').textContent='All selected items have confirmed Sold Today quantities.'};
$('closeReview').onclick=()=>$('reviewDialog').close();$('refresh').onclick=reload;$('search').oninput=render;
$('overall').href='method2-overall.html?outlet='+encodeURIComponent(outlet);
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='bobs-method2-item-saved'||String(e.data.outlet)!==String(outlet))return;delete pending[e.data.key];sessionStorage.setItem(pendingKey,JSON.stringify(pending));reload()});
window.addEventListener('focus',()=>{if(ready)reload()});
reload();
})();
