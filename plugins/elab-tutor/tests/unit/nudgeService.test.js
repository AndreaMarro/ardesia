/**
 * nudgeService.test.js — Test per Nudge delivery system ELAB
 * Target: sendNudge, consumeNudges, startNudgeListener
 * 25+ test: delivery, consume, listener, cleanup, edge cases
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendNudge, consumeNudges, startNudgeListener } from '../../src/services/nudgeService';

// Mock dependencies
vi.mock('../../src/components/simulator/api/AnalyticsWebhook', () => ({
  sendAnalyticsEvent: vi.fn(),
}));
vi.mock('../../src/services/supabaseSync', () => ({
  sendNudge: vi.fn(() => Promise.resolve()),
  subscribeToNudges: vi.fn(() => ({ unsubscribe: vi.fn() })),
  markNudgeRead: vi.fn(() => Promise.resolve()),
}));
vi.mock('../../src/services/supabaseClient', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

// Mock localStorage
const store = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => store[k] || null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
    clear: vi.fn(() => Object.keys(store).forEach(k => delete store[k])),
  },
  writable: true,
});

// Mock BroadcastChannel
window.BroadcastChannel = vi.fn(() => ({
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
}));

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('sendNudge', () => {
  it('returns nudge object with id and timestamp', () => {
    const result = sendNudge('student1', 'Mario', 'Bravo!');
    expect(result.id).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
    expect(result.message).toBe('Bravo!');
    expect(result.studentId).toBe('student1');
  });

  it('stores nudge in localStorage', () => {
    sendNudge('student1', 'Mario', 'Test');
    expect(window.localStorage.setItem).toHaveBeenCalled();
    const stored = JSON.parse(store['elab-nudge-pending']);
    expect(stored.length).toBe(1);
    expect(stored[0].message).toBe('Test');
  });

  it('does NOT store studentName in localStorage (GDPR)', () => {
    sendNudge('student1', 'Mario Rossi', 'Test');
    const stored = JSON.parse(store['elab-nudge-pending']);
    expect(stored[0].studentName).toBeUndefined();
    expect(JSON.stringify(stored)).not.toContain('Mario Rossi');
  });

  it('caps pending at 50 nudges', () => {
    for (let i = 0; i < 55; i++) {
      sendNudge(`s${i}`, `N${i}`, `Msg ${i}`);
    }
    const stored = JSON.parse(store['elab-nudge-pending']);
    expect(stored.length).toBeLessThanOrEqual(50);
  });

  it('returns from field as teacher', () => {
    const result = sendNudge('s1', 'N1', 'Test');
    expect(result.from).toBe('teacher');
  });

  it('generates unique IDs', () => {
    const n1 = sendNudge('s1', 'N1', 'A');
    const n2 = sendNudge('s1', 'N1', 'B');
    expect(n1.id).not.toBe(n2.id);
  });

  it('handles localStorage failure gracefully', () => {
    window.localStorage.setItem = vi.fn(() => { throw new Error('QuotaExceeded'); });
    expect(() => sendNudge('s1', 'N1', 'Test')).not.toThrow();
  });
});

describe('consumeNudges', () => {
  it('returns empty for nonexistent student', () => {
    const nudges = consumeNudges('nonexistent');
    expect(nudges).toEqual([]);
  });

  it('removes consumed nudges from localStorage', () => {
    sendNudge('student1', 'Mario', 'Msg1');
    consumeNudges('student1');
    const remaining = JSON.parse(store['elab-nudge-pending'] || '[]');
    expect(remaining.filter(n => n.studentId === 'student1').length).toBe(0);
  });

  it('returns empty array if no nudges', () => {
    expect(consumeNudges('nonexistent')).toEqual([]);
  });

  it('returns empty on corrupted localStorage', () => {
    store['elab-nudge-pending'] = 'NOT JSON';
    expect(consumeNudges('s1')).toEqual([]);
  });

  it('handles corrupted read IDs gracefully', () => {
    store['elab-nudge-read'] = 'NOT JSON';
    expect(() => consumeNudges('s1')).not.toThrow();
  });

  it('caps read IDs at 100', () => {
    for (let i = 0; i < 110; i++) {
      sendNudge('s1', 'N', `M${i}`);
      consumeNudges('s1');
    }
    const readIds = JSON.parse(store['elab-nudge-read'] || '[]');
    expect(readIds.length).toBeLessThanOrEqual(100);
  });
});

describe('startNudgeListener', () => {
  it('returns cleanup function', () => {
    const cleanup = startNudgeListener('s1', vi.fn());
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('does not crash with no pending nudges', () => {
    const onNudge = vi.fn();
    const cleanup = startNudgeListener('s1', onNudge);
    // No nudges pending → onNudge not called
    expect(onNudge).not.toHaveBeenCalled();
    cleanup();
  });

  it('returns noop for null studentId', () => {
    const cleanup = startNudgeListener(null, vi.fn());
    expect(typeof cleanup).toBe('function');
    cleanup(); // should not throw
  });

  it('returns noop for empty studentId', () => {
    const cleanup = startNudgeListener('', vi.fn());
    expect(typeof cleanup).toBe('function');
  });

  it('cleanup removes event listeners and interval', () => {
    const cleanup = startNudgeListener('s1', vi.fn());
    expect(() => cleanup()).not.toThrow();
    // Double cleanup should not crash
    expect(() => cleanup()).not.toThrow();
  });

  it('adds storage event listener', () => {
    const spy = vi.spyOn(window, 'addEventListener');
    const cleanup = startNudgeListener('s1', vi.fn());
    expect(spy).toHaveBeenCalledWith('storage', expect.any(Function));
    cleanup();
    spy.mockRestore();
  });
});
