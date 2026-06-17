// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * intentsDispatcher — iter 37 Atom B-NEW (Maker-1 backend-architect).
 *
 * Browser-side dispatcher for server-parsed `intents_parsed` returned by the
 * Edge Function `unlim-chat` (iter 36 A1 INTENT parser, ADR-028 §14
 * surface-to-browser amend). Each entry has shape `{ tool, args }` (canonical)
 * or `{ action, params }` (alias). The dispatcher iterates the array, whitelists
 * the tool against ALLOWED_INTENT_ACTIONS, and invokes the corresponding
 * handler on `window.__ELAB_API` with error isolation per intent.
 *
 * Reference: PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md Atom B-NEW.
 *
 * SECURITY GATE — only whitelisted tool actions can be invoked. The 62-tool
 * registry is server-side; the browser-safe subset is curated below. Any
 * action not on the list is logged + skipped (refused, never errored).
 *
 * Error isolation — a failure in one intent NEVER prevents the next one from
 * dispatching. Each result row is `{ ok, action, ... }` for telemetry / UI.
 *
 * (c) Andrea Marro 2026-04-30 — ELAB Tutor
 */

import logger from '../../utils/logger';

/**
 * Whitelist of intent actions the server may request the browser to invoke.
 * Curated subset of the 62-tool registry (`scripts/openclaw/tools-registry.ts`).
 * Excludes destructive / sensitive ops (deleteAll, submitForm, fetchExternalUrl).
 */
export const ALLOWED_INTENT_ACTIONS = new Set([
  'highlightComponent',
  'highlightPin',
  'clearHighlights',
  'mountExperiment',
  'getCircuitState',
  'getCircuitDescription',
  'captureScreenshot',
  'serialWrite',
  'setComponentValue',
  'connectWire',
  'clearCircuit',
  'toggleDrawing',
]);

/**
 * Extract the canonical action name from an intent record. The Edge Function
 * emits `tool` (canonical iter 36 IntentTag); legacy / alternate clients may
 * use `action`. Both are accepted to keep the contract permissive.
 */
export function getIntentAction(intent) {
  if (!intent || typeof intent !== 'object') return null;
  if (typeof intent.action === 'string') return intent.action;
  if (typeof intent.tool === 'string') return intent.tool;
  return null;
}

/**
 * Extract the parameters object from an intent record. Edge Function emits
 * `args`; legacy alternate is `params`. Returns empty object when neither
 * present (safer than null — handlers can spread without guard).
 */
export function getIntentParams(intent) {
  if (!intent || typeof intent !== 'object') return {};
  if (intent.params && typeof intent.params === 'object') return intent.params;
  if (intent.args && typeof intent.args === 'object') return intent.args;
  return {};
}

/**
 * Whitelist gate — returns true only when the intent's action is in
 * ALLOWED_INTENT_ACTIONS. Defensive on shape (null / non-object / non-string
 * action all return false).
 */
export function isAllowedIntent(intent) {
  const action = getIntentAction(intent);
  return action !== null && ALLOWED_INTENT_ACTIONS.has(action);
}

/**
 * Resolve the dispatch function on a __ELAB_API surface. Tries `api.unlim[action]`
 * first (highlight* family per CLAUDE.md API contract), falls back to
 * `api[action]` (top-level handlers like `mountExperiment`, `captureScreenshot`).
 * Returns null when neither path resolves to a function.
 */
export function resolveIntentFn(api, action) {
  if (!api || typeof action !== 'string') return null;
  if (api.unlim && typeof api.unlim[action] === 'function') return api.unlim[action];
  if (typeof api[action] === 'function') return api[action];
  return null;
}

/**
 * Dispatch server-parsed intents to the browser __ELAB_API with whitelist gate
 * + error isolation.
 *
 * Per-intent outcomes:
 *   { ok: true, action, result }                — handler invoked successfully
 *   { ok: false, action, error: 'not_whitelisted' }  — action not in whitelist
 *   { ok: false, action, error: 'api_unavailable' }  — __ELAB_API absent
 *   { ok: false, action, error: 'fn_not_found' }     — handler missing on api
 *   { ok: false, action, error: '<message>' }        — handler threw
 *
 * @param {Array<{tool?: string, action?: string, args?: object, params?: object}>} intents
 * @param {object} [opts]
 * @param {object} [opts.api]  Override the __ELAB_API resolution (used by tests).
 * @returns {Promise<Array<{ok: boolean, action: string|null, result?: any, error?: string}>>}
 */
export async function executeServerIntents(intents, opts = {}) {
  if (!Array.isArray(intents) || intents.length === 0) return [];

  const api = opts.api !== undefined
    ? opts.api
    : (typeof window !== 'undefined' ? window.__ELAB_API : null);

  const results = [];

  for (const intent of intents) {
    const action = getIntentAction(intent);

    if (!isAllowedIntent(intent)) {
      logger.warn('[intentsDispatcher] action not whitelisted, skipped:', action);
      results.push({ ok: false, action, error: 'not_whitelisted' });
      continue;
    }

    if (!api) {
      results.push({ ok: false, action, error: 'api_unavailable' });
      continue;
    }

    const fn = resolveIntentFn(api, action);
    if (!fn) {
      results.push({ ok: false, action, error: 'fn_not_found' });
      continue;
    }

    try {
      const params = getIntentParams(intent);
      const result = await Promise.resolve(fn(params));
      results.push({ ok: true, action, result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[intentsDispatcher] dispatch failed:', action, msg);
      results.push({ ok: false, action, error: msg });
    }
  }

  return results;
}

export const INTENTS_DISPATCHER_VERSION = '1.0-iter37';
