import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

globalThis.document ??= { querySelector: () => null };
const { disegna2D } = await import('../static/js/banchi/voci/tavola.js');
const original = JSON.parse(readFileSync(new URL('../content/esperienze-C2.json', import.meta.url)));
const activity = id => esperienza(original.find(row => row.id === id));

function verifyDirection(arrow, expectedLength) {
  assert.equal(arrow.dettaglio, true);
  assert.ok(Math.abs(arrow.b[0] - arrow.a[0] - expectedLength) < 1e-12);
  assert.deepEqual(arrow.b.slice(1), arrow.a.slice(1));
  for (const width of [320, 1280]) {
    const polygon = disegna2D([arrow], 'Direzione del flusso', 'bench-diagram', width)
      .match(/<polygon points="([^"]+)" fill="[^"]+"\/>/);
    const [tip, upper, lower] = polygon[1].split(' ').map(point => point.split(',').map(Number));
    assert.ok(tip[0] > upper[0] && upper[0] === lower[0]);
    assert.ok(Math.abs(upper[1] - lower[1]) > 2.7);
  }
}

test('volume-flow arrows retain their measured lengths and both visible tips', async () => {
  const bench = await activity('SIM-C2-L005-01');
  for (const time of [0, 3]) {
    assert.equal(bench.elements(0, 2, time).filter(element => element.kind === 'arrow').length, 0);
    for (let speed = 1; speed <= 12; speed++) {
      assert.equal(bench.model.solve({x: speed}).y, 4 * speed);
      const arrows = bench.elements(speed, 2, time).filter(element => element.kind === 'arrow');
      assert.deepEqual(arrows.map(arrow => arrow.c), [colore.verde, colore.viola]);
      for (const arrow of arrows) verifyDirection(arrow, speed / 10);
    }
  }
});

test('the Pitot preserves its equal gain and gives separate direction details at very small flows', async () => {
  const bench = await activity('SIM-C2-L006-02');
  assert.equal(bench.elements(0, 2).filter(element => element.kind === 'arrow').length, 0);
  for (let speed = 0.25; speed <= 5; speed += 0.25) {
    assert.equal(bench.model.solve({x: speed}).y, speed * speed / 2);
    const arrows = bench.elements(speed, 2).filter(element => element.kind === 'arrow');
    const details = arrows.filter(arrow => arrow.c === colore.ocraScuro);
    assert.equal(details.length, speed <= 0.5 ? 2 : 0);
    for (const arrow of arrows) {
      const factor = arrow.c === colore.ocraScuro ? 8 : 1;
      verifyDirection(arrow, factor * speed / 5);
    }
    assert.deepEqual(arrows.slice(0, 2).map(arrow => arrow.c), [colore.verde, colore.viola]);
  }
  for (const view of ['orbit', 'side', 'top', 'diagram']) {
    assert.match(bench.legend(2, view), /ocra.*otto volte/i);
  }
});

test('moving tracers stay behind the direction marks in the section-flow scene', async () => {
  const bench = await activity('SIM-C2-L005-01');
  for (const [speed, time] of [[6, 0], [7, 3], [1, 3]]) {
    const scene = bench.elements(speed, 2, time);
    const arrows = scene.filter(element => element.kind === 'arrow');
    const tracers = scene.filter(element => element.kind === 'ball' && element.r === 0.065);
    assert.equal(arrows.length, 2);
    assert.equal(tracers.length, 6);
    for (const arrow of arrows) {
      assert.ok(tracers.every(tracer => arrow.b[2] > tracer.p[2] + tracer.r + 0.08));
    }
  }
  assert.match(bench.legend(2, 'side'), /frecce.*di lato.*traccianti/i);
});
