/**
 * percorsoGenerator tests — Sprint Q6
 */
import { describe, it, expect, vi } from 'vitest';
import {
  generatePercorso,
  orderEsperimentiByLivello,
  estimateComplexity,
  extractCitationPointers,
  buildTeacherSidebarSummary,
  buildStaticFallback,
} from '../../../src/services/percorsoGenerator.js';

const SAMPLE_CAPITOLO = {
  id: 'v1-cap6',
  volume: 1,
  capitolo: 6,
  type: 'experiment',
  titolo: "Cos'è il diodo LED?",
  titolo_classe: "LED",
  pageStart: 27,
  pageEnd: 34,
  theory: {
    testo_classe: 'Un LED produce luce con corrente.',
    citazioni_volume: [{ page: 27, quote: 'Un diodo LED', context: 'opening' }],
    figure_refs: [],
    analogies_classe: [],
  },
  narrative_flow: {
    intro_text: 'Oggi il diodo LED.',
    transitions: [],
    closing_text: 'Fine LED.',
  },
  esperimenti: [
    {
      id: 'v1-cap6-esp1', num: 1, title_classe: 'Accendi LED', title_docente: 'Accendi LED',
      volume_ref: { page_start: 29, page_end: 31, fig_refs: [] }, duration_minutes: 45,
      components_needed: [{ name: 'LED', quantity: 1, icon: 'led' }],
      build_circuit: { mode: 'from_scratch', intent: { components: [], wires: [] } },
      phases: [{ name: 'PREPARA', duration_minutes: 5, classe_display: { text_hook: null, observation_prompt: null, analogies: [] }, docente_sidebar: { step_corrente: 'x', spunto_per_classe: null, note: [], errori_tipici: [] }, action_tags: [], auto_action: null }],
      assessment_invisible: ['polarita-led'],
      session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
    },
    {
      id: 'v1-cap6-esp3', num: 3, title_classe: 'Cambia luminosità', title_docente: 'Luminosità',
      volume_ref: { page_start: 33, page_end: 33, fig_refs: [] }, duration_minutes: 45,
      components_needed: [{ name: 'R 220', quantity: 1, icon: 'r' }, { name: 'R 470', quantity: 1, icon: 'r' }, { name: 'R 1k', quantity: 1, icon: 'r' }, { name: 'LED', quantity: 1, icon: 'led' }],
      build_circuit: { mode: 'incremental_from_prev', incremental_delta: { base_experiment_id: 'v1-cap6-esp1', operations: [] } },
      phases: [{ name: 'PREPARA', duration_minutes: 5, classe_display: { text_hook: null, observation_prompt: null, analogies: [] }, docente_sidebar: { step_corrente: 'x', spunto_per_classe: null, note: [], errori_tipici: [] }, action_tags: [], auto_action: null }],
      assessment_invisible: [],
      session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
    },
  ],
};

describe('estimateComplexity', () => {
  it('returns 0 for null', () => {
    expect(estimateComplexity(null)).toBe(0);
  });

  it('penalizes more components', () => {
    const simple = { components_needed: [{}], phases: [], build_circuit: {} };
    const complex = { components_needed: [{}, {}, {}, {}], phases: [], build_circuit: {} };
    expect(estimateComplexity(complex)).toBeGreaterThan(estimateComplexity(simple));
  });

  it('adds incremental_from_prev bonus', () => {
    const inc = { components_needed: [], phases: [], build_circuit: { mode: 'incremental_from_prev' } };
    const fs = { components_needed: [], phases: [], build_circuit: { mode: 'from_scratch' } };
    expect(estimateComplexity(inc)).toBeGreaterThan(estimateComplexity(fs));
  });
});

describe('orderEsperimentiByLivello', () => {
  it('sorts by num ascending for principiante', () => {
    const out = orderEsperimentiByLivello(SAMPLE_CAPITOLO.esperimenti, 'principiante');
    expect(out[0].num).toBeLessThanOrEqual(out[1].num);
  });

  it('sorts by complexity descending for avanzato', () => {
    const out = orderEsperimentiByLivello(SAMPLE_CAPITOLO.esperimenti, 'avanzato');
    expect(out[0].id).toBe('v1-cap6-esp3'); // more complex
  });

  it('prioritizes experiments matching errori_ricorrenti', () => {
    const out = orderEsperimentiByLivello(SAMPLE_CAPITOLO.esperimenti, 'intermedio', ['polarita-led']);
    expect(out[0].id).toBe('v1-cap6-esp1');
  });
});

describe('extractCitationPointers', () => {
  it('returns empty for null', () => {
    expect(extractCitationPointers(null)).toEqual([]);
  });

  it('extracts theory + experiment citations', () => {
    const ptrs = extractCitationPointers(SAMPLE_CAPITOLO);
    expect(ptrs.length).toBeGreaterThanOrEqual(2);
    expect(ptrs.some((p) => p.type === 'theory')).toBe(true);
    expect(ptrs.some((p) => p.type === 'experiment')).toBe(true);
  });
});

describe('buildTeacherSidebarSummary', () => {
  it('hands-on label', () => {
    const out = buildTeacherSidebarSummary('hands-on', SAMPLE_CAPITOLO.esperimenti);
    expect(out.stile_label).toContain('hands-on');
    expect(out.total_esperimenti).toBe(2);
  });

  it('default da-osservare', () => {
    const out = buildTeacherSidebarSummary('unknown', []);
    expect(out.stile_label).toContain('da osservare');
  });
});

describe('buildStaticFallback', () => {
  it('returns minimal fallback object', () => {
    const out = buildStaticFallback(SAMPLE_CAPITOLO);
    expect(out.capitolo_id).toBe('v1-cap6');
    expect(out.esperimenti_ordered.length).toBe(2);
    expect(out.citations.length).toBeGreaterThan(0);
  });

  it('handles null capitolo gracefully', () => {
    const out = buildStaticFallback(null);
    expect(out.capitolo_id).toBe(null);
    expect(out.esperimenti_ordered).toEqual([]);
  });
});

describe('generatePercorso', () => {
  it('returns success false when capitolo null', async () => {
    const result = await generatePercorso({ capitolo: null });
    expect(result.success).toBe(false);
  });

  it('returns enriched Percorso with capitolo + class memory + teacher memory', async () => {
    const mockLLM = vi.fn().mockResolvedValue({ content: 'Generated', tokens_used: 200, model: 'test' });
    const result = await generatePercorso({
      capitolo: SAMPLE_CAPITOLO,
      classMemory: { livello: 'intermedio', errori_ricorrenti: [] },
      teacherMemory: { stile_didattico: 'narrativo' },
      llmCall: mockLLM,
    });
    expect(result.success).toBe(true);
    expect(result.capitolo_id).toBe('v1-cap6');
    expect(result.livello).toBe('intermedio');
    expect(result.stile).toBe('narrativo');
    expect(result.esperimenti_ordered.length).toBe(2);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.teacher_sidebar_summary).toBeDefined();
    expect(result.llm_meta).toBeDefined();
    expect(mockLLM).toHaveBeenCalledOnce();
  });

  it('uses default principiante + da-osservare when memories null', async () => {
    const mockLLM = vi.fn().mockResolvedValue({ content: '', tokens_used: 0, model: 't' });
    const result = await generatePercorso({ capitolo: SAMPLE_CAPITOLO, llmCall: mockLLM });
    expect(result.livello).toBe('principiante');
    expect(result.stile).toBe('da-osservare');
  });

  it('falls back gracefully on LLM call failure', async () => {
    const failLLM = vi.fn().mockRejectedValue(new Error('network error'));
    const result = await generatePercorso({ capitolo: SAMPLE_CAPITOLO, llmCall: failLLM });
    expect(result.success).toBe(false);
    expect(result.error).toBe('llm_call_failed');
    expect(result.fallback).toBeDefined();
    expect(result.fallback.esperimenti_ordered.length).toBe(2);
  });

  it('passes liveState into prompt context', async () => {
    let capturedPrompt = '';
    const mockLLM = vi.fn().mockImplementation((p) => {
      capturedPrompt = p;
      return Promise.resolve({ content: '', tokens_used: 0, model: 't' });
    });
    await generatePercorso({
      capitolo: SAMPLE_CAPITOLO,
      liveState: { components: ['led1'] },
      llmCall: mockLLM,
    });
    expect(capturedPrompt).toContain('LIVE CIRCUIT');
    expect(capturedPrompt).toContain('led1');
  });
});
