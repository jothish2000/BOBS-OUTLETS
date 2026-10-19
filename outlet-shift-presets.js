/* Shared outlet/kitchen shift entry. Only explicit edits calculate an end time.
   Saved exact times and independent shift rows are never changed on render. */
(function(){
  'use strict';
  if(window.BOBS_SHIFT_TIMES)return;

  const DEFAULT_HOURS=9;
  const START_TIMES=[];
  for(let h=0;h<24;h++){
    for(let m=0;m<60;m+=30) START_TIMES.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));
  }

  function toMinutes(t){
    const m=String(t||'').match(/^([01]\d|2[0-3]):([0-5]\d)$/); if(!m)return null;
    return Number(m[1])*60+Number(m[2]);
  }
  function toTime(mins){
    mins=((Number(mins)||0)%1440+1440)%1440;
    return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
  }
  function calcEnd(start,hours){
    const s=toMinutes(start); if(s==null)return '';
    const hrs=Number(hours); if(!Number.isFinite(hrs)||hrs<=0||hrs>24)return '';
    return toTime(s+Math.round(hrs*60));
  }
  function durationBetween(start,end){
    const s=toMinutes(start),e=toMinutes(end); if(s==null||e==null)return DEFAULT_HOURS;
    let d=e-s; if(d<=0)d+=1440; return Math.round((d/60)*100)/100;
  }
  function nameForStart(start){
    const h=toMinutes(start); if(h==null)return '';
    if(h<6*60)return 'Early Morning';
    if(h<8*60)return 'Morning';
    if(h<11*60)return 'Day';
    if(h<13*60)return 'Late Morning';
    if(h<17*60)return 'Afternoon';
    return 'Evening';
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
    f.selector.value=start?(START_TIMES.includes(start)?start:'custom'):'';
    if(f.duration && start && end)f.duration.value=durationBetween(start,end);
  }
  function autoFill(row,changeName){
    const f=rowFields(row); if(!f.st||!f.en)return;
    const start=f.st.value;
    const hours=Number(f.duration?.value);
    const end=calcEnd(start,hours);
    if(end)f.en.value=end;
    if(changeName && f.sn && !f.sn.value.trim())f.sn.value=nameForStart(start);
    [f.st,f.en,f.sn].forEach(el=>el&&el.dispatchEvent(new Event('input',{bubbles:true})));
    syncSelector(row);
  }
  function bindRow(row){
    if(row.dataset.bobsHourShiftBound==='1')return;
    const f=rowFields(row); if(!f.st||!f.en)return;
    row.dataset.bobsHourShiftBound='1';

    if(f.selector){
      f.selector.addEventListener('change',function(){
        if(f.selector.value==='custom'){f.st.focus();return;}
        if(!f.selector.value)return;
        f.st.value=f.selector.value;
        autoFill(row,true);
      });
    }
    if(f.duration){
      f.duration.addEventListener('change',function(){autoFill(row,false);});
    }
    f.st.addEventListener('input',function(){syncSelector(row);});
    f.en.addEventListener('input',function(){syncSelector(row);});
    syncSelector(row);
  }
  function enhance(cards){
    cards=cards||document.getElementById('cards'); if(!cards)return;
    addStyle();
    cards.querySelectorAll('.shift, [data-kitchen-shift]').forEach((row,index)=>{
      if(!row.querySelector('.bobs-hour-shift-controls')){
        const grid=row.querySelector('.grid, .kitchen-shift-times'); if(!grid)return;
        const label=document.createElement('label');
        label.className='bobs-hour-shift-controls';
        let options='<option value="">Select start time…</option>';
        START_TIMES.forEach(t=>{options+='<option value="'+t+'">'+t+'</option>';});
        options+='<option value="custom">Custom start time — use Start Time field</option>';
        label.innerHTML='<span>Recommended start time</span><select class="bobs-shift-start" style="width:100%">'+options+'</select>';
        grid.insertBefore(label,grid.firstElementChild);

        const durationLabel=document.createElement('label');
        durationLabel.className='bobs-hour-shift-controls';
        durationLabel.innerHTML='<span>Shift duration (hours)</span><input class="bobs-shift-duration" type="number" min="0.01" max="24" step="any" value="'+DEFAULT_HOURS+'">';
        grid.insertBefore(durationLabel,grid.children[1]||null);
      }
      // The legacy transition guard keys controls by id. Every shift must have its own key.
      const f=rowFields(row),key=f.st.id||('kitchen-shift-'+index);
      f.selector.id=key+'-recommended';
      f.duration.id=key+'-duration';
      bindRow(row);
      syncSelector(row);
    });
  }
  function addStyle(){
    if(document.getElementById('bobs-outlet-shift-preset-style'))return;
    const st=document.createElement('style');st.id='bobs-outlet-shift-preset-style';
    st.textContent='.bobs-hour-shift-controls span{display:block;margin-bottom:4px;font-size:12px;font-weight:600}.bobs-hour-shift-controls select,.bobs-hour-shift-controls input{min-height:32px;padding:5px 7px;border:1px solid #bbb;border-radius:6px;background:#fff;box-sizing:border-box}';
    document.head.appendChild(st);
  }
  function boot(){
    addStyle();
    enhance();
    const cards=document.getElementById('cards');
    if(cards && !cards.dataset.bobsHourShiftObserver){
      cards.dataset.bobsHourShiftObserver='1';
      new MutationObserver(()=>enhance()).observe(cards,{childList:true,subtree:true});
    }
  }
  window.BOBS_SHIFT_TIMES={enhance};
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='outlets.html')return;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
