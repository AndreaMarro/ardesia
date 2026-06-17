/**
 * studentTracker.test.js — Test per student activity tracker ELAB
 * 10 test: init, userId, logging, cleanup
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));
vi.mock('../../src/services/studentService', () => ({
  default: { startSession: vi.fn(() => 'sess1'), endSession: vi.fn(), logActivity: vi.fn(), flushSync: vi.fn() },
}));

const lStore = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => lStore[k] || null),
    setItem: vi.fn((k, v) => { lStore[k] = v; }),
    removeItem: vi.fn(k => { delete lStore[k]; }),
  },
  writable: true,
});

import studentTracker from '../../src/services/studentTracker';

beforeEach(() => {
  Object.keys(lStore).forEach(k => delete lStore[k]);
  vi.clearAllMocks();
});

describe('studentTracker', () => {
  it('exports an object', () => {
    expect(studentTracker).toBeDefined();
    expect(typeof studentTracker).toBe('object');
  });

  it('has init method', () => {
    expect(typeof studentTracker.init).toBe('function');
  });

  it('has destroy method', () => {
    expect(typeof studentTracker.destroy).toBe('function');
  });

  it('has logChatInteraction method', () => {
    expect(typeof studentTracker.logChatInteraction).toBe('function');
  });

  it('has logCompilation method', () => {
    expect(typeof studentTracker.logCompilation).toBe('function');
  });

  it('has logGameResult method', () => {
    expect(typeof studentTracker.logGameResult).toBe('function');
  });

  it('destroy does not crash when not initialized', () => {
    expect(() => studentTracker.destroy()).not.toThrow();
  });

  it('logChatInteraction does not crash when not initialized', () => {
    expect(() => studentTracker.logChatInteraction('test', 'good')).not.toThrow();
  });

  it('logCompilation does not crash when not initialized', () => {
    expect(() => studentTracker.logCompilation(true, null)).not.toThrow();
  });

  it('logGameResult does not crash when not initialized', () => {
    expect(() => studentTracker.logGameResult('detective', 80, 100, 120)).not.toThrow();
  });
});
