import { n, param, select, chart, curve } from '../misure.js';
export const params = [
  select(
    'mode',
    'Regolazione della pompa',
    [
      ['pressure', 'Pressione fissata'],
      ['flow', 'Portata fissata'],
    ],
    'pressure',
  ),
  param('r', 'Raggio interno R', 'mm', 0.5, 4, 0.1, 1.5),
  param('mu', 'Viscosità μ', 'mPa·s', 1, 12, 0.5, 4),
  param('length', 'Lunghezza L', 'cm', 5, 50, 1, 20),
  { ...param('dp', 'Caduta di pressione Δp', 'Pa', 5, 500, 5, 80), when: ['mode', 'pressure'] },
  { ...param('flow', 'Portata imposta Q', 'mL/s', 0.1, 12, 0.1, 1), when: ['mode', 'flow'] },
];
export const velocity = (s, ratio) => 2 * s.mean * (1 - ratio * ratio);
export function solve(p) {
  const R = p.r / 1000,
    L = p.length / 100,
    mu = p.mu / 1000,
    resistance = (8 * mu * L) / (Math.PI * R ** 4);
  const Q = p.mode === 'flow' ? p.flow / 1e6 : p.dp / resistance,
    dp = resistance * Q,
    mean = Q / (Math.PI * R * R);
  const re = (1000 * mean * 2 * R) / mu,
    entry = 0.05 * re * 2 * R;
  return { R, L, Q, dp, mean, re, entry, resistance, laminar: re < 2300, duration: re < 2300 ? L / mean : 0 };
}
export const readings = (p, s) => [
  ['Portata del modello', 1e6 * s.Q, 'mL/s'],
  ['Caduta Δp', s.dp, 'Pa'],
  ['Reynolds', s.re, ''],
];
export const steps = (p, s) => [
  [
    'Guarda una sezione',
    'Le scale radiale e assiale del disegno sono distinte. La distanza percorsa dai punti è espressa come frazione della lunghezza del tubo. La pompa spinge un fluido newtoniano incomprimibile di densità 1000 kg/m³. Il tubo è rigido e diritto.',
    'R = ' + n(s.R) + ' m · L = ' + n(s.L) + ' m · μ = ' + n(p.mu / 1000) + ' Pa·s',
  ],
  [
    'Leggi le velocità',
    'In regime laminare sviluppato il fluido aderisce alla parete. Il centro avanza a velocità doppia della media. I traccianti ripetono il percorso nel tubo alla velocità locale.',
    'v(r) = 2 vmedia [1 − (r/R)²] · vmedia = Q/(πR²) = ' + n(s.mean) + ' m/s',
  ],
  [
    'Cambia la regolazione',
    'Sommando le velocità pesate per le aree di tutti gli anelli della sezione si ottiene la legge di Poiseuille. A pressione fissata raddoppiare R moltiplica Q per 16. A portata fissata la caduta necessaria si divide per 16.',
    'Q = πR⁴Δp/(8μL) = ' + n(s.Q * 1e6) + ' mL/s · Δp = 8μLQ/(πR⁴) = ' + n(s.dp) + ' Pa',
  ],
  [
    'Controlla il regime',
    'Re = ρ vmedia (2R)/μ. Il profilo presuppone un ingresso già sviluppato. Partendo da un ingresso uniforme servirebbe un tratto di circa ' +
      n(s.entry * 100) +
      ' cm. La soglia Re ≈ 2300 è indicativa.',
    'Re = ' +
      n(s.re) +
      ' · ' +
      (s.laminar ? 'regime laminare compatibile' : 'transizione o turbolenza: stima laminare fuori dominio'),
  ],
];
export const graphs = (p, s) =>
  s.laminar
    ? [
        chart(
          'Taglio lungo il diametro',
          'r (mm)',
          'v (m/s)',
          [curve('Velocità assiale', -p.r, p.r, (r) => velocity(s, r / p.r))],
          0,
        ),
      ]
    : [];
export const warning = (p, s) =>
  s.laminar
    ? ''
    : 'Fuori dal regime laminare. Le letture sono un’estrapolazione della formula. Il banco sospende profilo e traccianti.';
