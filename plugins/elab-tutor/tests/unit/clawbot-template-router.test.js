/**
 * Sprint T iter 26 — agent gen-app — 2026-04-28.
 *
 * Tests for ClawBot L2 template runtime loader + router:
 *   `supabase/functions/_shared/clawbot-templates.ts`
 *   `supabase/functions/_shared/clawbot-template-router.ts`
 *
 * Source TS files run on Deno Edge runtime; vitest 3.x can import .ts via
 * Vite plugin (same pattern as together-fallback.test.js).
 */

import { describe, it, expect } from 'vitest';

let TEMPLATES_L2;
let getTemplateById;
let selectTemplate;
let executeTemplate;
let interpolateArgs;
let EXPERIMENT_TEMPLATE_MAP;
let importError = null;

try {
  const tplMod = await import('../../supabase/functions/_shared/clawbot-templates.ts');
  TEMPLATES_L2 = tplMod.TEMPLATES_L2;
  getTemplateById = tplMod.getTemplateById;
  const routerMod = await import('../../supabase/functions/_shared/clawbot-template-router.ts');
  selectTemplate = routerMod.selectTemplate;
  executeTemplate = routerMod.executeTemplate;
  interpolateArgs = routerMod.interpolateArgs;
  EXPERIMENT_TEMPLATE_MAP = routerMod.EXPERIMENT_TEMPLATE_MAP;
} catch (err) {
  importError = err;
}

describe('clawbot-templates registry', () => {
  it('imports without error', () => {
    expect(importError, importError?.message).toBeNull();
    expect(Array.isArray(TEMPLATES_L2)).toBe(true);
  });

  it('contains all 25 L2 templates (iter 28 +5 Vol1 cap.10-14 expand)', () => {
    expect(TEMPLATES_L2.length).toBe(25);
  });

  it('every template has required fields', () => {
    for (const t of TEMPLATES_L2) {
      expect(t.id, `id missing`).toMatch(/^L2-/);
      expect(typeof t.name).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(typeof t.category).toBe('string');
      expect(t.principio_zero).toBeTruthy();
      expect(t.principio_zero.plurale_obbligatorio).toBe('Ragazzi,');
      expect(t.principio_zero.max_parole).toBeLessThanOrEqual(120);
      expect(Array.isArray(t.sequence)).toBe(true);
      expect(t.sequence.length).toBe(5);
      expect(['halt-on-error', 'continue', 'retry', 'retry-then-halt']).toContain(t.fallback_strategy);
    }
  });

  it('getTemplateById returns the expected template', () => {
    const t = getTemplateById('L2-explain-led-blink');
    expect(t).toBeTruthy();
    expect(t.name).toBe('explainLedBlink');
    expect(getTemplateById('does-not-exist')).toBeNull();
  });
});

describe('selectTemplate', () => {
  // 2026-05-10 OPZIONE FIX: default threshold raised to 999 to disable L2 short-circuit
  // (live prod audit found bag-of-words wrong-fires for descriptive queries).
  // Scoring algorithm tests now pass `threshold: 2` explicit to verify mechanics.
  // Production caller relies on default 999 → null path (AgentDecision router replaces).
  const TEST_OPTS = { threshold: 2 };

  it('matches "spiega LED" → L2-explain-led-blink (with explicit threshold=2)', () => {
    const t = selectTemplate('Ragazzi, spiega LED Blink lampeggio', TEST_OPTS);
    expect(t).toBeTruthy();
    expect(t.id).toBe('L2-explain-led-blink');
  });

  it('matches "diagnose LED rovesciato" → L2-diagnose-led-rovesciato (threshold=2)', () => {
    const t = selectTemplate('LED rovesciato cosa fare? polarità invertita', TEST_OPTS);
    expect(t).toBeTruthy();
    expect(t.id).toBe('L2-diagnose-led-rovesciato');
  });

  it('matches "introduce breadboard" → L2-introduce-breadboard (threshold=2)', () => {
    const t = selectTemplate('Cosa è la breadboard? introduzione bus alimentazione', TEST_OPTS);
    expect(t).toBeTruthy();
    expect(t.id).toBe('L2-introduce-breadboard');
  });

  it('matches "spiega PWM fade" → L2-explain-pwm-fade (threshold=2)', () => {
    const t = selectTemplate('spiega PWM analogWrite fade rubinetto', TEST_OPTS);
    expect(t).toBeTruthy();
    expect(t.id).toBe('L2-explain-pwm-fade');
  });

  it('matches "compile arduino" → L2-guide-arduino-compile (threshold=2)', () => {
    const t = selectTemplate('guida compile sketch arduino HEX', TEST_OPTS);
    expect(t).toBeTruthy();
    expect(t.id).toBe('L2-guide-arduino-compile');
  });

  it('returns null for chat-only generic query (threshold=2)', () => {
    const t = selectTemplate('ciao bambini come state oggi', TEST_OPTS);
    expect(t).toBeNull();
  });

  it('respects category_hint when scores tie (threshold=2)', () => {
    const t = selectTemplate('breadboard kit primo setup', { category_hint: 'lesson-introduce', threshold: 2 });
    expect(t).toBeTruthy();
    expect(t.category).toBe('lesson-introduce');
  });

  it('returns null for empty/invalid query', () => {
    expect(selectTemplate('', {})).toBeNull();
    expect(selectTemplate('   ', {})).toBeNull();
    expect(selectTemplate(null, {})).toBeNull();
  });

  it('default threshold (999) returns null for previously-matching query (OPZIONE FIX)', () => {
    const t = selectTemplate('Ragazzi, spiega LED Blink lampeggio', {});
    expect(t).toBeNull();
  });

  it('default threshold returns null for Vol.2 multimetro query (regression prod probe stamane)', () => {
    // Live prod 2026-05-10 stamane: this query selected L2-celebrate-end-volume (catastrofico).
    const t = selectTemplate('Spiegate ai ragazzi come si misura la corrente con il multimetro. Citate Vol.2 e la pagina.', {});
    expect(t).toBeNull();
  });

  it('default threshold returns null for Vol.1 LED contenuto query (regression prod probe stamane)', () => {
    // Live prod 2026-05-10 stamane: this query selected L2-diagnose-led-rovesciato (wrong category).
    const t = selectTemplate('Quale e il contenuto del Vol.1 cap.6 sulla LED? Cita pagina.', {});
    expect(t).toBeNull();
  });
});

describe('interpolateArgs', () => {
  it('replaces ${inputs.X} placeholders', () => {
    const out = interpolateArgs(
      { experimentId: '${inputs.experimentId}', static: 42 },
      { experimentId: 'v1-cap6-esp1' },
    );
    expect(out.experimentId).toBe('v1-cap6-esp1');
    expect(out.static).toBe(42);
  });

  it('replaces ${citation.vol} and ${citation.page}', () => {
    const out = interpolateArgs(
      { text: 'Ragazzi, Vol.${citation.vol} pag.${citation.page}: hello' },
      {},
      {},
      { vol: '1', page: '78', verbatim: 'foo' },
    );
    expect(out.text).toBe('Ragazzi, Vol.1 pag.78: hello');
  });

  it('walks nested arrays + objects', () => {
    const out = interpolateArgs(
      { nested: { ids: ['${inputs.id}', 'static'] } },
      { id: 'led1' },
    );
    expect(out.nested.ids).toEqual(['led1', 'static']);
  });

  it('leaves unknown tokens as empty string', () => {
    const out = interpolateArgs(
      { x: '${inputs.missing}' },
      {},
    );
    expect(out.x).toBe('');
  });
});

describe('executeTemplate', () => {
  it('runs explain-led-blink and returns Ragazzi-prefixed responseText', async () => {
    const tpl = getTemplateById('L2-explain-led-blink');
    const res = await executeTemplate(tpl, { experimentId: 'v1-cap6-esp1' }, {
      // Mock RAG: return a stable citation
      ragRetrieve: async () => [{ vol: '1', page: 78, content: 'Il LED si accende quando la corrente lo attraversa', source: 'volume' }],
    });
    expect(res.templateId).toBe('L2-explain-led-blink');
    expect(res.resolvedSequence.length).toBe(5);
    expect(res.responseText).toMatch(/Ragazzi,/);
    expect(res.responseText).toMatch(/\[AZIONE:highlightExperiment:/);
    expect(res.citation).toBeTruthy();
    expect(res.citation.vol).toBe('1');
    expect(res.citation.page).toBe(78);
  });

  it('survives RAG failure with fallback citation from principio_zero.vol_pag', async () => {
    const tpl = getTemplateById('L2-explain-pwm-fade');
    const res = await executeTemplate(tpl, {}, {
      ragRetrieve: async () => { throw new Error('boom'); },
    });
    expect(res.templateId).toBe('L2-explain-pwm-fade');
    // vol_pag = 'Vol.2 pag.78'
    expect(res.citation).toBeTruthy();
    expect(res.citation.vol).toBe('2');
  });

  it('runs without an injected ragRetrieve (no-op fallback)', async () => {
    const tpl = getTemplateById('L2-introduce-breadboard');
    const res = await executeTemplate(tpl);
    expect(res.resolvedSequence.length).toBe(5);
    // citation derived from principio_zero.vol_pag = "Vol.1 pag.34"
    expect(res.citation?.vol).toBe('1');
    expect(res.citation?.page).toBe('34');
  });
});

// ─── Sprint U Cycle 2 Fix #1: per-experiment template routing ──────────────
//
// Audit `sprint-u-cycle1-iter1-CONSOLIDATED-audit.md` BLOCKER finding:
//   selectTemplate() returned `L2-explain-led-blink` for ALL 94 experiments
//   → 20/20 test responses identical body → Morfismo Sense 2 broken.
//
// These tests assert that 5 different experimentIds route to 5 DIFFERENT
// template IDs (not all L2-explain-led-blink) when paired with a clear
// "spiega" / "diagnos" / "introduc" verb intent.

describe('selectTemplate per-experiment routing (Sprint U Cycle 2 Fix #1)', () => {
  it('EXPERIMENT_TEMPLATE_MAP is non-empty and well-formed', () => {
    expect(EXPERIMENT_TEMPLATE_MAP).toBeInstanceOf(Map);
    expect(EXPERIMENT_TEMPLATE_MAP.size).toBeGreaterThanOrEqual(10);
    for (const [expId, entries] of EXPERIMENT_TEMPLATE_MAP.entries()) {
      expect(typeof expId).toBe('string');
      expect(expId.length).toBeGreaterThan(0);
      expect(Array.isArray(entries)).toBe(true);
      for (const e of entries) {
        expect(typeof e.templateId).toBe('string');
        expect(e.templateId).toMatch(/^L2-/);
        expect(typeof e.category).toBe('string');
      }
    }
  });

  it('5 different experimentIds with "spiega" verb route to 5 DIFFERENT templates (anti-catch-all regression)', () => {
    // The audit found 20/20 responses identical → L2-explain-led-blink for all.
    // Post-fix: each experimentId with a dedicated explain template returns
    // its OWN template (Morfismo Sense 2 alignment).
    const cases = [
      { experimentId: 'v1-cap6-esp1', message: 'Ragazzi, spiegate il LED Blink', expectedId: 'L2-explain-led-blink' },
      { experimentId: 'v2-cap8-esp1', message: 'Ragazzi, spiegate PWM fade', expectedId: 'L2-explain-pwm-fade' },
      { experimentId: 'v2-cap9-esp3', message: 'Ragazzi, spiegate la resistenza pull-up', expectedId: 'L2-explain-resistenza-pull-up' },
      { experimentId: 'v2-cap10-esp1', message: 'Ragazzi, spiegate il condensatore τ=RC', expectedId: 'L2-explain-condensatore-tempo' },
      { experimentId: 'v1-cap3-esp1', message: 'Ragazzi, introducete il resistore', expectedId: 'L2-introduce-resistor' },
    ];
    const seenIds = new Set();
    for (const { experimentId, message, expectedId } of cases) {
      const tpl = selectTemplate(message, { experimentId });
      expect(tpl, `experimentId=${experimentId} returned null`).toBeTruthy();
      expect(tpl.id, `experimentId=${experimentId}`).toBe(expectedId);
      seenIds.add(tpl.id);
    }
    // Critical regression assertion: NOT all 5 → L2-explain-led-blink.
    expect(seenIds.size).toBe(5);
    expect(seenIds.has('L2-explain-led-blink')).toBe(true); // first case still OK
  });

  it('v1-cap6-esp1 with "diagnos" verb routes to diagnose template (NOT explain)', () => {
    // Same experimentId, different verb intent → different template.
    // v1-cap6-esp1 is bound to BOTH L2-explain-led-blink AND L2-diagnose-led-rovesciato + L2-recap-fine-lezione.
    const tpl = selectTemplate('Ragazzi, il LED è rovesciato, diagnosticate', { experimentId: 'v1-cap6-esp1' });
    expect(tpl).toBeTruthy();
    expect(tpl.id).toBe('L2-diagnose-led-rovesciato');
  });

  it('v1-cap6-esp1 with "ricap" verb routes to recap template', () => {
    const tpl = selectTemplate('Ragazzi, ricapitoliamo la lezione', { experimentId: 'v1-cap6-esp1' });
    expect(tpl).toBeTruthy();
    expect(tpl.id).toBe('L2-recap-fine-lezione');
  });

  it('experimentId without verb hint returns null (safe fall-through to LLM+RAG)', () => {
    // No verb stem in query → caller wants LLM, not a canned template.
    // This prevents the iter-1 audit catch-all wrong-fire.
    const tpl = selectTemplate('Ragazzi, cosa dice il libro?', { experimentId: 'v1-cap6-esp1' });
    expect(tpl).toBeNull();
  });

  it('experimentId NOT in map returns null (no fallback wrong-fire)', () => {
    // Iter 28 binds v1-cap10-esp1 -> L2-explain-fotoresistore-vol1cap10, so we
    // use a still-unbound Vol.2 experimentId here. The router must return
    // null when no per-experiment template exists -> LLM+RAG path, NOT a
    // catch-all to L2-explain-led-blink (Sprint U Cycle 1 audit BLOCKER).
    const tpl = selectTemplate('Ragazzi, spiegate il sensore HC-SR04', { experimentId: 'v2-cap99-esp99' });
    expect(tpl).toBeNull();
  });

  it('default threshold (999) still respected when no experimentId is given', () => {
    // Regression: legacy callers without experimentId must still get null
    // (LLM+RAG path). Per-experiment fast-path does NOT lower the threshold
    // for the global bag-of-words scorer.
    const tpl = selectTemplate('Ragazzi, spiegate il LED Blink', {});
    expect(tpl).toBeNull();
  });

  it('explicit category_hint overrides verb-hint when both bind to the same experiment', () => {
    // v1-cap6-esp1 has 3 bound templates. Without verb hint, category_hint
    // disambiguates explicitly.
    const tpl = selectTemplate('Ragazzi, parliamo del LED', {
      experimentId: 'v1-cap6-esp1',
      category_hint: 'lesson-recap',
    });
    expect(tpl).toBeTruthy();
    expect(tpl.id).toBe('L2-recap-fine-lezione');
  });
});
