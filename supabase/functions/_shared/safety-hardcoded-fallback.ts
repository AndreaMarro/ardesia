/**
 * Sprint U iter 25 P0-B — Safety hardcoded fallback
 *
 * Bulletproof safety responses that NEVER hit network / NEVER fail / NEVER 503.
 *
 * Context: iter 24 dim-1 LIVE prod bench measured Cat C safety query "scossa"
 * returning HTTP 503 vuoto (GDPR rischio: minori 8-14 anni senza warning sicurezza
 * 220V casa). When all LLMs are down (Mistral 5xx burst rate-limit + Gemini DOWN
 * + Together gated), the orchestrator MUST still emit a canonical safety refusal
 * for voltage_danger / minor_inappropriate / generic_safety paths.
 *
 * Wire-up contract (orchestrator unlim-chat/index.ts post-completion):
 *   if (safety_pre_llm_path && callLLMFailed) {
 *     const fallbackText = getSafetyHardcodedResponse('voltage_danger');
 *     return ok({ message: fallbackText, source: 'safety_hardcoded_fallback', ... });
 *   }
 *
 * Pure function — ZERO LLM call, ZERO network, ZERO Deno.env read, ZERO state
 * mutation. Safe to call synchronously in any error handler.
 *
 * Canonical refusal text mirrors `_shared/system-prompt.ts` iter 11 PATCH B
 * REGOLE ASSOLUTE rule 7 (220V casa warning + kit 9V mandate).
 *
 * GDPR Art. 8 (minori) + Italian D.Lgs. 101/2018 mandate: a minor (8-14 anni)
 * who triggers voltage_danger MUST always receive a safety warning, even when
 * the entire LLM stack is offline. This module is the last-line guarantee.
 *
 * (c) Andrea Marro 2026-05-11 — ELAB Tutor Sprint U
 */

/**
 * Discrete safety categories handled by the hardcoded fallback layer.
 *
 * - voltage_danger: user/teacher mentions 220V casa, household current,
 *   electric shock; kit ELAB 9V mandate must be repeated.
 * - minor_inappropriate: off-topic that conflicts with minor-protection
 *   policy (violence, NSFW, drugs); redirect to electronics.
 * - generic_safety: catch-all when classifier is uncertain but safety_pre_llm
 *   path fired; conservative redirect to teacher.
 */
export type SafetyHardcodedType =
  | 'voltage_danger'
  | 'minor_inappropriate'
  | 'generic_safety';

/**
 * Canonical refusal templates — Italian plurale "Ragazzi," opener per
 * PRINCIPIO ZERO. Each string ≤120 parole (UNLIM brevity rule).
 *
 * voltage_danger text MUST match system-prompt.ts rule 7 verbatim so post-LLM
 * PZ validators (citation_vol_pag + plurale_ragazzi + kit_mention) succeed.
 */
const CANONICAL_RESPONSES: Readonly<Record<SafetyHardcodedType, string>> = Object.freeze({
  voltage_danger:
    'Ragazzi, attenzione: 220V casa è pericoloso per ragazzi 8-14 anni. Sul kit ELAB usate sempre la batteria 9V — sicura e perfetta per tutti gli esperimenti dei volumi. Per dubbi, controllate il libro o chiedete al docente.',
  minor_inappropriate:
    'Ragazzi, sono UNLIM di ELAB Tutor — specializzato in elettronica e Arduino per scuole 8-14 anni. Per altri argomenti chiedete al docente o cercate altrove. Posso aiutarvi con LED, Arduino, sensori, kit fisico ELAB?',
  generic_safety:
    'Ragazzi, per questa domanda è meglio chiedere al docente. Sul kit ELAB lavoriamo sempre con batteria 9V — sicura per tutti gli esperimenti dei volumi. Vi aiuto con LED, resistenze, Arduino o sensori del vostro kit?',
});

/**
 * Returns the canonical safety refusal string for the given safety type.
 *
 * Guarantees:
 *   - ZERO network I/O (no fetch, no Deno.env, no Supabase client).
 *   - ZERO state mutation (pure function, returns frozen string copy).
 *   - NEVER throws — unknown types fall back to 'generic_safety'.
 *   - Deterministic — same input always returns same output.
 *
 * @param safetyType discrete safety category from the pre-LLM classifier.
 * @returns canonical Italian refusal text, ≤120 parole, plurale "Ragazzi,".
 */
export function getSafetyHardcodedResponse(safetyType: SafetyHardcodedType): string {
  // Defensive: if caller passes an unexpected value at runtime (TS erased),
  // fall back to the most conservative generic_safety message rather than
  // throwing or returning empty (GDPR mandate: always warn the minor).
  const text = CANONICAL_RESPONSES[safetyType] ?? CANONICAL_RESPONSES.generic_safety;
  return text;
}

/**
 * Convenience: returns true if the given safetyType is recognized.
 * Pure, no side effects.
 */
export function isKnownSafetyType(safetyType: string): safetyType is SafetyHardcodedType {
  return safetyType === 'voltage_danger'
    || safetyType === 'minor_inappropriate'
    || safetyType === 'generic_safety';
}

/** Version marker for audit/log. */
export const SAFETY_HARDCODED_FALLBACK_VERSION = '1.0-iter25-P0B';
