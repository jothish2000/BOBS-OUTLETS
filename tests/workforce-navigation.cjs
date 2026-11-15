const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
test('missing delivery routes to the named item rather than repeating a loading retry',async()=>{
 const dom=new JSDOM(fs.readFileSync('outlet-plan.html','utf8'),{url:'https://bobs.test/outlet-plan.html?outlet=1&stage=workforce',runScripts:'outside-only'}),w=dom.window;
 try{
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.BOBS_OUTLET_FLOW={selected:()=>[{key:'Breakfast Catalogue::0',cat:'Breakfast Catalogue',i:0,item:{name:'Idli'}}]};
  w.BOBS_COST_FLOW={today:()=> '2026-11-15'};w.BOBS_KITCHENS={isKitchen:()=>false};w.ITEM_DATA={};
  w.M2={state:x=>x||{},read:async()=>({})};w.BOBS_VERIFIED={clone:x=>x,read:async(_o,m)=>m==='OUTLET_BASELINE'?{reviewed:true}:null};
  w.BOBS_DATA={listOutlets:async()=>[{id:'1',name:'Rasipuram'}]};w.BOBS_OPERATIONAL_RECIPES={load:async()=>({recipes:[]})};w.BroadcastChannel=undefined;
  w.eval(fs.readFileSync('bobs-outlet-plan.js','utf8'));
  for(let i=0;i<30&&w.BOBS_OUTLET_PLAN_GUIDE.snapshot().phase==='loading';i++)await new Promise(r=>setTimeout(r,5));
  assert.equal(w.BOBS_OUTLET_PLAN_GUIDE.snapshot().phase,'error');assert.equal(w.document.getElementById('flowRetry').hidden,true);
  const a=w.document.querySelector('#flowBody a'),u=new URL(a.href);assert.match(a.textContent,/Idli delivery choice/);assert.equal(u.pathname,'/method2-item.html');assert.equal(u.searchParams.get('outlet'),'1');assert.equal(u.searchParams.get('returnTo'),w.location.href);assert.equal(u.hash,'#idliLabourCost');
 }finally{w.close()}
});
