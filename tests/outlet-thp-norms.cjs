const {test}=require('node:test'),assert=require('node:assert/strict'),F=require('../bobs-outlet-flow-core.js'),norms=require('./fixtures/thp-norms.json');
const copy=()=>structuredClone(norms),near=(a,b)=>assert(Math.abs(a-b)<1e-7,a+' != '+b);
test('owner XLS and live Google example reconcile THP, CTC and 31-day expense',()=>{
 const r=F.thp(15000,norms);near(r.gross,16170.2127659574);near(r.net,15000);near(r.ctc,22290.6382978723);near(r.daily,719.052848318463);assert.equal(r.meal,2080);near(r.bonus,r.gross/12);near(r.employerEps+r.employerEpf,r.pfWage*.12);
});
test('PF ceiling, higher-wage mode and configured 10-percent rates preserve net target',()=>{
 let r=F.thp(40000,norms);assert.equal(r.gross,42000);assert.equal(r.employeePf,1800);assert.equal(r.net,40000);
 const n=copy();n.parameters.higherWage='Yes';r=F.thp(40000,n);near(r.gross,40200/.94);near(r.employeePf,r.basic*.12);near(r.net,40000);
 n.parameters.higherWage='No';n.parameters.pfMode='10% Establishment';n.parameters.employeePfRate=.10;n.parameters.employerPfRate=.10;r=F.thp(15000,n);near(r.gross,15200/.95);near(r.employerEps+r.employerEpf,r.pfWage*.10);
});
test('optional deductions are included in reverse gross, while benefits stay outside take-home',()=>{
 const n=copy();n.parameters.deduction1=500;n.parameters.deduction5=250;n.parameters.benefit2=100;n.parameters.bonusEligible='No';
 const r=F.thp(15000,n);near(r.gross,15950/.94);near(r.net,15000);assert.equal(r.extraDeductions,750);assert.equal(r.benefits,100);assert.equal(r.bonus,0);near(r.ctc,r.target+r.deductions+r.employerAdditions);
});
test('missing, invalid and unsupported norms never invent zero costs',()=>{
 for(const value of [null,undefined,{}, {...norms,engineVersion:'future'}])assert.throws(()=>F.thp(15000,value),/norms/);
 for(const value of ['',null,-1,'wrong',Infinity]){const n=copy();n.parameters.medicalAnnual=value;assert.throws(()=>F.thp(15000,n),/medicalAnnual/)}
 for(const target of ['',null,0,-1,'text'])assert.throws(()=>F.thp(target,norms),/positive/);
 const n=copy();n.parameters.basicPct=1;n.parameters.hraPct=0;n.parameters.employeePfRate=1;assert.throws(()=>F.thp(15000,n),/structure/);
});
test('saved budgets retain exact norm snapshots and reject stale or tampered salary data',()=>{
 const p=F.useThp({id:'M1',role:'Cashier',takeHome:15000},norms),b={positions:[p]};
 near(F.salary(F.fund(b,null,null,'1',norms).positions[0]),22290.6382978723);assert.equal(p.salaryBasis,'THP_NORMS_V1');
 const changed=copy();changed.parameters.mealPerDay=90;assert.throws(()=>F.fund(b,null,null,'1',changed),/changed/);
 for(const field of ['deductions','employerAdditions']){const bad=structuredClone(b);bad.positions[0][field]='wrong';assert.throws(()=>F.fund(bad,null,null,'1',norms))}
 const bad=structuredClone(b);bad.positions[0].salaryBreakdown.ctc=0;assert.throws(()=>F.fund(bad,null,null,'1',norms),/breakdown/);
 assert.notEqual(F.stamp(F.salaryContext(b,null,norms)),F.stamp(F.salaryContext(b,null,changed)));
 assert.deepEqual(F.salaryContext({positions:[]},null,norms),{});
});
test('linked actual employees retain their recorded package and legacy records are not rewritten',()=>{
 const linked={id:'M1',staffId:'E1',takeHome:15000};assert.deepEqual(F.useThp(linked,null),linked);
 const b=F.fund({positions:[linked]},{staff:[{staffId:'E1',monthlyCtc:31000}]},{allocations:{E1:{1:50}}},'1',norms);assert.equal(F.salary(b.positions[0]),15500);
 const legacy={positions:[{id:'Old',takeHome:15000,deductions:0,employerAdditions:0}]};assert.deepEqual(F.fund(legacy,null,null,'1',null),legacy);assert.equal(legacy.positions[0].salaryNorms,undefined);
});
