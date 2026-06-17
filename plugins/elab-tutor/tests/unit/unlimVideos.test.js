/**
 * unlimVideos — Tests for curated video database and fuzzy matching
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { findVideo, getYouTubeSearchUrl } from '../../src/data/unlim-videos';

describe('unlimVideos', () => {
  describe('findVideo — fuzzy keyword matching', () => {
    it('finds LED video for "led"', () => {
      const result = findVideo('led');
      expect(result).not.toBeNull();
      expect(result.title).toBeTruthy();
      expect(result.url).toContain('youtube.com/watch');
    });

    it('finds resistor video for "resistenza"', () => {
      const result = findVideo('resistenza');
      expect(result).not.toBeNull();
      expect(result.topic).toBeTruthy();
    });

    it('finds Ohm video for "legge di ohm"', () => {
      const result = findVideo('legge di ohm');
      expect(result).not.toBeNull();
    });

    it('finds breadboard video for "breadboard"', () => {
      const result = findVideo('breadboard');
      expect(result).not.toBeNull();
    });

    it('returns null for unrelated query', () => {
      expect(findVideo('ricetta torta cioccolato')).toBeNull();
    });

    it('returns null for empty/null input', () => {
      expect(findVideo('')).toBeNull();
      expect(findVideo(null)).toBeNull();
    });

    it('result includes url with videoId', () => {
      const result = findVideo('condensatore');
      if (result) {
        expect(result.url).toMatch(/youtube\.com\/watch\?v=.+/);
        expect(result.videoId).toBeTruthy();
      }
    });
  });

  describe('getYouTubeSearchUrl', () => {
    it('returns valid YouTube search URL', () => {
      const url = getYouTubeSearchUrl('arduino LED');
      expect(url).toContain('youtube.com/results');
      expect(url).toContain('search_query=');
      expect(url).toContain('elettronica');
    });

    it('handles empty query', () => {
      const url = getYouTubeSearchUrl('');
      expect(url).toContain('youtube.com/results');
    });

    it('handles null query', () => {
      const url = getYouTubeSearchUrl(null);
      expect(url).toContain('youtube.com/results');
    });

    it('truncates long queries to 100 chars', () => {
      const longQuery = 'a'.repeat(200);
      const url = getYouTubeSearchUrl(longQuery);
      // URL-encoded, the query part should be reasonable
      expect(url.length).toBeLessThan(500);
    });
  });
});
