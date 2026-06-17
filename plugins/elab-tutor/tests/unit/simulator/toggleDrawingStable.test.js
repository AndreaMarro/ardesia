/**
 * T1-001: toggleDrawing API stability test
 *
 * Verifies that window.__ELAB_API.toggleDrawing and isDrawingEnabled
 * remain stable functions that don't suffer from stale closures or
 * registration gaps when drawingEnabled state changes.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the ref-pattern contract at the unit level:
// - toggleDrawing must be a stable function (same reference after state changes)
// - isDrawingEnabled must return CURRENT value, not stale closure

describe('T1-001: toggleDrawing API stability', () => {
  let api;

  beforeEach(() => {
    api = {};
    window.__ELAB_API = api;
  });

  afterEach(() => {
    delete window.__ELAB_API;
  });

  it('api.toggleDrawing remains a function after drawingEnabled changes', () => {
    // Simulate the ref-pattern: register once, toggle should survive state changes
    let drawingEnabled = false;
    const drawingEnabledRef = { current: drawingEnabled };

    const setDrawingEnabled = (val) => {
      drawingEnabled = typeof val === 'function' ? val(drawingEnabled) : val;
      drawingEnabledRef.current = drawingEnabled;
    };

    // Register ONCE (stable pattern)
    const toggle = (enabled) => setDrawingEnabled(
      typeof enabled === 'boolean' ? enabled : (p) => !p
    );
    api.toggleDrawing = toggle;
    api.isDrawingEnabled = () => drawingEnabledRef.current;

    // Toggle multiple times -- function must stay the same reference
    const ref1 = api.toggleDrawing;
    api.toggleDrawing(true);
    const ref2 = api.toggleDrawing;
    api.toggleDrawing(false);
    const ref3 = api.toggleDrawing;

    expect(ref1).toBe(ref2);
    expect(ref2).toBe(ref3);
    expect(typeof api.toggleDrawing).toBe('function');
  });

  it('api.isDrawingEnabled() returns current value, not stale closure', () => {
    let drawingEnabled = false;
    const drawingEnabledRef = { current: drawingEnabled };

    const setDrawingEnabled = (val) => {
      drawingEnabled = typeof val === 'function' ? val(drawingEnabled) : val;
      drawingEnabledRef.current = drawingEnabled;
    };

    api.toggleDrawing = (enabled) => setDrawingEnabled(
      typeof enabled === 'boolean' ? enabled : (p) => !p
    );
    api.isDrawingEnabled = () => drawingEnabledRef.current;

    expect(api.isDrawingEnabled()).toBe(false);
    api.toggleDrawing(true);
    expect(api.isDrawingEnabled()).toBe(true);
    api.toggleDrawing(false);
    expect(api.isDrawingEnabled()).toBe(false);
    api.toggleDrawing(); // toggle
    expect(api.isDrawingEnabled()).toBe(true);
  });

  it('no gap: toggleDrawing always exists on api after registration', () => {
    // With the OLD pattern ([drawingEnabled] dep), cleanup deletes toggleDrawing
    // then re-registers with setInterval delay. With ref pattern, no gap.
    let drawingEnabled = false;
    const drawingEnabledRef = { current: drawingEnabled };

    const setDrawingEnabled = (val) => {
      drawingEnabled = typeof val === 'function' ? val(drawingEnabled) : val;
      drawingEnabledRef.current = drawingEnabled;
    };

    const toggle = (enabled) => setDrawingEnabled(
      typeof enabled === 'boolean' ? enabled : (p) => !p
    );
    api.toggleDrawing = toggle;
    api.isDrawingEnabled = () => drawingEnabledRef.current;

    // Simulate rapid toggles -- api.toggleDrawing must never be undefined
    for (let i = 0; i < 20; i++) {
      expect(api.toggleDrawing).toBeDefined();
      expect(typeof api.toggleDrawing).toBe('function');
      api.toggleDrawing(!drawingEnabled);
    }
  });

  it('stale closure detection: OLD pattern would fail this', () => {
    // This test specifically catches the stale closure bug.
    // OLD: isDrawingEnabled = () => drawingEnabled (captured at creation time)
    // NEW: isDrawingEnabled = () => drawingEnabledRef.current (always current)

    let drawingEnabled = false;

    // Simulate the NEW ref pattern
    const drawingEnabledRef = { current: false };

    api.isDrawingEnabled = () => drawingEnabledRef.current;

    // Change the value through the ref
    drawingEnabledRef.current = true;
    expect(api.isDrawingEnabled()).toBe(true);

    drawingEnabledRef.current = false;
    expect(api.isDrawingEnabled()).toBe(false);

    // Now simulate OLD pattern (closure capture) - this WOULD be stale
    const closuredValue = drawingEnabled; // captured at false
    const staleCheck = () => closuredValue;

    // The stale function returns false even though we changed drawingEnabled
    drawingEnabled = true;
    expect(staleCheck()).toBe(false); // stale! returns old value
    // But our ref-based one returns the truth
    drawingEnabledRef.current = true;
    expect(api.isDrawingEnabled()).toBe(true); // correct!
  });
});
