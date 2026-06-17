/**
 * useSessionTrackerHelpers.test.js — Test per session tracker helper functions
 * 8 test: getSavedSessions, getLastSession, loadSessions, saveSessions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/data/lesson-paths', () => ({
  getLessonPath: vi.fn(() => ({ title: 'Test', concepts_covered: [] })),
}));
vi.mock('../../src/services/supabaseSync', () => ({
  saveSession: vi.fn(() => Promise.resolve({ success: true })),
}));
vi.mock('../../src/services/gamificationService', () => ({
  default: { onExperimentCompleted: vi.fn(() => ({ total: 10, newBadges: [], streak: { current: 1 } })) },
}));

const store = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => store[k] || null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
  },
  writable: true,
});

import { getSavedSessions, getLastSession, restoreDrawingsFromSession } from '../../src/hooks/useSessionTracker';

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('useSessionTracker — getSavedSessions', () => {
  it('returns empty array when no sessions', () => {
    expect(getSavedSessions()).toEqual([]);
  });

  it('returns sessions from localStorage', () => {
    store['elab_unlim_sessions'] = JSON.stringify([
      { experimentId: 'v1-cap1-esp1', messages: [] },
    ]);
    const sessions = getSavedSessions();
    expect(sessions.length).toBe(1);
    expect(sessions[0].experimentId).toBe('v1-cap1-esp1');
  });

  it('handles corrupted localStorage', () => {
    store['elab_unlim_sessions'] = 'NOT JSON';
    expect(getSavedSessions()).toEqual([]);
  });
});

describe('useSessionTracker — getLastSession', () => {
  it('returns null when no sessions', () => {
    expect(getLastSession()).toBeNull();
  });

  it('returns last session', () => {
    store['elab_unlim_sessions'] = JSON.stringify([
      { experimentId: 'v1-cap1-esp1' },
      { experimentId: 'v1-cap2-esp1' },
    ]);
    const last = getLastSession();
    expect(last.experimentId).toBe('v1-cap2-esp1');
  });

  it('returns null on corrupted data', () => {
    store['elab_unlim_sessions'] = 'BROKEN';
    expect(getLastSession()).toBeNull();
  });

  it('returns null on empty array', () => {
    store['elab_unlim_sessions'] = '[]';
    expect(getLastSession()).toBeNull();
  });

  it('returns session object with experimentId', () => {
    store['elab_unlim_sessions'] = JSON.stringify([{ experimentId: 'test' }]);
    const last = getLastSession();
    expect(last).toHaveProperty('experimentId');
  });
});

// 2026-05-06 Bug #5: drawings snapshot + restore round-trip.
describe('useSessionTracker — restoreDrawingsFromSession', () => {
  it('returns false when session has no drawings', () => {
    expect(restoreDrawingsFromSession({ experimentId: 'v1-cap1-esp1' })).toBe(false);
  });

  it('returns false when session has no experimentId', () => {
    expect(restoreDrawingsFromSession({ drawings: { whiteboard: 'x' } })).toBe(false);
  });

  it('writes whiteboard blob to elab_wb_<expId>', () => {
    const session = {
      experimentId: 'v1-cap1-esp1',
      drawings: { whiteboard: '{"version":3,"raster":null,"elements":[],"timestamp":1}', svgPaths: null },
    };
    const ok = restoreDrawingsFromSession(session);
    expect(ok).toBe(true);
    expect(store['elab_wb_v1-cap1-esp1']).toBe(session.drawings.whiteboard);
    expect(store['elab-drawing-v1-cap1-esp1']).toBeUndefined();
  });

  it('writes svgPaths blob to elab-drawing-<expId>', () => {
    const session = {
      experimentId: 'v1-cap1-esp1',
      drawings: { whiteboard: null, svgPaths: '[{"points":"1,1 2,2","color":"#000","width":2}]' },
    };
    const ok = restoreDrawingsFromSession(session);
    expect(ok).toBe(true);
    expect(store['elab-drawing-v1-cap1-esp1']).toBe(session.drawings.svgPaths);
    expect(store['elab_wb_v1-cap1-esp1']).toBeUndefined();
  });

  it('writes both blobs when present', () => {
    const session = {
      experimentId: 'v1-cap1-esp1',
      drawings: { whiteboard: 'WB', svgPaths: 'SVG' },
    };
    expect(restoreDrawingsFromSession(session)).toBe(true);
    expect(store['elab_wb_v1-cap1-esp1']).toBe('WB');
    expect(store['elab-drawing-v1-cap1-esp1']).toBe('SVG');
  });

  it('uses sandbox/paths fallback when experimentId is "lobby"', () => {
    const session = {
      experimentId: 'lobby',
      drawings: { whiteboard: 'WB', svgPaths: 'SVG' },
    };
    expect(restoreDrawingsFromSession(session)).toBe(true);
    expect(store['elab_wb_sandbox']).toBe('WB');
    expect(store['elab-drawing-paths']).toBe('SVG');
  });

  // Security: sanitize experimentId — refuta key arbitrarie quando la session
  // arriva da Supabase con expId controllato esternamente.
  it('rejects experimentId with characters outside [a-zA-Z0-9_-]', () => {
    const malicious = ['v1; rm -rf /', '../../../etc/passwd', 'foo bar', 'with"quotes', 'with;semicolon', 'with/slash'];
    for (const expId of malicious) {
      const session = { experimentId: expId, drawings: { whiteboard: 'WB' } };
      expect(restoreDrawingsFromSession(session)).toBe(false);
    }
    // Verifica che NESSUNA key sia stata creata
    expect(Object.keys(store).filter(k => k.startsWith('elab_wb_') || k.startsWith('elab-drawing-')).length).toBe(0);
  });
});
