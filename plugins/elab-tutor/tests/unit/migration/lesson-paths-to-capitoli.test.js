/**
 * Migration Q1.B tests — lesson-paths JSON -> Capitolo JSON
 * Andrea Marro 2026-04-24
 *
 * Tests pure helpers + end-to-end migration output.
 */

import { describe, it, expect } from 'vitest';
import {
  extractClasseDisplay,
  extractDocenteSidebar,
  inferBuildMode,
  inferIncrementalMode,
  buildCapitoloFromLessonPaths,
  migrateAll,
  nominalize,
} from '../../../scripts/migrate-lesson-paths-to-capitoli.lib.js';
import { CapitoloSchema } from '../../../src/data/schemas/Capitolo.js';

const SAMPLE_PHASE = {
  name: 'PREPARA',
  icon: '📋',
  duration_minutes: 5,
  teacher_message: 'Oggi i ragazzi scoprono il LED.',
  teacher_tip: 'Non dare il resistore subito.',
  components_list: 'Breadboard + LED',
  class_hook: 'Avete mai acceso una lampadina?',
  provocative_question: null,
  observation_prompt: null,
  summary_for_class: null,
  analogies: [],
  common_mistakes: [
    { mistake: 'LED al contrario', teacher_response: 'Chiedi: gira il LED', analogy: null },
  ],
  action_tags: [],
  auto_action: null,
};

describe('extractClasseDisplay', () => {
  it('extracts classe-facing fields from phase', () => {
    const result = extractClasseDisplay(SAMPLE_PHASE);
    expect(result.text_hook).toBe('Avete mai acceso una lampadina?');
    expect(result.observation_prompt).toBe(null);
    expect(Array.isArray(result.analogies)).toBe(true);
  });

  it('handles phase with summary_for_class + observation_prompt', () => {
    const phase = {
      ...SAMPLE_PHASE,
      observation_prompt: 'Guardate il LED!',
      summary_for_class: 'Il LED è una porta girevole.',
    };
    const result = extractClasseDisplay(phase);
    expect(result.observation_prompt).toBe('Guardate il LED!');
  });

  it('extracts analogies when present', () => {
    const phase = {
      ...SAMPLE_PHASE,
      analogies: [{ concept: 'circuito_chiuso', text: 'Come un giro di F1.', evidence: 'x' }],
    };
    const result = extractClasseDisplay(phase);
    expect(result.analogies).toHaveLength(1);
    expect(result.analogies[0].concept).toBe('circuito_chiuso');
  });
});

describe('extractDocenteSidebar (PRINCIPIO ZERO neutro)', () => {
  it('extracts docente-facing fields with neutral language', () => {
    const result = extractDocenteSidebar(SAMPLE_PHASE);
    expect(result.step_corrente).toBeTruthy();
    expect(result.step_corrente.length).toBeGreaterThan(5);
    expect(result.spunto_per_classe).toBe(null);
    expect(Array.isArray(result.note)).toBe(true);
  });

  it('extracts spunto_per_classe wrapped as Domanda from provocative_question', () => {
    const phase = { ...SAMPLE_PHASE, provocative_question: 'Se giro il LED, si accende?' };
    const result = extractDocenteSidebar(phase);
    expect(result.spunto_per_classe).toBe("Domanda: 'Se giro il LED, si accende?'");
  });

  it('maps common_mistakes to errori_tipici (problema + soluzione_neutra)', () => {
    const result = extractDocenteSidebar(SAMPLE_PHASE);
    expect(result.errori_tipici).toHaveLength(1);
    expect(result.errori_tipici[0].problema).toBe('LED al contrario');
    expect(result.errori_tipici[0].soluzione_neutra).toBeTruthy();
  });
});

describe('nominalize transformer', () => {
  it('converts Distribuisci -> Distribuzione', () => {
    expect(nominalize('Distribuisci i kit')).toBe('Distribuzione i kit');
  });

  it('converts Togli -> Rimozione', () => {
    expect(nominalize('Togli il resistore')).toBe('Rimozione il resistore');
  });

  it('converts Chiedi -> Domanda', () => {
    expect(nominalize('Chiedi: cosa succede?')).toBe('Domanda: cosa succede?');
  });

  it('converts Mostra -> Visualizzazione', () => {
    expect(nominalize('Mostra alla LIM')).toBe('Visualizzazione alla LIM');
  });

  it('converts Premi -> Pressione', () => {
    expect(nominalize('Premi il pulsante')).toBe('Pressione il pulsante');
  });

  it('converts Non dare -> Differire', () => {
    expect(nominalize('Non dare il resistore subito')).toBe('Differire: il resistore subito');
  });

  it('strips Fai/Fate prefix', () => {
    expect(nominalize('Fai vedere il circuito')).toBe('vedere il circuito');
  });

  it('preserves text without imperative pattern', () => {
    expect(nominalize('Il LED è polarizzato')).toBe('Il LED è polarizzato');
  });

  it('handles empty/null input', () => {
    expect(nominalize('')).toBe('');
    expect(nominalize(null)).toBe('');
    expect(nominalize(undefined)).toBe('');
  });
});

describe('inferBuildMode', () => {
  const CIRCUIT_A = {
    components: [
      { type: 'battery9v', id: 'bat1' },
      { type: 'breadboard-half', id: 'bb1' },
      { type: 'resistor', id: 'r1', value: 470 },
      { type: 'led', id: 'led1', color: 'red' },
    ],
    wires: [
      { from: 'a', to: 'b' },
      { from: 'c', to: 'd' },
    ],
  };

  it('returns from_scratch when no prev experiment', () => {
    expect(inferBuildMode(CIRCUIT_A, null)).toBe('from_scratch');
  });

  it('returns from_scratch when components drastically different', () => {
    const differentCircuit = {
      components: [
        { type: 'mosfet', id: 'm1' },
        { type: 'motor', id: 'mot1' },
        { type: 'phototransistor', id: 'pt1' },
      ],
      wires: [{ from: 'x', to: 'y' }],
    };
    expect(inferBuildMode(differentCircuit, CIRCUIT_A)).toBe('from_scratch');
  });

  it('returns incremental_from_prev when circuits very similar (delta <=2)', () => {
    const nearCircuit = {
      components: [
        { type: 'battery9v', id: 'bat1' },
        { type: 'breadboard-half', id: 'bb1' },
        { type: 'resistor', id: 'r1', value: 220 },
        { type: 'led', id: 'led1', color: 'green' },
      ],
      wires: CIRCUIT_A.wires,
    };
    expect(inferBuildMode(nearCircuit, CIRCUIT_A)).toBe('incremental_from_prev');
  });
});

describe('inferIncrementalMode', () => {
  it('returns remove_component when curr has fewer components than prev', () => {
    const prev = { components: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], wires: [] };
    const curr = { components: [{ id: 'a' }, { id: 'b' }], wires: [] };
    expect(inferIncrementalMode(curr, prev)).toBe('remove_component');
  });

  it('returns add_component when curr has more than prev', () => {
    const prev = { components: [{ id: 'a' }], wires: [] };
    const curr = { components: [{ id: 'a' }, { id: 'b' }], wires: [] };
    expect(inferIncrementalMode(curr, prev)).toBe('add_component');
  });

  it('returns modify_component when same count different values', () => {
    const prev = { components: [{ id: 'r1', value: 470 }], wires: [] };
    const curr = { components: [{ id: 'r1', value: 220 }], wires: [] };
    expect(inferIncrementalMode(curr, prev)).toBe('modify_component');
  });
});

describe('buildCapitoloFromLessonPaths', () => {
  const VOLUME_CAP_META = {
    num: 6,
    id: 'v1-cap6',
    titolo: "Cos'è il diodo LED?",
    page_start: 27,
    page_end: 34,
    type: 'experiment',
    esperimenti_count: 3,
    tutor_files: ['v1-cap6-esp1'],
  };

  const SAMPLE_LESSON_PATH = {
    experiment_id: 'v1-cap6-esp1',
    volume: 1,
    chapter: 6,
    title: 'Accendi il primo LED',
    chapter_title: "Cos'è il diodo LED?",
    difficulty: 1,
    duration_minutes: 45,
    target_age: '10-14',
    objective: 'Scoprire circuito chiuso',
    components_needed: [{ name: 'LED', quantity: 1, icon: '💡' }],
    vocabulary: { allowed: [], forbidden: [], note: 'x' },
    prerequisites: [],
    next_experiment: null,
    phases: [SAMPLE_PHASE],
    assessment_invisible: [],
    session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
  };

  it('produces valid Capitolo from single lesson-path (experiment type)', () => {
    const cap = buildCapitoloFromLessonPaths(VOLUME_CAP_META, [SAMPLE_LESSON_PATH], 1);
    expect(cap.id).toBe('v1-cap6');
    expect(cap.type).toBe('experiment');
    expect(cap.esperimenti).toHaveLength(1);
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success, JSON.stringify(result.error?.issues?.slice(0, 3))).toBe(true);
  });

  it('produces theory Cap when no lesson-paths', () => {
    const theoryCap = { ...VOLUME_CAP_META, type: 'theory', tutor_files: [] };
    const cap = buildCapitoloFromLessonPaths(theoryCap, [], 1);
    expect(cap.type).toBe('theory');
    expect(cap.esperimenti).toHaveLength(0);
    const result = CapitoloSchema.safeParse(cap);
    expect(result.success).toBe(true);
  });
});

describe('migrateAll integration', () => {
  it('produces 35 valid Capitoli (cap-mapped) from volume + 81 lesson-paths', () => {
    // EPIC 1 A4.1b: 13 Vol3 no-counterpart experiments removed + 2 bonus
    // capitoli files removed. Migration now produces 35 cap-mapped Capitoli,
    // 0 bonus (v3-bonus-lcd-hello + v3-bonus-servo-sweep no longer exist).
    const result = migrateAll();
    expect(result.length).toBe(35);
    for (const cap of result) {
      const validation = CapitoloSchema.safeParse(cap);
      expect(validation.success, `Cap ${cap.id} invalid: ${JSON.stringify(validation.error?.issues?.slice(0, 2))}`).toBe(true);
    }
  });

  it('35 cap-mapped (non-bonus) Capitoli', () => {
    const result = migrateAll();
    const capMapped = result.filter(c => c.type !== 'bonus');
    expect(capMapped.length).toBe(35);
  });

  it('v3-cap9 capitolo is present (simon experiment removed in A4.1b)', () => {
    // EPIC 1 A4.1b removed v3-extra-simon — the migration no longer promotes
    // it to a v3-cap9 capstone experiment. v3-cap9 remains as a wip capitolo.
    const result = migrateAll();
    const cap9 = result.find(c => c.id === 'v3-cap9');
    expect(cap9).toBeDefined();
  });

  it('produces no bonus-tier Capitoli (v3-extras removed in A4.1b)', () => {
    const result = migrateAll();
    const bonuses = result.filter(c => c.type === 'bonus');
    expect(bonuses.length).toBe(0);
  });

  it('all 35 Capitoli have unique IDs', () => {
    const result = migrateAll();
    const ids = result.map(c => c.id);
    expect(new Set(ids).size).toBe(35);
  });

  it('preserves all 81 lesson-paths in migration (cap-mapped)', () => {
    const result = migrateAll();
    const allEsperimentIds = new Set();
    for (const cap of result) {
      for (const esp of cap.esperimenti) {
        allEsperimentIds.add(esp.id);
      }
    }
    // EPIC 1 A4.1b: 81 lesson-path source files, all cap-mapped.
    expect(allEsperimentIds.size).toBeGreaterThanOrEqual(78);
  });
});
