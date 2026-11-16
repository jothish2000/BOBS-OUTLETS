/* Navigation context only; never owns business data or save verification. */
(function(root){'use strict';if(root.BOBS_WINDOW_RETURN)return;
const base=new URL('.',root.location.href);
function safe(value){
 if(typeof value!=='string'||!value.trim())return null;
 try{
  const url=new URL(value,base);
  if(url.origin!==base.origin||url.username||url.password||!url.pathname.startsWith(base.pathname))return null;
  const page=url.pathname.slice(base.pathname.length);
  if(!page)url.pathname+='index.html';
  else if(/^[a-z0-9-]+$/i.test(page))url.pathname+='.html';
  else if(!/^[a-z0-9-]+\.html$/i.test(page))return null;
  return url.href.length<12000?url.href:null;
 }catch{return null}
}
// Only the outlet method workspace owns its embedded method. A Site host owns its own navigation.
function workspace(w){
 try{
  const parent=w.parent;
  if(parent && parent!==w && parent.document.getElementById('methodFrame')?.contentWindow===w &&
     /\/outlet-method-flow(?:\.html)?$/.test(parent.location.pathname))return parent;
 }catch{}
 return w;
}
const working=workspace(root);
function parentAddress(){let value=new URL(root.location.href).searchParams.get('returnTo');if(value)return safe(value);try{if(root.opener&&!root.opener.closed)return safe(workspace(root.opener).location.href)}catch(e){}return safe(root.document.referrer)}
const recordedParent=parentAddress();
let preview=false;
try{const choice=new URL(root.location.href).searchParams.get('preview');if(choice==='1'||choice==='0')root.sessionStorage?.setItem('bobs-navigation-preview',choice);preview=choice==='1'||choice!=='0'&&root.sessionStorage?.getItem('bobs-navigation-preview')==='1';}catch(_){preview=new URL(root.location.href).searchParams.get('preview')==='1';}
function previewAddress(value){const address=safe(value);if(!address)return value;const u=new URL(address);if(preview)u.searchParams.set('preview','1');return u.href;}

function child(value){const address=safe(value);if(!address)return value;const u=new URL(previewAddress(address));let parent=working.location.href;const supplied=safe(u.searchParams.get('returnTo'));if(supplied&&identity(supplied)===identity(parent))parent=supplied;u.searchParams.set('returnTo',parent);return u.href}
function notify(message,channels=[]){try{if(root.opener&&!root.opener.closed)root.opener.postMessage(message,root.location.origin)}catch(e){console.warn('Parent notification failed',e)}for(const name of channels){let channel;try{if(root.BroadcastChannel){channel=new root.BroadcastChannel(name);channel.postMessage(message)}}catch(e){console.warn('Window notification failed',e)}finally{try{channel?.close()}catch(e){}}}}
function resumeAddress(address,resume){const target=new URL(address);if(resume?.page===target.pathname.split('/').pop()&&/^[a-z][a-z0-9_-]*$/i.test(resume.hash||''))target.hash=resume.hash;if(resume?.page===target.pathname.split('/').pop()&&/^[-\w]{1,100}$/.test(resume.salaryPackageKey||''))target.searchParams.set('salaryPackageKey',resume.salaryPackageKey);return target.href;}
function liveCaller(address){
 const key=identity(address);if(!key)return null;
 // A living opener may now be on a different module. Never close into that wrong page.
 const seen=new Set([working]);let w=working;
 try{while(w.opener&&!w.opener.closed&&!seen.has(w.opener)){w=workspace(w.opener);seen.add(w);if(identity(w.location.href)===key)return w;}}catch(_){}
 const found=findOpen(address);return found!==working?found:null;
}
function resumeAt(address,resume){
 const destination=safe(address);if(!destination)return false;
 const parent=liveCaller(destination);
 if(parent){try{parent.focus();}catch(_){}try{parent.postMessage({type:'bobs-window-resume',address:resumeAddress(destination,resume)},root.location.origin);}catch(_){}try{root.close();if(root.closed)return true;}catch(_){} }
 // Browser-created tabs can normally close; directly opened tabs use safe same-window navigation.
 root.location.assign(previewAddress(resumeAddress(destination,resume)));return true;
}
function returnToParent(fallback,resume){return resumeAt(recordedParent||safe(fallback),resume);}
function afterSave(fallback,resume){if(!recordedParent&&!fallback){try{if(!root.opener||root.opener.closed)return false}catch(e){return false}}root.setTimeout(()=>returnToParent(fallback,resume),0);return true}

/* Reuse an already-open same-site working page without reloading its draft.
   Registry is shared by related opener windows; unrelated browser sessions are not enumerable. */
function identity(value){const address=safe(value);if(!address)return null;const u=new URL(address);for(const k of ['returnTo','guide','preview','servingBaseline'])u.searchParams.delete(k);if(['method2-item.html','production-plan.html'].includes(u.pathname.split('/').pop()))u.searchParams.delete('mode');u.searchParams.sort();u.hash='';return u.href;}
function owner(){
 let w=working;
 try{
  const seen=new Set([w]);
  while(w.opener&&!w.opener.closed){
   const next=workspace(w.opener);
   if(seen.has(next)||!safe(next.location.href))break;
   seen.add(next);w=next;
  }
 }catch{}
 return w;
}
function registry(){try{const w=owner();return w.__BOBS_OPEN_WORKSPACES||(w.__BOBS_OPEN_WORKSPACES=new Set());}catch(_){return root.__BOBS_OPEN_WORKSPACES||(root.__BOBS_OPEN_WORKSPACES=new Set());}}
function findOpen(address){const key=identity(address);if(!key)return null;const windows=registry();windows.add(working);for(const w of [...windows]){try{if(w.closed){windows.delete(w);continue;}if(identity(w.location.href)===key)return w;}catch(_){windows.delete(w);}}return null;}
function auxiliary(address){
 const u=new URL(address),page=u.pathname.split('/').pop();
 return /^(?:recipe-cost-editor|purchase-cost-editor|salary-editor|salary-history|method2-select|google-records|asset-master|capital-expenditure|working-capital|fixed-expenses|reverse-thp|equipment-planner|idli-staffing|workload-planner)\.html$/.test(page)||page==='method2-item.html'&&u.searchParams.has('servingRecipe');
}
function openWorkspace(address,options={}){
 const url=child(address);if(!safe(url))return null;
 const existing=findOpen(url);if(existing){existing.focus();return existing;}
 if(!options.auxiliary&&!auxiliary(url)){
  // Native beforeunload guards still run if this page contains unsaved inputs.
  working.location.assign(url);return working;
 }
 const w=root.open(url,'_blank',options.features);if(w)registry().add(w);return w;
}
registry().add(working);

root.BOBS_WINDOW_RETURN={safe,child,notify,returnToParent,afterSave,resumeAt,identity,findOpen,openWorkspace,auxiliary};
root.document.addEventListener('click',e=>{const a=e.target.closest?.('a');if(a?.target==='_blank'&&safe(a.href)){if(e.defaultPrevented)return;a.href=child(a.href);if(e.type==='click'&&e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();openWorkspace(a.href,{auxiliary:a.dataset?.bobsWindow==='auxiliary'});return;}a.rel=a.rel.split(/\s+/).filter(v=>v&&!['noopener','noreferrer'].includes(v)).concat('opener').join(' ')}},true);
root.addEventListener?.('message',e=>{
 if(e.origin!==root.location.origin||e.data?.type!=='bobs-window-resume')return;
 // Only related same-site windows can request a no-reload resume of this exact workspace.
 let related=false;try{related=registry().has(e.source)||e.source===root.opener;}catch(_){}
 if(!related||identity(e.data.address)!==identity(root.location.href))return;
 const u=new URL(e.data.address);if(u.hash)root.location.hash=u.hash;
 root.dispatchEvent(new Event('bobs-guide-resume'));
});
root.document.addEventListener('auxclick',e=>{const a=e.target.closest?.('a');if(a?.target==='_blank'&&safe(a.href)){if(e.defaultPrevented)return;a.href=child(a.href);a.rel=a.rel.split(/\s+/).filter(v=>v&&!['noopener','noreferrer'].includes(v)).concat('opener').join(' ')}},true);
function previewBoot(){
 if(!preview)return;
 const doc=root.document,host=doc.createElement('aside');host.id='bobsClickPreview';host.setAttribute('aria-label','Navigation test preview');
 const text=doc.createElement('span');text.setAttribute('role','status');text.textContent='Preview · '+doc.title;
 const stop=doc.createElement('button');stop.type='button';stop.textContent='Hide preview';stop.onclick=()=>{preview=false;try{root.sessionStorage?.setItem('bobs-navigation-preview','0');const u=new URL(root.location.href);u.searchParams.delete('preview');root.history.replaceState(null,'',u.href);}catch(_){}host.remove();doc.querySelectorAll('.bobs-preview-target').forEach(n=>n.classList.remove('bobs-preview-target'));};host.append(text,stop);
 const style=doc.createElement('style');style.textContent='#bobsClickPreview{position:fixed;left:170px;top:6px;z-index:10050;max-width:min(600px,calc(100vw - 540px));pointer-events:none;padding:8px 12px;background:#163f34;color:#fff;border:2px solid #ffd54f;border-radius:8px;font:14px system-ui;box-shadow:0 2px 8px #0004}#bobsClickPreview button{pointer-events:auto;font:inherit;margin-left:8px;background:#fff;color:#163f34;border:0;border-radius:4px;padding:4px;cursor:pointer}@media(max-width:900px){#bobsClickPreview{left:8px;top:48px;max-width:calc(100vw - 48px);font-size:12px;padding:4px 8px}}.bobs-preview-target{outline:4px solid #e87900!important;outline-offset:4px!important;box-shadow:0 0 0 8px #ffd54f88!important}';doc.head.append(style);doc.body.append(host);
 let target,timer;
 doc.addEventListener('pointerdown',e=>{if(!preview||!host.isConnected||host.contains(e.target))return;const control=e.target.closest?.('button,a,input,select,textarea,summary,label');if(!control)return;if(target)target.classList.remove('bobs-preview-target');target=control;target.classList.add('bobs-preview-target');const label=control.getAttribute('aria-label')||control.labels?.[0]?.textContent||control.textContent||control.id||control.tagName;text.textContent='Clicked · '+String(label).replace(/\s+/g,' ').trim().slice(0,100);clearTimeout(timer);timer=setTimeout(()=>target?.classList.remove('bobs-preview-target'),1600);},true);
}
if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',previewBoot,{once:true});else previewBoot();
})(window);
