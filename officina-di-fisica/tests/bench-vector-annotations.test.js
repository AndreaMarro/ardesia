import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from '../static/vendor/three-r180/three.module.min.js';
import { build as plane } from '../static/js/banchi/scene/piano.js';
import { build as field } from '../static/js/banchi/scene/campo.js';
import { build as flight } from '../static/js/banchi/scene/volo.js';
import * as forces from '../static/js/banchi/modelli/piano.js';
import * as electrostatics from '../static/js/banchi/modelli/campo.js';
import * as projectile from '../static/js/banchi/modelli/volo.js';
import { brass, red, teal } from '../static/js/banchi/scena.js';

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

test('the flight retains the origin marker and the apex guide without a covering label', () => {
  const input = { speed: 5, elevation: 90, azimuth: 0 };
  for (const view of ['side', 'top']) {
    const { board } = drawing();
    const rings = [], labels = [], guides = [];
    board.ring = (anchor, radius) => rings.push({ anchor, radius });
    board.label = (_anchor, title) => labels.push(title);
    board.line = (points, _color, _group, dashed) => { if (dashed) guides.push(points); };
    flight(board, input, projectile.solve(input), 1, view);
    assert.equal(rings.length, 1);
    assert.deepEqual(rings[0], { anchor: [-0, 0.17, -0], radius: 0.22 });
    assert.ok(!labels.includes('O'));
    assert.ok(!labels.includes('culmine'));
    assert.ok(guides.some(([apex, ground]) => apex[1] > 1 && ground[1] === 0.15));
  }
});

test('small flight velocities retain their direction and get a separate 16× detail', () => {
  const input = { speed: 5, elevation: 90, azimuth: 0 };
  const solved = projectile.solve(input);
  const { board, arrows } = drawing();
  board.T = T;
  board.group = (parent) => {
    const group = new T.Group();
    parent?.add(group);
    return group;
  };
  board.ball = () => new T.Object3D();
  const update = flight(board, input, solved, 1, 'side');
  const primary = arrows.find(arrow => arrow.color === teal && arrow.group).group;
  const detail = arrows.find(arrow => arrow.color === brass && arrow.group).group;
  update(0.5);
  const speedRatio = projectile.sample(solved, 0.5).vy / input.speed;
  assert.ok(speedRatio > 0 && speedRatio <= 0.05);
  assert.equal(primary.scale.y, speedRatio);
  assert.equal(detail.scale.y, speedRatio * 16);
  assert.ok(detail.visible);
  const worldY = detail.parent.position.y + detail.position.y;
  assert.ok(worldY + detail.scale.y <= 2.8 + 1e-12);
  assert.ok(worldY - detail.scale.y >= 0.35 - 1e-12);
  assert.deepEqual(primary.quaternion.toArray(), detail.quaternion.toArray());
  assert.deepEqual(primary.position.toArray(), [0.21, 0.22, 0.28]);
  update(solved.duration / 2);
  assert.equal(primary.visible, false);
  assert.equal(detail.visible, false);
});

test('the constant gravity arrow clears the launch and landing platform', () => {
  for (const input of [
    { speed: 4, elevation: 50, azimuth: 15 },
    { speed: 5, elevation: 90, azimuth: 0 },
    { speed: 3, elevation: 25, azimuth: -60 },
  ]) {
    const solved = projectile.solve(input);
    const { board, arrows } = drawing();
    board.T = T;
    board.group = (parent) => {
      const group = new T.Group();
      parent?.add(group);
      return group;
    };
    board.ball = () => new T.Object3D();
    const update = flight(board, input, solved, 2, 'side');
    const arrow = arrows.find(item => item.color === red);
    assert.deepEqual(arrow.a, [0, 0, 0]);
    assert.deepEqual(arrow.b, [0, -0.64, 0]);
    for (const t of [0, solved.duration / 2, solved.duration]) {
      update(t);
      const tip = arrow.group.localToWorld(new T.Vector3(...arrow.b));
      const tail = arrow.group.localToWorld(new T.Vector3(...arrow.a));
      assert.ok(Math.abs(tip.y - tail.y + 0.64) < 1e-12);
      assert.ok(tip.y >= 0.14 - 1e-12);
      assert.equal(tip.x, tail.x);
      assert.equal(tip.z, tail.z);
    }
  }
});
