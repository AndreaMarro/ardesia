import { n, param, chart, curve } from '../misure.js';
export const R = 8.314462618;
export const params = [
  param('T', 'Temperatura assoluta T', 'K', 200, 600, 5, 300),
  param('mol', 'Quantità di sostanza n', 'mol', 0.02, 0.2, 0.01, 0.1),
  param('V', 'Volume V', 'L', 1, 6, 0.1, 3),
];
export function solve(p) {
  return { pressure: (p.mol * R * p.T) / p.V, product: p.mol * R * p.T };
}
export const readings = (p, s) => [
  ['Pressione assoluta', s.pressure, 'kPa'],
  ['Volume', p.V, 'L'],
  ['Prodotto pV', s.product, 'J'],
];
export const steps = (p, s) => [
  [
    'Leggi il volume',
    'Il pistone chiude una quantità definita di gas. A sezione costante il volume è proporzionale all’altezza. Ogni posizione rappresenta uno stato di equilibrio.',
    'V = area × altezza = ' + n(p.V) + ' L',
  ],
  [
    'Conta le grandezze',
    'T misura la temperatura assoluta e n conta le moli. Assumiamo gas diluito ideale, lontano dalla condensazione. Il colore identifica il volume occupato.',
    'nRT = ' + n(p.mol) + ' × 8,31446 × ' + n(p.T) + ' = ' + n(s.product) + ' J',
  ],
  [
    'Leggi l’isoterma',
    'A T e n fissati, dividendo per V ottieni p. Sul grafico ogni punto della curva è uno stato possibile alla stessa temperatura. Il punto evidenziato segue il pistone.',
    'p = nRT/V = ' + n(s.pressure) + ' kPa · 1 kPa × 1 L = 1 J',
  ],
  [
    'Ritrova la temperatura',
    'Moltiplica la pressione per il volume, poi dividi per nR. Dimezza il volume a temperatura costante e verifica che pV resti invariato.',
    'T = pV/(nR) = ' + n((s.pressure * p.V) / (p.mol * R)) + ' K',
  ],
];
export const graphs = (p, s) => [
  chart(
    'Stati alla stessa temperatura',
    'V (L)',
    'p (kPa)',
    [curve('Isoterma', 1, 6, (V) => s.product / V)],
    p.V,
  ),
];
