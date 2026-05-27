/**
 * UnlimChatPanel component tests — Wave 2b Impl-E (TDD red→green).
 *
 * UnlimChatPanel is a NEW floating full-chat surface extracted from
 * UnlimCompileHelper as part of the Wave 2 X.3b split:
 *  - UnlimCompileHelper.jsx → mini banner ONLY (mascot + speech bubble +
 *    "Open full chat" CTA + 3 quick-question buttons forwarding to parent
 *    via onAskQuestion callback — preserve iter 104 C3 export contract)
 *  - UnlimChatPanel.jsx (NEW) → floating chat window with RAG Blockly-aware
 *    retrieval + Vision trigger phrase "guarda il mio circuito" wire
 *
 * UNLIM language rules (Andrea Principio Zero non-negotiable):
 *  - IT plurale ("Ragazzi,")
 *  - Cita Vol/pag verbatim ("Volume 3 pag 47 — ...")
 *  - MAX 120 parole per UNLIM response
 *  - Mai "Galileo" → solo "UNLIM"
 *
 * Tests verify (TDD red→green):
 *  1. Mount renders chat surface with mascot + input + send button
 *  2. RAG Blockly-aware retrieval: keyword "digitalWrite" triggers RAG search
 *     and surfaces volume citation (Vol N pag X) verbatim in response
 *  3. Vision trigger phrase "guarda il mio circuito" → calls
 *     window.__ELAB_API.unlim.captureScreenshot() and emits a Vision tag in
 *     the in-progress UNLIM message (the trigger detection step, not the
 *     full Gemini round-trip which is mocked)
 *  4. IT plurale + word cap honored in canned UNLIM "preparing" message
 *
 * © Andrea Marro — Wave 2 X.3b Impl-E — 2026-05-25
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnlimChatPanel from '../../../../src/components/home/UnlimChatPanel.jsx';

describe('UnlimChatPanel', () => {
  beforeEach(() => {
    // Default no-op Vision API for tests that DON'T exercise the Vision path.
    // Tests that test Vision attach their own spy explicitly.
    if (typeof window !== 'undefined') {
      window.__ELAB_API = {
        unlim: {
          captureScreenshot: vi.fn().mockResolvedValue(null),
        },
      };
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      delete window.__ELAB_API;
    }
    vi.restoreAllMocks();
  });

  describe('mount', () => {
    it('renders the chat surface with input + send button when open', () => {
      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      expect(screen.getByRole('textbox', { name: /scrivi a unlim/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /invia a unlim/i })).toBeTruthy();
    });

    it('does not render when isOpen is false (closed state)', () => {
      const { container } = render(<UnlimChatPanel isOpen={false} onClose={() => {}} />);
      // The panel root should NOT be in the DOM when closed.
      expect(container.querySelector('[aria-label="Chat completa UNLIM"]')).toBeNull();
    });

    it('uses "UNLIM" never "Galileo" in any visible label', () => {
      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const body = document.body.textContent || '';
      expect(/galileo/i.test(body)).toBe(false);
      expect(/unlim/i.test(body)).toBe(true);
    });
  });

  describe('RAG Blockly-aware retrieval', () => {
    it('surfaces a volume citation (Vol N pag X) when user asks about a Blockly block keyword', async () => {
      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const input = screen.getByRole('textbox', { name: /scrivi a unlim/i });
      fireEvent.change(input, { target: { value: 'come uso digitalWrite?' } });
      fireEvent.click(screen.getByRole('button', { name: /invia a unlim/i }));

      // UNLIM should respond with at least one canonical volume citation pulled
      // from RAG (rag-chunks.json schema has `volume: 1|2|3` per chunk; `page`
      // field is not present on current 549-chunk dataset, citation format
      // therefore degrades to "Volume N — <excerpt>" which is the Principio
      // Zero verbatim contract).
      await waitFor(() => {
        const messages = screen.getAllByRole('listitem', { name: /messaggio/i });
        const unlimMsgs = messages.filter((m) => m.getAttribute('data-author') === 'unlim');
        expect(unlimMsgs.length).toBeGreaterThan(0);
        const lastUnlimText = unlimMsgs[unlimMsgs.length - 1].textContent || '';
        // Citation format: "Volume X — ..." (with optional "pag Y" when page
        // metadata is present; the test accepts both forms).
        expect(/Vol(ume)?\s+\d+/i.test(lastUnlimText)).toBe(true);
      }, { timeout: 4000 });
    });

    it('matches Blockly block keywords (digitalWrite, pinMode, delay) from registry-aware search', async () => {
      // Spy on the RAG search service to ensure we route through it
      // when the input contains a known Blockly keyword.
      const ragModule = await import('../../../../src/data/unlim-knowledge-base.js');
      const ragSpy = vi.spyOn(ragModule, 'searchRAGChunks');

      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const input = screen.getByRole('textbox', { name: /scrivi a unlim/i });
      fireEvent.change(input, { target: { value: 'cosa fa pinMode?' } });
      fireEvent.click(screen.getByRole('button', { name: /invia a unlim/i }));

      await waitFor(() => {
        expect(ragSpy).toHaveBeenCalled();
        const calledWith = ragSpy.mock.calls[0][0];
        // Either the raw message OR a Blockly-keyword-expanded query
        expect(typeof calledWith).toBe('string');
        expect(calledWith.toLowerCase()).toContain('pinmode');
      }, { timeout: 4000 });
    });
  });

  describe('Vision wire — "guarda il mio circuito" trigger', () => {
    it('calls window.__ELAB_API.unlim.captureScreenshot when the trigger phrase is sent', async () => {
      const captureSpy = vi.fn().mockResolvedValue('data:image/png;base64,FAKE');
      window.__ELAB_API = { unlim: { captureScreenshot: captureSpy } };

      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const input = screen.getByRole('textbox', { name: /scrivi a unlim/i });
      fireEvent.change(input, { target: { value: 'guarda il mio circuito per favore' } });
      fireEvent.click(screen.getByRole('button', { name: /invia a unlim/i }));

      await waitFor(() => {
        expect(captureSpy).toHaveBeenCalled();
      }, { timeout: 4000 });
    });

    it('emits a Vision tag in the in-progress UNLIM message when the trigger fires', async () => {
      const captureSpy = vi.fn().mockResolvedValue('data:image/png;base64,FAKE');
      window.__ELAB_API = { unlim: { captureScreenshot: captureSpy } };

      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const input = screen.getByRole('textbox', { name: /scrivi a unlim/i });
      fireEvent.change(input, { target: { value: 'guarda il mio circuito' } });
      fireEvent.click(screen.getByRole('button', { name: /invia a unlim/i }));

      await waitFor(() => {
        // Look for a visible Vision indicator (badge OR data-vision attr OR
        // explicit text token like "[VISION]" / "Sto guardando").
        const messages = screen.getAllByRole('listitem', { name: /messaggio/i });
        const unlimMsgs = messages.filter((m) => m.getAttribute('data-author') === 'unlim');
        expect(unlimMsgs.length).toBeGreaterThan(0);
        const last = unlimMsgs[unlimMsgs.length - 1];
        const hasVisionAttr = last.hasAttribute('data-vision');
        const text = last.textContent || '';
        const hasVisionText = /vision|sto guardando|screenshot/i.test(text);
        expect(hasVisionAttr || hasVisionText).toBe(true);
      }, { timeout: 4000 });
    });
  });

  describe('UNLIM language rules — IT plurale + max 120 parole', () => {
    it('uses IT plurale ("Ragazzi" / "Potete" / "Vediamo") in any canned UNLIM message', async () => {
      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const input = screen.getByRole('textbox', { name: /scrivi a unlim/i });
      fireEvent.change(input, { target: { value: 'ciao' } });
      fireEvent.click(screen.getByRole('button', { name: /invia a unlim/i }));

      await waitFor(() => {
        const messages = screen.getAllByRole('listitem', { name: /messaggio/i });
        const unlimMsgs = messages.filter((m) => m.getAttribute('data-author') === 'unlim');
        expect(unlimMsgs.length).toBeGreaterThan(0);
        const allText = unlimMsgs.map((m) => m.textContent || '').join(' ');
        // At least one canonical plural marker must appear in any UNLIM message
        expect(/ragazzi|potete|vediamo|provate|ascoltate|controllate/i.test(allText)).toBe(true);
      }, { timeout: 4000 });
    });

    it('keeps any UNLIM canned message under 120 words', async () => {
      render(<UnlimChatPanel isOpen onClose={() => {}} />);
      const input = screen.getByRole('textbox', { name: /scrivi a unlim/i });
      fireEvent.change(input, { target: { value: 'aiuto' } });
      fireEvent.click(screen.getByRole('button', { name: /invia a unlim/i }));

      await waitFor(() => {
        const messages = screen.getAllByRole('listitem', { name: /messaggio/i });
        const unlimMsgs = messages.filter((m) => m.getAttribute('data-author') === 'unlim');
        expect(unlimMsgs.length).toBeGreaterThan(0);
        unlimMsgs.forEach((m) => {
          const wordCount = (m.textContent || '').trim().split(/\s+/).filter(Boolean).length;
          expect(wordCount).toBeLessThanOrEqual(120);
        });
      }, { timeout: 4000 });
    });
  });
});
