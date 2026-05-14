/**
 * ELAB Lesson Paths — Indice percorsi lezione UNLIM
 * Ogni esperimento ha un percorso 5-step: PREPARA → MOSTRA → CHIEDI → OSSERVA → CONCLUDI
 * Generati dal curriculum YAML + dati esperimenti.
 * © Andrea Marro — 27/03/2026
 */

// Volume 1 — Le Basi
import v1Cap6Esp1 from './v1-cap6-esp1.json';
import v1Cap6Esp2 from './v1-cap6-esp2.json';
import v1Cap6Esp3 from './v1-cap6-esp3.json';
import v1Cap7Esp1 from './v1-cap7-esp1.json';
import v1Cap7Esp2 from './v1-cap7-esp2.json';
import v1Cap7Esp3 from './v1-cap7-esp3.json';
import v1Cap7Esp4 from './v1-cap7-esp4.json';
import v1Cap7Esp5 from './v1-cap7-esp5.json';
import v1Cap7Esp6 from './v1-cap7-esp6.json';
import v1Cap8Esp1 from './v1-cap8-esp1.json';
import v1Cap8Esp2 from './v1-cap8-esp2.json';
import v1Cap8Esp3 from './v1-cap8-esp3.json';
import v1Cap8Esp4 from './v1-cap8-esp4.json';
import v1Cap8Esp5 from './v1-cap8-esp5.json';
import v1Cap9Esp1 from './v1-cap9-esp1.json';
import v1Cap9Esp2 from './v1-cap9-esp2.json';
import v1Cap9Esp3 from './v1-cap9-esp3.json';
import v1Cap9Esp4 from './v1-cap9-esp4.json';
import v1Cap9Esp5 from './v1-cap9-esp5.json';
import v1Cap9Esp6 from './v1-cap9-esp6.json';
import v1Cap9Esp7 from './v1-cap9-esp7.json';
import v1Cap9Esp8 from './v1-cap9-esp8.json';
import v1Cap9Esp9 from './v1-cap9-esp9.json';
import v1Cap10Esp1 from './v1-cap10-esp1.json';
import v1Cap10Esp2 from './v1-cap10-esp2.json';
import v1Cap10Esp3 from './v1-cap10-esp3.json';
import v1Cap10Esp4 from './v1-cap10-esp4.json';
import v1Cap10Esp5 from './v1-cap10-esp5.json';
import v1Cap10Esp6 from './v1-cap10-esp6.json';
import v1Cap11Esp1 from './v1-cap11-esp1.json';
import v1Cap11Esp2 from './v1-cap11-esp2.json';
import v1Cap12Esp1 from './v1-cap12-esp1.json';
import v1Cap12Esp2 from './v1-cap12-esp2.json';
import v1Cap12Esp3 from './v1-cap12-esp3.json';
import v1Cap12Esp4 from './v1-cap12-esp4.json';
import v1Cap13Esp1 from './v1-cap13-esp1.json';
import v1Cap13Esp2 from './v1-cap13-esp2.json';
import v1Cap14Esp1 from './v1-cap14-esp1.json';

// Volume 2 — Approfondiamo
import v2Cap3Esp1 from './v2-cap3-esp1.json';
import v2Cap3Esp2 from './v2-cap3-esp2.json';
import v2Cap3Esp3 from './v2-cap3-esp3.json';
import v2Cap3Esp4 from './v2-cap3-esp4.json';
import v2Cap4Esp1 from './v2-cap4-esp1.json';
import v2Cap4Esp2 from './v2-cap4-esp2.json';
import v2Cap4Esp3 from './v2-cap4-esp3.json';
import v2Cap5Esp1 from './v2-cap5-esp1.json';
import v2Cap5Esp2 from './v2-cap5-esp2.json';
import v2Cap6Esp1 from './v2-cap6-esp1.json';
import v2Cap6Esp2 from './v2-cap6-esp2.json';
import v2Cap6Esp3 from './v2-cap6-esp3.json';
import v2Cap6Esp4 from './v2-cap6-esp4.json';
import v2Cap7Esp1 from './v2-cap7-esp1.json';
import v2Cap7Esp2 from './v2-cap7-esp2.json';
import v2Cap7Esp3 from './v2-cap7-esp3.json';
import v2Cap7Esp4 from './v2-cap7-esp4.json';
import v2Cap8Esp1 from './v2-cap8-esp1.json';
import v2Cap8Esp2 from './v2-cap8-esp2.json';
import v2Cap8Esp3 from './v2-cap8-esp3.json';
import v2Cap9Esp1 from './v2-cap9-esp1.json';
import v2Cap9Esp2 from './v2-cap9-esp2.json';
import v2Cap10Esp1 from './v2-cap10-esp1.json';
import v2Cap10Esp2 from './v2-cap10-esp2.json';
import v2Cap10Esp3 from './v2-cap10-esp3.json';
import v2Cap10Esp4 from './v2-cap10-esp4.json';
import v2Cap12Esp1 from './v2-cap12-esp1.json';

// Volume 3 — Arduino Programmato
import v3Cap5Esp1 from './v3-cap5-esp1.json';
import v3Cap5Esp2 from './v3-cap5-esp2.json';
import v3Cap6Esp1 from './v3-cap6-esp1.json';
import v3Cap6Esp2 from './v3-cap6-esp2.json';
import v3Cap6Esp3 from './v3-cap6-esp3.json';
import v3Cap6Esp4 from './v3-cap6-esp4.json';
import v3Cap6Esp5 from './v3-cap6-esp5.json';
import v3Cap6Morse from './v3-cap6-morse.json';
import v3Cap6Semaforo from './v3-cap6-semaforo.json';
import v3Cap7Esp1 from './v3-cap7-esp1.json';
import v3Cap7Esp2 from './v3-cap7-esp2.json';
import v3Cap7Esp3 from './v3-cap7-esp3.json';
import v3Cap7Esp6 from './v3-cap7-esp6.json';
import v3Cap8Esp1 from './v3-cap8-esp1.json';
import v3Cap8Esp2 from './v3-cap8-esp2.json';
import v3Cap8Esp3 from './v3-cap8-esp3.json';

// Registry percorsi lezione disponibili — 81 totali
const LESSON_PATHS = {
  // Volume 1 — Le Basi (38 esperimenti)
  'v1-cap6-esp1': v1Cap6Esp1,
  'v1-cap6-esp2': v1Cap6Esp2,
  'v1-cap6-esp3': v1Cap6Esp3,
  'v1-cap7-esp1': v1Cap7Esp1,
  'v1-cap7-esp2': v1Cap7Esp2,
  'v1-cap7-esp3': v1Cap7Esp3,
  'v1-cap7-esp4': v1Cap7Esp4,
  'v1-cap7-esp5': v1Cap7Esp5,
  'v1-cap7-esp6': v1Cap7Esp6,
  'v1-cap8-esp1': v1Cap8Esp1,
  'v1-cap8-esp2': v1Cap8Esp2,
  'v1-cap8-esp3': v1Cap8Esp3,
  'v1-cap8-esp4': v1Cap8Esp4,
  'v1-cap8-esp5': v1Cap8Esp5,
  'v1-cap9-esp1': v1Cap9Esp1,
  'v1-cap9-esp2': v1Cap9Esp2,
  'v1-cap9-esp3': v1Cap9Esp3,
  'v1-cap9-esp4': v1Cap9Esp4,
  'v1-cap9-esp5': v1Cap9Esp5,
  'v1-cap9-esp6': v1Cap9Esp6,
  'v1-cap9-esp7': v1Cap9Esp7,
  'v1-cap9-esp8': v1Cap9Esp8,
  'v1-cap9-esp9': v1Cap9Esp9,
  'v1-cap10-esp1': v1Cap10Esp1,
  'v1-cap10-esp2': v1Cap10Esp2,
  'v1-cap10-esp3': v1Cap10Esp3,
  'v1-cap10-esp4': v1Cap10Esp4,
  'v1-cap10-esp5': v1Cap10Esp5,
  'v1-cap10-esp6': v1Cap10Esp6,
  'v1-cap11-esp1': v1Cap11Esp1,
  'v1-cap11-esp2': v1Cap11Esp2,
  'v1-cap12-esp1': v1Cap12Esp1,
  'v1-cap12-esp2': v1Cap12Esp2,
  'v1-cap12-esp3': v1Cap12Esp3,
  'v1-cap12-esp4': v1Cap12Esp4,
  'v1-cap13-esp1': v1Cap13Esp1,
  'v1-cap13-esp2': v1Cap13Esp2,
  'v1-cap14-esp1': v1Cap14Esp1,

  // Volume 2 — Approfondiamo (27 esperimenti)
  'v2-cap3-esp1': v2Cap3Esp1,
  'v2-cap3-esp2': v2Cap3Esp2,
  'v2-cap3-esp3': v2Cap3Esp3,
  'v2-cap3-esp4': v2Cap3Esp4,
  'v2-cap4-esp1': v2Cap4Esp1,
  'v2-cap4-esp2': v2Cap4Esp2,
  'v2-cap4-esp3': v2Cap4Esp3,
  'v2-cap5-esp1': v2Cap5Esp1,
  'v2-cap5-esp2': v2Cap5Esp2,
  'v2-cap6-esp1': v2Cap6Esp1,
  'v2-cap6-esp2': v2Cap6Esp2,
  'v2-cap6-esp3': v2Cap6Esp3,
  'v2-cap6-esp4': v2Cap6Esp4,
  'v2-cap7-esp1': v2Cap7Esp1,
  'v2-cap7-esp2': v2Cap7Esp2,
  'v2-cap7-esp3': v2Cap7Esp3,
  'v2-cap7-esp4': v2Cap7Esp4,
  'v2-cap8-esp1': v2Cap8Esp1,
  'v2-cap8-esp2': v2Cap8Esp2,
  'v2-cap8-esp3': v2Cap8Esp3,
  'v2-cap9-esp1': v2Cap9Esp1,
  'v2-cap9-esp2': v2Cap9Esp2,
  'v2-cap10-esp1': v2Cap10Esp1,
  'v2-cap10-esp2': v2Cap10Esp2,
  'v2-cap10-esp3': v2Cap10Esp3,
  'v2-cap10-esp4': v2Cap10Esp4,
  'v2-cap12-esp1': v2Cap12Esp1,

  // Volume 3 — Arduino Programmato (14 esperimenti)
  'v3-cap5-esp1': v3Cap5Esp1,
  'v3-cap5-esp2': v3Cap5Esp2,
  'v3-cap6-esp1': v3Cap6Esp1,
  'v3-cap6-esp2': v3Cap6Esp2,
  'v3-cap6-esp3': v3Cap6Esp3,
  'v3-cap6-esp4': v3Cap6Esp4,
  'v3-cap6-esp5': v3Cap6Esp5,
  'v3-cap6-morse': v3Cap6Morse,
  'v3-cap6-semaforo': v3Cap6Semaforo,
  'v3-cap7-esp1': v3Cap7Esp1,
  'v3-cap7-esp2': v3Cap7Esp2,
  'v3-cap7-esp3': v3Cap7Esp3,
  'v3-cap7-esp6': v3Cap7Esp6,
  'v3-cap8-esp1': v3Cap8Esp1,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  'v3-cap8-esp2': v3Cap8Esp2,
  'v3-cap8-esp3': v3Cap8Esp3,
};

/**
 * Ottieni il percorso lezione per un esperimento
 * @param {string} experimentId - es. "v1-cap6-esp1"
 * @returns {object|null} percorso lezione o null se non disponibile
 */
export function getLessonPath(experimentId) {
  return LESSON_PATHS[experimentId] || null;
}

/**
 * Controlla se un percorso lezione è disponibile
 * @param {string} experimentId
 * @returns {boolean}
 */
export function hasLessonPath(experimentId) {
  return experimentId in LESSON_PATHS;
}

/**
 * Ottieni la lista degli esperimenti con percorso lezione
 * @returns {string[]}
 */
export function getAvailableLessonPaths() {
  return Object.keys(LESSON_PATHS);
}

/**
 * Nomi delle 5 fasi standard
 */
export const PHASE_NAMES = ['PREPARA', 'MOSTRA', 'CHIEDI', 'OSSERVA', 'CONCLUDI'];
export const PHASE_ICONS = [null, null, null, null, null];

export default LESSON_PATHS;
