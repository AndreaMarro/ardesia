/**
 * unlimMessageHistory — Sprint U iter 25 P0-A architectural unblocker tests.
 *
 * Validates `_shared/memory.ts` extended API for per-message timeline:
 *   - `loadRecentHistory(sessionId, limit)` PRIMARY path: `unlim_message_history` ORDER BY message_idx DESC LIMIT N,
 *     interleaved user/assistant entries returned chronological (oldest first).
 *   - `loadRecentHistory(...)` FALLBACK path: `unlim_session_memory` single-row when timeline empty.
 *   - `saveMessageHistory(...)` atomic RPC `insert_message_history` with auto-increment server-side.
 *   - GDPR slice enforcement: user 250 chars, response 100 chars.
 *   - Empty session returns [].
 *   - Defensive: DB error logged + swallowed, NEVER throws.
 *
 * Mock strategy: vi.mock on `https://esm.sh/@supabase/supabase-js@2` (per vitest config alias N/A,
 * direct URL mock works — verified probe pre-impl). `Deno.env.get` shimmed via globalThis.
 *
 * Reference: Doc-4 Phase 0 ROOT CAUSE — single-row `unlim_session_memory` `last_*` overwrite drift,
 * architettura non può rispondere "il secondo era quale?" / "riepilogo" senza timeline table.
 *
 * (c) Andrea Marro 2026-05-11 — ELAB Tutor Sprint U iter 25.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Supabase client mock state (mutated per-test via setMockResponse helpers) ---
const mockState = {
  fromQueries: [], // [{ table, eq, order, limit, maybeSingle, response }]
  rpcCalls: [],    // [{ name, params }]
  rpcResponse: { data: null, error: null },
  fromResponses: new Map(), // table → next response queue
};

function resetMockState() {
  mockState.fromQueries = [];
  mockState.rpcCalls = [];
  mockState.rpcResponse = { data: null, error: null };
  mockState.fromResponses.clear();
}

function setFromResponse(table, response) {
  if (!mockState.fromResponses.has(table)) mockState.fromResponses.set(table, []);
  mockState.fromResponses.get(table).push(response);
}

function setRpcResponse(response) {
  mockState.rpcResponse = response;
}

function makeQueryBuilder(table) {
  const query = {
    _table: table,
    _eq: {},
    _order: null,
    _limit: null,
  };
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((col, val) => {
      query._eq[col] = val;
      return builder;
    }),
    order: vi.fn((col, opts) => {
      query._order = { col, ...(opts || {}) };
      return builder;
    }),
    limit: vi.fn((n) => {
      query._limit = n;
      // Returns a thenable so `await client.from(...).select(...).eq(...).order(...).limit(...)` resolves.
      const queue = mockState.fromResponses.get(table) || [];
      const next = queue.shift() || { data: [], error: null };
      mockState.fromQueries.push({ ...query, response: next });
      return Promise.resolve(next);
    }),
    maybeSingle: vi.fn(() => {
      const queue = mockState.fromResponses.get(table) || [];
      const next = queue.shift() || { data: null, error: null };
      mockState.fromQueries.push({ ...query, response: next });
      return Promise.resolve(next);
    }),
  };
  return builder;
}

const mockClient = {
  from: vi.fn((table) => makeQueryBuilder(table)),
  rpc: vi.fn((name, params) => {
    mockState.rpcCalls.push({ name, params });
    return Promise.resolve(mockState.rpcResponse);
  }),
};

vi.mock('https://esm.sh/@supabase/supabase-js@2', () => ({
  createClient: vi.fn(() => mockClient),
}));

// Shim Deno global so memory.ts `getClient()` returns mockClient.
globalThis.Deno = {
  env: {
    get: vi.fn((key) => {
      if (key === 'SUPABASE_URL' || key === 'ELAB_DB_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'ELAB_DB_SERVICE_KEY') return 'test-key';
      return undefined;
    }),
  },
};

// Import after mocks (memory.ts module-level createClient runs lazily inside getClient()).
const memoryModule = await import(
  '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/memory.ts'
);
const { loadRecentHistory, saveMessageHistory } = memoryModule;

beforeEach(() => {
  resetMockState();
  vi.clearAllMocks();
});

// ============================================================================
// loadRecentHistory — PRIMARY path (unlim_message_history timeline)
// ============================================================================
describe('loadRecentHistory — PRIMARY path (unlim_message_history)', () => {
  it('queries unlim_message_history ORDER BY message_idx DESC LIMIT N', async () => {
    setFromResponse('unlim_message_history', {
      data: [
        { message_idx: 3, user_msg_preview: 'msg3 user', response_preview: 'msg3 ai', experiment_id: 'v1-cap6', chapter: 6, volume: 1, topic: 'led' },
        { message_idx: 2, user_msg_preview: 'msg2 user', response_preview: 'msg2 ai', experiment_id: 'v1-cap6', chapter: 6, volume: 1, topic: 'led' },
        { message_idx: 1, user_msg_preview: 'msg1 user', response_preview: 'msg1 ai', experiment_id: 'v1-cap6', chapter: 6, volume: 1, topic: 'led' },
      ],
      error: null,
    });

    const result = await loadRecentHistory('sess-abc', 5);

    expect(mockClient.from).toHaveBeenCalledWith('unlim_message_history');
    const q = mockState.fromQueries[0];
    expect(q._table).toBe('unlim_message_history');
    expect(q._eq.session_id).toBe('sess-abc');
    expect(q._order).toEqual({ col: 'message_idx', ascending: false });
    expect(q._limit).toBe(5);
    expect(result.length).toBe(6); // 3 turns × 2 entries (user + assistant)
  });

  it('interleaves user/assistant per turn and returns chronological order (oldest first)', async () => {
    setFromResponse('unlim_message_history', {
      data: [
        { message_idx: 2, user_msg_preview: 'second user', response_preview: 'second ai', experiment_id: null, chapter: null, volume: null, topic: null },
        { message_idx: 1, user_msg_preview: 'first user', response_preview: 'first ai', experiment_id: null, chapter: null, volume: null, topic: null },
      ],
      error: null,
    });

    const result = await loadRecentHistory('sess-1', 5);

    // Chronological order: first user → first ai → second user → second ai
    expect(result.map((r) => r.content)).toEqual([
      'first user',
      'first ai',
      'second user',
      'second ai',
    ]);
    expect(result.map((r) => r.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
  });

  it('attaches experiment_id / chapter / volume meta on each entry', async () => {
    setFromResponse('unlim_message_history', {
      data: [
        { message_idx: 1, user_msg_preview: 'u1', response_preview: 'a1', experiment_id: 'v2-cap4', chapter: 4, volume: 2, topic: 'resistore' },
      ],
      error: null,
    });

    const result = await loadRecentHistory('sess-meta', 5);
    expect(result[0]).toMatchObject({ role: 'user', content: 'u1', experiment_id: 'v2-cap4', chapter: 4, volume: 2 });
    expect(result[1]).toMatchObject({ role: 'assistant', content: 'a1', experiment_id: 'v2-cap4', chapter: 4, volume: 2 });
  });

  it('default limit = 5 when not supplied', async () => {
    setFromResponse('unlim_message_history', { data: [], error: null });
    // Empty primary triggers fallback — set fallback to also be empty so call resolves.
    setFromResponse('unlim_session_memory', { data: null, error: null });
    await loadRecentHistory('sess-default');
    expect(mockState.fromQueries[0]._limit).toBe(5);
  });

  it('skips entry when user_msg_preview is null (assistant-only row still emitted)', async () => {
    setFromResponse('unlim_message_history', {
      data: [
        { message_idx: 1, user_msg_preview: null, response_preview: 'ai only', experiment_id: null, chapter: null, volume: null, topic: null },
      ],
      error: null,
    });

    const result = await loadRecentHistory('sess-asym', 5);
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({ role: 'assistant', content: 'ai only' });
  });
});

// ============================================================================
// loadRecentHistory — FALLBACK path (unlim_session_memory backward compat)
// ============================================================================
describe('loadRecentHistory — FALLBACK to unlim_session_memory (iter 18.5 compat)', () => {
  it('falls back when unlim_message_history is empty', async () => {
    setFromResponse('unlim_message_history', { data: [], error: null });
    setFromResponse('unlim_session_memory', {
      data: {
        last_experiment_id: 'v1-cap6',
        last_response_preview: 'Ragazzi, il LED si accende perché...',
        last_topic: 'led',
        last_chapter: 6,
        last_volume: 1,
        updated_at: '2026-05-11T10:00:00Z',
      },
      error: null,
    });

    const result = await loadRecentHistory('sess-legacy', 5);

    expect(result.length).toBe(1);
    expect(result[0].role).toBe('assistant');
    expect(result[0].content).toContain('[v1-cap6]');
    expect(result[0].content).toContain('Ragazzi, il LED');
    expect(result[0].chapter).toBe(6);
    expect(result[0].volume).toBe(1);
    // Verify fallback table was queried.
    const tablesQueried = mockState.fromQueries.map((q) => q._table);
    expect(tablesQueried).toContain('unlim_session_memory');
  });

  it('returns [] when both primary AND fallback are empty', async () => {
    setFromResponse('unlim_message_history', { data: [], error: null });
    setFromResponse('unlim_session_memory', { data: null, error: null });
    const result = await loadRecentHistory('sess-empty', 5);
    expect(result).toEqual([]);
  });

  it('falls back when primary query errors', async () => {
    setFromResponse('unlim_message_history', { data: null, error: { message: 'timeout' } });
    setFromResponse('unlim_session_memory', {
      data: {
        last_experiment_id: null,
        last_response_preview: 'fallback content',
        last_topic: 'misc',
        last_chapter: null,
        last_volume: null,
        updated_at: '2026-05-11T10:00:00Z',
      },
      error: null,
    });

    const result = await loadRecentHistory('sess-err', 5);
    expect(result.length).toBe(1);
    expect(result[0].content).toBe('fallback content');
  });
});

// ============================================================================
// saveMessageHistory — atomic RPC insert_message_history
// ============================================================================
describe('saveMessageHistory — atomic RPC insert_message_history', () => {
  it('calls insert_message_history RPC with all canonical params', async () => {
    setRpcResponse({ data: 7, error: null });
    const newIdx = await saveMessageHistory(
      'sess-rpc',
      'v1-cap6-esp1',
      6,
      1,
      'led',
      'Come accendo il LED?',
      'Ragazzi, collegate il LED al pin 13.',
      'mistral-large',
    );

    expect(mockClient.rpc).toHaveBeenCalledTimes(1);
    const call = mockState.rpcCalls[0];
    expect(call.name).toBe('insert_message_history');
    expect(call.params).toMatchObject({
      p_session_id: 'sess-rpc',
      p_experiment_id: 'v1-cap6-esp1',
      p_chapter: 6,
      p_volume: 1,
      p_topic: 'led',
      p_user_msg_preview: 'Come accendo il LED?',
      p_response_preview: 'Ragazzi, collegate il LED al pin 13.',
      p_model: 'mistral-large',
    });
    expect(newIdx).toBe(7);
  });

  it('GDPR slices userMessage to 250 chars and responsePreview to 100 chars', async () => {
    setRpcResponse({ data: 1, error: null });
    const longUser = 'a'.repeat(500);
    const longResp = 'b'.repeat(500);
    await saveMessageHistory('sess-gdpr', 'v1-cap6', 6, 1, 'led', longUser, longResp, 'm');

    const call = mockState.rpcCalls[0];
    expect(call.params.p_user_msg_preview.length).toBe(250);
    expect(call.params.p_user_msg_preview).toBe('a'.repeat(250));
    expect(call.params.p_response_preview.length).toBe(100);
    expect(call.params.p_response_preview).toBe('b'.repeat(100));
  });

  it('returns null when RPC errors (defensive, never throws)', async () => {
    setRpcResponse({ data: null, error: { message: 'function not found' } });
    const result = await saveMessageHistory('sess-rpc-err', null, null, null, 'misc', 'u', 'r', 'm');
    expect(result).toBeNull();
  });

  it('handles non-string userMessage / responsePreview gracefully (null preview)', async () => {
    setRpcResponse({ data: 1, error: null });
    await saveMessageHistory('sess-null-msg', 'v1', 1, 1, 'misc', null, undefined, 'm');
    const call = mockState.rpcCalls[0];
    expect(call.params.p_user_msg_preview).toBeNull();
    expect(call.params.p_response_preview).toBeNull();
  });

  it('returns null when client is unavailable (env unset)', async () => {
    // Override Deno.env to simulate missing keys.
    const origGet = globalThis.Deno.env.get;
    globalThis.Deno.env.get = vi.fn(() => undefined);
    // Re-import to force getClient() re-evaluation with new env.
    vi.resetModules();
    const freshModule = await import(
      '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/memory.ts'
    );
    const result = await freshModule.saveMessageHistory('s', null, null, null, 't', 'u', 'r', 'm');
    expect(result).toBeNull();
    globalThis.Deno.env.get = origGet;
  });
});

// ============================================================================
// Integration: loadRecentHistory + saveMessageHistory consistency
// ============================================================================
describe('integration — save then load reflects timeline order', () => {
  it('saving then querying returns interleaved user+assistant chronological', async () => {
    setRpcResponse({ data: 1, error: null });
    await saveMessageHistory('sess-int', 'v1-cap6', 6, 1, 'led', 'q1', 'a1', 'm');
    await saveMessageHistory('sess-int', 'v1-cap6', 6, 1, 'led', 'q2', 'a2', 'm');

    expect(mockState.rpcCalls.length).toBe(2);
    expect(mockState.rpcCalls[0].params.p_user_msg_preview).toBe('q1');
    expect(mockState.rpcCalls[1].params.p_user_msg_preview).toBe('q2');

    // Simulate timeline state after both saves (DB DESC order).
    setFromResponse('unlim_message_history', {
      data: [
        { message_idx: 2, user_msg_preview: 'q2', response_preview: 'a2', experiment_id: 'v1-cap6', chapter: 6, volume: 1, topic: 'led' },
        { message_idx: 1, user_msg_preview: 'q1', response_preview: 'a1', experiment_id: 'v1-cap6', chapter: 6, volume: 1, topic: 'led' },
      ],
      error: null,
    });

    const history = await loadRecentHistory('sess-int', 5);
    expect(history.map((h) => h.content)).toEqual(['q1', 'a1', 'q2', 'a2']);
  });
});
