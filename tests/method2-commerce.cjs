const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');require(path.join(root,'method2-core.js'));
const recipes=[
 {name:'Idli',kind:'PRIMARY',yieldQty:120,yieldUnit:'pieces',ingredients:[['Rice',1,'kg',120]]},
 {name:'Idli Sambar',id:'sambar1',kind:'CONDIMENT',yieldQty:10,yieldUnit:'L',ingredients:[['Existing dal recipe',5,'kg',100]]},
 {name:'Coconut Chutney',id:'chutney1',kind:'CONDIMENT',yieldQty:3,yieldUnit:'kg',ingredients:[['Coconut',3,'kg',90]]}
];
const idli={name:'Idli'},sambar=M2.sideCatalogue({},recipes)[0];
const base={mode:'purchased',unit:'piece',batchSize:120,batches:1,sold:4,spoilage:0,uuwp:5,markup:25,price:15,packingPer:2,packaging:[{qty:1,unitCost:4}],purchase:{basis:'batch',qty:120,unit:'piece',total:840},condiments:[{recipeName:'Idli Sambar',source:'recipe',portion:20,portionUnit:'ml'}]};
const side={mode:'production',unit:'pack',batchSize:1,batches:1,sold:1,servingQty:200,servingUnit:'ml',spoilage:0,uuwp:5,markup:25,price:20,packingPer:1,packaging:[{qty:1,unitCost:1.3}],condiments:[]};
const c=M2.calculate(base,idli,recipes),s=M2.calculate(side,sambar,recipes);
assert.equal(c.base,7);assert.equal(c.cond,1);assert.equal(c.soldCost,40);
assert.equal(s.base,10);assert.notEqual(s.base,8);assert.equal(s.soldCost,11.3);assert.equal(c.revenue+s.revenue,80);assert.equal(c.soldCost+s.soldCost,51.3);
assert.equal(c.usage[0].quantity+s.usage[0].quantity,280);
assert.equal(M2.calculate({...side,mode:'purchased',purchase:{basis:'batch',qty:10,unit:'L',total:600}},sambar,recipes).base,12);
assert.equal(M2.calculate({...side,mode:'purchased',purchase:{basis:'unit',qty:1,unit:'pack',total:9}},sambar,recipes).base,9);
for(const mode of ['production','purchased'])for(const source of ['recipe','purchase']){
 const d={...base,mode,condiments:[{...base.condiments[0],source,purchase:{basis:'batch',qty:10,unit:'L',total:600}}]};
 const result=M2.calculate(d,idli,recipes);assert.equal(result.base,mode==='production'?1:7);assert.equal(result.cond,source==='recipe'?1:1.2);assert.equal(result.missing.length,0);
}
assert.equal(M2.calculate({...base,pricingBasis:'margin'},idli,recipes).suggested,14);
assert(M2.calculate({...base,pricingBasis:'margin',markup:100},idli,recipes).missing.length);
assert.equal(M2.calculate({...base,mode:'production',sold:3},idli,recipes).apply,true);
assert(M2.calculate({...side,servingUnit:'g'},sambar,recipes).missing.length);
assert.equal(M2.purchaseRate({qty:10,unit:'L',total:0}),0);assert.equal(M2.purchaseRate({qty:0,total:10}),null);assert.equal(M2.purchaseRate({qty:10,total:''}),null);
const catalogue=M2.sideCatalogue({},recipes),reordered=M2.sideCatalogue({sideCatalogue:catalogue},[recipes[2],recipes[1],{name:'New Chutney',kind:'CONDIMENT',yieldUnit:'kg'}]);
assert.deepEqual(reordered.slice(0,2).map(x=>x.recipeId),catalogue.map(x=>x.recipeId));assert.equal(reordered.length,3);

(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:1366,height:900}});
 const clone=x=>JSON.parse(JSON.stringify(x)),originalRecipes=clone(recipes),errors=[];
 const db={'COMPANY/RECIPE_MASTER/STANDARD_V1':{recipes:clone(recipes)},'1/METHOD2/default':{custom:'KEEP',selection:{'Breakfast Catalogue':{indices:[0]}},qtys:{'Other|0':2}},'2/METHOD2/default':{custom:'OTHER OUTLET'}};
 let failWrites=false;
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.hostname==='script.google.com'){
   if(u.searchParams.get('action')==='outletList')return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify({ok:true,outlets:[{outletId:'1',outletName:'Test outlet',data:{id:'1',name:'Test outlet'}}]})+')'});
   if(req.method()==='POST'){const b=JSON.parse(req.postData());if(!failWrites)db[b.outletId+'/'+b.module+'/'+b.recordKey]=b.data;return route.fulfill({body:'ok'})}
   const data=db[u.searchParams.get('outletId')+'/'+u.searchParams.get('module')+'/'+u.searchParams.get('recordKey')];
   return route.fulfill({contentType:'application/javascript',body:u.searchParams.get('callback')+'('+JSON.stringify({ok:true,found:!!data,data})+')'});
  }
  if(u.hostname==='bobs.test'){const name=decodeURIComponent(u.pathname.slice(1)),file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'missing'});return route.fulfill({contentType:name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html',body:fs.readFileSync(file)})}
  return route.abort();
 });
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.stack||e.message)));
 const page=await context.newPage(),itemUrl='https://bobs.test/method2-item.html?outlet=1&cat=Breakfast%20Catalogue&i=0&mode=purchased';
 await page.goto(itemUrl);await page.waitForSelector('#editor:not([hidden])');
 await page.locator('#batchSize').fill('120');await page.locator('#batches').fill('1');await page.locator('#spoilage').fill('0');await page.locator('#price').fill('15');await page.locator('#sold').fill('4');
 const purchase=page.locator('#purchaseInputs');
 await purchase.getByLabel('How purchased').selectOption('batch');
 await purchase.getByLabel('Quantity in this priced unit / batch',{exact:true}).fill('120');
 await purchase.getByLabel('Total supplier price ₹ for this quantity',{exact:true}).fill('840');
 assert.match(await purchase.locator('.purchase-summary').textContent(),/7.0000.*piece/);
 await page.locator('#m2SideChecks input[value="Idli Sambar"]').check();
 const condiment=page.locator('#condiments > .component').first();
 assert.equal(await condiment.getByLabel('Cost source').inputValue(),'purchase');
 await condiment.getByLabel('Cost source').selectOption('recipe');
 assert.equal(await condiment.locator('.purchase-fields').count(),0);
 await condiment.getByLabel('Packing choice',{exact:true}).selectOption('required');await condiment.getByLabel('Sales units sharing ONE packing set',{exact:true}).fill('2');await condiment.getByRole('button',{name:'+ Add packing material',exact:true}).click();await condiment.getByLabel('Price ₹ each',{exact:true}).fill('1');
 assert.match(await condiment.locator('.side-cost').textContent(),/No separate revenue/);
 await page.locator('#idliPackingPreset').click();await page.locator('#mainPacking').getByLabel('Price ₹ each',{exact:true}).fill('3');
 await page.locator('#pricingBasis').selectOption('margin');assert.match(await page.locator('#pricing').textContent(),/14.00/);
 const common=page.locator('#commonPacking');
 await common.getByLabel('Packing choice',{exact:true}).selectOption('required');
 await common.getByLabel('Sales units sharing ONE packing set',{exact:true}).fill('4');
 await common.getByRole('button',{name:'+ Add packing material',exact:true}).click();
 await common.getByLabel('Price ₹ each',{exact:true}).fill('2');
 assert.match(await page.locator('#totals').textContent(),/42.00/);
 assert.match(await page.locator('#packingConsolidation').textContent(),/10.00/);
 await common.getByLabel('Packing choice',{exact:true}).selectOption('none');
 assert.match(await page.locator('#totals').textContent(),/40.00/);
 await condiment.getByLabel('Packing choice',{exact:true}).selectOption('none');
 assert.equal(await condiment.getByLabel('Price ₹ each',{exact:true}).count(),0);
 await condiment.getByLabel('Packing choice',{exact:true}).selectOption('required');
 assert.equal(await condiment.getByLabel('Price ₹ each',{exact:true}).inputValue(),'1');
 assert.match(await page.locator('#pricing').textContent(),/14.00/);
 await condiment.getByLabel('Packing choice',{exact:true}).selectOption('included');
 assert.match(await page.locator('#costs').textContent(),/Supplier-included packing requires Purchase/);
 await condiment.getByLabel('Packing choice',{exact:true}).selectOption('required');
 await page.locator('#mode').selectOption('production');assert.equal(await condiment.getByLabel('Cost source').inputValue(),'recipe');
 await page.locator('#mode').selectOption('purchased');assert.equal(await condiment.getByLabel('Cost source').inputValue(),'recipe');
 assert.match(await page.locator('#costs a').first().getAttribute('href'),/purchase-cost-editor/);
 await page.locator('#save').click();await page.waitForURL('**/method2.html?outlet=1');
 assert.equal(db['1/METHOD2/default'].purchaseMasters.idli.qty,'120');
 assert.equal(db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].commonPacking.packaging[0].unitCost,'2');
 assert.equal(db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].commonPacking.packingMode,'none');
 assert.equal(db['1/METHOD2/default'].itemEditors['Breakfast Catalogue::0'].condiments[0].packaging[0].unitCost,'1');
 assert.deepEqual(db['1/METHOD2/default'].commercial['Breakfast Catalogue::0'].packingBreakdown.map(x=>x.total),[6,2]);
 assert.equal(db['1/METHOD2/default'].commercial['Breakfast Catalogue::0'].totalSoldCogs,40);
 // Create a separately sold side from the original master, without changing that master.
 await page.goto('https://bobs.test/method2-select.html?outlet=1&cat='+encodeURIComponent(M2.SIDES));await page.waitForSelector('#selectionForm:not([hidden])');
 await page.getByRole('checkbox',{name:'Select Idli Sambar',exact:true}).check();await page.locator('#saveReturn').click();await page.waitForURL('**/method2.html?outlet=1');
 await page.waitForFunction(()=>document.querySelectorAll('#catList tr').length===2);
 const sideUrl='https://bobs.test/method2-item.html?outlet=1&cat='+encodeURIComponent(M2.SIDES)+'&i=0&mode=production';
 await page.goto(sideUrl);await page.waitForSelector('#editor:not([hidden])');
 assert.equal(await page.locator('#servingQty').inputValue(),'200');assert.equal(await page.locator('#servingUnit').inputValue(),'ml');assert.equal(await page.locator('#price').inputValue(),'');
 assert.equal(await page.locator('#condimentSection').isVisible(),false);
 assert.equal(await page.locator('#m2IdliPackRules').count(),0);
 assert.match(await page.locator('#costs a').first().getAttribute('href'),/item=Idli%20Sambar/);
 await page.locator('#batchSize').fill('1');await page.locator('#batches').fill('1');await page.locator('#spoilage').fill('0');await page.locator('#price').fill('20');await page.locator('#sold').fill('1');
 await page.locator('#mainPackingChoice').selectOption('required');await page.locator('#addPacking').click();await page.getByLabel('Price ₹ each',{exact:true}).fill('1.3');
 assert.match(await page.locator('#costs').textContent(),/10.00/);assert.match(await page.locator('#totals').textContent(),/11.30/);
 await page.screenshot({path:path.join(root,'method2-commerce-test.png'),fullPage:true});
 await page.locator('#save').click();await page.waitForURL('**/method2.html?outlet=1');await page.waitForFunction(()=>document.getElementById('grandTotalCost').textContent.includes('51.30'));
 assert.match(await page.locator('#grandTotalSale').textContent(),/80.00/);
 await page.goto('https://bobs.test/method2-overall.html?outlet=1');await page.waitForFunction(()=>document.querySelectorAll('#usageRows tr').length===1);
 assert.match(await page.locator('#usageRows').textContent(),/80.00 ml.*200.00 ml.*280.00 ml/);
 // Delayed legacy COGS enhancement must not replace component-inclusive saved totals.
 await page.goto('https://bobs.test/cogs-outlet-analysis.html?outlet=1');
 await page.waitForFunction(()=>document.getElementById('analysisTable').textContent.includes('COGS / Day'));
 await page.waitForTimeout(1800);
 assert.equal(await page.getByRole('row').filter({hasText:'COGS / Day'}).locator('td').nth(2).textContent(),'₹51');
 assert.equal(await page.getByRole('row').filter({hasText:'Gross Profit / Day'}).locator('td').nth(2).textContent(),'₹29');
 await page.goto('https://bobs.test/outlet-analysis.html');
 await page.waitForFunction(()=>document.getElementById('analysisTable').textContent.includes('Purchase Cost / Day'));
 assert.equal(await page.getByRole('row').filter({hasText:'Purchase Cost / Day'}).locator('td').nth(2).textContent(),'₹51');
 // Master persistence, read-back failure, shared rate reuse, and preservation.
 await page.goto('https://bobs.test/purchase-cost-editor.html?outlet=1&item=Idli&unit=piece');await page.waitForSelector('#editor:not([hidden])');
 assert.equal(await page.locator('#qty').inputValue(),'120');await page.locator('#total').fill('960');
 failWrites=true;await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('not confirmed'));assert.equal(db['1/METHOD2/default'].purchaseMasters.idli.total,'840');failWrites=false;
 await page.locator('#save').click();await page.waitForURL('**/method2.html?outlet=1');
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await page.goto(itemUrl);await page.waitForSelector('#editor:not([hidden])');
 assert.equal(await page.locator('#purchaseInputs').getByLabel('Total supplier price ₹ for this quantity',{exact:true}).inputValue(),'960');
 assert.match(await page.locator('#costs .line').first().textContent(),/9.50/);
 db['1/METHOD2/default'].purchaseMasters.idli.total='1080';
 await page.locator('#price').fill('16');await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('purchase master changed elsewhere'));
 assert.equal(db['1/METHOD2/default'].purchaseMasters.idli.total,'1080');
 page.once('dialog',dialog=>dialog.accept());
 await page.goto('https://bobs.test/purchase-cost-editor.html?outlet=1&item=Idli%20Sambar&unit=L');await page.waitForSelector('#editor:not([hidden])');
 await page.locator('#basis').selectOption('batch');await page.locator('#qty').fill('10');await page.locator('#total').fill('600');
 await page.locator('#save').click();await page.waitForURL('**/method2.html?outlet=1');
 await page.goto(itemUrl);await page.waitForSelector('#editor:not([hidden])');
 await page.locator('#condiments').getByLabel('Cost source').selectOption('purchase');
 assert.match(await page.locator('#condiments .side-cost').textContent(),/1.20/);
 assert.equal(await page.locator('#condiments').getByLabel('Quantity in this priced unit / batch',{exact:true}).inputValue(),'10');
 page.once('dialog',dialog=>dialog.accept());await page.goto(sideUrl.replace('mode=production','mode=purchased'));await page.waitForSelector('#editor:not([hidden])');
 assert.equal(await page.locator('#purchaseInputs').getByLabel('Total supplier price ₹ for this quantity',{exact:true}).inputValue(),'600');
 assert.match(await page.locator('#costs .line').first().textContent(),/13.30/);
 assert.equal(db['1/METHOD2/default'].custom,'KEEP');assert.equal(db['2/METHOD2/default'].custom,'OTHER OUTLET');assert.deepEqual(db['COMPANY/RECIPE_MASTER/STANDARD_V1'].recipes,originalRecipes);
 await page.goto(itemUrl);await page.waitForSelector('#editor:not([hidden])');
 await page.locator('#m2SideChecks input[value="Idli Sambar"]').uncheck();
 assert.equal(await page.locator('#condiments > .component').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: batch purchase normalization, four hybrid modes, 200 ml ORIGINAL recipe, included + separately sold sambar, margin, all-mode UUWP, whole packaging, stable catalogue indices, shared Purchase Master, read-back failure and cache-free reload; no recipe overwrite.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
