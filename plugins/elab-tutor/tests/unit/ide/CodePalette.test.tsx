import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import CodePalette from '../../../src/components/ide/CodePalette/CodePalette';
import { PALETTE_ACTIONS } from '../../../src/components/ide/CodePalette/paletteActions';
import { PALETTE_SNIPPET_MIME } from '../../../src/components/ide/CodePalette/DragDropHandler';

function makeDataTransfer() {
  const store = new Map<string, string>();
  return {
    effectAllowed: '',
    setData: vi.fn((type: string, value: string) => store.set(type, value)),
    getData: vi.fn((type: string) => store.get(type) || ''),
  };
}

describe('CodePalette', () => {
  it('defines exactly 9 Arduino actions in Italian', () => {
    expect(PALETTE_ACTIONS).toHaveLength(9);
    expect(PALETTE_ACTIONS.map((action) => action.label)).toEqual([
      'Accendi LED',
      'Spegni LED',
      'Attendi',
      'Configura pin',
      'Leggi pulsante',
      'Scrivi PWM',
      'Leggi analogico',
      'Stampa seriale',
      'Ripeti ciclo',
    ]);
  });

  it('every action has a stable id, category, description and Arduino snippet', () => {
    for (const action of PALETTE_ACTIONS) {
      expect(action.id).toMatch(/^[a-z0-9-]+$/);
      expect(action.category).toBeTruthy();
      expect(action.description).toBeTruthy();
      expect(action.snippet).toMatch(/;|\{|\}/);
    }
  });

  it('renders the palette as a complementary region with Italian title', () => {
    render(<CodePalette />);

    expect(screen.getByRole('complementary', { name: 'Palette azioni Arduino' })).toBeInTheDocument();
    expect(screen.getByText('Azioni Arduino')).toBeInTheDocument();
  });

  it('renders all actions as draggable buttons', () => {
    render(<CodePalette />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
    for (const button of buttons) {
      expect(button).toHaveAttribute('draggable', 'true');
    }
  });

  it('shows concise snippets for scanning', () => {
    render(<CodePalette />);

    expect(screen.getByText('digitalWrite(13, HIGH);')).toBeInTheDocument();
    expect(screen.getByText('delay(500);')).toBeInTheDocument();
  });

  it('drag start writes custom palette MIME before fallback text/plain', () => {
    render(<CodePalette />);
    const dt = makeDataTransfer();

    fireEvent.dragStart(screen.getByRole('button', { name: /Accendi LED/i }), { dataTransfer: dt });

    expect(dt.setData).toHaveBeenNthCalledWith(1, PALETTE_SNIPPET_MIME, expect.stringContaining('digitalWrite(13, HIGH);'));
    expect(dt.setData).toHaveBeenNthCalledWith(2, 'text/plain', expect.stringContaining('digitalWrite(13, HIGH);'));
    expect(dt.effectAllowed).toBe('copy');
  });

  it('marks the dragged action while drag is active and clears it on drag end', () => {
    render(<CodePalette />);
    const button = screen.getByRole('button', { name: /Spegni LED/i });

    fireEvent.dragStart(button, { dataTransfer: makeDataTransfer() });
    expect(button).toHaveAttribute('data-dragging', 'true');

    fireEvent.dragEnd(button);
    expect(button).not.toHaveAttribute('data-dragging');
  });

  it('clicking an action calls onInsertSnippet with that snippet', () => {
    const onInsertSnippet = vi.fn();
    render(<CodePalette onInsertSnippet={onInsertSnippet} />);

    fireEvent.click(screen.getByRole('button', { name: /Attendi/i }));

    expect(onInsertSnippet).toHaveBeenCalledWith(expect.stringContaining('delay(500);'));
  });

  it('clicking an action dispatches the global insert event for tablet fallback', () => {
    const listener = vi.fn();
    window.addEventListener('elab:insert-palette-snippet', listener);
    render(<CodePalette />);

    fireEvent.click(screen.getByRole('button', { name: /Stampa seriale/i }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail.snippet).toContain('Serial.println');
    window.removeEventListener('elab:insert-palette-snippet', listener);
  });

  it('groups actions by category labels', () => {
    render(<CodePalette />);

    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('Tempo')).toBeInTheDocument();
    expect(screen.getByText('Input')).toBeInTheDocument();
  });

  it('keeps each action label and description in the same card', () => {
    render(<CodePalette />);

    const button = screen.getByRole('button', { name: /Leggi analogico/i });
    expect(within(button).getByText('Leggi analogico')).toBeInTheDocument();
    expect(within(button).getByText(/valore da A0/i)).toBeInTheDocument();
  });
});
