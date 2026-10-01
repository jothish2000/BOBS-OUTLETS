/* Market-reference calibration layer. Does not mutate Google Recipe Master. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const guides=(root.BOBS_GUIDE_RECIPES||[]).map(clone);
const sources={
  idliRecipe:[
    {label:'Dassana regular Idli — 30 idlis; 2 cups rice, 120 g urad, 20 g poha',url:'https://www.vegrecipesofindia.com/idli-recipe-how-to-make-soft-idlis/'},
    {label:'Dassana Uttapam — 2 cups idli rice = 400 g; 1/2 cup urad = 120 g',url:'https://www.vegrecipesofindia.com/uttapam-recipe/'}
  ],
  idliEquipment:[
    {label:'Commercial 120-idli gas steamer',url:'https://www.tradeindia.com/products/120-stainless-steel-idli-steamer-c13041995.html'},
    {label:'Commercial 90/120-idli cabinet; compact 54-idli model',url:'https://www.tradeindia.com/products/idli-steamer-1438119.html'},
    {label:'Commercial 96-idli induction steamer (8 plates × 12)',url:'https://www.tradeindia.com/products/commercial-induction-idli-steamer-c12164087.html'}
  ],
  vadaRecipe:[{label:'Dassana Medu Vada — 14 vada from 200 g urad dal',url:'https://www.vegrecipesofindia.com/medu-vada-recipe-medu-vada/'}],
  dosaRecipe:[{label:'Dassana hotel-style Masala Dosa — 20 dosa from 330 g rice, 125 g urad, 35 g poha',url:'https://www.vegrecipesofindia.com/masala-dosa-recipe-how-to-make-masala-dosa-recipe/'}],
  pongalRecipe:[{label:'Dassana Ven Pongal — 3 servings from 100 g rice + 60 g moong dal',url:'https://www.vegrecipesofindia.com/ven-pongal-recipe-khara-pongal-recipe/'}],
  curdRiceRecipe:[{label:'Dassana Curd Rice — 3 servings from 100 g rice + 250 g curd',url:'https://www.vegrecipesofindia.com/curd-rice/'}],
  chutneyRecipe:[{label:'Hebbars hotel-style chutney — coconut with roasted gram/peanut, thin hotel consistency',url:'https://hebbarskitchen.com/hotel-style-chutney-recipe-coconut/'}]
};
for(const r of guides){
  r.referenceKind='ENGINEERING_ESTIMATE';
  r.referenceConfidence='LOW';
  r.referenceRegion='Tamil Nadu / South India small-hotel planning';
  r.referenceReviewedAt='2026-10-01';
  r.referenceEvidence=[];
  r.guideNote='BOBS engineering estimate — not yet individually market-calibrated. Use only for planning until the recipe family is backed by published/commercial evidence and verified against outlet production.';
}
function get(name){return guides.find(r=>norm(r.name)===norm(name));}
function researched(r,evidence,note,confidence='MEDIUM'){
  if(!r)return;
  r.referenceKind='MARKET_RESEARCHED';
  r.referenceConfidence=confidence;
  r.referenceEvidence=evidence;
  r.guideNote=note;
}
// IDLI: culinary recipe yield is separated from steamer capacity. 120 is retained as one practical
// commercial reference batch because 90/120 and 96/120 machines are currently sold, not because
// the owner supplied 120. Ingredient quantities are recalibrated from published 30-idli recipes.
{
  const r=get('Idli');
  if(r){
    r.yieldQty=120;r.yieldUnit='pieces';r.portionGrams=50;
    const rates=new Map((r.ingredients||[]).map(a=>[norm(a[0]),a[3]]));
    const rate=(names,fallback)=>{for(const n of names){const v=rates.get(norm(n));if(Number.isFinite(Number(v)))return Number(v);}return fallback;};
    r.ingredients=[
      ['Idli rice',1.60,'kg',rate(['Idli rice','Rice'],55)],
      ['Urad dal',0.48,'kg',rate(['Urad dal'],140)],
      ['Thick poha',0.08,'kg',60],
      ['Fenugreek',0.004,'kg',rate(['Fenugreek'],160)],
      ['Salt',0.024,'kg',rate(['Salt'],20)],
      ['LPG fuel - provisional engineering estimate',0.20,'kg',rate(['LPG fuel','LPG fuel - provisional engineering estimate'],153.5)]
    ];
    r.referenceEquipment={marketCapacityRange:'54–120+ idlis/cycle depending model',commonCommercialExamples:'90, 96 and 120 idlis/cycle',selectedReferenceBatch:120,capacityIsNotRecipeYield:true};
    r.energyConfidence='LOW';
    researched(r,[...sources.idliRecipe,...sources.idliEquipment],
      'Market-researched small-hotel Idli reference. 120 is a practical commercial reference batch supported by current 90/96/120-capacity equipment listings; it is not a universal industry standard. Food quantities are recalibrated from published Idli ratios. Fuel remains provisional until the actual steamer/fuel is selected and trial-measured.','HIGH');
  }
}
// Family evidence: keep generated recipe quantities unless directly recalibrated, but mark the
// family as evidence-backed so the UI can distinguish researched basis from legacy saved data.
for(const r of guides){
  const n=norm(r.name);
  if(n==='vada') researched(r,sources.vadaRecipe,'Market-researched Medu Vada family reference; yield/urad ratio is checked against a published 14-vada / 200 g urad recipe. Frying-oil absorption and fuel remain outlet-calibration items.');
  else if(n==='dosa'||n==='masala dosa') researched(r,sources.dosaRecipe,'Market-researched Dosa family reference; batter ratio is checked against a published hotel-style 20-dosa recipe. Variant toppings/filling and fuel require outlet calibration.');
  else if(/ven pongal|pongal/.test(n)) researched(r,sources.pongalRecipe,'Market-researched Pongal family basis. Rice/dal ratio is evidence-backed; serving size, ghee and fuel remain calibration-sensitive.');
  else if(/curd rice/.test(n)) researched(r,sources.curdRiceRecipe,'Market-researched Curd Rice family basis. Rice/curd relationship is evidence-backed; commercial pack weight and tempering are outlet-calibration items.');
  else if(/chutney/.test(n)) researched(r,sources.chutneyRecipe,'Hotel-style chutney family basis supported by published hotel-style formulation; final litres/portion and coconut dilution must be calibrated to the outlet serving policy.');
}
root.BOBS_MARKET_REFERENCE_VERSION='2026-10-01-MARKET-V1';
root.BOBS_MARKET_REFERENCE_SOURCES=sources;
root.BOBS_MARKET_REFERENCES=guides;
})(window);
