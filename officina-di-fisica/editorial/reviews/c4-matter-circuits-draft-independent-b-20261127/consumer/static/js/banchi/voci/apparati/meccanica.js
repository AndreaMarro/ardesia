import { colore as c, punti, rad } from '../geometria.js';
// Translate a force along its own line of action, retaining the complete signed
// vector at the existing scale while clearing an opaque point marker.
function exposedForce(b, point, delta, color, clearance) {
  const length = Math.hypot(...delta);
  if (length === 0) return;
  const start = point.map((value, index) => value + clearance * delta[index] / length);
  b.arrow(start, start.map((value, index) => value + delta[index]), color);
}
const rail = (b, marks) => {
  for (const z of [-0.27, 0.27]) b.rod([-2.65, 0.22, z], [2.65, 0.22, z], 0.045, c.metallo);
  if (marks) {
    b.box([0, 0.12, 0.76], [5.12, 0.08, 0.42], c.bianco);
    for (const {x, major, label} of marks) {
      b.box([x, 0.17, major ? 0.76 : 0.69], [major ? 0.032 : 0.022, 0.018, major ? 0.39 : 0.23], c.inchiostro);
      if (label) b.label([x, 0.12, 1.02], label);
    }
    return;
  }
  for (let i = 0; i <= 10; i++)
    b.line(
      [
        [-2.5 + 0.5 * i, 0.26, 0.36],
        [-2.5 + 0.5 * i, 0.26, i % 5 ? 0.48 : 0.62],
      ],
      c.inchiostro,
    );
};
function carrello(b, x, cBody, m = 1) {
  b.box([x, 0.52, 0], [0.56, 0.34 * Math.cbrt(m), 0.64], cBody);
  for (const dx of [-0.18, 0.18])
    for (const z of [-0.27, 0.27])
      b.rod([x + dx, 0.32, z - 0.05], [x + dx, 0.32, z + 0.05], 0.1, c.inchiostro);
}
export const meccanica = {
  calibro(b, s) {
    const a = -1.95,
      d = 4 * s.frazione;
    b.box([0, 1.04, 0], [5.2, 0.22, 0.22], c.metallo);
    const ticks = s.scala ? 20 : 50;
    for (let i = 0; i <= ticks; i++) {
      const x = a + (4 * i) / ticks;
      b.line(
        [
          [x, 1.16, 0.13],
          [x, 1.16 + (i % 5 ? 0.06 : 0.15), 0.13],
        ],
        c.inchiostro,
      );
    }
    if (s.scala && s.frazione < 0.06) {
      const zoom = 10 ** Math.max(0, -Math.round(Math.log10(s.frazione)));
      const gap = d * zoom,
        z = 1.14,
        mid = -0.15;
      b.box([mid, 0.45, z], [gap, 0.15, 0.16], c.ocra);
      for (const side of [-1, 1]) {
        b.box([mid + side * (gap / 2 + 0.045), 0.53, z], [0.09, 0.53, 0.22], c.verde);
      }
      b.label([mid, 0.96, z], 'Dettaglio ×' + zoom, c.viola);
    }
    for (const x of [a, a + d]) b.box([x, 0.8, 0], [0.1, 0.72, 0.22], c.verde);
    b.box([a + d, 1.12, 0], [0.32, 0.36, 0.36], c.viola);
    if (d > 0) b.box([a + d / 2, 0.59, 0], [d, 0.16, 0.18], c.ocra);
    b.label([0, 1.68, 0], s.scala ? 'Spessore sulla scala in µm' : 'Apertura fra le ganasce');
  },
  campione(b, s) {
    if (s.numero) {
      for (let i = 0; i < s.numero; i++) b.box([-1.82 + 0.9 * i, 0.48, 0], [0.77, 0.88, 0.77], c.verde);
      b.label([0, 1.66, 0], 'Campioni dello stesso materiale');
      return;
    }
    const lato = 2.05 * s.lato;
    b.box([0, lato / 2 + 0.06, 0], [lato, lato, lato], c.acqua, 0.66);
    const cells = s.celle ?? 1;
    for (let i = 0; i <= cells; i++) {
      const p = -lato / 2 + (i * lato) / cells;
      b.line(
        [
          [p, 0.06, lato / 2],
          [p, lato + 0.06, lato / 2],
          [p, lato + 0.06, -lato / 2],
        ],
        c.verde,
      );
      b.line(
        [
          [-lato / 2, 0.06 + (i * lato) / cells, lato / 2],
          [lato / 2, 0.06 + (i * lato) / cells, lato / 2],
          [lato / 2, 0.06 + (i * lato) / cells, -lato / 2],
        ],
        c.verde,
      );
      b.line(
        [
          [-lato / 2, lato + 0.06, p],
          [lato / 2, lato + 0.06, p],
          [lato / 2, 0.06, p],
        ],
        c.verde,
      );
    }
    b.arrow([-lato / 2, 0.12, lato / 2 + 0.2], [lato / 2, 0.12, lato / 2 + 0.2], c.viola);
    b.label([0, lato + 0.46, 0], 'Volume del campione');
  },
  vettori(b, s) {
    const ox = -0.8,
      oy = 0.28;
    const A = [ox + s.ax, oy, -s.ay],
      B = [ox + (s.bx ?? 0), oy, -(s.by ?? 0)],
      O = [ox, oy, 0];
    b.line(
      [
        [-2.9, oy, 0],
        [2.85, oy, 0],
      ],
      c.metallo,
    );
    b.line(
      [
        [ox, oy, 1.5],
        [ox, oy, -2],
      ],
      c.metallo,
    );
    b.label([2.8, oy + 0.14, 0], 'x');
    b.label([ox, oy + 0.14, -2.2], 'y');
    b.arrow(O, A, c.verde);
    if (s.proietta) {
      b.line([A, [A[0], oy, 0]], c.ocra, true);
      b.line([A, [ox, oy, A[2]]], c.ocra, true);
      b.arrow(O, s.verticale ? [ox, oy, A[2]] : [A[0], oy, 0], c.viola);
    }
    if (s.bx !== undefined) {
      const start = s.somma ? [...A] : O,
        end = s.somma ? [A[0] + s.bx, oy, A[2] - s.by] : B;
      if (s.somma) {
        start[1] += 0.12;
        end[1] += 0.12;
      }
      b.arrow(start, end, c.ocra);
      if (s.somma) b.arrow([ox, oy + 0.42, 0], [end[0], oy + 0.42, end[2]], c.viola);
      if (s.croce) {
        b.arrow(O, [ox, oy + 1.55 * s.by, 0], c.viola);
      }
      if (s.prodotto) b.line([B, [B[0], oy, 0]], c.viola, true);
    }
  },
  binario(b, s) {
    const at = (x) => -2.38 + (4.76 * (x - s.min)) / (s.max - s.min);
    rail(b, s.marks?.map(mark => ({...mark, x: at(mark.value)})));
    const x = at(s.pos),
      old = at(s.inizio);
    b.rod([old, 0.06, 0.65], [old, 0.65, 0.65], 0.026, c.ocra);
    carrello(b, x, c.verde);
    b.arrow([x, 0.95, 0], [x + (s.freccia ?? 0) * 0.65, 0.95, 0], c.viola);
    if (s.startLabel) b.label([old, 0.85, 0.72], s.startLabel, s.marks ? c.inchiostro : c.ocra);
    if (s.turn !== undefined) {
      b.arrow([old, 0.12, -1.15], [at(s.turn), 0.12, -1.15], c.verde);
      b.arrow([at(s.turn), 0.12, -0.67], [x, 0.12, -0.67], c.viola);
    }
    b.label([x, 1.45, -0.12], 'Carrello', c.verde);
  },
  volo(b, s) {
    const T = (2 * s.vy) / s.g,
      gain = 0.32;
    const at = (t) => [-2.2 + gain * s.vx * t, 0.17 + gain * (s.vy * t - (s.g * t * t) / 2), 0];
    b.line(
      punti(49, (i) => at((T * i) / 48)),
      c.verde,
    );
    const p = at(s.t);
    b.ball(p, 0.12, c.ocra);
    b.line([p, [p[0], 0.12, 0]], c.viola, true);
    b.arrow([-2.2, 0.1, 0.32], [at(T)[0], 0.1, 0.32], c.viola);
    b.label([p[0], p[1] + 0.4, 0], 'Pallina');
    b.label([-2.2, 0.42, 0.65], 'Via');
  },
  caduta(b, s) {
    const y = 0.3 + 2.05 * s.altezza;
    b.rod([-0.75, 0.07, 0], [-0.75, 2.8, 0], 0.055, c.metallo);
    for (let i = 0; i <= 10; i++)
      b.line(
        [
          [-0.75, 0.3 + 0.205 * i, 0],
          [-0.75 + (i % 5 ? 0.14 : 0.29), 0.3 + 0.205 * i, 0],
        ],
        c.inchiostro,
      );
    b.ball([0, y, 0], 0.19, c.ocra);
    if (s.filo) {
      b.rod([-0.75, 2.8, 0], [0, 2.8, 0], 0.045, c.metallo);
      b.line(
        [
          [0, y, 0],
          [0, 2.8, 0],
        ],
        c.inchiostro,
      );
      // tensione is T / 30 N; use the same 0.42 scene units per 20 N as weight.
      b.arrow([0.25, y, 0], [0.25, y + 0.42 * (30 / 20) * s.tensione, 0], c.verde);
    }
    // The complete constant weight keeps its original vertical display axis
    // and scale, above the body even at first contact with the base.
    b.arrow([0, y + 0.64, 0.25], [0, y + 0.22, 0.25], c.rosso);
  },
  cerchio(b, s) {
    const r = s.r,
      y = 0.32;
    b.ring([0, y, 0], r, 'xz', c.verde);
    b.rod([0, 0.07, 0], [0, y + 0.12, 0], 0.06, c.metallo);
    const angle = s.angoloOrbita ?? 0;
    const cos = Math.cos(angle),
      sin = Math.sin(angle);
    const x = r * cos,
      z = -r * sin;
    b.line(
      [
        [0, y, 0],
        [x, y, z],
      ],
      c.metallo,
      true,
    );
    b.ball([x, y, z], 0.14, c.ocra);
    // Velocity and acceleration are drawn in a parallel plane: the entire
    // cone radius clears the opaque marker, with each vector delta unchanged.
    const arrowY = y + 0.25;
    b.arrow([x, arrowY, z], [x - s.tangente * sin, arrowY, z - s.tangente * cos], c.verde);
    b.arrow([x, arrowY, z], [x - s.radiale * cos, arrowY, z + s.radiale * sin], c.viola);
  },
  forze(b, s) {
    b.box([0, 0.55, 0], [1.3, 0.9, 0.9], c.ocra);
    b.arrow([0, 0.55, 0.56], [1.14 * s.destra, 0.55, 0.56], c.verde);
    b.arrow([0, 0.55, 0.56], [-1.14 * (s.sinistra ?? 0), 0.55, 0.56], c.rosso);
    if (s.acc !== undefined) b.arrow([0, 1.55, 0], [s.acc, 1.55, 0], c.viola);
    b.label([0, 2.0, 0], s.acc !== undefined ? 'Spinta e accelerazione' : 'Forze sul blocco');
  },
  coppia(b, s) {
    rail(b);
    carrello(b, -0.34, c.viola);
    carrello(b, 0.34, c.verde);
    b.arrow([-0.34, 0.8, 0], [-0.34 - s.intensita, 0.8, 0], c.viola);
    b.arrow([0.34, 0.8, 0], [0.34 + s.intensita, 0.8, 0], c.verde);
    b.label([-0.6, 1.28, 0], 'A');
    b.label([0.6, 1.28, 0], 'B');
  },
  piano(b, s) {
    const a = rad(s.angolo),
      dir = [Math.cos(a), Math.sin(a)],
      L = 2.5;
    const at = (u, h, z) => [-0.95 + u * dir[0] - h * dir[1], 0.18 + u * dir[1] + h * dir[0], z];
    for (const z of [-0.49, 0.49]) b.rod(at(0, 0, z), at(L, 0, z), 0.055, c.metallo);
    for (const u of [0, 0.55, 1.1, 1.65, 2.2, 2.5]) b.rod(at(u, 0, -0.49), at(u, 0, 0.49), 0.04, c.metallo);
    const p = at(1.3, 0.22, 0);
    b.ball(p, 0.22, c.ocra);
    // peso and normale are normalized to the same 20 N reference.
    const normalLength = 0.75 * s.normale;
    const normalTop = (0.25 + normalLength) * dir[0];
    // Separate the two full vectors along their own lines of action. The
    // weight ends above the normal, clearing both the table and its opposite
    // arrow at zero angle; the normal starts outside the opaque sphere.
    const weightEnd = p[1] + normalTop + 0.18;
    b.arrow([p[0], weightEnd + 0.75 * s.peso, p[2]], [p[0], weightEnd, p[2]], c.rosso);
    exposedForce(b, p, [-normalLength * dir[1], normalLength * dir[0], 0], c.verde, 0.25);
  },
  molla(b, s) {
    const vert = s.verticale,
      start = vert ? [0, 0.1, 0] : [-2.1, 1, 0],
      len = 1.5 + 1.05 * s.estensione;
    const at = (u, a = 0, r = 0) =>
      vert
        ? [r * Math.cos(a), start[1] + len * u, r * Math.sin(a)]
        : [start[0] + len * u, 1 + r * Math.cos(a), r * Math.sin(a)];
    b.box(start, vert ? [1.2, 0.12, 0.8] : [0.15, 1.7, 0.7], c.metallo);
    b.line(
      punti(145, (i) => at(i / 144, (Math.PI * i) / 9, 0.19)),
      c.viola,
    );
    const p = at(1);
    b.ball(p, 0.25, c.ocra);
    if (s.forza !== undefined) exposedForce(b, p, [0.8 * s.forza, 0, 0], c.verde, 0.3);
  },
  gravita(b, s) {
    const d = 2.4 * s.distanza;
    b.ball([-d, 1, 0], 0.27, c.viola);
    b.ball([d, 1, 0], 0.27, c.ocra);
    b.line(
      [
        [-d, 1, 0],
        [d, 1, 0],
      ],
      c.metallo,
      true,
    );
    for (const k of [-1, 1]) b.arrow([k * d, 1.36, 0], [k * (d - 0.85 * s.forza), 1.36, 0], c.verde);
    b.label([0, 1.95, 0], 'Distanza fra i centri');
  },
  percorso(b, s) {
    const amp = (1.55 * Math.sqrt(s.lunghezza ** 2 - 1)) / 4;
    const path = punti(5, (i) => [-0.775 + (1.55 * i) / 4, 0.28, (i % 2 ? amp : 0) - amp / 2]);
    b.line(path, c.viola);
    b.line([path[0], path[4]], c.verde, true);
    b.ball(path[0], 0.08, c.verde);
    b.ball(path[4], 0.08, c.ocra);
    b.label([0, 1.12, 0], 'Due estremi alla stessa quota');
  },
  urto(b, s) {
    rail(b);
    const k = s.unita ?? 1,
      off = s.centro === undefined ? 0 : -0.9;
    for (const [x, color, v, m] of [
      [s.a, c.viola, s.va, 1],
      [s.b, c.verde, s.vb, s.massaB ?? 1],
    ]) {
      if (x === undefined) continue;
      carrello(b, off + k * x, color, m);
      if (v !== undefined) b.arrow([off + k * x, 0.91, 0], [off + k * x + v, 0.91, 0], color);
    }
    if (s.centro !== undefined) {
      const x = off + k * s.centro;
      b.ball([x, 1.05, 0], 0.09, c.ocra);
      b.label([x, 1.5, 0], 'Centro di massa');
    }
  },
  leva(b, s) {
    const a = rad(s.angolo ?? 0),
      pivot = [-0.4, 1.25, 0],
      at = (d) => [pivot[0] + d * Math.cos(a), pivot[1] + d * Math.sin(a), 0];
    // The post sits behind the swept plane of the rod. Its short rear axle
    // reaches the same pivot without enclosing the lower endpoint at 90°.
    const rear = [pivot[0], pivot[1], -0.45];
    b.rod([pivot[0], 0.08, rear[2]], rear, 0.13, c.metallo);
    b.rod(rear, pivot, 0.07, c.metallo);
    b.ball(pivot, 0.16, c.viola);
    const l = s.braccio ? s.sx : -s.sx,
      r = s.dx,
      ends = [at(s.braccio ? 0 : l), at(r)];
    b.rod(...ends, 0.07, c.ocra);
    for (const [u, F] of [
      [l, s.fs],
      [r, s.fd],
    ]) {
      const p = at(u);
      b.ball(p, 0.11, c.verde);
      if (F) {
        const dy = (s.braccio && u === l ? 1 : -1) * F;
        // Put both signs above the point marker: a downward force ends just
        // above it, so the unchanged full vector cannot penetrate the table.
        const tail = [p[0], p[1] + 0.18 + Math.max(0, -dy), p[2]];
        b.arrow(tail, [tail[0], tail[1] + dy, tail[2]], s.braccio && u === l ? c.verde : c.rosso);
      }
    }
    // Identify the pivot in the existing HTML legend. A minimum-size 3D text
    // sprite can cover the lower rod endpoint on a narrow viewport.
  },
};
