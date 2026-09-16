(function(){'use strict';
function decorate(){document.querySelectorAll('.batchPanel').forEach(panel=>{const f=panel.querySelector('.formatSelect');if(!f)return;const c=f.dataset.cat,i=Number(f.dataset.i),item=window.ITEM_DATA?.[c]?.[i];if(!item)return;panel.querySelectorAll('.m2v-line > span,.m2-f-line > span,.m2-right-line > span').forEach(label=>{if(label.querySelector('a'))return;const title=label.textContent.trim();if(!/^Item \/ Recipe Master COGS|^Condiment COGS/.test(title))return;const url=new URL('recipe-cost-editor.html',location.href);url.searchParams.set('item',item.name);if(title.startsWith('Condiment')){url.searchParams.set('kind','condiment');try{const s=JSON.parse(localStorage.getItem('method2-item-state')||'{}');url.searchParams.set('names',JSON.stringify((s.condiments?.[c+'::'+i]||[]).map(r=>r.recipeName||r.name)))}catch(e){}}const a=document.createElement('a');a.href=url.href;a.target='_blank';a.textContent=title+' ↗';label.replaceChildren(a)})})}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate()})}
function receive(d){if(d?.type!=='bobs-recipe-master-saved'||!Array.isArray(d.recipes))return;window.BOBS_METHOD2_RM_RECIPES=d.recipes;document.dispatchEvent(new Event('bobs-method2-rm-ready'))}
window.addEventListener('message',e=>{if(e.origin===location.origin)receive(e.data)});
if(window.BroadcastChannel){const channel=new BroadcastChannel('bobs-recipe-master');channel.onmessage=e=>receive(e.data)}
function boot(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});decorate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
