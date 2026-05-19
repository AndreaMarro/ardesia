/**
 * fumettoService tests — Tea fumetto schema validator + pilot generator.
 *
 * Sprint U iter 70 Team D.
 */
import { describe, it, expect } from 'vitest';
import {
  validateFumettoPayload,
  generatePilotFumetto,
  countWords,
  isValidExperimentId,
  getFumettoSchemaMeta,
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
});
