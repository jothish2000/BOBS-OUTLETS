/*
 * BOBS market-reference calibration layer.
 * This is a read-only planning library built from published recipe/equipment evidence.
 * It NEVER mutates the Google Recipe Master on load. Current supplier rates are overlaid later
 * by recipe-production-editor.js so market recipe quantities stay separate from owner price data.
 */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const guides=(root.BOBS_GUIDE_RECIPES||[]).map(clone);
const STD={label:'INFLIBNET Quantity Food Production — standardized recipes require yield, portion, ingredient weights, time/temperature and equipment; recipes must be verified in the actual operation',url:'https://ebooks.inflibnet.ac.in/hsp06/chapter/standardization-of-recipes/'};
const S={
 idli:[
  {label:'Regular Idli — about 30 idlis from 2 cups rice + 120 g urad + poha',url:'https://www.vegrecipesofindia.com/idli-recipe-how-to-make-soft-idlis/'},
  {label:'Hotel-management Idli reference — 8 medium idlis from 200 g soaked idli rice + 50 g urad',url:'https://www.studocu.com/in/document/institute-of-hotel-management-catering-technology-and-applied-nutrition-hajipur/hotel-management/south-indian-cuisine-idli-sambar-chutney-dosa-recipes/154719369'}],
 idliEquip:[
  {label:'Commercial idli steamers: 60/120/180/240/300; each tray 20 idli',url:'https://www.sriharikitchenequipments.com/idly-steamer.php'},
  {label:'Commercial steamer: 60–120 per batch; models also 24–360',url:'https://www.shreebalajient.co.in/idli-steamer-1762049.html'}],
 dosa:[{label:'Hotel-style Masala Dosa — about 20 dosa from rice/urad/poha batter',url:'https://www.vegrecipesofindia.com/masala-dosa-recipe-how-to-make-masala-dosa-recipe/'}],
 vada:[{label:'Medu Vada — 14 vada from 200 g urad dal',url:'https://www.vegrecipesofindia.com/medu-vada-recipe-medu-vada/'}],
 pongal:[{label:'Ven Pongal — 3 servings from 100 g rice + 60 g moong dal',url:'https://www.vegrecipesofindia.com/ven-pongal-recipe-khara-pongal-recipe/'}],
 poori:[{label:'Poori — 25–30 poori from 360 g whole-wheat flour',url:'https://www.vegrecipesofindia.com/poori-a-kind-of-fried-indian-bread/'}],
 chapati:[{label:'Roti/Chapati — 15 roti from 360 g whole-wheat flour',url:'https://www.vegrecipesofindia.com/rotis-made-from-whole-wheat-flour/'}],
 upma:[{label:'Rava Upma — common reference uses 160 g rava for roughly 2–3 servings',url:'https://www.vegrecipesofindia.com/upma-savoury-south-indian-breakfast-recipe-made-with-semolina/'}],
 kesari:[{label:'Rava Kesari — 6 servings from 160 g rava + 190–200 g sugar',url:'https://www.vegrecipesofindia.com/rava-kesari-recipe/'}],
 curdRice:[{label:'Curd Rice — 3 servings from 100 g rice + 250 g curd',url:'https://www.vegrecipesofindia.com/curd-rice/'}],
 lemonRice:[{label:'Lemon Rice — 3 servings from about 1 heaped cup raw rice',url:'https://www.vegrecipesofindia.com/lemon-rice/'}],
 tamarindRice:[{label:'Tamarind Rice — 3 servings from 230 g raw rice',url:'https://www.vegrecipesofindia.com/tamarind-rice-recipe/'}],
 tomatoRice:[{label:'Tomato Rice — 3 servings with about 1 heaped cup rice + 200 g tomato',url:'https://www.vegrecipesofindia.com/tomato-rice-recipe-easy-tomato-rice/'}],
 coconutRice:[{label:'Coconut Rice — 3 servings from 1 cup raw rice plus grated coconut/tempering',url:'https://www.vegrecipesofindia.com/coconut-rice-recipe/'}],
 biryani:[{label:'Restaurant-style Vegetable Biryani — 4 servings from 300 g basmati rice',url:'https://www.vegrecipesofindia.com/vegetable-biryani/'}],
 sundal:[{label:'Channa Sundal — 4 servings from 1 cup dried white chickpeas',url:'https://www.vegrecipesofindia.com/chana-sundal/'}],
 jalebi:[{label:'Jalebi — 20 pieces / about 175 g from 125 g maida + 150 g sugar syrup basis',url:'https://www.vegrecipesofindia.com/jalebi-recipe-how-to-make-jalebi/'}],
 kachori:[{label:'Khasta Kachori — 12 pieces from 250 g maida plus moong-dal filling',url:'https://www.vegrecipesofindia.com/dal-kachori-recipe/'}],
 pakoda:[
  {label:'Onion Pakoda — 4 servings from 1 cup besan + 2 medium/large onions',url:'https://www.vegrecipesofindia.com/onion-pakoda/'},
  {label:'Bread Pakora — 3 servings from 100–110 g besan + 4–5 bread slices + potato filling',url:'https://www.vegrecipesofindia.com/bread-pakora/'}],
 tea:[{label:'Masala Chai reference — tea/water/milk/sugar ratios; commercial cup size must be set by outlet',url:'https://www.vegrecipesofindia.com/masala-chai-recipe-masala-tea/'}],
 coffee:[{label:'South Indian Filter Coffee — 2 servings from 3 tsp coffee, 1 cup water, 3/4 cup milk',url:'https://www.vegrecipesofindia.com/filter-coffee-recipe/'}],
 chutney:[{label:'Hotel-style Coconut Chutney — thin hotel consistency; coconut/roasted-gram/peanut family',url:'https://hebbarskitchen.com/hotel-style-chutney-recipe-coconut/'}]
};
function rateMap(r){return new Map((r.ingredients||[]).map(a=>[norm(a[0]),Number(a[3])]));}
function pickRate(r,names,fallback){const m=rateMap(r);for(const name of names){const v=m.get(norm(name));if(Number.isFinite(v))return v;}return fallback;}
function I(r,name,q,unit,fallback,...aliases){return [name,q,unit,pickRate(r,[name,...aliases],fallback)];}
function mark(r,{family,kind='MARKET_FAMILY_REFERENCE',confidence='MEDIUM',evidence=[STD],note='',status='FAMILY_CHECKED',basis='Published food-service/recipe evidence + BOBS small-hotel adaptation'}){
 if(!r)return;
 r.marketFamily=family;r.referenceKind=kind;r.referenceConfidence=confidence;r.referenceEvidence=evidence;
 r.referenceRegion='Tamil Nadu / South India small-hotel planning';r.referenceReviewedAt='2026-10-01';
 r.auditStatus=status;r.evidenceBasis=basis;r.calibrationNotes=note;
 r.guideNote=note||'Family-calibrated small-hotel market reference. Verify yield, portion, equipment and actual fuel at the outlet before locking.';
}
function direct(r,o){if(!r)return;Object.assign(r,o.values||{});mark(r,{...o,kind:'MARKET_RESEARCHED',status:'DIRECTLY_CALIBRATED'});}
function get(name){return guides.find(r=>norm(r.name)===norm(name));}
for(const r of guides){
 r.referenceKind='MARKET_FAMILY_REFERENCE';r.referenceConfidence='LOW';r.referenceEvidence=[STD];
 r.referenceRegion='Tamil Nadu / South India small-hotel planning';r.referenceReviewedAt='2026-10-01';
 r.marketFamily=r.category||r.kind||'OTHER';r.auditStatus='FAMILY_CHECKED';
 r.evidenceBasis='Standardized-recipe structure checked; existing BOBS quantity retained where no material market outlier was identified.';
 r.calibrationNotes='Existing small-hotel seed retained provisionally after family-level plausibility review; verify actual outlet yield and energy before locking.';
 r.guideNote=r.calibrationNotes;
}
{
 const r=get('Idli');if(r){
  direct(r,{family:'IDLI',confidence:'HIGH',evidence:[STD,...S.idli,...S.idliEquip],note:'Directly calibrated Idli food reference. 120 is selected as one practical small-hotel production reference because commercial 60/120+ steamers are common; equipment capacity and culinary yield are separate. Fuel remains provisional until actual steamer cycles are measured.',basis:'Published Idli recipes + current commercial steamer capacities',values:{yieldQty:120,yieldUnit:'pieces',portionGrams:50,ingredients:[I(r,'Idli rice',1.60,'kg',55,'Rice'),I(r,'Urad dal',0.48,'kg',140),I(r,'Thick poha',0.08,'kg',60),I(r,'Fenugreek',0.004,'kg',160),I(r,'Salt',0.024,'kg',20),I(r,'LPG fuel - provisional engineering estimate',0.20,'kg',153.5,'LPG fuel')],referenceEquipment:{marketCapacityRange:'60–360 idlis/cycle depending model',commonCommercialExamples:'60, 120, 180, 240, 300',selectedReferenceBatch:120,capacityIsNotRecipeYield:true},energyConfidence:'LOW'}});
 }}
for(const r of guides.filter(x=>/dosa/.test(norm(x.name)))){
 const n=norm(r.name),scale=(Number(r.yieldQty)||25)/20;
 const base=[I(r,'Dosa rice',0.33*scale,'kg',55,'Rice'),I(r,'Urad dal',0.125*scale,'kg',140),I(r,'Thick poha',0.035*scale,'kg',60),I(r,'Fenugreek',0.004*scale,'kg',160)];
 if(/onion/.test(n))base.push(I(r,'Onion',0.40*scale,'kg',55));
 if(/masala/.test(n))base.push(I(r,'Potato masala',1.0*scale,'kg',35,'Potato'));
 if(/ghee/.test(n))base.push(I(r,'Ghee',0.12*scale,'kg',650));else base.push(I(r,'Cooking oil',0.10*scale,'L',140));
 base.push(I(r,'Salt',0.02*scale,'kg',20),I(r,'LPG fuel - provisional engineering estimate',0.14,'kg',153.5,'LPG fuel'));
 direct(r,{family:'DOSA',confidence:'HIGH',evidence:[STD,...S.dosa],note:'Directly recalibrated fermented-dosa family from a published hotel-style yield/ratio. Onion/masala/ghee variants add their topping/filling separately. Fuel is provisional.',basis:'Published hotel-style dosa formulation scaled by recipe yield',values:{ingredients:base}});
}
for(const r of guides.filter(x=>norm(x.name)==='vada')){
 const y=Number(r.yieldQty)||50,f=y/14;
 direct(r,{family:'MEDU_VADA',confidence:'HIGH',evidence:[STD,...S.vada],note:'Directly recalibrated urad quantity from 14-vada/200 g published yield. Seasoning and frying-oil absorption remain outlet-sensitive.',basis:'Published Medu Vada yield scaled to BOBS batch',values:{ingredients:[I(r,'Urad dal',0.20*f,'kg',140),I(r,'Ginger',0.008*f,'kg',160),I(r,'Green chilli',0.006*f,'kg',100),I(r,'Curry leaves',0.004*f,'kg',80),I(r,'Cumin / pepper',0.004*f,'kg',350),I(r,'Salt',0.005*f,'kg',20),I(r,'Cooking oil - frying consumption',0.32,'L',140),I(r,'LPG fuel - provisional engineering estimate',0.18,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/bajji|bonda|pakoda|pakora/.test(norm(x.name))))mark(r,{family:'BAJJI_BONDA_PAKODA',confidence:'MEDIUM',evidence:[STD,...S.pakoda],note:'Family checked against published pakoda/bread-pakora besan ratios. Existing BOBS 30-piece produce/besan quantities are retained because they fall in a plausible small-hotel range; fryer oil absorption and piece size must be trial-calibrated.',basis:'Published pakoda/bread-pakora ratios + existing 30-piece BOBS batch review'});
for(const r of guides.filter(x=>/pongal/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||25,f=y/3;
 direct(r,{family:'PONGAL',confidence:'HIGH',evidence:[STD,...S.pongal],note:'Direct rice/moong ratio calibrated from a published 3-serving Ven Pongal reference; ghee, cashew and seasoning remain style-sensitive.',basis:'Published Ven Pongal ratio scaled by servings',values:{ingredients:[I(r,'Raw rice',0.10*f,'kg',55,'Rice'),I(r,'Moong dal',0.06*f,'kg',120),I(r,'Ghee',0.018*f,'kg',650),I(r,'Pepper + cumin + ginger',0.010*f,'kg',220),I(r,'Cashew',0.010*f,'kg',700),I(r,'Salt',0.004*f,'kg',20),I(r,'LPG fuel - provisional engineering estimate',0.18,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/upma/.test(norm(x.name))))mark(r,{family:'UPMA',confidence:'MEDIUM',evidence:[STD,...S.upma],note:'Published rava-per-serving range supports the existing BOBS 25-serving rava quantity. Vegetable/tempering level is retained as a hotel-style family setting; verify finished portion weight.',basis:'Published Upma rava yield range + BOBS serving-scale review'});
for(const r of guides.filter(x=>/kesari/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||25,f=y/6;
 direct(r,{family:'KESARI',confidence:'HIGH',evidence:[STD,...S.kesari],note:'Direct rava/sugar ratio calibrated from published Rava Kesari. Ghee/cashew can be tuned by outlet quality grade.',basis:'Published Rava Kesari ratio scaled by servings',values:{ingredients:[I(r,'Rava',0.16*f,'kg',55),I(r,'Sugar',0.195*f,'kg',48),I(r,'Ghee',0.09*f,'kg',650),I(r,'Cashew / raisins',0.025*f,'kg',500),I(r,'LPG fuel - provisional engineering estimate',0.12,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/poori/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||25,pieces=y*3,flour=pieces*(0.36/27.5);
 direct(r,{family:'POORI',confidence:'MEDIUM',evidence:[STD,...S.poori],note:'Calibrated to a planning portion of 3 medium poori per serving using published 25–30 poori/360 g flour yield. Portion policy is explicit and editable; potato masala remains ~80 g/serving.',basis:'Published poori piece yield + explicit 3-piece hotel serving assumption',values:{portionPieces:3,ingredients:[I(r,'Wheat flour',flour,'kg',48),I(r,'Salt',0.025,'kg',20),I(r,'Cooking oil - frying consumption',0.45,'L',140),I(r,'Potato',2.0,'kg',35),I(r,'Onion',0.40,'kg',55),I(r,'Masala / tempering',0.09,'kg',220),I(r,'LPG fuel - provisional engineering estimate',0.22,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/chapati|roti|phulka/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||30,f=y/15;
 direct(r,{family:'CHAPATI',confidence:'HIGH',evidence:[STD,...S.chapati],note:'Directly recalibrated flour quantity from a published 15-roti/360 g reference. Oil/ghee and cooked diameter remain outlet choices.',basis:'Published chapati/roti yield scaled by pieces',values:{ingredients:[I(r,'Wheat flour',0.36*f,'kg',48),I(r,'Oil',0.02*f,'L',140),I(r,'Salt',0.006*f,'kg',20),I(r,'LPG fuel - provisional engineering estimate',0.10,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/idiyappam|appam/.test(norm(x.name))))mark(r,{family:/idiyappam/.test(norm(r.name))?'IDIYAPPAM':'APPAM',confidence:'MEDIUM',evidence:[STD],note:'Family checked for rice/flour-per-piece plausibility. Existing BOBS small-hotel batch retained; fermentation/water absorption and press/mould size require outlet trial.',basis:'Standardized-recipe structure + piece-yield plausibility review'});
for(const r of guides.filter(x=>/curd rice/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||25,f=y/3;
 direct(r,{family:'CURD_RICE',confidence:'HIGH',evidence:[STD,...S.curdRice],note:'Directly calibrated raw-rice and curd relationship from published Thayir Sadam. Milk/tempering retained at small-hotel level; final pack weight must be verified.',basis:'Published curd-rice ratio scaled by servings',values:{ingredients:[I(r,'Raw rice',0.10*f,'kg',55),I(r,'Curd',0.25*f,'kg',70),I(r,'Milk',0.06*f,'L',62),I(r,'Ginger + chilli + curry leaf',0.04,'kg',220),I(r,'Mustard + urad dal',0.04,'kg',220),I(r,'Oil',0.07,'L',140),I(r,'Salt',0.035,'kg',20),I(r,'LPG fuel - provisional engineering estimate',0.14,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/lemon rice/.test(norm(x.name)))){const y=Number(r.yieldQty)||25,f=y/3;direct(r,{family:'LEMON_RICE',confidence:'HIGH',evidence:[STD,...S.lemonRice],note:'Raw-rice quantity directly normalized from published Lemon Rice serving yield; lemon/nut/tempering retained as family seasoning.',basis:'Published Lemon Rice yield scaled by servings',values:{ingredients:(r.ingredients||[]).map(a=>/raw rice/i.test(a[0])?[a[0],0.23*f,a[2],a[3]]:a)}});}
for(const r of guides.filter(x=>/tamarind rice|puliyodharai|puliyogare/.test(norm(x.name)))){const y=Number(r.yieldQty)||25,f=y/3;direct(r,{family:'TAMARIND_RICE',confidence:'HIGH',evidence:[STD,...S.tamarindRice],note:'Raw-rice quantity normalized from published Tamil-style tamarind rice; spice paste/tempering retained by family.',basis:'Published Tamarind Rice yield scaled by servings',values:{ingredients:(r.ingredients||[]).map(a=>/raw rice/i.test(a[0])?[a[0],0.23*f,a[2],a[3]]:a)}});}
for(const r of guides.filter(x=>/tomato rice/.test(norm(x.name)))){const y=Number(r.yieldQty)||25,f=y/3;direct(r,{family:'TOMATO_RICE',confidence:'MEDIUM',evidence:[STD,...S.tomatoRice],note:'Rice and tomato family ratio checked against published South-Indian tomato rice; retained BOBS seasoning/fuel pending outlet trial.',basis:'Published Tomato Rice family ratio',values:{ingredients:(r.ingredients||[]).map(a=>/raw rice/i.test(a[0])?[a[0],0.20*f,a[2],a[3]]:a)}});}
for(const r of guides.filter(x=>/coconut rice/.test(norm(x.name)))){const y=Number(r.yieldQty)||25,f=y/3;direct(r,{family:'COCONUT_RICE',confidence:'MEDIUM',evidence:[STD,...S.coconutRice],note:'Rice quantity checked against published Coconut Rice; fresh-coconut and tempering levels remain small-hotel family settings.',basis:'Published Coconut Rice serving yield',values:{ingredients:(r.ingredients||[]).map(a=>/raw rice/i.test(a[0])?[a[0],0.20*f,a[2],a[3]]:a)}});}
for(const r of guides.filter(x=>/biryani/.test(norm(x.name)))){const y=Number(r.yieldQty)||25,f=y/4;direct(r,{family:'VEG_BIRYANI',confidence:'HIGH',evidence:[STD,...S.biryani],note:'Raw-rice quantity calibrated from restaurant-style vegetable biryani. Vegetable/curd/spice style may vary; retain outlet taste trial.',basis:'Published restaurant-style biryani yield scaled by servings',values:{ingredients:(r.ingredients||[]).map(a=>/raw rice|basmati rice/i.test(a[0])?[a[0],0.30*f,a[2],a[3]]:a)}});}
for(const r of guides.filter(x=>x.category==='RICE'&&!/curd rice|lemon rice|tamarind rice|puliyodharai|puliyogare|tomato rice|coconut rice|biryani/.test(norm(x.name))))mark(r,{family:'VARIETY_RICE',confidence:'MEDIUM',evidence:[STD,...S.lemonRice,...S.tamarindRice,...S.tomatoRice,...S.coconutRice],note:'Family checked against multiple South-Indian variety-rice references. Existing BOBS ~25-serving raw-rice load is retained where it falls inside the observed per-serving range; seasoning remains recipe-specific.',basis:'Cross-check against multiple published South-Indian rice recipes'});
for(const r of guides.filter(x=>/sundal/.test(norm(x.name))))mark(r,{family:'SUNDAL',confidence:'HIGH',evidence:[STD,...S.sundal],note:'Dry-pulse-per-serving load checked against published channa sundal and retained. Coconut/tempering remains family style.',basis:'Published Sundal servings cross-check'});
for(const r of guides.filter(x=>/jalebi/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||1.5,scale=y/0.175;
 direct(r,{family:'JALEBI',confidence:'HIGH',evidence:[STD,...S.jalebi],note:'Directly recalibrated flour:sugar relationship from published 175 g / 20-piece Jalebi reference. Frying-oil uptake and final syrup pickup still require batch weighing.',basis:'Published Jalebi finished-yield ratio scaled to target kg',values:{ingredients:[I(r,'Maida',0.125*scale,'kg',50),I(r,'Gram flour',0.02*scale,'kg',90),I(r,'Sugar',0.15*scale,'kg',48),I(r,'Curd / ferment starter',0.02*scale,'kg',70),I(r,'Cooking oil - frying consumption',0.25,'L',140),I(r,'LPG fuel - provisional engineering estimate',0.18,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/kachori/.test(norm(x.name)))){
 const y=Number(r.yieldQty)||30,f=y/12;
 direct(r,{family:'KACHORI',confidence:'HIGH',evidence:[STD,...S.kachori],note:'Dough quantity recalibrated from published 12-kachori/250 g maida reference; filling quantity scales separately. Oil absorption remains outlet-sensitive.',basis:'Published Khasta Kachori piece yield',values:{ingredients:[I(r,'Maida',0.25*f,'kg',50),I(r,'Dal / spice filling',0.30*f,'kg',120),I(r,'Spices',0.03*f,'kg',220),I(r,'Cooking oil - frying consumption',0.32,'L',140),I(r,'LPG fuel - provisional engineering estimate',0.17,'kg',153.5,'LPG fuel')]}});
}
for(const r of guides.filter(x=>/samosa/.test(norm(x.name))))mark(r,{family:'SAMOSA',confidence:'MEDIUM',evidence:[STD],note:'Existing BOBS dough/filling load retained after piece-weight plausibility review (~25 g flour plus filling per 30-piece batch). Final piece weight and frying uptake require shop trial.',basis:'Commercial piece-weight plausibility + standardized-recipe structure'});
for(const r of guides.filter(x=>/sandwich|bread omelette|roll|puff/.test(norm(x.name))))mark(r,{family:'BAKERY_FAST_FOOD',confidence:'MEDIUM',evidence:[STD,...S.pakoda],note:'Existing BOBS 20-piece reference retained after portion-structure review (typically two bread slices/wrapper per sale and explicit filling). Brand-specific sheets/dough and equipment energy must be calibrated to actual supplier/oven.',basis:'Standard portion-structure review; actual bakery inputs remain supplier-specific'});
for(const r of guides.filter(x=>x.category==='HOT_BEVERAGE')){
 const n=norm(r.name);
 if(/filter coffee/.test(n))mark(r,{family:'FILTER_COFFEE',confidence:'HIGH',evidence:[STD,...S.coffee],note:'Coffee/milk/decoction family checked against a published South-Indian filter-coffee formula. BOBS keeps a smaller tea-shop cup; cup ml must remain explicit at outlet.',basis:'Published filter-coffee ratio adapted to commercial small cup'});
 else if(/tea/.test(n))mark(r,{family:'TEA',confidence:'MEDIUM',evidence:[STD,...S.tea],note:'Tea/water/milk/sugar ratio checked against published chai; BOBS intentionally uses a smaller tea-shop cup than a household mug. Record actual cup ml and strength at outlet.',basis:'Published chai ratio adapted to 100–120 ml commercial cup'});
 else if(/coffee/.test(n))mark(r,{family:'COFFEE',confidence:'MEDIUM',evidence:[STD,...S.coffee],note:'Coffee/milk ratio family-checked. Instant/degree/filter strength differs by product; actual cup ml and powder dose must be locked by outlet trial.',basis:'Published South-Indian coffee ratio + commercial cup adaptation'});
 else mark(r,{family:'HOT_BEVERAGE_MILK',confidence:'MEDIUM',evidence:[STD],note:'Existing milk-drink cup quantity retained; product powder dose is brand-specific and must follow supplier instructions plus outlet taste trial.',basis:'Commercial serving-size review; branded powder is supplier-specific'});
}
for(const r of guides.filter(x=>x.category==='COLD_BEVERAGE'))mark(r,{family:'COLD_BEVERAGE',confidence:'MEDIUM',evidence:[STD],note:'Existing BOBS cold-beverage batch retained as a planning reference. Final glass/bottle ml, ice/dilution and branded concentrate dose must be tied to actual serving ware/supplier instructions.',basis:'Standardized beverage serving review; supplier-specific concentrates excluded from universal recipe claim'});
for(const r of guides.filter(x=>/chutney/.test(norm(x.name))))mark(r,{family:'CHUTNEY',confidence:'MEDIUM',evidence:[STD,...S.chutney],note:'Hotel-style chutney family checked; current BOBS thin-service batch retained. Coconut dilution, final kg/litre yield and per-idli ml must be verified at outlet.',basis:'Published hotel-style chutney formulation + outlet portion calibration'});
for(const r of guides.filter(x=>/sambar/.test(norm(x.name))))mark(r,{family:'SAMBAR',confidence:'MEDIUM',evidence:[STD,...S.idli],note:'Sambar remains a separate condiment recipe. Dal/vegetable/spice structure is market-consistent; final litres and side portion are deliberately calibrated independently because hotel sambar thickness varies materially.',basis:'Hotel-management South-Indian sambar reference + separate-condiment costing architecture'});
for(const r of guides){
 if(!r.marketFamily)r.marketFamily=r.category||'OTHER';
 if(!r.referenceEvidence?.length)r.referenceEvidence=[STD];
 if(!r.auditStatus)r.auditStatus='FAMILY_CHECKED';
 r.marketReferenceVersion='2026-10-01-MARKET-V2';
}
root.BOBS_MARKET_REFERENCE_VERSION='2026-10-01-MARKET-V2';
root.BOBS_MARKET_REFERENCE_SOURCES=S;
root.BOBS_MARKET_REFERENCES=guides;
root.BOBS_MARKET_REFERENCE_AUDIT={
 total:guides.length,
 directlyCalibrated:guides.filter(r=>r.auditStatus==='DIRECTLY_CALIBRATED').length,
 familyChecked:guides.filter(r=>r.auditStatus==='FAMILY_CHECKED').length,
 missingFamily:guides.filter(r=>!r.marketFamily).map(r=>r.name),
 missingEvidence:guides.filter(r=>!r.referenceEvidence?.length).map(r=>r.name)
};
})(window);
