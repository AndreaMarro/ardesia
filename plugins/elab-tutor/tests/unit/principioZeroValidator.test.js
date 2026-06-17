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
    // Iter 27: plurale_ragazzi promoted to MAJOR (response lacks "Ragazzi" opener)
    // MAJOR > HIGH > MEDIUM > LOW in iter 27 severity ranking.
    expect(r.severity).toBe('MAJOR');
    expect(r.passes).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // Bench-time-only rules (deferred — documented as it.todo)
  // ───────────────────────────────────────────────────────────────
  // Iter 27 (2026-05-11) — 6/8 promoted to runtime (see describe block below).
  // Only 2 remain bench-time-only.
  it.todo('humble_admission — bench-time only, requires fixture.scenario in [deep-question, off-topic]');
  it.todo('synthesis_not_verbatim — bench-time only, requires RAG retrieved chunks comparison');
});

// ═════════════════════════════════════════════════════════════════════
// Iter 27 (2026-05-11) — PZ V3 +6 runtime rules promotion
// Promotes 6 bench-only rules to runtime enforcement (12/12 coverage).
// Validator accepts optional ctx { requiresCitation, isOfftopic, isSafetyRefusal,
// expectedActions } — backward-compat preserved (ctx fully optional).
// MAJOR severity NON-BLOCKING iter 27 (Andrea iter 28 ratify decide hard-block).
// ═════════════════════════════════════════════════════════════════════
describe('validatePrincipioZero — iter 27 +6 runtime rules (PZ V3 100% coverage)', () => {
  // ───────────────────────────────────────────────────────────────
  // RULE 7: plurale_ragazzi (MAJOR) — MUST start "Ragazzi,"
  // ───────────────────────────────────────────────────────────────
  it('plurale_ragazzi: passes when response starts "Ragazzi,"', () => {
    const r = callOrFail('Ragazzi, vediamo insieme il LED.');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('plurale_ragazzi: fails (MAJOR) when missing "Ragazzi" opener', () => {
    const r = callOrFail('Il LED si accende quando la corrente passa.');
    const v = r.violations.find((x) => x.rule === 'plurale_ragazzi');
    expect(v).toBeDefined();
    expect(v.severity).toBe('MAJOR');
  });

  it('plurale_ragazzi: case-insensitive accepts "ragazzi" lowercase', () => {
    const r = callOrFail('ragazzi, vediamo il LED.');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('plurale_ragazzi: accepts "Ragazze" feminine plural', () => {
    const r = callOrFail('Ragazze, vediamo insieme.');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('plurale_ragazzi: SKIPPED when ctx.isSafetyRefusal=true', () => {
    const r = callOrFail('Mi spiace, questa richiesta non è appropriata.', {
      isSafetyRefusal: true,
    });
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('plurale_ragazzi: strips [AZIONE:...] prefix when measuring opener', () => {
    const r = callOrFail('[AZIONE:highlight:led1] Ragazzi, guardate il LED.');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 8: citation_vol_pag (MAJOR conditional)
  // ───────────────────────────────────────────────────────────────
  it('citation_vol_pag: passes with "Vol.1 pag.27" when requiresCitation=true', () => {
    const r = callOrFail('Ragazzi, il LED si trova su Vol.1 pag.27.', {
      requiresCitation: true,
    });
    expect(r.violations.some((x) => x.rule === 'citation_vol_pag')).toBe(false);
  });

  it('citation_vol_pag: passes with "Vol.2 cap.5" alternative format', () => {
    const r = callOrFail('Ragazzi, vediamo Vol.2 cap.5.', { requiresCitation: true });
    expect(r.violations.some((x) => x.rule === 'citation_vol_pag')).toBe(false);
  });

  it('citation_vol_pag: fails MAJOR when requiresCitation=true and no Vol/pag', () => {
    const r = callOrFail('Ragazzi, il LED si accende così.', { requiresCitation: true });
    const v = r.violations.find((x) => x.rule === 'citation_vol_pag');
    expect(v).toBeDefined();
    expect(v.severity).toBe('MAJOR');
  });

  it('citation_vol_pag: SKIPPED when requiresCitation is undefined/false', () => {
    const r = callOrFail('Ragazzi, il LED si accende così.');
    expect(r.violations.some((x) => x.rule === 'citation_vol_pag')).toBe(false);
  });

  it('citation_vol_pag: SKIPPED when ctx.isOfftopic=true even with requiresCitation', () => {
    const r = callOrFail('Ragazzi, torniamo all\'elettronica.', {
      requiresCitation: true,
      isOfftopic: true,
    });
    expect(r.violations.some((x) => x.rule === 'citation_vol_pag')).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 9: analogia (LOW telemetry-only) — Andrea 10/05/2026 OPZIONALE
  // ───────────────────────────────────────────────────────────────
  it('analogia: telemetry counts "come una lampadina" without violation', () => {
    const r = callOrFail('Ragazzi, il LED è come una piccola lampadina.');
    expect(r.violations.some((x) => x.rule === 'analogia')).toBe(false);
    expect(r.telemetry).toBeDefined();
    expect(r.telemetry.analogiaCount).toBeGreaterThan(0);
  });

  it('analogia: telemetry counts "come se" marker', () => {
    const r = callOrFail('Ragazzi, funziona come se fosse un interruttore.');
    expect(r.telemetry.analogiaCount).toBeGreaterThan(0);
  });

  it('analogia: telemetry counts "immagina" marker', () => {
    const r = callOrFail('Ragazzi, immagina una corrente d\'acqua.');
    expect(r.telemetry.analogiaCount).toBeGreaterThan(0);
  });

  it('analogia: NO violation when missing (Andrea 10/05/2026 OPZIONALE rule)', () => {
    const r = callOrFail('Ragazzi, il LED si accende quando passa corrente.');
    expect(r.violations.some((x) => x.rule === 'analogia')).toBe(false);
    expect(r.telemetry.analogiaCount).toBe(0);
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 10: no_verbatim_3plus_frasi (MEDIUM)
  // ───────────────────────────────────────────────────────────────
  it('no_verbatim_3plus_frasi: fails MEDIUM with 3+ consecutive «...» blocks', () => {
    const r = callOrFail('Ragazzi, «frase uno», «frase due», «frase tre» Vol.1 pag.27.');
    const v = r.violations.find((x) => x.rule === 'no_verbatim_3plus_frasi');
    expect(v).toBeDefined();
    expect(v.severity).toBe('MEDIUM');
  });

  it('no_verbatim_3plus_frasi: passes with 2 verbatim blocks (under threshold)', () => {
    const r = callOrFail('Ragazzi, «frase uno» e «frase due» Vol.1 pag.27.');
    expect(r.violations.some((x) => x.rule === 'no_verbatim_3plus_frasi')).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 11: off_topic_recognition (LOW)
  // ───────────────────────────────────────────────────────────────
  it('off_topic_recognition: passes when isOfftopic=true AND redirect marker present', () => {
    const r = callOrFail('Ragazzi, torniamo all\'elettronica e al nostro LED.', {
      isOfftopic: true,
    });
    expect(r.violations.some((x) => x.rule === 'off_topic_recognition')).toBe(false);
  });

  it('off_topic_recognition: fails LOW when isOfftopic=true AND no redirect marker', () => {
    const r = callOrFail('Ragazzi, il calcio è uno sport bellissimo.', { isOfftopic: true });
    const v = r.violations.find((x) => x.rule === 'off_topic_recognition');
    expect(v).toBeDefined();
    expect(v.severity).toBe('LOW');
  });

  // ───────────────────────────────────────────────────────────────
  // RULE 12: action_tags_when_expected (MEDIUM)
  // ───────────────────────────────────────────────────────────────
  it('action_tags_when_expected: passes with [AZIONE:highlight] when expected', () => {
    const r = callOrFail('Ragazzi, guardate. [AZIONE:highlight:led1]', {
      expectedActions: ['highlight'],
    });
    expect(r.violations.some((x) => x.rule === 'action_tags_when_expected')).toBe(false);
  });

  it('action_tags_when_expected: fails MEDIUM when expectedActions provided but no [AZIONE:]', () => {
    const r = callOrFail('Ragazzi, guardate il LED.', {
      expectedActions: ['highlight', 'mountExperiment'],
    });
    const v = r.violations.find((x) => x.rule === 'action_tags_when_expected');
    expect(v).toBeDefined();
    expect(v.severity).toBe('MEDIUM');
  });

  it('action_tags_when_expected: SKIPPED when expectedActions is empty array', () => {
    const r = callOrFail('Ragazzi, guardate il LED.', { expectedActions: [] });
    expect(r.violations.some((x) => x.rule === 'action_tags_when_expected')).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────
  // Combined scenarios + severity aggregation
  // ───────────────────────────────────────────────────────────────
  it('aggregates MAJOR severity correctly (plurale + citation both missing)', () => {
    const r = callOrFail('Il LED si accende così.', { requiresCitation: true });
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(true);
    expect(r.violations.some((x) => x.rule === 'citation_vol_pag')).toBe(true);
    expect(r.severity).toBe('MAJOR');
    expect(r.passes).toBe(false);
  });

  it('MAJOR ranks higher than HIGH in severity aggregation', () => {
    // plurale_ragazzi (MAJOR) + imperativo_docente (HIGH) → MAJOR wins
    const r = callOrFail('Distribuisci il LED ai ragazzi.');
    expect(r.severity).toBe('MAJOR');
  });

  // ───────────────────────────────────────────────────────────────
  // Backward-compat: ctx optional (existing callers)
  // ───────────────────────────────────────────────────────────────
  it('backward-compat: validatePrincipioZero(response) without ctx still works', () => {
    const r = callOrFail('Ragazzi, vediamo insieme.');
    expect(r).toHaveProperty('violations');
    expect(r).toHaveProperty('passes');
    expect(r).toHaveProperty('telemetry');
  });

  it('backward-compat: legacy ctx { isConceptIntro } still functions', () => {
    const r = callOrFail('Ragazzi, il LED è un componente.', { isConceptIntro: true });
    // Legacy no_citation_concept_intro rule still active
    expect(r.violations.some((x) => x.rule === 'no_citation_concept_intro')).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────
  // Edge cases
  // ───────────────────────────────────────────────────────────────
  it('edge: empty string returns no plurale_ragazzi violation (nothing to validate)', () => {
    const r = callOrFail('');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('edge: whitespace-only string treated as empty', () => {
    const r = callOrFail('   \n\t  ');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('edge: Unicode «» chars and accented Italian preserved', () => {
    const r = callOrFail('Ragazzi, «è perché» così.');
    expect(r.violations.some((x) => x.rule === 'plurale_ragazzi')).toBe(false);
  });

  it('returns telemetry shape { analogiaCount, analogiaMarkers }', () => {
    const r = callOrFail('Ragazzi, è come una lampadina, immagina la corrente.');
    expect(r.telemetry).toBeDefined();
    expect(typeof r.telemetry.analogiaCount).toBe('number');
    expect(Array.isArray(r.telemetry.analogiaMarkers)).toBe(true);
    expect(r.telemetry.analogiaCount).toBeGreaterThanOrEqual(2);
  });
});
