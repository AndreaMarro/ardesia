/**
 * unlim-intent-flags-embedding.test.js — Sprint X iter 105 P1
 *
 * Tests for `supabase/functions/_shared/intent-flags-embedding.ts`.
 *
 * Strategy: mock `callMistralEmbed` to return controlled vectors. Inject
 * pre-cached prototype embeddings via `_injectIntentFlagsEmbeddingCache`.
 * Verify cosine similarity scoring, threshold gate, lazy init, error paths.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

globalThis.Deno = globalThis.Deno || {
  env: { get: () => undefined, has: () => false, toObject: () => ({}) },
};

const mockCallMistralEmbed = vi.fn();
vi.mock('../../supabase/functions/_shared/mistral-client.ts', () => ({
  callMistralChat: vi.fn(),
  callMistralEmbed: (...args) => mockCallMistralEmbed(...args),
}));

const {
  classifyIntentFlagsEmbedding,
  cosineSimilarity,
  INTENT_FLAGS_PROTOTYPES,
  _resetIntentFlagsEmbeddingCache,
  _injectIntentFlagsEmbeddingCache,
  INTENT_FLAGS_EMBEDDING_VERSION,
} = await import('../../supabase/functions/_shared/intent-flags-embedding.ts');

// ===========================================================================
// Helpers: build deterministic test embeddings
// ===========================================================================

/** Build unit vector with specified dim, 1.0 at given index, 0 elsewhere. */
function unitVec(dim, idx) {
  const v = new Array(dim).fill(0);
  v[idx] = 1;
  return v;
}

/** Build aligned prototype cache map for tests. Same vector across all
 * prototypes of a flag → ensures cosine sim is deterministic. */
function buildAlignedCache(dim = 8) {
  const flagNames = Object.keys(INTENT_FLAGS_PROTOTYPES);
  const map = new Map();
  flagNames.forEach((flagName, i) => {
    const protoCount = INTENT_FLAGS_PROTOTYPES[flagName].length;
    const vec = unitVec(dim, i); // each flag gets unique axis
    map.set(flagName, new Array(protoCount).fill(null).map(() => [...vec]));
  });
  return map;
}

beforeEach(() => {
  _resetIntentFlagsEmbeddingCache();
  mockCallMistralEmbed.mockReset();
});

// ===========================================================================
// Section 1 — cosineSimilarity math
// ===========================================================================

describe('cosineSimilarity', () => {
  it('1.1 — identical unit vectors return 1', () => {
    const v = [1, 0, 0];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 6);
  });

  it('1.2 — orthogonal unit vectors return 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('1.3 — opposite vectors return -1', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 6);
  });

  it('1.4 — proportional vectors return 1', () => {
    expect(cosineSimilarity([2, 0], [4, 0])).toBeCloseTo(1, 6);
  });

  it('1.5 — empty arrays return NaN', () => {
    expect(Number.isNaN(cosineSimilarity([], []))).toBe(true);
  });

  it('1.6 — shape mismatch returns NaN', () => {
    expect(Number.isNaN(cosineSimilarity([1, 0], [1, 0, 0]))).toBe(true);
  });

  it('1.7 — non-array inputs return NaN', () => {
    expect(Number.isNaN(cosineSimilarity(null, [1, 0]))).toBe(true);
    expect(Number.isNaN(cosineSimilarity([1, 0], 'foo'))).toBe(true);
  });

  it('1.8 — zero vector returns 0 (not NaN)', () => {
    expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
  });
});

// ===========================================================================
// Section 2 — Prototype cache injection + classification
// ===========================================================================

describe('classifyIntentFlagsEmbedding with injected cache', () => {
  it('2.1 — query embedding aligned with wants_screen_view (idx 0) fires that flag only', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(8));
    mockCallMistralEmbed.mockResolvedValueOnce([unitVec(8, 0)]); // aligned to flag 0
    const result = await classifyIntentFlagsEmbedding('guarda', { skipInit: true, threshold: 0.5 });
    expect(result).not.toBe(null);
    expect(result.wants_screen_view).toBe(true);
    // Other flags orthogonal → cosine 0 < threshold
    expect(result.wants_action).toBe(false);
    expect(result.triggered_flags).toEqual(['WANTS_SCREEN_VIEW']);
  });

  it('2.2 — query embedding orthogonal to all prototypes fires nothing', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(8));
    // dim 8 cache, query in dim 8 but pointing at idx 7 — wait we have 8 flags, idx 0-7 all taken
    // Use higher-dim query that's orthogonal — change cache dim to 10, query at idx 8
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(10));
    mockCallMistralEmbed.mockResolvedValueOnce([unitVec(10, 8)]); // orthogonal to all 8 flags
    const result = await classifyIntentFlagsEmbedding('blah', { skipInit: true, threshold: 0.5 });
    expect(result).not.toBe(null);
    expect(result.triggered_flags).toEqual([]);
  });

  it('2.3 — query firing multiple flags returns all in triggered_flags', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(10));
    // Combine 2 axes — projects 1/sqrt(2) on each
    const combined = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    mockCallMistralEmbed.mockResolvedValueOnce([combined]);
    // threshold 0.5: cosine(combined, e_0) = 1/sqrt(2) ≈ 0.707 > 0.5 → fires
    const result = await classifyIntentFlagsEmbedding('test', { skipInit: true, threshold: 0.5 });
    expect(result.wants_screen_view).toBe(true);
    expect(result.wants_action).toBe(true);
    expect(result.triggered_flags).toContain('WANTS_SCREEN_VIEW');
    expect(result.triggered_flags).toContain('WANTS_ACTION');
  });

  it('2.4 — threshold above max similarity fires nothing', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(8));
    mockCallMistralEmbed.mockResolvedValueOnce([unitVec(8, 0)]);
    // threshold 1.5 impossible to reach
    const result = await classifyIntentFlagsEmbedding('guarda', { skipInit: true, threshold: 1.5 });
    expect(result.triggered_flags).toEqual([]);
  });

  it('2.5 — default threshold 0.72 used when not specified', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(10));
    // Vector with 0.8 projection on flag 0
    const partial = [0.8, 0.6, 0, 0, 0, 0, 0, 0, 0, 0];
    // cosine(partial, e_0) = 0.8 / 1.0 = 0.8 > 0.72 → fires
    mockCallMistralEmbed.mockResolvedValueOnce([partial]);
    const result = await classifyIntentFlagsEmbedding('test', { skipInit: true });
    expect(result.wants_screen_view).toBe(true);
  });
});

// ===========================================================================
// Section 3 — Defensive / error paths
// ===========================================================================

describe('classifyIntentFlagsEmbedding — defensive / error paths', () => {
  it('3.1 — null input returns null without calling Mistral', async () => {
    const result = await classifyIntentFlagsEmbedding(null);
    expect(result).toBe(null);
    expect(mockCallMistralEmbed).not.toHaveBeenCalled();
  });

  it('3.2 — empty string returns null', async () => {
    const result = await classifyIntentFlagsEmbedding('');
    expect(result).toBe(null);
    expect(mockCallMistralEmbed).not.toHaveBeenCalled();
  });

  it('3.3 — Mistral embed throws on init → returns null', async () => {
    mockCallMistralEmbed.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await classifyIntentFlagsEmbedding('test');
    expect(result).toBe(null);
  });

  it('3.4 — Mistral embed returns empty array → returns null', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(8));
    mockCallMistralEmbed.mockResolvedValueOnce([]); // empty
    const result = await classifyIntentFlagsEmbedding('test', { skipInit: true });
    expect(result).toBe(null);
  });

  it('3.5 — Mistral embed returns non-array → returns null', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(8));
    mockCallMistralEmbed.mockResolvedValueOnce(null);
    const result = await classifyIntentFlagsEmbedding('test', { skipInit: true });
    expect(result).toBe(null);
  });

  it('3.6 — Mistral embed returns empty first element → returns null', async () => {
    _injectIntentFlagsEmbeddingCache(buildAlignedCache(8));
    mockCallMistralEmbed.mockResolvedValueOnce([null]);
    const result = await classifyIntentFlagsEmbedding('test', { skipInit: true });
    expect(result).toBe(null);
  });
});

// ===========================================================================
// Section 4 — Lazy init batching
// ===========================================================================

describe('classifyIntentFlagsEmbedding — lazy init prototype embeddings', () => {
  it('4.1 — first call batches ALL prototypes into single Mistral embed batch', async () => {
    const totalPrototypes = Object.values(INTENT_FLAGS_PROTOTYPES).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    // First call: 1 batched embed for prototypes + 1 for query
    mockCallMistralEmbed
      .mockResolvedValueOnce(
        // prototypes batch — return 8-dim unit vecs per-flag (totalPrototypes vectors)
        Object.entries(INTENT_FLAGS_PROTOTYPES).flatMap(([_flagName, phrases], flagIdx) =>
          phrases.map(() => unitVec(8, flagIdx)),
        ),
      )
      .mockResolvedValueOnce([unitVec(8, 0)]); // query aligned to flag 0
    const result = await classifyIntentFlagsEmbedding('guarda', { threshold: 0.5 });
    expect(result).not.toBe(null);
    expect(result.wants_screen_view).toBe(true);
    expect(mockCallMistralEmbed).toHaveBeenCalledTimes(2);
    // First call's input is the prototypes batch
    expect(mockCallMistralEmbed.mock.calls[0][0]).toHaveLength(totalPrototypes);
  });

  it('4.2 — subsequent calls reuse cache (NO re-embed of prototypes)', async () => {
    mockCallMistralEmbed
      .mockResolvedValueOnce(
        Object.entries(INTENT_FLAGS_PROTOTYPES).flatMap(([_flagName, phrases], flagIdx) =>
          phrases.map(() => unitVec(8, flagIdx)),
        ),
      )
      .mockResolvedValueOnce([unitVec(8, 0)]) // query 1
      .mockResolvedValueOnce([unitVec(8, 1)]); // query 2

    await classifyIntentFlagsEmbedding('guarda', { threshold: 0.5 });
    await classifyIntentFlagsEmbedding('carica', { threshold: 0.5 });
    // 1 init batch + 2 query embeds = 3 calls total
    expect(mockCallMistralEmbed).toHaveBeenCalledTimes(3);
  });

  it('4.3 — init failure caches null → next call retries init', async () => {
    mockCallMistralEmbed
      .mockRejectedValueOnce(new Error('init fail'))
      .mockResolvedValueOnce(
        Object.entries(INTENT_FLAGS_PROTOTYPES).flatMap(([_flagName, phrases], flagIdx) =>
          phrases.map(() => unitVec(8, flagIdx)),
        ),
      )
      .mockResolvedValueOnce([unitVec(8, 0)]);
    const first = await classifyIntentFlagsEmbedding('guarda');
    const second = await classifyIntentFlagsEmbedding('guarda', { threshold: 0.5 });
    expect(first).toBe(null);
    expect(second).not.toBe(null);
    expect(second.wants_screen_view).toBe(true);
  });

  it('4.4 — concurrent init calls share single in-flight batch', async () => {
    let resolveBatch;
    const initPromise = new Promise((res) => { resolveBatch = res; });
    mockCallMistralEmbed.mockImplementationOnce(() => initPromise);

    const protoBatch = Object.entries(INTENT_FLAGS_PROTOTYPES).flatMap(
      ([_flagName, phrases], flagIdx) => phrases.map(() => unitVec(8, flagIdx)),
    );
    // Fire 3 concurrent calls
    const p1 = classifyIntentFlagsEmbedding('q1', { threshold: 0.5 });
    const p2 = classifyIntentFlagsEmbedding('q2', { threshold: 0.5 });
    const p3 = classifyIntentFlagsEmbedding('q3', { threshold: 0.5 });
    // Now mock query embeds — these all run AFTER init completes
    mockCallMistralEmbed.mockResolvedValue([unitVec(8, 0)]);
    // Allow init to complete
    resolveBatch(protoBatch);
    const results = await Promise.all([p1, p2, p3]);
    expect(results.every((r) => r !== null)).toBe(true);
    // Init batch should be called ONLY ONCE despite 3 concurrent callers
    // Total embed calls = 1 init + 3 query = 4
    expect(mockCallMistralEmbed).toHaveBeenCalledTimes(4);
  });
});

// ===========================================================================
// Section 5 — Module exports + telemetry
// ===========================================================================

describe('intent-flags-embedding — module exports', () => {
  it('5.1 — INTENT_FLAGS_PROTOTYPES has 8 flags with non-empty phrase arrays', () => {
    const keys = Object.keys(INTENT_FLAGS_PROTOTYPES);
    expect(keys).toHaveLength(8);
    keys.forEach((k) => {
      expect(Array.isArray(INTENT_FLAGS_PROTOTYPES[k])).toBe(true);
      expect(INTENT_FLAGS_PROTOTYPES[k].length).toBeGreaterThanOrEqual(4);
    });
  });

  it('5.2 — INTENT_FLAGS_EMBEDDING_VERSION exports a versioned string', () => {
    expect(typeof INTENT_FLAGS_EMBEDDING_VERSION).toBe('string');
    expect(INTENT_FLAGS_EMBEDDING_VERSION).toMatch(/^\d+\.\d+/);
  });
});
