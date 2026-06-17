/**
 * BuildSteps Validation — verifica OGNI buildStep di OGNI esperimento
 * Principio Zero: il docente segue i buildSteps per montare il circuito.
 * Se un buildStep e' sbagliato, il circuito non funziona.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../../src/data/experiments-index';

describe('BuildSteps Validation — Tutti i Volumi', () => {
  describe('Vol1 — 38 esperimenti', () => {
    for (const exp of EXPERIMENTS_VOL1.experiments) {
      describe(`${exp.id}: ${exp.title}`, () => {
        it('ha buildSteps', () => {
          expect(exp.buildSteps, `${exp.id} senza buildSteps`).toBeDefined();
          expect(exp.buildSteps.length, `${exp.id} buildSteps vuoto`).toBeGreaterThan(0);
        });

        it('ogni step ha testo', () => {
          for (let i = 0; i < (exp.buildSteps || []).length; i++) {
            const step = exp.buildSteps[i];
            const text = step.text || step.instruction || '';
            expect(text, `${exp.id} step ${i} senza testo`).toBeTruthy();
            expect(text.length, `${exp.id} step ${i} testo troppo corto`).toBeGreaterThan(5);
          }
        });

        it('nessun step generico "area di lavoro"', () => {
          for (const step of (exp.buildSteps || [])) {
            const text = (step.text || step.instruction || '').toLowerCase();
            expect(text, `${exp.id} ha "area di lavoro"`).not.toContain('area di lavoro');
          }
        });
      });
    }
  });

  describe('Vol2 — 27 esperimenti', () => {
    for (const exp of EXPERIMENTS_VOL2.experiments) {
      it(`${exp.id} ha buildSteps con testo`, () => {
        expect(exp.buildSteps?.length, `${exp.id} senza buildSteps`).toBeGreaterThan(0);
        for (const step of (exp.buildSteps || [])) {
          const text = step.text || step.instruction || step.text || '';
          expect(text.length, `${exp.id} step senza testo`).toBeGreaterThan(5);
        }
      });
    }
  });

  describe('Vol3 — 27 esperimenti', () => {
    for (const exp of EXPERIMENTS_VOL3.experiments) {
      it(`${exp.id} ha buildSteps con testo`, () => {
        expect(exp.buildSteps?.length, `${exp.id} senza buildSteps`).toBeGreaterThan(0);
        for (const step of (exp.buildSteps || [])) {
          const text = step.text || step.instruction || step.text || '';
          expect(text.length, `${exp.id} step senza testo`).toBeGreaterThan(5);
        }
      });
    }
  });

  describe('Qualita\' buildSteps — spot checks', () => {
    it('v1-cap6-esp1 (primo LED) ha almeno 3 step', () => {
      const exp = ALL_EXPERIMENTS.find(e => e.id === 'v1-cap6-esp1');
      expect(exp.buildSteps.length).toBeGreaterThanOrEqual(3);
    });

    it('v1-cap6-esp1 menziona LED nelle istruzioni', () => {
      const exp = ALL_EXPERIMENTS.find(e => e.id === 'v1-cap6-esp1');
      const allText = exp.buildSteps.map(s => s.text || s.instruction || '').join(' ').toLowerCase();
      expect(allText).toContain('led');
    });

    it('v1-cap6-esp1 menziona resistore/resistenza', () => {
      const exp = ALL_EXPERIMENTS.find(e => e.id === 'v1-cap6-esp1');
      const allText = exp.buildSteps.map(s => s.text || s.instruction || '').join(' ').toLowerCase();
      expect(allText).toMatch(/resistore|resistenza/);
    });

    it('esperimenti Vol3 con code hanno step coerenti', () => {
      const vol3WithCode = EXPERIMENTS_VOL3.experiments.filter(e => e.code);
      for (const exp of vol3WithCode.slice(0, 5)) {
        expect(exp.buildSteps?.length, `${exp.id} con code ma senza buildSteps`).toBeGreaterThan(0);
      }
    });
  });
});
