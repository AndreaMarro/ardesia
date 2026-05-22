// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { describe, it, expect, vi, beforeEach } from 'vitest';

// HIGH-D fix (Phase 1 sub-iter 83.6): explicit mock supabaseClient prevents hidden network
// exposure. Tests must inject options.client. Default null forces defensive path testing.
vi.mock('../../../src/services/supabaseClient.js', () => ({ default: null }));
import {
  adaptPercorsoRender,
  resolveClasseContext,
  resolveDocenteContext,
  resolvePercorsoMorphicContext,
  DEFAULT_PERCORSO_MORPHIC_CONTEXT,
} from '../../../src/services/percorsoMorphicAdapter.js';

function fakeStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: vi.fn((key) => data.get(key) ?? null),
    setItem: vi.fn((key, value) => data.set(key, String(value))),
    removeItem: vi.fn((key) => data.delete(key)),
  };
}

function fakeSupabase(fixtures) {
  const calls = [];
  return {
    calls,
    from(table) {
      calls.push(table);
      const rows = fixtures[table] ?? [];
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        order: vi.fn(() => query),
        limit: vi.fn(async () => ({ data: rows, error: null })),
      };
      return query;
    },
  };
}

const esperimento = {
  id: 'v1-cap6-esp1',
  title_classe: 'Accendi il tuo primo LED',
  components_needed: [
    { name: 'Breadboard', quantity: 1 },
    { name: 'Batteria 9V con clip', quantity: 1 },
    { name: 'Resistore 470Ω', quantity: 1 },
    { name: 'LED rosso', quantity: 1 },
    { name: 'Fili di collegamento', quantity: 4 },
    { name: 'Sensore ultrasuoni HC-SR04', quantity: 1 },
  ],
  session_save: { next_suggested: 'v1-cap6-esp2' },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('percorsoMorphicAdapter — resolver ADR-019 Sense 1.5', () => {
  it('docente esperto riduce esempi base e salta basi gia spiegate', async () => {
    const storage = fakeStorage({
      'elab-morphic-teacher-profile:t-expert': JSON.stringify({ experience: 'expert' }),
    });

    const docente = await resolveDocenteContext('t-expert', { storage });

    expect(docente.profile).toBe('esperto');
    expect(docente.esempiBaseCount).toBe(1);
    expect(docente.microStepGranularity).toBe('compressa');
    expect(docente.skipBasics).toBe(true);
  });

  it('docente primo anno aumenta esempi, analogie e micro-step', async () => {
    const storage = fakeStorage({
      'elab-morphic-teacher-profile:t-first': JSON.stringify({ experience: 'first_year' }),
    });

    const docente = await resolveDocenteContext('t-first', { storage });

    expect(docente.profile).toBe('primo-anno');
    expect(docente.esempiBaseCount).toBe(3);
    expect(docente.analogieCount).toBe(2);
    expect(docente.microStepGranularity).toBe('espansa');
  });

  it('docente con history Supabase lunga viene inferito esperto', async () => {
    const client = fakeSupabase({
      teacher_history_log: Array.from({ length: 9 }, (_, i) => ({
        experiment_id: `v1-cap6-esp${i + 1}`,
        concepts_explained: ['led', 'resistenza'],
      })),
      errore_ricorrente_pattern: [],
    });

    const docente = await resolveDocenteContext('00000000-0000-4000-8000-000000000001', { client });

    expect(client.calls).toContain('teacher_history_log');
    expect(docente.profile).toBe('esperto');
    expect(docente.esempiBaseCount).toBe(1);
  });

  it('pattern ricorrente breadboard attiva highlight fisico proattivo', async () => {
    const client = fakeSupabase({
      teacher_history_log: [],
      errore_ricorrente_pattern: [
        { pattern_signature: 'breadboard_riga_sbagliata', detected_count: 4 },
      ],
    });

    const docente = await resolveDocenteContext('00000000-0000-4000-8000-000000000002', { client });

    expect(client.calls).toContain('errore_ricorrente_pattern');
    expect(docente.highlightFisico).toContain('breadboard');
  });

  it('eta 8 produce lessico semplice e analogie concrete', async () => {
    const storage = fakeStorage({
      'elab-morphic-class-profile:4p': JSON.stringify({ age: 8, kit: 'base', competence: 'novice' }),
    });

    const classe = await resolveClasseContext('4p', { storage });

    expect(classe.lexicalComplexity).toBe('semplice');
    expect(classe.analogyTarget).toBe('concreta');
    expect(classe.difficultyProgression).toBe('graduale');
  });

  it('eta 14 produce lessico tecnico guidato', async () => {
    const storage = fakeStorage({
      'elab-morphic-class-profile:3m': JSON.stringify({ age: 14, kit: 'advanced', competence: 'expert' }),
    });

    const classe = await resolveClasseContext('3m', { storage });

    expect(classe.lexicalComplexity).toBe('tecnica-guidata');
    expect(classe.analogyTarget).toBe('sistema');
    expect(classe.difficultyProgression).toBe('accelerata');
  });

  it('kit Omaric base espone subset 8 componenti', async () => {
    const storage = fakeStorage({
      'elab-morphic-class-profile:base': JSON.stringify({ kit: 'base' }),
    });

    const classe = await resolveClasseContext('base', { storage });

    expect(classe.kitLevel).toBe('base');
    expect(classe.visibleComponents).toHaveLength(8);
  });

  it('materiale_presente Supabase restringe componenti alla dotazione reale', async () => {
    const client = fakeSupabase({
      class_session_metadata: [
        {
          class_key: 'classe-materiale',
          materiale_presente: { led: 10, r470: 5, breadboard: true, servo: 0 },
          livello_autonomia: 'lead',
        },
      ],
      voice_movement_log: [],
    });

    const classe = await resolveClasseContext('classe-materiale', { client });

    expect(classe.visibleComponents).toEqual(['led rosso', 'resistore 470', 'breadboard']);
  });

  it('kit Omaric avanzato espone 21 componenti', async () => {
    const storage = fakeStorage({
      'elab-morphic-class-profile:adv': JSON.stringify({ kit: 'advanced' }),
    });

    const classe = await resolveClasseContext('adv', { storage });

    expect(classe.kitLevel).toBe('advanced');
    expect(classe.visibleComponents).toHaveLength(21);
  });

  it('missing context usa default difensivi senza rete obbligatoria', async () => {
    const context = await resolvePercorsoMorphicContext({ storage: fakeStorage() });

    expect(context.teacher.profile).toBe(DEFAULT_PERCORSO_MORPHIC_CONTEXT.teacher.profile);
    expect(context.classroom.kitLevel).toBe('base');
    expect(context.classroom.componentFilterExplicit).toBe(false);
    expect(context.principioZeroInvariant.opening).toBe('Ragazzi,');
  });

  it('LIM 4K e 1080p cambiano CSS vars senza cambiare contenuto canonico', () => {
    const hd = adaptPercorsoRender({
      ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
      ui: { resolution: '1080p', pointer: 'mouse', sessionState: 'intro' },
    }, esperimento);
    const fourK = adaptPercorsoRender({
      ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
      ui: { resolution: '4k', pointer: 'touch', sessionState: 'intro' },
    }, esperimento);

    expect(hd.cssVars['--percorso-morphic-scale']).toBe('1');
    expect(fourK.cssVars['--percorso-morphic-scale']).toBe('1.18');
    expect(fourK.cssVars['--percorso-touch-target']).toBe('56px');
    expect(fourK.principioZero.opening).toBe('Ragazzi,');
  });

  it('adaptPercorsoRender filtra componenti non presenti nel kit base', () => {
    const render = adaptPercorsoRender({
      ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
      classroom: {
        ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.classroom,
        visibleComponents: ['breadboard', 'batteria 9v', 'resistore 470', 'led rosso', 'fili'],
        componentFilterExplicit: true,
      },
    }, esperimento);

    expect(render.visibleComponents.map((c) => c.name)).toContain('LED rosso');
    expect(render.visibleComponents.map((c) => c.name)).not.toContain('Sensore ultrasuoni HC-SR04');
    expect(render.hiddenComponentsCount).toBe(1);
  });

  it('adaptPercorsoRender senza profilo classe esplicito preserva componenti canonici', () => {
    const render = adaptPercorsoRender(DEFAULT_PERCORSO_MORPHIC_CONTEXT, esperimento);

    expect(render.visibleComponents.map((c) => c.name)).toContain('Sensore ultrasuoni HC-SR04');
    expect(render.hiddenComponentsCount).toBe(0);
  });

  // HIGH-E fix (Phase 1 sub-iter 83.6): test selectRows defensive paths.
  it('selectRows tollera errore Supabase senza propagare', async () => {
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => ({ data: null, error: { message: 'PGRST500 simulated' } }),
            }),
          }),
        }),
      }),
    };
    const docente = await resolveDocenteContext('t-err', { client });
    expect(docente.profile).toBe('standard');
    expect(docente.recentExperiments).toEqual([]);
  });

  it('selectRows cattura exception inside query chain senza propagare', async () => {
    const client = {
      from: () => ({ select: () => { throw new Error('network down simulated'); } }),
    };
    const docente = await resolveDocenteContext('t-throw', { client });
    expect(docente.profile).toBe('standard');
    expect(docente.recentExperiments).toEqual([]);
  });

  // HIGH-F fix (Phase 1 sub-iter 83.6): test malformed concepts_explained shapes.
  it('inferTeacherProfile tollera concepts_explained malformato (string/object/null)', async () => {
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => ({
                data: [
                  { experiment_id: 'a', concepts_explained: 'string-legacy' },
                  { experiment_id: 'b', concepts_explained: null },
                  { experiment_id: 'c' },
                  { experiment_id: 'd', concepts_explained: { foo: 'bar' } },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    };
    const docente = await resolveDocenteContext('t-malformed', { client });
    expect(docente.profile).toBe('standard');
    expect(docente.recentExperiments).toContain('a');
  });

  // Codex HIGH#1 fix test: classe con metadata reale ma materiale_presente vuoto
  // NON deve abilitare componentFilterExplicit (preserva componenti canonici).
  it('classe con materiale_presente vuoto preserva componenti canonici (Codex HIGH#1)', async () => {
    const client = {
      from: (table) => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => {
                if (table === 'class_session_metadata') {
                  return {
                    data: [{
                      class_key: 'classe-no-materiale',
                      materiale_presente: {},  // schema DEFAULT '{}'
                      livello_autonomia: 'lead',
                    }],
                    error: null,
                  };
                }
                return { data: [], error: null };
              },
            }),
          }),
        }),
      }),
    };
    const classe = await resolveClasseContext('classe-no-materiale', { client });
    expect(classe.componentFilterExplicit).toBe(false);  // critical: gating off when material empty
  });
});
