import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { esperienza } from '../static/js/banchi/voci/esperimento.js';

const records = JSON.parse(readFileSync(new URL('../content/esperienze-C3.json', import.meta.url)));

test('the sample temperature follows delivered heat through all three heating stages', async () => {
  const bench = await esperienza(records.find(record => record.id === 'SIM-C3-L04-03'));
  for (const [target, time, expected] of [
    [1, 0, -10], [1, 1 / 8, -35 / 4], [1, 1 / 4, -15 / 2], [1, 3 / 8, -25 / 4], [1, 1 / 2, -5],
    [54, 1, 0], [54, 9, 0], [54, 18, 0], [54, 21, 100 / 7], [54, 27, 300 / 7],
  ]) {
    const selected = { x: target };
    const solved = bench.model.solve(selected);
    const temperature = bench.model.readings(selected, solved, time).find(([name]) => name === 'Temperatura del campione');
    assert.ok(temperature, 'The temperature remains available as text');
    assert.equal(temperature[2], '°C');
    assert.ok(Math.abs(temperature[1] - expected) < 1e-10, `target ${target} kJ, elapsed ${time} s`);
    assert.ok(bench.model.readings(selected, solved, time).some(([name, value]) => name.endsWith('(a fine prova)') && value === solved.y));
  }
});
