import { g, rad, n, param, curve, chart } from '../misure.js';
export const params = [
  param('m', 'Massa m', 'kg', 0.5, 5, 0.5, 2),
  param('angle', 'Inclinazione θ', '°', 0, 55, 1, 18),
  param('ms', 'Attrito statico μs', '', 0, 1, 0.05, 0.4),
  param('mk', 'Attrito dinamico μd', '', 0, 1, 0.05, 0.25),
  param('F', 'Forza verso monte F', 'N', -25, 25, 1, 0),
];
export function solve(p) {
  const theta = rad(p.angle),
    weight = p.m * g,
    normal = weight * Math.cos(theta),
    parallel = -weight * Math.sin(theta);
  const drive = p.F + parallel,
    limit = p.ms * normal;
  const rest = Math.abs(drive) <= limit + 1e-12,
    friction = rest ? -drive : -Math.sign(drive) * p.mk * normal;
  const a = (drive + friction) / p.m;
  return {
    theta,
    weight,
    normal,
    parallel,
    drive,
    limit,
    rest,
    friction,
    a,
    duration: rest ? 0 : Math.sqrt((2 * 0.8) / Math.abs(a)),
  };
}
export const readings = (p, s) => [
  ['Normale N', s.normal, 'N'],
  ['Attrito', s.friction, 'N'],
  ['Accelerazione a', s.a, 'm/s²'],
];
export const steps = (p, s) => [
  [
    'Scegli gli assi del blocco',
    'Il blocco parte fermo al centro della guida. Guarda il piano di lato. Il verso positivo sale lungo la guida. Il peso punta verticalmente verso terra. Il piano spinge verso l’esterno con la normale.',
    'P = mg = ' + n(s.weight) + ' N',
  ],
  [
    'Proietta e confronta',
    'Il cateto lungo il piano è opposto all’angolo θ. La forza applicata agisce lungo il piano. Se il contatto può compensare la loro somma, il blocco resta fermo.',
    'P∥ = −mg sen θ = ' + n(s.parallel) + ' N · P⊥ = −mg cos θ = ' + n(-s.normal) + ' N · N = −P⊥',
  ],
  [
    'Decidi se parte',
    'Confronta |F + P∥| = ' +
      n(Math.abs(s.drive)) +
      ' N con μsN = ' +
      n(s.limit) +
      ' N. ' +
      (s.rest
        ? 'Il contatto regge. L’attrito statico compensa la spinta residua.'
        : 'La soglia è superata. L’attrito dinamico si oppone al verso di partenza.') +
      ' La misura termina dopo uno spostamento di 0,8 m.',
    'f = ' + n(s.friction) + ' N · a = (F + P∥ + f)/m = ' + n(s.a) + ' m/s²',
  ],
  [
    'Ricostruisci la trazione',
    'Inverti la seconda legge lungo il piano. Il segno positivo indica monte. Controlla sul piano orizzontale senza trazione: sia la componente parallela sia l’accelerazione diventano nulle.',
    'F = ma − P∥ − f = ' + n(p.m * s.a - s.parallel - s.friction) + ' N',
  ],
];
export const graphs = (p, s) => [
  chart(
    'Soglia del contatto',
    'θ (°)',
    'forza (N)',
    [
      curve('Spinta da equilibrare', 0, 55, (x) => Math.abs(p.F - p.m * g * Math.sin(rad(x)))),
      curve('Attrito statico massimo', 0, 55, (x) => p.ms * p.m * g * Math.cos(rad(x))),
    ],
    p.angle,
  ),
];
