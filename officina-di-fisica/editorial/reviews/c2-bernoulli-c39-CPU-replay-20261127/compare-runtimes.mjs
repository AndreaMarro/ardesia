import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';
import{esperienza as oldExperience}from'../../../static/js/banchi/voci/esperimento.js';
import{experiments as oldLaws}from'../../../static/js/banchi/voci/modelli/C2.js';
import{esperienza as newExperience}from'/private/tmp/cric-continuity-arrow-author-20261127/officina-di-fisica/static/js/banchi/voci/esperimento.js';
import{experiments as newLaws}from'/private/tmp/cric-continuity-arrow-author-20261127/officina-di-fisica/static/js/banchi/voci/modelli/C2.js';
const here=new URL('./',import.meta.url),app=new URL('../../../',here),sources=JSON.parse(readFileSync(new URL('content/esperienze-C2.json',app)));
const records=[];let inputs=0,unchangedScenes=0;const allowed=new Set(['SIM-C2-L005-03','SIM-C2-L005-05','SIM-C2-L006-03']);
for(const r of sources){
 const a=await oldExperience(r),b=await newExperience(r);assert.equal(oldLaws[r.id].measure.toString(),newLaws[r.id].measure.toString());assert.deepEqual(a.record.assessment,b.record.assessment);
 const c=r.control;let count=0;
 for(let i=0;i<=Math.round((c.max-c.min)/c.step);i++){
  const x=c.min+i*c.step,params={x},s=a.model.solve(params);assert.deepEqual(s,b.model.solve(params));assert.deepEqual(a.model.readings(params,s),b.model.readings(params,s));assert.deepEqual(a.model.graphs(params,s),b.model.graphs(params,s));
  if(!allowed.has(r.id)){assert.deepEqual(a.elements(x,2),b.elements(x,2));unchangedScenes++;}
  count++;inputs++;
 }
 records.push({id:r.id,controls:count,measureFunctionSourceIdentical:true,allScalarAndQuestionsExact:true,geometryStatus:allowed.has(r.id)?'EXPLICIT_AUTHOR_DELTA_NOT_BLANKET_VISUAL_APPROVAL':'EXACT_SAME_PRIMITIVES_AT_SAMPLED_STAGE2'});
}
const drafts=JSON.parse(readFileSync(new URL('../c2-bernoulli-independent-20261127/experiment-c2-bernoulli-reading-20261127.json',here))),expected=[[16,18.5],[2,8],[4,1],[9,11]],tasks=[];
for(const[i,r]of drafts.records.entries()){
 const a=await oldExperience(r),b=await newExperience(r);assert.deepEqual(a.record.assessment,b.record.assessment);
 for(const[j,q]of b.record.assessment.entries())assert.equal(q.value,expected[i][j]);
 tasks.push({id:r.id,assignedOutputs:b.record.assessment.map(q=>q.value),inputPoints:r.assessmentSelection.points,manualEntriesUnchanged:true});
}
const key='SIM-C2-L006-03',newA=await newExperience(sources.find(r=>r.id===key));const cases=[];
for(const x of[.5,1,2]){
 const y=newLaws[key].measure(x),s=newLaws[key].apparatus(x,y),es=newA.elements(x,2),rods=es.filter(e=>e.kind==='rod'&&e.r===.062),arrows=es.filter(e=>e.kind==='arrow');
 assert.equal(s.v2/s.v1,1/x);
 if(x===1)assert.equal(rods[0].b[1],rods[1].b[1]);
 cases.push({inputAreaRatio:x,physicalSpeed:y,apparatus:s,displayedVelocityRatio:s.v2/s.v1,pressureColumnTops:rods.map(e=>e.b[1]),arrowEndpoints:arrows.map(e=>({a:e.a,b:e.b})),scope:'CPUprimitive endpoints, notGPU/raster'});
}
writeFileSync(new URL('actual-comparison.json',here),JSON.stringify({oldRuntimeCommit:'b9994b9116e87478905191d85cca8037d17ae4bd',newRuntimeCommit:'cbf7792f872caf575d58acd28cc7ace1ada14169',records,scalarInputs:inputs,unchangedOtherScenes:unchangedScenes,draftTasks:tasks,correctedRepresentationCases:cases,UI:'NOT_RUN',activityCredit:0},null,2)+'\n');console.log(JSON.stringify({records:records.length,scalarInputs:inputs,unchangedOtherScenes:unchangedScenes,draftEntries:8,threeRatioCases:'PASS',UI:'NOT_RUN'}));
