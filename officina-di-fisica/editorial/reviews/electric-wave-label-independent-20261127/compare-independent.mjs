import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const OUT=path.dirname(fileURLToPath(import.meta.url));
const BASE=path.join(OUT,'baseline-esm');
const APP='/private/tmp/cric-scene-annotations-c4-c5-author-20261127/officina-di-fisica';
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(readFileSync(path.join(OUT,'baseline-tree-manifest.json')));
assert.equal(manifest.sourceRef,'e5e74638d1fcab1bc8ad3f98e4f745f7927689a5');assert.equal(manifest.files.length,85);
for(const f of manifest.files)assert.equal(sha(readFileSync(path.join(OUT,f.snapshot))),f.sha256);
const [old,newer]=await Promise.all([import(pathToFileURL(path.join(BASE,'static/js/banchi/voci/esperimento.js'))),import(pathToFileURL(path.join(APP,'static/js/banchi/voci/esperimento.js')))]);
// Explicit independent scope, not a map read from the candidate implementation.
const allowed=new Map([
 ['SIM-C4-L01-02',['+1']],['SIM-C4-L02-02',['P']],
 ['SIM-C4-L05-01',['Corrente convenzionale']],['SIM-C4-L05-04',['Corrente convenzionale']],['SIM-C4-L05-05',['Corrente convenzionale']],
 ['SIM-C4-L05-02',['Pila']],['SIM-C4-L05-03',['Pila']],['SIM-C4-L06-02',['Pila']],
 ['SIM-C4-L06-01',['In parallelo']],['SIM-C4-L07-01',['+','−']],
 ['SIM-C4-L09-01',['Sonda B']],['SIM-C4-L10-01',['Normale alla spira']],
 ['SIM-C5-L01-02',['Massa oscillante']],['SIM-C5-L05-03',['Sorgente']],['SIM-C5-L07-03',['Elettrone libero','Elettrone legato']],
]);
const records=[],canaries=[];let controls=0,scenes=0;
const negatives=JSON.parse(readFileSync(path.join(OUT,'negative-images.json')));
for(const course of ['C4','C5']){
 const original=readFileSync(path.join(BASE,'content/esperienze-'+course+'.json'));
 assert.deepEqual(readFileSync(path.join(APP,'content/esperienze-'+course+'.json')),original);
 for(const source of JSON.parse(original)){
  const before=await old.esperienza(source),after=await newer.esperienza(source),names=allowed.get(source.id)??[];
  assert.deepEqual(after.record,before.record);assert.deepEqual(after.model.params,before.model.params);
  assert.deepEqual(after.observe,before.observe);assert.deepEqual(after.scene.spec,before.scene.spec);
  const count=Math.round((source.control.max-source.control.min)/source.control.step)+1,clockCases=[];
  let removedCount=0;const removedNames=new Set();
  for(let i=0;i<count;i++){
   const x=source.control.min+i*source.control.step,solution=before.model.solve({x});controls++;
   assert.deepEqual(after.model.solve({x}),solution);assert.deepEqual(after.measurement(x),before.measurement(x));
   assert.deepEqual(after.model.graphs({x},solution),before.model.graphs({x},solution));
   assert.deepEqual(after.model.steps({x},solution),before.model.steps({x},solution));
   const times=[undefined];
   if(before.clock){const d=before.clock.duration(x,solution.y);assert.equal(after.clock.duration(x,solution.y),d);for(const f of [0,.25,.5,.75,1]){times.push(d*f);clockCases.push({x,time:d*f});}}
   for(const time of times){
    const input=before.clock?.input&&time!==undefined?time:x,s=before.model.solve({x:input});
    assert.deepEqual(after.model.readings({x:input},s,time??0),before.model.readings({x:input},s,time??0));
    const expected=before.elements(x,2,time).filter(e=>{
     if(e.kind==='label'&&names.includes(e.text)){removedCount++;removedNames.add(e.text);return false;}return true;
    });
    assert.deepEqual(after.elements(x,2,time),expected,source.id+' '+x+' '+time);scenes++;
   }
  }
  assert.deepEqual([...removedNames].sort(),[...names].sort(),source.id);
  const legends={};for(const view of ['orbit','side','top','diagram']){legends[view]=after.legend(2,view);if(!names.length)assert.equal(legends[view],before.legend(2,view));}
  records.push({id:source.id,controls:count,removedNames:[...removedNames].sort(),removedOccurrences:removedCount,sourceRecordSha256:sha(original),allNonLabelAndNonTransferredLabelsIdentical:true,modelAndGuideUnchanged:true,legends});
  for(const negative of negatives.filter(x=>x.id===source.id)){
   const parts=negative.caseKey.split('|'),kind=parts[4],index=Number(parts[5]);
   const state=kind==='grid'?{x:source.control.min+index*source.control.step}:clockCases[index];assert.ok(state);
   canaries.push({id:source.id,negativeCaseKey:negative.caseKey,negativeView:parts[3],negativeLabel:negative.label,kind,index,...state,source,hasClock:Boolean(before.clock),clockInput:Boolean(before.clock?.input)});
  }
 }
}
assert.equal(records.length,56);assert.equal(records.filter(r=>r.removedNames.length).length,15);assert.equal(controls,868);assert.equal(scenes,2018);
const result={candidateRef:'52c65641d61ecb327163bbd082821a31d2fd782a',runtimeSha256:'440d86b5a3d265139477abfc79276ecf979ea6f210f0e07bebc4a76473a47334',baselineRef:manifest.sourceRef,records,controls,scenes,affectedIds:15,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
writeFileSync(path.join(OUT,'actual-independent-comparison.json'),JSON.stringify(result,null,2)+'\n');
const priority=new Set(['SIM-C4-L05-01','SIM-C4-L05-04','SIM-C4-L05-05','SIM-C4-L10-01','SIM-C5-L01-02','SIM-C5-L05-03']);
const planned=new Map();
for(const c of canaries){
 for(const width of [320,1280])for(const view of [c.negativeView,'fixed_projection',...(priority.has(c.id)?['side']:[])]){
  const key=[c.id,width,view,c.x,c.time??''].join('|');
  if(!planned.has(key))planned.set(key,{...c,key,width,view,fallback:view==='fixed_projection',originalNegativeCaseKeys:[c.negativeCaseKey]});
  else planned.get(key).originalNegativeCaseKeys.push(c.negativeCaseKey);
 }
}
const plan={candidateRef:result.candidateRef,runtimeSha256:result.runtimeSha256,baselineRef:manifest.sourceRef,plannedScope:'Exact recorded negative regimes plus1280, fallback and prioritized side canaries; not complete activity coverage',cases:[...planned.values()],activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
assert.equal(new Set(plan.cases.map(x=>x.id)).size,15);
writeFileSync(path.join(OUT,'bounded-plan.json'),JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({records:records.length,affectedIds:15,controls,scenes,boundedCanaries:plan.cases.length,dopplerCanary:canaries.find(c=>c.id==='SIM-C5-L05-03')}));
