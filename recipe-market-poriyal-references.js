/* Add or upgrade BOBS Poriyal recipes in the market-reference library after poriyal-recipes.js loads. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').trim();
const list=root.BOBS_MARKET_REFERENCES||(root.BOBS_MARKET_REFERENCES=[]);
const evidence=[
 {label:'Tamil Nadu mixed-vegetable poriyal — cabbage/carrot/beans, coconut, mustard/urad seasoning; 2 servings',url:'https://cookingfromheart.com/cabbage-carrot-beans-poriyal-tamilnadu-style-tricolor-stir-fry-recipe/'},
 {label:'Tamil Nadu Kadamba Poriyal — cabbage/carrot/beans/peas, coconut and tempering; serves 4',url:'https://www.paviskitchen.com/2020/12/carrot-beans-cabbage-poriyal-tricolor-poriyal-recipe.html'}
];
for(const src of root.BOBS_PORIYAL||[]){
 let r=list.find(x=>norm(x.name)===norm(src.name));
 if(!r){r=clone(src);list.push(r);}
 r.marketFamily='PORIYAL';
 r.referenceKind='MARKET_FAMILY_REFERENCE';
 r.referenceConfidence='MEDIUM';
 r.referenceEvidence=evidence;
 r.referenceRegion='Tamil Nadu small-hotel / meals service';
 r.referenceReviewedAt='2026-10-01';
 r.auditStatus='FAMILY_CHECKED';
 r.evidenceBasis='Published Tamil Nadu poriyal ingredient structure + BOBS 60 g lunch-side portion planning basis';
 r.calibrationNotes='Poriyal family structure is market-consistent: vegetable + mustard/urad/chilli/curry leaves + coconut. The BOBS 6 kg / about 100 × 60 g side-portion batch remains a commercial planning reference; actual trimming loss, cooked yield, coconut level and fuel must be reweighed at the outlet.';
 r.guideNote=r.calibrationNotes;
 r.marketReferenceVersion='2026-10-01-MARKET-V2';
}
const a=root.BOBS_MARKET_REFERENCE_AUDIT||(root.BOBS_MARKET_REFERENCE_AUDIT={});
a.total=list.length;
a.directlyCalibrated=list.filter(r=>r.auditStatus==='DIRECTLY_CALIBRATED').length;
a.familyChecked=list.filter(r=>r.auditStatus==='FAMILY_CHECKED').length;
a.missingFamily=list.filter(r=>!r.marketFamily).map(r=>r.name);
a.missingEvidence=list.filter(r=>!r.referenceEvidence?.length).map(r=>r.name);
})(window);
