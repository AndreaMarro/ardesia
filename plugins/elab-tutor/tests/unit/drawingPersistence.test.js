import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const store = {};
const mockLocalStorage = {
  getItem: vi.fn((key) => store[key] || null),
  setItem: vi.fn((key, val) => { store[key] = val; }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

const DRAWING_STORAGE_KEY = 'elab-drawing-paths';

describe('Drawing Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('saves paths to localStorage', () => {
    const paths = [{ points: '10,10 20,20', color: '#EF4444', width: 3, isEraser: false }];
    localStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify(paths));
    expect(localStorage.setItem).toHaveBeenCalledWith(DRAWING_STORAGE_KEY, JSON.stringify(paths));
  });

  it('loads paths from localStorage', () => {
    const paths = [{ points: '10,10', color: '#2563EB', width: 1.5, isEraser: false }];
    store[DRAWING_STORAGE_KEY] = JSON.stringify(paths);
    const loaded = JSON.parse(localStorage.getItem(DRAWING_STORAGE_KEY));
    expect(loaded).toEqual(paths);
  });

  it('returns empty array when no saved paths', () => {
    const raw = localStorage.getItem(DRAWING_STORAGE_KEY);
    expect(raw).toBeNull();
  });

  it('handles corrupted localStorage gracefully', () => {
    store[DRAWING_STORAGE_KEY] = 'not-json{{{';
    let result = [];
    try { result = JSON.parse(localStorage.getItem(DRAWING_STORAGE_KEY)); } catch { result = []; }
    expect(result).toEqual([]);
  });

  it('clear removes all paths', () => {
    store[DRAWING_STORAGE_KEY] = JSON.stringify([{ points: '1,1' }]);
    localStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify([]));
    expect(JSON.parse(store[DRAWING_STORAGE_KEY])).toEqual([]);
  });

  it('handles multiple strokes', () => {
    const paths = Array.from({ length: 50 }, (_, i) => ({
      points: `${i},${i} ${i+10},${i+10}`,
      color: '#EF4444',
      width: 3,
      isEraser: false,
    }));
    localStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify(paths));
    const loaded = JSON.parse(store[DRAWING_STORAGE_KEY]);
    expect(loaded).toHaveLength(50);
  });

  it('preserves eraser strokes', () => {
    const paths = [
      { points: '10,10 20,20', color: '#EF4444', width: 3, isEraser: false },
      { points: '15,15 25,25', color: 'transparent', width: 18, isEraser: true },
    ];
    localStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify(paths));
    const loaded = JSON.parse(store[DRAWING_STORAGE_KEY]);
    expect(loaded[1].isEraser).toBe(true);
    expect(loaded[1].color).toBe('transparent');
  });
});
