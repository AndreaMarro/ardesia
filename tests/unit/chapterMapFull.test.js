/**
 * chapterMapFull.test.js — Full validation of chapter-map.js for all 92 experiment IDs
 * getDisplayInfo, getVolumeChapters, consistent chapter numbering
 */
import { describe, it, expect } from 'vitest';
import { CHAPTER_MAP, getDisplayInfo, getVolumeChapters } from '../../src/data/chapter-map';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';

const ALL_EXPERIMENTS = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

const VOL1_IDS = EXPERIMENTS_VOL1.experiments.map(e => e.id);
const VOL2_IDS = EXPERIMENTS_VOL2.experiments.map(e => e.id);
const VOL3_IDS = EXPERIMENTS_VOL3.experiments.map(e => e.id);

describe('chapterMapFull — CHAPTER_MAP structure', () => {
  it('CHAPTER_MAP is a non-empty object', () => {
    expect(typeof CHAPTER_MAP).toBe('object');
    expect(Object.keys(CHAPTER_MAP).length).toBeGreaterThan(0);
  });

  it('every entry has volume, displayChapter, title', () => {
    Object.entries(CHAPTER_MAP).forEach(([key, val]) => {
      expect(typeof val.volume, `${key} missing volume`).toBe('number');
      expect(typeof val.displayChapter, `${key} missing displayChapter`).toBe('number');
      expect(typeof val.title, `${key} missing title`).toBe('string');
      expect(val.title.trim().length).toBeGreaterThan(0);
    });
  });

  it('volume numbers are 1, 2, or 3', () => {
    Object.entries(CHAPTER_MAP).forEach(([key, val]) => {
      expect([1, 2, 3]).toContain(val.volume);
    });
  });

  it('displayChapter is a positive integer', () => {
    Object.entries(CHAPTER_MAP).forEach(([key, val]) => {
      expect(val.displayChapter).toBeGreaterThan(0);
      expect(Number.isInteger(val.displayChapter)).toBe(true);
    });
  });
});

describe('chapterMapFull — getDisplayInfo for every experiment ID', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`getDisplayInfo("${exp.id}") returns non-null`, () => {
      const info = getDisplayInfo(exp.id);
      expect(info, `${exp.id} returned null from getDisplayInfo`).not.toBeNull();
    });
  });

  ALL_EXPERIMENTS.forEach(exp => {
    it(`getDisplayInfo("${exp.id}") has volume, displayChapter, title`, () => {
      const info = getDisplayInfo(exp.id);
      if (info) {
        expect(typeof info.volume).toBe('number');
        expect(typeof info.displayChapter).toBe('number');
        expect(typeof info.title).toBe('string');
      }
    });
  });
});

describe('chapterMapFull — volume assignment matches experiment prefix', () => {
  VOL1_IDS.forEach(id => {
    it(`${id}: getDisplayInfo returns volume 1`, () => {
      const info = getDisplayInfo(id);
      expect(info).not.toBeNull();
      expect(info.volume).toBe(1);
    });
  });

  VOL2_IDS.forEach(id => {
    it(`${id}: getDisplayInfo returns volume 2`, () => {
      const info = getDisplayInfo(id);
      expect(info).not.toBeNull();
      expect(info.volume).toBe(2);
    });
  });

  VOL3_IDS.forEach(id => {
    it(`${id}: getDisplayInfo returns volume 3`, () => {
      const info = getDisplayInfo(id);
      expect(info).not.toBeNull();
      expect(info.volume).toBe(3);
    });
  });
});

describe('chapterMapFull — getDisplayInfo edge cases', () => {
  it('returns null for null input', () => {
    expect(getDisplayInfo(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(getDisplayInfo(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getDisplayInfo('')).toBeNull();
  });

  it('returns null for non-existent ID', () => {
    expect(getDisplayInfo('v99-cap1-esp1')).toBeNull();
  });

  it('returns null for numeric input', () => {
    expect(getDisplayInfo(42)).toBeNull();
  });
});

describe('chapterMapFull — getVolumeChapters', () => {
  it('returns chapters for volume 1', () => {
    const chapters = getVolumeChapters(1);
    expect(Array.isArray(chapters)).toBe(true);
    expect(chapters.length).toBeGreaterThan(0);
    chapters.forEach(ch => expect(ch.volume).toBe(1));
  });

  it('returns chapters for volume 2', () => {
    const chapters = getVolumeChapters(2);
    expect(Array.isArray(chapters)).toBe(true);
    expect(chapters.length).toBeGreaterThan(0);
    chapters.forEach(ch => expect(ch.volume).toBe(2));
  });

  it('returns chapters for volume 3', () => {
    const chapters = getVolumeChapters(3);
    expect(Array.isArray(chapters)).toBe(true);
    expect(chapters.length).toBeGreaterThan(0);
    chapters.forEach(ch => expect(ch.volume).toBe(3));
  });

  it('chapters are sorted by displayChapter', () => {
    [1, 2, 3].forEach(vol => {
      const chapters = getVolumeChapters(vol);
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i].displayChapter).toBeGreaterThan(chapters[i - 1].displayChapter);
      }
    });
  });

  it('returns empty array for non-existent volume', () => {
    const chapters = getVolumeChapters(99);
    expect(Array.isArray(chapters)).toBe(true);
    expect(chapters.length).toBe(0);
  });
});

describe('chapterMapFull — consistent chapter numbering', () => {
  it('Volume 1 displayChapters are sequential from 2 to 10', () => {
    const chapters = getVolumeChapters(1);
    const nums = chapters.map(c => c.displayChapter);
    expect(nums[0]).toBe(2);
    expect(nums[nums.length - 1]).toBe(10);
  });

  it('Volume 2 displayChapters start at 1', () => {
    const chapters = getVolumeChapters(2);
    expect(chapters[0].displayChapter).toBe(1);
  });

  it('Volume 3 displayChapters start at 1', () => {
    const chapters = getVolumeChapters(3);
    expect(chapters[0].displayChapter).toBe(1);
  });

  it('no duplicate displayChapter within same volume', () => {
    [1, 2, 3].forEach(vol => {
      const chapters = getVolumeChapters(vol);
      const nums = chapters.map(c => c.displayChapter);
      expect(new Set(nums).size, `Volume ${vol} has duplicate displayChapters`).toBe(nums.length);
    });
  });
});

describe('chapterMapFull — Vol3 Cap6 INPUT/OUTPUT split', () => {
  it('v3-cap6-esp1, esp2, esp4 are OUTPUT (displayChapter 2)', () => {
    ['v3-cap6-esp1', 'v3-cap6-esp2', 'v3-cap6-esp4'].forEach(id => {
      const info = getDisplayInfo(id);
      expect(info).not.toBeNull();
      expect(info.displayChapter).toBe(2);
    });
  });

  it('v3-cap6-morse and v3-cap6-semaforo are OUTPUT (displayChapter 2)', () => {
    ['v3-cap6-morse', 'v3-cap6-semaforo'].forEach(id => {
      const info = getDisplayInfo(id);
      expect(info).not.toBeNull();
      expect(info.displayChapter).toBe(2);
    });
  });
});
