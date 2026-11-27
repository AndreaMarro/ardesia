import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [baseline, candidate, observations] = process.argv.slice(2);
const engine = (app) => import(pathToFileURL(resolve(app, 'static/js/banchi/voci/esperimento.js')).href);
const [before, after] = await Promise.all([engine(baseline), engine(candidate)]);
const allowed = new Map();
for (const file of observations.split(',')) {
  const report = JSON.parse(readFileSync(file));
  for (const { id, label } of report.recordedFullContainmentCandidates) {
    const labels = allowed.get(id) ?? new Set();
    labels.add(label);
    allowed.set(id, labels);
  }
}
// The electron's two labels encode alternate states of the same glyph.
assert.ok(allowed.get('SIM-C5-L07-03').has('Elettrone libero'));
allowed.get('SIM-C5-L07-03').add('Elettrone legato');

const result = [];
for (const course of ['C4', 'C5']) {
  const source = `content/esperienze-${course}.json`;
  const data = readFileSync(resolve(baseline, source));
  assert.ok(data.equals(readFileSync(resolve(candidate, source))));
  for (const row of JSON.parse(data)) {
    const [original, revised] = await Promise.all([before.esperienza(row), after.esperienza(row)]);
    assert.deepEqual(revised.record, original.record);
    const labels = allowed.get(row.id) ?? new Set();
    const { min, max, step } = row.control;
    const controls = Math.round((max - min) / step) + 1;
    let scenes = 0;
    const removed = new Set();
    for (let index = 0; index < controls; index += 1) {
      const x = min + index * step;
      const value = original.model.solve({ x });
      assert.deepEqual(revised.model.solve({ x }), value);
      assert.deepEqual(revised.model.readings({ x }, value), original.model.readings({ x }, value));
      assert.deepEqual(revised.measurement(x), original.measurement(x));
      const times = [undefined];
      if (original.clock) {
        const length = original.clock.duration(x, value.y);
        assert.equal(revised.clock.duration(x, value.y), length);
        times.push(...[0, 0.25, 0.5, 0.75, 1].map(fraction => length * fraction));
      }
      for (const time of times) {
        const originalScene = original.elements(x, 2, time);
        const expected = originalScene.filter(element => {
          const remove = element.kind === 'label' && labels.has(element.text);
          if (remove) removed.add(element.text);
          return !remove;
        });
        assert.deepEqual(revised.elements(x, 2, time), expected, `${row.id} · ${x} · ${time}`);
        scenes += 1;
      }
    }
    assert.deepEqual(removed, labels);
    if (!labels.size) {
      for (const view of ['orbit','side','top','diagram']) assert.equal(revised.legend(2, view), original.legend(2, view));
    }
    result.push({ id: row.id, controls, scenes, labels: [...removed].sort() });
  }
}
assert.equal(result.length, 56);
console.log(JSON.stringify({ records: result, affectedIds: allowed.size,
  controls: result.reduce((count, row) => count + row.controls, 0),
  scenes: result.reduce((count, row) => count + row.scenes, 0),
  activityCredit: 0, humanApproval: 'NOT_RUN', publicationAction: 'NONE' }, null, 2));
