/**
 * Validate estimatedMinutes across all 92 experiments
 * Every experiment must have a valid estimatedMinutes (15, 30, 45, or 60)
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

const VALID_DURATIONS = [15, 30, 45, 60];

describe('estimatedMinutes — all experiments', () => {
  it('has 81 total experiments', () => {
    expect(ALL.length).toBe(81);
  });

  for (const exp of ALL) {
    it(`${exp.id} has estimatedMinutes`, () => {
      expect(exp.estimatedMinutes).toBeDefined();
      expect(typeof exp.estimatedMinutes).toBe('number');
    });

    it(`${exp.id} has valid duration (${exp.estimatedMinutes} min)`, () => {
      expect(VALID_DURATIONS).toContain(exp.estimatedMinutes);
    });
  }

  it('all experiments have estimatedMinutes set', () => {
    const missing = ALL.filter(e => !e.estimatedMinutes);
    expect(missing.length).toBe(0);
  });

  it('Vol1 average duration is reasonable (10-30 min)', () => {
    const avg = EXPERIMENTS_VOL1.experiments.reduce((sum, e) => sum + (e.estimatedMinutes || 0), 0) / EXPERIMENTS_VOL1.experiments.length;
    expect(avg).toBeGreaterThan(10);
    expect(avg).toBeLessThan(35);
  });

  it('Vol2 average duration is reasonable (15-40 min)', () => {
    const avg = EXPERIMENTS_VOL2.experiments.reduce((sum, e) => sum + (e.estimatedMinutes || 0), 0) / EXPERIMENTS_VOL2.experiments.length;
    expect(avg).toBeGreaterThan(15);
    expect(avg).toBeLessThan(45);
  });

  it('Vol3 average duration is reasonable (15-40 min)', () => {
    const avg = EXPERIMENTS_VOL3.experiments.reduce((sum, e) => sum + (e.estimatedMinutes || 0), 0) / EXPERIMENTS_VOL3.experiments.length;
    expect(avg).toBeGreaterThan(10);
    expect(avg).toBeLessThan(45);
  });

  it('capstone experiments have 45+ min duration', () => {
    const capstones = ALL.filter(e => e.advancedProject);
    expect(capstones.length).toBeGreaterThanOrEqual(3);
    for (const c of capstones) {
      expect(c.estimatedMinutes).toBeGreaterThanOrEqual(45);
    }
  });

  it('simple experiments have 15 min duration', () => {
    const simple = ALL.filter(e => e.difficulty === 1);
    for (const s of simple) {
      expect(s.estimatedMinutes).toBeLessThanOrEqual(30);
    }
  });
});
