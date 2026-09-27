const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
async function fixture(options={}) {
 const nodes={};
 for(const id of ['back','ebRate','rows','buy','capex','kwh','powerCost','status','saveStatus','save','reload'])nodes[id]={value:id==='ebRate'?'11':'',textContent:'',disabled:false};
 const initial={schema:1,ebRate:11,decisions:{retained:{mode:'INDIVIDUAL'}},savedAt:'original'};
 let record=copy(initial),backups={},writes=[],readCount=0;
 const ctx={console,URLSearchParams,setTimeout,location:{search:'?outlet=1'},ITEM_DATA:{Snacks:[{name:'Puff'}]},CAT_ORDER:['Snacks'],document:{getElementById:id=>nodes[id],querySelectorAll:()=>[]},M2:{state:x=>x,read:async outlet=>{if(options.loadFails)throw Error('Load failed');return outlet==='COMPANY'?{recipes:[]}:{}},selected:()=>true},BOBS_DATA:{
 async getModule(outlet,module,key){if(module==='EQUIPMENT_PLAN_BACKUPS')return options.backupMissing?null:copy(backups[key]);readCount++;if(options.changeDuringBackup&&writes.includes('EQUIPMENT_PLAN_BACKUPS')&&!writes.includes('EQUIPMENT_PLAN'))record={...record,ebRate:42};return copy(record)},
 async saveModule(outlet,module,key,value){writes.push(module);if(module==='EQUIPMENT_PLAN_BACKUPS')backups[key]=copy(value);else {record=copy(value);if(options.corruptRate)record.ebRate=99;}}
 }};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../equipment-planner-core.js'),'utf8'),ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../equipment-planner.js'),'utf8'),ctx);
 await new Promise(resolve=>setImmediate(resolve));
 return {nodes,writes,get record(){return record},set record(x){record=x},save:()=>nodes.save.onclick(),reload:()=>nodes.reload.onclick()};
}
test('failed load blocks all saves',async()=>{const f=await fixture({loadFails:true});await f.save();assert.equal(f.writes.length,0);assert.equal(f.nodes.save.disabled,true)});
test('stale plan is not overwritten',async()=>{const f=await fixture();f.record={...f.record,ebRate:42};await f.save();assert.equal(f.writes.length,0);assert.equal(f.record.ebRate,42)});
test('unverified backup blocks operational save',async()=>{const f=await fixture({backupMissing:true});await f.save();assert(!f.writes.includes('EQUIPMENT_PLAN'))});
test('change during backup blocks operational save',async()=>{const f=await fixture({changeDuringBackup:true});await f.save();assert(!f.writes.includes('EQUIPMENT_PLAN'));assert.equal(f.record.ebRate,42)});
test('electricity rate mismatch cannot report success',async()=>{const f=await fixture({corruptRate:true});await f.save();assert(!f.nodes.saveStatus.textContent.includes('saved and read back'));assert.match(f.nodes.saveStatus.textContent,/match|verify/i)});
test('zero electricity rate survives save and reload',async()=>{const f=await fixture();f.nodes.ebRate.value='0';await f.save();assert.equal(f.record.ebRate,0);assert.equal(f.record.decisions.retained.mode,'INDIVIDUAL');await f.reload();assert.equal(Number(f.nodes.ebRate.value),0);assert.equal(f.nodes.powerCost.textContent,'₹0.00/day')});
test('invalid rate blocks writes',async()=>{for(const value of ['', '-1','garbage']){const f=await fixture();f.nodes.ebRate.value=value;await f.save();assert.equal(f.writes.length,0,value)}});
test('successful save verifies backup and supports a second save',async()=>{const f=await fixture();await f.save();assert.deepEqual(f.writes,['EQUIPMENT_PLAN_BACKUPS','EQUIPMENT_PLAN']);assert.match(f.nodes.saveStatus.textContent,/saved and read back/);await f.save();assert.equal(f.writes.length,4)});

