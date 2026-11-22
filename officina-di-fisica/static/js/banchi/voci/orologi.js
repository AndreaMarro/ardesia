// A clock either measures the lesson's independent variable or runs a second experiment
// with its chosen parameter held fixed. Equilibrium comparisons have no time axis.
const elapsed = new Set([
  'C1-L003-02',
  'C1-L003-05',
  'C1-L003-06',
  'C1-L004-01',
  'C1-L004-02',
  'C1-L005-01',
  'C1-L007-02',
  'C1-L009-01',
  'C1-L010-01',
  'C2-L007-02',
  'C4-L02-03',
  'C5-L01-01',
  'C5-L02-01',
  'C5-L02-03',
  'C5-L08-02',
  'C6-L03-01',
  'C6-L05-01',
]);
const tau = 2 * Math.PI;
const cosPhase = (t, period) => Math.cos((tau * t) / period);
const profile = (peak, radius) => peak * (1 - radius * radius);
// The apparatus sets the path. At every intermediate point the same law as the
// endpoint calculation supplies the geometry and the independent instrument reading.
const gasRamp = (initial) => ({
  duration: () => 40,
  pace: 5,
  inputAt: (final, t) => initial + ((final - initial) * t) / 40,
});
const driven = {
  'C3-L04-01': {
    duration: (energy) => energy / 1.67,
    inputAt: (energy, t) => Math.min(energy, 1.67 * t),
    label: 'Massa già fusa',
    setup:
      'Il riscaldatore cede 1,67 kJ ogni secondo a 100 g di ghiaccio a 0 °C. Le quantità delle due fasi sono schematiche.',
  },
  'C3-L04-03': {
    duration: (energy) => energy / 2,
    inputAt: (energy, t) => Math.min(energy, 2 * t),
    label: 'Massa già fusa',
    setup:
      'Il riscaldatore cede 2 kJ ogni secondo. Osserva il termometro prima, durante e dopo la fusione di 100 g di ghiaccio.',
  },
  'C3-L07-02': {
    ...gasRamp(1),
    label: 'Pressione nell’istante scelto',
    setup:
      'Il pistone parte da 1 L e percorre la corsa impostata a velocità costante in 40 s. Il termostato mantiene costante la temperatura.',
  },
  'C3-L07-03': {
    ...gasRamp(300),
    label: 'Pressione nell’istante scelto',
    setup:
      'Il volume è bloccato. Il termostato porta la temperatura da 300 K al valore scelto con un andamento lineare in 40 s.',
  },
  'C3-L07-04': {
    ...gasRamp(300),
    label: 'Volume nell’istante scelto',
    setup:
      'Il carico resta fisso sul pistone. In 40 s il termostato porta il gas da 300 K alla temperatura scelta, mantenendolo in equilibrio.',
  },
  'C3-L07-05': {
    ...gasRamp(1),
    label: 'Pressione nell’istante scelto',
    setup:
      'Il pistone isolato percorre la corsa impostata a velocità costante in 40 s. Il modello assume che il gas attraversi stati di equilibrio senza scambiare calore.',
  },
};
function collision(speed, t) {
  const sign = Math.sign(speed) || 1;
  const after = Math.max(0, t - 0.5);
  const centerB = (speed * after) / 2;
  return {
    a: centerB - sign * 0.7 + speed * Math.min(t - 0.5, 0),
    b: centerB,
    va: t < 0.5 ? speed : speed / 2,
    vb: t < 0.5 ? 0 : speed / 2,
  };
}
// In milliseconds c = 0.30 m/ms. The microphone is 3 m in front of the
// initial source. A front received now was emitted at this retarded time.
function pressureDoppler(speed, t) {
  const emitted = (0.3 * t - 3) / (0.3 - speed / 1000);
  return Math.cos(tau * 0.3 * emitted);
}
const motions = {
  'C1-L003-03': {
    duration: (x) => x,
    frame: (x, t) => ({ pos: (1 + t) ** 2 }),
    label: 'Posizione durante la misura',
    unit: 'm',
    signal: (x, t) => (1 + t) ** 2,
  },
  'C1-L003-04': {
    duration: (x) => x,
    frame: (x, t) => ({ pos: (1 + t) ** 3 / 3, freccia: (1 + t) ** 2 / 12 }),
    label: 'Velocità durante la misura',
    unit: 'm/s',
    signal: (x, t) => (1 + t) ** 2,
  },
  'C1-L004-03': {
    duration: () => 2,
    frame: (x, t) => ({ t }),
    label: 'Quota in volo',
    unit: 'm',
    signal: (x, t) => 10 * t - 5 * t * t,
  },
  'C1-L004-04': {
    duration: (speed) => (tau * 2) / speed,
    frame: (speed, t) => ({ angoloOrbita: (speed * t) / 2 }),
    label: 'Posizione lungo x',
    unit: 'm',
    signal: (speed, t) => 2 * Math.cos((speed * t) / 2),
  },
  'C1-L009-02': {
    duration: (speed) => (speed ? 1.2 : 0),
    frame: (speed, t) => {
      const p = collision(speed, t);
      return { a: 0.8 * p.a, b: 0.8 * p.b, va: 0.32 * p.va, vb: 0.32 * p.vb };
    },
    label: 'Posizione del centro di A',
    unit: 'm',
    signal: (speed, t) => collision(speed, t).a,
    finalReading: true,
    setup:
      'I carrelli hanno la stessa massa. L’origine è al centro di B prima dell’urto. A raggiunge B a 0,5 s e da allora i due carrelli restano agganciati.',
  },
  'C2-L005-01': {
    duration: () => 6,
    frame: (speed, t) => ({ avanzamento: (speed * t) / 12 }),
    label: 'Distanza alla velocità media',
    unit: 'cm',
    signal: (speed, t) => speed * t,
    setup: 'Il tratto rappresenta 12 cm. I marcatori avanzano alla velocità media di sezione.',
  },
  'C2-L005-04': {
    duration: () => 5,
    frame: (peak, t) => ({ tracciaCm: peak * t, sonda: 0.5 }),
    label: 'Cammino a metà raggio',
    unit: 'cm',
    signal: (peak, t) => profile(peak, 0.5) * t,
    setup: 'Il tratto osservato è lungo 20 cm. La sonda è a metà raggio.',
  },
  'C2-L007-05': {
    duration: () => 5,
    frame: (radius, t) => ({ tracciaCm: 12 * t }),
    label: 'Cammino alla sonda',
    unit: 'cm',
    signal: (radius, t) => profile(12, radius) * t,
    setup: 'Il tratto osservato è lungo 20 cm. Segui il tracciante della sonda.',
  },
  'C3-L05-02': {
    duration: () => 10,
    frame: (flow, t) => ({ giri: (flow * t) / 10 }),
    label: 'Massa passata alla sezione',
    unit: 'g',
    signal: (flow, t) => flow * t,
    setup: 'Il circuito uniforme contiene 10 g di fluido. Ogni marcatore rappresenta il passaggio di 1 g.',
  },
  'C4-L05-01': {
    duration: (x) => x,
    frame: (x, t) => ({ passaggio: t / 5 }),
    label: 'Carica già passata',
    unit: 'C',
    signal: (x, t) => 2 * t,
  },
  'C4-L09-03': {
    duration: (field) => tau / field,
    frame: (field, t) => ({ angoloOrbita: field * t }),
    label: 'Posizione lungo x',
    unit: 'cm',
    signal: (field, t) => (12 * Math.cos(field * t)) / field,
    setup:
      'Per osservare un giro il banco usa q/m = 1 C/kg e v = 0,12 m/s. La forza è sempre perpendicolare alla velocità.',
  },
  'C4-L10-03': {
    duration: (x) => x,
    frame: (x, t) => ({ campoRelativo: t / x }),
    label: 'Variazione del flusso concatenato',
    unit: 'Wb',
    signal: (x, t) => (2 * t) / x,
    setup: 'Il flusso concatenato cresce uniformemente da zero a 2 Wb nella durata scelta.',
  },
  'C5-L01-02': {
    duration: (period) => 2 * period,
    frame: (period, t) => ({ pos: cosPhase(t, period), istante: t }),
    label: 'Posizione della sorgente',
    unit: 'cm',
    signal: (period, t) => 3 * cosPhase(t, period),
  },
  'C5-L02-02': {
    duration: () => 3,
    frame: (f, t) => ({ fase: tau * f * t, sonda: true }),
    label: 'Spostamento alla sorgente',
    unit: 'cm',
    signal: (f, t) => Math.sin(tau * f * t),
    setup: 'L’ampiezza della corda è fissata a 1 cm. La sonda si trova all’estremo sinistro.',
  },
  'C5-L05-01': {
    clockUnit: 'ms',
    pace: 100,
    duration: (x, y) => y,
    frame: (x, t, y) => ({ frazioneViaggio: t / y }),
    label: 'Cammino del suono',
    unit: 'm',
    signal: (x, t, y) => (150 * t) / y,
    setup: 'Il segnale parte dalla sorgente all’istante zero e arriva al ricevitore a 150 m.',
  },
  'C5-L05-03': {
    clockUnit: 'ms',
    duration: () => 20,
    frame: (speed, t) => ({ dopplerMs: t, pressioneRel: pressureDoppler(speed, t) }),
    label: 'Pressione relativa al ricevitore',
    unit: '',
    signal: pressureDoppler,
    setup:
      'La sorgente emette 300 creste al secondo. Il ricevitore è a 3 m dalla posizione iniziale della sorgente e registra un massimo di pressione al passaggio di ogni cresta.',
  },
  'C5-L06-02': {
    clockUnit: 'ns',
    duration: () => 20,
    frame: (amp, t) => ({ fase: (tau * t) / 10 }),
    label: 'Campo elettrico alla sorgente',
    unit: 'V/m',
    signal: (amp, t) => amp * Math.sin((tau * t) / 10),
    setup: 'A 100 MHz il periodo è 10 ns. Le altezze di E e B hanno scale distinte.',
  },
  'C5-L07-01': {
    clockUnit: 'fs',
    duration: (f) => 2000 / f,
    frame: (f, t) => ({ fase: (tau * f * t) / 1000 }),
    label: 'Campo relativo alla sorgente',
    unit: '',
    signal: (f, t) => Math.sin((tau * f * t) / 1000),
    setup:
      'La curva rappresenta il campo dell’onda associata. Il tempo è in femtosecondi, l’energia si riferisce a un fotone.',
  },
  'C6-L01-01': {
    clockUnit: 'ms',
    duration: (x) => x,
    frame: (x, t) => ({ frazioneEco: x ? 1 - Math.abs(1 - (2 * t) / x) : 0 }),
    label: 'Distanza dell’impulso dal microfono',
    unit: 'm',
    signal: (x, t) => 0.34 * Math.min(t, x - t),
    setup: 'La parete resta ferma per tutta la prova. Il segnale viaggia a 0,34 m ogni millisecondo.',
  },
  'C6-L02-01': {
    duration: () => 4,
    frame: (mass, t) => ({ avanzamento: ((mass / 8) * t) / 12, raccolta: (mass * t) / 160 }),
    label: 'Massa già raccolta',
    unit: 'g',
    signal: (mass, t) => (mass * t) / 4,
    setup: 'La raccolta dura 4 s. I marcatori sul tratto di 12 cm seguono la velocità media.',
  },
};
export function orologioVoce(record, law) {
  const id = record.id.slice(4);
  if (elapsed.has(id)) {
    const unit = id === 'C5-L08-02' ? 'T½' : record.control.unit;
    return { input: true, clockUnit: unit, pace: 1, duration: () => record.control.max };
  }
  const path = driven[id];
  if (path) {
    const measureAt = (x, t) => law.measure(path.inputAt(x, t));
    return {
      clockUnit: 's',
      pace: 1,
      ...path,
      finalReading: true,
      unit: record.measure.unit,
      signal: measureAt,
      frame: (x, t) => law.apparatus(path.inputAt(x, t), measureAt(x, t)),
    };
  }
  const motion = motions[id];
  return motion ? { clockUnit: 's', pace: 1, ...motion } : null;
}
