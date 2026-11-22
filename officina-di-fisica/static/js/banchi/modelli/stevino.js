import { g, n, param, chart, curve } from '../misure.js';
export const params = [
  param('h', 'Profondità della sonda h', 'm', 0, 2, 0.05, 1.2),
  param('rho', 'Densità ρ', 'kg/m³', 600, 1400, 25, 1000),
  param('p0', 'Pressione superficiale p₀', 'kPa', 60, 130, 1, 100),
];
export function solve(p) {
  const relative = (p.rho * g * p.h) / 1000;
  return { relative, absolute: p.p0 + relative, bottom: p.p0 + (p.rho * g * 2) / 1000 };
}
export const readings = (p, s) => [
  ['Sonda A', s.absolute, 'kPa'],
  ['Sonda B, stessa quota', s.absolute, 'kPa'],
  ['Fondo, h = 2 m', s.bottom, 'kPa'],
];
export const steps = (p, s) => [
  [
    'Misura dalla superficie',
    'Il pelo libero è lo zero del profondimetro. Scendi con la sonda A nel liquido omogeneo in quiete. B si trova alla stessa profondità su una parete diversa.',
    'h = ' + n(p.h) + ' m · ρ = ' + n(p.rho) + ' kg/m³ · g = 9,81 m/s²',
  ],
  [
    'Pesa la colonna',
    'Immagina una colonna di sezione A sopra la sonda. Il volume è Ah, la massa ρAh. Dividi il peso per la sezione: A si semplifica. È l’aumento rispetto alla superficie.',
    'Δp = ρAhg/A = ρgh = ' + n(s.relative * 1000) + ' Pa = ' + n(s.relative) + ' kPa',
  ],
  [
    'Leggi i manometri',
    'La legge di Stevino somma due contributi. Il manometro assoluto include la pressione superficiale. A e B misurano lo stesso valore perché hanno lo stesso h. La presa sul fondo ha sopra di sé due metri di liquido.',
    'p = p₀ + Δp = ' + n(p.p0) + ' + ' + n(s.relative) + ' = ' + n(s.absolute) + ' kPa',
  ],
  [
    'Risali alla profondità',
    'Sottrai la pressione superficiale, converti i kPa in Pa e dividi per ρg. Alla superficie ottieni h = 0 e p = p₀.',
    'h = (p − p₀) × 1000/(ρg) = ' + n(p.h) + ' m',
  ],
];
export const graphs = (p, s) => [
  chart(
    'Letture lungo il recipiente',
    'h (m)',
    'pressione (kPa)',
    [
      curve('Assoluta', 0, 2, (h) => p.p0 + (p.rho * g * h) / 1000),
      curve('Relativa', 0, 2, (h) => (p.rho * g * h) / 1000),
    ],
    p.h,
  ),
];
