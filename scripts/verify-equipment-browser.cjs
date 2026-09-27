const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const mock=`window.fixture={record:{schema:1,decisions:{},ebRate:11},backups:{},writes:[]};
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
window.BOBS_DATA={
jsonp:async()=>{const selection={};for(const cat of CAT_ORDER){const indices=ITEM_DATA[cat].map((x,i)=>/^(vada|bonda|veg puff)$/i.test(x.name)?i:-1).filter(i=>i>=0);if(indices.length)selection[cat]={indices}}return {ok:true,data:{selection}}},
getModule:async(o,m,k)=>m==='RECIPE_MASTER'?{recipes:[{name:'Vada',productionTiming:{equipment:'Wet grinder + frying kadai'}},{name:'Bonda',productionTiming:{equipment:'Frying kadai'}}]}:clone(m==='EQUIPMENT_PLAN'?fixture.record:fixture.backups[k]||null),
saveModule:async(o,m,k,d)=>{fixture.writes.push(m);if(m==='EQUIPMENT_PLAN')fixture.record=clone(d);else fixture.backups[k]=clone(d)}
};`;
const server=http.createServer((req,res)=>{const file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1);if(file==='bobs-google-data.js'){res.setHeader('Content-Type','application/javascript');return res.end(mock)}const full=path.resolve(root,file);if(!full.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(full))}catch{res.writeHead(404);res.end()}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'bobs-equipment-check-'));
 const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws;const errors=[];let next=1;const pending=new Map();
 try{
  const active=path.join(profile,'DevToolsActivePort');for(let i=0;i<100&&!fs.existsSync(active);i++)await delay(200);
  if(!fs.existsSync(active))throw Error('Chrome debugging endpoint did not start');
  const port=fs.readFileSync(active,'utf8').split('\n')[0];const tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
  ws.onmessage=e=>{const x=JSON.parse(e.data);if(x.id){const p=pending.get(x.id);if(p){pending.delete(x.id);x.error?p.reject(Error(x.error.message)):p.resolve(x.result)}}else if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.text+': '+(x.params.exceptionDetails.exception?.description||''))};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=next++;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
  const until=async expr=>{for(let i=0;i<120;i++){if(await evaluate(expr))return;await delay(250)}throw Error('Browser condition timed out: '+expr)};
  await send('Runtime.enable');await send('Page.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/equipment-planner.html?outlet=1'});
  await until(`document.getElementById('status')?.textContent.includes('selected Method 2 items')`);
  let state=await evaluate(`({status:document.getElementById('status').textContent,rows:document.querySelectorAll('tr[data-id]').length,disabled:document.getElementById('save').disabled})`);
  assert(state.rows>0);assert.equal(state.disabled,false);console.log('PASS local Chrome load',JSON.stringify(state));
  await evaluate(`document.getElementById('ebRate').value='0';document.getElementById('ebRate').dispatchEvent(new Event('change'));`);
  assert.equal(await evaluate(`document.getElementById('powerCost').textContent`),'₹0.00/day');
  await evaluate(`document.querySelector('input[value="INDIVIDUAL"]').click();document.getElementById('save').click()`);
  await until(`document.getElementById('saveStatus').textContent.includes('saved and read back')`);
  assert.equal(await evaluate('fixture.record.ebRate'),0);
  await evaluate(`document.getElementById('reload').click()`);await until(`!document.getElementById('save').disabled`);
  assert.equal(await evaluate(`Number(document.getElementById('ebRate').value)`),0);
  console.log('PASS local Chrome input/save/reload with fake Google adapter');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  console.log('Mobile fixture layout',JSON.stringify(await evaluate(`({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,tableScrollable:document.querySelector('.scroll').scrollWidth>document.querySelector('.scroll').clientWidth})`)));
  await send('Emulation.clearDeviceMetricsOverride');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`const originalFetch=window.fetch.bind(window);window.fetch=(input,init)=>{if(String(init?.method||'GET').toUpperCase()!=='GET')throw Error('Read-only verification blocks writes');return originalFetch(input,init)};`});
  errors.length=0;
  await send('Page.navigate',{url:'https://jothish2000.github.io/BOBS-OUTLETS/equipment-planner.html?outlet=1'});
  await until(`document.getElementById('status') && !document.getElementById('status').textContent.startsWith('Loading')`);
  console.log('LIVE READ-ONLY RESULT',JSON.stringify(await evaluate(`({status:document.getElementById('status').textContent,rows:document.querySelectorAll('tr[data-id]').length,back:document.getElementById('back').getAttribute('href')})`)));
  console.log('LIVE runtime errors',JSON.stringify(errors));
  await send('Browser.close').catch(()=>{});
 }finally{if(ws)ws.close();chrome.kill();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
