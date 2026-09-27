(function(){
'use strict';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),outlet=q.get('outlet');
let state,recipes=[],saved={schema:1,decisions:{},ebRate:11},requirements=[],baseline=null,ready=false,busy=false;
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
const ordered=x=>Array.isArray(x)?x.map(ordered):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,ordered(x[k])])):x;
const equal=(a,b)=>JSON.stringify(ordered(a))===JSON.stringify(ordered(b));
const content=x=>{const d={...x};delete d._bobsMeta;return d};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('back').href='method2.html?outlet='+encodeURIComponent(outlet||'');
function controls(){ $('save').disabled=!ready||busy; $('reload').disabled=busy; $('ebRate').disabled=busy; document.querySelectorAll('#rows input').forEach(x=>x.disabled=busy); }
function number(value,label,integer=false,max=Infinity){if(String(value??'').trim()===''||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>max||(integer&&!Number.isInteger(Number(value))))throw Error('Enter a valid '+label+'.');return Number(value)}
function readForm(){
 const rate=number($('ebRate').value,'electricity rate'),decisions=copy(saved.decisions||{});
 document.querySelectorAll('tr[data-id]').forEach(tr=>{
  const id=tr.dataset.id,mode=tr.querySelector('input[type=radio]:checked')?.value;
  if(!['AUTO','SHARED','INDIVIDUAL'].includes(mode))throw Error('Choose an equipment sharing decision.');
  const field=(f,label,integer=false,max=Infinity)=>number(tr.querySelector('[data-f='+f+']').value,label,integer,max);
  decisions[id]={...decisions[id],mode,ownedQty:field('ownedQty','whole owned quantity',true),unitCost:field('unitCost','unit cost'),powerW:field('powerW','power in watts'),hours:field('hours','operating hours from 0 to 24',false,24)};
 });
 saved={...saved,ebRate:rate,decisions};
}
function updateForm(){try{readForm();render();$('saveStatus').textContent='Unsaved equipment decisions.'}catch(e){$('saveStatus').textContent=e.message}}
function render(){const rows=BOBS_EQUIPMENT.applyDecisions(requirements,{...saved,ebRate:saved.ebRate ?? 11});$('rows').innerHTML=rows.map(r=>'<tr data-id="'+esc(r.id)+'"><td><b>'+esc(r.category)+'</b><br>'+esc(r.name)+'<br><span class="small">'+esc(r.source)+' · '+esc(r.note||'')+'</span></td><td>'+r.sourceItems.map(esc).join('<br>')+'</td><td><div class="choice">'+['AUTO','SHARED','INDIVIDUAL'].map(m=>'<label><input type="radio" name="m-'+esc(r.id)+'" value="'+m+'" '+(r.mode===m?'checked':'')+'>'+m+'</label>').join('')+'</div><span class="small">'+(r.sourceItems.length>1?'Sharing possible; owner choice controls costing.':'Single requirement; individual is normal.')+'</span></td><td>'+r.finalCount+'</td><td><input class="num" data-f="ownedQty" type="number" min="0" step="1" value="'+esc(r.ownedQty)+'"></td><td>'+r.toBuy+'</td><td><input class="num" data-f="unitCost" type="number" min="0" step="1" value="'+esc(r.unitCost)+'"></td><td><input class="num" data-f="powerW" type="number" min="0" step="1" value="'+esc(r.powerW)+'"></td><td><input class="num" data-f="hours" type="number" min="0" step=".25" value="'+esc(r.hours)+'"></td><td>₹'+r.dailyPowerCost.toFixed(2)+'</td></tr>').join('');const s=BOBS_EQUIPMENT.summary(rows);$('buy').textContent=s.toBuy;$('capex').textContent='₹'+s.capex.toFixed(2);$('kwh').textContent=s.dailyKwh.toFixed(2)+' kWh/day';$('powerCost').textContent='₹'+s.dailyPowerCost.toFixed(2)+'/day';document.querySelectorAll('#rows input').forEach(x=>x.onchange=updateForm)}
async function load(){
 if(busy)return;
 ready=false;busy=true;controls();$('saveStatus').textContent='';$('status').textContent='Loading Method 2 + Recipe Master…';
 try{
  if(!outlet)throw Error('Open Equipment Planner from Method 2 with an outlet selected.');
  state=M2.state(await M2.read(outlet));
  const master=await M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1');
  if(!Array.isArray(master?.recipes))throw Error('Recipe Master is unavailable. Reload before saving.');
  recipes=master.recipes;
  const old=await BOBS_DATA.getModule(outlet,'EQUIPMENT_PLAN','default');
  baseline=copy(old);saved={schema:1,decisions:{},ebRate:11,...copy(old)};
  if(!saved.decisions||typeof saved.decisions!=='object'||Array.isArray(saved.decisions))throw Error('Equipment decisions are invalid. Reload before saving.');
  $('ebRate').value=saved.ebRate??11;
  const selected=BOBS_EQUIPMENT.selectedItems(state,ITEM_DATA,CAT_ORDER);
  requirements=BOBS_EQUIPMENT.requirements(selected,recipes);render();ready=true;
  $('status').textContent=selected.length+' selected Method 2 items · '+requirements.length+' consolidated equipment/holding requirements. Review owner decisions before costing.';
 }catch(e){$('status').textContent=e.message;throw e}finally{busy=false;controls()}
}
async function verifiedRead(module,key,check){
 for(let attempt=0;attempt<3;attempt++){
  const result=await BOBS_DATA.getModule(outlet,module,key);
  if(check(result))return result;
  if(attempt<2)await new Promise(resolve=>setTimeout(resolve,300));
 }
 throw Error(module==='EQUIPMENT_PLAN_BACKUPS'?'Equipment backup read-back did not match. Save blocked.':'Save sent but equipment plan read-back did not match. Reload and verify before retrying.');
}
async function save(){
 if(busy)return;
 if(!ready)throw Error('Load equipment data successfully before saving.');
 readForm();const payload=copy({...saved,schema:1,savedAt:new Date().toISOString()});
 busy=true;controls();$('saveStatus').textContent='Verifying equipment backup and save…';
 try{
  const current=await BOBS_DATA.getModule(outlet,'EQUIPMENT_PLAN','default');
  if(!equal(current,baseline))throw Error('Equipment plan changed elsewhere. Reload before saving.');
  if(current){
   const key='before-'+Date.now()+'-'+Math.random().toString(36).slice(2);
   await BOBS_DATA.saveModule(outlet,'EQUIPMENT_PLAN_BACKUPS',key,current);
   await verifiedRead('EQUIPMENT_PLAN_BACKUPS',key,x=>x&&equal(content(x),content(current)));
  }
  const check=await BOBS_DATA.getModule(outlet,'EQUIPMENT_PLAN','default');
  if(!equal(check,current))throw Error('Equipment plan changed during backup. Reload before saving.');
  await BOBS_DATA.saveModule(outlet,'EQUIPMENT_PLAN','default',payload);
  const back=await verifiedRead('EQUIPMENT_PLAN','default',x=>x&&equal(content(x),content(payload)));
  baseline=copy(back);saved=copy(back);
  $('saveStatus').textContent='Equipment decisions saved and read back from Google.';
 }catch(e){ready=false;throw e}finally{busy=false;controls()}
}
$('ebRate').onchange=updateForm;
$('save').onclick=()=>save().catch(e=>$('saveStatus').textContent=e.message);
$('reload').onclick=()=>load().catch(e=>$('status').textContent=e.message);
controls();load().catch(e=>$('status').textContent=e.message);
})();
