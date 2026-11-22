import { tracerFraction } from '../modelli/tubo.js';
import { ink, metal, ivory, violet, brass, teal, red, glass } from '../scena.js';
export const spec = { target: [0, 0.98, 0], width: 8.6, height: 4.5, eye: [3, 2.1, 6], bg: 0xe9f0e3 };
export function build(b, p, s, stage) {
  b.base(6.8, 2.5);
  const y = 1.14,
    R = p.r * 0.28,
    len = 4.8,
    lo = -len / 2,
    hi = len / 2;
  b.rod([lo, y, 0], [hi, y, 0], R, glass, undefined, 0.19);
  for (const x of [lo, hi]) {
    b.ring([x, y, 0], R, 'yz', teal);
    b.ring([x, y, 0], R + 0.055, 'yz', ink);
    b.box([x, 0.43, 0], [0.24, 0.85, 0.25], metal);
    b.box([x, 0.065, 0], [0.65, 0.13, 1.45], teal);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.line(
      [
        [lo, y + R * Math.cos(a), R * Math.sin(a)],
        [hi, y + R * Math.cos(a), R * Math.sin(a)],
      ],
      metal,
    );
  }
  if (stage < 0) return;
  b.label([lo, y + R + 0.35, 0], 'ingresso', teal);
  b.label([hi, y + R + 0.35, 0], 'uscita', ink);
  if (!s.laminar || stage < 1) return;
  // The independently magnified axial and radial axes leave v(r)/vmax unchanged.
  const sectionX = hi * 0.24,
    profile = [];
  for (let i = -12; i <= 12; i++) {
    const h = i / 12;
    profile.push([sectionX + 0.65 * (1 - h * h), y + h * R, 0]);
  }
  b.ring([sectionX, y, 0], R, 'yz', violet);
  b.line(profile, violet);
  for (const h of [-0.8, -0.4, 0, 0.4, 0.8])
    b.arrow(
      [sectionX, y + h * R, 0],
      [sectionX + 0.65 * (1 - h * h), y + h * R, 0],
      violet,
      undefined,
      0.016,
    );
  const tracers = [];
  for (let i = 0; i < 27; i++) {
    const h = [0, 0.35, 0.62, 0.82, 0.94][i % 5],
      a = i * 2.4;
    const bead = b.ball([lo, y + R * h * Math.cos(a), R * h * Math.sin(a)], 0.051, i % 3 ? teal : brass);
    tracers.push({ bead, fraction: (i * 0.381966) % 1, h });
  }
  const h = p.probe ?? 0.5;
  const reading = b.ball([lo, y + R * h, 0], 0.09, red);
  b.line(
    [
      [lo, y + R * h, 0],
      [hi, y + R * h, 0],
    ],
    red,
    undefined,
    true,
  );
  return (t) => {
    reading.position.x = lo + len * tracerFraction(s, h, t);
    for (const a of tracers) a.bead.position.x = lo + len * tracerFraction(s, a.h, t, a.fraction);
  };
}
