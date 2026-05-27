/**
 * unlim-intent-flags-hybrid.test.js — Sprint X iter 105 P1
 *
 * Tests for `classifyIntentFlagsHybrid` 3-tier orchestrator (regex L1 +
 * embedding L2 + LLM L3) in `intent-flags-classifier.ts`.
 *
 * Strategy: mock the L2 + L3 modules dynamically (vi.mock with factory) so we
 * verify the orchestrator's branching logic without exercising Mistral.
 *
 * Coverage:
 *  - L1 alone when regex returns triggered flags (no escalation)
 *  - L1 → L2 escalation on ambiguous query (L1 returns zero flags)
 *  - L1 → L2 → L3 escalation when L2 also returns zero
 *  - forceLLM bypasses gating (always calls L3)
 *  - skipEmbedding skips L2
 *  - skipLLM skips L3
 *  - L2/L3 throws / returns null → graceful merge with L1
 *  - mergeIntentFlags OR semantics
 *  - tiersUsed telemetry list
 *  - latencyMs reported
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

globalThis.Deno = globalThis.Deno || {
  env: { get: () => undefined, has: () => false, toObject: () => ({}) },
};

// Mock L2 + L3 modules with stub implementations
const mockEmbeddingCall = vi.fn();
const mockLLMCall = vi.fn();

vi.mock('../../supabase/functions/_shared/intent-flags-embedding.ts', () => ({
  classifyIntentFlagsEmbedding: (...args) => mockEmbeddingCall(...args),
}));

vi.mock('../../supabase/functions/_shared/intent-flags-llm.ts', () => ({
  classifyIntentFlagsLLM: (...args) => mockLLMCall(...args),
}));

const {
  classifyIntentFlagsHybrid,
  mergeIntentFlags,
  classifyIntentFlags,
} = await import('../../supabase/functions/_shared/intent-flags-classifier.ts');

// Helpers
function emptyFlags() {
  return {
    wants_screen_view: false,
    wants_action: false,
    wants_diagnose: false,
    wants_next: false,
    wants_review: false,
    off_topic: false,
    safety_minor: false,
    secret_project: false,
    triggered_flags: [],
  };
}

function withFlag(flag) {
  const f = emptyFlags();
  f[flag] = true;
  f.triggered_flags = [flag.toUpperCase()];
  return f;
}

beforeEach(() => {
  mockEmbeddingCall.mockReset();
  mockLLMCall.mockReset();
});

// ===========================================================================
// Section 1 — mergeIntentFlags
// ===========================================================================

describe('mergeIntentFlags', () => {
  it('1.1 — merges two flag sets via OR', () => {
    const a = { ...emptyFlags(), wants_screen_view: true };
    const b = { ...emptyFlags(), wants_action: true };
    const m = mergeIntentFlags(a, b);
    expect(m.wants_screen_view).toBe(true);
    expect(m.wants_action).toBe(true);
    expect(m.triggered_flags).toContain('WANTS_SCREEN_VIEW');
    expect(m.triggered_flags).toContain('WANTS_ACTION');
  });

  it('1.2 — both empty returns empty', () => {
    const m = mergeIntentFlags(emptyFlags(), emptyFlags());
    expect(m.triggered_flags).toEqual([]);
  });

  it('1.3 — overlapping flags do not duplicate triggered_flags', () => {
    const both = { ...emptyFlags(), wants_diagnose: true };
    const m = mergeIntentFlags(both, both);
    expect(m.triggered_flags).toEqual(['WANTS_DIAGNOSE']);
  });

  it('1.4 — merging all 8 flags produces all in triggered_flags', () => {
    const all = {
      wants_screen_view: true,
      wants_action: true,
      wants_diagnose: true,
      wants_next: true,
      wants_review: true,
      off_topic: true,
      safety_minor: true,
      secret_project: true,
      triggered_flags: [],
    };
    const m = mergeIntentFlags(all, emptyFlags());
    expect(m.triggered_flags).toHaveLength(8);
  });
});

// ===========================================================================
// Section 2 — L1 alone (regex match → no escalation)
// ===========================================================================

describe('classifyIntentFlagsHybrid — L1 regex alone (happy path)', () => {
  it('2.1 — regex match → no L2 or L3 calls', async () => {
    const res = await classifyIntentFlagsHybrid('guarda il LED');
    expect(res.flags.wants_screen_view).toBe(true);
    expect(res.tiersUsed).toEqual(['regex_l1']);
    expect(mockEmbeddingCall).not.toHaveBeenCalled();
    expect(mockLLMCall).not.toHaveBeenCalled();
  });

  it('2.2 — multiple regex matches → no escalation', async () => {
    const res = await classifyIntentFlagsHybrid('guarda e compila');
    expect(res.flags.wants_screen_view).toBe(true);
    expect(res.flags.wants_action).toBe(true);
    expect(res.tiersUsed).toEqual(['regex_l1']);
  });

  it('2.3 — latencyMs reported and is small (regex only)', async () => {
    const res = await classifyIntentFlagsHybrid('guarda');
    expect(typeof res.latencyMs).toBe('number');
    expect(res.latencyMs).toBeGreaterThanOrEqual(0);
    expect(res.latencyMs).toBeLessThan(100);
  });
});

// ===========================================================================
// Section 3 — L1 ambiguous → L2 escalation
// ===========================================================================

describe('classifyIntentFlagsHybrid — L1 ambiguous → L2 escalation', () => {
  it('3.1 — L1 returns zero flags, L2 returns flags → L2 in tiersUsed', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(withFlag('wants_diagnose'));
    // Use a query the regex won't match
    const res = await classifyIntentFlagsHybrid('fammi vedere se ha senso');
    // Regex L1 returns 0 flags for this input → L2 fires
    expect(res.flags.wants_diagnose).toBe(true);
    expect(res.tiersUsed).toContain('regex_l1');
    expect(res.tiersUsed).toContain('embedding_l2');
    expect(mockEmbeddingCall).toHaveBeenCalledTimes(1);
  });

  it('3.2 — L2 returns null → L3 also runs', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(null);
    mockLLMCall.mockResolvedValueOnce(withFlag('wants_review'));
    const res = await classifyIntentFlagsHybrid('boh non lo so');
    expect(res.flags.wants_review).toBe(true);
    expect(res.tiersUsed).toContain('llm_l3');
    expect(mockLLMCall).toHaveBeenCalledTimes(1);
  });

  it('3.3 — L2 returns flags → L3 does NOT run (gating prevents extra call)', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(withFlag('wants_action'));
    const res = await classifyIntentFlagsHybrid('strana frase ambigua');
    expect(res.flags.wants_action).toBe(true);
    expect(res.tiersUsed).not.toContain('llm_l3');
    expect(mockLLMCall).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Section 4 — Full L1 → L2 → L3 cascade
// ===========================================================================

describe('classifyIntentFlagsHybrid — full cascade', () => {
  it('4.1 — L1 zero, L2 zero, L3 fires → all 3 tiers in tiersUsed', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(emptyFlags()); // L2 zero
    mockLLMCall.mockResolvedValueOnce(withFlag('wants_diagnose')); // L3 fires
    const res = await classifyIntentFlagsHybrid('completamente ambiguo');
    expect(res.tiersUsed).toEqual(['regex_l1', 'embedding_l2', 'llm_l3']);
    expect(res.flags.wants_diagnose).toBe(true);
  });

  it('4.2 — all 3 tiers return zero → result is all-false (no crash)', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(emptyFlags());
    mockLLMCall.mockResolvedValueOnce(emptyFlags());
    const res = await classifyIntentFlagsHybrid('xyz');
    expect(res.flags.triggered_flags).toEqual([]);
  });
});

// ===========================================================================
// Section 5 — opts: forceLLM, skipEmbedding, skipLLM
// ===========================================================================

describe('classifyIntentFlagsHybrid — opts overrides', () => {
  it('5.1 — forceLLM=true: L3 runs even when L1 had matches', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(emptyFlags());
    mockLLMCall.mockResolvedValueOnce(withFlag('secret_project'));
    const res = await classifyIntentFlagsHybrid('guarda', { forceLLM: true });
    expect(res.flags.wants_screen_view).toBe(true); // L1
    expect(res.flags.secret_project).toBe(true); // L3
    expect(res.tiersUsed).toContain('embedding_l2');
    expect(res.tiersUsed).toContain('llm_l3');
  });

  it('5.2 — skipEmbedding=true: L2 not called', async () => {
    mockLLMCall.mockResolvedValueOnce(withFlag('wants_action'));
    const res = await classifyIntentFlagsHybrid('strana frase', { skipEmbedding: true });
    expect(mockEmbeddingCall).not.toHaveBeenCalled();
    expect(res.tiersUsed).not.toContain('embedding_l2');
    expect(res.tiersUsed).toContain('llm_l3');
  });

  it('5.3 — skipLLM=true: L3 not called even when L1+L2 zero', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(emptyFlags());
    const res = await classifyIntentFlagsHybrid('xyz', { skipLLM: true });
    expect(mockLLMCall).not.toHaveBeenCalled();
    expect(res.tiersUsed).not.toContain('llm_l3');
  });

  it('5.4 — skipEmbedding + skipLLM: only L1 runs', async () => {
    const res = await classifyIntentFlagsHybrid('xyz', {
      skipEmbedding: true,
      skipLLM: true,
    });
    expect(res.tiersUsed).toEqual(['regex_l1']);
    expect(mockEmbeddingCall).not.toHaveBeenCalled();
    expect(mockLLMCall).not.toHaveBeenCalled();
  });

  it('5.5 — embeddingThreshold passed through to L2', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(emptyFlags());
    await classifyIntentFlagsHybrid('xyz', { embeddingThreshold: 0.85 });
    const callArgs = mockEmbeddingCall.mock.calls[0][1];
    expect(callArgs.threshold).toBe(0.85);
  });
});

// ===========================================================================
// Section 6 — Defensive: L2/L3 throw → still returns best available
// ===========================================================================

describe('classifyIntentFlagsHybrid — L2/L3 throws → graceful', () => {
  it('6.1 — L2 throws → L3 still runs', async () => {
    mockEmbeddingCall.mockRejectedValueOnce(new Error('embed boom'));
    mockLLMCall.mockResolvedValueOnce(withFlag('wants_review'));
    const res = await classifyIntentFlagsHybrid('xyz');
    expect(res.flags.wants_review).toBe(true);
  });

  it('6.2 — L3 throws → returns L1+L2 result (still no crash)', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(emptyFlags());
    mockLLMCall.mockRejectedValueOnce(new Error('llm boom'));
    const res = await classifyIntentFlagsHybrid('xyz');
    expect(res.flags.triggered_flags).toEqual([]);
    // Did not crash
    expect(res.tiersUsed).toContain('regex_l1');
  });

  it('6.3 — both L2 and L3 throw → returns L1 only', async () => {
    mockEmbeddingCall.mockRejectedValueOnce(new Error('embed boom'));
    mockLLMCall.mockRejectedValueOnce(new Error('llm boom'));
    const res = await classifyIntentFlagsHybrid('xyz');
    expect(res.tiersUsed).toEqual(['regex_l1']);
    expect(res.flags.triggered_flags).toEqual([]);
  });

  it('6.4 — L2 returns null → counts as failure, L3 still escalates', async () => {
    mockEmbeddingCall.mockResolvedValueOnce(null);
    mockLLMCall.mockResolvedValueOnce(withFlag('wants_next'));
    const res = await classifyIntentFlagsHybrid('xyz');
    expect(res.flags.wants_next).toBe(true);
    expect(res.tiersUsed).not.toContain('embedding_l2'); // L2 returned null = no tier reported
    expect(res.tiersUsed).toContain('llm_l3');
  });
});

// ===========================================================================
// Section 7 — Input defensive
// ===========================================================================

describe('classifyIntentFlagsHybrid — input defensive', () => {
  it('7.1 — null input returns empty flags + only L1 tier', async () => {
    const res = await classifyIntentFlagsHybrid(null);
    expect(res.flags.triggered_flags).toEqual([]);
    expect(res.tiersUsed).toEqual(['regex_l1']);
  });

  it('7.2 — empty string returns empty flags + L1', async () => {
    const res = await classifyIntentFlagsHybrid('');
    expect(res.flags.triggered_flags).toEqual([]);
  });

  it('7.3 — L1 always runs first (synchronous)', async () => {
    const res = await classifyIntentFlagsHybrid('guarda');
    expect(res.tiersUsed[0]).toBe('regex_l1');
  });
});
