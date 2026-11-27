import assert from 'node:assert/strict';
import test from 'node:test';
import { build as plane } from '../static/js/banchi/scene/piano.js';
import { build as field } from '../static/js/banchi/scene/campo.js';
import * as forces from '../static/js/banchi/modelli/piano.js';
import * as electrostatics from '../static/js/banchi/modelli/campo.js';
import { red, teal } from '../static/js/banchi/scena.js';

function drawing() {
  const arrows = [];
  const newGroup = (parent) => ({ parent, position: { set() {} }, rotation: {} });
  const board = {
    group: newGroup,
    annotate(draw, parent) { draw({ annotation: true, parent }); },
    base() {}, box() {}, rod() {}, line() {}, label() {}, ring() {}, ball() {},
    arrow(a, b, color, group) { arrows.push({ a, b, color, group }); },
  };
  return { arrows, board };
}

test('the weight and normal keep their length and origin in the moving block frame', () => {
  const input = { m: 2, angle: 0, F: 1, ms: 1, mk: 1 };
  const { arrows, board } = drawing();
  const move = plane(board, input, forces.solve(input), 0);
  move(0);
  const [weight, normal] = arrows;
  assert.equal(weight.color, red);
  assert.equal(normal.color, teal);
  assert.equal(weight.group, normal.group);
  assert.ok(weight.group.annotation);
  assert.equal(weight.group.parent.position.x, 2.4);
  assert.deepEqual(weight.a, [0, 0.62, 0.48]);
  assert.deepEqual(normal.a, weight.a);
  assert.ok(Math.abs(weight.b[1] - (0.62 - 1.05)) < 1e-12);
  assert.ok(Math.abs(normal.b[1] - (0.62 + 1.05)) < 1e-12);
});

test('field contributions and resultant share the probe, scale and annotation layer', () => {
  const { arrows, board } = drawing();
  const input = { ax: -1, ay: 0, az: 0, bx: 1, by: 0, bz: 0, sx: 0, sy: 0, sz: 0, q1: 2, q2: -1 };
  field(board, input, electrostatics.solve(input), 1);
  assert.equal(arrows.length, 3);
  for (const glyph of arrows) {
    assert.ok(glyph.group.annotation);
    assert.deepEqual(glyph.a, [0, 0, 0]);
  }
  assert.deepEqual(arrows.map(({ b }) => b), [18, 9, 27].map(component => [component * (1.25 / 27), 0, 0]));
});
