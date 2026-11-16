/* An isolated three-recipe save/reopen/continue journey. Every request is served from fixtures. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const review = require('./review-test-helper.cjs');
const K = require('../recipe-market-google-store.js');
const root = path.resolve(__dirname, '..');
const recipes = [
  { name: 'Idli', yieldQty: 120, yieldUnit: 'piece', ingredients: [['Rice', 3, 'kg', 60]] },
  { name: 'Idli Sambar', yieldQty: 10, yieldUnit: 'L', ingredients: [['Dal', 2, 'kg', 80]] },
  { name: 'Coconut Chutney', yieldQty: 2, yieldUnit: 'kg', ingredients: [['Coconut', 1, 'kg', 60]] },
];
const draft = { mode: 'production', unit: 'piece', batchSize: 120, batches: 3, sold: 300,
  price: 12, spoilage: 0, uuwp: 5, markup: 25, soldConfirmed: true, condiments: [
    { recipeName: 'Idli Sambar', portion: 50, portionUnit: 'ml', source: 'recipe' },
    { recipeName: 'Coconut Chutney', portion: 20, portionUnit: 'g', source: 'recipe' },
  ] };
const db = {
  '1/METHOD2/default': { itemEditors: { 'Breakfast Catalogue::0': draft } },
  'COMPANY/BOBS_STANDARD_RECIPE/ACTIVE_V1': K.manifest('standard',['rows'],'token',recipes.length),
  'COMPANY/BOBS_STANDARD_RECIPE/rows': K.chunkData('standard',recipes,'token',0,1)
};
(async()=>{
  const browser = await chromium.launch(process.env.BOBS_CHROMIUM_PATH?
    {executablePath:process.env.BOBS_CHROMIUM_PATH,headless:true}:{channel:process.env.BOBS_BROWSER_CHANNEL||'chrome',headless:true});
  try {
    const context=await browser.newContext();
    context.setDefaultTimeout(12000);
    const errors=[];
    context.on('page',page=>{page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())});
    await context.route('**/*',async route=>{
      const req=route.request(),u=new URL(req.url());
      if(u.hostname==='bobs.test'){
        const file=path.join(root,u.pathname.slice(1));
        return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''});
      }
      if(u.hostname!=='script.google.com')return route.abort();
      if(req.method()==='POST'){
        const b=req.postDataJSON();db[[b.outletId,b.module,b.recordKey].join('/')]=b.data;
        return route.fulfill({body:'ok'});
      }
      const q=u.searchParams, record=db[[q.get('outletId'),q.get('module'),q.get('recordKey')].join('/')];
      const response=q.get('action')==='outletList'?{ok:true,outlets:[{outletId:'1',outletName:'Test shop',data:{shiftTimes:[]}}]}:
        {ok:true,found:!!record,data:record??null};
      return route.fulfill({contentType:'application/javascript',body:q.get('callback')+'('+JSON.stringify(response)+')'});
    });
    const owner=await context.newPage();
    await owner.goto('https://bobs.test/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production');
    const pending=owner.locator('#guideCostLink [data-next-cost]');
    assert.match(await pending.innerText(),/Idli$/);
    const [editor]=await Promise.all([owner.waitForEvent('popup'),pending.click()]);
    for(const recipe of recipes){
      await editor.waitForFunction(n=>new URL(location).searchParams.get('item')===n,recipe.name);
      assert.equal(context.pages().length,2);
      await editor.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('data loaded'));
      await review(editor.locator('#referenceWeightReviewed'));
      await review(editor.locator('#intendedWeightReviewed'));
      await editor.click('#scale');
      await review(editor.locator('#confirmed'));
      const done=recipe===recipes.at(-1)?editor.waitForEvent('close'):Promise.resolve();
      await editor.click('#saveProduction');await done;
    }
    const checklist=owner.locator('#guideCostLink');
    assert.match(await checklist.innerText(),/Combined serving food cost: ₹2.90 per piece/);
    assert.equal(context.pages().length,1);
    assert.equal(await pending.count(),0);
    await owner.reload();await owner.waitForFunction(()=>document.querySelector('#controls')?.disabled===false);
    assert.equal(await pending.count(),0);
    assert.deepEqual(Object.keys(db['1/METHOD2/default'].recipeOverrides).sort(),['coconut chutney','idli','idli sambar']);
    assert.deepEqual(errors,[]);
    console.log('PASS Idli → Sambar → Chutney in one editor, exact return, combined portion cost and review state on reload');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
