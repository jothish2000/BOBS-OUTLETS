const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
test('current review gives named save action while historical roadmap stays collapsed',async()=>{
 const dom=new JSDOM('<main><input id="review" type="checkbox"><button id="save">Save Rasipuram expenses & review Gurusamypalayam →</button><p id="status"></p></main><aside id="bobsCompanion"><div id="guide"></div></aside>',{runScripts:'outside-only',url:'https://bobs.test/outlet-plan.html?outlet=1'}),w=dom.window;
 try{
 let phase='review';w.HTMLElement.prototype.scrollIntoView=function(){};
 w.BOBS_OUTLET_PLAN_GUIDE={snapshot:()=>({phase,name:'Rasipuram',title:'Expenses and mandatory staff',review:'#review',save:'#save',saveLabel:w.document.getElementById('save').textContent,message:'Saving expenses and verifying Google',next:'After verification, review Gurusamypalayam.'})};
 w.eval(fs.readFileSync('bobs-guide-bot.js','utf8'));
 const host=w.document.getElementById('guide');w.BOBS_GUIDE_BOT.mount(host,{journey:true,minimise(){},snapshot:()=>({ctx:{page:'outlet-plan.html',outlet:'1'},progress:{status:'ready'},savedChecklist:{name:'Rasipuram',stages:[{title:'Method selection',status:'done'},{title:'Menu and capacity',status:'review'}]}})});
 assert.equal(host.querySelector('[data-saved-progress]').open,false);
 phase='reviewed';w.document.getElementById('review').dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,60));
 assert.match(host.textContent,/Rasipuram.*Expenses and mandatory staff/);assert.match(host.textContent,/✓ Review confirmed/);assert.match(host.textContent,/Next: click “Save Rasipuram expenses/);
 assert.equal(host.querySelector('[data-saved-progress]').open,false);
 phase='saving';w.document.getElementById('status').textContent='Saving';await new Promise(r=>setTimeout(r,60));assert.match(host.textContent,/Saving and verifying in Google/);
 phase='error';w.document.getElementById('status').textContent='Failed';await new Promise(r=>setTimeout(r,60));assert.match(host.textContent,/could not be completed/);assert.doesNotMatch(host.textContent,/✓ Review confirmed/);
 }finally{w.close();}
});
