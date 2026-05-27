/**
 * SessionExportModal — smoke test (Goal B B3)
 *
 * Smoke-only: B5 agent owns the full export/import roundtrip suite.
 * Verifies: render when open, 3 actions present, ESC + backdrop close,
 * Salva su Supabase callback fires.
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionExportModal from '../../../../src/components/lavagna/SessionExportModal.jsx';

describe('SessionExportModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSaveSupabase: vi.fn(),
    currentExperimentId: 'v1-cap6-esp1',
    currentModalita: 'percorso',
  };

  it('does NOT render when isOpen=false', () => {
    const { container } = render(<SessionExportModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with ARIA role + aria-modal when open', () => {
    render(<SessionExportModal {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('renders all 3 action buttons when open', () => {
    render(<SessionExportModal {...baseProps} />);
    // ARIA name comes from aria-label (full plurale italiano)
    expect(screen.getByRole('button', { name: /Salva la sessione su Supabase/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Esporta la sessione come file JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Importa una sessione da file JSON/i })).toBeInTheDocument();
  });

  it('calls onSaveSupabase when "Salva su Supabase" clicked', () => {
    const onSaveSupabase = vi.fn();
    render(<SessionExportModal {...baseProps} onSaveSupabase={onSaveSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: /Salva la sessione su Supabase/i }));
    expect(onSaveSupabase).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on ESC key', () => {
    const onClose = vi.fn();
    render(<SessionExportModal {...baseProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on explicit close button click', () => {
    const onClose = vi.fn();
    render(<SessionExportModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Chiudi/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click (outside content)', () => {
    const onClose = vi.fn();
    render(<SessionExportModal {...baseProps} onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
