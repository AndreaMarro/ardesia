/**
 * ModalitaSwitch — 3 modes canonical UI tests (Sprint V iter 3 update)
 *
 * Verifica:
 *  • render 3 buttons (percorso + passo-passo + gia-montato)
 *  • 'libero' REMOVED Sprint V iter 3 — merged in 'percorso' (Onniscenza morphic)
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

describe('ModalitaSwitch — 3 modes canonical (Sprint V iter 3)', () => {
  it('renders all 3 modes (percorso + passo-passo + gia-montato)', () => {
    render(<ModalitaSwitch activeMode="percorso" onModeChange={() => {}} />);
    expect(screen.getByTestId('modalita-btn-percorso')).toBeTruthy();
    expect(screen.getByTestId('modalita-btn-passo-passo')).toBeTruthy();
    expect(screen.getByTestId('modalita-btn-gia-montato')).toBeTruthy();
    // 'libero' REMOVED Sprint V iter 3 — merged in 'percorso'
    expect(screen.queryByTestId('modalita-btn-libero')).toBeNull();
  });

  it('exports MODALITA list with exactly 3 canonical modes', () => {
    expect(MODALITA).toEqual(['percorso', 'passo-passo', 'gia-montato']);
    expect(MODALITA).toHaveLength(3);
    // Modes REMOVED:
    expect(MODALITA).not.toContain('guida-da-errore'); // ADR-025 §4.5 iter 26
    expect(MODALITA).not.toContain('libero');           // Sprint V iter 3 merge in percorso
  });

  it('marks active mode with data-active="true" + aria-selected', () => {
    render(<ModalitaSwitch activeMode="gia-montato" onModeChange={() => {}} />);
    const giaMontato = screen.getByTestId('modalita-btn-gia-montato');
    const percorso = screen.getByTestId('modalita-btn-percorso');
    expect(giaMontato.getAttribute('data-active')).toBe('true');
    expect(giaMontato.getAttribute('aria-selected')).toBe('true');
    expect(percorso.getAttribute('data-active')).toBe('false');
  });

  it('calls onModeChange(mode) when button clicked', () => {
    const onModeChange = vi.fn();
    render(<ModalitaSwitch activeMode="percorso" onModeChange={onModeChange} />);
    fireEvent.click(screen.getByTestId('modalita-btn-passo-passo'));
    expect(onModeChange).toHaveBeenCalledWith('passo-passo');
    fireEvent.click(screen.getByTestId('modalita-btn-gia-montato'));
    expect(onModeChange).toHaveBeenCalledWith('gia-montato');
    expect(onModeChange).toHaveBeenCalledTimes(2);
  });

  it('uses Italian K-12 plurale "Ragazzi" labels (Principio Zero V3)', () => {
    render(<ModalitaSwitch activeMode="percorso" onModeChange={() => {}} />);
    // Tooltips MUST contain plural "Ragazzi" (NO singular "tu", "clicca")
    const percorso = screen.getByTestId('modalita-btn-percorso');
    const passoPasso = screen.getByTestId('modalita-btn-passo-passo');
    const giaMontato = screen.getByTestId('modalita-btn-gia-montato');
    expect(percorso.getAttribute('aria-label')).toMatch(/Ragazzi/);
    expect(passoPasso.getAttribute('aria-label')).toMatch(/Ragazzi/);
    expect(giaMontato.getAttribute('aria-label')).toMatch(/Ragazzi/);
    // NO imperative singular like "clicca tu"
    [percorso, passoPasso, giaMontato].forEach((btn) => {
      expect(btn.getAttribute('aria-label')).not.toMatch(/clicca tu/i);
    });
  });

  it('does not render legacy "guida-da-errore" + "libero" affordance', () => {
    render(<ModalitaSwitch activeMode="percorso" onModeChange={() => {}} />);
    expect(screen.queryByTestId('modalita-btn-guida-da-errore')).toBeNull();
    expect(screen.queryByTestId('modalita-btn-libero')).toBeNull();
    expect(screen.queryByText(/guida da errore/i)).toBeNull();
  });

  it('can collapse the large mode switch into a compact restore tab', () => {
    render(<ModalitaSwitch activeMode="percorso" onModeChange={() => {}} />);
    fireEvent.click(screen.getByTestId('modalita-switch-collapse'));

    expect(screen.queryByTestId('modalita-switch')).toBeNull();
    expect(screen.getByTestId('modalita-switch-collapsed')).toHaveTextContent('Percorso');
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
