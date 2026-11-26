import { colore as c, punti, rad } from '../geometria.js';
function wave(b, fn, color, n = 96) {
  b.line(
    punti(n + 1, (i) => {
      const f = i / n;
      return [-2.5 + 5 * f, fn(f), 0];
    }),
    color,
  );
}
function spring(b, x1, x2, y) {
  b.line(
    punti(113, (i) => [
      x1 + ((x2 - x1) * i) / 112,
      y + 0.12 * Math.cos((i * Math.PI) / 8),
      0.12 * Math.sin((i * Math.PI) / 8),
    ]),
    c.viola,
  );
}
export const ondulatoria = {
  oscillatore(b, s) {
    const x = 1.45 * s.pos;
    b.box([-2.27, 0.79, 0], [0.18, 1.45, 0.96], c.metallo);
    spring(b, -2.16, x - 0.15, 0.81);
    b.box([x, 0.81, 0], [0.34, 0.52, 0.54], c.ocra);
    b.line(
      [
        [-1.45, 0.22, 0.6],
        [1.45, 0.22, 0.6],
      ],
      c.metallo,
    );
    for (const i of [-1, 0, 1])
      b.line(
        [
          [1.45 * i, 0.18, 0.6],
          [1.45 * i, 0.4, 0.6],
        ],
        c.verde,
      );
    b.arrow([0, 1.47, 0], [x, 1.47, 0], c.verde);
    b.label([0, 0.58, 0.85], 'Equilibrio');
    if (s.periodo !== undefined)
      b.label([0.1, 2.05, 0], s.istante === undefined ? 'Fotografia a 0,5 s' : 'Massa oscillante');
  },
  onda(b, s) {
    const phase = s.fase ?? Math.PI / 3,
      cycles = s.cicli ?? 2,
      A = s.ampiezza ?? 0.45;
    if (s.somma !== undefined) {
      const shape = (f) => Math.cos(2 * Math.PI * (f - 0.5));
      for (const [offset, amp, color, z] of [
        [0.6, 0.3, c.verde, -0.72],
        [0.6, s.somma * 0.45, c.ocra, 0],
        [1.28, 0.3 + s.somma * 0.45, c.viola, 0.72],
      ]) {
        b.line(
          punti(75, (i) => [-2.5 + (5 * i) / 74, offset + amp * shape(i / 74), z]),
          color,
        );
        b.ball([0, offset + amp, z], 0.06, color);
      }
      b.label([0.22, 2.5, 0.65], 'Somma alla sonda');
      return;
    }
    const signal = (f) =>
      s.impulso !== undefined
        ? 0.64 * Math.exp(-((f - s.impulso) ** 2) / 0.011)
        : A * Math.sin(phase - 2 * Math.PI * cycles * f);
    wave(b, (f) => 1.23 + signal(f), c.viola);
    b.line(
      [
        [-2.6, 1.23, 0],
        [2.6, 1.23, 0],
      ],
      c.metallo,
      true,
    );
    const u = s.sonda ? 0 : 0.5;
    b.ball([-2.5 + 5 * u, 1.23 + signal(u), 0], 0.105, c.ocra);
    b.label([-2.5 + 5 * u, 1.6 + signal(u), 0], 'P', c.ocra);
    if (s.confronto) {
      for (let i = 0; i < 29; i++) {
        const f = i / 28;
        b.ball(
          [-2.5 + 5 * f + 0.12 * Math.sin(phase - 2 * Math.PI * cycles * f), 0.45, 0.68],
          i === 14 ? 0.085 : 0.049,
          i === 14 ? c.ocra : c.verde,
        );
      }
    }
  },
  onde2(b, s) {
    const a = [-1.2, 0.53, 0],
      bpos = [1.2, 0.53, 0],
      p = [0.42 * s.differenza, 0.53, 0];
    // On the segment S1–S2 the difference of distances is exactly 2x; λ is 0.84 scene units.
    for (const [q, col] of [
      [a, c.verde],
      [bpos, c.viola],
    ]) {
      b.ball(q, 0.12, col);
      for (const r of [0.42, 0.84, 1.26]) b.ring(q, r, 'xz', col);
      b.line([q, p], col, true);
    }
    b.ball(p, 0.105, c.ocra);
    b.rod([p[0], 0.64, 0], [p[0], 0.65 + Math.abs(Math.cos(Math.PI * s.differenza)), 0], 0.055, c.ocra);
    b.label([-1.2, 1.1, 0], 'S₁');
    b.label([1.2, 1.1, 0], 'S₂');
    b.label([p[0], 2.05, 0], 'P');
  },
  sorgente(b, s) {
    const ox = -1.3,
      r = 2.42 * s.distanza,
      px = ox + r,
      o = [ox, 1.11, 0];
    b.ball(o, 0.15, c.ocra);
    for (const radius of [r / 2, r]) {
      for (const tilt of [0, Math.PI / 4, Math.PI / 2]) {
        b.line(
          punti(41, (i) => {
            const a = (i / 40 - 0.5) * 1.23;
            return [
              ox + radius * Math.cos(a),
              1.11 + radius * Math.sin(a) * Math.sin(tilt),
              radius * Math.sin(a) * Math.cos(tilt),
            ];
          }),
          c.verde,
        );
      }
    }
    const a = 0.38 + 0.62 * Math.sqrt(s.area ?? 0.5);
    b.box([px, 1.11, 0], [0.08, a, a], c.viola, 0.73);
    if (s.livello !== undefined)
      for (let i = 0; i < Math.round(8 * s.livello); i++)
        b.box([px + 0.45, 0.37 + 0.14 * i, 0], [0.24, 0.1, 0.18], c.verde);
    b.label([ox, 1.65, 0], 'Sorgente');
    b.label([px, 1.72, 0], 'Sonda');
  },
  doppler(b, s) {
    if (s.eco !== undefined) {
      const d = 3.95 * s.eco,
        left = -2.13,
        wall = left + d;
      b.box([wall + 0.065, 1, 0], [0.13, 1.65, 1.04], c.metallo, 0.43);
      b.ball([left, 0.82, 0], 0.15, c.ocra);
      b.arrow([left, 1.24, 0], [wall, 1.24, 0], c.verde);
      b.arrow([wall, 0.45, 0.85], [left, 0.45, 0.85], c.viola);
      if (s.frazioneEco !== undefined) {
        const at = left + d * s.frazioneEco;
        b.ball([at, 1.01, 0.34], 0.13, c.viola);
        b.label([at, 1.43, 0.36], s.frazioneEco >= 1 - 1e-8 ? 'Riflessione' : 'Impulso', c.viola);
      }
      return;
    }
    if (s.moto !== undefined) {
      // Longitudinal section near the axis. Each crest expands from the
      // position where the source emitted it, including fronts already in flight.
      const time = s.dopplerMs ?? 0,
        period = 10 / 3;
      const scale = 0.52,
        speed = 0.3 * s.moto,
        x0 = -0.72,
        receiver = x0 + 3 * scale;
      const sourceAt = (ms) => x0 + scale * speed * ms;
      for (let n = Math.floor(time / period) - 12; n <= Math.floor(time / period); n++) {
        const emission = n * period,
          radius = (time - emission) * 0.3 * scale;
        if (radius < 0.01) continue;
        for (const side of [-1, 1]) {
          const center = sourceAt(emission),
            tip = center + side * radius;
          if (Math.abs(tip) > 2.65) continue;
          const half = Math.min(0.63, Math.asin(Math.min(0.82 / radius, 1)));
          b.line(
            punti(19, (i) => {
              const angle = (i / 9 - 1) * half;
              return [center + side * radius * Math.cos(angle), 0.78, radius * Math.sin(angle)];
            }),
            c.verde,
          );
        }
      }
      b.ball([sourceAt(time), 0.78, 0], 0.145, c.ocra);
      b.arrow([sourceAt(time), 1.06, 0], [sourceAt(time) + 2.4 * s.moto, 1.06, 0], c.rosso);
      b.rod([receiver, 0.1, 0], [receiver, 0.91, 0], 0.085, c.metallo);
      b.ball([receiver, 0.78, 0], 0.11, c.viola);
      if (s.pressioneRel !== undefined)
        b.arrow([receiver, 1.18, 0.3], [receiver, 1.18 + 0.35 * s.pressioneRel, 0.3], c.viola);
      b.label([sourceAt(time), 1.72, 0], 'Sorgente');
      b.label([receiver, 1.99, 0], 'Ricevitore');
      return;
    }
    const source = -0.48,
      receiver = 2.55;
    for (let j = 1; j <= 4; j++) {
      const r = (s.velocita === undefined ? 0.46 : 0.26 + 0.3 * s.velocita) * j;
      b.ring([source, 0.62, 0], r, 'xz', c.verde);
    }
    if (s.frazioneViaggio !== undefined)
      b.ball([source + (receiver - source) * s.frazioneViaggio, 0.85, 0.15], 0.105, c.viola);
    b.ball([source, 0.62, 0], 0.16, c.ocra);
    b.rod([receiver, 0.1, 0], [receiver, 1.26, 0], 0.08, c.metallo);
    b.label([source, 1.53, 0], 'Sorgente');
    b.label([receiver, 1.6, 0], 'Ricevitore');
  },
  em(b, s) {
    const cyc = s.cicli ?? (s.banda ? 0.5 + s.banda * 0.49 : 1.5),
      phase = s.fase ?? 0,
      A = s.ampiezza;
    const probe = s.campoSonda;
    const val = (u) => A * (u === 0 && probe !== undefined ? probe : Math.sin(phase - 2 * Math.PI * cyc * u));
    const origin = 1.28;
    if (A === 0) {
      b.line([[-2.6, origin, 0], [2.73, origin, 0]], c.metallo);
      b.label([0, origin + 0.5, 0], 'E = 0 · B = 0');
      return;
    }
    b.line(
      punti(111, (i) => [-2.56 + (5.12 * i) / 110, origin + val(i / 110), 0]),
      c.viola,
    );
    // E along +y and B along +z propagate along +x.
    b.line(
      punti(111, (i) => [-2.56 + (5.12 * i) / 110, origin, val(i / 110)]),
      c.verde,
    );
    if (probe !== undefined) {
      const point = [-2.56, origin, 0];
      b.ball(point, 0.07, c.inchiostro);
      b.label([-2.84, origin - 0.33, 0], 'P');
      b.arrow(point, [-2.56, origin + val(0), 0], c.viola);
      b.arrow(point, [-2.56, origin, val(0)], c.verde);
    }
    for (let i = probe === undefined ? 0 : 1; i <= 16; i++) {
      const u = i / 16,
        x = -2.56 + 5.12 * u,
        v = val(u);
      b.line(
        [
          [x, origin, 0],
          [x, origin + v, 0],
        ],
        c.viola,
      );
      b.line(
        [
          [x, origin, 0],
          [x, origin, v],
        ],
        c.verde,
      );
    }
    b.arrow([-2.6, origin, 0], [2.73, origin, 0], c.metallo);
    b.label([-2.12, 2.38, 0], 'E', c.viola);
    b.label([1.65, 1.34, 1.2], 'B', c.verde);
  },
  assorbitore(b, s) {
    const dx = 2.15 * s.spessore;
    if (dx > 0) b.box([dx / 2 - 0.8, 1.15, 0], [dx, 1.65, 1.13], c.viola, 0.32);
    b.box([-2.42, 1.08, 0], [0.31, 0.63, 0.62], c.metallo);
    b.box([2.38, 1.08, 0], [0.18, 1.46, 1.12], c.metallo);
    for (let i = 0; i < 12; i++) {
      const y = 0.81 + (i % 4) * 0.16,
        z = -0.18 + Math.floor(i / 4) * 0.17;
      b.rod([-2.28, y, z], [-0.8, y, z], 0.026, c.ocra);
      if (dx > 0)
        for (let j = 0; j < 4; j++)
          b.rod(
            [-0.8 + (j * dx) / 4, y, z],
            [-0.8 + ((j + 1) * dx) / 4, y, z],
            0.026,
            c.ocra,
            s.trasmessa ** ((j + 0.5) / 4),
          );
      b.rod([dx - 0.8, y, z], [2.26, y, z], 0.026, c.ocra, s.trasmessa);
    }
    b.label([-2.32, 1.72, 0], 'Fascio');
    b.label([2.2, 2.14, 0], 'Rivelatore');
  },
  fotone(b, s) {
    b.ring([0, 1.08, 0], 0.73, 'xz', c.metallo);
    b.ball([0, 1.08, 0], 0.21, c.rosso);
    b.line(
      punti(47, (i) => [-2.52 + (1.68 * i) / 46, 1.08 + 0.12 * Math.sin(i * (0.2 + s.energia)), 0]),
      c.viola,
    );
    const x = 0.73 + (s.ionizzato ? 0.38 + 1.14 * s.uscita : 0);
    b.ball([x, 1.08, 0], 0.11, c.verde);
    if (s.ionizzato) b.arrow([x, 1.36, 0], [x + 0.75 * s.uscita, 1.36, 0], c.verde);
    b.label([0, 2.06, 0], s.ionizzato ? 'Elettrone libero' : 'Elettrone legato');
  },
  nucleo(b, s) {
    if (s.transizione !== undefined) {
      // Count only the nucleons involved. Different schematic transitions do not imply a common parent isotope.
      const k = s.transizione;
      if (k === 1) {
        for (const [x, y, z, col] of [
          [0, 0, 0, c.rosso],
          [0.23, 0, 0, c.verde],
          [0, 0.21, 0, c.verde],
          [0.23, 0.21, 0, c.rosso],
        ])
          b.ball([1.15 + x, 1.04 + y, z], 0.16, col);
      }
      if (k === 2) {
        b.ball([1.28, 1.08, 0], 0.09, c.viola);
        b.line(
          [
            [0, 1.05, 0],
            [1.18, 1.62, 0],
          ],
          c.verde,
          true,
        );
      }
      if (k === 3)
        b.line(
          punti(51, (i) => [i / 28, 1.12 + 0.17 * Math.sin(i * 0.55), 0]),
          c.ocra,
        );
      for (let i = 0; i < 9; i++)
        b.ball(
          [-0.75 + 0.29 * Math.cos(i * 2.4), 1.11 + 0.24 * Math.sin(i * 2.4), 0.13 * ((i % 3) - 1)],
          0.16,
          i % 2 ? c.verde : c.rosso,
        );
      b.label([-0.75, 1.87, 0], 'Nucleo residuo');
      b.label([1.28, 1.9, 0], ['α', 'e⁻ e antineutrino', 'γ'][k - 1]);
      return;
    }
    const total = s.protoni + s.neutroni;
    for (let i = 0; i < total; i++) {
      const a = 2.4 * i,
        z = 1 - (2 * (i + 0.5)) / total,
        R = 0.56 * Math.sqrt(1 - z * z);
      b.ball([R * Math.cos(a), 1.12 + 0.55 * z, R * Math.sin(a)], 0.22, i < s.protoni ? c.rosso : c.verde);
    }
    b.label([-1.35, 1.71, 0], s.protoni + ' protoni', c.rosso);
    b.label([1.35, 1.71, 0], s.neutroni + ' neutroni', c.verde);
  },
  decadimento(b, s) {
    for (let i = 0; i < 64; i++) {
      const x = -1.84 + (i % 8) * 0.52,
        z = -1.28 + Math.floor(i / 8) * 0.35;
      b.ball([x, 0.39, z], 0.109, (i * 37) % 64 < Math.round(s.rimasti) ? c.viola : c.metallo);
    }
    b.label([0, 1.2, 0], 'Viola · nuclei rimasti', c.viola);
  },
  ottica(b, s) {
    const O = [0, 1.27, 0],
      y = O[1];
    if (!s.lente) {
      b.box([0, 0.73, 0], [4.6, 1.05, 0.91], s.riflesso ? c.metallo : c.acqua, s.riflesso ? 0.68 : 0.27);
      const a = rad(s.angolo),
        // Ray length is schematic; keep both complete segments in the medium
        // and above the solid table without changing either optical angle.
        l = 1;
      b.line(
        [
          [0, 0.13, 0],
          [0, 2.93, 0],
        ],
        c.metallo,
        true,
      );
      b.arrow([-l * Math.sin(a), y + l * Math.cos(a), 0], O, c.ocra);
      const r = s.riflesso ? a : rad(s.rifratto);
      b.arrow(O, [l * Math.sin(r), y + (s.riflesso ? 1 : -1) * l * Math.cos(r), 0], c.verde);
      b.label([-1.65, 2.64, 0], 'Incidente', c.ocra);
      b.label([0.43, 2.97, 0], 'Normale');
      return;
    }
    b.line(
      [
        [-2.76, y, 0],
        [2.76, y, 0],
      ],
      c.metallo,
      true,
    );
    const f = s.fuoco === undefined ? 0.9 : s.fuoco * 2.12;
    // Circular cross sections give the lens a biconvex surface of revolution around x.
    for (let i = 0; i < 12; i++) {
      const u = i / 12,
        v = (i + 1) / 12;
      const r = (t) => 0.89 * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
      b.rod([-0.115 + 0.23 * u, y, 0], [-0.115 + 0.23 * v, y, 0], r(u), c.acqua, 0.26, r(v), true);
    }
    for (const k of [-1, 1]) b.ball([k * f, y, 0], 0.055, c.viola);
    b.label([f, y - 0.27, 0], 'F′', c.viola);
    if (s.oggetto === undefined) {
      for (const h of [-0.48, 0, 0.48])
        b.line(
          [
            [-2.52, y + h, 0],
            [0, y + h, 0],
            [f, y, 0],
            [f + 0.48, y - (0.48 * h) / f, 0],
          ],
          c.ocra,
        );
      return;
    }
    const p = s.oggetto * 0.09,
      h = 0.41,
      q = Math.abs(s.vergenza) < 1e-9 ? Infinity : 9 / s.vergenza;
    b.arrow([-p, y, 0], [-p, y + h, 0], c.viola);
    b.label([-p, y + 0.73, 0], 'Oggetto');
    const xmax = Math.min(2.57, (1.07 * p) / h, (1.38 * f) / h);
    b.line(
      [
        [-p, y + h, 0],
        [0, y + h, 0],
        [xmax, y + h - (h * xmax) / f, 0],
      ],
      c.ocra,
    );
    b.line(
      [
        [-p, y + h, 0],
        [0, y, 0],
        [xmax, y - (h * xmax) / p, 0],
      ],
      c.verde,
    );
    if (q < 0) {
      const xmin = Math.max(q, -2.6, (-1.2 * p) / h);
      b.line(
        [
          [0, y + h, 0],
          [xmin, y + h - (h * xmin) / f, 0],
        ],
        c.ocra,
        true,
      );
      b.line(
        [
          [0, y, 0],
          [xmin, y - (h * xmin) / p, 0],
        ],
        c.verde,
        true,
      );
    }
    if (Number.isFinite(q) && Math.abs(q) < 2.64 && Math.abs((h * q) / p) < 1.15)
      b.arrow([q, y, 0], [q, y - (h * q) / p, 0], c.rosso);
  },
};
