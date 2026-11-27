import assert from 'node:assert/strict';
import test from 'node:test';
import * as capillary from '../static/js/banchi/modelli/tubo.js';
globalThis.document ??= { querySelector: () => null };
const { drawing } = await import('../static/js/banchi/tavola.js');

const defaults = { mode: 'pressure', r: 1.5, probe: 0.5, mu: 4, length: 20, dp: 80, flow: 1 };
const render = (input, stage) => drawing('tubo', input, capillary.solve(input), 0, stage, 'Capillare', 'top', capillary);

test('the capillary image describes only the parts visible in each stage', () => {
  const setup = render(defaults, -1);
  assert.match(setup, /<desc>Le due pareti/);
  assert.match(setup, /<g role="group" aria-label="Pareti del capillare">/);
  assert.doesNotMatch(setup, /Tracciante della sonda/);
  const measurement = render(defaults, 2);
  assert.match(measurement, /<desc>[^<]+tracciante[^<]+<\/desc>/i);
  assert.match(measurement, /<g role="group" aria-label="Tracciante della sonda">/);
  const invalid = { ...defaults, r: 4, mu: 1, length: 5, dp: 500 };
  assert.equal(capillary.solve(invalid).laminar, false);
  assert.doesNotMatch(render(invalid, 2), /tracciante/i);
});
