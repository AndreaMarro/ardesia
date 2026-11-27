import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [originalApp,candidateApp,reviewInput] = process.argv.slice(2);
const openExperiment = app => import(pathToFileURL(path.join(app,'static/js/banchi/voci/esperimento.js')).href);
const [original,candidate] = await Promise.all([openExperiment(originalApp),openExperiment(candidateApp)]);
const review = JSON.parse(readFileSync(reviewInput));
const authorized = new Map(review.observations.map(witness => [witness.id,witness.labelText]));
assert.equal(authorized.size,20);
const originalSource = readFileSync(path.join(originalApp,'content/esperienze-C2.json'));
assert.ok(originalSource.equals(readFileSync(path.join(candidateApp,'content/esperienze-C2.json'))));

const results = [];
for (const row of JSON.parse(originalSource)) {
  const [before,after] = await Promise.all([original.esperienza(row),candidate.esperienza(row)]);
  assert.deepEqual(after.record,before.record);
  const label = authorized.get(row.id);
  let scenes = 0, removed = 0, controls = 0;
  for (const view of ['orbit','side','top','diagram']) {
    const legend = after.legend(2,view);
    if (label) assert.ok(legend.toLowerCase().includes(label.toLowerCase()));
    else assert.equal(legend,before.legend(2,view));
  }
  function verifyScene(x,instant) {
    const old = before.elements(x,2,instant);
    const expected = old.filter(item => item.kind !== 'label' || item.text !== label);
    assert.deepEqual(after.elements(x,2,instant),expected);
    scenes += 1;
    removed += old.length-expected.length;
  }
  const {min,max,step} = row.control;
  const count = Math.round((max-min)/step)+1;
  for (let index=0; index<count; index+=1) {
    const x = min+index*step;
    const old = before.model.solve({x});
    assert.deepEqual(after.model.solve({x}),old);
    assert.deepEqual(after.model.readings({x},old),before.model.readings({x},old));
    assert.deepEqual(after.measurement(x),before.measurement(x));
    controls += 1;
    verifyScene(x);
    if (before.clock) {
      const duration = before.clock.duration(x,old.y);
      assert.equal(after.clock.duration(x,old.y),duration);
      for (const fraction of [0,0.25,0.5,0.75,1]) verifyScene(x,duration*fraction);
    }
  }
  assert.equal(removed>0, Boolean(label));
  results.push({id:row.id,controls,scenes,removed,label:label??null});
}
assert.equal(results.length,41);
console.log(JSON.stringify({records:results,controls:results.reduce((n,r)=>n+r.controls,0),
  scenes:results.reduce((n,r)=>n+r.scenes,0),affectedIds:authorized.size,humanApproval:'NOT_RUN',publicationAction:'NONE'},null,2));
