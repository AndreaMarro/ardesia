/**
 * Unit tests — iter 37 Atom B-NEW: useGalileoChat consume `intents_parsed`.
 *
 * Validates the browser-side dispatcher (`executeServerIntents`) that consumes
 * `intents_parsed` returned by the Edge Function `unlim-chat` (per ADR-028
 * §14 surface-to-browser amend).
 *
 * The actual dispatch function lives in `src/components/lavagna/intentsDispatcher.js`
 * (extracted from the React hook so it's unit-testable without DOM rendering).
 *
 * Acceptance per PDR Atom B-NEW spec:
 *   T1: empty array → results = []
 *   T2: whitelisted action with handler → fn invoked once with params
 *   T3: action NOT in whitelist → skipped + warning + entry `not_whitelisted`
 *   T4: whitelisted action but handler missing → entry `fn_not_found`
 *   T5: handler throws → entry error caught + NEXT intent still dispatched
 *
 * (c) Andrea Marro 2026-04-30 — ELAB Tutor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger so warnings don't spam test output but ARE assertable.
vi.mock('../../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import {
  executeServerIntents,
  isAllowedIntent,
  getIntentAction,
  getIntentParams,
  resolveIntentFn,
  ALLOWED_INTENT_ACTIONS,
  INTENTS_DISPATCHER_VERSION,
} from '../../../../src/components/lavagna/intentsDispatcher';

import logger from '../../../../src/utils/logger';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('intentsDispatcher — helper introspection', () => {
  it('exposes a non-empty whitelist Set', () => {
    expect(ALLOWED_INTENT_ACTIONS).toBeInstanceOf(Set);
    expect(ALLOWED_INTENT_ACTIONS.size).toBeGreaterThanOrEqual(10);
    // 12 specific entries per PDR Atom B-NEW spec
    expect(ALLOWED_INTENT_ACTIONS.has('highlightComponent')).toBe(true);
    expect(ALLOWED_INTENT_ACTIONS.has('mountExperiment')).toBe(true);
    expect(ALLOWED_INTENT_ACTIONS.has('captureScreenshot')).toBe(true);
  });

  it('does NOT whitelist destructive ops', () => {
    expect(ALLOWED_INTENT_ACTIONS.has('deleteAll')).toBe(false);
    expect(ALLOWED_INTENT_ACTIONS.has('submitForm')).toBe(false);
    expect(ALLOWED_INTENT_ACTIONS.has('fetchExternalUrl')).toBe(false);
  });

  it('exposes version marker', () => {
    expect(INTENTS_DISPATCHER_VERSION).toMatch(/iter37/);
  });
});

describe('intentsDispatcher — getIntentAction / getIntentParams', () => {
  it('reads canonical {tool, args} shape (Edge Function emits this)', () => {
    const intent = { tool: 'highlightComponent', args: { ids: ['led1'] } };
    expect(getIntentAction(intent)).toBe('highlightComponent');
    expect(getIntentParams(intent)).toEqual({ ids: ['led1'] });
  });

  it('reads alias {action, params} shape', () => {
    const intent = { action: 'mountExperiment', params: { id: 'v1-cap6-esp1' } };
    expect(getIntentAction(intent)).toBe('mountExperiment');
    expect(getIntentParams(intent)).toEqual({ id: 'v1-cap6-esp1' });
  });

  it('returns null / empty object on bad shapes', () => {
    expect(getIntentAction(null)).toBeNull();
    expect(getIntentAction(undefined)).toBeNull();
    expect(getIntentAction({})).toBeNull();
    expect(getIntentAction({ tool: 42 })).toBeNull();
    expect(getIntentParams(null)).toEqual({});
    expect(getIntentParams({})).toEqual({});
  });
});

describe('intentsDispatcher — isAllowedIntent', () => {
  it('returns true for whitelisted actions', () => {
    expect(isAllowedIntent({ tool: 'highlightComponent' })).toBe(true);
    expect(isAllowedIntent({ action: 'mountExperiment' })).toBe(true);
    expect(isAllowedIntent({ tool: 'captureScreenshot' })).toBe(true);
  });

  it('returns false for non-whitelisted actions', () => {
    expect(isAllowedIntent({ tool: 'deleteAll' })).toBe(false);
    expect(isAllowedIntent({ tool: 'submitForm' })).toBe(false);
    expect(isAllowedIntent({ tool: 'arbitrary_unknown' })).toBe(false);
  });

  it('returns false on missing / malformed records', () => {
    expect(isAllowedIntent(null)).toBe(false);
    expect(isAllowedIntent({})).toBe(false);
    expect(isAllowedIntent({ tool: '' })).toBe(false);
    expect(isAllowedIntent({ tool: 42 })).toBe(false);
  });
});

describe('intentsDispatcher — resolveIntentFn', () => {
  it('prefers api.unlim[action] when present', () => {
    const innerFn = () => 'inner';
    const outerFn = () => 'outer';
    const api = { unlim: { highlightComponent: innerFn }, highlightComponent: outerFn };
    expect(resolveIntentFn(api, 'highlightComponent')).toBe(innerFn);
  });

  it('falls back to api[action] when api.unlim is absent', () => {
    const fn = () => 'top-level';
    const api = { mountExperiment: fn };
    expect(resolveIntentFn(api, 'mountExperiment')).toBe(fn);
  });

  it('returns null when neither path resolves', () => {
    expect(resolveIntentFn({}, 'highlightComponent')).toBeNull();
    expect(resolveIntentFn(null, 'highlightComponent')).toBeNull();
    expect(resolveIntentFn({ unlim: {} }, 'highlightComponent')).toBeNull();
  });
});

describe('intentsDispatcher — executeServerIntents', () => {
  // T1 — empty / non-array input
  it('T1: empty array → results = []', async () => {
    const r = await executeServerIntents([], { api: { unlim: {} } });
    expect(r).toEqual([]);
  });

  it('T1b: non-array input (null/undefined) → results = []', async () => {
    expect(await executeServerIntents(null, { api: {} })).toEqual([]);
    expect(await executeServerIntents(undefined, { api: {} })).toEqual([]);
  });

  // T2 — whitelisted action with handler under api.unlim
  it('T2: whitelisted intent invokes fn once with params', async () => {
    const highlightComponent = vi.fn(() => ({ highlighted: ['led1', 'r1'] }));
    const api = { unlim: { highlightComponent } };
    const intents = [{ tool: 'highlightComponent', args: { ids: ['led1', 'r1'] } }];

    const r = await executeServerIntents(intents, { api });

    expect(highlightComponent).toHaveBeenCalledTimes(1);
    expect(highlightComponent).toHaveBeenCalledWith({ ids: ['led1', 'r1'] });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ ok: true, action: 'highlightComponent' });
    expect(r[0].result).toEqual({ highlighted: ['led1', 'r1'] });
  });

  it('T2b: whitelisted intent under top-level api[action]', async () => {
    const captureScreenshot = vi.fn(() => Promise.resolve('data:image/png;base64,abc'));
    const api = { captureScreenshot };
    const intents = [{ tool: 'captureScreenshot', args: {} }];

    const r = await executeServerIntents(intents, { api });

    expect(captureScreenshot).toHaveBeenCalledTimes(1);
    expect(r[0].ok).toBe(true);
    expect(r[0].result).toBe('data:image/png;base64,abc');
  });

  // T3 — action NOT in whitelist
  it('T3: non-whitelisted action skipped + warned + result not_whitelisted', async () => {
    const deleteAll = vi.fn();
    const api = { deleteAll };
    const intents = [{ tool: 'deleteAll', args: { force: true } }];

    const r = await executeServerIntents(intents, { api });

    expect(deleteAll).not.toHaveBeenCalled();
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ ok: false, action: 'deleteAll', error: 'not_whitelisted' });
    expect(logger.warn).toHaveBeenCalled();
  });

  // T4 — whitelisted action but handler missing on api
  it('T4: handler missing on api → fn_not_found', async () => {
    const api = { unlim: {} }; // no handlers at all
    const intents = [{ tool: 'highlightComponent', args: { ids: ['led1'] } }];

    const r = await executeServerIntents(intents, { api });

    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ ok: false, action: 'highlightComponent', error: 'fn_not_found' });
  });

  // T5 — handler throws, NEXT intent still dispatched (error isolation)
  it('T5: handler throws → caught + NEXT intent still dispatched', async () => {
    const failing = vi.fn(() => { throw new Error('boom'); });
    const succeeding = vi.fn(() => 'ok');
    const api = {
      unlim: {
        highlightComponent: failing,
        clearHighlights: succeeding,
      },
    };
    const intents = [
      { tool: 'highlightComponent', args: { ids: ['led1'] } },
      { tool: 'clearHighlights', args: {} },
    ];

    const r = await executeServerIntents(intents, { api });

    expect(failing).toHaveBeenCalledTimes(1);
    expect(succeeding).toHaveBeenCalledTimes(1);
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({ ok: false, action: 'highlightComponent' });
    expect(r[0].error).toBe('boom');
    expect(r[1]).toMatchObject({ ok: true, action: 'clearHighlights', result: 'ok' });
  });

  // Extra hardening tests
  it('handles api === null gracefully (api_unavailable)', async () => {
    const intents = [{ tool: 'highlightComponent', args: { ids: ['led1'] } }];
    const r = await executeServerIntents(intents, { api: null });
    expect(r[0]).toEqual({ ok: false, action: 'highlightComponent', error: 'api_unavailable' });
  });

  it('processes mixed-validity intent batch correctly', async () => {
    const highlightComponent = vi.fn(() => 'hl-ok');
    const captureScreenshot = vi.fn(() => 'png-bytes');
    const api = {
      unlim: { highlightComponent },
      captureScreenshot,
    };
    const intents = [
      { tool: 'highlightComponent', args: { ids: ['led1'] } },     // ok
      { tool: 'deleteAll', args: { force: true } },                 // not_whitelisted
      { tool: 'mountExperiment', args: { id: 'v1-cap6-esp1' } },    // fn_not_found
      { tool: 'captureScreenshot', args: {} },                      // ok
    ];

    const r = await executeServerIntents(intents, { api });

    expect(r).toHaveLength(4);
    expect(r[0]).toMatchObject({ ok: true, action: 'highlightComponent' });
    expect(r[1]).toMatchObject({ ok: false, action: 'deleteAll', error: 'not_whitelisted' });
    expect(r[2]).toMatchObject({ ok: false, action: 'mountExperiment', error: 'fn_not_found' });
    expect(r[3]).toMatchObject({ ok: true, action: 'captureScreenshot' });
    expect(highlightComponent).toHaveBeenCalledTimes(1);
    expect(captureScreenshot).toHaveBeenCalledTimes(1);
  });

  it('awaits async handlers (Promise return)', async () => {
    let resolved = false;
    const slowFn = vi.fn(() => new Promise(resolve => {
      setTimeout(() => { resolved = true; resolve('done'); }, 10);
    }));
    const api = { unlim: { highlightComponent: slowFn } };
    const intents = [{ tool: 'highlightComponent', args: {} }];

    const r = await executeServerIntents(intents, { api });

    expect(resolved).toBe(true);
    expect(r[0].result).toBe('done');
  });
});
