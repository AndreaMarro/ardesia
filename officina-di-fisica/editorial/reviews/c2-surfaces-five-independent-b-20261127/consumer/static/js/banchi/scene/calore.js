import { ink, metal, ivory, brass, teal, red } from '../scena.js';
export const spec = {
  target: [0, 0.83, 0],
  width: 7.8,
  height: 4.2,
  eye: [3, 2.4, 6],
  light: [-3, 6, 2],
  bg: 0xf1eadf,
};
export function build(b, p, s, stage) {
  b.base(6.6, 2.75);
  const len = p.L * 0.23,
    side = Math.sqrt(p.A) * 0.25,
    y = 1.03,
    lo = -len / 2,
    hi = len / 2;
  const tint = (v) => new b.T.Color(0x4378a0).lerp(new b.T.Color(0xe66c42), v / 100).getHex();
  for (const [x, temp] of [
    [lo - 0.17, p.left],
    [hi + 0.17, p.right],
  ]) {
    b.box([x, y, 0], [0.32, 1.83, 1.82], tint(temp));
    b.box([x, 0.1, 0], [0.62, 0.18, 2.07], metal);
    b.rod([x, y + 0.9, 0], [x, y + 1.23, 0], 0.095, brass);
    b.ring([x, y, 0], side * 0.53, 'yz', ink);
  }
  for (let i = 0; i < 28; i++)
    b.box(
      [lo + (len * (i + 0.5)) / 28, y, 0],
      [len / 28 + 0.001, side, side],
      stage < 1 ? ivory : tint(p.left + ((p.right - p.left) * (i + 0.5)) / 28),
    );
  if (stage >= 0) {
    b.label([lo - 0.22, y + 1.45, 0], 'T₁', ink);
    b.label([hi + 0.22, y + 1.45, 0], 'T₂', ink);
  }
  if (stage >= 2 && s.power) {
    const d = Math.sign(s.power) * Math.max(0.25, len * 0.35);
    b.arrow([-d, y + 0.12, side * 0.58], [d, y + 0.12, side * 0.58], teal);
    b.label([0, y + 0.52, side * 0.58], 'P', teal);
  }
}
