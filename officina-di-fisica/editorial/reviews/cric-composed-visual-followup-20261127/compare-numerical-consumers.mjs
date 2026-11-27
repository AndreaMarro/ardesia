import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [originalApp, proposedApp] = process.argv.slice(2);
const load = (app) => import(pathToFileURL(resolve(app, 'static/js/banchi/voci/esperimento.js')).href);
const [original, proposed] = await Promise.all([load(originalApp), load(proposedApp)]);
const rows = [];
for (const unit of [1, 2, 3, 4, 5, 6]) {
  const source = `content/esperienze-C${unit}.json`;
  const bytes = await readFile(resolve(originalApp, source));
  assert.ok(bytes.equals(await readFile(resolve(proposedApp, source))));
  for (const record of JSON.parse(bytes)) {
    const [before, after] = await Promise.all([original.esperienza(record), proposed.esperienza(record)]);
    assert.deepEqual(after.record, before.record);
    const { min, max, step } = record.control;
    const count = Math.round((max - min) / step) + 1;
    let clockObservations = 0;
    for (let index = 0; index < count; index += 1) {
      const x = min + index * step;
      const point = { x };
      const state = before.model.solve(point);
      assert.deepEqual(after.model.solve(point), state, record.id);
      assert.deepEqual(after.measurement(x), before.measurement(x), record.id);
      assert.deepEqual(after.model.readings(point, state), before.model.readings(point, state), record.id);
      assert.deepEqual(after.model.graphs(point, state), before.model.graphs(point, state), record.id);
      if (before.clock) {
        const duration = before.clock.duration(x, state.y);
        assert.equal(after.clock.duration(x, state.y), duration, record.id);
        for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
          const time = duration * fraction;
          const input = before.clock.input ? { x: time } : point;
          const observed = before.model.solve(input);
          assert.deepEqual(after.model.solve(input), observed, record.id);
          assert.deepEqual(after.model.readings(input, observed, time), before.model.readings(input, observed, time), record.id);
          clockObservations += 1;
        }
      } else {
        assert.equal(after.clock, before.clock, record.id);
      }
    }
    rows.push({ id: record.id, controls: count, clockObservations });
  }
}
assert.equal(rows.length, 181);
console.log(JSON.stringify({ records: rows, comparedControls: rows.reduce((n, r) => n + r.controls, 0),
  comparedClockObservations: rows.reduce((n, r) => n + r.clockObservations, 0),
  activityCredit: 0, humanApproval: 'NOT_RUN', publicationAction: 'NONE' }, null, 2));
