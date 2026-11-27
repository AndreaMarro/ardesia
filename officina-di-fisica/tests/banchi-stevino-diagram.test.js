import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.document ??= {querySelector: () => null};
const { drawing } = await import('../static/js/banchi/tavola.js');

test('Stevino · the surface and the two probes keep separate labels at every depth', () => {
  for (let step = 0; step <= 40; step += 1) {
    const h = step / 20;
    const diagram = drawing('stevino', {h}, null, 0, 2, 'Stevino');
    const yA = Number(diagram.match(/<text x="132" y="([\d.]+)">A<\/text>/)[1]);
    const surface = Number(diagram.match(/<text x="84" y="([\d.]+)">superficie<\/text>/)[1]);
    const probeA = Number(diagram.match(/<circle cx="151" cy="([\d.]+)"/)[1]);
    const probeB = Number(diagram.match(/<circle cx="279" cy="([\d.]+)"/)[1]);
    assert.ok(yA - surface >= 14, `Surface and probe A text have overlapping baselines at ${h} m`);
    assert.ok(Math.abs(yA - probeA) <= 18 && yA < 179, `Probe A label has moved away at ${h} m`);
    assert.equal(probeA, probeB);
    assert.equal(probeA, 45 + 105 * h / 2);
    assert.match(diagram, /<text x="286" y="[\d.]+">B<\/text>/);
  }
});
