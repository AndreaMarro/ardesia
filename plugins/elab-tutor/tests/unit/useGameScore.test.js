/**
 * useGameScore.test.js — Test per game star score persistence hook
 * 8 test: save, get, best score, localStorage, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useGameScore from '../../src/hooks/useGameScore';

const store = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => store[k] || null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
  },
  writable: true,
});

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('useGameScore', () => {
  it('returns scores object, saveScore, getScore, getAllScores', () => {
    const { result } = renderHook(() => useGameScore('detective'));
    expect(result.current.scores).toBeDefined();
    expect(typeof result.current.saveScore).toBe('function');
    expect(typeof result.current.getScore).toBe('function');
    expect(typeof result.current.getAllScores).toBe('function');
  });

  it('starts with empty scores', () => {
    const { result } = renderHook(() => useGameScore('detective'));
    expect(result.current.scores).toEqual({});
  });

  it('saves and retrieves score', () => {
    const { result } = renderHook(() => useGameScore('detective'));
    act(() => { result.current.saveScore('level1', 3); });
    expect(result.current.getScore('level1')).toBe(3);
  });

  it('keeps best score (does not downgrade)', () => {
    const { result } = renderHook(() => useGameScore('detective'));
    act(() => { result.current.saveScore('level1', 5); });
    act(() => { result.current.saveScore('level1', 2); });
    expect(result.current.getScore('level1')).toBe(5);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useGameScore('detective'));
    act(() => { result.current.saveScore('level1', 4); });
    expect(store['elab_game_stars_detective']).toBeDefined();
    const stored = JSON.parse(store['elab_game_stars_detective']);
    expect(stored.level1).toBe(4);
  });

  it('loads from localStorage on mount', () => {
    store['elab_game_stars_poe'] = JSON.stringify({ q1: 5, q2: 3 });
    const { result } = renderHook(() => useGameScore('poe'));
    expect(result.current.getScore('q1')).toBe(5);
    expect(result.current.getScore('q2')).toBe(3);
  });

  it('returns 0 for unscored item', () => {
    const { result } = renderHook(() => useGameScore('detective'));
    expect(result.current.getScore('nonexistent')).toBe(0);
  });

  it('handles corrupted localStorage', () => {
    store['elab_game_stars_broken'] = 'NOT JSON';
    const { result } = renderHook(() => useGameScore('broken'));
    expect(result.current.scores).toEqual({});
  });
});
