import { param, select, chart, curve, n } from '../misure.js';

export const turns = 10,
  area = 0.05,
  resistance = 5;
export const params = [
  param('x', 'Velocità di variazione del campo', 'T/s', -4, 4, 0.5, -2),
  param('middle', 'Campo a metà intervallo', 'T', -2, 2, 0.25, 0),
  select(
    'circuit',
    'Interruttore',
    [
      ['open', 'Circuito aperto'],
      ['closed', 'Circuito chiuso · 5 Ω'],
    ],
    'open',
  ),
];
export function solve({ x, middle = 0, circuit = 'open' }) {
  const emf = -turns * area * x;
  return {
    x,
    y: emf,
    middle,
    duration: 2,
    current: circuit === 'closed' ? emf / resistance : 0,
    closed: circuit === 'closed',
  };
}
export function sample(s, t = 0) {
  const B = s.middle + s.x * (Math.max(0, Math.min(t, s.duration)) - s.duration / 2);
  return { B, flux: turns * area * B, emf: s.y, current: s.current };
}
export const readings = (p, s, t) => {
  const q = sample(s, t);
  return [
    ['Variazione del campo', s.x, 'T/s'],
    ['Fem indotta', q.emf, 'V'],
    ['Campo B', q.B, 'T'],
    ['Flusso concatenato NΦ', q.flux, 'Wb'],
    ['Corrente', q.current, 'A'],
  ];
};
export const graphs = (p, s, t = 0) =>
  [
    ['Campo normale alla spira', 'B (T)', 'B'],
    ['Flusso concatenato', 'NΦ (Wb)', 'flux'],
    ['Tensione indotta', 'ε (V)', 'emf'],
  ].map(([title, unit, key]) => ({
    ...chart(title, 't (s)', unit, [curve(title, 0, s.duration, (x) => sample(s, x)[key])], t),
    track: 'time',
  }));
export const steps = (p, s) => [
  [
    'Osserva il campo',
    'La bobina è ferma. Le frecce cambiano lunghezza e verso mentre il campo attraversa le spire. Il segno è positivo lungo la normale n.',
    'B(t) = B(1 s) + k (t − 1 s)',
  ],
  [
    'Apri e chiudi il circuito',
    'Confronta tensione e corrente nelle due posizioni dell’interruttore. Il campo imposto è uniforme e l’autoinduzione è trascurata.',
    'ε = −N A k = ' + n(s.y) + ' V',
  ],
  [
    'Collega la pendenza alla fem',
    'Ogni spira intercetta lo stesso flusso. Sommali e confronta due istanti sul grafico. La fem ha segno opposto alla pendenza.',
    'NΦ = 10 × 0,05 m² × B',
  ],
  [
    'Segui il verso della corrente',
    'Il verso positivo gira in senso antiorario guardando la spira dalla punta della normale. La corrente del circuito chiuso si oppone alla variazione del flusso.',
    'I = ε/R nel circuito chiuso · I = 0 nel circuito aperto',
  ],
];
