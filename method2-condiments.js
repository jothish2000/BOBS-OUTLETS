/* BOBS 111Q — robust Method 2 condiment picker
   Additive only. Does not replace the existing 366-item Method 2 engine. */
(function(){
'use strict';
const VAULT='https://script.google.com/macros/s/AKfycbwmvTLGxFQ2KQvzP9tr1Ry5LOi8EWRcfP6YxtOKiLUCLJqDpQ8Nsk12zThc1Yj4A9Pf4A/exec';
const RM={outletId:'COMPANY',module:'RECIPE_MASTER',recordKey:'STANDARD_V1'};
let recipes=[];let ready=false;let active={cat:'',i:-1};let rmPromise=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function jsonp(url){return new Promise((resolve,reject)=>{const cb='m2Cond_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;const timer=setTimeout(()=>finish(false,new Error('Recipe Master timeout')),10000);function finish(ok,v){if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();ok?resolve(v):reject(v)}window[cb]=d=>finish(true,d);s.onerror=()=>finish(false,new Error('Recipe Master read failed'));s.src=url+(url.includes('?')?'&':'?')+'callback='+cb+'&_bobs='+Date.now();document.head.appendChild(s)})}
function state(){try{const s=JSON.parse(localStorage.getItem('method2-item-state')||'{}');if(!s.qtys)s.qtys={};if(!s.prod)s.prod={};if(!s.condiments)s.condiments={};return s}catch(e){return{qtys:{},prod:{},condiments:{}}}}
function save(s){try{localStorage.setItem('method2-item-state',JSON.stringify(s));document.dispatchEvent(new Event('bobs-method2-condiment-change'))}catch(e){}}
function key(cat,i){return String(cat)+'::'+String(i)}
function primaryRecipe(item){return recipes.find(r=>String(r.name||'').trim().toLowerCase()===String(item&&item.name||'').trim().toLowerCase())||null}
function isCondiment(r){const n=String(r&&r.name||'').toLowerCase();const k=String(r&&r.kind||'').toUpperCase();const c=String(r&&r.category||'').toUpperCase();return k==='CONDIMENT'||c==='CONDIMENT'||/sambar|chutney|kurma|raita|sauce|gravy/.test(n)}

/* 111Q universal serving rules:
   - Idly may be supplied with sambar/chutney.
   - Every rice item may choose from the Recipe Master's condiment catalogue,
     unless the Recipe Master explicitly restricts the item.
   - Lemon/Pudina/Mint rice get a small sambar packet as their default association.
   - Sambar rice is itself the sambar-based rice dish, so do NOT suggest a sambar packet.
   - An item-specific Recipe Master association remains authoritative when present. */
function itemType(item){
 const n=String(item&&item.name||'').trim().toLowerCase();
 if(/idly|idli/.test(n)) return 'IDLY';
 if(/lemon\s*rice|lemon\s*chitranna/.test(n)) return 'LEMON_RICE';
 if(/pudina|mint\s*rice/.test(n)) return 'PUDINA_RICE';
 if(/sambar\s*rice|sambar\s*saadam|sambar\s*sadham/.test(n)) return 'SAMBAR_RICE';
 if(/rice|saadam|sadam/.test(n)) return 'RICE';
 return 'OTHER';
}
function relevantCondimentNames(item,primary){
 const type=itemType(item);
 if(type==='IDLY') return ['Idli Sambar','Coconut Chutney','Pudina Chutney','Tomato Chutney'];
 if(type==='SAMBAR_RICE') return [];
 const assocNames=Array.isArray(primary&&primary.condiments)?primary.condiments.map(x=>String(x&&x[0]||'')).filter(Boolean):[];
 if(assocNames.length)return assocNames;
 if(type==='RICE'||type==='LEMON_RICE'||type==='PUDINA_RICE') return recipes.filter(isCondiment).map(r=>String(r.name||'')).filter(Boolean);
 return [];
}
function condimentList(item){
 const all=recipes.filter(isCondiment),primary=primaryRecipe(item),wanted=relevantCondimentNames(item,primary);
 if(!wanted.length)return [];
 const list=[];wanted.forEach(n=>{const r=all.find(x=>String(x.name||'').trim().toLowerCase()===n.toLowerCase())||recipes.find(x=>String(x.name||'').trim().toLowerCase()===n.toLowerCase());if(r&&!list.some(x=>String(x.name).toLowerCase()===String(r.name).toLowerCase()))list.push(r)});return list;
}
function assoc(primary,name){const a=Array.isArray(primary&&primary.condiments)?primary.condiments:[];return a.find(x=>String(x&&x[0]||'').toLowerCase()===String(name).toLowerCase())||null}
function defaultQty(a,r,item){if(a)return Number(a[1]||0);const type=itemType(item);if(type==='LEMON_RICE'||type==='PUDINA_RICE')return 0.02;return 0}
function defaultUnit(a,r){return a&&a[2]?String(a[2]):String(r&&r.yieldUnit||'')}
function defaultBasis(a,item){if(a&&a[3])return String(a[3]);const type=itemType(item);if(type==='LEMON_RICE'||type==='PUDINA_RICE')return 'small packet per serving';return 'actual serving quantity'}
function recipeCost(r){return (r&&Array.isArray(r.ingredients)?r.ingredients:[]).reduce((s,x)=>s+Number(x&&x[1]||0)*Number(x&&x[3]||0),0)}
function selectedCost(r,q){return r&&Number(r.yieldQty)>0&&Number(q)>0?recipeCost(r)*Number(q)/Number(r.yieldQty):0}
function ensureStyle(){if(document.getElementById('m2CondStyle'))return;const st=document.createElement('style');st.id='m2CondStyle';st.textContent='.m2-cond-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:2147483647;padding:18px;box-sizing:border-box}.m2-cond-card{background:#fff;color:#111;width:min(560px,96vw);max-height:88vh;overflow:auto;border-radius:12px;padding:18px;box-shadow:0 20px 70px rgba(0,0,0,.35)}.m2-cond-card h3{margin:0 0 6px}.m2-cond-item{border:1px solid #ddd;border-radius:8px;padding:9px;margin:7px 0}.m2-cond-fields{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.m2-cond-fields input,.m2-cond-fields select{width:100%;box-sizing:border-box}.m2-cond-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}.m2-cond-actions button{border:0;border-radius:7px;padding:9px 13px;font-weight:700;cursor:pointer}.m2-cond-primary{background:#1f4d35;color:#fff}.m2-cond-secondary{background:#eee;color:#111}.m2-cond-note{font-size:11px;color:#666;margin:3px 0 9px}.m2-cond-cost{font-size:10px;color:#1f4d35;margin-top:4px}.m2-cond-empty{padding:10px;border-radius:8px;background:#f7f7f7;color:#555;font-size:12px}';document.head.appendChild(st)}
function modal(){let m=document.getElementById('m2CondModal');if(m)return m;ensureStyle();m=document.createElement('div');m.id='m2CondModal';m.className='m2-cond-modal';m.innerHTML='<div class="m2-cond-card"><h3>Actual condiments supplied</h3><div id="m2CondIntro" style="font-size:11px;color:#666;margin-bottom:10px"></div><div id="m2CondList"></div><div class="m2-cond-actions"><button type="button" class="m2-cond-secondary" id="m2CondCancel">Cancel</button><button type="button" class="m2-cond-primary" id="m2CondSave">Save Condiment Selection</button></div></div>';document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.id==='m2CondCancel')close()});document.getElementById('m2CondSave').addEventListener('click',commit);return m}
function renderOpen(cat,i){
 const item=(window.ITEM_DATA&&ITEM_DATA[cat]||[])[i]||{};const m=modal(),s=state(),old=Array.isArray(s.condiments[key(cat,i)])?s.condiments[key(cat,i)]:[],primary=primaryRecipe(item),all=condimentList(item);
 document.getElementById('m2CondIntro').textContent='Select only the condiments actually supplied with '+(item.name||'this item')+'. For rice items, all available Recipe Master condiments are offered unless the item has an explicit association. Leave all unchecked for No Condiment. Quantities can be changed for the actual serving/packet size.';
 const list=document.getElementById('m2CondList');list.innerHTML=all.length?'':'<div class="m2-cond-empty">No standard condiment is attached to this item. This is intentional for Sambar Rice and for items without a Recipe Master association.</div>';
 all.forEach(r=>{const a=assoc(primary,r.name),o=old.find(x=>String(x.recipeName||'').toLowerCase()===String(r.name).toLowerCase()),checked=!!o,q=o?Number(o.qty||0):defaultQty(a,r,item),u=o&&o.unit?o.unit:defaultUnit(a,r),basis=o&&o.basis?o.basis:defaultBasis(a,item),veg=o&&o.vegetableOption?o.vegetableOption:'',row=document.createElement('div');row.className='m2-cond-item';row.innerHTML='<label style="display:flex;gap:8px;align-items:center;font-size:12px"><input type="checkbox" class="m2-cond-check" data-name="'+esc(r.name)+'" '+(checked?'checked':'')+'> <b>'+esc(r.name)+'</b>'+(basis?' <span style="color:#666">('+esc(basis)+')</span>':'')+'</label><div class="m2-cond-fields" style="display:'+(checked?'grid':'none')+'"><label style="font-size:10px">Serving / packet quantity<input class="m2-cond-qty" type="number" min="0" step="0.001" value="'+(q||'')+'"></label><label style="font-size:10px">Unit<input class="m2-cond-unit" type="text" value="'+esc(u)+'"></label>'+(Array.isArray(r.vegetableOptions)?'<label style="font-size:10px;grid-column:1/-1">Today\'s vegetable<select class="m2-cond-veg"><option value="">Choose / Plain</option>'+r.vegetableOptions.map(v=>'<option value="'+esc(v[0])+'" '+(String(veg)===String(v[0])?'selected':'')+'>'+esc(v[0])+'</option>').join('')+'</select></label>':'')+'<div class="m2-cond-cost">Estimated condiment COGS: <b class="m2-cond-cost-value">₹'+selectedCost(r,q).toFixed(2)+'</b></div></div>';list.appendChild(row);const cb=row.querySelector('.m2-cond-check'),f=row.querySelector('.m2-cond-fields'),qi=row.querySelector('.m2-cond-qty'),cv=row.querySelector('.m2-cond-cost-value');cb.addEventListener('change',()=>f.style.display=cb.checked?'grid':'none');qi.addEventListener('input',()=>{cv.textContent='₹'+selectedCost(r,qi.value).toFixed(2)})});m.style.display='flex';return m;
}
function open(cat,i){
 active={cat,i};const m=modal();m.style.display='flex';
 if(!ready){
   document.getElementById('m2CondIntro').textContent='Loading Recipe Master…';
   document.getElementById('m2CondList').innerHTML='<div class="m2-cond-empty">Loading condiment items…</div>';
   loadRM().then(()=>{if(active.cat===cat&&active.i===i)renderOpen(cat,i)}).catch(e=>{if(active.cat===cat&&active.i===i){document.getElementById('m2CondIntro').textContent='Recipe Master could not be loaded.';document.getElementById('m2CondList').innerHTML='<div class="m2-cond-empty">Please try again. '+esc(e&&e.message||'Unable to load Recipe Master')+'</div>'}});
   return;
 }
 renderOpen(cat,i);
}
function commit(){const {cat,i}=active,s=state(),out=[];document.querySelectorAll('#m2CondList .m2-cond-item').forEach(row=>{const cb=row.querySelector('.m2-cond-check');if(!cb||!cb.checked)return;const name=cb.dataset.name,r=recipes.find(x=>String(x.name).toLowerCase()===String(name).toLowerCase()),q=Number(row.querySelector('.m2-cond-qty')?.value||0),unit=row.querySelector('.m2-cond-unit')?.value||'',veg=row.querySelector('.m2-cond-veg')?.value||'',primary=primaryRecipe((window.ITEM_DATA&&ITEM_DATA[cat]||[])[i]),a=assoc(primary,name);out.push({recipeId:r&&r.recipeId||'',recipeName:name,qty:q,unit,basis:a?defaultBasis(a,(window.ITEM_DATA&&ITEM_DATA[cat]||[])[i]):defaultBasis(null,(window.ITEM_DATA&&ITEM_DATA[cat]||[])[i]),vegetableOption:veg,source:'RECIPE_MASTER'})});s.condiments[key(cat,i)]=out;save(s);const st=document.getElementById('saveStatus');if(st)st.textContent=out.length?'Condiment selection saved — COGS will use the selected serving quantities':'No Condiment selected — condiment COGS set to zero';close()}
function close(){const m=document.getElementById('m2CondModal');if(m)m.style.display='none'}
function enhance(){document.querySelectorAll('.item-row .modeSelect').forEach(sel=>{if(sel.dataset.m2CondBound)return;sel.dataset.m2CondBound='1';const cat=sel.dataset.cat,i=Number(sel.dataset.i),row=sel.closest('.item-row');if(!row)return;let btn=row.querySelector('.condimentAttachBtn');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='condimentAttachBtn';btn.textContent='＋ Condiments';btn.title='Select actual condiments supplied';btn.style.cssText='display:block;margin-top:5px;padding:4px 9px;border:1px solid #bbb;border-radius:7px;background:#fff;font-size:10px;cursor:pointer';row.appendChild(btn)}btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(cat,i)});const sync=()=>{btn.style.display=sel.value==='production'?'block':'none'};sel.addEventListener('change',sync);sync()})}
function loadRM(){
 if(rmPromise)return rmPromise;
 rmPromise=jsonp(VAULT+'?action=moduleGet&outletId='+encodeURIComponent(RM.outletId)+'&module='+encodeURIComponent(RM.module)+'&recordKey='+encodeURIComponent(RM.recordKey)).then(q=>{
   if(q&&q.found&&q.data&&Array.isArray(q.data.recipes)){recipes=q.data.recipes;ready=true;enhance();return true}
   throw new Error('Recipe Master response did not contain recipes');
 }).catch(e=>{
   ready=false;
   const st=document.getElementById('saveStatus');if(st)st.textContent='Recipe Master unavailable: '+(e&&e.message||e);
   throw e;
 });
 return rmPromise;
}
function boot(){ensureStyle();enhance();loadRM().catch(()=>{});const obs=new MutationObserver(()=>enhance());obs.observe(document.body,{childList:true,subtree:true});setTimeout(enhance,1000);setTimeout(enhance,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();