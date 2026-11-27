import { n, param, norm, sub, mul, sum, chart, curve } from '../misure.js';
const coordinates = (id, label, point) =>
  ['x', 'y', 'z'].map((key, i) => param(id + key, label + ' · ' + key, 'm', -2, 2, 0.25, point[i]));
export const params = [
  param('q1', 'Carica q₁', 'nC', -4, 4, 0.5, 2),
  param('q2', 'Carica q₂', 'nC', -4, 4, 0.5, 2),
  ...coordinates('s', 'Sonda', [0, 0, 0]),
  ...coordinates('a', 'Sorgente 1', [-1, 0, 0]),
  ...coordinates('b', 'Sorgente 2', [1, 0, 0]),
];
const xyz = (p, id) => ['x', 'y', 'z'].map((k) => p[id + k]);
export function field(sources, point) {
  let E = [0, 0, 0],
    V = 0;
  const contributions = [];
  for (const { pos, q } of sources) {
    const d = sub(point, pos),
      r = norm(d);
    if (q && r < 1e-9) return null;
    const part = q ? mul(d, (9 * q) / r ** 3) : [0, 0, 0];
    contributions.push(part);
    E = sum(E, part);
    if (q) V += (9 * q) / r;
  }
  return { E, V, magnitude: norm(E), contributions };
}
export function solve(p) {
  const sources = [
      { pos: xyz(p, 'a'), q: p.q1 },
      { pos: xyz(p, 'b'), q: p.q2 },
    ],
    probe = xyz(p, 's');
  return { sources, probe, reading: field(sources, probe) };
}
export const readings = (p, s) => [
  ['Intensità |E|', s.reading?.magnitude, 'N/C'],
  ['Potenziale V', s.reading?.V, 'V'],
  ['Componente Ex', s.reading?.E[0], 'N/C'],
];
export const warning = (p, s) =>
  s.reading
    ? ''
    : 'La sonda coincide con una carica puntiforme. Campo e potenziale sono indefiniti in quel punto. Sposta la sonda.';
export const steps = (p, s) => [
  [
    'Posiziona le sorgenti',
    'Le coordinate sono in metri. Secondo la legge di Coulomb, nel vuoto una carica positiva genera campo uscente, una negativa entrante. Con q = 0 togli la sorgente. Il campo è la forza per coulomb su una piccola carica positiva.',
    'Eᵢ = k qᵢ (r − rᵢ)/|r − rᵢ|³ · k ≈ 9 × 10⁹ N·m²/C²',
  ],
  [
    'Somma le frecce',
    'Alla sonda sovrapponi i due contributi componente per componente. I segni sono già nei vettori. La freccia verde mostra la risultante con una scala comune ai contributi.',
    s.reading
      ? 'E₁ = (' +
        s.reading.contributions[0].map(n).join(' / ') +
        ') · E₂ = (' +
        s.reading.contributions[1].map(n).join(' / ') +
        ') · E = (' +
        s.reading.E.map(n).join(' / ') +
        ') N/C'
      : 'E indefinito presso la carica',
  ],
  [
    'Distingui linee e superfici',
    'Le piccole frecce sulle curve indicano la direzione locale del campo. La loro lunghezza è convenzionale. La superficie traslucida campiona il potenziale della sonda con riferimento zero all’infinito. Muovendoti su di essa V resta costante. La griglia spaziale rende approssimato il suo contorno.',
    'V = kq₁/r₁ + kq₂/r₂ = ' + n(s.reading?.V) + ' V · E = −grad V',
  ],
  [
    'Verifica con una carica',
    'Spegni la seconda sorgente e raddoppia la distanza dalla prima. Il campo scende a un quarto, il potenziale a metà. Puoi ricavare la distanza dal modulo del campo di una sola carica.',
    '|E| = k|q|/r² ⇒ r = √(k|q|/|E|)',
  ],
];
export const graphs = (p, s) => [
  chart(
    'Potenziale lungo x alla quota della sonda',
    'x (m)',
    'V (V)',
    [curve('Potenziale', -2, 2, (x) => field(s.sources, [x, p.sy, p.sz])?.V ?? NaN, 64)],
    p.sx,
  ),
];
