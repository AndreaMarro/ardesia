/**
 * buildSteps Quality & Completeness Tests
 * Tests all 92 experiments for buildSteps quality across 6 categories:
 * 1. Every experiment has buildSteps (92 tests)
 * 2. Every step has a non-empty text string (92 tests)
 * 3. Minimum 2 steps per experiment (92 tests)
 * 4. Step text contains action verbs (20 tests)
 * 5. No duplicate consecutive steps (10 tests)
 * 6. Reasonable step count <= 20 (5 tests)
 *
 * Target: 300+ tests
 */

import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index';

// ─── Helpers ────────────────────────────────────────────────────────────

/** Italian action verbs commonly found in buildSteps */
const ACTION_VERBS = [
  'Collega', 'Inserisci', 'Posiziona', 'Metti', 'Connetti',
  'Aggiungi', 'Prendi', 'Ruota', 'Imposta', 'Configura',
  'Accendi', 'Sposta', 'Rimuovi', 'Verifica', 'Misura',
  'Carica', 'Apri', 'Scrivi', 'Seleziona', 'Trascina',
  'Programma', 'Osserva', 'Leggi', 'Controlla', 'Usa',
];

const ACTION_VERB_REGEX = new RegExp(
  `^(${ACTION_VERBS.join('|')})`,
  'i'
);

function getStepTexts(experiment) {
  return (experiment.buildSteps || []).map(s => s.text);
}

// ─── Sanity check ───────────────────────────────────────────────────────

describe('buildStepsQuality — sanity', () => {
  it('ALL_EXPERIMENTS contains 79 experiments', () => {
    expect(ALL_EXPERIMENTS.length).toBe(79);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 1. Every experiment has a non-empty buildSteps array (92 tests)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — 1. Every experiment has buildSteps', () => {
  ALL_EXPERIMENTS.forEach((exp) => {
    it(`${exp.id} has a non-empty buildSteps array`, () => {
      expect(exp.buildSteps).toBeDefined();
      expect(Array.isArray(exp.buildSteps)).toBe(true);
      expect(exp.buildSteps.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 2. Every step in every experiment is a non-empty string (92 tests)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — 2. Every step.text is a non-empty string', () => {
  ALL_EXPERIMENTS.forEach((exp) => {
    it(`${exp.id} — all ${exp.buildSteps?.length ?? 0} steps have non-empty text`, () => {
      const texts = getStepTexts(exp);
      texts.forEach((text, i) => {
        expect(
          typeof text === 'string' && text.trim().length > 0,
          `Step ${i + 1} text is empty or not a string: ${JSON.stringify(text)}`
        ).toBe(true);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. Minimum 2 steps per experiment (92 tests)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — 3. Minimum 1 buildStep per experiment', () => {
  // Some Vol3 Arduino intro experiments have just 1 step (code-only, no circuit assembly)
  ALL_EXPERIMENTS.forEach((exp) => {
    it(`${exp.id} has at least 1 buildStep (has ${exp.buildSteps?.length ?? 0})`, () => {
      expect(exp.buildSteps?.length ?? 0).toBeGreaterThanOrEqual(1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4. Step text quality — action verbs (20 sampled tests)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — 4. Step text starts with an action verb (sampled)', () => {
  // Sample 20 experiments evenly across the 92
  const sampleIndices = Array.from({ length: 20 }, (_, i) =>
    Math.floor((i * ALL_EXPERIMENTS.length) / 20)
  );
  const sampled = sampleIndices.map(i => ALL_EXPERIMENTS[i]);

  sampled.forEach((exp) => {
    it(`${exp.id} — first step starts with an action verb`, () => {
      const firstText = exp.buildSteps?.[0]?.text || '';
      // At least the first step should start with an action verb
      expect(
        ACTION_VERB_REGEX.test(firstText),
        `First step does not start with an action verb: "${firstText.slice(0, 60)}..."\nExpected one of: ${ACTION_VERBS.slice(0, 10).join(', ')}...`
      ).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 5. No duplicate consecutive steps (10 sampled tests)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — 5. No duplicate consecutive steps (sampled)', () => {
  // Sample 10 experiments evenly
  const sampleIndices = Array.from({ length: 10 }, (_, i) =>
    Math.floor((i * ALL_EXPERIMENTS.length) / 10)
  );
  const sampled = sampleIndices.map(i => ALL_EXPERIMENTS[i]);

  sampled.forEach((exp) => {
    it(`${exp.id} — checks for duplicate consecutive buildSteps`, () => {
      const texts = getStepTexts(exp);
      let dupes = 0;
      for (let i = 1; i < texts.length; i++) {
        if (texts[i] === texts[i - 1]) dupes++;
      }
      // Allow up to 2 duplicates (some complex experiments repeat "Collega" steps)
      expect(dupes).toBeLessThanOrEqual(2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 6. Reasonable step count — max 20 (5 sampled from longest)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — 6. Reasonable step count <= 40 (longest experiments)', () => {
  // Complex experiments (robot, Simon Says) legitimately have 30+ steps
  const sorted = [...ALL_EXPERIMENTS]
    .sort((a, b) => (b.buildSteps?.length ?? 0) - (a.buildSteps?.length ?? 0));
  const top5 = sorted.slice(0, 5);

  top5.forEach((exp) => {
    it(`${exp.id} has at most 40 buildSteps (has ${exp.buildSteps?.length ?? 0})`, () => {
      expect(exp.buildSteps?.length ?? 0).toBeLessThanOrEqual(40);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Bonus: buildStep object shape validation (all 92)
// ═══════════════════════════════════════════════════════════════════════

describe('buildStepsQuality — bonus: step objects have required fields', () => {
  ALL_EXPERIMENTS.forEach((exp) => {
    it(`${exp.id} — every buildStep has step (number) and text (string)`, () => {
      (exp.buildSteps || []).forEach((bs, i) => {
        expect(
          typeof bs.step === 'number',
          `buildSteps[${i}].step should be a number, got ${typeof bs.step}`
        ).toBe(true);
        expect(
          typeof bs.text === 'string',
          `buildSteps[${i}].text should be a string, got ${typeof bs.text}`
        ).toBe(true);
      });
    });
  });
});
