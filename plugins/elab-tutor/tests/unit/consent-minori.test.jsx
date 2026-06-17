/**
 * ELAB Tutor — Test Consenso Minori (GDPR Art. 8)
 * Verifica il workflow di consenso per minori 8-14 anni (soglia Italia: 14)
 *
 * Test cases:
 * 1. Minore (10 anni) senza consenso parentale -> banner visibile, flusso parentale
 * 2. Minore (10 anni) con consenso parentale verificato -> banner nascosto
 * 3. Adulto (16 anni) accetta -> banner nascosto, consent='accepted'
 * 4. Adulto (16 anni) rifiuta -> banner nascosto, consent='rejected'
 * 5. Eta esattamente 14 -> trattato come adulto (>=14)
 * 6. Nessuna eta selezionata -> non puo procedere oltre age gate
 * 7. Email invalida nel flusso parentale -> mostra errore
 * 8. Email valida nel flusso parentale -> transizione a fase 'sent'
 *
 * © Andrea Marro — 29/03/2026
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock showToast prima dell'import del componente
vi.mock('../../src/components/common/Toast', () => ({
  showToast: vi.fn(),
}));

// Mock CSS module
vi.mock('../../src/components/common/ConsentBanner.module.css', () => ({
  default: new Proxy({}, { get: (_, prop) => prop }),
}));

// Mock gdprService — named exports + default
const mockSaveConsent = vi.fn(() => true);
const mockGetConsent = vi.fn(() => null);
const mockIsCOPPAApplicable = vi.fn((age) => age < 13);
const mockRequestParentalConsent = vi.fn(() => Promise.resolve({ success: true }));

vi.mock('../../src/services/gdprService', () => ({
  saveConsent: (...args) => mockSaveConsent(...args),
  getConsent: (...args) => mockGetConsent(...args),
  isCOPPAApplicable: (...args) => mockIsCOPPAApplicable(...args),
  default: {
    saveConsent: (...args) => mockSaveConsent(...args),
    getConsent: (...args) => mockGetConsent(...args),
    isCOPPAApplicable: (...args) => mockIsCOPPAApplicable(...args),
    requestParentalConsent: (...args) => mockRequestParentalConsent(...args),
    verifyParentalConsent: vi.fn(),
    hasValidConsent: vi.fn(),
    requiresParentalConsent: vi.fn(),
  },
}));

import ConsentBanner from '../../src/components/common/ConsentBanner';

describe('ConsentBanner — GDPR Art. 8 Minor Consent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConsent.mockReturnValue(null);
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockClear();
    sessionStorage.getItem.mockReturnValue(null);
    sessionStorage.setItem.mockClear();
  });

  // ── Test 1: Minore senza consenso parentale ──
  it('minore (10 anni) senza consenso parentale — mostra flusso parentale', () => {
    render(<ConsentBanner />);

    // Fase age: banner visibile con selettore eta
    expect(screen.getByText('Quanti anni hai?')).toBeInTheDocument();

    // Seleziona 10 anni
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10' } });

    // Clicca Avanti
    fireEvent.click(screen.getByText('Avanti'));

    // Deve mostrare flusso parentale (fase 'parental')
    expect(screen.getByText(/serve il permesso di un genitore/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nome@email.com')).toBeInTheDocument();
    expect(screen.getByText('Chiedi al genitore')).toBeInTheDocument();

    // L'eta deve essere salvata in sessionStorage
    expect(sessionStorage.setItem).toHaveBeenCalledWith('elab_user_age', '10');
  });

  // ── Test 2: Minore con consenso parentale verificato ──
  it('minore (10 anni) con consenso verificato — banner nascosto', () => {
    mockGetConsent.mockReturnValue({
      status: 'parental_verified',
      age: 10,
      verifiedAt: '2026-03-29T10:00:00.000Z',
    });

    const { container } = render(<ConsentBanner />);

    // Banner non deve essere visibile (consent gia verificato)
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(screen.queryByText('Quanti anni hai?')).toBeNull();
  });

  // ── Test 3: Adulto (16) accetta ──
  it('adulto (16 anni) accetta — banner nascosto, consent=accepted', () => {
    render(<ConsentBanner />);

    // Seleziona 16 anni
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '16' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Deve mostrare fase consent standard
    expect(screen.getByText('Accetto')).toBeInTheDocument();
    expect(screen.getByText('Rifiuto')).toBeInTheDocument();

    // Clicca Accetto
    fireEvent.click(screen.getByText('Accetto'));

    // saveConsent deve essere chiamato con status 'accepted'
    expect(mockSaveConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'accepted',
        age: 16,
        analyticsAnonymized: true,
      })
    );

    // localStorage deve avere consent='accepted'
    expect(localStorage.setItem).toHaveBeenCalledWith('elab_consent_v2', 'accepted');

    // Banner non piu visibile
    expect(screen.queryByText('Accetto')).toBeNull();
  });

  // ── Test 4: Adulto (16) rifiuta ──
  it('adulto (16 anni) rifiuta — banner nascosto, consent=rejected', () => {
    render(<ConsentBanner />);

    // Seleziona 16 e procedi
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '16' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Clicca Rifiuto
    fireEvent.click(screen.getByText('Rifiuto'));

    // saveConsent con status 'rejected'
    expect(mockSaveConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'rejected',
        age: 16,
      })
    );

    expect(localStorage.setItem).toHaveBeenCalledWith('elab_consent_v2', 'rejected');
    expect(screen.queryByText('Rifiuto')).toBeNull();
  });

  // ── Test 5: Eta esattamente 14 = adulto ──
  it('eta 14 — trattato come adulto (>=14), mostra consent standard', () => {
    render(<ConsentBanner />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '14' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Deve mostrare fase consent, NON fase parental
    expect(screen.getByText('Accetto')).toBeInTheDocument();
    expect(screen.queryByText(/serve il permesso di un genitore/i)).toBeNull();
  });

  // ── Test 6: Nessuna eta selezionata ──
  it('nessuna eta selezionata — bottone Avanti disabilitato', () => {
    render(<ConsentBanner />);

    const btn = screen.getByText('Avanti');
    expect(btn).toBeDisabled();

    // Non deve poter procedere
    fireEvent.click(btn);
    expect(screen.getByText('Quanti anni hai?')).toBeInTheDocument();
  });

  // ── Test 7: Email invalida nel flusso parentale ──
  it('email invalida — mostra errore, non invia', () => {
    render(<ConsentBanner />);

    // Seleziona 10 anni e procedi
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Inserisci email invalida
    const emailInput = screen.getByPlaceholderText('nome@email.com');
    fireEvent.change(emailInput, { target: { value: 'nonemail' } });
    fireEvent.click(screen.getByText('Chiedi al genitore'));

    // Deve mostrare errore
    expect(screen.getByText(/non sembra corretta/i)).toBeInTheDocument();

    // requestParentalConsent non deve essere stato chiamato
    expect(mockRequestParentalConsent).not.toHaveBeenCalled();
  });

  // ── Test 8: Email valida — transizione a fase 'sent' ──
  it('email valida — invia richiesta e mostra conferma', async () => {
    mockRequestParentalConsent.mockResolvedValueOnce({ success: true });

    render(<ConsentBanner />);

    // Seleziona 10 anni e procedi
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Inserisci email valida
    const emailInput = screen.getByPlaceholderText('nome@email.com');
    fireEvent.change(emailInput, { target: { value: 'genitore@email.com' } });
    fireEvent.click(screen.getByText('Chiedi al genitore'));

    // Aspetta la transizione
    await waitFor(() => {
      expect(screen.getByText(/Abbiamo mandato un'email/i)).toBeInTheDocument();
    });

    // Deve mostrare l'email mascherata
    expect(screen.getByText(/ge\*+@email\.com/)).toBeInTheDocument();

    // saveConsent deve essere stato chiamato con 'parental_required'
    expect(mockSaveConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'parental_required',
        age: 10,
        parentEmail: 'genitore@email.com',
      })
    );
  });

  // ── Test 9: Email vuota mostra errore specifico ──
  it('email vuota — mostra messaggio inserisci email', () => {
    render(<ConsentBanner />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '9' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Clicca senza inserire email
    fireEvent.click(screen.getByText('Chiedi al genitore'));
    expect(screen.getByText(/Inserisci l'email/i)).toBeInTheDocument();
  });

  // ── Test 10: Utente ritornante con consenso 'parental_sent' ──
  it('utente ritornante con parental_sent — mostra fase sent', () => {
    mockGetConsent.mockReturnValue({
      status: 'parental_sent',
      childAge: 10,
      parentEmail: 'papa@email.com',
      sentAt: '2026-03-29T10:00:00.000Z',
    });

    render(<ConsentBanner />);

    // Deve mostrare la fase di conferma
    expect(screen.getByText(/Abbiamo mandato un'email/i)).toBeInTheDocument();
  });

  // ── Test 11: Eta 13 (sotto soglia 14 Italia) = minore ──
  it('eta 13 — trattato come minore, mostra flusso parentale', () => {
    render(<ConsentBanner />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '13' } });
    fireEvent.click(screen.getByText('Avanti'));

    // Deve mostrare flusso parentale
    expect(screen.getByText(/serve il permesso di un genitore/i)).toBeInTheDocument();
    expect(screen.queryByText('Accetto')).toBeNull();
  });
});
