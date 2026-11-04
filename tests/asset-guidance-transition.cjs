const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
test('capacity and supplier examples survive the next guided confirmation and pending transition timers',async()=>{
 const dom=new JSDOM('<section id="row"><h3>Steamer</h3><input data-field="unitCost" id="cost" value="100"><input type="checkbox" data-field="costConfirmed" id="costReviewed"></section><button id="continue">Confirm this field & continue</button>',{runScripts:'outside-only',url:'https://bobs.test/asset-master.html?outlet=1'}),w=dom.window,d=w.document;
 try{
  w.BOBS_EQUIPMENT_REFERENCES=[{name:'Idli steamer',note:'Verify actual capacity',url:'https://example.test/spec',unit:'piece',source:'Supplier',choices:[{label:'120 Idlis per batch',capacity:120}]}];
  w.eval(source('bobs-asset-guidance.js'));w.eval(source('bobs-transition-guard.js'));
  const row=d.getElementById('row'),asset={name:'Idli steamer'};w.BOBS_ASSET_GUIDANCE.render(row,asset,()=>{});
  row.querySelectorAll('input,select').forEach((n,i)=>{if(!n.id)n.id='asset-'+i});
  const cost=d.getElementById('cost');cost.value='200';cost.dispatchEvent(new w.Event('input',{bubbles:true}));cost.dispatchEvent(new w.Event('change',{bubbles:true}));
  [...row.querySelectorAll('button')].find(n=>n.textContent==='Use example: 120 Idlis per batch').click();
  d.getElementById('continue').click();assert.equal(row.querySelector('[data-capacity-field=value]').value,'120');assert.equal(row.querySelector('[data-capacity-field=status]').value,'estimate');
  await new Promise(r=>setTimeout(r,1050));assert.equal(row.querySelector('[data-capacity-field=value]').value,'120');
  [...row.querySelectorAll('button')].find(n=>n.textContent==='Use this price as an estimate').click();d.getElementById('continue').click();assert.equal(cost.value,'26000');
  assert.equal(row.querySelector('[data-field=costConfirmed]').checked,false);w.BOBS_ASSET_GUIDANCE.read(row,asset);assert.equal(asset.capacityFacts.value,'120');
 }finally{w.close()}
});
