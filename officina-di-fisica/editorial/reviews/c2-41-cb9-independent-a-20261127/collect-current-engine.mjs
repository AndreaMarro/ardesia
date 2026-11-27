// Independent read-only Node collection; not browser evidence or approval.
import{readFileSync}from'node:fs';import{pathToFileURL}from'node:url';import path from'node:path';import{createHash}from'node:crypto';
const[app,inputs]=process.argv.slice(2);if(!app||!inputs)throw Error('Explicit immutable app and input directory required');
const{esperienza}=await import(pathToFileURL(path.join(app,'static/js/banchi/voci/esperimento.js')));const{n}=await import(pathToFileURL(path.join(app,'static/js/banchi/misure.js')));
const raw=readFileSync(path.join(inputs,'original-esperienze-C2.json'));const originals=JSON.parse(raw),draft=JSON.parse(readFileSync(path.join(inputs,'experiment-stevino-revision-047.json'))).records;
if(originals.length!==41||draft.length!==1||draft[0].id!=='SIM-C2-L002-01'||draft[0].version!==2)throw Error('Exact41 originals and separate Stevino2 required');
const records=[];
for(const[row,variant]of[...originals.map(r=>[r,'original']),...draft.map(r=>[r,'draft'])]){
 const a=await esperienza(row),c=row.control,count=Math.round((c.max-c.min)/c.step)+1,cases=[];
 if(count<1||count>500)throw Error('Unbounded control');
 for(let i=0;i<count;i++){
  const x=c.min+i*c.step,s=a.model.solve({x}),clockSamples=[];const duration=a.clock?a.clock.duration(x,s.y):null;
  if(a.clock){if(!Number.isFinite(duration)||duration<0)throw Error('Invalid clock');for(const fraction of[0,.25,.5,.75,1]){
   const time=duration*fraction,input=a.clock.input?time:x,state=a.model.solve({x:input});clockSamples.push({time,input,solve:state,signal:a.clock.signal?a.clock.signal(input,time,state.y):null,readings:a.model.readings({x:input},state,time),elements:a.elements(x,2,time)});
  }}
  cases.push({x,solve:s,readings:a.model.readings({x},s),elements:a.elements(x,2),allStageElements:[0,1,2,3,4].map(stage=>a.elements(x,stage)),graphs:a.model.graphs({x},s),steps:a.model.steps({x},s),measurement:a.measurement(x),duration,clockSamples});
 }
 records.push({id:row.id,editionKey:`${row.id}@${row.version}:${variant}`,variant,sourceVersion:row.version,params:a.model.params,clock:a.clock,prediction:a.record.prediction,assessment:a.record.assessment,spec:a.scene.spec,legend:a.legend(),observe:a.observe,cases,assessmentFormat:a.record.assessment.map(t=>({value:t.value,display:n(t.value),parsed:Number(n(t.value).replace(',','.'))}))});
}
console.log(JSON.stringify({schemaVersion:'1.0.0',phase:'FRESH_INSTALLED_CODE_ONLY_NOT_UI',sourceFileSha256:createHash('sha256').update(raw).digest('hex'),records,UI:'NOT_RUN',scientificApproval:false,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
