/**
 * Capitolo schema tests — Sprint Q1.A narrative-preserving schema
 * Andrea Marro 2026-04-24
 *
 * Schema definisce unità pedagogica Capitolo (vs lesson-path per-esperimento).
 * Supporta: theory-only, experiments chain, project capstone, bonus standalone, WIP stub.
 * Chiave: narrative_flow tra esperimenti + classe_display vs docente_sidebar duality.
 */

import { describe, it, expect } from 'vitest';
import { CapitoloSchema, validateCapitolo } from '../../../src/data/schemas/Capitolo.js';

describe('CapitoloSchema — core fields', () => {
  it('accepts minimal valid theory Capitolo', () => {
    const cap = {
      id: 'v1-cap1',
      volume: 1,
      capitolo: 1,
      type: 'theory',
      titolo: "La Storia dell'Elettronica",
      titolo_classe: "La Storia dell'Elettronica",
      pageStart: 5,
      pageEnd: 8,
      theory: {
        testo_classe: 'La storia dell\'elettronica inizia nel 1800...',
        citazioni_volume: [],
        figure_refs: [],
        analogies_classe: [],
      },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(true);
  });

  it('rejects invalid volume number', () => {
    const cap = {
      id: 'v9-cap1',
      volume: 9,
      capitolo: 1,
      type: 'theory',
      titolo: 'X',
      titolo_classe: 'X',
      pageStart: 5,
      pageEnd: 8,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(false);
  });

  it('rejects missing titolo', () => {
    const cap = {
      id: 'v1-cap1',
      volume: 1,
      capitolo: 1,
      type: 'theory',
      pageStart: 5,
      pageEnd: 8,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(false);
  });

  it('accepts all valid types: theory experiment project bonus wip', () => {
    const types = ['theory', 'experiment', 'project', 'bonus', 'wip'];
    for (const type of types) {
      const cap = {
        id: `v1-cap1-${type}`,
        volume: 1,
        capitolo: 1,
        type,
        titolo: 'X',
        titolo_classe: 'X',
        pageStart: 5,
        pageEnd: 8,
        theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
        esperimenti: [],
      };
      const result = CapitoloSchema.safeParse(cap);
      expect(result.success, `type=${type}`).toBe(true);
    }
  });

  it('rejects invalid type', () => {
    const cap = {
      id: 'v1-cap1',
      volume: 1,
      capitolo: 1,
      type: 'invalid_type',
      titolo: 'X',
      titolo_classe: 'X',
      pageStart: 5,
      pageEnd: 8,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(false);
  });
});

describe('CapitoloSchema — esperimenti narrative', () => {
  it('accepts experiment with classe_display + docente_sidebar phases', () => {
    const cap = {
      id: 'v1-cap6',
      volume: 1,
      capitolo: 6,
      type: 'experiment',
      titolo: "Cos'è il diodo LED?",
      titolo_classe: "Cos'è il diodo LED?",
      pageStart: 27,
      pageEnd: 34,
      theory: {
        testo_classe: 'Un diodo LED produce luce quando attraversato da corrente.',
        citazioni_volume: [{ page: 27, quote: 'Un diodo LED è un piccolo dispositivo...', context: 'opening' }],
        figure_refs: [],
        analogies_classe: [],
      },
      narrative_flow: {
        intro_text: 'Oggi scopriamo il LED.',
        transitions: [],
        closing_text: 'Abbiamo imparato il LED.',
      },
      esperimenti: [
        {
          id: 'v1-cap6-esp1',
          num: 1,
          title_classe: 'Accendi il primo LED',
          title_docente: 'Accendi il LED',
          volume_ref: { page_start: 29, page_end: 31, fig_refs: [] },
          duration_minutes: 45,
          components_needed: [
            { name: 'LED rosso', quantity: 1, icon: 'led' },
            { name: 'Resistore 470Ω', quantity: 1, icon: 'resistor' },
          ],
          build_circuit: {
            mode: 'from_scratch',
            intent: { components: [{ type: 'led', id: 'led1' }], wires: [] },
          },
          phases: [
            {
              name: 'PREPARA',
              duration_minutes: 5,
              classe_display: {
                text_hook: 'Avete mai acceso una lampadina?',
                observation_prompt: null,
                analogies: [],
              },
              docente_sidebar: {
                step_corrente: 'Distribuzione kit alla classe',
                spunto_per_classe: null,
                note: ['Resistore: distribuzione differita post-scoperta autonoma'],
                errori_tipici: [],
              },
              action_tags: [],
              auto_action: null,
            },
          ],
          assessment_invisible: [],
          session_save: {
            concepts_covered: ['circuito_chiuso'],
            next_suggested: 'v1-cap6-esp2',
            resume_message: 'Ultima volta hai acceso il LED.',
          },
        },
      ],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(true);
  });

  it('accepts experiment with incremental_from_prev build mode', () => {
    const cap = {
      id: 'v1-cap6',
      volume: 1,
      capitolo: 6,
      type: 'experiment',
      titolo: 'LED',
      titolo_classe: 'LED',
      pageStart: 27,
      pageEnd: 34,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [
        {
          id: 'v1-cap6-esp3',
          num: 3,
          title_classe: 'Cambia luminosità',
          title_docente: 'Cambia luminosità',
          volume_ref: { page_start: 33, page_end: 33, fig_refs: [] },
          duration_minutes: 45,
          components_needed: [],
          build_circuit: {
            mode: 'incremental_from_prev',
            incremental_delta: {
              base_experiment_id: 'v1-cap6-esp1',
              operations: [
                { op: 'modify', target: 'r1', params: { value: 220 } },
              ],
            },
          },
          phases: [],
          assessment_invisible: [],
          session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
        },
      ],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(true);
  });

  it('rejects build_circuit with mode from_scratch missing intent', () => {
    const cap = {
      id: 'v1-cap6',
      volume: 1,
      capitolo: 6,
      type: 'experiment',
      titolo: 'X',
      titolo_classe: 'X',
      pageStart: 27,
      pageEnd: 34,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [
        {
          id: 'v1-cap6-esp1',
          num: 1,
          title_classe: 'X',
          title_docente: 'X',
          volume_ref: { page_start: 29, page_end: 31, fig_refs: [] },
          duration_minutes: 45,
          components_needed: [],
          build_circuit: { mode: 'from_scratch' }, // missing intent
          phases: [],
          assessment_invisible: [],
          session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
        },
      ],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(false);
  });

  it('rejects build_circuit with mode incremental_from_prev missing incremental_delta', () => {
    const cap = {
      id: 'v1-cap6',
      volume: 1,
      capitolo: 6,
      type: 'experiment',
      titolo: 'X',
      titolo_classe: 'X',
      pageStart: 27,
      pageEnd: 34,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [
        {
          id: 'v1-cap6-esp3',
          num: 3,
          title_classe: 'X',
          title_docente: 'X',
          volume_ref: { page_start: 33, page_end: 33, fig_refs: [] },
          duration_minutes: 45,
          components_needed: [],
          build_circuit: { mode: 'incremental_from_prev' }, // missing incremental_delta
          phases: [],
          assessment_invisible: [],
          session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
        },
      ],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(false);
  });
});

describe('CapitoloSchema — narrative_flow transitions', () => {
  it('accepts narrative_flow with transition between esperimenti', () => {
    const cap = {
      id: 'v1-cap6',
      volume: 1,
      capitolo: 6,
      type: 'experiment',
      titolo: 'LED',
      titolo_classe: 'LED',
      pageStart: 27,
      pageEnd: 34,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      narrative_flow: {
        intro_text: 'Oggi il LED.',
        transitions: [
          {
            between: ['v1-cap6-esp1', 'v1-cap6-esp2'],
            text_classe: 'Abbiamo acceso il LED. Ma senza resistore?',
            text_docente_action: 'Togliete il resistore. Chiedete cosa cambia.',
            incremental_mode: 'remove_component',
          },
        ],
        closing_text: 'Fine Cap.',
      },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(true);
  });

  it('rejects invalid incremental_mode in transition', () => {
    const cap = {
      id: 'v1-cap6',
      volume: 1,
      capitolo: 6,
      type: 'experiment',
      titolo: 'LED',
      titolo_classe: 'LED',
      pageStart: 27,
      pageEnd: 34,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      narrative_flow: {
        intro_text: 'x',
        transitions: [
          {
            between: ['v1-cap6-esp1', 'v1-cap6-esp2'],
            text_classe: 'x',
            text_docente_action: 'x',
            incremental_mode: 'magic',
          },
        ],
        closing_text: 'x',
      },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(false);
  });
});

describe('CapitoloSchema — bonus tier', () => {
  it('accepts bonus type with capitolo null', () => {
    const cap = {
      id: 'v3-bonus-lcd',
      volume: 3,
      capitolo: null,
      type: 'bonus',
      titolo: 'LCD Hello',
      titolo_classe: 'LCD Hello',
      pageStart: null,
      pageEnd: null,
      theory: { testo_classe: '', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [],
    };
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(true);
  });
});

describe('validateCapitolo helper', () => {
  it('returns { valid: true } for valid Capitolo', () => {
    const cap = {
      id: 'v1-cap1',
      volume: 1,
      capitolo: 1,
      type: 'theory',
      titolo: 'X',
      titolo_classe: 'X',
      pageStart: 5,
      pageEnd: 8,
      theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
      esperimenti: [],
    };
    const result = validateCapitolo(cap);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns { valid: false, errors } for invalid Capitolo', () => {
    const cap = { id: 'bad' };
    const result = validateCapitolo(cap);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
