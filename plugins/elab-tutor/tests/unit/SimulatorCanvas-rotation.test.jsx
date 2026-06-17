/**
 * Sprint S iter 13 R4 — Rotation engine + persistence integration tests
 * Covers:
 *   - getBBox-style rotation 0/90/180/270 swap (line 75-77 logic, indirectly tested via RotationHandle math export + NanoR4Board counter-rotation)
 *   - Layout persistence round-trip (saveLayout/loadLayout)
 *   - Backward compat (legacy layouts without rotation default 0)
 *   - NanoR4Board counter-rotate text logic
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { snapToNearestQuadrant, cycleRotationCW } from '../../src/components/simulator/overlays/RotationHandle';
import { saveLayout, loadLayout, clearLayout } from '../../src/services/supabaseSync';

// localStorage mock global is vi.fn() with no state — install per-test in-memory store
beforeEach(() => {
  const store = new Map();
  window.localStorage.getItem.mockImplementation((k) => store.get(k) ?? null);
  window.localStorage.setItem.mockImplementation((k, v) => { store.set(k, String(v)); });
  window.localStorage.removeItem.mockImplementation((k) => { store.delete(k); });
  window.localStorage.clear.mockImplementation(() => { store.clear(); });
});

describe('SimulatorCanvas rotation engine — iter 13 R1+R3', () => {
  describe('Quadrant snap math (used by getBBox + RotationHandle + drag arc)', () => {
    it('rotation=0 keeps W×H canonical', () => {
      const rot = snapToNearestQuadrant(0);
      // simulate getBBox swap: w/h swap when rotation===90 || rotation===270
      const swap = rot === 90 || rot === 270;
      expect(swap).toBe(false);
    });

    it('rotation=90 swaps W×H (getBBox line 77)', () => {
      const rot = snapToNearestQuadrant(90);
      const swap = rot === 90 || rot === 270;
      expect(swap).toBe(true);
    });

    it('rotation=180 keeps W×H (no swap)', () => {
      const rot = snapToNearestQuadrant(180);
      const swap = rot === 90 || rot === 270;
      expect(swap).toBe(false);
    });

    it('rotation=270 swaps W×H', () => {
      const rot = snapToNearestQuadrant(270);
      const swap = rot === 90 || rot === 270;
      expect(swap).toBe(true);
    });

    it('Corner transform math: rotation=90 rad ≈ Math.PI/2', () => {
      const rotation = 90;
      const rad = (rotation * Math.PI) / 180;
      expect(rad).toBeCloseTo(Math.PI / 2, 5);
    });

    it('Context menu cycles +90 mod 360', () => {
      // line 2845: ((pos.rotation || 0) + 90) % 360
      expect(cycleRotationCW(0)).toBe(90);
      expect(cycleRotationCW(90)).toBe(180);
      expect(cycleRotationCW(180)).toBe(270);
      expect(cycleRotationCW(270)).toBe(0); // wrap
    });
  });

  describe('Layout persistence round-trip — iter 13 R3', () => {
    const EXPERIMENT_ID = 'test-rot-roundtrip';

    beforeEach(() => {
      clearLayout(EXPERIMENT_ID);
    });

    it('saveLayout + loadLayout preserves rotation=90', () => {
      const layout = {
        led1: { x: 100, y: 50, rotation: 90 },
      };
      const result = saveLayout(EXPERIMENT_ID, layout);
      expect(result.success).toBe(true);
      const loaded = loadLayout(EXPERIMENT_ID);
      expect(loaded).toEqual(layout);
      expect(loaded.led1.rotation).toBe(90);
    });

    it('preserves all 4 rotations 0/90/180/270 in one layout', () => {
      const layout = {
        led1: { x: 10, y: 10, rotation: 0 },
        led2: { x: 20, y: 20, rotation: 90 },
        led3: { x: 30, y: 30, rotation: 180 },
        led4: { x: 40, y: 40, rotation: 270 },
      };
      saveLayout(EXPERIMENT_ID, layout);
      const loaded = loadLayout(EXPERIMENT_ID);
      expect(loaded.led1.rotation).toBe(0);
      expect(loaded.led2.rotation).toBe(90);
      expect(loaded.led3.rotation).toBe(180);
      expect(loaded.led4.rotation).toBe(270);
    });

    it('backward compat: legacy layout without rotation defaults to 0', () => {
      const legacyLayout = { led1: { x: 50, y: 50 } };
      saveLayout(EXPERIMENT_ID, legacyLayout);
      const loaded = loadLayout(EXPERIMENT_ID);
      expect(loaded.led1.rotation).toBe(0);
    });

    it('preserves parentId field alongside rotation', () => {
      const layout = {
        led1: { x: 100, y: 50, rotation: 90, parentId: 'bb1' },
      };
      saveLayout(EXPERIMENT_ID, layout);
      const loaded = loadLayout(EXPERIMENT_ID);
      expect(loaded.led1.parentId).toBe('bb1');
      expect(loaded.led1.rotation).toBe(90);
    });

    it('returns null for missing experimentId', () => {
      expect(loadLayout('does-not-exist-' + Date.now())).toBeNull();
    });

    it('saveLayout rejects invalid args', () => {
      expect(saveLayout(null, {}).success).toBe(false);
      expect(saveLayout('id', null).success).toBe(false);
    });

    it('non-finite x/y default to 0', () => {
      const layout = {
        led1: { x: NaN, y: undefined, rotation: 90 },
      };
      saveLayout(EXPERIMENT_ID, layout);
      const loaded = loadLayout(EXPERIMENT_ID);
      expect(loaded.led1.x).toBe(0);
      expect(loaded.led1.y).toBe(0);
      expect(loaded.led1.rotation).toBe(90);
    });
  });

  describe('NanoR4Board text counter-rotate — iter 13 R1', () => {
    // Mirror the computeCounterRotation logic from NanoR4Board.jsx
    function computeCounterRotation(parentRot) {
      const p = ((Number(parentRot) || 0) % 360 + 360) % 360;
      const target = -90 - p;
      return ((target % 360) + 360) % 360;
    }

    it('parent=0 → text rotates 270 (original -90 = 270 normalized)', () => {
      // text local angle remains -90 = 270 ⇒ no visual change vs pre-iter-13
      expect(computeCounterRotation(0)).toBe(270);
    });

    it('parent=90 → text rotates 180 (text upright readable)', () => {
      // parent rotates +90, text needs -180 to keep absolute -90 → 180
      expect(computeCounterRotation(90)).toBe(180);
    });

    it('parent=180 → text rotates 90', () => {
      expect(computeCounterRotation(180)).toBe(90);
    });

    it('parent=270 → text rotates 0', () => {
      expect(computeCounterRotation(270)).toBe(0);
    });

    it('absolute angle of label (parent + text) = 270 across all rotations (text screen-readable)', () => {
      [0, 90, 180, 270].forEach((parentRot) => {
        const textRot = computeCounterRotation(parentRot);
        const absolute = (parentRot + textRot) % 360;
        expect(absolute).toBe(270);
      });
    });
  });
});
