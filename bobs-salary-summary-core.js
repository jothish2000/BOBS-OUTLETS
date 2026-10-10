/* Read-only previews. A preview never supplies eligibility for a saved package. */
(function(root){'use strict';
const S={},copy=x=>JSON.parse(JSON.stringify(x));
S.draft=(p,P,norms)=>{const v=copy(p||P.defaults(norms));if(!v.da)v.da={enabled:false,basis:'percentBasic',value:0};return v};
S.preview=(target,p,norms,P)=>{
 const v=copy(p),assumptions=[];let assumedEsi=false;
 if(!['yes','no'].includes(v.pf)){v.pf='yes';assumptions.push('PF coverage assumed for this preview; confirm eligibility.');}
 if(v.pf==='yes'&&!['yes','no'].includes(v.eps)){v.eps='yes';assumptions.push('EPS membership assumed; confirm membership.');}
 for(const k of ['pf','esi'])if(v[k]==='no'&&!String(v[k+'Reason']||'').trim()){v[k+'Reason']='Preview only — reason pending';assumptions.push('Record the reason '+k.toUpperCase()+' does not apply.');}
 if(!['yes','no'].includes(v.esi)){v.esi='yes';v.esiContinuation=true;assumedEsi=true;}
 if(!v.eligibilityConfirmed)assumptions.push('Eligibility, qualifying wages and applicable wage requirements still need your review.');
 v.eligibilityConfirmed=true;
 let value=P.calculate(target,v,norms);
 if(assumedEsi){if(value.esiWage>norms.payrollRules.esiCeiling){v.esi='no';v.esiReason='Preview only — above general ceiling';value=P.calculate(target,v,norms);assumptions.push('ESI excluded in this preview because wages exceed the general ceiling; confirm continuing coverage.');}else assumptions.push('ESI coverage assumed for this preview; confirm eligibility and any employee exemption.');}
 return {value,assumptions};
};
root.BOBS_SALARY_SUMMARY=S;if(typeof module!=='undefined')module.exports=S;
})(typeof window==='undefined'?globalThis:window);
