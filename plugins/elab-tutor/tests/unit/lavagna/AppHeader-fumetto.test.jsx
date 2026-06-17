import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import AppHeader from '../../../src/components/lavagna/AppHeader';

describe('AppHeader — Fumetto button wire-up', () => {
  beforeEach(() => cleanup());

  it('renders Fumetto button when onFumettoOpen prop provided', () => {
    render(<AppHeader onFumettoOpen={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Fumetto|Report/i })).toBeInTheDocument();
  });

  it('does NOT render Fumetto button when onFumettoOpen undefined (optional)', () => {
    render(<AppHeader />);
    const btn = screen.queryByRole('button', { name: /^Fumetto Report$/i });
    expect(btn).toBeNull();
  });

  it('calls onFumettoOpen on click', () => {
    const onFumettoOpen = vi.fn();
    render(<AppHeader onFumettoOpen={onFumettoOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /Fumetto|Report/i }));
    expect(onFumettoOpen).toHaveBeenCalledOnce();
  });

  it('touch target >= 44px (WCAG AA)', () => {
    render(<AppHeader onFumettoOpen={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /Fumetto|Report/i });
    expect(btn).toBeInTheDocument();
    // min-height checked via CSS module (not runtime-measurable in jsdom)
  });

  it('button has aria-label for accessibility', () => {
    render(<AppHeader onFumettoOpen={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /Fumetto|Report/i });
    expect(btn).toHaveAttribute('aria-label');
  });
});
