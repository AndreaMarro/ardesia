import { describe, test, expect } from 'vitest';
import { CHAPTER_MAP, getDisplayInfo, getVolumeChapters } from '../../src/data/chapter-map';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index';

describe('Chapter Map -- Tea Alias Mapping', () => {

  test('Vol 1 chapters start from displayChapter 2 (Cap 1 breadboard is future)', () => {
    const chapters = getVolumeChapters(1);
    expect(chapters[0].displayChapter).toBe(2);
  });

  test('Vol 2 chapters start from displayChapter 1', () => {
    const chapters = getVolumeChapters(2);
    expect(chapters[0].displayChapter).toBe(1);
  });

  test('Vol 3 chapters start from displayChapter 1', () => {
    const chapters = getVolumeChapters(3);
    expect(chapters[0].displayChapter).toBe(1);
  });

  test('Vol 1 has 9 chapters (Cap 6-14 mapped to display 2-10)', () => {
    expect(getVolumeChapters(1)).toHaveLength(9);
  });

  test('Vol 2 has 9 chapters (Cap 3-10 + Cap 12 mapped to display 1-9)', () => {
    expect(getVolumeChapters(2)).toHaveLength(9);
  });

  test('Vol 3 has 5 chapters (Cap 5, Cap 6 OUTPUT, Cap 6 INPUT, Cap 7, Cap 8)', () => {
    expect(getVolumeChapters(3)).toHaveLength(5);
  });

  test('Vol 3 Cap 6 is split into OUTPUT and INPUT', () => {
    const vol3 = getVolumeChapters(3);
    const titles = vol3.map(c => c.title);
    expect(titles).toContain('I Pin Digitali (OUTPUT)');
    expect(titles).toContain('I Pin Digitali (INPUT)');
  });

  test('Vol 3 OUTPUT is displayChapter 2, INPUT is displayChapter 3', () => {
    const output = CHAPTER_MAP['v3-cap6'];
    const input = CHAPTER_MAP['v3-cap6-input'];
    expect(output.displayChapter).toBe(2);
    expect(input.displayChapter).toBe(3);
  });

  test('getDisplayInfo maps v1-cap6-esp1 to display Cap 2 (LED)', () => {
    const info = getDisplayInfo('v1-cap6-esp1');
    expect(info).not.toBeNull();
    expect(info.displayChapter).toBe(2);
    expect(info.title).toContain('LED');
  });

  test('getDisplayInfo maps v3-cap6-esp2 (OUTPUT) to display Cap 2', () => {
    const info = getDisplayInfo('v3-cap6-esp2');
    expect(info.displayChapter).toBe(2);
    expect(info.title).toContain('OUTPUT');
  });

  test('getDisplayInfo maps v3-cap6-esp4 to display Cap 2 OUTPUT', () => {
    const info = getDisplayInfo('v3-cap6-esp4');
    expect(info.displayChapter).toBe(2);
    expect(info.title).toContain('OUTPUT');
  });

  test('getDisplayInfo maps v3-cap6-esp5 to display Cap 2 OUTPUT', () => {
    const info = getDisplayInfo('v3-cap6-esp5');
    expect(info.displayChapter).toBe(2);
    expect(info.title).toContain('OUTPUT');
  });

  test('getDisplayInfo returns null for invalid input', () => {
    expect(getDisplayInfo(null)).toBeNull();
    expect(getDisplayInfo('')).toBeNull();
    expect(getDisplayInfo('invalid-id')).toBeNull();
    expect(getDisplayInfo(undefined)).toBeNull();
  });

  test('every chapter entry has title and displayChapter > 0', () => {
    Object.values(CHAPTER_MAP).forEach(ch => {
      expect(ch.title).toBeTruthy();
      expect(ch.displayChapter).toBeGreaterThan(0);
      expect(ch.volume).toBeGreaterThan(0);
    });
  });

  test('displayChapters are unique within each volume', () => {
    for (const vol of [1, 2, 3]) {
      const chapters = getVolumeChapters(vol);
      const displayNums = chapters.map(c => c.displayChapter);
      const unique = new Set(displayNums);
      expect(unique.size).toBe(displayNums.length);
    }
  });

  test('displayChapters are consecutive within each volume', () => {
    for (const vol of [1, 2, 3]) {
      const chapters = getVolumeChapters(vol);
      const displayNums = chapters.map(c => c.displayChapter);
      const min = Math.min(...displayNums);
      const max = Math.max(...displayNums);
      expect(max - min + 1).toBe(displayNums.length);
    }
  });

  test('all 88 experiment IDs map to a valid chapter', () => {
    const allIds = ALL_EXPERIMENTS.map((exp) => exp.id);

    expect(allIds.length).toBe(88);

    allIds.forEach(id => {
      const info = getDisplayInfo(id);
      expect(info, 'Missing mapping for: ' + id).not.toBeNull();
      expect(info.volume).toBeGreaterThan(0);
      expect(info.displayChapter).toBeGreaterThan(0);
      expect(info.title).toBeTruthy();
    });
  });
});
