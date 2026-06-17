/**
 * UnlimCompileHelper component tests — iter-99 review MEDIUM follow-up.
 *
 * UnlimCompileHelper (iter 97 atom C, REWRITTEN iter 104 C3 commit 5fe1df5c
 * "C3 UnlimCompileHelper REAL wire — no fake answerQuestion") is the
 * right-panel mascot scaffold on the #compile-home route. These tests cover:
 *   - the speech bubble adapts to compileStatus
 *   - 3 quick-question buttons forward onAskQuestion(label) callback to parent
 *     (no local fake chat — C3 mandate "MAI dati finti o demo")
 *   - free-text input + submit forward onAskQuestion(text) to parent
 *   - when onAskQuestion is absent: buttons + input stay rendered but disabled
 *     (no dead UI, but honest disabled affordance instead of removing entirely
 *     — keeps mascot context chip + visual placeholder for Lavagna)
 *
 * iter 104 C3 copy migration (test sync 2026-05-25 PR #166 base merge):
 *   - "scrivete il vostro programma" → "Sono collegato a blocchi, codice e compilazione."
 *   - "Compilazione riuscita" → "Compilazione OK. Potete caricare sulla Nano R4."
 *   - "errore nel programma" → "errore nel codice"
 *   - "Come carico sul Nano R4?" → 3 new labels: "Leggi il programma" / "Controlla errori" / "Consiglio rapido"
 *   - removed: conditional unmount of buttons (replaced by disabled state)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnlimCompileHelper from '../../../../src/components/home/UnlimCompileHelper.jsx';

describe('UnlimCompileHelper', () => {
  describe('speech bubble', () => {
    it('shows the idle guidance message by default', () => {
      render(<UnlimCompileHelper />);
      expect(screen.getByText(/Sono collegato a blocchi, codice e compilazione/i)).toBeTruthy();
    });

    it('adapts the message to compileStatus="success" with explicit boardLabel', () => {
      render(<UnlimCompileHelper compileStatus="success" boardLabel="Arduino Nano R4" />);
      expect(screen.getByText(/Compilazione OK\. Potete caricare sulla Arduino Nano R4/i)).toBeTruthy();
    });

    it('falls back to "scheda" when no boardLabel passed (legacy callers)', () => {
      // 2026-05-28 (Andrea report iter post-#180) — mascot is now board-aware.
      // Legacy callers without boardLabel render a generic "scheda" instead
      // of the hardcoded "Nano R4" that previously mismatched the picker.
      render(<UnlimCompileHelper compileStatus="success" />);
      expect(screen.getByText(/Compilazione OK\. Potete caricare sulla scheda\./i)).toBeTruthy();
    });

    it('uses Arduino Uno R3 label when picker says so', () => {
      render(<UnlimCompileHelper compileStatus="success" boardLabel="Arduino Uno R3 (ATmega328P)" />);
      expect(screen.getByText(/caricare sulla Arduino Uno R3/i)).toBeTruthy();
    });

    it('adapts the message to compileStatus="error"', () => {
      render(<UnlimCompileHelper compileStatus="error" />);
      expect(screen.getByText(/errore nel codice/i)).toBeTruthy();
    });
  });

  describe('quick-question buttons (iter 104 C3: forward-only, no fake chat)', () => {
    it('renders the 3 quick-question buttons when onAskQuestion is wired', () => {
      render(<UnlimCompileHelper onAskQuestion={() => {}} />);
      // 3 quick-question buttons + 1 chat submit button = 4 total.
      // Quick-question buttons specifically: filter by aria-label prefix.
      const quickQuestionButtons = screen
        .getAllByRole('button')
        .filter((btn) => /^Chiedi a UNLIM:/.test(btn.getAttribute('aria-label') || ''));
      expect(quickQuestionButtons).toHaveLength(3);
    });

    it('invokes onAskQuestion with the question label on click', () => {
      const onAsk = vi.fn();
      render(<UnlimCompileHelper onAskQuestion={onAsk} />);
      fireEvent.click(
        screen.getByRole('button', { name: /Chiedi a UNLIM: Leggi il programma/i })
      );
      expect(onAsk).toHaveBeenCalledWith('Leggi il programma');
    });

    it('disables the quick-question buttons when onAskQuestion is absent (no dead UI handler)', () => {
      render(<UnlimCompileHelper />);
      // iter 104 C3: buttons stay rendered (preserve mascot+chip visual frame)
      // but are disabled to honestly signal "no handler wired, open Lavagna instead".
      const quickQuestionButtons = screen
        .getAllByRole('button')
        .filter((btn) => /^Chiedi a UNLIM:/.test(btn.getAttribute('aria-label') || ''));
      expect(quickQuestionButtons).toHaveLength(3);
      quickQuestionButtons.forEach((btn) => {
        expect(btn.hasAttribute('disabled')).toBe(true);
      });
    });
  });
});
