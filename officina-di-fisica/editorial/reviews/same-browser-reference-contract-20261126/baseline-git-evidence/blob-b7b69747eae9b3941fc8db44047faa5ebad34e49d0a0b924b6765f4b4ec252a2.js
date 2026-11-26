import { sample } from '../modelli/induzione.js';
import { ink, metal, brass, teal, red, violet } from '../scena.js';
export const spec = {
  target: [0, 1.12, 0],
  height: 4.25,
  width: 6.65,
  eye: [3.4, 2.75, 5.4],
  bg: 0xedeaf0,
};
export function build(b, p, s, stage) {
  b.base(5, 3.7);
  const coil = 1.05;
  for (let i = 0; i < 10; i++) {
    const points = Array.from({ length: 77 }, (_, j) => {
      const a = 0.22 + (j / 76) * (2 * Math.PI - 0.44);
      return [coil * Math.cos(a), 0.65 + i * 0.055, -coil * Math.sin(a)];
    });
    b.line(points, i % 2 ? brass : ink);
    if (i < 9)
      b.rod(
        points.at(-1),
        [coil * Math.cos(0.22), 0.65 + (i + 1) * 0.055, -coil * Math.sin(0.22)],
        0.018,
        brass,
      );
  }
  const a = [1.65, 0.66, 0.55],
    z = [1.65, 0.66, -0.55];
  b.rod([1.025, 1.145, 0.23], a, 0.035, brass);
  b.rod([1.025, 0.65, -0.23], z, 0.035, brass);
  for (const pos of [a, z]) {
    b.rod([pos[0], 0.08, pos[2]], pos, 0.075, metal);
    b.ball(pos, 0.085, ink);
  }
  b.rod(a, s.closed ? z : [1.65, 1.22, -0.22], 0.045, teal);
  b.label([1.67, 0.31, 1], s.closed ? 'Chiuso · 5 Ω' : 'Aperto', ink);
  b.arrow([-1.55, 0.3, -0.55], [-1.55, 1.85, -0.55], ink);
  b.label([-1.55, 2.12, -0.55], '+n', ink);
  const field = b.group();
  field.position.y = 1;
  for (const [x, z] of [
    [0, 0],
    [-0.55, -0.45],
    [-0.55, 0.45],
    [0.55, -0.45],
    [0.55, 0.45],
  ])
    b.arrow([x, -0.95, z], [x, 0.95, z], violet, field, 0.03);
  if (stage >= 1) {
    b.ring([0, 1.26, 0], coil, 'xz', teal);
    if (s.closed && s.current !== 0) {
      const sign = Math.sign(s.current);
      for (const x of [-1, 1]) b.arrow([x, 1.37, sign * x * 0.26], [x, 1.37, -sign * x * 0.26], red);
      b.label([-0.75, 1.7, 0.9], 'I', red);
    }
  }
  return (t) => {
    const { B } = sample(s, t);
    field.visible = Math.abs(B) > 1e-6 && stage >= 0;
    field.scale.y = B / Math.max(0.5, Math.abs(sample(s, 0).B), Math.abs(sample(s, s.duration).B));
  };
}
