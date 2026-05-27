/**
 * consent-gate.ts — Sprint X iter 105.3 P0 (Andrea audit C4 fix)
 *
 * GDPR Art. 8 + Italian D.Lgs. 101/2018 minors consent enforcement.
 *
 * Audit C4 (security-auditor 2026-05-25): `CONSENT_MODE` defaults to `'soft'`.
 * `unknown` status only `console.info` logs and proceeds. Italian law requires
 * explicit verifiable parental consent for under-14. Soft mode = NON COMPLIANT.
 *
 * This module exposes:
 *   - `shouldHardRefuseUnknownConsent(status, ctx)` — pure decision helper
 *   - `buildConsentRefusalTemplate()` — canonical Italian refusal text
 *
 * Wiring opt-in via env `STRICT_CONSENT_UNKNOWN_REFUSE='true'` (default OFF).
 * When ON + production (DENO_DEPLOYMENT_ID set) + status is unknown/null:
 *   → hard refusal template returned instead of proceeding to LLM.
 *
 * Backward compatibility: when flag OFF, current `'soft'` behavior preserved.
 */

export type ConsentStatus =
  | 'granted'
  | 'revoked'
  | 'unknown'
  | null
  | undefined;

export interface ConsentGateContext {
  /** When true, treat as production (e.g. DENO_DEPLOYMENT_ID set). */
  isProduction: boolean;
  /** When true, enforce strict refusal on unknown. From env flag. */
  strictUnknown: boolean;
}

/**
 * Decision: should we hard-refuse the request because consent status is
 * unknown AND production AND strict mode is enabled?
 *
 * Returns true only when ALL THREE conditions hold:
 *   1. status is `unknown` or null/undefined (no consent record on file)
 *   2. ctx.isProduction = true (we are on Supabase Edge prod runtime)
 *   3. ctx.strictUnknown = true (env flag opted in)
 *
 * `granted` and `revoked` never trigger this (handled by existing soft path).
 *
 * NEVER throws.
 */
export function shouldHardRefuseUnknownConsent(
  status: ConsentStatus,
  ctx: ConsentGateContext,
): boolean {
  if (!ctx.isProduction || !ctx.strictUnknown) return false;
  if (status === 'granted' || status === 'revoked') return false;
  // status is 'unknown' OR null/undefined → refuse in strict prod
  return true;
}

/**
 * Read consent gate context from Deno env. Centralized for testability.
 */
export function buildConsentGateContextFromEnv(): ConsentGateContext {
  return {
    isProduction: Boolean(Deno.env.get('DENO_DEPLOYMENT_ID')),
    strictUnknown:
      (Deno.env.get('STRICT_CONSENT_UNKNOWN_REFUSE') || '').trim().toLowerCase() ===
      'true',
  };
}

/**
 * Canonical Italian K-12 refusal text for the consent-missing path.
 *
 * Pedagogical tone: tells the TEACHER what to do (contact admin), not the
 * student. Aligns with Principio Zero V3 ("il docente è il tramite") + PZ V3
 * Italian K-12 plural opener "Ragazzi,".
 */
export function buildConsentRefusalTemplate(): string {
  return [
    'Ragazzi, oggi UNLIM non può rispondere: serve prima il consenso dei genitori.',
    'Insegnante: contatta l\'amministrazione scolastica per attivare il consenso GDPR Art. 8 della classe.',
    'Continuate intanto sul kit fisico ELAB seguendo il Volume e i passi del libro.',
  ].join(' ');
}

/**
 * Convenience: full decision in one call. Returns
 *   - `{ refuse: true, response: <template> }` when strict refusal applies
 *   - `{ refuse: false }` otherwise (caller continues with soft logic)
 *
 * Pulls context from env automatically.
 */
export function evaluateConsentGate(
  status: ConsentStatus,
): { refuse: false } | { refuse: true; response: string } {
  const ctx = buildConsentGateContextFromEnv();
  if (shouldHardRefuseUnknownConsent(status, ctx)) {
    return { refuse: true, response: buildConsentRefusalTemplate() };
  }
  return { refuse: false };
}

/** Module version for telemetry. */
export const CONSENT_GATE_VERSION = '1.0-iter105.3';
