/* Shared walkthrough for existing review controls. No business records or saved progress are written here. */
(function(root){'use strict';if(root.BOBS_REVIEW)return;
const doc=root.document, entries=new Map();let active=null, timer, ownClick=false;
const el=(tag,text)=>{const n=doc.createElement(tag);if(text!=null)n.textContent=text;return n;};
const excluded='#bobsRoadmap,#bobsCompanion,[data-review-ui],#bobsFlowGuide';
const visible=n=>!!n&&!n.closest('[hidden]')&&root.getComputedStyle(n).display!=='none'&&root.getComputedStyle(n).visibility!=='hidden';
const controls='input:not([type=hidden]),select,textarea';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function caption(n){const label=n.labels?.[0]||n.closest('label'),copy=label?.cloneNode(true);copy?.querySelectorAll('input,select,textarea,button').forEach(x=>x.remove());return clean(n.getAttribute('aria-label')||copy?.textContent||n.getAttribute('placeholder')||n.name||n.id||'Input');}
function isReview(n){return n?.matches('input[type=checkbox]')&&!n.closest(excluded)&&(
/Reviewed$|^confirmed$|^dutiesComplete$|^outletReview-/.test(n.id)||/^(reviewed|preparationReviewed|capacityBasisReviewed|costConfirmed)$/.test(n.dataset.field||'')||n.classList.contains('capacity-basis')||/^\s*I (?:have )?(?:reviewed|checked|confirmed|completed the review)\b/i.test(caption(n)));}
function scope(n){
 const selectors={outletsReviewed:'#cards',kitchenReviewed:'#kitchenBody',equipmentReviewed:'#equipmentRows',flowReviewed:'#flowApp',dutiesComplete:'#flowApp',planningReviewed:'#planningBody',capexReviewed:'main',sideServingReviewed:'#sideServingSection',quantityReviewed:'#quantitySection > .fields',deliveryReviewed:'#deliverySection',recipeReviewed:'#recipeReviewGuide',capacityReviewed:'#capacitySection',confirmed:'#productionEditor'};
 return (selectors[n.id]&&doc.querySelector(selectors[n.id]))||n.closest('[data-process],[data-capacity],.planning-component,section,article,fieldset,form')||doc.querySelector('main')||doc.body;
}
function targets(n){
 const bulk=!!doc.querySelector('#productionEditor[data-portion-basis]');
 const explicit=n.id==='referenceWeightReviewed'?['#referenceYield',...(bulk?[]:['#referencePortion'])]:n.id==='intendedWeightReviewed'?['#targetQty',...(bulk?['#portionHelp']:['#portion',...(doc.querySelector('#portion')?.value==='custom'?['#customPortion']:[])])]:n.id==='confirmed'&&doc.getElementById('productionEditor')?['#productionRows','#energyRows','#targetQty']:null;
 if(explicit)return explicit.map(s=>doc.querySelector(s)).filter(visible);
 const s=scope(n),list=[...s.querySelectorAll(controls)].filter(x=>x!==n&&!isReview(x)&&!x.closest(excluded)&&visible(x)&&x.type!=='button'&&x.type!=='submit');
 // Empty inventories and read-only report confirmations still have a concrete section to inspect.
 return list.length?list:[s];
}
function value(n){if(n.matches('input[type=checkbox],input[type=radio]'))return n.checked?'Yes':'No';if(n.tagName==='SELECT')return n.selectedOptions?.[0]?.textContent||'No selection';if(n.matches(controls))return n.value||'Not entered';const copy=n.cloneNode(true);copy.querySelectorAll('[data-review-ui]').forEach(x=>x.remove());return clean(copy.textContent).slice(0,500)||'No entries recorded';}
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
function summary(e,host){
 const list=el('dl');for(const n of targets(e.node)){list.append(el('dt',n.matches(controls)?caption(n):n.id==='portionHelp'?'Serving quantity per menu item':'Values to review'),el('dd',value(n)));}
 host.append(list);
}
function request(n){
 if(typeof n==='string')n=doc.querySelector(n);if(!isReview(n))return false;
 refresh();const e=entry(n);active=e;e.panel?.remove();const panel=el('section');panel.dataset.reviewUi='choices';panel.className='bobs-review-panel';for(const type of ['input','change'])panel.addEventListener(type,e=>e.stopPropagation());e.panel=panel;
 panel.append(el('h3','Review before confirming'),el('p',caption(n)));
 if(locked(n)){panel.append(el('p','This confirmation is not available yet. Complete the page’s required loading, calculation or earlier checks first.'));(n.closest('label')||n).before(panel);focus(panel);announce();return true;}
 panel.append(el('p','Choose how to review these inputs. Continuing without the walkthrough still requires your explicit confirmation and all existing validation and saving.'));
 panel.append(button('Review my previously entered inputs',()=>start(e)));
 const details=el('details');details.append(el('summary','See the inputs you are confirming'));summary(e,details);panel.append(details);
 const label=el('label'),skip=el('input');skip.type='checkbox';skip.dataset.reviewShortcut='true';label.append(skip,' I have already reviewed these inputs — continue without repeating the guided review');panel.append(label);
 const confirm=button('Confirm these inputs and continue',()=>{refresh();if(!skip.checked||locked(n))return;e.authorised=true;e.method='already-reviewed';complete(e);});confirm.disabled=true;skip.onchange=()=>{details.open=skip.checked;confirm.disabled=!skip.checked;};panel.append(confirm);
 (n.closest('label')||n).before(panel);focus(panel);announce();return true;
}
function start(e){e.method='guided';e.authorised=false;e.confirmed.clear();e.signature=signature(e.node);e.index=0;showField(e);}
function showField(e){
 refresh();const fields=targets(e.node);if(!fields.length)return;
 e.index=Math.min(e.index||0,fields.length-1);const field=fields[e.index];e.panel?.remove();
 const panel=el('section');panel.dataset.reviewUi='field';panel.className='bobs-review-panel';for(const type of ['input','change'])panel.addEventListener(type,e=>e.stopPropagation());e.panel=panel;active=e;
 panel.append(el('strong','Review '+(e.index+1)+' of '+fields.length+': '+(field.matches(controls)?caption(field):field.id==='portionHelp'?'Serving quantity per menu item':'Displayed values')),el('p','Current value: '+value(field)));
 panel.append(button('I have checked this input — next',()=>confirmField()));
 panel.append(button('Return to review choices',()=>request(e.node)));
 const anchor=field.closest('label')||field;anchor.after(panel);focus(field);announce();
}
function confirmField(){
 const e=active;if(!e||e.method!=='guided'||!e.node.isConnected)return;
 refresh();const fields=targets(e.node),field=fields[e.index||0];
 if(!field)return;
 if(field.matches(controls)&&!field.disabled&&!field.checkValidity()){field.reportValidity();focus(field);return;}
 e.confirmed.add(field);const next=fields.findIndex(n=>!e.confirmed.has(n));
 if(next>=0){e.index=next;showField(e);return;}
 e.authorised=true;e.signature=signature(e.node);e.panel?.remove();
 const panel=el('section');panel.dataset.reviewUi='ready';panel.className='bobs-review-panel';for(const type of ['input','change'])panel.addEventListener(type,e=>e.stopPropagation());e.panel=panel;
 panel.append(el('p','✓ You checked each input in this review. Confirm below to continue. This does not save your data.'),button('Confirm this review and continue',()=>complete(e)));
 (e.node.closest('label')||e.node).before(panel);focus(e.node);announce();
}
function complete(e){
 refresh();if(!e.authorised||locked(e.node))return;
 ownClick=true;try{if(!e.node.checked)e.node.click();}finally{ownClick=false;}
 if(e.node.checked){e.signature=signature(e.node);e.panel?.remove();e.panel=null;active=null;announce();root.dispatchEvent(new Event('bobs-guide-context'));root.BOBS_GUIDE?.open();}
}
function rows(){
 refresh();return [...doc.querySelectorAll('input[type=checkbox]')].filter(n=>isReview(n)&&visible(n)).map(n=>{const e=entry(n);return {node:n,title:caption(n),checked:n.checked,method:e.method,changed:e.changed,
 summary:targets(n).map(t=>(t.matches(controls)?caption(t)+': ':'')+value(t)).join('; ')};});
}
function snapshot(){const result=rows();return {rows:result,active:active?{title:caption(active.node),method:active.method,index:active.index||0,total:targets(active.node).length,ready:active.authorised}:null};}
doc.addEventListener('click',event=>{const n=event.target;if(ownClick||!isReview(n)||!n.checked)return;
 // click activation has provisionally toggled checked; cancellation restores the prior value.
 const e=entry(n);if(e.authorised&&e.signature===signature(n))return;
 event.preventDefault();event.stopImmediatePropagation();setTimeout(()=>request(n),0);
},true);
function changed(event){if(event.target.closest?.(excluded)||isReview(event.target)) {announce();return;}refresh();announce();}
doc.addEventListener('input',changed);doc.addEventListener('change',changed);
const observer=new MutationObserver(records=>{if(records.every(r=>r.target.closest?.(excluded)))return;clearTimeout(timer);timer=setTimeout(()=>{refresh();announce();},30);});
observer.observe(doc.body,{subtree:true,childList:true});
root.BOBS_REVIEW={request,snapshot,confirmField,focusCurrent(){if(active?.method==='guided')showField(active);},isReview};
const style=el('style');style.textContent='.bobs-review-panel{border:2px solid #ad7b16;background:#fff8df;color:#193e30;padding:14px;margin:12px 0;border-radius:8px;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}.bobs-review-panel button{font:inherit;background:#214f3c;color:#fff;border:0;padding:10px;margin:6px 8px 6px 0;cursor:pointer}.bobs-review-panel button:disabled{opacity:.55;cursor:default}.bobs-review-panel dt{font-weight:bold}.bobs-review-panel dd{margin:0 0 8px}.bobs-review-panel input[type=checkbox]{width:auto;margin-right:8px}.bobs-review-panel :focus-visible{outline:3px solid #a16c00;outline-offset:3px}';doc.head.append(style);
announce();
})(window);
