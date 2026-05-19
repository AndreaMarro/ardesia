/**
 * experimentQuiz.test.js — Validate ALL quiz questions across 92 experiments
 * Structure, options, correct index bounds, no empty strings
 */
import { describe, it, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';

const ALL_EXPERIMENTS = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

describe('experimentQuiz — every experiment has quiz', () => {
  it('all 79 experiments are loaded', () => {
    expect(ALL_EXPERIMENTS.length).toBe(79);
  });

  it('every experiment has a quiz array', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.quiz, `${exp.id} missing quiz`).toBeDefined();
      expect(Array.isArray(exp.quiz), `${exp.id} quiz not array`).toBe(true);
    });
  });

  it('every experiment has at least 1 quiz question', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.quiz.length, `${exp.id} has 0 quiz questions`).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('experimentQuiz — question field', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: every quiz has non-empty question string`, () => {
      exp.quiz.forEach((q, idx) => {
        expect(typeof q.question, `${exp.id} quiz[${idx}] question not string`).toBe('string');
        expect(q.question.trim().length, `${exp.id} quiz[${idx}] question is empty`).toBeGreaterThan(0);
      });
    });
  });
});

describe('experimentQuiz — options array', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: every quiz has options array with at least 2 items`, () => {
      exp.quiz.forEach((q, idx) => {
        expect(Array.isArray(q.options), `${exp.id} quiz[${idx}] options not array`).toBe(true);
        expect(q.options.length, `${exp.id} quiz[${idx}] has ${q.options.length} options`).toBeGreaterThanOrEqual(2);
      });
    });
  });
});

describe('experimentQuiz — options are non-empty strings', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: all option values are non-empty strings`, () => {
      exp.quiz.forEach((q, idx) => {
        q.options.forEach((opt, optIdx) => {
          expect(typeof opt, `${exp.id} quiz[${idx}] opt[${optIdx}] not string`).toBe('string');
          expect(opt.trim().length, `${exp.id} quiz[${idx}] opt[${optIdx}] empty`).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('experimentQuiz — correct index within bounds', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: correct index is valid`, () => {
      exp.quiz.forEach((q, idx) => {
        expect(typeof q.correct, `${exp.id} quiz[${idx}] correct not number`).toBe('number');
        expect(q.correct, `${exp.id} quiz[${idx}] correct < 0`).toBeGreaterThanOrEqual(0);
        expect(
          q.correct,
          `${exp.id} quiz[${idx}] correct=${q.correct} >= options.length=${q.options.length}`
        ).toBeLessThan(q.options.length);
      });
    });
  });
});

describe('experimentQuiz — explanation field', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: every quiz has non-empty explanation`, () => {
      exp.quiz.forEach((q, idx) => {
        expect(typeof q.explanation, `${exp.id} quiz[${idx}] explanation not string`).toBe('string');
        expect(q.explanation.trim().length, `${exp.id} quiz[${idx}] explanation is empty`).toBeGreaterThan(0);
      });
    });
  });
});

describe('experimentQuiz — aggregate statistics', () => {
  it('total quiz questions across all experiments > 150', () => {
    const total = ALL_EXPERIMENTS.reduce((sum, e) => sum + (e.quiz || []).length, 0);
    expect(total).toBeGreaterThan(150);
  });

  it('most experiments have 2+ quiz questions', () => {
    const withMultiple = ALL_EXPERIMENTS.filter(e => (e.quiz || []).length >= 2);
    expect(withMultiple.length).toBeGreaterThan(ALL_EXPERIMENTS.length / 2);
  });

  it('no duplicate questions within the same experiment', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      const questions = exp.quiz.map(q => q.question);
      const unique = new Set(questions);
      expect(unique.size, `${exp.id} has duplicate quiz questions`).toBe(questions.length);
    });
  });

  it('correct answer is not always the first option', () => {
    const allCorrectIndices = [];
    ALL_EXPERIMENTS.forEach(e => e.quiz.forEach(q => allCorrectIndices.push(q.correct)));
    const nonZero = allCorrectIndices.filter(c => c !== 0);
    expect(nonZero.length, 'all correct answers are index 0 - suspicious').toBeGreaterThan(0);
  });

  it('questions end with ? or appropriate punctuation', () => {
    let withQuestionMark = 0;
    let total = 0;
    ALL_EXPERIMENTS.forEach(e => e.quiz.forEach(q => {
      total++;
      if (q.question.trim().endsWith('?')) withQuestionMark++;
    }));
    // At least 50% should end with ?
    expect(withQuestionMark).toBeGreaterThan(total * 0.5);
  });
});
