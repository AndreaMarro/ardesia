import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchToolbar from '../../../../../src/components/simulator/panels/ScratchToolbar';

describe('ScratchToolbar', () => {
  const baseProps = {
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onClear: vi.fn(),
    onHelp: vi.fn(),
    canUndo: true,
    canRedo: false,
  };

  test('T1: renders 4 buttons with Italian aria-labels', () => {
    render(<ScratchToolbar {...baseProps} />);
    expect(screen.getByRole('button', { name: /annulla/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /ripeti/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /svuota/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /aiuto/i })).toBeDefined();
  });

  test('T2: clicking Undo fires onUndo handler', () => {
    const onUndo = vi.fn();
    render(<ScratchToolbar {...baseProps} onUndo={onUndo} />);
    fireEvent.click(screen.getByRole('button', { name: /annulla/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  test('T3: Redo button disabled when canRedo false', () => {
    render(<ScratchToolbar {...baseProps} canRedo={false} />);
    expect(screen.getByRole('button', { name: /ripeti/i }).disabled).toBe(true);
  });

  test('T4: Undo button disabled when canUndo false', () => {
    render(<ScratchToolbar {...baseProps} canUndo={false} />);
    expect(screen.getByRole('button', { name: /annulla/i }).disabled).toBe(true);
  });

  test('T5: buttons have ≥44px touch target via CSS class', () => {
    const { container } = render(<ScratchToolbar {...baseProps} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.className).toMatch(/touchTarget/);
    });
  });

  test('T6: uses ElabIcons SVG NOT emoji', () => {
    const { container } = render(<ScratchToolbar {...baseProps} />);
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(4);
  });

  test('T7: Clear button has confirm dialog before fire', () => {
    const onClear = vi.fn();
    window.confirm = vi.fn(() => true);
    render(<ScratchToolbar {...baseProps} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: /svuota/i }));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringMatching(/sicur/i));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
