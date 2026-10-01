/* Method 2 completion gate: production menus must complete Workload & Staffing before outer flow completion. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BOBS_METHOD2_WORKLOAD_GATE=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  const norm=s=>String(s||'').toLowerCase().replace(/\bidly\b/g,'idli').replace(/\s+/g,' ').trim();
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  function requirements(state,M2,ITEM_DATA,CAT_ORDER){
    const s=M2.state(state),out=[];
    try{M2.installSides(s)}catch(_e){}
    for(const cat of CAT_ORDER||[])for(let i=0;i<(ITEM_DATA?.[cat]||[]).length;i++){
      if(!M2.selected(s,cat,i))continue;
      const item=ITEM_DATA[cat][i],d=M2.draft(s,cat,i,item);
      if(String(d.mode||'').toLowerCase()!=='production')continue;
      const q=(num(d.batchSize)||0)*(num(d.batches)||0);
      out.push({name:item.name,qty:q});
    }
    return out;
  }
  function evaluate(reqs,plan){
    if(!reqs.length)return {ok:true,reason:'NO_PRODUCTION',missing:[]};
    if(!plan||!Array.isArray(plan.profiles))return {ok:false,reason:'NO_WORKLOAD_PLAN',missing:reqs.map(x=>x.name)};
    if(plan.review?.ownerReviewed!==true)return {ok:false,reason:'NOT_OWNER_REVIEWED',missing:reqs.map(x=>x.name)};
    if(plan.calculation?.complete===false)return {ok:false,reason:'CALCULATION_INCOMPLETE',missing:reqs.map(x=>x.name)};
    const profiles=new Map(plan.profiles.map(p=>[norm(p.name),p]));
    const missing=[];
    for(const r of reqs){
      const p=profiles.get(norm(r.name));
      if(!p||num(p.qty)===null||Math.abs(Number(p.qty)-Number(r.qty))>0.000001)missing.push(r.name);
    }
    return missing.length?{ok:false,reason:'STALE_OR_MISSING_PROFILE',missing}:{ok:true,reason:'COMPLETE',missing:[]};
  }
  if(!root||!root.document||!root.BOBS_DATA||!root.M2)return {requirements,evaluate,norm};

  const q=new URLSearchParams(root.location.search),outlet=q.get('outlet')||(()=>{try{return JSON.parse(root.localStorage.getItem('outlet-selection')||'{}').id||''}catch(_e){return ''}})();
  const embedded=q.get('flow')==='1';
  let result={ok:false,reason:'CHECKING',missing:[]},reqs=[],checking=false,lastPlan=null,observerGuard=false;
  function staffingHref(){return 'workload-planner.html?outlet='+encodeURIComponent(outlet)}
  function reasonText(){
    if(result.reason==='NO_WORKLOAD_PLAN')return 'Production items are complete. The next stage is Workload & Staffing. Open the planner, import the saved Method 2 menu, calculate staffing, tick “Owner reviewed this planning scenario”, and save it to Google.';
    if(result.reason==='NOT_OWNER_REVIEWED')return 'A workload plan exists, but it has not been owner-reviewed. Open Workload & Staffing, review timings/positions, tick “Owner reviewed this planning scenario”, and save again.';
    if(result.reason==='CALCULATION_INCOMPLETE')return 'The saved workload calculation is incomplete. Open Workload & Staffing and resolve the highlighted timing, assignment or coverage issue before finishing Method 2.';
    if(result.reason==='STALE_OR_MISSING_PROFILE')return 'The saved workload plan does not match the current production menu/quantity'+(result.missing.length?' for '+result.missing.join(', '):'')+'. Re-import the Method 2 menu in Workload & Staffing, recalculate, review and save.';
    return 'Checking the saved Workload & Staffing plan before Method 2 can be completed.';
  }
  function setGuide(){
    if(!reqs.length||result.ok)return;
    const stage=root.document.getElementById('guideStage'),text=root.document.getElementById('guideText'),expected=root.document.getElementById('guideExpected'),action=root.document.getElementById('guideAction');
    if(!stage||!text||!expected||!action)return;
    const t=reasonText(),e='A Google-saved workload plan covers every current production item/quantity and is owner-reviewed. Only then will BOBS allow the outer “Save & Continue”.';
    observerGuard=true;
    if(stage.textContent!=='STEP 3')stage.textContent='STEP 3';
    if(text.textContent!==t)text.textContent=t;
    if(expected.innerHTML!=='<strong>Expected result:</strong> '+e)expected.innerHTML='<strong>Expected result:</strong> '+e;
    action.textContent='Continue to Workload & Staffing →';action.href=staffingHref();action.target='_blank';action.hidden=false;
    observerGuard=false;
  }
  function showCompleteGuide(){
    if(!reqs.length||!result.ok||result.reason==='NO_PRODUCTION')return;
    const stage=root.document.getElementById('guideStage'),text=root.document.getElementById('guideText'),expected=root.document.getElementById('guideExpected'),action=root.document.getElementById('guideAction');
    if(!stage||!text||!expected||!action)return;
    const t=embedded?'Selected items, shared packing, and Workload & Staffing are complete. Scroll below this Method 2 panel and click “Save & Continue”.':'Selected items, shared packing, and Workload & Staffing are complete. You can continue the Method 2 flow.';
    const e='BOBS can now complete Method 2 without bypassing staffing analysis.';
    observerGuard=true;stage.textContent='STEP 4';text.textContent=t;expected.innerHTML='<strong>Expected result:</strong> '+e;action.hidden=true;action.removeAttribute('href');action.removeAttribute('target');observerGuard=false;
  }
  function itemsComplete(){return typeof root.BOBS_METHOD2_ITEMS_COMPLETE==='function'&&root.BOBS_METHOD2_ITEMS_COMPLETE()}
  function applyGuide(){if(!itemsComplete()||!reqs.length)return;if(result.ok)showCompleteGuide();else setGuide()}
  async function refresh(){
    if(checking)return result;checking=true;result={ok:false,reason:'CHECKING',missing:[]};
    try{
      if(!outlet)throw Error('Outlet is not selected.');
      const m2=await root.M2.read(outlet),state=root.M2.state(m2);reqs=requirements(state,root.M2,root.ITEM_DATA,root.CAT_ORDER);
      if(!reqs.length){result={ok:true,reason:'NO_PRODUCTION',missing:[]};lastPlan=null;return result}
      lastPlan=await root.BOBS_DATA.getModule(outlet,'WORKLOAD_PLAN','default');result=evaluate(reqs,lastPlan);return result;
    }catch(e){result={ok:false,reason:'READ_FAILED',missing:reqs.map(x=>x.name),error:e};return result}
    finally{checking=false;applyGuide()}
  }
  function review(){
    if(!itemsComplete())return false;
    if(!reqs.length&&result.reason!=='CHECKING')return true;
    if(result.ok)return true;
    applyGuide();
    refresh();
    const msg=result.reason==='READ_FAILED'?'BOBS could not verify the saved Workload & Staffing plan from Google. Retry after Google records load.':reasonText();
    if(typeof root.alert==='function')root.alert(msg);
    return false;
  }
  root.addEventListener('bobs-method2-items-rendered',()=>refresh());
  root.addEventListener('focus',()=>refresh());
  root.addEventListener('message',e=>{if(e.origin===root.location.origin&&e.data?.type==='bobs-workload-plan-saved'&&String(e.data.outlet)===String(outlet))refresh()});
  if(root.BroadcastChannel){const ch=new BroadcastChannel('bobs-workload-plan');ch.onmessage=e=>{if(e.data?.type==='bobs-workload-plan-saved'&&String(e.data.outlet)===String(outlet))refresh()}}
  root.BOBS_METHOD2_WORKLOAD_REVIEW=review;
  root.BOBS_METHOD2_WORKLOAD_REFRESH=refresh;
  setTimeout(refresh,0);
  return {requirements,evaluate,norm,refresh,review,getState:()=>({result,requirements:reqs,plan:lastPlan})};
});
