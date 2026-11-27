import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from '../static/vendor/three-r180/three.module.min.js';
import { build } from '../static/js/banchi/scene/onde.js';
import { solve } from '../static/js/banchi/modelli/onde.js';
import { ink } from '../static/js/banchi/scena.js';

function capture(view, settings) {
  const lines = [];
  const board = {
    base() {}, rod() {}, label() {},
    ball: () => ({ position: {} }),
    ring: () => ({ position: {} }),
    surface(positions, indices, color, opacity, colors) {
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      return { geometry };
    },
    line(points, color) {
      const geometry = new T.BufferGeometry().setFromPoints(points.map(point => new T.Vector3(...point)));
      const line = { geometry, color };
      lines.push(line);
      return line;
    },
  };
  const update = build(board, settings, solve(settings), 0, view);
  return { lines, update };
}

test('the native wave section follows the centre plane even when the projected sheet degenerates', () => {
  for (const [z, phase] of [[0, 0], [0, 180], [0.5, 45]]) {
    const settings = { f: 1, d: 1.2, x: 0, z, phase };
    const { lines, update } = capture('section', settings);
    assert.equal(lines.length, 1);
    const [trace] = lines;
    assert.equal(trace.color, ink);
    assert.equal(trace.frustumCulled, false);
    const position = trace.geometry.attributes.position;
    assert.equal(position.count, 65);
    for (const t of [0, 0.25, 0.5, 1]) {
      update(t);
      for (let i = 0; i < position.count; i++) {
        const x = -1.24 + (2.48 * i) / 64;
        const a = (2 * Math.PI / 0.6) * Math.hypot(x + 0.6, z) - 2 * Math.PI * t;
        const b = (2 * Math.PI / 0.6) * Math.hypot(x - 0.6, z) - 2 * Math.PI * t + phase * Math.PI / 180;
        const y = 0.45 + 82 * 0.002 * (Math.cos(a) + Math.cos(b));
        assert.ok(Math.abs(position.getX(i) - 2.15 * x) < 1e-6);
        assert.ok(Math.abs(position.getY(i) - y) < 1e-6);
      }
    }
  }
});

test('the trace belongs only to the section view', () => {
  const settings = { f: 1, d: 1.2, x: 0, z: 0, phase: 0 };
  for (const view of ['orbit', 'side', 'top']) assert.equal(capture(view, settings).lines.length, 0);
});
