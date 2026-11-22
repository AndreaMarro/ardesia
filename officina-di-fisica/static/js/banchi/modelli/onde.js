import { n, param, rad, chart, curve } from '../misure.js';
export const speed = 0.6,
  amp = 0.002;
export const params = [
  param('f', 'Frequenza f', 'Hz', 0.5, 2, 0.1, 1),
  param('d', 'Distanza tra le sorgenti d', 'm', 0.2, 1.6, 0.1, 0.8),
  param('phase', 'Fase iniziale di S₂', '°', -180, 180, 15, 0),
  param('x', 'Sonda · x', 'm', -1.2, 1.2, 0.05, 0.25),
  param('z', 'Sonda · z', 'm', -0.8, 0.8, 0.05, 0.5),
];
export function coefficients(s, x, z) {
  const r1 = Math.hypot(x + s.d / 2, z),
    r2 = Math.hypot(x - s.d / 2, z),
    a = s.k * r1,
    b = s.k * r2 + s.phi;
  const c = Math.cos(a) + Math.cos(b),
    sine = Math.sin(a) + Math.sin(b);
  // At an exact node both unit phasors cancel, up to the roundoff of sin and cos.
  const node = Math.hypot(c, sine) < 16 * Number.EPSILON;
  return { r1, r2, delta: b - a, c: node ? 0 : c, s: node ? 0 : sine };
}
export function displacement(s, c, t) {
  return amp * (c.c * Math.cos(s.omega * t) + c.s * Math.sin(s.omega * t));
}
export function solve(p) {
  const lambda = speed / p.f,
    s = {
      d: p.d,
      lambda,
      k: (2 * Math.PI) / lambda,
      omega: 2 * Math.PI * p.f,
      phi: rad(p.phase),
      duration: 2 / p.f,
    };
  const probe = coefficients(s, p.x, p.z),
    envelope = amp * Math.hypot(probe.c, probe.s);
  return { ...s, probe, envelope };
}
export const readings = (p, s, t) => [
  ['Differenza r₂ − r₁', s.probe.r2 - s.probe.r1, 'm'],
  ['Ampiezza alla sonda', 1000 * s.envelope, 'mm'],
  ['Spostamento istantaneo', 1000 * displacement(s, s.probe, t), 'mm'],
];
export const steps = (p, s) => [
  [
    'Trova i cammini',
    'Due sorgenti coerenti sul piano hanno uguale frequenza e ampiezza A = 2 mm. Il modello somma due onde a fronti circolari, a velocità c = 0,6 m/s e ampiezza costante nella zona osservata. L’altezza è ingrandita.',
    'λ = c/f = ' + n(s.lambda) + ' m · r₁ = ' + n(s.probe.r1) + ' m · r₂ = ' + n(s.probe.r2) + ' m',
  ],
  [
    'Trasforma distanza in fase',
    'Nella vista dall’alto le curve ocra e viola seguono le creste di ciascuna sorgente. Ogni lunghezza d’onda in più aggiunge un giro completo di fase. Alla differenza di cammino aggiungi lo sfasamento impostato sulla seconda sorgente.',
    'Δφ = 2π(r₂ − r₁)/λ + φ₂ = ' + n(s.probe.delta) + ' rad',
  ],
  [
    'Sovrapponi gli spostamenti',
    'Segui creste e valli. Il punto della sonda oscilla verticalmente. La sua ampiezza è il massimo scostamento durante un periodo. L’ampiezza risultante va da zero a 4 mm.',
    'y = A cos(kr₁ − ωt) + A cos(kr₂ − ωt + φ₂) · Aris = 2A |cos(Δφ/2)| = ' + n(s.envelope * 1000) + ' mm',
  ],
  [
    'Prova il punto medio',
    'Metti x = 0. I due cammini diventano uguali. Con fase 0° il punto oscilla con ampiezza doppia. Con 180° rimane un nodo a ogni istante. Inverti λ = c/f per ricavare la frequenza.',
    'f = c/λ = ' + n(p.f) + ' Hz · massimi: Δφ = 2πm · nodi: Δφ = (2m + 1)π',
  ],
];
export const graphs = (p, s, t) => [
  chart(
    'Oscillazione alla sonda',
    't (s)',
    'y (mm)',
    [
      curve('Somma', 0, s.duration, (x) => 1000 * displacement(s, s.probe, x)),
      curve('Sorgente 1', 0, s.duration, (x) => 1000 * amp * Math.cos(s.k * s.probe.r1 - s.omega * x)),
      curve(
        'Sorgente 2',
        0,
        s.duration,
        (x) => 1000 * amp * Math.cos(s.k * s.probe.r2 + s.phi - s.omega * x),
      ),
    ],
    t,
  ),
];
