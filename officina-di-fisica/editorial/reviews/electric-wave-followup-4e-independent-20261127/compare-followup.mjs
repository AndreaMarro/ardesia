import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const OUT=path.dirname(fileURLToPath(import.meta.url));
const BASE=path.join(OUT,'../electric-wave-label-independent-20261127/baseline-esm');
const APP='/private/tmp/cric-combined-preintegration-20261127/officina-di-fisica';
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(readFileSync(path.join(OUT,'../electric-wave-label-independent-20261127/baseline-tree-manifest.json')));
assert.equal(manifest.sourceRef,'e5e74638d1fcab1bc8ad3f98e4f745f7927689a5');assert.equal(manifest.files.length,85);
for(const f of manifest.files)assert.equal(sha(readFileSync(path.join(OUT,'../electric-wave-label-independent-20261127',f.snapshot))),f.sha256);
const [old,newer]=await Promise.all([import(pathToFileURL(path.join(BASE,'static/js/banchi/voci/esperimento.js'))),import(pathToFileURL(path.join(APP,'static/js/banchi/voci/esperimento.js')))]);
// Explicit independent scope, not a map read from the candidate implementation.
const allowed=new Map([
 ['SIM-C4-L01-02',['+1']],['SIM-C4-L02-02',['P']],
 ['SIM-C4-L05-01',['Corrente convenzionale']],['SIM-C4-L05-04',['Corrente convenzionale']],['SIM-C4-L05-05',['Corrente convenzionale']],
 ['SIM-C4-L05-02',['Pila']],['SIM-C4-L05-03',['Pila']],['SIM-C4-L06-02',['Pila']],
 ['SIM-C4-L06-01',['In parallelo']],['SIM-C4-L07-01',['+','−']],
 ['SIM-C4-L09-01',['Sonda B']],['SIM-C4-L10-01',['Normale alla spira']],
 ['SIM-C5-L01-02',['Massa oscillante']],['SIM-C5-L05-03',['Sorgente','Ricevitore']],['SIM-C5-L07-03',['Elettrone libero','Elettrone legato']],
]);
const records=[],canaries=[];let controls=0,scenes=0;
const negatives=JSON.parse(readFileSync(path.join(OUT,'../electric-wave-label-independent-20261127/negative-images.json')));
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
    }).map(e=>{
      const n=structuredClone(e);
      if(source.id==='SIM-C4-L01-02'&&n.kind==='arrow'&&n.c===0x7350b0){n.a[1]=n.b[1]=.56;n.a[2]=n.b[2]=.38;}
      if(source.id==='SIM-C5-L07-03'&&n.kind==='arrow'&&n.c===0x147979){n.a[2]=n.b[2]=.29;}
      return n;
    });
    if(source.id==='SIM-C5-L07-03'&&x>14&&x<=16){
      const green=expected.find(e=>e.kind==='arrow'&&e.c===0x147979);assert.ok(green);
      const length=.75*((x-14)/11),detail={kind:'arrow',a:[green.a[0],2.04,.62],b:[green.a[0]+4*length,2.04,.62],c:0xd49332,dettaglio:true};
      const at=expected.findIndex(e=>e===green);expected.splice(at+1,0,detail);
    }
    assert.deepEqual(after.elements(x,2,time),expected,source.id+' '+x+' '+time);scenes++;
   }
  }
  assert.deepEqual([...removedNames].sort(),[...names].sort(),source.id);
  const legends={};for(const view of ['orbit','side','top','diagram']){legends[view]=after.legend(2,view);if(!names.length)assert.equal(legends[view],before.legend(2,view));}
  records.push({id:source.id,controls:count,removedNames:[...removedNames].sort(),removedOccurrences:removedCount,sourceFileSha256:sha(original),unchangedPrimitivesAndDeclaredTranslationsAndDetailVerified:true,modelAndGuideUnchanged:true,legends});
  for(const negative of negatives.filter(x=>x.id===source.id)){
   const parts=negative.caseKey.split('|'),kind=parts[4],index=Number(parts[5]);
   const state=kind==='grid'?{x:source.control.min+index*source.control.step}:clockCases[index];assert.ok(state);
   canaries.push({id:source.id,negativeCaseKey:negative.caseKey,negativeView:parts[3],negativeLabel:negative.label,kind,index,...state,source,hasClock:Boolean(before.clock),clockInput:Boolean(before.clock?.input)});
  }
 }
}
assert.equal(records.length,56);assert.equal(records.filter(r=>r.removedNames.length).length,15);assert.equal(controls,868);assert.equal(scenes,2018);
const result={allowedGeometryChanges:{coulomb:{height:.56,depth:.38,originalVectorComponentsPreserved:true},electron:{primaryDepth:.29,detailFactor:4,detailOnlyPhotonEnergyEV:[15,16],detailPreservesSense:true}},candidateRef:'03f9634d7d6a8dcfe9161990c4d5dbc62e3773f5',runtimeSha256:'4e753b9dbfa1f0062cdcc10d7a6f6f9ec83c4bd69bda9e4f276c3757e8dbba3b',baselineRef:manifest.sourceRef,records,controls,scenes,affectedIds:15,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
writeFileSync(path.join(OUT,'actual-independent-comparison.json'),JSON.stringify(result,null,2)+'\n');
const focus=new Set(['SIM-C5-L05-03','SIM-C4-L01-02','SIM-C5-L07-03']);
const sources=new Map();for(const course of ['C4','C5'])for(const r of JSON.parse(readFileSync(path.join(APP,'content/esperienze-'+course+'.json'))))sources.set(r.id,r);
const planned=new Map();
function add(id,x,view,width,time){const source=sources.get(id),key=[id,width,view,x,time??''].join('|');const kind=time===undefined?'grid':'clock';const index=time===undefined?Math.round((x-source.control.min)/source.control.step):84;planned.set(key,{id,key,x,time,view,width,fallback:view==='fixed_projection',kind,index,source,hasClock:id==='SIM-C5-L05-03',clockInput:false,originalNegativeCaseKeys:[]});}
for(const width of [320,1280])for(const view of ['top','side','fixed_projection'])add('SIM-C5-L05-03',40,view,width,20);
for(let i=0;i<11;i++)for(const view of ['top','fixed_projection'])add('SIM-C4-L01-02',1+i/2,view,320);
for(const view of ['orbit','side'])add('SIM-C4-L01-02',2,view,320);
for(const x of [1,2,6])for(const view of ['top','fixed_projection'])add('SIM-C4-L01-02',x,view,1280);
for(const x of [14,15,16,17,25])for(const view of ['top','fixed_projection'])add('SIM-C5-L07-03',x,view,320);
for(const x of [15,16,17])add('SIM-C5-L07-03',x,'side',320);
add('SIM-C5-L07-03',15,'orbit',320);
for(const x of [15,25])for(const view of ['top','fixed_projection'])add('SIM-C5-L07-03',x,view,1280);
const plan={candidateRef:result.candidateRef,runtimeSha256:result.runtimeSha256,plannedScope:'Three followup focus IDs only; exact Doppler negative, complete Coulomb control range at320, specified electron threshold/detail cases. No other activity acceptance.',cases:[...planned.values()],activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
assert.equal(plan.cases.length,54);assert.equal(new Set(plan.cases.map(c=>c.id)).size,3);
writeFileSync(path.join(OUT,'bounded-plan.json'),JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({records:records.length,affectedIds:15,controls,scenes,boundedCanaries:plan.cases.length}));
