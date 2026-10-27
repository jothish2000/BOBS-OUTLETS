const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x)),source=p=>fs.readFileSync(p,'utf8'),settle=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r));};
const outlets=[{id:'1',name:'Rasipuram'},{id:'2',name:'Gurusamypalayam'},{id:'3',name:'Elimedu'}];
const original={schema:1,reviewed:true,kitchens:[{id:'Kitchen-Elimedu',name:'Elimedu Production kitchen',outletId:'3',status:'operating',shiftTimes:[{start:'04:30',end:'13:30'}],keep:'metadata'}]};
async function fixture(record=original,{failRead=false}={}){
 const dom=new JSDOM(source('kitchen-flow.html'),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://bobs.test/kitchen-flow.html?stage=locations&outlet=1&guide=continue'}),w=dom.window;let stored=copy(record),writes=[],backups=[],minimised=0;
 w.HTMLElement.prototype.scrollIntoView=function(){};w.BOBS_OUTLET_FLOW={stamp:JSON.stringify};w.BOBS_PRODUCTION_PLAN={};w.BOBS_COST_FLOW={today:()=> '2026-10-27'};w.BOBS_SHIFT_TIMES={enhance(){}};
 w.BOBS_DATA={listOutlets:async()=>copy(outlets)};w.BOBS_KITCHENS={locations:async()=>{if(failRead)throw Error('fixture unavailable');return {record:copy(stored),outlets:copy(outlets),kitchens:copy(stored?.kitchens||[])};}};
 w.BOBS_VERIFIED={clone:copy,equal:(a,b)=>JSON.stringify(a)===JSON.stringify(b),save:async(o,m,k,next,baseline)=>{assert.equal(o,'COMPANY');assert.equal(m,'KITCHEN_MASTER');assert.deepEqual(copy(baseline),stored);backups.push(copy(stored));writes.push(m);stored=copy(next);return copy(stored);}};
 for(const p of ['bobs-kitchen-core.js','bobs-kitchen-setup.js','bobs-kitchen-pages.js','bobs-guide-bot.js'])w.eval(source(p));await settle();
 const host=w.document.createElement('div');w.document.body.append(host);const bot=w.BOBS_GUIDE_BOT.mount(host,{journey:true,snapshot:()=>({ctx:{page:'kitchen-flow.html',outlet:'1'}}),minimise(){minimised++;},refresh(){}});w.addEventListener('bobs-guide-context',bot.update);
 return {w,dom,host,writes,backups,get stored(){return stored;},get minimised(){return minimised;},click:id=>{const b=host.querySelector('[data-guide-choice="'+id+'"]');assert(b,id+' should exist');b.click();},close:()=>w.close()};
}
test('each named outlet is asked; existing Elimedu is offered only for Elimedu; explicit save persists every answer',async()=>{
 const f=await fixture();try{
  assert.match(f.host.textContent,/Do you want a kitchen at Rasipuram/);assert.equal(f.w.document.querySelectorAll('[data-outlet-kitchen-answer]').length,3);assert.equal(f.w.document.querySelector('#kitchenNextGo'),null);assert.equal(f.writes.length,0);
  f.click('outlet-kitchen-no');assert.match(f.host.textContent,/Do you want a kitchen at Gurusamypalayam/);f.click('outlet-kitchen-no');assert.match(f.host.textContent,/Do you want a kitchen at Elimedu/);
  f.click('outlet-kitchen-yes');assert.match(f.host.textContent,/saved kitchen already exists for Elimedu/);assert.match(f.host.textContent,/Elimedu Production kitchen/);assert.equal(f.w.document.querySelectorAll('[data-kitchen]').length,1);
  f.click('use-saved-kitchen');f.click('next-outlet');assert.match(f.host.textContent,/Review the kitchen decision for every outlet/);assert.equal(f.writes.length,0);
  f.w.document.getElementById('saveKitchen').click();await settle();assert.equal(f.writes.length,0);assert.equal(f.w.document.activeElement.id,'kitchenReviewed');
  f.w.document.getElementById('kitchenReviewed').checked=true;f.w.document.getElementById('saveKitchen').click();await settle();assert.equal(f.writes.length,1);assert.deepEqual(f.backups[0],original);assert.deepEqual(f.stored.kitchens,original.kitchens);
  assert.equal(f.stored.outletDecisions['1'].hasKitchen,false);assert.equal(f.stored.outletDecisions['2'].hasKitchen,false);assert.equal(f.stored.outletDecisions['3'].kitchenId,'Kitchen-Elimedu');assert(f.w.document.querySelector('#kitchenNextGo'));assert.equal(f.w.BOBS_KITCHEN_GUIDE.snapshot().verified,true);
  const reopened=await fixture(f.stored);try{assert.equal(reopened.w.document.querySelector('[data-outlet-kitchen-answer="1"]').value,'no');assert.equal(reopened.w.document.querySelector('[data-outlet-kitchen-answer="3"]').value,'yes');assert.equal(reopened.writes.length,0);}finally{reopened.close();}
 }finally{f.close();}
});
test('new outlet kitchen stays a draft and incomplete shifts block advancing without touching another outlet',async()=>{
 const f=await fixture();try{f.click('outlet-kitchen-yes');assert.match(f.host.textContent,/working shifts for Rasipuram/);const setup=f.w.BOBS_KITCHEN_GUIDE.snapshot(),rsp=setup.outlets[0];assert.equal(rsp.kitchen.outletId,'1');assert.equal(rsp.kitchen.name,'Rasipuram kitchen');assert.deepEqual(copy(setup.outlets[2].kitchen),original.kitchens[0]);
  f.click('next-outlet');assert.match(f.host.textContent,/complete shift start and end/);assert.equal(f.writes.length,0);f.click('show-outlet-kitchen');assert.equal(f.minimised,1);assert.equal(f.w.document.activeElement.closest('[data-kitchen]').dataset.kitchen,rsp.kitchen.id);
  const card=[...f.w.document.querySelectorAll('[data-kitchen]')].find(el=>el.dataset.kitchen===rsp.kitchen.id);card.querySelector('.st').value='05:00';card.querySelector('.en').value='14:00';f.click('next-outlet');assert.match(f.host.textContent,/Do you want a kitchen at Gurusamypalayam/);assert.equal(f.writes.length,0);
 }finally{f.close();}
});
test('fresh setup preserves kitchen identity and saved source; reuse restores saved details and No cannot silently delete it',async()=>{
 const f=await fixture();try{const a=f.w.BOBS_KITCHEN_GUIDE;assert.throws(()=>a.answer('3',false),/will not delete/);a.answer('3',true);const id=a.fresh('3');assert.equal(id,'Kitchen-Elimedu');assert.equal(a.snapshot().outlets[2].kitchen.shiftTimes[0].start,'');assert.deepEqual(f.stored,original);assert.equal(f.writes.length,0);a.reuse('3');assert.deepEqual(copy(a.snapshot().outlets[2].kitchen),original.kitchens[0]);assert.equal(f.w.document.querySelectorAll('[data-kitchen]').length,1);}finally{f.close();}
});
test('changing Yes to No discards only that outlet’s unsaved new kitchen draft',async()=>{
 const f=await fixture();try{const a=f.w.BOBS_KITCHEN_GUIDE;a.answer('1',true);a.fresh('1');assert.equal(f.w.document.querySelectorAll('[data-kitchen]').length,2);a.answer('1',false);assert.equal(f.w.document.querySelectorAll('[data-kitchen]').length,1);assert.equal(a.snapshot().outlets[0].choice.hasKitchen,false);assert.deepEqual(copy(a.snapshot().outlets[2].kitchen),original.kitchens[0]);assert.deepEqual(f.stored,original);assert.equal(f.writes.length,0);}finally{f.close();}
});
test('failed Google read blocks choices and writes instead of inventing missing kitchens',async()=>{
 const f=await fixture(original,{failRead:true});try{assert.equal(f.w.BOBS_KITCHEN_GUIDE,undefined);assert.match(f.host.textContent,/checking the saved outlets/);assert.equal(f.host.querySelector('[data-guide-choice=outlet-kitchen-no]'),null);assert.equal(f.w.document.getElementById('saveKitchen').disabled,true);assert.equal(f.w.document.getElementById('kitchenRetry').hidden,false);assert.equal(f.writes.length,0);}finally{f.close();}
});
