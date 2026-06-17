/**
 * manuale-passo-passo-sync.test.js — Goal A (Manuale ↔ Passo Passo auto-sync)
 *
 * Verifies the dispatchStepSync helper exported by LavagnaShell:
 *  - VolumeViewer closed → no setCurrentVolumePage call, but DOM event still emitted.
 *  - VolumeViewer open → setCurrentVolumePage(bookPage) + setCurrentVolume(volume) called.
 *  - Missing VOLUME_REFERENCES entry → no setCurrentVolumePage, event emitted with bookPage:null.
 *
 * Pattern: pure-function helper (no React mount), per the convention in
 * LavagnaShell-deeplink-state.test.jsx / LavagnaShell-modalita.test.jsx.
 *
 * Source ref: src/components/lavagna/LavagnaShell.jsx (dispatchStepSync export).
 * Plan ref: docs/plans/2026-05-27-3-features-multi-agent-plan.md (Goal A).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchStepSync } from '../../../../src/components/lavagna/LavagnaShell.jsx';

describe('LavagnaShell dispatchStepSync (Goal A — auto-sync VolumeViewer to passo-passo)', () => {
  let dispatchedEvents;
  let originalDispatchEvent;

  beforeEach(() => {
    dispatchedEvents = [];
    // Capture all CustomEvent dispatches without spying on the live DOM
    originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = vi.fn((event) => {
      dispatchedEvents.push(event);
      return originalDispatchEvent.call(window, event);
    });
  });

  afterEach(() => {
    window.dispatchEvent = originalDispatchEvent;
  });

  it('CASE A: VolumeViewer closed → no setCurrentVolumePage, event still emitted', () => {
    const setCurrentVolumePage = vi.fn();
    const setCurrentVolume = vi.fn();

    dispatchStepSync({
      experimentId: 'v1-cap6-esp1', // valid VOLUME_REFERENCES entry (bookPage: 29, volume: 1)
      stepIndex: 2,
      volumeOpen: false,
      setCurrentVolumePage,
      setCurrentVolume,
    });

    expect(setCurrentVolumePage).not.toHaveBeenCalled();
    expect(setCurrentVolume).not.toHaveBeenCalled();

    const stepEvents = dispatchedEvents.filter((e) => e.type === 'elab-step-change');
    expect(stepEvents.length).toBe(1);
    expect(stepEvents[0].detail).toEqual({
      experimentId: 'v1-cap6-esp1',
      stepIndex: 2,
      bookPage: 29,
    });
  });

  it('CASE B: VolumeViewer open → setCurrentVolumePage + setCurrentVolume called, event emitted', () => {
    const setCurrentVolumePage = vi.fn();
    const setCurrentVolume = vi.fn();

    dispatchStepSync({
      experimentId: 'v2-cap7-esp1', // valid VOLUME_REFERENCES entry
      stepIndex: 0,
      volumeOpen: true,
      setCurrentVolumePage,
      setCurrentVolume,
    });

    expect(setCurrentVolumePage).toHaveBeenCalledTimes(1);
    const pageArg = setCurrentVolumePage.mock.calls[0][0];
    expect(typeof pageArg).toBe('number');
    expect(pageArg).toBeGreaterThan(0);

    expect(setCurrentVolume).toHaveBeenCalledTimes(1);
    expect(setCurrentVolume).toHaveBeenCalledWith(2); // Vol. 2

    const stepEvents = dispatchedEvents.filter((e) => e.type === 'elab-step-change');
    expect(stepEvents.length).toBe(1);
    expect(stepEvents[0].detail.experimentId).toBe('v2-cap7-esp1');
    expect(stepEvents[0].detail.stepIndex).toBe(0);
    expect(typeof stepEvents[0].detail.bookPage).toBe('number');
  });

  it('CASE C: Missing VOLUME_REFERENCES entry → no setters called, event emitted with bookPage:null', () => {
    const setCurrentVolumePage = vi.fn();
    const setCurrentVolume = vi.fn();

    dispatchStepSync({
      experimentId: 'nonexistent-experiment-id-xyz',
      stepIndex: 1,
      volumeOpen: true, // even when open, missing ref → no setter
      setCurrentVolumePage,
      setCurrentVolume,
    });

    expect(setCurrentVolumePage).not.toHaveBeenCalled();
    expect(setCurrentVolume).not.toHaveBeenCalled();

    const stepEvents = dispatchedEvents.filter((e) => e.type === 'elab-step-change');
    expect(stepEvents.length).toBe(1);
    expect(stepEvents[0].detail).toEqual({
      experimentId: 'nonexistent-experiment-id-xyz',
      stepIndex: 1,
      bookPage: null,
    });
  });

  it('CASE D: defensive — null/undefined experimentId is a no-op (no event, no setter)', () => {
    const setCurrentVolumePage = vi.fn();
    const setCurrentVolume = vi.fn();

    dispatchStepSync({
      experimentId: null,
      stepIndex: 0,
      volumeOpen: true,
      setCurrentVolumePage,
      setCurrentVolume,
    });

    expect(setCurrentVolumePage).not.toHaveBeenCalled();
    expect(setCurrentVolume).not.toHaveBeenCalled();
    const stepEvents = dispatchedEvents.filter((e) => e.type === 'elab-step-change');
    expect(stepEvents.length).toBe(0);
  });
});
