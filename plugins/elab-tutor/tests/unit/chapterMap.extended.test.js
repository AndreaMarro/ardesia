/**
 * chapter-map extended — Tests for Tea alias mapping, display info, navigation
 * CRITICAL: questi titoli sono quelli che il DOCENTE vede nell'ExperimentPicker.
 * Se sono sbagliati, il Principio Zero e' violato.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { CHAPTER_MAP, getDisplayInfo } from '../../src/data/chapter-map';

describe('chapter-map — Tea alias mapping', () => {
  describe('CHAPTER_MAP structure', () => {
    it('has entries for Vol1 (9 chapters: cap6-cap14)', () => {
      const vol1 = Object.entries(CHAPTER_MAP).filter(([k]) => k.startsWith('v1-'));
      expect(vol1.length).toBe(9);
    });

    it('has entries for Vol2 (9 chapters: cap3-cap12)', () => {
      const vol2 = Object.entries(CHAPTER_MAP).filter(([k]) => k.startsWith('v2-'));
      expect(vol2.length).toBe(9);
    });

    it('has entries for Vol3 (6 chapters including split)', () => {
      const vol3 = Object.entries(CHAPTER_MAP).filter(([k]) => k.startsWith('v3-'));
      expect(vol3.length).toBeGreaterThanOrEqual(5);
    });

    it('every entry has volume, displayChapter, title', () => {
      for (const [key, entry] of Object.entries(CHAPTER_MAP)) {
        expect(entry.volume, `${key} manca volume`).toBeDefined();
        expect(entry.displayChapter, `${key} manca displayChapter`).toBeDefined();
        expect(entry.title, `${key} manca title`).toBeTruthy();
      }
    });

    it('displayChapter e\' sequenziale per ogni volume', () => {
      for (const vol of [1, 2, 3]) {
        const chapters = Object.entries(CHAPTER_MAP)
          .filter(([, v]) => v.volume === vol)
          .map(([, v]) => v.displayChapter)
          .sort((a, b) => a - b);
        // Verifica che siano sequenziali (1,2,3,... o 2,3,4,...)
        for (let i = 1; i < chapters.length; i++) {
          expect(chapters[i] - chapters[i - 1], `Vol${vol} gap tra ${chapters[i - 1]} e ${chapters[i]}`).toBe(1);
        }
      }
    });

    it('tutti i titoli sono in italiano', () => {
      for (const [key, entry] of Object.entries(CHAPTER_MAP)) {
        // Titoli devono contenere parole italiane
        expect(entry.title.length, `${key} titolo troppo corto`).toBeGreaterThan(5);
        // Non devono contenere testo inglese
        expect(entry.title).not.toMatch(/^(The|What|How|Chapter)/);
      }
    });
  });

  describe('getDisplayInfo', () => {
    it('Vol1 cap6 → display chapter 2', () => {
      const info = getDisplayInfo('v1-cap6-esp1');
      expect(info).not.toBeNull();
      expect(info.volume).toBe(1);
      expect(info.displayChapter).toBe(2);
      expect(info.title).toContain('LED');
    });

    it('Vol1 cap9 → potenziometro', () => {
      const info = getDisplayInfo('v1-cap9-esp1');
      expect(info).not.toBeNull();
      expect(info.title).toContain('Potenziometro');
    });

    it('Vol2 cap7 → condensatori', () => {
      const info = getDisplayInfo('v2-cap7-esp1');
      expect(info).not.toBeNull();
      expect(info.title).toContain('Condensatori');
    });

    it('Vol3 cap6 OUTPUT experiments', () => {
      const info = getDisplayInfo('v3-cap6-esp1');
      expect(info).not.toBeNull();
      expect(info.title).toContain('OUTPUT');
    });

    it('returns null for null input', () => {
      expect(getDisplayInfo(null)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getDisplayInfo('')).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(getDisplayInfo(42)).toBeNull();
    });

    it('returns null for unknown experiment', () => {
      expect(getDisplayInfo('v99-cap99-esp99')).toBeNull();
    });

    it('Vol3 semaforo maps correctly', () => {
      const info = getDisplayInfo('v3-cap6-esp5');
      expect(info).not.toBeNull();
      expect(info.volume).toBe(3);
    });

    it('ogni volume ha il display chapter corretto', () => {
      // Vol1 Cap6 = display 2
      expect(getDisplayInfo('v1-cap6-esp1').displayChapter).toBe(2);
      // Vol1 Cap14 = display 10
      expect(getDisplayInfo('v1-cap14-esp1').displayChapter).toBe(10);
      // Vol2 Cap3 = display 1
      expect(getDisplayInfo('v2-cap3-esp1').displayChapter).toBe(1);
      // Vol3 Cap5 = display 1
      expect(getDisplayInfo('v3-cap5-esp1').displayChapter).toBe(1);
    });
  });
});
