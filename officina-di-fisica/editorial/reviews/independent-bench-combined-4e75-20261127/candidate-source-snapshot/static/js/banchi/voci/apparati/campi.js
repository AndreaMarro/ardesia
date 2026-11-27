import { colore as c, rad, punti } from '../geometria.js';
const tinta = (q) => (q > 0 ? c.rosso : q < 0 ? c.viola : c.metallo);
function sfera(b, x, y, z, q, show = true) {
  b.ball([x, y, z], 0.19 + 0.025 * Math.min(8, Math.abs(q)), tinta(q));
  if (show) b.label([x, y + 0.4, z], q > 0 ? '+' + q : q < 0 ? '−' + Math.abs(q) : '0', tinta(q));
}
function piastre(b, x, d, y = 1.15, size = 1.68) {
  for (const k of [-1, 1]) b.box([x + k * d, y, 0], [0.11, size, 1.32], k < 0 ? c.rosso : c.verde);
}
function wire(b, points) {
  for (let i = 1; i < points.length; i++) b.rod(points[i - 1], points[i], 0.034, c.metallo);
}
export const campi = {
  cariche(b, s) {
    const y = 0.96;
    if (s.qc !== undefined) {
      const a = [-1, y, 0.58],
        v = [1, y, 0.58],
        d = [0, y, 0.58 - Math.sqrt(3)];
      b.line([a, v, d, a], c.metallo);
      sfera(b, ...a, s.qa);
      sfera(b, ...v, s.qb);
      sfera(b, ...d, s.qc);
      return;
    }
    if (s.sonda !== undefined) {
      const o = [-1.66, y, 0],
        px = o[0] + 0.3 + 2.7 * s.sonda;
      sfera(b, ...o, s.qa);
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * i) / 5;
        b.line([o, [o[0] + 1.4 * Math.cos(a), y, 1.4 * Math.sin(a)]], c.ocra);
      }
      b.ball([px, y, 0], 0.09, c.verde);
      // Preserve the true common field gain outside the opaque probe.
      b.arrow([px, y, 0.3], [px + s.campo, y, 0.3], c.viola);
      if (Math.abs(s.campo) > 0 && Math.abs(s.campo) < 0.1) {
        // A labelled second representation makes the small field legible;
        // the original arrow, inverse-square law and numeric reading remain.
        // Separate in z as well: height separation collapses in the top view.
        b.arrow([px, 1.95, 0.95], [px + 10 * s.campo, 1.95, 0.95], c.ocra);
      }
      return;
    }
    const d = s.distanza === undefined ? 1.35 : 0.23 + 1.64 * s.distanza;
    sfera(b, -d, y, 0, s.qa);
    sfera(b, d, y, 0, s.qb);
    b.line(
      [
        [-d, y, 0],
        [d, y, 0],
      ],
      c.metallo,
      true,
    );
    if (s.mezzo) {
      b.ball([0, y, 0], 0.09, c.ocra);
      b.arrow([0, y, 0], [0.78 * s.campo, y, 0], c.verde);
      b.label([0, 1.45, 0], 'P');
    }
    if (s.forza !== undefined) {
      const height = s.frecceSeparate ? 0.56 : 0.67;
      const depth = s.frecceSeparate ? 0.38 : 0;
      for (const k of [-1, 1]) b.arrow([k * d, height, depth], [k * (d + 0.62 * s.forza), height, depth], c.viola);
    }
    if (s.trasferimento)
      for (let i = 0; i < Math.abs(s.qa); i++)
        b.ball([d - 0.36 + 0.15 * (i % 4), 1.84 + 0.18 * Math.floor(i / 4), 0], 0.057, c.viola);
  },
  piastre(b, s) {
    const d = s.distanza === undefined ? 1.68 : 1.92 * s.distanza;
    piastre(b, 0, d);
    if (s.dielettrico !== undefined)
      b.box([0, 1.15, 0], [2 * d - 0.14, 1.48, 1.16], c.viola, 0.15 + 0.36 * s.dielettrico);
    const f = s.campo ?? 0.62;
    for (const z of [-0.48, 0, 0.48])
      b.arrow([-d + 0.13, 1.57, z], [-d + 0.13 + (2 * d - 0.34) * f, 1.57, z], c.ocra);
    if (s.carica !== undefined)
      for (let i = 0; i < Math.round(s.carica); i++)
        for (const k of [-1, 1])
          b.ball(
            [k * (d - 0.09), 0.52 + 0.24 * (i % 4), -0.37 + 0.45 * Math.floor(i / 4)],
            0.058,
            k < 0 ? c.rosso : c.viola,
          );
    if (s.moto !== undefined || s.posizione !== undefined) {
      const x = s.moto !== undefined ? (-1 + 2 * s.moto) * (d - 0.2) : s.posizione * (d - 0.2);
      b.ball([x, 0.99, 0.27], 0.13, c.viola);
      b.label([x, 0.67, 0.52], 'Sonda');
    }
    b.label([-d, 2.25, 0], '+');
    b.label([d, 2.25, 0], '−');
  },
  dipoli(b, s) {
    b.box([0, 1, 0], [2.65, 1.14, 1.24], s.metallo ? c.metallo : c.acqua, 0.26);
    if (s.metallo) {
      for (let i = 0; i < Math.round(6 * s.campo); i++)
        for (const k of [-1, 1])
          b.ball(
            [k * 1.22, 0.7 + 0.23 * (i % 3), -0.28 + 0.47 * Math.floor(i / 3)],
            0.09,
            k < 0 ? c.viola : c.rosso,
          );
    } else
      for (let i = 0; i < 8; i++) {
        const x = -0.85 + 0.56 * (i % 4),
          y = 0.78 + 0.48 * Math.floor(i / 4),
          e = 0.028 + 0.13 * s.campo;
        b.ball([x - e, y, 0], 0.082, c.viola);
        b.ball([x + e, y, 0], 0.082, c.rosso);
      }
    b.arrow([-2.55, 1, 0], [-2.55 + s.campo, 1, 0], c.verde);
    b.label([0, 2.07, 0], s.metallo ? 'Conduttore isolato' : 'Dielettrico');
  },
  filo(b, s) {
    const len = s.lunghezza === undefined ? 4.15 : 0.64 + 3.6 * s.lunghezza;
    b.rod(
      [-len / 2, 1.1, 0],
      [len / 2, 1.1, 0],
      0.205,
      s.materiale === undefined ? c.ocra : s.materiale > 0.5 ? c.metallo : c.ocra,
    );
    b.ring([0, 1.1, 0], 0.3, 'yz', c.viola);
    for (let i = 0; i < 6; i++) {
      const u = (((i / 6 - (s.passaggio ?? 0) * 0.8) % 1) + 1) % 1;
      b.ball([-len / 2 + u * len, 1.1, 0.2], 0.063, c.viola);
    }
    b.arrow([-1.05, 1.68, 0], [-1.05 + Math.min(2.4, s.corrente), 1.68, 0], c.verde);
    b.label([0, 2.17, 0], 'Corrente convenzionale', c.verde);
    b.label([0, 0.65, 0.48], 'Sezione', c.viola);
  },
  circuito(b, s) {
    const z = 0.94,
      y = 0.47;
    const elements = s.dueSerie
      ? [
          [-0.8, 0.6, c.viola],
          [0.8, 0.43 + 0.63 * s.r, c.ocra],
        ]
      : [[0.22, 0.43 + 0.63 * s.r, s.calore === undefined ? c.ocra : s.calore > 0.38 ? c.rosso : c.ocra]];
    wire(b, [
      [-0.61, y, z],
      [-1.85, y, z],
      [-1.85, y, -z],
    ]);
    wire(b, [
      [1.85, y, -z],
      [1.85, y, z],
      [0.12, y, z],
    ]);
    b.box([-0.25, y, z], [0.74, 0.53, 0.37], c.inchiostro);
    b.box([s.i < 0 ? 0.08 : -0.62, y, z], [0.14, 0.41, 0.39], c.rosso);
    let previous = -1.85;
    for (const [x, w, color] of elements) {
      wire(b, [
        [previous, y, -z],
        [x - w / 2, y, -z],
      ]);
      b.box([x, y, -z], [w, 0.3, 0.31], color);
      previous = x + w / 2;
    }
    wire(b, [
      [previous, y, -z],
      [1.85, y, -z],
    ]);
    if (s.parallelo) {
      wire(b, [
        [-1.26, y, -z],
        [-1.26, y, 0.06],
        [-0.28, y, 0.06],
      ]);
      wire(b, [
        [0.28, y, 0.06],
        [1.26, y, 0.06],
        [1.26, y, -z],
      ]);
      b.box([0, y, 0.06], [0.56, 0.3, 0.31], c.viola);
      b.arrow([-1.04, y + 0.28, 0.06], [-0.68, y + 0.28, 0.06], c.viola);
    }
    b.arrow([-1.15, y + 0.36, -z], [-1.15 + 0.72 * (s.ramo ?? s.i), y + 0.36, -z], c.verde);
    b.label([-0.27, 1.19, z], 'Pila');
    b.label([0.35, 1.25, -z], 'R');
  },
  condensatori(b, s) {
    const series = Boolean(s.serie),
      h = 0.9;
    for (const [x, f] of [
      [-1.0, 0.6],
      [1.0, s.secondo],
    ])
      piastre(b, x, 0.17, h, 0.6 + 0.7 * f);
    if (series)
      wire(b, [
        [-0.83, h, 0],
        [0.83, h, 0],
      ]);
    else
      for (const [sign, z] of [
        [-1, -0.72],
        [1, 0.72],
      ])
        wire(b, [
          [-1 + sign * 0.17, h, 0],
          [-1 + sign * 0.17, h, z],
          [1 + sign * 0.17, h, z],
          [1 + sign * 0.17, h, 0],
        ]);
    if (s.carica !== undefined)
      for (let i = 0; i < Math.round(9 * s.carica); i++)
        b.ball(
          [i % 3 === 0 ? -1.22 : 0.78, 0.62 + (i % 3) * 0.16, (Math.floor(i / 3) - 1) * 0.18],
          0.053,
          c.rosso,
        );
    b.label([-1, 2.01, 0], 'C₁');
    b.label([1, 2.01, 0], 'C₂');
  },
  bussola(b, s) {
    b.rod([0, 0.08, 0], [0, 2.45, 0], 0.085, c.ocra);
    b.arrow([0.25, 1.21, 0], [0.25, 1.21 + s.corrente, 0], c.rosso);
    for (const r of [0.68, 1.22, 1.72]) b.ring([0, 0.51, 0], r, 'xz', s.corrente ? c.verde : c.metallo);
    b.rod([1.22, 0.08, 0], [1.22, 0.44, 0], 0.31, c.metallo);
    b.arrow([1.22, 0.57, 0], [1.22, 0.57, -0.9 * s.corrente], c.viola);
    b.label([1.65, 1.19, 0], 'Sonda B');
    b.label([0, 2.76, 0], 'Filo');
  },
  lorentz(b, s) {
    const a = rad(s.angolo),
      o = [0, 1.33, 0],
      velocityOrigin = [0, 1.73, 0],
      forceOrigin = [0, 1.33, 0.45];
    for (const z of [-0.85, 0, 0.85]) b.arrow([-1.65, 0.46, z], [1.6, 0.46, z], c.metallo);
    b.ball(o, 0.15, c.rosso);
    b.arrow(velocityOrigin, [1.4 * Math.cos(a), velocityOrigin[1], -1.4 * Math.sin(a)], c.verde);
    // B points along +x. A velocity component toward −z gives a force toward −y.
    b.arrow(forceOrigin, [0, forceOrigin[1] - 0.95 * s.forza, forceOrigin[2]], c.viola);
  },
  spira(b, s) {
    const angle = rad(s.angolo),
      u = [Math.cos(angle), Math.sin(angle), 0],
      v = [0, 0, 1],
      normal = [-Math.sin(angle), Math.cos(angle), 0],
      o = [0, 1.26, 0];
    const circle = (a, r) => o.map((k, j) => k + r * (u[j] * Math.cos(a) + v[j] * Math.sin(a)));
    b.line(
      punti(65, (i) => circle((i * Math.PI) / 32, 1.03)),
      c.ocra,
    );
    b.arrow(
      o,
      o.map((k, j) => k + 0.95 * normal[j]),
      c.viola,
    );
    for (const x of [-1.65, 1.65])
      for (const z of [-0.6, 0.6])
        b.arrow(
          [x, 0.39, z],
          [x, s.campoRelativo === undefined ? 1.38 + s.campo : 0.39 + 1.8 * s.campoRelativo, z],
          c.verde,
        );
    if (s.variazione !== undefined)
      b.arrow([-2.12, 1.48, 0], [-2.12, 1.48 + 0.41 * s.variazione, 0], c.rosso);
    if (s.corrente) {
      const d = Math.sign(s.corrente);
      b.arrow(circle(0.65, 1.03), circle(0.65 - 0.58 * d, 1.03), c.rosso);
    }
    b.label([0, 2.76, 0], s.corrente !== undefined ? 'Spira chiusa' : 'Normale alla spira');
  },
};
