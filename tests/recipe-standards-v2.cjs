const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
// shared_data.js publishes browser helpers in a queueMicrotask. The audit only needs
// its catalogue constants, so suppress that browser-only microtask in this Node VM.
const ctx={window:{},console,queueMicrotask:()=>{},setTimeout,clearTimeout};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'shared_data.js'),'utf8'),ctx,{filename:'shared_data.js'});
vm.runInContext('window.ITEM_DATA=ITEM_DATA',ctx);
vm.runInContext(fs.readFileSync(path.join(root,'recipe-guide-seeds.js'),'utf8'),ctx,{filename:'recipe-guide-seeds.js'});
vm.runInContext(fs.readFileSync(path.join(root,'poriyal-recipes.js'),'utf8'),ctx,{filename:'poriyal-recipes.js'});

const data=ctx.window.ITEM_DATA;
const guide=ctx.window.BOBS_GUIDE_RECIPES||[];
const poriyal=ctx.window.BOBS_PORIYAL||[];
const all=[...guide,...poriyal];
const supported=['Snacks Catalogue','Hot Beverages Catalogue','Cold Beverages Catalogue','Breakfast Catalogue','Lunch Catalogue'];
const expected=[];
for(const cat of supported)for(const x of data[cat]||[])if(['In-house','Local Kitchen'].includes(x.brand)&&x.eligible)expected.push(x.name);
const names=new Set(guide.map(x=>String(x.name||'').toLowerCase()));
const missing=expected.filter(x=>!names.has(String(x).toLowerCase()));
assert.deepEqual(missing,[],`Eligible catalogue items without Recipe Master seed: ${missing.join(', ')}`);

const placeholder=/primary base|vegetable \/ filling|milk \/ base|flavour \/ fruit|primary grain \/ flour|vegetables \/ side|vegetables \/ seasoning|mixed variety-rice seasonings/i;
const timingKeys=['prePreparationMin','setupMin','activeMinPerCycle','machineMinPerCycle','finishMinPerCycle','cleanupMin'];
const failures=[];
for(const r of all){
 const reasons=[];
 if(!(Number(r.yieldQty)>0)||!String(r.yieldUnit||'').trim())reasons.push('yield');
 if(!Array.isArray(r.ingredients)||!r.ingredients.length)reasons.push('ingredients');
 else{
  for(const row of r.ingredients){
   if(!String(row?.[0]||'').trim()||row?.[1]===''||row?.[1]==null||!Number.isFinite(Number(row?.[1]))||Number(row?.[1])<0||!String(row?.[2]||'').trim()||row?.[3]===''||row?.[3]==null||!Number.isFinite(Number(row?.[3]))||Number(row?.[3])<0){reasons.push('ingredient row');break;}
  }
  if(r.ingredients.some(x=>placeholder.test(String(x?.[0]||''))))reasons.push('generic placeholder ingredient');
 }
 const t=r.productionTiming||{};
 if(timingKeys.some(k=>!Number.isFinite(Number(t[k]))||Number(t[k])<0))reasons.push('timing');
 if(!String(t.role||'').trim()||!String(t.equipment||'').trim())reasons.push('role/equipment');
 if(!Array.isArray(r.productionStages)||!r.productionStages.length)reasons.push('production stages');
 const energy=(r.ingredients||[]).some(x=>/lpg fuel|electricity/i.test(String(x?.[0]||'')));
 if(!energy)reasons.push('direct energy');
 if(!Array.isArray(r.helperEligible)||!r.helperEligible.length)reasons.push('helper work');
 if(r.standardVersion!=='2026-09-SMALL-OUTLET-V2')reasons.push('standard version');
 if(!r.standardCompleteness?.complete)reasons.push('completeness flag');
 if(reasons.length)failures.push(`${r.name}: ${[...new Set(reasons)].join(', ')}`);
}
assert.deepEqual(failures,[],`Incomplete Recipe Master standards:\n${failures.join('\n')}`);
for(const required of ['Idli','Idli Sambar','Rice Sambar','Coconut Chutney','Pudina Chutney','Tomato Chutney','Potato Poriyal','Cabbage Poriyal','Carrot Poriyal','Beans Poriyal','Beetroot Poriyal','Carrot Beans Poriyal']){
 assert.ok(all.some(x=>String(x.name).toLowerCase()===required.toLowerCase()),`Missing required standard: ${required}`);
}
const audit=ctx.window.BOBS_RECIPE_STANDARD_AUDIT;
assert.ok(audit&&audit.total===all.length,'Runtime audit total mismatch');
assert.equal(audit.incomplete.length,0,`Runtime audit reports incomplete recipes: ${JSON.stringify(audit.incomplete)}`);
console.log(`PASS Recipe Master V2: ${expected.length} eligible catalogue recipes; ${all.length} total standard recipes/condiments; all required production parameters complete.`);
