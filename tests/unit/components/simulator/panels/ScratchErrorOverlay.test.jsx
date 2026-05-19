import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchErrorOverlay from '../../../../../src/components/simulator/panels/ScratchErrorOverlay';

describe('ScratchErrorOverlay', () => {
  test('T1: renders error in Italian plurale', () => {
    render(<ScratchErrorOverlay error="error: 'pin13' was not declared in this scope" onDismiss={() => {}} />);
    expect(screen.getByText(/ragazzi/i)).toBeDefined();
  });

  test('T2: translates pin error to Italian', () => {
    render(<ScratchErrorOverlay error="error: 'pin13' was not declared" onDismiss={() => {}} />);
    expect(screen.getAllByText(/pin/i).length).toBeGreaterThan(0);
  });

  test('T3: shows breadboard hint for pin-related errors', () => {
    render(<ScratchErrorOverlay error="error: 'pin13' was not declared" onDismiss={() => {}} />);
    expect(screen.getByText(/breadboard/i)).toBeDefined();
  });

  test('T4: dismiss button fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(<ScratchErrorOverlay error="generic error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /chiudi/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('T5: ARIA alert role for screen readers', () => {
    render(<ScratchErrorOverlay error="error" onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  test('T6: returns null when error is empty/null', () => {
    const { container } = render(<ScratchErrorOverlay error={null} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
