// CPU only: exact planned JSON-number inputs, not a browser or numerical approval.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const folder=fileURLToPath(new URL('./',import.meta.url)),app=process.argv[2],candidate=process.argv[3];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const id='SIM-C3-L04-01',source=JSON.parse(readFileSync(app+'/content/esperienze-C3.json')).find(r=>r.id===id),draft=JSON.parse(readFileSync(candidate)).records.find(r=>r.id===id);
const a=await esperienza(source),b=await esperienza(draft);assert.deepEqual(a.record.assessment,b.record.assessment);
const grid=[0,1.67,16.7,18.37,33.4];const states=[];
for(const x of grid){const model=b.model.solve({x});assert.deepEqual(a.model.solve({x}),model);const elements=b.elements(x,1,0);assert.deepEqual(a.elements(x,1,0),elements);states.push({kind:'grid',x,model,time:0,signal:b.clock.signal(x,0,model.y),duration:b.clock.duration(x),readings:b.model.readings({x},model,0),elements});}
for(const time of [0,.125,10,20]){const x=33.4,model=b.model.solve({x}),elements=b.elements(x,1,time);assert.deepEqual(a.elements(x,1,time),elements);states.push({kind:'clock',x,time,model,signal:b.clock.signal(x,time,model.y),duration:b.clock.duration(x),readings:b.model.readings({x},model,time),elements});}
const sha=x=>createHash('sha256').update(x).digest('hex');
const report={schemaVersion:'1.0.0',id,sourceCommit:'1b72b71a68a6023ab1c9fa189733947b03029914',runtimeSha256:'53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a',candidateCommit:'6ae3c2a177bcde74b2bebf8f22c1fa50850b0413',observerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),producerSha256:sha(readFileSync(app+'/static/js/banchi/voci/esperimento.js')),modelSha256:sha(readFileSync(app+'/static/js/banchi/voci/modelli/C3.js')),gridInputPolicy:'Literal JSON numbers from frozen original plan; expected model.y frozen at those exact source calls, no widened numerical guard',states,assessment:b.record.assessment,clockMetadata:{label:b.clock.label,unit:b.clock.unit,setup:b.clock.setup,input:b.clock.input??false},browser:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN'};
writeFileSync(folder+'exact-plan-source-observation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({states:states.length,clock:4,sourceDraftParity:true,browser:'NOT_RUN'}));
