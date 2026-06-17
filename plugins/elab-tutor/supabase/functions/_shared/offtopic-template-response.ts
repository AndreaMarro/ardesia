/**
 * offtopic-template-response — Sprint U iter 25 P0-C
 *
 * Deterministic, ZERO-LLM template builder that emits the canonical
 * "gentle bridge" off-topic redirect per Andrea iter 21 mandate:
 *
 *   "deve riportare al focus del discorso LENTAMENTE — NON brutal rejection."
 *
 * 3-step pattern (replicated from `unlim-chat/index.ts:262-289` so we can
 * apply it server-side WITHOUT calling the LLM at all):
 *   1. Acknowledge — type-specific empathic line ("Ragazzi, capisco la passione
 *      per lo sport...").
 *   2. Bridge — soft pivot ("Però adesso siamo dentro il nostro percorso ELAB
 *      — qui ci occupiamo di elettronica e Arduino").
 *   3. Recall / Proposta — if `sessionContext.lastExperimentId` is present,
 *      recall that experiment with Vol/cap. citation; otherwise propose the
 *      canonical first LED of Vol.1 cap.6.
 *
 * PRINCIPIO ZERO compliance enforced:
 *   - Plurale "Ragazzi," opener MANDATORY on every variant.
 *   - Vol/pag citation VERBATIM when sessionContext provides volume+chapter.
 *   - Max 120 words (Andrea iter 20 PM rule, supersedes iter pre-15 60-word).
 *
 * Cat D 37.5% regression context: iter 24 dim-1 LIVE prod bench measured the
 * canonical gentle-bridge rate at 37.5% (vs iter 5 P3 91.80% baseline).
 * The LLM was answering off-topic content directly. This template restores
 * the 3-step bridge via pre-LLM short-circuit (deterministic, no drift).
 *
 * (c) Andrea Marro 2026-05-11 — ELAB Tutor
 */

import type { OfftopicType } from './onniscenza-classifier.ts';

/**
 * Optional session context passed by the orchestrator (`unlim-chat/index.ts`)
 * after calling `loadStudentContext(sessionId)`. When `lastExperimentId` is
 * present, the recall variant cites the verbatim Vol/cap. so the docente
 * can pick up the lesson from where the class left off.
 */
export interface OfftopicSessionContext {
  /** Last experiment id the class worked on (e.g. "v1-cap6-esp1"). */
  lastExperimentId?: string;
  /** Volume number (1 | 2 | 3) — used for "Vol.X" citation. */
  currentVolume?: number | string;
  /** Chapter number — used for "cap.Y" citation. */
  currentChapter?: number | string;
}

/**
 * Type-specific acknowledge bank. Each variant:
 *   - Opens with "Ragazzi," (PRINCIPIO ZERO plurale)
 *   - Acknowledges the off-topic curiosity empathically
 *   - Stays short (≤ 12 words) so the full response fits the 120-word cap
 *
 * NB: NO PII leakage in any variant (no names, no school refs, no kit serials).
 *
 * Mapped 1:1 to `OfftopicType` from `onniscenza-classifier.ts`.
 */
const ACKNOWLEDGE_BY_TYPE: Record<OfftopicType, string> = {
  sport: 'Ragazzi, capisco la passione per lo sport! È bello avere altre passioni.',
  math: 'Ragazzi, bella curiosità matematica!',
  history: 'Ragazzi, bella domanda di cultura generale!',
  culture: 'Ragazzi, capisco la curiosità!',
  cooking: 'Ragazzi, la cucina è una bella passione!',
  translation: 'Ragazzi, capisco la curiosità linguistica!',
  celebrity: 'Ragazzi, capisco la curiosità sui personaggi famosi!',
  generic: 'Ragazzi, è una bella curiosità!',
};

/**
 * Canonical bridge sentence — IDENTICAL to `unlim-chat/index.ts:285` so the
 * R5/R6 bench scorer can match the same regex across pre-LLM (template) and
 * mid-LLM (system-prompt fallback) paths.
 */
const BRIDGE = 'Però adesso siamo dentro il nostro percorso ELAB — qui ci occupiamo di elettronica e Arduino.';

/**
 * Fallback proposta when no session context is available (first-time class
 * tap, sessionId fresh, or `loadStudentContext` Promise.race timed out). The
 * canonical first LED of Vol.1 cap.6 is the universal starting point per
 * the 27 Lezioni curriculum.
 */
const FALLBACK_PROPOSTA = ' Volete iniziare un esperimento sul kit ELAB? Possiamo cominciare con il primo LED del Vol.1 cap.6, oppure scegliete voi.';

/**
 * Word counter aligned with `principio-zero-validator` semantics — counts
 * tokens that contain at least one letter / digit. Used for the 120-word
 * defensive cap (truncates last-word boundary). Defensive on null/empty.
 */
function countWords(s: string): number {
  if (!s) return 0;
  return s.split(/\s+/).filter((w) => w.length > 0 && /[\p{L}\p{N}]/u.test(w)).length;
}

/**
 * Truncate to ≤ `maxWords` words at the nearest space boundary, preserving
 * trailing punctuation by appending an ellipsis if truncation actually
 * happened. Used as a defensive belt-and-braces against future variant
 * additions exceeding the cap.
 */
function capToWords(s: string, maxWords: number): string {
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Build the off-topic gentle-bridge response (3-step deterministic template).
 *
 * @param offtopicType  fine-grained sub-classification from
 *                      `classifyOfftopicType` (sport/math/history/culture/
 *                      cooking/translation/celebrity/generic). Unknown values
 *                      degrade to 'generic'.
 * @param sessionContext optional last-experiment recall. When `lastExperimentId`
 *                       is present AND `currentVolume`+`currentChapter` are
 *                       known, emits a Vol.X cap.Y citation. Missing volume
 *                       or chapter falls back to "?" placeholder (mirrors
 *                       `unlim-chat/index.ts:287`).
 * @returns full response string, max 120 words, plurale "Ragazzi," opener
 *          guaranteed, PRINCIPIO ZERO compliant. NEVER throws.
 *
 * @example
 *   buildOfftopicGentleBridge('sport', { lastExperimentId: 'v1-cap6-esp1',
 *     currentVolume: 1, currentChapter: 6 })
 *   // → "Ragazzi, capisco la passione per lo sport! ... Però adesso siamo
 *   //    dentro il nostro percorso ELAB — qui ci occupiamo di elettronica
 *   //    e Arduino. Ricordate? Stavamo lavorando su v1-cap6-esp1 (Vol.1
 *   //    cap.6). Riprendiamo da lì insieme? [AZIONE:loadexp:v1-cap6-esp1]"
 */
export function buildOfftopicGentleBridge(
  offtopicType: OfftopicType | string | null | undefined,
  sessionContext?: OfftopicSessionContext | null,
): string {
  // Defensive type resolution — unknown / null / undefined → 'generic'
  const safeType: OfftopicType =
    (offtopicType && (offtopicType as OfftopicType) in ACKNOWLEDGE_BY_TYPE
      ? (offtopicType as OfftopicType)
      : 'generic');

  const acknowledge = ACKNOWLEDGE_BY_TYPE[safeType];

  const hasSession = !!(sessionContext && sessionContext.lastExperimentId);
  let recall: string;
  if (hasSession) {
    const expId = sessionContext!.lastExperimentId!;
    const vol = sessionContext!.currentVolume ?? '?';
    const cap = sessionContext!.currentChapter ?? '?';
    recall = ` Ricordate? Stavamo lavorando su ${expId} (Vol.${vol} cap.${cap}). Riprendiamo da lì insieme? [AZIONE:loadexp:${expId}]`;
  } else {
    recall = FALLBACK_PROPOSTA;
  }

  const full = `${acknowledge} ${BRIDGE}${recall}`;

  // Defensive 120-word cap (Andrea iter 20 PM rule). Current longest variant
  // (sport + session recall) ~ 55 words, so this is belt-and-braces.
  if (countWords(full) > 120) {
    return capToWords(full, 120);
  }
  return full;
}

/** Module version marker — orchestration handoff. */
export const OFFTOPIC_TEMPLATE_VERSION = '1.0-iter25-sprint-u-cat-d-fix';
