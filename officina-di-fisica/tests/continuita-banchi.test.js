import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tavolo, colore } from '../static/js/banchi/voci/geometria.js';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';

const courses = await Promise.all([1, 2, 3, 4, 5, 6].map(async (id) =>
  JSON.parse(await readFile(new URL('../content/esperienze-C' + id + '.json', import.meta.url)))));
const topics = courses.flat();
const length = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const experiment = (id) => esperienza(topics.find(r => r.id === 'SIM-' + id));

test('isolated zero segments disappear, a closed path keeps its final edge', () => {
  const paper = tavolo(2), origin = [0, 0, 0], a = [1, 0, 0], b = [0, 1, 0];
  paper.line([], 1);
  paper.line([a], 1);
  paper.line([origin, origin, [1e-15, 0, 0]], 1);
  paper.line([origin, a, a, b, origin], 2, true);
  assert.deepEqual(paper.elementi, [{kind:'line', points:[origin, a, b, origin], c:2, dash:true}]);
});

test('all published topics produce finite, nondegenerate geometry over the common sampling grid', async () => {
  assert.equal(topics.length, 181);
  let states = 0;
  for (const topic of topics) {
    const exp = await esperienza(topic), { min, max, step } = topic.control;
    const midpoint = min + Math.round((max - min) / step / 2) * step;
    for (const x of new Set([min, midpoint, max, ...topic.references.map(([v]) => v)])) {
      const {y} = exp.model.solve({x});
      const end = exp.clock?.duration(x, y) || 0;
      for (const t of new Set([0, end / 2, end])) {
        states++;
        const elems = exp.elements(x, 2, t);
        assert.ok(elems.length, topic.id);
        for (const e of elems) {
          const points = e.points || [e.p, e.a, e.b].filter(Boolean);
          for (const point of points) assert.ok(point.length === 3 && point.every(Number.isFinite), topic.id);
          if (e.kind === 'line') {
            assert.ok(points.length >= 2, topic.id);
            for (let j = 1; j < points.length; j++) assert.ok(length(points[j - 1], points[j]) >= 1e-9, topic.id);
          }
          if (e.kind === 'rod') assert.ok(length(e.a,e.b) >= 1e-9 && [e.r,e.r2].every(r => Number.isFinite(r) && r >= 0) && Math.max(e.r,e.r2) > 0, topic.id);
          if (e.kind === 'box') assert.ok(e.size.every(n => Number.isFinite(n) && n > 0), topic.id);
          if (e.kind === 'ball') assert.ok(Number.isFinite(e.r) && e.r > 0, topic.id);
        }
      }
    }
  }
  assert.equal(states, 1199);
});

test('a vacuum wave keeps transverse fields in phase and carries energy along the optical axis', async () => {
  const em = await experiment('C5-L06-01'), amplitude = await experiment('C5-L06-02');
  const c = 3e8;
  for (const phase of [0, 30, 90, 180, 210, 270, 360]) {
    const state = em.model.solve({x: phase});
    const [, [,b,unitB], [,e,unitE]] = em.model.readings({x:phase}, state);
    assert.equal(unitE, 'V/m');
    assert.equal(unitB, 'nT');
    assert.ok(Math.abs(e / c * 1e9 - b) < 1e-10);
    const curves = em.elements(phase, 2).filter(d => d.kind === 'line' && d.points.length > 100);
    const electric = curves.find(d => d.c === colore.viola).points;
    const magnetic = curves.find(d => d.c === colore.verde).points;
    for (let j = 0; j < electric.length; j++) {
      const [x,y,z] = electric[j], [u,v,w] = magnetic[j];
      assert.equal(x,u);
      assert.equal(z,0);
      const ey = y - v;
      assert.ok(Math.abs(ey-w) < 1e-12);
      assert.ok(ey*w >= -1e-15);
    }
    if (Math.abs(e) > 1e-9) assert.equal(Math.sign(electric[0][1] - magnetic[0][1]), Math.sign(e));
  }
  for (const E0 of [0, 1, 2, 4]) {
    // Integrate the Poynting flux over a period relative to a 2 V/m reference.
    let energy = 0, reference = 0;
    for (let i = 0; i < 128; i++) {
      const phase = (i + 0.5) * 2 * Math.PI / 128;
      const e = E0 * Math.cos(phase), ref = 2 * Math.cos(phase);
      energy += e * (e / c);
      reference += ref * (ref / c);
    }
    assert.ok(Math.abs(energy/reference - amplitude.model.solve({x:E0}).y) < 1e-12);
  }
  for (const t of [0, 2.5, 7.5, 20]) {
    const zero = amplitude.elements(0, 2, t);
    assert.deepEqual(zero.map(e=>e.kind), ['line','label']);
    assert.equal(zero[1].text, 'E = 0 · B = 0');
  }
});

test('integrating signed velocity recovers the track and distinguishes outward and return readings', async () => {
  const bench = await experiment('C1-L003-06');
  const velocity = time => time < 2 ? 2 : -2;
  for (let quarter = 0; quarter <= 16; quarter++) {
    const t = quarter / 4;
    let x = 0;
    for (let j = 0; j < quarter; j++) x += velocity((j + 0.5) / 4) / 4;
    const state = bench.model.solve({x:t});
    assert.equal(state.y,x);
    const readings = bench.model.readings({x:t}, state, t);
    assert.deepEqual(readings[1].slice(1), [x,'m']);
    if (t !== 2) assert.deepEqual(readings[2].slice(1), [velocity(t),'m/s']);
    assert.equal(bench.measurement(t).value,x);
  }
});

test('transparent lens sections meet without internal faces and parallel rays cross at the marked focus', async () => {
  const lens = await experiment('C5-L10-01');
  for (const f of [5, 10, 20]) {
    const solids = lens.elements(f, 2);
    const rings = solids.filter(s => s.kind === 'rod' && s.c === colore.acqua);
    assert.ok(rings.length > 1 && rings.every(s => s.openEnded));
    assert.equal(rings[0].r, 0);
    assert.equal(rings.at(-1).r2, 0);
    for (let j = 1; j < rings.length; j++) {
      assert.deepEqual(rings[j].a, rings[j-1].b);
      assert.equal(rings[j].r, rings[j-1].r2);
    }
    const focus = solids.find(s => s.kind === 'ball' && s.p[0] > 0).p;
    const rays = solids.filter(s => s.kind === 'line' && s.c === colore.ocra);
    assert.equal(rays.length,3);
    for (const {points:[start, lens, , end]} of rays) {
      assert.equal(start[1], lens[1]);
      if (end[1] === lens[1]) continue;
      const crossing = lens[0] + (end[0]-lens[0])*(focus[1]-lens[1])/(end[1]-lens[1]);
      assert.ok(Math.abs(crossing-focus[0]) < 1e-12);
    }
    assert.equal(lens.model.solve({x:f}).y, 1 / (f * 1e-2));
  }
});
