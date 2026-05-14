/**
 * Validate experiment icons and metadata fields
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

describe('Experiment icons and metadata', () => {
  for (const exp of ALL) {
    it(`${exp.id} has an icon or is extra`, () => {
      if (!exp.id.includes('extra')) {
        expect(exp.icon).toBeDefined();
        expect(exp.icon.length).toBeGreaterThan(0);
      }
    });

    it(`${exp.id} has a title`, () => {
      expect(exp.title).toBeDefined();
      expect(exp.title.length).toBeGreaterThan(3);
    });

    it(`${exp.id} has a desc`, () => {
      expect(exp.desc).toBeDefined();
      expect(exp.desc.length).toBeGreaterThan(5);
    });

    it(`${exp.id} has a chapter or is extra`, () => {
      if (!exp.id.includes('extra')) {
        expect(exp.chapter).toBeDefined();
        expect(exp.chapter).toContain('Capitolo');
      }
    });

    it(`${exp.id} has valid difficulty (1-3)`, () => {
      expect(exp.difficulty).toBeDefined();
      expect(exp.difficulty).toBeGreaterThanOrEqual(1);
      expect(exp.difficulty).toBeLessThanOrEqual(3);
    });

    it(`${exp.id} has valid simulationMode`, () => {
      expect(exp.simulationMode).toBeDefined();
      expect(['circuit', 'avr']).toContain(exp.simulationMode);
    });

    it(`${exp.id} has components array`, () => {
      expect(Array.isArray(exp.components)).toBe(true);
      expect(exp.components.length).toBeGreaterThan(0);
    });

    it(`${exp.id} has concept field`, () => {
      expect(exp.concept).toBeDefined();
      expect(exp.concept.length).toBeGreaterThan(3);
    });

    it(`${exp.id} has layer field`, () => {
      expect(exp.layer).toBeDefined();
      expect(typeof exp.layer).toBe('string');
    });
  }

  it('all non-extra experiments have icons', () => {
    const blank = ALL.filter(e => !e.id.includes('extra') && (!e.icon || e.icon.trim() === ''));
    expect(blank.map(e => e.id)).toEqual([]);
  });

  it('no duplicate experiment IDs', () => {
    const ids = ALL.map(e => e.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it('Vol1 has 38 experiments', () => {
    expect(EXPERIMENTS_VOL1.experiments.length).toBe(38);
  });

  it('Vol2 has 27 experiments', () => {
    expect(EXPERIMENTS_VOL2.experiments.length).toBe(27);
  });

  it('Vol3 has 16 experiments', () => {
    expect(EXPERIMENTS_VOL3.experiments.length).toBe(16);
  });
});
