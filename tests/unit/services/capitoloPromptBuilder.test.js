/**
 * capitoloPromptBuilder tests — Sprint Q3
 */
import { describe, it, expect } from 'vitest';
import {
  extractCitationAnchors,
  selectActiveContext,
  buildCapitoloPromptFragment,
  estimatePromptTokens,
} from '../../../src/services/capitoloPromptBuilder.js';

const SAMPLE_CAPITOLO = {
  id: 'v1-cap6',
  volume: 1,
  capitolo: 6,
  type: 'experiment',
  titolo: "Cos'è il diodo LED?",
  titolo_classe: "Cos'è il diodo LED?",
  pageStart: 27,
  pageEnd: 34,
  theory: {
    testo_classe: 'Un diodo LED produce luce quando attraversato da corrente. È polarizzato.',
    citazioni_volume: [
      { page: 27, quote: 'Un diodo LED è un piccolo dispositivo elettronico', context: 'opening' },
      { page: 28, quote: 'I diodi sono i sensi unici dell\'elettronica', context: 'mid_narrative' },
    ],
    figure_refs: [],
    analogies_classe: [],
  },
  esperimenti: [
    {
      id: 'v1-cap6-esp1',
      num: 1,
      title_classe: 'Accendi il primo LED',
      title_docente: 'Accendi LED',
      volume_ref: { page_start: 29, page_end: 31, fig_refs: [] },
      duration_minutes: 45,
      components_needed: [
        { name: 'LED rosso', quantity: 1, icon: 'led' },
        { name: 'Resistore 470Ω', quantity: 1, icon: 'resistor' },
      ],
      build_circuit: { mode: 'from_scratch', intent: { components: [], wires: [] } },
      phases: [
        {
          name: 'PREPARA',
          duration_minutes: 5,
          classe_display: { text_hook: 'Avete mai acceso una lampadina?', observation_prompt: null, analogies: [] },
          docente_sidebar: { step_corrente: 'Distribuzione kit', spunto_per_classe: null, note: [], errori_tipici: [] },
          action_tags: [],
          auto_action: null,
        },
        {
          name: 'OSSERVA',
          duration_minutes: 10,
          classe_display: { text_hook: 'Guardate il LED!', observation_prompt: 'Si accende?', analogies: [] },
          docente_sidebar: { step_corrente: 'Pressione Play', spunto_per_classe: 'Domanda: Si accende?', note: [], errori_tipici: [] },
          action_tags: [],
          auto_action: null,
        },
      ],
      assessment_invisible: [],
      session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
    },
  ],
};

describe('extractCitationAnchors', () => {
  it('returns empty for null capitolo', () => {
    expect(extractCitationAnchors(null)).toEqual([]);
  });

  it('extracts theory citations with volume + page + truncated quote', () => {
    const anchors = extractCitationAnchors(SAMPLE_CAPITOLO);
    expect(anchors.length).toBeGreaterThanOrEqual(2);
    expect(anchors[0]).toMatchObject({ volume: 1, page: 27 });
    expect(anchors[0].quote.length).toBeLessThanOrEqual(100);
  });

  it('includes esperimento page anchors', () => {
    const anchors = extractCitationAnchors(SAMPLE_CAPITOLO);
    const espAnchor = anchors.find((a) => a.context === 'experiment');
    expect(espAnchor).toBeDefined();
    expect(espAnchor.page).toBe(29);
  });

  it('caps anchors at max option', () => {
    const anchors = extractCitationAnchors(SAMPLE_CAPITOLO, { max: 1 });
    expect(anchors.length).toBe(1);
  });
});

describe('selectActiveContext', () => {
  it('returns null for null capitolo', () => {
    expect(selectActiveContext(null)).toBe(null);
  });

  it('uses first esperimento when activeExpId null', () => {
    const ctx = selectActiveContext(SAMPLE_CAPITOLO);
    expect(ctx.esperimento.id).toBe('v1-cap6-esp1');
  });

  it('uses PREPARA phase when activePhaseName null', () => {
    const ctx = selectActiveContext(SAMPLE_CAPITOLO);
    expect(ctx.phase.name).toBe('PREPARA');
  });

  it('selects specific phase by name', () => {
    const ctx = selectActiveContext(SAMPLE_CAPITOLO, 'v1-cap6-esp1', 'OSSERVA');
    expect(ctx.phase.name).toBe('OSSERVA');
    expect(ctx.phase.classe_text_hook).toBe('Guardate il LED!');
  });

  it('truncates theory_excerpt to 400 chars', () => {
    const long = { ...SAMPLE_CAPITOLO, theory: { ...SAMPLE_CAPITOLO.theory, testo_classe: 'X'.repeat(500) } };
    const ctx = selectActiveContext(long);
    expect(ctx.theory_excerpt.length).toBe(400);
  });

  it('handles theory-only Capitolo (no esperimenti)', () => {
    const theoryCap = { ...SAMPLE_CAPITOLO, type: 'theory', esperimenti: [] };
    const ctx = selectActiveContext(theoryCap);
    expect(ctx.esperimento).toBe(null);
    expect(ctx.theory_excerpt).toBeTruthy();
  });
});

describe('buildCapitoloPromptFragment', () => {
  it('returns empty string for null', () => {
    expect(buildCapitoloPromptFragment(null)).toBe('');
  });

  it('includes capitolo titolo + volume + type', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO);
    expect(out).toContain("Cos'è il diodo LED?");
    expect(out).toContain('Vol.1');
    expect(out).toContain('experiment');
  });

  it('includes esperimento details + components', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO);
    expect(out).toContain('Accendi il primo LED');
    expect(out).toContain('LED rosso');
  });

  it('includes phase docente_step nominalizzato', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO);
    expect(out).toContain('Distribuzione kit');
  });

  it('includes citation anchors with page numbers', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO);
    expect(out).toContain('pag.27');
    expect(out).toContain('pag.28');
  });

  it('always includes PRINCIPIO ZERO rules', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO);
    expect(out).toContain('PRINCIPIO ZERO');
    expect(out).toContain('plurale');
    expect(out).toContain('120 parole');
  });

  it('respects activePhaseName option', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO, { activePhaseName: 'OSSERVA' });
    expect(out).toContain('OSSERVA');
    expect(out).toContain('Guardate il LED');
  });
});

describe('estimatePromptTokens', () => {
  it('returns 0 for empty', () => {
    expect(estimatePromptTokens('')).toBe(0);
    expect(estimatePromptTokens(null)).toBe(0);
  });

  it('estimates ~4 char/token Italian', () => {
    expect(estimatePromptTokens('a'.repeat(40))).toBe(10);
    expect(estimatePromptTokens('a'.repeat(400))).toBe(100);
  });

  it('full fragment should be < 800 tokens (Q3 target token budget)', () => {
    const out = buildCapitoloPromptFragment(SAMPLE_CAPITOLO);
    expect(estimatePromptTokens(out)).toBeLessThan(800);
  });
});
