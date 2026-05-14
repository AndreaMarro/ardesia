// src/data/chapter-map.js
// Alias mapping: Tea's proposal for volume realignment
// Internal IDs unchanged, display names follow new chapter numbering
//
// Vol1: Cap 6-14 internal -> display Cap 2-10 (Cap 1 "Breadboard" is future)
// Vol2: Cap 3-12 internal -> display Cap 1-9
// Vol3: Cap 5-8 internal -> display Cap 1-5 (Cap 6 split OUTPUT/INPUT)

export const CHAPTER_MAP = {
  // Volume 1 — Le Basi
  'v1-cap6':  { volume: 1, displayChapter: 2, title: "Cos'e' il Diodo LED?" },
  'v1-cap7':  { volume: 1, displayChapter: 3, title: "Cos'e' il LED RGB?" },
  'v1-cap8':  { volume: 1, displayChapter: 4, title: "Cos'e' un Pulsante?" },
  'v1-cap9':  { volume: 1, displayChapter: 5, title: "Cos'e' un Potenziometro?" },
  'v1-cap10': { volume: 1, displayChapter: 6, title: "Cos'e' un Fotoresistore?" },
  'v1-cap11': { volume: 1, displayChapter: 7, title: "Cos'e' un Cicalino?" },
  'v1-cap12': { volume: 1, displayChapter: 8, title: "L'Interruttore Magnetico" },
  'v1-cap13': { volume: 1, displayChapter: 9, title: "Cos'e' l'Elettropongo?" },
  'v1-cap14': { volume: 1, displayChapter: 10, title: "Costruiamo il Nostro Primo Robot" },

  // Volume 2 — Approfondiamo
  'v2-cap3':  { volume: 2, displayChapter: 1, title: 'Il Multimetro' },
  'v2-cap4':  { volume: 2, displayChapter: 2, title: 'Approfondiamo le Resistenze' },
  'v2-cap5':  { volume: 2, displayChapter: 3, title: 'Approfondiamo le Batterie' },
  'v2-cap6':  { volume: 2, displayChapter: 4, title: 'Approfondiamo i LED' },
  'v2-cap7':  { volume: 2, displayChapter: 5, title: 'Cosa sono i Condensatori?' },
  'v2-cap8':  { volume: 2, displayChapter: 6, title: 'Cosa sono i Transistor?' },
  'v2-cap9':  { volume: 2, displayChapter: 7, title: 'Cosa sono i Fototransistor?' },
  'v2-cap10': { volume: 2, displayChapter: 8, title: 'Il Motore a Corrente Continua' },
  'v2-cap12': { volume: 2, displayChapter: 9, title: 'Robot Segui Luce' },

  // Volume 3 — Arduino
  'v3-cap5':       { volume: 3, displayChapter: 1, title: 'Il Nostro Primo Programma' },
  'v3-cap6':       { volume: 3, displayChapter: 2, title: 'I Pin Digitali (OUTPUT)' },
  'v3-cap6-input': { volume: 3, displayChapter: 3, title: 'I Pin Digitali (INPUT)',
                     sourceChapter: 'v3-cap6' },
  'v3-cap7':       { volume: 3, displayChapter: 4, title: 'I Pin Analogici' },
  'v3-cap8':       { volume: 3, displayChapter: 5, title: 'Comunicazione Seriale' },
};

// Experiment IDs that belong to Cap 6 INPUT (not OUTPUT)
const CAP6_INPUT_IDS = [];

/**
 * Get display info for an experiment ID.
 * Handles the Vol3 Cap 6 OUTPUT/INPUT split.
 *
 * @param {string} experimentId - e.g. "v3-cap6-esp1", "v3-cap6-morse"
 * @returns {{ volume: number, displayChapter: number, title: string } | null}
 */
export function getDisplayInfo(experimentId) {
  if (!experimentId || typeof experimentId !== 'string') return null;

  // Vol3 Cap 6 INPUT split: esp5 is an INPUT experiment
  if (CAP6_INPUT_IDS.includes(experimentId)) {
    return CHAPTER_MAP['v3-cap6-input'];
  }

  // General case: strip experiment suffix to get chapter key
  // v1-cap6-esp1 -> v1-cap6
  // v3-cap6-morse -> v3-cap6
  // v3-cap6-semaforo -> v3-cap6
  const chapterKey = experimentId
    .replace(/-esp\d+.*$/, '')
    .replace(/-morse$/, '')
    .replace(/-semaforo$/, '');

  return CHAPTER_MAP[chapterKey] || null;
}

/**
 * Get all chapters for a volume, sorted by displayChapter.
 *
 * @param {number} volumeNumber - 1, 2, or 3
 * @returns {Array<{ key: string, volume: number, displayChapter: number, title: string }>}
 */
export function getVolumeChapters(volumeNumber) {
  return Object.entries(CHAPTER_MAP)
    .filter(([, v]) => v.volume === volumeNumber)
    .sort((a, b) => a[1].displayChapter - b[1].displayChapter)
    .map(([key, val]) => ({ key, ...val }));
}
