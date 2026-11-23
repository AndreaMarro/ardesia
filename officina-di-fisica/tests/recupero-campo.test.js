import test from 'node:test';
import assert from 'node:assert/strict';
import { traiettoria, verificaSpostamento } from '../static/js/recupero/cinematica.js';
import {
  nuovaBozza,
  controllaRisposta,
  modificaRisposta,
  consultaAiuto,
  chiaveBozza,
} from '../static/js/recupero/bozza.js';

const twoLegs = (seconds) => ({
  legs: [
    { velocity: 3, duration: 4 },
    { velocity: -2, duration: seconds },
  ],
});

test('Entrambe le durate. Inversione, zero e distanza coincidono con una somma indipendente a passi di mezzo secondo', () => {
  for (const seconds of [5, 7]) {
    const model = traiettoria(twoLegs(seconds));
    let position = 0,
      distance = 0;
    for (let tick = 0; tick <= (4 + seconds) * 2; tick++) {
      if (tick > 0) {
        const step = tick <= 8 ? 1.5 : -1;
        position += step;
        distance += Math.abs(step);
      }
      const sample = model.at(tick / 2);
      assert.equal(sample.x, position);
      assert.equal(sample.distance, distance);
      assert.ok(distance >= Math.abs(sample.displacement));
    }
    assert.equal(model.at(4).x, 12);
    assert.equal(model.at(9).x, 2);
    if (seconds === 7) {
      assert.equal(model.at(10).x, 0);
      assert.equal(model.at(11).x, -2);
      assert.equal(model.at(11).distance, 26);
    }
  }
});

test('Il modello accetta altri tratti, una sosta e un’origine traslata e rifiuta tempi o dati fuori dominio', () => {
  const model = traiettoria({
    origin: 8,
    legs: [
      { velocity: -3, duration: 2 },
      { velocity: 0, duration: 1 },
      { velocity: 2, duration: 0.5 },
    ],
  });
  assert.deepEqual(model.at(3.5), { time: 3.5, x: 3, displacement: -5, distance: 7, velocity: 2 });
  assert.equal(model.at(2).velocity, 0);
  const decimals = traiettoria({ legs: [{ velocity: 0.1, duration: 3 }] }).at(3);
  assert.equal(verificaSpostamento('0,3', decimals), 'corretto');
  assert.equal(verificaSpostamento('0,29', decimals), 'calcolo');
  for (const time of [-1, 4, NaN]) assert.throws(() => model.at(time), RangeError);
  for (const legs of [[], [{ velocity: Infinity, duration: 3 }], [{ velocity: 3, duration: 0 }]])
    assert.throws(() => traiettoria({ legs }), RangeError);
});

test('Il feedback e l’aiuto sono indipendenti. Anche ripristinare lo stesso testo richiede un nuovo invio', () => {
  const end = traiettoria(twoLegs(7)).at(11);
  for (const [input, code] of [
    ['+2', 'segno'],
    ['26', 'distanza'],
    ['−2,0', 'corretto'],
    ['-2', 'corretto'],
    ['4', 'calcolo'],
    ['', 'numero'],
    ['   ', 'numero'],
    ['2m', 'numero'],
  ])
    assert.equal(verificaSpostamento(input, end), code);
  let state = controllaRisposta(modificaRisposta(nuovaBozza(), '+2'), end);
  assert.equal(state.status, 'errore');
  assert.equal(state.last.assisted, false);
  state = consultaAiuto(consultaAiuto(state, 'pista'), 'pista');
  assert.deepEqual(state.helps, ['pista']);
  assert.equal(state.last.assisted, false);
  state = modificaRisposta(state, '−2');
  assert.equal(state.status, 'bozza');
  assert.equal(state.last.feedback, 'segno');
  assert.equal(modificaRisposta(state, '+2').status, 'bozza');
  state = controllaRisposta(state, end);
  assert.equal(state.status, 'correzione');
  assert.equal(state.last.assisted, true);
  const values = ['session-1', 'run-1', 'C1-Q027', 2, '7s-v1'];
  const base = chiaveBozza(...values);
  values.forEach((_, i) =>
    assert.notEqual(chiaveBozza(...values.map((v, j) => (j === i ? 'diverso' : v))), base),
  );
});
