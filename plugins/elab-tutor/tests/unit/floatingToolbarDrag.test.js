import { describe, it, expect } from 'vitest';
import {
  computeNextPos,
  getPositionStyle,
} from '../../src/components/lavagna/floatingToolbarDrag';

describe('FloatingToolbar drag — pure math', () => {
  const base = {
    width: 400,
    height: 60,
    viewportW: 1280,
    viewportH: 800,
    offsetX: 20,
    offsetY: 20,
  };

  describe('computeNextPos', () => {
    it('maps pointer → position using the captured drag-start offset', () => {
      const { x, y } = computeNextPos({ ...base, clientX: 500, clientY: 400 });
      expect(x).toBe(480); // 500 - 20
      expect(y).toBe(380); // 400 - 20
    });

    it('does NOT add any offset-parent correction — pos is viewport-relative', () => {
      // This is the root of the old bug: when the toolbar was in a <main>
      // with a 280px left margin, the old code put the bar 280px too far
      // right. The new code uses position:fixed so clientX maps directly.
      const { x } = computeNextPos({ ...base, clientX: 300, clientY: 300 });
      expect(x).toBe(280);
    });

    it('clamps to the left edge (never negative X)', () => {
      const { x } = computeNextPos({ ...base, clientX: 5, clientY: 400 });
      expect(x).toBe(0);
    });

    it('clamps to the right edge so the toolbar stays inside the viewport', () => {
      const { x } = computeNextPos({ ...base, clientX: 10000, clientY: 400 });
      expect(x).toBe(1280 - 400); // viewportW - width
    });

    it('clamps to a minTop of 48 to not cover the AppHeader', () => {
      const { y } = computeNextPos({ ...base, clientX: 500, clientY: 10 });
      expect(y).toBe(48);
    });

    it('allows a custom minTop', () => {
      const { y } = computeNextPos({ ...base, clientX: 500, clientY: 10, minTop: 100 });
      expect(y).toBe(100);
    });

    it('clamps to the bottom edge so the toolbar stays inside the viewport', () => {
      const { y } = computeNextPos({ ...base, clientX: 500, clientY: 10000 });
      expect(y).toBe(800 - 60); // viewportH - height
    });

    it('handles a tiny viewport (mobile portrait) sanely', () => {
      const small = { width: 300, height: 50, viewportW: 360, viewportH: 640, offsetX: 10, offsetY: 10 };
      const { x, y } = computeNextPos({ ...small, clientX: 200, clientY: 400 });
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(60); // viewportW - width
      expect(y).toBeLessThanOrEqual(590); // viewportH - height
    });

    it('never allows the toolbar to leave the right edge even if width > viewport', () => {
      // Defensive: if the toolbar is wider than the viewport (unlikely
      // but possible on micro-windows) we keep x >= 0.
      const narrow = { width: 500, height: 50, viewportW: 400, viewportH: 800, offsetX: 10, offsetY: 10 };
      const { x } = computeNextPos({ ...narrow, clientX: 200, clientY: 200 });
      expect(x).toBe(0); // Math.max(0, Math.min(-100, 190)) = 0
    });

    it('returns integers when inputs are integers (no floating drift)', () => {
      const { x, y } = computeNextPos({ ...base, clientX: 500, clientY: 400 });
      expect(Number.isInteger(x)).toBe(true);
      expect(Number.isInteger(y)).toBe(true);
    });
  });

  describe('getPositionStyle', () => {
    it('returns empty style when pos is null so the CSS default (centered) wins', () => {
      expect(getPositionStyle(null)).toEqual({});
      expect(getPositionStyle(undefined)).toEqual({});
    });

    it('returns empty style for malformed pos (defensive)', () => {
      expect(getPositionStyle({})).toEqual({});
      expect(getPositionStyle({ x: 'nope' })).toEqual({});
      expect(getPositionStyle({ y: 10 })).toEqual({});
    });

    it('uses position:fixed so left/top become viewport-relative', () => {
      const style = getPositionStyle({ x: 100, y: 200 });
      expect(style.position).toBe('fixed');
      expect(style.left).toBe(100);
      expect(style.top).toBe(200);
    });

    it('clears the CSS default transform and bottom so the bar does NOT stay centered', () => {
      const style = getPositionStyle({ x: 100, y: 200 });
      expect(style.transform).toBe('none');
      expect(style.bottom).toBe('auto');
      expect(style.right).toBe('auto');
    });
  });
});
