(function(){'use strict';
 const $=id=>document.getElementById(id),outlet=new URLSearchParams(location.search).get('outlet');let records=[],baseline,busy=false;
 function selected(){return records.find(x=>x.recordKey===$('backup').value)}
 function preview(){const snap=selected()?.data;$('preview').textContent=snap?'Outlet '+outlet+'\nCreated: '+snap.createdAt+'\nReason: '+snap.reason+'\nSaved items: '+Object.keys(snap.data?.itemEditors||{}).length:'';$('restore').disabled=!snap?.data}
 $('back').href='method2-overall.html?outlet='+encodeURIComponent(outlet||'');
 $('backup').onchange=preview;
 $('download').onclick=()=>{const snap=selected()?.data;if(!snap)return;const url=URL.createObjectURL(new Blob([JSON.stringify(snap,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='BOBS-Method2-outlet-'+outlet+'-'+snap.backupToken+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 $('restore').onclick=async()=>{
  if(busy||!selected())return;if($('confirmOutlet').value.trim()!==String(outlet)){ $('status').textContent='Type outlet '+outlet+' to confirm.';return}
  if(!confirm('Replace ALL Method 2 data for outlet '+outlet+' with the selected backup? Later changes will be replaced. The current record will be backed up first.'))return;
  busy=true;$('controls').disabled=true;
  try{const saved=await M2.restore(outlet,selected().recordKey,baseline);baseline=saved;try{M2.cache(outlet,saved)}catch(_){}$('status').textContent='Restore verified in Google. The pre-restore record is also backed up. Reload Method 2 before further edits.'}
  catch(e){$('status').textContent=e.message}finally{busy=false;$('controls').disabled=false}
 };
 window.addEventListener('beforeunload',e=>{if(busy){e.preventDefault();e.returnValue=''}});
 (async()=>{try{if(!outlet)throw Error('Select an outlet first.');[records,baseline]=await Promise.all([M2.backups(outlet),M2.read(outlet)]);for(const r of records){const o=document.createElement('option');o.value=r.recordKey;o.textContent=r.data.createdAt+' — '+r.data.reason;$('backup').append(o)}$('status').textContent=records.length?'Select a backup to preview. No data has been restored.':'No backups found yet. A verified backup is created before each Method 2 save.';$('controls').disabled=!records.length;preview()}catch(e){$('status').textContent=e.message}})();
})();
