/**
 * ELAB — ensureBookCitation
 *
 * Post-processing helper that anchors UNLIM's conceptual explanations to the
 * physical ELAB book when the student is working on a known experiment.
 *
 * UNLIM must keep the physical book visible when answering inside a known
 * experiment. The helper appends a short Vol./pag. anchor only when the reply
 * has not already cited the book and is not an action payload.
 *
 * It must NOT alter action-tag payloads. UNLIM still has to act through tags
 * without putting citation text inside command-only responses.
 *
 * Behaviour:
 *  - If there is no experimentId or no volume reference → return unchanged.
 *  - If the reply already mentions a real page ("pagina N"/"pag. N") or a
 *    complete volume+page pair → return unchanged to avoid duplicates.
 *    "Vol. N" alone is not enough: Andrea needs exact physical-book anchors.
 *  - If the reply is a short confirmation or contains an action-tag
 *    payload -> return unchanged.
 *  - Otherwise append one short physical-book anchor.
 *
 * © Andrea Marro — 18/04/2026 — Ralph Loop iteration 1
 */

import { getVolumeRef } from '../../../../packs/elab-tutor/data/volume-references';

// Match exact page anchors: "pagina 29", "pag. 29", "Vol. 1, pag. 29",
// "Volume 2 pagina 45", "V1P45". Do not accept "Vol. 1" without a page.
const PAGE_REGEX = /\b(pagina\s*\d+|pag\.\s*\d+|V\d+P\d+)\b/i;
const VOL_PAGE_REGEX = /\b(vol\.?|volume)\s*[1-3]\b[^.!?\n]{0,80}\b(pagina|pag\.?)\s*\d+\b/i;
const ACTION_TAG_REGEX = /\[AZIONE:[^\]]+\]/i;
const SHORT_CONFIRMATION_REGEX = /^(ok|perfetto|fatto|certo|va bene|bravi|ottimo)[!. ]*$/i;

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
  if (alreadyCitesBook(trimmed)) return false;
  if (ACTION_TAG_REGEX.test(trimmed)) return false;
  if (SHORT_CONFIRMATION_REGEX.test(trimmed) || trimmed.length < 24) return false;
  return true;
}

export function ensureBookCitation(responseText, experimentId) {
  if (typeof responseText !== 'string') return responseText;
  if (!experimentId) return responseText;
  if (alreadyCitesBook(responseText)) return responseText;
  if (!shouldAppendBookCitation(responseText)) return responseText;
  const suffix = buildCitationSuffix(experimentId);
  if (!suffix) return responseText;
  const separator = responseText.endsWith('\n') ? '' : '\n';
  return `${responseText}${separator}${suffix}`;
}
