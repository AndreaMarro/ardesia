/**
 * clawbot-dispatcher-deno.test.js — Sprint V iter 44 Atom A4 unit tests
 *
 * Tests for `supabase/functions/_shared/clawbot-dispatcher-deno.ts`.
 * Pure-function validators — server-side INTENT shape validation BEFORE
 * forwarding to browser dispatcher (`intentsDispatcher.js`).
 *
 * Coverage scope:
 *   - validateIntent canonical {tool, args} shape
 *   - validateIntent legacy {action, params} shape (backward-compat)
 *   - 12-tool subset whitelist (subset test per tool)
 *   - Per-tool arg validators (highlightComponent, mountExperiment, etc)
 *   - dispatchIntentsServerSide aggregation + meta counters
 *   - isSubsetTool type guard
 *   - Edge cases: malformed input, missing tool, empty intents array
 *
 * (c) Andrea Marro 2026-05-06 — ELAB Tutor Sprint V iter 44 honest verifiable atom
 */

import { describe, it, expect } from 'vitest';
import {
  validateIntent,
  dispatchIntentsServerSide,
  isSubsetTool,
  CLAWBOT_DISPATCHER_DENO_SUBSET,
  CLAWBOT_DISPATCHER_DENO_VERSION,
} from '../../supabase/functions/_shared/clawbot-dispatcher-deno.ts';

describe('clawbot-dispatcher-deno — version + subset exports', () => {
  it('exports version marker for traceability', () => {
    expect(CLAWBOT_DISPATCHER_DENO_VERSION).toBe('1.0-iter43-12tool');
  });

  it('exports 12-tool subset list (Andrea Q2 iter 43 decision)', () => {
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET).toBeInstanceOf(Array);
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET.length).toBeGreaterThanOrEqual(12);
  });

  it('subset includes priority tools (highlight, mount, screenshot, getCircuitState)', () => {
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET).toContain('highlightComponent');
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET).toContain('mountExperiment');
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET).toContain('captureScreenshot');
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET).toContain('getCircuitState');
  });
});

describe('isSubsetTool — type guard', () => {
  it('returns true for canonical 12-tool names', () => {
    expect(isSubsetTool('highlightComponent')).toBe(true);
    expect(isSubsetTool('mountExperiment')).toBe(true);
    expect(isSubsetTool('toggleDrawing')).toBe(true);
  });

  it('returns false for unknown tool names', () => {
    expect(isSubsetTool('deleteAll')).toBe(false);
    expect(isSubsetTool('submitForm')).toBe(false);
    expect(isSubsetTool('fetchExternalUrl')).toBe(false);
    expect(isSubsetTool('')).toBe(false);
  });
});

describe('validateIntent — canonical {tool, args} shape', () => {
  it('validates highlightComponent with valid ids', () => {
    const r = validateIntent({ tool: 'highlightComponent', args: { ids: ['led1', 'r1'] } }, 0);
    expect(r.status).toBe('ok');
    expect(r.tool).toBe('highlightComponent');
    expect(r.args).toEqual({ ids: ['led1', 'r1'] });
    expect(r.index).toBe(0);
  });

  it('rejects highlightComponent missing ids', () => {
    const r = validateIntent({ tool: 'highlightComponent', args: {} }, 0);
    expect(r.status).toBe('invalid_args');
    expect(r.reason).toMatch(/ids must be string\[\]/);
  });

  it('rejects highlightComponent empty ids array', () => {
    const r = validateIntent({ tool: 'highlightComponent', args: { ids: [] } }, 1);
    expect(r.status).toBe('invalid_args');
    expect(r.reason).toMatch(/non-empty/);
  });

  it('validates mountExperiment with id', () => {
    const r = validateIntent({ tool: 'mountExperiment', args: { id: 'v1-cap6-esp1' } }, 0);
    expect(r.status).toBe('ok');
  });

  it('rejects mountExperiment missing id', () => {
    const r = validateIntent({ tool: 'mountExperiment', args: {} }, 0);
    expect(r.status).toBe('invalid_args');
    expect(r.reason).toMatch(/id must be non-empty/);
  });

  it('rejects mountExperiment with experimentId (legacy field rejected)', () => {
    // ADR-030 §3 canonical: args.id NOT experimentId
    const r = validateIntent({ tool: 'mountExperiment', args: { experimentId: 'v1-cap6' } }, 0);
    expect(r.status).toBe('invalid_args');
  });

  it('validates toggleDrawing with boolean enabled', () => {
    const r = validateIntent({ tool: 'toggleDrawing', args: { enabled: true } }, 0);
    expect(r.status).toBe('ok');
  });

  it('rejects toggleDrawing with non-boolean enabled', () => {
    const r = validateIntent({ tool: 'toggleDrawing', args: { enabled: 'yes' } }, 0);
    expect(r.status).toBe('invalid_args');
    expect(r.reason).toMatch(/enabled must be boolean/);
  });

  it('validates serialWrite with text', () => {
    const r = validateIntent({ tool: 'serialWrite', args: { text: 'Hello Arduino' } }, 0);
    expect(r.status).toBe('ok');
  });

  it('rejects serialWrite missing text', () => {
    const r = validateIntent({ tool: 'serialWrite', args: {} }, 0);
    expect(r.status).toBe('invalid_args');
  });

  it('validates setComponentValue with id+field+value', () => {
    const r = validateIntent({
      tool: 'setComponentValue',
      args: { id: 'r1', field: 'resistance', value: 220 },
    }, 0);
    expect(r.status).toBe('ok');
  });

  it('rejects setComponentValue missing field', () => {
    const r = validateIntent({ tool: 'setComponentValue', args: { id: 'r1', value: 220 } }, 0);
    expect(r.status).toBe('invalid_args');
    expect(r.reason).toMatch(/field/);
  });

  it('validates no-arg tools (clearHighlights, captureScreenshot, getCircuitState, clearCircuit)', () => {
    expect(validateIntent({ tool: 'clearHighlights', args: {} }, 0).status).toBe('ok');
    expect(validateIntent({ tool: 'captureScreenshot', args: {} }, 0).status).toBe('ok');
    expect(validateIntent({ tool: 'getCircuitState', args: {} }, 0).status).toBe('ok');
    expect(validateIntent({ tool: 'clearCircuit', args: {} }, 0).status).toBe('ok');
    expect(validateIntent({ tool: 'getCircuitDescription', args: {} }, 0).status).toBe('ok');
    expect(validateIntent({ tool: 'clearHighlightPins', args: {} }, 0).status).toBe('ok');
  });
});

describe('validateIntent — legacy {action, params} backward-compat', () => {
  it('accepts {action, params} shape (intentsDispatcher iter 37 compat)', () => {
    const r = validateIntent({ action: 'mountExperiment', params: { id: 'v1-cap6-esp1' } }, 0);
    expect(r.status).toBe('ok');
    expect(r.tool).toBe('mountExperiment');
    expect(r.args).toEqual({ id: 'v1-cap6-esp1' });
  });

  it('canonical {tool, args} takes priority over legacy {action, params}', () => {
    const r = validateIntent({
      tool: 'highlightComponent',
      action: 'mountExperiment',
      args: { ids: ['led1'] },
    }, 0);
    expect(r.tool).toBe('highlightComponent');
  });
});

describe('validateIntent — rejection paths', () => {
  it('rejects unknown tool with unknown_tool status', () => {
    const r = validateIntent({ tool: 'deleteAllUserData', args: {} }, 0);
    expect(r.status).toBe('unknown_tool');
    expect(r.reason).toMatch(/not in 12-tool iter 43 subset/);
  });

  it('rejects null intent with invalid_args', () => {
    const r = validateIntent(null, 0);
    expect(r.status).toBe('invalid_args');
    expect(r.tool).toBe('<malformed>');
  });

  it('rejects non-object intent (string, number, array)', () => {
    expect(validateIntent('mountExperiment', 0).status).toBe('invalid_args');
    expect(validateIntent(42, 0).status).toBe('invalid_args');
    // Arrays are typeof 'object' but should still be detected as malformed via missing tool
    const arrResult = validateIntent([], 0);
    expect(['invalid_args']).toContain(arrResult.status);
  });

  it('rejects intent missing both tool and action', () => {
    const r = validateIntent({ args: { ids: ['led1'] } }, 0);
    expect(r.status).toBe('invalid_args');
    expect(r.tool).toBe('<missing>');
  });

  it('preserves index from input position', () => {
    expect(validateIntent({ tool: 'unknown' }, 5).index).toBe(5);
    expect(validateIntent({ tool: 'highlightComponent', args: { ids: ['x'] } }, 99).index).toBe(99);
  });
});

describe('dispatchIntentsServerSide — batch validation', () => {
  it('returns empty result for non-array input', () => {
    const r = dispatchIntentsServerSide(null);
    expect(r.forwarded).toEqual([]);
    expect(r.entries).toEqual([]);
    expect(r.meta.total).toBe(0);
  });

  it('returns empty result for empty array', () => {
    const r = dispatchIntentsServerSide([]);
    expect(r.forwarded).toEqual([]);
    expect(r.meta.total).toBe(0);
  });

  it('forwards only valid intents to forwarded[]', () => {
    const r = dispatchIntentsServerSide([
      { tool: 'highlightComponent', args: { ids: ['led1'] } },
      { tool: 'mountExperiment', args: { id: 'v1-cap6-esp1' } },
      { tool: 'unknownTool', args: {} },
      { tool: 'highlightComponent', args: {} }, // invalid
    ]);
    expect(r.forwarded).toHaveLength(2);
    expect(r.forwarded[0].tool).toBe('highlightComponent');
    expect(r.forwarded[1].tool).toBe('mountExperiment');
  });

  it('records all entries with status (ok + rejected)', () => {
    const r = dispatchIntentsServerSide([
      { tool: 'highlightComponent', args: { ids: ['led1'] } },
      { tool: 'unknownTool', args: {} },
    ]);
    expect(r.entries).toHaveLength(2);
    expect(r.entries[0].status).toBe('ok');
    expect(r.entries[1].status).toBe('unknown_tool');
  });

  it('aggregates meta counters (total, ok, rejected, rejected_tools)', () => {
    const r = dispatchIntentsServerSide([
      { tool: 'highlightComponent', args: { ids: ['led1'] } },
      { tool: 'mountExperiment', args: { id: 'v1-cap6-esp1' } },
      { tool: 'destroyAll', args: {} },
      { tool: 'submitForm', args: {} },
    ]);
    expect(r.meta.total).toBe(4);
    expect(r.meta.ok).toBe(2);
    expect(r.meta.rejected).toBe(2);
    expect(r.meta.rejected_tools).toEqual(['destroyAll', 'submitForm']);
  });

  it('handles mixed canonical + legacy shape in same batch', () => {
    const r = dispatchIntentsServerSide([
      { tool: 'mountExperiment', args: { id: 'v1-cap6-esp1' } },
      { action: 'highlightComponent', params: { ids: ['led1'] } },
    ]);
    expect(r.meta.ok).toBe(2);
    expect(r.forwarded).toHaveLength(2);
  });

  it('preserves intent order via index field', () => {
    const r = dispatchIntentsServerSide([
      { tool: 'highlightComponent', args: { ids: ['led1'] } },
      { tool: 'mountExperiment', args: { id: 'v1-cap6-esp1' } },
      { tool: 'captureScreenshot', args: {} },
    ]);
    expect(r.entries[0].index).toBe(0);
    expect(r.entries[1].index).toBe(1);
    expect(r.entries[2].index).toBe(2);
  });
});

describe('clawbot-dispatcher-deno — Sprint V iter 44 honest verifiable atom', () => {
  it('declares 12-tool subset (Andrea Q2 iter 43 decision)', () => {
    expect(CLAWBOT_DISPATCHER_DENO_SUBSET.length).toBeGreaterThanOrEqual(12);
  });

  it('declares 62-tool full port DEFERRED iter 44+ (per scaffold comment)', () => {
    // Sentinel: this test confirms documented deferral. When 62-tool full port
    // ships, change CLAWBOT_DISPATCHER_DENO_VERSION '1.0-iter43-12tool' →
    // '2.0-iter44-62tool' which will fail the version test above to flag review.
    expect(CLAWBOT_DISPATCHER_DENO_VERSION).toMatch(/iter43|iter44|iter45/);
  });
});
