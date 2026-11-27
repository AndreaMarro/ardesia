// CPU only. Compile the five drafts with the real frozen installed consumer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const app=process.argv[2];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const {n}=await import(pathToFileURL(app+'/static/js/banchi/misure.js'));
const pack=JSON.parse(readFileSync(new URL('./candidate-package.json',import.meta.url)));
const original=JSON.parse(readFileSync(new URL('./original-C2.json',import.meta.url)));
const results=[];
for(const row of pack.records) {
  const a=await esperienza(row), old=await esperienza(original.find(r=>r.id===row.id));
  const states=[];
  const {min,max,step}=row.control;
  for(let i=0;i<=Math.round((max-min)/step);i++) {
    const x=min+i*step,s=a.model.solve({x});
    assert.deepEqual(s,old.model.solve({x}));
    for(const stage of [0,2]) assert.deepEqual(a.elements(x,stage),old.elements(x,stage));
    states.push({x,solved:s,measurement:a.measurement(x),readings:a.model.readings({x},s)});
  }
  assert.deepEqual(a.model.params,old.model.params);
  assert.deepEqual(a.scene.spec,old.scene.spec);
  const points=row.assessmentSelection.points;
  results.push({id:row.id,assessment:a.record.assessment,points,
    answerDisplays:a.record.assessment.map(t=>n(t.value)),states,
    guides:points.map(x=>a.model.steps({x},a.model.solve({x}))),
    legends:['orbit','top','side','diagram'].map(v=>a.legend(2,v))});
}
console.log(JSON.stringify({UI:'NOT_RUN',scientificApproval:false,results}));
