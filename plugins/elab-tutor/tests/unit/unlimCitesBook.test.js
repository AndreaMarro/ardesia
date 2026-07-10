import { describe, it, expect } from 'vitest';
import {
  alreadyCitesBook,
  buildCitationSuffix,
  ensureBookCitation,
  shouldAppendBookCitation,
} from '../../src/services/bookCitation';

describe('bookCitation — UNLIM cites the ELAB book for known experiments', () => {
  // ── alreadyCitesBook ────────────────────────────
  describe('alreadyCitesBook', () => {
    it('detects "pagina N"', () => {
      expect(alreadyCitesBook('Come dice il libro a pagina 29, il LED...')).toBe(true);
    });

    it('detects "pag. N"', () => {
      expect(alreadyCitesBook('Vedi pag. 45 del volume.')).toBe(true);
    });

    it('does not accept "Vol. N" without an exact page', () => {
      expect(alreadyCitesBook('Nel Vol. 2 trovi il transistor.')).toBe(false);
    });

    it('detects complete volume + page citations', () => {
      expect(alreadyCitesBook('Il volume 3 a pagina 18 parla di Arduino.')).toBe(true);
    });

    it('detects the V1P45 shorthand used by RAG citations', () => {
      expect(alreadyCitesBook('[V1P45] Il fotoresistore...')).toBe(true);
    });

    it('returns false when no citation is present', () => {
      expect(alreadyCitesBook('Il LED si accende quando la corrente scorre.')).toBe(false);
    });

    it('returns false for non-string input (defensive)', () => {
      expect(alreadyCitesBook(null)).toBe(false);
      expect(alreadyCitesBook(undefined)).toBe(false);
      expect(alreadyCitesBook(42)).toBe(false);
      expect(alreadyCitesBook({})).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(alreadyCitesBook('VOLUME 1 pagina 10')).toBe(true);
      expect(alreadyCitesBook('Pagina 10 del libro')).toBe(true);
    });
  });

  // ── buildCitationSuffix ─────────────────────────
  describe('buildCitationSuffix', () => {
    it('returns a formatted "(Riferimento: Vol. N, pag. M del libro ELAB.)" for a known experiment', () => {
      // v1-cap6-esp1 → volume 1 page 29 per volume-references.js
      const suffix = buildCitationSuffix('v1-cap6-esp1');
      expect(suffix).toBe('(Riferimento: Vol. 1, pag. 29 del libro ELAB.)');
    });

    it('returns null for an unknown experiment id', () => {
      expect(buildCitationSuffix('unknown-xyz')).toBeNull();
    });

    it('returns null for null/undefined input', () => {
      expect(buildCitationSuffix(null)).toBeNull();
      expect(buildCitationSuffix(undefined)).toBeNull();
    });
  });

  // ── ensureBookCitation ──────────────────────────
  describe('ensureBookCitation', () => {
    it('passes through when no experimentId', () => {
      expect(ensureBookCitation('Il LED si accende.', null)).toBe('Il LED si accende.');
      expect(ensureBookCitation('Il LED si accende.', undefined)).toBe('Il LED si accende.');
      expect(ensureBookCitation('Il LED si accende.', '')).toBe('Il LED si accende.');
    });

    it('passes through when the reply already cites the book', () => {
      const reply = 'Come dice il libro a pagina 29, il LED è come una porta.';
      expect(ensureBookCitation(reply, 'v1-cap6-esp1')).toBe(reply);
    });

    it('appends citations for conceptual explanations tied to a known experiment', () => {
      const reply = 'Il LED si accende quando la corrente scorre dal + al -.';
      const out = ensureBookCitation(reply, 'v1-cap6-esp1');
      expect(out).toBe(`${reply}\n(Riferimento: Vol. 1, pag. 29 del libro ELAB.)`);
      expect(alreadyCitesBook(out)).toBe(true);
    });

    it('does not append citations to short confirmations', () => {
      const out = ensureBookCitation('Perfetto!', 'v1-cap6-esp1');
      expect(out).toBe('Perfetto!');
    });

    it('appends citations to book-grounded diagnosis or direct instructions', () => {
      const out = ensureBookCitation('Controlla il verso del LED', 'v1-cap6-esp1');
      expect(out).toBe('Controlla il verso del LED\n(Riferimento: Vol. 1, pag. 29 del libro ELAB.)');
      expect(alreadyCitesBook(out)).toBe(true);
    });

    it('does not append citations to hidden action-tag responses', () => {
      const reply = 'Apro il semaforo e compilo il codice.\n[AZIONE:loadexp:v3-cap6-semaforo]\n[AZIONE:compile]';
      expect(ensureBookCitation(reply, 'v3-cap6-led-blink')).toBe(reply);
    });

    it('does not crash on non-string input (pass-through)', () => {
      expect(ensureBookCitation(null, 'v1-cap6-esp1')).toBeNull();
      expect(ensureBookCitation(undefined, 'v1-cap6-esp1')).toBeUndefined();
      expect(ensureBookCitation(42, 'v1-cap6-esp1')).toBe(42);
    });

    it('handles unknown experimentId defensively', () => {
      const reply = 'Ciao ragazzi!';
      expect(ensureBookCitation(reply, 'unknown-id-xyz')).toBe(reply);
    });

    it('separates class replies from confirmations/action payloads instead of citing everything', () => {
      const replies = [
        ['Il LED si accende quando la corrente fluisce.', true],
        ['La resistenza è come un tubo stretto per la corrente.', true],
        ['digitalWrite(13, HIGH) mette il pin 13 a 5V e accende il LED.', true],
        ['Prova a girare il LED: la gamba lunga va verso il +.', true],
        ['Controlla il collegamento della breadboard.', true],
        ['Il circuito è pronto, ora compila il codice!', true],
        ['Perfetto! Adesso il LED dovrebbe lampeggiare.', true],
        ['[AZIONE:compile]', false],
        ['Apro il semaforo.\n[AZIONE:loadexp:v3-cap6-semaforo]', false],
      ];
      for (const [reply, expected] of replies) {
        const out = ensureBookCitation(reply, 'v1-cap6-esp1');
        expect(alreadyCitesBook(out)).toBe(expected);
      }
    });

    it('exposes the citation decision as a small, testable policy', () => {
      expect(shouldAppendBookCitation('La corrente scorre dal positivo al negativo.')).toBe(true);
      expect(shouldAppendBookCitation('Compilo il codice adesso.')).toBe(true);
      expect(shouldAppendBookCitation('Perfetto!')).toBe(false);
      expect(shouldAppendBookCitation('[AZIONE:compile]')).toBe(false);
    });
  });
});
