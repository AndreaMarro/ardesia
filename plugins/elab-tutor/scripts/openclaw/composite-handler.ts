/**
 * OpenClaw Composite Handler — Sprint S iter 6 Task B1
 *
 * Real execution of `status='composite'` tools (per ToolSpec.composite_of array).
 * Decomposes a composite into its sub-tools, dispatches each sequentially via
 * an injectable `dispatch` function, aggregates results, propagates errors.
 *
 * Contract (matches `composite-handler.test.ts` + ADR-013 D2):
 *
 *   const r = await executeComposite('analyzeImage', args, {
 *     api: window.__ELAB_API,
 *     dispatch: dispatchFn,             // injectable; defaults to dispatcher.dispatch
 *     memory: memoryAdapter | null,     // null disables cache
 *     pz_mode: 'warn' | 'block',        // default 'warn' iter 6
 *     timeout_ms: 5000,                 // chain-wide deadline
 *     session_id: '...',                // optional UNLIM session linking
 *   });
 *
 *   r.status:
 *     'ok'              all sub-dispatches succeeded → r.data = aggregated result
 *     'error'           a sub-dispatch failed → r.error + r.failed_sub_stage
 *     'blocked_pz'      PZ block mode + sensitive sub-tool detected
 *     'cache_hit'       memory cache returned previous result
 *     'timeout'         timeout_ms exceeded across the chain
 *     'unknown_tool'    toolId not in registry
 *     'not_composite'   toolId resolved status != 'composite'
 *
 * ### L1 morphic, sequential execution
 *
 * For a composite spec with `composite_of: ['stepA', 'stepB']`:
 *   1. Look up spec in registry. Reject if not composite.
 *   2. (Opt) Memory cache lookup with deterministic key (composite name + args
 *      JSON). On hit return status='cache_hit' with cached value.
 *   3. Sequentially dispatch each sub-tool. Sub-tool result feeds the next via
 *      `args._prev` reference (callers can override per-step args via
 *      `args.steps[stepName]`). See `argsForStep()` for resolution rules.
 *   4. PZ v3 validation runs inside `dispatch()` per sub-step (parent's
 *      `pz_mode` is inherited). Sub-step status='blocked_pz' bubbles up.
 *   5. Any sub-step status != 'ok' halts the chain. Composite returns the
 *      mapped status with `error` + `failed_sub_stage` + `meta.steps`.
 *   6. On full success, return status='ok' with aggregated data (final
 *      sub-step's data on the top + array per step in `meta.aggregated`).
 *   7. (Opt) Persist successful aggregated result to memory cache.
 *
 * ### Iter 6 deliberate limits
 *   - Sequential only (Promise.all defers iter 7+; ordering matters: capture
 *     screenshot BEFORE post to vision).
 *   - No retry policy on sub-step failure (caller decides).
 *   - No partial commit — first failure aborts. Compensating txns iter 7+.
 *   - L2 morphic (template) + L3 (LLM-generated) NOT executed here. Handled
 *     by morphic-generator.ts (separate module).
 *
 * Spec ref:
 *   - `docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md` §4.3
 *   - ADR-013 (architect-opus iter 6 — composite handler design)
 *   - `scripts/openclaw/tools-registry.ts` ToolSpec.composite_of contract
 *
 * (c) Andrea Marro — 26/04/2026 — ELAB Tutor
 */

import {
  type ToolSpec,
  OPENCLAW_TOOLS_REGISTRY,
  resolveStatus,
  ensureHandlerResolves,
} from './tools-registry.ts';
import { type DispatchContext, type DispatchResult, dispatch as defaultDispatch } from './dispatcher.ts';

// ────────────────────────────────────────────────────────────────────────────
// Types — public contract
// ────────────────────────────────────────────────────────────────────────────

export type CompositeStatus =
  | 'ok'
  | 'error'
  | 'blocked_pz'
  | 'cache_hit'
  | 'timeout'
  | 'unknown_tool'
  | 'not_composite';

export interface CompositeStepResult {
  step: string;
  status: DispatchResult['status'] | string;
  data?: unknown;
  error?: string;
  latency_ms: number;
  pz_warnings?: string[];
  /** Sprint T iter 19 — full step telemetry per Andrea mandate §2 ClawBot consapevolezza. */
  telemetry?: CompositeStepTelemetry;
}

/**
 * Sprint T iter 19 — per-step telemetry envelope (Andrea mandate §2).
 * Captures tool_id + latency + status + error for downstream observability.
 */
export interface CompositeStepTelemetry {
  tool_id: string;
  latency_ms: number;
  status: string;
  error?: string;
  /** ISO timestamp at step start. */
  started_at: string;
  /** Ordinal index within composite chain (0-based). */
  index: number;
}

/** Optional audit log writer for openclaw_tool_memory Supabase table. */
export type CompositeAuditWriter = (entry: {
  composite: string;
  tool_id: string;
  index: number;
  status: string;
  latency_ms: number;
  error?: string;
  ts: string;
}) => void | Promise<void>;

export interface CompositeResult<T = unknown> {
  status: CompositeStatus;
  tool: string;
  data?: T;
  error?: string;
  /** Name of the sub-step where the chain failed (set when status !== 'ok'/'cache_hit'). */
  failed_sub_stage?: string;
  latency_ms: number;
  meta: {
    composite_of: string[];
    steps: CompositeStepResult[];
    /** Filled when memory cache hit. */
    cache_hit?: boolean;
    cached_at?: string;
    /** Mirror of failed_sub_stage for callers that read meta. */
    failed_at?: string;
    /** Aggregated per-step data array (parallel to steps). */
    aggregated?: unknown[];
    /** Sprint T iter 19 — full per-step telemetry (Andrea mandate §2). */
    telemetry?: CompositeStepTelemetry[];
  };
}

/**
 * Caller-provided composite args envelope.
 *   - top-level keys are forwarded to each sub-step (unless overridden)
 *   - `steps[stepName]` provides per-step argument override
 */
export interface CompositeArgs {
  [key: string]: unknown;
  steps?: Record<string, Record<string, unknown>>;
}

/**
 * Memory cache adapter (matches test mock + ADR-013 D5 contract).
 * Kept minimal so tool-memory.ts (Supabase pgvector) can adapt cleanly.
 */
export interface CompositeMemoryAdapter {
  lookup(key: string): Promise<{ hit: boolean; value?: unknown; cached_at?: string }>;
  store(key: string, value: unknown): Promise<{ ok: boolean } | void>;
}

/**
 * Dispatcher signature accepted by executeComposite (injectable).
 * Matches dispatcher.dispatch return shape.
 */
export type CompositeDispatchFn = (
  toolId: string,
  args: Record<string, unknown>,
  context: DispatchContext,
) => Promise<DispatchResult>;

export interface CompositeContext {
  /** __ELAB_API surface (forwarded to sub-dispatch context). */
  api?: Record<string, unknown>;
  /** Injectable dispatch function. Defaults to dispatcher.dispatch. */
  dispatch?: CompositeDispatchFn;
  /** Memory cache adapter; null disables cache. */
  memory?: CompositeMemoryAdapter | null;
  /** PZ v3 mode — 'warn' default iter 6, 'block' iter 7+. */
  pz_mode?: 'warn' | 'block';
  /** Chain-wide deadline in ms. Default 10000. */
  timeout_ms?: number;
  /** Optional UNLIM session id (forwarded to sub-dispatch). */
  session_id?: string;
  /** Whether to invoke PZ v3 (default true; forwarded to sub-dispatch). */
  validate_pz?: boolean;
  /**
   * Sprint T iter 19 — halt-on-error semantics control (Andrea mandate §2).
   * 'strict' (default): any sub-step status!='ok' halts chain (preserves iter 6 contract).
   * 'continue': record failure + continue to next step (gather full telemetry).
   * 'compensate': iter 22+ TODO — invoke compensating txns (placeholder, behaves as strict).
   */
  halt_on_error?: 'strict' | 'continue' | 'compensate';
  /** Sprint T iter 19 — audit log writer (Supabase openclaw_tool_memory). */
  audit_writer?: CompositeAuditWriter;
}

// ────────────────────────────────────────────────────────────────────────────
// Registry index (lazy)
// ────────────────────────────────────────────────────────────────────────────

let compositeIndex: Map<string, ToolSpec> | null = null;

function getCompositeIndex(): Map<string, ToolSpec> {
  if (compositeIndex) return compositeIndex;
  const m = new Map<string, ToolSpec>();
  for (const spec of OPENCLAW_TOOLS_REGISTRY) {
    m.set(spec.name, spec);
  }
  compositeIndex = m;
  return m;
}

/** Reset internal cache (test helper). */
export function _resetCompositeCache(): void {
  compositeIndex = null;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build a deterministic-ish cache key from composite name + parent args.
 * Iter 6: stable JSON.stringify (order-sensitive, fine for v1).
 */
function buildCacheKey(name: string, args: CompositeArgs): string {
  let json = '';
  try { json = JSON.stringify(args); } catch { json = '<unserializable>'; }
  return `composite:${name}:${json}`;
}

/**
 * Resolve effective args for a sub-step:
 *   - if caller provided `args.steps[stepName]`, that override wins
 *   - else inherit parent args (excluding the `steps` envelope)
 *   - in either case, merge `_prev` carrying previous step's data for chains
 */
function argsForStep(
  stepName: string,
  parentArgs: CompositeArgs,
  prev: unknown,
): Record<string, unknown> {
  let base: Record<string, unknown>;
  const override = parentArgs?.steps?.[stepName];
  if (override && typeof override === 'object') {
    base = { ...(override as Record<string, unknown>) };
  } else {
    base = {};
    for (const [k, v] of Object.entries(parentArgs || {})) {
      if (k === 'steps') continue;
      base[k] = v;
    }
  }
  if (prev !== undefined) {
    base._prev = prev;
  }
  return base;
}

/**
 * Race a promise against a deadline. Resolves with the first to settle.
 * On timeout returns a sentinel object so caller can branch.
 */
function withDeadline<T>(p: Promise<T>, deadlineMs: number): Promise<T | { __timeout: true }> {
  return new Promise((resolve) => {
    let settled = false;
    const t = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ __timeout: true });
      }
    }, deadlineMs);
    p.then(
      (v) => { if (!settled) { settled = true; clearTimeout(t); resolve(v); } },
      (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(t);
          // Re-throw via rejection
          // We resolve with synthetic step result instead of throwing.
          resolve({ __timeout: false, __error: err } as unknown as T);
        }
      },
    );
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Main entry
// ────────────────────────────────────────────────────────────────────────────

/**
 * Execute a composite tool spec by sequentially dispatching its sub-tools.
 *
 * @example
 *   const r = await executeComposite('analyzeImage', { image: null }, {
 *     api: window.__ELAB_API,
 *     dispatch,
 *     memory: null,
 *     pz_mode: 'warn',
 *     timeout_ms: 10000,
 *   });
 */
export async function executeComposite<T = unknown>(
  toolId: string,
  args: CompositeArgs = {},
  context: CompositeContext = {},
): Promise<CompositeResult<T>> {
  const start = Date.now();
  const timeoutMs = typeof context.timeout_ms === 'number' && context.timeout_ms > 0
    ? context.timeout_ms
    : 10000;

  const spec = getCompositeIndex().get(toolId);

  if (!spec) {
    return {
      status: 'unknown_tool',
      tool: toolId,
      error: `tool '${toolId}' not in OPENCLAW_TOOLS_REGISTRY`,
      latency_ms: Date.now() - start,
      meta: { composite_of: [], steps: [] },
    };
  }

  const resolved = resolveStatus(spec);
  if (resolved !== 'composite') {
    return {
      status: 'not_composite',
      tool: toolId,
      error: `tool '${toolId}' status='${resolved}' — executeComposite requires status='composite'`,
      latency_ms: Date.now() - start,
      meta: { composite_of: [], steps: [] },
    };
  }

  const steps = spec.composite_of || [];
  if (steps.length === 0) {
    return {
      status: 'error',
      tool: toolId,
      error: `composite tool '${toolId}' missing composite_of array`,
      failed_sub_stage: '<spec>',
      latency_ms: Date.now() - start,
      meta: { composite_of: [], steps: [], failed_at: '<spec>' },
    };
  }

  // ── Tool-memory cache lookup (opt-in iter 6) ──
  const cacheKey = buildCacheKey(toolId, args);
  if (context.memory) {
    try {
      const hit = await context.memory.lookup(cacheKey);
      if (hit && hit.hit) {
        return {
          status: 'cache_hit',
          tool: toolId,
          data: hit.value as T,
          latency_ms: Date.now() - start,
          meta: {
            composite_of: steps,
            steps: [],
            cache_hit: true,
            cached_at: hit.cached_at,
          },
        };
      }
    } catch (_err) {
      // Cache failure is non-fatal — proceed with execution.
    }
  }

  // ── Sequential sub-step dispatch with chain-wide deadline ──
  const dispatchFn: CompositeDispatchFn = context.dispatch || (defaultDispatch as CompositeDispatchFn);
  const subContext: DispatchContext = {
    api: context.api,
    pz_mode: context.pz_mode || 'warn',
    validate_pz: context.validate_pz,
    session_id: context.session_id,
  };

  const stepResults: CompositeStepResult[] = [];
  const aggregated: unknown[] = [];
  let prev: unknown = undefined;
  // Sprint T iter 19 — full telemetry per step (Andrea mandate §2)
  const telemetry: CompositeStepTelemetry[] = [];
  const haltMode = context.halt_on_error || 'strict';
  const auditWrite = async (entry: Parameters<CompositeAuditWriter>[0]): Promise<void> => {
    if (!context.audit_writer) return;
    try { await context.audit_writer(entry); } catch (_err) { /* non-fatal */ }
  };
  let stepIndex = -1;

  for (const stepName of steps) {
    stepIndex += 1;
    const elapsed = Date.now() - start;
    const remaining = timeoutMs - elapsed;
    if (remaining <= 0) {
      return {
        status: 'timeout',
        tool: toolId,
        error: `composite '${toolId}' timeout exceeded (${timeoutMs}ms) before step '${stepName}'`,
        failed_sub_stage: stepName,
        latency_ms: Date.now() - start,
        meta: { composite_of: steps, steps: stepResults, failed_at: stepName, aggregated, telemetry },
      };
    }

    const stepArgs = argsForStep(stepName, args, prev);
    const stepStart = Date.now();
    const stepStartedIso = new Date().toISOString();
    let raced: DispatchResult | { __timeout: true } | { __timeout: false; __error: unknown };
    try {
      raced = await withDeadline(
        dispatchFn(stepName, stepArgs, subContext) as Promise<DispatchResult>,
        remaining,
      ) as DispatchResult | { __timeout: true } | { __timeout: false; __error: unknown };
    } catch (err) {
      // dispatchFn synchronous throw (rare — defensive)
      const msg = err instanceof Error ? err.message : String(err);
      const latency = Date.now() - stepStart;
      const tThrow: CompositeStepTelemetry = {
        tool_id: stepName, latency_ms: latency, status: 'error',
        error: `dispatch threw: ${msg}`, started_at: stepStartedIso, index: stepIndex,
      };
      telemetry.push(tThrow);
      stepResults.push({
        step: stepName,
        status: 'error',
        error: `dispatch threw: ${msg}`,
        latency_ms: latency,
        telemetry: tThrow,
      });
      await auditWrite({ composite: toolId, tool_id: stepName, index: stepIndex, status: 'error', latency_ms: latency, error: `dispatch threw: ${msg}`, ts: stepStartedIso });
      if (haltMode !== 'continue') {
        return {
          status: 'error',
          tool: toolId,
          error: `step '${stepName}' threw: ${msg}`,
          failed_sub_stage: stepName,
          latency_ms: Date.now() - start,
          meta: { composite_of: steps, steps: stepResults, failed_at: stepName, aggregated, telemetry },
        };
      }
      // continue mode: skip aggregating this step + advance
      continue;
    }

    // Timeout sentinel
    if (raced && typeof raced === 'object' && (raced as { __timeout?: boolean }).__timeout === true) {
      const latency = Date.now() - stepStart;
      const tTimeout: CompositeStepTelemetry = {
        tool_id: stepName, latency_ms: latency, status: 'timeout',
        error: `step '${stepName}' exceeded chain deadline ${timeoutMs}ms`,
        started_at: stepStartedIso, index: stepIndex,
      };
      telemetry.push(tTimeout);
      stepResults.push({
        step: stepName,
        status: 'timeout',
        error: `step '${stepName}' exceeded chain deadline ${timeoutMs}ms`,
        latency_ms: latency,
        telemetry: tTimeout,
      });
      await auditWrite({ composite: toolId, tool_id: stepName, index: stepIndex, status: 'timeout', latency_ms: latency, error: `deadline ${timeoutMs}ms`, ts: stepStartedIso });
      // Timeout always halts (even continue mode — chain deadline is a hard ceiling)
      return {
        status: 'timeout',
        tool: toolId,
        error: `composite '${toolId}' timeout: step '${stepName}' exceeded deadline ${timeoutMs}ms`,
        failed_sub_stage: stepName,
        latency_ms: Date.now() - start,
        meta: { composite_of: steps, steps: stepResults, failed_at: stepName, aggregated, telemetry },
      };
    }
    // Async rejection sentinel
    if (raced && typeof raced === 'object' && (raced as { __timeout?: boolean }).__timeout === false && '__error' in (raced as object)) {
      const err = (raced as { __error: unknown }).__error;
      const msg = err instanceof Error ? err.message : String(err);
      const latency = Date.now() - stepStart;
      const tRej: CompositeStepTelemetry = {
        tool_id: stepName, latency_ms: latency, status: 'error',
        error: `dispatch rejected: ${msg}`, started_at: stepStartedIso, index: stepIndex,
      };
      telemetry.push(tRej);
      stepResults.push({
        step: stepName,
        status: 'error',
        error: `dispatch rejected: ${msg}`,
        latency_ms: latency,
        telemetry: tRej,
      });
      await auditWrite({ composite: toolId, tool_id: stepName, index: stepIndex, status: 'error', latency_ms: latency, error: `dispatch rejected: ${msg}`, ts: stepStartedIso });
      if (haltMode !== 'continue') {
        return {
          status: 'error',
          tool: toolId,
          error: `step '${stepName}' rejected: ${msg}`,
          failed_sub_stage: stepName,
          latency_ms: Date.now() - start,
          meta: { composite_of: steps, steps: stepResults, failed_at: stepName, aggregated, telemetry },
        };
      }
      continue;
    }

    const r = raced as DispatchResult;
    const tStep: CompositeStepTelemetry = {
      tool_id: stepName, latency_ms: r.latency_ms, status: r.status,
      error: r.error, started_at: stepStartedIso, index: stepIndex,
    };
    telemetry.push(tStep);
    stepResults.push({
      step: stepName,
      status: r.status,
      data: r.data,
      error: r.error,
      latency_ms: r.latency_ms,
      pz_warnings: r.pz_warnings,
      telemetry: tStep,
    });
    await auditWrite({ composite: toolId, tool_id: stepName, index: stepIndex, status: r.status, latency_ms: r.latency_ms, error: r.error, ts: stepStartedIso });

    if (r.status !== 'ok') {
      // Map sub-step status to composite-level status when meaningful.
      const compositeStatus: CompositeStatus =
        r.status === 'blocked_pz' ? 'blocked_pz' :
        'error';
      // halt-on-error: strict (default) halts; continue gathers telemetry but skips aggregating
      if (haltMode !== 'continue') {
        return {
          status: compositeStatus,
          tool: toolId,
          error: r.error || `step '${stepName}' returned status='${r.status}'`,
          failed_sub_stage: stepName,
          latency_ms: Date.now() - start,
          meta: { composite_of: steps, steps: stepResults, failed_at: stepName, aggregated, telemetry },
        };
      }
      // continue mode: do not aggregate failed step, do not advance prev
      continue;
    }

    aggregated.push(r.data);
    prev = r.data;
  }

  // ── Persist to cache (best effort) ──
  // Aggregated payload uses the final sub-step result as primary `data` (most
  // composites have a "tail" semantic — analyzeImage's vision analysis is the
  // value of interest), while `meta.aggregated` carries all per-step data.
  const finalData = aggregated[aggregated.length - 1];

  if (context.memory) {
    try {
      await context.memory.store(cacheKey, finalData);
    } catch (_err) {
      // non-fatal
    }
  }

  return {
    status: 'ok',
    tool: toolId,
    data: finalData as T,
    latency_ms: Date.now() - start,
    meta: {
      composite_of: steps,
      steps: stepResults,
      cache_hit: false,
      aggregated,
      telemetry,
    },
  };
}

/**
 * List composites available in the registry. Useful for app-mount audit.
 */
export function listComposites(): { name: string; composite_of: string[] }[] {
  const out: { name: string; composite_of: string[] }[] = [];
  for (const spec of OPENCLAW_TOOLS_REGISTRY) {
    if (resolveStatus(spec) === 'composite') {
      out.push({ name: spec.name, composite_of: spec.composite_of || [] });
    }
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Sprint S iter 8 ATOM-S8-A6 — live wire-up validation helper
// ────────────────────────────────────────────────────────────────────────────

/**
 * validateCompositeLiveWireUp — checks that all composite sub-tools are
 * dispatchable (registry-resolvable OR special-cased like `postToVisionEndpoint`).
 *
 * Returns per-composite status. Useful at app-mount or in CI to detect
 * composite specs whose sub-tools have no handler yet.
 *
 * Iter 8: includes recognition of `postToVisionEndpoint` (special-case in
 * dispatcher iter 8 — not in registry but resolves via postToVisionEndpoint.ts).
 */
export function validateCompositeLiveWireUp(api?: Record<string, unknown>): Array<{
  composite: string;
  composite_of: string[];
  unresolved_subs: string[];
  ok: boolean;
}> {
  const SPECIAL_SUBS = new Set(['postToVisionEndpoint']);
  const idx = getCompositeIndex();
  const out: Array<{ composite: string; composite_of: string[]; unresolved_subs: string[]; ok: boolean }> = [];

  for (const spec of OPENCLAW_TOOLS_REGISTRY) {
    if (resolveStatus(spec) !== 'composite') continue;
    const subs = spec.composite_of || [];
    const unresolved: string[] = [];
    for (const sub of subs) {
      if (SPECIAL_SUBS.has(sub)) continue; // dispatcher special-case handles it
      const subSpec = idx.get(sub);
      if (!subSpec) { unresolved.push(`${sub} (not in registry)`); continue; }
      const subStatus = resolveStatus(subSpec);
      if (subStatus === 'todo_sett5') { unresolved.push(`${sub} (todo_sett5)`); continue; }
      if (api) {
        const check = ensureHandlerResolves(subSpec, api);
        if (!check.resolved) unresolved.push(`${sub} (${check.reason})`);
      }
    }
    out.push({ composite: spec.name, composite_of: subs, unresolved_subs: unresolved, ok: unresolved.length === 0 });
  }
  return out;
}

// (iter 8: ensureHandlerResolves now imported at top of file)
