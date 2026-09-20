(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
let outlet=q.get('outlet')||JSON.parse(localStorage.getItem('outlet-selection')||'{}').id||'',s=M2.state(),recipes=[],ready=false,generation=0,refreshTimer;
const pendingKey='method2-pending-'+outlet;let pending=JSON.parse(sessionStorage.getItem(pendingKey)||'{}');
const money=n=>'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function entries(){const rows=[];for(const cat of CAT_ORDER)ITEM_DATA[cat].forEach((item,i)=>{if(M2.selected(s,cat,i))rows.push({cat,i,item})});return rows}
function url(cat,i,mode){return 'method2-item.html?'+new URLSearchParams({outlet,cat,i,mode})}
function open(cat,i,mode){
 if(!ready)return;const {k}=M2.keys(cat,i);pending[k]=s.itemEditors[k]?.saveToken||'new';sessionStorage.setItem(pendingKey,JSON.stringify(pending));
 const win=window.open(url(cat,i,mode),'bobs-item-'+outlet+'-'+CAT_ORDER.indexOf(cat)+'-'+i);
 const row=Array.from($('catList').children).find(x=>x.dataset.key===k);if(row){row.children[3].textContent='Editor opened — save required';row.querySelector('.cancel-edit').hidden=false}
 if(!win){$('status').textContent='Allow the item window, or use this link.';const a=document.createElement('a');a.href=url(cat,i,mode);a.target='_top';a.textContent='Open item editor';$('status').append(' ',a)}
}
function filterRows(){const filter=$('search').value.trim().toLowerCase();for(const row of $('catList').children)row.hidden=!row.dataset.search.includes(filter)}
function render(){
 const y=window.scrollY,rows=entries();$('catList').replaceChildren();let sales=0,cost=0,unknown=false;
 for(const {cat,i,item} of rows){
  const d=M2.draft(s,cat,i,item),k=M2.keys(cat,i).k,c=M2.calculate(d,item,recipes);
  sales+=c.revenue||0;if(c.missing.length)unknown=true;else cost+=c.soldCost||0;
  const row=document.createElement('tr');row.className='item selected-row';row.dataset.search=(cat+' '+item.name).toLowerCase();row.dataset.key=k;
  const name=document.createElement('td'),strong=document.createElement('strong');strong.textContent=item.name;name.append(strong);const category=document.createElement('p');category.className='muted';category.textContent=cat.replace(' Catalogue','');name.append(category);
  const mode=document.createElement('td'),select=document.createElement('select');select.setAttribute('aria-label',item.name+' mode');['purchased','production'].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m==='purchased'?'Purchase':'Production';select.append(o)});select.value=d.mode;
  // Mode selection is local UI only. The explicit Edit button opens the editor once.
  mode.append(select);const sold=document.createElement('td');sold.textContent=d.sold===''?'Not entered':d.sold;
  const status=document.createElement('td');status.className='muted';status.textContent=pending[k]?'Editor opened — save required':d.soldConfirmed?'Saved to Google':'Needs Sold Today / item setup';
  const actions=document.createElement('td'),button=document.createElement('button');button.textContent='Edit item ↗';button.onclick=()=>open(cat,i,select.value);button.disabled=!ready;actions.append(button);
  const cancel=document.createElement('button');cancel.className='secondary cancel-edit';cancel.textContent='Keep saved version';cancel.hidden=!pending[k];cancel.onclick=()=>{if(!confirm('Ignore unfinished edits for '+item.name+' and keep the saved Google version? Close the editor without saving.'))return;delete pending[k];sessionStorage.setItem(pendingKey,JSON.stringify(pending));cancel.hidden=true;status.textContent=d.soldConfirmed?'Saved to Google':'Needs Sold Today / item setup'};actions.append(cancel);
  row.append(name,mode,sold,status,actions);$('catList').append(row);
 }
 $('selectedCount').textContent=rows.length+' selected items';$('emptySelection').hidden=rows.length>0;$('selectedCard').hidden=rows.length===0;
 const shared=M2.orderPackingCost(s);cost+=shared.total;unknown=unknown||shared.missing.length>0;
 $('sharedPackingTotal').textContent=shared.missing.length?'Incomplete':money(shared.total);
 $('grandTotalSale').textContent=money(sales);$('grandTotalCost').textContent=unknown?'Incomplete — review selected items':money(cost);$('grandTotalProfit').textContent=unknown?'Incomplete':money(sales-cost);
 filterRows();window.scrollTo({top:y,left:window.scrollX,behavior:'instant'});
}
async function reload(){
 const refresh=$('refresh'),status=$('status');if(!refresh||!status)return;
 const request=++generation;ready=false;status.textContent='Checking Google…';refresh.disabled=true;
 try{if(!outlet)throw Error('Select an outlet in Outlet Setup first.');
 const next=M2.state(await M2.read(outlet));if(request!==generation||!refresh.isConnected)return;
 M2.installSides(next);
 // No recipe read or per-item calculations when nothing has been selected.
 const hasSides=Array.isArray(next.selection?.['Sides & Extras']?.names)&&next.selection['Sides & Extras'].names.length>0;
 const any=CAT_ORDER.some(cat=>ITEM_DATA[cat].some((_,i)=>M2.selected(next,cat,i)));
 const master=(any||hasSides)?await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1'):null;if(request!==generation||!refresh.isConnected)return;
 if(master)M2.installSides(master?.recipes||[],next);s=next;for(const k of Object.keys(pending))if(s.itemEditors[k]?.saveToken&&s.itemEditors[k].saveToken!==pending[k])delete pending[k];
 sessionStorage.setItem(pendingKey,JSON.stringify(pending));recipes=master?.recipes||[];try{M2.cache(outlet,s)}catch(e){}
 ready=true;$('status').textContent='Outlet '+outlet+' · Loaded from Google. Only selected items are shown.';render();
 }catch(e){if(request===generation&&status.isConnected){status.textContent=e.message;ready=false}}
 finally{if(request===generation)refresh.disabled=false}
}
window.BOBS_METHOD2_REVIEW=function(){
 if(!ready){alert('Google records must load before continuing.');return false}
 if(M2.orderPackingCost(s).missing.length){alert('Complete shared packing in Overall COGS before continuing.');return false}
 const problems=[];for(const {cat,i,item} of entries()){
  const d=M2.draft(s,cat,i,item),k=M2.keys(cat,i).k,c=M2.calculate(d,item,recipes);
  if(pending[k]||M2.number(d.sold)===null||!d.soldConfirmed||c.missing.length)problems.push({cat,i,item,d,reason:pending[k]?'Editor not saved':M2.number(d.sold)===null?'Sold Today is blank':!d.soldConfirmed?'Sold Today needs confirmation':'Cost inputs incomplete'});
 }
 if(!problems.length){try{M2.cache(outlet,s)}catch(e){}return true}
 $('reviewItems').replaceChildren();for(const x of problems){const p=document.createElement('p'),b=document.createElement('button');b.textContent=x.item.name+' — '+x.reason;b.onclick=()=>{open(x.cat,x.i,x.d.mode);$('reviewDialog').close()};p.append(b);$('reviewItems').append(p)}$('reviewDialog').showModal();return false;
};
$('review').onclick=()=>{if(window.BOBS_METHOD2_REVIEW())$('status').textContent='All selected items have confirmed Sold Today quantities.'};
$('closeReview').onclick=()=>$('reviewDialog').close();$('refresh').onclick=reload;$('search').oninput=filterRows;
$('overall').href='method2-overall.html?outlet='+encodeURIComponent(outlet);$('staffing').href='workload-planner.html?outlet='+encodeURIComponent(outlet);$('chooseItems').href='method2-select.html?outlet='+encodeURIComponent(outlet);$('chooseItems').target='bobs-select-'+outlet;
function receive(data){if(!['bobs-method2-item-saved','bobs-method2-selection-saved','bobs-purchase-master-saved'].includes(data?.type)||String(data.outlet)!==String(outlet))return;if(data.key)delete pending[data.key];sessionStorage.setItem(pendingKey,JSON.stringify(pending));clearTimeout(refreshTimer);refreshTimer=setTimeout(reload,100)}
window.addEventListener('message',e=>{if(e.origin===location.origin)receive(e.data)});
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-method2');channel.onmessage=e=>receive(e.data)}
// Intentionally no focus-triggered reload: returning focus must never rebuild the list.
reload();
})();
