/**
 * Nanobot V2 — AI Model Router
 * Routes messages to the optimal Gemini model based on live-class constraints.
 * Live UNLIM must be fast and operational; Pro is deliberately avoided here.
 * (c) Andrea Marro — 02/04/2026
 *
 * iter 43 (2026-05-13): added THINKING_KEYWORDS promotion → 'gemini-2.5-pro'.
 * Upstream sets `options.thinkingLevel = 'medium'` when routeModel returns Pro
 * (unlim-chat/index.ts:779), which is consumed by the Vertex EU short-circuit
 * (llm-client.ts:392-415) to pick `gemini-2.5-pro` with deep reasoning.
 * Fixes iter 41 bench bug #2 (chat_thinking 9/10 routed Flash-Lite instead of
 * Pro). Keyword regex tight by design — cost discipline (Pro ~5x Flash-Lite).
 */

import type { GeminiModel, CircuitState } from './types.ts';

// Keywords that indicate medium complexity (→ Flash)
const FLASH_KEYWORDS = /spiega|come funziona|differenza|confronta|progetta|perch[eé]|ragion|principio|legge|formula|calcola|analogia|esempio/i;

// Keywords that indicate high complexity in offline analysis.
// Live chat still routes these to Flash; Pro was causing slow tails/timeouts.
const PRO_KEYWORDS = /analizza|debug|perch[eé] non|errore complesso|non capisco perch|dove sbaglio|trova il problema|circuito non funziona/i;

// iter 43 — Deep-thinking keywords promote to Gemini 2.5 Pro (Vertex EU).
// Tight regex by design: each alternative is either a low-FP unigram
// ("approfondisci") or a verb+phrase pair ("spiegami nel dettaglio",
// "analizza nel dettaglio") so generic Flash queries are NOT promoted.
// Estimated promotion rate <5% of live traffic (cost-safe vs Flash-Lite).
// NB: trailing `\b` is intentionally omitted on alternatives ending in `à`
// because JavaScript regex (non-`u` flag) treats `à` as a non-word char, so
// `\b` after `à` does not fire reliably ("in profondità " would miss).
const THINKING_KEYWORDS = new RegExp(
  [
    '\\bapprofondisc[ia]\\b',                          // approfondisci, approfondiscia
    '\\bapprofondire\\b',                               // infinitive
    '\\bspiegami\\s+nel\\s+dettaglio\\b',               // verb+phrase
    '\\banalizza\\s+(?:in\\s+profondit[àa]|nel\\s+dettaglio)', // verb+phrase
    '\\bin\\s+profondit[àa]',                           // standalone phrase
    '\\bcomprendere\\s+a\\s+fondo\\b',                  // rare strong intent
    '\\bmetti\\s+a\\s+confronto\\b',                    // rare strong intent
    '\\bdifferenza\\s+(?:tra|fra)\\s+\\w+\\s+e\\s+\\w+\\b', // explicit deep-compare form
  ].join('|'),
  'i',
);

/**
 * Route a message to the optimal Gemini model.
 * @param message - User message text
 * @param hasImages - Whether the request includes images (vision)
 * @param circuitState - Current circuit state (errors indicate complexity)
 */
export function routeModel(
  message: string,
  hasImages: boolean = false,
  circuitState?: CircuitState | null,
): GeminiModel {
  const safeMessage = typeof message === 'string' ? message : '';
  const hasErrors = (circuitState?.errors?.length ?? 0) > 0;

  // FLASH-promote (iter 43 v69 hotfix, ~<5% of traffic): explicit deep-thinking prompts.
  // ORIGINALLY iter 43 v68 promoted to Pro+thinkingLevel:medium but Vertex EU
  // Frankfurt Pro returned 503 at 15s consistently (root cause unclear — Pro
  // availability OR thinkingConfig.thinkingLevel param compat). Surgical
  // fallback: promote to Flash (faster than Pro, better capability than
  // Flash-Lite, no thinking timeout risk). Iter 44 P0: investigate Vertex Pro
  // accessibility OR thinkingBudget number-vs-string + restore Pro promotion.
  if (!hasImages && THINKING_KEYWORDS.test(safeMessage)) {
    return 'gemini-2.5-flash';
  }

  // Live class path: complex/diagnostic prompts need enough reasoning, but not
  // Pro latency. Use Flash for visual/errors/debug and reserve Pro for a future
  // explicit offline audit endpoint.
  if (hasImages && hasErrors) return 'gemini-2.5-flash';
  if (PRO_KEYWORDS.test(safeMessage)) return 'gemini-2.5-flash';

  // FLASH (25%): vision without errors, explanations, reasoning
  if (hasImages) return 'gemini-2.5-flash';
  if (FLASH_KEYWORDS.test(safeMessage)) return 'gemini-2.5-flash';

  // FLASH-LITE (70%): everything else (greetings, quiz, hints, simple Q&A)
  return 'gemini-2.5-flash-lite';
}

/**
 * Get the display name for a model (used in response.source)
 */
export function modelDisplayName(model: GeminiModel): string {
  switch (model) {
    case 'gemini-2.5-flash-lite': return 'flash-lite';
    case 'gemini-2.5-flash': return 'flash';
    case 'gemini-2.5-pro': return 'pro';
  }
}
