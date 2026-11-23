import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defaults, inRange } from '../static/js/banchi/misure.js';
const benches = JSON.parse(readFileSync(new URL('../content/banchi.json', import.meta.url)));
const models = Object.fromEntries(
  await Promise.all(
    benches.map(async (b) => [b.model, await import('../static/js/banchi/modelli/' + b.model + '.js')]),
  ),
);
const near = (a, b, eps = 1e-8) =>
  assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), a + ' ≠ ' + b);
const inputs = (model, override) => ({ ...defaults(models[model].params), ...override });
const run = (model, p) => models[model].solve(inputs(model, p));
test('01 · contatto statico, soglia, distacco e forza inversa', () => {
  for (const F of [-8, 0, 8]) {
    const s = run('piano', { angle: 0, m: 2, ms: 0.5, F });
    near(s.normal, 19.62);
    near(s.a, 0);
    near(s.friction, -F);
  }
  const s = run('piano', { angle: 30, m: 2, ms: 0, mk: 0, F: 0 });
  near(s.parallel, -9.81);
  near(s.a, -4.905);
  near(0.5 * Math.abs(s.a) * s.duration ** 2, 0.8);
  const threshold = run('piano', { angle: 0, m: 1, F: 4.905, ms: 0.5 });
  assert.equal(threshold.rest, true);
  const up = run('piano', { angle: 0, m: 2, ms: 0.5, mk: 0.25, F: 12 });
  near(up.a, (12 - 4.905) / 2);
  near(up.a * 2 - up.friction, 12);
});
test('02 · gravità, tempi, gittata, energia e rotazione del piano di volo', () => {
  for (const azimuth of [-75, 0, 50]) {
    const s = run('volo', { speed: 4, elevation: 30, azimuth });
    near(s.duration, 4 / 9.81);
    near(s.range, 2 * Math.sqrt(3) * s.duration);
    for (const t of [0, s.duration / 2, s.duration]) {
      const q = models.volo.sample(s, t);
      near(0.5 * (s.vx ** 2 + s.vz ** 2 + q.vy ** 2) + 9.81 * q.y, 8);
    }
    near(models.volo.sample(s, s.duration / 2).vy, 0);
    near(models.volo.sample(s, s.duration).y, 0);
  }
  near(run('volo', { elevation: 0 }).duration, 0);
  near(run('volo', { elevation: 90 }).range, 0);
});
test('03 · pressione di superficie, incremento, indipendenza da p₀ e inversione SI', () => {
  const top = run('stevino', { h: 0, p0: 93 });
  near(top.absolute, 93);
  for (const p0 of [80, 100]) {
    const s = run('stevino', { h: 1.5, rho: 800, p0 });
    near(s.relative, 11.772);
    near(((s.absolute - p0) * 1000) / (800 * 9.81), 1.5);
    near(s.bottom - p0, 15.696);
  }
});
test('04 · profilo integrato, portata, unità, r⁴ reciproco e validità', () => {
  const a = run('tubo', { r: 1 }),
    b = run('tubo', { r: 2 });
  near(b.Q / a.Q, 16);
  const imposed = run('tubo', { mode: 'flow', r: 1, flow: a.Q * 1e6 });
  near(imposed.dp, a.dp);
  near(imposed.dp / run('tubo', { mode: 'flow', r: 2, flow: a.Q * 1e6 }).dp, 16);
  near(models.tubo.velocity(a, 1), 0);
  near(models.tubo.velocity(a, 0), 2 * a.mean);
  let integral = 0;
  for (let i = 0; i < 1000; i++) {
    const r = (i + 0.5) / 1000;
    integral += (2 * Math.PI * a.R ** 2 * r * models.tubo.velocity(a, r)) / 1000;
  }
  near(integral / a.Q, 1, 1e-6);
  near(a.re, (1000 * a.mean * 2 * a.R) / 0.004);
  assert.equal(run('tubo', { mode: 'flow', r: 0.5, mu: 1, flow: 12 }).laminar, false);
});
test('05 · Boyle, isocora, moli, equivalenza kPa·L = J', () => {
  const a = run('gas', { mol: 0.1, T: 300, V: 3 });
  near(a.pressure, 83.14462618);
  near(a.pressure * 1000 * 0.003, 0.1 * 8.314462618 * 300);
  near(run('gas', { V: 1.5 }).pressure, 2 * a.pressure);
  near(run('gas', { T: 600 }).pressure, 2 * a.pressure);
  near(run('gas', { mol: 0.2 }).pressure, 2 * a.pressure);
});
test('06 · segno, potenza conservata tra facce, area, isolamento e inversa', () => {
  const a = run('calore', { left: 80, right: 20, L: 10, A: 16, k: 2 });
  near(a.flux, 1200);
  near(a.power, 1.92);
  near(a.gradient, -600);
  near(run('calore', { left: 20, right: 80 }).power, -a.power);
  near(run('calore', { left: 20, right: 20 }).power, 0);
  near(run('calore', { L: 20 }).power, 0.96);
  near((2 * 0.0016 * 60) / a.power, 0.1);
  near(run('calore', { A: 32 }).flux, a.flux);
});
test('07 · segno, sovrapposizione, V scalare, rotazione 3D, singolarità', () => {
  const sources = [
      { q: 1, pos: [-1, 0, 0] },
      { q: -1, pos: [1, 0, 0] },
    ],
    F = models.campo.field;
  const mid = F(sources, [0, 0, 0]);
  near(mid.E[0], 18);
  near(mid.V, 0);
  near(
    F(
      sources.map((o) => ({ ...o, q: 1 })),
      [0, 0, 0],
    ).magnitude,
    0,
  );
  const rotated = F(
    sources.map((o) => ({ ...o, pos: [0, 0, o.pos[0]] })),
    [0, 0, 0],
  );
  near(rotated.E[2], 18);
  assert.equal(F(sources, sources[0].pos), null);
  near(F([{ q: 0, pos: [0, 0, 0] }], [0, 0, 0]).magnitude, 0);
  const lone = [sources[0]],
    a = F(lone, [0, 0, 0]),
    b = F(lone, [1, 0, 0]);
  near(a.magnitude / b.magnitude, 4);
  near(a.V / b.V, 2);
});
test('08 · Kirchhoff, bilancio di potenza, formula inversa e generatore a tensione nulla', () => {
  for (const mode of ['Serie', 'Parallelo']) {
    const s = run('circuito', { mode, U: 6, R1: 6, R2: 3 });
    near(s.P1 + s.P2, 6 * s.I);
    near(s.V1 / s.I1, 6);
    if (mode === 'Serie') {
      near(s.I, 2 / 3);
      near(s.I1, s.I2);
      near(s.V1 + s.V2, 6);
    } else {
      near(s.I, 3);
      near(s.I1 + s.I2, s.I);
      near(s.V1, s.V2);
    }
  }
  near(run('circuito', { U: 0 }).P, 0);
});
test('09 · raggi coniugati, reale, virtuale, infinito e fuoco sullo schermo', () => {
  for (const [p, f, expected] of [
    [30, 10, 15],
    [5, 10, -10],
    [20, 10, 20],
  ]) {
    const s = run('lente', { p, f, screen: 15 });
    near(s.q, expected);
    near(1 / p + 1 / s.q, 1 / f);
    near(1 - s.q / f, -s.q / p);
    near(s.m, -s.q / p);
    assert.equal(s.sharp, s.q === 15);
  }
  assert.equal(run('lente', { p: 10, f: 10 }).q, Infinity);
});
test('10 · nodi, ventri, periodicità, cammino e ampiezza RMS', () => {
  for (const phase of [0, 90, 180]) {
    const s = run('onde', { x: 0, z: 0.5, phase, f: 2 });
    near(s.lambda, 0.3);
    near(s.probe.r1, s.probe.r2);
    near(s.envelope, 0.004 * Math.abs(Math.cos((phase * Math.PI) / 360)));
    let squares = 0;
    for (let i = 0; i < 120; i++) {
      const t = i / 240,
        y = models.onde.displacement(s, s.probe, t);
      squares += y * y;
      near(y, models.onde.displacement(s, s.probe, t + 0.5));
    }
    near((2 * squares) / 120, s.envelope ** 2, 1e-12);
  }
  const s = run('onde', { x: 0.15, z: 0, d: 0.8, f: 1, phase: 0 });
  near(s.envelope, 0);
});
for (const b of benches)
  test(b.id + ' · dominio, ingressi immutabili e campionamento indipendente dai fotogrammi', () => {
    const m = models[b.model],
      p = Object.freeze(defaults(m.params)),
      s = m.solve(p),
      saved = structuredClone(s);
    assert.ok(inRange(m.params, p));
    for (const def of m.params.filter((x) => !x.options)) {
      assert.ok(!inRange(m.params, { ...p, [def.key]: def.min - 1 }));
      assert.ok(!inRange(m.params, { ...p, [def.key]: def.max + 1 }));
    }
    const t = (s.duration || 1) * 0.4,
      expected = m.readings(p, s, t);
    for (const hz of [24, 60, 120]) {
      for (let i = 0; i < 20; i++) m.readings(p, s, i / hz);
      assert.deepEqual(m.readings(p, s, t), expected);
    }
    assert.deepEqual(s, saved);
    assert.deepEqual(m.solve(p), s);
    assert.equal(m.steps(p, s).length, 4);
    assert.ok(m.graphs(p, s, t, 3).length);
  });
