const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {JSDOM} = require(process.env.JSDOM_PATH || 'jsdom');

test('expense editor reopens monthly rent, edits its monthly source, and saves a single daily charge', async () => {
 const dom = new JSDOM(readFileSync('fixed-expenses.html','utf8'), {url:'https://bobs.test/fixed-expenses.html?outlet=1',runScripts:'outside-only'});
 const w=dom.window, d=w.document;
 let saved={expenses:[{name:'Rent',type:'Fixed',basis:'monthly',inputAmount:7500,amount:7500/31},{name:'Cleaning',type:'Variable',amount:100}]};
 w.BOBS_VERIFIED={
  clone:structuredClone,read:async(o,m)=>m==='FIXED_EXPENSES'?saved:null,
  save:async(o,m,k,v)=>(saved=structuredClone(v))
 };
 w.BOBS_DATA={listOutlets:async()=>[{id:'1',name:'Test outlet'}]};
 w.M2={read:async()=>null};
 w.IdliSupportReaders={expense:()=>null};
 try {
  for(const name of ['bobs-cost-flow.js','bobs-outlet-flow-core.js','fixed-expenses.js'])w.eval(readFileSync(name,'utf8'));
  await new Promise(resolve=>setImmediate(resolve));
  const [rent,cleaning]=d.querySelectorAll('#expenseList .row');
  assert.equal(rent.querySelector('.basis').value,'monthly');
  assert.equal(rent.querySelector('.amount').value,'7500');
  assert.equal(rent.querySelector('output').textContent,'₹246.58 / day');
  assert.equal(cleaning.querySelector('output').textContent,'₹100.00 / day');
  rent.querySelector('.amount').value='9000';
  rent.querySelector('.amount').dispatchEvent(new w.Event('input'));
  await d.getElementById('saveBtn').onclick();
  assert.equal(saved.expenses[0].amount,9000*12/365);
  assert.equal(+saved.expenses[0].inputAmount,9000);
  assert.equal(saved.expenses[1].amount,100);
  assert.equal(w.BOBS_OUTLET_FLOW.expenseDaily(saved.expenses[0]),9000*12/365);
 } finally { dom.window.close(); }
});
