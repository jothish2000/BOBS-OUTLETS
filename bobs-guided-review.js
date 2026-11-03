/* Shared walkthrough for existing review controls. No business records or saved progress are written here. */
(function(root){'use strict';if(root.BOBS_REVIEW)return;
const doc=root.document, entries=new Map();let active=null, timer, ownClick=false, highlighted=null;
const el=(tag,text)=>{const n=doc.createElement(tag);if(text!=null)n.textContent=text;return n;};
const excluded='#bobsReferenceDialog,#bobsRoadmap,#bobsCompanion,[data-review-ui],#bobsFlowGuide';
const visible=n=>{if(!n||n.closest('[hidden]'))return false;for(let p=n;p;p=p.parentElement){const s=root.getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden')return false;}return true;};
const controls='input:not([type=hidden]),select,textarea';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function caption(n){const label=n.labels?.[0]||n.closest('label'),copy=label?.cloneNode(true);copy?.querySelectorAll('input,select,textarea,button').forEach(x=>x.remove());return clean(n.getAttribute('aria-label')||copy?.textContent||n.getAttribute('placeholder')||n.name||n.id||'Input');}
function isReview(n){return n?.matches('input[type=checkbox]')&&!n.closest(excluded)&&(
/Reviewed$|^confirmed$|^dutiesComplete$|^outletReview-/.test(n.id)||/^(reviewed|preparationReviewed|capacityBasisReviewed|costConfirmed)$/.test(n.dataset.field||'')||n.classList.contains('capacity-basis')||/^\s*I (?:have )?(?:reviewed|checked|confirmed|completed the review)\b/i.test(caption(n)));}
function scope(n){
 const selectors={outletsReviewed:'#cards',kitchenReviewed:'#kitchenBody',equipmentReviewed:'#equipmentRows',flowReviewed:'#flowApp',dutiesComplete:'#flowApp',planningReviewed:'#planningBody',capexReviewed:'main',sideServingReviewed:'#sideServingSection',quantityReviewed:'#quantitySection > .fields',deliveryReviewed:'#deliverySection',recipeReviewed:'#recipeReviewGuide',capacityReviewed:'#capacitySection',confirmed:'#productionEditor'};
 return (selectors[n.id]&&doc.querySelector(selectors[n.id]))||n.closest('[data-process],[data-capacity],.planning-component,dialog,section,article,fieldset,form')||doc.querySelector('main')||doc.body;
}
function targets(n){
 if(['salaryEligibility','salaryReviewed'].includes(n.id)&&doc.getElementById('salaryTotals'))return ['#salaryThp','#consolidated','#salaryEarnings','#salaryDeductions','#salaryEmployer',...(n.id==='salaryReviewed'?['#salaryTotals']:[])].map(s=>doc.querySelector(s)).filter(visible);
 if(n.dataset.field==='costConfirmed'){const asset=n.closest('[data-asset]');if(asset)return [...asset.querySelectorAll('[data-field]')].filter(x=>['quantity','ownedQty','unitCost','residual','usefulYears','annualDays'].includes(x.dataset.field)&&visible(x));}
 const bulk=!!doc.querySelector('#productionEditor[data-portion-basis]');
 const explicit=n.id==='referenceWeightReviewed'?['#referenceYield',...(bulk?[]:['#referencePortion'])]:n.id==='intendedWeightReviewed'?['#targetQty',...(bulk?['#portionHelp']:['#portion',...(doc.querySelector('#portion')?.value==='custom'?['#customPortion']:[])])]:n.id==='confirmed'&&doc.getElementById('productionEditor')?['#productionRows','#energyRows','#targetQty']:null;
 if(explicit)return explicit.map(s=>doc.querySelector(s)).filter(visible);
 const s=scope(n),list=[...s.querySelectorAll(controls)].filter(x=>x!==n&&!isReview(x)&&!x.closest(excluded)&&visible(x)&&x.type!=='button'&&x.type!=='submit');
 // Empty inventories and read-only report confirmations still have a concrete section to inspect.
 return list.length?list:[s];
}
function value(n){if(n.matches('input[type=checkbox],input[type=radio]'))return n.checked?'Yes':'No';if(n.tagName==='SELECT')return n.selectedOptions?.[0]?.textContent||'No selection';if(n.matches(controls))return n.value||'Not entered';const copy=n.cloneNode(true);copy.querySelectorAll('[data-review-ui],[role=status],button').forEach(x=>x.remove());return clean(copy.textContent).slice(0,500)||'No entries recorded';}
function signature(n){return JSON.stringify(targets(n).map(t=>[t.id,t.name,t.dataset.field,value(t)]));}
function announce(){root.dispatchEvent(new Event('bobs-review-context'));}
function entry(n){let e=entries.get(n);if(!e){e={node:n,signature:signature(n),confirmed:new Set(),authorised:false,method:'',changed:false};entries.set(n,e);}return e;}
function button(text,fn){const b=el('button',text);b.type='button';b.onclick=fn;return b;}
function focus(n){if(!n)return;for(let p=n.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
 root.BOBS_GUIDE?.close();if(!n.matches('input,select,textarea,button,a'))n.tabIndex=-1;n.scrollIntoView({block:'center',inline:'nearest'});n.focus({preventScroll:true});}
function locked(n){return n.matches(':disabled')||n.getAttribute('aria-disabled')==='true';}
function invalidate(e){
 e.confirmed.clear();e.authorised=false;if(e.method!=='guided')e.method='';e.changed=true;e.signature=signature(e.node);
 if(e.node.checked){e.node.checked=false;e.node.dispatchEvent(new Event('input',{bubbles:true}));e.node.dispatchEvent(new Event('change',{bubbles:true}));}
}
function refresh(){
 for(const [n,e]of entries){if(!n.isConnected){e.panel?.remove();entries.delete(n);continue;}
 const sig=signature(n);if(sig!==e.signature)invalidate(e);
 }
}
function clearHighlight(){highlighted?.classList.remove('bobs-review-highlight');highlighted=null;}
function groups(n,individual=false){
 const result=[];for(const field of targets(n)){
  const explicit=['referenceWeightReviewed','intendedWeightReviewed'].includes(n.id);
  const section=(individual||explicit)?field:field.closest('[data-position],[data-kitchen],[data-asset],[data-process],[data-capacity],section,article,fieldset')||field;
  let group=result.find(x=>x.section===section);if(!group){group={section,fields:[],title:section.querySelector?.('h2,h3,h4,legend')?.textContent||caption(field)};result.push(group);}group.fields.push(field);
 }return result;
}
function request(n){
 if(typeof n==='string')n=doc.querySelector(n);if(!isReview(n))return false;
 if(root.BOBS_REFERENCE?.ensure(n,()=>request(n)))return true;
 refresh();clearHighlight();active?.panel?.remove();const e=entry(n);active=e;e.panel?.remove();const panel=el('section');panel.dataset.reviewUi='choices';panel.className='bobs-review-panel';for(const type of ['input','change'])panel.addEventListener(type,e=>e.stopPropagation());e.panel=panel;
 panel.append(el('h3','Review before confirming'),el('p',caption(n)));
 if(locked(n)){panel.append(el('p','This confirmation is not available yet. Complete the page’s required loading, calculation or earlier checks first.'));(n.closest('label')||n).before(panel);focus(panel);announce();return true;}
 panel.append(el('p','Choose a review below to go to your actual entered values. BOBS will highlight and focus the original inputs so you can check or edit them. If you have already reviewed them, use the explicit shortcut below. Confirmation does not save.'));
 panel.append(button('Review my previously entered inputs',()=>start(e)));
 panel.append(button('Review each field individually →',()=>start(e,true)));
 const label=el('label'),skip=el('input');skip.type='checkbox';skip.dataset.reviewShortcut='true';label.append(skip,' I have already reviewed these inputs — continue without repeating the guided review');panel.append(label);
 const confirm=button('Confirm these inputs and continue',()=>{refresh();if(!skip.checked||locked(n))return;e.authorised=true;e.method='already-reviewed';complete(e);});confirm.disabled=true;skip.onchange=()=>{confirm.disabled=!skip.checked;};panel.append(confirm);
 (n.closest('label')||n).before(panel);focus(panel);announce();return true;
}
function start(e,individual=false){e.individual=individual;e.method='guided';e.authorised=false;e.confirmed.clear();e.signature=signature(e.node);e.index=0;showField(e);}
function showField(e){
 refresh();clearHighlight();const sections=groups(e.node,e.individual);if(!sections.length)return;
 e.index=Math.min(e.index||0,sections.length-1);const group=sections[e.index];e.panel?.remove();
 const panel=el('section');panel.dataset.reviewUi='field';panel.className='bobs-review-panel';for(const type of ['input','change'])panel.addEventListener(type,e=>e.stopPropagation());e.panel=panel;active=e;
 panel.append(el('strong','Review '+(e.individual?'field ':'section ')+(e.index+1)+' of '+sections.length+': '+group.title),el('p',e.individual?'Check or edit this highlighted original value, then confirm it to move to the next field.':'Check or edit the highlighted original inputs below, then confirm this section.'));
 panel.append(button(e.individual?'Confirm this field & continue':'Confirm this section & continue',()=>confirmField()),button('Return to review choices',()=>request(e.node)));
 const target=group.section,anchor=target.closest('td,th,tr,tbody,thead')?.closest('table')||target.closest('label')||target;
 anchor.before(panel);highlighted=anchor;anchor.classList.add('bobs-review-highlight');focus(group.fields.find(n=>n.matches(controls)&&!n.disabled)||target);panel.scrollIntoView({block:'start'});announce();
}
function confirmField(){
 const e=active;if(!e||e.method!=='guided'||!e.node.isConnected)return;
 refresh();const sections=groups(e.node,e.individual),group=sections[e.index||0];if(!group)return;
 for(const field of group.fields){if(field.matches(controls)&&!field.disabled&&!field.checkValidity()){field.reportValidity();focus(field);return;}}
 group.fields.forEach(field=>e.confirmed.add(field));const next=sections.findIndex(g=>g.fields.some(n=>!e.confirmed.has(n)));
 if(next>=0){e.index=next;showField(e);return;}
 e.authorised=true;e.signature=signature(e.node);e.panel?.remove();clearHighlight();
 const panel=el('section');panel.dataset.reviewUi='ready';panel.className='bobs-review-panel';for(const type of ['input','change'])panel.addEventListener(type,e=>e.stopPropagation());e.panel=panel;
 panel.append(el('p','✓ You checked each section. Confirm below to continue. This does not save your data.'),button('Confirm this review and continue',()=>complete(e)));
 (e.node.closest('label')||e.node).before(panel);focus(e.node);announce();
}
function complete(e){
 refresh();if(!e.authorised||locked(e.node))return;if(root.BOBS_REFERENCE?.ensure(e.node,()=>complete(e)))return;
 ownClick=true;try{if(!e.node.checked)e.node.click();}finally{ownClick=false;}
 if(e.node.checked){e.signature=signature(e.node);e.panel?.remove();e.panel=null;active=null;clearHighlight();announce();root.dispatchEvent(new Event('bobs-guide-context'));root.BOBS_GUIDE?.open();}
}
function rows(){
 refresh();return [...doc.querySelectorAll('input[type=checkbox]')].filter(n=>isReview(n)&&visible(n)).map(n=>{const e=entry(n);return {node:n,title:caption(n),checked:n.checked,method:e.method,changed:e.changed,
 summary:targets(n).map(t=>(t.matches(controls)?caption(t)+': ':'')+value(t)).join('; ')};});
}
function snapshot(){const result=rows();return {rows:result,active:active?{title:caption(active.node),method:active.method,index:active.index||0,total:groups(active.node,active.individual).length,individual:!!active.individual,ready:active.authorised}:null};}
doc.addEventListener('click',event=>{const n=event.target;if(ownClick||!isReview(n)||!n.checked)return;
 // click activation has provisionally toggled checked; cancellation restores the prior value.
 const e=entry(n);if(e.authorised&&e.signature===signature(n)&&!root.BOBS_REFERENCE?.needs(n))return;
 event.preventDefault();event.stopImmediatePropagation();setTimeout(()=>request(n),0);
},true);
function changed(event){if(event.target.closest?.(excluded)||isReview(event.target)) {announce();return;}refresh();announce();}
doc.addEventListener('input',changed);doc.addEventListener('change',changed);
const observer=new MutationObserver(records=>{if(records.every(r=>r.target.closest?.(excluded)))return;clearTimeout(timer);timer=setTimeout(()=>{refresh();announce();},30);});
observer.observe(doc.body,{subtree:true,childList:true});
root.BOBS_REVIEW={request,snapshot,confirmField,focusCurrent(){if(active?.method==='guided')showField(active);},isReview};
const style=el('style');style.textContent='.bobs-review-highlight{outline:3px solid #b8860b;outline-offset:4px;background:#fffaf0;scroll-margin-top:100px}.bobs-review-panel{border:2px solid #ad7b16;background:#fff8df;color:#193e30;padding:14px;margin:12px 0;border-radius:8px;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}.bobs-review-panel button{font:inherit;background:#214f3c;color:#fff;border:0;padding:10px;margin:6px 8px 6px 0;cursor:pointer}.bobs-review-panel button:disabled{opacity:.55;cursor:default}.bobs-review-panel dt{font-weight:bold}.bobs-review-panel dd{margin:0 0 8px}.bobs-review-panel input[type=checkbox]{width:auto;margin-right:8px}.bobs-review-panel :focus-visible{outline:3px solid #a16c00;outline-offset:3px}';doc.head.append(style);
announce();
})(window);
