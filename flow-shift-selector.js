/* 111Q: additive shift selector for Outlet Method Flow.
   Reads the permanent outlet shift setup, never writes or replaces outlet data.
   Selection only controls flow context/highlighting; Method 1 numbers remain unchanged. */
(function(){
  'use strict';
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='outlet-method-flow.html') return;
  const cfg=window.BOBS_CONFIG||{};
  const urls=[cfg.DATA_VAULT_WEB_APP_URL,cfg.SHEETS_WEB_APP_URL].filter(Boolean).filter((u,i,a)=>a.indexOf(u)===i);
  let outletRecords=[],selectedShift=null;
  function jsonp(url,params,timeout){return new Promise((resolve,reject)=>{
    const cb='bobsShift_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;
    const finish=(ok,v)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb]}catch(e){}s.remove();ok?resolve(v):reject(v)};
    const timer=setTimeout(()=>finish(false,new Error('timeout')),timeout||7000);
    window[cb]=d=>finish(true,d);s.onerror=()=>finish(false,new Error('request failed'));
    const q=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
    s.src=url+(url.indexOf('?')>=0?'&':'?')+q+'&callback='+encodeURIComponent(cb)+'&_bobs='+Date.now();document.head.appendChild(s);
  })}
  function normalize(x,i){const d=x&&x.data&&typeof x.data==='object'?x.data:x||{};return{id:String(x.outletId??d.id??x.id??i+1),name:String(x.outletName??d.name??x.name??''),numShifts:Number(d.numShifts||0),shiftTimes:Array.isArray(d.shiftTimes)?d.shiftTimes.map(s=>Object.assign({},s)):[]}}
  function getCurrentOutlet(){const q=new URLSearchParams(location.search),id=q.get('outlet');if(id)return outletRecords.find(o=>String(o.id)===String(id))||outletRecords[0];const heading=document.getElementById('outletHeading')?.textContent||'';const m=heading.match(/^Outlet\s+(\d+)/i);const n=m?Math.max(0,Number(m[1])-1):0;return outletRecords[n]||outletRecords[0]}
  function validShifts(o){return (o?.shiftTimes||[]).map((s,i)=>({start:String(s.start||''),end:String(s.end||''),name:String(s.name||('Shift '+(i+1))),template:String(s.template||'')})).filter(s=>s.start||s.end||s.name)}
  function addUI(){
    const panel=document.getElementById('choicePanel');if(!panel||document.getElementById('bobsShiftSelector'))return;
    const box=document.createElement('div');box.id='bobsShiftSelector';box.className='stack';box.style.cssText='margin:0 0 14px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--paper);';
    box.innerHTML='<div class="row" style="align-items:center;gap:10px"><span class="rlabel" style="min-width:120px">Select Shift</span><select id="bobsShiftSelect" style="flex:1;min-height:40px"><option value="">All Shifts / Full Day</option></select></div><div id="bobsShiftNote" class="mini" style="margin-top:6px">Choose a saved shift to make the Method 1 hourly table easier to work with. No data is changed by this selection.</div>';
    const question=document.getElementById('choiceQuestion');question?.parentNode?.insertBefore(box,question.nextSibling);
    const sel=document.getElementById('bobsShiftSelect');sel.addEventListener('change',function(){
      const o=getCurrentOutlet(),sh=validShifts(o)[Number(this.value)];selectedShift=sh||null;
      window.BOBS_SELECTED_SHIFT=selectedShift;
      const note=document.getElementById('bobsShiftNote');if(note)note.textContent=selectedShift?('Selected: '+selectedShift.name+' · '+(selectedShift.start||'')+' – '+(selectedShift.end||'')):'All shifts / full day selected';
      const frame=document.getElementById('methodFrame');if(frame&&frame.contentWindow)applyToFrame(frame);
    });
  }
  function applyToFrame(frame){
    try{const doc=frame.contentDocument;if(!doc)return;let old=doc.getElementById('bobs-shift-focus');if(old)old.remove();
      const rows=[...doc.querySelectorAll('.hour-row')];if(!rows.length)return;
      if(!selectedShift)return;
      const start=selectedShift.start,end=selectedShift.end;
      const toMin=t=>{const m=String(t||'').match(/(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):null};
      const a=toMin(start),b=toMin(end);if(a==null||b==null)return;
      const norm=x=>String(x||'').replace(/[–—]/g,'-');
      const minsFromLabel=label=>{const m=norm(label).match(/(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)?\s*-\s*(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)?/i);if(!m)return null;let h1=Number(m[1]),mi1=Number(m[2]||0),p1=(m[3]||'').toUpperCase(),h2=Number(m[4]),mi2=Number(m[5]||0),p2=(m[6]||p1).toUpperCase();if(p1){if(p1==='PM'&&h1<12)h1+=12;if(p1==='AM'&&h1===12)h1=0}if(p2){if(p2==='PM'&&h2<12)h2+=12;if(p2==='AM'&&h2===12)h2=0}return[h1*60+mi1,h2*60+mi2]};
      const style=doc.createElement('style');style.id='bobs-shift-focus';style.textContent='.bobs-shift-dim{opacity:.32}.bobs-shift-active{outline:2px solid #888;border-radius:8px;background:rgba(0,0,0,.04)}';doc.head.appendChild(style);
      rows.forEach(r=>{const pair=minsFromLabel(r.querySelector('span')?.textContent||'');if(!pair)return;let x=pair[0],y=pair[1],hit=b>=a?(x>=a&&y<=b):(x>=a||y<=b);r.classList.toggle('bobs-shift-active',hit);r.classList.toggle('bobs-shift-dim',!hit)});
    }catch(e){}
  }
  async function load(){for(const url of urls){try{const r=await jsonp(url,{action:'outletList'},7000);if(r&&r.ok===true&&Array.isArray(r.outlets)&&r.outlets.length){outletRecords=r.outlets.map(normalize);addUI();return}}catch(e){}}addUI()}
  function hookFrame(){const f=document.getElementById('methodFrame');if(!f||f.dataset.bobsShiftHook)return;f.dataset.bobsShiftHook='1';f.addEventListener('load',()=>{setTimeout(()=>applyToFrame(f),300)});}
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{addUI();hookFrame();load()},250)});
})();
