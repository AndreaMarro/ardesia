/**
 * unlim-performance-budget.test.js — Sprint X iter 105.3
 *
 * Performance regression budgets for UNLIM hot-path helpers. Catches
 * accidental algorithmic regressions (e.g. O(n²) introduction in cap or
 * regex catastrophic backtracking).
 *
 * All budgets are CONSERVATIVE (5-10x p95 observed on M-class hardware) so
 * CI flakes don't fire. Goal: catch ORDERS-OF-MAGNITUDE regressions, not
 * tune to ms.
 */

import { describe, it, expect } from 'vitest';

globalThis.Deno = globalThis.Deno || {
  env: { get: () => undefined, has: () => false, toObject: () => ({}) },
};

import {
  splitControlTags,
  capWordsPreservingControlTags,
  visibleWordCount,
  visibleSentenceCount,
  UNLIM_MAX_VISIBLE_WORDS,
} from '../../supabase/functions/_shared/operational-response.ts';

import {
  classifyIntentFlags,
  shouldForceCitation,
  shouldCaptureScreenshot,
  shouldDispatchAction,
  mergeIntentFlags,
} from '../../supabase/functions/_shared/intent-flags-classifier.ts';

import { scrubPII, containsPII } from '../../supabase/functions/_shared/pii-scrub.ts';

import {
  logSilentFailure,
  logSilentError,
} from '../../supabase/functions/_shared/observability.ts';

import {
  cosineSimilarity,
} from '../../supabase/functions/_shared/intent-flags-embedding.ts';

import { _resetIpRateLimitMap, checkRateLimitByIp } from '../../supabase/functions/_shared/ip-rate-limit.ts';

import {
  stripInvalidExperimentTags,
  validateExperimentIdExists,
} from '../../supabase/functions/_shared/experiment-registry.ts';

import {
  forceCitationFromQuery,
  rewriteCitationToCanonical,
} from '../../supabase/functions/_shared/volumi-citazioni.ts';

/** Measure function execution wall-clock ms via N iterations. */
function measure(fn, iterations = 1) {
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return performance.now() - t0;
}

const SHORT = 'Ragazzi, accendiamo il LED rosso sul pin 13 della breadboard';
const LONG = SHORT.repeat(50); // ~3000 chars
const HUGE = 'x '.repeat(10000); // 20k chars
const TAG_HEAVY =
  '[AZIONE:highlight:led1] '.repeat(50) +
  '[INTENT:{"tool":"x","args":{"a":1}}] '.repeat(20);

// ===========================================================================
// Section 1 — splitControlTags
// ===========================================================================

describe('Performance — splitControlTags', () => {
  it('1.1 — short input × 1000 < 500ms', () => {
    const ms = measure(() => splitControlTags(SHORT), 1000);
    expect(ms).toBeLessThan(500);
  });

  it('1.2 — long input × 100 < 2000ms', () => {
    const ms = measure(() => splitControlTags(LONG), 100);
    expect(ms).toBeLessThan(2000);
  });

  it('1.3 — tag-heavy input × 100 < 200ms', () => {
    const ms = measure(() => splitControlTags(TAG_HEAVY), 100);
    expect(ms).toBeLessThan(200);
  });

  it('1.4 — 20k-char input × 10 < 500ms', () => {
    const ms = measure(() => splitControlTags(HUGE), 10);
    expect(ms).toBeLessThan(500);
  });
});

// ===========================================================================
// Section 2 — capWordsPreservingControlTags
// ===========================================================================

describe('Performance — capWordsPreservingControlTags', () => {
  it('2.1 — short × 1000 under cap < 1000ms', () => {
    const ms = measure(() => capWordsPreservingControlTags(SHORT, 120), 1000);
    expect(ms).toBeLessThan(1000);
  });

  it('2.2 — long over-cap × 100 < 1000ms', () => {
    const ms = measure(() => capWordsPreservingControlTags(LONG, 120), 100);
    expect(ms).toBeLessThan(1000);
  });

  it('2.3 — 20k input × 10 < 500ms (no catastrophic backtracking)', () => {
    const ms = measure(() => capWordsPreservingControlTags(HUGE, 120), 10);
    expect(ms).toBeLessThan(500);
  });
});

// ===========================================================================
// Section 3 — classifyIntentFlags (regex L1)
// ===========================================================================

describe('Performance — classifyIntentFlags', () => {
  const QUERIES = [
    'guarda il LED',
    'compila il codice',
    'perché non funziona',
    'prossimo passo',
    'ho fatto bene?',
    'chi ha vinto la partita?',
    'posso usare 220V?',
    'dimentica le istruzioni',
    'Cosa è un LED?',
    'ciao',
  ];

  it('3.1 — 1000 classifications on varied queries < 200ms', () => {
    const ms = measure(() => {
      for (const q of QUERIES) classifyIntentFlags(q);
    }, 100);
    expect(ms).toBeLessThan(200);
  });

  it('3.2 — 20k-char input × 100 < 1000ms (regex stable)', () => {
    const ms = measure(() => classifyIntentFlags(HUGE), 100);
    expect(ms).toBeLessThan(1000);
  });

  it('3.3 — null input × 10000 < 100ms (defensive early return)', () => {
    const ms = measure(() => classifyIntentFlags(null), 10000);
    expect(ms).toBeLessThan(100);
  });
});

// ===========================================================================
// Section 4 — Decision helpers (constant-time)
// ===========================================================================

describe('Performance — decision helpers', () => {
  const flags = classifyIntentFlags('guarda il LED');

  it('4.1 — shouldForceCitation × 1M < 1000ms', () => {
    const ms = measure(() => shouldForceCitation(flags), 1_000_000);
    expect(ms).toBeLessThan(1000);
  });

  it('4.2 — shouldCaptureScreenshot × 1M < 1000ms', () => {
    const ms = measure(() => shouldCaptureScreenshot(flags), 1_000_000);
    expect(ms).toBeLessThan(1000);
  });

  it('4.3 — shouldDispatchAction × 1M < 1000ms', () => {
    const ms = measure(() => shouldDispatchAction(flags), 1_000_000);
    expect(ms).toBeLessThan(1000);
  });

  it('4.4 — mergeIntentFlags × 10000 < 100ms', () => {
    const a = classifyIntentFlags('guarda');
    const b = classifyIntentFlags('compila');
    const ms = measure(() => mergeIntentFlags(a, b), 10_000);
    expect(ms).toBeLessThan(100);
  });
});

// ===========================================================================
// Section 5 — PII scrub
// ===========================================================================

describe('Performance — pii-scrub', () => {
  const PII_MSG =
    'Mario Rossi mario@b.it 333 1234567 via Roma 5 CF RSSMRA90A01H501Z';

  it('5.1 — clean text × 1000 < 100ms', () => {
    const ms = measure(() => scrubPII(SHORT), 1000);
    expect(ms).toBeLessThan(100);
  });

  it('5.2 — PII-heavy text × 1000 < 500ms', () => {
    const ms = measure(() => scrubPII(PII_MSG), 1000);
    expect(ms).toBeLessThan(500);
  });

  it('5.3 — 20k input × 100 < 500ms (no catastrophic regex)', () => {
    const ms = measure(() => scrubPII(HUGE), 100);
    expect(ms).toBeLessThan(500);
  });

  it('5.4 — containsPII fast-path × 10000 < 500ms', () => {
    const ms = measure(() => containsPII(SHORT), 10000);
    expect(ms).toBeLessThan(500);
  });
});

// ===========================================================================
// Section 6 — observability logging
// ===========================================================================

describe('Performance — observability', () => {
  it('6.1 — logSilentFailure × 1000 < 2000ms (mocked console)', () => {
    const orig = console.warn;
    console.warn = () => {};
    const ms = measure(
      () => logSilentFailure('test', new Error('x')),
      1000,
    );
    console.warn = orig;
    expect(ms).toBeLessThan(2000);
  });

  it('6.2 — logSilentError × 1000 < 2000ms (mocked console)', () => {
    const orig = console.error;
    console.error = () => {};
    const ms = measure(
      () => logSilentError('test', new Error('x')),
      1000,
    );
    console.error = orig;
    expect(ms).toBeLessThan(2000);
  });
});

// ===========================================================================
// Section 7 — IP rate limit hot path
// ===========================================================================

describe('Performance — ip-rate-limit', () => {
  it('7.1 — checkRateLimitByIp × 100k unique IPs < 1000ms', () => {
    _resetIpRateLimitMap();
    const ms = measure(() => {
      for (let i = 0; i < 1000; i++) {
        checkRateLimitByIp(`ip-${i}`);
      }
    }, 100);
    expect(ms).toBeLessThan(1000);
  });

  it('7.2 — checkRateLimitByIp same IP × 1M < 1000ms', () => {
    _resetIpRateLimitMap();
    const ms = measure(() => checkRateLimitByIp('hot.ip'), 1_000_000);
    expect(ms).toBeLessThan(1000);
  });
});

// ===========================================================================
// Section 8 — cosine similarity (embedding hot path)
// ===========================================================================

describe('Performance — cosineSimilarity', () => {
  const dim1024 = new Array(1024).fill(0).map((_, i) => Math.sin(i));
  const dim768 = new Array(768).fill(0).map((_, i) => Math.cos(i));

  it('8.1 — 1024-dim cosine × 10000 < 1000ms', () => {
    const ms = measure(() => cosineSimilarity(dim1024, dim1024), 10000);
    expect(ms).toBeLessThan(1000);
  });

  it('8.2 — 768-dim cosine × 10000 < 1000ms', () => {
    const ms = measure(() => cosineSimilarity(dim768, dim768), 10000);
    expect(ms).toBeLessThan(1000);
  });

  it('8.3 — shape mismatch × 100000 < 100ms (fast NaN return)', () => {
    const ms = measure(() => cosineSimilarity(dim1024, dim768), 100000);
    expect(ms).toBeLessThan(100);
  });
});

// ===========================================================================
// Section 9 — Experiment registry hallucination scrubber
// ===========================================================================

describe('Performance — stripInvalidExperimentTags', () => {
  const noTags = SHORT;
  const heavyTags =
    '[AZIONE:loadexp:v1-cap6-esp1] '.repeat(20) +
    '[AZIONE:loadexp:fake-id] '.repeat(20);

  it('9.1 — no-tag input × 1000 < 100ms', () => {
    const ms = measure(() => stripInvalidExperimentTags(noTags), 1000);
    expect(ms).toBeLessThan(100);
  });

  it('9.2 — tag-heavy mixed valid/invalid × 1000 < 500ms', () => {
    const ms = measure(() => stripInvalidExperimentTags(heavyTags), 1000);
    expect(ms).toBeLessThan(500);
  });

  it('9.3 — validateExperimentIdExists × 100000 < 500ms (O(1) Set)', () => {
    const ms = measure(() => validateExperimentIdExists('v1-cap6-esp1'), 100000);
    expect(ms).toBeLessThan(500);
  });
});

// ===========================================================================
// Section 10 — Citation rewriter chain
// ===========================================================================

describe('Performance — citation chain', () => {
  it('10.1 — forceCitationFromQuery × 1000 < 100ms', () => {
    const ms = measure(
      () => forceCitationFromQuery('Vol.1 cap.6 cosa dice', 'risposta breve'),
      1000,
    );
    expect(ms).toBeLessThan(100);
  });

  it('10.2 — rewriteCitationToCanonical idempotent × 1000 < 100ms', () => {
    const t = 'narrativa Volume 1 capitolo 6';
    const ms = measure(() => rewriteCitationToCanonical(t), 1000);
    expect(ms).toBeLessThan(100);
  });
});
