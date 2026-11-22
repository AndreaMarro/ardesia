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
