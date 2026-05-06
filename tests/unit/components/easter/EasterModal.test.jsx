/**
 * EasterModal tests — Sprint T iter 37 Atom A6 (WebDesigner-1)
 *
 * Coverage: render + props + click handlers + a11y + banana mode counter.
 *
 * Andrea Marro — iter 37 — 2026-04-30
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import EasterModal from '../../../../src/components/easter/EasterModal.jsx';

// localStorage in tests/setup.js is a vi.fn() mock — install a real backing
// store for these tests so banana counter persistence is observable.
function installLocalStorageBacking() {
  const store = new Map();
  window.localStorage.getItem.mockImplementation((key) => store.has(key) ? store.get(key) : null);
  window.localStorage.setItem.mockImplementation((key, val) => { store.set(key, String(val)); });
  window.localStorage.removeItem.mockImplementation((key) => { store.delete(key); });
  window.localStorage.clear.mockImplementation(() => { store.clear(); });
  return store;
}

describe('EasterModal', () => {
  beforeEach(() => {
    installLocalStorageBacking();
    if (typeof document !== 'undefined') {
      document.body.classList.remove('elab-banana-mode');
    }
  });

  afterEach(() => {
    cleanup();
    if (typeof document !== 'undefined') {
      document.body.classList.remove('elab-banana-mode');
    }
  });

  it('renders dialog with role and aria-modal when isOpen=true', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('does NOT render anything when isOpen=false', () => {
    const { container } = render(<EasterModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title "Chi siamo" header', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Chi siamo')).toBeInTheDocument();
  });

  it('iter 44 minimal: NO message body NO credit line (Andrea solo foto + chi siamo)', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    expect(screen.queryByTestId('easter-modal-message')).toBeNull();
    // Body solo contenitore foto + close. No prose plurale visible UI.
  });

  it('calls onClose when close button (×) clicked', () => {
    const onClose = vi.fn();
    render(<EasterModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('easter-modal-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Esc key pressed', () => {
    const onClose = vi.fn();
    render(<EasterModal isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay (outside dialog) is clicked', () => {
    const onClose = vi.fn();
    render(<EasterModal isOpen={true} onClose={onClose} />);
    const overlay = screen.getByTestId('easter-modal-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT call onClose when click is inside the dialog', () => {
    const onClose = vi.fn();
    render(<EasterModal isOpen={true} onClose={onClose} />);
    const dialog = screen.getByTestId('easter-modal-dialog');
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('activates banana mode after 5 clicks (silent — sets body class)', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    const trigger = screen.getByTestId('easter-scimpanze-trigger');
    for (let i = 0; i < 5; i++) {
      fireEvent.click(trigger);
    }
    expect(document.body.classList.contains('elab-banana-mode')).toBe(true);
    // Iter 44 minimal: no banana label visible. Solo body class + cursor banana.
  });

  it('persists click count in localStorage (silent counter, no UI label)', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    const trigger = screen.getByTestId('easter-scimpanze-trigger');
    act(() => {
      fireEvent.click(trigger);
      fireEvent.click(trigger);
    });
    expect(localStorage.getItem('elab-easter-banana-clicks')).toBe('2');
    // Iter 44 minimal: counter testid removed UI. Solo localStorage persistence.
  });

  it('falls back to HD photo on GIF load error (iter 44)', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    const img = screen.getByTestId('easter-scimpanze-img');
    fireEvent.error(img);
    // Iter 44 cascade: GIF 404 → HD photo Wikimedia public domain (PRIMARY).
    expect(screen.getByTestId('easter-scimpanze-photo')).toBeInTheDocument();
  });

  it('falls back to ScimpanzeFallback SVG on cascade GIF + HD photo error', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    const gifImg = screen.getByTestId('easter-scimpanze-img');
    fireEvent.error(gifImg);
    // After GIF error → HD photo rendered. Now fail HD photo too.
    const photoImg = screen.getByTestId('easter-scimpanze-photo');
    fireEvent.error(photoImg);
    expect(screen.getByTestId('easter-fallback')).toBeInTheDocument();
  });

  it('close button has accessible aria-label', () => {
    render(<EasterModal isOpen={true} onClose={() => {}} />);
    const btn = screen.getByTestId('easter-modal-close');
    expect(btn.getAttribute('aria-label')).toMatch(/Chiudi/i);
  });
});
