/* BOBS PROTECTION CONTROLLER — non-destructive reset + Google Sheets Data Vault */
(function(){
  const CRITICAL=['outlet-selection','outlet-analysis-data','method1-hourly-state','method2-item-state','staff-data','fixed-expenses-data','production-data','roster-data','bobs-research-datasets','bobs-active-research-dataset'];
  const VAULT='bobs-data-vault', QUEUE='bobs-sync-queue';
  const GOOGLE_VAULT_URL='https://script.google.com/macros/s/AKfycbxfxZLubLTNdW7jIFepJuRhz02Sch8WDQP4wQPeH38jV80LH-G2Y0tReJ6cWVjrcGQkPQ/exec';
  function read(k){try{const v=localStorage.getItem(k);return v===null?null:JSON.parse(v)}catch(e){return localStorage.getItem(k)}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function snapshot(reason){let data={};CRITICAL.forEach(k=>{const v=read(k);if(v!==null)data[k]=v});const now=new Date(),id='SNAP-'+now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,7);const rec={id,createdAt:now.toISOString(),reason:reason||'Protected checkpoint',data};let list=read(VAULT)||[];list.push(rec);write(VAULT,list);return rec}
  function queue(rec,reason){let q=read(QUEUE)||[];const item={id:'SYNC-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString(),reason:reason||rec.reason,snapshotId:rec.id,payload:rec.data,status:'pending'};q.push(item);write(QUEUE,q);return item}
  async function send(rec){const item=queue(rec,rec.reason);try{await fetch(GOOGLE_VAULT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'snapshot',snapshotId:rec.id,reason:rec.reason,data:rec.data})});item.status='sent';item.sentAt=new Date().toISOString()}catch(e){item.status='pending';item.error=String(e)}let q=read(QUEUE)||[],i=q.findIndex(x=>x.id===item.id);if(i>=0)q[i]=item;write(QUEUE,q);return item}
  window.BOBSProtection={
    googleVaultUrl:GOOGLE_VAULT_URL,
    snapshot:function(reason){return snapshot(reason)},
    protectAndSync:async function(reason){const rec=snapshot(reason);await send(rec);return rec},
    protectAndPrepareFresh:async function(reason,keys){const rec=snapshot(reason||'Before Start Fresh');await send(rec);(keys||[]).forEach(k=>localStorage.removeItem(k));return rec},
    protectBeforeRestore:async function(id){const rec=snapshot('Before restore of '+id);await send(rec);return rec},
    listSnapshots:function(){return read(VAULT)||[]}, listSyncQueue:function(){return read(QUEUE)||[]},
    restore:function(id){const list=read(VAULT)||[],rec=list.find(x=>x.id===id);if(!rec)throw new Error('Snapshot not found');snapshot('Automatic protection before restore '+id);Object.keys(rec.data).forEach(k=>write(k,rec.data[k]));return rec},
    exportCurrent:function(){return {createdAt:new Date().toISOString(),data:Object.fromEntries(CRITICAL.map(k=>[k,read(k)]).filter(([,v])=>v!==null))}}, criticalKeys:CRITICAL.slice()
  };
})();
