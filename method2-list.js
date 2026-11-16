(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
let outlet=q.get('outlet')||JSON.parse(localStorage.getItem('outlet-selection')||'{}').id||'',s=M2.state(),recipes=[],ready=false,generation=0,refreshTimer,nextItemKey='';
const embedded=q.get('flow')==='1';
const setupKey='method2-setup-review-'+outlet;let setupReview=q.get('setup')==='1'||sessionStorage.getItem(setupKey)==='1';
const keptKey=setupKey+'-completed-items';
let keptItems=new Set(JSON.parse(sessionStorage.getItem(keptKey)||'[]'));
function requestSetupReview(value){
 setupReview=value;
 keptItems.clear();
 sessionStorage.removeItem(keptKey);
 if(value)sessionStorage.setItem(setupKey,'1');else sessionStorage.removeItem(setupKey);
}
function needsSetupReview(key){return setupReview && !keptItems.has(key)}
function acceptItemReview(key){
 if(!setupReview||!key)return;
 keptItems.add(key);
 if(entries().every(row=>keptItems.has(M2.keys(row.cat,row.i).k)))requestSetupReview(false);
 else sessionStorage.setItem(keptKey,JSON.stringify([...keptItems]));
}
if(q.get('setup')==='1'){requestSetupReview(true);const clean=new URL(location.href);clean.searchParams.delete('setup');history.replaceState(null,'',clean)}
const pendingKey='method2-pending-'+outlet;let pending=JSON.parse(sessionStorage.getItem(pendingKey)||'{}');
let kitchenNames = new Map();
let completedTotals = null;
window.BOBS_METHOD2_TOTALS = () => ready && itemsComplete() ? completedTotals : null;
function setGuide(stage,text,expected,actionText,href){
 const stageEl=$('guideStage'),textEl=$('guideText'),expectedEl=$('guideExpected'),action=$('guideAction');if(!stageEl||!textEl||!expectedEl||!action)return;
 stageEl.textContent=stage;textEl.textContent=text;expectedEl.innerHTML='<strong>Expected result:</strong> '+expected;
 if(actionText&&href){action.textContent=actionText;action.href=href;action.hidden=false;action.target=href.startsWith('#')?'':'_blank'}else{action.hidden=true;action.removeAttribute('href');action.removeAttribute('target')}
}
function entries(){const rows=[],seenSides=new Set();for(const cat of CAT_ORDER)ITEM_DATA[cat].forEach((item,i)=>{if(!M2.selected(s,cat,i))return;if(cat===M2.SIDES){const key=String(item.recipeName||item.name||'').trim().toLowerCase();if(seenSides.has(key))return;seenSides.add(key)}rows.push({cat,i,item})});return rows}
function url(cat,i,mode){const target='method2-item.html?'+new URLSearchParams({outlet,cat,i,mode});return window.BOBS_WINDOW_RETURN?BOBS_WINDOW_RETURN.child(target):target}
function open(cat,i,mode){
 if(!ready)return;const {k}=M2.keys(cat,i);pending[k]=s.itemEditors[k]?.saveToken||'new';sessionStorage.setItem(pendingKey,JSON.stringify(pending));
 const win=window.BOBS_WINDOW_RETURN?.openWorkspace?BOBS_WINDOW_RETURN.openWorkspace(url(cat,i,mode)):window.open(url(cat,i,mode),'bobs-item-'+outlet+'-'+CAT_ORDER.indexOf(cat)+'-'+i);
 render();
 if(!win){$('status').textContent='Allow the item window, or use this link.';const a=document.createElement('a');a.href=url(cat,i,mode);a.target='_top';a.textContent='Open item editor';$('status').append(' ',a)}
}
function keepSavedOption(key, itemName) {
 const details=document.createElement('details');
 details.className='row-options';
 const summary=document.createElement('summary');
 summary.textContent='Other options';
 summary.setAttribute('aria-label','Other options for '+itemName);
 const help=document.createElement('p');
 help.textContent='Use the setup already saved for '+itemName+'. Changes made here or in an unfinished editor are not saved by this action.';
 const keep=document.createElement('button');
 keep.type='button';
 keep.className='secondary cancel-edit';
 keep.textContent='Keep saved version';
 keep.onclick=()=>{
   if(!confirm('Use the saved setup for '+itemName+'? Any open item editor must be closed separately.'))return;
   delete pending[key];
   acceptItemReview(key);
   sessionStorage.setItem(pendingKey,JSON.stringify(pending));
   render();
   const row=[...$('catList').children].find(row=>row.dataset.key===key);
   row?.querySelector('[data-edit-item]')?.focus({preventScroll:true});
 };
 details.append(summary,help,keep);
 return details;
}
function filterRows(){const filter=$('search').value.trim().toLowerCase();for(const row of $('catList').children)row.hidden=!row.dataset.search.includes(filter)}
function render(){
 const y=window.scrollY,rows=entries();nextItemKey='';$('catList').replaceChildren();let sales=0,cost=0,unknown=false,incomplete=0,firstIncomplete='';
 for(const {cat,i,item} of rows){
  const d=M2.draft(s,cat,i,item),k=M2.keys(cat,i).k,c=M2.calculate(d,item,recipes);
  const confirmed = d.soldConfirmed && M2.number(d.sold) !== null;
  if (!confirmed || c.missing.length) unknown = true;
  else { sales += c.revenue; cost += c.soldCost; }
  const needsSetup = needsSetupReview(k) || !!pending[k] || !confirmed || c.missing.length > 0;
  if(needsSetup){incomplete++;if(!firstIncomplete){firstIncomplete=item.name;nextItemKey=k}}
  const row=document.createElement('tr');row.className='item selected-row';row.dataset.search=(cat+' '+item.name).toLowerCase();row.dataset.key=k;row.dataset.needsSetup=String(needsSetup);
  const name=document.createElement('td'),strong=document.createElement('strong');strong.textContent=item.name;name.append(strong);const category=document.createElement('p');category.className='muted';category.textContent=cat.replace(' Catalogue','');name.append(category);
  const mode=document.createElement('td'),select=document.createElement('select');select.setAttribute('aria-label',item.name+' mode');['purchased','production'].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m==='purchased'?'Purchase':'Production';select.append(o)});select.value=d.mode;
  // Mode selection is local UI only. The explicit Edit button opens the editor once.
  mode.append(select);
  const supply = document.createElement('td');
  const requiredSources = [
    ...(d.mode === 'production' ? [k] : []),
    ...(d.condiments || []).filter(side => side.source !== 'purchase').map(side => k + ':' + side.recipeName)
  ];
  const sourceIds = requiredSources.map(key => s.kitchenSources?.[key]?.kitchenId);
  const kitchenPending = sourceIds.some(id => !id);
  const kitchens = [...new Set(sourceIds.filter(Boolean).map(id => kitchenNames.get(id) || id))];
  supply.textContent = kitchens.length
    ? kitchens.join(', ') + (kitchenPending ? ' · some sources pending' : '')
    : kitchenPending ? 'Choose during setup' : '—';
  const started = !!s.itemEditors[k] || !!pending[k] || kitchens.length > 0;
  const hasResult = confirmed && !c.missing.length;
  const complete = hasResult && !kitchenPending && !pending[k] && !needsSetupReview(k);
  const status = document.createElement('td');
  if (hasResult && kitchenPending) status.textContent = 'Daily results saved · kitchen setup pending';
  else if (complete) status.textContent = 'Item inputs complete';
  else status.textContent = started ? 'In progress' : 'Not started';
  const actions=document.createElement('td');
  actions.className='setup-actions';
  const button=document.createElement('button');
  button.type='button';
  button.dataset.editItem='true';
  button.textContent=complete?'Open setup':started?'Continue setup':'Set up '+item.name;
  button.disabled=!ready;
  button.onclick=()=>open(cat,i,select.value);
  actions.append(button);
  if(s.itemEditors[k] && (pending[k] || needsSetupReview(k)))actions.append(keepSavedOption(k,item.name));
  for(const [cell,label] of [[mode,'Mode'],[supply,'Supplying kitchen'],[status,'Setup progress']])cell.dataset.label=label;
  row.append(name,mode,supply,status,actions);$('catList').append(row);
 }
 $('chooseItems').classList.toggle('secondary',rows.length>0);
 $('selectedCount').textContent=rows.length+' selected item'+(rows.length===1?'':'s');$('emptySelection').hidden=rows.length>0;$('selectedCard').hidden=rows.length===0;
 const shared=M2.orderPackingCost(s);cost+=shared.total;unknown=unknown||shared.missing.length>0;
 completedTotals = unknown || !rows.length ? null : {sales, cost, profit: sales-cost};
 if(!rows.length){
  setGuide('STEP 1','Choose the categories and items this outlet will sell. Use “Choose categories & items”, tick only the items you need, and save the selection.','Your selected items appear on this page and BOBS can start item-level costing.','Choose categories & items →',$('chooseItems').href);
 }else if(incomplete){
  const firstRow=[...$('catList').children].find(row=>row.dataset.key===nextItemKey);
  const setupLabel=firstRow.querySelector('[data-edit-item]').textContent;
  setGuide('STEP 2','Find '+firstIncomplete+', choose Purchase or Production in its Mode column, then select “'+setupLabel+'”.','The item opens with the mode you selected.');

 }else if(shared.missing.length){
  setGuide('STEP 2','The selected items are saved. Click “Open Overall COGS ↗” below, complete and save the shared order-packing choices there. Return here and click “Reload Google records”.','The costing page shows the saved packing choice. '+(embedded?'Then scroll below the Method 2 panel and click “Save & Continue”.':'Then click “Check completion”.'),'Open Overall COGS ↗',$('overall').href);
 }else{
  if(embedded)setGuide('STEP 3','All selected items and shared packing are complete. Scroll below this Method 2 panel and click “Save & Continue”.','BOBS saves this outlet’s Method 2 analysis and asks whether you also want to analyse the other method.');
  else setGuide('STEP 3','Your selected items are complete. Open “Workload & staffing plan” to calculate the roles, positions, timing and labour requirement for this menu.','Save the staffing plan to use labour in product cost and ideal-price calculations.','Open Workload & Staffing Plan →',$('staffing').href);
 }
 filterRows();rootRenderEvent();window.scrollTo({top:y,left:window.scrollX,behavior:'instant'});
}
function itemsComplete(){return ready&&!setupReview&&entries().length>0&&!M2.orderPackingCost(s).missing.length&&entries().every(({cat,i,item})=>{const d=M2.draft(s,cat,i,item);return !pending[M2.keys(cat,i).k]&&M2.number(d.sold)!==null&&d.soldConfirmed&&!M2.calculate(d,item,recipes).missing.length})}
window.BOBS_METHOD2_ITEMS_COMPLETE=itemsComplete;
function rootRenderEvent(){window.dispatchEvent(new Event('bobs-method2-items-rendered'));notifyGuide()}
function notifyGuide(){window.dispatchEvent(new Event('bobs-guide-context'));try{if(embedded&&parent!==window&&parent.location.origin===location.origin)parent.dispatchEvent(new parent.Event('bobs-guide-context'));}catch(_){}}
function visiblePendingRow(){
 return [...$('catList').children].find(row=>!row.hidden && row.dataset.needsSetup==='true');
}
window.BOBS_METHOD2_GUIDE={
 snapshot(){
  const rows=ready?[...$('catList').children]:[];
  const items=rows.filter(row=>!row.hidden).map(row=>({
    key:row.dataset.key,
    name:row.querySelector('strong').textContent,
    mode:row.querySelector('select').value,
    setupLabel:row.querySelector('[data-edit-item]').textContent
  }));
  const pendingRow=ready ? visiblePendingRow() : null;
  const item=items.find(entry=>entry.key===pendingRow?.dataset.key);
  const action=$('guideAction');
  const filteredPending=ready && !!nextItemKey && !item;
  const instruction=filteredPending
    ? (items.length?'The matching items have no pending setup steps. Clear your search to see the other items.':'No selected items match your search. Change or clear it to find an item.')
    : item ? 'Select “'+item.setupLabel+'” in the '+item.name+' row.' : $('guideText').textContent;
  return {ready,itemsReadyToContinue:ready && !!completedTotals && !nextItemKey,stage:$('guideStage').textContent,instruction,items,item,
   action:filteredPending || item ? null : !ready?'Show Reload Google records':!action.hidden?action.textContent:embedded?'Show Save & Continue':'Show Check completion'};
 },
 focus(){
  if(!ready){$('refresh').scrollIntoView({block:'center'});$('refresh').focus();return;}
  if(nextItemKey){
   const row=visiblePendingRow();
   const target=row ? row.querySelector('[data-edit-item]') : $('search');
   target.scrollIntoView({block:'center',inline:'center'});
   target.focus({preventScroll:true});
   return;
  }
  const action=$('guideAction');
  if(!action.hidden){const target=[...document.querySelectorAll('main a:not(#guideAction)')].find(a=>a.href===action.href);if(target){const panel=target.closest('details');if(panel)panel.open=true;target.scrollIntoView({block:'center'});target.focus();}else if(action.getAttribute('href')==='#refresh'){$('refresh').focus();}else{action.click();}return;}
  if(embedded){parent.BOBS_METHOD_FLOW_GUIDE.focusContinue();return;}
  $('review').scrollIntoView({block:'center'});$('review').focus();
 }
};
// Observe existing page guidance, including workload-gate updates, without additional reads.
new MutationObserver(notifyGuide).observe($('pageGuide'),{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','href']});
$('catList').addEventListener('change',notifyGuide);

async function reload(){
 const refresh=$('refresh'),status=$('status');if(!refresh||!status)return;
 const request=++generation;ready=false;status.textContent='Checking Google…';refresh.disabled=true;setGuide('CHECKING GOOGLE','Reading the saved Method 2 items for this outlet.','BOBS will show the next action when Google confirms the record.');
 try{if(!outlet)throw Error('Select an outlet in Outlet Setup first.');
 const next=M2.state(await M2.read(outlet));if(request!==generation||!refresh.isConnected)return;
 M2.installSides(next);
 // No recipe read or per-item calculations when nothing has been selected.
 const hasSides=Array.isArray(next.selection?.['Sides & Extras']?.names)&&next.selection['Sides & Extras'].names.length>0;
 const any=CAT_ORDER.some(cat=>ITEM_DATA[cat].some((_,i)=>M2.selected(next,cat,i)));
 const master=(any||hasSides)?(window.BOBS_OPERATIONAL_RECIPES?await BOBS_OPERATIONAL_RECIPES.load():await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1')):null;if(request!==generation||!refresh.isConnected)return;
 if(Object.values(next.kitchenSources||{}).some(source=>source?.kitchenId) && window.BOBS_VERIFIED){
   const register = await BOBS_VERIFIED.read('COMPANY','KITCHEN_MASTER').catch(()=>null);
   if(request!==generation||!refresh.isConnected)return;
   kitchenNames = new Map((register?.kitchens || []).map(kitchen=>[kitchen.id,kitchen.name]));
 }
 if(master)M2.installSides(master?.recipes||[],next);s=next;for(const k of Object.keys(pending))if(s.itemEditors[k]?.saveToken&&s.itemEditors[k].saveToken!==pending[k])delete pending[k];
 sessionStorage.setItem(pendingKey,JSON.stringify(pending));recipes=master?.recipes||[];try{M2.cache(outlet,s)}catch(e){}
 ready=true;$('status').textContent='Outlet '+outlet+' · Loaded from Google. Only selected items are shown.';render();
 }catch(e){if(request===generation&&status.isConnected){status.textContent=e.message;ready=false;setGuide('GOOGLE READ FAILED','BOBS could not check your saved Method 2 items. Click “Retry Google read” here (or “Reload Google records” below). Do not click “Save & Continue” until the selected items load.','Your selected items appear and BOBS Guide identifies the next item to edit. If the timeout repeats, keep this page open and report the error; do not reselect or overwrite items.','Retry Google read','#refresh')}}
 finally{if(request===generation)refresh.disabled=false}
}
window.BOBS_METHOD2_REVIEW=function(){
 if(setupReview){render();alert('Review Purchase/Production, supply quantity and Sold Today for the selected items, or explicitly keep their saved setup.');return false}
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
if($('guideAction'))$('guideAction').addEventListener('click',e=>{if($('guideAction').getAttribute('href')==='#refresh'){e.preventDefault();reload()}});
// The containing outlet flow runs the same review from Save & Continue.
if(embedded)$('review').hidden=true;
$('closeReview').onclick=()=>$('reviewDialog').close();$('refresh').onclick=reload;$('search').oninput=()=>{filterRows();notifyGuide()};
$('overall').href='method2-overall.html?outlet='+encodeURIComponent(outlet);$('staffing').href='outlet-plan.html?'+new URLSearchParams({outlet,stage:'workforce',returnTo:location.href});$('chooseItems').href='method2-select.html?outlet='+encodeURIComponent(outlet);$('chooseItems').target='bobs-select-'+outlet;
function receive(data){if(!['bobs-method2-item-saved','bobs-method2-selection-saved','bobs-purchase-master-saved'].includes(data?.type)||String(data.outlet)!==String(outlet))return;if(data.type==='bobs-method2-selection-saved'&&data.reviewItems)requestSetupReview(true);if(data.type==='bobs-method2-item-saved')acceptItemReview(data.key);if(data.key)delete pending[data.key];sessionStorage.setItem(pendingKey,JSON.stringify(pending));clearTimeout(refreshTimer);refreshTimer=setTimeout(reload,100)}
window.addEventListener('message',e=>{if(e.origin===location.origin)receive(e.data)});
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-method2');channel.onmessage=e=>receive(e.data)}
// Intentionally no focus-triggered reload: returning focus must never rebuild the list.
reload();
})();
