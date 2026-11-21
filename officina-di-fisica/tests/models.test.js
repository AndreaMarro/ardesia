import test from 'node:test';
import assert from 'node:assert/strict';
import { models, initial } from '../static/js/models.js';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t * Math.max(1, Math.abs(b)), a + ' ≠ ' + b);
test('C1 · soglia, quiete, attrito nullo, distacco e bilancio verticale', () => {
  const calc = (F, mu = 0.4) => models.C1({ m: 2, F, mu });
  close(calc(0).friction, 0);
  close(calc(4).a, 0);
  close(calc(2 * 9.81 * 0.4).a, 0);
  close(calc(10).a, (10 - 0.3 * 2 * 9.81) / 2);
  assert.equal(calc(10).moving, true);
  close(calc(9, 0).a, 4.5);
});
test('C2 · raggio dimezzato, proporzionalità, regime laminare', () => {
  const d = initial('C2');
  const ref = models.C2(d);
  close(ref.q, ((Math.PI * 0.001 ** 4 * 200) / (8 * 0.004 * 0.25)) * 1e6);
  close(models.C2({ ...d, r: 0.5 }).q / ref.q, 1 / 16);
  close(models.C2({ ...d, eta: 8 }).q / ref.q, 0.5);
  close(models.C2({ ...d, dp: 0 }).q, 0);
  close(models.C2({ ...d, dp: 400 }).q / ref.q, 2);
  assert.ok(models.C2({ r: 2, dp: 500, eta: 3 }).re < 2000);
});
test('C3 · stati, area, lavoro di compressione, primo principio', () => {
  for (const mode of ['Isoterma', 'Isobara', 'Isocora', 'Adiabatica']) {
    for (const ratio of [0.5, 1, 2]) {
      const v = models.C3({ ratio, mode });
      close(v.Q - v.W, v.U);
      close((v.p * v.V) / 100, v.T / 300);
      if (mode === 'Isocora') close(v.W, 0);
      if (mode === 'Isoterma') {
        close(v.U, 0);
        close(v.W, 100 * Math.log(ratio));
      }
      if (mode === 'Adiabatica') {
        close(v.Q, 0);
        close(v.p * v.V ** (5 / 3), 100);
      }
      if (ratio < 1 && mode !== 'Isocora') assert.ok(v.W < 0);
    }
  }
});
test('C4 · nodi, maglia, potenza e tensione nulla', () => {
  for (const mode of ['Serie', 'Parallelo'])
    for (const U of [0, 6, 12]) {
      const v = models.C4({ U, R1: 100, R2: 200, mode });
      close(v.P, v.I1 ** 2 * 100 + v.I2 ** 2 * 200);
      if (mode === 'Serie') {
        close(v.I1, v.I2);
        close(v.V1 + v.V2, U);
      } else {
        close(v.I1 + v.I2, v.I);
        close(v.V1, U);
        close(v.V2, U);
      }
    }
});
test('C5 · due raggi si intersecano nel punto coniugato', () => {
  for (const p of [3, 9.5, 10.5, 20, 45]) {
    const f = 10,
      v = models.C5({ p, f });
    close(1 / p + 1 / v.q, 1 / f);
    close(1 - v.q / f, -v.q / p);
    close(v.m, -v.q / p);
    assert.equal(v.q > 0, p > f);
  }
  assert.equal(models.C5({ p: 10, f: 10 }).q, Infinity);
});
