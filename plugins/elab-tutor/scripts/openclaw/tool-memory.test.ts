import { describe, it, expect } from 'vitest';
import { findReuseCandidate, persistTool, markUsed, trackOutcome, garbageCollect, findCrossPollinationParents } from './tool-memory.ts';

// Minimal Supabase-like mock matching the SupabaseLike interface in tool-memory.ts
function buildSupa() {
  const insertedRows: Array<Record<string, unknown>> = [];
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  return {
    insertedRows,
    rpcCalls,
    rpc: async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      if (fn === 'match_tools') return { data: [], error: null };
      if (fn === 'touch_tool') return { data: null, error: null };
      if (fn === 'record_tool_outcome') return { data: null, error: null };
      if (fn === 'gc_tool_memory') return { data: { softDeleted: 2, hardDeleted: 1, deduped: 0, errors: [] }, error: null };
      return { data: null, error: `unknown rpc: ${fn}` };
    },
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => {
        if (table === 'openclaw_tool_memory') insertedRows.push(row);
        return { data: row, error: null };
      },
      update: (_row: Record<string, unknown>) => ({
        eq: async (_col: string, _val: unknown) => ({ data: null, error: null }),
      }),
      delete: () => ({
        eq: async (_col: string, _val: unknown) => ({ data: null, error: null }),
        lt: async (_col: string, _val: unknown) => ({ data: null, error: null }),
      }),
    }),
  };
}

const fakeEmbedder = {
  embed: async (text: string) => new Array(1024).fill(0).map((_, i) => (text.charCodeAt(i % text.length) % 10) / 10),
};

describe('findReuseCandidate', () => {
  it('returns null on empty match_tools result', async () => {
    const supa = buildSupa();
    const candidate = await findReuseCandidate({
      userMsg: 'fai blinkare il LED',
      embedder: fakeEmbedder,
      supabase: supa,
      minQuality: 0.7,
      threshold: 0.85,
    });
    expect(candidate).toBeNull();
  });

  it('calls match_tools rpc with embedding + threshold', async () => {
    const supa = buildSupa();
    await findReuseCandidate({
      userMsg: 'test',
      embedder: fakeEmbedder,
      supabase: supa,
    });
    const call = supa.rpcCalls.find(c => c.fn === 'match_tools');
    expect(call).toBeDefined();
    expect(call!.args.match_threshold).toBe(0.85);
    expect(call!.args.filter_min_quality).toBe(0.7);
  });
});

describe('persistTool', () => {
  it('inserts row with content_hash + embedding', async () => {
    const supa = buildSupa();
    await persistTool({
      tool: {
        level: 'L1',
        name: 'blinkLed',
        description_it: 'Fai blinkare un LED',
        locale: 'it',
        composition_steps: [{ action: 'addComponent', args: { type: 'led' }, reason: 'test' }],
        pz_v3_ok: true,
        safety_warnings: [],
      },
      supabase: supa,
      embedder: fakeEmbedder,
    });
    expect(supa.insertedRows.length).toBe(1);
    expect(supa.insertedRows[0]).toHaveProperty('content_hash');
    expect(supa.insertedRows[0]).toHaveProperty('description_embedding');
  });

  it('generates deterministic content_hash for identical tools', async () => {
    const supa1 = buildSupa();
    const supa2 = buildSupa();
    const tool = {
      level: 'L1' as const,
      name: 'same',
      description_it: 'same',
      locale: 'it',
      composition_steps: [{ action: 'addComponent', args: { type: 'led' }, reason: 'r' }],
      pz_v3_ok: true,
      safety_warnings: [],
    };
    await persistTool({ tool, supabase: supa1, embedder: fakeEmbedder });
    await persistTool({ tool, supabase: supa2, embedder: fakeEmbedder });
    expect(supa1.insertedRows[0].content_hash).toBe(supa2.insertedRows[0].content_hash);
  });
});

describe('markUsed', () => {
  it('calls touch_tool rpc with id', async () => {
    const supa = buildSupa();
    await markUsed({ id: 'abc-123', supabase: supa });
    const call = supa.rpcCalls.find(c => c.fn === 'touch_tool');
    expect(call).toBeDefined();
    expect(call!.args.tool_id).toBe('abc-123');
  });
});

describe('trackOutcome', () => {
  it('records success outcome via record_tool_outcome rpc', async () => {
    const supa = buildSupa();
    await trackOutcome({
      id: 'abc',
      outcome: { success: true, latency_ms: 120, pz_v3_ok: true },
      supabase: supa,
    });
    const call = supa.rpcCalls.find(c => c.fn === 'record_tool_outcome');
    expect(call).toBeDefined();
    expect(call!.args.success).toBe(true);
    expect(call!.args.pz_v3_ok).toBe(true);
  });

  it('records failure outcome with error message', async () => {
    const supa = buildSupa();
    await trackOutcome({
      id: 'abc',
      outcome: { success: false, error: 'PZ v3 violation', latency_ms: 80, pz_v3_ok: false },
      supabase: supa,
    });
    const call = supa.rpcCalls.find(c => c.fn === 'record_tool_outcome');
    expect(call!.args.success).toBe(false);
    expect(call!.args.error_message).toBe('PZ v3 violation');
  });
});

describe('garbageCollect', () => {
  it('calls gc_tool_memory rpc and returns report', async () => {
    const supa = buildSupa();
    const report = await garbageCollect({ supabase: supa });
    const call = supa.rpcCalls.find(c => c.fn === 'gc_tool_memory');
    expect(call).toBeDefined();
    expect(report).toHaveProperty('softDeleted');
    expect(report).toHaveProperty('hardDeleted');
    expect(report).toHaveProperty('deduped');
  });

  it('passes custom thresholds to rpc', async () => {
    const supa = buildSupa();
    await garbageCollect({
      supabase: supa,
      lowQualityThreshold: 0.2,
      staleDays: 60,
      hardDeleteAfterDays: 180,
    });
    const call = supa.rpcCalls.find(c => c.fn === 'gc_tool_memory');
    expect(call!.args.low_quality_threshold).toBe(0.2);
    expect(call!.args.stale_days).toBe(60);
    expect(call!.args.hard_delete_days).toBe(180);
  });
});

describe('findCrossPollinationParents', () => {
  it('returns array (possibly empty) without throwing', async () => {
    const supa = buildSupa();
    const parents = await findCrossPollinationParents({
      userMsg: 'test prompt',
      embedder: fakeEmbedder,
      supabase: supa,
      threshold: 0.75,
      limit: 3,
    });
    expect(Array.isArray(parents)).toBe(true);
  });
});
