/* Pure Recipe Master sharding rules. Keeps each Google record comfortably below one-cell limits. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BOBS_RECIPE_SHARDS=api;})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
function size(x){return JSON.stringify(x).length}
function splitRecipes(recipes,maxChars=32000){
 if(!Array.isArray(recipes))throw Error('Recipe list is required');
 const chunks=[];let current=[];
 for(const recipe of recipes){
  const one={schema:'RECIPE_MASTER_CHUNK_V2',recipes:[recipe]};
  if(size(one)>maxChars)throw Error('Recipe '+String(recipe?.name||'')+' exceeds the Google chunk limit by itself.');
  const next=[...current,recipe];
  if(current.length&&size({schema:'RECIPE_MASTER_CHUNK_V2',recipes:next})>maxChars){chunks.push(current);current=[recipe]}else current=next;
 }
 if(current.length)chunks.push(current);
 return chunks;
}
function manifest(master,chunkKeys,token){
 const x=clone(master||{});delete x.recipes;
 return {...x,storageMode:'SHARDED_RECIPE_MASTER_V2',chunkModule:'RECIPE_MASTER_CHUNKS',chunkKeys:[...chunkKeys],recipeCount:Number(master?.recipes?.length||0),migrationToken:String(token||''),storageSchema:2};
}
function chunkData(recipes,token,index,total,standardVersion){return {schema:'RECIPE_MASTER_CHUNK_V2',token:String(token),index,total,standardVersion,recipes:clone(recipes)}}
function assemble(manifestData,chunks){
 if(!manifestData||manifestData.storageMode!=='SHARDED_RECIPE_MASTER_V2')return manifestData;
 const keys=manifestData.chunkKeys||[];if(!keys.length||chunks.length!==keys.length)throw Error('Recipe Master chunk set is incomplete.');
 const ordered=[...chunks].sort((a,b)=>Number(a.index)-Number(b.index));
 for(let i=0;i<ordered.length;i++){
  const c=ordered[i];if(c?.schema!=='RECIPE_MASTER_CHUNK_V2'||String(c.token)!==String(manifestData.migrationToken)||Number(c.index)!==i||Number(c.total)!==ordered.length||!Array.isArray(c.recipes))throw Error('Recipe Master chunk '+(i+1)+' failed integrity validation.');
 }
 const recipes=ordered.flatMap(c=>c.recipes);
 if(recipes.length!==Number(manifestData.recipeCount))throw Error('Recipe Master recipe count does not match its manifest.');
 return {...clone(manifestData),recipes};
}
return {size,splitRecipes,manifest,chunkData,assemble};
});
