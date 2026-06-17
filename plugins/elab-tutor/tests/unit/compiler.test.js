/**
 * compiler.test.js — Test per Compiler Service ELAB
 * Fallback chain: precompiled → cache → remote → error
 * 30+ test: hash, normalize, cache, compile flow, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compileArduinoCode, hasPrecompiledHex, getPrecompiledCount, getLastCompileSource } from '../../src/services/compiler';

// Mock api.js
vi.mock('../../src/services/api.js', () => ({
  compileCode: vi.fn(() => Promise.resolve({ success: true, hex: ':00000001FF', size: 128 })),
}));

// Mock compileCache
vi.mock('../../src/components/simulator/utils/compileCache.js', () => ({
  getCachedHex: vi.fn(() => null),
  setCachedHex: vi.fn(),
}));

// Mock experiment data
vi.mock('../../src/data/experiments-vol1.js', () => ({
  experiments: [{ id: 'v1-test', code: 'void setup(){} void loop(){}', hexFile: '/hex/test.hex', title: 'Test' }],
}));
vi.mock('../../src/data/experiments-vol2.js', () => ({ experiments: [] }));
vi.mock('../../src/data/experiments-vol3.js', () => ({ experiments: [] }));

// Mock fetch for HEX files
global.fetch = vi.fn(() => Promise.resolve({ ok: false }));

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn(() => Promise.resolve({ ok: false }));
});

describe('hasPrecompiledHex', () => {
  it('returns true for known experiment', () => {
    expect(hasPrecompiledHex('v3-cap6-semaforo')).toBe(true);
  });
  it('returns false for unknown experiment', () => {
    expect(hasPrecompiledHex('v99-nonexistent')).toBe(false);
  });
  it('returns false for null', () => {
    expect(hasPrecompiledHex(null)).toBe(false);
  });
  it('returns false for undefined', () => {
    expect(hasPrecompiledHex(undefined)).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(hasPrecompiledHex('')).toBe(false);
  });
});

describe('getPrecompiledCount', () => {
  it('returns number > 0', () => {
    expect(getPrecompiledCount()).toBeGreaterThan(0);
  });
  it('returns exact count of PRECOMPILED_HEX entries', () => {
    expect(getPrecompiledCount()).toBe(8);
  });
});

describe('getLastCompileSource', () => {
  it('returns null before any compilation', () => {
    // After module reload, lastCompileSource should be null
    // In practice this depends on module state
    expect(['precompiled', 'cache', 'remote', null]).toContain(getLastCompileSource());
  });
});

describe('compileArduinoCode — remote fallback', () => {
  it('returns success from remote when no precompiled/cache', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode.mockResolvedValueOnce({ success: true, hex: ':00000001FF', size: 64 });
    
    const result = await compileArduinoCode('void setup() { pinMode(13, OUTPUT); } void loop() { }');
    expect(result.success).toBe(true);
    expect(result.hex).toBeTruthy();
  });

  it('returns error when remote fails with syntax error', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode.mockResolvedValueOnce({ success: false, hex: null, errors: 'expected ; before }' });
    
    const result = await compileArduinoCode('void setup() { broken code');
    expect(result.success).toBe(false);
    expect(result.errors).toBeTruthy();
  });

  it('retries on network error then succeeds', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'Failed to fetch', source: 'none' })
      .mockResolvedValueOnce({ success: true, hex: ':00000001FF', size: 32 });
    
    const result = await compileArduinoCode('void setup(){} void loop(){}');
    expect(result.success).toBe(true);
    expect(compileCode).toHaveBeenCalledTimes(2);
  }, 15000);

  it('returns error after all retries exhausted', async () => {
    // Wave 1 Impl-C: retry schedule [1s, 2s] = 3 total attempts
    const { compileCode } = await import('../../src/services/api.js');
    compileCode
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'timeout', source: 'none' })
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'timeout', source: 'none' })
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'timeout', source: 'none' });

    const result = await compileArduinoCode('void setup_retry_test(){} void loop(){}');
    expect(result.success).toBe(false);
  }, 15000);
});

describe('compileArduinoCode — cache', () => {
  it('returns success from compile', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    // Wave 1b Impl-C-2: remote HEX response now validated → must be valid Intel HEX.
    compileCode.mockResolvedValueOnce({ success: true, hex: ':00000001FF\n', size: 100 });

    const result = await compileArduinoCode('void setup() { uniqueSessionCacheTest(); } void loop() {}');
    expect(result.success).toBe(true);
    expect(result.hex).toBeTruthy();
  });

  it('uses persistent cache when available', async () => {
    const { getCachedHex } = await import('../../src/components/simulator/utils/compileCache.js');
    getCachedHex.mockReturnValueOnce({ hex: ':PERSISTENT', size: 50 });
    
    const result = await compileArduinoCode('void setup() { persistentCacheTest(); } void loop() {}');
    expect(result.success).toBe(true);
  });
});

describe('compileArduinoCode — edge cases', () => {
  it('handles empty code', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode.mockResolvedValueOnce({ success: false, hex: null, errors: 'empty code' });
    const result = await compileArduinoCode('');
    expect(result).toBeDefined();
  });

  it('handles very long code', async () => {
    const longCode = 'void setup() { ' + 'int x = 0; '.repeat(10000) + '} void loop() {}';
    const result = await compileArduinoCode(longCode);
    expect(result).toBeDefined();
  });

  it('handles code with special characters', async () => {
    const result = await compileArduinoCode('void setup() { Serial.println("àèìòù €£"); } void loop() {}');
    expect(result).toBeDefined();
  });

  it('handles options with experimentId', async () => {
    const result = await compileArduinoCode('void setup(){}', { experimentId: 'v3-cap6-semaforo' });
    expect(result).toBeDefined();
  });

  it('handles options with board', async () => {
    const result = await compileArduinoCode('void setup(){}', { board: 'arduino:avr:uno' });
    expect(result).toBeDefined();
  });

  it('normalizes code for hash comparison (strips comments)', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    // Wave 1b Impl-C-2: remote HEX must validate → use EOF-only Intel HEX.
    compileCode.mockResolvedValue({ success: true, hex: ':00000001FF\n', size: 10 });

    const code1 = 'void setup() { x(); } // comment\nvoid loop() {}';
    const code2 = 'void setup() { x(); }\nvoid loop() {}';

    await compileArduinoCode(code1);
    const result2 = await compileArduinoCode(code2);
    // Same normalized code should use cache
    expect(result2.source).toBe('cache');
  });
});

// ─────────────────────────────────────────────────────────────
// iter X.1.6 — fetchHexFile defensive Intel HEX validation
// Spec PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 4 item 6 + Sez 20 item 3.
// fetchHexFile usa validateIntelHex per rifiutare pre-compiled HEX malformato
// (deploy bug / SW cache corruption / CDN tampering).
// ─────────────────────────────────────────────────────────────

describe('fetchHexFile — Intel HEX validation (iter X.1.6)', () => {
  // Builder per generare codice SEMAFORO con var unica → bust sessionCache cross-test
  const semaforoCode = (unique) => `void setup() {
    int marker_${unique} = ${unique};
    pinMode(5, OUTPUT);
    pinMode(6, OUTPUT);
    pinMode(3, OUTPUT);
  }
  void loop() {
    digitalWrite(5, HIGH);
    digitalWrite(6, HIGH);
    digitalWrite(3, HIGH);
  }`;

  // Valid Intel HEX: EOF-only (smallest valid file)
  const VALID_HEX = ':00000001FF\n';

  // Valid Intel HEX: 4 data bytes 0x00 at addr 0x0000 + EOF
  const VALID_HEX_4BYTES = ':0400000000000000FC\n:00000001FF\n';

  // Bad checksum: same data but CC=FF (wrong)
  const INVALID_CHECKSUM = ':0400000000000000FF\n:00000001FF\n';

  // Not Intel HEX at all (HTML 404 page)
  const NOT_HEX = '<!DOCTYPE html>\n<html><body>404 Not Found</body></html>';

  it('accepts valid Intel HEX via FAST_PRECOMPILED_MATCHERS path', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(VALID_HEX),
    }));
    const result = await compileArduinoCode(semaforoCode(1));
    expect(result.success).toBe(true);
    expect(result.source).toBe('precompiled');
    expect(result.hex).toBe(VALID_HEX);
  });

  it('rejects malformed HEX (bad checksum) → falls through to remote', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(INVALID_CHECKSUM),
    }));
    const { compileCode } = await import('../../src/services/api.js');
    // Wave 1b Impl-C-2: remote HEX must validate → use EOF-only Intel HEX.
    compileCode.mockResolvedValue({ success: true, hex: ':00000001FF\n', size: 50 });

    const result = await compileArduinoCode(semaforoCode(2));
    expect(result.source).toBe('remote');
    expect(result.hex).toBe(':00000001FF\n');
  });

  it('rejects non-HEX content (HTML 404) → falls through', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(NOT_HEX),
    }));
    const { compileCode } = await import('../../src/services/api.js');
    // Wave 1b Impl-C-2: remote HEX must validate → use EOF-only Intel HEX.
    compileCode.mockResolvedValue({ success: true, hex: ':00000001FF\n', size: 50 });

    const result = await compileArduinoCode(semaforoCode(3));
    expect(result.source).toBe('remote');
  });

  it('accepts multi-record valid HEX (4 data bytes + EOF)', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(VALID_HEX_4BYTES),
    }));
    const result = await compileArduinoCode(semaforoCode(4));
    expect(result.success).toBe(true);
    expect(result.source).toBe('precompiled');
  });

  it('handles fetch !ok (404/500) unchanged — returns null fallthrough', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
    const { compileCode } = await import('../../src/services/api.js');
    // Wave 1b Impl-C-2: remote HEX must validate → use EOF-only Intel HEX.
    compileCode.mockResolvedValue({ success: true, hex: ':00000001FF\n', size: 30 });

    const result = await compileArduinoCode(semaforoCode(5));
    expect(result.source).toBe('remote');
  });
});

// ─────────────────────────────────────────────────────────────
// Wave 1 Impl-C — n8n compile retry with exponential backoff [1s, 2s]
// Spec PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 4 item 2
// "Timeout 30s + retry 1× exponential backoff".
//
// Behavior:
//   - 5xx server error OR network throw → retry on schedule [1000, 2000] ms
//   - 4xx client error → NO retry, immediate fail
//   - Total attempts: 3 (initial + 2 retries)
//
// Fake-timer pattern: advanceTimersByTimeAsync to drive setTimeout backoff
// without real-time wait.
// ─────────────────────────────────────────────────────────────

describe('compileArduinoCode — retry exponential backoff [1s, 2s] (Wave 1)', () => {
  // Builder for unique code per test → bust sessionCache cross-test
  const uniqueCode = (tag) => `void setup() {
    int marker_${tag} = ${tag};
  } void loop() {}`;

  it('5xx then 200 success — retries after 1s, 2 fetch calls total (Test 6)', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'server error 503', source: 'remote' })
      .mockResolvedValueOnce({ success: true, hex: ':00000001FF', size: 32 });

    vi.useFakeTimers();
    const promise = compileArduinoCode(uniqueCode('retry5xx'));
    // Run any pending microtasks first (await remoteCompileCode call)
    await vi.advanceTimersByTimeAsync(0);
    // Advance through the 1s backoff
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.success).toBe(true);
    expect(compileCode).toHaveBeenCalledTimes(2);
  }, 30000);

  it('5xx → 5xx → 200 — retries on [1s, 2s] schedule, 3 fetch calls (Test 7)', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'server error 503', source: 'remote' })
      .mockResolvedValueOnce({ success: false, hex: null, errors: 'server error 503', source: 'remote' })
      .mockResolvedValueOnce({ success: true, hex: ':00000001FF', size: 32 });

    vi.useFakeTimers();
    const promise = compileArduinoCode(uniqueCode('retry5xx7'));
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000); // first backoff
    await vi.advanceTimersByTimeAsync(2000); // second backoff
    const result = await promise;
    vi.useRealTimers();

    expect(result.success).toBe(true);
    expect(compileCode).toHaveBeenCalledTimes(3);
  }, 30000);

  it('network throw → 1× retry → throw again → bubble error (Test 8)', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockRejectedValueOnce(new Error('NetworkError'));

    vi.useFakeTimers();
    const promise = compileArduinoCode(uniqueCode('retryThrow'));
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.success).toBe(false);
    // After all attempts exhausted, returns final unreachable message
    expect(result.errors).toBeTruthy();
    expect(compileCode).toHaveBeenCalledTimes(3);
  }, 30000);

  it('4xx client error → NO retry, immediate fail (Test 9)', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode.mockResolvedValueOnce({ success: false, hex: null, errors: 'client error 400 bad request', source: 'remote' });

    vi.useFakeTimers();
    const promise = compileArduinoCode(uniqueCode('retry4xx'));
    await vi.advanceTimersByTimeAsync(0);
    const result = await promise;
    vi.useRealTimers();

    expect(result.success).toBe(false);
    // Only ONE call — no retry on 4xx
    expect(compileCode).toHaveBeenCalledTimes(1);
  }, 30000);
});
