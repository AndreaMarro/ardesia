/**
 * useOnlineStatus.test.js — Test per online/offline detection hook
 * 8 test: initial state, events, cleanup
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useOnlineStatus from '../../src/hooks/useOnlineStatus';

beforeEach(() => {
  vi.clearAllMocks();
  // Reset navigator.onLine to true
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
});

describe('useOnlineStatus', () => {
  it('returns true when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('returns false when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('updates to false on offline event', () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);
  });

  it('updates to true on online event', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe(true);
  });

  it('handles rapid online/offline toggling', () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event('offline'));
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
  });

  it('cleans up event listeners on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    expect(spy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(spy).toHaveBeenCalledWith('offline', expect.any(Function));
    spy.mockRestore();
  });

  it('adds event listeners on mount', () => {
    const spy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useOnlineStatus());
    expect(spy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(spy).toHaveBeenCalledWith('offline', expect.any(Function));
    spy.mockRestore();
  });

  it('returns boolean type', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(typeof result.current).toBe('boolean');
  });
});
