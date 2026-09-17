/* BOBS Recipe Cost Editor UX — persistent Save button, verified status, safe Close. */
(function(){'use strict';
const $=id=>document.getElementById(id);let edited=false;
function stampSaved(){edited=false;const s=$('saveState');if(s)s.textContent='✓ Saved to Google — '+new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});}
function markUnsaved(){edited=true;const s=$('saveState');if(s)s.textContent='● Unsaved changes';}
function closeEditor(){if(edited&&!confirm('You have unsaved recipe changes. Close anyway?'))return;if(window.opener&&!window.opener.closed){window.opener.focus();window.close()}else if(history.length>1)history.back();else location.href='recipe-master.html'}
function boot(){const form=$('editor'),status=$('status');if(!form)return;
 form.addEventListener('input',markUnsaved,true);form.addEventListener('change',markUnsaved,true);
 $('add')?.addEventListener('click',markUnsaved);$('gas')?.addEventListener('click',markUnsaved);
 $('closeTop')?.addEventListener('click',closeEditor);$('closeBottom')?.addEventListener('click',closeEditor);
 if(status)new MutationObserver(()=>{const t=status.textContent||'';if(/^Saved and read back from Google\./.test(t))stampSaved();else if(/Loaded recipe\./.test(t)&&!edited){const s=$('saveState');if(s)s.textContent='✓ Current Google version loaded'}}).observe(status,{childList:true,subtree:true,characterData:true});
 const save=$('save');if(save){save.textContent='Save shared recipe to Google';save.addEventListener('click',()=>{const s=$('saveState');if(s)s.textContent='Saving & verifying…'})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();