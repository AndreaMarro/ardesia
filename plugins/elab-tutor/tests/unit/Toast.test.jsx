/**
 * Toast.test.jsx — Test per toast notification system ELAB
 * 7 test: rendering, types, showToast, auto-dismiss
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ToastContainer, { showToast } from '../../src/components/common/Toast';

describe('Toast', () => {
  it('renders without crashing', () => {
    const { container } = render(<ToastContainer />);
    expect(container).toBeTruthy();
  });

  it('shows nothing when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.querySelectorAll('[role="alert"]').length).toBe(0);
  });

  it('showToast adds a toast', () => {
    render(<ToastContainer />);
    act(() => { showToast('Test message'); });
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('showToast with error type renders', () => {
    render(<ToastContainer />);
    act(() => { showToast('Error!', 'error'); });
    expect(screen.getByText('Error!')).toBeTruthy();
  });

  it('showToast with success type renders', () => {
    render(<ToastContainer />);
    act(() => { showToast('Success!', 'success'); });
    expect(screen.getByText('Success!')).toBeTruthy();
  });

  it('multiple toasts stack', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('First');
      showToast('Second');
      showToast('Third');
    });
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
    expect(screen.getByText('Third')).toBeTruthy();
  });

  it('showToast does not crash before mount', () => {
    expect(() => showToast('Pre-mount')).not.toThrow();
  });
});
