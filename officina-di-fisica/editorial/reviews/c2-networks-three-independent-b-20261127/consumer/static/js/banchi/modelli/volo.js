import { g, rad, n, param, curve, chart } from '../misure.js';
export const params = [
  param('speed', 'Velocità iniziale v₀', 'm/s', 1, 6, 0.25, 4),
  param('elevation', 'Elevazione α', '°', 0, 90, 1, 50),
  param('azimuth', 'Direzione orizzontale β', '°', -75, 75, 5, 15),
];
export function solve(p) {
  const horizontal = p.elevation === 90 ? 0 : p.speed * Math.cos(rad(p.elevation)),
    u = p.speed * Math.sin(rad(p.elevation)),
    duration = (2 * u) / g;
  return {
    vx: horizontal * Math.cos(rad(p.azimuth)),
    vz: horizontal * Math.sin(rad(p.azimuth)),
    u,
    duration,
    range: horizontal * duration,
    peak: (u * u) / (2 * g),
  };
}
export function sample(s, time) {
  const t = Math.max(0, Math.min(time, s.duration));
  return { x: s.vx * t, y: Math.max(0, s.u * t - (g * t * t) / 2), z: s.vz * t, vy: s.u - g * t };
}
export const readings = (p, s, t) => [
  ['Tempo t', t, 's'],
  ['Quota y', sample(s, t).y, 'm'],
  ['Velocità verticale', sample(s, t).vy, 'm/s'],
  ['x · z', n(s.vx * t) + ' · ' + n(s.vz * t), 'm'],
  ['vₓ · v𝓏', n(s.vx) + ' · ' + n(s.vz), 'm/s'],
  ['Accelerazione verticale', -g, 'm/s²'],
];
export const steps = (p, s) => [
  [
    'Isola il moto orizzontale',
    'Lascia la pallina alla quota di riferimento e raccoglila alla stessa quota. Trascuriamo l’aria. Vista dall’alto, segue una retta. L’azimut β ruota questa retta sul pavimento.',
    'vh = v₀ cos α · vx = vh cos β = ' + n(s.vx) + ' m/s · vz = vh sen β = ' + n(s.vz) + ' m/s',
  ],
  [
    'Segui il moto verticale',
    'Scorri il tempo. La pallina sale, si ferma verticalmente per un istante e scende. L’accelerazione di gravità rimane diretta verso il basso su entrambi i tratti.',
    'uy = v₀ sen α = ' + n(s.u) + ' m/s · vy(t) = uy − gt · y(t) = uy t − gt²/2',
  ],
  [
    'Ricomponi la traiettoria',
    'A ogni istante prendi x, y e z delle tre componenti. Il punto nello spazio e le tacche sui grafici corrispondono allo stesso tempo. Al culmine vy = 0.',
    'x = vx t · z = vz t · tculmine = uy/g = ' + n(s.u / g) + ' s · hmax = uy²/(2g) = ' + n(s.peak) + ' m',
  ],
  [
    'Controlla il ritorno',
    'Poni y = 0. Raccogli t e scegli la radice di ritorno. Puoi ricavare la velocità verticale iniziale dal tempo totale. Il tempo di salita è metà del volo.',
    't(uy − gt/2) = 0 · T = 2uy/g = ' +
      n(s.duration) +
      ' s · uy = gT/2 · gittata = vh T = ' +
      n(s.range) +
      ' m',
  ],
];
export const graphs = (p, s, t, stage) => {
  const hi = s.duration || 0.01;
  return [
    chart(
      'Coordinate della pallina',
      't (s)',
      'posizione (m)',
      [['x', 'x'], ['z', 'z'], ...(stage >= 1 ? [['y', 'y']] : [])].map(([name, key]) =>
        curve(name, 0, hi, (time) => sample(s, time)[key]),
      ),
      t,
    ),
    chart(
      'Componenti della velocità',
      't (s)',
      'velocità (m/s)',
      [
        curve('vx', 0, hi, () => s.vx),
        curve('vz', 0, hi, () => s.vz),
        ...(stage >= 1 ? [curve('vy', 0, hi, (time) => sample(s, time).vy)] : []),
      ],
      t,
    ),
  ];
};
export const warning = (p, s) => s.duration === 0
  ? 'Il lancio parte e termina alla quota del banco. Con elevazione 0° il tempo di volo in questo modello è zero.'
  : '';
