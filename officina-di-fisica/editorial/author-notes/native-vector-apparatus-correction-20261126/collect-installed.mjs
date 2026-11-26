import fs from 'node:fs';import path from 'node:path';import{pathToFileURL}from'node:url';import{createHash}from'node:crypto';
const root=path.resolve(process.argv[2]);const {esperienza}=await import(pathToFileURL(process.argv[3]??path.join(root,'static/js/banchi/voci/esperimento.js')));const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');const cases=[];const target=[];let grids=0;
for(const course of ['C1','C2','C3','C4','C5','C6'])for(const row of JSON.parse(fs.readFileSync(path.join(root,'content/esperienze-'+course+'.json')))){
 const activity=await esperienza(row),a=row.control,n=Math.round((a.max-a.min)/a.step);const entry={id:row.id,sourceSha256:digest(row),teaching:activity.record,scene:activity.scene.spec,legend:activity.legend(),states:[]};
 for(let i=0;i<=n;i++){
  const x=a.min+i*a.step;grids++;const duration=activity.clock?.duration(x);const times=activity.clock?(activity.clock.input?[x]:[0,duration/4,duration]):[null];
  for(const time of times)for(const stage of [0,1,2,3,4]){
   const elements=activity.elements(x,stage,time===null?undefined:time);entry.states.push({x,time,stage,model:digest(activity.model.solve({x})),measurement:digest(activity.measurement(x)),primitives:digest(elements),nonLabels:digest(elements.filter(e=>e.kind!=='label'))});
   if(!row.engine&&row.apparatus==='vettori')target.push({id:row.id,x,time,stage,elements,legend:activity.legend(),model:activity.model.solve({x}),measurement:activity.measurement(x)});
  }
 }
 cases.push(entry);
}
console.log(JSON.stringify({scope:'Actual installed source consumer invariance baseline, not scientific acceptance',records:cases.length,gridInputs:grids,states:cases.reduce((n,r)=>n+r.states.length,0),cases,target,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
