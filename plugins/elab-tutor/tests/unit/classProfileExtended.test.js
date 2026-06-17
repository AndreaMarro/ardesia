/**
 * classProfileExtended.test.js — Test estesi per classProfile + integrazione chapter-map
 *
 * Copre: getWelcomeMessage, getNextLessonSuggestion, buildClassContext,
 * e verifica che i suggerimenti "next" siano coerenti con la mappa capitoli.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before import
vi.mock('../../src/hooks/useSessionTracker', () => ({
  getSavedSessions: vi.fn(() => []),
}));

vi.mock('../../src/data/lesson-paths', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getLessonPath: vi.fn((id) => {
      if (id === 'v1-cap6-esp1') return { title: 'Accendi il tuo primo LED', session_save: { next_suggested: 'v1-cap6-esp2', resume_message: 'Bentornati! Continuiamo con i LED.', concepts_covered: ['circuito chiuso', 'LED'] } };
      if (id === 'v1-cap6-esp2') return { title: 'LED in serie', session_save: { next_suggested: 'v1-cap6-esp3' } };
      if (id === 'v1-cap6-esp3') return { title: 'LED in parallelo' };
      return null;
    }),
  };
});

import { buildClassProfile, getWelcomeMessage, getNextLessonSuggestion, buildClassContext } from '../../src/services/classProfile';
import { getSavedSessions } from '../../src/hooks/useSessionTracker';

beforeEach(() => {
  vi.clearAllMocks();
  // Force cache invalidation by advancing time
  vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 10000);
});

// ═══ getWelcomeMessage ═══════════════════════════════════

describe('getWelcomeMessage', () => {
  it('first time returns greeting with first experiment', () => {
    getSavedSessions.mockReturnValue([]);
    const msg = getWelcomeMessage();
    expect(msg.type).toBe('first_time');
    expect(msg.text).toContain('prima volta');
  });

  it('returning user gets resume message from lesson path', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
    ]);
    const msg = getWelcomeMessage();
    expect(msg.type).toBe('returning');
    expect(msg.text).toContain('Bentornati');
  });

  it('returning user without resume_message gets generic message', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp3', startTime: '2026-04-01', messages: [] },
    ]);
    const msg = getWelcomeMessage();
    expect(msg.type).toBe('returning');
    expect(msg.text).toContain('Bentornati');
    expect(msg.text).toContain('LED in parallelo');
  });
});

// ═══ getNextLessonSuggestion ═════════════════════════════

describe('getNextLessonSuggestion', () => {
  it('first time suggests v1-cap6-esp1', () => {
    getSavedSessions.mockReturnValue([]);
    const suggestion = getNextLessonSuggestion();
    expect(suggestion).toBeTruthy();
    expect(suggestion.experimentId).toBe('v1-cap6-esp1');
    expect(suggestion.title).toContain('Accendi');
  });

  it('after completing experiment, suggests next from lesson path', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
    ]);
    const suggestion = getNextLessonSuggestion();
    expect(suggestion).toBeTruthy();
    expect(suggestion.experimentId).toBe('v1-cap6-esp2');
  });

  it('returns null when no next_suggested in lesson path', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp3', startTime: '2026-04-01', messages: [] },
    ]);
    const suggestion = getNextLessonSuggestion();
    expect(suggestion).toBeNull();
  });
});

// ═══ buildClassContext ════════════════════════════════════

describe('buildClassContext', () => {
  it('returns empty string for first-time user', () => {
    getSavedSessions.mockReturnValue([]);
    expect(buildClassContext()).toBe('');
  });

  it('includes session count', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: ['msg1', 'msg2'] },
    ]);
    const ctx = buildClassContext();
    expect(ctx).toContain('[CONTESTO CLASSE]');
    expect(ctx).toContain('Sessioni totali: 1');
  });

  it('includes last experiment info', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
    ]);
    const ctx = buildClassContext();
    expect(ctx).toContain('Ultimo esperimento: Accendi il tuo primo LED');
    expect(ctx).toContain('v1-cap6-esp1');
  });

  it('includes experiments completed list', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
      { experimentId: 'v1-cap6-esp2', startTime: '2026-04-02', messages: [] },
    ]);
    const ctx = buildClassContext();
    expect(ctx).toContain('Esperimenti fatti:');
    expect(ctx).toContain('v1-cap6-esp1');
    expect(ctx).toContain('v1-cap6-esp2');
  });

  it('includes common errors', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [],
        errors: [{ type: 'LED_REVERSED' }, { type: 'LED_REVERSED' }] },
    ]);
    const ctx = buildClassContext();
    expect(ctx).toContain('Errori frequenti');
    expect(ctx).toContain('LED_REVERSED');
  });

  it('includes next suggestion when available', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
    ]);
    const ctx = buildClassContext();
    expect(ctx).toContain('Prossimo suggerito:');
    expect(ctx).toContain('v1-cap6-esp2');
  });
});

// ═══ buildClassProfile edge cases ════════════════════════

describe('buildClassProfile edge cases', () => {
  it('handles session without errors array', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
    ]);
    const profile = buildClassProfile();
    expect(profile.commonErrors).toEqual([]);
  });

  it('handles multiple sessions for same experiment', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01', messages: [] },
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-02', messages: [] },
    ]);
    const profile = buildClassProfile();
    expect(profile.experimentsCompleted).toHaveLength(1); // unique
    expect(profile.totalSessions).toBe(2);
  });

  it('handles session with unknown experiment ID', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'nonexistent', startTime: '2026-04-01', messages: [] },
    ]);
    const profile = buildClassProfile();
    expect(profile.isFirstTime).toBe(false);
    expect(profile.lastExperimentId).toBe('nonexistent');
  });
});
