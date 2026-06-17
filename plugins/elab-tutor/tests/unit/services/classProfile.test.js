/**
 * classProfile.test.js — New tests for classProfile service
 * Sprint T iter 28 — NEW FILE (distinct from existing classProfile.test.js and classProfile.extended.test.js)
 *
 * Focuses on: buildClassContext output format, getWelcomeMessage logic,
 * getNextLessonSuggestion branches, error aggregation, multi-session edge cases.
 * Uses freshCall() to bypass 2s memoization cache.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/hooks/useSessionTracker', () => ({
  getSavedSessions: vi.fn(() => []),
}));

vi.mock('../../../src/data/lesson-paths', () => ({
  getLessonPath: vi.fn((id) => {
    const paths = {
      'v1-cap6-esp1': {
        title: 'Accendi il tuo primo LED',
        session_save: {
          concepts_covered: ['circuito-chiuso', 'polarita-led'],
          next_suggested: 'v1-cap6-esp2',
          resume_message: 'Ragazzi, l\'ultima volta avete acceso il primo LED!',
        },
      },
      'v1-cap6-esp2': {
        title: 'LED senza resistenza',
        session_save: {
          concepts_covered: ['resistenza-protezione'],
          next_suggested: 'v1-cap6-esp3',
          resume_message: null,
        },
      },
      'v1-cap6-esp3': {
        title: 'LED più luminoso',
        session_save: {
          concepts_covered: ['ohm'],
          next_suggested: null,
          resume_message: null,
        },
      },
    };
    return paths[id] || null;
  }),
}));

import {
  buildClassProfile,
  buildClassContext,
  getWelcomeMessage,
  getNextLessonSuggestion,
} from '../../../src/services/classProfile';
import { getSavedSessions } from '../../../src/hooks/useSessionTracker';

let fakeNow = Date.now() + 100000;
function freshCall(fn) {
  fakeNow += 5000;
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

// ─── buildClassContext ─────────────────────────────────────────────────

describe('buildClassContext — empty state', () => {
  it('returns empty string for first time (no sessions)', () => {
    getSavedSessions.mockReturnValue([]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toBe('');
  });
});

describe('buildClassContext — with sessions', () => {
  it('returns [CONTESTO CLASSE] header', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toContain('[CONTESTO CLASSE]');
  });

  it('includes total sessions count', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
      { experimentId: 'v1-cap6-esp2', startTime: new Date().toISOString(), messages: [] },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toContain('Sessioni totali: 2');
  });

  it('includes last experiment ID', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toContain('v1-cap6-esp1');
  });

  it('includes concepts learned', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toContain('Concetti appresi:');
    expect(ctx).toContain('circuito-chiuso');
  });

  it('includes prossimo suggerito when available', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toContain('Prossimo suggerito:');
  });

  it('includes error frequency when errors present', () => {
    getSavedSessions.mockReturnValue([
      {
        experimentId: 'v1-cap6-esp1',
        startTime: new Date().toISOString(),
        messages: [],
        errors: [{ type: 'polarita' }, { type: 'polarita' }, { type: 'filo' }],
      },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).toContain('Errori frequenti classe:');
    expect(ctx).toContain('polarita');
  });

  it('does not include error section when no errors', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [], errors: [] },
    ]);
    const ctx = freshCall(() => buildClassContext());
    expect(ctx).not.toContain('Errori frequenti classe:');
  });
});

// ─── getWelcomeMessage ─────────────────────────────────────────────────

describe('getWelcomeMessage — first time', () => {
  it('returns first_time type', () => {
    getSavedSessions.mockReturnValue([]);
    const result = freshCall(() => getWelcomeMessage());
    expect(result.type).toBe('first_time');
  });

  it('returns non-empty text', () => {
    getSavedSessions.mockReturnValue([]);
    const result = freshCall(() => getWelcomeMessage());
    expect(typeof result.text).toBe('string');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('text mentions starting (primo o iniziamo)', () => {
    getSavedSessions.mockReturnValue([]);
    const result = freshCall(() => getWelcomeMessage());
    const lower = result.text.toLowerCase();
    expect(lower.includes('primo') || lower.includes('inizi')).toBe(true);
  });
});

describe('getWelcomeMessage — returning', () => {
  it('returns returning type with resume_message', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const result = freshCall(() => getWelcomeMessage());
    expect(result.type).toBe('returning');
  });

  it('uses resume_message from lesson path', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const result = freshCall(() => getWelcomeMessage());
    expect(result.text).toContain("Ragazzi,");
  });

  it('falls back to generic message when no resume_message', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp3', startTime: new Date().toISOString(), messages: [] },
    ]);
    const result = freshCall(() => getWelcomeMessage());
    expect(result.type).toBe('returning');
    expect(typeof result.text).toBe('string');
  });

  it('generic fallback contains last experiment title', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp3', startTime: new Date().toISOString(), messages: [] },
    ]);
    const result = freshCall(() => getWelcomeMessage());
    expect(result.text).toContain('LED più luminoso');
  });
});

// ─── getNextLessonSuggestion ───────────────────────────────────────────

describe('getNextLessonSuggestion — first time', () => {
  it('returns object for first time user', () => {
    getSavedSessions.mockReturnValue([]);
    const suggestion = freshCall(() => getNextLessonSuggestion());
    expect(suggestion).not.toBeNull();
    expect(suggestion.experimentId).toBe('v1-cap6-esp1');
  });

  it('returns message for first time user', () => {
    getSavedSessions.mockReturnValue([]);
    const suggestion = freshCall(() => getNextLessonSuggestion());
    expect(typeof suggestion.message).toBe('string');
    expect(suggestion.message.length).toBeGreaterThan(0);
  });

  it('returns title for first time user', () => {
    getSavedSessions.mockReturnValue([]);
    const suggestion = freshCall(() => getNextLessonSuggestion());
    expect(typeof suggestion.title).toBe('string');
    expect(suggestion.title.length).toBeGreaterThan(0);
  });
});

describe('getNextLessonSuggestion — returning user', () => {
  it('returns null when no next_suggested available', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp3', startTime: new Date().toISOString(), messages: [] },
    ]);
    const suggestion = freshCall(() => getNextLessonSuggestion());
    expect(suggestion).toBeNull();
  });

  it('returns suggestion when next_suggested is set', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const suggestion = freshCall(() => getNextLessonSuggestion());
    expect(suggestion).not.toBeNull();
    expect(suggestion.experimentId).toBe('v1-cap6-esp2');
  });

  it('returns message containing experiment title', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const suggestion = freshCall(() => getNextLessonSuggestion());
    expect(suggestion.message).toContain('LED senza resistenza');
  });
});

// ─── buildClassProfile — error aggregation ────────────────────────────

describe('buildClassProfile — error aggregation', () => {
  it('aggregates errors across multiple sessions', () => {
    getSavedSessions.mockReturnValue([
      {
        experimentId: 'v1-cap6-esp1',
        startTime: new Date().toISOString(),
        messages: [],
        errors: [{ type: 'polarita' }, { type: 'filo' }],
      },
      {
        experimentId: 'v1-cap6-esp2',
        startTime: new Date().toISOString(),
        messages: [],
        errors: [{ type: 'polarita' }],
      },
    ]);
    const profile = freshCall(() => buildClassProfile());
    const polarita = profile.commonErrors.find(e => e.type === 'polarita');
    expect(polarita).toBeDefined();
    expect(polarita.count).toBe(2);
  });

  it('limits common errors to top 5', () => {
    const errors = ['a', 'b', 'c', 'd', 'e', 'f'].map(t => ({ type: t }));
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [], errors },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.commonErrors.length).toBeLessThanOrEqual(5);
  });

  it('sorts errors by descending count', () => {
    getSavedSessions.mockReturnValue([
      {
        experimentId: 'v1-cap6-esp1',
        startTime: new Date().toISOString(),
        messages: [],
        errors: [
          { type: 'filo' },
          { type: 'polarita' }, { type: 'polarita' }, { type: 'polarita' },
        ],
      },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.commonErrors[0].type).toBe('polarita');
    expect(profile.commonErrors[0].count).toBe(3);
  });

  it('handles sessions without errors array', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.commonErrors).toEqual([]);
  });
});

// ─── buildClassProfile — message counting ────────────────────────────

describe('buildClassProfile — totalMessages', () => {
  it('counts messages across sessions', () => {
    getSavedSessions.mockReturnValue([
      {
        experimentId: 'v1-cap6-esp1',
        startTime: new Date().toISOString(),
        messages: [{ role: 'user', text: 'a' }, { role: 'ai', text: 'b' }],
      },
      {
        experimentId: 'v1-cap6-esp2',
        startTime: new Date().toISOString(),
        messages: [{ role: 'user', text: 'c' }],
      },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.totalMessages).toBe(3);
  });

  it('handles sessions with undefined messages', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString() },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.totalMessages).toBe(0);
  });
});

// ─── buildClassProfile — unique experiments ────────────────────────────

describe('buildClassProfile — unique experimentsCompleted', () => {
  it('deduplicates repeated experiment sessions', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.experimentsCompleted.length).toBe(1);
  });

  it('collects concepts from all sessions', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
      { experimentId: 'v1-cap6-esp2', startTime: new Date().toISOString(), messages: [] },
    ]);
    const profile = freshCall(() => buildClassProfile());
    expect(profile.conceptsLearned).toContain('circuito-chiuso');
    expect(profile.conceptsLearned).toContain('resistenza-protezione');
  });

  it('deduplicates concepts across sessions', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: new Date().toISOString(), messages: [] },
      { experimentId: 'v1-cap6-esp2', startTime: new Date().toISOString(), messages: [] },
    ]);
    const profile = freshCall(() => buildClassProfile());
    const polarita = profile.conceptsLearned.filter(c => c === 'polarita-led');
    expect(polarita.length).toBe(1);
  });
});
