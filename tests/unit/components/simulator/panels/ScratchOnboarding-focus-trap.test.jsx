import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ScratchOnboarding from '../../../../../src/components/simulator/panels/ScratchOnboarding.jsx';

describe('ScratchOnboarding — focus trap WCAG 2.4.3 (Codex HIGH-2 iter 82 deferred CLOSED)', () => {
  let outsideButton;

  beforeEach(() => {
    // Render trigger button OUTSIDE modal to simulate focus origin
    outsideButton = document.createElement('button');
    outsideButton.id = 'outside-trigger';
    outsideButton.textContent = 'Trigger Onboarding';
    document.body.appendChild(outsideButton);
    outsideButton.focus();
  });

  afterEach(() => {
    cleanup();
    if (outsideButton && outsideButton.parentNode) {
      outsideButton.parentNode.removeChild(outsideButton);
    }
  });

  it('T1: focus moves to first focusable inside modal on mount (initial focus)', async () => {
    expect(document.activeElement).toBe(outsideButton);

    render(<ScratchOnboarding onComplete={() => {}} />);

    // requestAnimationFrame deferred — wait for two frames to ensure focus applied
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    // Focus should NO longer be on outsideButton
    expect(document.activeElement).not.toBe(outsideButton);

    // Focus should be inside the modal (dialog role)
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('T2: ESC key closes modal via onComplete callback', () => {
    const handleComplete = vi.fn();
    render(<ScratchOnboarding onComplete={handleComplete} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('T3: modal has role=dialog + aria-modal=true + aria-label IT', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label');
    expect(dialog.getAttribute('aria-label')).toMatch(/Tutorial|ELAB|Scratch|passi/i);
  });
});
