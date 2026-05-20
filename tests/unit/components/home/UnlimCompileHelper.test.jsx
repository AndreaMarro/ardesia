/**
 * UnlimCompileHelper component tests — iter-99 review MEDIUM follow-up.
 *
 * UnlimCompileHelper (iter 97 atom C) is the right-panel mascot scaffold on
 * the #compile-home route. These tests cover:
 *   - the speech bubble adapts to compileStatus
 *   - the 3 quick-question buttons render ONLY when onAskQuestion is wired
 *     (iter-99 review MEDIUM: no dead UI when the handler is absent)
 *   - clicking a quick question invokes onAskQuestion with the question label
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnlimCompileHelper from '../../../../src/components/home/UnlimCompileHelper.jsx';

describe('UnlimCompileHelper', () => {
  describe('speech bubble', () => {
    it('shows the idle guidance message by default', () => {
      render(<UnlimCompileHelper />);
      expect(screen.getByText(/scrivete il vostro programma/i)).toBeTruthy();
    });

    it('adapts the message to compileStatus="success"', () => {
      render(<UnlimCompileHelper compileStatus="success" />);
      expect(screen.getByText(/Compilazione riuscita/i)).toBeTruthy();
    });

    it('adapts the message to compileStatus="error"', () => {
      render(<UnlimCompileHelper compileStatus="error" />);
      expect(screen.getByText(/errore nel programma/i)).toBeTruthy();
    });
  });

  describe('quick-question buttons (iter-99 MEDIUM: conditional render)', () => {
    it('renders the 3 quick-question buttons when onAskQuestion is wired', () => {
      render(<UnlimCompileHelper onAskQuestion={() => {}} />);
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('invokes onAskQuestion with the question label on click', () => {
      const onAsk = vi.fn();
      render(<UnlimCompileHelper onAskQuestion={onAsk} />);
      fireEvent.click(
        screen.getByRole('button', { name: /Come carico sul Nano R4/i })
      );
      expect(onAsk).toHaveBeenCalledWith('Come carico sul Nano R4?');
    });

    it('renders no quick-question buttons when onAskQuestion is absent (no dead UI)', () => {
      render(<UnlimCompileHelper />);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });
});
