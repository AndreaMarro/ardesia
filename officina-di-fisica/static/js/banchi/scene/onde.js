import { coefficients, displacement } from '../modelli/onde.js';
import { ink, metal, brass, violet, teal, ivory } from '../scena.js';
export const spec = { target: [0, 0.4, 0], width: 7.8, height: 4.75, eye: [2.8, 3.6, 5], bg: 0xe5efeb };
export function build(b, p, s, stage, view) {
  const scale = 2.15,
    level = 0.45,
    gain = 82,
    section = view === 'section',
    Nx = 64,
    Nz = section ? 1 : 42;
  b.base(5.65, 3.91);
  const positions = [],
    colors = [],
    indices = [],
    coefs = [];
  for (let j = 0; j <= Nz; j++)
    for (let i = 0; i <= Nx; i++) {
      const x = -1.24 + (2.48 * i) / Nx,
        z = section ? p.z + (j - 0.5) * 0.025 : -0.84 + (1.68 * j) / Nz;
      positions.push(x * scale, level, z * scale);
      colors.push(0.2, 0.55, 0.62);
      coefs.push(coefficients(s, x, z));
      if (i < Nx && j < Nz) {
        const a = j * (Nx + 1) + i;
        indices.push(a, a + Nx + 1, a + 1, a + 1, a + Nx + 1, a + Nx + 2);
      }
    }
  const sheet = b.surface(positions, indices, 0xffffff, 1, colors);
  sheet.frustumCulled = false;
  const verts = sheet.geometry.attributes.position,
    shades = sheet.geometry.attributes.color;
  for (const [i, x] of [-p.d / 2, p.d / 2].entries()) {
    b.rod([x * scale, 0.12, 0], [x * scale, level + 0.36, 0], 0.052, i ? violet : brass);
    b.ring([x * scale, level + 0.37, 0], 0.1, 'xz', ink);
    b.label([x * scale, level + 0.64, 0], i ? 'S₂' : 'S₁', i ? violet : ink);
  }
  if (stage < 0) return;
  const loc = [p.x * scale, level, p.z * scale],
    probe = b.ball(loc, 0.09, ivory),
    ring = b.ring(loc, 0.13, 'xz', teal);
  if (stage >= 1)
    for (const [i, x] of [-p.d / 2, p.d / 2].entries())
      b.line(
        [
          [x * scale, level + 0.38, 0],
          [loc[0], level + 0.38, loc[2]],
        ],
        i ? violet : ink,
        undefined,
        true,
      );
  b.label([loc[0], level + 0.67, loc[2]], 'P', ink);
  // In plan view, superimpose the physical crests of each incident wave.
  const fronts = [];
  if (view === 'top' && stage >= 1)
    for (let i = 0; i < 2; i++) {
      const segments = 76,
        source = ((i ? 1 : -1) * p.d) / 2;
      const positions = new Float32Array(segments * 6 * 9),
        geo = new b.T.BufferGeometry();
      geo.setAttribute('position', new b.T.BufferAttribute(positions, 3));
      const rails = new b.T.LineSegments(
        geo,
        new b.T.LineBasicMaterial({ color: i ? violet : brass, transparent: true, opacity: 0.85 }),
      );
      rails.frustumCulled = false;
      b.group().add(rails);
      const circle = Array.from({ length: segments + 1 }, (_, j) => [
        Math.cos((j * 2 * Math.PI) / segments),
        Math.sin((j * 2 * Math.PI) / segments),
      ]);
      fronts.push((t) => {
        let count = 0;
        const phase = (((p.f * t - (i ? p.phase / 360 : 0)) % 1) + 1) % 1;
        for (let ring = 0; ring < 9; ring++) {
          const radius = (ring + phase) * s.lambda;
          if (radius > 2.4) break;
          for (let j = 0; j < segments; j++) {
            const pair = [circle[j], circle[j + 1]].map(([a, b]) => [source + radius * a, radius * b]);
            if (pair.some(([x, z]) => Math.abs(x) > 1.24 || Math.abs(z) > 0.84)) continue;
            for (const [x, z] of pair) {
              positions[count++] = x * scale;
              positions[count++] = level + 0.37;
              positions[count++] = z * scale;
            }
          }
        }
        geo.setDrawRange(0, count / 3);
        geo.attributes.position.needsUpdate = true;
      });
    }
  // Precompute the spatial quadratures. Each frame samples the same closed-form solution.
  return (t) => {
    const c = Math.cos(s.omega * t),
      sn = Math.sin(s.omega * t);
    for (const update of fronts) update(t);
    for (let i = 0; i < coefs.length; i++) {
      const u = (coefs[i].c * c + coefs[i].s * sn) / 2;
      verts.setY(i, level + gain * 0.004 * u);
      const a = (u + 1) / 2;
      shades.setXYZ(i, 0.045 + 0.49 * a, 0.27 + 0.44 * a, 0.37 + 0.3 * a);
    }
    verts.needsUpdate = true;
    shades.needsUpdate = true;
    sheet.geometry.computeVertexNormals();
    probe.position.y = level + gain * displacement(s, s.probe, t);
    ring.position.y = probe.position.y - level;
  };
}
