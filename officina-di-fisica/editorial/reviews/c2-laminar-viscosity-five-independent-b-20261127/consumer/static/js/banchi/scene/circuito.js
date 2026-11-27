import { ink, metal, ivory, violet, brass, teal, red } from '../scena.js';
export const spec = { target: [0, 0.35, 0], width: 7.4, height: 5.15, eye: [1.4, 5.6, 4.6], bg: 0xefeedf };
export function build(b, p, s, stage) {
  b.base(6.1, 3.85);
  const y = 0.32,
    left = -2.22,
    right = 2.22,
    front = 1.32,
    rear = -1.18;
  const point = (x, z) => [x, y, z],
    wire = (x, z, X, Z) => b.rod(point(x, z), point(X, Z), 0.052, teal);
  function resistor(x, z, len, name, color) {
    const lo = x - len / 2,
      hi = x + len / 2;
    b.rod(point(lo, z), point(hi, z), 0.18, color);
    for (const f of [0.16, 0.31, 0.76, 0.87]) {
      const at = lo + len * f;
      b.rod(point(at, z), point(at + 0.048, z), 0.185, f > 0.8 ? brass : ink);
    }
    if (stage >= 0) b.label([x, 0.67, z - 0.08], name, color);
  }
  // Battery ends at separate binding posts. Only the source bridges the front gap.
  b.rod(point(-0.64, front), point(0.64, front), 0.25, ink);
  b.rod(point(-0.69, front), point(-0.47, front), 0.26, brass);
  b.rod(point(0.55, front), point(0.68, front), 0.23, metal);
  b.label([-0.62, 0.72, front], '+', red);
  b.label([0.62, 0.72, front], '−', ink);
  wire(left, front, -0.69, front);
  wire(0.68, front, right, front);
  wire(left, front, left, rear);
  wire(right, front, right, rear);
  if (p.mode === 'Serie') {
    wire(left, rear, -1.62, rear);
    resistor(-1.05, rear, 1.14, 'R₁', violet);
    wire(-0.48, rear, 0.48, rear);
    resistor(1.05, rear, 1.14, 'R₂', brass);
    wire(1.62, rear, right, rear);
  } else {
    for (const [z, name, c] of [
      [rear, 'R₁', violet],
      [0.05, 'R₂', brass],
    ]) {
      wire(left, z, -0.69, z);
      resistor(0, z, 1.38, name, c);
      wire(0.69, z, right, z);
      b.ball(point(left, z), 0.1, brass);
      b.ball(point(right, z), 0.1, brass);
    }
  }
  if (stage >= 1 && p.U) {
    b.arrow([left, 0.5, 1.05], [left, 0.5, 0.44], red);
    for (const z of p.mode === 'Serie' ? [rear] : [rear, 0.05]) b.arrow([1.45, 0.52, z], [2, 0.52, z], red);
  }
  if (stage >= 2) {
    b.label([left - 0.09, 0.71, 0.1], 'A', teal);
    b.label([right + 0.09, 0.71, 0.1], 'B', teal);
  }
}
