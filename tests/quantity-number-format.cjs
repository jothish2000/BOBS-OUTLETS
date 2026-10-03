'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),N=require('../bobs-number-format.js');
for(const u of ['kg','KG','kgs','kilogram','kilograms','L','lt','ltr','litre','litres','liter','liters'])assert.equal(N.quantity(0.002,u),'0.002',u);
for(const u of ['g','gm','gms','gram','grams','piece','pieces','pc','pcs','dozen','dozens','carton','cartons','pack','box','set']){assert.equal(N.quantity(120,u),'120',u);assert.equal(N.quantity(12.4,u),'12',u);}
assert.equal(N.quantity(1.6,'kg'),'1.600');assert.equal(N.quantity(0.48,'L'),'0.480');
for(const x of [null,undefined,'',NaN,Infinity,'invalid'])assert.equal(N.quantity(x,'kg'),'—');
assert.equal(N.quantity(0,'kg'),'0.000');assert.equal(N.quantity(0,'g'),'0');
assert.equal(N.quantity(1.234567,'ml'),'1.234567');assert.equal(N.quantity(1.234567,'unrecognised'),'1.234567');
const recipe={ingredients:[['Fenugreek',0.0352,'kg',160],['Salt',0.49,'g',20]],yieldQty:120};
const before=JSON.stringify(recipe);recipe.ingredients.forEach(x=>N.quantity(x[1],x[2]));assert.equal(JSON.stringify(recipe),before);
const browser={};vm.runInNewContext(fs.readFileSync('bobs-number-format.js','utf8'),browser);assert.equal(browser.BOBS_NUMBERS.quantity(0.002,'L'),'0.002');
for(const path of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(path,'utf8');if(!/<head[^>]*>/i.test(html))continue;assert.match(html,/bobs-number-format\.js/,'formatter available: '+path);}
for(const path of fs.readdirSync('.').filter(x=>x.endsWith('.js')))new vm.Script(fs.readFileSync(path,'utf8'),{filename:path});
for(const path of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(path,'utf8');for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc\s*=|application\/ld\+json|application\/json/i.test(m[1]))continue;new vm.Script(m[2],{filename:path});}}
console.log('PASS quantity aliases, precision, unknown/zero, non-mutation, all page availability and root/inline syntax');
