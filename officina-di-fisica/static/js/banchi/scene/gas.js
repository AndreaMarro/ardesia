import { ink, metal, ivory, violet, brass, teal, glass } from '../scena.js';
export const spec = { target: [0, 1.9, 0], width: 6.2, height: 5.45, eye: [4, 2.1, 6], bg: 0xf5eedf };
export function build(b, p, s, stage) {
  const y = 0.37,
    h = p.V * 0.53,
    R = 0.94;
  b.base(3.7, 3);
  b.rod([0, 0.05, 0], [0, y, 0], 1.12, teal);
  b.rod([0, y, 0], [0, y + 3.3, 0], R, glass, undefined, 0.13);
  b.rod([0, y, 0], [0, y + h, 0], R - 0.02, brass, undefined, 0.21);
  b.rod([0, y + h, 0], [0, y + h + 0.16, 0], R, metal);
  b.ring([0, y + h + 0.12, 0], R, 'xz', ink);
  b.rod([0, y + h + 0.13, 0], [0, y + h + 0.78, 0], 0.13, brass);
  b.rod([0, y + h + 0.74, 0], [0, y + h + 0.86, 0], 0.42, violet);
  for (const a of [0, 2.1, 4.2]) {
    const x = 1.04 * Math.cos(a),
      z = 1.04 * Math.sin(a);
    b.rod([x, y, z], [x, 3.67, z], 0.035, metal);
  }
  b.ring([0, 3.67, 0], R, 'xz', metal);
  b.box([-1.22, 1.96, 0.4], [0.22, 3.26, 0.07], ivory);
  for (let i = 0; i <= 12; i++)
    b.line(
      [
        [-1.32, y + i * 0.265, 0.45],
        [-1.32 + (i % 2 ? 0.09 : 0.18), y + i * 0.265, 0.45],
      ],
      ink,
    );
  if (stage >= 0) b.label([-1.5, y + h, 0.49], p.V.toLocaleString('it-IT') + ' L', teal);
  if (stage >= 1) {
    b.label([0.91, y + 0.22, 0.85], 'gas', ink);
    b.arrow([0, y + h - 0.52, 0.6], [0, y + h - 0.03, 0.6], violet);
  }
  if (stage >= 2) b.ring([0, y + h, 0], R + 0.04, 'xz', teal);
}
