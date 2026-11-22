import { colore as c, punti, rad } from '../geometria.js';
function pareti(b, x, w, h, d) {
  for (const i of [-1, 1])
    for (const j of [-1, 1])
      b.rod([x + (i * w) / 2, 0.08, (j * d) / 2], [x + (i * w) / 2, h, (j * d) / 2], 0.024, c.metallo);
  b.line(
    [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
    ].map(([i, j]) => [x + (i * w) / 2, h, (j * d) / 2]),
    c.metallo,
  );
}
function tubo(b, a, d, r1, r2 = r1) {
  b.rod(a, d, r1, c.acqua, 0.22, r2);
}
function tuboOrizz(b, x1, x2, r1, r2, y = 1.05, z = 0) {
  tubo(b, [x1, y, z], [x2, y, z], r1, r2);
  b.ring([x1, y, z], r1, 'yz', c.verde);
  b.ring([x2, y, z], r2, 'yz', c.verde);
}
export const fluidi = {
  fasi(b, s) {
    const gas = s.stato === 3,
      sol = s.stato === 1;
    const h = gas ? 2.22 : sol ? 0.9 : 1.0;
    pareti(b, 0, 2.1, 2.35, 1.4);
    if (!gas) b.box([0, h / 2, 0], [1.93, h, 1.25], sol ? c.viola : c.acqua, 0.23);
    for (let i = 0; i < 24; i++) {
      const jitter = sol ? 0 : 0.11;
      const x = -0.7 + 0.47 * (i % 4) + jitter * Math.sin(i * 3),
        z = -0.4 + 0.4 * (Math.floor(i / 4) % 3) + jitter * Math.cos(i * 5);
      const y = gas
        ? 0.2 + (1.88 * ((i * 17) % 23)) / 22
        : 0.24 + 0.4 * Math.floor(i / 12) + jitter * Math.sin(i);
      b.ball([x, y, z], 0.12, c.verde);
    }
    const volume = [6, 7.5, 60][s.stato - 1];
    b.rod([1.6, 0.11, 0], [1.6, 2.25, 0], 0.13, c.acqua, 0.22);
    b.rod([1.6, 0.11, 0], [1.6, 0.11 + (2.1 * volume) / 60, 0], 0.088, c.viola);
    b.label([1.63, 2.61, 0], 'Volume');
    b.label([0, 2.72, 0], ['Solido', 'Liquido', 'Gas'][s.stato - 1]);
  },
  strati(b, s) {
    const h = 0.55 + 1.25 * (s.spessore ?? 0.55);
    b.box([0, 0.13, 0], [3.4, 0.16, 1.8], c.metallo);
    b.box([0, 0.22 + h, 0], [3.4, 0.14, 1.8], c.ocra);
    b.box([0, 0.22 + h / 2, 0], [3, h, 1.48], c.acqua, 0.2);
    for (let i = 0; i <= 5; i++) {
      const f = i / 5,
        y = 0.22 + h * f;
      b.arrow([-1, y, 0.78], [-1 + 1.8 * s.velocita * f, y, 0.78], c.verde);
    }
    if (s.sforzo !== undefined) b.arrow([-0.7, h + 0.6, 0], [-0.7 + s.sforzo, h + 0.6, 0], c.viola);
    b.label([0, 0.57 + h, 0], s.sforzo === undefined ? 'Lastra mobile' : 'Sforzo sulla lastra');
  },
  vasca(b, s) {
    pareti(b, 0, 2.7, 2.42, 1.4);
    b.box([0, 1.15, 0], [2.64, 2.07, 1.34], c.acqua, 0.26);
    const y = 2.18 - 1.92 * s.profondita;
    for (const x of [-0.8, 0.8]) {
      b.line(
        [
          [x, 2.37, 0.3],
          [x, y, 0.3],
        ],
        c.metallo,
      );
      b.ball([x, y, 0.3], 0.105, c.viola);
    }
    b.line(
      [
        [-1.0, y, 0.3],
        [1.0, y, 0.3],
      ],
      c.verde,
      true,
    );
    if (s.superficie !== undefined) b.arrow([0, 2.75, 0], [0, 2.75 - 0.45 * s.superficie, 0], c.rosso);
    b.label([-1.17, y + 0.18, 0.55], 'Sonda');
    b.label([0.6, 2.52, -0.45], 'Superficie');
  },
  manometro(b, s) {
    if (s.barometro) {
      b.box([0, 0.35, 0], [2.3, 0.45, 1.35], c.metallo, 0.5);
      const h = 0.58 + 2.08 * s.livello;
      b.rod([0, 0.48, 0], [0, 2.84, 0], 0.17, c.acqua, 0.24);
      b.rod([0, 0.46, 0], [0, h, 0], 0.125, c.viola);
      b.label([0.57, h, 0], 'Hg');
      b.label([-0.6, 2.81, 0], 'Vuoto');
      return;
    }
    const left = 1.36 - 0.59 * s.livello,
      right = 1.36 + 0.59 * s.livello;
    for (const [x, h] of [
      [-0.82, left],
      [0.82, right],
    ]) {
      b.rod([x, 0.28, 0], [x, 2.42, 0], 0.18, c.acqua, 0.23);
      b.rod([x, 0.27, 0], [x, h, 0], 0.135, c.verde);
      b.line(
        [
          [x, h, 0],
          [1.5, h, 0],
        ],
        c.metallo,
        true,
      );
    }
    b.rod([-0.82, 0.27, 0], [0.82, 0.27, 0], 0.145, c.verde);
    b.arrow([1.36, left, 0], [1.36, right, 0], c.viola);
    b.label([1.74, (left + right) / 2, 0], 'Δh');
  },
  pressa(b, s) {
    if (s.singola) {
      const lato = 1.9 * Math.sqrt(s.area);
      b.box([0, 0.17, 0], [lato, 0.23, lato], c.verde);
      b.box([0, 0.62, 0], [0.72, 0.65, 0.72], c.ocra);
      b.arrow([0, 1.94, 0], [0, 1.05, 0], c.rosso);
      b.label([0, 2.28, 0], 'Carico 10 N');
      return;
    }
    const pos = [-1.15, 1.15],
      heights = [1.77 - (s.corsa ?? 0) * 0.8, 1.35 + (s.corsa ?? 0) * 0.2];
    b.rod([-1.15, 0.34, 0], [1.15, 0.34, 0], 0.12, c.acqua);
    for (let i = 0; i < 2; i++) {
      const x = pos[i],
        h = heights[i],
        r = i ? 0.58 : 0.29;
      b.rod([x, 0.28, 0], [x, 2.12, 0], r + 0.04, c.acqua, 0.2);
      b.rod([x, 0.3, 0], [x, h, 0], r, c.acqua, 0.55);
      b.rod([x, h, 0], [x, h + 0.11, 0], r, c.metallo);
      b.rod([x, h + 0.1, 0], [x, h + 0.38, 0], 0.06, c.metallo);
      b.arrow(
        [x, h + (i ? 0.4 : 0.9), 0],
        [x, h + (i ? 0.4 + 0.7 * (s.forza ?? 1) : 0.9 - 0.36 * (s.forza ?? 1)), 0],
        i ? c.verde : c.rosso,
      );
    }
    b.label([-1.15, 2.65, 0], 'A₁');
    b.label([1.15, 2.65, 0], '4 A₁');
  },
  galleggia(b, s) {
    const top = 1.56,
      L = 0.97,
      y = top + L * (0.5 - s.immerso);
    pareti(b, 0, 3.0, 1.98, 1.65);
    b.box([0, top / 2, 0], [2.94, top, 1.59], c.acqua, 0.23);
    b.box([0, y, 0], [1.02, L, 0.8], c.ocra, 0.88);
    b.line(
      [
        [-1.2, top, 0.52],
        [1.2, top, 0.52],
      ],
      c.verde,
      true,
    );
    b.arrow([0.65, y - 0.35, 0], [0.65, y - 0.35 + 1.3 * s.spinta, 0], c.viola);
    b.label([-0.75, top + 0.28, 0.4], 'Pelo libero');
  },
  condotto(b, s) {
    const l = s.lungo ? 2.85 : 2.35;
    for (const [x, r] of [
      [-l + 0.32, s.r1],
      [l - 0.32, s.r2],
    ]) {
      b.box([x, 0.1, 0], [0.4, 0.16, 0.85], c.metallo);
      b.rod([x, 0.13, 0], [x, 1.05 - r, 0], 0.064, c.metallo);
    }
    tuboOrizz(b, -l, -0.72, s.r1, s.r1);
    tuboOrizz(b, -0.72, 0.3, s.r1, s.r2);
    tuboOrizz(b, 0.3, l, s.r2, s.r2);
    b.arrow([-l + 0.18, 1.05, 0], [-l + 0.18 + 0.8 * s.v1, 1.05, 0], c.verde);
    b.arrow([0.44, 1.05, 0], [0.44 + 0.8 * s.v2, 1.05, 0], c.viola);
    if (s.pressione || s.pitot || s.perdita !== undefined) {
      const v = s.v2 ?? 0,
        h1 = s.pitot ? 0.55 : 0.85,
        h2 = s.pitot
          ? 0.55 + 0.45 * v * v
          : s.perdita !== undefined
            ? 0.85 - 0.65 * s.perdita
            : 0.85 + 0.24 * (s.v1 * s.v1 - v * v);
      for (const [x, h] of [
        [-1.4, h1],
        [1.4, h2],
      ]) {
        b.rod([x, 1.05, 0], [x, 2.75, 0], 0.09, c.acqua, 0.25);
        b.rod([x, 1.05, 0], [x, 1.64 + h, 0], 0.062, c.verde);
      }
    }
    if (s.pitot) {
      b.rod([1.4, 1.05, 0], [1.02, 1.05, 0], 0.088, c.metallo);
      b.ring([1.02, 1.05, 0], 0.089, 'yz', c.inchiostro);
      b.label([1.34, 2.99, 0], 'Presa frontale');
    }
    if (s.raccolta !== undefined)
      b.box([l, 0.15 + 0.18 * s.raccolta, 0], [0.56, 0.08 + 0.32 * s.raccolta, 0.66], c.acqua, 0.72);
    b.label([-l + 0.55, 1.68 + s.r1, 0], 'Entrata');
    b.label([l - 0.5, 1.68 + s.r2, 0], 'Uscita');
  },
  profilo(b, s) {
    const y = 1.2,
      R = 0.82;
    tuboOrizz(b, -2.0, 2.0, R, R, y);
    if ((s.regime ?? 0) > 2300) {
      b.label([0, 2.4, 0], 'Profilo laminare fuori validità', c.rosso);
      return;
    }
    const v = (h) => 1.35 * s.picco * (1 - h * h);
    for (let i = -4; i <= 4; i++) {
      const h = i / 4;
      b.arrow([-0.7, y + R * h, 0], [-0.7 + v(h), y + R * h, 0], c.viola);
    }
    b.line(
      punti(45, (i) => {
        const h = i / 22 - 1;
        return [-0.7 + v(h), y + R * h, 0];
      }),
      c.verde,
    );
    if (s.sonda !== undefined) b.ball([-0.7, y + R * s.sonda, 0.08], 0.085, c.ocra);
    if (s.traccia !== undefined)
      for (let j = 0; j < 12; j++) {
        const h = ((j % 5) - 2) / 2.7;
        b.ball([-1.88 + ((j * 0.44 + 0.65 * (1 - h * h) * s.traccia) % 3.76), y + R * h, 0.2], 0.047, c.ocra);
      }
    b.label([0, 2.42, 0], 'Sezione di misura');
  },
  rete(b, s) {
    if (s.serie) {
      tuboOrizz(b, -2.55, 2.55, 0.22, 0.22);
      for (const x of [-1, 1]) b.rod([x - 0.35, 1.05, 0], [x + 0.35, 1.05, 0], 0.29, c.ocra);
      b.arrow([-2.4, 1.48, 0], [-2.4 + s.alto, 1.48, 0], c.verde);
      if (s.pressione !== undefined) b.rod([0, 1.05, 0], [0, 1.3 + 0.85 * s.pressione, 0], 0.08, c.viola);
      b.label([0, 2.46, 0], 'Presa intermedia');
      return;
    }
    const A = [-1.62, 1.05, 0],
      B = [1.62, 1.05, 0];
    tubo(b, [-2.6, 1.05, 0], A, 0.15);
    tubo(b, B, [2.6, 1.05, 0], 0.15);
    for (const [k, f] of [
      [-1, s.alto],
      [1, s.basso],
    ]) {
      const l = [-0.92, 1.05, 0.9 * k],
        r = [0.92, 1.05, 0.9 * k];
      tubo(b, A, l, 0.14);
      tubo(b, l, r, 0.14);
      tubo(b, r, B, 0.14);
      b.arrow([-0.72, 1.25, 0.9 * k], [-0.72 + 1.1 * f, 1.25, 0.9 * k], k < 0 ? c.viola : c.verde);
    }
    b.label([-1.7, 1.67, 0], 'Nodo A');
    b.label([1.7, 1.67, 0], 'Nodo B');
  },
  film(b, s) {
    const w = 3.1 * s.bordo,
      h = 1.45;
    for (const x of [-w / 2, w / 2]) b.rod([x, 0.3, 0], [x, h + 0.3, 0], 0.045, c.metallo);
    b.rod([-w / 2, 0.3, 0], [w / 2, 0.3, 0], 0.045, c.metallo);
    b.rod([-w / 2, 1.75, 0], [w / 2, 1.75, 0], 0.06, c.ocra);
    b.box([0, 1.02, 0], [w, h, 0.035], c.acqua, 0.43);
    for (const z of [-0.12, 0.12]) b.arrow([0, 1.71, z], [0, 1.71 - 0.8 * s.bordo, z], c.viola);
    b.label([0, 2.14, 0], 'Bordo mobile');
  },
  goccia(b, s) {
    if (s.curvatura !== undefined) {
      const k = s.curvatura;
      const prof = (z) =>
        k === 0 ? 1.15 : 1.15 - ((1 - Math.sqrt(Math.max(0, 1 - ((z * k) / 3.6) ** 2))) * 3.6) / k;
      const xs = punti(25, (i) => (i - 12) / 10);
      for (const z of [-0.75, -0.37, 0, 0.37, 0.75])
        b.line(
          xs.map((x) => [x, prof(Math.hypot(x, z)), z]),
          c.verde,
        );
      b.arrow([0, 0.45, 0], [0, 0.45 + 0.54 * k, 0], c.viola);
      b.label([0, 1.75, 0], k ? 'Interfaccia curva' : 'Interfaccia piana');
      return;
    }
    const R = 1.15 * s.raggio;
    b.ball([0, 1.29, 0], R, c.acqua, s.bolla ? 0.25 : 0.6);
    b.ring([0, 1.29, 0], R, 'xy', c.verde);
    if (s.bolla) b.ring([0, 1.29, 0], R * 0.92, 'xy', c.viola);
    b.arrow([0, 1.29, 0], [R, 1.29, 0], c.ocra);
    b.label([0, 1.72 + R, 0], s.bolla ? 'Film a due facce' : 'Goccia');
  },
  capillare(b, s) {
    const zero = 1.24,
      h = zero + 0.78 * s.livello;
    pareti(b, 0, 2.95, 1.6, 1.8);
    b.box([0, zero / 2, 0], [2.9, zero, 1.74], c.acqua, 0.2);
    b.rod([0, 0.15, 0], [0, 2.56, 0], 0.27, c.acqua, 0.24);
    b.rod([0, 0.15, 0], [0, h, 0], 0.23, c.acqua, 0.75);
    b.line(
      punti(25, (i) => {
        const u = (i - 12) / 12;
        return [u * 0.24, h + 0.12 * u * u * Math.cos(rad(s.angolo)), 0.05];
      }),
      c.verde,
    );
    b.line(
      [
        [0.34, zero, 0],
        [1.1, zero, 0],
      ],
      c.metallo,
      true,
    );
    b.arrow([0.62, zero, 0], [0.62, h, 0], c.viola);
    b.label([-0.76, zero + 0.24, 0], 'Serbatoio');
    b.label([0.42, 2.8, 0], 'Tubo');
  },
};
