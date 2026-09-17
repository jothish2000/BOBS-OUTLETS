/* Stop the existing parent flow before it leaves Method 2 with incomplete items. */
document.addEventListener('click',function(e){
 if(!e.target.closest('#saveContinueBtn'))return;
 const f=document.getElementById('methodFrame');
 if(!f||!f.getAttribute('src')?.includes('method2.html'))return;
 const review=f.contentWindow?.BOBS_METHOD2_REVIEW;
 if(typeof review!=='function'||!review()){
  e.preventDefault();e.stopImmediatePropagation();
  if(typeof review!=='function')alert('Wait for Method 2 Google records to load before continuing.');
 }
},true);

