const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function fixture(){
 let data={pricing:{'Breakfast::0':{currentPrice:10}},itemEditors:{'Breakfast::0':{price:9,condiments:[],packaging:[]}},selection:{Breakfast:{indices:[0]}}},failBackup=false;
 const snapshots={},writes=[];
 const copy=x=>JSON.parse(JSON.stringify(x));
 const context={console,setTimeout,ITEM_DATA:{Breakfast:[{name:'Idli',price:10,baseUnit:'piece'}]},BOBS_DATA:{
 async jsonp({module,recordKey,action}){if(action==='moduleList')return {ok:true,records:Object.entries(snapshots).map(([key,data])=>({key,data:copy(data)}))};return {ok:true,data:copy(module==='METHOD2'?data:snapshots[recordKey]??null),found:module==='METHOD2'||!!snapshots[recordKey]};},
 async saveModule(outlet,module,key,value){if(module==='METHOD2_BACKUPS'&&failBackup)throw Error('Backup unavailable');writes.push(module);if(module==='METHOD2')data=copy(value);else snapshots[key]=copy(value);}
 }};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../method2-core.js'),'utf8'),context);
 return {m:context.M2,item:context.ITEM_DATA.Breakfast[0],snapshots,writes,get data(){return data},set data(x){data=x},fail(){failBackup=true}};
}
test('Selection saves price and selection together, preserves reference, mirrors editor and restores backup',async()=>{
 const f=fixture(),baseline=f.m.state(f.data);
 const saved=await f.m.saveSelection('1','Breakfast',[0],baseline,undefined,{0:12});
 assert.equal(saved.pricing['Breakfast::0'].currentPrice,12);assert.equal(saved.catalogueBasePrices['Breakfast::0'],10);
 assert.equal(f.m.draft(saved,'Breakfast',0,f.item).price,12);
 assert.deepEqual(f.writes,['METHOD2_BACKUPS','METHOD2']);
 const key=Object.keys(f.snapshots)[0];assert.equal(f.snapshots[key].data.pricing['Breakfast::0'].currentPrice,10);
 await f.m.restore('1',key,f.data);assert.equal(f.data.pricing['Breakfast::0'].currentPrice,10);assert.equal(Object.keys(f.snapshots).length,2);
});
test('Stale price and stale selection each block the entire combined save',async()=>{
 for(const kind of ['price','selection']){const f=fixture(),b=f.m.state(f.data);if(kind==='price')f.data.pricing['Breakfast::0'].currentPrice=14;else f.data.selection.Breakfast.indices=[];
 await assert.rejects(f.m.saveSelection('1','Breakfast',[0],b,undefined,{0:12}),/changed/);assert.equal(f.writes.length,0);}
});
test('Failed backup blocks operational write',async()=>{const f=fixture();f.fail();await assert.rejects(f.m.saveSellingPrices('1','Breakfast',{0:12},f.m.state(f.data)),/Backup unavailable/);assert.equal(f.data.pricing['Breakfast::0'].currentPrice,10);assert.equal(f.writes.length,0)});
test('Authoritative price overrides stale draft and repeated saves retain catalogue base',async()=>{const f=fixture();assert.equal(f.m.draft(f.m.state(f.data),'Breakfast',0,f.item).price,10);await f.m.saveSellingPrices('1','Breakfast',{0:12},f.m.state(f.data));await f.m.saveSellingPrices('1','Breakfast',{0:15},f.m.state(f.data));assert.equal(f.data.catalogueBasePrices['Breakfast::0'],10)});
test('Invalid prices and indices do not write',async()=>{for(const prices of [{0:''},{0:-1},{'0.5':12}]){const f=fixture();await assert.rejects(f.m.saveSellingPrices('1','Breakfast',prices,f.m.state(f.data)),/valid/);assert.equal(f.writes.length,0)}});
test('Blank untouched catalogue prices allow selection-only saves',async()=>{const f=fixture();f.item.price='';f.data={};await f.m.saveSelection('1','Breakfast',[0],f.m.state(f.data),undefined,{});assert.equal(f.data.pricing['Breakfast::0'],undefined)});
test('Item Editor saves shared price, preserves reference and rejects invalid price',async()=>{
 const f=fixture(),d={mode:'purchased',unit:'piece',purchase:{basis:'unit',qty:1,unit:'piece',supplyUnit:'piece',total:4},batches:20,sold:10,price:13,markup:25,spoilage:5,uuwp:5,condiments:[],packaging:[],packingMode:'none'};
 await f.m.saveItem('1','Breakfast',0,f.item,d,f.m.state(f.data),[]);
 assert.equal(f.m.currentPrice(f.data,'Breakfast',0,f.item),13);assert.equal(f.data.catalogueBasePrices['Breakfast::0'],10);
 await assert.rejects(f.m.saveItem('1','Breakfast',0,f.item,{...d,price:''},f.m.state(f.data),[]),/valid current selling price/);
});
