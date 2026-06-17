import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingWindow from '../../../src/components/lavagna/FloatingWindow';

describe('FloatingWindow', () => {
  it('renders with title and children', () => {
    render(<FloatingWindow title="Galileo"><p>Chat content</p></FloatingWindow>);
    expect(screen.getByText('Galileo')).toBeTruthy();
    expect(screen.getByText('Chat content')).toBeTruthy();
  });

  it('calls onMinimize when minimize button clicked', () => {
    const onMin = vi.fn();
    render(<FloatingWindow title="T" onMinimize={onMin}><p>C</p></FloatingWindow>);
    fireEvent.click(screen.getByLabelText('Minimizza'));
    expect(onMin).toHaveBeenCalledTimes(1);
  });

  it('calls onMaximize when maximize button clicked', () => {
    const onMax = vi.fn();
    render(<FloatingWindow title="T" onMaximize={onMax}><p>C</p></FloatingWindow>);
    fireEvent.click(screen.getByLabelText('Espandi'));
    expect(onMax).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<FloatingWindow title="T" onClose={onClose}><p>C</p></FloatingWindow>);
    fireEvent.click(screen.getByLabelText('Chiudi'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders without control buttons when callbacks not provided', () => {
    render(<FloatingWindow title="T"><p>C</p></FloatingWindow>);
    expect(screen.queryByLabelText('Minimizza')).toBeNull();
    expect(screen.queryByLabelText('Espandi')).toBeNull();
    expect(screen.queryByLabelText('Chiudi')).toBeNull();
  });

  it('applies maximized class when maximized prop is true', () => {
    const { container } = render(
      <FloatingWindow title="T" maximized><p>C</p></FloatingWindow>
    );
    const win = container.firstChild;
    expect(win.className).toContain('maximized');
  });

  it('has accessible role and label', () => {
    render(<FloatingWindow title="Galileo"><p>C</p></FloatingWindow>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBe('Galileo');
  });
});
