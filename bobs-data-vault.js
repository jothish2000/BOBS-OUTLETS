/* BOBS DATA VAULT — non-destructive protection layer */
(function(){
  const VAULT='bobs-data-vault';
  const CRITICAL=['outlet-selection','outlet-analysis-data','method1-hourly-state','method2-item-state','staff-data','fixed-expenses-data','production-data','roster-data','bobs-research-datasets','bobs-active-research-dataset'];
  function read(k){try{const v=localStorage.getItem(k);return v===null?null:JSON.parse(v)}catch(e){return localStorage.getItem(k)}}
  function all(){const d={};CRITICAL.forEach(k=>{const v=read(k);if(v!==null)d[k]=v});return d}
  function vault(){try{return JSON.parse(localStorage.getItem(VAULT)||'[]')||[]}catch(e){return[]}}
  function saveVault(v){localStorage.setItem(VAULT,JSON.stringify(v))}
  window.BOBSDataVault={
    snapshot:function(reason){const now=new Date(),id='SNAP-'+now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,7);const rec={id:id,createdAt:now.toISOString(),reason:reason||'Protected checkpoint',data:all()};const v=vault();v.push(rec);saveVault(v);return id},
    list:function(){return vault().map(x=>({id:x.id,createdAt:x.createdAt,reason:x.reason}))},
    get:function(id){return vault().find(x=>x.id===id)||null},
    restore:function(id,mode){const rec=vault().find(x=>x.id===id);if(!rec)throw new Error('Snapshot not found');if(mode==='preview')return rec.data;const current=all();const backupId=this.snapshot('Automatic protection before restore of '+id);Object.keys(current).forEach(k=>{if(!(k in rec.data))localStorage.removeItem(k)});Object.keys(rec.data).forEach(k=>localStorage.setItem(k,JSON.stringify(rec.data[k])));return {restored:id,preRestoreSnapshot:backupId}},
    exportJSON:function(id){const rec=id?this.get(id):{id:'CURRENT',createdAt:new Date().toISOString(),reason:'Current working state',data:all()};return JSON.stringify(rec,null,2)},
    protectedKeys:CRITICAL.slice()
  };
  window.BOBSAutoProtect=function(reason){return window.BOBSDataVault.snapshot(reason||'Before destructive/reset action')};
})();
