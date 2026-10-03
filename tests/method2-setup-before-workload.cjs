const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const root=path.resolve(__dirname,'..'),src=f=>fs.readFileSync(path.join(root,f),'utf8');
const clone=x=>JSON.parse(JSON.stringify(x));
function dom(file,url){const d=new JSDOM(src(file),{url,runScripts:'outside-only',pretendToBeVisual:true});d.window.scrollTo=()=>{};d.window.alert=()=>{};d.window.confirm=()=>true;return d;}
function core(w){w.eval(src('bobs-number-format.js'));w.eval(src('shared_data.js')+';window.CAT_ORDER=CAT_ORDER;window.ITEM_DATA=ITEM_DATA;');w.eval(src('method2-core.js'));}
async function wait(fn){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10))}throw Error('Expected DOM state timed out')}
(async()=>{
 const d=dom('method2.html','https://bobs.test/method2.html?outlet=1&flow=1'),w=d.window;core(w);
 const cat=w.CAT_ORDER.find(c=>w.ITEM_DATA[c].some(x=>/^idli$/i.test(x.name))),i=w.ITEM_DATA[cat].findIndex(x=>/^idli$/i.test(x.name)),key=w.M2.keys(cat,i).k;
 const recipes=[{name:'Idli',yieldQty:120,yieldUnit:'piece',ingredients:[['Rice',1,'kg',55]]}];
 const state=w.M2.state({selection:{[cat]:{indices:[i]}},orderPacking:{mode:'none'}});
 const draft=w.M2.draft(state,cat,i,w.ITEM_DATA[cat][i]);
 Object.assign(draft,{mode:'production',batchSize:120,batches:3,capacity:1440,sold:290,soldConfirmed:true,businessDate:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),mainPacking:{packingMode:'none',packaging:[],packingPer:1},commonPacking:{packingMode:'none',packaging:[],packingPer:1},packingSchemaVersion:3});state.itemEditors[key]=draft;
 assert.equal(w.M2.calculate(w.M2.draft(state,cat,i,w.ITEM_DATA[cat][i]),w.ITEM_DATA[cat][i],recipes).missing.length,0);
 let failReads=false,readHold=null,writes=0,opened;
 w.M2.read=async o=>{if(readHold)await readHold;if(failReads)throw Error('fixture read failure');return clone(o==='COMPANY'?{recipes}:state)};w.M2.cache=()=>{};w.M2.write=async()=>{writes++;throw Error('Unexpected write')};
 w.open=url=>(opened=url,{});
 let plan={profiles:[{name:'Idli',qty:360}],review:{ownerReviewed:false},calculation:{complete:true}};
 w.BOBS_DATA={getModule:async()=>clone(plan)};
 w.eval(src('method2-list.js'));w.eval(src('method2-workload-gate.js'));
 await wait(()=>w.BOBS_METHOD2_ITEMS_COMPLETE()&&w.document.getElementById('guideStage').textContent==='STEP 3');
 console.log('PASS completed saved item can reach staffing');
 // Actual unchanged selector -> opener notification -> actual list + workload gate.
 const select=dom('method2-select.html','https://bobs.test/method2-select.html?'+new URLSearchParams({outlet:'1',cat})),s=select.window;core(s);let closed=false,notified=false;
 s.M2.read=async()=>clone(state);s.M2.saveSelection=async()=>{writes++;throw Error('No-change selection must not write')};
 s.opener={closed:false,focus:()=>{},postMessage:data=>{notified=data.reviewItems===true;w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,data}))}};s.close=()=>{closed=true};
 s.eval(src('method2-select.js'));await wait(()=>s.document.getElementById('status').textContent.includes('Selections loaded'));
 s.document.getElementById('selectionForm').dispatchEvent(new s.Event('submit',{bubbles:true,cancelable:true}));
 await wait(()=>closed&&w.document.getElementById('guideStage').textContent==='STEP 2');assert(notified);assert.equal(writes,0);
 assert.match(w.document.getElementById('guideText').textContent,/choose Purchase or Production/);assert.equal(w.document.getElementById('guideAction').getAttribute('href'),'#selectedCard');assert(!w.BOBS_METHOD2_WORKLOAD_REVIEW());
 await new Promise(r=>setTimeout(r,100));assert.equal(w.document.getElementById('guideStage').textContent,'STEP 2');
 console.log('PASS unchanged Idli selection returns mode/quantity/Sold Today stage; staffing cannot overwrite it; zero writes');
 for(const mode of ['purchased','production']){const row=w.document.querySelector('#catList tr');row.querySelector('select').value=mode;row.querySelector('button').click();assert.equal(new URL(opened,'https://bobs.test').searchParams.get('mode'),mode);assert.equal(w.document.getElementById('guideStage').textContent,'STEP 2')}
 w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,data:{type:'bobs-method2-item-saved',outlet:'1',key}}));
 await wait(()=>w.BOBS_METHOD2_ITEMS_COMPLETE()&&w.document.getElementById('guideStage').textContent==='STEP 3');
 assert.equal(w.BOBS_METHOD2_WORKLOAD_GATE.getState().requirements[0].qty,360);assert(!w.BOBS_METHOD2_WORKLOAD_REVIEW());
 await new Promise(r=>setTimeout(r,20));plan.review.ownerReviewed=true;await w.BOBS_METHOD2_WORKLOAD_REFRESH();assert.equal(w.document.getElementById('guideStage').textContent,'STEP 4');assert(w.BOBS_METHOD2_WORKLOAD_REVIEW());
 console.log('PASS saved item -> staffing from 360 produced (not 290 sold) -> owner-reviewed plan completion');
 state.itemEditors[key].sold='';w.document.getElementById('refresh').click();await wait(()=>w.document.getElementById('status').textContent.includes('Loaded from Google'));assert.equal(w.document.getElementById('guideStage').textContent,'STEP 2');assert(!w.BOBS_METHOD2_ITEMS_COMPLETE());
 failReads=true;w.document.getElementById('refresh').click();await wait(()=>w.document.getElementById('guideStage').textContent==='GOOGLE READ FAILED');await w.BOBS_METHOD2_WORKLOAD_REFRESH();assert.equal(w.document.getElementById('guideStage').textContent,'GOOGLE READ FAILED');assert(!w.BOBS_METHOD2_WORKLOAD_REVIEW());
 console.log('PASS blank Sold Today and Google read failure retain item stage and block workload completion');
 failReads=false;state.itemEditors[key].sold=290;
 const standalone=dom('method2.html','https://bobs.test/method2.html?outlet=1&setup=1'),a=standalone.window;core(a);
 a.M2.read=async o=>clone(o==='COMPANY'?{recipes}:state);a.M2.cache=()=>{};a.BOBS_DATA={getModule:async()=>clone(plan)};
 a.eval(src('method2-list.js'));a.eval(src('method2-workload-gate.js'));
 await wait(()=>a.document.getElementById('guideStage').textContent==='STEP 2');
 assert.equal(new URL(a.location.href).searchParams.has('setup'),false);assert.equal(a.sessionStorage.getItem('method2-setup-review-1'),'1');
 a.document.querySelector('.cancel-edit').click();await wait(()=>a.document.getElementById('guideStage').textContent==='STEP 4');assert.equal(a.sessionStorage.getItem('method2-setup-review-1'),null);
 console.log('PASS standalone return keeps setup-first stage; explicit keep-saved clears transient review without writes');
 standalone.window.close();d.window.close();console.log('PASS actual-selector/list/gate integration, isolated DOM only; no live writes');
})().catch(e=>{console.error(e);process.exitCode=1});
