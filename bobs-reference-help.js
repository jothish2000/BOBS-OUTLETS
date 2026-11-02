/* One reference assessment at a time; external source visits are optional. */
(function(root){'use strict';if(root.BOBS_REFERENCE)return;
const d=root.document,checked=new Map();let opened=null,returnFocus=null,after=null;
const dialog=d.createElement('dialog');dialog.id='bobsReferenceDialog';dialog.setAttribute('aria-labelledby','bobsReferenceTitle');dialog.innerHTML='<h2 id="bobsReferenceTitle">Reference assessment</h2><p>Review the information and its limitations for your operation. External source links are optional; you do not need to visit them to continue.</p><div id="bobsReferenceContent"></div><label><input type="checkbox" id="bobsReferenceAcknowledged"> I reviewed this reference and checked that it suits my operation.</label><p id="bobsReferenceStatus" role="status"></p><button type="button" id="bobsReferenceContinue" disabled>Confirm reference and return to my inputs</button><button type="button" id="bobsReferenceClose">Close without confirming</button>';
d.body.append(dialog);
const $=id=>d.getElementById(id),style=d.createElement('style');style.textContent='#bobsReferenceDialog{box-sizing:border-box;width:min(760px,94vw);max-height:88vh;overflow:auto;background:#fffaf0;color:#193e30;border:2px solid #b48624;border-radius:10px;padding:20px;font:16px/1.5 system-ui}#bobsReferenceDialog::backdrop{background:#0007}#bobsReferenceDialog button{padding:10px;margin:10px 8px 0 0}#bobsReferenceContent{overflow-wrap:anywhere}#bobsReferenceContent table{max-width:100%;font-size:14px}#bobsReferenceContent .scroll{overflow:auto}.bobs-reference-launch{padding:12px;background:#214f3c;color:white;border:0;margin:10px 0;font:inherit}';d.head.append(style);
function sources(key){
 if(key==='recipe')return ['referenceInfo','referenceEvidence','referenceRows','referenceTotal'].map($).filter(Boolean);
 if(key==='equipment')return [...d.querySelectorAll('#capacityReferences,.equipment-help .capacity-reference')];
 return [];
}
function stamp(key){return JSON.stringify(sources(key).map(n=>n.textContent))+JSON.stringify(['recipe','referenceSource','referenceYield','referencePortion'].map(id=>$(id)?.value));}
function done(key){return checked.get(key)===stamp(key);}
function close(){if(dialog.open)dialog.close();const target=returnFocus;after=null;opened=null;if(target?.isConnected){target.scrollIntoView({block:'center'});target.focus({preventScroll:true});}}
function show(key,next){
 if(dialog.open)dialog.close();opened=key;after=next;returnFocus=d.activeElement;
 $('bobsReferenceTitle').textContent=key==='recipe'?'Recipe reference — assess suitability':'Equipment references — assess suitability';
 const content=$('bobsReferenceContent');content.replaceChildren();
 const items=sources(key);for(const source of items){let copy=source.cloneNode(true);copy.hidden=false;copy.removeAttribute('hidden');copy.querySelectorAll('button,input,select,textarea').forEach(n=>n.remove());copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));copy.removeAttribute('id');
 if(copy.tagName==='TBODY'){const table=d.createElement('table');table.append(copy);const wrap=d.createElement('div');wrap.className='scroll';wrap.append(table);copy=wrap;}
 copy.querySelectorAll('a').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});content.append(copy);
 }
 if(!items.length){content.textContent='No reference is available for this section yet. Return and load or provide a verified reference before confirming.';}
 $('bobsReferenceAcknowledged').checked=false;$('bobsReferenceAcknowledged').disabled=!items.length;$('bobsReferenceContinue').disabled=true;$('bobsReferenceStatus').textContent='Opening this popup does not confirm the reference or save your data.';dialog.showModal();
}
$('bobsReferenceAcknowledged').onchange=()=>{$('bobsReferenceContinue').disabled=!$('bobsReferenceAcknowledged').checked;};
$('bobsReferenceContinue').onclick=()=>{if(!$('bobsReferenceAcknowledged').checked||!opened)return;checked.set(opened,stamp(opened));const next=after;close();root.dispatchEvent(new Event('bobs-review-context'));next?.();};
$('bobsReferenceClose').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
function keyFor(n){if(n?.id==='referenceWeightReviewed'&&$('referenceEvidence'))return 'recipe';if(n?.id==='capacityReviewed'&&$('capacityReferences'))return 'equipment';return null;}
function ensure(n,next){const key=keyFor(n);if(!key||done(key))return false;show(key,next);return true;}
function install(){
 const section=$('referenceSection');if(section&&!$('openRecipeReference')){
 const b=d.createElement('button');b.type='button';b.id='openRecipeReference';b.className='bobs-reference-launch';b.textContent='Review recipe reference, assumptions and sources';b.onclick=()=>show('recipe');section.querySelector('h2')?.after(b);
 for(const n of sources('recipe')){if(n.id==='referenceRows')n.closest('.scroll').hidden=true;else n.hidden=true;}
 }
 const equipment=$('capacityReferences');if(equipment&&!$('openEquipmentReferences')){const b=d.createElement('button');b.type='button';b.id='openEquipmentReferences';b.className='bobs-reference-launch';b.textContent='Review equipment references and sources';b.onclick=()=>show('equipment');equipment.before(b);equipment.hidden=true;}
}
root.BOBS_REFERENCE={show,ensure,reviewed:done,needs(n){const key=keyFor(n);return !!key&&!done(key);}};
new MutationObserver(records=>{if(records.every(r=>dialog.contains(r.target)))return;install();}).observe(d.body,{subtree:true,childList:true});
install();
})(window);
