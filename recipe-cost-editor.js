(function(){'use strict';
const $=id=>document.getElementById(id), clone=x=>JSON.parse(JSON.stringify(x)), q=new URLSearchParams(location.search);
let master, baseline, active, dirty=false, saving=false;
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const identity=r=>r.recipeId||r.name;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function status(s){$('status').textContent=s}
async function read(){let d=await BOBS_DATA.getModule('COMPANY','RECIPE_MASTER','STANDARD_V1');if(typeof d==='string')d=JSON.parse(d);if(!d||!Array.isArray(d.recipes))throw Error('Google Recipe Master unavailable. No changes saved.');return d}
function find(d,id){return d.recipes.find(r=>identity(r)===id)}
function addTemplates(d){for(const r of window.BOBS_PORIYAL||[])if(!d.recipes.some(x=>norm(x.name)===norm(r.name)))d.recipes.push(clone(r));return d}
function input(value,type,required){const e=document.createElement('input');e.value=value==null?'':value;e.type=type;if(required)e.required=true;if(type==='number'){e.min='0';e.step='any'}return e}
function addLine(values){const row=document.createElement('tr');row.original=clone(values);[input(values[0],'text',true),input(values[1],'number',true),input(values[2],'text',true),input(values[3],'number',true)].forEach(e=>{const td=document.createElement('td');td.append(e);row.append(td)});row.append(document.createElement('td'));const td=document.createElement('td'),b=document.createElement('button');b.type='button';b.textContent='Remove';b.onclick=()=>{row.remove();dirty=true;calculate()};td.append(b);row.append(td);$('lines').append(row)}
function rows(){return Array.from($('lines').children).map(row=>{const e=row.querySelectorAll('input');return [e[0].value.trim(),Number(e[1].value),e[2].value.trim(),Number(e[3].value),...row.original.slice(4)]})}
function calculate(){let total=0;rows().forEach((r,i)=>{const c=r[1]*r[3];total+=c;$('lines').children[i].children[4].textContent=Number.isFinite(c)?c.toFixed(2):'Invalid'});const y=Number($('yield').value);$('summary').textContent='Batch cost ₹'+total.toFixed(2)+' ÷ '+(y||'—')+' '+$('yieldUnit').value+' = '+(y>0?'₹'+(total/y).toFixed(4)+' per '+$('yieldUnit').value:'enter a positive yield');return {total,y}}
function show(id){active=id;baseline=clone(find(master,id));$('yield').value=baseline.yieldQty||baseline.standardYield||baseline.yield||'';$('yieldUnit').value=baseline.yieldUnit||'';$('lines').replaceChildren();(baseline.ingredients||[]).forEach(addLine);$('editor').hidden=false;dirty=false;calculate();const note=$('planningNote');note.replaceChildren();note.hidden=!baseline.planningNote;if(baseline.planningNote){note.append(baseline.planningNote+' ');const a=document.createElement('a');a.href=baseline.referenceUrl;a.target='_blank';a.rel='noopener';a.textContent='Recipe reference';note.append(a)}status((baseline.costUpdatedAt||!baseline.planningNote?'Loaded recipe.':'New poriyal template — not yet stored in Google.')+' Edits are unsaved until verified.')}
$('editor').oninput=()=>{dirty=true;calculate()};
$('add').onclick=()=>{addLine(['',0,'kg',0]);dirty=true;calculate()};
$('gas').onclick=()=>{addLine(['Gas / fuel',1,'batch','']);dirty=true;calculate()};
$('recipe').onchange=()=>{if(dirty&&!confirm('Discard unsaved edits and change recipe?')){$('recipe').value=active;return}show($('recipe').value)};
$('reload').onclick=async()=>{if(dirty&&!confirm('Discard unsaved edits and reload from Google?'))return;try{master=addTemplates(await read());show(active)}catch(e){status(e.message)}};
$('editor').onsubmit=async e=>{e.preventDefault();if(saving)return;const values=rows(),{total,y}=calculate();if(!values.length||!Number.isFinite(total)||!(y>0)||values.some(r=>!r[0]||!r[2]||!Number.isFinite(r[1])||!Number.isFinite(r[3])||r[1]<0||r[3]<0)){status('Enter valid component names, units, quantities, rates and a positive yield.');return}
saving=true;Array.from($('editor').elements).forEach(e=>e.disabled=true);$('recipe').disabled=true;
try{status('Checking latest Google record…');const latest=await read(),current=find(latest,active),template=(window.BOBS_PORIYAL||[]).find(r=>identity(r)===active);if(current?!same(current,baseline):!template||latest.recipes.some(r=>norm(r.name)===norm(baseline.name)))throw Error('This recipe changed elsewhere. Reload it before saving to avoid overwriting newer rates.');
if(template&&!confirm('Confirm you have checked the cooked batch yield and ingredient rates. The template quantities are planning assumptions, not verified industry standards.'))return;
const updated=Object.assign({},current||baseline,{ingredients:values,yieldQty:y,yieldUnit:$('yieldUnit').value.trim(),batchCost:total,totalCost:total,unitCost:total/y,costPerUnit:total/y,perUnitCost:total/y,productionCost:total/y,costUpdatedAt:new Date().toISOString()});
for(const k of ['standardYield','yield','standardYieldQty'])if(k in updated)updated[k]=y;
latest.recipes=current?latest.recipes.map(r=>identity(r)===active?updated:r):[...latest.recipes,updated];
await BOBS_DATA.saveModule('COMPANY','RECIPE_MASTER','STANDARD_V1',latest);
let verified=null;for(let i=0;i<3;i++){const check=await read();if(same(find(check,active),updated)){verified=check;break}}
if(!verified)throw Error('Save was sent but could not be verified. Keep this page open and reload to check; do not assume it is saved.');
master=verified;baseline=clone(updated);dirty=false;status('Saved and read back from Google. Batch ₹'+total.toFixed(2)+'; unit ₹'+(total/y).toFixed(4)+'.');
if(window.opener)window.opener.postMessage({type:'bobs-recipe-master-saved',recipes:verified.recipes},location.origin);
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-recipe-master');channel.postMessage({type:'bobs-recipe-master-saved',recipes:verified.recipes});channel.close()}
}catch(err){status(err.message)}finally{saving=false;Array.from($('editor').elements).forEach(e=>e.disabled=false);$('recipe').disabled=false}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
(async()=>{try{master=addTemplates(await read());let wanted=[];try{wanted=JSON.parse(q.get('names')||'[]')}catch(e){}const condiment=q.get('kind')==='condiment';let available=master.recipes.filter(r=>!condiment||(wanted.length?wanted.some(n=>norm(n)===norm(r.name)):/CONDIMENT/i.test(r.kind||r.category||'')));available.forEach(r=>{const opt=document.createElement('option');opt.value=identity(r);opt.textContent=r.name;$('recipe').append(opt)});const target=available.find(r=>norm(r.name)===norm(q.get('item')))||(condiment||!q.get('item')?available[0]:null);if(!target)throw Error('No matching recipes found in Google.');$('recipe').value=identity(target);show(identity(target))}catch(e){status(e.message)}})();
})();
