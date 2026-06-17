/**
 * TDD red-phase tests for buildCapitoloPromptFragment
 * Target: supabase/functions/_shared/capitoli-loader.ts
 *
 * Sprint S iter 2 — Task A — generator-test-opus | 2026-04-26
 *
 * Status: RED phase — function does not yet exist. Tests will FAIL on import
 * until generator-app-opus implements buildCapitoloPromptFragment.
 *
 * Contract (per Sprint S iter 2 contract Task A):
 *   buildCapitoloPromptFragment(capitolo: Capitolo, experimentId?: string): string
 *   (positional 2nd arg per current implementation; not options object)
 *   - returns Capitolo prompt fragment for unlim-chat system prompt assembly
 *   - includes capitolo_intro from narrative_flow when present
 *   - includes citazioni_volume formatted as «quote» Vol.N pag.X
 *   - returns minimal-but-non-empty fragment when capitolo null/undefined (no throw)
 *   - respects optional experimentId scope (slice to relevant exp + transitions only)
 *   - estimated token budget < 1000 (heuristic chars/4)
 *
 * NOTE: extension is .js (not .ts) to match vitest.config.js include pattern
 * 'tests/**\/*.{test,spec}.{js,jsx}'. Source helper is .ts (Deno Edge runtime).
 * vitest 3.x can import .ts via Vite plugin.
 */

import { describe, it, expect } from 'vitest';

// Import target — will fail until function implemented (RED phase)
let buildCapitoloPromptFragment;
let importError = null;

try {
  const mod = await import('../../supabase/functions/_shared/capitoli-loader.ts');
  buildCapitoloPromptFragment = mod.buildCapitoloPromptFragment;
} catch (err) {
  importError = err;
}

const sampleCapitolo = {
  id: 'v1-cap6',
  volume: 1,
  capitolo: 6,
  type: 'experiment',
  titolo: 'Il LED e la luce',
  titolo_classe: 'Accendiamo il primo LED',
  pageStart: 25,
  pageEnd: 32,
  theory: {
    testo_classe: 'Il LED è un componente che emette luce quando attraversato da corrente nella direzione corretta.',
    citazioni_volume: [
      { page: 27, quote: 'Il LED ha due gambine di lunghezza diversa: la più lunga è il positivo.', context: 'definizione' },
      { page: 28, quote: 'Senza resistenza il LED si brucia subito.', context: 'sicurezza' },
    ],
    figure_refs: [{ page: 26, caption: 'Schema base LED + resistenza' }],
    analogies_classe: [{ concept: 'LED', text: 'Il LED è come una piccola lampadina', evidence: 'pag.27' }],
  },
  narrative_flow: {
    intro_text: 'Ragazzi, oggi cominciamo dal componente più magico: il LED. Vediamo come si accende.',
    transitions: [
      {
        between: ['v1-cap6-esp1', 'v1-cap6-esp2'],
        text_classe: 'Bene, ora aggiungiamo un secondo LED in serie.',
        text_docente_action: 'Mostra LED esp2',
        incremental_mode: 'add_component',
      },
    ],
    closing_text: 'Ottimo lavoro ragazzi, ora sapete usare un LED.',
  },
  esperimenti: [
    {
      id: 'v1-cap6-esp1',
      num: 1,
      title_classe: 'Primo LED',
      title_docente: 'Esp 1: LED + resistenza',
      volume_ref: { page_start: 27, page_end: 28, fig_refs: [] },
      duration_minutes: 15,
      components_needed: [{ name: 'LED', quantity: 1, icon: 'led' }, { name: 'Resistor 220', quantity: 1, icon: 'r' }],
      build_circuit: { mode: 'fresh' },
      phases: [],
      assessment_invisible: ['polarità riconosciuta'],
      session_save: { concepts_covered: ['LED', 'polarità'], next_suggested: 'v1-cap6-esp2', resume_message: '' },
    },
    {
      id: 'v1-cap6-esp2',
      num: 2,
      title_classe: 'Due LED in serie',
      title_docente: 'Esp 2: 2 LED serie',
      volume_ref: { page_start: 29, page_end: 30, fig_refs: [] },
      duration_minutes: 20,
      components_needed: [{ name: 'LED', quantity: 2, icon: 'led' }],
      build_circuit: { mode: 'incremental_from_prev' },
      phases: [],
      assessment_invisible: [],
      session_save: { concepts_covered: ['serie'], next_suggested: null, resume_message: '' },
    },
  ],
};

describe('buildCapitoloPromptFragment — RED phase (Sprint S iter 2 Task A)', () => {
  it('symbol is exported from capitoli-loader (will FAIL until implemented)', () => {
    if (importError) {
      // Module imported but symbol missing — also a fail signal
      expect.fail(`import failed: ${importError.message}`);
    }
    expect(typeof buildCapitoloPromptFragment).toBe('function');
  });

  it('returns non-empty string for valid Capitolo', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const out = buildCapitoloPromptFragment(sampleCapitolo);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(50);
  });

  it('includes capitolo intro text from narrative_flow when present', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const out = buildCapitoloPromptFragment(sampleCapitolo);
    expect(out).toContain('LED');
    expect(out.toLowerCase()).toMatch(/intro|narrativa|cominciamo|ragazzi/);
  });

  it('includes citazioni_volume formatted as «quote» Vol.N pag.X', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const out = buildCapitoloPromptFragment(sampleCapitolo);
    expect(out).toMatch(/«[^»]+»/);
    expect(out).toMatch(/Vol\.?\s*1/i);
    expect(out).toMatch(/pag\.?\s*2[78]/i);
  });

  it('returns minimal but non-throwing fragment when capitolo is null', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    expect(() => buildCapitoloPromptFragment(null)).not.toThrow();
    expect(() => buildCapitoloPromptFragment(undefined)).not.toThrow();
    const outNull = buildCapitoloPromptFragment(null);
    expect(typeof outNull).toBe('string');
  });

  it('respects optional experimentId scope — focuses on requested exp + transitions', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const scoped = buildCapitoloPromptFragment(sampleCapitolo, 'v1-cap6-esp2');
    const full = buildCapitoloPromptFragment(sampleCapitolo);
    // Scoped mode includes per-exp citazioni + transitions; full mode lists all esps
    // Both should be non-empty; scoped MUST mention exp2 specifically
    expect(scoped.length).toBeGreaterThan(0);
    expect(full.length).toBeGreaterThan(0);
    expect(scoped).toMatch(/esp2|secondo|serie|2/i);
    // FULL mode lists all esperimenti including esp1 enumeration
    expect(full).toMatch(/Esperimenti del capitolo|esp\.1|esp\.2/i);
  });

  it('estimated token count under 1000 for typical Capitolo (chars/4 heuristic)', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const out = buildCapitoloPromptFragment(sampleCapitolo);
    const estimatedTokens = out.length / 4;
    expect(estimatedTokens).toBeLessThan(1000);
  });

  it('handles capitolo with no narrative_flow gracefully', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const noNarrative = { ...sampleCapitolo, narrative_flow: undefined };
    expect(() => buildCapitoloPromptFragment(noNarrative)).not.toThrow();
    const out = buildCapitoloPromptFragment(noNarrative);
    expect(typeof out).toBe('string');
  });

  it('handles capitolo with empty citazioni_volume array gracefully', () => {
    if (typeof buildCapitoloPromptFragment !== 'function') {
      expect.fail('buildCapitoloPromptFragment not yet implemented');
    }
    const noCitations = {
      ...sampleCapitolo,
      theory: { ...sampleCapitolo.theory, citazioni_volume: [] },
    };
    expect(() => buildCapitoloPromptFragment(noCitations)).not.toThrow();
  });
});
