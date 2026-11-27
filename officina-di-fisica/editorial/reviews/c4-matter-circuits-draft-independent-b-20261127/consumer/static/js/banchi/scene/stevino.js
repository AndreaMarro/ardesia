import { ink, metal, ivory, violet, brass, teal, glass } from '../scena.js';
export const spec = { target: [0, 1.65, 0], width: 7, height: 5.15, eye: [4, 2.7, 6], bg: 0xe7f0e8 };
export function build(b, p, s, stage) {
  b.base(4.65, 3.15);
  const floor = 0.32,
    H = 2.75,
    level = floor + H,
    probeY = level - (H * p.h) / 2;
  b.box([0, 0.2, 0], [3.65, 0.22, 2.24], teal);
  b.box([0, floor + H / 2, 0], [3.42, H, 2.05], glass, undefined, 0.22);
  b.box([0, level, 0], [3.42, 0.04, 2.05], teal, undefined, 0.25);
  for (const x of [-1.76, 1.76])
    for (const z of [-1.06, 1.06]) b.rod([x, 0.29, z], [x, 3.36, z], 0.035, metal);
  for (const y of [0.3, 3.36])
    b.line(
      [
        [-1.76, y, -1.06],
        [1.76, y, -1.06],
        [1.76, y, 1.06],
        [-1.76, y, 1.06],
        [-1.76, y, -1.06],
      ],
      metal,
    );
  b.box([-1.72, 1.7, 1.09], [0.2, 2.85, 0.035], ivory);
  for (let i = 0; i <= 20; i++)
    b.line(
      [
        [-1.82, level - (H * i) / 20, 1.12],
        [-1.82 + (i % 5 ? 0.07 : 0.17), level - (H * i) / 20, 1.12],
      ],
      ink,
    );
  b.rod([0.22, 3.55, 0.3], [0.22, probeY, 0.3], 0.028, metal);
  b.ball([0.22, probeY, 0.3], 0.12, brass);
  if (stage >= 0) {
    b.label([-0.95, level + 0.25, 0.84], 'h = 0', teal);
    b.label([0.26, probeY + 0.25, 0.6], 'A', ink);
  }
  if (stage >= 1) {
    b.line(
      [
        [0.22, probeY, 0.3],
        [1.65, probeY, -0.6],
      ],
      violet,
      undefined,
      true,
    );
    b.ball([1.65, probeY, -0.6], 0.1, violet);
    b.label([1.82, probeY + 0.25, -0.5], 'B', violet);
  }
  if (stage >= 2) {
    b.ball([-0.87, floor, 0.72], 0.1, teal);
    b.label([-0.87, floor + 0.22, 0.9], 'fondo', teal);
  }
}
