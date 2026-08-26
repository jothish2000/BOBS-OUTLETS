/* BOBS PROTECTION CONTROLLER — non-destructive reset + independently verified Google Data Vault */
(function(){
  const CRITICAL=['outlet-selection','outlet-analysis-data','method1-hourly-state','method2-item-state','staff-data','fixed-expenses-data','production-data','roster-data','bobs-research-datasets','bobs-active-research-dataset'];
  const VAULT='bobs-data-vault', QUEUE='bobs-sync-queue';
  const GOOGLE_VAULT_URL=(window.BOBS_CONFIG&&window.BOBS_CONFIG.DATA_VAULT_WEB_APP_URL)||'https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
  function read(k){try{const v=localStorage.getItem(k);return v===null?null:JSON.parse(v)}catch(e){return localStorage.getItem(k)}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function snapshot(reason){let data={};CRITICAL.forEach(k=>{const v=read(k);if(v!==null)data[k]=v});const now=new Date(),id='SNAP-'+now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,7);const rec={id,createdAt:now.toISOString(),reason:reason||'Protected checkpoint',data};let list=read(VAULT)||[];list.push(rec);write(VAULT,list);return rec}
  function queue(rec,reason){let q=read(QUEUE)||[];const item={id:'SYNC-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString(),reason:reason||rec.reason,snapshotId:rec.id,payload:rec.data,status:'pending'};q.push(item);write(QUEUE,q);return item}
  function updateQueue(item){let q=read(QUEUE)||[],i=q.findIndex(x=>x.id===item.id);if(i>=0)q[i]=item;write(QUEUE,q)}
  function verifySnapshot(id,timeoutMs){
    return new Promise((resolve,reject)=>{
      const cb='__bobsVaultVerify_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      let done=false;
      const script=document.createElement('script');
      const cleanup=()=>{done=true;try{delete window[cb]}catch(e){window[cb]=undefined}script.remove();clearTimeout(timer)};
      const timer=setTimeout(()=>{if(done)return;cleanup();reject(new Error('Vault verification timed out'))},timeoutMs||10000);
      window[cb]=(result)=>{if(done)return;cleanup();if(result&&result.ok&&result.verified&&result.snapshotId===id&&result.status==='PROTECTED')resolve(result);else reject(new Error('Vault did not verify snapshot '+id))};
      script.onerror=()=>{if(done)return;cleanup();reject(new Error('Vault verification request failed'))};
      script.src=GOOGLE_VAULT_URL+'?action=verify&snapshotId='+encodeURIComponent(id)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
      document.head.appendChild(script);
    });
  }
  async function send(rec){
    const item=queue(rec,rec.reason);
    try{
      await fetch(GOOGLE_VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'snapshot',snapshotId:rec.id,reason:rec.reason,data:rec.data})});
      const verified=await verifySnapshot(rec.id,12000);
      item.status='verified';item.verifiedAt=new Date().toISOString();item.verification=verified;
    }catch(e){item.status='pending';item.error=String(e);updateQueue(item);throw e;}
    updateQueue(item);return item;
  }
  window.BOBSProtection={
    googleVaultUrl:GOOGLE_VAULT_URL,
    snapshot:function(reason){return snapshot(reason)},
    protectAndSync:async function(reason){const rec=snapshot(reason);const sync=await send(rec);return {record:rec,sync:sync}},
    protectAndPrepareFresh:async function(reason,keys){
      const rec=snapshot(reason||'Before Start Fresh');
      const sync=await send(rec);
      if(sync.status!=='verified') throw new Error('Google Vault did not independently verify the protected snapshot; working data was not cleared.');
      (keys||[]).forEach(k=>localStorage.removeItem(k));
      return {record:rec,sync:sync};
    },
    protectBeforeRestore:async function(id){const rec=snapshot('Before restore of '+id);const sync=await send(rec);return {record:rec,sync:sync}},
    listSnapshots:function(){return read(VAULT)||[]},
    listSyncQueue:function(){return read(QUEUE)||[]},
    restore:function(id){const list=read(VAULT)||[],rec=list.find(x=>x.id===id);if(!rec)throw new Error('Snapshot not found');snapshot('Automatic protection before restore '+id);Object.keys(rec.data).forEach(k=>write(k,rec.data[k]));return rec},
    exportCurrent:function(){return {createdAt:new Date().toISOString(),data:Object.fromEntries(CRITICAL.map(k=>[k,read(k)]).filter(([,v])=>v!==null))}},
    criticalKeys:CRITICAL.slice()
  };
})();
