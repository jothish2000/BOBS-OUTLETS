/* Backward schedule from the first idli batch's required ready time. Planning values are editable. */
(function(root){'use strict';
const IdliTimeline={};
const defaults={ready:'07:00',soak:240,soakWork:10,grind:45,grindWork:25,ferment:480,setup:20,steam:15,steamWork:5,unload:5,cleanup:15,assignees:{}};
const roles={soak:'Helper / Prep',grind:'Grinder / Prep',ferment:'No continuous worker',setup:'Cook / Tiffin Master',steam:'Cook / Tiffin Master',unload:'Cook / Tiffin Master',cleanup:'Helper / Prep'};
const fields=['soak','soakWork','grind','grindWork','ferment','setup','steam','steamWork','unload','cleanup'];
IdliTimeline.defaults=()=>({...defaults,assignees:{}});
IdliTimeline.roles=roles;
IdliTimeline.fields=fields;
IdliTimeline.clock=m=>{const day=Math.floor(m/1440),clock=((m%1440)+1440)%1440,h=String(Math.floor(clock/60)).padStart(2,'0'),mm=String(clock%60).padStart(2,'0');return (day<0?'Previous day ':day>0?'Following day ':'Ready day ')+h+':'+mm};
IdliTimeline.schedule=(raw,qty,capacity)=>{
 const x={...defaults,...raw,assignees:{...raw?.assignees}},errors=[];
 const ready=/^([01]\d|2[0-3]):[0-5]\d$/.test(x.ready||'')?Number(x.ready.slice(0,2))*60+Number(x.ready.slice(3)):null;
 if(ready===null)errors.push('Enter a valid first-batch ready time.');
 const n=Number(qty),c=Number(capacity),cycles=n>0&&c>0?Math.ceil(n/c):0;
 if(!Number.isFinite(n)||!Number.isFinite(c)||cycles<1||cycles>30)errors.push('Enter planned quantity and batch capacity (1–30 cycles).');
 for(const key of fields){const v=Number(x[key]);if(x[key]===''||!Number.isFinite(v)||!Number.isInteger(v)||v<0||v>1440)errors.push('Enter valid minutes for '+key+'.');else x[key]=v}
 for(const key of ['soak','grind','ferment','steam','unload'])if(x[key]===0)errors.push(key+' must have a positive duration.');
 for(const [work,total] of [['soakWork','soak'],['grindWork','grind'],['steamWork','steam']])if(x[work]>x[total])errors.push(work+' cannot exceed '+total+'.');
 if(errors.length)return {errors,stages:[],cycles:0,staff:[]};
 const cycle=x.steam+x.unload,firstSteam=ready-cycle,setupStart=firstSteam-x.setup,fermentStart=setupStart-x.ferment,grindStart=fermentStart-x.grind,soakStart=grindStart-x.soak;
 const stages=[];
 function add(id,label,start,end,work,machine=0){stages.push({id,label,start,end,work,machine,assignee:String(x.assignees[id]||'').trim(),role:roles[id]})}
 add('soak','Wash and start soaking',soakStart,grindStart,x.soakWork);
 add('grind','Grind and mix batter',grindStart,fermentStart,x.grindWork,x.grind);
 add('ferment','Batter resting / fermentation',fermentStart,setupStart,0);
 add('setup','Prepare steamer and trays',setupStart,firstSteam,x.setup);
 for(let i=0;i<cycles;i++){const start=firstSteam+i*cycle;add('steam','Steam batch '+(i+1),start,start+x.steam,x.steamWork,x.steam);add('unload','Remove batch '+(i+1)+' — ready',start+x.steam,start+cycle,x.unload)}
 const lastReady=ready+(cycles-1)*cycle;add('cleanup','Clean after final batch',lastReady,lastReady+x.cleanup,x.cleanup);
 const people=new Map(),unassigned=new Map(),events=[];for(const s of stages){if(!s.work)continue;const bucket=s.assignee?people:unassigned,key=s.assignee||s.role;bucket.set(key,(bucket.get(key)||0)+s.work);events.push([s.start,1],[s.start+s.work,-1])}
 events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let concurrent=0,maxConcurrent=0;for(const [,delta] of events){concurrent+=delta;maxConcurrent=Math.max(maxConcurrent,concurrent)}
 return {errors:[],stages,cycles,firstReady:ready,lastReady,maxConcurrent,activeMinutes:stages.reduce((v,s)=>v+s.work,0),staff:[...people].map(([name,minutes])=>({name,minutes})),unassigned:[...unassigned].map(([role,minutes])=>({role,minutes})),assigneesComplete:unassigned.size===0};
};
root.IdliTimeline=IdliTimeline;
})(window);
