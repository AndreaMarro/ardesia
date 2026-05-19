/**
 * tests/unit/components/home/ProgramExplainer.test.jsx
 *
 * iter 88 UX-7 — empty-state explainer panel for HomeCompileEntry.
 *
 * Coverage (6 tests T1-T6):
 *   T1 default render templateKey="blink-led" → toggle button "Cosa fa
 *      questo programma?" present + correct title rendered.
 *   T2 click expand reveals 3-4 sentence text containing plurale "Ragazzi"
 *      (PRINCIPIO ZERO regola 14).
 *   T3 click collapse hides text + sets localStorage 'true'.
 *   T4 localStorage 'elab.compile.explainer.collapsed' === 'true' renders
 *      collapsed initially.
 *   T5 templateKey="read-button" shows different explainer text.
 *   T6 PRINCIPIO ZERO asserts: body contains "Ragazzi" + Vol/cap reference
 *      ("Volume 3 Capitolo 6") for blink-led default.
 *
 * Spec ref: docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md §88.UX-7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';

import ProgramExplainer from '../../../../src/components/home/ProgramExplainer.jsx';

const STORAGE_KEY = 'elab.compile.explainer.collapsed';

// tests/setup.js stubs window.localStorage as a vi.fn() trio that does NOT
// persist values. We back it with an in-memory Map for this suite so the
// component's lazy useState reads + useEffect writes behave end-to-end.
function installInMemoryStorage() {
  const store = new Map();
  vi.mocked(window.localStorage.getItem).mockImplementation((k) =>
    store.has(k) ? store.get(k) : null,
  );
  vi.mocked(window.localStorage.setItem).mockImplementation((k, v) => {
    store.set(k, String(v));
  });
  vi.mocked(window.localStorage.removeItem).mockImplementation((k) => {
    store.delete(k);
  });
  vi.mocked(window.localStorage.clear).mockImplementation(() => {
    store.clear();
  });
  return store;
}

describe('ProgramExplainer (iter 88 UX-7)', () => {
  let store;
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    store = installInMemoryStorage();
    store.delete(STORAGE_KEY);
  });

  it('T1 default render templateKey="blink-led" shows toggle + correct title', () => {
    render(<ProgramExplainer templateKey="blink-led" />);
    const toggle = screen.getByTestId('program-explainer-toggle');
    expect(toggle).toBeTruthy();
    expect(toggle.textContent).toMatch(/Cosa fa questo programma\?/);
    // Expanded by default on first render → title visible.
    const title = screen.getByTestId('program-explainer-title');
    expect(title.textContent).toMatch(/LED che lampeggia/);
  });

  it('T2 click expand reveals 3-4 sentence text containing plurale "Ragazzi"', () => {
    // Start collapsed via localStorage so we can verify expand transition.
    window.localStorage.setItem(STORAGE_KEY, 'true');
    render(<ProgramExplainer templateKey="blink-led" />);
    // Initially collapsed → body NOT in DOM.
    expect(screen.queryByTestId('program-explainer-body')).toBeNull();
    // Click expands.
    fireEvent.click(screen.getByTestId('program-explainer-toggle'));
    const body = screen.getByTestId('program-explainer-body');
    expect(body).toBeTruthy();
    expect(body.textContent).toMatch(/Ragazzi/);
    // Sentence count assertion 3-4 sentences by period count.
    const periods = (body.textContent.match(/\./g) || []).length;
    expect(periods).toBeGreaterThanOrEqual(3);
    expect(periods).toBeLessThanOrEqual(5);
  });

  it('T3 click collapse hides text + sets localStorage', () => {
    render(<ProgramExplainer templateKey="blink-led" />);
    // Starts expanded.
    expect(screen.getByTestId('program-explainer-body')).toBeTruthy();
    // Click toggles to collapsed.
    fireEvent.click(screen.getByTestId('program-explainer-toggle'));
    expect(screen.queryByTestId('program-explainer-body')).toBeNull();
    // localStorage set 'true'.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('T4 localStorage collapsed=true renders collapsed initially', () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    render(<ProgramExplainer templateKey="blink-led" />);
    // Body NOT rendered.
    expect(screen.queryByTestId('program-explainer-body')).toBeNull();
    // aria-expanded reflects collapsed state.
    const toggle = screen.getByTestId('program-explainer-toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('T5 templateKey="read-button" shows different explainer text', () => {
    render(<ProgramExplainer templateKey="read-button" />);
    const title = screen.getByTestId('program-explainer-title');
    expect(title.textContent).toMatch(/pulsante/i);
    const body = screen.getByTestId('program-explainer-body');
    // Confirm explainer body NOT the blink-led default.
    expect(body.textContent).not.toMatch(/LED che lampeggia/);
    // Includes plurale + pin reference per spec.
    expect(body.textContent).toMatch(/Ragazzi/);
    expect(body.textContent).toMatch(/pin 2/);
  });

  it('T6 PRINCIPIO ZERO asserts: body contains "Ragazzi" + Vol/cap reference', () => {
    render(<ProgramExplainer templateKey="blink-led" />);
    const body = screen.getByTestId('program-explainer-body');
    // Plurale opener required.
    expect(body.textContent).toMatch(/Ragazzi/);
    // Vol/cap reference for blink-led default (Vol 3 Cap 6).
    expect(body.textContent).toMatch(/Volume\s+3/);
    expect(body.textContent).toMatch(/Capitolo\s+6/);
    // ARIA region role.
    expect(body.getAttribute('role')).toBe('region');
  });
});
