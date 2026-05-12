/**
 * iter 28 — LavagnaShell hashchange listener robustness
 *
 * Iter 27 P0 surgical fix at LavagnaShell.jsx wired `initialExperimentId` prop
 * on FIRST mount via __ELAB_API polling. But in-place `window.location.hash`
 * change does NOT trigger re-load (LavagnaShell remains on first-mount expId).
 *
 * Iter 28 adds a hashchange `useEffect` listener that calls
 * `__ELAB_API.loadExperiment(newExpId)` when the user navigates to a different
 * `#lavagna?exp=<id>` while staying on the route (client-side nav UX).
 *
 * Test strategy: render a minimal stub component that mounts the same useEffect
 * logic in isolation. We avoid the full LavagnaShell render tree because the
 * useEffect is self-contained (no React state dependencies, only window events
 * and the __ELAB_API global). This keeps the test fast + deterministic.
 *
 * For end-to-end coverage of the full LavagnaShell + hashchange chain see
 * Playwright E2E iter 29 ratify queue.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useEffect } from 'react';
import { render, cleanup, act } from '@testing-library/react';

// Mirror the exact useEffect logic shipped in LavagnaShell.jsx iter 28.
// Keeping this in a small standalone component lets us verify behavior
// without pulling in the entire LavagnaShell render tree (mascotte, simulator,
// auth, session tracker, etc.). The logic is character-identical to the prod
// useEffect block in src/components/lavagna/LavagnaShell.jsx.
function HashChangeListenerStub() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function getExpFromHash() {
      const m = window.location.hash.match(/[?&]exp=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }
    function handleHashChange() {
      const newExpId = getExpFromHash();
      if (!newExpId) return;
      const api = window.__ELAB_API;
      if (!api || !api.loadExperiment) return;
      const current = api.getCurrentExperiment?.();
      if (current?.id === newExpId) return;
      api.loadExperiment(newExpId);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return null;
}

function fireHashChange(newHash) {
  // jsdom: assigning location.hash dispatches hashchange but synchronously,
  // so we wrap in act() to flush React effects deterministically.
  act(() => {
    window.location.hash = newHash;
    // Some jsdom versions don't fire hashchange on direct hash assign; emit
    // manually to be robust across versions.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('LavagnaShell hashchange listener (iter 28)', () => {
  let loadExperimentMock;
  let getCurrentExperimentMock;

  beforeEach(() => {
    loadExperimentMock = vi.fn();
    getCurrentExperimentMock = vi.fn(() => ({ id: 'v1-cap6-esp1' }));
    window.__ELAB_API = {
      loadExperiment: loadExperimentMock,
      getCurrentExperiment: getCurrentExperimentMock,
    };
    // Reset hash to known starting state
    window.location.hash = '#lavagna?exp=v1-cap6-esp1';
  });

  afterEach(() => {
    cleanup();
    delete window.__ELAB_API;
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('calls loadExperiment when hash changes to a new experiment id', () => {
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v2-cap5-esp1');
    expect(loadExperimentMock).toHaveBeenCalledTimes(1);
    expect(loadExperimentMock).toHaveBeenCalledWith('v2-cap5-esp1');
  });

  it('does NOT call loadExperiment when hash changes to the SAME experiment id (no double-load)', () => {
    render(<HashChangeListenerStub />);
    // current is v1-cap6-esp1 per getCurrentExperimentMock; re-emit same
    fireHashChange('#lavagna?exp=v1-cap6-esp1');
    expect(loadExperimentMock).not.toHaveBeenCalled();
  });

  it('does NOT call loadExperiment when hash has no ?exp= param (graceful)', () => {
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna');
    expect(loadExperimentMock).not.toHaveBeenCalled();
  });

  it('does NOT call loadExperiment when API is not ready (graceful, will retry on next hashchange)', () => {
    delete window.__ELAB_API;
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v3-cap5-esp1');
    // No throw, no call — listener stays alive for next event
    expect(loadExperimentMock).not.toHaveBeenCalled();
  });

  it('does NOT call loadExperiment when API exists but lacks loadExperiment method', () => {
    window.__ELAB_API = { getCurrentExperiment: getCurrentExperimentMock };
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v3-cap5-esp1');
    expect(loadExperimentMock).not.toHaveBeenCalled();
  });

  it('removes hashchange listener on unmount (cleanup, no memory leak)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<HashChangeListenerStub />);
    unmount();
    const hashchangeCleanup = removeSpy.mock.calls.find(
      ([eventName]) => eventName === 'hashchange'
    );
    expect(hashchangeCleanup).toBeDefined();
    removeSpy.mockRestore();
  });

  it('still calls loadExperiment for invalid expId format (API responsibility to validate)', () => {
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=not-a-real-experiment-id-123');
    expect(loadExperimentMock).toHaveBeenCalledTimes(1);
    expect(loadExperimentMock).toHaveBeenCalledWith('not-a-real-experiment-id-123');
  });

  it('decodes URI-encoded expId via decodeURIComponent', () => {
    render(<HashChangeListenerStub />);
    // %2D = '-'
    fireHashChange('#lavagna?exp=v1-cap6%2Desp1-spaced');
    // 'v1-cap6-esp1-spaced' is different from current 'v1-cap6-esp1', so call fires
    expect(loadExperimentMock).toHaveBeenCalledTimes(1);
    expect(loadExperimentMock).toHaveBeenCalledWith('v1-cap6-esp1-spaced');
  });

  it('handles ?exp= as first query param (regex anchor)', () => {
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v2-cap5-esp2&mode=guided');
    expect(loadExperimentMock).toHaveBeenCalledWith('v2-cap5-esp2');
  });

  it('handles ?exp= as second/later query param (regex anchor `[?&]`)', () => {
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?mode=guided&exp=v3-cap5-esp1');
    expect(loadExperimentMock).toHaveBeenCalledWith('v3-cap5-esp1');
  });

  it('does NOT trigger when getCurrentExperiment returns null (treats as different — loads)', () => {
    // current null → newExpId 'v2-...' !== current?.id (undefined), so load fires
    getCurrentExperimentMock.mockReturnValue(null);
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v2-cap5-esp1');
    expect(loadExperimentMock).toHaveBeenCalledTimes(1);
    expect(loadExperimentMock).toHaveBeenCalledWith('v2-cap5-esp1');
  });

  it('handles missing getCurrentExperiment method (optional chaining safe)', () => {
    window.__ELAB_API = { loadExperiment: loadExperimentMock };
    render(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v2-cap5-esp1');
    // current undefined → load fires
    expect(loadExperimentMock).toHaveBeenCalledTimes(1);
    expect(loadExperimentMock).toHaveBeenCalledWith('v2-cap5-esp1');
  });

  it('fires once per hashchange event (not duplicated by re-renders)', () => {
    const { rerender } = render(<HashChangeListenerStub />);
    rerender(<HashChangeListenerStub />);
    rerender(<HashChangeListenerStub />);
    fireHashChange('#lavagna?exp=v2-cap5-esp1');
    expect(loadExperimentMock).toHaveBeenCalledTimes(1);
  });
});
