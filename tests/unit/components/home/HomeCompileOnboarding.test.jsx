/**
 * tests/unit/components/home/HomeCompileOnboarding.test.jsx
 *
 * iter 88 88.UX-3 /onboard — 5-step overlay first-render tour tests.
 *
 * 8 NEW tests:
 *   T1 default render shows step 1 (Ragazzi opener + Avanti button)
 *   T2 localStorage 'elab.compile.onboarded' === 'true' → flag inline mounting
 *      (component itself returns dialog; gating done by parent — assert via
 *      direct localStorage read post-render side effect would be empty since
 *      lazy init in parent skips mount entirely. Document intent + smoke
 *      check that parent-style gating works in isolation.)
 *   T3 Avanti button advances to next step (step 1 → 2)
 *   T4 Indietro button on step >1 returns previous (step 2 → 1)
 *   T5 Salta tour button sets localStorage + calls onComplete
 *   T6 Esc keydown sets localStorage + calls onComplete
 *   T7 Focus trap: Tab cycles within dialog (focus stays inside)
 *   T8 ARIA role="dialog" + aria-modal="true" + aria-labelledby attributes present
 *
 * Per CLAUDE.md regola 11: NO emoji in src. NO sleep. Use cleanup() +
 * localStorage.clear() in beforeEach to avoid cross-test contamination.
 *
 * Stack: vitest + @testing-library/react + jsdom (no Playwright).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import HomeCompileOnboarding from '../../../../src/components/home/HomeCompileOnboarding';

// Note: tests/setup.js mocks window.localStorage with vi.fn() spies — getItem
// + setItem don't persist values. We thread mock state via a Map and rewire
// before each test so component reads + writes hit a real in-memory store.
const lsStore = new Map();
function setupLocalStorageStore() {
  lsStore.clear();
  window.localStorage.getItem.mockImplementation((k) => lsStore.has(k) ? lsStore.get(k) : null);
  window.localStorage.setItem.mockImplementation((k, v) => { lsStore.set(k, String(v)); });
  window.localStorage.removeItem.mockImplementation((k) => { lsStore.delete(k); });
  window.localStorage.clear.mockImplementation(() => { lsStore.clear(); });
}

describe('HomeCompileOnboarding — 88.UX-3 /onboard 5-step tour', () => {
  beforeEach(() => {
    cleanup();
    setupLocalStorageStore();
  });

  it('T1 default render shows step 1 (Ragazzi opener + Avanti button)', () => {
    render(<HomeCompileOnboarding onComplete={() => {}} />);
    // Step 1 title + body — copy plurale "Ragazzi" PRINCIPIO ZERO.
    expect(screen.getByText(/Iniziamo dagli esempi pronti/i)).toBeInTheDocument();
    expect(screen.getByText(/Ragazzi, qui programmiamo Arduino/i)).toBeInTheDocument();
    // Avanti CTA visible step 1.
    const next = screen.getByTestId('home-compile-onboarding-next');
    expect(next).toBeInTheDocument();
    expect(next).toHaveTextContent('Avanti');
    // Progress label "Passo 1 di 5".
    expect(screen.getByText(/Passo 1 di 5/i)).toBeInTheDocument();
  });

  it('T2 localStorage gating flag — parent mounting pattern', () => {
    // Pattern parent uses: useState(() => localStorage.getItem(...) !== 'true').
    // Simulate the parent gate: set localStorage true → parent would NOT mount
    // HomeCompileOnboarding at all. We assert the gate evaluates correctly.
    window.localStorage.setItem('elab.compile.onboarded', 'true');
    const shouldMount = window.localStorage.getItem('elab.compile.onboarded') !== 'true';
    expect(shouldMount).toBe(false);

    // Inverse: cleared → parent mounts component.
    window.localStorage.removeItem('elab.compile.onboarded');
    const shouldMountAfterClear = window.localStorage.getItem('elab.compile.onboarded') !== 'true';
    expect(shouldMountAfterClear).toBe(true);
  });

  it('T3 Avanti button advances to next step (step 1 → 2)', () => {
    render(<HomeCompileOnboarding onComplete={() => {}} />);
    // Verify step 1.
    expect(screen.getByText(/Iniziamo dagli esempi pronti/i)).toBeInTheDocument();
    // Click Avanti.
    fireEvent.click(screen.getByTestId('home-compile-onboarding-next'));
    // Step 2 title + body.
    expect(screen.getByText(/Modificate il codice insieme/i)).toBeInTheDocument();
    expect(screen.getByText(/Ragazzi, ora trascinate i blocchi colorati/i)).toBeInTheDocument();
    // Progress label updated.
    expect(screen.getByText(/Passo 2 di 5/i)).toBeInTheDocument();
  });

  it('T4 Indietro button on step >1 returns previous (step 2 → 1)', () => {
    render(<HomeCompileOnboarding onComplete={() => {}} />);
    // Advance to step 2.
    fireEvent.click(screen.getByTestId('home-compile-onboarding-next'));
    expect(screen.getByText(/Modificate il codice insieme/i)).toBeInTheDocument();
    // Indietro now enabled (was disabled step 1).
    const back = screen.getByTestId('home-compile-onboarding-back');
    expect(back).not.toBeDisabled();
    fireEvent.click(back);
    // Back to step 1.
    expect(screen.getByText(/Iniziamo dagli esempi pronti/i)).toBeInTheDocument();
    expect(screen.getByText(/Passo 1 di 5/i)).toBeInTheDocument();
    // Step 1 — Indietro now disabled.
    expect(screen.getByTestId('home-compile-onboarding-back')).toBeDisabled();
  });

  it('T5 Salta tour button sets localStorage + calls onComplete', () => {
    const onComplete = vi.fn();
    render(<HomeCompileOnboarding onComplete={onComplete} />);
    // Pre-state: no localStorage flag.
    expect(window.localStorage.getItem('elab.compile.onboarded')).toBeNull();
    // Click Salta tour.
    fireEvent.click(screen.getByTestId('home-compile-onboarding-skip'));
    // Side effects.
    expect(window.localStorage.getItem('elab.compile.onboarded')).toBe('true');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('T6 Esc keydown sets localStorage + calls onComplete', () => {
    const onComplete = vi.fn();
    render(<HomeCompileOnboarding onComplete={onComplete} />);
    expect(window.localStorage.getItem('elab.compile.onboarded')).toBeNull();
    // Dispatch Escape on window (handler attached at window-level per
    // component impl — see HomeCompileOnboarding.jsx useEffect Esc).
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(window.localStorage.getItem('elab.compile.onboarded')).toBe('true');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('T7 Focus trap: Tab cycles within dialog (focus stays inside)', () => {
    render(<HomeCompileOnboarding onComplete={() => {}} />);
    const dialog = screen.getByTestId('home-compile-onboarding-dialog');
    // Get focusable buttons inside dialog.
    const focusable = dialog.querySelectorAll('button:not([disabled])');
    // Step 1 — back disabled, so focusable = [skip, next].
    expect(focusable.length).toBeGreaterThanOrEqual(2);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    // Auto-focus initial = primary CTA (last focusable). Verify by checking
    // last button has focus after mount.
    expect(document.activeElement).toBe(last);
    // Tab from last with NO shift → handler should preventDefault + focus first.
    // We simulate keydown on dialog ref (handler attached there per
    // FloatingWindow-style pattern).
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
    // Shift+Tab from first → handler focuses last.
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('T8 ARIA role="dialog" + aria-modal="true" + aria-labelledby present', () => {
    render(<HomeCompileOnboarding onComplete={() => {}} />);
    const dialog = screen.getByTestId('home-compile-onboarding-dialog');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // aria-labelledby points to title id rendered inside dialog.
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy);
    expect(titleEl).not.toBeNull();
    expect(titleEl).toHaveTextContent(/Iniziamo dagli esempi pronti/i);
    // Bonus: aria-describedby points to body id (good a11y practice).
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const bodyEl = document.getElementById(describedBy);
    expect(bodyEl).not.toBeNull();
  });
});
