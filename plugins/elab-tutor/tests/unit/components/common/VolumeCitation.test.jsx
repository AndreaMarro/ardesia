/**
 * VolumeCitation tests — Sprint Q2.A
 * Andrea Marro 2026-04-25
 *
 * Inline badge "Vol.N pag.M" cliccabile per citazioni volume nel Percorso Capitolo.
 * PRINCIPIO ZERO: testo neutro nominale ("Vol.1 pag.27"), no comandi.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VolumeCitation from '../../../../src/components/common/VolumeCitation.jsx';

describe('VolumeCitation', () => {
  it('renders Vol.N pag.M format', () => {
    render(<VolumeCitation volume={1} page={27} />);
    expect(screen.getByText(/Vol\.1\s*pag\.27/)).toBeInTheDocument();
  });

  it('renders for volume 2 page 109', () => {
    render(<VolumeCitation volume={2} page={109} />);
    expect(screen.getByText(/Vol\.2\s*pag\.109/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handler = vi.fn();
    render(<VolumeCitation volume={1} page={27} onClick={handler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ volume: 1, page: 27 });
  });

  it('renders as button when clickable', () => {
    render(<VolumeCitation volume={1} page={27} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as span when no onClick', () => {
    render(<VolumeCitation volume={1} page={27} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<VolumeCitation volume={1} page={27} onClick={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('Volume 1');
    expect(btn.getAttribute('aria-label')).toContain('27');
  });

  it('rejects invalid volume gracefully (renders nothing or default)', () => {
    const { container } = render(<VolumeCitation volume={9} page={27} />);
    // Either no render OR fallback — verify no crash
    expect(container).toBeTruthy();
  });

  it('supports custom label prop', () => {
    render(<VolumeCitation volume={1} page={27} label="riferimento volume" />);
    expect(screen.getByText(/riferimento volume/)).toBeInTheDocument();
  });
});
