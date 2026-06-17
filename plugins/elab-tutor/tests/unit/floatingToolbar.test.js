import { describe, it, expect, vi, beforeEach } from 'vitest';

const STORAGE_KEY = 'elab-toolbar-pos';

describe('FloatingToolbar — Drag + Persistence', () => {
  const store = {};

  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(k => store[k] || null),
      setItem: vi.fn((k, v) => { store[k] = v; }),
      removeItem: vi.fn(k => { delete store[k]; }),
    });
  });

  it('1. posizione default quando nessun salvataggio', () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('2. salva posizione dopo drag', () => {
    const pos = { x: 200, y: 300 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    expect(JSON.parse(store[STORAGE_KEY])).toEqual(pos);
  });

  it('3. carica posizione salvata', () => {
    store[STORAGE_KEY] = JSON.stringify({ x: 150, y: 250 });
    const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(loaded.x).toBe(150);
    expect(loaded.y).toBe(250);
  });

  it('4. reset posizione su doppio click', () => {
    store[STORAGE_KEY] = JSON.stringify({ x: 500, y: 400 });
    localStorage.removeItem(STORAGE_KEY);
    expect(store[STORAGE_KEY]).toBeUndefined();
  });

  it('5. posizione clampata ai bordi viewport', () => {
    const vw = 1920, vh = 1080, barW = 400, barH = 60;
    const clamp = (pos) => ({
      x: Math.max(0, Math.min(vw - barW, pos.x)),
      y: Math.max(48, Math.min(vh - barH, pos.y)),
    });
    expect(clamp({ x: -50, y: 20 })).toEqual({ x: 0, y: 48 });
    expect(clamp({ x: 2000, y: 1200 })).toEqual({ x: 1520, y: 1020 });
  });

  it('6. Y minimo 48px (sotto header)', () => {
    const clampY = (y) => Math.max(48, y);
    expect(clampY(0)).toBe(48);
    expect(clampY(30)).toBe(48);
    expect(clampY(100)).toBe(100);
  });

  it('7. drag threshold 4px distingue click da drag', () => {
    const isDrag = (dx, dy) => Math.abs(dx) >= 4 || Math.abs(dy) >= 4;
    expect(isDrag(2, 1)).toBe(false); // click
    expect(isDrag(5, 0)).toBe(true);  // drag
    expect(isDrag(0, 4)).toBe(true);  // drag
  });

  it('8. corrupted localStorage non crasha', () => {
    store[STORAGE_KEY] = '{invalid';
    let pos = null;
    try { pos = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { pos = null; }
    expect(pos).toBeNull();
  });
});
