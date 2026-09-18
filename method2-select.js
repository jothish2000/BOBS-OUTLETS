(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),outlet=q.get('outlet'),cat=q.get('cat');
let baseline,dirty=false,busy=false;
const menu='method2-select.html?outlet='+encodeURIComponent(outlet||'');
$('allCategories').href=menu;
function notify(){if(window.opener&&!window.opener.closed)window.opener.postMessage({type:'bobs-method2-selection-saved',outlet},location.origin);if(window.BroadcastChannel){const c=new BroadcastChannel('bobs-method2');c.postMessage({type:'bobs-method2-selection-saved',outlet});c.close()}}
function returnToMethod(){if(busy)return; if(dirty&&!confirm('Leave without saving your changed item selection?'))return;dirty=false;if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}else location.href='method2.html?outlet='+encodeURIComponent(outlet)}
function updateCount(){$('selectionCount').textContent=$('items').querySelectorAll('input:checked').length+' items selected'}
function render(){
 if(!cat){$('allCategories').hidden=true;$('categoryGrid').replaceChildren();for(const category of CAT_ORDER){const a=document.createElement('a');a.className='card category-tile';a.href=menu+'&cat='+encodeURIComponent(category);const h=document.createElement('h2');h.textContent=category.replace(' Catalogue','');const info=document.createElement('p');info.textContent=ITEM_DATA[category].length+' items · '+ITEM_DATA[category].filter((_,i)=>M2.selected(baseline,category,i)).length+' selected';a.append(h,info);$('categoryGrid').append(a)}return}
 if(!ITEM_DATA[cat])throw Error('Unknown category. Return to All categories.');
 $('title').textContent=cat.replace(' Catalogue','')+' — select items';$('selectionForm').hidden=false;$('items').replaceChildren();
 ITEM_DATA[cat].forEach((item,i)=>{const row=document.createElement('tr');row.dataset.search=item.name.toLowerCase();const td=document.createElement('td'),check=document.createElement('input');check.type='checkbox';check.value=i;check.checked=M2.selected(baseline,cat,i);check.setAttribute('aria-label','Select '+item.name);check.onchange=()=>{dirty=true;updateCount();$('status').textContent='Selection changed — save to Google before leaving.'};td.append(check);row.append(td);
 [item.name,'₹'+Number(item.price||0).toFixed(2),M2.hasItem(baseline,cat,i)?'Existing setup retained':'New item'].forEach(v=>{const cell=document.createElement('td');cell.textContent=v;row.append(cell)});$('items').append(row)});updateCount();
}
async function load(){try{if(!outlet)throw Error('Select an outlet first.');baseline=M2.state(await M2.read(outlet));const master=await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1');M2.installSides(master?.recipes||[],baseline);render();$('status').textContent='Outlet '+outlet+' · Selections loaded from Google.';$('retry').hidden=true}catch(e){$('status').textContent=e.message;$('retry').hidden=false}}
async function save(another){
 if(busy||!baseline)return;busy=true;$('selectionControls').disabled=true;$('status').textContent='Saving selection and verifying Google…';
 try{const indices=Array.from($('items').querySelectorAll('input:checked'),x=>Number(x.value));const saved=await M2.saveSelection(outlet,cat,indices,baseline);baseline=M2.state(saved);dirty=false;busy=false;notify();$('status').textContent='Selection verified in Google.';if(another)location.href=menu;else returnToMethod()}
 catch(e){$('status').textContent=e.message}finally{busy=false;$('selectionControls').disabled=false}
}
$('selectionForm').onsubmit=e=>{e.preventDefault();save(false)};$('saveAnother').onclick=()=>save(true);
$('filter').oninput=()=>{const value=$('filter').value.trim().toLowerCase();for(const row of $('items').children)row.hidden=!row.dataset.search.includes(value)};
$('returnToMethod').onclick=returnToMethod;$('retry').onclick=load;
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
load();
})();
