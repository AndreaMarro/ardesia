import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DRAWING_STORAGE_PREFIX,
  getDrawingStorageKey,
  loadDrawingPaths,
  saveDrawingPaths,
  clearDrawingPaths,
} from '../../src/utils/drawingStorage';

// Note: the project's tests/setup.js installs vi.fn() mocks on localStorage
// (getItem/setItem/removeItem/clear). We therefore verify the helpers by the
// arguments they pass to localStorage, not by round-tripping real state.

describe('drawingStorage — per-experiment persistence', () => {
  beforeEach(() => {
    // Reset to the global default (getItem → null, setItem → noop)
    localStorage.getItem.mockReturnValue(null);
  });

  // ── Key generation (pure) ─────────────────────────────────
  describe('getDrawingStorageKey', () => {
    it('uses legacy "paths" suffix when no experimentId is provided', () => {
      expect(getDrawingStorageKey()).toBe(DRAWING_STORAGE_PREFIX + 'paths');
      expect(getDrawingStorageKey(undefined)).toBe(DRAWING_STORAGE_PREFIX + 'paths');
      expect(getDrawingStorageKey(null)).toBe(DRAWING_STORAGE_PREFIX + 'paths');
      expect(getDrawingStorageKey('')).toBe(DRAWING_STORAGE_PREFIX + 'paths');
    });

    it('scopes the storage key by experiment id', () => {
      expect(getDrawingStorageKey('v1-cap6-esp1')).toBe(DRAWING_STORAGE_PREFIX + 'v1-cap6-esp1');
      expect(getDrawingStorageKey('v3-cap7-esp6')).toBe(DRAWING_STORAGE_PREFIX + 'v3-cap7-esp6');
    });

    it('non-string experimentId falls back to legacy bucket (defensive)', () => {
      expect(getDrawingStorageKey(42)).toBe(DRAWING_STORAGE_PREFIX + 'paths');
      expect(getDrawingStorageKey({ id: 'x' })).toBe(DRAWING_STORAGE_PREFIX + 'paths');
    });
  });

  // ── saveDrawingPaths ─────────────────────────────────────
  describe('saveDrawingPaths', () => {
    it('writes JSON to the scoped storage key', () => {
      const paths = [{ points: '1,1 2,2', color: '#EF4444', width: 3, isEraser: false }];
      saveDrawingPaths(paths, 'v1-cap6-esp1');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        DRAWING_STORAGE_PREFIX + 'v1-cap6-esp1',
        JSON.stringify(paths)
      );
    });

    it('writes to the legacy bucket when no experimentId is given (backward compat)', () => {
      const paths = [{ points: '0,0 1,1', color: '#1F2937', width: 1.5, isEraser: false }];
      saveDrawingPaths(paths);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        DRAWING_STORAGE_PREFIX + 'paths',
        JSON.stringify(paths)
      );
    });

    it('uses different keys for different experiments — the Principio Zero fix', () => {
      const pathsA = [{ points: '10,10 20,20', color: '#EF4444', width: 3, isEraser: false }];
      const pathsB = [{ points: '5,5 6,6', color: '#2563EB', width: 1.5, isEraser: false }];
      saveDrawingPaths(pathsA, 'v1-cap6-esp1');
      saveDrawingPaths(pathsB, 'v2-cap6-esp2');

      const calls = localStorage.setItem.mock.calls;
      expect(calls).toContainEqual([DRAWING_STORAGE_PREFIX + 'v1-cap6-esp1', JSON.stringify(pathsA)]);
      expect(calls).toContainEqual([DRAWING_STORAGE_PREFIX + 'v2-cap6-esp2', JSON.stringify(pathsB)]);
    });

    it('normalises non-array input to an empty array before writing', () => {
      saveDrawingPaths(null, 'v1-cap6-esp1');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        DRAWING_STORAGE_PREFIX + 'v1-cap6-esp1',
        '[]'
      );
    });

    it('silently ignores quota exceptions (storage full)', () => {
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceeded');
      });
      expect(() => saveDrawingPaths([{ a: 1 }], 'v1-cap6-esp1')).not.toThrow();
    });
  });

  // ── loadDrawingPaths ─────────────────────────────────────
  describe('loadDrawingPaths', () => {
    it('returns [] when storage has no entry', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(loadDrawingPaths('v1-cap6-esp1')).toEqual([]);
      expect(loadDrawingPaths()).toEqual([]);
    });

    it('reads JSON from the scoped key', () => {
      const paths = [{ points: '1,1', color: 'red', width: 2, isEraser: false }];
      localStorage.getItem.mockImplementation((k) =>
        k === DRAWING_STORAGE_PREFIX + 'v1-cap6-esp1' ? JSON.stringify(paths) : null
      );
      expect(loadDrawingPaths('v1-cap6-esp1')).toEqual(paths);
      // A different experiment must not inherit this data
      expect(loadDrawingPaths('v2-cap6-esp2')).toEqual([]);
    });

    it('returns [] when stored payload is not an array (defensive)', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ not: 'an array' }));
      expect(loadDrawingPaths('v1-cap6-esp1')).toEqual([]);
    });

    it('returns [] when stored payload is malformed JSON', () => {
      localStorage.getItem.mockReturnValue('{not valid');
      expect(loadDrawingPaths('v1-cap6-esp1')).toEqual([]);
    });
  });

  // ── clearDrawingPaths ────────────────────────────────────
  describe('clearDrawingPaths', () => {
    it('removes only the scoped entry', () => {
      clearDrawingPaths('v1-cap6-esp1');
      expect(localStorage.removeItem).toHaveBeenCalledWith(DRAWING_STORAGE_PREFIX + 'v1-cap6-esp1');
      expect(localStorage.removeItem).not.toHaveBeenCalledWith(DRAWING_STORAGE_PREFIX + 'v2-cap6-esp2');
    });

    it('uses the legacy key when called without an id', () => {
      clearDrawingPaths();
      expect(localStorage.removeItem).toHaveBeenCalledWith(DRAWING_STORAGE_PREFIX + 'paths');
    });
  });

  // iter 45 fix Andrea video2 06/05/2026 C "Pen persistence per-experiment-as-lavagna":
  // assicura che cambiare esperimento NON faccia leak paths cross-experiment.
  // Andrea verbatim: "Ogni esperimento è una lavagna. Se io scrivo su un esperimento,
  // sto scrivendo su una lavagna, cambio esperimento, scriverò su un'altra lavagna."
  describe('Cross-experiment swap — ZERO bleed regression (iter 45 C)', () => {
    it('exp A save → exp B save → return A: A paths intatti, B isolato', () => {
      // Reset mocks for live storage simulation
      const realStorage = {};
      vi.spyOn(localStorage, 'setItem').mockImplementation((k, v) => { realStorage[k] = v; });
      vi.spyOn(localStorage, 'getItem').mockImplementation((k) => realStorage[k] || null);

      const pathsA = [{ d: 'M0,0 L10,10', color: 'red' }];
      const pathsB = [{ d: 'M5,5 L20,20', color: 'blue' }];

      saveDrawingPaths(pathsA, 'v1-cap6-esp1');
      saveDrawingPaths(pathsB, 'v2-cap8-esp3');

      const reloadedA = loadDrawingPaths('v1-cap6-esp1');
      const reloadedB = loadDrawingPaths('v2-cap8-esp3');

      expect(reloadedA).toEqual(pathsA);
      expect(reloadedB).toEqual(pathsB);
      // Cross-check: A != B
      expect(reloadedA).not.toEqual(reloadedB);
    });

    it('experimentId switch + back preserva separation (no overwrite)', () => {
      const realStorage = {};
      vi.spyOn(localStorage, 'setItem').mockImplementation((k, v) => { realStorage[k] = v; });
      vi.spyOn(localStorage, 'getItem').mockImplementation((k) => realStorage[k] || null);

      saveDrawingPaths([{ id: 'a1' }], 'expA');
      saveDrawingPaths([{ id: 'b1' }], 'expB');
      saveDrawingPaths([{ id: 'c1' }], 'expC');
      // Re-save expA con state aggiornato
      saveDrawingPaths([{ id: 'a1' }, { id: 'a2' }], 'expA');

      expect(loadDrawingPaths('expA')).toEqual([{ id: 'a1' }, { id: 'a2' }]);
      expect(loadDrawingPaths('expB')).toEqual([{ id: 'b1' }]);
      expect(loadDrawingPaths('expC')).toEqual([{ id: 'c1' }]);
    });

    it('legacy bucket "paths" non viene contaminato da experiment-scoped saves', () => {
      const realStorage = {};
      vi.spyOn(localStorage, 'setItem').mockImplementation((k, v) => { realStorage[k] = v; });
      vi.spyOn(localStorage, 'getItem').mockImplementation((k) => realStorage[k] || null);

      saveDrawingPaths([{ legacy: true }], null);  // sandbox legacy
      saveDrawingPaths([{ exp: 'A' }], 'expA');

      expect(loadDrawingPaths(null)).toEqual([{ legacy: true }]);
      expect(loadDrawingPaths('expA')).toEqual([{ exp: 'A' }]);
    });
  });
});
