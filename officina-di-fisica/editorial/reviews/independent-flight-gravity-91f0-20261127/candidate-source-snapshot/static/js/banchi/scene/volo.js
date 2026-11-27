import { sample } from '../modelli/volo.js';
import { ink, metal, ivory, violet, brass, teal, red } from '../scena.js';
export const spec = { target: [0, 0.9, 0], width: 8.5, height: 4.9, eye: [4, 3, 7], bg: 0xf1eddb };
export function build(b, p, s, stage) {
  b.base(6.5, 4.3);
  const scale = Math.min(
    5.25 / Math.max(Math.abs(s.vx * s.duration), 0.01),
    3.42 / Math.max(Math.abs(s.vz * s.duration), 0.01),
    2.65 / Math.max(s.peak, 0.01),
    9,
  );
  const start = [(-s.vx * s.duration * scale) / 2, 0.17, (-s.vz * s.duration * scale) / 2];
  const pos = (t) => {
    const q = sample(s, t);
    return [start[0] + q.x * scale, start[1] + q.y * scale, start[2] + q.z * scale];
  };
  for (let i = -3; i <= 3; i++)
    b.line(
      [
        [i, 0.015, -2],
        [i, 0.015, 2],
      ],
      metal,
    );
  for (let i = -2; i <= 2; i++)
    b.line(
      [
        [-3, 0.015, i],
        [3, 0.015, i],
      ],
      metal,
    );
  b.ring(start, 0.22, 'xz', teal);
  b.rod([start[0], 0.02, start[2]], start, 0.14, teal);
  if (stage >= 0) {
    const end = pos(s.duration);
    b.line([start, end], teal, undefined, true);
    b.arrow([-2.7, 0.05, 1.55], [-1.7, 0.05, 1.55], ink);
    b.label([-1.55, 0.16, 1.55], 'x');
    b.arrow([-2.7, 0.05, 1.55], [-2.7, 0.05, 2.18], ink);
    b.label([-2.7, 0.16, 2.23], 'z');
  }
  if (stage >= 1) {
    b.line(
      Array.from({ length: 73 }, (_, i) => pos((i * s.duration) / 72)),
      violet,
    );
    const peak = pos(s.duration / 2);
    b.line([peak, [peak[0], 0.15, peak[2]]], metal, undefined, true);
  }
  const ball = b.ball(start, 0.139, brass),
    moving = b.group();
  const previous = [];
  let detail, gravity;
  // Unit vectors rotate and scale without allocating geometry during playback.
  if (stage >= 1) {
    gravity = b.group(moving);
    gravity.position.set(-0.34, 0, -0.46);
    b.arrow([0, 0, 0], [0, -0.64, 0], red, gravity);
    for (let i = 0; i < (stage >= 2 ? 4 : 1); i++) {
      const g = b.group(moving);
      if (i === 0) g.position.set(0.21, 0.22, 0.28);
      b.arrow([0, 0, 0], [0, 1, 0], [teal, violet, brass, ink][i], g, i ? 0.016 : 0.034);
      previous.push(g);
    }
    detail = b.group(moving);
    detail.position.set(-0.32, 0, 0.57);
    b.arrow([0, 0, 0], [0, 1, 0], brass, detail, 0.022);
  }
  return (t) => {
    const a = pos(t),
      q = sample(s, t);
    ball.position.set(...a);
    moving.position.set(...a);
    if (gravity) gravity.position.y = Math.max(0, 0.78 - a[1]);
    const vectors = [
      [s.vx, q.vy, s.vz],
      [s.vx, 0, 0],
      [0, q.vy, 0],
      [0, 0, s.vz],
    ];
    previous.forEach((g, i) => {
      const d = new b.T.Vector3(...vectors[i]),
        len = d.length();
      g.visible = len > 1e-6;
      if (!g.visible) return;
      g.quaternion.setFromUnitVectors(new b.T.Vector3(0, 1, 0), d.normalize());
      g.scale.y = len / p.speed;
    });
    if (detail) {
      const velocity = previous[0];
      detail.visible = velocity.visible && velocity.scale.y <= 0.05;
      if (detail.visible) {
        const length = 16 * velocity.scale.y;
        // Keep the entire enlarged arrow inside the instrument's vertical bounds.
        const worldY = Math.max(0.35 + length, Math.min(2.8 - length, a[1] - 0.42));
        detail.position.y = worldY - a[1];
        detail.quaternion.copy(velocity.quaternion);
        detail.scale.y = length;
      }
    }
  };
}
