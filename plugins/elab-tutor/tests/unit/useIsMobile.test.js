/**
 * useIsMobile.test.js — Test per mobile detection hook
 * 7 test: default breakpoint, custom, resize, SSR safety
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useIsMobile from '../../src/hooks/useIsMobile';

beforeEach(() => { vi.clearAllMocks(); });

describe('useIsMobile', () => {
  it('returns false for wide viewport (default 768)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('respects custom breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, writable: true, configurable: true });
    const { result } = renderHook(() => useIsMobile(1024));
    expect(result.current).toBe(true); // 900 <= 1024
  });

  it('updates on resize event', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });

  it('cleans up resize listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
    spy.mockRestore();
  });

  it('returns boolean type', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe('boolean');
  });

  it('exact breakpoint returns true (<=)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true, configurable: true });
    const { result } = renderHook(() => useIsMobile(768));
    expect(result.current).toBe(true);
  });
});
