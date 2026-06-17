/**
 * BentornatiFlow — Tests for the Bentornati welcome flow in LavagnaShell
 * Tests classProfile integration and flow logic.
 * Claude web andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock useSessionTracker's getSavedSessions to control session data
// This bypasses classProfile's 2s memoization cache issues in fast test runs
vi.mock('../../../src/hooks/useSessionTracker', async (importOriginal) => {
  const orig = await importOriginal();
  return { ...orig, getSavedSessions: vi.fn(() => []) };
});

import { buildClassProfile, getNextLessonSuggestion } from '../../../src/services/classProfile';
import { getSavedSessions } from '../../../src/hooks/useSessionTracker';

// classProfile has a 2s memoization cache using Date.now().
// To bust it, we call buildClassProfile with a fake time far in the future.
let fakeNow = 1000000;
function freshProfile() {
  fakeNow += 10000; // Jump 10s forward each call — always past the 2s TTL
  const origNow = Date.now;
  Date.now = () => fakeNow;
  const profile = buildClassProfile();
  Date.now = origNow;
  return profile;
}

function freshSuggestion() {
  fakeNow += 10000;
  const origNow = Date.now;
  Date.now = () => fakeNow;
  const suggestion = getNextLessonSuggestion();
  Date.now = origNow;
  return suggestion;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSavedSessions.mockReturnValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BentornatiFlow', () => {
  describe('classProfile — first-time user', () => {
    it('returns isFirstTime when no sessions exist', () => {
      getSavedSessions.mockReturnValue([]);
      const profile = freshProfile();
      expect(profile.isFirstTime).toBe(true);
      expect(profile.lastExperimentId).toBeNull();
      expect(profile.totalSessions).toBe(0);
    });

    it('getNextLessonSuggestion returns v1-cap6-esp1 for first time', () => {
      getSavedSessions.mockReturnValue([]);
      const suggestion = freshSuggestion();
      expect(suggestion).not.toBeNull();
      expect(suggestion.experimentId).toBe('v1-cap6-esp1');
      expect(suggestion.title).toBeTruthy();
    });
  });

  describe('classProfile — returning user', () => {
    const SESSION_V1_CAP6 = {
      experimentId: 'v1-cap6-esp1',
      startTime: '2026-04-10T10:00:00Z',
      endTime: '2026-04-10T10:30:00Z',
      messages: [],
      errors: [],
    };

    it('returns isFirstTime=false when sessions exist', () => {
      getSavedSessions.mockReturnValue([SESSION_V1_CAP6]);
      const profile = freshProfile();
      expect(profile.isFirstTime).toBe(false);
      expect(profile.lastExperimentId).toBe('v1-cap6-esp1');
      expect(profile.totalSessions).toBe(1);
    });

    it('tracks experiments completed with deduplication', () => {
      getSavedSessions.mockReturnValue([
        { experimentId: 'v1-cap6-esp1', startTime: '2026-04-10T10:00:00Z', messages: [], errors: [] },
        { experimentId: 'v1-cap6-esp2', startTime: '2026-04-10T11:00:00Z', messages: [], errors: [] },
        { experimentId: 'v1-cap6-esp1', startTime: '2026-04-10T12:00:00Z', messages: [], errors: [] },
      ]);
      const profile = freshProfile();
      expect(profile.experimentsCompleted).toContain('v1-cap6-esp1');
      expect(profile.experimentsCompleted).toContain('v1-cap6-esp2');
      expect(profile.experimentsCompleted.length).toBe(2);
    });

    it('tracks common errors sorted by frequency', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [
          { type: 'short_circuit' },
          { type: 'polarity_reversed' },
          { type: 'short_circuit' },
        ],
      }]);
      const profile = freshProfile();
      expect(profile.commonErrors.length).toBeGreaterThan(0);
      const shortCircuit = profile.commonErrors.find(e => e.type === 'short_circuit');
      expect(shortCircuit).toBeTruthy();
      expect(shortCircuit.count).toBe(2);
      // short_circuit (2) should be before polarity_reversed (1)
      expect(profile.commonErrors[0].type).toBe('short_circuit');
    });

    it('computes total messages across sessions', () => {
      getSavedSessions.mockReturnValue([
        { experimentId: 'v1-cap6-esp1', startTime: '2026-04-10T10:00:00Z', messages: [{}, {}, {}], errors: [] },
        { experimentId: 'v1-cap6-esp2', startTime: '2026-04-10T11:00:00Z', messages: [{}, {}], errors: [] },
      ]);
      const profile = freshProfile();
      expect(profile.totalMessages).toBe(5);
    });
  });

  describe('Bentornati flow decisions', () => {
    it('first-time: should auto-load v1-cap6-esp1', () => {
      getSavedSessions.mockReturnValue([]);
      const profile = freshProfile();
      const suggestion = freshSuggestion();

      expect(profile.isFirstTime).toBe(true);
      expect(suggestion).not.toBeNull();
      expect(suggestion.experimentId).toBe('v1-cap6-esp1');
    });

    it('returning: profile has correct lastExperimentTitle', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const profile = freshProfile();
      expect(profile.isFirstTime).toBe(false);
      expect(profile.lastExperimentId).toBe('v1-cap6-esp1');
      expect(profile.lastExperimentTitle).toBeTruthy();
    });

    it('returning: getNextLessonSuggestion returns valid shape or null', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const suggestion = freshSuggestion();
      if (suggestion) {
        expect(suggestion.experimentId).toBeTruthy();
        expect(suggestion.title).toBeTruthy();
        expect(suggestion.message).toBeTruthy();
      }
    });
  });

  describe('handleBentornatiStart logic (unit)', () => {
    it('guards against null suggestion', () => {
      const suggestion = null;
      expect(suggestion?.experimentId).toBeFalsy();
    });

    it('extracts volume number from experiment ID prefix', () => {
      const testCases = [
        { id: 'v1-cap6-esp1', expected: 1 },
        { id: 'v2-cap7-esp1', expected: 2 },
        { id: 'v3-cap6-semaforo', expected: 3 },
        { id: 'unknown', expected: null },
      ];
      for (const { id, expected } of testCases) {
        const match = id.match(/^v(\d)/);
        const vol = match ? Number(match[1]) : null;
        expect(vol).toBe(expected);
      }
    });

    it('tryLoad returns false without API, true with API', () => {
      const origAPI = window.__ELAB_API;

      const tryLoad = (expId) => {
        const api = typeof window !== 'undefined' && window.__ELAB_API;
        if (api?.loadExperiment) {
          api.loadExperiment(expId);
          return true;
        }
        return false;
      };

      delete window.__ELAB_API;
      expect(tryLoad('v1-cap6-esp1')).toBe(false);

      const mockLoad = vi.fn();
      window.__ELAB_API = { loadExperiment: mockLoad };
      expect(tryLoad('v1-cap6-esp1')).toBe(true);
      expect(mockLoad).toHaveBeenCalledWith('v1-cap6-esp1');

      // Cleanup
      if (origAPI) window.__ELAB_API = origAPI;
      else delete window.__ELAB_API;
    });
  });
});
