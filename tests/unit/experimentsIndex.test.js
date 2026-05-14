/**
 * experimentsIndex — Tests for experiment aggregator and lookup
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import experimentsIndex, {
  ALL_EXPERIMENTS,
  VOLUMES,
  findExperimentById,
  getExperimentsByVolume,
  getTotalExperiments,
  getChaptersForVolume,
  EXPERIMENTS_VOL1,
  EXPERIMENTS_VOL2,
  EXPERIMENTS_VOL3,
} from '../../src/data/experiments-index';

describe('experimentsIndex', () => {
  describe('ALL_EXPERIMENTS', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(ALL_EXPERIMENTS)).toBe(true);
      expect(ALL_EXPERIMENTS.length).toBeGreaterThan(80);
    });

    it('total >= 81 experiments across 3 volumes', () => {
      expect(getTotalExperiments()).toBeGreaterThanOrEqual(81);
    });

    it('every experiment has id, title, chapter', () => {
      for (const exp of ALL_EXPERIMENTS) {
        expect(exp.id).toBeTruthy();
        expect(exp.title).toBeTruthy();
        expect(exp.chapter).toBeTruthy();
      }
    });

    it('all IDs are unique', () => {
      const ids = ALL_EXPERIMENTS.map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('VOLUMES', () => {
    it('has exactly 3 volumes', () => {
      expect(VOLUMES.length).toBe(3);
    });

    it('Vol1 has 38 experiments', () => {
      expect(EXPERIMENTS_VOL1.experiments.length).toBe(38);
    });

    it('Vol2 has 27 experiments', () => {
      expect(EXPERIMENTS_VOL2.experiments.length).toBe(27);
    });

    it('Vol3 has >= 14 experiments', () => {
      expect(EXPERIMENTS_VOL3.experiments.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('findExperimentById', () => {
    it('finds v1-cap6-esp1', () => {
      const exp = findExperimentById('v1-cap6-esp1');
      expect(exp).not.toBeNull();
      expect(exp.id).toBe('v1-cap6-esp1');
    });

    it('returns null for nonexistent ID', () => {
      expect(findExperimentById('fake-id')).toBeNull();
    });

    it('finds Vol2 experiment', () => {
      const exp = findExperimentById('v2-cap7-esp1');
      expect(exp).not.toBeNull();
    });

    it('finds Vol3 experiment', () => {
      const exp = findExperimentById('v3-cap6-semaforo');
      expect(exp).not.toBeNull();
    });
  });

  describe('getExperimentsByVolume', () => {
    it('returns Vol1 experiments', () => {
      const vol1 = getExperimentsByVolume(1);
      expect(vol1.length).toBe(38);
      expect(vol1.every(e => e.id.startsWith('v1-'))).toBe(true);
    });

    it('returns Vol2 experiments', () => {
      const vol2 = getExperimentsByVolume(2);
      expect(vol2.length).toBe(27);
    });

    it('returns empty for invalid volume', () => {
      expect(getExperimentsByVolume(99).length).toBe(0);
    });
  });

  describe('getChaptersForVolume', () => {
    it('Vol1 has multiple chapters', () => {
      const chapters = getChaptersForVolume(1);
      expect(chapters.length).toBeGreaterThan(5);
    });

    it('chapters are unique', () => {
      const chapters = getChaptersForVolume(1);
      expect(new Set(chapters).size).toBe(chapters.length);
    });
  });

  describe('default export (getStats)', () => {
    it('getStats returns correct totals', () => {
      const stats = experimentsIndex.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(81);
      expect(stats.vol1).toBe(38);
      expect(stats.vol2).toBe(27);
    });
  });
});
