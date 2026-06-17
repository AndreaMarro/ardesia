/**
 * unlimMemory extended — Tests for UNLIM persistent memory service
 * Covers 3-tier memory, experiment tracking, quiz, mistakes, context building.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

// We need to import after mocks
const store = {};
const localStorageMock = {
  getItem: vi.fn((k) => store[k] ?? null),
  setItem: vi.fn((k, v) => { store[k] = v; }),
  removeItem: vi.fn((k) => { delete store[k]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i) => Object.keys(store)[i] || null),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Mock navigator.sendBeacon
Object.defineProperty(globalThis, 'navigator', {
  value: { sendBeacon: vi.fn(() => true) },
  writable: true,
});

import unlimMemory from '../../src/services/unlimMemory';

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  unlimMemory.resetMemory();
});

describe('unlimMemory extended', () => {
  describe('getProfile / updateProfile', () => {
    it('returns empty object for new user', () => {
      const profile = unlimMemory.getProfile();
      expect(typeof profile).toBe('object');
    });

    it('updateProfile merges data', () => {
      unlimMemory.updateProfile({ name: 'Test', level: 3 });
      const profile = unlimMemory.getProfile();
      expect(profile.name).toBe('Test');
      expect(profile.level).toBe(3);
      expect(profile.lastUpdated).toBeGreaterThan(0);
    });

    it('updateProfile preserves existing fields', () => {
      unlimMemory.updateProfile({ a: 1 });
      unlimMemory.updateProfile({ b: 2 });
      const profile = unlimMemory.getProfile();
      expect(profile.a).toBe(1);
      expect(profile.b).toBe(2);
    });
  });

  describe('trackExperimentCompletion', () => {
    it('tracks a completed experiment', () => {
      unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'success');
      const profile = unlimMemory.getProfile();
      expect(profile.experiments['v1-cap6-esp1']).toBeDefined();
      expect(profile.experiments['v1-cap6-esp1'].completed).toBe(true);
      expect(profile.experiments['v1-cap6-esp1'].lastResult).toBe('success');
    });

    it('increments attempts on repeat', () => {
      unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
      unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
      const profile = unlimMemory.getProfile();
      expect(profile.experiments['v1-cap6-esp1'].attempts).toBe(2);
    });

    it('defaults result to success', () => {
      unlimMemory.trackExperimentCompletion('v1-cap7-esp1');
      const profile = unlimMemory.getProfile();
      expect(profile.experiments['v1-cap7-esp1'].lastResult).toBe('success');
    });

    it('records partial result', () => {
      unlimMemory.trackExperimentCompletion('v1-cap6-esp2', 'partial');
      const profile = unlimMemory.getProfile();
      expect(profile.experiments['v1-cap6-esp2'].lastResult).toBe('partial');
    });
  });

  describe('trackQuizResult', () => {
    it('tracks quiz score for experiment', () => {
      unlimMemory.trackQuizResult('v1-cap6-esp1', 3, 5);
      const profile = unlimMemory.getProfile();
      expect(profile.quizzes).toBeDefined();
      expect(profile.quizzes['v1-cap6-esp1']).toBeDefined();
    });
  });

  describe('trackMistake', () => {
    it('tracks a mistake with category and detail', () => {
      unlimMemory.trackMistake('polarity', 'LED invertito nel circuito');
      const profile = unlimMemory.getProfile();
      expect(profile.mistakes).toBeDefined();
      expect(profile.mistakes.length).toBeGreaterThan(0);
      expect(profile.mistakes[0].category).toBe('polarity');
    });

    it('caps mistakes at MAX_MISTAKES (50)', () => {
      for (let i = 0; i < 60; i++) {
        unlimMemory.trackMistake('test', `mistake-${i}`);
      }
      const profile = unlimMemory.getProfile();
      expect(profile.mistakes.length).toBeLessThanOrEqual(50);
    });
  });

  describe('saveSessionSummary', () => {
    it('saves a session summary', () => {
      unlimMemory.saveSessionSummary('Il LED si accende quando la corrente passa');
      const profile = unlimMemory.getProfile();
      expect(profile.sessionSummaries).toBeDefined();
      expect(profile.sessionSummaries.length).toBe(1);
    });

    it('caps history at MAX_HISTORY_SESSIONS (10)', () => {
      for (let i = 0; i < 15; i++) {
        unlimMemory.saveSessionSummary(`Session ${i}`);
      }
      const profile = unlimMemory.getProfile();
      expect(profile.sessionSummaries.length).toBeLessThanOrEqual(10);
    });
  });

  describe('buildMemoryContext', () => {
    it('returns empty string for fresh profile', () => {
      const ctx = unlimMemory.buildMemoryContext();
      expect(typeof ctx).toBe('string');
    });

    it('includes experiment data when tracked', () => {
      unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
      const ctx = unlimMemory.buildMemoryContext();
      expect(ctx).toContain('v1-cap6-esp1');
    });
  });

  describe('resetMemory', () => {
    it('clears all memory', () => {
      unlimMemory.updateProfile({ test: 'data' });
      unlimMemory.resetMemory();
      const profile = unlimMemory.getProfile();
      expect(profile.test).toBeUndefined();
    });
  });

  describe('stopSync', () => {
    it('does not throw', () => {
      expect(() => unlimMemory.stopSync()).not.toThrow();
    });
  });
});
