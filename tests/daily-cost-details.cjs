const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
require('../method2-core.js');
const day='2026-11-15',cat='Breakfast Catalogue',key=cat+'::0';
const recipe=(name,yieldQty,yieldUnit,ingredients)=>({name,yieldQty,yieldUnit,ingredients});
const recipes=[recipe('Idli',10,'piece',[['Rice',1,'kg',80],['LPG',0.1,'kg',100]]),recipe('Sambar',1,'L',[['Dal',0.5,'kg',120]])];
const noPacking={packingMode:'none',packingPer:1,packaging:[]};
const item={name:'Idli'};
const draft={mode:'production',unit:'piece',sold:8,batchSize:10,batches:1,markup:10,price:15,mainPacking:noPacking,commonPacking:noPacking,condiments:[{recipeName:'Sambar',source:'recipe',portion:25,portionUnit:'ml',...noPacking}]};
const c=M2.calculate(draft,item,recipes);
const evidence=M2.directCostEvidence(draft,item,recipes,c,day);
const raw={commercial:{[key]:{costEvidence:evidence}}};
test('daily evidence costs all main output, actual side portions and direct fuel once',()=>{
 assert.equal(evidence.sold,8);
 assert.equal(evidence.main,90);
 assert.equal(evidence.direct,102);
 assert.equal(evidence.ingredients.find(x=>x.name==='Dal').quantity,0.1);
 assert.equal(evidence.ingredients.find(x=>x.energy).amount,10);
 assert.equal(evidence.sides[0].quantity,200);
 assert.equal(evidence.ingredients.reduce((s,x)=>s+x.amount,0),evidence.direct);
});
async function view(section,requested=day,record=raw,allocations,backups=[]){
 const original='https://bobs.test/method2-item.html?outlet=3&cat=Breakfast+Catalogue&i=0';
 const params=new URLSearchParams({outlet:3,cat,i:0,date:requested,section,returnTo:original});
 const dom=new JSDOM(fs.readFileSync('daily-cost-details.html','utf8'),{url:'https://bobs.test/daily-cost-details.html?'+params,runScripts:'outside-only'});
 const w=dom.window;
 w.BOBS_COST_FLOW={today:()=>day,days:()=>30};
 w.BOBS_OUTLET_FLOW={
  baselineMatches:()=>true,menuStamp:()=>1,recipeStamp:()=>2,stamp:()=>3,
  fund:p=>p,pools:()=>[{id:'rent',name:'Rent',daily:300,kind:'expense'},{id:'cook',name:'Cook',daily:600,kind:'labour'}],
  allocate:()=>({labour:150,overhead:150})
 };
 w.BOBS_CAPITAL={depreciation:()=>({itemDaily:5,lines:[{name:'Steamer',daily:10,uses:[{key,percent:50,daily:5}]}]})};
 w.BOBS_PRODUCTION_PLAN={reconcile:()=>{}};
 w.BOBS_NUMBERS={quantity:(n)=>String(n)};
 w.BOBS_OPERATIONAL_RECIPES={load:async()=>({recipes:[]})};w.M2={...M2,backups:async ()=>backups,read:async outlet=>{assert.equal(outlet,'3');return record},installSides:()=>{}};
 w.BOBS_FULL_COST={snapshot:()=>12,load:async()=>allocations||({error:'No reviewed allocations'})};
 w.ITEM_DATA={[cat]:[item]};
 w.eval(fs.readFileSync('bobs-cost-detail-links.js','utf8'));
 w.eval(fs.readFileSync('bobs-daily-cost-details.js','utf8'));
 await new Promise(r=>setTimeout(r,5));
 return {dom,w,content:w.document.getElementById('content').textContent};
}
test('saved detail links preserve outlet, date, item and return path without allowing changes',async()=>{
 const {dom,w,content}=await view('ingredients');
 assert.match(content,/Rice/);assert.match(content,/Dal/);assert.doesNotMatch(content,/LPG/);
 for(const link of w.document.querySelectorAll('nav a')){
  const p=new URL(link.href).searchParams;
  assert.equal(p.get('outlet'),'3');assert.equal(p.get('date'),day);assert.equal(p.get('i'),'0');assert.match(p.get('returnTo'),/method2-item/);
 }
 assert.equal(w.document.querySelectorAll('input,select,textarea,form').length,0);
 dom.window.close();
});
test('stale date does not substitute a different day, missing allocations stay pending',async()=>{
 const old=await view('production','2026-11-14');assert.match(old.content,/No confirmed/);assert.doesNotMatch(old.content,/102/);old.dom.window.close();
 const saved=await view('production');assert.match(saved.content,/102.00/);assert.match(saved.content,/No reviewed allocations/);saved.dom.window.close();
});
test('legacy records disclose unavailable ingredient data and show actual zero',async()=>{
 const record={itemEditors:{[key]:{soldConfirmed:true,savedAt:'2026-11-15T12:00:00Z',businessDate:day,unit:'piece'}},commercial:{[key]:{actualDayCost:0,soldQuantity:0,todaysProduction:3,mode:'production',actualMainFoodCost:0}}};
 const legacy=await view('ingredients',day,record);assert.match(legacy.content,/predates detailed/);legacy.dom.window.close();
 const zero=await view('production',day,record);assert.match(zero.content,/₹0.00/);zero.dom.window.close();
});

test('historical link follows its date after the latest item record is replaced',async()=>{
 const previous={...evidence,date:'2026-11-14',direct:75};
 const backup={data:{outlet:'3',data:{commercial:{[key]:{costEvidence:previous}}}}};
 const old=await view('production','2026-11-14',raw,null,[backup]);
 assert.match(old.content,/₹75.00/);assert.doesNotMatch(old.content,/₹102.00/);
 assert.match(old.content,/Historical allocations and depreciation/);old.dom.window.close();
});

test('daily totals add item shares, shared overhead and depreciation exactly once',async()=>{
 const allocations={items:[{key}],recipes:[],requirements:{},baseline:{},staffing:{date:day,reviewed:true,salaryReviewed:true,menuStamp:1,recipeStamp:2,requirementsStamp:3},sharedKitchen:{items:{[key]:{labour:10,overhead:7,transport:2,depreciation:3}}},allocations:{items:{[key]:{sourceStamp:12,choices:{rent:{percent:50},cook:{percent:25}}}}}};
 const total=await view('production',day,raw,allocations);
 assert.match(total.content,/Total direct COGS for the day₹102.00/);
 assert.match(total.content,/Cost including operating overheads₹421.00/);
 assert.match(total.content,/Total cost including overheads and depreciation₹429.00/);total.dom.window.close();
 const expenses=await view('expenses',day,raw,allocations);
 assert.match(expenses.content,/Rent₹300.0050%₹150.00/);assert.doesNotMatch(expenses.content,/Cook/);expenses.dom.window.close();
 const machinery=await view('assets',day,raw,allocations);
 assert.match(machinery.content,/Steamer₹10.0050%₹5.00/);machinery.dom.window.close();
});
