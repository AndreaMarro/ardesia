// CPU only: exact planned JSON-number inputs, not a browser or numerical approval.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const folder=fileURLToPath(new URL('./',import.meta.url)),app=process.argv[2],candidate=process.argv[3];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const id='SIM-C3-L04-03',source=JSON.parse(readFileSync(app+'/content/esperienze-C3.json')).find(r=>r.id===id),draft=JSON.parse(readFileSync(candidate)).records.find(r=>r.id===id);
const a=await esperienza(source),b=await esperienza(draft);assert.deepEqual(a.record.assessment,b.record.assessment);
const grid=[0,1,2,19,28,36,54];const states=[];
for(const x of grid){const model=b.model.solve({x});assert.deepEqual(a.model.solve({x}),model);const elements=b.elements(x,1,0);assert.deepEqual(a.elements(x,1,0),elements);states.push({kind:'grid',x,model,time:0,signal:b.clock.signal(x,0,model.y),duration:b.clock.duration(x),readings:b.model.readings({x},model,0),elements});}
for(const time of [.125,.25,1,9.5,18,27]){const x=54,model=b.model.solve({x}),elements=b.elements(x,1,time);assert.deepEqual(a.elements(x,1,time),elements);states.push({kind:'clock',x,time,model,signal:b.clock.signal(x,time,model.y),duration:b.clock.duration(x),readings:b.model.readings({x},model,time),elements});}
const sha=x=>createHash('sha256').update(x).digest('hex');
const report={schemaVersion:'1.0.0',id,sourceCommit:'a57cb90252bd9cee71b754ca68f5921efae0f900',runtimeSha256:'0c9d80d28945a62b6e125dd97f55b08de1ac17eabd75e5ff86e05b0a17e0c576',candidateCommit:'0867e0fae8f1556e2a74a91ff7e198de4ee9ccdf',observerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),producerSha256:sha(readFileSync(app+'/static/js/banchi/voci/esperimento.js')),modelSha256:sha(readFileSync(app+'/static/js/banchi/voci/modelli/C3.js')),gridInputPolicy:'Literal JSON numbers from frozen original plan; expected model.y frozen at those exact source calls, no widened numerical guard',states,assessment:b.record.assessment,clockMetadata:{label:b.clock.label,unit:b.clock.unit,setup:b.clock.setup,input:b.clock.input??false},browser:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN'};
writeFileSync(folder+'exact-plan-source-observation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({states:states.length,clock:6,sourceDraftParity:true,browser:'NOT_RUN'}));
