/* Navigation context only; never owns business data or save verification. */
(function(root){'use strict';if(root.BOBS_WINDOW_RETURN)return;
const base=new URL('.',root.location.href);
function safe(value){try{const u=new URL(value,base);return u.origin===base.origin&&!u.username&&!u.password&&u.pathname.startsWith(base.pathname)&&/^[a-z0-9-]+\.html$/i.test(u.pathname.slice(base.pathname.length))&&u.href.length<12000?u.href:null}catch(e){return null}}
function parentAddress(){let value=new URL(root.location.href).searchParams.get('returnTo');if(value)return safe(value);try{if(root.opener&&!root.opener.closed)return safe(root.opener.top.location.href)}catch(e){}return safe(root.document.referrer)}
const recordedParent=parentAddress();
function child(value){const address=safe(value);if(!address)return value;const u=new URL(address);let parent=root.location.href;try{parent=root.top.location.href}catch(e){}u.searchParams.set('returnTo',parent);return u.href}
function notify(message,channels=[]){try{if(root.opener&&!root.opener.closed)root.opener.postMessage(message,root.location.origin)}catch(e){console.warn('Parent notification failed',e)}for(const name of channels){let channel;try{if(root.BroadcastChannel){channel=new root.BroadcastChannel(name);channel.postMessage(message)}}catch(e){console.warn('Window notification failed',e)}finally{try{channel?.close()}catch(e){}}}}
function returnToParent(fallback,resume){let parent=null;try{if(root.opener&&!root.opener.closed&&safe(root.opener.top.location.href)){parent=root.opener;parent.top.focus();root.close();if(root.closed)return true}}catch(e){}const destination=recordedParent||safe(fallback);if(!destination)return false;const target=new URL(destination);if(resume?.page===target.pathname.split('/').pop()&&/^[a-z][a-z0-9_-]*$/i.test(resume.hash||''))target.hash=resume.hash;if(resume?.page===target.pathname.split('/').pop()&&/^[-\w]{1,100}$/.test(resume.salaryPackageKey||''))target.searchParams.set('salaryPackageKey',resume.salaryPackageKey);root.location.assign(target.href);return true}
function afterSave(fallback,resume){if(!recordedParent&&!fallback){try{if(!root.opener||root.opener.closed)return false}catch(e){return false}}root.setTimeout(()=>returnToParent(fallback,resume),0);return true}

/* Reuse an already-open same-site working page without reloading its draft.
   Registry is shared by related opener windows; unrelated browser sessions are not enumerable. */
function identity(value){const address=safe(value);if(!address)return null;const u=new URL(address);for(const k of ['returnTo','guide'])u.searchParams.delete(k);if(['method2-item.html','production-plan.html'].includes(u.pathname.split('/').pop()))u.searchParams.delete('mode');u.searchParams.sort();u.hash='';return u.href;}
function owner(){let w=root.top;try{const seen=new Set();while(w.opener&&!w.opener.closed&&!seen.has(w.opener)&&safe(w.opener.top.location.href)){seen.add(w);w=w.opener.top;}}catch(_){}return w;}
function registry(){try{const w=owner();return w.__BOBS_OPEN_WORKSPACES||(w.__BOBS_OPEN_WORKSPACES=new Set());}catch(_){return root.__BOBS_OPEN_WORKSPACES||(root.__BOBS_OPEN_WORKSPACES=new Set());}}
function findOpen(address){const key=identity(address);if(!key)return null;const windows=registry();windows.add(root.top);for(const w of [...windows]){try{if(w.closed){windows.delete(w);continue;}if(identity(w.location.href)===key)return w;}catch(_){windows.delete(w);}}return null;}
function openWorkspace(address){const url=child(address);if(!safe(url))return null;const existing=findOpen(url);if(existing){existing.focus();return existing;}const w=root.open(url,'_blank');if(w)registry().add(w);return w;}
registry().add(root.top);

root.BOBS_WINDOW_RETURN={safe,child,notify,returnToParent,afterSave,identity,findOpen,openWorkspace};
root.document.addEventListener('click',e=>{const a=e.target.closest?.('a');if(a?.target==='_blank'&&safe(a.href)){a.href=child(a.href);if(e.type==='click'&&e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();openWorkspace(a.href);return;}a.rel=a.rel.split(/\s+/).filter(v=>v&&!['noopener','noreferrer'].includes(v)).concat('opener').join(' ')}},true);
root.document.addEventListener('auxclick',e=>{const a=e.target.closest?.('a');if(a?.target==='_blank'&&safe(a.href)){a.href=child(a.href);a.rel=a.rel.split(/\s+/).filter(v=>v&&!['noopener','noreferrer'].includes(v)).concat('opener').join(' ')}},true);
})(window);
