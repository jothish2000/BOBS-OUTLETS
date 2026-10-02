'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const K=require('../recipe-market-google-store.js');
const html=fs.readFileSync('recipe-master-market-migrate.html','utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const tick=()=>new Promise(r=>setImmediate(r));
function fixture(){
 const nodes=new Map();function get(id){if(!nodes.has(id))nodes.set(id,{disabled:true,textContent:'',innerHTML:'',classList:{add(){}}});return nodes.get(id)}
 let active=null,rows=[],writes=0,readError=null,readGate=null,reads=0;const legacy={recipes:[{name:'Idli',yieldQty:120,ingredients:[['Rice',1.6,'kg',55]]}]};
 const ctx={document:{getElementById:get},window:{BOBS_RECIPE_KNOWLEDGE:K,BOBS_RECIPE_SYNC:{},BOBS_MARKET_REFERENCES:[{name:'Idli',yieldQty:120,ingredients:[['Rice',1.6,'kg',55]]}]},BOBS_DATA:{getRawModule:async()=>{reads++;if(readGate)await readGate;if(readError)throw readError;return active},jsonp:async()=>({ok:true,count:rows.length,records:rows}),getModule:async()=>legacy,saveModule:async()=>{writes++}},confirm:()=>true,Date,Math,console};
 return {start(){vm.runInNewContext(inline,ctx)},get,setError:x=>readError=x,setGate:x=>readGate=x,get reads(){return reads},setActive:x=>active=x,setRows:x=>rows=x,get writes(){return writes}};
}
test('initial publication page blocks existing active knowledge and partial records without writes',async()=>{
 for(const type of ['active','partial']){
  const x=fixture();if(type==='active')x.setActive({token:'existing'});else x.setRows([{recordKey:'orphan'}]);x.start();await tick();
  assert(x.get('run').disabled);assert.match(x.get('status').textContent,/already stored|need review/);assert.equal(x.writes,0);assert.match(x.get('summary').textContent,/Saved recipe records found|Recipe setup needs attention/);assert.doesNotMatch(x.get('summary').textContent,/Loading|Checking/);assert.equal(x.get('reload').disabled,false);
 }
});
test('page rechecks before first backup/write when knowledge appears after comparison',async()=>{
 const x=fixture();x.start();await tick();assert.equal(x.get('run').disabled,false);
 x.setActive({token:'newer'});await x.get('run').onclick();assert.match(x.get('status').textContent,/already stored/);assert.equal(x.writes,0);
});

test('failed read clears pending summary and retry returns to a usable comparison',async()=>{
 const x=fixture();x.setError(Error('Network read unavailable'));x.start();await tick();
 assert.match(x.get('summary').textContent,/Saved recipe records found|Recipe setup needs attention/);assert.match(x.get('status').textContent,/Network read unavailable/);
 assert(x.get('run').disabled);assert.equal(x.get('reload').disabled,false);assert.equal(x.writes,0);
 x.setError(null);await x.get('reload').onclick();
 assert.match(x.get('summary').innerHTML,/Audited market references/);assert.match(x.get('status').textContent,/Comparison ready/);assert.equal(x.get('run').disabled,false);
});
test('reload shows current progress, prevents overlap, and clears stale comparison on a blocked retry',async()=>{
 const x=fixture();x.start();await tick();
 let release;const gate=new Promise(r=>release=r);x.setGate(gate);x.setActive({token:'existing'});
 const pending=x.get('reload').onclick(),reads=x.reads;
 assert.match(x.get('summary').textContent,/Checking whether/);assert(x.get('reload').disabled);assert(x.get('run').disabled);
 await x.get('reload').onclick();assert.equal(x.reads,reads);
 release();await pending;assert.match(x.get('summary').textContent,/Saved recipe records found|Recipe setup needs attention/);
 assert(x.get('run').disabled);assert.equal(x.get('reload').disabled,false);assert.equal(x.writes,0);
});

test('novice guide explains the first save, normal editing and shared-standard revision without claiming complete setup',async()=>{
 assert.match(html,/What does “publish” mean here/);assert.match(html,/does not mean posting recipes publicly/);
 assert.match(html,/Save initial recipe library to Google Sheets/);assert.match(html,/Keep any unsaved edits/);
 assert.match(html,/This page cannot make that revision/);
 const x=fixture();x.setActive({token:'existing'});x.start();await tick();
 assert.match(x.get('summary').textContent,/Saved recipe records found/);
 assert.doesNotMatch(x.get('summary').textContent,/complete|SAFE MODE/);
 assert.match(x.get('status').textContent,/Return to your Item Editor/);
 assert.match(x.get('status').textContent,/does not verify every saved recipe/);
 assert.equal(x.writes,0);
});
