import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';
import { posizionaEtichetta } from '../static/js/banchi/etichette.js';
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
    assert.ok(exp.observe.length >= 45);
    for (const [x, expected] of r.references) {
      const sample = exp.measurement(x);
      close(sample.value, expected, r.id + ' · tavola');
      assert.ok(sample.calculation.includes(sample.reading));
      assert.ok(sample.input.length);
    }
    if (exp.clock) {
      const [x, y] = r.references[1],
        clock = exp.clock;
      const duration = clock.duration(x, y);
      let baseline;
      for (const t of [0, 0.13 * duration, 0.62 * duration, duration]) {
        const shape = exp.elements(x, 2, t).filter((e) => e.kind !== 'label');
        finite(shape, r.id);
        if (!baseline) baseline = shape;
        if (t === 0.62 * duration)
          assert.notDeepEqual(shape, baseline, r.id + ' · evoluzione della geometria');
        if (clock.signal) finite(clock.signal(x, t, y), r.id);
      }
    }
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

test('Le indicazioni sperimentali sono specifiche per ciascuna delle 181 voci', async () => {
  const labs = await Promise.all(records.map(esperienza));
  assert.equal(new Set(labs.map((e) => e.observe)).size, records.length);
});

test('Orologio, corpi e misure soddisfano gli stessi vincoli fisici nei sei corsi', async () => {
  const labs = new Map(await Promise.all(records.map(async (r) => [r.id.slice(4), await esperienza(r)])));
  const get = (id) => labs.get(id);
  const { clock: orbit, elements: circle } = get('C1-L004-04');
  const speed = 4,
    quarter = Math.PI / 4;
  const orb = circle(speed, 2, quarter);
  const point = orb.find((e) => e.kind === 'ball').p;
  const [velocity, inward] = orb.filter((e) => e.kind === 'arrow').map((e) => e.b.map((p, j) => p - e.a[j]));
  close(point[0], 0, 'quarto di giro');
  close(orbit.signal(speed, quarter), 0, 'quarto di giro sulla scala in metri');
  close(point[0] * velocity[0] + point[2] * velocity[2], 0, 'velocità tangente');
  assert.ok(point[0] * inward[0] + point[2] * inward[2] < 0, 'accelerazione verso il perno');

  const crash = get('C1-L009-02');
  for (const v of [-2, 3]) {
    const cars = (t) =>
      crash
        .elements(v, 2, t)
        .filter((e) => e.kind === 'box')
        .map((e) => e.p[0]);
    const [a, b] = cars(0.5),
      [aa, bb] = cars(0.9);
    close(Math.abs(a - b), 0.56, 'contatto fra le facce');
    close(aa - a, bb - b, 'carrelli agganciati');
    close((aa - a) / (0.8 * 0.4), v / 2, 'velocità comune con segno');
  }

  const pipe = get('C2-L007-05');
  const probe = (r, t) =>
    pipe
      .elements(r, 2, t)
      .filter((e) => e.kind === 'ball')
      .at(-1).p[0];
  close(probe(1, 1), probe(1, 0), 'aderenza alla parete');
  close(((probe(0.5, 0.25) - probe(0.5, 0)) * 20) / 4, 9 * 0.25, 'tracciante a metà raggio');
  close(pipe.clock.signal(0.5, 0.25), 9 * 0.25, 'cammino misurato in centimetri');

  const circuit = get('C3-L05-02');
  const tracers = (t) =>
    circuit
      .elements(2, 2, t)
      .filter((e) => e.kind === 'ball')
      .map((e) => e.p);
  assert.equal(tracers(0).length, 10);
  tracers(5).forEach((q, i) => q.forEach((v, j) => close(v, tracers(0)[i][j], 'giro dei dieci grammi')));
  close(circuit.clock.signal(2, 5), 10, 'massa transitata');
  const states = (t) =>
    get('C3-L04-03')
      .elements(54, 2, t)
      .filter((e) => e.kind === 'label')
      .map((e) => e.text);
  assert.ok(!states(0).includes('Liquido') && states(0).includes('Solido'));
  assert.ok(states(9.5).includes('Liquido') && states(9.5).includes('Solido'));
  assert.ok(states(24).includes('Liquido') && !states(24).includes('Solido'));
  const melt = get('C3-L04-03').clock;
  close(melt.signal(54, 1), 0, 'fine del riscaldamento del ghiaccio');
  close(melt.signal(54, 9.5), 50, 'metà del campione fuso');
  close(melt.signal(54, 20), 100, 'massa fusa sul tratto liquido');
  for (const t of [0, 8, 20, 40]) {
    const ratio = 1 + (3 * t) / 40;
    close(get('C3-L07-02').clock.signal(4, t) * ratio, 100, 'pV in isoterma');
    close(get('C3-L07-05').clock.signal(4, t) * ratio ** 1.5, 100, 'pV^γ in adiabatica');
    close(get('C3-L07-04').clock.signal(400, t) / (300 + (100 * t) / 40), 0.01, 'V/T in isobara');
  }

  const magnetic = get('C4-L09-03');
  const radius = (field) => Math.abs(magnetic.elements(field, 2, 0).find((e) => e.kind === 'ball').p[0]);
  close(radius(1), 2 * radius(2), 'raggio inversamente proporzionale al campo');
  close(magnetic.clock.duration(1), 2 * magnetic.clock.duration(2), 'periodo ciclotronico');
  const coil = get('C4-L10-03');
  close(coil.clock.signal(4, 3) - coil.clock.signal(4, 2), -coil.model.solve({ x: 4 }).y, 'segno di Lenz');

  const oscillator = get('C5-L01-02').clock;
  for (const T of [0.5, 2, 4]) {
    close(oscillator.signal(T, T / 4), 0, 'attraversa l’equilibrio');
    close(oscillator.signal(T, T / 2), -3, 'ampiezza negativa in centimetri');
    close(oscillator.signal(T, T), 3, 'ritorno dopo un periodo');
  }
  const sound = get('C5-L05-03').clock;
  for (const u of [-30, 0, 30]) {
    // A crest emitted at t=0 travels 3 m. Successive arrival times differ by (c-u)/(c·f).
    const next = 10 + (1000 * (300 - u)) / (300 * 300);
    close(sound.signal(u, 10), 1, 'arrivo della prima cresta');
    close(sound.signal(u, next), 1, 'arrivo della cresta successiva');
    close(sound.signal(u, (10 + next) / 2), -1, 'minimo a metà periodo');
  }
  const echo = get('C6-L01-01');
  const pulse = (t) =>
    echo
      .elements(10, 2, t)
      .filter((e) => e.kind === 'ball')
      .at(-1).p[0];
  const wall = (t) => {
    const slab = echo.elements(10, 2, t).find((e) => e.kind === 'box');
    return slab.p[0] - slab.size[0]/2;
  };
  assert.ok(echo.elements(10, 2, 5).some(e => e.kind === 'label' && e.text === 'Riflessione'));
  close(wall(5), wall(0), 'parete ferma');
  close(pulse(5), wall(5), 'riflessione a metà ritardo');
  close(pulse(0), pulse(10), 'ritorno al microfono');
  close(echo.clock.signal(10, 5), 1.7, 'parete a 1,7 m con eco dopo 10 ms');
  close(echo.clock.signal(10, 9) - echo.clock.signal(10, 8), -0.34, 'avvicinamento a 340 m/s');
});

test('Inquadratura stretta con etichette vicine e confine della tavola', () => {
  const boxes = [];
  for (const [x, y, w] of [
    [22, 9, 88],
    [50, 10, 90],
    [60, 20, 85],
    [388, 208, 80],
  ]) {
    const box = posizionaEtichetta(x, y, w, 20, 390, 212, boxes);
    assert.ok(box.x - box.w / 2 >= 0 && box.x + box.w / 2 <= 390);
    assert.ok(box.y - box.h / 2 >= 0 && box.y + box.h / 2 <= 212);
    for (const other of boxes.slice(0, -1))
      assert.ok(
        Math.abs(box.x - other.x) >= (box.w + other.w) / 2 ||
          Math.abs(box.y - other.y) >= (box.h + other.h) / 2,
      );
  }
});
