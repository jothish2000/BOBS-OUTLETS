const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const {JSDOM} = require(process.env.JSDOM_PATH || 'jsdom');
const read = name => fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8');

async function results(setup) {
  const dom = new JSDOM(read('method2-overall.html'),{url:'https://bobs.test/method2-overall.html?outlet=01',runScripts:'outside-only'});
  const w = dom.window;
  for (const file of ['bobs-number-format.js','bobs-cost-flow.js','bobs-cost-detail-links.js']) w.eval(read(file));
  w.eval(read('shared_data.js')+';window.CAT_ORDER=CAT_ORDER;window.ITEM_DATA=ITEM_DATA;');
  w.eval(read('method2-core.js'));
  const cat='Breakfast Catalogue', i=w.ITEM_DATA[cat].findIndex(x=>x.name==='Idli');
  const key=w.M2.keys(cat,i).k;
  const date=w.BOBS_COST_FLOW.today(), state=w.M2.state({selection:{[cat]:{indices:[i]}}});
  const item=w.ITEM_DATA[cat][i];
  const editor=w.M2.draft(state,cat,i,item);
  Object.assign(editor,{mode:'production',businessDate:date,sold:10,soldConfirmed:true,price:12});
  state.itemEditors[key]=editor;
  state.commercial[key]={soldQuantity:10,finalCogs:4,totalSoldCogs:40,actualDayCost:75,totalPackingCost:5};
  state.orderPacking={enabled:true,rows:[{name:'Carry bag',qty:1,unitCost:2}],businessDate:date};
  setup(state,editor,key);
  w.M2.read=async()=>state;
  w.BOBS_OPERATIONAL_RECIPES={load:async()=>({recipes:[{name:'Idli',yieldQty:10,yieldUnit:'piece',ingredients:[['Rice',1,'kg',1000]]}]})};
  w.M2OrderUI={init:()=>{}};
  await w.eval(read('method2-overall.js'));
  return {dom,doc:w.document,date};
}

test('recorded results use saved direct cost and recorded selling price once despite changed reference rates',async()=>{
  const {dom,doc,date}=await results((s,e,k)=>{s.pricing[k]={currentPrice:100}});
  try {
    assert.equal(doc.getElementById('daySales').textContent,'₹120.00');
    assert.equal(doc.getElementById('dayCost').textContent,'₹77.00');
    assert.equal(doc.getElementById('dayProfit').textContent,'₹43.00');
    const link=new URL(doc.querySelector('#rows a').href);
    assert.equal(link.searchParams.get('outlet'),'01');
    assert.equal(link.searchParams.get('date'),date);
    assert.equal(link.searchParams.get('returnTo'),dom.window.location.href);
  } finally {dom.window.close()}
});

test('yesterday’s or unconfirmed items cannot produce today’s actual results',async()=>{
  for(const change of [(s,e)=>e.businessDate='2000-01-01',(s,e)=>e.soldConfirmed=false,(s,e)=>delete e.businessDate]) {
    const {dom,doc}=await results(change);
    try {for(const id of ['daySales','dayCost','dayProfit'])assert.equal(doc.getElementById(id).textContent,'Pending')}
    finally{dom.window.close()}
  }
});

test('stale shared packing cannot complete costs and still allows confirmed zero sales',async()=>{
  const {dom,doc}=await results((s,e,key)=>{e.sold=0;s.commercial[key].soldQuantity=0;s.orderPacking.businessDate='2000-01-01'});
  try {assert.equal(doc.getElementById('daySales').textContent,'₹0.00');assert.equal(doc.getElementById('dayCost').textContent,'Pending');assert.equal(doc.getElementById('dayProfit').textContent,'Pending')}
  finally{dom.window.close()}
});

async function embeddedSetup(status, width=1280, twoItems=false) {
  const dom=new JSDOM(read('outlet-method-flow.html'),{
    url:'https://bobs.test/outlet-method-flow.html?outlet=1',runScripts:'outside-only',pretendToBeVisual:true
  });
  const w=dom.window, parent=w.document;
  w.innerWidth=width;
  w.BOBS_BASELINE_READY=true;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  // Use the actual parent/iframe guide bridge, with the outlet/local data fixture replacing Google bootstrap.
  const mainScript=[...parent.scripts].find(s=>s.textContent.includes('function loadMethod')).textContent;
  w.eval(mainScript.slice(0,mainScript.indexOf('(async function init'))+
    ";outlets=[{id:'1',name:'Rasipuram'}];currentMethod='method2';");
  parent.getElementById('methodPanel').classList.remove('hidden');
  const frame=parent.getElementById('methodFrame');
  frame.src='https://bobs.test/method2.html?outlet=1&flow=1'+(status==='partial'?'&setup=1':'');
  const child=frame.contentWindow, doc=child.document;
  doc.open();doc.write(read('method2.html'));doc.close();
  child.scrollTo=()=>{};
  child.HTMLElement.prototype.scrollIntoView=()=>{};
  child.confirm=()=>true;
  let opens=0, writes=0;
  child.open=()=>{opens++;return {}};
  child.eval(read('bobs-number-format.js'));child.eval(read('shared_data.js')+';window.CAT_ORDER=CAT_ORDER;window.ITEM_DATA=ITEM_DATA;');
  child.eval(read('method2-core.js'));
  const cat='Breakfast Catalogue',i=child.ITEM_DATA[cat].findIndex(x=>x.name==='Idli'),key=child.M2.keys(cat,i).k;
  const recipes=[{name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',1,'kg',55]]}];
  const state=child.M2.state({selection:{[cat]:{indices:twoItems?[i,i===0?1:0]:[i]}},orderPacking:{enabled:false}});
  if(status!=='new'){
    const draft=child.M2.draft(state,cat,i,child.ITEM_DATA[cat][i]);
    const pack={packingMode:'none',packaging:[],packingPer:1};
    Object.assign(draft,{mode:'production',batchSize:120,batches:3,sold:290,soldConfirmed:status==='complete',
      businessDate:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),saveToken:'fixture',mainPacking:pack,commonPacking:pack,condiments:[],packingSchemaVersion:3});
    state.itemEditors[key]=draft;
    state.kitchenSources={[key]:{kitchenId:'Kitchen-Rasipuram'}};
  }
  child.M2.read=async()=>state;
  child.M2.write=async()=>{writes++;throw Error('Unexpected write')};
  child.M2.cache=()=>{};
  child.BOBS_OPERATIONAL_RECIPES={load:async()=>({recipes})};
  child.eval(read('method2-list.js'));
  w.eval(read('bobs-roadmap-core.js'));w.eval(read('bobs-guide-bot.js'));
  w.BOBS_REFERENCE={ensure:()=>false};w.eval(read('bobs-guided-review.js'));w.eval(read('bobs-roadmap.js'));
  for(let n=0;n<20;n++)await new Promise(resolve=>setImmediate(resolve));
  return {dom,w,doc,parent,opens:()=>opens,writes:()=>writes};
}

for(const [status,label,width] of [['new','Set up Idli',1280],['partial','Continue setup',390],['complete','Open setup',1280]]) {
  test('embedded Method 2 row owns the '+status+' setup action at '+width+'px',async()=>{
    const f=await embeddedSetup(status,width);
    try{
      const row=f.doc.querySelector('#catList tr'),cta=row.querySelector('[data-edit-item]');
      assert.equal(cta.textContent,label);
      assert.equal(cta.disabled,false);
      const visibleActions=[...row.querySelectorAll('a[href],button')].filter(el=>!el.hidden&&!el.closest('details:not([open])'));
      assert.deepEqual(visibleActions,[cta]);
      assert.equal(f.doc.getElementById('guideAction').hidden,true,'the selected row provides the setup action');
      const bridge=f.w.BOBS_METHOD_FLOW_GUIDE.snapshot();
      assert.equal(bridge.outlet,'1');
      assert.equal(bridge.phase,'method2');
      assert.equal(f.parent.getElementById('saveContinueBtn').hidden,status!=='complete','method-level save waits for the item setup');
      const launcher=f.parent.getElementById('bobsCompanionToggle'),panel=f.parent.getElementById('bobsCompanion');
      if(panel.hidden)launcher.click();
      assert.equal(panel.hidden,false);
      const dialogue=f.parent.getElementById('bobsGuideDialogue');
      if(status!=='complete'){
        assert.equal(bridge.workspace.item.name,'Idli');
        assert.equal(bridge.workspace.item.setupLabel,label);
        assert(dialogue.textContent.includes(label));
        assert(dialogue.textContent.includes('Idli'));
        assert.equal(dialogue.querySelector('[data-guide-choice=method-flow-work]'),null);
        assert.equal([...dialogue.querySelectorAll('a,button')].some(el=>el.textContent.includes(label)),false);
      }else{
        assert(bridge.workspace.item==null);
        assert.doesNotMatch(dialogue.textContent,/Set up Idli|Continue setup/);
      }
      const options=row.querySelector('details.row-options');
      if(status==='partial'){
        assert(options,'saved row must retain recovery access');
        assert.equal(options.open,false);
        assert(options.querySelector('summary'));
        assert.equal(options.querySelector('.cancel-edit').textContent,'Keep saved version');
        options.open=true;assert.equal(options.querySelector('.cancel-edit').hidden,false);
        options.open=false;
        panel.querySelector('.companion-head button').click();
        assert.equal(panel.hidden,true);
        assert.equal(launcher.hidden,false);
        assert.equal(f.doc.activeElement,cta,'minimising the guide on a narrow screen must focus the real row button');
        assert.equal(f.opens(),0);
        launcher.click();assert.equal(panel.hidden,false);
        assert.equal(f.parent.activeElement,panel.querySelector('.companion-head button'));
      }
      assert.equal(f.opens(),0);assert.equal(f.writes(),0);
      if(status==='new'){
        const search=f.doc.getElementById('search');search.value='no match';search.dispatchEvent(new f.w.Event('input'));
        assert.equal(row.hidden,true);
        assert(!f.w.BOBS_METHOD_FLOW_GUIDE.snapshot().workspace.item,'filtered-out row is not a candidate for the guide');
        search.value='';search.dispatchEvent(new f.w.Event('input'));
        assert.equal(f.w.BOBS_METHOD_FLOW_GUIDE.snapshot().workspace.item.setupLabel,label);
      }
      cta.click();assert.equal(f.opens(),1);assert.equal(f.writes(),0);
    } finally{f.dom.window.close()}
  });
}

test('search updates the parent guide to the visible unfinished row without clearing the filter',async()=>{
  const f=await embeddedSetup('new',1280,true);
  try{
    const rows=[...f.doc.querySelectorAll('#catList tr')];
    assert.equal(rows.length,2);
    const chosen=rows[1],name=chosen.querySelector('strong').textContent,label=chosen.querySelector('[data-edit-item]').textContent;
    const search=f.doc.getElementById('search');
    const panel=f.parent.getElementById('bobsCompanion');
    if(panel.hidden)f.parent.getElementById('bobsCompanionToggle').click();
    search.value=name;
    search.dispatchEvent(new f.dom.window.Event('input',{bubbles:true}));
    for(let n=0;n<8;n++)await new Promise(resolve=>setImmediate(resolve));
    assert.equal(rows[0].hidden,true);assert.equal(chosen.hidden,false);
    assert.equal(search.value,name);
    assert.equal(f.w.BOBS_METHOD_FLOW_GUIDE.snapshot().workspace.item.name,name);
    const dialogue=f.parent.getElementById('bobsGuideDialogue');
    assert(dialogue.textContent.includes(label));
    assert(!dialogue.textContent.includes(rows[0].querySelector('[data-edit-item]').textContent));
    assert.equal(dialogue.querySelector('[data-guide-choice=method-flow-work]'),null);
    assert.equal(f.opens(),0);assert.equal(f.writes(),0);
  }finally{f.dom.window.close()}
});
