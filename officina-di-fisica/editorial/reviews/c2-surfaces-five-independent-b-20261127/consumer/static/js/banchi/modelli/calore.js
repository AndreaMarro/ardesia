import { n, param, chart, curve } from '../misure.js';
export const params = [
  param('left', 'Temperatura a sinistra T₁', '°C', 0, 100, 1, 80),
  param('right', 'Temperatura a destra T₂', '°C', 0, 100, 1, 20),
  param('L', 'Spessore L', 'cm', 2, 20, 0.5, 10),
  param('A', 'Area A', 'cm²', 4, 40, 1, 16),
  param('k', 'Conducibilità k', 'W/(m·K)', 0.5, 10, 0.5, 2),
];
export function solve(p) {
  const length = p.L / 100,
    area = p.A / 10000,
    gradient = (p.right - p.left) / length,
    flux = -p.k * gradient;
  return { length, area, gradient, flux, power: flux * area };
}
export const readings = (p, s) => [
  ['Gradiente', s.gradient, 'K/m'],
  ['Flusso areico', s.flux, 'W/m²'],
  ['Potenza verso destra', s.power, 'W'],
];
export const steps = (p, s) => [
  [
    'Individua le due facce',
    'Due termostati tengono le facce alle temperature impostate. Le pareti laterali sono isolate. La barra è omogenea, senza sorgenti interne, e si trova in regime stazionario.',
    'L = ' + n(s.length) + ' m · A = ' + n(s.area) + ' m²',
  ],
  [
    'Leggi la pendenza',
    'Procedi da sinistra verso destra. La temperatura cambia linearmente. Dividi la differenza tra arrivo e partenza per la lunghezza. Una differenza di 1 °C vale 1 K.',
    'dT/dx = (T₂ − T₁)/L = ' + n(s.gradient) + ' K/m',
  ],
  [
    'Segui il calore',
    'La legge di Fourier introduce un segno meno. Il calore passa dalla faccia più calda a quella più fredda. Moltiplica il flusso per l’area per ottenere la potenza totale.',
    'j = −k dT/dx = ' + n(s.flux) + ' W/m² · P = jA = ' + n(s.power) + ' W',
  ],
  [
    'Ricava lo spessore',
    s.power
      ? 'Moltiplica per L, poi dividi per la potenza con il suo segno. Scambia le temperature e controlla che P inverta verso.'
      : 'Le facce sono alla stessa temperatura. Il flusso si annulla per qualunque spessore: questa misura non permette di ricavare L.',
    s.power ? 'L = kA(T₁ − T₂)/P = ' + n(s.length) + ' m' : 'ΔT = 0 K · P = 0 W',
  ],
];
export const graphs = (p, s) => [
  chart(
    'Temperatura nel solido',
    'x (cm)',
    'T (°C)',
    [curve('Temperatura', 0, p.L, (x) => p.left + ((p.right - p.left) * x) / p.L)],
    p.L / 2,
  ),
];
