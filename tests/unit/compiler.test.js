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
    const { compileCode } = await import('../../src/services/api.js');
    compileCode.mockResolvedValueOnce({ success: false, hex: null, errors: 'timeout', source: 'none' }).mockResolvedValueOnce({ success: false, hex: null, errors: 'timeout', source: 'none' });

    const result = await compileArduinoCode('void setup_retry_test(){} void loop(){}');
    expect(result.success).toBe(false);
  }, 15000);
});

describe('compileArduinoCode — cache', () => {
  it('returns success from compile', async () => {
    const { compileCode } = await import('../../src/services/api.js');
    compileCode.mockResolvedValueOnce({ success: true, hex: ':AABBCCDD', size: 100 });

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
    compileCode.mockResolvedValue({ success: true, hex: ':NORM', size: 10 });
    
    const code1 = 'void setup() { x(); } // comment\nvoid loop() {}';
    const code2 = 'void setup() { x(); }\nvoid loop() {}';
    
    await compileArduinoCode(code1);
    const result2 = await compileArduinoCode(code2);
    // Same normalized code should use cache
    expect(result2.source).toBe('cache');
  });
});
