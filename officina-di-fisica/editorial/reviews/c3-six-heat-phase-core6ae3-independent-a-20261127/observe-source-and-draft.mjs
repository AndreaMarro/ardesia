// Distinct A CPU-only observation. No Playwright import, server, DB or browser.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
const folder=fileURLToPath(new URL('./',import.meta.url));
const app='/private/tmp/cric-midpoint-and-press-20261127/officina-di-fisica';
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const originals=JSON.parse(readFileSync(folder+'original-source.verbatim.json'));
const pack=JSON.parse(readFileSync(folder+'candidate.verbatim.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const taskInputs=[[8,6],[10,11],[200,175],[16.7,18.37],[3,0],[19,28]];
const entries=[[400,300],[83.14,91.454],[50,48],[50,55],[6.78,0],[50,76.47]];
const records=[];
for(const [index,draft] of pack.records.entries()){
 const source=originals.find(r=>r.id===draft.id),original=await esperienza(source),actual=await esperienza(draft),control=source.control;
 assert.deepEqual(actual.record.assessment,original.record.assessment,'Compiled tasks changed');
 assert.deepEqual(actual.scene.spec,original.scene.spec);
 const grid=Array.from({length:Math.round((control.max-control.min)/control.step)+1},(_,i)=>control.min+i*control.step);
 const cases=[];let sceneComparisons=0;
 for(const x of grid){
  const state=actual.model.solve({x}),before=original.model.solve({x});assert.deepEqual(state,before);
  const stages=[];
  for(let stage=0;stage<5;stage++){
   const elements=actual.elements(x,stage);assert.deepEqual(elements,original.elements(x,stage));
   stages.push({stage,elementCount:elements.length,elementsSha256:sha(JSON.stringify(elements))});sceneComparisons++;
  }
  cases.push({x,model:state,readings:actual.model.readings({x},state),stages});
 }
 const clock=[];
 if(actual.clock){
  for(const x of grid){const duration=actual.clock.duration(x);for(const t of [...new Set([0,duration/2,duration])]){
   const state=actual.model.solve({x});const elements=actual.elements(x,4,t);
   assert.deepEqual(elements,original.elements(x,4,t));
   clock.push({x,time:t,duration,signal:actual.clock.signal?.(x,t,state.y),readings:actual.model.readings({x},state,t),elementsSha256:sha(JSON.stringify(elements)),elementCount:elements.length});sceneComparisons++;
  }}
 }
 const tasks=actual.record.assessment.map((task,j)=>{
  const input=taskInputs[index][j],entry=entries[index][j];
  const solved=actual.model.solve({x:input});
  assert.ok(Math.abs(solved.y-task.value)<=8*Number.EPSILON*Math.max(1,Math.abs(solved.y),Math.abs(task.value)));
  const tolerance=Math.max(0.000001,Math.abs(task.value)*0.005);
  assert.ok(Number.isFinite(entry)&&Math.abs(entry-task.value)<=tolerance);
  return{input,inputLexeme:String(input),suggestedEntry:entry,entryLexeme:String(entry),installed:task,observationError:entry-task.value,installedTolerance:tolerance,entryAcceptedByExistingNumericRule:true};
 });
 records.push({id:draft.id,originalVersion:source.version,draftVersion:draft.version,baseVersion:draft.baseVersion,tasks,cases,clock,clockMetadata:actual.clock?{label:actual.clock.label,unit:actual.clock.unit,clockUnit:actual.clock.clockUnit,input:actual.clock.input,setup:actual.clock.setup}:null,sceneComparisons,sourceDraftSceneEquality:true,legends:['orbit','side','top','diagram'].map(view=>({view,text:actual.legend(4,view)}))});
}
const report={schemaVersion:'1.0.0',sourceCommit:'b9994b9116e87478905191d85cca8037d17ae4bd',candidateCommit:'6ae3c2a177bcde74b2bebf8f22c1fa50850b0413',runtimeExpected:'7c7281e363c1d723ec005f4d04b2f54b88bc7b660c18b6adb548053816dcbad6',producerSha256:sha(readFileSync(app+'/static/js/banchi/voci/esperimento.js')),observerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),records,browser:'NOT_RUN',physicalApproval:false,visualApproval:false,activityCredit:0,humanApproval:'NOT_RUN'};
writeFileSync(folder+'actual-current-source.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ids:records.length,tasks:records.reduce((n,r)=>n+r.tasks.length,0),states:records.reduce((n,r)=>n+r.cases.length,0),sceneComparisons:records.reduce((n,r)=>n+r.sceneComparisons,0),clockStates:records.reduce((n,r)=>n+r.clock.length,0),browser:'NOT_RUN'}));
