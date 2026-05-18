import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle, MODE_BLOCKS, MODE_CODE } from '../../../../../src/features/elabBlocks/ui/ModeToggle.jsx';

describe('ModeToggle — Sub-project A iter 84 atom 8 Andrea ratify gruppo 16 voce 3', () => {
  it('T1: renders 2 tabs Blocchi + C++ with aria-pressed active state', () => {
    render(<ModeToggle activeMode={MODE_BLOCKS} onModeChange={() => {}} />);
    const blocks = screen.getByRole('tab', { name: /Blocchi/ });
    const code = screen.getByRole('tab', { name: /C\+\+/ });
    expect(blocks).toBeInTheDocument();
    expect(code).toBeInTheDocument();
    expect(blocks).toHaveAttribute('aria-pressed', 'true');
    expect(code).toHaveAttribute('aria-pressed', 'false');
    expect(blocks).toHaveAttribute('tabindex', '0');
    expect(code).toHaveAttribute('tabindex', '-1');
  });

  it('T2: click inactive tab triggers onModeChange callback', () => {
    const handler = vi.fn();
    render(<ModeToggle activeMode={MODE_BLOCKS} onModeChange={handler} />);
    fireEvent.click(screen.getByRole('tab', { name: /C\+\+/ }));
    expect(handler).toHaveBeenCalledWith(MODE_CODE);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('T3: keyboard ArrowLeft + ArrowRight switch active mode WCAG keyboard nav', () => {
    const handler = vi.fn();
    render(<ModeToggle activeMode={MODE_BLOCKS} onModeChange={handler} />);
    const blocks = screen.getByRole('tab', { name: /Blocchi/ });
    blocks.focus();
    fireEvent.keyDown(blocks, { key: 'ArrowRight' });
    expect(handler).toHaveBeenCalledWith(MODE_CODE);
  });

  it('T4: disabled prop prevents click + keyboard activation', () => {
    const handler = vi.fn();
    render(<ModeToggle activeMode={MODE_BLOCKS} onModeChange={handler} disabled />);
    const code = screen.getByRole('tab', { name: /C\+\+/ });
    fireEvent.click(code);
    fireEvent.keyDown(code, { key: 'Enter' });
    fireEvent.keyDown(code, { key: 'ArrowLeft' });
    expect(handler).not.toHaveBeenCalled();
    expect(code).toBeDisabled();
  });
});
