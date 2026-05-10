/**
 * TDD red-phase integration tests for unlim-chat prompt v3 wire-up
 * Target: supabase/functions/unlim-chat/index.ts
 *
 * Sprint S iter 2 — Task A — generator-test-opus | 2026-04-26
 *
 * Status: RED phase — wire-up not yet present in unlim-chat/index.ts.
 * Tests assert prompt assembly path; will FAIL until generator-app-opus wires:
 *   - getCapitoloByExperimentId() lookup
 *   - buildCapitoloPromptFragment() composition
 *   - validatePrincipioZero() post-LLM check
 *   - logging CRITICAL violations to together_audit_log
 *
 * The Edge Function uses Deno runtime in production. For unit-style coverage
 * here we test the SHARED helpers (which are runtime-agnostic) and the
 * prompt-assembly contract via a thin mock LLM.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Symbols under test — all may be missing initially (RED phase)
let buildCapitoloPromptFragment;
let getCapitoloByExperimentId;
let validatePrincipioZero;
let buildSystemPrompt;
const importErrors = {};

try {
  const mod = await import('../../supabase/functions/_shared/capitoli-loader.ts');
  buildCapitoloPromptFragment = mod.buildCapitoloPromptFragment;
  getCapitoloByExperimentId = mod.getCapitoloByExperimentId;
} catch (err) {
  importErrors.capitoli = err.message;
}

try {
  const mod = await import('../../supabase/functions/_shared/principio-zero-validator.ts');
  validatePrincipioZero = mod.validatePrincipioZero;
} catch (err) {
  importErrors.validator = err.message;
}

try {
  const mod = await import('../../supabase/functions/_shared/system-prompt.ts');
  buildSystemPrompt = mod.buildSystemPrompt;
} catch (err) {
  importErrors.systemPrompt = err.message;
}

describe('unlim-chat prompt v3 wire-up — RED phase (Sprint S iter 2 Task A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shared helpers exist (will FAIL until wire-up complete)', () => {
    expect(typeof getCapitoloByExperimentId).toBe('function'); // already exists per audit
    expect(typeof buildCapitoloPromptFragment).toBe('function'); // RED — TBD by gen-app
    expect(typeof validatePrincipioZero).toBe('function'); // RED — TBD by gen-app
    expect(typeof buildSystemPrompt).toBe('function'); // already exists
  });

  it('prompt assembly includes Capitolo fragment when experimentId provided', () => {
    if (typeof buildCapitoloPromptFragment !== 'function' || typeof getCapitoloByExperimentId !== 'function') {
      expect.fail(`prompt v3 helpers missing — ${JSON.stringify(importErrors)}`);
    }
    const lookup = getCapitoloByExperimentId('v1-cap6-esp1');
    expect(lookup).not.toBeNull();
    if (!lookup) return;
    const fragment = buildCapitoloPromptFragment(lookup.capitolo, 'v1-cap6-esp1');
    expect(fragment).toMatch(/Vol\.?\s*1/i);
    expect(fragment.length).toBeGreaterThan(50);
  });

  it('post-LLM validator catches CRITICAL violation when LLM returns docente-meta', () => {
    if (typeof validatePrincipioZero !== 'function') {
      expect.fail(`validatePrincipioZero missing — ${importErrors.validator ?? 'symbol not exported'}`);
    }
    const llmResponse = 'Distribuisci il LED ai ragazzi.';
    const result = validatePrincipioZero(llmResponse);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(['CRITICAL', 'HIGH']).toContain(result.severity);
    expect(result.passes).toBe(false);
  });

  it('prompt path falls through to legacy behavior when capitolo not found', () => {
    if (typeof getCapitoloByExperimentId !== 'function') {
      expect.fail('getCapitoloByExperimentId missing');
    }
    const missing = getCapitoloByExperimentId('v99-cap99-esp99-nonexistent');
    expect(missing).toBeNull();
    // Wire-up MUST guard against null (no throw, fallback to base prompt)
  });

  it('preserves existing studentContext + circuitState path in buildSystemPrompt', () => {
    if (typeof buildSystemPrompt !== 'function') {
      expect.fail(`buildSystemPrompt missing — ${importErrors.systemPrompt ?? 'symbol not exported'}`);
    }
    // Shape mirrors what unlim-chat/index.ts passes today (per system-prompt.ts schema)
    const studentContext = {
      completedExperiments: 3,
      totalExperiments: 92,
      commonMistakes: [],
      lastSession: 'v1-cap6-esp1',
      level: 'principiante',
    };
    const circuitState = { components: ['led1', 'r1'], wires: 2 };
    const out = buildSystemPrompt(studentContext, circuitState, null);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(100);
  });

  it('system prompt describes ELAB Tutor as parallel operational branches, not a linear chat chain', () => {
    if (typeof buildSystemPrompt !== 'function') {
      expect.fail(`buildSystemPrompt missing — ${importErrors.systemPrompt ?? 'symbol not exported'}`);
    }
    const out = buildSystemPrompt(null, null, null);
    expect(out).toContain('MAPPA OPERATIVA ELAB TUTOR');
    expect(out).toContain('rami paralleli');
    expect(out).toContain('narrazione live');
    expect(out).toContain('stato simulatore');
    expect(out).toContain('Scratch/Arduino');
    expect(out).toContain('Pixtral');
  });

  it('system prompt keeps citations as short anchors, not as a replacement for natural discourse', () => {
    if (typeof buildSystemPrompt !== 'function') {
      expect.fail(`buildSystemPrompt missing — ${importErrors.systemPrompt ?? 'symbol not exported'}`);
    }
    const out = buildSystemPrompt(null, null, null);
    expect(out).toContain('Citazione = ancora, non risposta intera');
    expect(out).toContain('Una sola citazione breve');
    expect(out).toContain('prima diagnosi/azione, poi citazione solo se aiuta');
  });

  it('system prompt requires original synthesis instead of citation-only answers', () => {
    if (typeof buildSystemPrompt !== 'function') {
      expect.fail(`buildSystemPrompt missing — ${importErrors.systemPrompt ?? 'symbol not exported'}`);
    }
    const out = buildSystemPrompt(null, null, null);
    expect(out).toContain('RISPOSTA ORIGINALE');
    expect(out).toContain('non copiare il volume come risposta');
    expect(out).toContain('sintesi tua');
    expect(out).toContain('massimo una citazione breve');
  });

  it('validator violations have stable rule-name keys for audit logging', () => {
    if (typeof validatePrincipioZero !== 'function') {
      expect.fail('validatePrincipioZero missing');
    }
    // 140+ word response triggers max_words_120 (Andrea ricalibrazione 10/05/2026); ensure rule keys are stable strings
    const result = validatePrincipioZero('Distribuisci il LED. ' + 'parola '.repeat(140));
    expect(result.violations.length).toBeGreaterThan(0);
    for (const v of result.violations) {
      expect(v).toHaveProperty('rule');
      expect(typeof v.rule).toBe('string');
      expect(v).toHaveProperty('severity');
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(v.severity);
    }
  });
});
