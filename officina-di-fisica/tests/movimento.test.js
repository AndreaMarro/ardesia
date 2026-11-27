import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults, nextTime } from '../static/js/banchi/misure.js';
import * as volo from '../static/js/banchi/modelli/volo.js';
import * as tubo from '../static/js/banchi/modelli/tubo.js';
import * as gas from '../static/js/banchi/modelli/gas.js';
import * as induzione from '../static/js/banchi/modelli/induzione.js';
import * as onde from '../static/js/banchi/modelli/onde.js';

const near = (a, b, tol = 1e-8) =>
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), a + ' ≠ ' + b);
const slope = (fn, t, h = 1e-5) => (fn(t + h) - fn(t - h)) / (2 * h);
function integral(fn, a, b, parts = 3000) {
  let sum = 0;
  const dx = (b - a) / parts;
  for (let i = 0; i < parts; i++) sum += fn(a + (i + 0.5) * dx) * dx;
  return sum;
}
test('Lancio · differenze centrate, energia e radici anche nel lancio verticale', () => {
  for (const elevation of [0, 30, 65, 90]) {
    const p = { speed: 5, elevation, azimuth: -25 },
      s = volo.solve(p);
    near(volo.sample(s, 0).y, 0);
    near(volo.sample(s, s.duration).y, 0);
    if (!s.duration) continue;
    const t = s.duration * 0.33,
      q = volo.sample(s, t);
    near(
      slope((t) => volo.sample(s, t).y, t),
      q.vy,
    );
    near(
      slope((t) => volo.sample(s, t).vy, t),
      -9.81,
    );
    near(
      slope((t) => volo.sample(s, t).x, t),
      s.vx,
    );
    near(
      slope((t) => volo.sample(s, t).z, t),
      s.vz,
    );
    near((s.vx ** 2 + s.vz ** 2 + q.vy ** 2) / 2 + 9.81 * q.y, p.speed ** 2 / 2);
  }
});
test('Capillare · integrazione sugli anelli, moto locale e dominio di Reynolds', () => {
  const p = defaults(tubo.params),
    s = tubo.solve(p);
  near(
    integral((r) => 2 * Math.PI * r * tubo.velocity(s, r / s.R), 0, s.R),
    s.Q,
    1e-11,
  );
  near(tubo.velocity(s, 1), 0);
  near(tubo.velocity(s, 0), 2 * s.mean);
  for (const h of [0, 0.5, 0.9, 1])
    near(
      slope((t) => tubo.tracerFraction(s, h, t, 0.15) * s.L, 0.02),
      tubo.velocity(s, h),
    );
  near(tubo.solve({ ...p, r: p.r * 2 }).Q, 16 * s.Q);
  const fixed = tubo.solve({ ...p, mode: 'flow', flow: 1 });
  near(tubo.solve({ ...p, mode: 'flow', flow: 1, r: 2 * p.r }).dp, fixed.dp / 16);
  const out = tubo.solve({ ...p, mode: 'flow', r: 0.5, mu: 1, flow: 12 });
  assert.ok(!out.laminar && out.duration === 0);
});
test('Pistone · pV costante e quadratura indipendente del lavoro con entrambi i segni', () => {
  for (const end of [1.5, 3, 6]) {
    const s = gas.solve({ ...defaults(gas.params), end });
    for (const t of [0, 0.71, 3, 6]) {
      const a = gas.sample(s, t);
      near(a.V, 3 + ((end - 3) * t) / 6);
      near(a.V * a.pressure, 8.314462618 * 0.1 * 300);
      near(
        a.work,
        integral((v) => s.product / v, s.start, a.V),
        1e-7,
      );
      assert.equal(Math.sign(a.work), Math.sign(a.V - s.start));
    }
  }
});
test('Faraday e Lenz · derivata del flusso, campo nullo istantaneo, circuito aperto e carico resistivo', () => {
  for (const x of [-2, 0, 3])
    for (const circuit of ['open', 'closed']) {
      const s = induzione.solve({ x, circuit, middle: 0 });
      for (const t of [0.2, 1, 1.8]) {
        const q = induzione.sample(s, t);
        near(q.emf, -slope((t) => induzione.sample(s, t).flux, t));
        near(q.emf, -10 * 0.05 * x);
        near(q.current, circuit === 'open' ? 0 : q.emf / 5);
        if (circuit === 'closed') near(q.emf * q.current, 5 * q.current ** 2);
      }
      near(induzione.sample(s, 1).B, 0);
    }
  near(induzione.sample(induzione.solve({ x: 0, middle: 2 }), 0.25).emf, 0);
});
test('Onde · traslazione delle creste, somma puntuale e nodi per fase o cammino', () => {
  const p = defaults(onde.params);
  for (const phase of [0, 90, 180]) {
    const s = onde.solve({ ...p, x: 0, phase });
    let max = 0;
    for (let i = 0; i < 500; i++) {
      const t = i / (500 * p.f),
        a = onde.sample(s, t);
      near(a.y, a.first + a.second);
      near(onde.sample(s, t + 1 / p.f).y, a.y);
      max = Math.max(max, Math.abs(a.y));
    }
    near(max, s.envelope, 1e-6);
    if (phase === 180) near(max, 0);
    if (phase === 0) near(s.envelope, 0.004);
  }
  const node = onde.solve({ ...p, d: 0.6, f: 1, x: 0.15, z: 0, phase: 0 });
  near(Math.abs(node.probe.r2 - node.probe.r1), node.lambda / 2);
  near(node.envelope, 0);
  const s = onde.solve(p),
    dt = 0.12;
  near(Math.cos(s.k * 0.2), Math.cos(s.k * (0.2 + 0.6 * dt) - s.omega * dt));
});
test('Onde · lettura dello zero istantaneo e degli spostamenti prima e dopo', () => {
  const p = {f:1, d:1.2, phase:0, x:0, z:0};
  const s = onde.solve(p);
  const t = 1 / 4;
  const displayed = time => onde.readings(p, s, time).find(([name]) => name === 'Spostamento istantaneo')[1];
  assert.equal(displayed(t), 0);
  assert.equal(s.envelope, 0.004);
  assert.equal(displayed(t - 0.000001), 1000 * onde.sample(s, t - 0.000001).y);
  assert.equal(displayed(t + 0.000001), 1000 * onde.sample(s, t + 0.000001).y);
  assert.ok(displayed(t - 0.000001) > 0 && displayed(t + 0.000001) < 0);
});
test('Orologio · stesso istante a 24, 60, 120 fps, arresto e riavvio del ciclo', () => {
  for (const fps of [24, 60, 120]) {
    let t = 0;
    for (let i = 0; i < fps * 3; i++) t = nextTime(t, 1 / fps, 8, 0.5, false);
    near(t, 1.5);
  }
  near(nextTime(0.9, 0.4, 1, 1, true), 0.3);
  near(nextTime(0.9, 10, 1, 1, false), 1);
  near(nextTime(0.1, 1, 0, 1, true), 0);
});
