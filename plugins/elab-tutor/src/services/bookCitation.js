/**
 * ELAB — ensureBookCitation
 *
 * Post-processing helper that anchors UNLIM's conceptual explanations to the
 * physical ELAB book when the student is working on a known experiment.
 *
 * The old policy appended a short reference line to many conceptual answers.
 * That made UNLIM sound like a document summary. Live chat now keeps the
 * volume reference available, but cites it only when the response already
 * chose to use a useful micro-anchor.
 *
 * It must NOT turn every operational reply into a citation footer. UNLIM still
 * has to sound natural, diagnose the live circuit, and act through tags without
 * constantly repeating volume/page anchors.
 *
 * Behaviour:
 *  - If there is no experimentId or no volume reference → return unchanged.
 *  - If the reply already mentions a real page ("pagina N"/"pag. N") or a
 *    complete volume+page pair → return unchanged to avoid duplicates.
 *    "Vol. N" alone is not enough: Andrea needs exact physical-book anchors.
 *  - If the reply is operational, a short confirmation, or an action-tag
 *    payload -> return unchanged.
 *  - Otherwise return unchanged: no automatic citation footer.
 *
 * © Andrea Marro — 18/04/2026 — Ralph Loop iteration 1
 */

import { getVolumeRef } from '../data/volume-references';

// Match exact page anchors: "pagina 29", "pag. 29", "Vol. 1, pag. 29",
// "Volume 2 pagina 45", "V1P45". Do not accept "Vol. 1" without a page.
const PAGE_REGEX = /\b(pagina\s*\d+|pag\.\s*\d+|V\d+P\d+)\b/i;
const VOL_PAGE_REGEX = /\b(vol\.?|volume)\s*[1-3]\b[^.!?\n]{0,80}\b(pagina|pag\.?)\s*\d+\b/i;

export function alreadyCitesBook(text) {
  if (typeof text !== 'string') return false;
  return PAGE_REGEX.test(text) || VOL_PAGE_REGEX.test(text);
}

export function buildCitationSuffix(experimentId) {
  const volRef = getVolumeRef(experimentId);
  if (!volRef || typeof volRef.volume !== 'number' || typeof volRef.bookPage !== 'number') {
    return null;
  }
  return `(Riferimento: Vol. ${volRef.volume}, pag. ${volRef.bookPage} del libro ELAB.)`;
}

export function shouldAppendBookCitation(responseText) {
  if (typeof responseText !== 'string') return false;

  const trimmed = responseText.trim();
  if (!trimmed) return false;
  return false;
}

export function ensureBookCitation(responseText, experimentId) {
  if (typeof responseText !== 'string') return responseText;
  if (!experimentId) return responseText;
  if (alreadyCitesBook(responseText)) return responseText;
  return responseText;
}
