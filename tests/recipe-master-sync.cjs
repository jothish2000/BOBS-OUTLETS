const assert=require('node:assert/strict');
const {waitForVerifiedRead}=require('../recipe-master-sync.js');

(async()=>{
  let calls=0;
  const staleThenFresh=async()=>{
    calls++;
    if(calls<3)return {standardVersion:'OLD'};
    return {standardVersion:'2026-09-SMALL-OUTLET-V2'};
  };
  const ok=await waitForVerifiedRead(staleThenFresh,v=>v&&v.standardVersion==='2026-09-SMALL-OUTLET-V2',{attempts:5,delaysMs:[0]});
  assert.equal(ok.ok,true);
  assert.equal(ok.attempt,3);

  calls=0;
  const errorThenFresh=async()=>{
    calls++;
    if(calls===1)throw new Error('temporary read failure');
    return {token:'saved'};
  };
  const recovered=await waitForVerifiedRead(errorThenFresh,v=>v&&v.token==='saved',{attempts:3,delaysMs:[0]});
  assert.equal(recovered.ok,true);
  assert.equal(recovered.attempt,2);

  calls=0;
  const alwaysStale=async()=>{calls++;return {standardVersion:'OLD'}};
  const failed=await waitForVerifiedRead(alwaysStale,v=>v&&v.standardVersion==='NEW',{attempts:3,delaysMs:[0]});
  assert.equal(failed.ok,false);
  assert.equal(failed.attempt,3);
  assert.equal(calls,3);

  console.log('PASS Recipe Master read-back retry: stale reads and transient failures retry; unresolved mismatch stays blocked.');
})().catch(e=>{console.error(e);process.exit(1)});
