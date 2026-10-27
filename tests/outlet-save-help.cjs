const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const norms=require('./fixtures/thp-norms.json');
async function settle(){for(let i=0;i<25;i++)await new Promise(r=>setImmediate(r));}
async function fixture({noCounter=false,positions=[{id:'Mandatory1',role:'Cashier',shift:0,takeHome:15000}]}={}){
 const dom=new JSDOM(fs.readFileSync('outlet-plan.html','utf8'),{runScripts:'outside-only',url:'https://bobs.test/outlet-plan.html?stage=baseline&outlet=1&returnTo=https%3A%2F%2Fbobs.test%2Fmethod2-item.html%3Foutlet%3D1'}),w=dom.window,reads=[],writes=[],returns=[],shifts=[{start:'04:30',end:'13:30'},{start:'13:30',end:'22:30'}];
 const db={KITCHEN_MASTER:{reviewed:true,kitchens:[],noSeparateKitchens:true,outletDecisions:{'1':{hasKitchen:false}}},OUTLET_BASELINE:{schema:1,reviewed:true,workingDays:30,mandatoryCount:positions.length,positions,expenseSelections:[],noCounter,ownerCounterShifts:[1]},FIXED_EXPENSES:{expenses:[]},THP_NORMS:norms};
 let pause=null,failSave=null,scrolled;
 const copy=x=>x==null?null:JSON.parse(JSON.stringify(x));
 w.HTMLElement.prototype.scrollIntoView=function(){scrolled=this.id};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.confirm=()=>true;
 w.BOBS_DATA={listOutlets:async()=>[{id:'1',name:'Fixture outlet',shiftTimes:shifts}]};w.BOBS_COST_FLOW={today:()=> '2026-10-11'};w.ITEM_DATA={};w.M2={read:async()=>({}),state:x=>x||{}};
 w.BOBS_VERIFIED={clone:copy,equal:(a,b)=>JSON.stringify(a)===JSON.stringify(b),read:async(o,m)=>{reads.push(m);if(m==='OUTLET_BASELINE'&&pause)await pause;return copy(db[m])},save:async(o,m,key,data)=>{if(failSave===m)throw Error('Fixture save not confirmed');writes.push(m);db[m]=copy(data);return copy(data)}};
 w.BOBS_WINDOW_RETURN={safe:()=>true,notify(){},returnToParent:(...args)=>returns.push(args)};
 for(const p of ['bobs-outlet-flow-core.js','bobs-salary-package-core.js','bobs-salary-summary-core.js','bobs-staff-table.js','bobs-kitchen-core.js','bobs-outlet-plan.js'])w.eval(fs.readFileSync(p,'utf8'));
 await settle();const $=id=>w.document.getElementById(id);assert($('flowSave'),$('flowStatus').textContent);
 return {dom,w,$,db,reads,writes,returns,get scrolled(){return scrolled},hold(value){pause=value},fail(module){failSave=module},change(el,value){if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));el.dispatchEvent(new w.Event('change',{bubbles:true}));},async save(){if(!$('flowReviewed').checked)$('flowReviewed').click();$('flowSave').click();await settle();}};
}
test('reported paid/no-paid conflict is visible beside Save before any Google request and retains salary',async()=>{
 const f=await fixture({noCounter:true});try{const before=f.reads.length;await f.save();assert.equal(f.reads.length,before);assert.equal(f.writes.length,0);assert.match(f.$('flowActionStatus').textContent,/Untick.*No paid mandatory staff/);assert.equal(f.w.document.activeElement.id,'flowActionStatus');assert.equal(f.scrolled,'flowActionStatus');assert.equal(f.$('flowSave').disabled,false);assert.equal(f.w.document.querySelector('[data-field=takeHome]').value,'15000');assert.equal(f.db.OUTLET_BASELINE.positions.length,1);assert.match(f.$('coverageMessage').textContent,/choices conflict/);}finally{f.dom.window.close()}
});
test('correcting the conflict saves the paid position and verified baseline then returns',async()=>{
 const f=await fixture({noCounter:true});try{await f.save();f.change(f.$('noCounter'),false);assert(f.$('noCounter').disabled);assert.equal(f.$('flowReviewed').checked,false);await f.save();assert.deepEqual(f.writes,['FIXED_EXPENSES','OUTLET_BASELINE']);assert.equal(f.db.OUTLET_BASELINE.noCounter,false);assert.equal(f.db.OUTLET_BASELINE.positions.length,1);assert.equal(f.db.OUTLET_BASELINE.positions[0].takeHome,15000);assert(f.db.OUTLET_BASELINE.positions[0].salaryBreakdown.ctc>0);assert.equal(f.returns.length,1);}finally{f.dom.window.close()}
});
test('zero-paid plan makes owner coverage explicit and can save without adding staff',async()=>{
 const f=await fixture({positions:[]});try{assert.equal(f.$('noCounter').disabled,false);f.change(f.$('noCounter'),true);assert([...f.w.document.querySelectorAll('.ownerCounterShift')].every(el=>el.checked&&el.disabled));assert.match(f.$('coverageMessage').textContent,/selected automatically/);await f.save();assert.equal(f.db.OUTLET_BASELINE.positions.length,0);assert.deepEqual(f.db.OUTLET_BASELINE.ownerCounterShifts,[0,1]);assert.equal(f.db.OUTLET_BASELINE.mandatoryCount,'0');assert.equal(f.returns.length,1);}finally{f.dom.window.close()}
});
test('help links open explanations and return focus without ticking choices or changing the draft',async()=>{
 const f=await fixture();try{f.$('flowReviewed').click();const before=[...f.w.document.querySelectorAll('input')].map(el=>[el.id,el.value,el.checked]),reads=f.reads.length;for(const key of ['owner','noPaid','review']){const link=f.w.document.querySelector('[data-flow-help="'+key+'"]');link.click();assert(f.$('flowHelpDialog').open);assert(f.$('flowHelpBody').textContent.length>100);f.$('flowHelpClose').click();assert.equal(f.$('flowHelpDialog').open,false);assert.equal(f.w.document.activeElement,link);}assert.deepEqual([...f.w.document.querySelectorAll('input')].map(el=>[el.id,el.value,el.checked]),before);assert.equal(f.reads.length,reads);assert.equal(f.writes.length,0);assert(f.$('noCounter').disabled);}finally{f.dom.window.close()}
});
test('final confirmation is distinct from optional coverage and missing review explains the next action',async()=>{
 const f=await fixture();try{const reads=f.reads.length;f.$('flowSave').click();assert.match(f.$('flowActionStatus').textContent,/final confirmation/);assert.equal(f.reads.length,reads);f.$('flowReviewed').click();f.change(f.$('ownerCounterShift1'),false);assert.equal(f.$('flowReviewed').checked,false);await f.save();assert.match(f.$('flowActionStatus').textContent,/Shift 2/);assert.equal(f.writes.length,0);}finally{f.dom.window.close()}
});
test('slow or failed Google verification shows progress, blocks duplicate saves, then permits correction',async()=>{
 const f=await fixture();try{let reject;const pending=new Promise((_,r)=>reject=r);pending.catch(()=>{});f.hold(pending);f.$('flowReviewed').click();const before=f.reads.length;f.$('flowSave').click();f.$('flowSave').click();assert.match(f.$('flowActionStatus').textContent,/Please wait/);assert.equal(f.$('flowSave').textContent,'Checking and saving…');assert(f.w.document.querySelector('[data-field=takeHome]').disabled);assert.equal(f.reads.length,before+1);reject(Error('Google unavailable — retry'));await settle();assert.match(f.$('flowActionStatus').textContent,/Google unavailable/);assert.equal(f.$('flowSave').disabled,false);assert.equal(f.w.document.querySelector('[data-field=takeHome]').disabled,false);assert.equal(f.w.document.querySelector('[data-field=takeHome]').value,'15000');assert(f.$('noCounter').disabled);assert.equal(f.writes.length,0);}finally{f.dom.window.close()}
});
test('stale saved baseline blocks all writes with a visible recovery message',async()=>{
 const f=await fixture();try{f.db.OUTLET_BASELINE.workingDays=29;await f.save();assert.match(f.$('flowActionStatus').textContent,/changed elsewhere/);assert.equal(f.writes.length,0);assert.equal(f.returns.length,0);}finally{f.dom.window.close()}
});
test('expense-only success is reported honestly when the baseline write cannot be confirmed',async()=>{
 const f=await fixture();try{f.fail('OUTLET_BASELINE');await f.save();assert.deepEqual(f.writes,['FIXED_EXPENSES']);assert.match(f.$('flowActionStatus').textContent,/Expenses were verified.*baseline could not be confirmed/);assert.equal(f.returns.length,0);assert.equal(f.$('flowSave').disabled,false);assert.equal(f.w.document.querySelector('[data-field=takeHome]').value,'15000');}finally{f.dom.window.close()}
});

test('a direct baseline save cannot bypass kitchen registration or write partial expenses',async()=>{const f=await fixture();try{delete f.db.KITCHEN_MASTER;await f.save();assert.match(f.$('flowActionStatus').textContent,/Kitchen Setup/);assert.equal(f.writes.length,0);assert.equal(f.returns.length,0);assert.equal(f.w.document.activeElement.id,'flowActionStatus');}finally{f.dom.window.close()}});
