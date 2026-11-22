import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
const content = new URL('../content/', import.meta.url);
const read = (file) => JSON.parse(readFileSync(new URL(file, content)));
const records = [1, 2, 3, 4, 5, 6].flatMap((i) => read('esperienze-C' + i + '.json'));
const close = (actual, expected, id) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-5 * Math.max(1, Math.abs(expected)),
    id + ' · ' + actual + ' ≠ ' + expected,
  );
function finite(object, id) {
  if (typeof object === 'number')
    assert.ok(Number.isFinite(object), id + ' · coordinata o lettura non finita');
  else if (object && typeof object === 'object') for (const value of Object.values(object)) finite(value, id);
}
test('Ogni voce pubblicata ha esattamente una simulazione con ID, domanda e paragrafo propri', () => {
  const expected = [1, 2, 3, 4, 5, 6].flatMap((i) =>
    read('C' + i + '.json')
      .filter((r) => r.kind === 'lesson')
      .flatMap((l) => l.coverage.map((t) => l.id + '|' + t)),
  );
  assert.deepEqual(records.map((r) => r.skill + '|' + r.topic).sort(), expected.sort());
  assert.equal(records.length, new Set(records.map((r) => r.id)).size);
  assert.equal(records.length, new Set(records.map((r) => r.summary)).size);
  assert.equal(records.length, new Set(records.map((r) => r.transferPrompt)).size);
});
for (const r of records)
  test(r.id + ' · ' + r.title, async () => {
    const exp = await esperienza(r),
      { model, record } = exp,
      a = r.control;
    if (a.unit === '1' && !a.choices) assert.equal(model.params[0].unit, '');
    const solve = (x) => model.solve({ x }).y;
    for (const [x, result] of r.references) close(solve(x), result, r.id);
    const geometries = new Set();
    const ticks = Math.round((a.max - a.min) / a.step);
    for (let i = 0; i <= ticks; i++) {
      const x = a.min + i * a.step,
        state = model.solve({ x });
      finite(state, r.id);
      if (i === 0 || i === ticks || i === Math.round(ticks / 2) || i === Math.round(ticks / 3) || ticks < 9) {
        const shape = exp.elements(x, 2);
        finite(shape, r.id);
        assert.ok(shape.some((e) => ['box', 'rod', 'ball', 'line'].includes(e.kind)));
        const solid = shape.filter((e) => e.kind !== 'label');
        geometries.add(JSON.stringify(solid));
        assert.ok(
          shape.every(
            (e) => (e.r === undefined || e.r >= 0) && (e.size === undefined || e.size.every((v) => v >= 0)),
          ),
        );
        assert.deepEqual(model.solve({ x }), state);
        assert.equal(model.steps({ x }, state).length, 4);
        for (const chart of model.graphs({ x }, state))
          for (const series of chart.series) {
            for (const [xx, yy] of series.points) {
              assert.ok(Number.isFinite(xx));
              assert.ok(Number.isFinite(yy) || (Number.isNaN(yy) && r.id === 'SIM-C1-L006-01'));
            }
          }
      }
    }
    assert.ok(geometries.size >= 2, r.id + ' · la geometria non risponde al comando');
    const [[, a0], [, a1]] = r.references;
    assert.equal(record.prediction.correct, (Math.abs(a1 - a0) < 1e-8 ? 0 : Math.sign(a1 - a0)) + 1);
    assert.equal(record.assessment.length, 2);
    assert.notEqual(record.assessment[0].prompt, record.assessment[1].prompt);
    assert.doesNotMatch(record.assessment[1].prompt, /\{x\}/);
  });
test('Invarianti fra strumenti indipendenti e vincoli di validità', async () => {
  const models = new Map(await Promise.all(records.map(async (r) => [r.id, await esperienza(r)])));
  const get = (id, x) => models.get('SIM-' + id).model.solve({ x }).y;
  for (const r of [1, 2, 3, 4]) {
    close(get('C1-L006-03', r) * r * r, 1, 'gravitazione');
    close(get('C5-L04-03', r) * r * r, 1, 'intensità su superfici sferiche');
    close(get('C2-L007-05', r / 4), 12 * (1 - (r * r) / 16), 'aderenza e profilo');
    close(get('C3-L07-02', r) * r, 100, 'isoterma');
    close(get('C4-L05-04', r) * 2 * r, 4, 'tensione ai morsetti');
    close((get('C1-L010-03', 10 * r) * 100) / (10 * r), 10, 'braccio perpendicolare');
  }
  close(get('C3-L08-02', 70) + 70, 100, 'bilancio ciclico');
  close(get('C3-L09-04', 500), 0, 'limite di Carnot');
  close(get('C4-L10-01', 90), 0, 'flusso con campo tangente');
  close(get('C5-L10-02', 10), 0, 'immagine all’infinito');
  close(get('C6-L05-01', 4), 4 - 2, 'somma delle aree con segno');
  const tube = models.get('SIM-C2-L007-01');
  assert.equal(tube.elements(0.4, 2).filter((e) => e.kind === 'arrow').length, 0);
  assert.ok(tube.elements(0.1, 2).filter((e) => e.kind === 'arrow').length > 0);

  const lens = models.get('SIM-C5-L10-02');
  const raySlopes = lens
    .elements(10, 2)
    .filter((e) => e.kind === 'line' && !e.dash && e.points.length === 3)
    .map(({ points: [, a, b] }) => (b[1] - a[1]) / (b[0] - a[0]));
  assert.equal(raySlopes.length, 2);
  close(raySlopes[0], raySlopes[1], 'al fuoco i raggi emergono paralleli');

  const beam = models.get('SIM-C5-L07-02');
  const downstream = (layers) => beam.elements(layers, 2).filter((e) => e.kind === 'rod' && e.b[0] > 2);
  const thin = downstream(1),
    thick = downstream(3);
  assert.ok(thin.length > 0);
  assert.deepEqual(
    thin.map((r) => [r.b.slice(1), r.r]),
    thick.map((r) => [r.b.slice(1), r.r]),
  );
  for (const segment of thick) close(segment.alpha, 1 / 8, 'intensità dopo tre strati emivalenti');

  const carnot = models.get('SIM-C3-L09-04').model;
  const cycle = carnot.graphs({ x: 300 }, carnot.solve({ x: 300 }))[1].series;
  assert.equal(cycle.length, 4);
  for (const [i, line] of cycle.entries()) {
    const end = line.points.at(-1),
      next = cycle[(i + 1) % cycle.length].points[0];
    close(end[0], next[0], 'ciclo chiuso in volume');
    close(end[1], next[1], 'ciclo chiuso in pressione');
    for (const [v, p] of line.points) {
      const [v0, p0] = line.points[0],
        exponent = i % 2 ? 5 / 3 : 1;
      close(p * v ** exponent, p0 * v0 ** exponent, 'legge del tratto isoterma o adiabatica');
    }
  }
});
