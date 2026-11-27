import { models } from '../../models.js';
import { n, param, curve, chart } from '../misure.js';
export const params = [
  param('p', 'Distanza oggetto p', 'cm', 5, 50, 1, 30),
  param('f', 'Focale f', 'cm', 5, 25, 1, 12),
  param('screen', 'Distanza schermo', 'cm', 5, 65, 1, 20),
];
export function solve(p) {
  const s = models.C5(p);
  return { ...s, sharp: Number.isFinite(s.q) && Math.abs(s.q - p.screen) < 0.05 };
}
export const readings = (p, s) => [
  ['Distanza immagine q', Number.isFinite(s.q) ? s.q : '∞', 'cm'],
  ['Ingrandimento', s.m, '×'],
  ['Schermo', s.sharp ? 'a fuoco' : 'fuori fuoco', ''],
];
export const steps = (p, s) => [
  [
    'Allinea il banco',
    'L’oggetto è la piccola freccia a sinistra. La luce viaggia verso destra. Il centro ottico fissa lo zero, i due fuochi distano f. La vista laterale è ortografica. La freccia è alta 1 cm. L’asse verticale del disegno è ampliato di 7,7 volte rispetto a quello orizzontale. Le ascisse degli incroci si leggono sulla stessa scala della guida.',
    'p = ' + n(p.p) + ' cm · f = ' + n(p.f) + ' cm',
  ],
  [
    'Traccia due raggi',
    'Dalla punta parte un raggio parallelo all’asse: dopo la lente passa per il fuoco destro. Un secondo raggio attraversa il centro ottico e prosegue in linea retta.',
    'Raggio centrale: y(x) = −hx/p · raggio rifratto: y(x) = h(1 − x/f)',
  ],
  [
    'Cerca l’intersezione',
    s.q === Infinity
      ? 'Con p = f i raggi emergono paralleli. Nessuna posizione finita dello schermo raccoglie il punto immagine.'
      : s.q < 0
        ? 'I raggi emergono divergenti. Le linee tratteggiate prolungano i raggi a sinistra fino all’immagine virtuale.'
        : 'I raggi convergono sul lato di uscita. Porta lo schermo alla quota q per raccogliere la punta capovolta.',
    '1/q = 1/f − 1/p · q = fp/(p − f) = ' + (s.q === Infinity ? '∞' : n(s.q) + ' cm'),
  ],
  [
    'Verifica il segno',
    'La lente è sottile e i raggi sono parassiali. L’ingrandimento è il rapporto delle altezze con segno. Sul banco le distanze sono in centimetri. Le intersezioni oltre il campo visivo si leggono numericamente. ',
    s.m === null ? 'p = f ⇒ 1/q = 0' : 'm = −q/p = ' + n(s.m) + ' · f = pq/(p + q) = ' + n(p.f) + ' cm',
  ],
];
export const graphs = (p, s, t, stage) =>
  stage === 0
    ? [
        chart(
          'Posizioni sul banco',
          'x (cm)',
          'quota (cm)',
          [
            {
              name: 'Asse ottico',
              points: [
                [-p.p, 0],
                [65, 0],
              ],
            },
            {
              name: 'Oggetto',
              points: [
                [-p.p, 0],
                [-p.p, 1],
              ],
            },
          ],
          p.screen,
        ),
      ]
    : [
        chart(
          'Costruzione nel piano dei raggi',
          'x (cm)',
          'y (cm)',
          [
            {
              name: 'Centrale',
              points: [
                [-p.p, 1],
                [0, 0],
                [65, -65 / p.p],
              ],
            },
            {
              name: 'Parallelo e rifratto',
              points: [
                [-p.p, 1],
                [0, 1],
                [65, 1 - 65 / p.f],
              ],
            },
            ...(stage >= 2 && s.q < 0
              ? [
                  {
                    name: 'Prolungamenti',
                    dash: true,
                    points: [
                      [s.q, s.m],
                      [0, 0],
                      [NaN, NaN],
                      [s.q, s.m],
                      [0, 1],
                    ],
                  },
                ]
              : []),
          ],
          p.screen,
        ),
      ];
