/* Optional early inventory; the same ASSET_MASTER is reused by production and costing. */
(function(root){'use strict';const copy=x=>JSON.parse(JSON.stringify(x));
function merge(record,entries){
 const next=copy(record||{schema:1,assets:[]}),seen=new Set();
 for(const e of entries){
  if(!e.id||seen.has(e.id))throw Error('Equipment identities must be unique.');seen.add(e.id);
  if(!String(e.name||'').trim())throw Error('Name every equipment entry.');
  if(e.ownedQty===''||!Number.isInteger(+e.ownedQty)||+e.ownedQty<0)throw Error(e.name+': enter the number of existing units (0 is allowed).');
  const f=e.capacityFacts||{status:'unknown'};
  if(!['unknown','estimate','confirmed'].includes(f.status))throw Error('Choose a capacity status.');
  if(f.status!=='unknown'){
   if(!(Number.isFinite(+f.value)&&+f.value>0)||!String(f.unit||'').trim()||!String(f.basis||'').trim())throw Error(e.name+': enter the capacity, unit and material / measurement basis.');
   if(f.status==='confirmed'&&!String(f.evidence||'').trim())throw Error(e.name+': describe the nameplate, specification or trial used to confirm capacity.');
  }
  const i=next.assets.findIndex(a=>a.id===e.id),old=i>=0?next.assets[i]:{id:e.id,quantity:0,unitCost:'',residual:'',usefulYears:'',annualDays:'',costConfirmed:false,uses:{},unallocatedReason:''};
  const updated={...old,name:e.name.trim(),ownedQty:+e.ownedQty,quantity:Math.max(+old.quantity||0,+e.ownedQty),capacityFacts:copy(f),capacityNote:f.status==='unknown'?'Capacity pending — measure before production planning':(f.status==='estimate'?'Reference estimate':'Confirmed measurement')+': '+f.value+' '+f.unit+'; '+f.basis+(f.evidence?'; '+f.evidence:'')};
  if(i>=0)next.assets[i]=updated;else next.assets.push(updated);
 }
 // Existing financial fields/allocations stay intact, but the changed asset record needs fresh costing review.
 next.reviewed=false;next.inventoryReviewed=true;next.inventorySavedAt=new Date().toISOString();
 if(next.assets.length)next.noAssets=false;
 return next;
}
root.BOBS_KITCHEN_EQUIPMENT={merge};if(typeof module!=='undefined')module.exports=root.BOBS_KITCHEN_EQUIPMENT;
})(typeof window==='undefined'?globalThis:window);
