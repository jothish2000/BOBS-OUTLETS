const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require(process.env.JSDOM_PATH || 'jsdom');
const K = require('../bobs-roadmap-core.js');
const source = name => fs.readFileSync(name,'utf8');
const rootUrl = 'https://bobs.test/projects/shops/';

async function load(w) {
  let writes = 0;
  w.BOBS_DATA = {
    saveModule(){writes++;throw Error('Unexpected Google write')},
    jsonp:async()=>({ok:true,found:false})
  };
  w.BOBS_REFERENCE = {};
  w.BOBS_REVIEW = {snapshot:()=>null};
  w.BOBS_PAGE_GUIDANCE = {snapshot:()=>null};
  w.BOBS_WINDOW_RETURN = {};
  w.eval(source('bobs-roadmap-core.js'));
  w.eval(source('bobs-guide-bot.js'));
  w.eval(source('bobs-roadmap.js'));
  for(let i=0;i<3;i++) await new Promise(resolve=>setImmediate(resolve));
  return ()=>writes;
}

function fill(w, file){
  w.document.open();
  w.document.write(source(file));
  w.document.close();
  w.HTMLElement.prototype.scrollIntoView = ()=>{};
}
test('cross-origin hosted kitchen has mouse controls for progress and guide without host DOM permission', async()=>{
  const host = new JSDOM('<iframe id="preview"></iframe>',{url:'https://workspace.test/annotate',runScripts:'outside-only'});
  try {
    const frame = host.window.document.getElementById('preview');
    frame.src = rootUrl+'kitchen-flow?stage=locations&outlet=1';
    const w = frame.contentWindow;
    fill(w,'kitchen-flow.html');
    Object.defineProperty(w,'frameElement',{get(){throw new w.DOMException('Cross-origin preview','SecurityError')}});
    const writes = await load(w);
    assert.equal(w.document.body.dataset.bobsGuidePage,'kitchen-flow.html');
    const control=id=>w.document.getElementById(id);
    const progress=control('bobsRoadmapToggle'), roadmap=control('bobsRoadmap');
    progress.click();assert.equal(roadmap.hidden,false);
    roadmap.querySelector('[aria-label="Close BOBS roadmap"]').click();assert.equal(roadmap.hidden,true);
    const launcher=control('bobsCompanionToggle'),guide=control('bobsCompanion');
    if(!guide.hidden) guide.querySelector('.companion-head button').click();
    launcher.click();assert.equal(guide.hidden,false);
    assert.match(guide.textContent,/kitchen|production/i);
    guide.querySelector('.companion-head button').click();assert.equal(guide.hidden,true);
    assert.equal(host.window.document.querySelector('#bobsRoadmapToggle,#bobsCompanionToggle'),null);
    assert.equal(writes(),0);
  } finally {host.window.close()}
});
test('actual outlet method child leaves its accessible parent responsible for both controls', async()=>{
  const host = new JSDOM('<iframe id="preview"></iframe>',{url:'https://workspace.test/annotate',runScripts:'outside-only'});
  try {
    const preview=host.window.document.getElementById('preview');
    preview.src=rootUrl+'outlet-method-flow?outlets=1,2&outlet=0';
    const w=preview.contentWindow;
    fill(w,'outlet-method-flow.html');
    const parentWrites=await load(w);
    const frame=w.document.getElementById('methodFrame');
    frame.src=rootUrl+'method2?outlet=1&flow=1';
    const child=frame.contentWindow;
    fill(child,'method2.html');
    const childWrites=await load(child);
    for (const id of ['bobsRoadmapToggle','bobsCompanionToggle']) {
      assert.equal(w.document.querySelectorAll('#'+id).length,1);
      assert.equal(child.document.getElementById(id),null);
    }
    assert.equal(parentWrites()+childWrites(),0);
  } finally {host.window.close()}
});
test('both URLs give identical roadmap context and reject parent URLs outside the app',()=>{
  const ext=rootUrl+'outlet-method-flow?outlet=0&outlets=1,2';
  const byFile=ext.replace('outlet-method-flow?','outlet-method-flow.html?');
  assert.deepEqual(K.context(ext,rootUrl,[rootUrl+'method2?outlet=2']),K.context(byFile,rootUrl,[rootUrl+'method2.html?outlet=2']));
  for(const value of ['https://other.test/kitchen-flow?outlet=4','https://bobs.test/elsewhere/kitchen-flow?outlet=5','https://test@bobs.test/projects/shops/kitchen-flow?outlet=6']){
    const result=K.context(rootUrl+'method2-item?returnTo='+encodeURIComponent(value),rootUrl);
    assert.equal(result.outlet,'');assert.deepEqual(result.chain,['method2-item.html']);
  }
});
test('extensionless kitchen route shows the saved status of the same project page',()=>{
  const dom=new JSDOM('',{url:rootUrl+'kitchen-flow?stage=locations',runScripts:'outside-only'});
  try {
    const w=dom.window;
    w.eval(source('bobs-guide-bot.js'));
    const here={title:'Kitchen registration',status:'done',href:'kitchen-flow.html?stage=locations'};
    const other={title:'Other project',status:'review',href:'/other/kitchen-flow.html?stage=locations'};
    const state={ctx:{outlet:'1'},progress:{status:'ready'},savedChecklist:{owner:'1',stages:[here,other]}};
    assert.equal(w.BOBS_GUIDE_BOT.savedPageContext(state,w.location.href).current,here);
  } finally {dom.window.close()}
});
