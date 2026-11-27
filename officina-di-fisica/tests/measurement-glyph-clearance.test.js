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
  for (const x of [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]) {
    const elements = activity.elements(x, 2);
    const forces = elements.filter(element => element.kind === 'arrow' && element.c === colore.viola);
    const detail = elements.filter(element => element.kind === 'arrow' && element.c === colore.ocra);
    assert.equal(forces.length, 2);
    const length = 0.62 * (90 / x ** 2) / 60;
    assert.equal(detail.length, x >= 2.5 ? 2 : 0);
    for (const [index, arrow] of forces.entries()) {
      const sense = 2 * index - 1;
      assert.equal(arrow.a[2], 0.38);
      assert.equal(arrow.b[2], arrow.a[2]);
      assert.equal(arrow.b[1], arrow.a[1]);
      assert.ok(Math.abs(arrow.b[0] - arrow.a[0] - sense * length) < 1e-12);
      assert.equal(arrow.c, colore.viola);
      if (detail[index]) {
        assert.equal(detail[index].dettaglio, true);
        assert.ok(Math.abs(detail[index].b[0] - detail[index].a[0] - 8 * sense * length) < 1e-12);
      }
    }
  }
});

test('the photoelectron inset preserves direction, gives its scale, and vanishes at zero excess', async () => {
  const activity = await experience('SIM-C5-L07-03');
  for (const input of [13, 14, 15, 16, 17, 18, 25]) {
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
    if (excess <= 3) {
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

test('small gravitational attraction remains visible in both inward directions', async () => {
  const activity = await experience('SIM-C1-L006-03');
  for (let r = 1; r <= 4; r += 0.25) {
    const arrows = activity.elements(r, 2).filter(element => element.kind === 'arrow');
    const original = arrows.filter(element => element.c === colore.verde);
    const details = arrows.filter(element => element.c === colore.ocra);
    assert.equal(original.length, 2);
    assert.equal(details.length, r >= 2.25 ? 2 : 0);
    assert.equal(activity.model.solve({ x: r }).y, 1 / r ** 2);
    for (const [index, arrow] of original.entries()) {
      const towardOtherMass = 1 - 2 * index;
      const delta = arrow.b[0] - arrow.a[0];
      assert.ok(Math.abs(delta - towardOtherMass * 0.85 / r ** 2) < 1e-12);
      if (details[index]) {
        const detail = details[index];
        assert.equal(detail.dettaglio, true);
        assert.ok(Math.abs(detail.b[0] - detail.a[0] - 6 * delta) < 1e-12);
        assert.ok(Math.abs(detail.a[2] - arrow.a[2]) > 0.7);
        assert.equal(Math.sign(detail.a[0]), Math.sign(detail.b[0]));
      }
    }
  }
  assert.match(activity.legend(2, 'diagram'), /sei volte/);
});

test('the early cart velocity has a separate direction cue only above zero', async () => {
  const activity = await experience('SIM-C1-L007-02');
  for (const time of [0, 0.25, 0.5, 0.75, 1, 4]) {
    const arrows = activity.elements(time, 2, time).filter(element => element.kind === 'arrow');
    const original = arrows.filter(element => element.c === colore.viola);
    const details = arrows.filter(element => element.c === colore.ocra);
    assert.equal(original.length, time ? 1 : 0);
    assert.equal(details.length, time > 0 && time < 1 ? 1 : 0);
    assert.equal(activity.model.solve({ x: time }).y, 6 * time);
    if (details.length) {
      const [detail] = details;
      assert.equal(detail.dettaglio, true);
      assert.ok(Math.abs(detail.b[0] - detail.a[0] - 6 * 0.65 * time / 3) < 1e-12);
    }
  }
  assert.match(activity.legend(2, 'diagram'), /sei volte/);
});

test('the virtual image stays clear of the object label in the C6 lens', async () => {
  const activity = await experience('SIM-C6-L06-01');
  for (let distance = 0.5; distance <= 3; distance += 0.25) {
    const elements = activity.elements(distance, 2);
    assert.ok(!elements.some(element => element.kind === 'label' && element.text === 'Oggetto'));
    assert.ok(elements.some(element => element.kind === 'label' && element.text === 'F′'));
    assert.equal(activity.model.solve({ x: distance }).y, 1 - 1 / distance);
  }
  const arrowsAt = distance => activity.elements(distance, 2).filter(element => element.kind === 'arrow');
  const [object, virtualImage] = arrowsAt(0.5);
  assert.equal(object.c, colore.viola);
  assert.equal(virtualImage.c, colore.rosso);
  assert.ok(virtualImage.a[0] < object.a[0] && object.a[0] < 0);
  assert.ok(virtualImage.a[1] < virtualImage.b[1]);
  assert.equal(arrowsAt(1).length, 1);
  const realImage = arrowsAt(2).find(element => element.c === colore.rosso);
  assert.ok(realImage.a[0] > 0 && realImage.b[1] < realImage.a[1]);
  for (const view of ['side', 'diagram']) {
    assert.match(activity.legend(2, view), /oggetto.*immagine virtuale.*immagine reale/i);
  }
});

test('the C6 attenuation detector label leaves the transmitted beam unobstructed', async () => {
  const activity = await experience('SIM-C6-L04-01');
  for (let layers = 0; layers <= 5; layers++) {
    const elements = activity.elements(layers, 2);
    assert.ok(!elements.some(e => e.kind === 'label' && e.text === 'Rivelatore'));
    assert.ok(elements.some(e => e.kind === 'label' && e.text === 'Fascio'));
    const transmitted = elements.filter(e => e.kind === 'rod' && e.c === colore.ocra && e.b[0] === 2.26);
    assert.equal(transmitted.length, 12);
    for (const segment of transmitted) assert.equal(segment.alpha, 1 / 2 ** layers);
    assert.equal(activity.model.solve({ x: layers }).y, 120 / 2 ** layers);
  }
  assert.match(activity.legend(2, 'top'), /rivelatore è la piastra grigia a destra/i);
});
