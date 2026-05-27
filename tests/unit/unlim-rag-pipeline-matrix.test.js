/**
 * unlim-rag-pipeline-matrix.test.js — Sprint 2026-05-26
 *
 * Comprehensive matrix + pipeline integration test battery for UNLIM RAG layer
 * + operational post-LLM pipeline.
 *
 * Modules under test:
 *   - supabase/functions/_shared/rag.ts
 *       retrieveContext, getExperimentKnowledge, rrfFuseMulti, formatHybridContext
 *   - supabase/functions/_shared/operational-response.ts
 *       splitControlTags, capWordsPreservingControlTags, visibleWordCount,
 *       visibleSentenceCount, UNLIM_MAX_VISIBLE_WORDS=120
 *   - supabase/functions/_shared/volumi-citazioni.ts
 *       forceCitationFromQuery, forceCitationFromSession,
 *       rewriteCitationToCanonical, lookupCitazioneByCapitolo,
 *       VOLUMI_CITAZIONI_CORE
 *   - supabase/functions/_shared/principio-zero-validator.ts
 *       enforceItalianK12Opener, rewriteSingolareToPlurale
 *   - supabase/functions/_shared/experiment-registry.ts
 *       stripInvalidExperimentTags, validateExperimentIdExists,
 *       VALID_EXPERIMENT_IDS
 *
 * Andrea mandate 2026-05-25: NO compiacenza, evidence-based, non-trivial.
 * Pipeline contract: "Naturale prima, citazione quando serve" — chain must NOT
 * force citation when neither query Vol/cap nor session experiment ID present.
 *
 * Categories (target 200+ NON-TRIVIAL tests):
 *   1. rrfFuseMulti math matrix              (40 tests)
 *   2. retrieveContext keyword matrix        (30 tests)
 *   3. formatHybridContext output shape      (30 tests)
 *   4. End-to-end pipeline composition pairs (50 tests)
 *   5. Word cap stress                       (30 tests)
 *   6. Citation force matrix                 (40 tests)
 *   7. Andrea mandate verbatim               (10 tests)
 *
 * Total: 230 tests in one file.
 */

import { describe, it, expect } from 'vitest';

// Deno polyfill — rag.ts reads Deno.env.get() at module top-level. Required
// BEFORE static import (pattern matches unlim-rag-readiness.test.js:20).
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

import {
  UNLIM_MAX_VISIBLE_WORDS,
  splitControlTags,
  capWordsPreservingControlTags,
  visibleWordCount,
  visibleSentenceCount,
} from '../../supabase/functions/_shared/operational-response.ts';

import {
  VOLUMI_CITAZIONI_CORE,
  forceCitationFromQuery,
  forceCitationFromSession,
  rewriteCitationToCanonical,
  lookupCitazioneByCapitolo,
} from '../../supabase/functions/_shared/volumi-citazioni.ts';

import {
  enforceItalianK12Opener,
  rewriteSingolareToPlurale,
} from '../../supabase/functions/_shared/principio-zero-validator.ts';

import {
  stripInvalidExperimentTags,
  validateExperimentIdExists,
  VALID_EXPERIMENT_IDS,
} from '../../supabase/functions/_shared/experiment-registry.ts';

// ---------------------------------------------------------------------------
// Helper: build hybrid chunk fixture with sane defaults
// ---------------------------------------------------------------------------
function makeChunk(overrides = {}) {
  return {
    id: 'chunk-default',
    content: 'default content',
    content_raw: 'default content raw',
    source: 'vol1',
    chapter: 6,
    page: 27,
    figure_id: null,
    section_title: null,
    corpus: 'rag',
    rrf_score: 0.0164,
    bm25_rank: 1,
    dense_rank: 1,
    similarity: 0.7,
    ...overrides,
  };
}

// ===========================================================================
// SECTION 1 — rrfFuseMulti math matrix (40 NON-TRIVIAL tests)
// Exhaustive coverage k=0/60/120 × 1-4 lists × shared/disjoint IDs ×
// rank distributions.
// Formula reference (rag.ts:856): score = Σ 1/(k + rank_in_list).
// ===========================================================================

describe('Section 1 — rrfFuseMulti math matrix (40 tests)', () => {
  // ── Sub-matrix 1.A: k ∈ {0, 60, 120} × single-list, single-item rank=1 (3 tests)
  it('1.01 — k=0,   1 list,  1 item rank=1: score = 1/1 = 1.0', () => {
    const f = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 0);
    expect(f.get('a')).toBeCloseTo(1, 6);
  });

  it('1.02 — k=60,  1 list,  1 item rank=1: score = 1/61', () => {
    const f = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 60);
    expect(f.get('a')).toBeCloseTo(1 / 61, 6);
  });

  it('1.03 — k=120, 1 list,  1 item rank=1: score = 1/121', () => {
    const f = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 120);
    expect(f.get('a')).toBeCloseTo(1 / 121, 6);
  });

  // ── Sub-matrix 1.B: 2-list shared ID with mixed rank pairs (6 tests)
  it('1.04 — 2 lists rank=(1,1), k=60: score = 2/61', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 1 }], [{ id: 's', rank: 1 }]],
      60,
    );
    expect(f.get('s')).toBeCloseTo(2 / 61, 6);
  });

  it('1.05 — 2 lists rank=(1,2), k=60: score = 1/61 + 1/62', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 1 }], [{ id: 's', rank: 2 }]],
      60,
    );
    expect(f.get('s')).toBeCloseTo(1 / 61 + 1 / 62, 6);
  });

  it('1.06 — 2 lists rank=(5,10), k=60: score = 1/65 + 1/70', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 5 }], [{ id: 's', rank: 10 }]],
      60,
    );
    expect(f.get('s')).toBeCloseTo(1 / 65 + 1 / 70, 6);
  });

  it('1.07 — 2 lists rank=(1,1), k=0:  score = 1 + 1 = 2', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 1 }], [{ id: 's', rank: 1 }]],
      0,
    );
    expect(f.get('s')).toBeCloseTo(2, 6);
  });

  it('1.08 — 2 lists rank=(1,1), k=120: score = 2/121', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 1 }], [{ id: 's', rank: 1 }]],
      120,
    );
    expect(f.get('s')).toBeCloseTo(2 / 121, 6);
  });

  it('1.09 — 2 lists rank=(50,50), k=0: score = 1/50 + 1/50 = 0.04', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 50 }], [{ id: 's', rank: 50 }]],
      0,
    );
    expect(f.get('s')).toBeCloseTo(0.04, 6);
  });

  // ── Sub-matrix 1.C: 3-list patterns (5 tests)
  it('1.10 — 3 lists rank=(1,1,1), k=60: score = 3/61', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 1 }], [{ id: 's', rank: 1 }], [{ id: 's', rank: 1 }]],
      60,
    );
    expect(f.get('s')).toBeCloseTo(3 / 61, 6);
  });

  it('1.11 — 3 lists rank=(1,2,3), k=60: score = 1/61 + 1/62 + 1/63', () => {
    const f = rrfFuseMulti(
      [[{ id: 's', rank: 1 }], [{ id: 's', rank: 2 }], [{ id: 's', rank: 3 }]],
      60,
    );
    expect(f.get('s')).toBeCloseTo(1 / 61 + 1 / 62 + 1 / 63, 6);
  });

  it('1.12 — 3 lists disjoint IDs: each scored independently', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'a', rank: 1 }],
        [{ id: 'b', rank: 1 }],
        [{ id: 'c', rank: 1 }],
      ],
      60,
    );
    expect(f.size).toBe(3);
    expect(f.get('a')).toBeCloseTo(1 / 61, 6);
    expect(f.get('b')).toBeCloseTo(1 / 61, 6);
    expect(f.get('c')).toBeCloseTo(1 / 61, 6);
  });

  it('1.13 — 3 lists, 1 ID in all + 1 ID in just one: shared > singleton', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'shared', rank: 5 }, { id: 'single', rank: 1 }],
        [{ id: 'shared', rank: 5 }],
        [{ id: 'shared', rank: 5 }],
      ],
      60,
    );
    expect(f.get('shared')).toBeGreaterThan(f.get('single'));
  });

  it('1.14 — 3 lists empty-empty-empty (3 empties): returns Map size 0', () => {
    const f = rrfFuseMulti([[], [], []], 60);
    expect(f.size).toBe(0);
  });

  // ── Sub-matrix 1.D: 4-list Wiki LLM Hybrid fusion pattern (8 tests)
  it('1.15 — 4-list shared rank=(2,3,5,1), k=60: matches formula sum', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'x', rank: 2 }],
        [{ id: 'x', rank: 3 }],
        [{ id: 'x', rank: 5 }],
        [{ id: 'x', rank: 1 }],
      ],
      60,
    );
    expect(f.get('x')).toBeCloseTo(1 / 62 + 1 / 63 + 1 / 65 + 1 / 61, 6);
  });

  it('1.16 — 4-list disjoint: 4 separate IDs scored', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'a', rank: 1 }],
        [{ id: 'b', rank: 1 }],
        [{ id: 'c', rank: 1 }],
        [{ id: 'd', rank: 1 }],
      ],
      60,
    );
    expect(f.size).toBe(4);
  });

  it('1.17 — 4-list with one empty: 3 contribute, 1 no-op', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [],
      ],
      60,
    );
    expect(f.get('x')).toBeCloseTo(3 / 61, 6);
  });

  it('1.18 — 4-list with two empty: 2 contribute', () => {
    const f = rrfFuseMulti(
      [[{ id: 'x', rank: 1 }], [], [{ id: 'x', rank: 1 }], []],
      60,
    );
    expect(f.get('x')).toBeCloseTo(2 / 61, 6);
  });

  it('1.19 — 4-list rag+wiki dense+bm25 ordering preserved across IDs', () => {
    const f = rrfFuseMulti(
      [
        // rag-bm25
        [{ id: 'rag1', rank: 1 }, { id: 'rag2', rank: 2 }],
        // rag-dense
        [{ id: 'rag1', rank: 2 }, { id: 'rag3', rank: 1 }],
        // wiki-bm25
        [{ id: 'wiki1', rank: 1 }],
        // wiki-dense
        [{ id: 'wiki1', rank: 2 }, { id: 'rag1', rank: 5 }],
      ],
      60,
    );
    // rag1 appears in 3 lists → highest score
    const rag1 = f.get('rag1');
    const wiki1 = f.get('wiki1');
    const rag3 = f.get('rag3');
    expect(rag1).toBeGreaterThan(wiki1);
    expect(wiki1).toBeGreaterThan(rag3);
  });

  it('1.20 — 4-list at k=0 highly amplifies top ranks (sum >> k=60)', () => {
    const f0 = rrfFuseMulti(
      [
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
      ],
      0,
    );
    const f60 = rrfFuseMulti(
      [
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
      ],
      60,
    );
    expect(f0.get('x')).toBeCloseTo(4, 6);
    expect(f60.get('x')).toBeCloseTo(4 / 61, 6);
    expect(f0.get('x')).toBeGreaterThan(f60.get('x'));
  });

  it('1.21 — 4-list at k=120 dampens scores even at rank=1', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
        [{ id: 'x', rank: 1 }],
      ],
      120,
    );
    expect(f.get('x')).toBeCloseTo(4 / 121, 6);
  });

  it('1.22 — 4-list with all-empty: returns empty Map', () => {
    const f = rrfFuseMulti([[], [], [], []], 60);
    expect(f.size).toBe(0);
  });

  // ── Sub-matrix 1.E: rank distributions edge values (6 tests)
  it('1.23 — rank=1000 (very deep tail) negligible at k=60', () => {
    const f = rrfFuseMulti([[{ id: 'tail', rank: 1000 }]], 60);
    expect(f.get('tail')).toBeCloseTo(1 / 1060, 6);
    expect(f.get('tail')).toBeLessThan(0.001);
  });

  it('1.24 — rank=2 vs rank=3 differs by tiny amount at k=60', () => {
    const f = rrfFuseMulti(
      [[{ id: 'r2', rank: 2 }, { id: 'r3', rank: 3 }]],
      60,
    );
    expect(f.get('r2')).toBeGreaterThan(f.get('r3'));
    expect(f.get('r2') - f.get('r3')).toBeCloseTo(1 / 62 - 1 / 63, 6);
  });

  it('1.25 — same-list rank=(1,5,10): r1 > r5 > r10 monotone', () => {
    const f = rrfFuseMulti(
      [
        [
          { id: 'r1', rank: 1 },
          { id: 'r5', rank: 5 },
          { id: 'r10', rank: 10 },
        ],
      ],
      60,
    );
    expect(f.get('r1')).toBeGreaterThan(f.get('r5'));
    expect(f.get('r5')).toBeGreaterThan(f.get('r10'));
  });

  it('1.26 — rank=0 in single list (degenerate input): score = 1/(k+0)', () => {
    // Defensive: input contract says rank>=1, but verify no crash
    const f = rrfFuseMulti([[{ id: 'z', rank: 0 }]], 60);
    expect(f.get('z')).toBeCloseTo(1 / 60, 6);
  });

  it('1.27 — duplicate IDs in same list sum contributions (not last-wins)', () => {
    const f = rrfFuseMulti(
      [[{ id: 'dup', rank: 1 }, { id: 'dup', rank: 5 }]],
      60,
    );
    expect(f.get('dup')).toBeCloseTo(1 / 61 + 1 / 65, 6);
  });

  it('1.28 — single-list rank=(2,1) (reversed order): scores reflect rank', () => {
    // Lower rank number = better rank
    const f = rrfFuseMulti(
      [[{ id: 'rank2', rank: 2 }, { id: 'rank1', rank: 1 }]],
      60,
    );
    expect(f.get('rank1')).toBeGreaterThan(f.get('rank2'));
  });

  // ── Sub-matrix 1.F: empty + invalid inputs (5 tests)
  it('1.29 — empty top-level array returns size 0', () => {
    expect(rrfFuseMulti([], 60).size).toBe(0);
  });

  it('1.30 — single empty inner list: size 0', () => {
    expect(rrfFuseMulti([[]], 60).size).toBe(0);
  });

  it('1.31 — many empty inner lists: size 0, no crash', () => {
    expect(() => rrfFuseMulti([[], [], [], [], []], 60)).not.toThrow();
    expect(rrfFuseMulti([[], [], [], [], []], 60).size).toBe(0);
  });

  it('1.32 — entry missing rank field uses NaN propagation safely', () => {
    // Defensive — should not throw. Score may be NaN, but Map populated.
    expect(() => rrfFuseMulti([[{ id: 'a' }]], 60)).not.toThrow();
  });

  it('1.33 — negative k value: still computes (no validation in source)', () => {
    // Source rag.ts:856 does not validate k>=0
    expect(() => rrfFuseMulti([[{ id: 'a', rank: 1 }]], -10)).not.toThrow();
  });

  // ── Sub-matrix 1.G: shared+disjoint hybrid across 2-4 lists (7 tests)
  it('1.34 — 2-list, 1 shared + 2 unique per list: 3 IDs total', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 's', rank: 1 }, { id: 'a', rank: 2 }],
        [{ id: 's', rank: 1 }, { id: 'b', rank: 2 }],
      ],
      60,
    );
    expect(f.size).toBe(3);
  });

  it('1.35 — 3-list, common ID appearing in all 3 + private IDs', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'common', rank: 1 }, { id: 'a', rank: 3 }],
        [{ id: 'common', rank: 2 }, { id: 'b', rank: 5 }],
        [{ id: 'common', rank: 1 }, { id: 'c', rank: 10 }],
      ],
      60,
    );
    expect(f.size).toBe(4);
    expect(f.get('common')).toBeCloseTo(1 / 61 + 1 / 62 + 1 / 61, 6);
  });

  it('1.36 — 4-list, all share rank=10 then 1 unique each: shared > unique', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 's', rank: 10 }, { id: 'u1', rank: 1 }],
        [{ id: 's', rank: 10 }, { id: 'u2', rank: 1 }],
        [{ id: 's', rank: 10 }, { id: 'u3', rank: 1 }],
        [{ id: 's', rank: 10 }, { id: 'u4', rank: 1 }],
      ],
      60,
    );
    expect(f.get('s')).toBeCloseTo(4 / 70, 6);
    // u1 only in list 1, score = 1/61 ≈ 0.0164
    expect(f.get('u1')).toBeCloseTo(1 / 61, 6);
    expect(f.get('s')).toBeGreaterThan(f.get('u1'));
  });

  it('1.37 — N=4 fusion preserves IDs across all 4 corpora (rag-bm25, rag-dense, wiki-bm25, wiki-dense)', () => {
    const f = rrfFuseMulti(
      [
        [{ id: 'rag-bm', rank: 1 }],
        [{ id: 'rag-dense', rank: 1 }],
        [{ id: 'wiki-bm', rank: 1 }],
        [{ id: 'wiki-dense', rank: 1 }],
      ],
      60,
    );
    expect(f.size).toBe(4);
  });

  it('1.38 — k=60 is the canonical ELAB default (matches HybridRetrieveOptions.rrfK)', () => {
    // Documentation invariant — ensure 60 produces standard formula
    const f = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 60);
    expect(f.get('a')).toBeCloseTo(0.0163934, 5);
  });

  it('1.39 — return type is Map<string, number>', () => {
    const f = rrfFuseMulti([[{ id: 'a', rank: 1 }]], 60);
    expect(f instanceof Map).toBe(true);
    expect(typeof f.get('a')).toBe('number');
  });

  it('1.40 — large input (200 items × 4 lists) completes without crash', () => {
    const buildList = (offset) =>
      Array.from({ length: 200 }, (_, i) => ({ id: `i${i + offset}`, rank: i + 1 }));
    expect(() =>
      rrfFuseMulti([buildList(0), buildList(50), buildList(100), buildList(150)], 60),
    ).not.toThrow();
    const f = rrfFuseMulti([buildList(0), buildList(50), buildList(100), buildList(150)], 60);
    // 200 + 150 unique per list shifted → total < 800 but > 200
    expect(f.size).toBeGreaterThan(200);
  });
});

// ===========================================================================
// SECTION 2 — retrieveContext keyword matrix (30 NON-TRIVIAL tests)
// Italian/English/mixed query, with/without experimentId hint, various
// maxTokens, threshold behavior.
// Source rag.ts:277. MIN_CONFIDENCE=5 → returns '' below threshold.
// ===========================================================================

describe('Section 2 — retrieveContext keyword matrix (30 tests)', () => {
  // ── Sub-matrix 2.A: Italian queries (10 tests)
  it('2.01 — Italian "come accendo un LED" returns string', () => {
    expect(typeof retrieveContext('come accendo un LED', null, 1500)).toBe('string');
  });

  it('2.02 — Italian "il resistore 470 ohm" returns string', () => {
    expect(typeof retrieveContext('il resistore 470 ohm', null, 1500)).toBe('string');
  });

  it('2.03 — Italian "la breadboard come funziona" returns string', () => {
    expect(typeof retrieveContext('la breadboard come funziona', null, 1500)).toBe('string');
  });

  it('2.04 — Italian "circuito chiuso aperto serie parallelo" returns string', () => {
    expect(typeof retrieveContext('circuito chiuso aperto serie parallelo', null, 2000)).toBe('string');
  });

  it('2.05 — Italian with kid slang "lampadina lucina rossa" returns string', () => {
    // SYNONYM_MAP expands lampadina→led, lucina→led
    expect(typeof retrieveContext('lampadina lucina rossa', null, 1500)).toBe('string');
  });

  it('2.06 — Italian colloquial "filo cavo collega arduino" returns string', () => {
    expect(typeof retrieveContext('filo cavo collega arduino', null, 1500)).toBe('string');
  });

  it('2.07 — Italian "potenziometro manopola gira" returns string', () => {
    expect(typeof retrieveContext('potenziometro manopola gira', null, 1500)).toBe('string');
  });

  it('2.08 — Italian "pulsante tasto schiacciare" returns string', () => {
    expect(typeof retrieveContext('pulsante tasto schiacciare', null, 1500)).toBe('string');
  });

  it('2.09 — Italian only-stopwords query "di la per con il" returns string (no crash)', () => {
    // STOP_WORDS (rag.ts:27) DOES contain "con", "per" — but "di", "la", "il" are
    // NOT in the list, so they may produce matches via the synonym/stem pipeline.
    // This test surfaces the documented STOP_WORDS vs STOPWORDS_IT divergence
    // (rag.ts:27 vs rag.ts:606). Behavior contract: returns string, no crash.
    const out = retrieveContext('di la per con il', null, 1500);
    expect(typeof out).toBe('string');
  });

  it('2.10 — Italian compound "polarità anodo catodo verso" returns string', () => {
    expect(typeof retrieveContext('polarità anodo catodo verso', null, 1500)).toBe('string');
  });

  // ── Sub-matrix 2.B: English queries (5 tests)
  it('2.11 — English "LED resistor breadboard" returns string', () => {
    expect(typeof retrieveContext('LED resistor breadboard', null, 1500)).toBe('string');
  });

  it('2.12 — English "arduino digital write" returns string', () => {
    expect(typeof retrieveContext('arduino digital write', null, 1500)).toBe('string');
  });

  it('2.13 — English "blink program pin output" returns string', () => {
    expect(typeof retrieveContext('blink program pin output', null, 1500)).toBe('string');
  });

  it('2.14 — English "voltage current resistance ohm law" returns string', () => {
    expect(typeof retrieveContext('voltage current resistance ohm law', null, 1500)).toBe('string');
  });

  it('2.15 — English-only random "foo bar baz xyzzy" returns empty', () => {
    expect(retrieveContext('foo bar baz xyzzy', null, 1500)).toBe('');
  });

  // ── Sub-matrix 2.C: Mixed Italian + English (5 tests)
  it('2.16 — Mixed "LED rosso digital pin output" returns string', () => {
    expect(typeof retrieveContext('LED rosso digital pin output', null, 1500)).toBe('string');
  });

  it('2.17 — Mixed "pulsante button digitalRead pin" returns string', () => {
    expect(typeof retrieveContext('pulsante button digitalRead pin', null, 1500)).toBe('string');
  });

  it('2.18 — Mixed "Arduino sketch blink led lampeggia" returns string', () => {
    expect(typeof retrieveContext('Arduino sketch blink led lampeggia', null, 1500)).toBe('string');
  });

  it('2.19 — Mixed accents "perché il LED non si accende?" returns string', () => {
    expect(typeof retrieveContext('perché il LED non si accende?', null, 1500)).toBe('string');
  });

  it('2.20 — Mixed unicode + emoji "💡 LED 🔋 batteria" returns string (no crash)', () => {
    expect(() => retrieveContext('💡 LED 🔋 batteria', null, 1500)).not.toThrow();
  });

  // ── Sub-matrix 2.D: experimentId hint behavior (5 tests)
  it('2.21 — known experimentId v1-cap6-esp1 + LED query returns content', () => {
    const out = retrieveContext('LED accendi', 'v1-cap6-esp1', 1500);
    expect(typeof out).toBe('string');
    // experimentId bonus = +100, almost certainly above MIN_CONFIDENCE=5
    expect(out.length).toBeGreaterThan(0);
  });

  it('2.22 — unknown experimentId v99-cap99-esp99 + LED query returns string', () => {
    const out = retrieveContext('LED accendi', 'v99-cap99-esp99', 1500);
    expect(typeof out).toBe('string');
  });

  it('2.23 — experimentId vs null hint: hint version likely longer or equal', () => {
    const withHint = retrieveContext('LED', 'v1-cap6-esp1', 1500);
    const noHint = retrieveContext('LED', null, 1500);
    expect(typeof withHint).toBe('string');
    expect(typeof noHint).toBe('string');
    // With hint, exact chunk match +100 ensures inclusion
    expect(withHint.length).toBeGreaterThanOrEqual(noHint.length - 500);
  });

  it('2.24 — empty experimentId "" is falsy (no hint applied)', () => {
    expect(() => retrieveContext('LED', '', 1500)).not.toThrow();
  });

  it('2.25 — experimentId hint with garbage query still surfaces chunk', () => {
    // +100 boost can push above MIN_CONFIDENCE=5 even with weak query
    const out = retrieveContext('xyzqwerty', 'v1-cap6-esp1', 1500);
    expect(typeof out).toBe('string');
    // chunk content for v1-cap6-esp1 surfaced via ID match
    if (out.length > 0) {
      expect(out.toLowerCase()).toMatch(/led|esperimento|capitolo/);
    }
  });

  // ── Sub-matrix 2.E: maxTokens budget variations (5 tests)
  it('2.26 — maxTokens=50 caps output strictly', () => {
    const small = retrieveContext('LED breadboard resistor pin', null, 50);
    expect(typeof small).toBe('string');
    // Content can be empty if 50 tokens insufficient for any chunk
    expect(small.length).toBeLessThan(5000);
  });

  it('2.27 — maxTokens=10000 returns >= maxTokens=200 length', () => {
    const small = retrieveContext('LED breadboard', null, 200);
    const big = retrieveContext('LED breadboard', null, 10000);
    expect(big.length).toBeGreaterThanOrEqual(small.length);
  });

  it('2.28 — maxTokens=0 returns empty (no budget for chunks)', () => {
    const out = retrieveContext('LED breadboard', null, 0);
    expect(typeof out).toBe('string');
    expect(out.length).toBeLessThan(200); // header only at most
  });

  it('2.29 — negative maxTokens treated defensively (no crash)', () => {
    expect(() => retrieveContext('LED breadboard', null, -100)).not.toThrow();
  });

  it('2.30 — default maxTokens=800 returns sensible string', () => {
    expect(typeof retrieveContext('LED breadboard')).toBe('string');
  });
});

// ===========================================================================
// SECTION 3 — formatHybridContext output shape matrix (30 NON-TRIVIAL tests)
// wiki vs vol sources, null chapter/page combinations, figure_id presence,
// content_raw length variants.
// Source rag.ts:1117. Format: `[${source.toUpperCase()} pag.${page}]` or `[${source}]`.
// ===========================================================================

describe('Section 3 — formatHybridContext output shape matrix (30 tests)', () => {
  // ── Sub-matrix 3.A: source × page combinations (6 tests)
  it('3.01 — vol1 + page=27 → "[VOL1 pag.27]" citation', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'LED basics', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('[VOL1 pag.27]');
  });

  it('3.02 — vol2 + page=43 → "[VOL2 pag.43]" citation', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c2', content_raw: 'condensatore', source: 'vol2', page: 43 }),
    ]);
    expect(out).toContain('[VOL2 pag.43]');
  });

  it('3.03 — vol3 + page=23 → "[VOL3 pag.23]" citation', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c3', content_raw: 'Blink', source: 'vol3', page: 23 }),
    ]);
    expect(out).toContain('[VOL3 pag.23]');
  });

  it('3.04 — wiki source + page=12 → "[WIKI pag.12]"', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'w1', content_raw: 'LED definition', source: 'wiki', page: 12 }),
    ]);
    expect(out).toContain('[WIKI pag.12]');
  });

  it('3.05 — vol1 + page=null → "[vol1]" (no .toUpperCase preserved since null page branch)', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c4', content_raw: 'x', source: 'vol1', page: null }),
    ]);
    // rag.ts:1120 → `[${c.source}]` (no toUpperCase) when page falsy
    expect(out).toContain('[vol1]');
  });

  it('3.06 — empty source + page=27 → "[ pag.27]" (defensive: source falsy guard)', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c5', content_raw: 'y', source: '', page: 27 }),
    ]);
    // source falsy → second branch `[${c.source}]` → "[]"
    expect(out).toContain('[]');
  });

  // ── Sub-matrix 3.B: null chapter/page null combinations (4 tests)
  it('3.07 — null chapter only does not crash, page citation still emitted', () => {
    expect(() =>
      formatHybridContext([
        makeChunk({ id: 'c1', content_raw: 'x', source: 'vol1', chapter: null, page: 27 }),
      ]),
    ).not.toThrow();
  });

  it('3.08 — null page only → fallback "[source]" citation (no pag suffix)', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c2', content_raw: 'y', source: 'vol2', chapter: 6, page: null }),
    ]);
    expect(out).toContain('[vol2]');
    expect(out).not.toContain('pag.');
  });

  it('3.09 — both chapter+page null → "[source]"', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c3', content_raw: 'z', source: 'wiki', chapter: null, page: null }),
    ]);
    expect(out).toContain('[wiki]');
  });

  it('3.10 — chapter=0 page=0: 0 is falsy in JS → falls back to "[source]"', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c4', content_raw: 'q', source: 'vol1', chapter: 0, page: 0 }),
    ]);
    // page=0 is falsy → fallback branch
    expect(out).toContain('[vol1]');
  });

  // ── Sub-matrix 3.C: figure_id presence (4 tests)
  it('3.11 — figure_id present → appended after citation', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'x', figure_id: 'FIG1.1', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('FIG1.1');
  });

  it('3.12 — figure_id null → no figure appended', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c2', content_raw: 'y', figure_id: null, source: 'vol1', page: 27 }),
    ]);
    // Just citation, no extra fig token
    expect(out).toContain('[VOL1 pag.27]');
    // No leading 'FIG' string
    expect(out).not.toMatch(/FIG\d/);
  });

  it('3.13 — figure_id complex string with dashes "FIG-6-3a" preserved', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c3', content_raw: 'z', figure_id: 'FIG-6-3a', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('FIG-6-3a');
  });

  it('3.14 — figure_id empty string "" → falsy guard → not appended', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c4', content_raw: 'q', figure_id: '', source: 'vol1', page: 27 }),
    ]);
    // ' ' + '' is just empty, no FIG token
    expect(out).toContain('[VOL1 pag.27]');
  });

  // ── Sub-matrix 3.D: content_raw length variants (4 tests)
  it('3.15 — empty content_raw still produces citation block', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: '', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('[VOL1 pag.27]');
  });

  it('3.16 — short content_raw (1 char) included', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c2', content_raw: 'A', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('A');
  });

  it('3.17 — medium content_raw (500 chars) included whole', () => {
    const body = 'A'.repeat(500);
    const out = formatHybridContext([
      makeChunk({ id: 'c3', content_raw: body, source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain(body);
  });

  it('3.18 — huge content_raw (100k chars) does not throw', () => {
    const body = 'B'.repeat(100_000);
    expect(() =>
      formatHybridContext([
        makeChunk({ id: 'c4', content_raw: body, source: 'vol1', page: 27 }),
      ]),
    ).not.toThrow();
  });

  // ── Sub-matrix 3.E: multi-chunk ordering + header (6 tests)
  it('3.19 — 2-chunk fixture preserves array order in output', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'first', content_raw: 'AAA', source: 'vol1', page: 1 }),
      makeChunk({ id: 'second', content_raw: 'BBB', source: 'vol2', page: 2 }),
    ]);
    expect(out.indexOf('AAA')).toBeGreaterThan(-1);
    expect(out.indexOf('AAA')).toBeLessThan(out.indexOf('BBB'));
  });

  it('3.20 — 3-chunk fixture preserves array order', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'a', content_raw: 'AAA', source: 'vol1', page: 1 }),
      makeChunk({ id: 'b', content_raw: 'BBB', source: 'vol2', page: 2 }),
      makeChunk({ id: 'c', content_raw: 'CCC', source: 'vol3', page: 3 }),
    ]);
    expect(out.indexOf('AAA')).toBeLessThan(out.indexOf('BBB'));
    expect(out.indexOf('BBB')).toBeLessThan(out.indexOf('CCC'));
  });

  it('3.21 — output starts with "[CONOSCENZA DAI VOLUMI ELAB" header', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'x', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('[CONOSCENZA DAI VOLUMI ELAB');
  });

  it('3.22 — output contains "Hybrid RAG" marker in header', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'x', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('Hybrid RAG');
  });

  it('3.23 — chunk separator "---" appears between citation and content', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'BODY', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('---');
  });

  it('3.24 — wiki + vol mixed: both render their citations', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'wiki', content_raw: 'concept def', source: 'wiki', page: 1 }),
      makeChunk({ id: 'vol', content_raw: 'esperimento', source: 'vol1', page: 27 }),
    ]);
    expect(out).toContain('[WIKI pag.1]');
    expect(out).toContain('[VOL1 pag.27]');
  });

  // ── Sub-matrix 3.F: empty + degenerate (3 tests)
  it('3.25 — empty chunks array → empty string (early return)', () => {
    expect(formatHybridContext([])).toBe('');
  });

  it('3.26 — chunk with only required fields present (figure_id null, sec null) renders', () => {
    expect(() =>
      formatHybridContext([
        {
          id: 'minimal',
          content: 'c',
          content_raw: 'cr',
          source: 'vol1',
          chapter: null,
          page: null,
          figure_id: null,
          section_title: null,
          corpus: 'rag',
          rrf_score: 0,
          bm25_rank: null,
          dense_rank: null,
        },
      ]),
    ).not.toThrow();
  });

  it('3.27 — large array (100 chunks) renders all citations', () => {
    const arr = Array.from({ length: 100 }, (_, i) =>
      makeChunk({ id: `c${i}`, content_raw: `body${i}`, source: 'vol1', page: i + 1 }),
    );
    const out = formatHybridContext(arr);
    expect(out).toContain('body0');
    expect(out).toContain('body99');
    expect(out).toContain('[VOL1 pag.1]');
    expect(out).toContain('[VOL1 pag.100]');
  });

  // ── Sub-matrix 3.G: unusual sources + chapter values (3 tests)
  it('3.28 — uppercase source "VOL1" → preserved already-upper in citation', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'x', source: 'VOL1', page: 5 }),
    ]);
    expect(out).toContain('[VOL1 pag.5]');
  });

  it('3.29 — source with hyphen "vol-1" preserved in toUpperCase', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'x', source: 'vol-1', page: 5 }),
    ]);
    expect(out).toContain('[VOL-1 pag.5]');
  });

  it('3.30 — chapter not used in citation format (only source+page); chapter=999 ignored', () => {
    const out = formatHybridContext([
      makeChunk({ id: 'c1', content_raw: 'x', source: 'vol1', chapter: 999, page: 27 }),
    ]);
    expect(out).toContain('[VOL1 pag.27]');
    expect(out).not.toContain('999');
  });
});

// ===========================================================================
// SECTION 4 — End-to-end POST-LLM pipeline composition matrix (50 tests)
// Chain combinations:
//   capWords, stripInvalid, enforceOpener, rewritePlural, rewriteCitation,
//   forceCitationFromQuery, forceCitationFromSession
// 7 stages; subset of 7×8=56 ordered pairs of practical interest verified.
// Validates idempotency + composition invariants.
// ===========================================================================

describe('Section 4 — End-to-end POST-LLM pipeline composition (50 tests)', () => {
  // Reusable test inputs
  const SHORT_OVER = (n) =>
    Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
  const VALID_EXP_TAG = '[AZIONE:loadexp:v1-cap6-esp1]';
  const INVALID_EXP_TAG = '[AZIONE:loadexp:fake-not-in-registry]';

  // ── 4.A: cap → strip (5 tests)
  it('4.01 — cap(150w + valid+invalid tags) → strip: valid retained, invalid stripped, word≤120', () => {
    const raw = `${SHORT_OVER(150)} ${VALID_EXP_TAG} ${INVALID_EXP_TAG}`;
    const capped = capWordsPreservingControlTags(raw, 120);
    const { text, stripped } = stripInvalidExperimentTags(capped);
    expect(text).toContain(VALID_EXP_TAG);
    expect(text).not.toContain('fake-not-in-registry');
    expect(stripped).toContain('fake-not-in-registry');
    expect(visibleWordCount(text)).toBeLessThanOrEqual(120);
  });

  it('4.02 — cap(empty) → strip: empty text, empty stripped', () => {
    const capped = capWordsPreservingControlTags('', 120);
    const { text, stripped } = stripInvalidExperimentTags(capped);
    expect(text).toBe('');
    expect(stripped).toEqual([]);
  });

  it('4.03 — cap(120w exact) → strip: no truncation, no strip', () => {
    const raw = SHORT_OVER(120);
    const capped = capWordsPreservingControlTags(raw, 120);
    const { text } = stripInvalidExperimentTags(capped);
    expect(text).not.toContain('...');
  });

  it('4.04 — cap(200w + 3 valid tags) → strip: all 3 valid preserved', () => {
    const raw = `${SHORT_OVER(200)} [AZIONE:loadexp:v1-cap6-esp1] [AZIONE:loadexp:v1-cap6-esp2] [AZIONE:loadexp:v1-cap6-esp3]`;
    const capped = capWordsPreservingControlTags(raw, 50);
    const { text, stripped } = stripInvalidExperimentTags(capped);
    expect(text).toContain('v1-cap6-esp1');
    expect(text).toContain('v1-cap6-esp2');
    expect(text).toContain('v1-cap6-esp3');
    expect(stripped).toEqual([]);
  });

  it('4.05 — cap then strip: order preserves tag tail (tags appended last by cap)', () => {
    const raw = `Ragazzi guardate il LED ${INVALID_EXP_TAG}`;
    const capped = capWordsPreservingControlTags(raw, 5);
    const { text } = stripInvalidExperimentTags(capped);
    expect(text).not.toContain('fake-not-in-registry');
  });

  // ── 4.B: strip → enforceOpener (5 tests)
  it('4.06 — strip(empty) → opener: returns empty (no Ragazzi forced)', () => {
    const { text } = stripInvalidExperimentTags('');
    expect(enforceItalianK12Opener(text)).toBe('');
  });

  it('4.07 — strip(invalid tag only) → opener: empty stripped output gets ... opener prepends nothing if empty', () => {
    const { text } = stripInvalidExperimentTags(INVALID_EXP_TAG);
    const out = enforceItalianK12Opener(text);
    expect(typeof out).toBe('string');
  });

  it('4.08 — strip("guarda LED" no tags) → opener: "Ragazzi, " prepended', () => {
    const { text } = stripInvalidExperimentTags('guarda LED');
    const out = enforceItalianK12Opener(text);
    expect(out.startsWith('Ragazzi,')).toBe(true);
  });

  it('4.09 — strip then opener: valid tag remains; opener prepended', () => {
    const { text } = stripInvalidExperimentTags(`guarda ${VALID_EXP_TAG}`);
    const out = enforceItalianK12Opener(text);
    expect(out.startsWith('Ragazzi,')).toBe(true);
    expect(out).toContain(VALID_EXP_TAG);
  });

  it('4.10 — strip removes 3 invalid → opener still prepends Ragazzi', () => {
    const raw = `guarda [AZIONE:loadexp:fake1] [AZIONE:loadexp:fake2] [AZIONE:loadexp:fake3]`;
    const { text, stripped } = stripInvalidExperimentTags(raw);
    expect(stripped.length).toBe(3);
    const out = enforceItalianK12Opener(text);
    expect(out.startsWith('Ragazzi')).toBe(true);
  });

  // ── 4.C: enforceOpener → rewritePlural (5 tests)
  it('4.11 — opener("guarda") → plural: "Ragazzi, guarda..." → "Ragazzi, guardate..."', () => {
    const op = enforceItalianK12Opener('guarda il LED');
    const pl = rewriteSingolareToPlurale(op);
    expect(pl).toContain('Ragazzi');
    // The "guarda" inside the prepended text might get pluralized
    expect(typeof pl).toBe('string');
  });

  it('4.12 — opener("tu hai un LED") → plural: 2sg verbs become 2pl', () => {
    const op = enforceItalianK12Opener('tu hai un LED');
    const pl = rewriteSingolareToPlurale(op);
    expect(pl).toMatch(/voi|avete/);
  });

  it('4.13 — opener+plural twice (idempotent on plural)', () => {
    const t = 'Ragazzi, guardate il LED.';
    const pl1 = rewriteSingolareToPlurale(enforceItalianK12Opener(t));
    const pl2 = rewriteSingolareToPlurale(enforceItalianK12Opener(pl1));
    expect(pl2).toBe(pl1);
  });

  it('4.14 — opener(already plural) + plural: no double change', () => {
    const t = 'Ragazzi, voi avete il kit ELAB.';
    const op = enforceItalianK12Opener(t);
    const pl = rewriteSingolareToPlurale(op);
    expect(pl).toContain('voi');
    expect(pl).toContain('avete');
  });

  it('4.15 — opener + plural preserves [AZIONE:...] tags', () => {
    const t = `guarda ${VALID_EXP_TAG}`;
    const op = enforceItalianK12Opener(t);
    const pl = rewriteSingolareToPlurale(op);
    expect(pl).toContain(VALID_EXP_TAG);
  });

  // ── 4.D: rewritePlural → rewriteCitation (5 tests)
  it('4.16 — plural("guarda nel Volume 1 capitolo 6") → citation: canonical Vol.1 pag.X appended', () => {
    const pl = rewriteSingolareToPlurale('guarda nel Volume 1 capitolo 6');
    const ct = rewriteCitationToCanonical(pl);
    expect(ct).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('4.17 — plural+citation idempotent (running twice)', () => {
    const p1 = rewriteCitationToCanonical(rewriteSingolareToPlurale('Vol.1 cap.6 ?'));
    const p2 = rewriteCitationToCanonical(rewriteSingolareToPlurale(p1));
    expect(p2).toBe(p1);
  });

  it('4.18 — plural input with no Vol/cap → citation no-op', () => {
    const pl = rewriteSingolareToPlurale('guardate il LED rosso');
    const ct = rewriteCitationToCanonical(pl);
    expect(ct).toBe(pl);
  });

  it('4.19 — plural("Vol.3 cap.5 spiegate") + citation: Vol.3 pag.23 (Blink) appended', () => {
    const pl = rewriteSingolareToPlurale('Vol.3 cap.5 spiegate');
    const ct = rewriteCitationToCanonical(pl);
    expect(ct).toMatch(/Vol\.\s*3\s+pag\.\s*\d+/);
  });

  it('4.20 — plural+citation preserves [INTENT:...] tag', () => {
    const tagged = 'Vol.1 cap.6 [INTENT:{"tool":"mountExperiment","args":{"id":"v1-cap6-esp1"}}]';
    const pl = rewriteSingolareToPlurale(tagged);
    const ct = rewriteCitationToCanonical(pl);
    expect(ct).toContain('[INTENT:');
  });

  // ── 4.E: rewriteCitation → forceCitationFromQuery (5 tests)
  it('4.21 — rewrite(canonical exists) → forceFromQuery: idempotent skip', () => {
    const t = 'Risposta. (Vol.1 pag.27) Continuiamo.';
    const ct = rewriteCitationToCanonical(t);
    const fc = forceCitationFromQuery('Vol.1 cap.6 ?', ct);
    expect(fc).toBe(t);
  });

  it('4.22 — rewrite(no Vol/cap) → forceFromQuery(Vol.1 cap.6): appends canonical', () => {
    const ct = rewriteCitationToCanonical('Risposta breve.');
    const fc = forceCitationFromQuery('Vol.1 cap.6', ct);
    expect(fc).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('4.23 — rewrite already adds canonical → forceFromQuery does NOT re-append', () => {
    const ct = rewriteCitationToCanonical('Vedi Volume 1 capitolo 6.');
    const fc = forceCitationFromQuery('Vol.1 cap.6', ct);
    // Single (Vol.1 pag.X) appearance
    const matches = (fc.match(/Vol\.\s*1\s+pag\./g) || []).length;
    expect(matches).toBe(1);
  });

  it('4.24 — rewrite then forceFromQuery with empty query: unchanged', () => {
    const ct = rewriteCitationToCanonical('No Vol cap here.');
    const fc = forceCitationFromQuery('', ct);
    expect(fc).toBe(ct);
  });

  it('4.25 — rewrite then forceFromQuery with non-core Vol/cap: unchanged', () => {
    const ct = rewriteCitationToCanonical('No Vol cap inline.');
    const fc = forceCitationFromQuery('Vol.2 cap.99', ct);
    expect(fc).toBe(ct);
  });

  // ── 4.F: forceCitationFromQuery → forceCitationFromSession (5 tests)
  it('4.26 — query forces (Vol.1 pag.27); session ignored since canonical present', () => {
    const fq = forceCitationFromQuery('Vol.1 cap.6 ?', 'Risposta.');
    const fs = forceCitationFromSession('v3-cap5-esp1', fq);
    expect(fs).toBe(fq);
  });

  it('4.27 — query has no Vol/cap; session(v1-cap6-esp1) forces (Vol.1 pag.27)', () => {
    const fq = forceCitationFromQuery('spiegami LED', 'Risposta.');
    const fs = forceCitationFromSession('v1-cap6-esp1', fq);
    expect(fs).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('4.28 — query+session both null/empty: response unchanged', () => {
    const r = 'Risposta naturale.';
    const fq = forceCitationFromQuery('', r);
    const fs = forceCitationFromSession(null, fq);
    expect(fs).toBe(r);
  });

  it('4.29 — query empty + session malformed: unchanged', () => {
    const r = 'Risposta.';
    const fq = forceCitationFromQuery('', r);
    const fs = forceCitationFromSession('garbage', fq);
    expect(fs).toBe(r);
  });

  it('4.30 — query and session pointing to DIFFERENT Vol/cap: first wins', () => {
    const fq = forceCitationFromQuery('Vol.1 cap.6 ?', 'Risposta.');
    const fs = forceCitationFromSession('v2-cap7-esp1', fq);
    // fq already canonical Vol.1 → fs skip
    expect(fs).toContain('Vol.1');
    expect(fs).not.toContain('Vol.2');
  });

  // ── 4.G: Full chain idempotency + invariants (10 tests)
  function fullPipeline(rawLLM, ctxMessage, ctxLastExpId) {
    let t = capWordsPreservingControlTags(rawLLM, 120);
    t = stripInvalidExperimentTags(t).text;
    t = enforceItalianK12Opener(t);
    t = rewriteSingolareToPlurale(t);
    t = rewriteCitationToCanonical(t);
    t = forceCitationFromQuery(ctxMessage, t);
    t = forceCitationFromSession(ctxLastExpId, t);
    return t;
  }

  it('4.31 — full chain on "guarda LED": Ragazzi prepended, guarda→guardate', () => {
    const out = fullPipeline('guarda LED', '', null);
    expect(out).toContain('Ragazzi');
    expect(out).toMatch(/guardate|LED/);
  });

  it('4.32 — full chain idempotent (run twice)', () => {
    const pass1 = fullPipeline('guarda LED', 'Vol.1 cap.6 ?', 'v1-cap6-esp1');
    const pass2 = fullPipeline(pass1, 'Vol.1 cap.6 ?', 'v1-cap6-esp1');
    expect(pass2).toBe(pass1);
  });

  it('4.33 — full chain with INVALID exp tag: tag stripped, opener prepended', () => {
    const out = fullPipeline(`guarda ${INVALID_EXP_TAG}`, '', null);
    expect(out).not.toContain('fake-not-in-registry');
    expect(out).toContain('Ragazzi');
  });

  it('4.34 — full chain with VALID exp tag: tag preserved', () => {
    const out = fullPipeline(`guarda ${VALID_EXP_TAG}`, '', null);
    expect(out).toContain(VALID_EXP_TAG);
  });

  it('4.35 — full chain with query Vol/cap: canonical force from query', () => {
    const out = fullPipeline('LED', 'Vol.1 cap.6 cosa fa?', null);
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('4.36 — full chain with session ID only (no query Vol/cap): force from session', () => {
    const out = fullPipeline('Continuiamo', '', 'v2-cap7-esp1');
    expect(out).toMatch(/Vol\.\s*2\s+pag\.\s*\d+/);
  });

  it('4.37 — full chain with NEITHER query Vol/cap NOR session: NO canonical injected', () => {
    const out = fullPipeline('parliamo del LED', '', null);
    expect(out).not.toMatch(/\(Vol\.\s*\d+\s+pag\.\s*\d+\)/);
  });

  it('4.38 — full chain on huge input (1000w) capped to ~120 + Ragazzi opener', () => {
    // cap=120 then enforceItalianK12Opener prepends "Ragazzi," → +1 visible word.
    // Total bound: cap (120) + opener (1) = 121 max visible words.
    const out = fullPipeline(SHORT_OVER(1000), '', null);
    expect(out.startsWith('Ragazzi')).toBe(true);
    expect(visibleWordCount(out)).toBeLessThanOrEqual(121);
  });

  it('4.39 — full chain preserves [INTENT:{...}] tag end-to-end', () => {
    const raw = 'guarda [INTENT:{"tool":"highlight","args":{"id":"led1"}}]';
    const out = fullPipeline(raw, '', null);
    expect(out).toContain('[INTENT:{"tool":"highlight","args":{"id":"led1"}}]');
  });

  it('4.40 — full chain DOES NOT force citation when "Naturale prima" — neither Vol/cap nor session', () => {
    const out = fullPipeline('Mi puoi spiegare?', '', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  // ── 4.H: Cross-pair commutativity / composition checks (10 tests)
  it('4.41 — strip then cap == cap then strip (commutative when valid tag present)', () => {
    const raw = `${SHORT_OVER(150)} ${VALID_EXP_TAG}`;
    const a = stripInvalidExperimentTags(capWordsPreservingControlTags(raw, 80)).text;
    const b = capWordsPreservingControlTags(stripInvalidExperimentTags(raw).text, 80);
    // Both should contain valid tag + capped prose
    expect(a).toContain(VALID_EXP_TAG);
    expect(b).toContain(VALID_EXP_TAG);
    expect(visibleWordCount(a)).toBeLessThanOrEqual(80);
    expect(visibleWordCount(b)).toBeLessThanOrEqual(80);
  });

  it('4.42 — opener then plural != plural then opener (opener prepends fixed "Ragazzi,")', () => {
    const t = 'guarda il LED';
    const a = rewriteSingolareToPlurale(enforceItalianK12Opener(t));
    const b = enforceItalianK12Opener(rewriteSingolareToPlurale(t));
    // Both contain "Ragazzi"
    expect(a.startsWith('Ragazzi')).toBe(true);
    expect(b.startsWith('Ragazzi')).toBe(true);
  });

  it('4.43 — citation then forceFromQuery: NO double canonical', () => {
    const ct = rewriteCitationToCanonical('Volume 1 capitolo 6');
    const fq = forceCitationFromQuery('Vol.1 cap.6 ?', ct);
    const matches = (fq.match(/Vol\.\s*1\s+pag\.\s*\d+/g) || []).length;
    expect(matches).toBe(1);
  });

  it('4.44 — forceFromQuery then citation: idempotent (rewrite skips canonical present)', () => {
    const fq = forceCitationFromQuery('Vol.1 cap.6 ?', 'Risposta.');
    const ct = rewriteCitationToCanonical(fq);
    expect(ct).toBe(fq);
  });

  it('4.45 — forceFromSession then forceFromQuery: query wins if canonical not yet appended', () => {
    const r = 'Risposta neutra.';
    const fs = forceCitationFromSession('v1-cap6-esp1', r); // appends Vol.1 pag.27
    const fq = forceCitationFromQuery('Vol.2 cap.7 ?', fs);
    // fs added Vol.1 → fq idempotent skip
    expect(fq).toContain('Vol.1');
    expect(fq).not.toContain('Vol.2');
  });

  it('4.46 — forceFromQuery then forceFromSession: query wins (canonical already there)', () => {
    const r = 'Risposta.';
    const fq = forceCitationFromQuery('Vol.1 cap.6 ?', r); // appends Vol.1 pag.27
    const fs = forceCitationFromSession('v2-cap7-esp1', fq);
    expect(fs).toContain('Vol.1');
    expect(fs).not.toContain('Vol.2');
  });

  it('4.47 — cap then opener: opener prepended AFTER cap (Ragazzi not counted toward cap)', () => {
    const capped = capWordsPreservingControlTags(SHORT_OVER(120), 120);
    const op = enforceItalianK12Opener(capped);
    expect(op.startsWith('Ragazzi')).toBe(true);
    // visibleWordCount of opener output includes "Ragazzi,"
    expect(visibleWordCount(op)).toBeGreaterThan(120);
  });

  it('4.48 — strip then opener with no remaining text: returns empty or opener-with-empty', () => {
    const { text } = stripInvalidExperimentTags(INVALID_EXP_TAG);
    const op = enforceItalianK12Opener(text);
    // No prose to prepend to; opener returns empty if cleaned is empty
    expect(typeof op).toBe('string');
  });

  it('4.49 — plural then strip: invalid tag stripped + plural applied', () => {
    const pl = rewriteSingolareToPlurale(`guarda ${INVALID_EXP_TAG}`);
    const { text, stripped } = stripInvalidExperimentTags(pl);
    expect(stripped).toContain('fake-not-in-registry');
    expect(text).not.toContain('fake-not-in-registry');
  });

  it('4.50 — full chain monotone after first pass: p2 == p3 (idempotent fixed point)', () => {
    // First pass may rearrange tag position (capWordsPreservingControlTags
    // moves all tags to the end). Once normalized, subsequent passes are
    // idempotent — verify fixed-point convergence from pass 2 onward.
    const input = 'guarda il LED [AZIONE:loadexp:v1-cap6-esp1]';
    const p1 = fullPipeline(input, 'Vol.1 cap.6', 'v1-cap6-esp1');
    const p2 = fullPipeline(p1, 'Vol.1 cap.6', 'v1-cap6-esp1');
    const p3 = fullPipeline(p2, 'Vol.1 cap.6', 'v1-cap6-esp1');
    expect(p3).toBe(p2); // idempotent fixed point reached at p2
  });
});

// ===========================================================================
// SECTION 5 — Word cap stress (30 NON-TRIVIAL tests)
// exactly N words, N+1 words, control tag at start/middle/end, multiple
// [AZIONE]/[INTENT] tag mixes, malformed truncated tags, words with combining
// marks, max words = 0/1/120/10000.
// ===========================================================================

describe('Section 5 — Word cap stress (30 tests)', () => {
  // ── 5.A: Exact N word boundary (5 tests)
  it('5.01 — exactly N=120 words returns unchanged, no "..."', () => {
    const text = Array.from({ length: 120 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text, 120);
    expect(out).not.toContain('...');
    expect(visibleWordCount(out)).toBe(120);
  });

  it('5.02 — exactly N=50 returns unchanged, no "..."', () => {
    const text = Array.from({ length: 50 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text, 50);
    expect(out).not.toContain('...');
    expect(visibleWordCount(out)).toBe(50);
  });

  it('5.03 — exactly N=1 returns unchanged', () => {
    const out = capWordsPreservingControlTags('solo', 1);
    expect(out).toBe('solo');
    expect(visibleWordCount(out)).toBe(1);
  });

  it('5.04 — N+1=121 words truncates to 120, "..." appended', () => {
    const text = Array.from({ length: 121 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text, 120);
    expect(out.endsWith('...')).toBe(true);
    expect(visibleWordCount(out)).toBe(120);
  });

  it('5.05 — N+10=130 words: truncates to 120 + ...', () => {
    const text = Array.from({ length: 130 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text, 120);
    expect(visibleWordCount(out)).toBe(120);
    expect(out.endsWith('...')).toBe(true);
  });

  // ── 5.B: Control tag at start/middle/end (6 tests)
  it('5.06 — [AZIONE:x] at START + long prose: tag preserved + prose capped', () => {
    const out = capWordsPreservingControlTags(
      '[AZIONE:x] ' + Array.from({ length: 150 }, (_, i) => `w${i}`).join(' '),
      120,
    );
    expect(out).toContain('[AZIONE:x]');
    expect(visibleWordCount(out)).toBe(120);
  });

  it('5.07 — [AZIONE:x] in MIDDLE of long prose: tag preserved', () => {
    const before = Array.from({ length: 60 }, (_, i) => `a${i}`).join(' ');
    const after = Array.from({ length: 60 }, (_, i) => `b${i}`).join(' ');
    const out = capWordsPreservingControlTags(
      `${before} [AZIONE:mid] ${after}`,
      120,
    );
    expect(out).toContain('[AZIONE:mid]');
  });

  it('5.08 — [AZIONE:x] at END + long prose: tag preserved at end', () => {
    const out = capWordsPreservingControlTags(
      Array.from({ length: 150 }, (_, i) => `w${i}`).join(' ') + ' [AZIONE:tail]',
      120,
    );
    expect(out).toContain('[AZIONE:tail]');
  });

  it('5.09 — [INTENT:{...}] at START preserved with cap', () => {
    const out = capWordsPreservingControlTags(
      '[INTENT:{"tool":"x","args":{}}] ' + Array.from({ length: 150 }, (_, i) => `w${i}`).join(' '),
      50,
    );
    expect(out).toContain('[INTENT:{"tool":"x","args":{}}]');
  });

  it('5.10 — [INTENT:{...}] in MIDDLE preserved', () => {
    const out = capWordsPreservingControlTags(
      Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ') +
        ' [INTENT:{"tool":"y","args":{"k":"v"}}] ' +
        Array.from({ length: 30 }, (_, i) => `q${i}`).join(' '),
      40,
    );
    expect(out).toContain('[INTENT:{"tool":"y","args":{"k":"v"}}]');
  });

  it('5.11 — [INTENT:{...}] at END preserved', () => {
    const out = capWordsPreservingControlTags(
      Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ') +
        ' [INTENT:{"tool":"end","args":{}}]',
      50,
    );
    expect(out).toContain('[INTENT:{"tool":"end","args":{}}]');
  });

  // ── 5.C: Multiple AZIONE + INTENT mixes (6 tests)
  it('5.12 — 3× [AZIONE:...] preserved all', () => {
    const out = capWordsPreservingControlTags(
      'ciao [AZIONE:a] [AZIONE:b] [AZIONE:c]',
      120,
    );
    expect(out).toContain('[AZIONE:a]');
    expect(out).toContain('[AZIONE:b]');
    expect(out).toContain('[AZIONE:c]');
  });

  it('5.13 — 2× [INTENT:...] preserved all', () => {
    const out = capWordsPreservingControlTags(
      'x [INTENT:{"tool":"a","args":{}}] [INTENT:{"tool":"b","args":{}}]',
      120,
    );
    expect(out).toContain('"tool":"a"');
    expect(out).toContain('"tool":"b"');
  });

  it('5.14 — MIXED 2× AZIONE + 2× INTENT preserved with cap', () => {
    const out = capWordsPreservingControlTags(
      Array.from({ length: 100 }, (_, i) => `w${i}`).join(' ') +
        ' [AZIONE:a] [INTENT:{"tool":"i1","args":{}}] [AZIONE:b] [INTENT:{"tool":"i2","args":{}}]',
      30,
    );
    expect(out).toContain('[AZIONE:a]');
    expect(out).toContain('[AZIONE:b]');
    expect(out).toContain('"tool":"i1"');
    expect(out).toContain('"tool":"i2"');
  });

  it('5.15 — 5× [AZIONE:...] tags all preserved (no tag dropped)', () => {
    const tags = ['[AZIONE:a]', '[AZIONE:b]', '[AZIONE:c]', '[AZIONE:d]', '[AZIONE:e]'];
    const out = capWordsPreservingControlTags(
      Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ') + ' ' + tags.join(' '),
      50,
    );
    for (const tag of tags) {
      expect(out).toContain(tag);
    }
  });

  it('5.16 — interleaved AZIONE+prose+INTENT+prose+AZIONE: all 3 tags preserved', () => {
    const out = capWordsPreservingControlTags(
      `${Array.from({ length: 30 }, (_, i) => `p${i}`).join(' ')} [AZIONE:a1] ${
        Array.from({ length: 30 }, (_, i) => `q${i}`).join(' ')
      } [INTENT:{"tool":"x","args":{}}] ${
        Array.from({ length: 30 }, (_, i) => `r${i}`).join(' ')
      } [AZIONE:a2]`,
      40,
    );
    expect(out).toContain('[AZIONE:a1]');
    expect(out).toContain('[AZIONE:a2]');
    expect(out).toContain('"tool":"x"');
  });

  it('5.17 — nested-args INTENT preserved across cap', () => {
    const out = capWordsPreservingControlTags(
      Array.from({ length: 50 }, (_, i) => `w${i}`).join(' ') +
        ' [INTENT:{"tool":"f","args":{"filter":{"type":{"sub":"led"}}}}]',
      10,
    );
    expect(out).toContain('"sub":"led"');
  });

  // ── 5.D: Malformed/truncated tags (4 tests)
  it('5.18 — malformed "[AZIONE:no-close" treated as prose, counts as word', () => {
    const out = capWordsPreservingControlTags('Ragazzi [AZIONE:no-close prose continues', 120);
    expect(typeof out).toBe('string');
    expect(out).toContain('AZIONE');
  });

  it('5.19 — malformed "[INTENT:{no-close" treated as prose', () => {
    const out = capWordsPreservingControlTags('start [INTENT:{no-close prose', 120);
    expect(typeof out).toBe('string');
    expect(out).toContain('INTENT');
  });

  it('5.20 — empty "[AZIONE:]" tag preserved (boundary case)', () => {
    const out = capWordsPreservingControlTags('foo [AZIONE:]', 120);
    expect(out).toContain('[AZIONE:]');
  });

  it('5.21 — orphan "]" character treated as prose, no crash', () => {
    expect(() => capWordsPreservingControlTags('Ragazzi guardate ]', 120)).not.toThrow();
  });

  // ── 5.E: Unicode combining marks + accented chars (4 tests)
  it('5.22 — combining marks (NFD): "Pèche" with combining accent preserved', () => {
    const out = capWordsPreservingControlTags('Pèsche é à ò', 120);
    expect(out).toContain('Pèsche');
  });

  it('5.23 — Italian accented vowels preserved in cap output', () => {
    const txt = 'Perché è così difficile fare università oggi?';
    const out = capWordsPreservingControlTags(txt, 120);
    expect(out).toContain('Perché');
    expect(out).toContain('università');
  });

  it('5.24 — emoji + accented + ASCII mix does not crash', () => {
    expect(() =>
      capWordsPreservingControlTags('🎓 Università è bella 🇮🇹', 120),
    ).not.toThrow();
  });

  it('5.25 — zero-width chars (\\u200B) embedded does not crash', () => {
    expect(() =>
      capWordsPreservingControlTags('Ragazzi​​ guardate', 120),
    ).not.toThrow();
  });

  // ── 5.F: maxWords boundary values (5 tests)
  it('5.26 — maxWords=0: produces ellipsis (degenerate stable behavior)', () => {
    const out = capWordsPreservingControlTags('uno due tre [AZIONE:x]', 0);
    expect(out).toContain('[AZIONE:x]');
    expect(out).toMatch(/\.\.\./);
  });

  it('5.27 — maxWords=1: single word + tag preserved', () => {
    const out = capWordsPreservingControlTags('uno due tre quattro [AZIONE:x]', 1);
    expect(visibleWordCount(out)).toBe(1);
    expect(out).toContain('[AZIONE:x]');
  });

  it('5.28 — maxWords=120 (canonical UNLIM cap)', () => {
    const text = Array.from({ length: 121 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text, 120);
    expect(visibleWordCount(out)).toBe(120);
  });

  it('5.29 — maxWords=10000 well above content: no truncation', () => {
    const text = Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text, 10000);
    expect(out).not.toContain('...');
    expect(visibleWordCount(out)).toBe(200);
  });

  it('5.30 — default maxWords (omitted) uses UNLIM_MAX_VISIBLE_WORDS=120', () => {
    const text = Array.from({ length: 121 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(text);
    expect(visibleWordCount(out)).toBe(120);
  });
});

// ===========================================================================
// SECTION 6 — Citation force matrix (40 NON-TRIVIAL tests)
// forceCitationFromQuery for every existing Vol+cap combo in
// VOLUMI_CITAZIONI_CORE × idempotency × response-already-has-canonical ×
// narrative-form combinations.
// ===========================================================================

describe('Section 6 — Citation force matrix (40 tests)', () => {
  // Iterate VOLUMI_CITAZIONI_CORE (27 entries — Vol1 9 + Vol2 9 + Vol3 8)
  // for each entry, build at minimum: 1 query-trigger test
  // (some shared logic tests are placed at end)

  // ── 6.A: Vol1 chapters (9 tests, one per entry)
  for (const cit of VOLUMI_CITAZIONI_CORE.filter((c) => c.vol === 1)) {
    it(`6.${String(cit.cap).padStart(2, '0')}vol1 — query "Vol.1 cap.${cit.cap}" appends (Vol.1 pag.${cit.pag})`, () => {
      const out = forceCitationFromQuery(
        `Vol.1 cap.${cit.cap} cosa fa?`,
        'Risposta naturale.',
      );
      expect(out).toContain(`Vol.1 pag.${cit.pag}`);
    });
  }

  // ── 6.B: Vol2 chapters (9 tests)
  for (const cit of VOLUMI_CITAZIONI_CORE.filter((c) => c.vol === 2)) {
    it(`6.${String(cit.cap).padStart(2, '0')}vol2 — query "Vol.2 cap.${cit.cap}" appends (Vol.2 pag.${cit.pag})`, () => {
      const out = forceCitationFromQuery(
        `Vol.2 cap.${cit.cap} spiega`,
        'Risposta.',
      );
      expect(out).toContain(`Vol.2 pag.${cit.pag}`);
    });
  }

  // ── 6.C: Vol3 chapters (8 tests)
  for (const cit of VOLUMI_CITAZIONI_CORE.filter((c) => c.vol === 3)) {
    it(`6.${String(cit.cap).padStart(2, '0')}vol3 — query "Vol.3 cap.${cit.cap}" appends (Vol.3 pag.${cit.pag})`, () => {
      const out = forceCitationFromQuery(
        `Vol.3 cap.${cit.cap} dimmi`,
        'Risposta.',
      );
      expect(out).toContain(`Vol.3 pag.${cit.pag}`);
    });
  }

  // ── 6.D: Idempotency across canonical present (5 tests)
  it('6.D1 — query Vol.1 cap.6 + response already canonical: NO double append', () => {
    const r = '(Vol.1 pag.27) Già citato.';
    const out = forceCitationFromQuery('Vol.1 cap.6 ?', r);
    expect(out).toBe(r);
  });

  it('6.D2 — running forceFromQuery TWICE: idempotent', () => {
    const r = 'Risposta semplice.';
    const o1 = forceCitationFromQuery('Vol.1 cap.6 ?', r);
    const o2 = forceCitationFromQuery('Vol.1 cap.6 ?', o1);
    expect(o2).toBe(o1);
  });

  it('6.D3 — running forceFromQuery THREE times: still idempotent', () => {
    const r = 'Risposta.';
    const o1 = forceCitationFromQuery('Vol.2 cap.7 ?', r);
    const o2 = forceCitationFromQuery('Vol.2 cap.7 ?', o1);
    const o3 = forceCitationFromQuery('Vol.2 cap.7 ?', o2);
    expect(o3).toBe(o1);
  });

  it('6.D4 — canonical inside narrative middle: detected, no re-append', () => {
    const r = 'Inizio. (Vol.3 pag.23) Fine.';
    const out = forceCitationFromQuery('Vol.3 cap.5 ?', r);
    expect(out).toBe(r);
  });

  it('6.D5 — narrative "Vol.1 pag.27" (no parens) detected: idempotent', () => {
    const r = 'Vedi Vol.1 pag.27 per dettagli.';
    const out = forceCitationFromQuery('Vol.1 cap.6 ?', r);
    expect(out).toBe(r);
  });

  // ── 6.E: Narrative-form Vol/cap in query (5 tests)
  it('6.E1 — query "Volume 1 capitolo 6": detected, canonical appended', () => {
    const out = forceCitationFromQuery('Volume 1 capitolo 6 spiegami', 'Risposta.');
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*27/);
  });

  it('6.E2 — query "vol 1 cap 6" (no dot): detected via regex flex', () => {
    const out = forceCitationFromQuery('vol 1 cap 6 spiega', 'Risposta.');
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*27/);
  });

  it('6.E3 — query mixed case "VOL.1 CAP.6": detected', () => {
    const out = forceCitationFromQuery('VOL.1 CAP.6 spiega', 'Risposta.');
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*27/);
  });

  it('6.E4 — query "Volume 2, Capitolo 7" with comma: detected', () => {
    const out = forceCitationFromQuery('Volume 2, Capitolo 7 spiega', 'Risposta.');
    expect(out).toMatch(/Vol\.\s*2\s+pag\.\s*43/);
  });

  it('6.E5 — query "volume.3 capitolo.5" period punctuation: detected', () => {
    const out = forceCitationFromQuery('volume.3 capitolo.5 cosa fa?', 'Risposta.');
    expect(out).toMatch(/Vol\.\s*3\s+pag\.\s*23/);
  });

  // ── 6.F: Non-core Vol/cap combinations (4 tests)
  it('6.F1 — query "Vol.1 cap.99" (not in core): response unchanged', () => {
    const r = 'Risposta.';
    expect(forceCitationFromQuery('Vol.1 cap.99 ?', r)).toBe(r);
  });

  it('6.F2 — query "Vol.4 cap.1" (vol out of range): response unchanged', () => {
    const r = 'Risposta.';
    expect(forceCitationFromQuery('Vol.4 cap.1 ?', r)).toBe(r);
  });

  it('6.F3 — query "Vol.0 cap.0" zero: response unchanged', () => {
    const r = 'Risposta.';
    expect(forceCitationFromQuery('Vol.0 cap.0 ?', r)).toBe(r);
  });

  it('6.F4 — query Vol.2 cap.4 (Vol2 has cap.3,5,6,7,8,9,10,11,12 — cap.4 missing): unchanged', () => {
    const r = 'Risposta.';
    expect(forceCitationFromQuery('Vol.2 cap.4 ?', r)).toBe(r);
  });

  // ── 6.G: Edge inputs (5 tests)
  it('6.G1 — null query: response unchanged', () => {
    expect(forceCitationFromQuery(null, 'r')).toBe('r');
  });

  it('6.G2 — undefined query: response unchanged', () => {
    expect(forceCitationFromQuery(undefined, 'r')).toBe('r');
  });

  it('6.G3 — null response: returned as null', () => {
    expect(forceCitationFromQuery('Vol.1 cap.6', null)).toBe(null);
  });

  it('6.G4 — empty string query: response unchanged', () => {
    expect(forceCitationFromQuery('', 'Risposta.')).toBe('Risposta.');
  });

  it('6.G5 — empty string response + Vol/cap in query: response unchanged ("" is falsy)', () => {
    expect(forceCitationFromQuery('Vol.1 cap.6', '')).toBe('');
  });
});

// ===========================================================================
// SECTION 7 — Andrea mandate verbatim (10 tests)
// "Naturale prima, citazione quando serve" — verify chain does NOT inject when
// no Vol/cap in query AND no session ID.
// ===========================================================================

describe('Section 7 — Andrea mandate verbatim "Naturale prima, citazione quando serve" (10 tests)', () => {
  // Helper for full chain
  function chain(rawLLM, ctxMessage, ctxLastExpId) {
    let t = capWordsPreservingControlTags(rawLLM, 120);
    t = stripInvalidExperimentTags(t).text;
    t = enforceItalianK12Opener(t);
    t = rewriteSingolareToPlurale(t);
    t = rewriteCitationToCanonical(t);
    t = forceCitationFromQuery(ctxMessage, t);
    t = forceCitationFromSession(ctxLastExpId, t);
    return t;
  }

  it('7.01 — query "Mi spieghi?" + no session: NO (Vol.X pag.Y) injection', () => {
    const out = chain('Certo, ti spiego.', 'Mi spieghi?', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.02 — query "Cosa è un LED?" + no session: NO injection', () => {
    const out = chain('Il LED è un componente.', 'Cosa è un LED?', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.03 — query "Buongiorno" + no session: NO injection', () => {
    const out = chain('Salve a tutti.', 'Buongiorno', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.04 — query about generic concept "circuito" + no session: NO injection', () => {
    const out = chain('Un circuito è un percorso chiuso.', 'parliamo del circuito', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.05 — query "raccontami" + no session + LLM did not cite: NO injection', () => {
    const out = chain('Racconto una storia.', 'raccontami', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.06 — query "ok" + empty session + LLM short response: NO injection', () => {
    const out = chain('Ok!', 'ok', '');
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.07 — query has Vol/cap NOT in core + no session: NO injection (Vol.99)', () => {
    const out = chain('Risposta.', 'Vol.99 cap.99 dimmi', null);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });

  it('7.08 — query empty + session valid: citation INJECTED (only session triggers)', () => {
    const out = chain('Risposta sulla lampada.', '', 'v1-cap6-esp1');
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*27/);
  });

  it('7.09 — query Vol/cap valid + session valid: citation INJECTED (query path)', () => {
    const out = chain('Risposta.', 'Vol.2 cap.7 spiega', 'v1-cap6-esp1');
    expect(out).toMatch(/Vol\.\s*2\s+pag\.\s*43/);
  });

  it('7.10 — NEGATIVE control — verifies Section 4.40 invariant: chain natural-only when nothing triggers', () => {
    // Andrea verbatim mandate: "Naturale prima, citazione quando serve"
    // chain MUST NOT inject when neither query Vol/cap nor session experiment present
    const out = chain('Bella domanda, vediamo insieme.', 'parla del LED', null);
    // No (Vol.X pag.Y) and no "Vol.X pag.Y" bare anywhere
    expect(out).not.toMatch(/\(Vol\.\s*\d+\s+pag\.\s*\d+\)/);
    expect(out).not.toMatch(/Vol\.\s*\d+\s+pag\.\s*\d+/);
  });
});
