import { ink, metal, ivory, violet, brass, teal, red, glass } from '../scena.js';
export const spec = { target: [0.18, 0.94, 0], width: 8.6, height: 4.1, eye: [1.4, 2.3, 7], bg: 0xf1ece5 };
export function build(b, p, s, stage) {
  const k = 0.06,
    axis = 1.15,
    H = 0.46,
    X = (x) => x * k; // Separate vertical magnification improves the paraxial construction.
  b.base(7.7, 1.8);
  for (const z of [-0.3, 0.3]) b.rod([-3.35, 0.18, z], [3.95, 0.18, z], 0.06, metal);
  for (let x = -50; x <= 65; x += 2.5)
    b.line(
      [
        [X(x), 0.014, 0.57],
        [X(x), 0.014, x % 10 === 0 ? 0.85 : 0.7],
      ],
      ink,
    );
  b.line(
    [
      [-3.2, axis, 0],
      [4, axis, 0],
    ],
    metal,
    undefined,
    true,
  );
  function mount(x, c) {
    b.box([X(x), 0.27, 0], [0.27, 0.17, 0.87], c);
    b.rod([X(x), 0.33, 0], [X(x), axis - 0.12, 0], 0.049, metal);
  }
  mount(-p.p, brass);
  mount(0, violet);
  mount(p.screen, teal);
  b.arrow([X(-p.p), axis, 0], [X(-p.p), axis + H, 0], brass, undefined, 0.052);
  const lens = b.ball([0, axis, 0], 1, glass, undefined, 0.42);
  lens.scale.set(0.17, 0.72, 0.72);
  b.ring([0, axis, 0], 0.72, 'yz', violet);
  b.box([X(p.screen), axis, 0], [0.045, 1.66, 1.42], ivory, undefined, 0.55);
  for (const z of [-0.72, 0.72])
    b.rod([X(p.screen), axis - 0.84, z], [X(p.screen), axis + 0.84, z], 0.025, teal);
  if (stage < 0) return;
  for (const f of [-p.f, p.f]) {
    b.ball([X(f), axis, 0], 0.045, violet);
    b.label([X(f), axis - 0.28, 0.04], f < 0 ? 'F' : 'F′', violet);
  }
  function ray(x1, x2, h, m, color, dashed = false) {
    const lower = -1.03,
      upper = 1.49;
    if (m) {
      const a = (lower - h) / m,
        c = (upper - h) / m;
      x1 = Math.max(x1, Math.min(a, c));
      x2 = Math.min(x2, Math.max(a, c));
    }
    if (x2 > x1)
      b.line(
        [
          [X(x1), axis + h + m * x1, 0.025],
          [X(x2), axis + h + m * x2, 0.025],
        ],
        color,
        undefined,
        dashed,
      );
  }
  if (stage >= 1) {
    ray(-p.p, 0, H, 0, brass);
    ray(0, p.screen, H, -H / p.f, brass);
    ray(-p.p, p.screen, 0, -H / p.p, teal);
  }
  if (stage >= 2 && Number.isFinite(s.q)) {
    if (s.q < 0) {
      ray(Math.max(s.q, -52), 0, H, -H / p.f, brass, true);
      ray(Math.max(s.q, -52), 0, 0, -H / p.p, teal, true);
    }
    if (s.q >= -52 && s.q <= 65 && Math.abs(s.m * H) < 1.03 && (s.q < 0 || s.q <= p.screen + 0.05)) {
      b.arrow([X(s.q), axis, 0], [X(s.q), axis + s.m * H, 0], red, undefined, 0.026);
      b.label([X(s.q), axis + s.m * H + (s.q < 0 ? 0.23 : -0.23), 0], s.q < 0 ? 'virtuale' : 'immagine', red);
    }
    if (s.sharp) b.ball([X(p.screen), axis + s.m * H, 0], 0.065, red);
  }
}
