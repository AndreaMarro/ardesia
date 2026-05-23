/**
 * ELAB Experiments — Aggregatore e Index
 * Unisce Vol1 (38) + Vol2 (27) + Vol3 (26) = 91 esperimenti
 * © Andrea Marro — 10/02/2026
 *
 * Demo 25/05/2026: ALL_EXPERIMENTS filtrato a 7 esperimenti scelti via demo-mode.
 * Andrea 23/05/2026 PM: "nel simulatore devono esserci solo gli esperimenti che
 * abbiamo scelto, gli altri li rimetteremo."
 * Set completo accessibile via ALL_EXPERIMENTS_RAW per lookup interni
 * (findExperimentById, lesson-paths refs, narrative continuity).
 */

import EXPERIMENTS_VOL1 from './experiments-vol1';
import EXPERIMENTS_VOL2 from './experiments-vol2';
import EXPERIMENTS_VOL3 from './experiments-vol3';
import { filterDemoOnly, DEMO_MODE_ENABLED } from './demo-mode';

// Tutti i volumi in ordine (struttura preservata — demo filter applicato sotto)
export const VOLUMES = [
  EXPERIMENTS_VOL1,
  EXPERIMENTS_VOL2,
  EXPERIMENTS_VOL3,
];

// Set RAW completo 91 esp — uso interno (findExperimentById, lesson-paths, etc.)
export const ALL_EXPERIMENTS_RAW = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

// Set FILTRATO 7 esp per UI listing (palette simulatore, picker, etc.)
// Reversibile: DEMO_MODE_ENABLED=false in demo-mode.js OR svuota DEMO_EXPERIMENT_IDS.
export const ALL_EXPERIMENTS = DEMO_MODE_ENABLED
  ? filterDemoOnly(ALL_EXPERIMENTS_RAW)
  : ALL_EXPERIMENTS_RAW;

/**
 * Trova un esperimento per ID (es. "v1-cap6-esp1")
 * Risolve da RAW set per supportare riferimenti narrativi a esp non-demo
 * (next_experiment, prerequisites, etc.) senza rompere lesson-paths.
 * @param {string} id
 * @returns {object|null}
 */
export function findExperimentById(id) {
  return ALL_EXPERIMENTS_RAW.find(e => e.id === id) || null;
}

/**
 * Trova tutti gli esperimenti di un capitolo (es. "Capitolo 6")
 * @param {string} chapterSearch — stringa da cercare nel campo chapter
 * @returns {Array}
 */
function findExperimentsByChapter(chapterSearch) {
  return ALL_EXPERIMENTS_RAW.filter(e =>
    e.chapter.toLowerCase().includes(chapterSearch.toLowerCase())
  );
}

/**
 * Trova gli esperimenti di un volume (1, 2 o 3) — usa RAW set.
 * UI list filter applicato a livello ExperimentPicker tramite filterDemoOnly().
 * @param {number} volumeNumber — 1, 2 o 3
 * @returns {Array}
 */
export function getExperimentsByVolume(volumeNumber) {
  const prefix = `v${volumeNumber}-`;
  return ALL_EXPERIMENTS_RAW.filter(e => e.id.startsWith(prefix));
}

/**
 * Ottieni metadata di un volume (titolo, colore, icona)
 * @param {number} volumeNumber — 1, 2 o 3
 * @returns {object|null}
 */
function getVolumeInfo(volumeNumber) {
  return VOLUMES[volumeNumber - 1] || null;
}

/**
 * Conteggio totale esperimenti — usa RAW set (analytics, NON filter UI).
 * @returns {number}
 */
export function getTotalExperiments() {
  return ALL_EXPERIMENTS_RAW.length;
}

/**
 * Ottieni esperimenti filtrati per modalità simulazione — usa RAW set (lookup totale).
 * @param {'circuit'|'avr'} mode
 * @returns {Array}
 */
function getExperimentsByMode(mode) {
  return ALL_EXPERIMENTS_RAW.filter(e => e.simulationMode === mode);
}

/**
 * Ottieni la lista dei capitoli per un volume
 * @param {number} volumeNumber
 * @returns {Array<string>} — capitoli unici
 */
export function getChaptersForVolume(volumeNumber) {
  const experiments = getExperimentsByVolume(volumeNumber);
  const chapters = [...new Set(experiments.map(e => e.chapter))];
  return chapters;
}

/**
 * Statistiche rapide
 */
function getStats() {
  return {
    total: ALL_EXPERIMENTS_RAW.length,
    vol1: EXPERIMENTS_VOL1.experiments.length,
    vol2: EXPERIMENTS_VOL2.experiments.length,
    vol3: EXPERIMENTS_VOL3.experiments.length,
    circuitMode: ALL_EXPERIMENTS_RAW.filter(e => e.simulationMode === 'circuit').length,
    avrMode: ALL_EXPERIMENTS_RAW.filter(e => e.simulationMode === 'avr').length,
  };
}

// Export individuali per comodità
export { EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 };

export default {
  VOLUMES,
  ALL_EXPERIMENTS,
  findExperimentById,
  findExperimentsByChapter,
  getExperimentsByVolume,
  getVolumeInfo,
  getTotalExperiments,
  getExperimentsByMode,
  getChaptersForVolume,
  getStats,
};
