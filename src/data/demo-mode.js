// © Andrea Marro — 23/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Demo Mode Filter — solo 7 esperimenti selezionati visibili in UI tutor.
 *
 * Andrea ratify 2026-05-23: "nel tutor voglio solo specificare dovrenno comparire
 * solo gli esperimenti che ho selezionato e dovremo lucidare le cose solo per quelli.
 * Gli altri non vanno cancellati. solo addormentati per un po' di giorni."
 *
 * Reversibile post-demo:
 * - Imposta `VITE_DEMO_MODE_FILTER=false` in env per disattivare (mostra tutti i 92 esp)
 * - O svuota `DEMO_EXPERIMENT_IDS` (array vuoto = no filter applicato)
 * - O imposta `DEMO_MODE_ENABLED = false` direttamente qui sotto
 *
 * Lesson-paths JSON INTATTI. Esperimenti "addormentati" sopravvivono in src/data/
 * lesson-paths/*.json. Filter solo a livello UI listing components.
 *
 * Demo 25/05/2026 sera — 3 vol1 (LED cap6 esp1+esp2+esp3) + 2 vol2 (condensatori
 * cap7 esp1+esp2) + 2 vol3 (cap6 esp4 due LED alternano + esp5 semaforo).
 */

/**
 * Set DEMO_MODE_ENABLED = false per disattivare filter completamente (mostra tutti).
 * Default true durante demo period.
 */
export const DEMO_MODE_ENABLED = (
  typeof import.meta !== 'undefined'
    && import.meta.env
    && import.meta.env.VITE_DEMO_MODE_FILTER !== undefined
)
  ? import.meta.env.VITE_DEMO_MODE_FILTER !== 'false'
  : true;

/**
 * I 7 esperimenti selezionati per demo 25/05/2026.
 * Distribuzione: 3 vol1 + 2 vol2 + 2 vol3 = 7 esp, consecutivi nei volumi.
 */
export const DEMO_EXPERIMENT_IDS = [
  // Vol1 cap6 LED — 3 esperimenti
  'v1-cap6-esp1', // "Accendi il tuo primo LED"
  'v1-cap6-esp2', // "LED senza resistore (cosa NON fare!)"
  'v1-cap6-esp3', // "Cambia luminosità con resistenze diverse"

  // Vol2 cap7 Condensatori — 2 esperimenti
  'v2-cap7-esp1', // "Scarica condensatore con multimetro"
  'v2-cap7-esp2', // "Scarica condensatore con LED rosso" (magic fade demo moment)

  // Vol3 cap6 Pin digitali — 2 esperimenti
  'v3-cap6-esp4', // "Due LED che si alternano"
  'v3-cap6-esp5', // "Costruiamo un semaforo" (Vol3 pag 57)
];

/**
 * Verifica se un esperimento è visibile in demo mode.
 * @param {string} experimentId — es. "v1-cap6-esp1"
 * @returns {boolean} true se visibile (demo mode off OR id in lista demo)
 */
export function isExperimentVisible(experimentId) {
  if (!DEMO_MODE_ENABLED) return true;
  if (!Array.isArray(DEMO_EXPERIMENT_IDS) || DEMO_EXPERIMENT_IDS.length === 0) return true;
  return DEMO_EXPERIMENT_IDS.includes(experimentId);
}

/**
 * Verifica se un esperimento appartiene al set demo selezionato (3+2+2).
 * Indipendente da DEMO_MODE_ENABLED — usato per applicare "lucidatura" geometry
 * (es. Battery9V renderMode clip_simplified) ai 7 esp demo a prescindere dal filter UI.
 * @param {string} experimentId — es. "v1-cap6-esp1"
 * @returns {boolean} true se id in DEMO_EXPERIMENT_IDS
 */
export function isDemoExperiment(experimentId) {
  if (!experimentId) return false;
  return DEMO_EXPERIMENT_IDS.includes(experimentId);
}

/**
 * Filter array di esperimenti per demo mode.
 * @param {Array<{id: string}>} experiments — array oggetti con campo `id`
 * @returns {Array} array filtrato (solo demo IDs se mode on)
 */
export function filterDemoOnly(experiments) {
  if (!Array.isArray(experiments)) return experiments;
  if (!DEMO_MODE_ENABLED) return experiments;
  if (!Array.isArray(DEMO_EXPERIMENT_IDS) || DEMO_EXPERIMENT_IDS.length === 0) return experiments;
  return experiments.filter((exp) => DEMO_EXPERIMENT_IDS.includes(exp.id));
}

/**
 * Filter array di IDs esperimenti per demo mode.
 * @param {Array<string>} ids — array di ID stringhe
 * @returns {Array<string>} array filtrato
 */
export function filterDemoIds(ids) {
  if (!Array.isArray(ids)) return ids;
  if (!DEMO_MODE_ENABLED) return ids;
  if (!Array.isArray(DEMO_EXPERIMENT_IDS) || DEMO_EXPERIMENT_IDS.length === 0) return ids;
  return ids.filter((id) => DEMO_EXPERIMENT_IDS.includes(id));
}

/**
 * Verifica se un capitolo ha ALMENO un esperimento visibile in demo mode.
 * Utile per nascondere capitoli interi vuoti.
 * @param {Array<{id: string}>} experimentsInChapter — esperimenti del capitolo
 * @returns {boolean} true se almeno 1 esperimento visibile
 */
export function chapterHasVisibleExperiments(experimentsInChapter) {
  if (!Array.isArray(experimentsInChapter)) return false;
  if (!DEMO_MODE_ENABLED) return experimentsInChapter.length > 0;
  return experimentsInChapter.some((exp) => DEMO_EXPERIMENT_IDS.includes(exp.id));
}
