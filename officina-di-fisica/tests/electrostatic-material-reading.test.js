import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

const records = JSON.parse(readFileSync(new URL('../content/esperienze-C4.json', import.meta.url)));

for (const [id, label, weak, strong, expected] of [
  ['SIM-C4-L04-01', 'Conduttore isolato', 2, 8, 0],
  ['SIM-C4-L04-02', 'Dielettrico', 3, 9, 1],
]) {
  test(`${id} keeps charge markers visible and the weak field direction legible`, async () => {
    const bench = await esperienza(records.find(record => record.id === id));
    const scene = bench.elements(weak, 0);
    assert.equal(bench.model.solve({ x: weak }).y, expected);
    assert.ok(scene.some(mark => mark.kind === 'ball' && mark.c === colore.viola));
    assert.ok(scene.some(mark => mark.kind === 'ball' && mark.c === colore.rosso));
    assert.ok(!scene.some(mark => mark.kind === 'label' && mark.text === label));
    const field = scene.find(mark => mark.kind === 'arrow' && mark.c === colore.verde);
    const detail = scene.find(mark => mark.kind === 'arrow' && mark.c === colore.ocraScuro);
    assert.ok(field.b[0] > field.a[0] && detail.b[0] > detail.a[0]);
    assert.ok(Math.abs((detail.b[0] - detail.a[0]) / (field.b[0] - field.a[0]) - 4) < 1e-10);
    assert.notEqual(detail.a[1], field.a[1]);
    assert.notEqual(detail.a[2], field.a[2]);
    assert.equal(detail.dettaglio, true);
    assert.ok(!bench.elements(strong, 0).some(mark => mark.c === colore.ocraScuro));
    assert.match(bench.legend(weak, 'top'), new RegExp(`${label}.*quattro volte`, 'i'));
  });
}
