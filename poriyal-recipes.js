/* BOBS small-outlet poriyal standards.
   Planning recipes for about 100 lunch-side portions at ~60 g cooked each.
   Calibrate raw yield, trimming loss, local RM rates and LPG after actual outlet production. */
(function(root){'use strict';
const LPG=2916.50/19;
const R={oil:140,onion:55,coconut:120,mustard:120,urad:140,chilli:100,turmeric:220,hing:700,salt:20,
 cabbage:45,carrot:60,beans:90,beetroot:50,potato:35,peas:120};
const ing=(n,q,u,r)=>[n,q,u,r];
const base=(name,veg,rawQty,vegRate,lpgKg=.27,extra=[])=>({
 recipeId:'PORIYAL_'+name.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,''),
 name,kind:'CONDIMENT',category:'Poriyal',yieldQty:6,yieldUnit:'kg',
 ingredients:[
  ing(veg,rawQty,'kg',vegRate),...extra,ing('Onion',.50,'kg',R.onion),ing('Fresh coconut',.45,'kg',R.coconut),
  ing('Cooking oil',.28,'L',R.oil),ing('Mustard seeds',.03,'kg',R.mustard),ing('Urad dal',.05,'kg',R.urad),
  ing('Green / dry chilli',.08,'kg',R.chilli),ing('Curry leaves',.05,'kg',80),ing('Turmeric',.015,'kg',R.turmeric),
  ing('Asafoetida',.004,'kg',R.hing),ing('Salt',.10,'kg',R.salt),ing('LPG fuel',lpgKg,'kg',LPG)
 ],
 standardVersion:'2026-09-SMALL-OUTLET-V1',standardSource:'BOBS_SMALL_OUTLET',guideAssumption:false,
 guideDailyQty:6,defaultPortionGrams:60,
 productionTiming:{prePreparationMin:0,setupMin:25,activeMinPerCycle:25,machineMinPerCycle:25,finishMinPerCycle:10,cleanupMin:10,
  role:'Cook / Tiffin Master',equipment:'Kadai / cooking vessel',canParallelize:true,
  prePreparationNote:'Helper can wash, peel and cut vegetables before cooking.'},
 helperEligible:['wash','peel','cut','portion'],fuel:{type:'LPG',usageKg:lpgKg,ratePerKg:LPG},
 planningNote:'BOBS opening-standard batch: approx. 6 kg cooked poriyal = about 100 portions at 60 g. Reweigh cooked yield and fuel after trial production.'
});
root.BOBS_PORIYAL=[
 base('Cabbage Poriyal','Cabbage',7.0,R.cabbage,.25),
 base('Carrot Poriyal','Carrot',6.6,R.carrot,.27),
 base('Beans Poriyal','French beans',6.7,R.beans,.28),
 base('Beetroot Poriyal','Beetroot',6.6,R.beetroot,.28),
 base('Carrot Beans Poriyal','Carrot',3.3,R.carrot,.28,[ing('French beans',3.1,'kg',R.beans),ing('Green peas',.35,'kg',R.peas)]),
 base('Potato Poriyal','Potato',7.0,R.potato,.30)
];
})(window);
