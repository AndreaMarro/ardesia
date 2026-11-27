import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';
globalThis.document ??= { querySelector: () => null };
const { disegna2D } = await import('../static/js/banchi/voci/tavola.js');

const source = JSON.parse(readFileSync(new URL('../content/esperienze-C5.json', import.meta.url)))
  .find(record => record.id === 'SIM-C5-L05-03');

test('Doppler direction remains visible in the flat view without changing the velocity scale', async () => {
  const bench = await esperienza(source);
  for (const width of [320, 1280]) {
    for (const [speed, instant] of [[-20, 0], [-20, 5], [-20, 15], [40, 20], [-5, 5], [5, 15]]) {
      const elements = bench.elements(speed, 2, instant);
      const arrow = elements.find(element => element.kind === 'arrow' && element.c === colore.rosso);
      assert.ok(arrow && Math.abs(arrow.b[0] - arrow.a[0] - 2.4 * speed / 300) < 1e-15);
      assert.equal(arrow.dettaglio, true);
      const drawing = disegna2D(elements, source.title, 'bench-diagram', width);
      const [, points] = drawing.match(/<polygon points="([^"]+)" fill="#b94f48"\/>/) ?? [];
      assert.ok(points, 'Doppler velocity head in the actual flat drawing');
      const [, baseA, baseB] = points.split(' ').map(point => point.split(',').map(Number));
      assert.ok(Math.hypot(baseA[0] - baseB[0], baseA[1] - baseB[1]) > 2.7);
    }
    assert.equal(bench.elements(0, 2, 10).some(element => element.kind === 'arrow' && element.c === colore.rosso), false);
  }
});

test('Doppler legends identify pressure and explain the top projection', async () => {
  const bench = await esperienza(source);
  for (const view of ['orbit', 'side', 'top', 'diagram']) {
    const legend = bench.legend(2, view);
    assert.match(legend, /freccia viola.*pressione relativa/i);
    assert.match(legend, /ricevitore resta fermo/i);
  }
  assert.match(bench.legend(2, 'top'), /dall’alto.*laterale/i);
});

test('the small pressure signal keeps a distinguishable head at the two fallback widths', async () => {
  const bench = await esperienza(source);
  for (const instant of [0, 5, 15]) {
    const arrow = bench.elements(-20, 2, instant)
      .find(element => element.kind === 'arrow' && element.c === colore.viola);
    assert.ok(arrow);
    assert.equal(arrow.a[0], arrow.b[0]);
    assert.equal(arrow.a[2], arrow.b[2]);
    for (const width of [320, 1280]) {
      const svg = disegna2D([arrow], source.title, 'bench-diagram', width);
      const [, points] = svg.match(/<polygon points="([^"]+)" fill="#7350b0"\/>/) ?? [];
      assert.ok(points);
      const [, baseA, baseB] = points.split(' ').map(point => point.split(',').map(Number));
      assert.ok(Math.hypot(baseA[0] - baseB[0], baseA[1] - baseB[1]) > 2.7, `pressure tip at ${instant} ms and ${width}px`);
    }
  }
});
