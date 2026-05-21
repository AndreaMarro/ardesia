/**
 * fumettoService additional coverage — Fumetto session-report feature.
 *
 * Sprint U iter 83 — Fumetto (comic session-report) feature.
 *
 * The existing `fumettoService.test.js` covers the validator + pilot/session
 * generators thoroughly, but three real behaviours of `fumettoService.js`
 * stayed untested:
 *
 *   1. `getNextExperimentForFumetto()` — only the null (no next experiment)
 *      case was covered. The happy path (resolving an actual next experiment),
 *      the `session.next_experiment` / `session.nextExperiment` fallback chain,
 *      and `fromExperimentId` derivation had ZERO coverage.
 *   2. `validateFumettoSchemaContract()` — only the broken-schema case was
 *      covered. That the real canonical `fumetto-schema.json` actually
 *      satisfies the contract was never asserted.
 *   3. `validateFumettoPayload()` panel "at most 3 balloons" rule
 *      (`fumettoService.js` `if (p.balloons.length > 3)`) had no test.
 *
 * These tests are genuine: each fails if the corresponding source logic
 * regresses.
 */
import { describe, it, expect } from 'vitest';
import {
  getNextExperimentForFumetto,
  validateFumettoSchemaContract,
  validateFumettoPayload,
  generatePilotFumetto,
} from '../../../src/services/fumettoService';

describe('fumettoService — iter 83 additional coverage', () => {
  describe('getNextExperimentForFumetto() — happy path + fallback chain', () => {
    it('resolves an explicit next_experiment argument with preview kept', () => {
      const next = getNextExperimentForFumetto({
        experimentId: 'v1-cap6-esp1',
        next_experiment: {
          id: 'v1-cap6-esp2',
          title: 'LED senza resistore',
          preview: 'Il resistore diventa il prossimo protagonista.',
        },
      });
      expect(next).toEqual({
        id: 'v1-cap6-esp2',
        title: 'LED senza resistore',
        preview: 'Il resistore diventa il prossimo protagonista.',
        fromExperimentId: 'v1-cap6-esp1',
      });
    });

    it('falls back to session.next_experiment when no explicit arg', () => {
      const next = getNextExperimentForFumetto({
        session: {
          next_experiment: { id: 'v2-cap3-esp4', title: 'Sensore di luce' },
        },
      });
      expect(next.id).toBe('v2-cap3-esp4');
      expect(next.title).toBe('Sensore di luce');
    });

    it('falls back to the camelCase session.nextExperiment alias', () => {
      const next = getNextExperimentForFumetto({
        session: {
          nextExperiment: { id: 'v3-cap8-esp2' },
        },
      });
      expect(next.id).toBe('v3-cap8-esp2');
      // title defaults to the id when not provided
      expect(next.title).toBe('v3-cap8-esp2');
    });

    it('omits preview from the result when the candidate has none', () => {
      const next = getNextExperimentForFumetto({
        experimentId: 'v1-cap7-esp1',
        next_experiment: { id: 'v1-cap7-esp2', title: 'Pulsante' },
      });
      expect(next).not.toHaveProperty('preview');
    });

    it('derives fromExperimentId from the last completed experiment when experimentId is absent', () => {
      const next = getNextExperimentForFumetto({
        session: {
          experimentsCompleted: [
            { id: 'v1-cap6-esp1' },
            { id: 'v1-cap6-esp2' },
          ],
          next_experiment: { id: 'v1-cap6-esp3', title: 'Tre LED' },
        },
      });
      expect(next.fromExperimentId).toBe('v1-cap6-esp2');
    });

    it('returns null when the next-experiment candidate has no id', () => {
      expect(
        getNextExperimentForFumetto({
          next_experiment: { title: 'senza id' },
        })
      ).toBeNull();
    });
  });

  describe('validateFumettoSchemaContract() — canonical schema passes', () => {
    it('accepts the real bundled fumetto-schema.json (no argument)', () => {
      const result = validateFumettoSchemaContract();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('flags a schema missing the studentJourney property', () => {
      const result = validateFumettoSchemaContract({
        required: ['experimentId', 'session', 'panels', 'principioZero', 'rendering'],
        properties: {
          experimentId: {},
          session: {},
          panels: {},
          principioZero: {},
          rendering: {},
          componentsUsed: {},
          // studentJourney intentionally absent
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/studentJourney/i),
        ])
      );
    });
  });

  describe('validateFumettoPayload() — panel balloons cap (max 3)', () => {
    it('rejects a panel with more than 3 balloons', () => {
      const payload = generatePilotFumetto();
      const filler = {
        speaker: 'docente',
        text: 'Ragazzi, osserviamo il kit fisico.',
        wordCount: 5,
        containsCitation: false,
        containsAnalogy: false,
      };
      // pilot panels start with 1 balloon — push to 4 total
      payload.panels[0].balloons = [filler, filler, filler, filler];
      const result = validateFumettoPayload(payload);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => /balloons must have at most 3 items/i.test(e))
      ).toBe(true);
    });

    it('accepts a panel with exactly 3 balloons', () => {
      const payload = generatePilotFumetto();
      const filler = {
        speaker: 'docente',
        text: 'Ragazzi, osserviamo il kit fisico.',
        wordCount: 5,
        containsCitation: false,
        containsAnalogy: false,
      };
      payload.panels[0].balloons = [filler, filler, filler];
      const result = validateFumettoPayload(payload);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
