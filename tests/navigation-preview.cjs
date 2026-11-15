const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const code=fs.readFileSync('bobs-window-return.js','utf8');
async function fixture(query=''){
 const dom=new JSDOM('<!doctype html><title>Outlet setup</title><main><label>Quantity<input id="quantity" value="360"></label><button id="next">Review next module</button></main>',{url:'https://bobs.test/outlets.html'+query,runScripts:'outside-only'});
 dom.window.eval(code);await new Promise(r=>setTimeout(r,0));return dom;
}
test('preview is absent normally, highlights actual clicks only when opted in and never exposes input values',async()=>{
 const plain=await fixture();assert.equal(plain.window.document.getElementById('bobsClickPreview'),null);plain.window.close();
 const dom=await fixture('?preview=1'),w=dom.window,d=w.document;
 try{const field=d.getElementById('quantity');field.dispatchEvent(new w.Event('pointerdown',{bubbles:true}));assert(field.classList.contains('bobs-preview-target'));const banner=d.getElementById('bobsClickPreview');assert.match(banner.textContent,/Clicked.*Quantity/);assert.doesNotMatch(banner.textContent,/360/);assert.equal(field.value,'360');assert.equal(w.sessionStorage.getItem('bobs-navigation-preview'),'1');
 banner.querySelector('button').click();d.getElementById('next').dispatchEvent(new w.Event('pointerdown',{bubbles:true}));assert.equal(d.querySelector('.bobs-preview-target'),null);assert.equal(w.sessionStorage.getItem('bobs-navigation-preview'),'0');
 }finally{w.close()}
});
test('preview DOM settles with the shared review and guide observers active',async()=>{
 const dom=await fixture('?preview=1'),w=dom.window,d=w.document;
 try{w.HTMLElement.prototype.scrollIntoView=function(){};
 const aside=d.createElement('aside');aside.id='bobsCompanion';const host=d.createElement('div');aside.append(host);d.body.append(aside);
 w.eval(fs.readFileSync('bobs-guided-review.js','utf8'));w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));
 w.BOBS_GUIDE_BOT.mount(host,{snapshot:()=>({ctx:{page:'outlets.html'},progress:{status:'idle'}}),minimise(){}});
 let events=0;w.addEventListener('bobs-review-context',()=>events++);d.getElementById('next').dispatchEvent(new w.Event('pointerdown',{bubbles:true}));
 await new Promise(r=>setTimeout(r,180));const settled=events;await new Promise(r=>setTimeout(r,180));assert.equal(events,settled,'no self-triggered review/preview loop at idle');assert(events<10);
 }finally{w.close()}
});
