// Independent acquisition of compiled actual tasks; no answer evaluator modifications.
import {readFileSync,writeFileSync}from'node:fs';
import {pathToFileURL,fileURLToPath}from'node:url';
import {createHash}from'node:crypto';
import assert from'node:assert/strict';
const APP=process.argv[2],D=fileURLToPath(new URL('./',import.meta.url));
const {esperienza}=await import(pathToFileURL(APP+'/static/js/banchi/voci/esperimento.js'));
const originals=JSON.parse(readFileSync(APP+'/content/esperienze-C3.json'));
const pkg=JSON.parse(readFileSync(D+'candidate.verbatim.json'));
const grids=[[-20,-5,0,10,30,50],[-20,-10,0,20,30],[-20,-10,0,20,30],[-1,-.75,0,1.5,2]];
const rows=[];
for(let i=0;i<pkg.records.length;i++){
 const draft=pkg.records[i],source=originals.find(r=>r.id===draft.id),a=await esperienza(source),b=await esperienza(draft),states=[];
 for(const x of grids[i]){
  const sm=a.model.solve({x}),dm=b.model.solve({x});assert.deepEqual(sm,dm,'The explanatory draft cannot change the source physical law');
  const se=a.elements(x,1,0),de=b.elements(x,1,0);assert.deepEqual(se,de,'Retained apparatus geometry differs');
  states.push({x,model:dm,readings:b.model.readings({x},dm,0),elements:de});
 }
 rows.push({id:draft.id,assessment:b.record.assessment,originalAssessment:a.record.assessment,grid:grids[i],states,clock:b.clock?{label:b.clock.label,unit:b.clock.unit,input:b.clock.input??false}:null});
}
const sha=b=>createHash('sha256').update(b).digest('hex');
const result={sourceCommit:'1b72b71a68a6023ab1c9fa189733947b03029914',runtimeSha256:'53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a',candidateCommit:'270d212b4f45151a8dc010a192a65fb13acfa24b',producerSha256:sha(readFileSync(APP+'/static/js/banchi/voci/esperimento.js')),modelSha256:sha(readFileSync(APP+'/static/js/banchi/voci/modelli/C3.js')),observerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),rows,browser:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN'};
writeFileSync(D+'actual-consumer-observations.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({rows:rows.length,states:rows.reduce((n,r)=>n+r.states.length,0),actualCompiledTasks:rows.reduce((n,r)=>n+r.assessment.length,0),browser:'NOT_RUN'}));
