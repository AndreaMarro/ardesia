/**
 * fumettoService tests — Tea fumetto schema validator + pilot generator.
 *
 * Sprint U iter 70 Team D.
 */
import { describe, it, expect } from 'vitest';
import {
  validateFumettoPayload,
  generatePilotFumetto,
  generateSessionFumetto,
  countWords,
  isValidExperimentId,
  getFumettoSchemaMeta,
  validateFumettoSchemaContract,
  buildSessionReportComicModel,
  getNextExperimentForFumetto,
  FUMETTO_ENUMS,
  WORD_LIMIT_PER_BALLOON,
  MIN_PANELS,
  MAX_PANELS,
} from '../../../src/services/fumettoService';

describe('fumettoService — Tea iter 70 D', () => {
  describe('constants', () => {
    it('exposes FUMETTO_ENUMS frozen', () => {
      expect(Object.isFrozen(FUMETTO_ENUMS)).toBe(true);
    });

    it('panel roles match Tea spec (6 canonical)', () => {
      expect(FUMETTO_ENUMS.panelRoles).toEqual([
        'problema',
        'ipotesi',
        'errore',
        'click',
        'successo',
        'ponte',
      ]);
    });

    it('tag colors are canonical ELAB palette names', () => {
      expect(FUMETTO_ENUMS.tagColors).toEqual(['navy', 'lime', 'orange', 'red']);
    });

    it('WORD_LIMIT_PER_BALLOON = 60', () => {
      expect(WORD_LIMIT_PER_BALLOON).toBe(60);
    });

    it('MIN_PANELS = 4 and MAX_PANELS = 6', () => {
      expect(MIN_PANELS).toBe(4);
      expect(MAX_PANELS).toBe(6);
    });
  });

  describe('countWords()', () => {
    it('returns 0 for empty / non-strings', () => {
      expect(countWords('')).toBe(0);
      expect(countWords(null)).toBe(0);
      expect(countWords(undefined)).toBe(0);
      expect(countWords(42)).toBe(0);
    });

    it('counts simple ASCII words', () => {
      expect(countWords('one two three')).toBe(3);
    });

    it('handles multiple spaces / newlines', () => {
      expect(countWords('  one   two\nthree  ')).toBe(3);
    });

    it('counts Italian + punctuation', () => {
      expect(countWords('Ragazzi, oggi accendiamo un LED.')).toBe(5);
    });
  });

  describe('isValidExperimentId()', () => {
    it('accepts canonical pattern', () => {
      expect(isValidExperimentId('v1-cap6-esp1')).toBe(true);
      expect(isValidExperimentId('v3-cap12-esp4')).toBe(true);
    });

    it('rejects malformed IDs', () => {
      expect(isValidExperimentId('v4-cap1-esp1')).toBe(false); // volume > 3
      expect(isValidExperimentId('vol1-cap6-esp1')).toBe(false);
      expect(isValidExperimentId('v1-chapter6-esp1')).toBe(false);
      expect(isValidExperimentId(null)).toBe(false);
      expect(isValidExperimentId(undefined)).toBe(false);
      expect(isValidExperimentId(42)).toBe(false);
    });
  });

  describe('generatePilotFumetto()', () => {
    it('produces a valid payload by default', () => {
      const p = generatePilotFumetto();
      const result = validateFumettoPayload(p);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('honors custom experimentId', () => {
      const p = generatePilotFumetto({ experimentId: 'v2-cap3-esp2' });
      expect(p.experimentId).toBe('v2-cap3-esp2');
    });

    it('throws on invalid experimentId', () => {
      expect(() => generatePilotFumetto({ experimentId: 'bogus' })).toThrow();
    });

    it('default produces 6 canonical panels', () => {
      const p = generatePilotFumetto();
      expect(p.panels).toHaveLength(6);
      const roles = p.panels.map((x) => x.role);
      expect(roles).toEqual([
        'problema',
        'ipotesi',
        'errore',
        'click',
        'successo',
        'ponte',
      ]);
    });

    it('all balloons honor word limit', () => {
      const p = generatePilotFumetto();
      for (const panel of p.panels) {
        for (const b of panel.balloons) {
          expect(countWords(b.text)).toBeLessThanOrEqual(WORD_LIMIT_PER_BALLOON);
        }
      }
    });

    it('at least one balloon opens with "Ragazzi"', () => {
      const p = generatePilotFumetto();
      const openers = p.panels
        .flatMap((x) => x.balloons)
        .filter((b) => /^Ragazzi/.test(b.text));
      expect(openers.length).toBeGreaterThanOrEqual(1);
    });

    it('includes at least one Vol/pag verbatim citation', () => {
      const p = generatePilotFumetto();
      const cited = p.panels
        .flatMap((x) => x.balloons)
        .filter((b) => /Vol\.?\s*\d+\s*pag\.?\s*\d+/i.test(b.text));
      expect(cited.length).toBeGreaterThanOrEqual(1);
    });

    it('honors custom classKey + anonStudentId', () => {
      const p = generatePilotFumetto({
        classKey: 'classe-2b',
        anonStudentId: '11111111-1111-4111-8111-111111111111',
      });
      expect(p.session.classKey).toBe('classe-2b');
      expect(p.session.anonStudentId).toBe(
        '11111111-1111-4111-8111-111111111111'
      );
    });

    it('produces rendering.outputPath using anonId + experimentId', () => {
      const p = generatePilotFumetto({
        anonStudentId: '99999999-9999-4999-8999-999999999999',
        experimentId: 'v1-cap6-esp1',
      });
      expect(p.rendering.outputPath).toContain(
        '99999999-9999-4999-8999-999999999999'
      );
      expect(p.rendering.outputPath).toContain('v1-cap6-esp1');
    });

    it('principioZero defaults to passed:true score:100 placeholders', () => {
      const p = generatePilotFumetto();
      expect(p.principioZero.passed).toBe(true);
      expect(p.principioZero.score).toBe(100);
      for (const rule of Object.values(p.principioZero.rules)) {
        expect(rule).toBe(true);
      }
    });
  });

  describe('validateFumettoPayload()', () => {
    it('rejects null / non-object payloads', () => {
      expect(validateFumettoPayload(null).valid).toBe(false);
      expect(validateFumettoPayload(undefined).valid).toBe(false);
      expect(validateFumettoPayload('string').valid).toBe(false);
    });

    it('reports missing experimentId', () => {
      const r = validateFumettoPayload({});
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => e.includes('experimentId'))).toBe(true);
    });

    it('reports invalid experimentId format', () => {
      const p = generatePilotFumetto();
      p.experimentId = 'bogus-id';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => e.includes('experimentId'))).toBe(true);
    });

    it('reports out-of-range panels count', () => {
      const p = generatePilotFumetto();
      p.panels = p.panels.slice(0, 2); // 2 < MIN_PANELS
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /panels.length/i.test(e))).toBe(true);
    });

    it('reports invalid panel role enum', () => {
      const p = generatePilotFumetto();
      p.panels[0].role = 'meditazione';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /role/i.test(e))).toBe(true);
    });

    it('reports balloon exceeding word limit', () => {
      const p = generatePilotFumetto();
      p.panels[0].balloons[0].text = ('parola '.repeat(70)).trim();
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /word limit/i.test(e))).toBe(true);
    });

    it('warns when wordCount mismatch', () => {
      const p = generatePilotFumetto();
      p.panels[0].balloons[0].wordCount = 999;
      const r = validateFumettoPayload(p);
      expect(r.warnings.some((w) => /wordCount/.test(w))).toBe(true);
    });

    it('reports invalid speaker enum', () => {
      const p = generatePilotFumetto();
      p.panels[0].balloons[0].speaker = 'preside';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /speaker/i.test(e))).toBe(true);
    });

    it('reports invalid rendering.format', () => {
      const p = generatePilotFumetto();
      p.rendering.format = 'docx';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /rendering.format/i.test(e))).toBe(true);
    });

    it('reports Tea schema drift: panel extra fields are not allowed', () => {
      const p = generatePilotFumetto();
      p.panels[0].notesPrompt = 'Spazio appunti fuori schema';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /panels\[0\]\.notesPrompt.*not allowed/i.test(e))).toBe(true);
    });

    it('reports Tea schema drift: componentsUsed requires kitId', () => {
      const p = generatePilotFumetto();
      delete p.componentsUsed[0].kitId;
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /componentsUsed\[0\]\.kitId is required/i.test(e))).toBe(true);
    });

    it('reports Tea schema drift: captionColor and morphicHints enums are enforced', () => {
      const p = generatePilotFumetto();
      p.panels[0].captionColor = 'red';
      p.morphicHints.studentLevel = 'sessione-reale';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /captionColor/i.test(e))).toBe(true);
      expect(r.errors.some((e) => /morphicHints\.studentLevel/i.test(e))).toBe(true);
    });

    it('reports Tea schema drift: required panel fields and sceneType are enforced', () => {
      const p = generatePilotFumetto();
      delete p.panels[0].scene;
      delete p.panels[1].balloons;
      p.panels[2].scene.sceneType = 'magia';
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /panels\[0\]\.scene is required/i.test(e))).toBe(true);
      expect(r.errors.some((e) => /panels\[1\]\.balloons is required/i.test(e))).toBe(true);
      expect(r.errors.some((e) => /scene\.sceneType/i.test(e))).toBe(true);
    });

    it('reports Tea schema drift: required balloon fields are enforced', () => {
      const p = generatePilotFumetto();
      delete p.panels[0].balloons[0].text;
      delete p.panels[1].balloons[0].wordCount;
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /balloons\[0\]\.text is required/i.test(e))).toBe(true);
      expect(r.errors.some((e) => /balloons\[0\]\.wordCount is required/i.test(e))).toBe(true);
    });

    it('reports missing required session fields', () => {
      const p = generatePilotFumetto();
      delete p.session.classKey;
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /session.classKey/.test(e))).toBe(true);
    });

    it('rejects out-of-bound principioZero score', () => {
      const p = generatePilotFumetto();
      p.principioZero.score = 200;
      const r = validateFumettoPayload(p);
      expect(r.valid).toBe(false);
      expect(r.errors.some((e) => /principioZero.score/i.test(e))).toBe(true);
    });
  });

  describe('getFumettoSchemaMeta()', () => {
    it('returns id + version + title from the canonical schema', () => {
      const meta = getFumettoSchemaMeta();
      expect(meta.id).toContain('fumetto');
      expect(meta.version).toBe('1.0');
      expect(meta.title).toMatch(/ELAB Tutor/i);
    });
  });

  describe('iter 83 edge cases — session report bridge', () => {
    it('handles empty session as 6 placeholders with an honest warning', () => {
      const model = buildSessionReportComicModel({});
      expect(model.vignettes).toHaveLength(6);
      expect(model.vignettes.every((slot) => slot.exp === null)).toBe(true);
      expect(model.warnings).toContain('empty_session');
    });

    it('rejects broken Tea schema shape before report generation', () => {
      const result = validateFumettoSchemaContract({
        title: 'broken',
        properties: {},
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/schema\.properties\.panels/i),
        ])
      );
    });

    it('keeps missing specific assets graceful with fallback URL and warning', () => {
      const model = buildSessionReportComicModel({
        experimentsCompleted: [
          { id: 'v3-cap8-esp3', title: 'Seriale avanzata', volume: 3 },
        ],
      });
      expect(model.vignettes[0].assetUrl).toBe('/brand/foto-esperimenti/vol3/_generic-vol3-cover.webp');
      expect(model.warnings).toContain('missing_specific_asset:v3-cap8-esp3');
    });

    it('turns one saved experiment into a complete 6-panel narrative arc', () => {
      const model = buildSessionReportComicModel({
        experimentsCompleted: [
          { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
        ],
        narrations: {
          'v1-cap6-esp1': 'Ragazzi, prova realistica completa: il LED si accende dopo il controllo del kit fisico.',
        },
        studentJourney: {
          mistakesMade: [{ description: 'LED montato al contrario' }],
        },
      });

      expect(model.vignettes).toHaveLength(6);
      expect(model.vignettes.every((slot) => slot.exp?.id === 'v1-cap6-esp1')).toBe(true);
      expect(model.vignettes.map((slot) => slot.role)).toEqual([
        'problema',
        'ipotesi',
        'errore',
        'click',
        'successo',
        'ponte',
      ]);
      expect(model.vignettes.slice(1).every((slot) => slot.isSessionArcContinuation)).toBe(true);
      expect(model.vignettes[2].narration).toMatch(/LED montato al contrario/i);
    });

    it('returns null for missing next_experiment instead of dead CTA data', () => {
      const next = getNextExperimentForFumetto({
        experimentId: 'v1-cap14-esp1',
      });
      expect(next).toBeNull();
    });

    it('makes the report unique to the actual session journey', () => {
      const base = {
        studentAlias: 'Classe A',
        classKey: 'classe-a',
        startedAt: '2026-05-20T08:00:00Z',
        experimentsCompleted: [
          { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
        ],
        componentsUsed: ['LED rosso', 'resistore 470 Ohm', 'breadboard'],
      };
      const first = buildSessionReportComicModel({
        ...base,
        studentJourney: {
          mistakesMade: [{ description: 'LED montato al contrario' }],
          helpRequestsCount: 1,
        },
      });
      const second = buildSessionReportComicModel({
        ...base,
        studentAlias: 'Classe B',
        studentJourney: {
          variationsTriedSpontaneously: ['cambio del colore del LED'],
          helpRequestsCount: 0,
        },
      });

      expect(first.sessionFingerprint).not.toBe(second.sessionFingerprint);
      expect(first.vignettes[0].sessionEvidence).toMatch(/LED montato al contrario/i);
      expect(second.vignettes[0].sessionEvidence).toMatch(/cambio del colore del LED/i);
    });

    it('builds didactic exercises and notes space from components and journey evidence', () => {
      const model = buildSessionReportComicModel({
        experimentsCompleted: [
          { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
        ],
        componentsUsed: ['LED rosso', 'resistore 470 Ohm', 'batteria 9V'],
        studentJourney: {
          mistakesOvercome: ['mancava il resistore'],
          helpRequestsCount: 2,
        },
      });

      expect(model.exercisePrompts).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Ragazzi.*kit fisico/i),
          expect.stringMatching(/resistore 470 Ohm/i),
        ])
      );
      expect(model.notesPrompt).toMatch(/Spazio appunti/i);
      expect(model.notesPrompt).toMatch(/mancava il resistore/i);
      expect(model.multipleChoiceQuestions).toHaveLength(3);
      expect(model.multipleChoiceQuestions[0].question).toMatch(/Ragazzi.*prova/i);
      expect(model.multipleChoiceQuestions[0].options.join(' ')).toMatch(/mancava il resistore/i);
      expect(model.multipleChoiceQuestions[0].options[model.multipleChoiceQuestions[0].correctIndex]).toMatch(/mancava il resistore/i);
      expect(model.multipleChoiceQuestions.some((question) => question.correctIndex !== 0)).toBe(true);
      expect(model.diaryPage.title).toMatch(/Pagina diario/i);
      expect(model.diaryPage.prompts.join(' ')).toMatch(/Vol\.1 pag\./i);
      expect(model.diaryPage.prompts.join(' ')).toMatch(/kit fisico|LED rosso/i);
      expect(model.imageGenerationBriefs).toHaveLength(6);
      expect(model.imageGenerationBriefs[0].prompt).toMatch(/ELAB Tea flat vector|kit fisico/i);
      expect(model.imageGenerationBriefs[0].mascotAsset).toBe('/assets/mascot/logo-senza-sfondo.png');
      expect(model.imageGenerationBriefs[2].prompt).toMatch(/UNLIM canonico Tea/i);
    });

    it('generates a Tea-valid comic payload from a real session, not a static template', () => {
      const payload = generateSessionFumetto({
        session: {
          classKey: 'classe-generazione',
          anonStudentId: '22222222-2222-4222-8222-222222222222',
          startedAt: '2026-05-20T08:00:00.000Z',
          completedAt: '2026-05-20T08:08:00.000Z',
          experimentsCompleted: [
            { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
          ],
          componentsUsed: ['LED rosso', 'resistore 470 Ohm', 'breadboard'],
          studentJourney: {
            mistakesMade: [{ description: 'LED montato al contrario' }],
            mistakesOvercome: ['LED montato al contrario'],
            variationsTriedSpontaneously: ['cambio del colore del LED'],
            helpRequestsCount: 1,
          },
          next_experiment: {
            id: 'v1-cap6-esp2',
            title: 'LED senza resistore',
            preview: 'Il resistore del kit fisico diventa il prossimo protagonista.',
          },
        },
      });

      expect(validateFumettoPayload(payload).valid).toBe(true);
      expect(payload.panels.map((panel) => panel.role)).toEqual([
        'problema',
        'ipotesi',
        'errore',
        'click',
        'successo',
        'ponte',
      ]);
      expect(payload.rendering.outputPath).toContain('22222222-2222-4222-8222-222222222222');
      expect(payload.rendering.outputPath).toContain(payload.morphicHints.sessionFingerprint);
      expect(JSON.stringify(payload.panels)).toMatch(/LED montato al contrario/i);
      expect(payload.morphicHints.exercisePrompts.join(' ')).toMatch(/kit fisico/i);
      expect(payload.morphicHints.notesPrompt).toMatch(/Spazio appunti/i);
      expect(payload.morphicHints.multipleChoiceQuestions).toHaveLength(3);
      expect(payload.morphicHints.multipleChoiceQuestions[0].options.join(' ')).toMatch(/LED montato al contrario/i);
      expect(payload.morphicHints.multipleChoiceQuestions[0].options[payload.morphicHints.multipleChoiceQuestions[0].correctIndex]).toMatch(/LED montato al contrario/i);
      expect(payload.morphicHints.diaryPage.prompts.join(' ')).toMatch(/LED montato al contrario|Vol\.1 pag\./i);
      expect(payload.morphicHints.mascot.name).toBe('UNLIM');
      expect(payload.morphicHints.mascot.asset).toBe('/assets/mascot/logo-senza-sfondo.png');
      expect(payload.morphicHints.imageGenerationBriefs).toHaveLength(6);
      expect(payload.morphicHints.imageGenerationBriefs[0].prompt).toMatch(/LED montato al contrario|kit fisico/i);
      expect(payload.componentsUsed.every((component) => component.kitId)).toBe(true);
      expect(payload.studentJourney.mistakesMade[0].type).toBe('other');
      expect(payload.morphicHints.studentLevel).toBe('basic');
      expect(payload.panels.every((panel) => !('exercisePrompt' in panel))).toBe(true);
      expect(payload.panels.every((panel) => !('notesPrompt' in panel))).toBe(true);
      expect(payload.panels.every((panel) => ['navy', 'lime', 'orange'].includes(panel.captionColor))).toBe(true);
    });

    it('generation changes when the session journey changes for the same experiment', () => {
      const baseSession = {
        classKey: 'classe-generazione',
        anonStudentId: '33333333-3333-4333-8333-333333333333',
        startedAt: '2026-05-20T08:00:00.000Z',
        completedAt: '2026-05-20T08:08:00.000Z',
        experimentsCompleted: [
          { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
        ],
        componentsUsed: ['LED rosso', 'resistore 470 Ohm', 'breadboard'],
      };

      const first = generateSessionFumetto({
        session: {
          ...baseSession,
          studentJourney: { mistakesMade: [{ description: 'LED invertito' }] },
        },
      });
      const second = generateSessionFumetto({
        session: {
          ...baseSession,
          studentJourney: { variationsTriedSpontaneously: ['resistore da 220 Ohm provato'] },
        },
      });

      expect(first.morphicHints.sessionFingerprint).not.toBe(second.morphicHints.sessionFingerprint);
      expect(first.panels[2].balloons[0].text).toMatch(/LED invertito/i);
      expect(second.panels[2].balloons[0].text).toMatch(/resistore da 220 Ohm provato/i);
    });

    it('keeps generated balloons Tea-valid even with very long session evidence', () => {
      const longMistake = Array.from({ length: 95 }, (_, index) => `errore${index}`).join(' ');
      const payload = generateSessionFumetto({
        session: {
          classKey: 'classe-generazione',
          anonStudentId: '44444444-4444-4444-8444-444444444444',
          startedAt: '2026-05-20T08:00:00.000Z',
          completedAt: '2026-05-20T08:08:00.000Z',
          experimentsCompleted: [
            { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
          ],
          studentJourney: {
            mistakesMade: [{ description: longMistake }],
          },
        },
      });

      expect(validateFumettoPayload(payload).valid).toBe(true);
      expect(payload.panels.flatMap((panel) => panel.balloons).every((balloon) => (
        countWords(balloon.text) <= WORD_LIMIT_PER_BALLOON &&
        balloon.wordCount === countWords(balloon.text)
      ))).toBe(true);
    });

    it('generation rejects invalid experimentId before producing a payload', () => {
      expect(() => generateSessionFumetto({
        experimentId: 'v3-extra-simon',
        session: { experimentsCompleted: [] },
      })).toThrow(/invalid experimentId/i);
    });
  });
});
