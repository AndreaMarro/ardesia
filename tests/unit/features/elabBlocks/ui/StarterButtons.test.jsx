import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarterButtons, STARTER_KEYS, STARTER_LABELS, STARTER_DESCRIPTIONS } from '../../../../../src/features/elabBlocks/ui/StarterButtons.jsx';

describe('StarterButtons — Andrea spec FASE 3.2 + ratify gruppo 16 voce 2', () => {
  it('T1: renders 3 buttons con verbatim Andrea labels', () => {
    render(<StarterButtons onStarterClick={() => {}} />);
    expect(screen.getByRole('button', { name: /Accendi un LED/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Leggi un pulsante/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Leggi un sensore/i })).toBeInTheDocument();
  });

  it('T1b: renders the starters as a three-card design grid', () => {
    render(<StarterButtons onStarterClick={() => {}} />);
    const group = screen.getByRole('group', { name: /Programmi iniziali/i });
    expect(group).toHaveAttribute('data-ui-layout', 'three-card-grid');
    for (const key of STARTER_KEYS) {
      expect(group.querySelector(`[data-starter="${key}"]`)).toHaveAttribute('data-card-shape', 'outline');
    }
  });

  it('T2: click triggers onStarterClick with correct key', () => {
    const handler = vi.fn();
    render(<StarterButtons onStarterClick={handler} />);
    fireEvent.click(screen.getByRole('button', { name: /Accendi un LED/i }));
    expect(handler).toHaveBeenCalledWith('blink');
  });

  it('T3: keyboard Space activates correct key', () => {
    const handler = vi.fn();
    render(<StarterButtons onStarterClick={handler} />);
    const btn = screen.getByRole('button', { name: /Leggi un pulsante/i });
    btn.focus();
    fireEvent.keyDown(btn, { key: ' ' });
    expect(handler).toHaveBeenCalledWith('button');
  });

  it('T4: keyboard Enter activates correct key', () => {
    const handler = vi.fn();
    render(<StarterButtons onStarterClick={handler} />);
    const btn = screen.getByRole('button', { name: /Leggi un sensore/i });
    btn.focus();
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(handler).toHaveBeenCalledWith('sensor');
  });

  it('T5: disabled prop prevents click + key activation', () => {
    const handler = vi.fn();
    render(<StarterButtons onStarterClick={handler} disabled />);
    const btn = screen.getByRole('button', { name: /Accendi un LED/i });
    fireEvent.click(btn);
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(handler).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });

  it('T6: aria-label includes both label + description for screen reader', () => {
    render(<StarterButtons onStarterClick={() => {}} />);
    for (const key of STARTER_KEYS) {
      const expectedAria = `${STARTER_LABELS[key]} — ${STARTER_DESCRIPTIONS[key]}`;
      expect(screen.getByLabelText(expectedAria)).toBeInTheDocument();
    }
  });
});
