/**
 * ELAB Experiments — Aggregatore e Index
 * Unisce Vol1 (38) + Vol2 (27) + Vol3 (26) = 91 esperimenti
 * © Andrea Marro — 10/02/2026
 */

import EXPERIMENTS_VOL1 from './experiments-vol1';
import EXPERIMENTS_VOL2 from './experiments-vol2';
import EXPERIMENTS_VOL3 from './experiments-vol3';

// Tutti i volumi in ordine
export const VOLUMES = [
  EXPERIMENTS_VOL1,
  EXPERIMENTS_VOL2,
  EXPERIMENTS_VOL3,
];

// Tutti gli esperimenti flat
export const ALL_EXPERIMENTS = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

/**
 * Trova un esperimento per ID (es. "v1-cap6-esp1")
 * @param {string} id
 * @returns {object|null}
 */
export function findExperimentById(id) {
  return ALL_EXPERIMENTS.find(e => e.id === id) || null;
}

/**
 * Trova tutti gli esperimenti di un capitolo (es. "Capitolo 6")
 * @param {string} chapterSearch — stringa da cercare nel campo chapter
 * @returns {Array}
 */
function findExperimentsByChapter(chapterSearch) {
  return ALL_EXPERIMENTS.filter(e =>
    e.chapter.toLowerCase().includes(chapterSearch.toLowerCase())
  );
}

/**
 * Trova gli esperimenti di un volume (1, 2 o 3)
 * @param {number} volumeNumber — 1, 2 o 3
 * @returns {Array}
 */
export function getExperimentsByVolume(volumeNumber) {
  const prefix = `v${volumeNumber}-`;
  return ALL_EXPERIMENTS.filter(e => e.id.startsWith(prefix));
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
 * Conteggio totale esperimenti
 * @returns {number}
 */
export function getTotalExperiments() {
  return ALL_EXPERIMENTS.length;
}

/**
 * Ottieni esperimenti filtrati per modalità simulazione
 * @param {'circuit'|'avr'} mode
 * @returns {Array}
 */
function getExperimentsByMode(mode) {
  return ALL_EXPERIMENTS.filter(e => e.simulationMode === mode);
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
    total: ALL_EXPERIMENTS.length,
    vol1: EXPERIMENTS_VOL1.experiments.length,
    vol2: EXPERIMENTS_VOL2.experiments.length,
    vol3: EXPERIMENTS_VOL3.experiments.length,
    circuitMode: ALL_EXPERIMENTS.filter(e => e.simulationMode === 'circuit').length,
    avrMode: ALL_EXPERIMENTS.filter(e => e.simulationMode === 'avr').length,
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
