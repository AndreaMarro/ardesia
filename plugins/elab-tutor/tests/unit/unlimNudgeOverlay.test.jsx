import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnlimNudgeOverlay from '../../src/components/lavagna/UnlimNudgeOverlay';

describe('UnlimNudgeOverlay — presentational nudge toast', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(
      <UnlimNudgeOverlay visible={false} message="ignored" onDismiss={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when message is empty', () => {
    const { container } = render(
      <UnlimNudgeOverlay visible={true} message="" onDismiss={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the message when visible', () => {
    render(
      <UnlimNudgeOverlay
        visible={true}
        message="Prova a girare il LED: la gamba lunga va verso il +."
        onDismiss={() => {}}
      />
    );
    expect(screen.getByTestId('unlim-nudge-overlay')).toBeInTheDocument();
    expect(screen.getByText(/gamba lunga va verso il \+/)).toBeInTheDocument();
    expect(screen.getByText(/UNLIM suggerisce/i)).toBeInTheDocument();
  });

  it('uses polite aria-live so screen readers do not interrupt', () => {
    render(<UnlimNudgeOverlay visible={true} message="x" onDismiss={() => {}} />);
    const el = screen.getByTestId('unlim-nudge-overlay');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('dismisses when the user clicks Ok', () => {
    const onDismiss = vi.fn();
    render(
      <UnlimNudgeOverlay visible={true} message="Hai fatto pausa?" onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByRole('button', { name: /chiudi suggerimento/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('escalates to UNLIM when the user clicks Chiedi a UNLIM', () => {
    const onAskUNLIM = vi.fn();
    render(
      <UnlimNudgeOverlay
        visible={true}
        message="Il LED e' collegato al contrario?"
        onDismiss={() => {}}
        onAskUNLIM={onAskUNLIM}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /chiedi a unlim/i }));
    expect(onAskUNLIM).toHaveBeenCalledTimes(1);
    expect(onAskUNLIM).toHaveBeenCalledWith(expect.stringContaining('LED'));
  });

  it('omits the Chiedi a UNLIM button when no escalation handler is provided', () => {
    render(
      <UnlimNudgeOverlay visible={true} message="Suggerimento" onDismiss={() => {}} />
    );
    expect(screen.queryByRole('button', { name: /chiedi a unlim/i })).toBeNull();
    expect(screen.getByRole('button', { name: /chiudi suggerimento/i })).toBeInTheDocument();
  });

  it('exposes the priority via data attribute for CSS targeting', () => {
    const { rerender } = render(
      <UnlimNudgeOverlay visible={true} message="x" priority="high" onDismiss={() => {}} />
    );
    expect(screen.getByTestId('unlim-nudge-overlay').dataset.priority).toBe('high');

    rerender(
      <UnlimNudgeOverlay visible={true} message="x" priority="med" onDismiss={() => {}} />
    );
    expect(screen.getByTestId('unlim-nudge-overlay').dataset.priority).toBe('med');
  });

  it('_forceRender allows snapshotting with visible=false (test seam)', () => {
    render(
      <UnlimNudgeOverlay
        visible={false}
        message="x"
        onDismiss={() => {}}
        _forceRender
      />
    );
    expect(screen.getByTestId('unlim-nudge-overlay')).toBeInTheDocument();
  });
});
