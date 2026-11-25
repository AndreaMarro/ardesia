// Bounded installed-consumer collection only; this never mounts UI or grants credit.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {esperienza} from '../../static/js/banchi/voci/esperimento.js';
import {n} from '../../static/js/banchi/misure.js';

const groups={
  'flow-continuity':Array.from({length:5},(_,i)=>`SIM-C2-L005-0${i+1}`),
  'bernoulli':Array.from({length:4},(_,i)=>`SIM-C2-L006-0${i+1}`),
  'viscosity-poiseuille':[...Array.from({length:5},(_,i)=>`SIM-C2-L007-0${i+1}`),...Array.from({length:4},(_,i)=>`SIM-C2-L008-0${i+1}`)],
  'networks':Array.from({length:3},(_,i)=>`SIM-C2-L009-0${i+1}`),
  'capillarity':Array.from({length:5},(_,i)=>`SIM-C2-L010-0${i+1}`),
};
const group=process.argv[2],ids=groups[group];
if(!ids||ids.length>9)throw Error('Unknown or unbounded C2 group');
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sourceRef='5d1dc8dc7b601aef959d10d564c75462be74708d';
const sourcePath='officina-di-fisica/content/esperienze-C2.json';
const raw=execFileSync('git',['show',sourceRef+':'+sourcePath],{cwd:app});
const rows=JSON.parse(raw).filter(r=>ids.includes(r.id));
if(rows.length!==ids.length||new Set(rows.map(r=>r.id)).size!==ids.length)throw Error('Source identity incomplete');
const records=[];
for(const row of rows){
  const a=await esperienza(row),c=row.control,count=Math.round((c.max-c.min)/c.step)+1,cases=[];
  for(let i=0;i<count;i++){
    const x=c.min+i*c.step,s=a.model.solve({x}),clockSamples=[];
    const duration=a.clock?a.clock.duration(x,s.y):null;
    if(a.clock){
      if(!Number.isFinite(duration)||duration<0)throw Error('Invalid clock duration');
      for(const fraction of [0,.25,.5,.75,1]){
        const time=duration*fraction,actualInput=a.clock.input?time:x;
        const state=a.model.solve({x:actualInput});
        clockSamples.push({time,input:actualInput,solve:state,
          signal:a.clock.signal?a.clock.signal(actualInput,time,state.y):null,
          readings:a.model.readings({x:actualInput},state,time),elements:a.elements(x,2,time)});
      }
    }
    cases.push({x,solve:s,readings:a.model.readings({x},s),elements:a.elements(x,2),
      graphs:a.model.graphs({x},s),steps:a.model.steps({x},s),measurement:a.measurement(x),
      duration,clockSamples});
  }
  records.push({id:row.id,sourceVersion:row.version,params:a.model.params,clock:a.clock,
    prediction:a.record.prediction,assessment:a.record.assessment,spec:a.scene.spec,
    legend:a.legend(),observe:a.observe,cases,
    assessmentFormat:a.record.assessment.map(t=>({value:t.value,display:n(t.value),parsed:Number(n(t.value).replace(',','.'))}))});
}
console.log(JSON.stringify({phase:'INSTALLED_CODE_COLLECTION_ONLY_NOT_UI',group,sourceRef,sourcePath,
  sourceFileSha256:createHash('sha256').update(raw).digest('hex'),
  protocolSha256:createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex'),
  sourceIds:ids,records,UI:'NOT_RUN',scientificApproval:false,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
