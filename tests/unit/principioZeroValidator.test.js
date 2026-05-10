/**
 * Tests for validatePrincipioZero
 * Target: supabase/functions/_shared/principio-zero-validator.ts
 *
 * Sprint S iter 2 — Task A — generator-test-opus | 2026-04-26
 *
 * Status: GREEN for 6/12 PZ rules implemented at runtime by generator-app-opus
 * (commit ?, capitoli-loader.ts + principio-zero-validator.ts already on disk).
 * The remaining 6 PZ rules (plurale_ragazzi, citation_vol_pag, analogia,
 * no_verbatim_3plus_frasi, off_topic_recognition, action_tags_when_expected,
 * humble_admission) are deferred to scripts/bench/score-unlim-quality.mjs
 * bench-time-only because they require fixture metadata (scenario, expectedActions,
 * RAG sources) that does NOT exist at runtime.
 *
 * Rules implemented at runtime (this file tests):
 *   1. imperativo_docente (HIGH) — line-start "Distribuisci|Spiega|Mostra..."
 *   2. singolare_studente (HIGH) — "devi|prova|guarda" (excluding inside «...»)
 *   3. max_words_120 (MEDIUM) — wc > 60
 *   4. no_citation_concept_intro (LOW, conditional via ctx.isConceptIntro)
 *   5. english_filler (LOW) — "let me|please|sure|of course|happy to"
 *   6. chatbot_preamble (LOW) — "Certo|Volentieri|Ottima/Bella domanda|Sicuramente"
 *
 * Rules deferred to bench-time scorer (it.todo here for traceability):
 *   - plurale_ragazzi, citation_vol_pag (unconditional), analogia,
 *     no_verbatim_3plus_frasi, off_topic_recognition, action_tags_when_expected,
 *     humble_admission, synthesis_not_verbatim
 */

import { describe, it, expect } from 'vitest';

let validatePrincipioZero;
let importError = null;

try {
  const mod = await import('../../supabase/functions/_shared/principio-zero-validator.ts');
  validatePrincipioZero = mod.validatePrincipioZero;
} catch (err) {
  importError = err;
}

function callOrFail(response, context) {
  if (typeof validatePrincipioZero !== 'function') {
    expect.fail(`validatePrincipioZero not yet implemented (importError=${importError?.message ?? 'symbol missing'})`);
  }
  return validatePrincipioZero(response, context);
}

describe('validatePrincipioZero — 6 runtime rules (Sprint S iter 2 Task A)', () => {
  it('exports validatePrincipioZero from principio-zero-validator', () => {
    if (importError) expect.fail(`import failed: ${importError.message}`);
    expect(typeof validatePrincipioZero).toBe('function');
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 1: imperativo_docente — line-start verb addressed to teacher
  // ───────────────────────────────────────────────────────────────
  it('detects imperativo_docente "Distribuisci il LED ai ragazzi" → HIGH', () => {
    const r = callOrFail('Distribuisci il LED ai ragazzi e mostra come si collega.');
    const v = r.violations.find((x) => x.rule === 'imperativo_docente');
    expect(v).toBeDefined();
    expect(v.severity).toBe('HIGH');
  });

  it('detects imperativo_docente "Spiega ai ragazzi" pattern at line start', () => {
    const r = callOrFail('Spiega ai ragazzi che il LED ha polarità.');
    expect(r.violations.some((x) => x.rule === 'imperativo_docente')).toBe(true);
  });

  it('does NOT flag imperativo when verb is mid-sentence (inclusive plurale ok)', () => {
    const r = callOrFail('Ragazzi, vediamo insieme. Provate a connettere il LED.');
    expect(r.violations.some((x) => x.rule === 'imperativo_docente')).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 2: singolare_studente
  // ───────────────────────────────────────────────────────────────
  it('detects singolare_studente "Devi girare il LED" → HIGH', () => {
    const r = callOrFail('Ragazzi, vediamo. Devi girare il LED se non si accende.');
    const v = r.violations.find((x) => x.rule === 'singolare_studente');
    expect(v).toBeDefined();
    expect(v.severity).toBe('HIGH');
  });

  it('does NOT flag singolare when wrapped in «...» (citazione fedele)', () => {
    const r = callOrFail('Ragazzi, il libro dice: «devi sempre verificare la polarità».');
    expect(r.violations.some((x) => x.rule === 'singolare_studente')).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 3: max_words_120
  // ───────────────────────────────────────────────────────────────
  it('detects max_words_120 exceeded (>120 words) → MEDIUM', () => {
    const longResp = 'Ragazzi, vediamo insieme. ' + 'parola '.repeat(140);
    const r = callOrFail(longResp);
    const v = r.violations.find((x) => x.rule === 'max_words_120');
    expect(v).toBeDefined();
    expect(v.severity).toBe('MEDIUM');
  });

  it('passes max_words for 30-word response', () => {
    const r = callOrFail('Ragazzi, vediamo come funziona il LED. È come una piccola lampadina che si accende solo nella direzione giusta. Provate insieme con il Vol. 1 pag. 27.');
    const v = r.violations.find((x) => x.rule === 'max_words_120');
    expect(v).toBeUndefined();
  });

  it('strips [AZIONE:...] tags from word count', () => {
    const resp = 'Ragazzi, vediamo. [AZIONE:highlight:led1] Provate insieme.';
    const r = callOrFail(resp);
    const v = r.violations.find((x) => x.rule === 'max_words_120');
    expect(v).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 4: no_citation_concept_intro (conditional on ctx.isConceptIntro)
  // ───────────────────────────────────────────────────────────────
  it('flags missing citation when isConceptIntro=true → LOW', () => {
    const r = callOrFail('Il LED è un componente che emette luce.', {
      isConceptIntro: true,
    });
    const v = r.violations.find((x) => x.rule === 'no_citation_concept_intro');
    expect(v).toBeDefined();
    expect(v.severity).toBe('LOW');
  });

  it('passes citation when "Vol.1 pag.27" present and isConceptIntro=true', () => {
    const r = callOrFail('Il LED è descritto sul Vol. 1 pag. 27 come un piccolo diodo.', {
      isConceptIntro: true,
    });
    const v = r.violations.find((x) => x.rule === 'no_citation_concept_intro');
    expect(v).toBeUndefined();
  });

  it('does NOT flag missing citation when isConceptIntro is false', () => {
    const r = callOrFail('Il LED non si accende, controlla la polarità.', {});
    const v = r.violations.find((x) => x.rule === 'no_citation_concept_intro');
    expect(v).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 5: english_filler
  // ───────────────────────────────────────────────────────────────
  it('detects english_filler "Let me" → LOW', () => {
    const r = callOrFail('Let me explain ragazzi, the LED is a diode.');
    const v = r.violations.find((x) => x.rule === 'english_filler');
    expect(v).toBeDefined();
    expect(v.severity).toBe('LOW');
  });

  it('detects english_filler "Sure" / "Of course"', () => {
    const r = callOrFail('Of course ragazzi! Vediamo insieme.');
    const v = r.violations.find((x) => x.rule === 'english_filler');
    expect(v).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 6: chatbot_preamble (line-start chatbot fillers)
  // ───────────────────────────────────────────────────────────────
  it('detects chatbot_preamble "Certo," at start → LOW', () => {
    const r = callOrFail('Certo, ragazzi vediamo come funziona il LED.');
    const v = r.violations.find((x) => x.rule === 'chatbot_preamble');
    expect(v).toBeDefined();
    expect(v.severity).toBe('LOW');
  });

  it('detects chatbot_preamble "Ottima domanda" → LOW', () => {
    const r = callOrFail('Ottima domanda ragazzi! Il LED funziona così...');
    const v = r.violations.find((x) => x.rule === 'chatbot_preamble');
    expect(v).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────
  // Aggregation / shape contract
  // ───────────────────────────────────────────────────────────────
  it('clean PZ-compliant response has zero violations and passes', () => {
    const clean = 'Ragazzi, vediamo insieme: «Il LED ha due gambine di lunghezza diversa» Vol. 1 pag. 27. Funziona come una piccola lampadina.';
    const r = callOrFail(clean);
    expect(r.violations.length).toBe(0);
    expect(r.passes).toBe(true);
    expect(r.severity).toBeNull();
  });

  it('returns shape { violations: Violation[], severity, passes }', () => {
    const r = callOrFail('Ragazzi, vediamo insieme.');
    expect(r).toHaveProperty('violations');
    expect(Array.isArray(r.violations)).toBe(true);
    expect(r).toHaveProperty('severity');
    expect(r).toHaveProperty('passes');
    expect(typeof r.passes).toBe('boolean');
  });

  it('aggregates max severity across multiple violations', () => {
    const r = callOrFail('Distribuisci il LED. Devi girare. Let me help. ' + 'parola '.repeat(80));
    expect(r.violations.length).toBeGreaterThan(1);
    expect(r.severity).toBe('HIGH'); // imperativo + singolare are HIGH, max wins
    expect(r.passes).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // Bench-time-only rules (deferred — documented as it.todo)
  // ───────────────────────────────────────────────────────────────
  it.todo('plurale_ragazzi — bench-time only, requires positive presence check (fixture-dependent)');
  it.todo('citation_vol_pag — bench-time only, fixture flag-based unconditional check');
  it.todo('analogia — bench-time only, fixture flag-based');
  it.todo('no_verbatim_3plus_frasi — bench-time only, requires RAG source diff');
  it.todo('synthesis_not_verbatim — bench-time only, requires RAG retrieved chunks comparison');
  it.todo('off_topic_recognition — bench-time only, requires fixture.scenario==="off-topic"');
  it.todo('humble_admission — bench-time only, requires fixture.scenario in [deep-question, off-topic]');
  it.todo('action_tags_when_expected — bench-time only, requires fixture.expectedActions');
});
