import { chart, curve, n, param, select } from '../misure.js';
import { legende } from './legende.js';
import { confronti } from './confronti.js';
import { disegna3D, tavolo } from './geometria.js';
const famiglie = {
  meccanica:
    'calibro campione vettori binario volo caduta cerchio forze coppia piano molla gravita percorso urto leva',
  fluidi: 'fasi strati vasca manometro pressa galleggia condotto profilo rete film goccia capillare',
  termica: 'pistone termometro calorimetro fase barra convezione radiazione ciclo motore microstati',
  campi: 'cariche piastre dipoli filo circuito condensatori bussola lorentz spira',
  onde: 'oscillatore onda onde2 sorgente doppler em assorbitore fotone nucleo decadimento ottica',
};
const gruppi = Object.fromEntries(
  Object.entries(famiglie).flatMap(([family, keys]) => keys.split(' ').map((key) => [key, family])),
);
const names = { onde: 'ondulatoria' };
const valore = (a, u) => n(a) + (u && u !== '1' ? ' ' + u : '');
const stabile = (x) => (Math.abs(x) < 1e-11 ? 0 : x);
export async function esperienza(record) {
  if (!/^C[1-6]$/.test(record.course)) throw Error('Corso della simulazione sconosciuto.');
  const family = gruppi[record.apparatus];
  if (!family) throw Error('Apparato della simulazione sconosciuto.');
  const [{ experiments }, module] = await Promise.all([
    import('./modelli/' + record.course + '.js'),
    import('./apparati/' + family + '.js'),
  ]);
  const law = experiments[record.id],
    instrument = module[names[family] || family][record.apparatus];
  if (!law || !instrument) throw Error('Modello della voce non disponibile.');
  const a = record.control,
    m = record.measure,
    [[x0, y0], [x1, y1]] = record.references;
  const choices = a.choices;
  function calculation(x, y) {
    const z = n(x),
      sub = record.substitution;
    let expr = Array.isArray(sub) ? sub[x - a.min] : sub;
    if (expr === 'tratti') expr = x <= 2 ? '2 × {x}' : '4 − 2 × ({x} − 2)';
    if (expr === 'ritorno') expr = x <= 2 ? '2 × {x}' : '4 − ({x} − 2)';
    if (expr === 'attrito') expr = x <= 6 ? 'F applicata = {x}' : 'μ dinamico × N = 3';
    if (expr === 'gradini')
      expr = Array.from({ length: x }, (_, i) => '100 / ' + n(1 + (i + 1) / x) + ' × ' + n(1 / x)).join(
        ' + ',
      );
    const numeric = (expr || record.formula).replaceAll('{x}', x < 0 ? '(' + z + ')' : z);
    const rounded = Number(y.toPrecision(4)) !== y || sub === 'gradini' || record.formula.includes('≈');
    return numeric + (rounded ? ' ≈ ' : ' = ') + valore(y, m.unit);
  }
  const fmt = (x) => (choices ? choices[x - a.min] : valore(x, a.unit));
  const paramDef = choices
    ? select(
        'x',
        a.label,
        choices.map((name, i) => [String(a.min + i), name]),
        String(x0),
      )
    : param('x', a.label, a.unit === '1' ? '' : a.unit, a.min, a.max, a.step, x0);
  const calc = (x) => stabile(law.measure(x));
  function elements(x, stage) {
    const board = tavolo(Math.max(stage, 0));
    const state = law.apparatus(x, calc(x));
    if (['SIM-C2-L009-01', 'SIM-C4-L06-01', 'SIM-C4-L08-01'].includes(record.id)) {
      for (const [side, series] of [
        [-1, true],
        [1, false],
      ]) {
        const half = tavolo(1);
        const setup = { ...state, serie: series, parallelo: !series, dueSerie: series };
        if (series && record.apparatus === 'rete') {
          setup.alto = 2.4 / (2 + x);
          setup.basso = setup.alto;
        }
        if (series && record.apparatus === 'circuito') {
          setup.ramo = 4 / (4 + x);
          setup.i = setup.ramo;
        }
        instrument(half, setup);
        const scale = 0.56,
          dx = side * 1.55;
        const at = (p) => [dx + scale * p[0], 0.14 + scale * p[1], scale * p[2]];
        for (const e of half.elementi.filter((el) => el.kind !== 'label')) {
          const value = { ...e };
          for (const key of ['p', 'a', 'b']) if (value[key]) value[key] = at(value[key]);
          if (value.points) value.points = value.points.map(at);
          if (value.size) value.size = value.size.map((d) => d * scale);
          for (const key of ['r', 'r2']) if (key in value) value[key] *= scale;
          board.elementi.push(value);
        }
        board.label([dx, 1.7, 0], series ? 'In serie' : 'In parallelo');
      }
    } else instrument(board, state);
    return board.elementi;
  }
  const levels = ['Diminuisce', 'Resta uguale', 'Aumenta'];
  const sign = Math.abs(y1 - y0) < 1e-8 ? 0 : Math.sign(y1 - y0);
  const extra = Array.from(
    { length: Math.round((a.max - a.min) / a.step) + 1 },
    (_, i) => a.min + i * a.step,
  ).filter((x) => Math.abs(x - x0) > 1e-7 && Math.abs(x - x1) > 1e-7);
  const transfer = extra[Math.floor(extra.length / 2)] ?? x0;
  const assessment = [x1, transfer].map((x, i) => ({
    prompt:
      i === 1
        ? record.transferPrompt.replace('{x}', fmt(x))
        : 'Imposta «' + a.label + '» su ' + fmt(x) + '. Quale valore ottieni per «' + m.label + '»?',
    value: calc(x),
    unit: m.unit === '1' ? 'numero puro' : m.unit,
    worked: record.formula + '. ' + calculation(x, calc(x)) + '.',
  }));
  const teaching = {
    ...record,
    prediction: {
      question:
        'Porta «' + a.label + '» da ' + fmt(x0) + ' a ' + fmt(x1) + '. Come cambia «' + m.label + '»?',
      options: levels,
      correct: sign + 1,
      why:
        m.label +
        ' passa da ' +
        valore(y0, m.unit) +
        ' a ' +
        valore(y1, m.unit) +
        '. ' +
        record.interpretation,
    },
    assessment,
  };
  const dataSeries = () => {
    if (record.id === 'SIM-C1-L006-01')
      return {
        name: m.label,
        points: [
          [0, 0],
          [6, 6],
          [6, NaN],
          [6, 3],
          [12, 3],
        ],
      };
    if (choices || record.discrete) {
      const points = [];
      for (let x = a.min; x <= a.max; x += a.step) points.push([x, calc(x)]);
      return { name: m.label, points, markers: true };
    }
    return curve(m.label, a.min, a.max, calc, 100);
  };
  const serie = dataSeries();
  const model = {
    params: [paramDef],
    solve(p) {
      const x = Number(p.x);
      return { x, y: calc(x) };
    },
    readings(p, s) {
      return [
        [a.label, choices ? fmt(s.x) : s.x, choices || a.unit === '1' ? '' : a.unit],
        [m.label, s.y, m.unit === '1' ? '' : m.unit],
        confronti[record.id]?.(s.x, s.y) ?? [
          'Variazione dal riferimento',
          stabile(s.y - y0),
          m.unit === '1' ? '' : m.unit,
        ],
      ];
    },
    steps(p, { x, y }) {
      return [
        ['Individua il fenomeno', record.interpretation, record.formula],
        [
          'Esegui la misura',
          'Regola «' +
            a.label +
            '» e confronta la scena con il punto segnato sul grafico. Parti da ' +
            fmt(x0) +
            ', poi prova ' +
            fmt(x1) +
            '.',
          a.label + ' = ' + fmt(x) + ' · ' + m.label + ' = ' + valore(y, m.unit),
        ],
        [
          'Controlla il calcolo',
          record.formula + '. Sostituisci i dati e confronta il risultato con la lettura dello strumento.',
          calculation(x, y),
        ],
        [
          'Ripeti con un altro dato',
          'Prevedi la lettura con «' +
            a.label +
            '» a ' +
            fmt(transfer) +
            '. Esegui il controllo nel riquadro sotto il banco e spiega con parole tue il risultato.',
          record.formula,
        ],
      ];
    },
    graphs(p, { x }) {
      const charts = [
        chart(
          'Lettura al variare di ' + a.label.toLowerCase(),
          a.label + (a.unit === '1' ? '' : ' (' + a.unit + ')'),
          m.label + (m.unit === '1' ? '' : ' (' + m.unit + ')'),
          [serie],
          x,
        ),
      ];
      if (record.id === 'SIM-C3-L09-04') {
        // V and p are normalized to the start of the hot isotherm. Gamma = 5/3.
        const k = (500 / x) ** 1.5,
          b = 1.6,
          gamma = 5 / 3;
        charts.push(
          chart('Il ciclo di Carnot nel piano p–V', 'V / V iniziale', 'p / p iniziale', [
            curve('Isoterma calda', 1, b, (v) => 1 / v),
            curve('Espansione adiabatica', b, b * k, (v) => (b / v) ** gamma / b),
            curve('Isoterma fredda', b * k, k, (v) => x / (500 * v)),
            curve('Compressione adiabatica', k, 1, (v) => 1 / v ** gamma),
          ]),
        );
      }
      if (choices) charts[0].categories = choices.map((name, i) => a.min + i + ' · ' + name);
      if (record.id === 'SIM-C6-L05-01')
        charts.unshift(
          chart(
            'Aree con segno della velocità',
            'tempo (s)',
            'v (m/s)',
            [
              {
                name: 'v(t)',
                points: [
                  [0, 2],
                  [2, 2],
                  [2, -1],
                  [4, -1],
                ],
                fillZero: true,
                shadeUntil: x,
              },
            ],
            x,
          ),
        );
      return charts;
    },
  };
  const high = ['spira', 'piano', 'piastre', 'ciclo', 'ottica', 'volo', 'caduta', 'termometro'].includes(
    record.apparatus,
  );
  const top = [
    'percorso',
    'urto',
    'rete',
    'vettori',
    'cerchio',
    'bussola',
    'microstati',
    'decadimento',
    'onde2',
  ].includes(record.apparatus);
  const spec = {
    target: [0, high ? 1.27 : 0.95, 0],
    height: high ? 4.65 : top ? 4.68 : 4.25,
    width: 8.1,
    eye: top ? [2.3, 4.35, 6.1] : [2.6, 1.9, 6.1],
    bg: { C1: 0xf3eddd, C2: 0xe7efe5, C3: 0xf4eada, C4: 0xecebf1, C5: 0xe7edf0, C6: 0xe9eeea }[record.course],
  };
  const scene = {
    spec,
    build(b, p, s, stage) {
      disegna3D(b, elements(s.x, stage));
    },
  };
  return { record: teaching, model, scene, elements, legend: () => legende[record.apparatus] };
}
