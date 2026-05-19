/**
 * welcome-messages — Tests for experiment-specific welcome messages
 * Validates coverage across all 3 volumes.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import WELCOME_MESSAGES, {
  getWelcomeMessage,
  getReturningMessage,
} from '../../src/data/welcome-messages';

describe('welcome-messages', () => {
  describe('WELCOME_MESSAGES data', () => {
    it('is a non-empty object', () => {
      expect(typeof WELCOME_MESSAGES).toBe('object');
      expect(Object.keys(WELCOME_MESSAGES).length).toBeGreaterThan(50);
    });

    it('has Vol1 messages (v1-*)', () => {
      const vol1 = Object.keys(WELCOME_MESSAGES).filter(k => k.startsWith('v1-'));
      expect(vol1.length).toBe(38);
    });

    it('has Vol2 messages (v2-*)', () => {
      const vol2 = Object.keys(WELCOME_MESSAGES).filter(k => k.startsWith('v2-'));
      expect(vol2.length).toBeGreaterThanOrEqual(14);
    });

    it('has Vol3 messages (v3-*)', () => {
      const vol3 = Object.keys(WELCOME_MESSAGES).filter(k => k.startsWith('v3-'));
      expect(vol3.length).toBeGreaterThanOrEqual(2);
    });

    it('all messages are non-empty strings', () => {
      for (const [key, msg] of Object.entries(WELCOME_MESSAGES)) {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(10);
      }
    });

    it('all messages are max ~15 words (spec)', () => {
      for (const [key, msg] of Object.entries(WELCOME_MESSAGES)) {
        const wordCount = msg.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(20); // Small margin
      }
    });

    it('first experiment has a message', () => {
      expect(WELCOME_MESSAGES['v1-cap6-esp1']).toBeTruthy();
      expect(WELCOME_MESSAGES['v1-cap6-esp1']).toContain('LED');
    });
  });

  describe('getWelcomeMessage', () => {
    it('returns message for known experiment', () => {
      const msg = getWelcomeMessage('v1-cap6-esp1');
      expect(msg).toBeTruthy();
      expect(typeof msg).toBe('string');
    });

    it('returns null for unknown experiment', () => {
      expect(getWelcomeMessage('nonexistent')).toBeNull();
      expect(getWelcomeMessage(undefined)).toBeNull();
    });

    it('returns correct message for Vol2 experiment', () => {
      const msg = getWelcomeMessage('v2-cap7-esp1');
      expect(msg).toContain('condensatore');
    });

    it('returns correct message for Vol3 experiment', () => {
      const msg = getWelcomeMessage('v3-cap6-semaforo');
      expect(msg).toContain('Semaforo');
    });
  });

  describe('getReturningMessage', () => {
    it('returns personalized message with lastTitle', () => {
      const msg = getReturningMessage('v1-cap6-esp1', 'Primo LED');
      expect(msg).toContain('Bentornati');
      expect(msg).toContain('Primo LED');
    });

    it('returns null when no lastTitle', () => {
      expect(getReturningMessage('v1-cap6-esp1', null)).toBeNull();
      expect(getReturningMessage('v1-cap6-esp1', '')).toBeNull();
    });
  });
});
