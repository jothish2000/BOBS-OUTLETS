/* 111Q: Outlet Setup recommended shift selector.
   Additive only. Does not replace or delete saved outlet data.
   Presets populate the existing start/end/name fields; Custom remains fully editable.
*/
(function(){
  'use strict';
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='outlets.html') return;

  const PRESETS=[
    ['Early Morning','04:30','13:30'],
    ['Early Morning','05:00','14:00'],
    ['Morning','05:30','14:30'],
    ['Morning','06:00','15:00'],
    ['Morning','06:30','15:30'],
    ['Morning','07:00','16:00'],
    ['Day','08:00','17:00'],
    ['Day','09:00','18:00'],
    ['Day','10:00','19:00'],
    ['Late Morning','11:00','20:00'],
    ['Afternoon','12:00','21:00'],
    ['Evening','13:00','22:00'],
    ['Evening','13:30','22:30'],
    ['Evening','14:00','23:00'],
    ['Evening','14:30','22:30'],
    ['Evening','15:30','23:30'],
    ['Late Evening','16:30','22:30'],
    ['Late Evening','17:30','22:30'],
    ['Late Evening','18:00','23:00']
  ];

  function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function key(a,b,c){return String(a||'')+'|'+String(b||'')+'|'+String(c||'');}
  function presetValue(s){
    const exact=PRESETS.find(p=>key(p[1],p[2],p[0])===key(s.start,s.end,s.name));
    return exact?key(exact[1],exact[2],exact[0]):(s.template&&PRESETS.some(p=>key(p[1],p[2],p[0])===s.template)?s.template:'custom');
  }
  function options(s){
    let h='<option value="">Select recommended shift…</option>';
    PRESETS.forEach(p=>{const v=key(p[1],p[2],p[0]);h+='<option value="'+esc(v)+'">'+esc(p[0])+' — '+esc(p[1])+' → '+esc(p[2])+'</option>';});
    h+='<option value="custom">Custom shift — enter your own times/name</option>';
    return h;
  }
  function findRow(select){return select.closest('.shift');}
  function setField(row,cls,value){const el=row.querySelector('.'+cls);if(el){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}}
  function bindSelect(sel){
    if(sel.dataset.bobsPresetBound==='1')return;
    sel.dataset.bobsPresetBound='1';
    sel.addEventListener('change',function(){
      const row=findRow(sel); if(!row)return;
      if(sel.value==='custom'){return;}
      if(!sel.value)return;
      const a=sel.value.split('|');
      setField(row,'st',a[0]);
      setField(row,'en',a[1]);
      setField(row,'sn',a[2]);
      sel.dataset.bobsChosen=sel.value;
    });
    const row=findRow(sel);
    if(row){
      const start=row.querySelector('.st')?.value||'';
      const end=row.querySelector('.en')?.value||'';
      const name=row.querySelector('.sn')?.value||'';
      sel.value=presetValue({start,end,name});
      ['st','en','sn'].forEach(cls=>row.querySelector('.'+cls)?.addEventListener('input',()=>{
        const now={start:row.querySelector('.st')?.value||'',end:row.querySelector('.en')?.value||'',name:row.querySelector('.sn')?.value||''};
        sel.value=presetValue(now);
      }));
    }
  }
  function enhance(){
    const cards=document.getElementById('cards'); if(!cards)return;
    cards.querySelectorAll('.shift').forEach(row=>{
      if(row.querySelector('.bobs-recommended-shift')){bindSelect(row.querySelector('.bobs-recommended-shift'));return;}
      const grid=row.querySelector('.grid'); if(!grid)return;
      const label=document.createElement('label');
      label.className='bobs-recommended-shift';
      label.innerHTML='<span>Recommended shift</span><select class="bobs-recommended-shift" style="width:100%">'+options({})+'</select>';
      grid.insertBefore(label,grid.firstElementChild);
      const sel=label.querySelector('select');
      const start=row.querySelector('.st')?.value||'';
      const end=row.querySelector('.en')?.value||'';
      const name=row.querySelector('.sn')?.value||'';
      sel.innerHTML=options({start,end,name});
      sel.value=presetValue({start,end,name});
      bindSelect(sel);
    });
  }
  function addStyle(){
    if(document.getElementById('bobs-outlet-shift-preset-style'))return;
    const st=document.createElement('style');st.id='bobs-outlet-shift-preset-style';
    st.textContent='.bobs-recommended-shift select{min-height:32px;padding:5px 7px;border:1px solid #bbb;border-radius:6px;background:#fff}.bobs-recommended-shift span{display:block;margin-bottom:4px;font-size:12px}';
    document.head.appendChild(st);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    addStyle();
    setTimeout(enhance,100);
    const cards=document.getElementById('cards');
    if(cards)new MutationObserver(()=>setTimeout(enhance,0)).observe(cards,{childList:true,subtree:true});
  });
})();
