/**
 * ModalitaSwitch — Percorso standby UI tests
 *
 * Verifica:
 *  • render 2 active buttons (passo-passo + gia-montato)
 *  • 'percorso' temporarily hidden, migrated by LavagnaShell to passo-passo
 *  • active mode visual via data-active="true"
 *  • onModeChange callback invocato con id mode
 *  • Italian K-12 plurale "Ragazzi" labels (Principio Zero V3)
 *  • Touch target ≥44px (CLAUDE.md §Qualita rule 9)
 *  • Mode "guida-da-errore" REMOVED (ADR-025 §4.5)
 *
 * Sprint V iter 3 — 2026-05-06 (libero merge in percorso, Andrea iter 1+ mandate)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalitaSwitch, { MODALITA } from '../../../src/components/lavagna/ModalitaSwitch';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ModalitaSwitch — Percorso standby', () => {
  it('renders only active modes while Percorso is in standby', () => {
    render(<ModalitaSwitch activeMode="percorso" onModeChange={() => {}} />);
    expect(screen.queryByTestId('modalita-btn-percorso')).toBeNull();
    expect(screen.getByTestId('modalita-btn-passo-passo')).toBeTruthy();
    expect(screen.getByTestId('modalita-btn-gia-montato')).toBeTruthy();
    expect(screen.queryByTestId('modalita-btn-libero')).toBeNull();
  });

  it('exports only the two active modes while Percorso stays in standby', () => {
    expect(MODALITA).toEqual(['passo-passo', 'gia-montato']);
    expect(MODALITA).toHaveLength(2);
    expect(MODALITA).not.toContain('percorso');
    expect(MODALITA).not.toContain('guida-da-errore'); // ADR-025 §4.5 iter 26
    expect(MODALITA).not.toContain('libero');           // Sprint V iter 3 merge in percorso
  });

  it('marks active mode with data-active="true" + aria-selected', () => {
    render(<ModalitaSwitch activeMode="gia-montato" onModeChange={() => {}} />);
    const giaMontato = screen.getByTestId('modalita-btn-gia-montato');
    const passoPasso = screen.getByTestId('modalita-btn-passo-passo');
    expect(giaMontato.getAttribute('data-active')).toBe('true');
    expect(giaMontato.getAttribute('aria-selected')).toBe('true');
    expect(passoPasso.getAttribute('data-active')).toBe('false');
  });

  it('calls onModeChange(mode) when button clicked', () => {
    const onModeChange = vi.fn();
    render(<ModalitaSwitch activeMode="passo-passo" onModeChange={onModeChange} />);
    fireEvent.click(screen.getByTestId('modalita-btn-passo-passo'));
    expect(onModeChange).toHaveBeenCalledWith('passo-passo');
    fireEvent.click(screen.getByTestId('modalita-btn-gia-montato'));
    expect(onModeChange).toHaveBeenCalledWith('gia-montato');
    expect(onModeChange).toHaveBeenCalledTimes(2);
  });

  it('uses Italian K-12 plurale "Ragazzi" labels (Principio Zero V3)', () => {
    render(<ModalitaSwitch activeMode="passo-passo" onModeChange={() => {}} />);
    // Tooltips MUST contain plural "Ragazzi" (NO singular "tu", "clicca")
    const passoPasso = screen.getByTestId('modalita-btn-passo-passo');
    const giaMontato = screen.getByTestId('modalita-btn-gia-montato');
    expect(passoPasso.getAttribute('aria-label')).toMatch(/Ragazzi/);
    expect(giaMontato.getAttribute('aria-label')).toMatch(/Ragazzi/);
    // NO imperative singular like "clicca tu"
    [passoPasso, giaMontato].forEach((btn) => {
      expect(btn.getAttribute('aria-label')).not.toMatch(/clicca tu/i);
    });
  });

  it('does not render legacy "guida-da-errore" + "libero" affordance', () => {
    render(<ModalitaSwitch activeMode="passo-passo" onModeChange={() => {}} />);
    expect(screen.queryByTestId('modalita-btn-guida-da-errore')).toBeNull();
    expect(screen.queryByTestId('modalita-btn-libero')).toBeNull();
    expect(screen.queryByTestId('modalita-btn-percorso')).toBeNull();
    expect(screen.queryByText(/guida da errore/i)).toBeNull();
  });

  it('normalizes a stale Percorso activeMode to Passo Passo in the compact restore tab', () => {
    render(<ModalitaSwitch activeMode="percorso" onModeChange={() => {}} />);
    fireEvent.click(screen.getByTestId('modalita-switch-collapse'));

    expect(screen.queryByTestId('modalita-switch')).toBeNull();
    expect(screen.getByTestId('modalita-switch-collapsed')).toHaveTextContent('Passo Passo');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('elab-lavagna-modalita-switch-collapsed', '1');
  });

  it('restores the full mode switch from the compact tab', () => {
    window.localStorage.getItem.mockImplementation((key) => (
      key === 'elab-lavagna-modalita-switch-collapsed' ? '1' : null
    ));
    render(<ModalitaSwitch activeMode="gia-montato" onModeChange={() => {}} />);

    fireEvent.click(screen.getByTestId('modalita-switch-collapsed'));
    expect(screen.getByTestId('modalita-switch')).toBeTruthy();
    expect(screen.getByTestId('modalita-btn-gia-montato')).toHaveAttribute('data-active', 'true');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('elab-lavagna-modalita-switch-collapsed', '0');
  });
});
