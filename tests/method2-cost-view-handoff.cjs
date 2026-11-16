'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require(process.env.JSDOM_PATH || 'jsdom');

const outlet = 'fixture A & B', cat = 'Breakfast Catalogue';
const recipes = [
  {name:'Idli', yieldQty:120, yieldUnit:'piece', ingredients:[['Rice',2,'kg',50],['LPG',1,'batch',30]]},
  {name:'Idli Sambar', yieldQty:1, yieldUnit:'L', ingredients:[['Dal',1,'kg',40]]},
  {name:'Coconut Chutney', yieldQty:1, yieldUnit:'kg', ingredients:[['Coconut',1,'kg',60]]}
];
const none = () => ({packingMode:'none', packaging:[], packingPer:1});
const read = file => fs.readFileSync(file, 'utf8');

function page(file, url, records, writes) {
  const w = new JSDOM(read(file), {url, runScripts:'outside-only'}).window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.BOBS_DATA = {
    async jsonp({outletId,module,recordKey}) {
      const value = records.get(JSON.stringify([outletId,module,recordKey]));
      return {ok:true, found:value!==undefined, data:structuredClone(value)};
    },
    async saveModule(o,m,k,v) {
      writes.push([o,m,k]);
      records.set(JSON.stringify([o,m,k]),structuredClone(v));
    }
  };
  w.eval(read('shared_data.js')+';window.ITEM_DATA=ITEM_DATA;window.CAT_ORDER=CAT_ORDER');
  for(const f of ['method2-core.js','bobs-number-format.js','bobs-cost-flow.js',
                  'bobs-outlet-flow-core.js','bobs-cost-detail-links.js']) w.eval(read(f));
  w.BOBS_OPERATIONAL_RECIPES = {load:async()=>({recipes})};
  return w;
}
async function ready(check, diagnostic) {
  for(let i=0;i<80;i++){if(check())return;await new Promise(resolve=>setTimeout(resolve,5));}
  assert.fail(diagnostic());
}

test('confirmed Idli result links to its dated food and side evidence, without charging a changed recipe or another outlet',async()=>{
  const records = new Map(), writes = [];
  const from = new URL('https://bobs.test/method2-overall.html');
  from.searchParams.set('outlet',outlet);
  const overall = page('method2-overall.html',from.href,records,writes);
  const pages = [overall];
  try {
    const M=overall.M2, item=overall.ITEM_DATA[cat][0], key=JSON.stringify([outlet,'METHOD2','default']);
    const initial=M.state({selection:{[cat]:{indices:[0]}},orderPacking:{enabled:false}});
    records.set(key,structuredClone(initial));
    const d=M.draft(initial,cat,0,item);
    Object.assign(d,{mode:'production',price:12,batchSize:120,batches:1,sold:100,unit:'piece',capacity:120,
      packingSchemaVersion:3, mainPacking:none(),commonPacking:none(),condiments:[
        {...none(),recipeName:'Idli Sambar',source:'recipe',portion:20,portionUnit:'ml'},
        {...none(),recipeName:'Coconut Chutney',source:'recipe',portion:10,portionUnit:'g'}
      ]});
    const saved=await M.saveItem(outlet,cat,0,item,d,initial,recipes);
    const savedEvidence=saved.commercial[M.keys(cat,0).k].costEvidence;
    assert.equal(savedEvidence.direct,270);
    assert.equal(savedEvidence.main,130);
    assert.deepEqual(Array.from(savedEvidence.sides,x=>x.food),[80,60]);
    assert.deepEqual(writes.map(x=>x[1]),['METHOD2_BACKUPS','METHOD2']);
    overall.BOBS_OPERATIONAL_RECIPES.load=async()=>({recipes:recipes.map(r=>({...r,ingredients:r.ingredients.map(row=>[...row.slice(0,3),9999])}))});
    overall.eval(read('method2-order-packing.js'));
    overall.eval(read('method2-overall.js'));
    await ready(()=>overall.document.querySelector('a[href*="daily-cost-details.html"]'),()=>overall.document.body.textContent);
    const link=overall.document.querySelector('a[href*="daily-cost-details.html"]');
    const url=new URL(link.href);
    assert.deepEqual(['outlet','cat','i','date','returnTo'].map(k=>url.searchParams.get(k)),[outlet,cat,'0',savedEvidence.date,from.href]);
    const open=async (section,date=savedEvidence.date,outletId=outlet)=>{
      const target=new URL(url);target.searchParams.set('section',section);target.searchParams.set('date',date);target.searchParams.set('outlet',outletId);
      const w=page('daily-cost-details.html',target.href,records,writes);pages.push(w);
      w.BOBS_FULL_COST={load:async()=>({error:'No fixture allocation available'})};
      w.eval(read('bobs-daily-cost-details.js'));
      await ready(()=>!w.document.getElementById('refresh').disabled,()=>w.document.body.textContent);
      return w.document.getElementById('content').textContent;
    };
    assert.match(await open('production'),/₹270\.00/);
    assert.match(await open('sides'),/Sambar.*₹80\.00.*Chutney.*₹60\.00/s);
    assert.match(await open('ingredients'),/Rice.*₹100\.00/s);
    assert.match(await open('utilities'),/LPG.*₹30\.00/s);
    const otherDay=await open('production','2000-01-01');
    assert.doesNotMatch(otherDay,/₹270\.00/);
    assert.match(otherDay,/No confirmed|unavailable/i);
    const otherOutlet=await open('ingredients',savedEvidence.date,'Empty outlet');
    assert.doesNotMatch(otherOutlet,/Rice|Dal|Coconut/);
    assert.match(otherOutlet,/No confirmed|unavailable/i);
    assert.equal(writes.length,2,'opening any cost link must never write an operational record');
  } finally {for(const w of pages)w.close();}
});
