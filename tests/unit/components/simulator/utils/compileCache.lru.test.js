// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * compileCache LRU eviction tests — Wave 1 Impl-C first slice.
 *
 * Spec source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md
 *   Sezione 12 item 5 — "HEX compile cache LRU 20 entries"
 *
 * Requirements:
 *   - Cap 20 entries (insert 25 unique keys → only last 20 retained)
 *   - `get(key)` on existing entry refreshes MRU position (avoids next eviction)
 *   - `set(existingKey, newValue)` updates and refreshes recency
 *   - `clearCache()` empties cache
 *   - `getCacheSize()` returns current count
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));

// Isolated localStorage mock per test (avoid cross-test state leak)
const store = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => store[k] || null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
  },
  writable: true,
});

import {
  getCachedHex,
  setCachedHex,
  clearCache,
  getCacheSize,
} from '../../../../../src/components/simulator/utils/compileCache';

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('compileCache LRU — cap 20 entries', () => {
  it('retains only last 20 entries when 25 unique keys inserted', () => {
    // Insert 25 unique keys in order: k0, k1, ..., k24
    for (let i = 0; i < 25; i++) {
      setCachedHex(`k${i}`, `:HEX${i}`, 10 + i);
    }

    expect(getCacheSize()).toBe(20);

    // First 5 keys (k0..k4) must have been evicted (oldest)
    for (let i = 0; i < 5; i++) {
      expect(getCachedHex(`k${i}`), `k${i} should be evicted`).toBeNull();
    }

    // Last 20 keys (k5..k24) must be present
    for (let i = 5; i < 25; i++) {
      const result = getCachedHex(`k${i}`);
      expect(result, `k${i} should be present`).not.toBeNull();
      expect(result.hex).toBe(`:HEX${i}`);
    }
  });
});

describe('compileCache LRU — get refreshes MRU position', () => {
  it('get(key) on existing entry prevents it from being evicted next', () => {
    // Fill cache to cap with k0..k19
    for (let i = 0; i < 20; i++) {
      setCachedHex(`k${i}`, `:HEX${i}`, 10 + i);
    }
    expect(getCacheSize()).toBe(20);

    // Access k0 — should move it to MRU position
    const k0Before = getCachedHex('k0');
    expect(k0Before).not.toBeNull();
    expect(k0Before.hex).toBe(':HEX0');

    // Insert one more entry — should evict the OLDEST non-k0 entry (k1, not k0)
    setCachedHex('k20', ':HEX20', 30);

    expect(getCacheSize()).toBe(20);
    // k0 must still be there (was refreshed)
    expect(getCachedHex('k0'), 'k0 should survive eviction (was MRU)').not.toBeNull();
    // k1 must be evicted (now oldest)
    expect(getCachedHex('k1'), 'k1 should be evicted').toBeNull();
  });
});

describe('compileCache LRU — set updates and refreshes recency', () => {
  it('set(existingKey, newValue) updates value and refreshes recency', () => {
    // Fill cache to cap with k0..k19
    for (let i = 0; i < 20; i++) {
      setCachedHex(`k${i}`, `:HEX${i}`, 10 + i);
    }

    // Update k0 with new value — should also refresh recency
    setCachedHex('k0', ':NEW_HEX0', 999);

    // Cache size unchanged
    expect(getCacheSize()).toBe(20);

    // k0 has new value
    const k0 = getCachedHex('k0');
    expect(k0.hex).toBe(':NEW_HEX0');
    expect(k0.size).toBe(999);

    // Insert one more — k1 should evict (k0 was refreshed)
    setCachedHex('k20', ':HEX20', 30);

    expect(getCachedHex('k0'), 'k0 should survive (set refreshed recency)').not.toBeNull();
    expect(getCachedHex('k1'), 'k1 should be evicted').toBeNull();
  });
});

describe('compileCache LRU — clearCache', () => {
  it('clearCache() empties the cache', () => {
    setCachedHex('a', ':A', 10);
    setCachedHex('b', ':B', 20);
    setCachedHex('c', ':C', 30);
    expect(getCacheSize()).toBe(3);

    clearCache();
    expect(getCacheSize()).toBe(0);
    expect(getCachedHex('a')).toBeNull();
    expect(getCachedHex('b')).toBeNull();
    expect(getCachedHex('c')).toBeNull();
  });
});

describe('compileCache LRU — getCacheSize', () => {
  it('getCacheSize() returns 0 when cache empty', () => {
    expect(getCacheSize()).toBe(0);
  });

  it('getCacheSize() returns current entry count', () => {
    setCachedHex('a', ':A', 10);
    expect(getCacheSize()).toBe(1);
    setCachedHex('b', ':B', 20);
    expect(getCacheSize()).toBe(2);
    setCachedHex('c', ':C', 30);
    expect(getCacheSize()).toBe(3);
  });
});
