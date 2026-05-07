/**
 * Sprint S iter 13 R4 — RotationHandle unit tests
 * Verifica snap math + UI rendering + onRotate callback + touch-target ≥44px.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RotationHandle, { snapToNearestQuadrant, cycleRotationCW, ROTATION_VALUES } from '../../src/components/simulator/overlays/RotationHandle';

// Wrapper SVG (RotationHandle returns <g>; needs <svg> parent for valid DOM)
function SvgWrapper({ children }) {
  return <svg width="800" height="600">{children}</svg>;
}

describe('RotationHandle — iter 13 R2 visible affordance', () => {
  describe('snapToNearestQuadrant — pure snap math', () => {
    it('snaps 0 → 0', () => {
      expect(snapToNearestQuadrant(0)).toBe(0);
    });

    it('snaps 44 (mid quadrant) → 0', () => {
      expect(snapToNearestQuadrant(44)).toBe(0);
    });

    it('snaps 45 → 90 (mid-quadrant rounds up)', () => {
      // Math.round(45/90) = Math.round(0.5) = 0 OR 1 depending on browser
      // Actually JS Math.round(0.5) = 1, so 45 → 90
      expect(snapToNearestQuadrant(45)).toBe(90);
    });

    it('snaps 46 → 90', () => {
      expect(snapToNearestQuadrant(46)).toBe(90);
    });

    it('snaps 90 → 90', () => {
      expect(snapToNearestQuadrant(90)).toBe(90);
    });

    it('snaps 134 → 90', () => {
      expect(snapToNearestQuadrant(134)).toBe(90);
    });

    it('snaps 180 → 180', () => {
      expect(snapToNearestQuadrant(180)).toBe(180);
    });

    it('snaps 270 → 270', () => {
      expect(snapToNearestQuadrant(270)).toBe(270);
    });

    it('snaps 360 → 0 (normalize)', () => {
      expect(snapToNearestQuadrant(360)).toBe(0);
    });

    it('snaps -90 → 270 (negative normalize)', () => {
      expect(snapToNearestQuadrant(-90)).toBe(270);
    });

    it('returns 0 for non-finite input', () => {
      expect(snapToNearestQuadrant(NaN)).toBe(0);
      expect(snapToNearestQuadrant(Infinity)).toBe(0);
    });
  });

  describe('cycleRotationCW — context-menu legacy path', () => {
    it('cycles 0 → 90 → 180 → 270 → 0', () => {
      let cur = 0;
      cur = cycleRotationCW(cur);
      expect(cur).toBe(90);
      cur = cycleRotationCW(cur);
      expect(cur).toBe(180);
      cur = cycleRotationCW(cur);
      expect(cur).toBe(270);
      cur = cycleRotationCW(cur);
      expect(cur).toBe(0);
    });
  });

  describe('ROTATION_VALUES export', () => {
    it('lists 4 quadrant values', () => {
      expect(ROTATION_VALUES).toEqual([0, 90, 180, 270]);
    });
  });

  describe('Render + interaction', () => {
    it('returns null when not visible', () => {
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" visible={false} onRotate={() => {}} />
        </SvgWrapper>
      );
      expect(container.querySelector('[data-testid="rotation-handle"]')).toBeNull();
    });

    it('returns null when no componentId', () => {
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId={null} onRotate={() => {}} />
        </SvgWrapper>
      );
      expect(container.querySelector('[data-testid="rotation-handle"]')).toBeNull();
    });

    it('returns null when no onRotate callback', () => {
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" onRotate={null} />
        </SvgWrapper>
      );
      expect(container.querySelector('[data-testid="rotation-handle"]')).toBeNull();
    });

    // iter 45 fix Andrea video2 06/05/2026 B11: cambiato da 4-button stack a
    // SINGLE rotate button (cycle +90°). Test riallineati al nuovo contratto.
    it('renders single cycle button when visible+componentId+onRotate (B11 iter 45)', () => {
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" currentRotation={0} onRotate={() => {}} />
        </SvgWrapper>
      );
      expect(container.querySelector('[data-testid="rotation-handle"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="rotation-handle-btn-cycle"]')).not.toBeNull();
    });

    it('exposes current rotation via data-current-rotation attribute (B11)', () => {
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" currentRotation={90} onRotate={() => {}} />
        </SvgWrapper>
      );
      const handle = container.querySelector('[data-testid="rotation-handle"]');
      expect(handle.getAttribute('data-current-rotation')).toBe('90');
      const btn = container.querySelector('[data-testid="rotation-handle-btn-cycle"]');
      expect(btn.getAttribute('data-current-rotation')).toBe('90');
    });

    it('cycle button calls onRotate with current+90 (B11)', () => {
      const onRotate = vi.fn();
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" currentRotation={0} onRotate={onRotate} />
        </SvgWrapper>
      );
      const btn = container.querySelector('[data-testid="rotation-handle-btn-cycle"]');
      fireEvent.pointerDown(btn);
      expect(onRotate).toHaveBeenCalledWith(90);
    });

    it('cycle button at 270° wraps to 0° (B11)', () => {
      const onRotate = vi.fn();
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" currentRotation={270} onRotate={onRotate} />
        </SvgWrapper>
      );
      const btn = container.querySelector('[data-testid="rotation-handle-btn-cycle"]');
      fireEvent.pointerDown(btn);
      expect(onRotate).toHaveBeenCalledWith(0);
    });

    it('hit area circle ≥ 22 radius (44px touch target CLAUDE.md regola 9, B11)', () => {
      const { container } = render(
        <SvgWrapper>
          <RotationHandle componentId="led1" onRotate={() => {}} />
        </SvgWrapper>
      );
      const btn = container.querySelector('[data-testid="rotation-handle-btn-cycle"]');
      const hitCircle = btn.querySelector('circle');
      expect(Number(hitCircle.getAttribute('r'))).toBeGreaterThanOrEqual(22);
    });
  });
});
