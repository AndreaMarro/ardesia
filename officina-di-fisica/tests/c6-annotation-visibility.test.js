import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import test from 'node:test';
import {esperienza} from '../static/js/banchi/voci/esperimento.js';
import {collect, transferred} from './corpus/c6-annotation-observations.mjs';

const sources = JSON.parse(readFileSync(new URL('../content/esperienze-C6.json', import.meta.url)));
for (const [id, names] of transferred) {
  test(`${id}: locate the named objects without opaque text on measured arrows`, async () => {
    const source = sources.find(row => row.id === id), bench = await esperienza(source);
    for (const view of ['orbit','side','top','diagram']) {
      const legend = bench.legend(2, view).toLowerCase();
      for (const name of names) assert.ok(legend.includes(name.toLowerCase()), `${id}: missing legend ${name}`);
    }
    const {min,max,step} = source.control, count = Math.round((max-min)/step)+1;
    for (let i=0; i<count; i++) {
      const x=min+i*step, times=bench.clock ? [undefined,0,bench.clock.duration(x,bench.model.solve({x}).y)/2] : [undefined];
      for (const time of times) {
        const labels=bench.elements(x,2,time).filter(e=>e.kind==='label').map(e=>e.text);
        for (const name of names) assert.ok(!labels.includes(name), `${id}: opaque ${name}, x=${x}, t=${time}`);
      }
    }
  });
}

test('all installed models, guides and non-transferred geometry match the baseline', async () => {
  const before = JSON.parse(gunzipSync(readFileSync(new URL('../editorial/reviews/c6-annotation-author-20261127/baseline-observations.json.gz', import.meta.url))));
  const after = JSON.parse(JSON.stringify(await collect()));
  assert.deepEqual(after.stats,before.stats);
  assert.equal(after.rows.length,before.rows.length);
  for (let i=0;i<after.rows.length;i++) {
    const a=structuredClone(after.rows[i]), b=structuredClone(before.rows[i]);
    const names=transferred.get(a.id) ?? [];
    if (names.length) {
      delete a.legends; delete b.legends;
      for (const row of [a,b]) for (const frame of row.frames) frame.labels=frame.labels.filter(name=>!names.includes(name));
    }
    assert.deepEqual(a,b,a.id);
  }
});
