/**
 * unlim-observability.test.js — Sprint 2026-05-25 PM
 *
 * Tests for `supabase/functions/_shared/observability.ts` helper.
 *
 * Goal: neutralize the 18+ silent catch sites surfaced in iter 105 audit. The
 * helper itself must NEVER throw, must always produce structured JSON, and
 * must include error message + capped stack frames.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  logSilentFailure,
  logSilentError,
} from '../../supabase/functions/_shared/observability.ts';

describe('logSilentFailure — structured warn log', () => {
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('1.1 — emits valid JSON with level=warn and event name', () => {
    logSilentFailure('rag_bm25_or_fallback_fail', new Error('timeout'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.level).toBe('warn');
    expect(payload.event).toBe('rag_bm25_or_fallback_fail');
  });

  it('1.2 — includes error.message from Error instance', () => {
    logSilentFailure('rag_dense_fail', new Error('voyage 429'));
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.error).toBe('voyage 429');
  });

  it('1.3 — coerces non-Error to String', () => {
    logSilentFailure('test', 'plain string error');
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.error).toBe('plain string error');
  });

  it('1.4 — coerces undefined gracefully', () => {
    logSilentFailure('test', undefined);
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.error).toBe('undefined');
  });

  it('1.5 — coerces null gracefully', () => {
    logSilentFailure('test', null);
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.error).toBe('null');
  });

  it('1.6 — coerces number/boolean gracefully', () => {
    logSilentFailure('test', 42);
    expect(JSON.parse(warnSpy.mock.calls[0][0]).error).toBe('42');
    logSilentFailure('test', true);
    expect(JSON.parse(warnSpy.mock.calls[1][0]).error).toBe('true');
  });

  it('1.7 — includes stack (max 3 frames pipe-joined) when Error has stack', () => {
    const err = new Error('boom');
    // Force a multi-line stack
    err.stack = 'Error: boom\n    at A\n    at B\n    at C\n    at D';
    logSilentFailure('test', err);
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.stack).toBe('Error: boom |     at A |     at B');
  });

  it('1.8 — omits stack when err is not Error', () => {
    logSilentFailure('test', 'string only');
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload).not.toHaveProperty('stack');
  });

  it('1.9 — merges extra context into payload', () => {
    logSilentFailure('test', new Error('x'), { tokens: 5, source: 'wiki' });
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.tokens).toBe(5);
    expect(payload.source).toBe('wiki');
  });

  it('1.10 — payload includes numeric ts close to Date.now()', () => {
    const before = Date.now();
    logSilentFailure('test', new Error('x'));
    const after = Date.now();
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.ts).toBeGreaterThanOrEqual(before);
    expect(payload.ts).toBeLessThanOrEqual(after);
  });

  it('1.11 — does NOT throw when console.warn throws (logger of last resort)', () => {
    warnSpy.mockImplementation(() => {
      throw new Error('console broken');
    });
    expect(() => logSilentFailure('test', new Error('x'))).not.toThrow();
  });

  it('1.12 — does NOT throw when extra contains circular ref', () => {
    const circular = { name: 'a' };
    circular.self = circular;
    expect(() =>
      logSilentFailure('test', new Error('x'), { circular }),
    ).not.toThrow();
  });

  it('1.13 — empty extra produces minimal payload (no extra props)', () => {
    logSilentFailure('test', new Error('x'));
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    // Required keys only: level, event, error, ts, stack
    const expectedKeys = new Set(['level', 'event', 'error', 'ts', 'stack']);
    Object.keys(payload).forEach((k) => expect(expectedKeys.has(k)).toBe(true));
  });

  it('1.14 — extra fields CANNOT override mandatory fields (iter 105.4 H3 fix)', () => {
    // iter 105.4 fix audit M3 finding O.15: built-in fields placed AFTER
    // spread in payload construction now defeat accidental level override.
    logSilentFailure('test', new Error('x'), { level: 'info', event: 'hijack' });
    const payload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(payload.level).toBe('warn'); // built-in wins
    expect(payload.event).toBe('test'); // built-in wins
  });
});

describe('logSilentError — structured error log for compliance/safety breaks', () => {
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('2.1 — emits to console.error (NOT console.warn) with level=error', () => {
    logSilentError('audit_writer_fail', new Error('insert denied'), {
      rule: 'gdpr_minori',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    const payload = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(payload.level).toBe('error');
    expect(payload.event).toBe('audit_writer_fail');
    expect(payload.rule).toBe('gdpr_minori');
  });

  it('2.2 — never throws even if console.error throws', () => {
    errorSpy.mockImplementation(() => {
      throw new Error('broken');
    });
    expect(() =>
      logSilentError('audit_writer_fail', new Error('x')),
    ).not.toThrow();
  });

  it('2.3 — never throws on circular extra', () => {
    const circular = { name: 'a' };
    circular.self = circular;
    expect(() =>
      logSilentError('test', new Error('x'), { circular }),
    ).not.toThrow();
  });
});

describe('Pattern: replacement for `catch (_e) {}` sites', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('3.1 — caught error in fallback chain produces telemetry (no rethrow)', () => {
    const fakeCaller = async () => {
      try {
        throw new Error('voyage timeout');
      } catch (err) {
        logSilentFailure('voyage_embed_fail', err, { provider: 'voyage' });
        return null; // preserve original silent-fallback contract
      }
    };
    return fakeCaller().then((result) => {
      expect(result).toBe(null);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const payload = JSON.parse(warnSpy.mock.calls[0][0]);
      expect(payload.event).toBe('voyage_embed_fail');
      expect(payload.provider).toBe('voyage');
    });
  });

  it('3.2 — array return contract preserved (returns [], NOT throws)', () => {
    const fakeCaller = () => {
      try {
        throw new Error('rate limit');
      } catch (err) {
        logSilentFailure('rag_or_fallback_fail', err);
        return [];
      }
    };
    const result = fakeCaller();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
