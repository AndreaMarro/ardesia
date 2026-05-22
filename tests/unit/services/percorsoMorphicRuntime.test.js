// © Andrea Marro — 21/05/2026 — ELAB Tutor — Tutti i diritti riservati
//
// Test del runtime "Modalità Percorso morfica" (Sense 1.5) — copre i percorsi
// dell'adapter NON esercitati da percorsoMorphicAdapter.test.js:
//  - getModalitaMorphicCue (export pubblico usato da ModalitaSwitch, prima senza test)
//  - resolveUiContext via resolvePercorsoMorphicContext (4k/touch, sanitize stato)
//  - adaptPercorsoRender → transitionEmphasis + nextExperiment (string/oggetto/null)
//  - resolvePercorsoMorphicContext → mapping capitolo.id su classroom.ragChapterFocus
//  - resolveClasseContext → voiceFocus da voice_movement_log + kit inferito da material
//  - inferTeacherProfile → ramo concepts.size >= 6
//
// HIGH-D pattern (allineato a percorsoMorphicAdapter.test.js): mock esplicito di
// supabaseClient — i test iniettano options.client; il default null forza i path difensivi.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/supabaseClient.js', () => ({ default: null }));

import {
  adaptPercorsoRender,
  getModalitaMorphicCue,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('percorso morfico runtime — getModalitaMorphicCue (cue per ModalitaSwitch)', () => {
  it('deriva il profilo docente esperto dal profilo locale per il cue di modalita', () => {
    const storage = fakeStorage({
      'elab-teacher-anon-uuid': 't-cue-expert',
      'elab-morphic-teacher-profile:t-cue-expert': JSON.stringify({ experience: 'arduino_expert' }),
    });

    const cue = getModalitaMorphicCue({ storage });

    expect(cue.teacherProfile).toBe('esperto');
    expect(cue.sessionState).toBe('intro');
  });

  it('normalizza uno sessionState non valido a "intro" e accetta quelli canonici', () => {
    const storage = fakeStorage();

    expect(getModalitaMorphicCue({ storage, sessionState: 'verifica' }).sessionState).toBe('verifica');
    // 'pausa' non e' fra ['intro','costruzione','verifica','report'] -> sanitizzato a intro
    expect(getModalitaMorphicCue({ storage, sessionState: 'pausa' }).sessionState).toBe('intro');
  });

  it('senza profilo locale e senza override usa default difensivi (standard + intro)', () => {
    const cue = getModalitaMorphicCue({ storage: fakeStorage() });

    expect(cue.teacherProfile).toBe('standard');
    expect(cue.sessionState).toBe('intro');
  });
});

describe('percorso morfico runtime — resolveUiContext via resolvePercorsoMorphicContext', () => {
  it('override UI 4k alza scala a 1.18 e i CSS var morfici di conseguenza', async () => {
    const context = await resolvePercorsoMorphicContext({
      storage: fakeStorage(),
      client: null,
      ui: { resolution: '4k', pointer: 'touch', sessionState: 'costruzione' },
    });

    expect(context.ui.resolution).toBe('4k');
    expect(context.ui.scale).toBe(1.18);
    expect(context.ui.pointer).toBe('touch');
    expect(context.ui.sessionState).toBe('costruzione');
  });

  it('uno sessionState UI fuori dominio viene sanitizzato a "intro" e la scala 1080p resta 1', async () => {
    const context = await resolvePercorsoMorphicContext({
      storage: fakeStorage(),
      client: null,
      ui: { resolution: 'super-ultra', sessionState: 'boh', pointer: 'penna' },
    });

    // resolution non valida -> 1080p, scala 1; sessionState non valido -> intro; pointer non touch -> mouse
    expect(context.ui.resolution).toBe('1080p');
    expect(context.ui.scale).toBe(1);
    expect(context.ui.sessionState).toBe('intro');
    expect(context.ui.pointer).toBe('mouse');
  });

  it('lo stato di sessione UI viene letto dal localStorage quando non c\'e\' override', async () => {
    const storage = fakeStorage({ 'elab-percorso-session-state': 'report' });

    const context = await resolvePercorsoMorphicContext({ storage, client: null });

    expect(context.ui.sessionState).toBe('report');
  });
});

describe('percorso morfico runtime — adaptPercorsoRender transitionEmphasis', () => {
  it('lo stato "verifica" alza la transitionEmphasis ad "alta"', () => {
    const render = adaptPercorsoRender({
      ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
      ui: { ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.ui, sessionState: 'verifica' },
    });

    expect(render.sessionState).toBe('verifica');
    expect(render.transitionEmphasis).toBe('alta');
  });

  it('lo stato "report" imposta transitionEmphasis "sintesi", gli altri stati restano "normale"', () => {
    const report = adaptPercorsoRender({
      ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
      ui: { ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.ui, sessionState: 'report' },
    });
    const intro = adaptPercorsoRender({
      ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
      ui: { ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.ui, sessionState: 'costruzione' },
    });

    expect(report.transitionEmphasis).toBe('sintesi');
    expect(intro.transitionEmphasis).toBe('normale');
  });
});

describe('percorso morfico runtime — adaptPercorsoRender nextExperiment', () => {
  it('estrae il prossimo esperimento da next_experiment in forma di stringa', () => {
    const render = adaptPercorsoRender(DEFAULT_PERCORSO_MORPHIC_CONTEXT, {
      id: 'v1-cap6-esp1',
      next_experiment: 'v1-cap6-esp2',
    });

    expect(render.nextExperiment).toEqual({ id: 'v1-cap6-esp2', title: 'v1-cap6-esp2' });
  });

  it('preserva la forma oggetto di next_experiment con id e title distinti', () => {
    const render = adaptPercorsoRender(DEFAULT_PERCORSO_MORPHIC_CONTEXT, {
      id: 'v1-cap6-esp1',
      next_experiment: { id: 'v1-cap7-esp1', title: 'Accendi il rosso del RGB' },
    });

    expect(render.nextExperiment).toEqual({ id: 'v1-cap7-esp1', title: 'Accendi il rosso del RGB' });
  });

  it('ricade su session_save.next_suggested e restituisce null senza esperimento successivo', () => {
    const fromSessionSave = adaptPercorsoRender(DEFAULT_PERCORSO_MORPHIC_CONTEXT, {
      id: 'v1-cap6-esp1',
      session_save: { next_suggested: 'v1-cap6-esp3' },
    });
    const noNext = adaptPercorsoRender(DEFAULT_PERCORSO_MORPHIC_CONTEXT, { id: 'v1-cap6-esp9' });

    expect(fromSessionSave.nextExperiment).toEqual({ id: 'v1-cap6-esp3', title: 'v1-cap6-esp3' });
    expect(noNext.nextExperiment).toBeNull();
  });
});

describe('percorso morfico runtime — resolvePercorsoMorphicContext ragChapterFocus', () => {
  it('mappa capitolo.id su classroom.ragChapterFocus per il focus RAG del percorso', async () => {
    const context = await resolvePercorsoMorphicContext({
      storage: fakeStorage(),
      client: null,
      capitolo: { id: 'v1-cap6' },
    });

    expect(context.classroom.ragChapterFocus).toBe('v1-cap6');
  });

  it('senza capitolo il ragChapterFocus resta null (default difensivo)', async () => {
    const context = await resolvePercorsoMorphicContext({ storage: fakeStorage(), client: null });

    expect(context.classroom.ragChapterFocus).toBeNull();
  });
});

describe('percorso morfico runtime — resolveClasseContext segnali aula', () => {
  it('aggrega le zone preferite dal voice_movement_log nel voiceFocus della classe', async () => {
    const client = fakeSupabase({
      class_session_metadata: [
        { class_key: 'classe-voce', session_id: 'sess-voce', materiale_presente: {} },
      ],
      voice_movement_log: [
        { session_id: 'sess-voce', zone_preferred: ['breadboard', 'led'] },
        { session_id: 'sess-voce', zone_preferred: ['arduino'] },
      ],
    });

    const classe = await resolveClasseContext('classe-voce', { client });

    expect(client.calls).toContain('voice_movement_log');
    expect(classe.voiceFocus).toEqual(['breadboard', 'led', 'arduino']);
  });

  it('inferisce il kit "advanced" dalle chiavi materiale (servo) anche senza kit esplicito', async () => {
    const client = fakeSupabase({
      class_session_metadata: [
        {
          class_key: 'classe-servo',
          materiale_presente: { servo: 2, led: 5 },
          livello_autonomia: 'lead',
        },
      ],
      voice_movement_log: [],
    });

    const classe = await resolveClasseContext('classe-servo', { client });

    expect(classe.kitLevel).toBe('advanced');
    // visibleComponents derivati dal materiale reale, non dal preset advanced completo
    expect(classe.visibleComponents).toEqual(['servo', 'led rosso']);
    expect(classe.componentFilterExplicit).toBe(true);
  });
});

describe('percorso morfico runtime — inferTeacherProfile per concetti spiegati', () => {
  it('inferisce "esperto" quando i concetti distinti spiegati sono >= 6 anche con poche sessioni', async () => {
    const client = fakeSupabase({
      teacher_history_log: [
        {
          experiment_id: 'v1-cap6-esp1',
          concepts_explained: ['led', 'resistenza', 'polarita', 'corrente', 'tensione', 'breadboard'],
        },
      ],
      errore_ricorrente_pattern: [],
    });

    const docente = await resolveDocenteContext('00000000-0000-4000-8000-0000000000aa', { client });

    // 1 sola sessione (< 8) ma 6 concetti distinti -> ramo concepts.size >= 6
    expect(docente.profile).toBe('esperto');
    expect(docente.skipBasics).toBe(true);
    expect(docente.recentExperiments).toEqual(['v1-cap6-esp1']);
  });
});
