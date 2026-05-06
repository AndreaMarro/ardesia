/**
 * clawbot-dispatcher-deno.ts — Sprint V iter 43 Atom A4 (Maker-2)
 *
 * Server-safe (Deno-compatible) port of the Node-only ClawBot dispatcher
 * (`scripts/openclaw/dispatcher.ts`). This module is intended to be invoked
 * by the `unlim-chat` Edge Function (or other Deno Edge Functions) when the
 * model returns a structured `intents` array (per ADR-030 INTENT canonical
 * schema iter 38) and the server wants to validate/transform those intents
 * BEFORE shipping them to the browser for execution via `__ELAB_API`.
 *
 * Key differences vs Node dispatcher (`scripts/openclaw/dispatcher.ts`):
 *
 *   1. NO DOM access — there is no `window.__ELAB_API` server-side. The Deno
 *      dispatcher does NOT execute handlers; it ONLY validates the canonical
 *      shape of each intent and emits a normalized array via the response
 *      `intents: [...]` field for the browser dispatcher
 *      (`src/components/lavagna/intentsDispatcher.js` iter 37) to invoke.
 *
 *   2. Subset of 12 priority tools (Andrea Q2 decision iter 43). The full
 *      62-tool registry port is DEFERRED iter 44 (Maker-2 next iter atom).
 *      Subset matches `intent-tools-schema.ts` CANONICAL_INTENT_TOOLS list
 *      (iter 38 single source of truth) — zero drift.
 *
 *   3. NO Node-only imports (`scripts/openclaw/tools-registry.ts`,
 *      `postToVisionEndpoint.ts`). Self-contained: tool whitelist + arg
 *      shape validators are inlined here for Deno Edge runtime portability.
 *
 *   4. Pure functions, no side effects, no global state — safe for cold-start
 *      Edge Function invocations and parallel isolates.
 *
 * Reference docs:
 *   - ADR-028 §14.b — surface-to-browser dispatcher (server validate, browser exec)
 *   - ADR-030 — Mistral function-calling INTENT canonical schema
 *   - PDR Sprint V iter 43 §3 ATOM A4 — 12-tool first
 *
 * (c) Andrea Marro 2026-05-06 — ELAB Tutor Maker-2
 */

import {
  CANONICAL_INTENT_TOOLS,
  type CanonicalIntentTool,
} from './intent-tools-schema.ts';

/**
 * Dispatch outcome for a single intent record. Mirrors the browser-side
 * `intentsDispatcher.js` outcome shape so that telemetry pipelines can union
 * server-side dispatch results with browser-side dispatch results without
 * shape coercion.
 */
export type ClawBotDispatchStatus =
  | 'ok'                    // intent validated, will be forwarded to browser
  | 'unknown_tool'          // tool name not in 12-tool subset
  | 'invalid_args'          // args shape failed per-tool validator
  | 'refused';              // tool explicitly refused (e.g. destructive op)

export interface ClawBotDispatchEntry {
  status: ClawBotDispatchStatus;
  tool: string;
  args: Record<string, unknown>;
  /** Human-readable reason when status != 'ok'. */
  reason?: string;
  /** Index in the original intents[] array (preserved for ordering). */
  index: number;
}

export interface ClawBotDispatchResult {
  /** Successfully validated intents — forwarded to browser via response.intents. */
  forwarded: Array<{ tool: CanonicalIntentTool; args: Record<string, unknown> }>;
  /** Per-entry telemetry (incl. rejected entries with reason). */
  entries: ClawBotDispatchEntry[];
  /** Aggregate counters for logging / monitoring. */
  meta: {
    total: number;
    ok: number;
    rejected: number;
    /** Names of rejected tools (for quick scan in logs). */
    rejected_tools: string[];
  };
}

/**
 * 12-tool subset whitelist (Andrea Q2 iter 43). MUST mirror
 * `intent-tools-schema.ts` CANONICAL_INTENT_TOOLS — single source of truth.
 * 62-tool full port DEFERRED iter 44.
 */
const TWELVE_TOOL_SUBSET: ReadonlySet<CanonicalIntentTool> = new Set(
  CANONICAL_INTENT_TOOLS,
);

/**
 * Per-tool argument validators. Each returns `null` if args are valid, or a
 * string describing the validation failure. Keeps validation lightweight
 * (no exhaustive deep schema — Mistral function-calling already constrains
 * structure via `intent-tools-schema.ts` JSON schema).
 *
 * The browser dispatcher (`intentsDispatcher.js`) is the second line of
 * defence — these validators catch obvious shape errors before they cross
 * the wire to the client.
 */
type ArgValidator = (args: Record<string, unknown>) => string | null;

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

const ARG_VALIDATORS: Record<CanonicalIntentTool, ArgValidator> = {
  highlightComponent: (args) => {
    if (!isStringArray(args.ids)) {
      return 'highlightComponent.args.ids must be string[]';
    }
    if ((args.ids as string[]).length === 0) {
      return 'highlightComponent.args.ids must be non-empty';
    }
    return null;
  },

  highlightPin: (args) => {
    if (!isStringArray(args.ids)) {
      return 'highlightPin.args.ids must be string[] (e.g. ["nano:D13"])';
    }
    if ((args.ids as string[]).length === 0) {
      return 'highlightPin.args.ids must be non-empty';
    }
    return null;
  },

  clearHighlights: (_args) => {
    // No required args — args may be {} or contain optional metadata.
    return null;
  },

  clearHighlightPins: (_args) => {
    return null;
  },

  mountExperiment: (args) => {
    // ADR-030 §3 + intent-tools-schema.ts canonical: args.id (NOT experimentId).
    if (typeof args.id !== 'string' || (args.id as string).length === 0) {
      return 'mountExperiment.args.id must be non-empty string (e.g. "v1-cap6-esp1")';
    }
    return null;
  },

  captureScreenshot: (_args) => {
    return null;
  },

  getCircuitState: (_args) => {
    return null;
  },

  getCircuitDescription: (_args) => {
    return null;
  },

  clearCircuit: (_args) => {
    return null;
  },

  setComponentValue: (args) => {
    if (typeof args.id !== 'string' || (args.id as string).length === 0) {
      return 'setComponentValue.args.id must be non-empty string';
    }
    if (typeof args.field !== 'string' || (args.field as string).length === 0) {
      return 'setComponentValue.args.field must be non-empty string';
    }
    if (args.value === undefined || args.value === null) {
      return 'setComponentValue.args.value must be defined';
    }
    return null;
  },

  toggleDrawing: (args) => {
    if (typeof args.enabled !== 'boolean') {
      return 'toggleDrawing.args.enabled must be boolean';
    }
    return null;
  },

  serialWrite: (args) => {
    if (typeof args.text !== 'string') {
      return 'serialWrite.args.text must be string';
    }
    return null;
  },
};

/**
 * Validate a single intent record. Returns a normalized
 * `ClawBotDispatchEntry`. Pure function — does NOT execute the handler.
 *
 * Accepts the canonical `{ tool, args }` shape (per intent-tools-schema.ts).
 * Legacy `{ action, params }` shape is ALSO accepted to keep the contract
 * permissive (matches `intentsDispatcher.js` getIntentAction/getIntentParams
 * behaviour).
 */
export function validateIntent(
  intent: unknown,
  index: number,
): ClawBotDispatchEntry {
  if (!intent || typeof intent !== 'object') {
    return {
      status: 'invalid_args',
      tool: '<malformed>',
      args: {},
      reason: 'intent must be an object',
      index,
    };
  }

  const obj = intent as Record<string, unknown>;

  // Accept canonical {tool, args} OR legacy {action, params}
  const tool =
    typeof obj.tool === 'string' ? obj.tool :
    typeof obj.action === 'string' ? obj.action :
    null;

  const args: Record<string, unknown> =
    obj.args && typeof obj.args === 'object'
      ? (obj.args as Record<string, unknown>)
      : obj.params && typeof obj.params === 'object'
        ? (obj.params as Record<string, unknown>)
        : {};

  if (!tool) {
    return {
      status: 'invalid_args',
      tool: '<missing>',
      args,
      reason: 'intent missing tool/action name',
      index,
    };
  }

  if (!TWELVE_TOOL_SUBSET.has(tool as CanonicalIntentTool)) {
    return {
      status: 'unknown_tool',
      tool,
      args,
      reason: `tool '${tool}' not in 12-tool iter 43 subset (62-tool full deferred iter 44)`,
      index,
    };
  }

  const validator = ARG_VALIDATORS[tool as CanonicalIntentTool];
  const validationError = validator ? validator(args) : null;
  if (validationError) {
    return {
      status: 'invalid_args',
      tool,
      args,
      reason: validationError,
      index,
    };
  }

  return {
    status: 'ok',
    tool,
    args,
    index,
  };
}

/**
 * Dispatch (server-side validation) a batch of intents. Pure function.
 *
 * Contract:
 *   - Input: intents array as parsed from LLM response (Mistral function-calling
 *     structured output OR legacy regex `[INTENT:...]` parser).
 *   - Output: ClawBotDispatchResult with the subset of validated intents in
 *     `forwarded` (server emits `response.intents = forwarded` to client) +
 *     full per-entry telemetry in `entries`.
 *
 * The server NEVER executes handlers — execution is browser-side via
 * `__ELAB_API` invoked by `intentsDispatcher.js`. This separation matches
 * ADR-028 §14.b surface-to-browser dispatcher pivot iter 36-37.
 *
 * @example
 *   const result = dispatchIntentsServerSide(structuredOutput.intents ?? []);
 *   return new Response(JSON.stringify({ text, intents: result.forwarded }), ...);
 */
export function dispatchIntentsServerSide(
  intents: unknown,
): ClawBotDispatchResult {
  if (!Array.isArray(intents)) {
    return {
      forwarded: [],
      entries: [],
      meta: { total: 0, ok: 0, rejected: 0, rejected_tools: [] },
    };
  }

  const entries: ClawBotDispatchEntry[] = intents.map((intent, idx) =>
    validateIntent(intent, idx),
  );

  const okEntries = entries.filter((e) => e.status === 'ok');
  const rejectedEntries = entries.filter((e) => e.status !== 'ok');

  const forwarded = okEntries.map((e) => ({
    tool: e.tool as CanonicalIntentTool,
    args: e.args,
  }));

  return {
    forwarded,
    entries,
    meta: {
      total: entries.length,
      ok: okEntries.length,
      rejected: rejectedEntries.length,
      rejected_tools: rejectedEntries.map((e) => e.tool),
    },
  };
}

/**
 * Helper: returns true when the 12-tool subset contains the given name.
 * Useful for callers that want to short-circuit before validation.
 */
export function isSubsetTool(name: string): name is CanonicalIntentTool {
  return TWELVE_TOOL_SUBSET.has(name as CanonicalIntentTool);
}

/**
 * Read-only export of the 12-tool subset (Andrea Q2 iter 43). Useful for
 * tests and for keeping the contract documented in callers.
 */
export const CLAWBOT_DISPATCHER_DENO_SUBSET: readonly CanonicalIntentTool[] =
  CANONICAL_INTENT_TOOLS;

export const CLAWBOT_DISPATCHER_DENO_VERSION = '1.0-iter43-12tool';
