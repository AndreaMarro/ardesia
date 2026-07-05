/**
 * Volume Citation — sostanza dati della citazione "Vol.N pag.M" (slice S3).
 *
 * Unica fonte della grammatica citazione volume/pagina condivisa da:
 *   - book_reference.label nei lesson-path del Pack (data/lesson-paths/),
 *   - il badge VolumeCitation del Simulation Plugin,
 *   - il contratto Core BoardCitation/ManualRef (apps/studio/src/core/contracts/).
 *
 * Solo dato + funzioni pure: niente React, niente servizi (regole Pack, README).
 */

export const VALID_VOLUMES = Object.freeze([1, 2, 3]);

/**
 * Una citazione e' valida solo per i volumi ELAB reali (1-3) e pagine positive.
 * @param {unknown} volume
 * @param {unknown} page
 * @returns {boolean}
 */
export function isValidVolumeCitation(volume, page) {
  return VALID_VOLUMES.includes(volume) && typeof page === 'number' && page > 0;
}

/**
 * Grammatica canonica dell'etichetta: "Vol.N pag.M" (stessa dei lesson-path).
 * @param {number} volume
 * @param {number} page
 * @returns {string}
 */
export function formatVolumeCitationLabel(volume, page) {
  return `Vol.${volume} pag.${page}`;
}
