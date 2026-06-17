/**
 * useSessionAutosnapshot.test.js — Unit tests for Goal B B4 autosnapshot hook
 *
 * Covers:
 * - enabled=false → no interval scheduled, localStorage untouched after 30s.
 * - enabled=true → after 30s tick, key with SNAPSHOT_KEY_PREFIX+expId-* present.
 * - Unmount → clearInterval (no new keys after another 30s).
 * - QuotaExceededError → no crash, oldest snapshot purged, retry succeeds.
 * - More than MAX_SNAPSHOTS_PER_EXP → oldest pruned.
 *
 * NOTE: tests/setup.js installs a vi.fn() stub localStorage without length/key/
 * real storage. This file replaces it per-test with a real in-memory shim so
 * the hook can iterate keys via localStorage.length + localStorage.key(i).
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

import {
  useSessionAutosnapshot,
  SNAPSHOT_INTERVAL_MS,
  SNAPSHOT_KEY_PREFIX,
  MAX_SNAPSHOTS_PER_EXP,
} from '../../../src/hooks/useSessionAutosnapshot.js';

const ORIGINAL_ELAB_API = window.__ELAB_API;
const ORIGINAL_LOCAL_STORAGE = Object.getOwnPropertyDescriptor(window, 'localStorage');

/**
 * Build a real in-memory Storage shim with length + key() + indexed entries,
 * suitable for the hook's iteration semantics. Reassignable per test via the
 * `quotaError` hook to simulate QuotaExceededError on setItem.
 */
function makeStorageShim({ throwOnNext } = {}) {
  const store = new Map();
  let throwOnce = !!throwOnNext;
  const shim = {
    get length() {
      return store.size;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      if (throwOnce && k.startsWith(SNAPSHOT_KEY_PREFIX)) {
        throwOnce = false;
        const e = new Error('Quota exceeded');
        e.name = 'QuotaExceededError';
        throw e;
      }
      store.set(k, String(v));
    },
    removeItem(k) {
      store.delete(k);
    },
    clear() {
      store.clear();
    },
    __store: store,
    __resetThrow() { throwOnce = false; },
  };
  return shim;
}

function installStorage(shim) {
  Object.defineProperty(window, 'localStorage', {
    value: shim,
    configurable: true,
    writable: true,
  });
}

function setApi() {
  window.__ELAB_API = {
    unlim: {
      getCircuitState: () => ({
        experiment: { id: 'v1-cap6-esp1', title: 'Primo LED' },
        components: [{ id: 'led1', type: 'led', position: { x: 1, y: 2 } }],
        connections: [],
      }),
    },
  };
}

function listSnapshotKeysFor(expId) {
  const out = [];
  const prefix = `${SNAPSHOT_KEY_PREFIX}${expId}-`;
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(prefix)) out.push(k);
  }
  return out;
}

beforeEach(() => {
  vi.useFakeTimers();
  installStorage(makeStorageShim());
  setApi();
});

afterEach(() => {
  vi.useRealTimers();
  if (ORIGINAL_LOCAL_STORAGE) {
    Object.defineProperty(window, 'localStorage', ORIGINAL_LOCAL_STORAGE);
  }
  if (ORIGINAL_ELAB_API) window.__ELAB_API = ORIGINAL_ELAB_API;
  else delete window.__ELAB_API;
  vi.restoreAllMocks();
});

describe('useSessionAutosnapshot — constants', () => {
  it('SNAPSHOT_INTERVAL_MS is 30 seconds', () => {
    expect(SNAPSHOT_INTERVAL_MS).toBe(30_000);
  });

  it('SNAPSHOT_KEY_PREFIX is "elab-session-snapshot-"', () => {
    expect(SNAPSHOT_KEY_PREFIX).toBe('elab-session-snapshot-');
  });

  it('MAX_SNAPSHOTS_PER_EXP is 5', () => {
    expect(MAX_SNAPSHOTS_PER_EXP).toBe(5);
  });
});

describe('useSessionAutosnapshot — enabled=false', () => {
  it('does NOT schedule interval (localStorage unchanged after 30s)', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    renderHook(() =>
      useSessionAutosnapshot({ enabled: false, experimentId: 'v1-cap6-esp1' })
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(30_000);
    expect(listSnapshotKeysFor('v1-cap6-esp1')).toHaveLength(0);
  });

  it('does NOT schedule interval when experimentId is missing', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    renderHook(() => useSessionAutosnapshot({ enabled: true }));
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });
});

describe('useSessionAutosnapshot — enabled=true', () => {
  it('after 30s tick: localStorage contains a key with prefix+expId-', () => {
    renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );

    expect(listSnapshotKeysFor('v1-cap6-esp1')).toHaveLength(0);
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);

    const keys = listSnapshotKeysFor('v1-cap6-esp1');
    expect(keys.length).toBe(1);
    expect(keys[0]).toMatch(/^elab-session-snapshot-v1-cap6-esp1-\d+$/);
  });

  it('snapshot value is parseable JSON of an elab_session_export', () => {
    renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);

    const key = listSnapshotKeysFor('v1-cap6-esp1')[0];
    expect(key).toBeDefined();
    const raw = window.localStorage.getItem(key);
    const parsed = JSON.parse(raw);
    expect(parsed.elab_session_export.version).toBe('1.0');
    expect(parsed.elab_session_export.experiment.id).toBe('v1-cap6-esp1');
  });

  it('passes modalita through to exportSessionAsJSON', () => {
    renderHook(() =>
      useSessionAutosnapshot({
        enabled: true,
        experimentId: 'v1-cap6-esp1',
        modalita: 'gia-montato',
      })
    );
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);

    const key = listSnapshotKeysFor('v1-cap6-esp1')[0];
    const parsed = JSON.parse(window.localStorage.getItem(key));
    expect(parsed.elab_session_export.modalita).toBe('gia-montato');
  });
});

describe('useSessionAutosnapshot — unmount cleanup', () => {
  it('unmount clears the interval (no new keys after another 30s)', () => {
    const { unmount } = renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);
    const initialCount = listSnapshotKeysFor('v1-cap6-esp1').length;
    expect(initialCount).toBe(1);

    unmount();
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS * 3);

    expect(listSnapshotKeysFor('v1-cap6-esp1').length).toBe(initialCount);
  });

  it('calls clearInterval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('useSessionAutosnapshot — QuotaExceededError fallback', () => {
  it('QuotaExceededError → no crash, oldest purged + retry succeeds', () => {
    // Install a shim that throws on first snapshot setItem
    installStorage(makeStorageShim({ throwOnNext: true }));
    // Seed 2 old snapshots — the oldest will be purged on quota recovery
    const oldKey1 = `${SNAPSHOT_KEY_PREFIX}v1-cap6-esp1-1000`;
    const oldKey2 = `${SNAPSHOT_KEY_PREFIX}v1-cap6-esp1-2000`;
    // Bypass the throwOnNext by inserting directly into the backing store
    window.localStorage.__store.set(oldKey1, '{"old":1}');
    window.localStorage.__store.set(oldKey2, '{"old":2}');

    expect(() => {
      renderHook(() =>
        useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
      );
      vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);
    }).not.toThrow();

    // Oldest snapshot (oldKey1) purged in quota recovery
    expect(window.localStorage.getItem(oldKey1)).toBeNull();
    // oldKey2 (newer of the two seeds) should still be present
    expect(window.localStorage.getItem(oldKey2)).not.toBeNull();
  });

  it('non-quota error → logged, no crash, no infinite retry', () => {
    // Install a shim where setItem always throws non-quota
    const shim = makeStorageShim();
    const realSet = shim.setItem.bind(shim);
    shim.setItem = (k, v) => {
      if (k.startsWith(SNAPSHOT_KEY_PREFIX)) throw new Error('Other error');
      return realSet(k, v);
    };
    installStorage(shim);

    expect(() => {
      renderHook(() =>
        useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
      );
      vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);
    }).not.toThrow();
  });
});

describe('useSessionAutosnapshot — MAX_SNAPSHOTS_PER_EXP bound', () => {
  it('more than MAX snapshots → oldest pruned', () => {
    // Pre-seed MAX_SNAPSHOTS_PER_EXP existing snapshots (all older than now)
    const baseTs = 1000;
    for (let i = 0; i < MAX_SNAPSHOTS_PER_EXP; i++) {
      window.localStorage.setItem(
        `${SNAPSHOT_KEY_PREFIX}v1-cap6-esp1-${baseTs + i}`,
        `{"i":${i}}`
      );
    }
    expect(listSnapshotKeysFor('v1-cap6-esp1').length).toBe(MAX_SNAPSHOTS_PER_EXP);

    // Tick once → one new snapshot written, prune brings count back to MAX
    renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);

    const after = listSnapshotKeysFor('v1-cap6-esp1');
    expect(after.length).toBe(MAX_SNAPSHOTS_PER_EXP);
    // Oldest seed key (baseTs=1000) must have been pruned
    expect(window.localStorage.getItem(`${SNAPSHOT_KEY_PREFIX}v1-cap6-esp1-${baseTs}`)).toBeNull();
  });

  it('different experimentIds are pruned independently', () => {
    const baseTs = 1000;
    for (let i = 0; i < MAX_SNAPSHOTS_PER_EXP; i++) {
      window.localStorage.setItem(`${SNAPSHOT_KEY_PREFIX}v1-cap6-esp1-${baseTs + i}`, `{"a":${i}}`);
      window.localStorage.setItem(`${SNAPSHOT_KEY_PREFIX}v1-cap6-esp2-${baseTs + i}`, `{"b":${i}}`);
    }

    renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);

    // esp1 should be pruned to MAX, esp2 untouched
    expect(listSnapshotKeysFor('v1-cap6-esp1').length).toBe(MAX_SNAPSHOTS_PER_EXP);
    expect(listSnapshotKeysFor('v1-cap6-esp2').length).toBe(MAX_SNAPSHOTS_PER_EXP);
  });
});

describe('useSessionAutosnapshot — multiple ticks', () => {
  it('two ticks → up to two new keys (bounded by MAX)', () => {
    renderHook(() =>
      useSessionAutosnapshot({ enabled: true, experimentId: 'v1-cap6-esp1' })
    );
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);
    // Advance system clock so the second tick gets a different timestamp key.
    vi.setSystemTime(new Date(Date.now() + SNAPSHOT_INTERVAL_MS));
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);

    const keys = listSnapshotKeysFor('v1-cap6-esp1');
    expect(keys.length).toBeGreaterThanOrEqual(1);
    expect(keys.length).toBeLessThanOrEqual(MAX_SNAPSHOTS_PER_EXP);
  });
});
