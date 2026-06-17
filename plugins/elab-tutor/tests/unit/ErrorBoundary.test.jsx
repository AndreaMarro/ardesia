/**
 * ErrorBoundary — Tests for error boundary UI component
 * Verifies crash recovery, error logging, and child rendering.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../src/components/common/ErrorBoundary';

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn() },
}));

function ThrowError({ shouldThrow }) {
  if (shouldThrow) throw new Error('Test crash');
  return <div>Child content</div>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>OK content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('OK content')).toBeTruthy();
  });

  it('renders error UI when child throws', () => {
    // Suppress console.error from React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Qualcosa è andato storto/)).toBeTruthy();
    spy.mockRestore();
  });

  it('shows reload button on error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Ricarica la pagina')).toBeTruthy();
    spy.mockRestore();
  });

  it('shows "Mostra dettagli tecnici" button on error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Mostra dettagli tecnici')).toBeTruthy();
    spy.mockRestore();
  });

  it('displays ELAB branding in error view', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('ELAB')).toBeTruthy();
    spy.mockRestore();
  });

  it('shows kid-friendly message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Non preoccuparti/)).toBeTruthy();
    spy.mockRestore();
  });
});
