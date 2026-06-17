// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * compiler service — Wave 1b Impl-C-2 expansion tests.
 *
 * Spec source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 4
 *   item 1 — RAM usage report parse `"RAM: X% (used Y bytes of Z)"`
 *   item 2 — Size warning flag `> 28KB ATmega328p` OR `> 90% Nano R4 256KB`
 *   item 3 — Compile counter telemetry session (compilations, success rate, avg latency)
 *   item 4 — intelHexValidator on remote n8n response
 *
 * Wave 1b adds 4 new export surfaces wrapped around `compileArduinoCode`:
 *   - `parseRamReport(stdout)` → `{ used, total, percent } | null`
 *   - `evaluateSizeWarnings({ hexBytes, ramPercent, board })` → `string[]`
 *   - `getCompileTelemetry()` → `{ count, success, avgLatencyMs }`
 *   - `resetCompileTelemetry()` (test hook)
 *
 * `compileArduinoCode` result extended with `ram` + `warn` fields.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/api.js', () => ({
  compileCode: vi.fn(() => Promise.resolve({ success: true, hex: ':00000001FF', size: 128, output: '' })),
}));

vi.mock('../../../src/components/simulator/utils/compileCache.js', () => {
  let _m = { count: 0, success: 0, failure: 0, totalLatencyMs: 0 };
  return {
    getCachedHex: vi.fn(() => null),
    setCachedHex: vi.fn(),
    recordCompileMetric: vi.fn((payload) => {
      if (!payload || typeof payload !== 'object') return;
      _m.count += 1;
      if (payload.success) _m.success += 1; else _m.failure += 1;
      const lat = typeof payload.latencyMs === 'number' && Number.isFinite(payload.latencyMs)
        ? payload.latencyMs
        : 0;
      _m.totalLatencyMs += lat;
    }),
    getCompileMetrics: vi.fn(() => ({
      count: _m.count,
      success: _m.success,
      failure: _m.failure,
      avgLatencyMs: _m.count > 0 ? Math.round(_m.totalLatencyMs / _m.count) : 0,
    })),
    resetCompileMetrics: vi.fn(() => {
      _m = { count: 0, success: 0, failure: 0, totalLatencyMs: 0 };
    }),
  };
});

vi.mock('../../../src/data/experiments-vol1.js', () => ({ experiments: [] }));
vi.mock('../../../src/data/experiments-vol2.js', () => ({ experiments: [] }));
vi.mock('../../../src/data/experiments-vol3.js', () => ({ experiments: [] }));

import {
  compileArduinoCode,
  parseRamReport,
  evaluateSizeWarnings,
  getCompileTelemetry,
  resetCompileTelemetry,
} from '../../../src/services/compiler';

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn(() => Promise.resolve({ ok: false }));
  resetCompileTelemetry();
});

// ─────────────────────────────────────────────────────────────
// Task 1 — RAM usage report parse
// Spec: parse arduino-cli stdout for `"RAM: X% (used Y bytes of Z)"`
// ─────────────────────────────────────────────────────────────
describe('parseRamReport — arduino-cli RAM line', () => {
  it('parses canonical RAM line "RAM:   [==        ]  21% (used 432 bytes of 2048)"', () => {
    const stdout = 'Sketch uses 1234 bytes\nGlobal variables use 432 bytes (21%) of dynamic memory\nRAM:   [==        ]  21% (used 432 bytes of 2048)';
    const ram = parseRamReport(stdout);
    expect(ram).toEqual({ used: 432, total: 2048, percent: 21 });
  });

  it('parses compact RAM line "RAM: 85% (used 1740 bytes of 2048)"', () => {
    const stdout = 'RAM: 85% (used 1740 bytes of 2048)';
    expect(parseRamReport(stdout)).toEqual({ used: 1740, total: 2048, percent: 85 });
  });

  it('parses Nano R4 RAM line "RAM: 12% (used 3932 bytes of 32768)"', () => {
    const stdout = 'RAM: 12% (used 3932 bytes of 32768)';
    expect(parseRamReport(stdout)).toEqual({ used: 3932, total: 32768, percent: 12 });
  });

  it('returns null when RAM line absent', () => {
    const stdout = 'Sketch uses 1234 bytes\nNo RAM info\n';
    expect(parseRamReport(stdout)).toBeNull();
  });

  it('returns null on null/empty input', () => {
    expect(parseRamReport(null)).toBeNull();
    expect(parseRamReport('')).toBeNull();
    expect(parseRamReport(undefined)).toBeNull();
  });

  it('returns null on non-string input', () => {
    expect(parseRamReport(123)).toBeNull();
    expect(parseRamReport({})).toBeNull();
  });

  it('handles RAM line with leading/trailing whitespace', () => {
    const stdout = '   RAM:    42% (used  860 bytes of 2048)   ';
    expect(parseRamReport(stdout)).toEqual({ used: 860, total: 2048, percent: 42 });
  });
});

// ─────────────────────────────────────────────────────────────
// Task 2 — Size warning flag
// Spec: > 28KB ATmega328p OR > 90% Nano R4 256KB → set warn flag
// ─────────────────────────────────────────────────────────────
describe('evaluateSizeWarnings — size + RAM near-limit flags', () => {
  it('returns ["size-near-limit"] when hexBytes > 28KB on ATmega328p', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 29 * 1024, ramPercent: null, board: 'arduino:avr:uno' });
    expect(warn).toContain('size-near-limit');
  });

  it('returns empty array when hexBytes well under cap on ATmega328p', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 5 * 1024, ramPercent: null, board: 'arduino:avr:uno' });
    expect(warn).toEqual([]);
  });

  it('returns ["size-near-limit"] when hexBytes > 90% of 256KB on Nano R4', () => {
    // 240KB = 245760 > 90% × 256KB (235929)
    const warn = evaluateSizeWarnings({ hexBytes: 240 * 1024, ramPercent: null, board: 'arduino:renesas_uno:unor4wifi' });
    expect(warn).toContain('size-near-limit');
  });

  it('returns empty for Nano R4 with 50% usage', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 128 * 1024, ramPercent: null, board: 'arduino:renesas_uno:unor4wifi' });
    expect(warn).toEqual([]);
  });

  it('returns ["ram-near-limit"] when ramPercent >= 90', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 1000, ramPercent: 92, board: 'arduino:avr:uno' });
    expect(warn).toContain('ram-near-limit');
  });

  it('returns ["ram-near-limit"] at exactly 90 percent', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 1000, ramPercent: 90, board: 'arduino:avr:uno' });
    expect(warn).toContain('ram-near-limit');
  });

  it('returns BOTH flags when size + ram both over threshold', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 30 * 1024, ramPercent: 95, board: 'arduino:avr:uno' });
    expect(warn).toEqual(expect.arrayContaining(['size-near-limit', 'ram-near-limit']));
    expect(warn).toHaveLength(2);
  });

  it('returns empty array for safe values', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 1000, ramPercent: 20, board: 'arduino:avr:uno' });
    expect(warn).toEqual([]);
  });

  it('handles null ramPercent gracefully', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 1000, ramPercent: null, board: 'arduino:avr:uno' });
    expect(warn).toEqual([]);
  });

  it('defaults to ATmega328p threshold when board is unknown', () => {
    const warn = evaluateSizeWarnings({ hexBytes: 29 * 1024, ramPercent: null, board: 'unknown:board' });
    expect(warn).toContain('size-near-limit');
  });
});

// ─────────────────────────────────────────────────────────────
// Task 3 — Compile counter telemetry
// Spec: track compilation count, success rate, avg latency
// ─────────────────────────────────────────────────────────────
describe('getCompileTelemetry — session counters', () => {
  it('starts with zeros after reset', () => {
    const t = getCompileTelemetry();
    expect(t.count).toBe(0);
    expect(t.success).toBe(0);
    expect(t.avgLatencyMs).toBe(0);
  });

  it('increments count on successful remote compile', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({ success: true, hex: ':00000001FF', size: 64, output: 'RAM: 10% (used 200 bytes of 2048)' });

    await compileArduinoCode('void setup(){} void loop(){telemetryTest1();}');
    const t = getCompileTelemetry();
    expect(t.count).toBe(1);
    expect(t.success).toBe(1);
    expect(t.avgLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('tracks failure separately from success', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({ success: false, hex: null, errors: 'syntax error 400', source: 'remote' });

    await compileArduinoCode('void setup(){telemetryTestFail();} broken');
    const t = getCompileTelemetry();
    expect(t.count).toBe(1);
    expect(t.success).toBe(0);
  });

  it('accumulates multiple compiles', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({ success: true, hex: ':00000001FF', size: 32, output: '' });

    await compileArduinoCode('void setup(){telemetryAcc1();} void loop(){}');
    await compileArduinoCode('void setup(){telemetryAcc2();} void loop(){}');
    await compileArduinoCode('void setup(){telemetryAcc3();} void loop(){}');

    const t = getCompileTelemetry();
    expect(t.count).toBe(3);
    expect(t.success).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────
// Task 4 — intelHexValidator on remote n8n response
// Spec: validate HEX from remote before returning to caller
// ─────────────────────────────────────────────────────────────
describe('compileArduinoCode — remote HEX validation', () => {
  it('rejects remote response with malformed HEX (bad checksum)', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    // Bad checksum in :04 record (correct would be FC, wrong is FF)
    compileCode.mockResolvedValue({
      success: true,
      hex: ':0400000000000000FF\n:00000001FF\n',
      size: 4,
      output: '',
    });

    const result = await compileArduinoCode('void setup(){remoteHexInvalid1();} void loop(){}');
    expect(result.success).toBe(false);
    expect(result.errors).toMatch(/HEX|formato|checksum/i);
  });

  it('rejects remote response with non-HEX content (HTML)', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({
      success: true,
      hex: '<html><body>Server error</body></html>',
      size: 50,
      output: '',
    });

    const result = await compileArduinoCode('void setup(){remoteHexInvalid2();} void loop(){}');
    expect(result.success).toBe(false);
  });

  it('accepts remote response with valid HEX', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({
      success: true,
      hex: ':00000001FF\n',
      size: 0,
      output: '',
    });

    const result = await compileArduinoCode('void setup(){remoteHexValid1();} void loop(){}');
    expect(result.success).toBe(true);
    expect(result.source).toBe('remote');
  });
});

// ─────────────────────────────────────────────────────────────
// Result shape — RAM + warn fields exposed via compileArduinoCode
// ─────────────────────────────────────────────────────────────
describe('compileArduinoCode — result.ram + result.warn fields', () => {
  it('exposes ram object when stdout contains RAM line', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({
      success: true,
      hex: ':00000001FF\n',
      size: 32,
      output: 'Sketch uses 1234 bytes\nRAM: 21% (used 432 bytes of 2048)\n',
    });

    const result = await compileArduinoCode('void setup(){ramFieldTest1();} void loop(){}');
    expect(result.success).toBe(true);
    expect(result.ram).toEqual({ used: 432, total: 2048, percent: 21 });
  });

  it('sets ram=null when stdout missing RAM line', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({
      success: true,
      hex: ':00000001FF\n',
      size: 32,
      output: 'No RAM info here',
    });

    const result = await compileArduinoCode('void setup(){ramFieldTest2();} void loop(){}');
    expect(result.ram).toBeNull();
  });

  it('exposes warn array (may be empty) on success', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({
      success: true,
      hex: ':00000001FF\n',
      size: 1000,
      output: 'RAM: 10% (used 200 bytes of 2048)',
    });

    const result = await compileArduinoCode('void setup(){warnFieldTest1();} void loop(){}');
    expect(Array.isArray(result.warn)).toBe(true);
  });

  it('warn includes size-near-limit when hex is large', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    // 29KB > 28KB ATmega328p threshold
    compileCode.mockResolvedValue({
      success: true,
      hex: ':00000001FF\n',
      size: 29 * 1024,
      output: '',
    });

    const result = await compileArduinoCode('void setup(){warnFieldTest2();} void loop(){}');
    expect(result.warn).toContain('size-near-limit');
  });

  it('warn includes ram-near-limit when RAM percent >= 90', async () => {
    const { compileCode } = await import('../../../src/services/api.js');
    compileCode.mockResolvedValue({
      success: true,
      hex: ':00000001FF\n',
      size: 100,
      output: 'RAM: 95% (used 1944 bytes of 2048)',
    });

    const result = await compileArduinoCode('void setup(){warnFieldTest3();} void loop(){}');
    expect(result.warn).toContain('ram-near-limit');
  });
});
