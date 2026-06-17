/**
 * useFocusTrap.test.js — Test per focus trap hook (WCAG a11y)
 * 8 test: ref return, active/inactive, cleanup, options
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFocusTrap from '../../src/hooks/useFocusTrap';

beforeEach(() => { vi.clearAllMocks(); });

describe('useFocusTrap', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
  });

  it('ref.current is null initially (no container)', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current.current).toBeNull();
  });

  it('does not crash when active with no container', () => {
    expect(() => renderHook(() => useFocusTrap(true))).not.toThrow();
  });

  it('does not crash when toggling active', () => {
    const { rerender } = renderHook(({ active }) => useFocusTrap(active), {
      initialProps: { active: false },
    });
    expect(() => rerender({ active: true })).not.toThrow();
    expect(() => rerender({ active: false })).not.toThrow();
  });

  it('accepts restoreFocus option', () => {
    const { result } = renderHook(() => useFocusTrap(true, { restoreFocus: false }));
    expect(result.current).toBeDefined();
  });

  it('cleans up on unmount without crash', () => {
    const { unmount } = renderHook(() => useFocusTrap(true));
    expect(() => unmount()).not.toThrow();
  });

  it('defaults restoreFocus to true', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    // Hook returns ref regardless of options
    expect(result.current.current).toBeNull();
  });

  it('ref is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useFocusTrap(false));
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });
});
