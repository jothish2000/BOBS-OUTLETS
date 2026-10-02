const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const source=f=>fs.readFileSync(f,'utf8'),clone=x=>JSON.parse(JSON.stringify(x));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
async function until(fn){for(let n=0;n<100;n++){if(fn())return;await new Promise(r=>setTimeout(r,5))}throw Error('Expected editor state did not arrive')}
function fixture({mode='production',initial=null,optional=null,standardUnavailable=false,standardRecords,marketRecords}={}){
 const dom=new JSDOM(source('method2-item.html'),{url:'https://bobs.test/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode='+mode,runScripts:'outside-only'}),w=dom.window,$=id=>w.document.getElementById(id);
 w.confirm=()=>true;w.close=()=>{};w.opener={closed:false,focus(){},postMessage(){}};w.BroadcastChannel=class{postMessage(){}close(){}};
 w.eval(source('shared_data.js')+';window.ITEM_DATA=ITEM_DATA;');w.eval(source('method2-core.js'));
 const recipes=[{name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',3,'kg',60]]}];
 const draft={mode,unit:'piece',batchSize:120,batches:mode==='purchased'?360:3,capacity:1000,sold:290,price:10,spoilage:0,uuwp:5,uuwpPolicy:'always',markup:25,pricingBasis:'markup',condiments:[],packaging:[],packingMode:'none',mainPacking:{packingMode:'none',packaging:[],packingPer:1},commonPacking:{packingMode:'none',packaging:[],packingPer:1},purchase:{basis:'unit',supplyUnit:'piece',unit:'piece',qty:1,total:2},soldConfirmed:true};
 let db={'1/METHOD2/default':{itemEditors:{'Breakfast Catalogue::0':draft}}},fail=false,standardCalls=0;const reads=[],writes=[];
 w.BOBS_DATA={jsonp:async p=>{reads.push(p.module);if(p.module==='RECIPE_MASTER')throw Error('Legacy recipe access forbidden');if(p.module==='METHOD2'&&initial){const v=initial;initial=null;return v.promise}if(p.module==='METHOD2'&&fail)throw Error('Google Data Vault timeout');if(p.module==='IDLI_SUPPORT'&&optional)return optional.promise;const data=db[p.outletId+'/'+p.module+'/'+p.recordKey];return {ok:true,found:!!data,data:clone(data??null)}},saveModule:async(o,m,k,d)=>{writes.push(m);db[o+'/'+m+'/'+k]=clone(d)}};
 w.BOBS_RECIPE_KNOWLEDGE={loadStandards:async()=>{standardCalls++;if(standardUnavailable)throw Error('Google standard timeout');return standardRecords===null?null:{records:clone(standardRecords===undefined?recipes:standardRecords)}}};w.BOBS_MARKET_REFERENCES=clone(marketRecords===undefined?recipes:marketRecords);w.BOBS_PORIYAL=[];
 w.BOBS_FULL_COST={load:()=>optional?optional.promise:Promise.resolve({error:'No cost plan'}),render:(box,data)=>box.textContent=data.error||'Full costs'};w.IdliSupportReaders={renderItem:(box,r,e)=>box.textContent=e||'Support'};
 w.eval(source('bobs-operational-recipes.js'));w.eval(source('method2-packing-ui.js'));w.eval(source('method2-item.js'));
 return {dom,w,$,reads,writes,recipes,get db(){return db},setFail:v=>fail=v,get standardCalls(){return standardCalls}};
}
test('cold required read gates Save; optional pending/failure never blocks editor; no legacy reads',async()=>{
 const initial=deferred(),optional=deferred(),x=fixture({initial,optional});assert(x.$('controls').disabled);assert(x.$('editor').hidden);await x.$('editor').onsubmit({preventDefault(){}});assert.equal(x.writes.length,0);
 initial.resolve({ok:true,data:x.db['1/METHOD2/default']});await until(()=>!x.$('controls').disabled);assert.equal(x.$('sold').value,'290');assert.match(x.$('idliLabourCost').textContent,/still loading/);
 optional.reject(Error('optional timeout'));await until(()=>x.$('idliLabourCost').textContent.includes('optional timeout'));assert(!x.$('editor').hidden);assert.equal(x.writes.length,0);assert(!x.reads.includes('RECIPE_MASTER'));x.dom.window.close();
});
test('failed required read stays disabled; manual retry fresh load succeeds',async()=>{
 const initial=deferred(),x=fixture({initial});initial.reject(Error('Google Data Vault timeout'));await until(()=>!x.$('retryGoogle').hidden);assert(x.$('controls').disabled);assert(x.$('editor').hidden);assert(x.$('itemGuide').hidden);x.$('retryGoogle').click();await until(()=>!x.$('controls').disabled);assert.match(x.$('status').textContent,/Loaded from Google/);assert.equal(x.writes.length,0);x.dom.window.close();
});
test('normal save uses fresh standard, verified backup and readback; reload retains quantity; refresh never reads legacy',async()=>{
 const x=fixture();await until(()=>!x.$('controls').disabled);const before=x.standardCalls;
 await x.$('editor').onsubmit({preventDefault(){}});assert.equal(x.$('saveStatus').textContent,'Verified in Google',x.$('status').textContent);assert(x.standardCalls>before);assert.deepEqual(x.writes,['METHOD2_BACKUPS','METHOD2']);assert(x.reads.filter(x=>x==='METHOD2').length>=4);assert.equal(Number(x.db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].sold),290);
 x.w.dispatchEvent(new x.w.MessageEvent('message',{origin:'https://bobs.test',data:{type:'bobs-recipe-master-saved'}}));await until(()=>x.standardCalls>before+1);assert(!x.reads.includes('RECIPE_MASTER'));x.dom.window.close();
});
test('save-time failed required Google read cannot write; both mode routes and native recipe quantity survive',async()=>{
 for(const mode of ['production','purchased']){const x=fixture({mode});await until(()=>!x.$('controls').disabled);assert.equal(x.$('mode').value,mode);const link=new URL(x.$('supplyRecipeLink').querySelector('a').href);assert.equal(link.searchParams.get('outlet'),'1');assert.equal(link.pathname,mode==='production'?'/recipe-cost-editor.html':'/purchase-cost-editor.html');if(mode==='production')assert.equal(link.searchParams.get('qty'),'360');x.setFail(true);await x.$('editor').onsubmit({preventDefault(){}});assert.equal(x.writes.length,0);assert.match(x.$('status').textContent,/timeout/);x.dom.window.close();}
});

test('plain-language guide distinguishes fallback and purchase, shows three steps, and never saves on load',async()=>{
 for(const opts of [{},{standardUnavailable:true},{mode:'purchased',standardUnavailable:true}]){
  const x=fixture(opts);assert(x.$('itemGuide').hidden);await until(()=>!x.$('controls').disabled);
  assert(!x.$('itemGuide').hidden);assert.equal(x.$('itemGuide').querySelectorAll('ol > li').length,3);
  assert.match(x.$('itemGuide').textContent,/Edits are not saved automatically/);
  const title=x.$('guideSourceTitle').textContent;
  assert.match(title,opts.mode==='purchased'?/supplier/:opts.standardUnavailable?/BOBS standard recipe unavailable/:/BOBS standard recipe loaded from Google Sheets/);
  assert.equal(x.$('guideCostLink').querySelector('a').href,x.$('supplyRecipeLink').querySelector('a').href);
  assert.equal(x.writes.length,0);
  x.$('mode').value=opts.mode==='purchased'?'production':'purchased';x.$('mode').dispatchEvent(new x.w.Event('change'));
  assert.match(x.$('guideSourceTitle').textContent,opts.mode==='purchased'?/BOBS standard recipe unavailable/:/supplier/);
  x.dom.window.close();
 }
});

test('guide reports this item source for empty, failed and mixed standard reads without implying deletion or search',async()=>{
 const other={name:'Sambar',yieldQty:5,yieldUnit:'L',ingredients:[['Dal',1,'kg',100]]};
 for(const opts of [{standardRecords:null},{standardRecords:[]},{standardUnavailable:true},{standardRecords:[other]}]){
  const x=fixture(opts);await until(()=>!x.$('controls').disabled);
  assert.equal(x.$('guideSourceTitle').textContent,'BOBS standard recipe unavailable');
  assert.match(x.$('guideSourceText').textContent,/for this item from Google Sheets/);
  assert.match(x.$('guideSourceText').textContent,/previously prepared market-reference recipe/);
  assert.doesNotMatch(x.$('guideSourceText').textContent,/deleted|Google standard|search/i);
  assert.equal(x.writes.length,0);x.dom.window.close();
 }
 const x=fixture({marketRecords:[other]});await until(()=>!x.$('controls').disabled);
 assert.equal(x.$('guideSourceTitle').textContent,'BOBS standard recipe loaded from Google Sheets');
 assert.match(x.$('guideSourceText').textContent,/retrieved the BOBS standard recipe for this item from Google Sheets/);
 assert.match(x.$('guideSourceText').textContent,/Check each side/);x.dom.window.close();
});
test('guide does not claim a fallback exists for an item missing from both collections',async()=>{
 const other={name:'Sambar',yieldQty:5,yieldUnit:'L',ingredients:[['Dal',1,'kg',100]]};
 const x=fixture({standardRecords:[other],marketRecords:[]});await until(()=>!x.$('controls').disabled);
 assert.equal(x.$('guideSourceTitle').textContent,'Recipe unavailable for this item');
 assert.match(x.$('guideSourceText').textContent,/no previously prepared market-reference recipe is available/);
 assert.equal(x.writes.length,0);x.dom.window.close();
});
