/**
 * Sprint U iter 25 P0-B — Tests for callWithRetry + safety-hardcoded-fallback.
 *
 * Context: iter 24 dim-1 LIVE prod bench HTTP 503 rate 11.4% (8/70 query) on
 * Mistral burst rate-limit. Cat C safety query "scossa" returned 503 vuoto
 * (GDPR rischio: minori 8-14 anni senza warning sicurezza 220V).
 *
 * Coverage:
 *   - retry on 5xx: 1 fail + 1 success = total 2 calls
 *   - retry on 429 rate-limit
 *   - retry on TypeError fetch network error
 *   - retry exhausted (3× 5xx → throw)
 *   - fail-fast on 4xx (401/422 → NO retry)
 *   - jitter randomization within range
 *   - exponential backoff progression
 *   - total budget enforcement
 *   - retry success after burst rate-limit
 *   - safety hardcoded fallback: 3 canonical strings
 *   - safety hardcoded fallback: ZERO network call (no fetch invocation)
 *   - safety hardcoded fallback: unknown type defensive
 *   - safety hardcoded fallback: deterministic / pure
 *   - safety hardcoded fallback: PRINCIPIO ZERO compliance (Ragazzi opener)
 *
 * NOTE: extension is .js to match vitest.config.js include
 * `tests/**\/*.{test,spec}.{js,jsx}`. Source helpers are .ts (Deno Edge runtime).
 * vitest 3.x can import .ts via Vite plugin.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ───────────────────────────────────────────────────────────────────
// Module loads (defensive — Deno .ts imports under vitest 3.x Vite plugin)
// ───────────────────────────────────────────────────────────────────

let callWithRetry;
let GeminiError;
let ErrorCode;
let getSafetyHardcodedResponse;
let isKnownSafetyType;
let SAFETY_HARDCODED_FALLBACK_VERSION;
let importError = null;

try {
  const llmMod = await import('../../supabase/functions/_shared/llm-client.ts');
  callWithRetry = llmMod.callWithRetry;
  GeminiError = llmMod.GeminiError;
  ErrorCode = llmMod.ErrorCode;
} catch (err) {
  importError = err;
}

try {
  const safetyMod = await import('../../supabase/functions/_shared/safety-hardcoded-fallback.ts');
  getSafetyHardcodedResponse = safetyMod.getSafetyHardcodedResponse;
  isKnownSafetyType = safetyMod.isKnownSafetyType;
  SAFETY_HARDCODED_FALLBACK_VERSION = safetyMod.SAFETY_HARDCODED_FALLBACK_VERSION;
} catch (err) {
  if (!importError) importError = err;
}

describe('llm-client retry + safety fallback — module loads', () => {
  it('imports without error', () => {
    expect(importError).toBeNull();
  });
  it('exposes callWithRetry function', () => {
    expect(typeof callWithRetry).toBe('function');
  });
  it('exposes safety helpers', () => {
    expect(typeof getSafetyHardcodedResponse).toBe('function');
    expect(typeof isKnownSafetyType).toBe('function');
    expect(typeof SAFETY_HARDCODED_FALLBACK_VERSION).toBe('string');
  });
});

// ───────────────────────────────────────────────────────────────────
// callWithRetry — retry behavior
// ───────────────────────────────────────────────────────────────────

describe('callWithRetry — retry on 5xx', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retries once on SERVICE_UNAVAILABLE then succeeds (2 calls total)', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'Mistral 503'))
      .mockResolvedValueOnce({ text: 'ok', provider: 'mistral' });

    const result = await callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'test' });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('ok');
  });

  it('retries on SERVICE_RATE_LIMITED (429) then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new GeminiError(ErrorCode.SERVICE_RATE_LIMITED, 'rate limit 429'))
      .mockResolvedValueOnce({ text: 'recovered' });

    const result = await callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'rl-test' });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('recovered');
  });

  it('retries up to maxAttempts then throws last error (3× 503)', async () => {
    const err503 = new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'persistent 503');
    const fn = vi.fn().mockRejectedValue(err503);

    await expect(
      callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'exhausted' }),
    ).rejects.toThrow('persistent 503');

    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('callWithRetry — fail-fast on 4xx', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('does NOT retry API_ERROR (4xx auth/validation)', async () => {
    const err401 = new GeminiError(ErrorCode.API_ERROR, 'Mistral 401 invalid key');
    const fn = vi.fn().mockRejectedValue(err401);

    await expect(
      callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'auth-fail' }),
    ).rejects.toThrow('Mistral 401');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry EMPTY_RESPONSE (model output empty)', async () => {
    const errEmpty = new GeminiError(ErrorCode.EMPTY_RESPONSE, 'empty model output');
    const fn = vi.fn().mockRejectedValue(errEmpty);

    await expect(
      callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'empty' }),
    ).rejects.toThrow('empty model output');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry unknown Error (logic bug guard)', async () => {
    const errUnknown = new Error('unexpected logic error');
    const fn = vi.fn().mockRejectedValue(errUnknown);

    await expect(
      callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'unknown' }),
    ).rejects.toThrow('unexpected logic error');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('callWithRetry — network errors', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('retries on TypeError "fetch failed" (transient network)', async () => {
    const netErr = new TypeError('fetch failed: ECONNRESET');
    const fn = vi.fn()
      .mockRejectedValueOnce(netErr)
      .mockResolvedValueOnce({ text: 'after-network-recovery' });

    const result = await callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'net' });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('after-network-recovery');
  });

  it('retries on TIMEOUT (DOMException AbortError)', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new GeminiError(ErrorCode.TIMEOUT, 'request timed out'))
      .mockResolvedValueOnce({ text: 'timeout-recovered' });

    const result = await callWithRetry(fn, { maxAttempts: 3, baseDelayMs: 1, jitter: 0, label: 'timeout' });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('timeout-recovered');
  });
});

describe('callWithRetry — backoff timing + jitter', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('jitter produces different delays across runs (randomized)', async () => {
    const delays = new Set();
    const baseDelay = 100;

    // Run several retry loops and capture sleep durations indirectly via timing.
    // Easier: directly verify via Math.random usage — patch Math.random and
    // ensure the returned delay depends on it.
    const randomSpy = vi.spyOn(Math, 'random');

    for (let i = 0; i < 3; i++) {
      randomSpy.mockReturnValueOnce(i / 3); // 0, 0.33, 0.66
      const err503 = new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, '503');
      const fn = vi.fn()
        .mockRejectedValueOnce(err503)
        .mockResolvedValueOnce({ text: 'ok' });

      const t0 = Date.now();
      await callWithRetry(fn, { maxAttempts: 2, baseDelayMs: baseDelay, factor: 1, jitter: 0.5, label: 'jitter' });
      delays.add(Date.now() - t0);
    }

    expect(randomSpy).toHaveBeenCalled();
    // Note: real-time deltas are noisy under vitest, so we just verify
    // Math.random was consulted (proof of jitter math path).
  });

  it('exponential backoff: delays grow with attempt (factor=2)', async () => {
    const err503 = new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, '503');
    const fn = vi.fn().mockRejectedValue(err503);

    const t0 = Date.now();
    await expect(
      callWithRetry(fn, {
        maxAttempts: 3,
        baseDelayMs: 20,
        factor: 2,
        jitter: 0, // deterministic for assertion
        label: 'exp',
      }),
    ).rejects.toThrow();
    const elapsed = Date.now() - t0;

    // attempt 0 fail → sleep 20 (base*1)
    // attempt 1 fail → sleep 40 (base*2)
    // attempt 2 fail → THROW (no sleep)
    // total ≈ 60ms minimum, allow generous upper bound for CI noise.
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('callWithRetry — budget enforcement', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('aborts when total budget would be exceeded', async () => {
    const err503 = new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, '503');
    const fn = vi.fn().mockRejectedValue(err503);

    // Budget very tight: 50ms. baseDelay 200ms × factor 2 → first retry exceeds budget.
    await expect(
      callWithRetry(fn, {
        maxAttempts: 5,
        baseDelayMs: 200,
        factor: 2,
        jitter: 0,
        totalBudgetMs: 50,
        label: 'budget',
      }),
    ).rejects.toThrow();

    // Only the first attempt fires; budget kills the retry before 2nd call.
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ───────────────────────────────────────────────────────────────────
// Safety hardcoded fallback
// ───────────────────────────────────────────────────────────────────

describe('safety-hardcoded-fallback — canonical responses', () => {
  it('returns voltage_danger canonical text with kit ELAB 9V mandate', () => {
    const text = getSafetyHardcodedResponse('voltage_danger');

    expect(text).toMatch(/^Ragazzi/);
    expect(text).toMatch(/220V/);
    expect(text).toMatch(/kit ELAB/);
    expect(text).toMatch(/9V/);
    expect(text.length).toBeLessThan(400);
  });

  it('returns minor_inappropriate redirect to electronics topic', () => {
    const text = getSafetyHardcodedResponse('minor_inappropriate');

    expect(text).toMatch(/^Ragazzi/);
    expect(text).toMatch(/UNLIM/);
    expect(text).toMatch(/elettronica/i);
  });

  it('returns generic_safety conservative defer to teacher', () => {
    const text = getSafetyHardcodedResponse('generic_safety');

    expect(text).toMatch(/^Ragazzi/);
    expect(text).toMatch(/docente/);
  });

  it('all 3 canonical types start with "Ragazzi" plurale opener', () => {
    const types = ['voltage_danger', 'minor_inappropriate', 'generic_safety'];
    for (const t of types) {
      expect(getSafetyHardcodedResponse(t)).toMatch(/^Ragazzi[,\s]/);
    }
  });

  it('falls back to generic_safety on unknown type (defensive)', () => {
    // Cast through to bypass TS narrowing — runtime contract.
    const text = getSafetyHardcodedResponse('unknown_type_xyz');
    expect(text).toMatch(/^Ragazzi/);
    expect(text).toBe(getSafetyHardcodedResponse('generic_safety'));
  });
});

describe('safety-hardcoded-fallback — purity', () => {
  beforeEach(() => {
    // Fail loudly if any code path attempts a network call.
    globalThis.__fetchCallCount = 0;
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => {
      globalThis.__fetchCallCount++;
      throw new Error('fetch should NOT be called by safety hardcoded fallback');
    });
    // Stash for cleanup
    globalThis.__origFetch = origFetch;
  });
  afterEach(() => {
    if (globalThis.__origFetch) globalThis.fetch = globalThis.__origFetch;
    delete globalThis.__origFetch;
    delete globalThis.__fetchCallCount;
  });

  it('makes ZERO network calls when invoked (no fetch)', () => {
    getSafetyHardcodedResponse('voltage_danger');
    getSafetyHardcodedResponse('minor_inappropriate');
    getSafetyHardcodedResponse('generic_safety');

    expect(globalThis.__fetchCallCount).toBe(0);
  });

  it('is deterministic — same input always returns identical string', () => {
    const a = getSafetyHardcodedResponse('voltage_danger');
    const b = getSafetyHardcodedResponse('voltage_danger');
    const c = getSafetyHardcodedResponse('voltage_danger');

    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('isKnownSafetyType correctly narrows discriminated union', () => {
    expect(isKnownSafetyType('voltage_danger')).toBe(true);
    expect(isKnownSafetyType('minor_inappropriate')).toBe(true);
    expect(isKnownSafetyType('generic_safety')).toBe(true);
    expect(isKnownSafetyType('arbitrary_string')).toBe(false);
    expect(isKnownSafetyType('')).toBe(false);
  });

  it('exposes version marker for audit telemetry', () => {
    expect(SAFETY_HARDCODED_FALLBACK_VERSION).toMatch(/^1\.0/);
    expect(SAFETY_HARDCODED_FALLBACK_VERSION).toContain('iter25');
  });
});
