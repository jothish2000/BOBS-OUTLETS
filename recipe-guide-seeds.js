(function(root){'use strict';

const STD_VERSION='2026-09-SMALL-OUTLET-V1';
const R={
  rice:55,urad:140,gram:90,wheat:48,maida:50,oil:140,milk:62,sugar:48,egg:7,bread:4,
  onion:55,tomato:45,potato:35,curd:70,spice:220,tea:420,coffee:650,lemon:80,
  coconut:120,veg:60,paneer:360,mushroom:180,ghee:650,rava:55,moong:120,toor:170,
  peanut:150,chanaDal:100,mint:120,plantain:55,bajjiChilli:80,roastedGram:120,
  commercialLpg:2916.50/19,electricity:11,water:1
};
const ing=(n,q,u,r)=>[n,q,u,r];
const lpg=q=>ing('LPG fuel',q,'kg',R.commercialLpg);
const power=q=>ing('Electricity',q,'kWh',R.electricity);
const t=(pre,setup,active,machine,finish,clean,role,equipment,parallel=true,preNote='')=>({
  prePreparationMin:pre,setupMin:setup,activeMinPerCycle:active,machineMinPerCycle:machine,
  finishMinPerCycle:finish,cleanupMin:clean,role,equipment,canParallelize:parallel,prePreparationNote:preNote
});
function rec(name,cat,y,unit,ingredients,extra={}){
  return {
    name,kind:'PRIMARY',category:cat,yieldQty:y,yieldUnit:unit,ingredients,
    guideAssumption:true,standardVersion:STD_VERSION,standardSource:'BOBS_SMALL_OUTLET',
    guideDailyQty:y,
    guideNote:'Small-outlet opening batch. Quantities, RM rates, cooked yield, oil absorption and energy use are planning standards; calibrate against actual outlet production before locking.',
    ...extra
  };
}
function condiment(name,y,unit,ingredients,extra={}){
  return {
    name,kind:'CONDIMENT',category:'CONDIMENT',yieldQty:y,yieldUnit:unit,ingredients,
    guideAssumption:false,standardVersion:STD_VERSION,standardSource:'BOBS_SMALL_OUTLET',
    guideDailyQty:y,
    guideNote:'BOBS small-outlet standard condiment batch. Preserve actual outlet rates and recalibrate cooked yield/energy after trial production.',
    ...extra
  };
}
function snack(n){
  const nm=String(n||'').toLowerCase();
  let y=30, unit='pieces', a=[], tim=t(0,10,20,15,5,10,'Vada / Snack Master','Frying kadai',false), fuel={type:'LPG'};
  if(nm==='vada'){
    y=50;
    a=[ing('Urad dal',1.0,'kg',R.urad),ing('Ginger',.04,'kg',160),ing('Green chilli',.035,'kg',100),
       ing('Curry leaves',.02,'kg',80),ing('Cumin / pepper',.018,'kg',350),ing('Asafoetida',.003,'kg',700),
       ing('Salt',.025,'kg',20),ing('Cooking oil - frying consumption',.45,'L',R.oil),lpg(.20)];
    tim=t(240,15,30,25,5,15,'Vada / Snack Master','Wet grinder + frying kadai',false,'Soak urad dal 3-4 hours before grinding.');
  } else if(nm==='bonda'){
    y=50;
    a=[ing('Gram flour',1.15,'kg',R.gram),ing('Rice flour',.18,'kg',R.rice),ing('Onion',.25,'kg',R.onion),
       ing('Green chilli',.035,'kg',100),ing('Ginger',.03,'kg',160),ing('Curry leaves + coriander',.05,'kg',100),
       ing('Salt',.025,'kg',20),ing('Baking soda',.008,'kg',120),ing('Cooking oil - frying consumption',.50,'L',R.oil),lpg(.20)];
  } else if(/onion bajji/.test(nm)){
    a=[ing('Onion',.65,'kg',R.onion),ing('Gram flour',.45,'kg',R.gram),ing('Rice flour',.15,'kg',R.rice),
       ing('Chilli powder + turmeric + hing',.018,'kg',R.spice),ing('Salt + soda',.015,'kg',R.spice),
       ing('Cooking oil - frying consumption',.30,'L',R.oil),lpg(.16)];
  } else if(/vazhakkai|plantain|banana bajji/.test(nm)){
    a=[ing('Raw plantain / vazhakkai',.90,'kg',R.plantain),ing('Gram flour',.50,'kg',R.gram),ing('Rice flour',.10,'kg',R.rice),
       ing('Chilli powder + turmeric + hing',.018,'kg',R.spice),ing('Salt + soda',.015,'kg',R.spice),
       ing('Cooking oil - frying consumption',.32,'L',R.oil),lpg(.16)];
  } else if(/bread bajji/.test(nm)){
    a=[ing('Bread',15,'piece',R.bread),ing('Gram flour',.50,'kg',R.gram),ing('Rice flour',.10,'kg',R.rice),
       ing('Chilli powder + turmeric + hing',.018,'kg',R.spice),ing('Salt + soda',.015,'kg',R.spice),
       ing('Cooking oil - frying consumption',.35,'L',R.oil),lpg(.17)];
  } else if(/chilli bajji/.test(nm)){
    a=[ing('Bajji chilli',.70,'kg',R.bajjiChilli),ing('Gram flour',.55,'kg',R.gram),ing('Rice flour',.10,'kg',R.rice),
       ing('Chilli powder + turmeric + hing',.018,'kg',R.spice),ing('Salt + soda',.015,'kg',R.spice),
       ing('Cooking oil - frying consumption',.32,'L',R.oil),lpg(.16)];
  } else if(/aloo bajji/.test(nm)){
    a=[ing('Potato',.90,'kg',R.potato),ing('Gram flour',.50,'kg',R.gram),ing('Rice flour',.10,'kg',R.rice),
       ing('Chilli powder + turmeric + hing',.018,'kg',R.spice),ing('Salt + soda',.015,'kg',R.spice),
       ing('Cooking oil - frying consumption',.32,'L',R.oil),lpg(.16)];
  } else if(/aloo bonda/.test(nm)){
    a=[ing('Potato',1.25,'kg',R.potato),ing('Gram flour',.45,'kg',R.gram),ing('Onion',.20,'kg',R.onion),
       ing('Ginger + green chilli',.05,'kg',160),ing('Curry leaves + spices',.03,'kg',R.spice),
       ing('Cooking oil - frying consumption',.38,'L',R.oil),lpg(.18)];
    tim=t(20,15,25,20,5,10,'Vada / Snack Master','Boiling vessel + frying kadai',false);
  } else if(/egg bonda/.test(nm)){
    a=[ing('Egg',30,'piece',R.egg),ing('Gram flour',.55,'kg',R.gram),ing('Rice flour',.10,'kg',R.rice),
       ing('Spices + salt',.03,'kg',R.spice),ing('Cooking oil - frying consumption',.38,'L',R.oil),lpg(.20)];
    tim=t(20,10,25,20,5,10,'Vada / Snack Master','Boiling vessel + frying kadai',false);
  } else if(/sundal/.test(nm)){
    y=30; unit='servings';
    a=[ing(/green gram/.test(nm)?'Green gram':'White channa',1.20,'kg',120),ing('Onion',.25,'kg',R.onion),
       ing('Fresh coconut',.12,'kg',R.coconut),ing('Mustard + urad dal + chilli',.05,'kg',R.spice),
       ing('Salt',.025,'kg',20),ing('Cooking oil',.05,'L',R.oil),lpg(.10)];
    tim=t(/channa/.test(nm)?360:480,15,20,25,5,10,'Cook / Snack Master','Pressure cooker / stock pot',true,'Soak pulses before cooking.');
  } else if(/boiled egg/.test(nm)){
    y=30; a=[ing('Egg',30,'piece',R.egg),lpg(.06)];
    tim=t(0,5,5,15,5,5,'Cook / Helper','Boiling vessel',true);
  } else if(/egg sandwich/.test(nm)){
    y=20;
    a=[ing('Bread',40,'piece',R.bread),ing('Egg',20,'piece',R.egg),ing('Onion + tomato',.60,'kg',R.veg),
       ing('Butter / spread',.20,'kg',300),ing('Seasoning',.03,'kg',R.spice),lpg(.06)];
    tim=t(0,10,30,10,5,10,'Cook / Snack Master','Tawa / sandwich grill',false);
  } else if(/cheese sandwich/.test(nm)){
    y=20;
    a=[ing('Bread',40,'piece',R.bread),ing('Cheese',.60,'kg',420),ing('Vegetables',.80,'kg',R.veg),
       ing('Butter / spread',.20,'kg',300),ing('Seasoning',.03,'kg',R.spice),power(.20)];
    tim=t(0,10,30,10,5,10,'Cook / Snack Master','Sandwich grill',false);
    fuel={type:'Electricity'};
  } else if(/bread omelette/.test(nm)){
    y=20;
    a=[ing('Bread',40,'piece',R.bread),ing('Egg',20,'piece',R.egg),ing('Onion + chilli',.40,'kg',R.veg),
       ing('Cooking oil',.15,'L',R.oil),ing('Salt + pepper',.025,'kg',R.spice),lpg(.08)];
    tim=t(0,10,30,15,5,10,'Cook / Snack Master','Tawa',false);
  } else if(/roll/.test(nm)){
    y=20;
    a=[ing('Wrapper / maida',20,'piece',5),ing(/egg/.test(nm)?'Egg':/mushroom/.test(nm)?'Mushroom':'Mixed vegetables',
       /egg/.test(nm)?20:1.40,/egg/.test(nm)?'piece':'kg',/egg/.test(nm)?R.egg:/mushroom/.test(nm)?R.mushroom:R.veg),
       ing('Onion + sauce + seasoning',.60,'kg',120),ing('Cooking oil',.18,'L',R.oil),lpg(.08)];
    tim=t(0,15,35,15,5,10,'Cook / Snack Master','Tawa',false);
  } else if(/puff/.test(nm)){
    y=20;
    a=[ing('Puff sheet / maida dough',1.50,'kg',90),ing(/egg/.test(nm)?'Egg':/mushroom/.test(nm)?'Mushroom':'Mixed vegetables',
       /egg/.test(nm)?10:.80,/egg/.test(nm)?'piece':'kg',/egg/.test(nm)?R.egg:/mushroom/.test(nm)?R.mushroom:R.veg),
       ing('Onion + seasoning',.35,'kg',R.veg),power(.80)];
    tim=t(0,15,30,25,10,10,'Cook / Bakery Helper','Oven',true);
    fuel={type:'Electricity'};
  } else if(/grilled sandwich|^sandwich$/.test(nm)){
    y=20;
    a=[ing('Bread',40,'piece',R.bread),ing('Mixed vegetables',1.0,'kg',R.veg),ing('Butter / spread',.20,'kg',300),
       ing('Seasoning / chutney',.12,'kg',180),power(.20)];
    tim=t(0,10,30,10,5,10,'Cook / Snack Master','Sandwich grill',false); fuel={type:'Electricity'};
  } else if(/kachori/.test(nm)){
    y=30;
    a=[ing('Maida',.75,'kg',R.maida),ing('Dal / spice filling',.55,'kg',120),ing('Spices',.04,'kg',R.spice),
       ing('Cooking oil - frying consumption',.35,'L',R.oil),lpg(.17)];
    tim=t(30,15,35,20,5,10,'Vada / Snack Master','Frying kadai',false,'Rest prepared dough/filling before frying.');
  } else if(/samosa/.test(nm)){
    y=30;
    a=[ing('Maida',.75,'kg',R.maida),ing(/onion/.test(nm)?'Onion filling':'Potato filling',1.0,'kg',/onion/.test(nm)?R.onion:R.potato),
       ing('Spices',.05,'kg',R.spice),ing('Cooking oil - frying consumption',.35,'L',R.oil),lpg(.17)];
    tim=t(20,15,40,20,5,10,'Vada / Snack Master','Frying kadai',false);
  } else if(/jalebi/.test(nm)){
    y=1.5; unit='kg';
    a=[ing('Maida',.50,'kg',R.maida),ing('Sugar',.75,'kg',R.sugar),ing('Curd / ferment starter',.08,'kg',R.curd),
       ing('Cooking oil - frying consumption',.30,'L',R.oil),lpg(.18)];
    tim=t(120,10,30,20,10,10,'Sweet / Snack Master','Frying kadai',false,'Rest/ferment batter before frying.');
  } else {
    y=30;
    a=[ing('Primary base / flour',.75,'kg',R.gram),ing('Vegetable / filling',.75,'kg',R.veg),
       ing('Spices + salt',.04,'kg',R.spice),ing('Cooking oil',.30,'L',R.oil),lpg(.15)];
  }
  return rec(n,'SNACK',y,unit,a,{productionTiming:tim,fuel});
}

function beverage(n,hot){
  const nm=String(n||'').toLowerCase();
  let y=hot?20:10, unit='cups', a=[], tim, fuel;
  if(hot){
    tim=t(0,5,10,10,2,5,'Tea Master','Tea boiler / saucepan',true); fuel={type:'LPG'};
    if(/green tea|black tea|lemon tea/.test(nm)){
      a=[ing('Water',2.4,'L',R.water),ing('Tea powder / tea bags',.05,'kg',R.tea),
         ...(/lemon/.test(nm)?[ing('Lemon',.25,'kg',R.lemon)]:[]),ing('Sugar',.25,'kg',R.sugar),lpg(.035)];
    } else if(/tea/.test(nm)){
      a=[ing('Milk',1.6,'L',R.milk),ing('Water',.8,'L',R.water),ing('Tea powder',/strong/.test(nm)?.07:.06,'kg',R.tea),
         ing('Sugar',.32,'kg',R.sugar),...(/ginger/.test(nm)?[ing('Ginger',.06,'kg',160)]:[]),
         ...(/masala/.test(nm)?[ing('Tea masala / ginger / cardamom',.04,'kg',450)]:[]),lpg(.05)];
    } else if(/filter coffee/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Coffee powder',.16,'kg',R.coffee),ing('Sugar',.30,'kg',R.sugar),lpg(.05)];
      tim=t(0,8,12,10,3,5,'Tea Master','Filter + milk boiler',true);
    } else if(/coffee/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Coffee powder',.10,'kg',R.coffee),ing('Sugar',.30,'kg',R.sugar),lpg(.05)];
    } else if(/boost|horlicks|hot chocolate/.test(nm)){
      a=[ing('Milk',2.4,'L',R.milk),ing(/boost/.test(nm)?'Boost':/horlicks/.test(nm)?'Horlicks':'Cocoa / chocolate mix',.24,'kg',300),
         ing('Sugar',.20,'kg',R.sugar),lpg(.05)];
    } else if(/badam milk/.test(nm)){
      a=[ing('Milk',2.4,'L',R.milk),ing('Badam mix / almond',.22,'kg',450),ing('Sugar',.20,'kg',R.sugar),lpg(.05)];
    } else {
      a=[ing('Milk',2.4,'L',R.milk),ing('Sugar',.12,'kg',R.sugar),lpg(.05)];
    }
  } else {
    tim=t(0,5,12,5,3,5,'Tea / Beverage Master','Mixer / blender',false); fuel={type:'Electricity'};
    if(/lassi/.test(nm)){
      a=[ing('Curd',2.0,'kg',R.curd),ing('Water / milk',.60,'L',R.water),
         ing(/sweet/.test(nm)?'Sugar':'Salt + cumin',/sweet/.test(nm)?.30:.04,'kg',/sweet/.test(nm)?R.sugar:R.spice),power(.08)];
    } else if(/buttermilk/.test(nm)){
      y=20;
      a=[ing('Curd',2.0,'kg',R.curd),ing('Water',3.0,'L',R.water),ing('Salt + ginger + chilli + curry leaf',.12,'kg',R.spice),power(.06)];
    } else if(/rose milk/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Rose syrup',.25,'L',180),ing('Sugar',.15,'kg',R.sugar),power(.04)];
    } else if(/fresh lime/.test(nm)){
      a=[ing('Lemon',.60,'kg',R.lemon),ing('Sugar',.40,'kg',R.sugar),ing('Water',2.0,'L',R.water),power(.03)];
    } else if(/lemon soda/.test(nm)){
      a=[ing('Lemon',.50,'kg',R.lemon),ing('Sugar / salt mix',.30,'kg',R.sugar),ing('Soda',2.5,'L',25),power(.02)];
    } else if(/falooda/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Falooda sev',.20,'kg',180),ing('Basil seeds',.06,'kg',350),
         ing('Rose syrup',.20,'L',180),ing('Ice cream',1.0,'L',250),ing('Sugar',.15,'kg',R.sugar),power(.06)];
    } else if(/cold coffee|chocolate coffee/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Coffee powder',.08,'kg',R.coffee),
         ...(/chocolate/.test(nm)?[ing('Chocolate syrup / cocoa',.18,'kg',300)]:[]),ing('Sugar',.25,'kg',R.sugar),power(.10)];
    } else if(/jigarthanda/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Nannari syrup',.25,'L',250),ing('Badam pisin',.08,'kg',500),
         ing('Ice cream / reduced milk',.80,'L',260),ing('Sugar',.12,'kg',R.sugar),power(.05)];
    } else if(/pista milkshake/.test(nm)){
      a=[ing('Milk',2.0,'L',R.milk),ing('Pista / pista mix',.20,'kg',650),ing('Sugar',.20,'kg',R.sugar),power(.12)];
    } else {
      a=[ing('Milk / base',2.0,'L',R.milk),ing('Sugar',.20,'kg',R.sugar),ing('Flavour / fruit',.30,'kg',220),power(.08)];
    }
  }
  return rec(n,hot?'HOT_BEVERAGE':'COLD_BEVERAGE',y,unit,a,{productionTiming:tim,fuel});
}

function breakfast(n){
  const nm=String(n||'').toLowerCase();
  let y=25, unit='servings', a=[], tim=t(0,15,30,25,5,10,'Cook / Tiffin Master','Kadai / tawa',true), fuel={type:'LPG'};
  if(nm==='idli'){
    y=120; unit='pieces';
    a=[ing('Idli rice',3.5,'kg',R.rice),ing('Urad dal',.90,'kg',R.urad),ing('Fenugreek',.03,'kg',160),ing('Salt',.08,'kg',20),lpg(.20)];
    tim=t(720,30,10,25,5,15,'Cook / Tiffin Master','Idli Steamer',true,'Soak/grind and ferment batter the previous day/overnight.');
  } else if(/mini idli/.test(nm)){
    y=100; unit='pieces';
    a=[ing('Idli rice',2.0,'kg',R.rice),ing('Urad dal',.50,'kg',R.urad),ing('Fenugreek',.02,'kg',160),ing('Salt',.05,'kg',20),lpg(.16)];
    tim=t(720,20,12,20,5,10,'Cook / Tiffin Master','Mini-idli steamer',true,'Use fermented idli batter.');
  } else if(/sambar idli/.test(nm)){
    y=25; unit='servings';
    a=[ing('Idli rice',2.9,'kg',R.rice),ing('Urad dal',.72,'kg',R.urad),ing('Toor dal',.45,'kg',R.toor),
       ing('Sambar vegetables + onion + tomato',1.20,'kg',R.veg),ing('Sambar masala / tamarind',.16,'kg',R.spice),
       ing('Oil + tempering',.15,'L',R.oil),lpg(.24)];
    tim=t(720,25,30,45,10,15,'Cook / Tiffin Master','Idli steamer + sambar pot',true,'Uses fermented idli batter; sambar can overlap steamer passive time.');
  } else if(/ghee podi idli/.test(nm)){
    y=25; unit='servings';
    a=[ing('Idli rice',2.9,'kg',R.rice),ing('Urad dal',.72,'kg',R.urad),ing('Ghee',.25,'kg',R.ghee),
       ing('Idli podi',.25,'kg',260),ing('Salt',.06,'kg',20),lpg(.20)];
    tim=t(720,20,25,35,10,10,'Cook / Tiffin Master','Idli steamer + mixing vessel',true,'Uses fermented idli batter.');
  } else if(/dosa/.test(nm)){
    y=25; unit='pieces';
    a=[ing('Dosa rice',1.60,'kg',R.rice),ing('Urad dal',.40,'kg',R.urad),ing('Fenugreek',.015,'kg',160),
       ...(/rava/.test(nm)?[ing('Rava',.60,'kg',R.rava),ing('Rice flour',.25,'kg',R.rice)]:[]),
       ...(/onion/.test(nm)?[ing('Onion',.60,'kg',R.onion)]:[]),
       ...(/masala/.test(nm)?[ing('Potato masala',1.50,'kg',R.potato)]:[]),
       ing(/ghee/.test(nm)?'Ghee':'Cooking oil',/ghee/.test(nm)?.25:.18,/ghee/.test(nm)?'kg':'L',/ghee/.test(nm)?R.ghee:R.oil),
       ing('Salt',.04,'kg',20),lpg(.14)];
    tim=t(/rava/.test(nm)?20:720,15,40,25,5,10,'Cook / Tiffin Master','Dosa tawa',false,/rava/.test(nm)?'Rest rava batter about 20 minutes.':'Use fermented dosa batter.');
  } else if(/pongal/.test(nm)){
    a=[ing('Raw rice',1.60,'kg',R.rice),ing('Moong dal',.65,'kg',R.moong),ing('Ghee',.22,'kg',R.ghee),
       ing('Pepper + cumin + ginger',.10,'kg',R.spice),ing('Cashew',.08,'kg',700),ing('Salt',.05,'kg',20),lpg(.18)];
    tim=t(0,15,25,30,10,10,'Cook / Tiffin Master','Pressure cooker / stock pot',true);
  } else if(/poori/.test(nm)){
    y=25; unit='servings';
    a=[ing('Wheat flour',1.80,'kg',R.wheat),ing('Salt',.04,'kg',20),ing('Cooking oil - frying consumption',.55,'L',R.oil),
       ing('Potato',2.2,'kg',R.potato),ing('Onion',.45,'kg',R.onion),ing('Masala / tempering',.10,'kg',R.spice),lpg(.24)];
    tim=t(15,20,40,25,10,15,'Cook / Tiffin Master','Frying kadai + masala pot',false,'Rest poori dough 15 minutes.');
  } else if(/chapati/.test(nm)){
    y=30; unit='pieces';
    a=[ing('Wheat flour',1.50,'kg',R.wheat),ing('Oil',.08,'L',R.oil),ing('Salt',.025,'kg',20),lpg(.10)];
    tim=t(20,15,40,15,5,10,'Cook / Tiffin Master','Tawa',false,'Rest kneaded dough 20 minutes.');
  } else if(/parotta/.test(nm)){
    y=30; unit='pieces';
    a=[ing('Maida',1.80,'kg',R.maida),ing('Oil',.20,'L',R.oil),ing('Salt + sugar',.04,'kg',R.sugar),lpg(.12)];
    tim=t(60,20,50,20,5,10,'Cook / Tiffin Master','Tawa',false,'Rest and laminate dough before cooking.');
  } else if(/veg kurma/.test(nm)){
    a=[ing('Mixed vegetables',2.0,'kg',R.veg),ing('Onion',.60,'kg',R.onion),ing('Tomato',.40,'kg',R.tomato),
       ing('Coconut',.25,'kg',R.coconut),ing('Ginger garlic + spices',.12,'kg',R.spice),ing('Oil',.18,'L',R.oil),lpg(.14)];
    tim=t(0,20,25,30,10,10,'Cook / Tiffin Master','Pressure cooker / kadai',true);
  } else if(/idiyappam/.test(nm)){
    y=30; unit='pieces';
    a=[ing('Rice flour',1.50,'kg',R.rice),ing('Salt',.025,'kg',20),ing('Oil',.04,'L',R.oil),lpg(.12)];
    tim=t(0,15,35,20,5,10,'Cook / Tiffin Master','Idiyappam press + steamer',false);
  } else if(/appam/.test(nm)){
    y=30; unit='pieces';
    a=[ing('Raw rice',1.50,'kg',R.rice),ing('Cooked rice',.20,'kg',R.rice),ing('Coconut',.25,'kg',R.coconut),
       ing('Sugar',.04,'kg',R.sugar),ing('Salt',.025,'kg',20),lpg(.12)];
    tim=t(480,15,40,20,5,10,'Cook / Tiffin Master','Appam kadai',false,'Soak/grind and ferment appam batter.');
  } else if(/upma/.test(nm)){
    a=[ing('Rava',1.50,'kg',R.rava),ing('Onion',.45,'kg',R.onion),ing('Mixed vegetables',.80,'kg',R.veg),
       ing('Oil',.16,'L',R.oil),ing('Mustard + dal + chilli + curry leaf',.08,'kg',R.spice),ing('Salt',.04,'kg',20),lpg(.13)];
    tim=t(0,15,25,25,5,10,'Cook / Tiffin Master','Kadai',true);
  } else if(/kesari/.test(nm)){
    a=[ing('Rava',1.20,'kg',R.rava),ing('Sugar',1.35,'kg',R.sugar),ing('Ghee',.25,'kg',R.ghee),
       ing('Cashew + raisin',.12,'kg',650),ing('Cardamom / colour',.015,'kg',600),lpg(.12)];
    tim=t(0,10,25,25,5,10,'Cook / Tiffin Master','Kadai',true);
  } else if(/vada combo/.test(nm)){
    y=20; unit='servings';
    a=[ing('Urad dal',.80,'kg',R.urad),ing('Seasoning',.08,'kg',R.spice),ing('Cooking oil - frying consumption',.35,'L',R.oil),lpg(.15)];
    tim=t(240,15,30,20,5,10,'Vada / Snack Master','Wet grinder + frying kadai',false,'Uses vada production; combo should later consolidate with Vada recipe.');
  } else if(/tea \+ vada combo/.test(nm)){
    y=20; unit='servings';
    a=[ing('Urad dal',.80,'kg',R.urad),ing('Milk',1.6,'L',R.milk),ing('Tea powder',.06,'kg',R.tea),
       ing('Sugar',.32,'kg',R.sugar),ing('Cooking oil - frying consumption',.35,'L',R.oil),lpg(.20)];
    tim=t(240,15,35,25,5,10,'Vada / Snack Master + Tea Master','Frying kadai + tea boiler',false,'Component combo; staffing should later consolidate with Vada and Tea.');
  } else {
    a=[ing('Primary grain / flour',1.50,'kg',R.rice),ing('Vegetables / side',1.0,'kg',R.veg),ing('Oil',.15,'L',R.oil),ing('Seasoning',.08,'kg',R.spice),lpg(.14)];
  }
  return rec(n,'TIFFIN',y,unit,a,{productionTiming:tim,fuel});
}

function lunch(n){
  const nm=String(n||'').toLowerCase();
  const y=25, unit='servings';
  let a=[], tim=t(0,20,30,30,10,10,'Cook / Tiffin Master','Rice pot / kadai',true), sharedBase='';
  if(/lemon rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Lemon',.45,'kg',R.lemon),ing('Peanuts',.20,'kg',R.peanut),
       ing('Chana dal',.08,'kg',R.chanaDal),ing('Urad dal',.05,'kg',R.urad),ing('Green chilli',.07,'kg',100),
       ing('Turmeric + mustard + curry leaves',.06,'kg',R.spice),ing('Oil',.18,'L',R.oil),ing('Salt',.045,'kg',20),lpg(.18)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/tamarind rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Tamarind',.20,'kg',180),ing('Peanuts',.20,'kg',R.peanut),
       ing('Puliyogare spice mix',.18,'kg',R.spice),ing('Sesame / chana / urad',.10,'kg',180),ing('Oil',.20,'L',R.oil),ing('Salt',.045,'kg',20),lpg(.18)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/tomato rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Tomato',1.20,'kg',R.tomato),ing('Onion',.45,'kg',R.onion),
       ing('Ginger garlic + chilli + spices',.12,'kg',R.spice),ing('Oil',.20,'L',R.oil),ing('Salt',.045,'kg',20),lpg(.20)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/coconut rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Fresh coconut',.65,'kg',R.coconut),ing('Chana + urad dal',.10,'kg',120),
       ing('Green chilli + mustard + curry leaves',.06,'kg',R.spice),ing('Oil',.18,'L',R.oil),ing('Salt',.045,'kg',20),lpg(.18)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/curd rice/.test(nm)){
    a=[ing('Raw rice',1.50,'kg',R.rice),ing('Curd',2.0,'kg',R.curd),ing('Milk',.50,'L',R.milk),
       ing('Ginger + chilli + curry leaf',.08,'kg',R.spice),ing('Mustard + urad dal',.05,'kg',R.spice),
       ing('Oil',.08,'L',R.oil),ing('Salt',.045,'kg',20),lpg(.15)];
    sharedBase='SOFT_COOKED_RICE_BASE';
  } else if(/mint rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Mint leaves',.40,'kg',R.mint),ing('Coriander',.20,'kg',100),
       ing('Onion',.45,'kg',R.onion),ing('Ginger garlic + chilli',.10,'kg',R.spice),ing('Oil',.18,'L',R.oil),
       ing('Whole spices + salt',.07,'kg',R.spice),lpg(.20)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/sambar rice/.test(nm)){
    a=[ing('Raw rice',1.55,'kg',R.rice),ing('Toor dal',.50,'kg',R.toor),ing('Mixed vegetables',1.25,'kg',R.veg),
       ing('Onion + tomato',.70,'kg',R.veg),ing('Tamarind + sambar powder',.18,'kg',R.spice),
       ing('Oil + tempering',.15,'L',R.oil),ing('Salt',.05,'kg',20),lpg(.25)];
    tim=t(0,20,30,40,10,10,'Cook / Tiffin Master','Pressure cooker / stock pot',true);
  } else if(/bisibela/.test(nm)){
    a=[ing('Raw rice',1.45,'kg',R.rice),ing('Toor dal',.55,'kg',R.toor),ing('Mixed vegetables',1.25,'kg',R.veg),
       ing('Tamarind',.15,'kg',180),ing('Bisibelabath masala',.18,'kg',R.spice),ing('Ghee / oil',.18,'kg',R.ghee),
       ing('Salt',.05,'kg',20),lpg(.25)];
    tim=t(0,20,35,40,10,10,'Cook / Tiffin Master','Pressure cooker / stock pot',true);
  } else if(/veg fried rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Mixed vegetables',1.30,'kg',R.veg),ing('Spring onion / onion',.35,'kg',R.onion),
       ing('Soy / chilli sauce',.20,'L',180),ing('Oil',.20,'L',R.oil),ing('Pepper + salt',.05,'kg',R.spice),lpg(.22)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/veg biryani/.test(nm)){
    a=[ing('Basmati / seeraga samba rice',1.80,'kg',85),ing('Mixed vegetables',1.40,'kg',R.veg),ing('Onion',.55,'kg',R.onion),
       ing('Tomato',.35,'kg',R.tomato),ing('Curd',.25,'kg',R.curd),ing('Mint + coriander',.25,'kg',R.mint),
       ing('Biryani masala + ginger garlic',.15,'kg',R.spice),ing('Oil / ghee',.22,'L',R.oil),ing('Salt',.05,'kg',20),lpg(.25)];
  } else if(/jeera rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Cumin',.06,'kg',350),ing('Ghee / oil',.15,'kg',R.ghee),ing('Salt',.045,'kg',20),lpg(.17)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/ghee rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Ghee',.25,'kg',R.ghee),ing('Onion',.25,'kg',R.onion),
       ing('Whole spices',.05,'kg',R.spice),ing('Cashew',.08,'kg',700),ing('Salt',.045,'kg',20),lpg(.18)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/mushroom biryani/.test(nm)){
    a=[ing('Basmati / seeraga samba rice',1.80,'kg',85),ing('Mushroom',1.30,'kg',R.mushroom),ing('Onion',.55,'kg',R.onion),
       ing('Tomato',.35,'kg',R.tomato),ing('Curd',.25,'kg',R.curd),ing('Mint + coriander',.25,'kg',R.mint),
       ing('Biryani masala + ginger garlic',.15,'kg',R.spice),ing('Oil / ghee',.22,'L',R.oil),ing('Salt',.05,'kg',20),lpg(.25)];
  } else if(/paneer fried rice/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Paneer',1.0,'kg',R.paneer),ing('Mixed vegetables',.90,'kg',R.veg),
       ing('Spring onion / onion',.35,'kg',R.onion),ing('Soy / chilli sauce',.20,'L',180),ing('Oil',.20,'L',R.oil),
       ing('Pepper + salt',.05,'kg',R.spice),lpg(.22)];
    sharedBase='COOKED_RICE_BASE';
  } else if(/chapati meals/.test(nm)){
    a=[ing('Wheat flour',2.50,'kg',R.wheat),ing('Dal / kurma',2.50,'kg',100),ing('Rice',.90,'kg',R.rice),
       ing('Vegetable side',1.25,'kg',R.veg),ing('Oil + spices',.30,'kg',R.spice),lpg(.30)];
    tim=t(20,25,50,35,10,15,'Cook / Tiffin Master','Tawa + cooking pots',false,'Rest chapati dough.');
  } else if(/mini meals/.test(nm)){
    a=[ing('Raw rice',1.60,'kg',R.rice),ing('Sambar / dal ingredients',1.50,'kg',110),ing('Vegetable side',1.25,'kg',R.veg),
       ing('Curd',.80,'kg',R.curd),ing('Oil + spices',.25,'kg',R.spice),lpg(.30)];
    tim=t(0,25,45,40,10,15,'Cook / Tiffin Master','Multiple pots',true);
  } else if(/full meals/.test(nm)){
    a=[ing('Raw rice',2.0,'kg',R.rice),ing('Sambar / dal ingredients',1.80,'kg',110),ing('Vegetable sides',2.0,'kg',R.veg),
       ing('Curd',1.0,'kg',R.curd),ing('Rasam / seasoning',.50,'kg',R.spice),ing('Oil + spices',.30,'kg',R.spice),lpg(.38)];
    tim=t(0,30,60,50,15,20,'Cook / Tiffin Master','Multiple pots',true);
  } else if(/variety rice combo/.test(nm)){
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Mixed variety-rice seasonings',1.0,'kg',140),ing('Oil',.20,'L',R.oil),lpg(.20)];
    sharedBase='COOKED_RICE_BASE';
  } else {
    a=[ing('Raw rice',1.80,'kg',R.rice),ing('Vegetables / seasoning',1.0,'kg',R.veg),ing('Oil',.18,'L',R.oil),ing('Salt + spices',.08,'kg',R.spice),lpg(.20)];
  }
  return rec(n,'RICE',y,unit,a,{productionTiming:tim,fuel:{type:'LPG'},sharedBase});
}

function standardCondiments(){
  return [
    condiment('Idli Sambar',9.5,'L',[
      ing('Toor dal',1.10,'kg',R.toor),ing('Onion / shallot',1.0,'kg',R.onion),ing('Tomato',1.0,'kg',R.tomato),
      ing('Mixed sambar vegetables',1.70,'kg',R.veg),ing('Tamarind',.20,'kg',180),ing('Sambar powder',.20,'kg',R.spice),
      ing('Turmeric',.025,'kg',220),ing('Cooking oil',.22,'L',R.oil),ing('Mustard + urad + fenugreek',.07,'kg',R.spice),
      ing('Curry leaves + coriander',.15,'kg',100),ing('Hing',.008,'kg',700),ing('Salt',.17,'kg',20),lpg(.35)
    ],{productionTiming:t(0,20,25,35,10,10,'Cook / Tiffin Master','Pressure cooker / stock pot',true),fuel:{type:'LPG'}}),
    condiment('Rice Sambar',8,'L',[
      ing('Toor dal',.90,'kg',R.toor),ing('Onion',.70,'kg',R.onion),ing('Tomato',.80,'kg',R.tomato),
      ing('Mixed sambar vegetables',1.50,'kg',R.veg),ing('Tamarind',.18,'kg',180),ing('Sambar powder',.18,'kg',R.spice),
      ing('Turmeric',.02,'kg',220),ing('Cooking oil',.20,'L',R.oil),ing('Mustard + urad + curry leaves',.08,'kg',R.spice),
      ing('Coriander',.10,'kg',100),ing('Salt',.15,'kg',20),lpg(.32)
    ],{productionTiming:t(0,20,25,40,10,10,'Cook / Tiffin Master','Pressure cooker / stock pot',true),fuel:{type:'LPG'}}),
    condiment('Coconut Chutney',3.8,'kg',[
      ing('Fresh coconut',2.20,'kg',R.coconut),ing('Roasted gram dal',.65,'kg',R.roastedGram),ing('Green chilli',.14,'kg',100),
      ing('Ginger',.09,'kg',160),ing('Salt',.08,'kg',20),ing('Cooking oil',.10,'L',R.oil),
      ing('Mustard + urad dal',.025,'kg',R.spice),ing('Curry leaves',.04,'kg',80),power(.25),lpg(.02)
    ],{productionTiming:t(0,10,15,12,5,8,'Cook / Tiffin Master','Mixer grinder',false),fuel:{type:'Electricity + LPG'}}),
    condiment('Pudina Chutney',2.5,'kg',[
      ing('Mint leaves',.65,'kg',R.mint),ing('Coriander leaves',.35,'kg',100),ing('Fresh coconut',.30,'kg',R.coconut),
      ing('Onion / shallot',.45,'kg',R.onion),ing('Roasted gram / dal',.20,'kg',R.roastedGram),ing('Green chilli',.10,'kg',100),
      ing('Ginger + garlic',.12,'kg',170),ing('Tamarind',.04,'kg',180),ing('Oil',.08,'L',R.oil),ing('Salt',.06,'kg',20),power(.20),lpg(.02)
    ],{productionTiming:t(0,10,18,12,5,8,'Cook / Tiffin Master','Mixer grinder',false),fuel:{type:'Electricity + LPG'}}),
    condiment('Tomato Chutney',2.5,'kg',[
      ing('Tomato',1.50,'kg',R.tomato),ing('Onion',.55,'kg',R.onion),ing('Urad dal',.12,'kg',R.urad),
      ing('Roasted gram dal',.18,'kg',R.roastedGram),ing('Red chilli',.08,'kg',180),ing('Garlic',.06,'kg',180),
      ing('Cumin',.02,'kg',350),ing('Cooking oil',.10,'L',R.oil),ing('Mustard + curry leaves',.04,'kg',R.spice),
      ing('Salt',.06,'kg',20),lpg(.12),power(.08)
    ],{productionTiming:t(0,12,20,18,5,8,'Cook / Tiffin Master','Kadai + mixer grinder',true),fuel:{type:'LPG + Electricity'}}),
    condiment('Potato Poriyal',6,'kg',[
      ing('Potato',7.0,'kg',R.potato),ing('Onion',.50,'kg',R.onion),ing('Cooking oil',.28,'L',R.oil),
      ing('Mustard',.03,'kg',120),ing('Urad dal',.05,'kg',R.urad),ing('Green chilli',.09,'kg',100),
      ing('Turmeric',.015,'kg',220),ing('Curry leaves',.05,'kg',80),ing('Salt',.10,'kg',20),lpg(.30)
    ],{productionTiming:t(0,30,25,30,10,10,'Cook / Tiffin Master','Kadai / cooking vessel',true),
       fuel:{type:'LPG'},helperEligible:['wash','peel','cut','portion']})
  ];
}

function build(data){
  const out=[];
  for(const [cat,items] of Object.entries(data||{})){
    for(const x of items||[]){
      if(!['In-house','Local Kitchen'].includes(x.brand)||!x.eligible)continue;
      let r=null;
      if(cat==='Snacks Catalogue')r=snack(x.name);
      else if(cat==='Hot Beverages Catalogue')r=beverage(x.name,true);
      else if(cat==='Cold Beverages Catalogue')r=beverage(x.name,false);
      else if(cat==='Breakfast Catalogue')r=breakfast(x.name);
      else if(cat==='Lunch Catalogue')r=lunch(x.name);
      if(r)out.push(r);
    }
  }
  out.push(...standardCondiments());
  if(!out.some(r=>r.name==='Vazhakkai Bajji'))out.push(snack('Vazhakkai Bajji'));
  return out;
}
root.BOBS_SMALL_OUTLET_STANDARD_VERSION=STD_VERSION;
root.BOBS_RECIPE_RATE_BASIS={
  commercialLpgCylinderKg:19,commercialLpgCylinderPrice:2916.50,commercialLpgRatePerKg:R.commercialLpg,
  electricityRatePerKwh:R.electricity,rateDate:'2026-09-23',rateRegion:'Tamil Nadu planning basis'
};
root.BOBS_GUIDE_RECIPES=build(root.ITEM_DATA);
})(window);
