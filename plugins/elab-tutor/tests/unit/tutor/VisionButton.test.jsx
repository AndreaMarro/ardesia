/**
 * VisionButton — Vision E2E trigger
 * Click → window.__ELAB_API.captureScreenshot() → pass base64 to onVisionResult.
 * Claude Opus 4.7 andrea marro — 19/04/2026
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import VisionButton from '../../../src/components/tutor/VisionButton';

beforeEach(() => {
  cleanup();
  window.__ELAB_API = {
    captureScreenshot: vi.fn(async () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='),
  };
});

afterEach(() => {
  delete window.__ELAB_API;
  vi.restoreAllMocks();
});

describe('VisionButton', () => {
  it('renders accessible label "Guarda il mio circuito"', () => {
    render(<VisionButton onVisionResult={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /Guarda il mio circuito/i })
    ).toBeTruthy();
  });

  it('has camera icon (svg child)', () => {
    render(<VisionButton onVisionResult={vi.fn()} />);
    const btn = screen.getByRole('button');
    const icon = btn.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('calls __ELAB_API.captureScreenshot on click', async () => {
    render(<VisionButton onVisionResult={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(window.__ELAB_API.captureScreenshot).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading label during capture', async () => {
    // Delay capture to observe intermediate loading state
    let resolveCapture;
    window.__ELAB_API.captureScreenshot = vi.fn(() =>
      new Promise((resolve) => {
        resolveCapture = () => resolve('data:image/png;base64,iVBORw0KGgo=');
      })
    );
    render(<VisionButton onVisionResult={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Sto guardando/i)).toBeTruthy();
    resolveCapture();
  });

  it('calls onVisionResult with base64 + mimeType after capture', async () => {
    const onResult = vi.fn();
    render(<VisionButton onVisionResult={onResult} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(onResult).toHaveBeenCalled();
    });
    const arg = onResult.mock.calls[0][0];
    expect(arg.base64).toContain('iVBORw');
    expect(arg.mimeType).toBe('image/png');
  });

  it('is disabled when __ELAB_API unavailable', () => {
    delete window.__ELAB_API;
    render(<VisionButton onVisionResult={vi.fn()} />);
    expect(screen.getByRole('button').disabled).toBe(true);
  });

  it('calls onError if captureScreenshot throws', async () => {
    const err = new Error('snapshot failed');
    window.__ELAB_API.captureScreenshot = vi.fn(async () => { throw err; });
    const onError = vi.fn();
    render(<VisionButton onVisionResult={vi.fn()} onError={onError} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(err);
    });
  });
});
