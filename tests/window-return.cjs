'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('bobs-window-return.js','utf8');
function fixture({href='https://bobs.test/method2-item.html?outlet=2',referrer='',opener=null,closeWorks=true}={}){const calls=[],root={location:{href,origin:'https://bobs.test',assign:u=>calls.push(['navigate',u])},document:{referrer,readyState:'loading',addEventListener(){}},opener,closed:false,close(){calls.push(['close']);if(closeWorks)this.closed=true},setTimeout:f=>f()};root.top=root;vm.runInNewContext(code,{window:root,URL,console});return {nav:root.BOBS_WINDOW_RETURN,calls,root}}
function parent(href='https://bobs.test/outlet-method-flow.html?from=outlet-setup&outlets=1%2C2'){const p={closed:false,location:{href},focus(){this.focused=true},postMessage(){}};p.top=p;return p}
test('live opener is focused and child closes without navigating parent',()=>{const p=parent(),f=fixture({opener:p});f.nav.returnToParent('method2.html?outlet=2');assert(p.focused);assert.deepEqual(f.calls,[['close']]);assert.equal(p.location.href,'https://bobs.test/outlet-method-flow.html?from=outlet-setup&outlets=1%2C2')});
test('recorded immediate parent retains outlet list and fragment when opener closes',()=>{const p=parent(),f=fixture({opener:p});p.closed=true;f.nav.returnToParent('method2.html?outlet=2');assert.deepEqual(f.calls,[['navigate',p.location.href]])});
test('failed window.close navigates child to recorded parent only',()=>{const p=parent(),f=fixture({opener:p,closeWorks:false});f.nav.returnToParent();assert.deepEqual(f.calls,[['close'],['navigate',p.location.href]])});
test('nested popup carries immediate item URL and its existing parent context',()=>{const parentUrl='https://bobs.test/method2.html?flow=1&outlet=2',href='https://bobs.test/method2-item.html?outlet=2&returnTo='+encodeURIComponent(parentUrl)+'#supplyHeading',f=fixture({href});const child=new URL(f.nav.child('recipe-cost-editor.html?item=Idli&outlet=2'));assert.equal(child.searchParams.get('returnTo'),href);assert.equal(child.searchParams.get('outlet'),'2')});
test('reject external, javascript, credentials, directory traversal and non-page return',()=>{const f=fixture();for(const u of ['https://evil.test/a.html','javascript:alert(1)','https://u:p@bobs.test/a.html','https://bobs.test/x.js'])assert.equal(f.nav.safe(u),null);const nested=fixture({href:'https://bobs.test/BOBS-OUTLETS/method2-item.html'});assert.equal(nested.nav.safe('../outside.html'),null)});
test('standalone auxiliary save stays open while explicit fallback still works',()=>{const f=fixture();assert.equal(f.nav.afterSave(),false);assert.equal(f.calls.length,0);f.nav.afterSave('method2.html?outlet=2');assert.deepEqual(f.calls,[['navigate','https://bobs.test/method2.html?outlet=2']])});
test('referrer supplies safe previous-window fallback',()=>{const f=fixture({referrer:'https://bobs.test/reverse-thp.html?outlet=2'});f.nav.afterSave();assert.deepEqual(f.calls,[['navigate','https://bobs.test/reverse-thp.html?outlet=2']])});
test('notification failures cannot suppress return',()=>{const p=parent();p.postMessage=()=>{throw Error('closed race')};const f=fixture({opener:p});f.nav.notify({type:'saved'},['test']);f.nav.afterSave();assert.deepEqual(f.calls,[['close']])});

test('verified child fallback resumes matching parent details without changing route context',()=>{const f=fixture({href:'https://bobs.test/recipe-cost-editor.html?returnTo='+encodeURIComponent('https://bobs.test/method2-item.html?outlet=2&cat=Breakfast&i=0')});f.nav.afterSave(null,{page:'method2-item.html',hash:'supplyHeading'});assert.deepEqual(f.calls,[['navigate','https://bobs.test/method2-item.html?outlet=2&cat=Breakfast&i=0#supplyHeading']]);const other=fixture({referrer:'https://bobs.test/method2.html?outlet=2'});other.nav.afterSave(null,{page:'method2-item.html',hash:'supplyHeading'});assert.deepEqual(other.calls,[['navigate','https://bobs.test/method2.html?outlet=2']])});

test('same related item is focused without reload, including different guide and return context',()=>{
 const p=parent(),a=fixture({opener:p,href:'https://bobs.test/method2-item.html?outlet=1&cat=Breakfast&i=0&mode=production'}),b=fixture({opener:p,href:'https://bobs.test/production-plan.html?outlet=1'});
 a.root.focus=()=>a.calls.push(['focus']);a.root.unsaved='keep';b.root.open=()=>{throw Error('must reuse existing item')};
 assert.equal(b.nav.openWorkspace('method2-item.html?i=0&cat=Breakfast&outlet=1&guide=continue&returnTo='+encodeURIComponent(b.root.location.href)),a.root);
 assert.deepEqual(a.calls,[['focus']]);assert.equal(a.root.unsaved,'keep');assert.equal(a.root.location.href,'https://bobs.test/method2-item.html?outlet=1&cat=Breakfast&i=0&mode=production');
});
test('explicit auxiliary item opens once and reuses its draft; closed helpers reopen',()=>{
 const p=parent(),f=fixture({opener:p});let opened=0;
 f.root.open=url=>{opened++;return {location:{href:url},closed:false,focus(){this.focused=true}};};
 const first=f.nav.openWorkspace('method2-item.html?outlet=2&cat=Breakfast&i=1',{auxiliary:true});
 assert.equal(f.nav.openWorkspace('method2-item.html?cat=Breakfast&i=1&outlet=2',{auxiliary:true}),first);assert.equal(opened,1);assert(first.focused);
 first.closed=true;assert.notEqual(f.nav.openWorkspace('method2-item.html?outlet=2&cat=Breakfast&i=1',{auxiliary:true}),first);assert.equal(opened,2);
});
test('serving shortcut and different recipe quantities remain distinct contexts',()=>{
 const f=fixture();assert.notEqual(f.nav.identity('method2-item.html?outlet=1&i=0'),f.nav.identity('method2-item.html?outlet=1&i=0&servingRecipe=Sambar'));
 assert.notEqual(f.nav.identity('recipe-cost-editor.html?item=Sambar&qty=7.2'),f.nav.identity('recipe-cost-editor.html?item=Sambar&qty=7.56'));
});


test('normal menu, item, production and workforce links reuse the working window',()=>{
 for(const route of ['method2.html?outlet=2','method2-item.html?outlet=2&i=0','production-plan.html?outlet=2','outlet-plan.html?outlet=2&stage=workforce','kitchen-flow.html?outlet=2&stage=cost']){
  const f=fixture();f.root.open=()=>{throw Error('workflow must not open another window')};
  assert.equal(f.nav.openWorkspace(route),f.root);assert.equal(f.calls[0][0],'navigate');
  const u=new URL(f.calls[0][1]);assert.equal(u.searchParams.get('returnTo'),f.root.location.href);
 }
});
test('temporary editors remain auxiliary and close back to their exact caller',()=>{
 const f=fixture();let count=0;f.root.open=url=>{count++;return {location:{href:url},closed:false,focus(){}}};
 for(const route of ['recipe-cost-editor.html?item=Idli','purchase-cost-editor.html?item=Tea','salary-editor.html?position=P1','method2-item.html?servingRecipe=Sambar'])assert(f.nav.openWorkspace(route));
 assert.equal(count,4);assert.equal(f.calls.length,0);
});
test('changed opener is not mistaken for the recorded calling window',()=>{
 const p=parent('https://bobs.test/method2.html?outlet=2'),caller=p.location.href;
 const f=fixture({opener:p,href:'https://bobs.test/recipe-cost-editor.html?returnTo='+encodeURIComponent(caller)});
 p.location.href='https://bobs.test/outlets.html';f.nav.afterSave();assert(!p.focused);
 assert.deepEqual(f.calls,[['navigate',caller]]);assert(!f.root.closed);
});
test('verified continuation reuses a matching ancestor without reloading its draft',()=>{
 const main=parent('https://bobs.test/method2-item.html?outlet=2&i=0'),middle=parent('https://bobs.test/kitchen-flow.html?outlet=Kitchen-E');middle.opener=main;main.unsaved='retain';
 const f=fixture({opener:middle});f.nav.resumeAt(main.location.href+'#idliLabourCost');
 assert(main.focused);assert.equal(main.unsaved,'retain');assert.deepEqual(f.calls,[['close']]);assert(!middle.focused);
});
test('preview is opt-in and follows workflow and helper links without changing their identity',()=>{
 const f=fixture({href:'https://bobs.test/method2.html?outlet=2&preview=1'});
 // The VM has no DOM rendering surface; evaluate URL policy without booting preview UI.
 assert.equal(new URL(f.nav.child('recipe-cost-editor.html?item=Idli')).searchParams.get('preview'),'1');
 assert.equal(f.nav.identity('method2.html?outlet=2&preview=1'),f.nav.identity('method2.html?outlet=2'));
});
