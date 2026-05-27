// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * experiment-visibility — Whitelist UI filter for Lavagna pickers.
 *
 * Andrea verbatim 25/05/2026 PM: "nascondi tutti quelli (con possibilità
 * di farli tornare tutti) tranne i primi 3 volume 1 + pwm crea tuo
 * colore, volume 2 i primi 2 sul condensatore volume tre lampeggiante
 * e semaforo. ASSICURATI DI POTERE RESUSCITARE TUTTO. DOCUMENTA QUESTE
 * COSE NEL MINIMO DETTAGLIO."
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ FONTE UNICA DI VERITÀ per visibilità esperimenti in UI.         │
 * │ Tutte le pickers (LessonSelector, ExperimentPicker,             │
 * │ PercorsoCapitoloView) leggono qui per decidere cosa mostrare.   │
 * │                                                                 │
 * │ ZERO modifica a experiments-vol1/2/3.js — i dati esperimento    │
 * │ restano INTATTI. Per "resuscitare" un esperimento basta         │
 * │ aggiungere il suo ID alla lista VISIBLE_EXP_IDS sotto.          │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * COME RIPRISTINARE TUTTI GLI ESPERIMENTI (rollback completo):
 *   1. Aprire questo file
 *   2. Sostituire VISIBLE_EXP_IDS con `RESTORE_ALL` (vedi sotto)
 *   3. npm run build && deploy
 *
 * COME AGGIUNGERE UN SINGOLO ESPERIMENTO:
 *   1. Aggiungere il suo ID al VISIBLE_EXP_IDS array sotto
 *   2. (Opzionale) Verificare che il lesson group corrispondente
 *      compaia in lesson-groups.js getLessonsForVolume output
 *
 * COME NASCONDERE UN ESPERIMENTO ATTUALMENTE VISIBILE:
 *   1. Rimuovere il suo ID da VISIBLE_EXP_IDS
 *
 * DOCUMENTAZIONE COMPLETA con elenco hidden + perché:
 *   docs/HIDDEN-EXPERIMENTS-RESTORE.md
 */

/**
 * Esperimenti VISIBILI nelle picker UI. Selezione Andrea 25/05/2026 PM:
 * - Vol1: primi 3 (cap 6 - basi LED) + PWM crea tuo colore (cap 7 esp 6)
 * - Vol2: primi 2 sul condensatore (cap 7 esp 1 + esp 2)
 * - Vol3: lampeggiante (cap 5 esp 1) + semaforo (cap 6 esp 5)
 *
 * Totale: 8 esperimenti visibili (su 94 totali ALL_EXPERIMENTS).
 */
export const VISIBLE_EXP_IDS = Object.freeze([
  // ── VOLUME 1 — Le Basi ──
  'v1-cap6-esp1', // Accendi il tuo primo LED
  'v1-cap6-esp2', // LED senza resistore (cosa NON fare!)
  'v1-cap6-esp3', // Cambia luminosità con resistenze diverse
  'v1-cap9-esp6', // Lampada RGB con 3 potenziometri (PWM mix R+G+B)

  // ── VOLUME 2 — Approfondiamo ──
  'v2-cap7-esp1', // Carica del condensatore con multimetro
  'v2-cap7-esp2', // Scarica con LED rosso

  // ── VOLUME 3 — Programmazione Arduino ──
  'v3-cap6-esp4', // Due LED che si alternano (tipo sirena pin 6+9)
  'v3-cap6-esp5', // Costruiamo un semaforo
]);

/**
 * Helper boolean — true se l'esperimento è visibile, false altrimenti.
 * @param {string} expId — es. 'v1-cap6-esp1'
 * @returns {boolean}
 */
export function isVisibleExperiment(expId) {
  return VISIBLE_EXP_IDS.includes(expId);
}

/**
 * Helper — filtra un array di esperimenti tenendo solo i visibili.
 * @param {Array<{id: string}>} experiments
 * @returns {Array}
 */
export function filterVisibleExperiments(experiments) {
  if (!Array.isArray(experiments)) return [];
  return experiments.filter((e) => e && isVisibleExperiment(e.id));
}

/**
 * Helper — filtra un array di lesson group IDs (stringhe) tenendo solo
 * quelle con almeno UN esperimento visibile.
 * @param {Array<string>} expIds — es. ['v1-cap6-esp1', 'v1-cap6-esp2']
 * @returns {boolean} — true se almeno un esp visibile, false altrimenti
 */
export function lessonHasVisibleExperiments(expIds) {
  if (!Array.isArray(expIds)) return false;
  return expIds.some(isVisibleExperiment);
}

/**
 * SENTINEL — usato per ripristino totale: sostituisci VISIBLE_EXP_IDS
 * con RESTORE_ALL (importato + spread) per mostrare TUTTI gli esperimenti.
 *
 * Uso emergenza:
 *   export const VISIBLE_EXP_IDS = RESTORE_ALL;
 *
 * Letto da experiments-index.js a runtime per generare lista completa.
 */
export const RESTORE_ALL = null; // null = "no filter, show all"

/**
 * Quando true, il filtro è disabilitato e TUTTI gli esperimenti sono
 * visibili. Utile per dev/debug. NON impostare a true in produzione
 * senza coordinarsi con Andrea — perderemo il subset demo.
 */
export const VISIBILITY_FILTER_DISABLED = false;
