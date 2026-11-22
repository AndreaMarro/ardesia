export const colore = {
  inchiostro: 0x352d42,
  metallo: 0x726d81,
  carta: 0xffedc5,
  viola: 0x7350b0,
  ocra: 0xd49332,
  verde: 0x147979,
  rosso: 0xb94f48,
  acqua: 0x68bdcf,
  bianco: 0xfffaf1,
};
export const rad = (a) => (a * Math.PI) / 180;
export const punti = (count, fn) => Array.from({ length: count }, (_, i) => fn(i));
export const limita = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export function tavolo(stage) {
  const elementi = [];
  const add = (kind, values) => elementi.push({ kind, ...values });
  return {
    elementi,
    box: (p, size, c, alpha = 1) => add('box', { p, size, c, alpha }),
    ball: (p, r, c, alpha = 1) => add('ball', { p, r, c, alpha }),
    rod: (a, b, r, c, alpha = 1, r2 = r) => add('rod', { a, b, r, c, alpha, r2 }),
    line: (points, c, dash = false) => add('line', { points, c, dash }),
    arrow: (a, b, c) => {
      if (stage >= 0 && Math.hypot(...b.map((v, i) => v - a[i])) > 0.015) add('arrow', { a, b, c });
    },
    label: (p, text, c = colore.inchiostro) => {
      if (stage >= 0) add('label', { p, text, c });
    },
    ring(p, r, plane, c) {
      this.line(
        punti(57, (i) => {
          const a = (i * Math.PI) / 28,
            u = r * Math.cos(a),
            v = r * Math.sin(a);
          const q = plane === 'xy' ? [u, v, 0] : plane === 'yz' ? [0, u, v] : [u, 0, v];
          return q.map((d, j) => d + p[j]);
        }),
        c,
      );
    },
  };
}
export function disegna3D(utensili, elementi) {
  const b = utensili;
  b.base(6.75, 3.45);
  for (const e of elementi) {
    switch (e.kind) {
      case 'box':
        b.box(e.p, e.size, e.c, undefined, e.alpha);
        break;
      case 'ball':
        b.ball(e.p, e.r, e.c, undefined, e.alpha);
        break;
      case 'rod':
        b.rod(e.a, e.b, e.r, e.c, undefined, e.alpha, e.r2);
        break;
      case 'line':
        b.line(e.points, e.c, undefined, e.dash);
        break;
      case 'arrow':
        b.arrow(e.a, e.b, e.c);
        break;
      case 'label':
        b.label(e.p, e.text, e.c);
        break;
    }
  }
}

// Keep the same GPU objects while the model supplies new positions, profiles and readings.
export function scenaMobile(b, sample) {
  b.base(6.75, 3.45);
  const pools = new Map();
  const direction = new b.T.Vector3(),
    up = new b.T.Vector3(0, 1, 0);
  function cylinder(mesh, a, end, radius) {
    direction.set(end[0] - a[0], end[1] - a[1], end[2] - a[2]);
    const length = direction.length();
    mesh.position.set((a[0] + end[0]) / 2, (a[1] + end[1]) / 2, (a[2] + end[2]) / 2);
    mesh.scale.set(radius, length, radius);
    if (length) mesh.quaternion.setFromUnitVectors(up, direction.divideScalar(length));
  }
  function unitRod(e, ratio, group) {
    return b.rod([0, -0.5, 0], [0, 0.5, 0], 1, e.c, group, e.alpha ?? 1, ratio);
  }
  function make(e, ratio) {
    switch (e.kind) {
      case 'rod':
        return unitRod(e, ratio);
      case 'box':
        return b.box(e.p, [1, 1, 1], e.c);
      case 'ball':
        return b.ball(e.p, 1, e.c);
      case 'line': {
        const line = b.line(e.points, e.c, undefined, e.dash);
        line.frustumCulled = false;
        return line;
      }
      case 'label':
        return b.label(e.p, e.text, e.c);
      case 'arrow': {
        const group = b.group();
        unitRod(e, 1, group);
        unitRod(e, 0, group);
        return group;
      }
    }
  }
  function place(node, e) {
    if (e.kind === 'line') {
      const coords = node.geometry.attributes.position;
      let changed = false;
      for (let i = 0; i < e.points.length; i++) {
        const [x, y, z] = e.points[i];
        if (
          coords.getX(i) === Math.fround(x) &&
          coords.getY(i) === Math.fround(y) &&
          coords.getZ(i) === Math.fround(z)
        )
          continue;
        coords.setXYZ(i, x, y, z);
        changed = true;
      }
      if (changed) {
        coords.needsUpdate = true;
        if (e.dash) {
          const distances = node.geometry.attributes.lineDistance;
          let length = 0;
          for (let i = 1; i < e.points.length; i++) {
            const [x, y, z] = e.points[i];
            const [u, v, w] = e.points[i - 1];
            length += Math.hypot(x - u, y - v, z - w);
            distances.setX(i, length);
          }
          distances.needsUpdate = true;
        }
      }
      node.material.color.setHex(e.c);
      return;
    }
    if (e.kind === 'label') {
      node.position.fromArray(e.p);
      return;
    }
    const mat = b.material(e.c, e.alpha ?? 1);
    if (e.kind === 'arrow') {
      const d = e.b.map((v, i) => v - e.a[i]);
      const len = Math.hypot(...d);
      const fraction = Math.min(0.24 / len, 0.32);
      const joint = e.b.map((v, i) => v - d[i] * fraction);
      const [shaft, head] = node.children;
      cylinder(shaft, e.a, joint, 0.028);
      cylinder(head, joint, e.b, 0.0812);
      shaft.material = head.material = mat;
      return;
    }
    node.material = mat;
    if (e.kind === 'rod') {
      if (e.r2 > e.r) cylinder(node, e.b, e.a, e.r2);
      else cylinder(node, e.a, e.b, e.r);
    } else {
      node.position.fromArray(e.p);
      if (e.kind === 'box') node.scale.fromArray(e.size);
      else node.scale.setScalar(e.r);
    }
  }
  let previous;
  return (time) => {
    if (time === previous) return;
    previous = time;
    for (const pool of pools.values()) pool.used = 0;
    for (const e of sample(time)) {
      const ratio = e.kind === 'rod' ? Math.min(e.r, e.r2) / (Math.max(e.r, e.r2) || 1) : 1;
      const key =
        e.kind === 'label'
          ? 'label/' + e.text + '/' + e.c
          : e.kind === 'line'
            ? 'line/' + e.points.length + '/' + e.dash
            : e.kind + '/' + ratio;
      if (!pools.has(key)) pools.set(key, { nodes: [], used: 0 });
      const pool = pools.get(key);
      const node = pool.nodes[pool.used] ?? (pool.nodes[pool.used] = make(e, ratio));
      pool.used++;
      node.visible = true;
      place(node, e);
    }
    for (const pool of pools.values())
      for (let i = pool.used; i < pool.nodes.length; i++) pool.nodes[i].visible = false;
  };
}
