import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

const source = JSON.parse(readFileSync(new URL('../content/esperienze-C3.json', import.meta.url)));
const bench = suffix => esperienza(source.find(row => row.id === 'SIM-C3-' + suffix));

test('conduction keeps the hot and cold names off the heat-flow arrow', async () => {
  const conductor = await bench('L05-01');
  for (const thickness of [1, 2, 8]) {
    assert.equal(conductor.model.solve({x: thickness}).y, 20 / thickness);
    const scene = conductor.elements(thickness, 2);
    assert.ok(scene.some(mark => mark.kind === 'arrow'));
    assert.equal(scene.some(mark => mark.kind === 'label' && ['Calda','Fredda'].includes(mark.text)), false);
  }
  assert.match(conductor.legend(2, 'top'), /calda.*sinistra.*fredda.*destra/i);
});

test('convection return stays in the legend and clears the downward arrow', async () => {
  const loop = await bench('L05-02');
  for (const rate of [3.5, 5]) {
    assert.equal(loop.model.solve({x: rate}).y, 42 * rate);
    const scene = loop.elements(rate, 2);
    assert.equal(scene.some(mark => mark.kind === 'label' && mark.text === 'Ritorno'), false);
    const arrow = scene.find(mark => mark.kind === 'arrow' && mark.c === colore.viola);
    assert.ok(arrow && arrow.b[1] < arrow.a[1]);
  }
  assert.match(loop.legend(2, 'side'), /ritorno.*scende.*destra/i);
});

test('the source and ambient labels clear all net radiation arrow ends in the top view', async () => {
  const radiation = await bench('L05-03');
  for (const temperature of [200, 300, 400, 500]) {
    const scene = radiation.elements(temperature, 2);
    assert.equal(scene.some(mark => mark.kind === 'label' && ['Sistema','Ambiente'].includes(mark.text)), false);
    const arrows = scene.filter(mark => mark.kind === 'arrow' && mark.c === colore.viola);
    assert.equal(arrows.length, temperature === 300 ? 0 : 3);
    assert.ok(arrows.every(arrow => Math.sign(arrow.b[0] - arrow.a[0]) === Math.sign(temperature - 300)));
  }
  assert.match(radiation.legend(2, 'top'), /sistema.*sinistra.*ambiente.*destra.*300 K.*frecce.*scambio netto/i);
});
