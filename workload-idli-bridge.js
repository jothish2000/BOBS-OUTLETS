/* 111Q read-only bridge: Workload Planner -> Idli staffing -> item cost / outlet expenses.
   IDLI_SUPPORT remains the single authoritative staffing/support record. This file never writes it. */
(function(){'use strict';
function start(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='workload-planner.html')return;
  const q=new URLSearchParams(location.search),outlet=q.get('outlet')||'';
  const anchor=document.getElementById('idliSupportLink');
  if(!anchor||!outlet||!window.M2)return;
  const card=anchor.closest('.card')||anchor.parentElement;
  const style=document.createElement('style');
  style.textContent='.bridge-danger{background:#fff0ee;color:#8f201a;border-left:4px solid #b72a23;padding:10px}.bridge-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}.bridge-actions a{display:inline-block;padding:8px 10px;border:1px solid #b9c5d4;border-radius:6px;text-decoration:none}.bridge-kv{margin:6px 0}';
  document.head.appendChild(style);
  const host=document.createElement('div');host.id='idliBridgeStatus';host.innerHTML='<p class="muted">Checking saved Idli staffing bridge…</p>';card.appendChild(host);
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  function findIdli(state){for(const cat of CAT_ORDER||[]){const rows=ITEM_DATA[cat]||[];for(let i=0;i<rows.length;i++){const item=rows[i];if(/^idl[yi]$/i.test(String(item.name||''))&&M2.selected(state,cat,i))return {cat,index:i,item,draft:M2.draft(state,cat,i,item)}}return null}
  async function render(){
    try{
      const [raw,record]=await Promise.all([M2.read(outlet),M2.read(outlet,'IDLI_SUPPORT','default')]);
      const found=findIdli(M2.state(raw));
      const actions=['<a href="idli-staffing.html?outlet='+encodeURIComponent(outlet)+'">Open staffing & emergency support →</a>'];
      if(found)actions.push('<a href="method2-item.html?outlet='+encodeURIComponent(outlet)+'&cat='+encodeURIComponent(found.cat)+'&i='+found.index+'&mode=production">Open Idli full cost →</a>');
      actions.push('<a href="fixed-expenses.html?outlet='+encodeURIComponent(outlet)+'">Open outlet expenses →</a>');
      let box='warn',title='Idli staffing bridge not completed',details='No saved Idli staffing/support plan was found. Open the staffing page to build or save one.';
      if(record?.plan){
        const p=record.plan,calc=record.calculation||{},status=String(record.status||'draft').toLowerCase();
        const currentQty=found&&found.draft?.mode==='production'?(Number(found.draft.batchSize)||0)*(Number(found.draft.batches)||0):null;
        const qtyMatch=currentQty>0?Number(p.qty)===currentQty:null;
        const pending=(calc.uncovered||[]).length>0||(calc.errors||[]).some(x=>/uncovered|availability pending|unmanned/i.test(String(x)));
        const activeDate=p.payment?.frequency==='recurring'?(today()>=p.date&&today()<=p.until):today()===p.date;
        if(status==='accepted'&&!pending&&qtyMatch!==false){box='ok';title='Idli staffing bridge: ACCEPTED';details='Saved staffing/support plan is accepted'+(activeDate?' and applicable today.':'.')}
        else if(pending){box='bridge-danger';title='Idli staffing bridge: COVERAGE STILL OPEN';details='Saved plan still contains uncovered/pending duties. It must not be treated as complete.'}
        else if(status==='draft'){box='warn';title='Idli staffing bridge: DRAFT';details='A draft exists, but its labour/support cost is not active.'}
        else if(qtyMatch===false){box='warn';title='Idli staffing bridge: QUANTITY CHANGED';details='Saved staffing quantity '+esc(p.qty)+' differs from current Method 2 quantity '+esc(currentQty)+'. Rebuild before relying on labour cost.'}
        host.innerHTML='<div class="'+box+'"><strong>'+esc(title)+'</strong><p class="bridge-kv">'+esc(details)+'</p><p class="bridge-kv">Plan date: '+esc(p.date||'not set')+' · quantity: '+esc(p.qty||'not set')+' · support: '+esc(p.support?(p.source||'selected'):'none')+'</p></div><div class="bridge-actions">'+actions.join('')+'</div>';
        return;
      }
      host.innerHTML='<div class="'+box+'"><strong>'+esc(title)+'</strong><p class="bridge-kv">'+esc(details)+'</p></div><div class="bridge-actions">'+actions.join('')+'</div>';
    }catch(e){host.innerHTML='<div class="warn"><strong>Idli staffing bridge could not be read.</strong><p class="bridge-kv">'+esc(e.message||e)+'</p></div>'}
  }
  render();
  window.BOBS_REFRESH_IDLI_BRIDGE=render;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
