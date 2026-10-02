/* Operational recipe reads. Legacy Recipe Master is never a fallback. */
(function(){'use strict';
window.BOBS_OPERATIONAL_RECIPES={load:async function(){
  let standard=null,problem='';
  try{if(!window.BOBS_RECIPE_KNOWLEDGE)throw Error('Standard recipe reader is unavailable.');standard=await BOBS_RECIPE_KNOWLEDGE.loadStandards(BOBS_DATA);}
  catch(e){problem=e.message;}
  const approved=standard&&Array.isArray(standard.records)?standard.records:[];
  const market=Array.isArray(window.BOBS_MARKET_REFERENCES)?window.BOBS_MARKET_REFERENCES:[];
  const names=new Set(approved.map(r=>M2.purchaseKey(r.name)));
  const fallback=market.filter(r=>!names.has(M2.purchaseKey(r.name)));
  const recipes=[...approved,...fallback];
  if(!recipes.length)throw Error('BOBS standard recipes from Google Sheets and previously prepared market-reference recipes are unavailable.');
  return {recipes,standardRecipes:approved,source:approved.length?'Google BOBS Standard Recipe':'Audited market-reference fallback',
    notice:approved.length?(fallback.length?'Recipes not retrieved from Google Sheets use previously prepared market references.':''):
      'BOBS standard recipes unavailable from Google Sheets'+(problem?' ('+problem+')':'')+'; using previously prepared market references. Check ingredients, quantities and current prices before saving.'};
}};
})();
