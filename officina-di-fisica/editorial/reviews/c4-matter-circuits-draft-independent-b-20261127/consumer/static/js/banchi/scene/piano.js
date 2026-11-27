import { ink, metal, ivory, violet, brass, teal, red, lime } from '../scena.js';
export const spec = { target: [0, 1.24, 0], width: 7.6, height: 5.15, eye: [4, 2.8, 7], bg: 0xf0eddf };
export function build(b, p, s, stage) {
  b.base(6.1, 2.65);
  const ramp = b.group();
  ramp.position.set(-2.35, 0.3, 0);
  ramp.rotation.z = s.theta;
  b.box([2.4, 0, 0], [4.8, 0.18, 1.3], brass, ramp);
  b.box([2.4, 0.105, 0], [4.8, 0.03, 1.13], ivory, ramp);
  for (let i = 0; i <= 24; i++)
    b.line(
      [
        [i * 0.2, 0.125, 0.57],
        [i * 0.2, 0.125, i % 5 ? 0.47 : 0.36],
      ],
      ink,
      ramp,
    );
  for (const z of [-0.52, 0.52]) {
    b.rod([-2.35, 0.12, z], [-2.35, 0.35, z], 0.14, metal);
    const x = -2.35 + 4.5 * Math.cos(s.theta);
    b.rod([x, 0.02, z], [x, 0.24 + 4.5 * Math.sin(s.theta), z], 0.075, metal);
  }
  const block = b.group(ramp);
  b.box([0, 0.35, 0], [0.73, 0.43, 0.68], violet, block);
  b.box([0, 0.59, 0], [0.54, 0.04, 0.52], ivory, block);
  b.rod([-0.24, 0.39, 0.36], [0.24, 0.39, 0.36], 0.035, brass, block);
  if (stage >= 0) {
    // Local axes rotate with the plane. A global downward vector has both components negative.
    const P = [0, 0.62, 0.48],
      scale = 1.05 / Math.max(s.weight, Math.abs(p.F), 1);
    const vec = (origin, dx, dy, color) =>
      b.arrow(origin, [origin[0] + dx * scale, origin[1] + dy * scale, origin[2]], color, block, 0.033);
    vec(P, s.parallel, -s.normal, red);
    vec(P, 0, s.normal, teal);
    if (stage >= 1) {
      vec([0, 0.78, 0.4], s.parallel, 0, violet);
      vec([0, 0.78, 0.4], 0, -s.normal, brass);
    }
    if (stage >= 2) {
      vec([0, 0.37, 0.44], s.friction, 0, ink);
      vec([0, 0.84, -0.19], p.F, 0, teal);
      if (!s.rest) b.arrow([0, 1.18, 0], [Math.sign(s.a) * 0.9, 1.18, 0], lime, block);
    }
    b.label([-1.95, 0.45, 0.99], '0', ink);
    b.label([-0.1, 0.12, 1.02], 'monte →', ink);
  }
  return (t) => {
    const time = Math.min(t, s.duration);
    block.position.x = 2.4 + 0.5 * s.a * time * time * 2;
  };
}
