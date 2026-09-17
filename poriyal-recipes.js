/* Recipe-inspired starting formulations, NOT validated commercial yields or market prices.
   Raw weights and cooked yield are editable planning assumptions; calibrate in the kitchen.
   Null rates deliberately mean incomplete cost, never free ingredients. */
window.BOBS_PORIYAL=[
 ['Cabbage Poriyal','cabbage-poriyal-recipe/',[['Cabbage',.350],['Onion',.040]],.400],
 ['Carrot Poriyal','carrot-poriyal-recipe/',[['Carrot',.300]],.350],
 ['Beans Poriyal','french-beans-poriyal-recipe/',[['French beans',.250]],.300],
 ['Beetroot Poriyal','beetroot-poriyal/',[['Beetroot',.250]],.300],
 ['Carrot Beans Poriyal','https://www.reshkitchen.com/carrot-beans-poriyal',[['Carrot',.150],['French beans',.150],['Green peas',.050]],.400]
].map(([name,path,veg,yieldQty])=>({
 recipeId:'PORIYAL_'+name.toUpperCase().replace(/ /g,'_'),name,kind:'CONDIMENT',category:'Poriyal',yieldQty,yieldUnit:'kg',
 ingredients:[...veg.map(([n,v])=>[n,v,'kg',null]),['Fresh coconut',.030,'kg',null],['Oil',.025,'L',null],['Mustard seeds',.003,'kg',null],['Urad dal',.004,'kg',null],['Chilli',.003,'kg',null],['Curry leaves',.002,'kg',null],['Turmeric',.001,'kg',null],['Asafoetida',.0002,'kg',null],['Salt',.004,'kg',null],['Water',.100,'L',null],['Gas / fuel',1,'batch',null]],
 referenceUrl:path.startsWith('https:')?path:'https://www.vegrecipesofindia.com/'+path,
 planningNote:'Recipe-inspired costing template. Gram conversions, formulation, cooked yield and 50 g rice-side portion are planning assumptions, not an industry certification. Weigh your cooked batch and enter current rates, including fuel. Zero is allowed only for intentionally uncharged inputs.',
 defaultPortionGrams:50
}));

