import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const [originalApp, candidateApp] = process.argv.slice(2);
const modulePath = 'static/js/banchi/voci/esperimento.js';
const load = app => import(pathToFileURL(path.join(app, modulePath)).href);
const [original, candidate] = await Promise.all([load(originalApp), load(candidateApp)]);
const possible = new Set(['SIM-C3-L04-03', 'SIM-C3-L08-02', 'SIM-C3-L09-01',
  'SIM-C3-L09-02', 'SIM-C3-L09-03', 'SIM-C3-L09-04']);
const extra = [], legendChanges = [], ids = new Set();
let modelCases = 0, sceneCases = 0;

function compareElements(before, after, id, input, instant) {
  const extras = [];
  let next = 0;
  for (const element of after) {
    if (next < before.length && JSON.stringify(element) === JSON.stringify(before[next])) {
      next += 1;
    } else {
      extras.push(element);
    }
  }
  assert.equal(next, before.length, id + ' lost a preexisting element');
  if (extras.length) {
    assert.ok(possible.has(id), 'unexpected changed simulation ' + id);
    assert.equal(extras.length, 1);
    assert.equal(extras[0].kind, 'arrow');
    assert.equal(extras[0].c, 0xd49332);
    extra.push({id,input,instant,element:extras[0]});
  }
  sceneCases += 1;
}

for (let course = 1; course <= 6; course += 1) {
  const name = 'content/esperienze-C' + course + '.json';
  const raw = readFileSync(path.join(originalApp, name));
  assert.ok(raw.equals(readFileSync(path.join(candidateApp, name))));
  for (const row of JSON.parse(raw)) {
    const [base, revised] = await Promise.all([original.esperienza(row), candidate.esperienza(row)]);
    assert.ok(!ids.has(row.id));
    ids.add(row.id);
    assert.deepEqual(revised.record, base.record);
    assert.deepEqual(revised.model.params, base.model.params);
    if (base.legend() !== revised.legend()) {
      assert.ok(row.apparatus === 'fase' || row.apparatus === 'motore');
      legendChanges.push(row.id);
    }
    const {min, max, step} = row.control;
    const count = Math.round((max - min) / step) + 1;
    for (let n = 0; n < count; n += 1) {
      const input = min + n * step;
      const state = base.model.solve({x:input});
      assert.deepEqual(revised.model.solve({x:input}), state);
      assert.deepEqual(revised.model.readings({x:input}, state), base.model.readings({x:input}, state));
      assert.deepEqual(revised.measurement(input), base.measurement(input));
      assert.deepEqual(revised.model.graphs({x:input}, state), base.model.graphs({x:input}, state));
      modelCases += 1;
      compareElements(base.elements(input,2), revised.elements(input,2), row.id, input, null);
      if (base.clock) {
        const duration = base.clock.duration(input, state.y);
        assert.equal(revised.clock.duration(input, state.y), duration);
        for (let part = 0; part <= 4; part += 1) {
          const instant = duration * part / 4;
          compareElements(base.elements(input,2,instant), revised.elements(input,2,instant), row.id, input, instant);
        }
      }
    }
  }
}
assert.equal(ids.size, 181);
assert.equal(extra.length > 0, true);
console.log(JSON.stringify({verifiedSimulations:ids.size,modelCases,sceneCases,legendChanges,
  additionalArrows:extra,publicationAction:'NONE',humansApproved:0},null,2));
