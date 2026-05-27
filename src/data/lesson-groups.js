// © Andrea Marro — 21/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Raggruppamento esperimenti in Lezioni
 *
 * I libri fisici ELAB raggruppano per CONCETTO con variazioni.
 * Ogni "Lezione" contiene esperimenti correlati che esplorano
 * lo stesso concetto da angolazioni diverse.
 *
 * Struttura: lessonId -> { title, concept, experiments[] }
 *
 * Visibility filter (Andrea 25/05/2026): getLessonsForVolume() filtra
 * lessons senza esperimenti visibili + filtra l'array `experiments` di
 * ogni lesson tenendo solo quelli visibili. Sorgente: experiment-visibility.js
 */

import {
  isVisibleExperiment,
  lessonHasVisibleExperiments,
  VISIBILITY_FILTER_DISABLED,
} from './experiment-visibility';

const LESSON_GROUPS = {
  // ═══════════════════════════════════════
  // VOLUME 1 — Le Basi
  // ═══════════════════════════════════════

  'v1-accendi-led': {
    title: 'Accendi il LED',
    concept: 'Circuito base: batteria + resistore + LED',
    volume: 1,
    chapter: 6,
    icon: '💡',
    experiments: ['v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap6-esp3']
  },
  'v1-led-rgb': {
    title: 'Il LED RGB',
    concept: 'Mescola i colori con un singolo LED',
    volume: 1,
    chapter: 7,
    icon: '🌈',
    experiments: ['v1-cap7-esp1', 'v1-cap7-esp2', 'v1-cap7-esp3', 'v1-cap7-esp4', 'v1-cap7-esp5', 'v1-cap7-esp6']
  },
  'v1-pulsanti': {
    title: 'I pulsanti',
    concept: 'Controlla il circuito con un interruttore',
    volume: 1,
    chapter: 8,
    icon: '🔘',
    experiments: ['v1-cap8-esp1', 'v1-cap8-esp2', 'v1-cap8-esp3', 'v1-cap8-esp4', 'v1-cap8-esp5']
  },
  'v1-potenziometro': {
    title: 'Il potenziometro',
    concept: 'Regola la luminosit\u00E0 con una manopola',
    volume: 1,
    chapter: 9,
    icon: '🎛️',
    experiments: ['v1-cap9-esp1', 'v1-cap9-esp2', 'v1-cap9-esp3', 'v1-cap9-esp4', 'v1-cap9-esp5', 'v1-cap9-esp6']
  },
  'v1-sfide-pot': {
    title: 'Sfide: combina tutto!',
    concept: 'Metti insieme pulsanti, pot e LED RGB',
    volume: 1,
    chapter: 9,
    icon: '🏆',
    isChallenges: true,
    experiments: ['v1-cap9-esp7', 'v1-cap9-esp8', 'v1-cap9-esp9']
  },
  'v1-sensore-luce': {
    title: 'Sensore di luce (LDR)',
    concept: 'Il circuito reagisce alla luce ambientale',
    volume: 1,
    chapter: 10,
    icon: '☀️',
    experiments: ['v1-cap10-esp1', 'v1-cap10-esp2', 'v1-cap10-esp3', 'v1-cap10-esp4', 'v1-cap10-esp5', 'v1-cap10-esp6']
  },
  'v1-buzzer': {
    title: 'Il buzzer',
    concept: 'Aggiungi il suono al circuito',
    volume: 1,
    chapter: 11,
    icon: '🔔',
    experiments: ['v1-cap11-esp1', 'v1-cap11-esp2']
  },
  'v1-reed-switch': {
    title: 'Il reed switch (magnete)',
    concept: 'Un interruttore invisibile attivato dal magnete',
    volume: 1,
    chapter: 12,
    icon: '🧲',
    experiments: ['v1-cap12-esp1', 'v1-cap12-esp2', 'v1-cap12-esp3', 'v1-cap12-esp4']
  },
  'v1-plastilina': {
    title: 'Circuiti con la plastilina',
    concept: 'La plastilina conduce! Crea circuiti artistici',
    volume: 1,
    chapter: 13,
    icon: '🎨',
    experiments: ['v1-cap13-esp1', 'v1-cap13-esp2']
  },
  'v1-robot': {
    title: 'Il Primo Robot ELAB',
    concept: 'Progetto finale: costruisci il tuo robot',
    volume: 1,
    chapter: 14,
    icon: '🤖',
    advancedProject: true,
    experiments: ['v1-cap14-esp1']
  },

  // ═══════════════════════════════════════
  // VOLUME 2 — Approfondiamo
  // ═══════════════════════════════════════

  // Sprint U Cycle 3 (2026-05-07) — Vol2 rinomina 5 lessons per audit task5-volumi-vol2.json verdetto.top_fix #1
  'v2-multimetro': {
    title: 'Il Multimetro',
    concept: 'Misure di tensione, resistenza, corrente',
    volume: 2,
    chapter: 3,
    icon: '🔧',
    experiments: ['v2-cap3-esp1', 'v2-cap3-esp2', 'v2-cap3-esp3', 'v2-cap3-esp4']
  },
  'v2-resistenze-serie-parallelo': {
    title: 'Resistenze in serie e parallelo',
    concept: 'Combinare resistori: serie, parallelo, partitore',
    volume: 2,
    chapter: 4,
    icon: '💡',
    experiments: ['v2-cap4-esp1', 'v2-cap4-esp2', 'v2-cap4-esp3']
  },
  'v2-batterie-serie': {
    title: 'Batterie in serie',
    concept: 'Sommare tensioni: serie e antiserie',
    volume: 2,
    chapter: 5,
    icon: '⚡',
    experiments: ['v2-cap5-esp1', 'v2-cap5-esp2']
  },
  'v2-led-vf-resistore': {
    title: 'LED: tensione Vf e calcolo resistore',
    concept: 'Capire Vf del LED e dimensionare R serie',
    volume: 2,
    chapter: 6,
    icon: '📈',
    experiments: ['v2-cap6-esp1', 'v2-cap6-esp2', 'v2-cap6-esp3', 'v2-cap6-esp4']
  },
  'v2-condensatori-rc': {
    title: 'Condensatori e circuiti RC',
    concept: 'Carica, scarica, costante \u03C4=RC, condensatori in parallelo',
    volume: 2,
    chapter: 7,
    icon: '🔗',
    experiments: ['v2-cap7-esp1', 'v2-cap7-esp2', 'v2-cap7-esp3', 'v2-cap7-esp4']
  },
  'v2-transistor': {
    title: 'Il transistor MOSFET',
    concept: 'Un interruttore elettronico controllato dalla tensione',
    volume: 2,
    chapter: 8,
    icon: '🚪',
    experiments: ['v2-cap8-esp1', 'v2-cap8-esp2', 'v2-cap8-esp3']
  },
  'v2-fototransistor': {
    title: 'Il fototransistor',
    concept: 'Sensore di luce avanzato',
    volume: 2,
    chapter: 9,
    icon: '👁️',
    experiments: ['v2-cap9-esp1', 'v2-cap9-esp2']
  },
  'v2-motore': {
    title: 'Il motore DC',
    concept: 'Trasforma l\'elettricit\u00E0 in movimento',
    volume: 2,
    chapter: 10,
    icon: '⚙️',
    experiments: ['v2-cap10-esp1', 'v2-cap10-esp2', 'v2-cap10-esp3', 'v2-cap10-esp4']
  },
  'v2-robot-segui-luce': {
    title: 'Robot Segui Luce',
    concept: 'Progetto finale: robot che segue la luce',
    volume: 2,
    chapter: 12,
    icon: '🤖',
    advancedProject: true,
    experiments: ['v2-cap12-esp1']
  },

  // ═══════════════════════════════════════
  // VOLUME 3 — Arduino
  // ═══════════════════════════════════════

  'v3-cap5-blink': {
    title: 'Capitolo 5 — Il nostro primo programma (Blink)',
    concept: 'setup, loop, Blink e delay',
    volume: 3,
    chapter: 5,
    icon: 'arduino',
    experiments: ['v3-cap5-esp1', 'v3-cap5-esp2']
  },
  'v3-cap6-digitali': {
    title: 'Capitolo 6 — Il mondo discreto: i pin digitali',
    concept: 'digitalWrite, digitalRead, IF/ELSE, bool e while',
    volume: 3,
    chapter: 6,
    icon: 'digital',
    experiments: ['v3-cap6-esp1', 'v3-cap6-esp2', 'v3-cap6-esp3', 'v3-cap6-esp4', 'v3-cap6-esp5', 'v3-cap6-esp6', 'v3-cap6-esp7', 'v3-cap6-esp8']
  },
  'v3-cap7-analogici': {
    title: 'Capitolo 7 — Il mondo continuo: i pin analogici',
    concept: 'analogRead, PWM, map e analogWriteResolution',
    volume: 3,
    chapter: 7,
    icon: 'analog',
    experiments: ['v3-cap7-esp1', 'v3-cap7-esp2', 'v3-cap7-esp3', 'v3-cap7-esp4', 'v3-cap7-esp5', 'v3-cap7-esp6', 'v3-cap7-esp7']
  },
  'v3-cap8-seriale': {
    title: 'Capitolo 8 — Visualizzare dati: il Monitor Seriale',
    concept: 'Serial Monitor, Serial Plotter e barra LED',
    volume: 3,
    chapter: 8,
    icon: 'serial',
    experiments: ['v3-cap8-esp1', 'v3-cap8-esp2', 'v3-cap8-esp3', 'v3-cap8-esp4', 'v3-cap8-esp5', 'v3-cap8-esp6']
  }
};

/**
 * Trova la lezione a cui appartiene un esperimento
 * @param {string} experimentId
 * @returns {{ lessonId: string, lesson: object } | null}
 */
export function findLessonForExperiment(experimentId) {
  for (const [lessonId, lesson] of Object.entries(LESSON_GROUPS)) {
    if (lesson.experiments.includes(experimentId)) {
      return { lessonId, lesson };
    }
  }
  return null;
}

/**
 * Ritorna tutte le lezioni di un volume
 * @param {number} volumeNumber
 * @returns {Array<[string, object]>}
 */
export function getLessonsForVolume(volumeNumber) {
  const entries = Object.entries(LESSON_GROUPS)
    .filter(([, l]) => l.volume === volumeNumber)
    .sort((a, b) => a[1].chapter - b[1].chapter);

  if (VISIBILITY_FILTER_DISABLED) return entries;

  // Visibility filter: drop lessons with zero visible experiments + filter
  // the inner experiments[] array to drop hidden IDs. Lesson metadata
  // (title, concept, chapter, icon) preserved unchanged.
  return entries
    .filter(([, l]) => lessonHasVisibleExperiments(l.experiments))
    .map(([lessonId, lesson]) => [
      lessonId,
      {
        ...lesson,
        experiments: lesson.experiments.filter(isVisibleExperiment),
      },
    ]);
}

/**
 * Ritorna il numero di lezioni totali
 */
export function getLessonCount() {
  return Object.keys(LESSON_GROUPS).length;
}

/**
 * Ritorna il contesto di posizione di un esperimento nel suo gruppo.
 * Es: { position: 2, total: 3, lessonTitle: "Accendi il LED", chapter: 6, volume: 1,
 *        prevExp: "v1-cap6-esp1", nextExp: "v1-cap6-esp3",
 *        narrative: "Esperimento 2 di 3 — Capitolo 6: Accendi il LED" }
 * @param {string} experimentId
 * @returns {object|null}
 */
export function getExperimentGroupContext(experimentId) {
  const result = findLessonForExperiment(experimentId);
  if (!result) return null;
  const { lesson } = result;
  const idx = lesson.experiments.indexOf(experimentId);
  if (idx === -1) return null;
  return {
    position: idx + 1,
    total: lesson.experiments.length,
    lessonTitle: lesson.title,
    concept: lesson.concept,
    chapter: lesson.chapter,
    volume: lesson.volume,
    prevExp: idx > 0 ? lesson.experiments[idx - 1] : null,
    nextExp: idx < lesson.experiments.length - 1 ? lesson.experiments[idx + 1] : null,
    narrative: `Esperimento ${idx + 1} di ${lesson.experiments.length} — Capitolo ${lesson.chapter}: ${lesson.title}`,
  };
}

export default LESSON_GROUPS;
