import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  MAX_ENTRIES,
  logLatency,
  getRecentLatencies,
  clearLog,
  getStats
} from '../../src/services/unlimLatencyLog.js';

class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

beforeEach(() => {
  const mem = new MemoryStorage();
  vi.stubGlobal('localStorage', mem);
});

describe('unlimLatencyLog', () => {
  it('logs valid entry and retrieves it', () => {
    const ok = logLatency({ latency_ms: 1234, ok: true });
    expect(ok).toBe(true);
    const entries = getRecentLatencies();
    expect(entries.length).toBe(1);
    expect(entries[0].latency_ms).toBe(1234);
    expect(entries[0].ok).toBe(true);
    expect(entries[0].timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('rejects entry with missing latency_ms', () => {
    expect(logLatency({})).toBe(false);
    expect(logLatency({ latency_ms: 'abc' })).toBe(false);
    expect(logLatency({ latency_ms: -5 })).toBe(false);
    expect(getRecentLatencies().length).toBe(0);
  });

  it('ring-buffer caps at MAX_ENTRIES and drops oldest', () => {
    for (let i = 0; i < MAX_ENTRIES + 10; i++) {
      logLatency({ latency_ms: i, ok: true });
    }
    const entries = getRecentLatencies();
    expect(entries.length).toBe(MAX_ENTRIES);
    expect(entries[0].latency_ms).toBe(10);
    expect(entries[entries.length - 1].latency_ms).toBe(MAX_ENTRIES + 9);
  });

  it('clearLog wipes storage', () => {
    logLatency({ latency_ms: 100, ok: true });
    expect(getRecentLatencies().length).toBe(1);
    clearLog();
    expect(getRecentLatencies().length).toBe(0);
  });

  it('getRecentLatencies respects limit param', () => {
    for (let i = 0; i < 10; i++) logLatency({ latency_ms: i, ok: true });
    const last3 = getRecentLatencies({ limit: 3 });
    expect(last3.length).toBe(3);
    expect(last3[0].latency_ms).toBe(7);
    expect(last3[2].latency_ms).toBe(9);
  });

  it('truncates query_hash to 16 chars', () => {
    logLatency({ latency_ms: 10, ok: true, query_hash: 'a'.repeat(50) });
    const e = getRecentLatencies()[0];
    expect(e.query_hash.length).toBe(16);
  });

  it('handles corrupted storage gracefully', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, 'not-json{');
    expect(getRecentLatencies().length).toBe(0);
    expect(logLatency({ latency_ms: 50, ok: true })).toBe(true);
    expect(getRecentLatencies().length).toBe(1);
  });

  it('getStats returns zero on empty log', () => {
    const s = getStats();
    expect(s.count).toBe(0);
    expect(s.p50).toBe(0);
    expect(s.p95).toBe(0);
    expect(s.ok_rate).toBe(0);
    expect(s.cold_start_count).toBe(0);
  });

  it('getStats computes p50/p95/ok_rate/cold_start_count', () => {
    for (let i = 1; i <= 10; i++) {
      logLatency({ latency_ms: i * 100, ok: i % 2 === 0, cold_start: i === 1 });
    }
    const s = getStats();
    expect(s.count).toBe(10);
    expect(s.p50).toBeGreaterThanOrEqual(500);
    expect(s.p95).toBeGreaterThanOrEqual(900);
    expect(s.ok_rate).toBeCloseTo(0.5, 2);
    expect(s.cold_start_count).toBe(1);
  });

  it('does not crash when localStorage absent (SSR guard)', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(logLatency({ latency_ms: 10, ok: true })).toBe(false);
    expect(getRecentLatencies()).toEqual([]);
    expect(clearLog()).toBe(false);
    expect(getStats().count).toBe(0);
  });
});
