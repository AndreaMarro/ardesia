import { field } from '../modelli/campo.js';
import { norm, sub, sum, mul } from '../misure.js';
import { metal, violet, brass, teal, red, glass, lime } from '../scena.js';
export const spec = { target: [0, 0, 0], width: 7.15, height: 5.85, eye: [3, 1.9, 6], bg: 0xf0ecf1 };
function equipotential(b, s) {
  const target = s.reading?.V;
  if (!Number.isFinite(target) || s.sources.every((x) => !x.q)) return;
  if (norm(sub(s.sources[0].pos, s.sources[1].pos)) < 1e-9 && s.sources[0].q === -s.sources[1].q) return;
  const N = 12,
    limit = 2.1,
    grid = [],
    positions = [],
    indices = [];
  const key = (i, j, k) => (i * (N + 1) + j) * (N + 1) + k;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++)
      for (let k = 0; k <= N; k++) {
        const p = [i, j, k].map((x) => ((2 * x) / N - 1) * limit),
          value = field(s.sources, p)?.V;
        grid.push({ p, v: value - target });
      }
  const tetra = [
    [0, 1, 3, 7],
    [0, 3, 2, 7],
    [0, 2, 6, 7],
    [0, 6, 4, 7],
    [0, 4, 5, 7],
    [0, 5, 1, 7],
  ];
  function cut(a, b) {
    return sum(a.p, mul(sub(b.p, a.p), a.v / (a.v - b.v)));
  }
  function triangle(a, b, c) {
    const start = positions.length / 3;
    positions.push(...a, ...b, ...c);
    indices.push(start, start + 1, start + 2);
  }
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      for (let k = 0; k < N; k++) {
        const cube = Array.from(
          { length: 8 },
          (_, v) => grid[key(i + (v & 1), j + ((v >> 1) & 1), k + ((v >> 2) & 1))],
        );
        for (const ids of tetra) {
          const verts = ids.map((t) => cube[t]);
          if (verts.some((x) => !Number.isFinite(x.v))) continue;
          const pos = verts.filter((x) => x.v >= 0),
            neg = verts.filter((x) => x.v < 0);
          if (!pos.length || !neg.length) continue;
          if (pos.length === 2) {
            const [a, b] = pos,
              [c, d] = neg,
              A = cut(a, c),
              B = cut(a, d),
              C = cut(b, c),
              D = cut(b, d);
            triangle(A, B, C);
            triangle(B, D, C);
          } else {
            const [one, many] = pos.length === 1 ? [pos, neg] : [neg, pos];
            triangle(...many.map((x) => cut(one[0], x)));
          }
        }
      }
  if (indices.length) b.surface(positions, indices, glass, 0.23);
}
export function build(b, p, s, stage) {
  for (let i = -2; i <= 2; i++) {
    b.line(
      [
        [i, -2.14, -2],
        [i, -2.14, 2],
      ],
      metal,
    );
    b.line(
      [
        [-2, -2.14, i],
        [2, -2.14, i],
      ],
      metal,
    );
  }
  for (const source of s.sources) {
    if (!source.q) continue;
    const [x, y, z] = source.pos,
      c = source.q > 0 ? red : violet;
    b.ball(source.pos, 0.19, c);
    b.rod([x, -2.13, z], [x, y - 0.19, z], 0.023, metal);
  }
  b.ring(s.probe, 0.13, 'xz', brass);
  b.ball(s.probe, 0.075, brass);
  if (stage < 0) return;
  if (s.reading) {
    const scale = 1.25 / Math.max(1, s.reading.magnitude, ...s.reading.contributions.map(norm));
    b.annotate((layer) => {
      s.reading.contributions.forEach((a, i) =>
        b.arrow(s.probe, sum(s.probe, mul(a, scale)), i ? violet : brass, layer),
      );
      if (stage >= 1) b.arrow(s.probe, sum(s.probe, mul(s.reading.E, scale)), teal, layer, 0.044);
    });
  }
  if (stage >= 2) {
    equipotential(b, s);
    for (const source of s.sources) {
      if (!source.q) continue;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4,
          d = [Math.cos(a), Math.sin(a) * 0.88, Math.sin(a) * 0.47],
          points = [sum(source.pos, mul(d, 0.22))];
        for (let j = 0; j < 70; j++) {
          const at = points.at(-1),
            f = field(s.sources, at);
          if (!f || f.magnitude < 1e-7) break;
          const next = sum(at, mul(f.E, (0.085 * Math.sign(source.q)) / f.magnitude));
          if (
            next.some((v) => Math.abs(v) > 2.1) ||
            s.sources.some((a) => a.q && norm(sub(a.pos, next)) < 0.18)
          )
            break;
          points.push(next);
        }
        if (points.length > 2) {
          b.line(points, metal);
          if (i % 2 === 0 && points.length > 8) {
            const j = Math.floor(points.length * 0.52),
              at = points[j],
              f = field(s.sources, at);
            if (f?.magnitude) b.arrow(at, sum(at, mul(f.E, 0.24 / f.magnitude)), teal, undefined, 0.019);
          }
        }
      }
    }
  }
}
