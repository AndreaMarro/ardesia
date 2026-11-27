import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
const app=process.cwd(),baseline=process.env.CRIC_C4_BASELINE;
if(!baseline)throw Error('Immutable baseline directory required');
const current=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const prior=await import(pathToFileURL(baseline+'/static/js/banchi/voci/esperimento.js'));
const affected=new Set(['SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03']);
const sha=x=>createHash('sha256').update(x).digest('hex');
const records=[];
for(let c=1;c<=6;c++){
 const name='/content/esperienze-C'+c+'.json';
 assert.equal(sha(readFileSync(app+name)),sha(readFileSync(baseline+name)),name+' exact original source');
 records.push(...JSON.parse(readFileSync(app+name)));
}
assert.equal(records.length,181);const result=[];let inputs=0,scenes=0;
for(const record of records){
 const old=await prior.esperienza(record),now=await current.esperienza(record);
 assert.deepEqual(now.record,old.record,record.id+' source-derived teaching and graded answers');
 assert.deepEqual(now.model.params,old.model.params,record.id+' controls');
 assert.equal(now.observe,old.observe,record.id+' observe');
 if(affected.has(record.id)){
  assert.deepEqual(now.scene.spec.eye,[0,1.9,6.1]);assert.deepEqual(old.scene.spec.eye,[2.6,1.9,6.1]);
  assert.deepEqual({...now.scene.spec,eye:old.scene.spec.eye},old.scene.spec,record.id+' onlyeyeexception');
 }else assert.deepEqual(now.scene.spec,old.scene.spec,record.id+' unmodified camera/spec');
 const legends=[];
 for(const view of['orbit','top','side','diagram']){
  const before=old.legend(2,view),after=now.legend(2,view);
  if(affected.has(record.id)&&view!=='diagram')assert.ok(after.startsWith(before),record.id+' preserve legend meaning');
  else assert.equal(after,before,record.id+' unchanged legend '+view);
  legends.push({view,baselineSha256:sha(before),currentSha256:sha(after)});
 }
 const digest=createHash('sha256');let count=0,sceneCount=0;
 const a=record.control;
 for(let i=0;i<=Math.round((a.max-a.min)/a.step);i++){
  const x=a.min+i*a.step;
  const capture=exp=>{
   const solved=exp.model.solve({x});
   const value={x,solved,measurement:exp.measurement(x),readings:exp.model.readings({x},solved),graphs:exp.model.graphs({x},solved),steps:exp.model.steps({x},solved),elements:[-1,0,2].map(stage=>exp.elements(x,stage))};
   if(exp.clock){
    const duration=exp.clock.duration(x,solved.y);
    value.clock=[0,.25,.5,.75,1].map(f=>{
     const time=duration*f,input=exp.clock.input?time:x,s=exp.model.solve({x:input});
     return{time,input,solved:s,readings:exp.model.readings({x:input},s,time),signal:exp.clock.signal?.(input,time,s.y),elements:[-1,0,2].map(stage=>exp.elements(x,stage,time))};
    });
   }
   return value;
  };
  const before=capture(old),after=capture(now);assert.deepEqual(after,before,record.id+' exact numeric/clock/geometry at '+x);
  digest.update(JSON.stringify(after)+'\n');count++;sceneCount+=3+(after.clock?.length||0)*3;
 }
 inputs+=count;scenes+=sceneCount;
 result.push({id:record.id,controlValues:count,sceneStates:sceneCount,exactOutputsSha256:digest.digest('hex'),cameraOnlyChanged:affected.has(record.id),legends});
}
const report={baseCommit:'b9994b9116e87478905191d85cca8037d17ae4bd',records:result,recordCount:181,controlValues:inputs,sceneStates:scenes,all181GeometryModelTeachingAndGradingOutputsExact:true,allOther178CamerasAndLegendsExact:true,role:'AUTHOR_TECHNICAL_INVARIANCE_NOT_INDEPENDENT_SCIENTIFIC_APPROVAL',browserStarted:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
writeFileSync(new URL('actual-source-invariance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({recordCount:181,controlValues:inputs,sceneStates:scenes,activityCredit:0}));
