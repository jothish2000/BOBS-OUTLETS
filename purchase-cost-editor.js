(function(){'use strict';
const $=id=>document.getElementById(id),query=new URLSearchParams(location.search),outlet=query.get('outlet'),name=query.get('item'),ids=['basis','qty','unit','total','supplier','date'];
let baseline,dirty=false,busy=false;
function values(){return Object.fromEntries(ids.map(id=>[id,$(id).value]))}
function calculate(){const p=values(),rate=M2.purchaseRate(p),unit=M2.convert(1,p.unit,'ml')!==null?'ml':M2.convert(1,p.unit,'g')!==null?'g':p.unit;$('calculation').textContent=rate===null?'Enter quantity and its total price.':'₹'+Number(p.total).toFixed(2)+' ÷ '+p.qty+' '+p.unit+' = ₹'+(rate/M2.convert(1,p.unit,unit)).toFixed(4)+' per '+unit}
function close(){if(busy)return;if(dirty&&!confirm('Leave without saving these supplier rates?'))return;dirty=false;if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}else location.href='method2.html?outlet='+encodeURIComponent(outlet)}
$('close').onclick=close;
$('editor').oninput=()=>{dirty=true;calculate()};
$('editor').onsubmit=async e=>{e.preventDefault();if(busy||!$('editor').reportValidity())return;const controls=$('controls');busy=true;controls.disabled=true;$('status').textContent='Saving and verifying Google…';
try{const saved=await M2.savePurchase(outlet,name,values(),baseline);baseline=M2.state(saved);dirty=false;busy=false;$('status').textContent='Saved and read back from Google.';
const message={type:'bobs-purchase-master-saved',outlet,token:saved.purchaseMasters[M2.purchaseKey(name)].saveToken};
if(window.opener&&!window.opener.closed)window.opener.postMessage(message,location.origin);
if(window.BroadcastChannel)for(const channelName of ['bobs-purchase-master','bobs-method2']){const channel=new BroadcastChannel(channelName);channel.postMessage(message);channel.close()}
close();
}catch(err){$('status').textContent=err.message}finally{busy=false;controls.disabled=false}};
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue=''}});
(async()=>{try{if(!outlet||!name)throw Error('Open a Purchase Master from an item.');baseline=M2.state(await M2.read(outlet));const p=baseline.purchaseMasters?.[M2.purchaseKey(name)]||{basis:'unit',qty:1,unit:query.get('unit')||'piece',total:''};ids.forEach(id=>$(id).value=p[id]??'');$('title').textContent=name+' — Purchase Master COGS';$('editor').hidden=false;calculate();$('status').textContent='Outlet '+outlet+' · Google-backed supplier costing. Save verifies permanent storage.'}catch(e){$('status').textContent=e.message}})();
})();
