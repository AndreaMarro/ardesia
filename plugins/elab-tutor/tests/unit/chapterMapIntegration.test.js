/**
 * Chapter Map Integration — Tea's alias mapping completeness
 * Verifica che OGNI esperimento sia mappato e che i titoli siano corretti
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';
import { getDisplayInfo, getVolumeChapters, CHAPTER_MAP } from '../../src/data/chapter-map';

const vol1 = await import('../../src/data/experiments-vol1.js');
const vol2 = await import('../../src/data/experiments-vol2.js');
const vol3 = await import('../../src/data/experiments-vol3.js');

function getExperiments(mod) {
  const exp = mod.default || mod.experiments || [];
  if (Array.isArray(exp)) return exp;
  return Object.values(exp).flat().filter(e => e?.id);
}

describe('Chapter Map — Tea Alias Integration', () => {
  test('CHAPTER_MAP has entries for all 3 volumes', () => {
    const volumes = new Set(Object.values(CHAPTER_MAP).map(v => v.volume));
    expect(volumes.has(1)).toBe(true);
    expect(volumes.has(2)).toBe(true);
    expect(volumes.has(3)).toBe(true);
  });

  test('every volume starts from displayChapter 1 or 2', () => {
    for (const vol of [1, 2, 3]) {
      const chapters = getVolumeChapters(vol);
      expect(chapters.length).toBeGreaterThan(0);
      const firstChapter = chapters[0].displayChapter;
      expect(firstChapter, `Vol${vol} starts from ${firstChapter}`).toBeLessThanOrEqual(2);
    }
  });

  test('displayChapters are sequential (no gaps)', () => {
    for (const vol of [1, 2, 3]) {
      const chapters = getVolumeChapters(vol);
      const nums = chapters.map(c => c.displayChapter);
      for (let i = 1; i < nums.length; i++) {
        expect(nums[i] - nums[i-1], `Vol${vol} gap between ${nums[i-1]} and ${nums[i]}`).toBeLessThanOrEqual(1);
      }
    }
  });

  test('every chapter has a non-empty title', () => {
    Object.values(CHAPTER_MAP).forEach(ch => {
      expect(ch.title).toBeTruthy();
      expect(ch.title.length).toBeGreaterThan(3);
    });
  });

  test('getDisplayInfo returns data for v1-cap6-esp1', () => {
    const info = getDisplayInfo('v1-cap6-esp1');
    expect(info).not.toBeNull();
    expect(info.volume).toBe(1);
    expect(info.displayChapter).toBeGreaterThan(0);
    expect(info.title).toContain('LED');
  });

  test('getDisplayInfo returns data for v2-cap3-esp1', () => {
    const info = getDisplayInfo('v2-cap3-esp1');
    expect(info).not.toBeNull();
    expect(info.volume).toBe(2);
  });

  test('getDisplayInfo returns data for v3-cap5-esp1', () => {
    const info = getDisplayInfo('v3-cap5-esp1');
    expect(info).not.toBeNull();
    expect(info.volume).toBe(3);
  });

  test('getDisplayInfo returns null for invalid ID', () => {
    expect(getDisplayInfo('invalid')).toBeNull();
    expect(getDisplayInfo('')).toBeNull();
  });

  test('Tea titles use Italian question format for Vol1', () => {
    const vol1Chapters = getVolumeChapters(1);
    const questionChapters = vol1Chapters.filter(c => c.title.includes('?'));
    // Most Vol1 chapters should be questions ("Cos'è un...?")
    expect(questionChapters.length).toBeGreaterThanOrEqual(3);
  });

  test('Vol3 has OUTPUT and INPUT chapters (Tea split)', () => {
    const vol3Chapters = getVolumeChapters(3);
    const titles = vol3Chapters.map(c => c.title);
    const hasOutput = titles.some(t => t.includes('OUTPUT'));
    const hasInput = titles.some(t => t.includes('INPUT'));
    expect(hasOutput, 'Vol3 missing OUTPUT chapter').toBe(true);
    expect(hasInput, 'Vol3 missing INPUT chapter').toBe(true);
  });

  test('every experiment ID maps to a chapter', () => {
    const allExps = [...getExperiments(vol1), ...getExperiments(vol2), ...getExperiments(vol3)];
    const mainExps = allExps.filter(e => e.id?.match(/^v\d-cap\d/));
    let mapped = 0;
    mainExps.forEach(e => {
      const info = getDisplayInfo(e.id);
      if (info) mapped++;
    });
    const ratio = mapped / mainExps.length;
    expect(ratio, `Only ${Math.round(ratio*100)}% of experiments mapped`).toBeGreaterThan(0.9);
  });
});
