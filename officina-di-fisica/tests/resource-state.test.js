import test from 'node:test';
import assert from 'node:assert/strict';
import { caseFromState, caseRoute, decodeCase, encodeCase } from '../multidiscipline/static/js/risorse-stato.js';

const spec = {
  schema: 'cric.resource-case/1',
  resource: { id: 'LAB3D-04', version: 1, sha256: 'a'.repeat(64), title: 'Banco di Poiseuille', course: 'C2', skill: 'C2-L04' },
  model: { id: 'tubo', sha256: 'b'.repeat(64) },
};
const current = {
  parameters: { mode: 'pressure', r: 2.2, probe: .5, mu: 4, length: 20, dp: 80, flow: 1 },
  time: .03, view: 'diagram',
};

test('a copied case reopens the same model conditions without personal notebook fields', () => {
  const value = caseFromState(spec, current);
  const token = encodeCase({ ...value, note: 'Private teacher note', user: { email: 'private@example.test' }, id: 'private-case-id' });
  assert.match(caseRoute(value), /^strumento\/LAB3D-04\/[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeCase(token), value);
  const wire = JSON.stringify(decodeCase(token));
  assert.ok(!wire.includes('Private teacher note'));
  assert.ok(!wire.includes('private@example.test'));
  assert.ok(!wire.includes('private-case-id'));
  current.parameters.r = 3;
  assert.equal(value.parameters.r, 2.2, 'the saved snapshot does not follow later slider movements');
  current.parameters.r = 2.2;
});

test('unrecognized or oversized links fail before opening a model', () => {
  for (const token of ['', '%', 'a'.repeat(6001), 'bnVsbA', 'W10']) assert.throws(() => decodeCase(token));
  const wrong = { ...caseFromState(spec, current), schema: 'future-case/9000' };
  assert.throws(() => decodeCase(encodeCase(wrong)), /versione/);
});
