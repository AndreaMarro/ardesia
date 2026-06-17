/**
 * observability.ts — silent-failure logger helper
 *
 * Single helper to neutralize the 18+ `catch (_e) {}` and `.catch(err =>
 * console.warn(string, err))` silent-failure sites surfaced in the iter 105
 * UNLIM audit. Pattern aligned with the structured-JSON log shape already used
 * by `unlim-chat/index.ts` (`rag_hybrid_error`, `onniscenza_v2_telemetry`).
 *
 * Usage:
 *   import { logSilentFailure } from '../_shared/observability.ts';
 *   try {
 *     await something();
 *   } catch (err) {
 *     logSilentFailure('rag_bm25_or_fallback_fail', err, { tokens: tokens.length });
 *     return [];
 *   }
 *
 * Adopters MUST keep the surrounding `return []`/`return null` to preserve the
 * silent-fallback contract — this helper only adds telemetry, never throws nor
 * rethrows.
 */

export interface SilentFailureExtra {
  [key: string]: unknown;
}

/**
 * Emit a single structured warn log for an otherwise silent caught error.
 * Logger of last resort: wrapped in its own try/catch so a broken console
 * (e.g. cycled JSON) cannot upgrade a silent failure into a thrown one.
 */
// iter 105.4 H3 fix (Andrea audit): per-frame width cap + total stack line
// cap + safeStringify replacer for BigInt/circular extras. Prevents log
// truncation at Supabase Edge sink (64KB) + recovers telemetry shape even
// when extras contain non-serializable values.
const MAX_FRAME_CHARS = 200;
const MAX_FRAMES = 3;
const MAX_STACK_LINE = MAX_FRAME_CHARS * MAX_FRAMES + 32; // ~632 chars hard cap

function capStack(stack: string): string {
  const frames = stack.split('\n').slice(0, MAX_FRAMES);
  const trimmed = frames.map(f => f.length > MAX_FRAME_CHARS ? f.slice(0, MAX_FRAME_CHARS) + '…' : f);
  const joined = trimmed.join(' | ');
  return joined.length > MAX_STACK_LINE ? joined.slice(0, MAX_STACK_LINE) + '…' : joined;
}

function safeStringify(payload: Record<string, unknown>): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(payload, (_key, value) => {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'function') return '[function]';
    if (typeof value === 'symbol') return value.toString();
    if (value === undefined) return null;
    if (value && typeof value === 'object') {
      if (seen.has(value as object)) return '[circular]';
      seen.add(value as object);
    }
    return value;
  });
}

export function logSilentFailure(
  event: string,
  err: unknown,
  extra: SilentFailureExtra = {},
): void {
  try {
    // iter 105.4 H3: built-in fields placed AFTER spread to defeat
    // accidental override via extra.level/extra.event (audit M3 fix O.15).
    const payload: Record<string, unknown> = {
      ...extra,
      level: 'warn',
      event,
      error: err instanceof Error ? err.message : String(err),
      ts: Date.now(),
    };
    if (err instanceof Error && err.stack) {
      payload.stack = capStack(err.stack);
    }
    console.warn(safeStringify(payload));
  } catch {
    // Logger of last resort. Do not propagate.
    try {
      console.warn(JSON.stringify({ level: 'warn', event, error: '[stringify_failed]', ts: Date.now() }));
    } catch { /* truly nothing we can do */ }
  }
}

/**
 * Variant for explicit `level: 'error'` events. Use when the silent failure
 * indicates a compliance/safety break (e.g. audit writer fail in
 * content-safety-guard.ts).
 */
export function logSilentError(
  event: string,
  err: unknown,
  extra: SilentFailureExtra = {},
): void {
  try {
    const payload: Record<string, unknown> = {
      ...extra,
      level: 'error',
      event,
      error: err instanceof Error ? err.message : String(err),
      ts: Date.now(),
    };
    if (err instanceof Error && err.stack) {
      payload.stack = capStack(err.stack);
    }
    console.error(safeStringify(payload));
  } catch {
    // Logger of last resort.
    try {
      console.error(JSON.stringify({ level: 'error', event, error: '[stringify_failed]', ts: Date.now() }));
    } catch { /* nothing we can do */ }
  }
}
