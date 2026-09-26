/* Recipe Master Google read-back helper. Pure and testable; no storage writes here. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BOBS_RECIPE_SYNC=api;
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
