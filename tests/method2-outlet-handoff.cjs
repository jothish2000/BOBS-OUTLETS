const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'..'),source=f=>fs.readFileSync(path.join(root,f),'utf8');
function dom(file,url){const d=new JSDOM(source(file),{url,runScripts:'outside-only',pretendToBeVisual:true});d.window.scrollTo=()=>{};d.window.alert=()=>{};d.window.confirm=()=>true;return d;}
async function until(fn){for(let n=0;n<60;n++){if(fn())return;await new Promise(r=>setTimeout(r,5));}throw Error('DOM initialization did not complete');}
function core(w){w.eval(source('shared_data.js')+';window.CAT_ORDER=CAT_ORDER;window.ITEM_DATA=ITEM_DATA;');w.eval(source('method2-core.js'));}
(async()=>{
 const parent=dom('outlet-method-flow.html','https://bobs.test/outlet-method-flow.html?outlets=1%2C2'),w=parent.window;
 const inline=[...w.document.scripts].find(s=>s.textContent.includes('function loadMethod')).textContent;
 w.setInterval=()=>0;w.setTimeout=()=>0;
 // Invoke actual route handlers against fixture outlet records; exclude only remote startup.
 w.eval(inline.slice(0,inline.indexOf('(async function init'))+";window.setFixture=n=>{outlets=[{id:'1',name:'Rasipuram'},{id:'2',name:'Other outlet'},{id:'A & B',name:'Encoded'}];idx=n}");
 let popup;w.open=(url,name)=>(popup={url,name,closed:false});
 for(const [idx,id] of [[0,'1'],[1,'2'],[2,'A & B']]){
  w.setFixture(idx);w.document.getElementById('method2Btn').click();
  const route=new URL(w.document.getElementById('methodFrame').src);
  assert.equal(route.searchParams.get('outlet'),id);assert.equal(route.searchParams.get('flow'),'1');
  assert.equal(new URL(popup.url,'https://bobs.test').searchParams.get('outlet'),id);
 }
 w.setFixture(0);w.open=()=>null;w.document.getElementById('method2Btn').click();
 assert.match(w.document.getElementById('saveNote').textContent,/Choose categories/);
 w.document.getElementById('method1Btn').click();assert.equal(new URL(w.document.getElementById('methodFrame').src).search,'?flow=1');
 console.log('PASS parent routes: outlets 1/2/encoded, selector context, blocked popup fallback, Method 1 unchanged');
 for(const id of ['1','2']){
  const list=dom('method2.html','https://bobs.test/method2.html?flow=1&outlet='+id),l=list.window;core(l);
  // A different active tab changed the global selection; explicit URL must win.
  l.localStorage.setItem('outlet-selection',JSON.stringify({id:'999'}));
  const cat=l.CAT_ORDER.find(c=>l.ITEM_DATA[c].some(x=>/^idli$/i.test(x.name))),i=l.ITEM_DATA[cat].findIndex(x=>/^idli$/i.test(x.name));
  const raw={selection:{[cat]:{indices:[i]}},qtys:{[cat+'|'+i]:290},prod:{[cat+'::'+i]:{unitsPerBatch:120,batchesToday:3}},orderPacking:{mode:'none'}};
  const recipes=[{name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',1,'kg',55]]}];
  const reads=[];l.M2.read=async(o,m)=>(reads.push(o),o==='COMPANY'?{recipes}:raw);l.M2.cache=()=>{};
  let opened;l.open=(url,name)=>(opened={url,name});
  for(const s of l.document.scripts)if(s.textContent.includes('equipment'))l.eval(s.textContent);
  l.eval(source('method2-list.js'));
  await until(()=>l.document.getElementById('status').textContent.includes('Loaded from Google'));
  for(const link of ['equipment','chooseItems','overall','staffing'])assert.equal(new URL(l.document.getElementById(link).href).searchParams.get('outlet'),id);
  assert(reads.includes(id));assert(!reads.includes('999'));
  const row=l.document.querySelector('#catList tr');assert.match(row.textContent,/Idli/);
  for(const mode of ['purchased','production']){
   row.querySelector('select').value=mode;row.querySelector('button').click();
   const route=new URL(opened.url,'https://bobs.test');
   assert.equal(route.searchParams.get('outlet'),id);assert.equal(route.searchParams.get('cat'),cat);assert.equal(route.searchParams.get('i'),String(i));assert.equal(route.searchParams.get('mode'),mode);
   const editor=dom('method2-item.html',route.href),e=editor.window;core(e);
   e.M2.read=async(o)=>o==='COMPANY'?{recipes}:raw;e.BOBS_PORIYAL=[];
   e.BOBS_OPERATIONAL_RECIPES={load:async()=>({recipes,source:'Google BOBS Standard Recipe',notice:''})};e.BOBS_FULL_COST={load:async()=>({}),render:()=>{}};e.IdliSupportReaders={renderItem:()=>{}};
   e.eval(source('method2-packing-ui.js'));e.eval(source('method2-item.js'));
   await until(()=>!e.document.getElementById('editor').hidden);
   assert.equal(e.document.getElementById('mode').value,mode);
   assert.equal(e.document.getElementById('outletLabel').textContent,'Outlet '+id+' · Google-backed item editor');
   assert.equal(e.document.getElementById('capacityLabel').hidden,mode==='purchased');
   assert.equal(e.document.getElementById('sold').value,'290');
   const costRoute=new URL(e.document.querySelector('#supplyRecipeLink a').href);
   assert.equal(costRoute.searchParams.get('outlet'),id);
   assert.equal(costRoute.pathname,mode==='production'?'/recipe-cost-editor.html':'/purchase-cost-editor.html');
   editor.window.close();
  }
  console.log('PASS outlet '+id+': actual Idli row -> both modes -> actual editor initialization, cost link, retained Sold Today; stale global outlet ignored');
  list.window.close();
 }
 parent.window.close();console.log('PASS isolated DOM navigation; zero live Google writes. This is not Chromium/browser or live persistence testing.');
})().catch(e=>{console.error(e);process.exitCode=1});
