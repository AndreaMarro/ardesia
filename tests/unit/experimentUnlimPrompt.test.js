/**
 * Validate unlimPrompt across all 92 experiments
 * Every experiment should have an UNLIM prompt (not Galileo!)
 */
import { describe, it, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';

const ALL = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

describe('unlimPrompt — all experiments', () => {
  it('has 81 total experiments', () => {
    expect(ALL.length).toBe(81);
  });

  for (const exp of ALL) {
    it(`${exp.id} has unlimPrompt`, () => {
      expect(exp.unlimPrompt).toBeDefined();
      expect(typeof exp.unlimPrompt).toBe('string');
      expect(exp.unlimPrompt.length).toBeGreaterThan(20);
    });

    it(`${exp.id} unlimPrompt does NOT mention Galileo`, () => {
      if (exp.unlimPrompt) {
        expect(exp.unlimPrompt).not.toContain('Sei Galileo');
        expect(exp.unlimPrompt).not.toContain('Galileo,');
      }
    });

    it(`${exp.id} unlimPrompt mentions UNLIM or is educational`, () => {
      if (exp.unlimPrompt) {
        const hasUNLIM = exp.unlimPrompt.includes('UNLIM') || exp.unlimPrompt.includes('tutor') ||
          exp.unlimPrompt.includes('ELAB') || exp.unlimPrompt.includes('spiega') ||
          exp.unlimPrompt.includes('studente') || exp.unlimPrompt.includes('italiano');
        expect(hasUNLIM).toBe(true);
      }
    });

    it(`${exp.id} unlimPrompt is in Italian`, () => {
      if (exp.unlimPrompt) {
        // At least contains some Italian words
        const hasItalian = exp.unlimPrompt.includes('italiano') ||
          exp.unlimPrompt.includes('esperiment') || exp.unlimPrompt.includes('student') ||
          exp.unlimPrompt.includes('circuito') || exp.unlimPrompt.includes('spiega');
        expect(hasItalian).toBe(true);
      }
    });

    it(`${exp.id} unlimPrompt is educational in tone`, () => {
      if (exp.unlimPrompt) {
        // Should have educational keywords
        const hasEducational = exp.unlimPrompt.includes('semplice') || exp.unlimPrompt.includes('bambini') ||
          exp.unlimPrompt.includes('8-12') || exp.unlimPrompt.includes('8-14') ||
          exp.unlimPrompt.includes('coinvolgent') || exp.unlimPrompt.includes('analogie') ||
          exp.unlimPrompt.includes('italiano');
        expect(hasEducational).toBe(true);
      }
    });
  }

  it('no experiment has empty unlimPrompt', () => {
    const empty = ALL.filter(e => !e.unlimPrompt || e.unlimPrompt.trim().length < 10);
    expect(empty.length).toBe(0);
  });

  it('zero Galileo references remain across all prompts', () => {
    const galileoRefs = ALL.filter(e => e.unlimPrompt?.includes('Galileo'));
    expect(galileoRefs.map(e => e.id)).toEqual([]);
  });
});
