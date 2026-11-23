import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { experiments } from '../../../static/js/banchi/voci/modelli/C6.js';
const source = JSON.parse(readFileSync(new URL('../../../content/esperienze-C6.json',import.meta.url)));
const echo = source.find(r => r.id === 'SIM-C6-L01-01');
assert.equal(echo.control.unit,'ms');
assert.equal(echo.measure.unit,'m');
const sample = experiments[echo.id].measure;
let count = 0;
for (let ms = echo.control.min; ms <= echo.control.max; ms += echo.control.step) {
  const distance = sample(ms);
  // Independent inverse problem: send the pulse from the source to the wall and back.
  const returningMs = (distance / 340 + distance / 340) * 1000;
  assert.ok(Math.abs(returningMs-ms) < 1e-10);
  count++;
}
assert.equal(sample(0),0);
assert.ok(Math.abs(sample(20)-3.4) < 1e-12);
console.log('PASS · '+count+' durate, da 0 a 20 ms. A 20 ms la parete è a 3,4 m, cammino 6,8 m.');
