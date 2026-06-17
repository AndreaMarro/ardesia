/**
 * classProfile extended — Tests for buildClassContext, getWelcomeMessage, getNextLessonSuggestion
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/hooks/useSessionTracker', () => ({
  getSavedSessions: vi.fn(() => []),
}));

vi.mock('../../src/data/lesson-paths', () => ({
  getLessonPath: vi.fn((id) => {
    if (id === 'v1-cap6-esp1') return {
      title: 'Accendi il tuo primo LED',
      experiment_id: 'v1-cap6-esp1',
      session_save: {
        concepts_covered: ['circuito-chiuso', 'polarita-led'],
        next_suggested: 'v1-cap6-esp2',
        resume_message: 'L\'ultima volta avete acceso il primo LED. Oggi proviamo senza resistenza!',
      },
    };
    if (id === 'v1-cap6-esp2') return {
      title: 'LED senza resistenza',
      experiment_id: 'v1-cap6-esp2',
      session_save: { concepts_covered: ['resistenza-protezione'], next_suggested: 'v1-cap6-esp3' },
    };
    return null;
  }),
}));

import { buildClassProfile, buildClassContext, getWelcomeMessage, getNextLessonSuggestion } from '../../src/services/classProfile';
import { getSavedSessions } from '../../src/hooks/useSessionTracker';

let fakeNow = 1000000;
function freshCall(fn) {
  fakeNow += 10000;
  const origNow = Date.now;
  Date.now = () => fakeNow;
  const result = fn();
  Date.now = origNow;
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  getSavedSessions.mockReturnValue([]);
});

describe('classProfile extended', () => {
  describe('buildClassContext', () => {
    it('returns empty string for first-time user', () => {
      getSavedSessions.mockReturnValue([]);
      const ctx = freshCall(() => buildClassContext());
      expect(ctx).toBe('');
    });

    it('returns context block for returning user', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [{}, {}],
        errors: [],
      }]);
      const ctx = freshCall(() => buildClassContext());
      expect(ctx).toContain('[CONTESTO CLASSE]');
      expect(ctx).toContain('Sessioni totali: 1');
      expect(ctx).toContain('Accendi il tuo primo LED');
    });

    it('includes concepts learned', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const ctx = freshCall(() => buildClassContext());
      expect(ctx).toContain('circuito-chiuso');
    });

    it('includes common errors sorted by frequency', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [
          { type: 'polarity' },
          { type: 'polarity' },
          { type: 'short_circuit' },
        ],
      }]);
      const ctx = freshCall(() => buildClassContext());
      expect(ctx).toContain('polarity(x2)');
    });

    it('includes next suggested experiment', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const ctx = freshCall(() => buildClassContext());
      expect(ctx).toContain('v1-cap6-esp2');
    });
  });

  describe('getWelcomeMessage', () => {
    it('returns first_time for new user', () => {
      getSavedSessions.mockReturnValue([]);
      const msg = freshCall(() => getWelcomeMessage());
      expect(msg.type).toBe('first_time');
      expect(msg.text).toContain('prima volta');
    });

    it('returns returning with resume message', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const msg = freshCall(() => getWelcomeMessage());
      expect(msg.type).toBe('returning');
      expect(msg.text).toContain('LED');
    });
  });

  describe('getNextLessonSuggestion', () => {
    it('returns v1-cap6-esp1 for first-time user', () => {
      getSavedSessions.mockReturnValue([]);
      const sug = freshCall(() => getNextLessonSuggestion());
      expect(sug).not.toBeNull();
      expect(sug.experimentId).toBe('v1-cap6-esp1');
      expect(sug.title).toContain('LED');
    });

    it('returns next suggested for returning user', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const sug = freshCall(() => getNextLessonSuggestion());
      expect(sug).not.toBeNull();
      expect(sug.experimentId).toBe('v1-cap6-esp2');
      expect(sug.title).toBe('LED senza resistenza');
    });

    it('returns null when no next suggested and not first time', () => {
      getSavedSessions.mockReturnValue([{
        experimentId: 'v1-cap14-esp1', // no lesson path
        startTime: '2026-04-10T10:00:00Z',
        messages: [],
        errors: [],
      }]);
      const sug = freshCall(() => getNextLessonSuggestion());
      expect(sug).toBeNull();
    });
  });
});
