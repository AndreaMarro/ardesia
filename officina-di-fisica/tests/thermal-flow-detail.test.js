import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {esperienza} from '../static/js/banchi/voci/esperimento.js';
import {colore} from '../static/js/banchi/voci/geometria.js';

const rows = JSON.parse(readFileSync(new URL('../content/esperienze-C3.json', import.meta.url)));
const simulation = id => esperienza(rows.find(row => row.id === id));
const arrows = (scene, color) => scene.filter(glyph => glyph.kind === 'arrow' && glyph.c === color);

function assertDisplacement(glyph, expected) {
  assert.ok(glyph, 'A nonzero transfer must have a visible detail arrow');
  const actual = glyph.b.map((coordinate, index) => coordinate - glyph.a[index]);
  assert.ok(actual.every((component, index) => Math.abs(component - expected[index]) < 1e-12));
}

test('the smallest positive work is represented with its true sense in both thermal machines', async () => {
  const fridge = await simulation('SIM-C3-L09-01');
  const engine = await simulation('SIM-C3-L09-02');
  for (const [machine, input, workOverScale, direction] of [
    [fridge, 5, 2.5 / 100, -1],
    [engine, 10, 3 / 200, 1],
  ]) {
    const detail = arrows(machine.elements(input, 2), colore.ocra);
    assert.equal(detail.length, 1);
    assertDisplacement(detail[0], [0, direction * 32 * 0.55 * workOverScale, 0]);
    assert.equal(arrows(machine.elements(0, 2), colore.ocra).length, 0);
    assert.equal(arrows(machine.elements(0, 2), colore.viola).length, 0);
    assert.match(machine.legend(), /ocra.*32 volte/);
  }
});

test('five early fusion frames retain a directional indicator for supplied energy', async () => {
  const fusion = await simulation('SIM-C3-L04-03');
  for (const [input, time, energy] of [
    [1, 0.125, 0.25], [1, 0.25, 0.5], [1, 0.375, 0.75], [2, 0.25, 0.5], [3, 0.375, 0.75],
  ]) {
    const detail = arrows(fusion.elements(input, 2, time), colore.ocra);
    assert.equal(detail.length, 1);
    assertDisplacement(detail[0], [128 * 0.85 * energy / 54, 0, 0]);
  }
  assert.equal(arrows(fusion.elements(1, 2, 0), colore.ocra).length, 0);
  assert.equal(arrows(fusion.elements(1, 2, 0), colore.rosso).length, 0);
  assert.match(fusion.legend(), /in alto, in ocra.*128 volte/);
});

test('larger transfers keep their existing scale and no magnified arrow', async () => {
  const fusion = await simulation('SIM-C3-L04-03');
  const engine = await simulation('SIM-C3-L09-02');
  const heated = fusion.elements(27, 2);
  const running = engine.elements(100, 2);
  assertDisplacement(arrows(heated, colore.rosso)[0], [0.85 / 2, 0, 0]);
  assertDisplacement(arrows(running, colore.viola)[0], [0, 0.55 * 30 / 200, 0]);
  assert.equal(arrows(heated, colore.ocra).length, 0);
  assert.equal(arrows(running, colore.ocra).length, 0);
});

test('legends explain the active view and distinguish heat from work', async () => {
  const engine = await simulation('SIM-C3-L09-02');
  assert.match(engine.legend(2, 'side'), /Obliqua o Laterale/);
  assert.doesNotMatch(engine.legend(2, 'diagram'), /Obliqua o Laterale/);
  assert.match(engine.legend(2, 'diagram'), /ocra.*32 volte/);
  const entropy = await simulation('SIM-C3-L10-01');
  for (const view of ['side', 'diagram']) {
    const legend = entropy.legend(2, view);
    assert.match(legend, /entra calore/);
    assert.match(legend, /scambio è nullo/);
    assert.doesNotMatch(legend, /lavoro|ocra/);
  }
});

test('the fallback arrowhead extends beyond the shaft without moving its tip', async () => {
  const fusion = await simulation('SIM-C3-L04-03');
  const [detail] = arrows(fusion.elements(1, 2, 0.125), colore.ocra);
  const previousDocument = globalThis.document;
  globalThis.document ??= {querySelector: () => null};
  let disegna2D;
  try {
    ({disegna2D} = await import('../static/js/banchi/voci/tavola.js'));
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
  }
  const projectedShort = {...detail,b:detail.a.map((start,index) => start+(detail.b[index]-start)/4)};
  const polygon = element => disegna2D([element], 'Dettaglio', 'bench-diagram', 294)
    .match(/<polygon points="([^"]+)"/)[1].split(' ').map(point => point.split(',').map(Number));
  const [tip, high, low] = polygon(projectedShort);
  const [plainTip, plainHigh, plainLow] = polygon({...projectedShort, dettaglio:false});
  assert.deepEqual(tip, plainTip);
  assert.ok(Math.abs(high[1]-low[1]) > 2.7);
  assert.ok(Math.abs(plainHigh[1]-plainLow[1]) <= 2.7);
});
