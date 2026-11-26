import { models } from '../../models.js';
import { n, param, select, chart, curve } from '../misure.js';
export const params = [
  select(
    'mode',
    'Collegamento',
    [
      ['Serie', 'Serie'],
      ['Parallelo', 'Parallelo'],
    ],
    'Parallelo',
  ),
  param('U', 'Tensione del generatore U', 'V', 0, 12, 0.5, 6),
  param('R1', 'Resistore R₁', 'Ω', 1, 20, 1, 6),
  param('R2', 'Resistore R₂', 'Ω', 1, 20, 1, 3),
];
export function solve(p) {
  const s = models.C4(p);
  return { ...s, P1: s.I1 * s.V1, P2: s.I2 * s.V2 };
}
export const readings = (p, s) => [
  ['Corrente totale', s.I, 'A'],
  ['R₁ · ' + n(s.V1) + ' V · ' + n(s.P1) + ' W', s.I1, 'A'],
  ['R₂ · ' + n(s.V2) + ' V · ' + n(s.P2) + ' W', s.I2, 'A'],
];
export const steps = (p, s) => [
  [
    'Ricostruisci la connessione',
    p.mode === 'Serie'
      ? 'Segui il percorso dal polo positivo della pila attraverso R₁ e R₂ fino al polo negativo. La stessa corrente attraversa i due elementi.'
      : 'Segui i conduttori collegati al polo positivo. Le estremità sinistre di entrambi i resistori condividono il nodo A. Le destre condividono il nodo B.',
    'R₁ = ' + n(p.R1) + ' Ω · R₂ = ' + n(p.R2) + ' Ω',
  ],
  [
    'Applica la legge di Ohm',
    p.mode === 'Serie'
      ? 'La tensione si ripartisce fra i resistori. Le due cadute sommate restituiscono U.'
      : 'La pila fissa la stessa tensione ai capi di ogni ramo. La corrente totale è la somma delle correnti dei rami.',
    (p.mode === 'Serie' ? 'Req = R₁ + R₂' : 'Req = R₁R₂/(R₁ + R₂)') +
      ' = ' +
      n(s.R) +
      ' Ω · I = U/Req = ' +
      n(s.I) +
      ' A',
  ],
  [
    'Bilancia potenza e corrente',
    'Le frecce seguono la corrente convenzionale nel circuito esterno, dal + al −. Nei fili metallici la deriva degli elettroni ha verso opposto. La geometria rappresenta collegamenti ideali.',
    'P₁ = U₁I₁ = ' + n(s.P1) + ' W · P₂ = U₂I₂ = ' + n(s.P2) + ' W · UI = ' + n(s.P) + ' W',
  ],
  [
    'Ricava una resistenza',
    'Alimenta il ramo e dividi la sua caduta di tensione per la sua corrente. A generatore spento entrambe si annullano e il loro rapporto non è misurabile.',
    s.I1 ? 'R₁ = U₁/I₁ = ' + n(s.V1) + '/' + n(s.I1) + ' = ' + n(p.R1) + ' Ω' : 'U = 0 V · I₁ = I₂ = 0 A',
  ],
];
export const graphs = (p, s) => [
  chart(
    'Risposta alla tensione della pila',
    'U (V)',
    'I (A)',
    [
      curve('Generatore', 0, 12, (U) => U / s.R),
      curve('Ramo R₁', 0, 12, (U) => (p.mode === 'Serie' ? U / s.R : U / p.R1)),
      curve('Ramo R₂', 0, 12, (U) => (p.mode === 'Serie' ? U / s.R : U / p.R2)),
    ],
    p.U,
  ),
];
