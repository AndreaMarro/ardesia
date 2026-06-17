// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ModalitaSwitch from '../../../src/components/lavagna/ModalitaSwitch.jsx';

function mockStorageEntries(entries) {
  window.localStorage.getItem.mockImplementation((key) => entries[key] ?? null);
}

describe('ModalitaSwitch — Percorso in standby', () => {
  // HIGH-G fix (Phase 1 sub-iter 83.6): reset localStorage mock state to prevent leak
  // to subsequent specs in vitest fork worker.
  afterEach(() => {
    if (typeof window !== 'undefined' && window.localStorage?.getItem?.mockReset) {
      window.localStorage.getItem.mockReset();
      window.localStorage.getItem.mockReturnValue(null);
    }
  });

  it('espone data-stato-sessione runtime sullo switch senza mostrare Percorso', () => {
    render(
      <ModalitaSwitch
        activeMode="passo-passo"
        onModeChange={vi.fn()}
        sessionState="verifica"
      />
    );

    expect(screen.getByTestId('modalita-switch')).toHaveAttribute('data-stato-sessione', 'verifica');
    expect(screen.queryByTestId('modalita-btn-percorso')).toBeNull();
  });

  it('legge il cue morfico da localStorage quando LavagnaShell non passa props', () => {
    mockStorageEntries({ 'elab-percorso-session-state': 'costruzione' });
    render(<ModalitaSwitch activeMode="passo-passo" onModeChange={vi.fn()} />);

    expect(screen.getByTestId('modalita-switch')).toHaveAttribute('data-stato-sessione', 'costruzione');
    expect(screen.queryByTestId('modalita-btn-percorso')).toBeNull();
  });

  it('non forza Percorso dentro availableModes mentre e in standby', () => {
    mockStorageEntries({
      'elab-teacher-anon-uuid': 'teacher-a',
      'elab-morphic-teacher-profile:teacher-a': JSON.stringify({ experience: 'expert' }),
    });

    render(
      <ModalitaSwitch
        activeMode="percorso"
        availableModes={['gia-montato']}
        onModeChange={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('tab');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Già Montato');
    expect(screen.queryByTestId('modalita-btn-percorso')).toBeNull();
  });
});
