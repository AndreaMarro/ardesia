/**
 * UnlimMascotte tests — Tea-canonical SVG mascotte.
 *
 * Sprint U iter 70 Team D.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnlimMascotte, { UNLIM_PALETTE } from '../../../../src/components/common/UnlimMascotte';

describe('UnlimMascotte — Tea canonical', () => {
  it('renders with default props (medium / aspetta / inline)', () => {
    render(<UnlimMascotte />);
    const node = screen.getByTestId('unlim-mascotte');
    expect(node).toBeTruthy();
    expect(node.getAttribute('data-size')).toBe('medium');
    expect(node.getAttribute('data-state')).toBe('aspetta');
    expect(node.getAttribute('data-position')).toBe('inline');
  });

  it('honors valid size prop', () => {
    render(<UnlimMascotte size="hero" />);
    expect(screen.getByTestId('unlim-mascotte').getAttribute('data-size')).toBe(
      'hero'
    );
  });

  it('falls back to medium on invalid size', () => {
    render(<UnlimMascotte size="enormous" />);
    expect(screen.getByTestId('unlim-mascotte').getAttribute('data-size')).toBe(
      'medium'
    );
  });

  it('honors valid state prop', () => {
    render(<UnlimMascotte state="parla" />);
    expect(screen.getByTestId('unlim-mascotte').getAttribute('data-state')).toBe(
      'parla'
    );
  });

  it('falls back to aspetta on invalid state', () => {
    render(<UnlimMascotte state="meditates" />);
    expect(screen.getByTestId('unlim-mascotte').getAttribute('data-state')).toBe(
      'aspetta'
    );
  });

  it('honors valid position prop', () => {
    render(<UnlimMascotte position="floating-br" />);
    expect(
      screen.getByTestId('unlim-mascotte').getAttribute('data-position')
    ).toBe('floating-br');
  });

  it('falls back to inline on invalid position', () => {
    render(<UnlimMascotte position="under-the-rug" />);
    expect(
      screen.getByTestId('unlim-mascotte').getAttribute('data-position')
    ).toBe('inline');
  });

  it('exposes default Italian aria-label', () => {
    render(<UnlimMascotte />);
    const node = screen.getByTestId('unlim-mascotte');
    expect(node.getAttribute('aria-label')).toMatch(/UNLIM/i);
    expect(node.getAttribute('aria-label')).toMatch(/Ragazzi/);
  });

  it('honors custom aria-label override', () => {
    render(<UnlimMascotte ariaLabel="Custom mascot label" />);
    expect(
      screen.getByTestId('unlim-mascotte').getAttribute('aria-label')
    ).toBe('Custom mascot label');
  });

  it('renders an SVG child element', () => {
    const { container } = render(<UnlimMascotte />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('SVG has correct viewBox per Tea canonical 360x400', () => {
    const { container } = render(<UnlimMascotte />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 360 400');
  });

  it('SVG includes the antenna polyline', () => {
    const { container } = render(<UnlimMascotte />);
    const poly = container.querySelector('polyline');
    expect(poly).toBeTruthy();
    expect(poly.getAttribute('stroke')).toBe(UNLIM_PALETTE.navy);
  });

  it('SVG includes 2 eyes (Navy ellipses)', () => {
    const { container } = render(<UnlimMascotte />);
    const ellipses = container.querySelectorAll(`ellipse[fill="${UNLIM_PALETTE.navy}"]`);
    expect(ellipses.length).toBeGreaterThanOrEqual(2);
  });

  it('SVG includes 3 light rays (Lime lines)', () => {
    const { container } = render(<UnlimMascotte />);
    const limeLines = container.querySelectorAll(`line[stroke="${UNLIM_PALETTE.lime}"]`);
    expect(limeLines.length).toBe(3);
  });

  it('SVG includes head Navy + Lime + white frames (3 rects min)', () => {
    const { container } = render(<UnlimMascotte />);
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(5);
  });

  it('uses Tea-canonical palette HEX (Navy/Lime/White)', () => {
    expect(UNLIM_PALETTE.navy).toBe('#1E4D8C');
    expect(UNLIM_PALETTE.lime).toBe('#4A7A25');
    expect(UNLIM_PALETTE.white).toBe('#FFFFFF');
    expect(UNLIM_PALETTE.orange).toBe('#E8941C');
    expect(UNLIM_PALETTE.red).toBe('#E54B3D');
  });

  it('UNLIM_PALETTE is immutable (frozen)', () => {
    expect(Object.isFrozen(UNLIM_PALETTE)).toBe(true);
  });

  it('calls onClick handler when provided', () => {
    const handler = vi.fn();
    render(<UnlimMascotte onClick={handler} />);
    fireEvent.click(screen.getByTestId('unlim-mascotte'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not bind onClick when no handler given', () => {
    const { container } = render(<UnlimMascotte />);
    // Should still render without throwing on click
    fireEvent.click(container.firstChild);
    expect(screen.getByTestId('unlim-mascotte')).toBeTruthy();
  });

  it('SVG aria-hidden so screen reader reads wrapper label only', () => {
    const { container } = render(<UnlimMascotte />);
    expect(container.querySelector('svg').getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  it('all valid sizes render without error', () => {
    for (const size of ['small', 'medium', 'large', 'hero']) {
      const { unmount } = render(<UnlimMascotte size={size} />);
      expect(screen.getByTestId('unlim-mascotte').getAttribute('data-size')).toBe(
        size
      );
      unmount();
    }
  });

  it('all valid states render without error', () => {
    for (const state of ['parla', 'ascolta', 'aspetta']) {
      const { unmount } = render(<UnlimMascotte state={state} />);
      expect(screen.getByTestId('unlim-mascotte').getAttribute('data-state')).toBe(
        state
      );
      unmount();
    }
  });

  it('all valid positions render without error', () => {
    for (const pos of [
      'inline',
      'floating-tl',
      'floating-tr',
      'floating-bl',
      'floating-br',
    ]) {
      const { unmount } = render(<UnlimMascotte position={pos} />);
      expect(
        screen.getByTestId('unlim-mascotte').getAttribute('data-position')
      ).toBe(pos);
      unmount();
    }
  });

  it('role is img for AT semantics', () => {
    render(<UnlimMascotte />);
    expect(screen.getByTestId('unlim-mascotte').getAttribute('role')).toBe('img');
  });

  it('merges custom className on wrapper', () => {
    render(<UnlimMascotte className="extra-class" />);
    expect(
      screen.getByTestId('unlim-mascotte').className.includes('extra-class')
    ).toBe(true);
  });

  it('SVG includes the torch/saldatore handle (white rect with navy stroke)', () => {
    const { container } = render(<UnlimMascotte />);
    const handleRect = Array.from(container.querySelectorAll('rect')).find(
      (r) =>
        r.getAttribute('fill') === UNLIM_PALETTE.white &&
        r.getAttribute('stroke') === UNLIM_PALETTE.navy
    );
    expect(handleRect).toBeTruthy();
  });

  it('SVG includes the Lime torch tip (path d attribute)', () => {
    const { container } = render(<UnlimMascotte />);
    const limePath = Array.from(container.querySelectorAll('path')).find(
      (p) => p.getAttribute('fill') === UNLIM_PALETTE.lime
    );
    expect(limePath).toBeTruthy();
  });

  it('SVG includes ear speaker concentric circles', () => {
    const { container } = render(<UnlimMascotte />);
    // 4 circles total expected: antenna tip + ear ring + ear moon + ear pupil
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(4);
  });

  it('preserves data-testid for harness lookup', () => {
    render(<UnlimMascotte />);
    expect(screen.getByTestId('unlim-mascotte')).toBeTruthy();
  });

  it('renders deterministically across re-renders (no random IDs)', () => {
    const { container: a } = render(<UnlimMascotte />);
    const { container: b } = render(<UnlimMascotte />);
    expect(a.querySelector('svg').innerHTML).toBe(
      b.querySelector('svg').innerHTML
    );
  });
});
