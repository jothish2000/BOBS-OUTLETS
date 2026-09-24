(function(root){'use strict';
const W={};
W.num=v=>{v=Number(v);return Number.isFinite(v)?v:null};
W.mins=t=>{if(!/^\d\d:\d\d$/.test(t||''))return null;let [h,m]=t.split(':').map(Number);return h*60+m};
W.time=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
W.cycles=(qty,cap)=>qty>0&&cap>0?Math.ceil(qty/cap):0;
W.profile=p=>{const qty=W.num(p.qty),cap=W.num(p.capacity),setup=W.num(p.setup)||0,active=W.num(p.active)||0,machine=W.num(p.machine)||0,finish=W.num(p.finish)||0,clean=W.num(p.clean)||0,cycles=W.cycles(qty,cap),equipmentMinutes=cycles*machine,activeMinutes=setup+cycles*(active+finish)+clean,elapsedMinutes=setup+cycles*(active+machine+finish)+clean;return {...p,cycles,equipmentMinutes,activeMinutes,elapsedMinutes};};
W.consolidate=profiles=>{const seen=new Set(),out=[];for(const raw of profiles){const p=W.profile(raw);if(p.shared&&p.sharedKey){const k=p.sharedKey.trim().toLowerCase();if(seen.has(k))continue;seen.add(k)}out.push(p)}return out};
W.overlaps=(a,b)=>a.start<b.end&&b.start<a.end;
W.plan=(profiles,positions=[])=>{const tasks=[],warnings=[];for(const p of W.consolidate(profiles)){const start=W.mins(p.start);if(start===null||!p.role||!p.qty||!p.capacity){warnings.push((p.name||'Item')+': incomplete start/role/quantity/capacity');continue}if(!(p.elapsedMinutes>0)){warnings.push((p.name||'Item')+': incomplete production timing; enter hands-on and/or machine minutes');continue}tasks.push({name:p.name,role:p.role,start,end:start+p.elapsedMinutes,activeMinutes:p.activeMinutes,equipmentMinutes:p.equipmentMinutes,elapsedMinutes:p.elapsedMinutes,equipment:p.equipment||'',cycles:p.cycles,position:p.position||''})}
for(let i=0;i<tasks.length;i++)for(let j=i+1;j<tasks.length;j++){if(tasks[i].position&&tasks[i].position===tasks[j].position&&W.overlaps(tasks[i],tasks[j]))warnings.push('Entered production windows overlap: '+tasks[i].position+' — '+tasks[i].name+' / '+tasks[j].name);if(tasks[i].equipment&&tasks[i].equipment.toLowerCase()===tasks[j].equipment.toLowerCase()&&W.overlaps(tasks[i],tasks[j]))warnings.push('Equipment conflict: '+tasks[i].equipment+' — '+tasks[i].name+' / '+tasks[j].name)}
const by={};for(const t of tasks){const k=t.position||'UNFILLED:'+t.role;(by[k]??=[]).push(t)}
const summary=Object.entries(by).map(([position,ts])=>({position,role:ts[0].role,activeMinutes:ts.reduce((a,x)=>a+x.activeMinutes,0),equipmentMinutes:ts.reduce((a,x)=>a+x.equipmentMinutes,0),span:Math.max(...ts.map(x=>x.end))-Math.min(...ts.map(x=>x.start)),tasks:ts.length}));
return {tasks,summary,warnings,complete:!warnings.some(x=>x.includes('incomplete'))};};
W.replenishment=(prepared,remaining,usePerMin,lead,demand)=>{prepared=W.num(prepared);remaining=W.num(remaining);usePerMin=W.num(usePerMin);lead=W.num(lead);if(!(prepared>0)||remaining===null||!(usePerMin>0)||!(lead>=0))return {state:'Incomplete'};const used=(prepared-remaining)/prepared;const minutesLeft=remaining/usePerMin;return {usedPct:used*100,minutesLeft,state:demand&&used>=.75?(minutesLeft<lead?'Possible stockout':'Prepare replenishment'):'No trigger'}};
root.Workload=W;
})(window);