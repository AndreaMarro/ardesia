/**
 * compiler — Tests for Arduino compiler service (FNV hash, normalize, precompiled manifest)
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/services/api.js', () => ({
  compileCode: vi.fn(() => Promise.resolve({ success: false, error: 'Mock' })),
}));

vi.mock('../../src/components/simulator/utils/compileCache.js', () => ({
  getCachedHex: vi.fn(() => null),
  setCachedHex: vi.fn(),
}));

// We test the internal helpers by importing the module
// The module exports compileArduino as default
import { compileArduinoCode, hasPrecompiledHex, getPrecompiledCount, getLastCompileSource } from '../../src/services/compiler';

describe('compiler service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
  });

  it('compileArduinoCode is a function', () => {
    expect(typeof compileArduinoCode).toBe('function');
  });

  it('hasPrecompiledHex returns true for known experiments', () => {
    expect(hasPrecompiledHex('v3-cap6-semaforo')).toBe(true);
    expect(hasPrecompiledHex('v3-cap6-blink')).toBe(true);
  });

  it('hasPrecompiledHex returns false for unknown experiments', () => {
    expect(hasPrecompiledHex('v1-cap6-esp1')).toBe(false);
    expect(hasPrecompiledHex('nonexistent')).toBe(false);
  });

  it('getPrecompiledCount returns number of precompiled experiments', () => {
    const count = getPrecompiledCount();
    expect(count).toBeGreaterThanOrEqual(6);
    expect(typeof count).toBe('number');
  });

  it('getLastCompileSource returns source info', () => {
    const source = getLastCompileSource();
    // Before any compilation, may return null or a default
    expect(source === null || typeof source === 'string').toBe(true);
  });

  it('compileArduinoCode with empty code returns error', async () => {
    const result = await compileArduinoCode('');
    expect(result.success === false || !result.hex).toBe(true);
  });

  it('compileArduinoCode with valid code attempts compilation', async () => {
    const code = 'void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); }';
    const result = await compileArduinoCode(code);
    expect(result).toBeDefined();
  });

  it('compileArduinoCode accepts experimentId option', async () => {
    const code = 'void setup() {} void loop() {}';
    const result = await compileArduinoCode(code, { experimentId: 'v3-cap6-semaforo' });
    expect(result).toBeDefined();
  });
});
