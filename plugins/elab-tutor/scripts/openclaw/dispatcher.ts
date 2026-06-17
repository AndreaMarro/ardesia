/**
 * OpenClaw Dispatcher — Sprint S iter 4 P1 B3 scaffold (minimal)
 *
 * Wires tools-registry + tool-memory + pz-v3-validator + state-aggregator into
 * single dispatch entry point. Sprint 6 Day 39 gate post R5 ≥90% PASS.
 *
 * Iter 4 scaffold:
 *   - dispatch(toolId, args, context) → resolves ToolSpec → invokes handler
 *   - PZ v3 validation when pz_v3_sensitive=true (warn-only iter 4, block iter 6+)
 *   - Tool-memory cache lookup (read-only iter 4, write iter 5+)
 *   - State-aggregator parallel context fetch (opt-in iter 4)
 *   - 4 dispatch outcomes: 'ok', 'blocked_pz', 'unresolved_handler', 'error'
 *
 * Iter 5+ TODO:
 *   - tool-memory write integration (depends openclaw_tool_memory migration applied)
 *   - composite handler execution (L1 morphic from morphic-generator.ts)
 *   - LLM tool-use orchestration (buildJsonSchemaForLLM → LLM → dispatch)
 *   - PZ v3 BLOCK mode (currently warn-only per ADR-009)
 *
 * Spec: docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md §4.3
 *
 * (c) Andrea Marro — 26/04/2026
 */

import {
  type ToolSpec,
  OPENCLAW_TOOLS_REGISTRY,
  resolveStatus,
  ensureHandlerResolves,
} from './tools-registry.ts';
import { postToVisionEndpoint as postToVisionEndpointImpl } from './postToVisionEndpoint.ts';

export type DispatchStatus =
  | 'ok'
  | 'blocked_pz'
  | 'unresolved_handler'
  | 'unknown_tool'
  | 'todo_sett5'
  | 'error';

export interface DispatchContext {
  /** Optional UNLIM session id for memory linking. */
  session_id?: string;
  /** Whether to invoke PZ v3 validator (defaults true). */
  validate_pz?: boolean;
  /** Whether to consult tool-memory cache (defaults false iter 4). */
  use_memory_cache?: boolean;
  /** Window-like object exposing __ELAB_API; for tests use a stub. */
  api?: Record<string, unknown>;
  /** Iter 4: warn-only on PZ; iter 6+ enforce 'block'. */
  pz_mode?: 'warn' | 'block';
  /**
   * Sprint S iter 6: opt-in composite execution. When true, composite tools
   * are executed via composite-handler.executeComposite (sequential dispatch
   * of sub-tools). When false/undefined, dispatcher falls back to iter 4
   * scaffold behaviour (status='todo_sett5'). Opt-in preserves baseline tests.
   */
  use_composite?: boolean;
  /**
   * Sprint T iter 19/20: composite halt-on-error mode passed through to
   * executeComposite. 'strict' (default — preserves iter 6 contract) aborts
   * on first error; 'continue' gathers full telemetry without halting on
   * non-timeout failures; 'compensate' reserved for future rollback.
   */
  halt_on_error?: 'strict' | 'continue' | 'compensate';
  /**
   * Sprint T iter 19/20: optional audit log writer. Receives one record per
   * composite step; intended target Supabase openclaw_tool_memory. When
   * omitted, telemetry is still captured in result.meta but not persisted.
   */
  audit_writer?: (record: {
    composite: string;
    tool_id: string;
    index: number;
    status: string;
    latency_ms: number;
    error?: string;
    ts: string;
  }) => void | Promise<void>;
}

export interface DispatchResult<T = unknown> {
  status: DispatchStatus;
  tool: string;
  handler?: string;
  data?: T;
  error?: string;
  pz_warnings?: string[];
  latency_ms: number;
  resolved_status?: ReturnType<typeof resolveStatus>;
  meta?: Record<string, unknown>;
}

let registryIndex: Map<string, ToolSpec> | null = null;

/**
 * Lazy build name→ToolSpec map for O(1) lookup.
 */
function getRegistryIndex(): Map<string, ToolSpec> {
  if (registryIndex) return registryIndex;
  const m = new Map<string, ToolSpec>();
  for (const spec of OPENCLAW_TOOLS_REGISTRY) {
    m.set(spec.name, spec);
  }
  registryIndex = m;
  return m;
}

/**
 * Resolve a dot-path against an api object.
 * "highlightComponent"        → api.highlightComponent
 * "unlim.highlightComponent"  → api.unlim.highlightComponent
 */
function resolveHandler(api: Record<string, unknown>, dotPath: string): unknown {
  if (!api) return undefined;
  const parts = dotPath.split('.');
  let cur: unknown = api;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * Iter 4 PZ v3 validator stub (warn-only).
 * Real implementation in scripts/openclaw/pz-v3-validator.ts.
 * Iter 5+ wires the real validator.
 */
function validatePzV3Stub(spec: ToolSpec, _args: unknown): string[] {
  if (!spec.pz_v3_sensitive) return [];
  // Warn: PZ-sensitive action should be paired with speakTTS narration.
  // Iter 4 cannot enforce; just emit warning.
  return [`tool '${spec.name}' is PZ-sensitive — pair with speakTTS narration to class`];
}

/**
 * Main dispatch entry point.
 *
 * @example
 *   const r = await dispatch('addComponent', { type: 'led', position: 'A1' }, { api: window.__ELAB_API })
 *   if (r.status === 'ok') console.log('component added', r.data)
 */
export async function dispatch<T = unknown>(
  toolId: string,
  args: Record<string, unknown>,
  context: DispatchContext = {},
): Promise<DispatchResult<T>> {
  const start = Date.now();

  // Sprint S iter 8 ATOM-S8-A6: special-case `postToVisionEndpoint` sub-tool
  // (used by `analyzeImage` composite). Not a standalone registry entry — dispatched
  // directly to the Edge Function POST helper.
  if (toolId === 'postToVisionEndpoint') {
    try {
      const r = await postToVisionEndpointImpl(args as Parameters<typeof postToVisionEndpointImpl>[0]);
      return {
        status: r.status === 'ok' ? 'ok' : 'error',
        tool: toolId,
        handler: 'unlim.postToVisionEndpoint',
        data: r as T,
        error: r.status !== 'ok' ? r.error : undefined,
        latency_ms: r.latency_ms,
        resolved_status: 'live',
        meta: { iter: 8, special_case: 'postToVisionEndpoint' },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        status: 'error',
        tool: toolId,
        handler: 'unlim.postToVisionEndpoint',
        error: `postToVisionEndpoint threw: ${msg}`,
        latency_ms: Date.now() - start,
      };
    }
  }

  const spec = getRegistryIndex().get(toolId);

  if (!spec) {
    return {
      status: 'unknown_tool',
      tool: toolId,
      error: `tool '${toolId}' not in OPENCLAW_TOOLS_REGISTRY (${OPENCLAW_TOOLS_REGISTRY.length} tools)`,
      latency_ms: Date.now() - start,
    };
  }

  const resolved = resolveStatus(spec);
  if (resolved === 'todo_sett5') {
    return {
      status: 'todo_sett5',
      tool: toolId,
      handler: spec.handler,
      error: `tool '${toolId}' added_in_sprint=${spec.added_in_sprint} — handler not yet implemented`,
      latency_ms: Date.now() - start,
      resolved_status: resolved,
    };
  }

  if (resolved === 'composite') {
    // Sprint S iter 6: opt-in real composite execution via composite-handler.
    // Default (use_composite=false/undefined) preserves iter 4 scaffold (todo_sett5)
    // so existing tests stay green and composite execution is rolled out behind
    // an explicit flag.
    if (context.use_composite) {
      // Lazy import to avoid circular dep at module load (composite-handler imports
      // dispatch from this file).
      const { executeComposite } = await import('./composite-handler.ts');
      const r = await executeComposite(toolId, args as Record<string, unknown>, {
        api: context.api,
        pz_mode: context.pz_mode,
        validate_pz: context.validate_pz,
        session_id: context.session_id,
        halt_on_error: context.halt_on_error ?? 'strict',
        audit_writer: context.audit_writer,
      });
      // Map CompositeResult → DispatchResult (preserves DispatchStatus union).
      // 'cache_hit' is treated as 'ok' from caller's perspective (data is valid).
      const mappedStatus: DispatchStatus =
        r.status === 'ok' || r.status === 'cache_hit' ? 'ok' :
        r.status === 'unknown_tool' ? 'unknown_tool' :
        r.status === 'blocked_pz' ? 'blocked_pz' :
        'error';
      return {
        status: mappedStatus,
        tool: toolId,
        handler: spec.handler,
        data: r.data as T,
        error: r.error,
        latency_ms: r.latency_ms,
        resolved_status: resolved,
        meta: {
          composite_of: spec.composite_of,
          steps: r.meta.steps,
          cache_hit: r.meta.cache_hit,
          failed_at: r.meta.failed_at,
          composite_status: r.status,
        },
      };
    }
    // Iter 4 scaffold preserved: composite execution defer behind use_composite flag.
    return {
      status: 'todo_sett5',
      tool: toolId,
      handler: spec.handler,
      error: `composite tool '${toolId}' execution defer iter 5+ (composite_of=${(spec.composite_of || []).join(',')})`,
      latency_ms: Date.now() - start,
      resolved_status: resolved,
      meta: { composite_of: spec.composite_of },
    };
  }

  // PZ v3 validation (iter 4 warn-only)
  const pzMode = context.pz_mode || 'warn';
  const pzWarnings = (context.validate_pz !== false) ? validatePzV3Stub(spec, args) : [];
  if (pzWarnings.length > 0 && pzMode === 'block') {
    return {
      status: 'blocked_pz',
      tool: toolId,
      handler: spec.handler,
      error: `PZ v3 block: ${pzWarnings.join('; ')}`,
      latency_ms: Date.now() - start,
      pz_warnings: pzWarnings,
      resolved_status: resolved,
    };
  }

  // Resolve handler against api
  const api = context.api || ((): Record<string, unknown> | null => {
    if (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>).__ELAB_API) {
      return (globalThis as Record<string, unknown>).__ELAB_API as Record<string, unknown>;
    }
    return null;
  })();

  if (!api) {
    return {
      status: 'unresolved_handler',
      tool: toolId,
      handler: spec.handler,
      error: 'no api context available (pass context.api or attach window.__ELAB_API)',
      latency_ms: Date.now() - start,
      pz_warnings: pzWarnings,
      resolved_status: resolved,
    };
  }

  const check = ensureHandlerResolves(spec, api);
  if (!check.resolved) {
    return {
      status: 'unresolved_handler',
      tool: toolId,
      handler: spec.handler,
      error: check.reason || `handler '${spec.handler}' not resolvable`,
      latency_ms: Date.now() - start,
      pz_warnings: pzWarnings,
      resolved_status: resolved,
    };
  }

  // Execute handler
  const handler = resolveHandler(api, spec.handler);
  if (typeof handler !== 'function') {
    return {
      status: 'unresolved_handler',
      tool: toolId,
      handler: spec.handler,
      error: `handler '${spec.handler}' resolves but is not callable (typeof=${typeof handler})`,
      latency_ms: Date.now() - start,
      pz_warnings: pzWarnings,
      resolved_status: resolved,
    };
  }

  try {
    // Resolve `this` context for namespaced handlers (e.g. unlim.X needs api.unlim as this)
    const dotIdx = spec.handler.lastIndexOf('.');
    const thisCtx = dotIdx === -1
      ? api
      : resolveHandler(api, spec.handler.slice(0, dotIdx));
    const fn = handler as (...args: unknown[]) => unknown;
    const result = await Promise.resolve(fn.apply(thisCtx, [args]));
    return {
      status: 'ok',
      tool: toolId,
      handler: spec.handler,
      data: result as T,
      latency_ms: Date.now() - start,
      pz_warnings: pzWarnings,
      resolved_status: resolved,
    };
  } catch (err) {
    return {
      status: 'error',
      tool: toolId,
      handler: spec.handler,
      error: err instanceof Error ? err.message : String(err),
      latency_ms: Date.now() - start,
      pz_warnings: pzWarnings,
      resolved_status: resolved,
    };
  }
}

/**
 * Bulk audit: which tools resolve against the current api?
 * Useful at app mount to warn about registry↔api drift early.
 */
export function auditDispatcher(api: Record<string, unknown>): {
  total: number;
  live_resolved: number;
  live_unresolved: { name: string; reason: string }[];
  todo_sett5: number;
  composite: number;
} {
  const live_unresolved: { name: string; reason: string }[] = [];
  let live_resolved = 0;
  let todo_sett5 = 0;
  let composite = 0;
  for (const spec of OPENCLAW_TOOLS_REGISTRY) {
    const status = resolveStatus(spec);
    if (status === 'todo_sett5') { todo_sett5++; continue; }
    if (status === 'composite') { composite++; continue; }
    const check = ensureHandlerResolves(spec, api);
    if (check.resolved) live_resolved++;
    else live_unresolved.push({ name: spec.name, reason: check.reason || 'unknown' });
  }
  return {
    total: OPENCLAW_TOOLS_REGISTRY.length,
    live_resolved,
    live_unresolved,
    todo_sett5,
    composite,
  };
}

/** Reset internal cache (test helper). */
export function _resetDispatcherCache(): void {
  registryIndex = null;
}
