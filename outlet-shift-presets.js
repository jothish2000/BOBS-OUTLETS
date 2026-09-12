/* 111Q: Hour-based Outlet Shift Selector.
   Additive only. Does not replace or delete saved outlet data.
   Select a start time -> default 9-hour end time is calculated automatically.
   End time remains editable. Duration is also editable when a different shift length is required.
*/
(function(){
  'use strict';
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='outlets.html') return;

  const DEFAULT_HOURS=9;
  const START_TIMES=[];
  for(let h=4;h<=18;h++){
    for(let m=0;m<60;m+=30) START_TIMES.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));
  }

  function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function toMinutes(t){
    const m=String(t||'').match(/^(\d{1,2}):(\d{2})$/); if(!m)return null;
    const h=Number(m[1]),mi=Number(m[2]);
    return h*60+mi;
  }
  function toTime(mins){
    mins=((Number(mins)||0)%1440+1440)%1440;
    return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
  }
  function calcEnd(start,hours){
    const s=toMinutes(start); if(s==null)return '';
    const hrs=Number(hours); if(!Number.isFinite(hrs)||hrs<=0)return '';
    return toTime(s+Math.round(hrs*60));
  }
  function durationBetween(start,end){
    const s=toMinutes(start),e=toMinutes(end); if(s==null||e==null)return DEFAULT_HOURS;
    let d=e-s; if(d<=0)d+=1440; return Math.round((d/60)*100)/100;
  }
  function nameForStart(start){
    const h=toMinutes(start);
    if(h==null)return '';
    if(h<6*60)return 'Early Morning';
    if(h<8*60)return 'Morning';
    if(h<11*60)return 'Day';
    if(h<13*60)return 'Late Morning';
    if(h<17*60)return 'Afternoon';
    return 'Evening';
  }
  function startOptions(current){
    let h='<option value="">Select start time…</option>';
    START_TIMES.forEach(t=>{h+='<option value="'+t+'">'+t+'</option>';});
    h+='<option value="custom">Custom start time — use Start Time field</option>';
    return h;
  }
  function rowFields(row){
    return {
      st:row.querySelector('.st'),
      en:row.querySelector('.en'),
      sn:row.querySelector('.sn'),
      selector:row.querySelector('.bobs-shift-start'),
      duration:row.querySelector('.bobs-shift-duration')
    };
  }
  function syncSelector(row){
    const f=rowFields(row); if(!f.selector||!f.st||!f.en)return;
    const start=f.st.value||'';
    const end=f.en.value||'';
    f.selector.value=START_TIMES.includes(start)?start:'custom';
    if(f.duration && start && end)f.duration.value=durationBetween(start,end);
  }
  function autoFill(row,changeName){
    const f=rowFields(row); if(!f.st||!f.en)return;
    const start=f.st.value;
    const hours=Number(f.duration?.value)||DEFAULT_HOURS;
    const end=calcEnd(start,hours);
    if(end)f.en.value=end;
    if(changeName && f.sn && !f.sn.value.trim())f.sn.value=nameForStart(start);
    [f.st,f.en,f.sn].forEach(el=>el&&el.dispatchEvent(new Event('input',{bubbles:true})));
    syncSelector(row);
  }
  function bindRow(row){
    if(row.dataset.bobsHourShiftBound==='1')return;
    row.dataset.bobsHourShiftBound='1';
    const f=rowFields(row); if(!f.st||!f.en)return;

    if(f.selector){
      f.selector.addEventListener('change',function(){
        if(f.selector.value==='custom')return;
        if(!f.selector.value)return;
        f.st.value=f.selector.value;
        autoFill(row,true);
      });
    }
    if(f.duration){
      f.duration.addEventListener('change',function(){
        autoFill(row,false);
      });
    }
    f.st.addEventListener('input',function(){
      syncSelector(row);
    });
    f.en.addEventListener('input',function(){
      syncSelector(row);
    });
    syncSelector(row);
  }
  function enhance(){
    const cards=document.getElementById('cards'); if(!cards)return;
    cards.querySelectorAll('.shift').forEach(row=>{
      if(row.querySelector('.bobs-hour-shift-controls')){bindRow(row);return;}
      const grid=row.querySelector('.grid'); if(!grid)return;
      const label=document.createElement('label');
      label.className='bobs-hour-shift-controls';
      label.innerHTML='<span>Recommended start time</span><select class="bobs-shift-start" style="width:100%">'+startOptions()+'</select>';
      grid.insertBefore(label,grid.firstElementChild);

      const durationLabel=document.createElement('label');
      durationLabel.className='bobs-hour-shift-controls';
      durationLabel.innerHTML='<span>Shift duration (hours)</span><input class="bobs-shift-duration" type="number" min="1" max="24" step="0.5" value="'+DEFAULT_HOURS+'">';
      grid.insertBefore(durationLabel,grid.children[1]||null);

      bindRow(row);
      const f=rowFields(row);
      if(f.st.value){
        f.duration.value=durationBetween(f.st.value,f.en.value||calcEnd(f.st.value,DEFAULT_HOURS));
        syncSelector(row);
      }
    });
  }
  function addStyle(){
    if(document.getElementById('bobs-outlet-shift-preset-style'))return;
    const st=document.createElement('style');st.id='bobs-outlet-shift-preset-style';
    st.textContent='.bobs-hour-shift-controls span{display:block;margin-bottom:4px;font-size:12px;font-weight:600}.bobs-hour-shift-controls select,.bobs-hour-shift-controls input{min-height:32px;padding:5px 7px;border:1px solid #bbb;border-radius:6px;background:#fff;box-sizing:border-box}';
    document.head.appendChild(st);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    addStyle();
    setTimeout(enhance,100);
    const cards=document.getElementById('cards');
    if(cards)new MutationObserver(()=>setTimeout(enhance,0)).observe(cards,{childList:true,subtree:true});
  });
})();
