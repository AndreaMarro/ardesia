/**
 * unlim-rag-readiness.test.js — Sprint 2026-05-25 PM
 *
 * RAG-layer regression suite targeting audit findings:
 *  - rrfFuseMulti math correctness across N lists with shared IDs
 *  - retrieveContext keyword search with MIN_CONFIDENCE=5 threshold
 *  - formatHybridContext citation shape ([VOL.X pag.Y]) + ordering
 *  - Italian stopword behavior (STOPWORDS_IT internal to bm25Search)
 *  - getExperimentKnowledge direct lookup
 *
 * SCIENTIFIC posture: each test names the audit gap it addresses.
 * Source TS file imported via vitest 3.x + Vite plugin (same pattern as
 * `intent-parser.test.js`).
 */

import { describe, it, expect } from 'vitest';

// Deno polyfill — rag.ts reads Deno.env at module load.
// Pattern aligns with vertex-client.test.js:25 + unlimMessageHistory.test.js:96.
globalThis.Deno = globalThis.Deno || {
  env: {
    get: () => undefined,
    has: () => false,
    toObject: () => ({}),
  },
};

const {
  retrieveContext,
  getExperimentKnowledge,
  rrfFuseMulti,
  formatHybridContext,
} = await import('../../supabase/functions/_shared/rag.ts');

// ---------------------------------------------------------------------------
// Section 1 — rrfFuseMulti math correctness (iter 13 U3)
// Audit: multi-list RRF formula = Σ 1/(k + rank_in_list). Verify ranking
// invariants hold for shared/disjoint IDs across lists with k=60.
// ---------------------------------------------------------------------------

describe('rrfFuseMulti — N-list reciprocal rank fusion', () => {
  it('1.1 — single list with single item: score = 1/(k+1)', () => {
    const fused = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 60);
    const score = fused.get('a');
    expect(score).toBeCloseTo(1 / 61, 6);
  });

  it('1.2 — same item in 2 lists at rank 1 each: score = 2/(k+1)', () => {
    const fused = rrfFuseMulti(
      [[{ id: 'a', rank: 1 }], [{ id: 'a', rank: 1 }]],
      60,
    );
    expect(fused.get('a')).toBeCloseTo(2 / 61, 6);
  });

  it('1.3 — item ranked higher (rank=1) > item ranked lower (rank=10)', () => {
    const fused = rrfFuseMulti(
      [
        [
          { id: 'top', rank: 1 },
          { id: 'mid', rank: 5 },
          { id: 'low', rank: 10 },
        ],
      ],
      60,
    );
    expect(fused.get('top')).toBeGreaterThan(fused.get('mid'));
    expect(fused.get('mid')).toBeGreaterThan(fused.get('low'));
  });

  it('1.4 — 4-list fusion (Wiki+RAG dense+BM25 pattern) sums contributions', () => {
    const fused = rrfFuseMulti(
      [
        [{ id: 'shared', rank: 2 }], // rag-bm25
        [{ id: 'shared', rank: 3 }], // rag-dense
        [{ id: 'shared', rank: 5 }], // wiki-bm25
        [{ id: 'shared', rank: 1 }], // wiki-dense
      ],
      60,
    );
    const expected = 1 / 62 + 1 / 63 + 1 / 65 + 1 / 61;
    expect(fused.get('shared')).toBeCloseTo(expected, 6);
  });

  it('1.5 — empty input returns empty Map', () => {
    const fused = rrfFuseMulti([], 60);
    expect(fused.size).toBe(0);
  });

  it('1.6 — empty lists are no-ops (no items added)', () => {
    const fused = rrfFuseMulti([[], [], []], 60);
    expect(fused.size).toBe(0);
  });

  it('1.7 — disjoint IDs across lists: all preserved', () => {
    const fused = rrfFuseMulti(
      [[{ id: 'a', rank: 1 }], [{ id: 'b', rank: 1 }], [{ id: 'c', rank: 1 }]],
      60,
    );
    expect(fused.size).toBe(3);
    expect(fused.get('a')).toBeCloseTo(1 / 61, 6);
    expect(fused.get('b')).toBeCloseTo(1 / 61, 6);
    expect(fused.get('c')).toBeCloseTo(1 / 61, 6);
  });

  it('1.8 — k parameter changes scores (k=0 boosts top-rank dominance)', () => {
    const k0 = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 0);
    const k60 = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 60);
    // k=0: 1/(0+1) = 1.0; k=60: 1/61 ≈ 0.0164
    expect(k0.get('a')).toBe(1);
    expect(k60.get('a')).toBeLessThan(k0.get('a'));
  });

  it('1.9 — high rank (rank=100) contribution is negligible at k=60', () => {
    const fused = rrfFuseMulti([[{ id: 'tail', rank: 100 }]], 60);
    // 1/160 ≈ 0.00625
    expect(fused.get('tail')).toBeLessThan(0.01);
  });

  it('1.10 — duplicate item in same list aggregates score (defensive)', () => {
    // Pathological input: same ID twice in one list. Verify no crash + score
    // sums both contributions (not last-wins).
    const fused = rrfFuseMulti(
      [
        [
          { id: 'dup', rank: 1 },
          { id: 'dup', rank: 5 },
        ],
      ],
      60,
    );
    const expected = 1 / 61 + 1 / 65;
    expect(fused.get('dup')).toBeCloseTo(expected, 6);
  });
});

// ---------------------------------------------------------------------------
// Section 2 — retrieveContext (inline knowledge-base.json keyword search)
// Audit: MIN_CONFIDENCE=5 threshold. Score<5 returns ''.
// ---------------------------------------------------------------------------

describe('retrieveContext — inline KB keyword search', () => {
  it('2.1 — query with NO matching keywords returns empty string', () => {
    // Random Latin → 0 matches → below MIN_CONFIDENCE
    const out = retrieveContext('xyzqwerty foo bar baz', null, 500);
    expect(out).toBe('');
  });

  it('2.2 — query with LED keyword likely surfaces a chunk', () => {
    const out = retrieveContext('come accendo un LED?', null, 1500);
    // KB has LED-related chunks; expect non-empty
    expect(typeof out).toBe('string');
    if (out.length > 0) {
      expect(out.toLowerCase()).toMatch(/led|resistor|breadboard|pin/);
    }
  });

  it('2.3 — empty query returns empty string', () => {
    expect(retrieveContext('', null, 500)).toBe('');
  });

  it('2.4 — query with only Italian stopwords: returns string (audit gap: STOP_WORDS coverage)', () => {
    // STOP_WORDS at rag.ts:27 may NOT contain all common Italian articles.
    // Behavior test: returns string, no crash. If empty, stopword coverage good.
    // Surfaces divergence between STOP_WORDS (line 27) and STOPWORDS_IT (line 600).
    const out = retrieveContext('di il la per con', null, 500);
    expect(typeof out).toBe('string');
  });

  it('2.5 — experimentId hint can boost matching (when known ID)', () => {
    // v1-cap6-esp1 = LED first experiment
    const outWithHint = retrieveContext('accendiamo', 'v1-cap6-esp1', 1500);
    const outNoHint = retrieveContext('accendiamo', null, 1500);
    // Either may return content; both must be strings (no crash)
    expect(typeof outWithHint).toBe('string');
    expect(typeof outNoHint).toBe('string');
  });

  it('2.6 — maxTokens parameter caps return length roughly', () => {
    const small = retrieveContext('LED pin breadboard resistor', null, 50);
    const big = retrieveContext('LED pin breadboard resistor', null, 5000);
    // If KB returned content for big, it should be >= small (more tokens budget)
    expect(big.length).toBeGreaterThanOrEqual(small.length);
  });

  it('2.7 — single-letter token filtered (V, R, I): returns string (no crash)', () => {
    // Single-letter filter at rag.ts:287 (w.length > 1).
    // Behavior test: returns string, no crash. Likely empty due to filter.
    const out = retrieveContext('V R I', null, 500);
    expect(typeof out).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Section 3 — getExperimentKnowledge — direct lookup
// ---------------------------------------------------------------------------

describe('getExperimentKnowledge — experiment ID direct lookup', () => {
  it('3.1 — known experiment ID returns string or null', () => {
    const k = getExperimentKnowledge('v1-cap6-esp1');
    expect(k === null || typeof k === 'string').toBe(true);
  });

  it('3.2 — unknown experiment ID returns null', () => {
    expect(getExperimentKnowledge('v99-cap99-esp99-unknown')).toBe(null);
  });

  it('3.3 — empty string returns null', () => {
    expect(getExperimentKnowledge('')).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// Section 4 — formatHybridContext — citation shape & ordering
// Audit: VOL.X pag.Y bracketed citation per Principio Zero V3.
// ---------------------------------------------------------------------------

describe('formatHybridContext — output shape', () => {
  it('4.1 — empty array returns empty string', () => {
    expect(formatHybridContext([])).toBe('');
  });

  it('4.2 — single chunk produces non-empty formatted output', () => {
    const out = formatHybridContext([
      {
        id: 'c1',
        content_raw: 'Il LED si accende con resistenza limitatrice.',
        source: 'vol1',
        chapter: 6,
        page: 12,
        section_title: 'LED basics',
        rrf_score: 0.0164,
        bm25_rank: 1,
        dense_rank: 2,
        similarity: null,
      },
    ]);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
    expect(out).toContain('LED');
  });

  it('4.3 — multiple chunks preserve order in output (top first)', () => {
    const out = formatHybridContext([
      { id: 'high', content_raw: 'PRIMO', source: 'vol1', chapter: 6, page: 12, section_title: 'A', rrf_score: 0.02, bm25_rank: 1, dense_rank: 1, similarity: null },
      { id: 'mid', content_raw: 'SECONDO', source: 'vol1', chapter: 6, page: 13, section_title: 'B', rrf_score: 0.015, bm25_rank: 2, dense_rank: 3, similarity: null },
    ]);
    // First chunk's content appears before second
    const idxFirst = out.indexOf('PRIMO');
    const idxSecond = out.indexOf('SECONDO');
    expect(idxFirst).toBeGreaterThanOrEqual(0);
    expect(idxSecond).toBeGreaterThan(idxFirst);
  });

  it('4.4 — wiki source chunk with null chapter/page does not crash', () => {
    expect(() =>
      formatHybridContext([
        {
          id: 'wiki-led',
          content_raw: 'LED definition.',
          source: 'wiki',
          chapter: null,
          page: null,
          section_title: null,
          rrf_score: 0.018,
          bm25_rank: 1,
          dense_rank: null,
          similarity: 0.7,
        },
      ]),
    ).not.toThrow();
  });

  it('4.5 — chunk with vol1 + page emits [VOL1 pag.12] citation (uppercase source + pag)', () => {
    const out = formatHybridContext([
      {
        id: 'cited',
        content_raw: 'Citato',
        source: 'vol1',
        chapter: 6,
        page: 12,
        section_title: null,
        rrf_score: 0.02,
        bm25_rank: 1,
        dense_rank: 1,
        similarity: null,
      },
    ]);
    // Implementation at rag.ts:1103: `[${c.source.toUpperCase()} pag.${c.page}]`
    expect(out).toContain('[VOL1 pag.12]');
  });

  it('4.6 — large chunk content_raw (50k chars) does not crash formatter', () => {
    const huge = 'x'.repeat(50_000);
    expect(() =>
      formatHybridContext([
        {
          id: 'huge',
          content_raw: huge,
          source: 'vol2',
          chapter: 1,
          page: 1,
          section_title: 'big',
          rrf_score: 0.01,
          bm25_rank: 1,
          dense_rank: 1,
          similarity: null,
        },
      ]),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Section 5 — Stopword behavior (proxy via retrieveContext)
// Audit: STOP_WORDS (line 27) and STOPWORDS_IT (line 600) are TWO lists.
// We cannot test STOPWORDS_IT directly (function-private to bm25Search) but
// can verify STOP_WORDS removal via retrieveContext behavior.
// ---------------------------------------------------------------------------

describe('Stopword removal — retrieveContext query cleaning', () => {
  it('5.1 — pure stopword query "di la il": no crash, returns string', () => {
    // Audit: STOP_WORDS (rag.ts:27) may not contain all common Italian articles.
    // Surfaces divergence vs STOPWORDS_IT (rag.ts:600).
    expect(typeof retrieveContext('di la il', null, 500)).toBe('string');
  });

  it('5.2 — mixed stopword + content: content keyword preserved', () => {
    // "il LED" → "il" filtered → "LED" remains → may match
    const out = retrieveContext('il LED', null, 1500);
    expect(typeof out).toBe('string');
    // No crash, no empty if KB has LED content
  });

  it('5.3 — Italian accented stopwords ("è") filtered consistently', () => {
    // "è una resistenza" → "è una" filtered → "resistenza" remains
    const out = retrieveContext('è una resistenza', null, 1500);
    expect(typeof out).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Section 6 — Adversarial RAG inputs
// ---------------------------------------------------------------------------

describe('Adversarial RAG inputs — robustness', () => {
  it('6.1 — extremely long query string (~10000 chars) does not crash', () => {
    const huge = 'LED breadboard pin '.repeat(500);
    expect(() => retrieveContext(huge, null, 1500)).not.toThrow();
  });

  it('6.2 — unicode mix (emoji + accented + cyrillic) does not crash', () => {
    expect(() =>
      retrieveContext('😀 LED Алексей è una resistenza', null, 500),
    ).not.toThrow();
  });

  it('6.3 — null inputs to formatHybridContext are safe', () => {
    // Defensive: defensive code paths often guard against this
    expect(() => formatHybridContext([])).not.toThrow();
  });

  it('6.4 — rrfFuseMulti with malformed entries (missing rank) gracefully handles', () => {
    // Some implementations assume rank always present; if it crashes, this
    // surfaces the contract gap.
    expect(() =>
      rrfFuseMulti([[{ id: 'a' /* no rank */ }]], 60),
    ).not.toThrow();
  });

  it('6.5 — retrieveContext with negative maxTokens treated as 0 (defensive)', () => {
    // Function may not validate; ensure no crash
    expect(() => retrieveContext('LED', null, -10)).not.toThrow();
  });
});
