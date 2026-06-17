/**
 * nudgeService extended — Additional tests for nudge delivery pipeline
 * Tests sendNudge, getPendingNudges, markAsRead, GDPR compliance.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/components/simulator/api/AnalyticsWebhook', () => ({
  sendAnalyticsEvent: vi.fn(),
}));

vi.mock('../../src/services/supabaseSync', () => ({
  sendNudge: vi.fn(),
  subscribeToNudges: vi.fn(() => ({ unsubscribe: vi.fn() })),
  markNudgeRead: vi.fn(),
}));

vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

import { sendNudge, consumeNudges } from '../../src/services/nudgeService';

const store = {};
const localStorageMock = {
  getItem: vi.fn((k) => store[k] ?? null),
  setItem: vi.fn((k, v) => { store[k] = v; }),
  removeItem: vi.fn((k) => { delete store[k]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('nudgeService extended', () => {
  describe('sendNudge', () => {
    it('creates nudge with unique ID', () => {
      const result = sendNudge('student-1', 'Mario', 'Bravo!');
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it('stores nudge in localStorage', () => {
      sendNudge('student-1', 'Mario', 'Continua cosi!');
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const stored = JSON.parse(store['elab-nudge-pending'] || '[]');
      expect(stored.length).toBeGreaterThan(0);
      expect(stored[0].message).toBe('Continua cosi!');
    });

    it('does NOT store student name in localStorage (GDPR)', () => {
      sendNudge('student-1', 'Mario Rossi', 'Bravo!');
      const stored = JSON.parse(store['elab-nudge-pending'] || '[]');
      // studentName should NOT be in the stored nudge (PII minimization)
      expect(stored[0].studentName).toBeUndefined();
    });

    it('caps pending nudges at 50', () => {
      // Pre-fill with 55 nudges
      const existing = Array.from({ length: 55 }, (_, i) => ({
        id: `old-${i}`, message: `msg-${i}`, timestamp: new Date().toISOString(),
      }));
      store['elab-nudge-pending'] = JSON.stringify(existing);

      sendNudge('student-1', 'Mario', 'New nudge');
      const stored = JSON.parse(store['elab-nudge-pending']);
      expect(stored.length).toBeLessThanOrEqual(50);
    });

    it('nudge has from=teacher', () => {
      sendNudge('student-1', 'Mario', 'Test');
      const stored = JSON.parse(store['elab-nudge-pending']);
      expect(stored[0].from).toBe('teacher');
    });
  });

  describe('consumeNudges', () => {
    it('returns empty array when no nudges', () => {
      const nudges = consumeNudges('student-1');
      expect(nudges).toEqual([]);
    });

    it('returns and clears nudges for specific student', () => {
      sendNudge('student-1', 'Mario', 'Per te');
      sendNudge('student-2', 'Luigi', 'Per Luigi');
      const nudges = consumeNudges('student-1');
      expect(nudges.length).toBe(1);
      expect(nudges[0].message).toBe('Per te');
      // After consume, should be empty for that student
      const again = consumeNudges('student-1');
      expect(again).toEqual([]);
    });
  });
});
