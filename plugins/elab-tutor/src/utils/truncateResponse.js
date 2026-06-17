/**
 * UNLIM Response Cleaner — tronca risposte lunghe e rimuove hallucination.
 * Target: ≤120 parole (feedback 2026-05-10), analogie OPZIONALI, plurale + Vol/pag.
 *
 * iter 45 fix Andrea video2 06/05/2026 B7: i tag [AZIONE:...] e [INTENT:...]
 * NON devono finire in UI ("UNLIM SPIEGA L'ESPERIMENTO" mostrava raw
 * "[AZIONE:highlightComponent:{...}] [AZIONE:askUNLIM:...]" — Andrea screenshot).
 * I tag sono consumati lato browser dal dispatcher (intentsDispatcher.js iter 36
 * + 62-tool registry iter 31). Sono side-effect runtime, MAI testo visibile docente.
 *
 * © Andrea Marro — 31/03/2026 — modified iter 45
 */

/**
 * Pulisce e tronca un testo di risposta UNLIM.
 * @param {string} text — testo grezzo della risposta
 * @param {number} maxWords — massimo numero di parole (default 120, feedback 2026-05-10)
 * @returns {string} testo pulito e troncato
 */
export function cleanAndTruncate(text, maxWords = 120) {
  if (!text) return '';

  // Rimuovi hallucination "Ho analizzato l'immagine che hai inviato"
  let cleaned = text.replace(/Ho analizzato l['']immagine che hai inviato\.?\s*/gi, '');

  // iter 45 B7 fix: STRIP COMPLETO [AZIONE:...] + [INTENT:...] + [STRUCTURED:...]
  // dal testo visibile. Tags consumati dal dispatcher → mai mostrati al docente.
  cleaned = cleaned
    .replace(/\[AZIONE:[^\]]+\]/g, '')
    .replace(/\[INTENT:[^\]]+\]/g, '')
    .replace(/\[STRUCTURED:[^\]]+\]/g, '')
    // Pulizia residual whitespace + virgole orfane post-strip multi-tag
    .replace(/[\s,;]+(\.|$)/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Tronca a maxWords parole
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= maxWords) return words.join(' ');
  return words.slice(0, maxWords).join(' ') + '...';
}
