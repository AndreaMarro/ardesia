import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const [app,packagePath]=process.argv.slice(2),pack=JSON.parse(readFileSync(packagePath));
const course=pack.records[0].course;
assert.ok(pack.records.every(r=>r.course===course));
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const {n}=await import(pathToFileURL(app+'/static/js/banchi/misure.js'));
const sources=JSON.parse(readFileSync(app+'/content/esperienze-'+course+'.json'));
const hash=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');const results=[];
for(const draft of pack.records)for(const [variant,record]of [['published',sources.find(r=>r.id===draft.id)],['draft',draft]]){
 const a=await esperienza(record),c=record.control,states=[];
 for(let i=0;i<=Math.round((c.max-c.min)/c.step);i++){
  const x=c.min+i*c.step,s=a.model.solve({x}),elements=a.elements(x,2),clock=[];
  if(a.clock)for(const f of [0,.25,.5,.75,1]){
   const time=a.clock.duration(x,s.y)*f;
   clock.push({time,signal:a.clock.signal?.(x,time,s.y),elementsSha256:hash(a.elements(x,2,time))});
  }
  const rods=elements.filter(e=>e.kind==='rod');
  const column=record.apparatus==='termometro'?rods.find(e=>e.r===.085):null;
  const bulb=record.apparatus==='termometro'?elements.find(e=>e.kind==='ball'):null;
  states.push({x,clockDurationAtThisInput:a.clock?.duration(x,s.y)??null,solve:s,measurement:a.measurement(x),elementsSha256:hash(elements),clock,
   arrows:elements.filter(e=>e.kind==='arrow'),
   piston:record.apparatus==='pistone'?{gasBottom:rods[1].a[1],gasTop:rods[1].b[1],pistonBase:rods[2].a[1],pistonTop:rods[2].b[1]}:null,
   thermometer:column?{columnTop:column.b[1],bulbTop:bulb.p[1]+bulb.r}:null});
 }
 results.push({id:record.id,variant,record,states,params:a.model.params,spec:a.scene.spec,
  clock:a.clock?{input:!!a.clock.input,unit:a.clock.clockUnit}:null,
  prediction:a.record.prediction.correct,questions:a.record.assessment,questionDisplays:a.record.assessment.map(t=>n(t.value))});
}
for(const draft of pack.records){const [p,d]=results.filter(r=>r.id===draft.id);assert.deepEqual(p.states,d.states);assert.deepEqual(p.params,d.params);assert.deepEqual(p.spec,d.spec);assert.deepEqual(p.clock,d.clock);}
console.log(JSON.stringify({phase:'CPU_ONLY_NOT_BROWSER',course,results}));
