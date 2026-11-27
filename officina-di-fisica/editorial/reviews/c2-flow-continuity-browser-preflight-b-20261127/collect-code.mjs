// Installed CPU source replay only: never imports Playwright or creates a browser.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const app=process.argv[2];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const {n}=await import(pathToFileURL(app+'/static/js/banchi/misure.js'));
const originals=JSON.parse(readFileSync(app+'/content/esperienze-C2.json'));
const drafts=JSON.parse(readFileSync(new URL('./inputs/experiment-c2-flow-continuity-reading-20261127.json',import.meta.url))).records;
const ids=drafts.map(r=>r.id),rows=[];
const sha=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
for(const id of ids) for(const variant of ['published','draft']) {
 const record=variant==='published'?originals.find(r=>r.id===id):drafts.find(r=>r.id===id);
 const a=await esperienza(record),states=[],c=record.control;
 for(let i=0;i<=Math.round((c.max-c.min)/c.step);i++){
  const x=c.min+i*c.step,solve=a.model.solve({x}),clock=[];
  if(a.clock) for(const fraction of [0,.25,.5,.75,1]){
   const time=a.clock.duration(x,solve.y)*fraction;
   clock.push({time,signal:a.clock.signal?.(x,time,solve.y),solve:a.model.solve({x}),elementsSha256:sha(a.elements(x,2,time))});
  }
  states.push({x,solve,display:n(solve.y),measurement:a.measurement(x),elementsSha256:sha(a.elements(x,2)),clock});
 }
 rows.push({id,variant,record,states,params:a.model.params,spec:a.scene.spec,
  questions:a.record.assessment,questionDisplays:a.record.assessment.map(t=>n(t.value)),prediction:a.record.prediction.correct,
  clock:a.clock?{input:!!a.clock.input,unit:a.clock.clockUnit,duration:a.clock.duration(record.references[0][0],record.references[0][1]),label:a.clock.label,setup:a.clock.setup}:null,
  legends:['orbit','side','top','diagram'].map(v=>a.legend(2,v))});
}
for(const id of ids){const [p,d]=rows.filter(r=>r.id===id);assert.deepEqual(p.states,d.states);assert.deepEqual(p.params,d.params);assert.deepEqual(p.spec,d.spec);assert.deepEqual(p.clock,d.clock);}
console.log(JSON.stringify({phase:'CPU_ONLY_NO_BROWSER',rows}));
