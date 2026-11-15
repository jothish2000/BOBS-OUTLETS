/* Isolated window lifecycle: actual shared helper, no Google or operational writes. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const source=fs.readFileSync(path.join(__dirname,'../bobs-window-return.js'),'utf8');
(async()=>{const browser=await chromium.launch({channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});context.setDefaultTimeout(15000);
 const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());if(u.hostname!=='bobs.test')return route.abort();
  const page=u.pathname.slice(1),helper=page==='recipe-cost-editor.html';
  const body=helper?'<h1>Temporary recipe editor</h1><input aria-label="Recipe draft"><button id="fail">Simulate failed save</button><button id="verified">Simulate verified save</button><p role="status" id="receipt"></p><script>fail.onclick=()=>receipt.textContent="Save failed; draft retained";verified.onclick=()=>{receipt.textContent="Fixture read-back verified";BOBS_WINDOW_RETURN.afterSave();};</script>':'<h1>'+page+'</h1><label>Unsaved draft <input id="draft"></label><a id="next" target="_blank" href="production-plan.html?outlet=1">Next production module</a><a id="recipe" target="_blank" href="recipe-cost-editor.html?item=Idli">Review recipe</a>';
  return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><title>'+page+'</title><script>'+source+'</script></head><body>'+body+'</body></html>'});
 });
 const main=await context.newPage();await main.goto('https://bobs.test/method2.html?outlet=1&preview=1');
 await main.click('#next');await main.waitForURL('**/production-plan.html?**');assert.equal(context.pages().length,1);assert(await main.locator('#bobsClickPreview').isVisible());
 await main.fill('#draft','keep this unsaved parent input');
 const opened=main.waitForEvent('popup');await main.click('#recipe');const child=await opened;await child.waitForSelector('#verified');assert.equal(context.pages().length,2);
 await child.fill('input','recipe draft');await child.click('#fail');assert.equal(child.isClosed(),false);assert.match(await child.locator('#receipt').innerText(),/Save failed/);
 assert(await child.locator('#bobsClickPreview').isVisible());const closed=child.waitForEvent('close');await child.click('#verified');await closed;
 assert.equal(context.pages().length,1);assert.equal(await main.inputValue('#draft'),'keep this unsaved parent input');
 // Changed caller must not be mistaken for the recorded original page.
 const openedAgain=main.waitForEvent('popup');await main.click('#recipe');const second=await openedAgain;await second.waitForSelector('#verified');const caller=main.url();await main.goto('https://bobs.test/outlets.html');await second.click('#verified');await second.waitForURL(caller);assert.equal(second.isClosed(),false);assert.equal(new URL(main.url()).pathname,'/outlets.html');
 assert.deepEqual(errors,[]);console.log('PASS same working window, preview, verified helper close, failed-save retention, parent draft and changed-caller fallback');
 await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
