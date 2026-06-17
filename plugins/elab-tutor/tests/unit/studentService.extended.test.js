/**
 * studentService extended — Tests for student data, reflections, experiments, sync
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../src/utils/crypto', () => ({
  default: {
    getOrCreateMasterKey: vi.fn(() => Promise.resolve('mock-key')),
    encrypt: vi.fn((d) => Promise.resolve(JSON.stringify(d))),
    decrypt: vi.fn((d) => Promise.resolve(JSON.parse(d))),
  },
}));

vi.mock('../../src/services/supabaseSync', () => ({
  syncSession: vi.fn(),
  syncMood: vi.fn(),
  syncGameResult: vi.fn(),
}));

vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

import studentService from '../../src/services/studentService';

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
Object.defineProperty(globalThis, 'sessionStorage', { value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() }, writable: true });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('studentService extended', () => {
  describe('reflections', () => {
    it('saveReflection adds a reflection', () => {
      studentService.saveReflection({ toolName: 'detective', text: 'Ho capito il LED', mood: 'happy' });
      const reflections = studentService.getReflections();
      expect(reflections.length).toBe(1);
      expect(reflections[0].toolName).toBe('detective');
      expect(reflections[0].text).toBe('Ho capito il LED');
    });

    it('getReflections filters by toolName', () => {
      studentService.saveReflection({ toolName: 'detective', text: 'r1' });
      studentService.saveReflection({ toolName: 'poe', text: 'r2' });
      studentService.saveReflection({ toolName: 'detective', text: 'r3' });
      const detective = studentService.getReflections('detective');
      expect(detective.length).toBe(2);
      const poe = studentService.getReflections('poe');
      expect(poe.length).toBe(1);
    });

    it('getReflectionCount returns total count', () => {
      studentService.saveReflection({ toolName: 'a', text: 'x' });
      studentService.saveReflection({ toolName: 'b', text: 'y' });
      expect(studentService.getReflectionCount()).toBe(2);
    });

    it('reflections have auto-generated id and timestamp', () => {
      studentService.saveReflection({ toolName: 't', text: 'test' });
      const r = studentService.getReflections()[0];
      expect(r.id).toBeTruthy();
      expect(r.timestamp).toBeTruthy();
    });
  });

  describe('experiments', () => {
    it('logExperiment adds experiment to student data', () => {
      studentService.logExperiment('student-1', {
        experimentId: 'v1-cap6-esp1',
        nome: 'Primo LED',
        volume: 1,
        capitolo: 6,
        durata: 30,
        completato: true,
      });
      const data = studentService.getData('student-1');
      expect(data.esperimenti.length).toBe(1);
      expect(data.esperimenti[0].experimentId).toBe('v1-cap6-esp1');
      expect(data.esperimenti[0].completato).toBe(true);
    });

    it('updates stats.esperimentiTotali after logExperiment', () => {
      studentService.logExperiment('student-stats-1', {
        experimentId: 'v1-cap6-esp1',
        nome: 'LED',
        volume: 1,
        capitolo: 6,
        completato: true,
      });
      const data = studentService.getData('student-stats-1');
      expect(data.stats.esperimentiTotali).toBe(1);
    });

    it('incomplete experiments do not count in stats', () => {
      studentService.logExperiment('student-incomplete', {
        experimentId: 'v1-cap6-esp1',
        nome: 'LED',
        volume: 1,
        capitolo: 6,
        completato: false,
      });
      const data = studentService.getData('student-incomplete');
      expect(data.stats.esperimentiTotali).toBe(0);
    });
  });

  describe('getData / default data', () => {
    it('returns default data for new user', () => {
      const data = studentService.getData('new-user');
      expect(data).toBeDefined();
      expect(data.esperimenti).toBeDefined();
      expect(Array.isArray(data.esperimenti)).toBe(true);
    });

    it('returns consistent data for same user', () => {
      studentService.logExperiment('user-a', {
        experimentId: 'v1-cap6-esp1',
        nome: 'LED',
        volume: 1,
        capitolo: 6,
        completato: true,
      });
      const d1 = studentService.getData('user-a');
      const d2 = studentService.getData('user-a');
      expect(d1.esperimenti.length).toBe(d2.esperimenti.length);
    });
  });

  describe('getSyncStatus', () => {
    it('returns a string status', () => {
      const status = studentService.getSyncStatus();
      expect(typeof status).toBe('string');
      expect(['server', 'local', 'offline', 'unknown']).toContain(status);
    });
  });

  describe('getAllStudentsData', () => {
    it('returns object (may be empty)', () => {
      const all = studentService.getAllStudentsData();
      expect(typeof all).toBe('object');
    });
  });

  describe('flushSync', () => {
    it('does not throw', () => {
      expect(() => studentService.flushSync()).not.toThrow();
    });
  });

  describe('isEncryptionActive', () => {
    it('returns boolean', () => {
      expect(typeof studentService.isEncryptionActive()).toBe('boolean');
    });
  });
});
