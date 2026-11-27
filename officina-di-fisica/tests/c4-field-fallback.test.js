import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { colore } from '../static/js/banchi/voci/geometria.js';

globalThis.document ??= { querySelector: () => null };
const { disegna2D } = await import('../static/js/banchi/voci/tavola.js');

const sources = JSON.parse(readFileSync(new URL('../content/esperienze-C4.json', import.meta.url)));
const source = id => sources.find(row => row.id === id);
const css = color => '#' + color.toString(16).padStart(6, '0');

function arrowhead(arrow, width) {
  const svg = disegna2D([arrow], 'Campo elettrico', 'bench-diagram', width);
  const shape = svg.match(/<polygon points="([^"]+)" fill="([^"]+)"\/>/);
  assert.equal(shape[2], css(arrow.c));
  return shape[1].split(' ').map(point => point.split(',').map(Number));
}

test('the 8 cm field detail has a readable head in both fallback widths', async () => {
  const bench = await esperienza(source('SIM-C4-L02-01'));
  const at = 8;
  assert.equal(bench.model.solve({x:at}).y, 45 / 32);
  const detail = bench.elements(at, 2).find(item => item.kind === 'arrow' && item.c === colore.ocra);
  assert.ok(detail.b[0] > detail.a[0]);
  for (const width of [320, 1280]) {
    const [tip, upper, lower] = arrowhead(detail, width);
    assert.ok(tip[0] > upper[0] && upper[0] === lower[0]);
    const halfBase = Math.abs(upper[1] - lower[1]) / 2;
    assert.ok(halfBase >= 4.5, `arrowhead at ${width}px must extend beyond the 2.7px shaft`);
  }
});

test('both midpoint extrema keep the displayed arrowhead clear of the charged spheres', async () => {
  const row = source('SIM-C4-L02-02');
  const bench = await esperienza(row);
  for (const at of [row.control.min, row.control.max]) {
    const scene = bench.elements(at, 2);
    const primary = scene.find(item => item.kind === 'arrow' && item.c === colore.viola);
    assert.equal(Math.sign(primary.b[0] - primary.a[0]), Math.sign(bench.model.solve({x:at}).y));
    const spheres = scene.filter(item => item.kind === 'ball' && Math.abs(item.p[0]) > 1);
    for (const width of [320, 1280]) {
      const points = arrowhead(primary, width);
      const bottom = Math.max(...points.map(point => point[1]));
      for (const sphere of spheres) {
        const top = 156 - 44 * sphere.p[1] + 11 * sphere.p[2] - 44 * sphere.r;
        assert.ok(bottom < top, `arrowhead must clear the source silhouette at ${width}px, q=${at}`);
      }
    }
  }
  assert.equal(bench.model.solve({x:1}).y, 0);
  assert.equal(bench.elements(1, 2).filter(item => item.kind === 'arrow').length, 0);
});
