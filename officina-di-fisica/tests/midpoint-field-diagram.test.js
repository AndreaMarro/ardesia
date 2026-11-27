import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { colore } from '../static/js/banchi/voci/geometria.js';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';

test('the midpoint probe marks signed superposition and a separate visible detail', async () => {
  const records = JSON.parse(readFileSync(new URL('../content/esperienze-C4.json', import.meta.url)));
  const bench = await esperienza(records.find(({id}) => id === 'SIM-C4-L02-02'));

  for (let charge = -3; charge <= 3; charge += 0.5) {
    const field = 22.5 * (1 - charge);
    const scene = bench.elements(charge, 2);
    const probe = scene.find(({kind, r}) => kind === 'ball' && r === 0.09);
    const arrows = scene.filter(({kind}) => kind === 'arrow');
    assert.equal(probe.c, colore.verde);
    assert.deepEqual(probe.p, [0, 0.96, 0]);
    assert.equal(bench.measurement(charge).value, field);
    if (field === 0) {
      assert.deepEqual(arrows, []);
      continue;
    }
    const detailRequired = Math.abs(1 - charge) === 0.5;
    assert.equal(arrows.length, detailRequired ? 2 : 1);
    const [primary, detail] = arrows;
    assert.equal(primary.c, colore.viola);
    assert.ok(Math.abs(primary.b[0] - 0.78 * field / 65) < 1e-12);
    assert.equal(primary.a[2], primary.b[2]);
    assert.ok(primary.a[2] > probe.r);
    if (detail) {
      assert.equal(detail.c, colore.ocraScuro);
      assert.equal(detail.a[2], detail.b[2]);
      assert.ok(detail.a[2] > primary.a[2]);
      assert.ok(Math.abs(detail.b[0] - 10 * primary.b[0]) < 1e-12);
    }
  }
  for (const view of ['orbit', 'side', 'top', 'diagram']) {
    assert.match(bench.legend(2, view), /punto verde P.*freccia viola.*ocra scuro.*dieci volte.*zero/);
  }
});
