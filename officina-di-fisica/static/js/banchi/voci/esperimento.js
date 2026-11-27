import { chart, curve, n, param, select } from '../misure.js';
import { annotazioneScena, legende, legendaVoce } from './legende.js';
import { confronti } from './confronti.js';
import { orologioVoce } from './orologi.js';
import { disegna3D, scenaMobile, tavolo } from './geometria.js';
import { resolveEngine } from './engines.js';
import { assessmentPoints } from './assessment-selection.js';
const valore = (a, u) => n(a) + (u && u !== '1' ? ' ' + u : '');
const stabile = (x) => (Math.abs(x) < 1e-11 ? 0 : x);
export async function esperienza(record) {
  const {law, instrument, legend} = await resolveEngine(record);
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
  const clock = record.engine ? null : orologioVoce(record, law);
  const nativeVectorAxes = !record.engine && record.apparatus === 'vettori';
  const frontalPlateProbe = !record.engine && [
    'SIM-C4-L02-03', 'SIM-C4-L03-02', 'SIM-C4-L03-03',
  ].includes(record.id);
  const etichetteFuoriScena = nativeVectorAxes ? ['y'] : !record.engine && annotazioneScena(record)?.etichette;
  function elements(x, stage, time) {
    if (clock?.input && time !== undefined) x = time;
    const board = tavolo(Math.max(stage, 0));
    const y = calc(x);
    const state = law.apparatus(x, y);
    if (clock?.frame && time !== undefined) Object.assign(state, clock.frame(x, time, y));
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
    // The accessible legend locates labels whose opaque sprites hide a measured glyph.
    return etichetteFuoriScena
      ? board.elementi.filter(elemento => elemento.kind !== 'label' || !etichetteFuoriScena.includes(elemento.text))
      : board.elementi;
  }
  const levels = ['Diminuisce', 'Resta uguale', 'Aumenta'];
  const sign = Math.abs(y1 - y0) < 1e-8 ? 0 : Math.sign(y1 - y0);
  const extra = Array.from(
    { length: Math.round((a.max - a.min) / a.step) + 1 },
    (_, i) => a.min + i * a.step,
  ).filter((x) => Math.abs(x - x0) > 1e-7 && Math.abs(x - x1) > 1e-7);
  const transfer = extra[Math.floor(extra.length / 2)] ?? x0;
  const selectedPoints = assessmentPoints(record, [x1, transfer]);
  const assessment = selectedPoints.map((x, i) => ({
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
    readings(p, s, t = 0) {
      const readings = [
        [a.label, choices ? fmt(s.x) : s.x, choices || a.unit === '1' ? '' : a.unit],
        [clock?.finalReading ? m.label + ' (a fine prova)' : m.label, s.y, m.unit === '1' ? '' : m.unit],
        confronti[record.id]?.(s.x, s.y) ?? [
          'Variazione dal riferimento',
          stabile(s.y - y0),
          m.unit === '1' ? '' : m.unit,
        ],
      ];
      if (clock?.signal) readings.push([clock.label, stabile(clock.signal(s.x, t, s.y)), clock.unit]);
      return readings;
    },
    steps(p, { x, y }) {
      // Match controller roundoff, never a different legal slider step. The
      // worked calculation uses the declared point; measurements retain x.
      const assignedInput = selectedPoints.find((value) =>
        Math.abs(value - x) <= Math.min(
          a.step / 1e6,
          8 * Number.EPSILON * Math.max(Math.abs(a.min), Math.abs(a.max), Math.abs(value), Math.abs(x), Number.MIN_VALUE),
        ),
      );
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
        assignedInput !== undefined
          ? [
              'Controlla il calcolo',
              record.formula + '. Sostituisci i dati e confronta il risultato con la lettura dello strumento.',
              calculation(assignedInput, calc(assignedInput)),
            ]
          : [
              'Osserva la lettura del modello',
              'Questa posizione serve all’esplorazione. Per il calcolo manuale usa i valori assegnati: ' +
                fmt(selectedPoints[0]) + ' e ' + fmt(selectedPoints[1]) + '.',
              m.label + ' = ' + valore(y, m.unit),
            ],
        [
          'Ripeti con un altro dato',
          'Prevedi la lettura con «' +
            a.label +
            '» a ' +
            fmt(selectedPoints[1]) +
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
      charts[0].track = 'control';
      charts[0].point = calc(x);
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
      if (record.id === 'SIM-C6-L05-01') charts[0].track = 'area-v';
      if (clock?.signal) {
        const y = calc(x),
          end = clock.duration(x, y);
        if (end > 0) {
          const signal = chart(
            clock.label,
            'Tempo (' + clock.clockUnit + ')',
            clock.label + (clock.unit ? ' (' + clock.unit + ')' : ''),
            [curve(clock.label, 0, end, (t) => clock.signal(x, t, y), 160)],
            0,
          );
          if (clock.secant) {
            const points = signal.series[0].points;
            signal.title = 'Pendenza della secante · ' + clock.secant;
            signal.x = 'Tempo dalla prima lettura (s)';
            signal.largeLabels = true;
            signal.series.push({name: 'Secante fra gli estremi', points: [points[0], points.at(-1)], dash: true});
          }
          signal.track = 'time';
          signal.point = clock.signal(x, 0, y);
          charts.push(signal);
        }
      }
      return charts;
    },
  };
  const high = [
    'spira',
    'piano',
    'piastre',
    'ciclo',
    'ottica',
    'volo',
    'caduta',
    'termometro',
    'molla',
    'pistone',
  ].includes(record.apparatus);
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
  const trasmissioneSuono = !record.engine && record.id === 'SIM-C5-L05-01';
  const spec = {
    target: [0, high ? 1.27 : 0.95, 0],
    // Native vector grids include full vertical components and the table feet.
    // Keep their complete opaque meshes in all three preset camera frames.
    // The sound fronts span 4.48 scene units at the largest setting.
    height: nativeVectorAxes ? 6 : trasmissioneSuono ? 5 : high ? 4.65 : top ? 4.68 : 4.25,
    width: 8.1,
    // A lateral eye lets the opaque right plate hide the nearby probe. In these
    // three native activities, a raised frontal view keeps their x positions
    // separate on screen without moving the probe, field or physical plates.
    eye: frontalPlateProbe ? [0, 1.9, 6.1] : top ? [2.3, 4.35, 6.1] : [2.6, 1.9, 6.1],
    bg: { C1: 0xf3eddd, C2: 0xe7efe5, C3: 0xf4eada, C4: 0xecebf1, C5: 0xe7edf0, C6: 0xe9eeea }[record.course] ?? 0xe9eeea,
  };
  const scene = {
    spec,
    build(b, p, s, stage) {
      if (clock && stage >= 0) return scenaMobile(b, (time) => elements(s.x, stage, time));
      disegna3D(b, elements(s.x, stage));
    },
  };
  function measurement(x) {
    const value = calc(x);
    return { x, value, input: fmt(x), reading: valore(value, m.unit), calculation: calculation(x, value) };
  }
  return {
    record: teaching,
    model,
    scene,
    elements,
    measurement,
    clock,
    observe: law.observe,
    legend: (_stage, view) => {
      const text = legend ?? (nativeVectorAxes
        ? legende.vettori.replace('Gli assi x e y sono indicati sulla tavola.',
          'L’asse x è etichettato. L’asse y passa per la coda del primo vettore ed è perpendicolare a x nel piano dei vettori. Nella tavola 2D è l’altra retta grigia; in una vista 3D di taglio può apparire come un punto. Usa i controlli e le letture numeriche per confrontare i risultati.')
        : legendaVoce(record, view));
      return frontalPlateProbe && view !== 'diagram'
        ? text + ' La vista Obliqua parte da un’inquadratura frontale rialzata. Se ruoti la scena e una piastra copre il punto, usa Ripristina vista oppure scegli Alto o Laterale per confrontare la posizione lungo il campo.'
        : text;
    },
  };
}
