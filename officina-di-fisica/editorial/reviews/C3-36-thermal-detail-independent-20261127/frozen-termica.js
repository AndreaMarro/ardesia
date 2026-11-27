import { colore as c, punti, limita } from '../geometria.js';
export function tinta(f) {
  const cold = [45, 134, 162],
    hot = [207, 90, 54],
    p = limita(f);
  return cold.map((v, i) => Math.round(v + (hot[i] - v) * p)).reduce((v, n) => v * 256 + n, 0);
}
function bicchiere(b, x, h, r = 0.47) {
  b.rod([x, 0.13, 0], [x, h, 0], r, c.acqua, 0.18);
  b.ring([x, h, 0], r, 'xz', c.verde);
}
function frecciaTermica(b, inizio, fine, colore, spostamentoDettaglio) {
  b.arrow(inizio, fine, colore);
  const componenti = fine.map((coordinata, indice) => coordinata - inizio[indice]);
  const lunghezza = Math.hypot(...componenti);
  if (lunghezza > 0 && lunghezza < 0.03) {
    const origine = inizio.map((coordinata, indice) => coordinata + spostamentoDettaglio[indice]);
    const punta = origine.map((coordinata, indice) => coordinata + 32 * componenti[indice]);
    b.arrow(origine, punta, c.ocra, true);
  }
}
export const termica = {
  pistone(b, s) {
    const h = 0.14 + 2.08 * s.volume,
      r = 0.74;
    bicchiere(b, 0, 2.48, r + 0.055);
    b.rod([0, 0.14, 0], [0, h, 0], r, tinta(s.temperatura ?? 0.56), 0.26);
    for (let i = 0; i < 15; i++) {
      const a = i * 2.4,
        rr = (0.24 + (i % 3) * 0.19) * r;
      b.ball(
        [rr * Math.cos(a), 0.16 + (h - 0.17) * (0.13 + (0.74 * ((i * 7) % 15)) / 14), rr * Math.sin(a)],
        0.046,
        c.ocra,
      );
    }
    b.rod([0, h, 0], [0, h + 0.13, 0], r, c.metallo);
    b.rod([0, h + 0.11, 0], [0, h + 0.54, 0], 0.085, c.metallo);
    for (let i = 0; i <= 8; i++)
      b.line(
        [
          [0.78, 0.18 + i * 0.26, 0],
          [0.91, 0.18 + i * 0.26, 0],
        ],
        c.inchiostro,
      );
    if (s.pressione !== undefined)
      b.arrow([0.95, h + 0.92, 0], [0.95, h + 0.92 - 0.6 * s.pressione, 0], c.rosso);
    if (s.lavoro !== undefined) b.arrow([-1.02, 1.24, 0], [-1.02, 1.24 + 0.88 * s.lavoro, 0], c.viola);
    b.label([-0.86, h + 0.39, -0.28], 'Pistone');
    b.label([1.44, 0.58, 0], 'Volume');
  },
  termometro(b, s) {
    // Keep the lowest calibrated column cap above the opaque bulb.
    b.ball([0, 0.3, 0], 0.22, c.rosso);
    b.rod([0, 0.46, 0], [0, 2.5, 0], 0.14, c.acqua, 0.3);
    b.rod([0, 0.43, 0], [0, 0.55 + 1.72 * s.livello, 0], 0.085, c.rosso);
    for (let i = 0; i <= 15; i++)
      b.line(
        [
          [-0.13, 0.55 + (i * 1.72) / 15, 0],
          [-0.13 - (i % 5 ? 0.12 : 0.28), 0.55 + (i * 1.72) / 15, 0],
        ],
        c.metallo,
      );
    b.label([-0.66, 2.36, 0], '°C');
    b.label([0.64, 2.36, 0], 'K');
  },
  calorimetro(b, s) {
    bicchiere(b, 0, 1.83, 0.8);
    b.rod([0, 0.17, 0], [0, 1.32, 0], 0.74, tinta(s.caldo), 0.55);
    if (s.massa !== undefined)
      b.box(
        [-1.39, 0.17 + 0.37 * s.massa, 0],
        [0.62, 0.18 + 0.74 * s.massa, 0.58],
        s.miscela ? c.rosso : c.ocra,
      );
    if (s.elettrico) {
      b.box([-1.65, 0.44, 0], [0.58, 0.72, 0.44], c.viola);
      b.line(
        [
          [-1.62, 0.84, 0],
          [-1.62, 1.94, 0],
          [-0.15, 1.94, 0],
          [-0.15, 0.5, 0],
        ],
        c.rosso,
      );
      b.line(
        [
          [0.13, 0.5, 0],
          [0.13, 2.02, 0],
          [-2.04, 2.02, 0],
          [-2.04, 0.36, 0],
          [-1.96, 0.36, 0],
        ],
        c.verde,
      );
    }
    b.rod([0.4, 0.47, 0], [0.4, 2.45, 0], 0.08, c.acqua, 0.24);
    b.rod([0.4, 0.46, 0], [0.4, 0.64 + 1.51 * s.caldo, 0], 0.044, c.rosso);
    b.label([0.98, 2.48, 0], 'Termometro');
  },
  fase(b, s) {
    const f = s.liquido;
    bicchiere(b, 0, 2.34, 0.92);
    if (f > 0) b.rod([0, 0.16, 0], [0, 0.16 + 0.99 * f, 0], 0.87, c.acqua, 0.51);
    if (!s.vapore && f < 1) {
      const a = Math.cbrt(1 - f) * 0.95;
      b.box([0, 0.16 + f * 0.97 + a / 2, 0], [a, a, a], c.bianco);
      b.label([-0.95, 1.6, 0], 'Solido');
    }
    if (s.vapore)
      for (let i = 0; i < Math.round(14 * (1 - f)); i++)
        b.ball(
          [0.64 * Math.cos(2.4 * i), 1.22 + (0.73 * ((7 * i) % 13)) / 12, 0.65 * Math.sin(i * 2.4)],
          0.07,
          c.acqua,
        );
    if (!s.vapore) {
      const q = s.energia;
      // Q in kJ for 100 g. The temperature is constant while both phases coexist.
      const temperature = q === undefined ? 0 : q < 2 ? -10 + 5 * q : Math.max(0, (q - 36) / 0.42);
      const x = 1.4,
        zero = 0.88,
        height = zero + 0.026 * temperature;
      b.rod([x, 0.38, 0], [x, 2.23, 0], 0.078, c.acqua, 0.24);
      b.rod([x, 0.38, 0], [x, height, 0], 0.047, c.rosso);
      b.ball([x, 0.35, 0], 0.105, c.rosso);
      b.line(
        [
          [x - 0.12, zero, 0],
          [x + 0.12, zero, 0],
        ],
        c.inchiostro,
      );
      b.label([x + 0.35, zero + 0.1, 0], '0 °C');
    }
    if (s.energia !== undefined)
      frecciaTermica(b, [-1.71, 0.75, 0], [-1.71 + (0.85 * s.energia) / 54, 0.75, 0], c.rosso, [0, 0.95, 1.05]);
    if (f > 0) b.label([-1.08, 0.64, 0.18], 'Liquido');
  },
  barra(b, s) {
    const len = 0.5 + 3.8 * s.lunghezza;
    for (let i = 0; i < 18; i++) {
      const x = -len / 2 + ((i + 0.5) * len) / 18;
      b.box([x, 0.87, 0], [len / 18, 0.52, 0.62], tinta(1 - i / 17));
    }
    for (const k of [-1, 1])
      b.box([k * (len / 2 + 0.16), 0.87, 0], [0.32, 1.13, 1.03], k < 0 ? c.rosso : c.acqua);
    b.arrow([-0.9, 1.84, 0], [-0.9 + 1.72 * s.flusso, 1.84, 0], c.viola);
    b.label([-len / 2, 1.54, 0], 'Calda');
    b.label([len / 2, 1.54, 0], 'Fredda');
  },
  convezione(b, s) {
    const loop = [
      [-1.4, 0.46, 0],
      [-1.4, 2.05, 0],
      [1.4, 2.05, 0],
      [1.4, 0.46, 0],
      [-1.4, 0.46, 0],
    ];
    loop.slice(1).forEach((q, i) => b.rod(loop[i], q, 0.14, i < 2 ? c.rosso : c.acqua, 0.5));
    if (s.giri !== undefined) {
      const lengths = loop.slice(1).map((q, i) => Math.hypot(...q.map((v, j) => v - loop[i][j])));
      const total = lengths.reduce((sum, l) => sum + l, 0);
      for (let i = 0; i < 10; i++) {
        let distance = ((s.giri + i / 10) % 1) * total;
        let k = 0;
        while (k < lengths.length - 1 && distance > lengths[k]) distance -= lengths[k++];
        const q = loop[k].map((v, j) => v + ((loop[k + 1][j] - v) * distance) / lengths[k]);
        b.ball(q, 0.085, i ? c.metallo : c.ocra);
      }
    }
    b.box([-1.4, 0.18, 0], [0.75, 0.22, 0.61], c.ocra);
    b.box([1.4, 2.16, 0], [0.72, 0.32, 0.63], c.verde);
    b.arrow([-1.42, 0.75, 0.2], [-1.42, 0.75 + s.portata, 0.2], c.rosso);
    b.arrow([1.4, 1.76, 0.2], [1.4, 1.76 - s.portata, 0.2], c.viola);
    b.label([-1.46, 2.59, 0], 'Ingresso caldo');
    b.label([1.38, 0.82, 0.41], 'Ritorno');
  },
  radiazione(b, s) {
    for (const [x, color] of [
      [-1.55, tinta(s.temperatura)],
      [1.55, c.acqua],
    ])
      b.box([x, 1.08, 0], [0.29, 1.72, 1.42], color);
    for (const z of [-0.48, 0, 0.48]) {
      b.line(
        punti(52, (i) => [-1.34 + (2.68 * i) / 51, 1.1 + 0.09 * Math.sin(i * 0.7), z]),
        c.ocra,
      );
      b.arrow([-0.65 * s.flusso, 1.55, z], [0.65 * s.flusso, 1.55, z], c.viola);
    }
    b.label([-1.56, 2.25, 0], 'Sistema');
    b.label([1.55, 2.25, 0], 'Ambiente');
  },
  ciclo(b, s) {
    const oy = 0.28,
      ox = -1.92,
      v = (x) => ox + 0.8 * x,
      p = (y) => oy + 1.52 * y;
    b.arrow([ox, oy, 0], [2.05, oy, 0], c.metallo);
    b.arrow([ox, oy, 0], [ox, 2.7, 0], c.metallo);
    b.label([2.32, oy, 0], 'V');
    b.label([ox, 2.89, 0], 'p');
    if (s.gradini) {
      const n = s.gradini,
        X = (u) => ox + 3.15 * u,
        Y = (u) => 0.28 + 1.82 / (1 + u);
      b.line(
        punti(55, (i) => [X(i / 54), Y(i / 54), 0]),
        c.viola,
      );
      for (let i = 0; i < n; i++) {
        const x1 = X(i / n),
          x2 = X((i + 1) / n),
          y = Y((i + 1) / n);
        b.box([(x1 + x2) / 2, (oy + y) / 2, 0.01], [x2 - x1, y - oy, 0.12], c.verde, 0.43);
      }
      b.label([1.1, 2.35, 0], 'Isoterma e gradini');
      return;
    }
    const a = s.ampiezza,
      x1 = v(a < 0 ? 2.1 : 1),
      x2 = x1 + 0.8 * a,
      h = p(s.pressione + 0.16),
      l = s.rettangolo === false ? oy : p(0.16);
    if (Math.abs(x2 - x1) > 0.001)
      b.box(
        [(x1 + x2) / 2, (h + l) / 2, 0],
        [Math.abs(x2 - x1), h - l, 0.12],
        a < 0 ? c.rosso : c.verde,
        0.32,
      );
    b.ball([x1, h, 0.12], 0.055, c.ocra);
    b.arrow([x1, h, 0.12], [x2, h, 0.12], c.viola);
    if (s.rettangolo !== false) {
      b.arrow([x2, l, 0.13], [x1, l, 0.13], c.verde);
      b.line(
        [
          [x1, l, 0],
          [x1, h, 0],
          [x2, h, 0],
          [x2, l, 0],
        ],
        c.metallo,
      );
    }
    if (s.giri) for (let i = 0; i < s.giri; i++) b.ball([-1.65 + 0.46 * i, 0.23, 0.72], 0.095, c.ocra);
  },
  motore(b, s) {
    if (s.scambio !== undefined) {
      b.box([-1.43, 1.05, 0], [1.05, 1.46, 1.0], c.rosso);
      b.box([1.43, 1.05, 0], [1.05, 1.46, 1.0], c.acqua);
      b.arrow([(-0.83 * s.scambio) / 60, 1.18, 0], [(0.83 * s.scambio) / 60, 1.18, 0], c.viola);
      b.label([-1.43, 2.06, 0], 'Serbatoio');
      b.label([1.43, 2.06, 0], 'Sistema');
      return;
    }
    for (const [x, color, text] of [
      [-2, c.rosso, 'Caldo'],
      [2, c.acqua, 'Freddo'],
    ]) {
      b.box([x, 1.05, 0], [0.68, 1.45, 0.92], color);
      b.label([x, 2.09, 0], text);
    }
    b.rod([0, 1, -0.27], [0, 1, 0.27], 0.5, c.metallo);
    b.ring([0, 1, 0.32], 0.43, 'xy', c.ocra);
    const d = s.frigo ? -1 : 1;
    b.arrow([-1.03 - d * 0.58 * s.caldo, 1, 0.85], [-1.03 + d * 0.58 * s.caldo, 1, 0.85], c.rosso);
    b.arrow([1.03 - d * 0.58 * s.freddo, 1, 0.85], [1.03 + d * 0.58 * s.freddo, 1, 0.85], c.verde);
    frecciaTermica(
      b,
      [0, 1 + 0.55 * (d < 0 ? s.lavoro : 0), 0.85],
      [0, 1 + 0.55 * (d > 0 ? s.lavoro : 0), 0.85],
      c.viola,
      [0.55, 0, 0.5],
    );
    b.label([0, 1.96, 0], 'Lavoro', c.viola);
  },
  microstati(b, s) {
    for (const x of [-1, 1]) {
      b.box([x, 0.36, 0], [1.72, 0.57, 1.3], c.acqua, 0.24);
      b.ring([x, 0.13, 0], 0.55, 'xz', c.metallo);
    }
    for (let i = 0; i < 4; i++) {
      const left = i < s.sinistra,
        j = left ? i : i - s.sinistra,
        x = (left ? -1 : 1) + ((j % 2) - 0.5) * 0.46;
      b.ball([x, 0.61, (Math.floor(j / 2) - 0.5) * 0.47], 0.17, [c.viola, c.ocra, c.rosso, c.verde][i]);
    }
    b.label([-1, 1.32, 0], 'Sinistra');
    b.label([1, 1.32, 0], 'Destra');
  },
};
