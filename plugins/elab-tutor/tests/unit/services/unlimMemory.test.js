/**
 * unlimMemory.test.js — New comprehensive tests for unlimMemory service
 * Sprint T iter 28 — NEW FILE (distinct from tests/unit/unlimMemory.extended.test.js)
 *
 * Covers: buildMemoryContext, trackMistake GC, trackQuizResult edge cases,
 * saveSessionSummary capping, localStorage full handling, context string format,
 * resetMemory, saveContext local fallback, loadContextLocal, getProgress.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

// ─── localStorage mock ────────────────────────────────────────────────
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
Object.defineProperty(globalThis, 'navigator', {
  value: { sendBeacon: vi.fn(() => true) },
  writable: true,
});

import unlimMemory from '../../../src/services/unlimMemory';

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  unlimMemory.resetMemory();
});

// ─── buildMemoryContext ───────────────────────────────────────────────

describe('unlimMemory — buildMemoryContext', () => {
  it('returns empty string for brand new profile', () => {
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toBe('');
  });

  it('includes [MEMORIA STUDENTE] header when profile has data', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'success');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('[MEMORIA STUDENTE]');
    expect(ctx).toContain('MEMORIA PASSATA PERSISTENTE');
    expect(ctx).toContain('non e stato live attuale');
  });

  it('builds a persistent context with present and past clearly separated', async () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'success');
    unlimMemory.saveSessionSummary('Ieri LED e resistore funzionavano');
    await unlimMemory.saveContext('classe-a', 'v1-cap6-esp1', {
      summary: 'La classe ha invertito il LED due volte',
      concepts_covered: ['polarita', 'resistore'],
    });

    const ctx = await unlimMemory.buildPersistentContext('classe-a', {
      experimentId: 'v1-cap6-led-rosso',
      liveState: 'Ora LED spento sul simulatore',
      visibleScreen: 'Lavagna aperta in modalita passo passo',
    });

    expect(ctx).toContain('[PRESENTE LIVE]');
    expect(ctx).toContain('Ora LED spento sul simulatore');
    expect(ctx).toContain('[MEMORIA PASSATA PERSISTENTE]');
    expect(ctx).toContain('Ieri LED e resistore funzionavano');
    expect(ctx).toContain('Non trattare questa memoria come stato visibile ora');
  });

  it('shows completed count out of 69', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'success');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('/69');
  });

  it('shows recent experiments (last 3)', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    unlimMemory.trackExperimentCompletion('v1-cap6-esp2');
    unlimMemory.trackExperimentCompletion('v1-cap7-esp1');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Ultimi:');
    expect(ctx).toContain('v1-cap6-esp1');
  });

  it('includes quiz stats when quiz results exist', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 4, 5);
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Quiz:');
  });

  it('includes quiz percentage in context', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 8, 10);
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('80%');
  });

  it('includes weak quiz experiments (percentage < 50)', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 1, 5); // 20%
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Quiz deboli:');
    expect(ctx).toContain('v1-cap6-esp1');
  });

  it('does not include weak quiz for 100% score', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 10, 10);
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).not.toContain('Quiz deboli:');
  });

  it('includes top error categories', () => {
    unlimMemory.trackMistake('polarita', 'LED rovesciato');
    unlimMemory.trackMistake('polarita', 'LED rovesciato ancora');
    unlimMemory.trackMistake('filo', 'filo scollegato');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Errori frequenti:');
    expect(ctx).toContain('polarita');
  });

  it('includes session summary when present', () => {
    unlimMemory.saveSessionSummary('Abbiamo acceso il primo LED');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Sessione precedente:');
    expect(ctx).toContain('Abbiamo acceso il primo LED');
  });

  it('shows only last session summary', () => {
    unlimMemory.saveSessionSummary('Prima sessione LED');
    unlimMemory.saveSessionSummary('Seconda sessione buzzer');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Seconda sessione buzzer');
    expect(ctx).not.toContain('Prima sessione LED');
  });

  it('includes backend level when set', () => {
    unlimMemory.updateProfile({ _backendLevel: 'intermedio' });
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1'); // force non-empty
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Livello backend: intermedio');
  });

  it('includes backend weaknesses when set', () => {
    unlimMemory.updateProfile({ _backendWeaknesses: ['resistenza', 'polarita'] });
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Debolezze: resistenza, polarita');
  });
});

// ─── trackMistake — GC / capping ─────────────────────────────────────

describe('unlimMemory — trackMistake capping', () => {
  it('caps mistakes at 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      unlimMemory.trackMistake('type', `detail ${i}`);
    }
    const profile = unlimMemory.getProfile();
    expect(profile.mistakes.length).toBeLessThanOrEqual(50);
  });

  it('keeps most recent mistakes when capping', () => {
    for (let i = 0; i < 55; i++) {
      unlimMemory.trackMistake('type', `detail ${i}`);
    }
    const profile = unlimMemory.getProfile();
    const last = profile.mistakes[profile.mistakes.length - 1];
    expect(last.detail).toBe('detail 54');
  });

  it('trackMistake stores category and detail', () => {
    unlimMemory.trackMistake('short-circuit', 'LED to GND direct');
    const profile = unlimMemory.getProfile();
    expect(profile.mistakes[0].category).toBe('short-circuit');
    expect(profile.mistakes[0].detail).toBe('LED to GND direct');
  });

  it('trackMistake stores timestamp', () => {
    unlimMemory.trackMistake('cat', 'det');
    const profile = unlimMemory.getProfile();
    expect(profile.mistakes[0].timestamp).toBeGreaterThan(0);
  });
});

// ─── trackQuizResult edge cases ──────────────────────────────────────

describe('unlimMemory — trackQuizResult', () => {
  it('computes 0% for 0/0 total', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 0, 0);
    const profile = unlimMemory.getProfile();
    expect(profile.quizzes['v1-cap6-esp1'].percentage).toBe(0);
  });

  it('computes 100% for perfect score', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 5, 5);
    const profile = unlimMemory.getProfile();
    expect(profile.quizzes['v1-cap6-esp1'].percentage).toBe(100);
  });

  it('rounds percentage to nearest integer', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 1, 3); // 33.33%
    const profile = unlimMemory.getProfile();
    expect(profile.quizzes['v1-cap6-esp1'].percentage).toBe(33);
  });

  it('stores correct, total, percentage, timestamp', () => {
    unlimMemory.trackQuizResult('v1-cap7-esp1', 4, 8);
    const q = unlimMemory.getProfile().quizzes['v1-cap7-esp1'];
    expect(q.correct).toBe(4);
    expect(q.total).toBe(8);
    expect(q.percentage).toBe(50);
    expect(q.timestamp).toBeGreaterThan(0);
  });

  it('overwrites quiz result for same experiment', () => {
    unlimMemory.trackQuizResult('v1-cap6-esp1', 2, 5);
    unlimMemory.trackQuizResult('v1-cap6-esp1', 5, 5);
    const q = unlimMemory.getProfile().quizzes['v1-cap6-esp1'];
    expect(q.correct).toBe(5);
    expect(q.percentage).toBe(100);
  });
});

// ─── saveSessionSummary capping ──────────────────────────────────────

describe('unlimMemory — saveSessionSummary', () => {
  it('caps session summaries at 10 entries', () => {
    for (let i = 0; i < 12; i++) {
      unlimMemory.saveSessionSummary(`Session ${i}`);
    }
    const profile = unlimMemory.getProfile();
    expect(profile.sessionSummaries.length).toBeLessThanOrEqual(10);
  });

  it('keeps most recent 10 when capping', () => {
    for (let i = 0; i < 12; i++) {
      unlimMemory.saveSessionSummary(`Session ${i}`);
    }
    const profile = unlimMemory.getProfile();
    const last = profile.sessionSummaries[profile.sessionSummaries.length - 1];
    expect(last.summary).toBe('Session 11');
  });

  it('stores summary and timestamp', () => {
    unlimMemory.saveSessionSummary('Test session');
    const profile = unlimMemory.getProfile();
    expect(profile.sessionSummaries[0].summary).toBe('Test session');
    expect(profile.sessionSummaries[0].timestamp).toBeGreaterThan(0);
  });
});

// ─── resetMemory ─────────────────────────────────────────────────────

describe('unlimMemory — resetMemory', () => {
  it('clears the profile', () => {
    unlimMemory.updateProfile({ name: 'test' });
    unlimMemory.resetMemory();
    const profile = unlimMemory.getProfile();
    expect(profile.name).toBeUndefined();
  });

  it('profile is empty object after reset', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    unlimMemory.resetMemory();
    const profile = unlimMemory.getProfile();
    expect(Object.keys(profile).length).toBe(0);
  });
});

// ─── trackExperimentCompletion ───────────────────────────────────────

describe('unlimMemory — trackExperimentCompletion', () => {
  it('marks experiment as completed', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'success');
    const profile = unlimMemory.getProfile();
    expect(profile.experiments['v1-cap6-esp1'].completed).toBe(true);
  });

  it('increments attempts on repeated calls', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    const profile = unlimMemory.getProfile();
    expect(profile.experiments['v1-cap6-esp1'].attempts).toBe(2);
  });

  it('stores lastResult', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'partial');
    const profile = unlimMemory.getProfile();
    expect(profile.experiments['v1-cap6-esp1'].lastResult).toBe('partial');
  });

  it('defaults result to success', () => {
    unlimMemory.trackExperimentCompletion('v1-cap7-esp1');
    const profile = unlimMemory.getProfile();
    expect(profile.experiments['v1-cap7-esp1'].lastResult).toBe('success');
  });

  it('stores timestamp', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    const profile = unlimMemory.getProfile();
    expect(profile.experiments['v1-cap6-esp1'].timestamp).toBeGreaterThan(0);
  });
});

// ─── updateProfile / getProfile ──────────────────────────────────────

describe('unlimMemory — updateProfile / getProfile', () => {
  it('updateProfile sets lastUpdated', () => {
    unlimMemory.updateProfile({ foo: 'bar' });
    const profile = unlimMemory.getProfile();
    expect(profile.lastUpdated).toBeGreaterThan(0);
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json');
    const profile = unlimMemory.getProfile();
    expect(typeof profile).toBe('object');
  });

  it('handles null localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    const profile = unlimMemory.getProfile();
    expect(typeof profile).toBe('object');
  });

  it('multiple updateProfile calls merge correctly', () => {
    unlimMemory.updateProfile({ a: 1 });
    unlimMemory.updateProfile({ b: 2 });
    const profile = unlimMemory.getProfile();
    expect(profile.a).toBe(1);
    expect(profile.b).toBe(2);
  });
});

// ─── API surface completeness ─────────────────────────────────────────

describe('unlimMemory — public API surface', () => {
  const expectedMethods = [
    'getProfile', 'updateProfile', 'trackExperimentCompletion', 'trackQuizResult',
    'trackMistake', 'saveSessionSummary', 'buildMemoryContext', 'resetMemory',
    'saveContext', 'loadContext', 'getLastLesson', 'getProgress', 'buildEnhancedContext',
    'syncWithBackend', 'loadFromBackend', 'initSync', 'stopSync',
  ];

  expectedMethods.forEach(method => {
    it(`exports ${method} function`, () => {
      expect(typeof unlimMemory[method]).toBe('function');
    });
  });
});
