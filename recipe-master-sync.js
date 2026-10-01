/* Recipe Master Google read-back helper. Pure verification API plus a lightweight UI notice on Recipe Master. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BOBS_RECIPE_SYNC=api;
  if(root&&root.document){
    root.addEventListener('DOMContentLoaded',()=>{
      try{
        if(!/recipe-master\.html$/i.test(root.location?.pathname||''))return;
        if(root.document.getElementById('marketMigrationNotice'))return;
        const main=root.document.querySelector('main');if(!main)return;
        const box=root.document.createElement('section');box.id='marketMigrationNotice';box.className='stack';
        box.innerHTML='<div class="section-head"><h2>Audited Recipe Master migration</h2><span class="tag">Market V3</span></div><p class="warning"><b>Operational COGS update:</b> the researched market-reference layer can now be promoted into the company Recipe Master with a verified Google recovery snapshot. Matching ingredient + unit supplier rates are preserved; outlet overrides/actuals are not changed.</p><p><a href="recipe-master-market-migrate.html"><b>Open controlled market-to-Recipe-Master migration →</b></a></p>';
        main.insertBefore(box,main.firstChild);
      }catch(_e){}
    });
  }
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null),function(){
  'use strict';
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
  async function waitForVerifiedRead(read,accept,options={}){
    if(typeof read!=='function'||typeof accept!=='function')throw new TypeError('read and accept functions are required');
    const attempts=Math.max(1,Number(options.attempts)||7);
    const delays=Array.isArray(options.delaysMs)&&options.delaysMs.length?options.delaysMs:[700,1000,1400,1800,2300,3000];
    let lastValue=null,lastError=null;
    for(let attempt=1;attempt<=attempts;attempt++){
      try{
        lastValue=await read();lastError=null;
        if(await accept(lastValue))return {ok:true,value:lastValue,attempt};
      }catch(error){lastError=error;}
      if(typeof options.onAttempt==='function'){
        try{options.onAttempt({attempt,attempts,lastValue,lastError})}catch(_e){}
      }
      if(attempt<attempts)await sleep(delays[Math.min(attempt-1,delays.length-1)]);
    }
    return {ok:false,value:lastValue,error:lastError,attempt:attempts};
  }
  return {waitForVerifiedRead};
});
