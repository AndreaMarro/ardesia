import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchOnboarding from '../../../../../src/components/simulator/panels/ScratchOnboarding';

describe('ScratchOnboarding', () => {
  beforeEach(() => {
    // Override global vi.fn() localStorage mocks with a real in-memory store.
    // tests/setup.js installs no-op stubs that don't persist setItem; the spec
    // assertions in T5+T6 require real read-back behavior.
    const store = new Map();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
      },
    });
    localStorage.clear();
  });

  test('T1: renders dialog with ARIA role + plurale "Ragazzi"', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.textContent).toMatch(/ragazzi/i);
  });

  test('T2: step 1 mentions kit fisico ELAB (PRINCIPIO ZERO)', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    expect(screen.getByText(/kit/i)).toBeDefined();
  });

  test('T3: 3 steps navigable via Next button', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    expect(screen.getByText(/passo 1 di 3/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(screen.getByText(/passo 2 di 3/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(screen.getByText(/passo 3 di 3/i)).toBeDefined();
  });

  test('T4: Indietro button appears step 2+', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    expect(screen.queryByRole('button', { name: /indietro/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(screen.getByRole('button', { name: /indietro/i })).toBeDefined();
  });

  test('T5: completing step 3 fires onComplete + sets localStorage flag', () => {
    const onComplete = vi.fn();
    render(<ScratchOnboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    fireEvent.click(screen.getByRole('button', { name: /iniziamo/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('elab-blockly-onboarded')).toBe('true');
  });

  test('T6: Salta button skips entire onboarding + sets flag', () => {
    const onComplete = vi.fn();
    render(<ScratchOnboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /salta/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('elab-blockly-onboarded')).toBe('true');
  });

  test('T7: Escape key dismisses onboarding', () => {
    const onComplete = vi.fn();
    render(<ScratchOnboarding onComplete={onComplete} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('T8: NO emoji used (ElabIcons SVG only)', () => {
    const { container } = render(<ScratchOnboarding onComplete={() => {}} />);
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });
});
