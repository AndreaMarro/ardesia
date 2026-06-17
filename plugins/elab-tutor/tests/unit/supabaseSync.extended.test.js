/**
 * supabaseSync — Tests for offline sync queue and session saving
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

import { saveSession } from '../../src/services/supabaseSync';
import { isSupabaseConfigured } from '../../src/services/supabaseClient';

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
  isSupabaseConfigured.mockReturnValue(false);
});

describe('supabaseSync', () => {
  describe('saveSession — offline mode', () => {
    it('returns error when session is null', async () => {
      const result = await saveSession(null);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No session');
    });

    it('queues session when Supabase not configured', async () => {
      const result = await saveSession({
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-11T10:00:00Z',
        messages: [{}, {}],
        errors: [],
        actions: [],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('coda offline');
    });

    it('stores queued item in localStorage', async () => {
      await saveSession({
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-11T10:00:00Z',
        messages: [],
        errors: [],
        actions: [],
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const queue = JSON.parse(store['elab_sync_queue'] || '[]');
      expect(queue.length).toBe(1);
      expect(queue[0].table).toBe('student_sessions');
    });

    it('caps queue at 200 items', async () => {
      // Pre-fill with 205 items
      const existing = Array.from({ length: 205 }, (_, i) => ({
        table: 'student_sessions',
        data: {},
        operation: 'insert',
        retries: 0,
        createdAt: Date.now() - 1000 + i,
      }));
      store['elab_sync_queue'] = JSON.stringify(existing);

      await saveSession({
        experimentId: 'test',
        startTime: new Date().toISOString(),
        messages: [],
        errors: [],
        actions: [],
      });
      const queue = JSON.parse(store['elab_sync_queue']);
      expect(queue.length).toBeLessThanOrEqual(200);
    });

    it('session row has correct shape', async () => {
      await saveSession({
        experimentId: 'v2-cap7-esp1',
        startTime: '2026-04-11T10:00:00Z',
        endTime: '2026-04-11T10:30:00Z',
        messages: [{}, {}, {}],
        errors: [{ type: 'short_circuit' }],
        actions: ['click', 'drag'],
        summary: 'Esperimento completato',
      });
      const queue = JSON.parse(store['elab_sync_queue']);
      const row = queue[0].data;
      expect(row.experiment_id).toBe('v2-cap7-esp1');
      expect(row.messages_count).toBe(3);
      expect(row.errors_count).toBe(1);
      expect(row.actions_count).toBe(2);
      expect(row.completed).toBe(true);
      expect(row.summary).toBe('Esperimento completato');
    });

    it('handles missing endTime (incomplete session)', async () => {
      await saveSession({
        experimentId: 'v1-cap6-esp1',
        startTime: '2026-04-11T10:00:00Z',
        messages: [],
        errors: [],
        actions: [],
      });
      const queue = JSON.parse(store['elab_sync_queue']);
      const row = queue[0].data;
      expect(row.completed).toBe(false);
      expect(row.duration_seconds).toBe(0);
    });
  });
});
