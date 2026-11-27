import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

globalThis.document ??= { querySelector: () => null };
const { disegna2D } = await import('../static/js/banchi/voci/tavola.js');
const records = JSON.parse(readFileSync(new URL('../content/esperienze-C2.json', import.meta.url)));
const continuity = records.find(record => record.id === 'SIM-C2-L005-03');

test('continuity keeps the downstream direction legible at every allowed area', async () => {
  const bench = await esperienza(continuity);
  for (let area = continuity.control.min; area <= continuity.control.max; area += continuity.control.step) {
    assert.equal(bench.model.solve({x:area}).y, 24 / area);
    const arrows = bench.elements(area, 2).filter(element => element.kind === 'arrow');
    const upstream = arrows.find(arrow => arrow.c === colore.verde);
    const downstream = arrows.find(arrow => arrow.c === colore.viola);
    assert.ok(upstream && downstream);
    assert.ok(Math.abs(upstream.b[0] - upstream.a[0] - 0.4) < 1e-12);
    assert.ok(Math.abs(downstream.b[0] - downstream.a[0] - 1.6 / area) < 1e-12);
    assert.deepEqual(downstream.a.slice(1), downstream.b.slice(1));
    for (const width of [320, 1280]) {
      const svg = disegna2D([downstream], 'Flusso nel condotto', 'bench-diagram', width);
      const match = svg.match(/<polygon points="([^"]+)" fill="[^"]+"\/>/);
      const [tip, upper, lower] = match[1].split(' ').map(pair => pair.split(',').map(Number));
      assert.ok(tip[0] > upper[0] && upper[0] === lower[0]);
      assert.ok(Math.abs(upper[1] - lower[1]) / 2 >= 2, `area=${area} cm², width=${width}px`);
    }
  }
});

test('bifurcation maintains proportional, distinguishable arrows and drops only zero flow', async () => {
  const branch = records.find(record => record.id === 'SIM-C2-L005-05');
  const bench = await esperienza(branch);
  for (let upper = branch.control.min; upper <= branch.control.max; upper += branch.control.step) {
    const lower = 12 - upper;
    assert.equal(bench.model.solve({x:upper}).y, lower);
    const arrows = bench.elements(upper, 2).filter(element => element.kind === 'arrow');
    for (const [flow, color] of [[upper, colore.viola], [lower, colore.verde]]) {
      const arrow = arrows.find(element => element.c === color);
      if (flow === 0) {
        assert.equal(arrow, undefined);
        continue;
      }
      assert.ok(Math.abs(arrow.b[0] - arrow.a[0] - 1.1 * flow / 12) < 1e-12);
      assert.equal(arrow.dettaglio, true);
    }
  }
  assert.match(bench.legend(2, 'side'), /si sovrappongono/);
  assert.match(bench.legend(2, 'side'), /dall’alto/);
  assert.doesNotMatch(bench.legend(2, 'diagram'), /si sovrappongono/);
});
