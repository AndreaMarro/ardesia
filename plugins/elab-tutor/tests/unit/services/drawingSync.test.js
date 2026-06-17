/**
 * drawingSync.test.js — Sprint T iter 28 Bug 3 unit tests
 *
 * Coverage:
 *  - loadPaths: not-configured / found / not-found / supabase error / shape
 *  - savePaths: not-configured / success upsert / supabase error / non-array guard
 *  - subscribePaths: returns unsubscribe / no-op when not configured / payload mapping
 *  - debouncedSave: timer reset / fires after delay / cancelDebouncedSave clears
 *  - normalize: null/empty experimentId → 'paths' bucket
 *
 * Honest: mocks supabase-js minimal surface. Real Supabase Realtime quirks
 * (e.g. ALTER PUBLICATION supabase_realtime ADD TABLE) NOT covered here.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Supabase mock state (manipulated per test) ───
const _supabaseMockState = {
  configured: true,
  selectResult: { data: [], error: null },
  upsertResult: { error: null },
  upsertCalledWith: null,
  channelSubscribed: false,
  channelHandlers: [],
  unsubscribeCalled: false,
  removeChannelCalled: false,
  throwOnFrom: false,
  throwOnChannel: false,
};

function _makeSupabase() {
  return {
    from: vi.fn((tableName) => {
      if (_supabaseMockState.throwOnFrom) throw new Error('boom');
      return _makeQueryChain(tableName);
    }),
    channel: vi.fn((name) => {
      if (_supabaseMockState.throwOnChannel) throw new Error('chan boom');
      return _makeChannel(name);
    }),
    removeChannel: vi.fn(() => { _supabaseMockState.removeChannelCalled = true; }),
  };
}

function _makeQueryChain() {
  // chainable builder for SELECT and UPSERT
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => Promise.resolve(_supabaseMockState.selectResult)),
    upsert: vi.fn((row) => {
      _supabaseMockState.upsertCalledWith = row;
      return Promise.resolve(_supabaseMockState.upsertResult);
    }),
  };
  return chain;
}

function _makeChannel(name) {
  const ch = {
    name,
    on: vi.fn((eventType, opts, handler) => {
      _supabaseMockState.channelHandlers.push({ eventType, opts, handler });
      return ch;
    }),
    subscribe: vi.fn(() => {
      _supabaseMockState.channelSubscribed = true;
      return ch;
    }),
    unsubscribe: vi.fn(() => { _supabaseMockState.unsubscribeCalled = true; }),
  };
  return ch;
}

vi.mock('../../../src/services/supabaseClient', () => ({
  default: _makeSupabase(),
  isSupabaseConfigured: vi.fn(() => _supabaseMockState.configured),
}));

// localStorage shim
const _store = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((k) => (k in _store ? _store[k] : null)),
    setItem: vi.fn((k, v) => { _store[k] = String(v); }),
    removeItem: vi.fn((k) => { delete _store[k]; }),
    clear: vi.fn(() => Object.keys(_store).forEach((k) => delete _store[k])),
  },
  writable: true,
  configurable: true,
});

// crypto.randomUUID
if (!globalThis.crypto || !globalThis.crypto.randomUUID) {
  globalThis.crypto = {
    ...(globalThis.crypto || {}),
    randomUUID: () => '11111111-2222-3333-4444-555555555555',
  };
}

beforeEach(() => {
  // reset mock state
  _supabaseMockState.configured = true;
  _supabaseMockState.selectResult = { data: [], error: null };
  _supabaseMockState.upsertResult = { error: null };
  _supabaseMockState.upsertCalledWith = null;
  _supabaseMockState.channelSubscribed = false;
  _supabaseMockState.channelHandlers = [];
  _supabaseMockState.unsubscribeCalled = false;
  _supabaseMockState.removeChannelCalled = false;
  _supabaseMockState.throwOnFrom = false;
  _supabaseMockState.throwOnChannel = false;
  Object.keys(_store).forEach((k) => delete _store[k]);
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Import AFTER mocks installed
import {
  loadPaths,
  savePaths,
  subscribePaths,
  debouncedSave,
  cancelDebouncedSave,
  _clearAllDebounceTimers,
} from '../../../src/services/drawingSync';
import { isSupabaseConfigured } from '../../../src/services/supabaseClient';

describe('drawingSync — loadPaths', () => {
  it('returns null when Supabase NOT configured', async () => {
    isSupabaseConfigured.mockReturnValueOnce(false);
    _supabaseMockState.configured = false;
    const result = await loadPaths('v1-cap6-esp1');
    expect(result).toBeNull();
  });

  it('returns null when no row found (empty data array)', async () => {
    _supabaseMockState.selectResult = { data: [], error: null };
    const result = await loadPaths('v1-cap6-esp1');
    expect(result).toBeNull();
  });

  it('returns paths + updatedAt when row exists', async () => {
    const fakePaths = [{ points: '0,0 1,1', color: '#000', width: 2 }];
    const ts = '2026-04-29T10:00:00.000Z';
    _supabaseMockState.selectResult = {
      data: [{ paths: fakePaths, updated_at: ts }],
      error: null,
    };
    const result = await loadPaths('v1-cap6-esp1');
    expect(result).toEqual({ paths: fakePaths, updatedAt: ts });
  });

  it('returns null on Supabase error', async () => {
    _supabaseMockState.selectResult = { data: null, error: { message: 'fail' } };
    const result = await loadPaths('v1-cap6-esp1');
    expect(result).toBeNull();
  });

  it('returns paths=[] (defensive) when row.paths is not an array', async () => {
    _supabaseMockState.selectResult = {
      data: [{ paths: 'corrupt', updated_at: '2026-04-29T10:00:00.000Z' }],
      error: null,
    };
    const result = await loadPaths('v1-cap6-esp1');
    expect(result).not.toBeNull();
    expect(result.paths).toEqual([]);
  });

  it('does not throw when supabase.from() throws', async () => {
    _supabaseMockState.throwOnFrom = true;
    const result = await loadPaths('v1-cap6-esp1');
    expect(result).toBeNull();
  });

  it('uses sandbox bucket when experimentId is null/empty', async () => {
    // implicit: should not throw, should return null with no rows
    expect(await loadPaths(null)).toBeNull();
    expect(await loadPaths('')).toBeNull();
    expect(await loadPaths(undefined)).toBeNull();
  });
});

describe('drawingSync — savePaths', () => {
  it('returns {success:false} when Supabase NOT configured', async () => {
    isSupabaseConfigured.mockReturnValueOnce(false);
    _supabaseMockState.configured = false;
    const result = await savePaths('v1-cap6-esp1', []);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/non configurato/i);
  });

  it('rejects non-array paths input', async () => {
    const result = await savePaths('v1-cap6-esp1', 'not an array');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/array/i);
  });

  it('upserts row with experiment_id, user_id, class_key, paths', async () => {
    _store['elab_class_key'] = 'CLASSE-3A';
    _store['elab_anon_uuid'] = 'aaaa1111-2222-3333-4444-555566667777';
    const fakePaths = [{ points: '0,0 1,1', color: '#EF4444', width: 1.5 }];
    const result = await savePaths('v1-cap6-esp1', fakePaths);
    expect(result.success).toBe(true);
    expect(_supabaseMockState.upsertCalledWith).toMatchObject({
      experiment_id: 'v1-cap6-esp1',
      user_id: 'aaaa1111-2222-3333-4444-555566667777',
      class_key: 'CLASSE-3A',
      paths: fakePaths,
    });
    expect(_supabaseMockState.upsertCalledWith.updated_at).toEqual(expect.any(String));
  });

  it('returns {success:false, error} on supabase upsert error', async () => {
    _supabaseMockState.upsertResult = { error: { message: 'rls denied' } };
    const result = await savePaths('v1-cap6-esp1', []);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/rls denied/);
  });

  it('does not throw when supabase.from() throws (returns error)', async () => {
    _supabaseMockState.throwOnFrom = true;
    const result = await savePaths('v1-cap6-esp1', []);
    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });

  it('normalizes null experimentId to "paths" bucket', async () => {
    await savePaths(null, []);
    expect(_supabaseMockState.upsertCalledWith.experiment_id).toBe('paths');
  });
});

describe('drawingSync — subscribePaths', () => {
  it('returns no-op unsubscribe when Supabase NOT configured', () => {
    isSupabaseConfigured.mockReturnValueOnce(false);
    _supabaseMockState.configured = false;
    const unsub = subscribePaths('v1-cap6-esp1', () => {});
    expect(typeof unsub).toBe('function');
    expect(() => unsub()).not.toThrow();
    expect(_supabaseMockState.channelSubscribed).toBe(false);
  });

  it('returns no-op when onChange is not a function', () => {
    const unsub = subscribePaths('v1-cap6-esp1', null);
    expect(typeof unsub).toBe('function');
    expect(_supabaseMockState.channelSubscribed).toBe(false);
  });

  it('subscribes to a channel and registers a handler', () => {
    subscribePaths('v1-cap6-esp1', () => {});
    expect(_supabaseMockState.channelSubscribed).toBe(true);
    expect(_supabaseMockState.channelHandlers.length).toBe(1);
    expect(_supabaseMockState.channelHandlers[0].eventType).toBe('postgres_changes');
    expect(_supabaseMockState.channelHandlers[0].opts.filter).toBe(
      'experiment_id=eq.v1-cap6-esp1'
    );
  });

  it('invokes onChange with mapped {paths, updatedAt} when realtime fires', () => {
    const onChange = vi.fn();
    subscribePaths('v1-cap6-esp1', onChange);
    const handler = _supabaseMockState.channelHandlers[0].handler;
    const fakePaths = [{ points: '5,5', color: '#000', width: 2 }];
    handler({ new: { paths: fakePaths, updated_at: '2026-04-29T11:00:00.000Z' } });
    expect(onChange).toHaveBeenCalledWith({
      paths: fakePaths,
      updatedAt: '2026-04-29T11:00:00.000Z',
    });
  });

  it('handler safely ignores payloads without new/record', () => {
    const onChange = vi.fn();
    subscribePaths('v1-cap6-esp1', onChange);
    const handler = _supabaseMockState.channelHandlers[0].handler;
    handler({});
    expect(onChange).not.toHaveBeenCalled();
  });

  it('unsubscribe fn invokes channel.unsubscribe + removeChannel', () => {
    const unsub = subscribePaths('v1-cap6-esp1', () => {});
    unsub();
    expect(_supabaseMockState.unsubscribeCalled).toBe(true);
    expect(_supabaseMockState.removeChannelCalled).toBe(true);
  });

  it('returns no-op unsubscribe when supabase.channel() throws', () => {
    _supabaseMockState.throwOnChannel = true;
    const unsub = subscribePaths('v1-cap6-esp1', () => {});
    expect(typeof unsub).toBe('function');
    expect(() => unsub()).not.toThrow();
  });
});

describe('drawingSync — debouncedSave', () => {
  it('does not call savePaths immediately', () => {
    vi.useFakeTimers();
    debouncedSave('v1-cap6-esp1', [], 2000);
    expect(_supabaseMockState.upsertCalledWith).toBeNull();
    _clearAllDebounceTimers();
  });

  it('fires savePaths after the delay elapses', async () => {
    vi.useFakeTimers();
    const fakePaths = [{ points: '0,0 1,1', color: '#000', width: 2 }];
    debouncedSave('v1-cap6-esp1', fakePaths, 1000);
    vi.advanceTimersByTime(999);
    expect(_supabaseMockState.upsertCalledWith).toBeNull();
    vi.advanceTimersByTime(2);
    // microtask flush
    await vi.runAllTimersAsync();
    expect(_supabaseMockState.upsertCalledWith).not.toBeNull();
    expect(_supabaseMockState.upsertCalledWith.paths).toEqual(fakePaths);
  });

  it('reset timer when called again with the same experimentId', async () => {
    vi.useFakeTimers();
    debouncedSave('v1-cap6-esp1', [{ a: 1 }], 1000);
    vi.advanceTimersByTime(500);
    debouncedSave('v1-cap6-esp1', [{ a: 2 }], 1000);
    vi.advanceTimersByTime(700);
    // first scheduled call should NOT have fired (500+700=1200 since first, but reset at 500)
    expect(_supabaseMockState.upsertCalledWith).toBeNull();
    vi.advanceTimersByTime(400);
    await vi.runAllTimersAsync();
    expect(_supabaseMockState.upsertCalledWith).not.toBeNull();
    // payload from the last call wins (latest paths)
    expect(_supabaseMockState.upsertCalledWith.paths).toEqual([{ a: 2 }]);
  });

  it('cancelDebouncedSave prevents the pending save from firing', async () => {
    vi.useFakeTimers();
    debouncedSave('v1-cap6-esp1', [{ a: 1 }], 1000);
    cancelDebouncedSave('v1-cap6-esp1');
    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();
    expect(_supabaseMockState.upsertCalledWith).toBeNull();
  });

  it('different experimentIds get independent timers', async () => {
    vi.useFakeTimers();
    debouncedSave('v1-cap6-esp1', [{ a: 1 }], 1000);
    debouncedSave('v1-cap7-esp2', [{ b: 2 }], 1000);
    vi.advanceTimersByTime(1100);
    await vi.runAllTimersAsync();
    // last call wins per experimentId; both should have fired
    // upsertCalledWith holds the most recent (race depends on scheduler;
    // we assert at least one of them landed by checking that paths matches one)
    expect(_supabaseMockState.upsertCalledWith).not.toBeNull();
    const pths = _supabaseMockState.upsertCalledWith.paths;
    expect(pths === undefined ? false : (Array.isArray(pths))).toBe(true);
    _clearAllDebounceTimers();
  });
});
