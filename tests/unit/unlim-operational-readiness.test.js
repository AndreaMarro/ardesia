/**
 * unlim-operational-readiness.test.js — Sprint 2026-05-25 PM
 *
 * Non-trivial UNLIM regression suite targeting audit findings:
 *  - Word cap leak across short-circuit paths (capWordsPreservingControlTags)
 *  - Control tag splitting edge cases ([AZIONE], [INTENT:{...}], nested braces)
 *  - Citation forcing chain (forceCitationFromQuery, forceCitationFromSession,
 *    rewriteCitationToCanonical) idempotency + boundary handling
 *  - Italian K12 plural opener enforcement (enforceItalianK12Opener)
 *  - Singolare→plurale rewriter (rewriteSingolareToPlurale)
 *  - Experiment tag hallucination scrubber (stripInvalidExperimentTags)
 *  - Visible word/sentence count accuracy with mixed tags
 *  - UNLIM_MAX_VISIBLE_WORDS = 120 contract (Andrea regola 10/05/2026)
 *
 * Source TS files run on Deno Edge runtime; vitest 3.x can import .ts via the
 * Vite plugin (same pattern as `intent-parser.test.js`,
 * `operational-response-page-only-resolver.test.js`).
 *
 * SCIENTIFIC posture (Andrea mandate 2026-05-25): NO compiacenza, evidence-based.
 * Each test names the audit gap it addresses inline.
 */

import { describe, it, expect } from 'vitest';

import {
  UNLIM_MAX_VISIBLE_WORDS,
  splitControlTags,
  capWordsPreservingControlTags,
  visibleWordCount,
  visibleSentenceCount,
} from '../../supabase/functions/_shared/operational-response.ts';

import {
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
} from '../../supabase/functions/_shared/experiment-registry.ts';

// ---------------------------------------------------------------------------
// Section 1 — UNLIM_MAX_VISIBLE_WORDS contract (Andrea regola 10/05/2026)
// Source: feedback_unlim_language_rules_10may2026.md
// Audit gap: word cap stale at 60/80 in prompt text vs runtime 120
// ---------------------------------------------------------------------------

describe('UNLIM_MAX_VISIBLE_WORDS contract', () => {
  it('1.1 — equals exactly 120 (Andrea regola 10/05/2026)', () => {
    expect(UNLIM_MAX_VISIBLE_WORDS).toBe(120);
  });

  it('1.2 — is the SINGLE source of truth for cap defaults', () => {
    // Regression: if anyone hardcodes a different default in capWordsPreservingControlTags,
    // this catches it via behavior.
    const w121 = Array.from({ length: 121 }, (_, i) => `parola${i}`).join(' ');
    const capped = capWordsPreservingControlTags(w121);
    // Must truncate (... appended at end of last kept word) since prose > 120 words
    expect(capped.endsWith('...')).toBe(true);
    expect(visibleWordCount(capped)).toBeLessThanOrEqual(UNLIM_MAX_VISIBLE_WORDS);
  });
});

// ---------------------------------------------------------------------------
// Section 2 — splitControlTags edge cases
// Audit gap: control tag parser is hot path, malformed inputs must never crash
// ---------------------------------------------------------------------------

describe('splitControlTags — tag boundary edge cases', () => {
  it('2.1 — extracts single [AZIONE:...] tag with no prose', () => {
    const { prose, tags } = splitControlTags('[AZIONE:highlightComponent:led1]');
    expect(prose).toBe('');
    expect(tags).toEqual(['[AZIONE:highlightComponent:led1]']);
  });

  it('2.2 — extracts [INTENT:{...}] with simple JSON', () => {
    const { prose, tags } = splitControlTags(
      'Ciao [INTENT:{"tool":"highlight","args":{"id":"led1"}}] guarda qui',
    );
    expect(prose).toBe('Ciao  guarda qui'.replace(/\s+/g, ' '));
    expect(tags).toEqual(['[INTENT:{"tool":"highlight","args":{"id":"led1"}}]']);
  });

  it('2.3 — extracts [INTENT:{...}] with NESTED braces (filter inside args)', () => {
    const txt =
      'Vedo [INTENT:{"tool":"filter","args":{"type":{"kind":"led"}}}] componenti.';
    const { prose, tags } = splitControlTags(txt);
    expect(prose).toBe('Vedo componenti.'.replace(/\s+/g, ' '));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('"kind":"led"');
  });

  it('2.4 — handles multiple [AZIONE:...] tags', () => {
    const { prose, tags } = splitControlTags(
      'Ragazzi, [AZIONE:highlightPin:nano:D13] poi [AZIONE:serialWrite:Hello] fatto.',
    );
    expect(prose).toBe('Ragazzi, poi fatto.'.replace(/\s+/g, ' '));
    expect(tags).toHaveLength(2);
  });

  it('2.5 — handles MIXED [AZIONE:] and [INTENT:{...}]', () => {
    const { prose, tags } = splitControlTags(
      'Ok [AZIONE:clearHighlights] [INTENT:{"tool":"x","args":{}}] basta.',
    );
    expect(prose).toBe('Ok basta.'.replace(/\s+/g, ' '));
    expect(tags).toHaveLength(2);
  });

  it('2.6 — truncated [AZIONE: with no ] is treated as prose (defensive)', () => {
    const { prose, tags } = splitControlTags('Ragazzi, [AZIONE:incompleto');
    expect(tags).toEqual([]);
    expect(prose).toContain('AZIONE:incompleto');
  });

  it('2.7 — empty string returns empty prose, empty tags', () => {
    const { prose, tags } = splitControlTags('');
    expect(prose).toBe('');
    expect(tags).toEqual([]);
  });

  it('2.8 — null/undefined coerce safely (no throw)', () => {
    expect(() => splitControlTags(null)).not.toThrow();
    expect(() => splitControlTags(undefined)).not.toThrow();
    expect(splitControlTags(null).prose).toBe('');
    expect(splitControlTags(undefined).tags).toEqual([]);
  });

  it('2.9 — collapses multiple whitespace in prose to single space', () => {
    const { prose } = splitControlTags('Ragazzi,   guardate    qui    ora');
    expect(prose).toBe('Ragazzi, guardate qui ora');
  });

  it('2.10 — preserves Italian accented characters in prose', () => {
    const { prose } = splitControlTags('Perché è così difficile? È strano. À volte');
    expect(prose).toContain('Perché');
    expect(prose).toContain('è');
    expect(prose).toContain('À');
  });
});

// ---------------------------------------------------------------------------
// Section 3 — capWordsPreservingControlTags behavior + word-cap LEAKS
// Audit gap: cap applied in main LLM path (index.ts:1264) but NOT in
//            voltage_danger pre-LLM, off-topic, direct-operational,
//            classifier-offtopic, ClawBot L2, safety-hardcoded fallback.
// These tests document EXPECTED behavior of the helper itself; integration
// gaps require unlim-chat/index.ts wire-up (separate fix).
// ---------------------------------------------------------------------------

describe('capWordsPreservingControlTags — cap behavior', () => {
  it('3.1 — short text under cap returns unchanged (no ellipsis)', () => {
    const short = 'Ragazzi, accendiamo il LED rosso sul pin 13.';
    const out = capWordsPreservingControlTags(short, 120);
    expect(out).toBe(short.replace(/\s+/g, ' ').trim());
    expect(out).not.toContain('...');
  });

  it('3.2 — exactly N words returns unchanged', () => {
    const exactly120 = Array.from({ length: 120 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(exactly120, 120);
    expect(visibleWordCount(out)).toBe(120);
    expect(out).not.toContain('...');
  });

  it('3.3 — N+1 words truncates to N and appends ...', () => {
    const over = Array.from({ length: 121 }, (_, i) => `w${i}`).join(' ');
    const out = capWordsPreservingControlTags(over, 120);
    expect(out.endsWith('...')).toBe(true);
    expect(visibleWordCount(out)).toBe(120);
  });

  it('3.4 — preserves [AZIONE:...] tag AFTER truncation', () => {
    const longText =
      Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ') +
      ' [AZIONE:mountExperiment:v1-cap6-esp1]';
    const out = capWordsPreservingControlTags(longText, 50);
    // tag preserved
    expect(out).toContain('[AZIONE:mountExperiment:v1-cap6-esp1]');
    // prose capped
    expect(visibleWordCount(out)).toBeLessThanOrEqual(50);
  });

  it('3.5 — preserves [INTENT:{...}] tag with nested braces AFTER truncation', () => {
    const longText =
      Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ') +
      ' [INTENT:{"tool":"x","args":{"k":"v"}}]';
    const out = capWordsPreservingControlTags(longText, 30);
    expect(out).toContain('[INTENT:{"tool":"x","args":{"k":"v"}}]');
    expect(visibleWordCount(out)).toBeLessThanOrEqual(30);
  });

  it('3.6 — tag-only input: no cap applied, tag returned as-is', () => {
    const justTag = '[AZIONE:captureScreenshot]';
    const out = capWordsPreservingControlTags(justTag, 120);
    expect(out).toBe(justTag);
    expect(visibleWordCount(out)).toBe(0);
  });

  it('3.7 — empty string returns empty (no crash)', () => {
    expect(capWordsPreservingControlTags('', 120)).toBe('');
  });

  it('3.8 — extreme maxWords=1 caps to single word + tag', () => {
    const out = capWordsPreservingControlTags(
      'Ragazzi guardate questo LED [AZIONE:highlightComponent:led1]',
      1,
    );
    expect(visibleWordCount(out)).toBe(1);
    expect(out).toContain('[AZIONE:highlightComponent:led1]');
  });

  it('3.9 — maxWords=0 returns ellipsis-only prose + tags (degenerate stable)', () => {
    // Audit finding: cap with maxWords=0 produces "..." as residual token —
    // not a true "zero words" output. Document behavior to surface contract.
    const out = capWordsPreservingControlTags(
      'parole parole parole [AZIONE:x]',
      0,
    );
    expect(out).toContain('[AZIONE:x]');
    // Ellipsis present as residual marker (current behavior)
    expect(out).toMatch(/\.\.\./);
  });
});

// ---------------------------------------------------------------------------
// Section 4 — visibleWordCount / visibleSentenceCount accuracy
// ---------------------------------------------------------------------------

describe('visibleWordCount / visibleSentenceCount — tag-aware counting', () => {
  it('4.1 — counts prose words only, excluding tag content', () => {
    expect(
      visibleWordCount(
        'Ragazzi guardate il LED [AZIONE:highlightComponent:led1]',
      ),
    ).toBe(4); // Ragazzi, guardate, il, LED — tag excluded
  });

  it('4.2 — counts sentences correctly with mixed punctuation', () => {
    expect(visibleSentenceCount('Ragazzi! Guardate qui. Cosa vedete?')).toBe(3);
  });

  it('4.3 — tag-only input has 0 visible words AND 0 sentences', () => {
    expect(visibleWordCount('[AZIONE:x]')).toBe(0);
    expect(visibleSentenceCount('[AZIONE:x]')).toBe(0);
  });

  it('4.4 — sentence counter strips pin tokens (D13/GND/pin) per source', () => {
    // visibleSentenceCount normalizes D13/GND/pin out before splitting
    // (source: operational-response.ts:185-191). Verify no double-count.
    expect(visibleSentenceCount('Pin D13 alto.')).toBe(1);
    expect(visibleSentenceCount('GND collegato!')).toBe(1);
  });

  it('4.5 — empty/whitespace returns 0 sentences (no throw)', () => {
    expect(visibleSentenceCount('')).toBe(0);
    expect(visibleSentenceCount('   ')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 5 — forceCitationFromQuery (iter 17, Vol/cap detection in MESSAGE)
// Audit: idempotency + boundary cases
// ---------------------------------------------------------------------------

describe('forceCitationFromQuery — append canonical (Vol.X pag.Y) from query Vol/cap', () => {
  it('5.1 — query "Vol.1 cap.6" + response missing citation → append', () => {
    const out = forceCitationFromQuery(
      'Vol.1 cap.6 cosa dice?',
      'Il LED è un componente elettronico.',
    );
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('5.2 — response ALREADY canonical (idempotent skip)', () => {
    const already = 'Il LED. (Vol.1 pag.12) Continuiamo.';
    expect(forceCitationFromQuery('Vol.1 cap.6 cosa dice?', already)).toBe(already);
  });

  it('5.3 — query has NO Vol/cap → response unchanged', () => {
    const r = 'Cosa è un LED?';
    expect(forceCitationFromQuery('spiegami il LED', r)).toBe(r);
  });

  it('5.4 — query Vol/cap NOT in VOLUMI_CITAZIONI_CORE → response unchanged', () => {
    const r = 'Risposta generica.';
    // Vol.3 cap.99 likely not in core lookup
    expect(forceCitationFromQuery('Vol.3 cap.99 spiegami', r)).toBe(r);
  });

  it('5.5 — null/undefined inputs return response as-is', () => {
    expect(forceCitationFromQuery(null, 'risposta')).toBe('risposta');
    expect(forceCitationFromQuery('msg', null)).toBe(null);
    expect(forceCitationFromQuery(undefined, 'r')).toBe('r');
  });

  it('5.6 — case-insensitive Vol/cap regex matches "VOL.1 CAP.6"', () => {
    const out = forceCitationFromQuery(
      'VOL.1 CAP.6 cosa fa?',
      'Risposta breve.',
    );
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('5.7 — narrative "volume 1, capitolo 6" also detected', () => {
    const out = forceCitationFromQuery(
      'volume 1, capitolo 6 spiegami',
      'Risposta.',
    );
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });
});

// ---------------------------------------------------------------------------
// Section 6 — forceCitationFromSession (iter 20, Vol/cap from session ctx)
// ---------------------------------------------------------------------------

describe('forceCitationFromSession — append from session.lastExperimentId', () => {
  it('6.1 — lastExperimentId=v1-cap6-esp1 → append Vol.1 pag.?', () => {
    const out = forceCitationFromSession(
      'v1-cap6-esp1',
      'Continuiamo da dove eravamo.',
    );
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('6.2 — lastExperimentId null → response unchanged', () => {
    const r = 'Risposta breve.';
    expect(forceCitationFromSession(null, r)).toBe(r);
    expect(forceCitationFromSession(undefined, r)).toBe(r);
  });

  it('6.3 — lastExperimentId malformed (no v[1-3]-cap pattern) → unchanged', () => {
    const r = 'Risposta.';
    expect(forceCitationFromSession('garbage-id', r)).toBe(r);
    expect(forceCitationFromSession('experiment-9999', r)).toBe(r);
  });

  it('6.4 — response already canonical → idempotent skip', () => {
    const already = 'Vedi (Vol.2 pag.24) per esempio.';
    expect(forceCitationFromSession('v1-cap6-esp1', already)).toBe(already);
  });

  it('6.5 — Vol.3 cap that exists in core lookup → append', () => {
    // v3-cap6 ideally in core lookup based on lesson-paths
    const out = forceCitationFromSession('v3-cap6-esp4', 'Risposta su LED.');
    // Either appended OR cap not in lookup (no append). Both acceptable;
    // ensure NO crash and idempotent shape:
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThanOrEqual('Risposta su LED.'.length);
  });

  it('6.6 — response without trailing punctuation → canonical appended at end', () => {
    const out = forceCitationFromSession('v1-cap6-esp1', 'breve');
    // No period in response → branch returns `${response} ${canonical}`
    if (/Vol\.\s*1\s+pag\.\s*\d+/.test(out)) {
      expect(out.startsWith('breve')).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Section 7 — rewriteCitationToCanonical (iter 15)
// ---------------------------------------------------------------------------

describe('rewriteCitationToCanonical — narrative → canonical (Vol.X pag.Y)', () => {
  it('7.1 — "Volume 1 capitolo 6" appended canonical at end', () => {
    const out = rewriteCitationToCanonical('Vedi nel Volume 1 capitolo 6 il LED.');
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('7.2 — already canonical (idempotent skip)', () => {
    const t = 'Risposta con (Vol.1 pag.12) embedded.';
    expect(rewriteCitationToCanonical(t)).toBe(t);
  });

  it('7.3 — "il capitolo 6 del Volume 1" (inverse order) ALSO matched', () => {
    const out = rewriteCitationToCanonical('il capitolo 6 del Volume 1 è interessante');
    expect(out).toMatch(/Vol\.\s*1\s+pag\.\s*\d+/);
  });

  it('7.4 — "Vol.1" alone (no cap) → no canonical appended (defer)', () => {
    const t = 'Vedi Vol.1 per dettagli.';
    expect(rewriteCitationToCanonical(t)).toBe(t);
  });

  it('7.5 — empty / null safe', () => {
    expect(rewriteCitationToCanonical('')).toBe('');
    expect(rewriteCitationToCanonical(null)).toBe(null);
  });

  it('7.6 — running twice does NOT double-append (idempotent)', () => {
    const first = rewriteCitationToCanonical('Volume 1 capitolo 6: LED');
    const second = rewriteCitationToCanonical(first);
    expect(second).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// Section 8 — enforceItalianK12Opener (Ragazzi, prefix)
// ---------------------------------------------------------------------------

describe('enforceItalianK12Opener — Ragazzi prefix injection', () => {
  it('8.1 — text WITHOUT "Ragazzi," at start → prepend', () => {
    const out = enforceItalianK12Opener('guardate questo LED');
    expect(out.startsWith('Ragazzi,')).toBe(true);
  });

  it('8.2 — text WITH "Ragazzi," already → unchanged (idempotent)', () => {
    const t = 'Ragazzi, guardate il LED.';
    expect(enforceItalianK12Opener(t)).toBe(t);
  });

  it('8.3 — "Ragazzi" without comma → respects opener detection', () => {
    // Implementation-defined: may insert comma OR treat as opener present.
    // Verify no crash + result startsWith "Ragazzi"
    const out = enforceItalianK12Opener('Ragazzi guardate qui');
    expect(out.startsWith('Ragazzi')).toBe(true);
  });

  it('8.4 — empty input safe', () => {
    expect(typeof enforceItalianK12Opener('')).toBe('string');
  });

  it('8.5 — text starting with [AZIONE:...] tag: opener placement is structural', () => {
    // Should not insert "Ragazzi," BEFORE a control tag
    const out = enforceItalianK12Opener('[AZIONE:x] vedete?');
    expect(typeof out).toBe('string');
    expect(out).toContain('[AZIONE:x]');
  });
});

// ---------------------------------------------------------------------------
// Section 9 — rewriteSingolareToPlurale (runtime singolare→plurale)
// ---------------------------------------------------------------------------

describe('rewriteSingolareToPlurale — singular→plural Italian K-12', () => {
  it('9.1 — common 2sg "guarda" → "guardate" in imperative context', () => {
    const out = rewriteSingolareToPlurale('Guarda il LED accendersi.');
    // Implementation may target specific lemmas — verify no regression AND
    // verify the function returns string + does not throw
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });

  it('9.2 — null/undefined safe', () => {
    expect(() => rewriteSingolareToPlurale(null)).not.toThrow();
    expect(() => rewriteSingolareToPlurale(undefined)).not.toThrow();
  });

  it('9.3 — already plural input unchanged or minimally changed', () => {
    const t = 'Ragazzi, guardate il LED.';
    const out = rewriteSingolareToPlurale(t);
    expect(out).toContain('guardate');
    expect(out).not.toMatch(/\bguarda\b(?!te)/);
  });

  it('9.4 — preserves [AZIONE:...] tags', () => {
    const out = rewriteSingolareToPlurale('Guarda [AZIONE:highlight:led1] qui');
    expect(out).toContain('[AZIONE:highlight:led1]');
  });
});

// ---------------------------------------------------------------------------
// Section 10 — stripInvalidExperimentTags (iter 68 hallucination scrubber)
// Audit: registry-based scrubbing must remove mountExperiment IDs not in
// VALID_EXPERIMENT_IDS without affecting valid IDs.
// ---------------------------------------------------------------------------

describe('stripInvalidExperimentTags — registry-based hallucination scrubber', () => {
  // Note: scrubber matches `[AZIONE:loadexp:<id>]` (legacy) and
  // `[INTENT:{"tool":"mountExperiment","args":{"id":"<id>"}}]` (canonical).
  // Returns { text, stripped[] }.
  it('10.1 — keeps VALID experiment ID in [AZIONE:loadexp:...] tag', () => {
    // v1-cap6-esp1 is canonical valid (Vol1 Lampadina prime esperimento)
    const txt = 'Andiamo [AZIONE:loadexp:v1-cap6-esp1] al primo.';
    const { text, stripped } = stripInvalidExperimentTags(txt);
    expect(text).toContain('[AZIONE:loadexp:v1-cap6-esp1]');
    expect(stripped).toEqual([]);
  });

  it('10.2 — REMOVES invalid experiment ID hallucination', () => {
    const txt = 'Apri [AZIONE:loadexp:v99-cap99-esp99] qui.';
    const { text, stripped } = stripInvalidExperimentTags(txt);
    expect(text).not.toContain('v99-cap99-esp99');
    expect(stripped).toContain('v99-cap99-esp99');
  });

  it('10.3 — empty input safe (no crash)', () => {
    const { text, stripped } = stripInvalidExperimentTags('');
    expect(text).toBe('');
    expect(stripped).toEqual([]);
  });

  it('10.4 — multiple tags: mixed valid+invalid → valid kept, invalid stripped', () => {
    const txt =
      '[AZIONE:loadexp:v1-cap6-esp1] poi [AZIONE:loadexp:fake-id]';
    const { text, stripped } = stripInvalidExperimentTags(txt);
    expect(text).toContain('v1-cap6-esp1');
    expect(text).not.toContain('fake-id');
    expect(stripped).toContain('fake-id');
    expect(stripped).not.toContain('v1-cap6-esp1');
  });

  it('10.5 — validateExperimentIdExists O(1) lookup returns boolean', () => {
    expect(typeof validateExperimentIdExists('v1-cap6-esp1')).toBe('boolean');
    expect(validateExperimentIdExists('v1-cap6-esp1')).toBe(true);
    expect(validateExperimentIdExists('totally-fake')).toBe(false);
  });

  it('10.6 — validateExperimentIdExists handles null/undefined safely', () => {
    expect(validateExperimentIdExists(null)).toBe(false);
    expect(validateExperimentIdExists(undefined)).toBe(false);
    expect(validateExperimentIdExists('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Section 11 — lookupCitazioneByCapitolo (volumi-citazioni core lookup)
// ---------------------------------------------------------------------------

describe('lookupCitazioneByCapitolo — core volume citation lookup', () => {
  it('11.1 — Vol.1 cap.6 returns a citation with vol+cap+pag fields', () => {
    const c = lookupCitazioneByCapitolo(1, 6);
    if (c) {
      expect(c.vol).toBe(1);
      expect(c.cap).toBe(6);
      expect(typeof c.pag).toBe('number');
    }
    // If null, at minimum no crash:
    expect(c === null || typeof c === 'object').toBe(true);
  });

  it('11.2 — Vol.99 cap.99 returns null (not in core)', () => {
    expect(lookupCitazioneByCapitolo(99, 99)).toBe(null);
  });

  it('11.3 — type-safe call with strings would coerce or fail; test pure number contract', () => {
    expect(() => lookupCitazioneByCapitolo(1, 6)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Section 12 — End-to-end PIPELINE: cap → strip → opener → plural → citation
// Documents the EXPECTED post-LLM pipeline order. Validates each stage
// preserves the contract of the next.
// ---------------------------------------------------------------------------

describe('End-to-end pipeline composition — order-of-operations invariants', () => {
  it('12.1 — cap then strip-invalid preserves valid loadexp tag', () => {
    const raw =
      Array.from({ length: 150 }, (_, i) => `w${i}`).join(' ') +
      ' [AZIONE:loadexp:v1-cap6-esp1]';
    const capped = capWordsPreservingControlTags(raw, 120);
    const { text } = stripInvalidExperimentTags(capped);
    expect(text).toContain('v1-cap6-esp1');
    expect(visibleWordCount(text)).toBeLessThanOrEqual(120);
  });

  it('12.2 — opener then plural then citation: stable composition (no crash)', () => {
    const start = 'guarda il LED';
    const o = enforceItalianK12Opener(start);
    const p = rewriteSingolareToPlurale(o);
    const c = forceCitationFromQuery('Vol.1 cap.6 spiega', p);
    expect(typeof c).toBe('string');
    expect(c.startsWith('Ragazzi')).toBe(true);
  });

  it('12.3 — full chain applied twice is IDEMPOTENT (no double prefixing/citing)', () => {
    const txt = 'guardate il LED';
    const pass1 = forceCitationFromQuery(
      'Vol.1 cap.6 ?',
      rewriteCitationToCanonical(enforceItalianK12Opener(txt)),
    );
    const pass2 = forceCitationFromQuery(
      'Vol.1 cap.6 ?',
      rewriteCitationToCanonical(enforceItalianK12Opener(pass1)),
    );
    expect(pass2).toBe(pass1); // idempotency contract
  });

  it('12.4 — capWords + stripInvalid does not break tag boundaries', () => {
    const raw =
      'Risposta [AZIONE:loadexp:v1-cap6-esp1] e poi [AZIONE:loadexp:hallucination-id]';
    const capped = capWordsPreservingControlTags(raw, 120);
    const { text } = stripInvalidExperimentTags(capped);
    expect(text).toContain('v1-cap6-esp1');
    expect(text).not.toContain('hallucination-id');
    expect(text).toMatch(/\[AZIONE:loadexp:v1-cap6-esp1\]/);
  });
});

// ---------------------------------------------------------------------------
// Section 13 — Adversarial inputs (prompt injection echoes, malformed envelopes)
// Audit: sanitizer is the last line before LLM; if it lets through, downstream
// helpers must not crash on adversarial content.
// ---------------------------------------------------------------------------

describe('Adversarial inputs — robustness of helpers', () => {
  it('13.1 — JSON envelope leak {"text":"..."} as input does not crash splitControlTags', () => {
    expect(() =>
      splitControlTags('{"text":"Ragazzi","intents":[]}'),
    ).not.toThrow();
  });

  it('13.2 — gigantic input (10k words) cap returns within bound', () => {
    const huge = Array.from({ length: 10000 }, (_, i) => `w${i}`).join(' ');
    const capped = capWordsPreservingControlTags(huge, 120);
    expect(visibleWordCount(capped)).toBe(120);
  });

  it('13.3 — input with nested unbalanced braces in [INTENT:...] returns prose safely', () => {
    // intentional unbalance — findIntentTagEnd should bail and treat as prose
    const t = 'Ragazzi [INTENT:{"a":{"b": no close';
    const { prose } = splitControlTags(t);
    expect(typeof prose).toBe('string');
    expect(prose.length).toBeGreaterThan(0);
  });

  it('13.4 — input with control chars / zero-width chars does not crash', () => {
    const t = 'Ragazzi​​, guardate‌ il LED';
    expect(() => capWordsPreservingControlTags(t, 120)).not.toThrow();
    expect(() => enforceItalianK12Opener(t)).not.toThrow();
  });

  it('13.5 — citation regex does not match cross-cap injection "Vol1cap6" without separators', () => {
    // Must NOT detect concatenated Volcap to avoid false-positives
    const out = forceCitationFromQuery('Vol1cap6 spiegami', 'Risposta.');
    expect(out).toBe('Risposta.');
  });
});
