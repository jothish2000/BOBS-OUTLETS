'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const K=require('../recipe-market-google-store.js');
const html=fs.readFileSync('recipe-master-market-migrate.html','utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const tick=()=>new Promise(r=>setImmediate(r));
function fixture(){
 const nodes=new Map();function get(id){if(!nodes.has(id))nodes.set(id,{disabled:true,textContent:'',innerHTML:'',classList:{add(){}}});return nodes.get(id)}
 let active=null,rows=[],writes=0;const legacy={recipes:[{name:'Idli',yieldQty:120,ingredients:[['Rice',1.6,'kg',55]]}]};
 const ctx={document:{getElementById:get},window:{BOBS_RECIPE_KNOWLEDGE:K,BOBS_RECIPE_SYNC:{},BOBS_MARKET_REFERENCES:[{name:'Idli',yieldQty:120,ingredients:[['Rice',1.6,'kg',55]]}]},BOBS_DATA:{getRawModule:async()=>active,jsonp:async()=>({ok:true,count:rows.length,records:rows}),getModule:async()=>legacy,saveModule:async()=>{writes++}},confirm:()=>true,Date,Math,console};
 return {start(){vm.runInNewContext(inline,ctx)},get,setActive:x=>active=x,setRows:x=>rows=x,get writes(){return writes}};
}
test('initial publication page blocks existing active knowledge and partial records without writes',async()=>{
 for(const type of ['active','partial']){
  const x=fixture();if(type==='active')x.setActive({token:'existing'});else x.setRows([{recordKey:'orphan'}]);x.start();await tick();
  assert(x.get('run').disabled);assert.match(x.get('status').textContent,/already stored|need review/);assert.equal(x.writes,0);
 }
});
test('page rechecks before first backup/write when knowledge appears after comparison',async()=>{
 const x=fixture();x.start();await tick();assert.equal(x.get('run').disabled,false);
 x.setActive({token:'newer'});await x.get('run').onclick();assert.match(x.get('status').textContent,/already stored/);assert.equal(x.writes,0);
});
