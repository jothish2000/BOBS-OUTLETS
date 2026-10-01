/* Stop the existing parent flow before it leaves Method 2 with incomplete item/packing or workload/staffing stages. */
document.addEventListener('click',function(e){
 if(!e.target.closest('#saveContinueBtn'))return;
 const f=document.getElementById('methodFrame');
 if(!f||!f.getAttribute('src')?.includes('method2.html'))return;
 const itemReview=f.contentWindow?.BOBS_METHOD2_REVIEW;
 const workloadReview=f.contentWindow?.BOBS_METHOD2_WORKLOAD_REVIEW;
 const itemsOk=typeof itemReview==='function'&&itemReview();
 const workloadOk=typeof workloadReview==='function'&&workloadReview();
 if(!itemsOk||!workloadOk){
  e.preventDefault();e.stopImmediatePropagation();
  const note=document.getElementById('saveNote');
  if(note)note.textContent=!itemsOk?'Complete the selected Method 2 items and shared packing first.':'Complete and save the Workload & Staffing stage before finishing Method 2.';
  if(typeof itemReview!=='function'||typeof workloadReview!=='function')alert('Wait for Method 2 and Workload & Staffing checks to finish loading before continuing.');
 }
},true);
window.addEventListener('message',function(e){
 if(e.origin!==location.origin)return;
 const frame=document.getElementById('methodFrame');
 if(!frame?.getAttribute('src')?.includes('method2.html'))return;
 if(e.data?.type==='bobs-method2-selection-saved')frame.contentWindow?.postMessage(e.data,location.origin);
 if(e.data?.type==='bobs-workload-plan-saved')frame.contentWindow?.postMessage(e.data,location.origin);
});