(function(){'use strict';
window.M2OrderUI={init(outlet,baseline,onSaved){
 const $=id=>document.getElementById(id);let current=baseline,p=M2.clone(baseline.orderPacking||{enabled:false,rows:[]}),dirty=false,busy=false;
 $('sharedEnabled').checked=!!p.enabled;
 function total(){const c=M2.orderPackingCost({orderPacking:p});$('sharedTotal').textContent=c.missing.length?c.missing.join('. '):'₹'+c.total.toFixed(2)+' added once to outlet COGS';return c}
 function change(){dirty=true;$('sharedStatus').textContent='Unsaved shared-packing changes';total()}
 function render(){
  $('sharedFields').hidden=!p.enabled;$('sharedRows').replaceChildren();
  for(const row of p.rows){const tr=document.createElement('tr');for(const [key,type,label] of [['name','text','Shared material'],['qty','number','Actual bags / sets used'],['unitCost','number','Price per bag / set']]){const td=document.createElement('td'),input=document.createElement('input');input.type=type;input.value=row[key]??'';input.required=true;input.disabled=!p.enabled;input.setAttribute('aria-label',label);if(type==='number'){input.min='0';input.step=key==='qty'?'1':'any'}input.oninput=()=>{row[key]=input.value;change()};td.append(input);tr.append(td)}const td=document.createElement('td'),remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Remove';remove.onclick=()=>{p.rows=p.rows.filter(x=>x!==row);change();render()};td.append(remove);tr.append(td);$('sharedRows').append(tr)}
  total();
 }
 $('sharedEnabled').onchange=()=>{p.enabled=$('sharedEnabled').checked;change();render()};
 $('addShared').onclick=()=>{p.rows.push({name:'Carry bag',qty:'',unitCost:''});change();render()};
 $('sharedForm').onsubmit=async e=>{e.preventDefault();if(busy)return;if(total().missing.length)return;busy=true;$('sharedControls').disabled=true;$('sharedStatus').textContent='Creating backup, saving and verifying Google…';
 try{const saved=await M2.saveOrderPacking(outlet,p,current);current=M2.state(saved);p=M2.clone(saved.orderPacking);dirty=false;try{M2.cache(outlet,saved)}catch(_){}onSaved(current);$('sharedStatus').textContent='Shared packing saved and read back from Google. Previous data backed up.';if(window.opener)window.opener.postMessage({type:'bobs-method2-item-saved',outlet},location.origin);if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-method2');channel.postMessage({type:'bobs-method2-item-saved',outlet});channel.close()}}
 catch(err){$('sharedStatus').textContent=err.message}finally{busy=false;$('sharedControls').disabled=false}};
 window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
 render();
}};
})();
