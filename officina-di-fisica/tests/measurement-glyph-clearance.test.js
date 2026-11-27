import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

async function experience(id) {
  const course = id.split('-')[1];
  const data = JSON.parse(await readFile(new URL(`../content/esperienze-${course}.json`, import.meta.url)));
  return esperienza(data.find(record => record.id === id));
}

test('both Coulomb forces keep the common gain clear of the charge spheres', async () => {
  const activity = await experience('SIM-C4-L01-02');
  for (const x of [1, 2, 4, 6]) {
    const elements = activity.elements(x, 2);
    const forces = elements.filter(element => element.kind === 'arrow');
    assert.equal(forces.length, 2);
    for (const [index, arrow] of forces.entries()) {
      const sense = 2 * index - 1;
      assert.equal(arrow.a[2], 0.38);
      assert.equal(arrow.b[2], arrow.a[2]);
      assert.equal(arrow.b[1], arrow.a[1]);
      assert.ok(Math.abs(arrow.b[0] - arrow.a[0] - sense * 0.62 * (90 / x ** 2) / 60) < 1e-12);
      assert.equal(arrow.c, colore.viola);
    }
  }
});

test('the photoelectron inset preserves direction, gives its scale, and vanishes at zero excess', async () => {
  const activity = await experience('SIM-C5-L07-03');
  for (const input of [13, 14, 15, 16, 17, 25]) {
    const arrows = activity.elements(input, 2).filter(element => element.kind === 'arrow');
    const excess = Math.max(0, input - 14);
    if (!excess) {
      assert.deepEqual(arrows, []);
      continue;
    }
    const [main, inset] = arrows;
    const length = 0.75 * excess / 11;
    assert.equal(main.c, colore.verde);
    assert.equal(main.a[2], 0.29);
    assert.ok(Math.abs(main.b[0] - main.a[0] - length) < 1e-12);
    if (excess <= 2) {
      assert.equal(inset.c, colore.ocra);
      assert.equal(inset.dettaglio, true);
      assert.ok(Math.abs(inset.b[0] - inset.a[0] - 4 * length) < 1e-12);
    } else {
      assert.equal(arrows.length, 1);
    }
  }
  assert.match(activity.legend(2, 'diagram'), /quattro volte/);
});

test('confirmed C1 and Doppler cartouches leave the geometry and the accessible names legible', async () => {
  for (const [id, labels, names] of [
    ['SIM-C1-L006-03', ['Distanza fra i centri'], /Distanza fra i centri/],
    ['SIM-C1-L007-02', ['Carrello'], /Carrello/],
    ['SIM-C1-L007-03', ['Carrello'], /Carrello/],
    ['SIM-C5-L05-03', ['Sorgente', 'Ricevitore'], /sorgente.*ricevitore/i],
  ]) {
    const activity = await experience(id);
    const scene = activity.elements(activity.record.references[0][0], 2);
    assert.ok(!scene.some(element => element.kind === 'label' && labels.includes(element.text)));
    assert.match(activity.legend(2, 'top'), names);
  }
});
