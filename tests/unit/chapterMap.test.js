import { describe, test, expect } from 'vitest';
import { CHAPTER_MAP, getDisplayInfo, getVolumeChapters } from '../../src/data/chapter-map';

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

  test('getDisplayInfo maps v3-cap6-esp5 (INPUT_PULLUP) to display Cap 3', () => {
    const info = getDisplayInfo('v3-cap6-esp5');
    expect(info.displayChapter).toBe(3);
    expect(info.title).toContain('INPUT');
  });

  test('getDisplayInfo maps v3-cap6-morse to display Cap 2 OUTPUT', () => {
    const info = getDisplayInfo('v3-cap6-morse');
    expect(info.displayChapter).toBe(2);
    expect(info.title).toContain('OUTPUT');
  });

  test('getDisplayInfo maps v3-cap6-semaforo to display Cap 2 OUTPUT', () => {
    const info = getDisplayInfo('v3-cap6-semaforo');
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

  test('all 81 experiment IDs map to a valid chapter', () => {
    // All known experiment IDs from experiments-vol1/2/3.js
    const allIds = [
      // Vol1 (38)
      'v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap6-esp3',
      'v1-cap7-esp1', 'v1-cap7-esp2', 'v1-cap7-esp3', 'v1-cap7-esp4', 'v1-cap7-esp5', 'v1-cap7-esp6',
      'v1-cap8-esp1', 'v1-cap8-esp2', 'v1-cap8-esp3', 'v1-cap8-esp4', 'v1-cap8-esp5',
      'v1-cap9-esp1', 'v1-cap9-esp2', 'v1-cap9-esp3', 'v1-cap9-esp4', 'v1-cap9-esp5',
      'v1-cap9-esp6', 'v1-cap9-esp7', 'v1-cap9-esp8', 'v1-cap9-esp9',
      'v1-cap10-esp1', 'v1-cap10-esp2', 'v1-cap10-esp3', 'v1-cap10-esp4', 'v1-cap10-esp5', 'v1-cap10-esp6',
      'v1-cap11-esp1', 'v1-cap11-esp2',
      'v1-cap12-esp1', 'v1-cap12-esp2', 'v1-cap12-esp3', 'v1-cap12-esp4',
      'v1-cap13-esp1', 'v1-cap13-esp2',
      'v1-cap14-esp1',
      // Vol2 (27)
      'v2-cap3-esp1', 'v2-cap3-esp2', 'v2-cap3-esp3', 'v2-cap3-esp4',
      'v2-cap4-esp1', 'v2-cap4-esp2', 'v2-cap4-esp3',
      'v2-cap5-esp1', 'v2-cap5-esp2',
      'v2-cap6-esp1', 'v2-cap6-esp2', 'v2-cap6-esp3', 'v2-cap6-esp4',
      'v2-cap7-esp1', 'v2-cap7-esp2', 'v2-cap7-esp3', 'v2-cap7-esp4',
      'v2-cap8-esp1', 'v2-cap8-esp2', 'v2-cap8-esp3',
      'v2-cap9-esp1', 'v2-cap9-esp2',
      'v2-cap10-esp1', 'v2-cap10-esp2', 'v2-cap10-esp3', 'v2-cap10-esp4',
      'v2-cap12-esp1',
      // Vol3 (16)
      'v3-cap5-esp1', 'v3-cap5-esp2',
      'v3-cap6-esp1', 'v3-cap6-esp2', 'v3-cap6-morse', 'v3-cap6-esp3', 'v3-cap6-esp4', 'v3-cap6-semaforo',
      'v3-cap6-esp5',
      'v3-cap7-esp1', 'v3-cap7-esp2', 'v3-cap7-esp3', 'v3-cap7-esp6',
      'v3-cap8-esp1', 'v3-cap8-esp2', 'v3-cap8-esp3',
    ];

    expect(allIds.length).toBe(81);

    allIds.forEach(id => {
      const info = getDisplayInfo(id);
      expect(info, 'Missing mapping for: ' + id).not.toBeNull();
      expect(info.volume).toBeGreaterThan(0);
      expect(info.displayChapter).toBeGreaterThan(0);
      expect(info.title).toBeTruthy();
    });
  });
});
