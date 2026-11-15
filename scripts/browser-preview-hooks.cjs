/* Optional test-runner recording; never loaded by the business app. */
const path=require('node:path'),fs=require('node:fs'),{chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch({...options,slowMo:Number(process.env.BOBS_TEST_SLOW_MS)||150});
 const create=browser.newContext.bind(browser);let index=0;
 browser.newContext=async options=>{
  const dir=path.join(process.env.BOBS_PREVIEW_DIR||'navigation-preview',path.basename(process.argv[1],'.cjs')+'-'+(++index));fs.mkdirSync(dir,{recursive:true});
  const context=await create({...options,recordVideo:{dir,size:{width:1280,height:900}}});
  await context.addInitScript(()=>{try{sessionStorage.setItem('bobs-navigation-preview','1')}catch(_){}});
  return context;
 };
 return browser;
};
