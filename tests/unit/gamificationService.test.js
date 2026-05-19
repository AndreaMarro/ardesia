/**
 * gamificationService — Tests for points, streak, badges, orchestration
 * Tests the complete gamification pipeline with localStorage mocking.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import gamification from '../../src/services/gamificationService';

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: vi.fn((k) => store[k] ?? null),
  setItem: vi.fn((k, v) => { store[k] = v; }),
  removeItem: vi.fn((k) => { delete store[k]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Mock Web Audio API (not available in test env)
globalThis.AudioContext = vi.fn(() => ({
  state: 'running',
  resume: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => ({
    type: 'sine',
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { value: 0, exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
}));

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  gamification.teardown();
});

describe('gamificationService', () => {
  describe('Points system', () => {
    it('returns zero points initially', () => {
      expect(gamification.getTotalPoints()).toBe(0);
    });

    it('getPoints returns correct shape', () => {
      const pts = gamification.getPoints();
      expect(pts).toHaveProperty('total');
      expect(pts).toHaveProperty('history');
      expect(Array.isArray(pts.history)).toBe(true);
    });

    it('addPoints increments total', () => {
      const total = gamification.addPoints(10, 'test');
      expect(total).toBe(10);
      expect(gamification.getTotalPoints()).toBe(10);
    });

    it('addPoints accumulates across calls', () => {
      gamification.addPoints(10, 'first');
      gamification.addPoints(5, 'second');
      expect(gamification.getTotalPoints()).toBe(15);
    });

    it('addPoints records history with timestamp', () => {
      gamification.addPoints(10, 'Esperimento v1-cap6-esp1');
      const pts = gamification.getPoints();
      expect(pts.history.length).toBe(1);
      expect(pts.history[0].amount).toBe(10);
      expect(pts.history[0].reason).toBe('Esperimento v1-cap6-esp1');
      expect(pts.history[0].ts).toBeGreaterThan(0);
    });

    it('addPoints caps history at 200 entries', () => {
      for (let i = 0; i < 210; i++) {
        gamification.addPoints(1, `entry-${i}`);
      }
      const pts = gamification.getPoints();
      expect(pts.history.length).toBe(200);
      expect(pts.total).toBe(210);
    });

    it('POINT_VALUES has expected keys', () => {
      expect(gamification.POINT_VALUES.experimentCompleted).toBe(10);
      expect(gamification.POINT_VALUES.quizCorrect).toBe(5);
      expect(gamification.POINT_VALUES.firstExperiment).toBe(20);
      expect(gamification.POINT_VALUES.gameWon).toBe(8);
      expect(gamification.POINT_VALUES.streakDay).toBe(3);
    });

    it('handles corrupted localStorage gracefully', () => {
      store['elab_gamification_points'] = 'INVALID_JSON{{{';
      const pts = gamification.getPoints();
      expect(pts.total).toBe(0);
      expect(pts.history).toEqual([]);
    });
  });

  describe('Streak system', () => {
    it('returns zero streak initially', () => {
      const streak = gamification.getStreak();
      expect(streak.current).toBe(0);
      expect(streak.lastDate).toBeNull();
      expect(streak.best).toBe(0);
    });

    it('updateStreak sets current to 1 on first call', () => {
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1);
      expect(streak.lastDate).toBe(new Date().toISOString().slice(0, 10));
      expect(streak.best).toBe(1);
    });

    it('updateStreak is idempotent on same day', () => {
      gamification.updateStreak();
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1);
    });

    it('updateStreak resets if gap > 1 day', () => {
      // Simulate a streak from 3 days ago
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
      store['elab_gamification_streak'] = JSON.stringify({ current: 5, lastDate: threeDaysAgo, best: 5 });
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1); // Reset
      expect(streak.best).toBe(5);    // Best preserved
    });

    it('handles corrupted streak data gracefully', () => {
      store['elab_gamification_streak'] = 'NOT_JSON';
      const streak = gamification.getStreak();
      expect(streak.current).toBe(0);
    });
  });

  describe('Badge system', () => {
    it('BADGE_DEFS has 8 badges', () => {
      expect(gamification.BADGE_DEFS.length).toBe(8);
    });

    it('no badges unlocked initially', () => {
      expect(gamification.getUnlockedBadges()).toEqual([]);
    });

    it('checkAndUnlockBadges unlocks first-experiment badge', () => {
      const newBadges = gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      expect(newBadges.length).toBe(1);
      expect(newBadges[0].id).toBe('first-experiment');
    });

    it('checkAndUnlockBadges unlocks multiple at once', () => {
      const newBadges = gamification.checkAndUnlockBadges({ experiments: 10, streak: 3, quizzes: 10 });
      const ids = newBadges.map(b => b.id);
      expect(ids).toContain('first-experiment');
      expect(ids).toContain('exp-5');
      expect(ids).toContain('exp-10');
      expect(ids).toContain('streak-3');
      expect(ids).toContain('quiz-master');
    });

    it('does not re-unlock already earned badges', () => {
      gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      const second = gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      expect(second.length).toBe(0);
    });

    it('getAllBadges returns all with unlocked status', () => {
      gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      const all = gamification.getAllBadges();
      expect(all.length).toBe(8);
      const first = all.find(b => b.id === 'first-experiment');
      expect(first.unlocked).toBe(true);
      const exp5 = all.find(b => b.id === 'exp-5');
      expect(exp5.unlocked).toBe(false);
    });
  });

  describe('Orchestration', () => {
    it('does not play celebration audio or show confetti on experiment completion', () => {
      const result = gamification.onExperimentCompleted('v1-cap6-esp1', true);
      expect(result.total).toBe(20);
      expect(globalThis.AudioContext).not.toHaveBeenCalled();
      expect(document.getElementById('elab-confetti-keyframes')).toBeNull();
      expect(document.body.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('onExperimentCompleted returns total, newBadges, streak', () => {
      const result = gamification.onExperimentCompleted('v1-cap6-esp1', true);
      expect(result.total).toBe(20); // firstExperiment = 20
      expect(result.streak.current).toBe(1);
      expect(result.newBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('onExperimentCompleted uses 10 pts for non-first', () => {
      const result = gamification.onExperimentCompleted('v1-cap6-esp1', false);
      expect(result.total).toBe(10);
    });

    it('onQuizCorrect adds 5 points', () => {
      const total = gamification.onQuizCorrect('v1-cap6-esp1');
      expect(total).toBe(5);
    });

    it('onGameWon adds 8 points', () => {
      const total = gamification.onGameWon('detective');
      expect(total).toBe(8);
    });

    it('onQuizWrong does not add points', () => {
      gamification.onQuizWrong();
      expect(gamification.getTotalPoints()).toBe(0);
    });
  });

  describe('teardown', () => {
    it('teardown completes without error', () => {
      gamification.onExperimentCompleted('v1-cap6-esp1');
      expect(() => gamification.teardown()).not.toThrow();
    });
  });
});
