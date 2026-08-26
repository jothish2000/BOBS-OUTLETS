/* BOBS PROTECTION CONTROLLER — non-destructive reset + Google Sheets queue */
(function(){
  const CRITICAL=['outlet-selection','outlet-analysis-data','method1-hourly-state','method2-item-state','staff-data','fixed-expenses-data','production-data','roster-data','bobs-research-datasets','bobs-active-research-dataset'];
  const VAULT='bobs-data-vault';
  const QUEUE='bobs-sync-queue';
  function read(k){try{const v=localStorage.getItem(k);return v===null?null:JSON.parse(v)}catch(e){return localStorage.getItem(k)}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function snapshot(reason){let data={};CRITICAL.forEach(k=>{const v=read(k);if(v!==null)data[k]=v});const now=new Date();const id='SNAP-'+now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,7);const rec={id,createdAt:now.toISOString(),reason:reason||'Protected checkpoint',data};let list=read(VAULT)||[];list.push(rec);write(VAULT,list);return rec}
  function queueSync(snapshotRec,reason){let q=read(QUEUE)||[];q.push({id:'SYNC-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),createdAt:new Date().toISOString(),reason:reason||'Protected snapshot',snapshotId:snapshotRec.id,payload:snapshotRec.data,status:'pending'});write(QUEUE,q);return q[q.length-1]}
  window.BOBSProtection={
    snapshot:function(reason){return snapshot(reason)},
    protectAndPrepareFresh:function(reason,keys){const snap=snapshot(reason||'Before Start Fresh');queueSync(snap,reason||'Before Start Fresh');(keys||[]).forEach(k=>localStorage.removeItem(k));return snap},
    protectBeforeRestore:function(id){const snap=snapshot('Before restore of '+id);queueSync(snap,'Before restore of '+id);return snap},
    listSnapshots:function(){return read(VAULT)||[]},
    listSyncQueue:function(){return read(QUEUE)||[]},
    restore:function(id){const list=read(VAULT)||[],rec=list.find(x=>x.id===id);if(!rec)throw new Error('Snapshot not found');snapshot('Automatic protection before restore '+id);Object.keys(rec.data).forEach(k=>write(k,rec.data[k]));return rec},
    exportCurrent:function(){return {createdAt:new Date().toISOString(),data:Object.fromEntries(CRITICAL.map(k=>[k,read(k)]).filter(([,v])=>v!==null))}},
    criticalKeys:CRITICAL.slice()
  };
})();
