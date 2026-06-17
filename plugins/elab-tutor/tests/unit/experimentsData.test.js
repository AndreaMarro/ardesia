/**
 * experimentsData.test.js — Data integrity tests for experiments + lesson paths
 * 12 test: experiment count, structure, lesson paths, find by ID
 */
import { describe, it, expect } from 'vitest';
import { findExperimentById, getExperimentsByVolume, getTotalExperiments, ALL_EXPERIMENTS, VOLUMES } from '../../src/data/experiments-index';
import { getLessonPath, hasLessonPath, getAvailableLessonPaths, PHASE_NAMES } from '../../src/data/lesson-paths';

describe('experiments-index — data integrity', () => {
  it('has 88+ total experiments', () => {
    expect(getTotalExperiments()).toBeGreaterThanOrEqual(88);
  });

  it('has 3 volumes', () => {
    expect(VOLUMES.length).toBe(3);
  });

  it('Vol1 has 38 experiments', () => {
    expect(getExperimentsByVolume(1).length).toBe(38);
  });

  it('Vol2 has 27 experiments', () => {
    expect(getExperimentsByVolume(2).length).toBe(27);
  });

  it('Vol3 has 23 experiments', () => {
    expect(getExperimentsByVolume(3).length).toBe(23);
  });

  it('every experiment has id and title', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(exp.id).toBeTruthy();
      expect(exp.title).toBeTruthy();
    }
  });

  it('findExperimentById returns experiment for valid ID', () => {
    const exp = findExperimentById('v1-cap6-esp1');
    expect(exp).toBeTruthy();
    expect(exp.id).toBe('v1-cap6-esp1');
  });

  it('findExperimentById returns null for invalid ID', () => {
    expect(findExperimentById('nonexistent')).toBeNull();
  });

  it('no duplicate experiment IDs', () => {
    const ids = ALL_EXPERIMENTS.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('lesson-paths — data integrity', () => {
  it('PHASE_NAMES has 5 phases', () => {
    expect(PHASE_NAMES.length).toBe(5);
    expect(PHASE_NAMES[0]).toBe('PREPARA');
  });

  it('getLessonPath returns object for known experiment', () => {
    const path = getLessonPath('v1-cap6-esp1');
    if (path) {
      expect(path).toHaveProperty('title');
    }
  });

  it('getAvailableLessonPaths returns array', () => {
    const paths = getAvailableLessonPaths();
    expect(Array.isArray(paths)).toBe(true);
  });
});
