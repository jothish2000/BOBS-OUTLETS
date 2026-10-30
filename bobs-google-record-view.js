(function(){'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),o=q.get('outlet'),m=q.get('module'),k=q.get('key')||'default';
const labels={KITCHEN_MASTER:'Production locations — attached shop kitchens and separate common kitchens',KITCHEN_COST_PLAN:'Shared production costs and vehicle journey allocations',OUTLET_BASELINE:'Outlet expenses and mandatory staff coverage',OUTLET_STAFFING:'Production workforce, riders and salary budgets',FIXED_EXPENSES:'Selected outlet expenses',OUTLET_PRODUCTION_PLAN:'Equipment capacity, intended quantities and production timings',ASSET_MASTER:'Machinery assets and product depreciation shares',OUTLET_COST_ALLOCATIONS:'Item shares of staff and outlet expenses',OUTLET_ITEM_REQUIREMENTS:'Item delivery choices',WORKING_CAPITAL:'Daily working-capital plan',CAPITAL_EXPENDITURE:'Equipment purchase budget',OUTLET_SETUP:'Outlet names and shifts',METHOD2:'Selected menu and saved item quantities'};
const title=labels[m]||m||'Saved BOBS record',isKitchen=/^Kitchen-/.test(o||'');
$('title').textContent=m==='ASSET_MASTER'?'Saved equipment and capacity':title;
let busy=false;
function node(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
function date(value){if(!value)return 'Not recorded in this version';const d=new Date(value);return isNaN(d)?String(value):d.toLocaleString('en-IN');}
function qty(value,unit){return value==null||value===''?'Not recorded':window.BOBS_NUMBERS?.quantity(value,unit)??String(value);}
function safeReturn(){try{const u=new URL(q.get('returnTo'),location.href);if(q.get('returnTo')&&u.origin===location.origin&&/^https?:$/.test(u.protocol))return u.href;}catch(_){}return new URL((isKitchen?'kitchen-equipment.html':'asset-master.html')+'?'+new URLSearchParams({outlet:o||''}),location.href).href;}
function guide(message,label){const box=$('recordGuide');box.replaceChildren(node('h2','BOBS Guide — next step'),node('p',message));if(label){const a=node('a',label);a.href=safeReturn();a.className='record-action';box.append(a);}box.hidden=false;}
async function identity(){
 if(isKitchen){const r=await BOBS_VERIFIED.read('COMPANY','KITCHEN_MASTER');const x=r?.kitchens?.find(x=>x.id===o);if(!x)throw Error('Kitchen name is not available in the saved register.');return x.name||'Unnamed kitchen';}
 const outlets=await BOBS_DATA.listOutlets();return outlets.find(x=>String(x.id)===o)?.name||'Outlet '+o;
}
function inventory(r,name){
 const assets=r?.assets??[];if(!Array.isArray(assets)||assets.some(a=>!a||typeof a!=='object'))throw Error('Equipment entries have an unexpected format. No empty inventory is assumed.');
 const box=$('equipmentList');box.append(node('h2','Saved equipment — '+name));
 if(!assets.length){box.append(node('p','No equipment has been added for '+name+' yet. This means no equipment is recorded here; it does not mean the kitchen owns no machines.'));guide('Return to existing equipment and choose “Help me identify my existing equipment”. Select the food you produce, choose machines you already own, review the entries, then save.','Return to existing equipment →');return;}
 box.append(node('p',assets.length+' saved equipment '+(assets.length===1?'entry':'entries')+'. Existing units are shown separately from planned asset quantities.'));
 const wrap=document.createElement('div');wrap.className='record-scroll';wrap.tabIndex=0;wrap.setAttribute('aria-label','Saved equipment table');
 const table=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');
 for(const label of ['Equipment','Existing units','Capacity per machine / cycle','Capacity status','Basis / evidence'])tr.append(node('th',label));head.append(tr);table.append(head);
 const body=document.createElement('tbody');
 for(const a of assets){const f=a.capacityFacts||{},row=document.createElement('tr'),known=f.status==='confirmed'||f.status==='estimate';
 const capacity=known&&f.value!==''&&f.value!=null?qty(f.value,f.unit)+' '+(f.unit||'unit not recorded'):'Not recorded — pending measurement';
 const status=f.status==='confirmed'?'Recorded as confirmed — check evidence':f.status==='estimate'?'Reference / working estimate — needs confirmation':'Unknown — pending measurement';
 for(const value of [a.name||'Unnamed equipment',qty(a.ownedQty,'pieces'),capacity,status,[f.basis,f.evidence].filter(Boolean).join(' · ')||a.capacityNote||'Not recorded'])row.append(node('td',value));
 body.append(row);}
 table.append(body);wrap.append(table);box.append(wrap);
 guide('Review these saved entries. To add or correct machines, return to existing equipment. After reviewing and saving there, continue to outlet expenses and mandatory staff. Production capacity and costing are reviewed later against the menu.','Return to review existing equipment →');
}
async function load(){
 if(busy)return;busy=true;$('retry').disabled=true;$('status').textContent='Reading the current saved record from Google…';$('summary').replaceChildren();$('equipmentList').replaceChildren();$('recordGuide').hidden=true;$('record').textContent='';
 $('description').textContent=(isKitchen?'Kitchen':'Outlet')+' saved record — '+title+'.';
 try{
 if(!o||!m)throw Error('Open this viewer from the records link on an outlet or kitchen page.');
 // A failed identity lookup must not hide an otherwise readable equipment record.
 const [recordResult,nameResult]=await Promise.allSettled([m==='OUTLET_SETUP'?BOBS_DATA.listOutlets():BOBS_VERIFIED.read(o,m,k),identity()]);
 if(recordResult.status==='rejected')throw recordResult.reason;
 const r=recordResult.value,name=nameResult.status==='fulfilled'?nameResult.value:(isKitchen?'Kitchen (name could not be verified)':'Outlet '+o);
 $('description').textContent=name+' — '+title+'.'+(nameResult.status==='rejected'?' The name could not be verified; Refresh to retry.':'');
 $('status').textContent=r?'Saved Google record loaded and verified.':'Google confirms that no record has been saved here yet.';
 $('record').textContent=JSON.stringify(r,null,2);
 const lines=[[(isKitchen?'Kitchen':'Outlet'),name],['Record ID',o],['Record',title]];
 if(r){lines.push(['Saved at',date(r.savedAt||r._bobsMeta?.savedAt)]);
 if(m==='ASSET_MASTER')lines.push(['Equipment inventory review',r.inventoryReviewed===true?'Marked reviewed when inventory was saved':'No saved inventory-review confirmation'],['Inventory saved at',date(r.inventorySavedAt)],['Asset costing review',r.reviewed===true?'Marked reviewed when saved — current menu and cost dependencies still need checking':'Pending — separate from the equipment inventory review']);
 else lines.push(['Review status',r.reviewed?'Marked reviewed when saved — dependent inputs may since have changed':'Not marked reviewed']);
 if(Array.isArray(r.positions))lines.push(['Positions',r.positions.map(p=>p.id+' — '+p.role).join('; ')||'No paid positions']);
 if(Array.isArray(r.ownerCoverage))lines.push(['Owner counter coverage',r.ownerCoverage.map((x,i)=>'Shift '+(i+1)+': '+(x?'owner covers':'not selected')).join('; ')]);
 }
 for(const [label,value] of lines)$('summary').append(node('dt',label),node('dd',value));
 if(m==='ASSET_MASTER')inventory(r,name);
 }catch(e){$('equipmentList').replaceChildren();$('status').textContent='Could not verify the saved Google record: '+e.message+' Use Refresh to try again.';guide('The equipment record could not be verified. Click “Refresh saved record from Google”. A failed read does not mean no equipment is saved.');}
 finally{busy=false;$('retry').disabled=false;}
}
$('retry').onclick=load;load();
})();
