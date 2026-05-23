/**
 * Demo mode filter — unit test.
 * Verifica: helper isExperimentVisible / filterDemoOnly / filterDemoIds /
 * chapterHasVisibleExperiments comportamento corretto con mode ON / OFF / empty array.
 */

import { describe, it, expect } from 'vitest';
import {
  DEMO_EXPERIMENT_IDS,
  isExperimentVisible,
  filterDemoOnly,
  filterDemoIds,
  chapterHasVisibleExperiments,
} from '../../../src/data/demo-mode';

describe('Demo Mode Filter', () => {
  describe('DEMO_EXPERIMENT_IDS', () => {
    it('contains exactly 7 experiment IDs', () => {
      expect(DEMO_EXPERIMENT_IDS).toHaveLength(7);
    });

    it('distribution: 3 vol1 + 2 vol2 + 2 vol3', () => {
      const vol1 = DEMO_EXPERIMENT_IDS.filter((id) => id.startsWith('v1-')).length;
      const vol2 = DEMO_EXPERIMENT_IDS.filter((id) => id.startsWith('v2-')).length;
      const vol3 = DEMO_EXPERIMENT_IDS.filter((id) => id.startsWith('v3-')).length;
      expect(vol1).toBe(3);
      expect(vol2).toBe(2);
      expect(vol3).toBe(2);
    });

    it('vol1: cap6 esp1+esp2+esp3 (LED consecutivi)', () => {
      expect(DEMO_EXPERIMENT_IDS).toContain('v1-cap6-esp1');
      expect(DEMO_EXPERIMENT_IDS).toContain('v1-cap6-esp2');
      expect(DEMO_EXPERIMENT_IDS).toContain('v1-cap6-esp3');
    });

    it('vol2: cap7 esp1+esp2 (condensatori consecutivi)', () => {
      expect(DEMO_EXPERIMENT_IDS).toContain('v2-cap7-esp1');
      expect(DEMO_EXPERIMENT_IDS).toContain('v2-cap7-esp2');
    });

    it('vol3: cap6 esp4+esp5 (due LED + semaforo consecutivi)', () => {
      expect(DEMO_EXPERIMENT_IDS).toContain('v3-cap6-esp4');
      expect(DEMO_EXPERIMENT_IDS).toContain('v3-cap6-esp5');
    });
  });

  describe('isExperimentVisible', () => {
    it('returns true for demo experiment IDs', () => {
      DEMO_EXPERIMENT_IDS.forEach((id) => {
        expect(isExperimentVisible(id)).toBe(true);
      });
    });

    it('returns false for non-demo experiment IDs (when demo mode on)', () => {
      expect(isExperimentVisible('v1-cap7-esp1')).toBe(false); // vol1 cap7 RGB, not in demo
      expect(isExperimentVisible('v2-cap10-esp1')).toBe(false); // vol2 motor, not in demo
      expect(isExperimentVisible('v3-cap8-esp1')).toBe(false); // vol3 serial, not in demo
    });

    it('returns false for unknown experiment ID', () => {
      expect(isExperimentVisible('v9-cap99-esp99')).toBe(false);
      expect(isExperimentVisible('')).toBe(false);
    });
  });

  describe('filterDemoOnly', () => {
    it('returns only demo experiments from a full list', () => {
      const fullList = [
        { id: 'v1-cap6-esp1', title: 'LED' }, // visible
        { id: 'v1-cap7-esp1', title: 'RGB' }, // NOT visible
        { id: 'v2-cap7-esp2', title: 'Cond' }, // visible
        { id: 'v3-cap6-esp5', title: 'Semaforo' }, // visible
        { id: 'v3-cap8-esp1', title: 'Serial' }, // NOT visible
      ];
      const result = filterDemoOnly(fullList);
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.id)).toEqual(['v1-cap6-esp1', 'v2-cap7-esp2', 'v3-cap6-esp5']);
    });

    it('returns empty array if no demo experiments present', () => {
      const fullList = [
        { id: 'v1-cap10-esp1' },
        { id: 'v2-cap10-esp1' },
      ];
      expect(filterDemoOnly(fullList)).toEqual([]);
    });

    it('handles undefined/null input gracefully', () => {
      expect(filterDemoOnly(undefined)).toBe(undefined);
      expect(filterDemoOnly(null)).toBe(null);
    });
  });

  describe('filterDemoIds', () => {
    it('filters array of string IDs', () => {
      const ids = ['v1-cap6-esp1', 'v1-cap7-esp1', 'v3-cap6-esp5'];
      expect(filterDemoIds(ids)).toEqual(['v1-cap6-esp1', 'v3-cap6-esp5']);
    });

    it('handles non-array input gracefully', () => {
      expect(filterDemoIds(undefined)).toBe(undefined);
      expect(filterDemoIds('not-array')).toBe('not-array');
    });
  });

  describe('chapterHasVisibleExperiments', () => {
    it('returns true when chapter has demo experiments', () => {
      const cap6Vol1 = [
        { id: 'v1-cap6-esp1' },
        { id: 'v1-cap6-esp2' },
        { id: 'v1-cap6-esp3' },
      ];
      expect(chapterHasVisibleExperiments(cap6Vol1)).toBe(true);
    });

    it('returns false when chapter has NO demo experiments', () => {
      const cap10Vol2 = [
        { id: 'v2-cap10-esp1' },
        { id: 'v2-cap10-esp2' },
      ];
      expect(chapterHasVisibleExperiments(cap10Vol2)).toBe(false);
    });

    it('returns false for empty/invalid input', () => {
      expect(chapterHasVisibleExperiments([])).toBe(false);
      expect(chapterHasVisibleExperiments(undefined)).toBe(false);
      expect(chapterHasVisibleExperiments(null)).toBe(false);
    });
  });
});
