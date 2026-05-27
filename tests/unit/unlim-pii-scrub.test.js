/**
 * unlim-pii-scrub.test.js — Sprint X iter 105.3 P0 (Andrea audit C3 fix)
 *
 * Tests for `supabase/functions/_shared/pii-scrub.ts`.
 *
 * GDPR Art. 8 (minors) test cases: Italian K-12 dialect inputs the audit
 * called out as currently leaking verbatim to `unlim_message_history` /
 * `lesson_contexts` Supabase tables.
 */

import { describe, it, expect } from 'vitest';

import {
  scrubPII,
  scrubPIIWithCounts,
  containsPII,
  PII_SCRUB_VERSION,
} from '../../supabase/functions/_shared/pii-scrub.ts';

// ===========================================================================

describe('PII_SCRUB_VERSION', () => {
  it('0.1 — exports versioned string', () => {
    expect(typeof PII_SCRUB_VERSION).toBe('string');
    expect(PII_SCRUB_VERSION).toMatch(/^\d+\.\d+/);
  });
});

describe('scrubPII — defensive input', () => {
  it('1.1 — null returns empty string', () => {
    expect(scrubPII(null)).toBe('');
  });

  it('1.2 — undefined returns empty string', () => {
    expect(scrubPII(undefined)).toBe('');
  });

  it('1.3 — empty string returns empty', () => {
    expect(scrubPII('')).toBe('');
  });

  it('1.4 — non-string coerces safely', () => {
    expect(scrubPII(42)).toBe('42');
  });

  it('1.5 — clean text passes through unchanged', () => {
    const clean = 'Cosa è un LED?';
    expect(scrubPII(clean)).toBe(clean);
  });
});

describe('Italian phones — PHONE_RE', () => {
  it('2.1 — mobile 333 1234567 redacted', () => {
    expect(scrubPII('chiamami al 333 1234567')).toContain('[REDACTED:PHONE]');
    expect(scrubPII('chiamami al 333 1234567')).not.toContain('333');
  });

  it('2.2 — mobile with dashes 333-123-4567 redacted', () => {
    expect(scrubPII('numero 333-123-4567')).toContain('[REDACTED:PHONE]');
  });

  it('2.3 — international +39 333 1234567 redacted', () => {
    expect(scrubPII('+39 333 1234567')).toContain('[REDACTED:PHONE]');
  });

  it('2.4 — landline 0521 123456 redacted', () => {
    expect(scrubPII('0521 123456')).toContain('[REDACTED:PHONE]');
  });

  it('2.5 — Arduino pin 13 NOT redacted', () => {
    expect(scrubPII('collega al pin 13 di Arduino')).toBe('collega al pin 13 di Arduino');
  });

  it('2.6 — year 2026 NOT redacted (only 4 digits)', () => {
    expect(scrubPII('siamo nel 2026')).toBe('siamo nel 2026');
  });

  it('2.7 — counts mark redactions', () => {
    const { redactions } = scrubPIIWithCounts(
      'numero 333 1234567 e ufficio 0521 987654',
    );
    expect(redactions.phone).toBe(2);
  });
});

describe('Emails — EMAIL_RE', () => {
  it('3.1 — basic email redacted', () => {
    expect(scrubPII('scrivi a mario@example.com')).toContain('[REDACTED:EMAIL]');
    expect(scrubPII('scrivi a mario@example.com')).not.toContain('mario@');
  });

  it('3.2 — Italian TLD email redacted', () => {
    expect(scrubPII('email prof@istituto.it')).toContain('[REDACTED:EMAIL]');
  });

  it('3.3 — email with dots/plus redacted', () => {
    expect(scrubPII('mario.rossi+scuola@gmail.com')).toContain('[REDACTED:EMAIL]');
  });

  it('3.4 — multiple emails counted', () => {
    const { redactions } = scrubPIIWithCounts('a@b.it e c@d.com');
    expect(redactions.email).toBe(2);
  });

  it('3.5 — text without @ not affected', () => {
    expect(scrubPII('mario.rossi senza chiocciola')).not.toContain('[REDACTED:EMAIL]');
  });
});

describe('Codice Fiscale — CF_RE', () => {
  it('4.1 — valid codice fiscale redacted', () => {
    expect(scrubPII('mio CF è RSSMRA90A01H501Z')).toContain(
      '[REDACTED:CODICE_FISCALE]',
    );
    expect(scrubPII('mio CF è RSSMRA90A01H501Z')).not.toContain('RSSMRA');
  });

  it('4.2 — lowercase codice fiscale redacted (case insensitive)', () => {
    expect(scrubPII('rssmra90a01h501z')).toContain('[REDACTED:CODICE_FISCALE]');
  });

  it('4.3 — non-CF 16 chars NOT redacted (wrong structure)', () => {
    // 16 random alphanumeric without CF pattern
    expect(scrubPII('ABCDEFGHIJKLMNOP')).not.toContain('[REDACTED:CODICE_FISCALE]');
  });

  it('4.4 — multiple CFs counted', () => {
    const { redactions } = scrubPIIWithCounts(
      'CF1 RSSMRA90A01H501Z CF2 BNCGNN85B02F205X',
    );
    expect(redactions.codice_fiscale).toBe(2);
  });
});

describe('IBAN — IBAN_RE', () => {
  it('5.1 — Italian IBAN redacted', () => {
    expect(scrubPII('IBAN: IT60X0542811101000000123456')).toContain(
      '[REDACTED:IBAN]',
    );
  });

  it('5.2 — IBAN with spaces redacted', () => {
    expect(scrubPII('IT60 X054 2811 1010 0000 0123 456')).toContain(
      '[REDACTED:IBAN]',
    );
  });

  it('5.3 — ITALY 2026 NOT redacted (not IT + 2 digits)', () => {
    expect(scrubPII('ITALY 2026 fantastico')).not.toContain('[REDACTED:IBAN]');
  });
});

describe('Full name — FULL_NAME_RE', () => {
  it('6.1 — two-word name "Mario Rossi" redacted', () => {
    expect(scrubPII('mi chiamo Mario Rossi')).toContain('[REDACTED:NAME]');
  });

  it('6.2 — three-word name "Mario Carlo Rossi" redacted', () => {
    expect(scrubPII('Mario Carlo Rossi è il professore')).toContain('[REDACTED:NAME]');
  });

  it('6.3 — whitelisted "Arduino Nano" NOT redacted', () => {
    expect(scrubPII('uso Arduino Nano')).toBe('uso Arduino Nano');
  });

  it('6.4 — whitelisted "Volume 1" NOT redacted', () => {
    expect(scrubPII('apri Volume 1')).toBe('apri Volume 1');
  });

  it('6.5 — single name "Mario" NOT redacted (heuristic: needs 2+ words)', () => {
    expect(scrubPII('ciao Mario')).toBe('ciao Mario');
  });

  it('6.6 — multiple names counted', () => {
    const { redactions } = scrubPIIWithCounts('Mario Rossi e Anna Bianchi');
    expect(redactions.full_name).toBe(2);
  });
});

describe('Italian addresses — ADDRESS_RE', () => {
  it('7.1 — "via Roma 5" redacted', () => {
    expect(scrubPII('abito in via Roma 5')).toContain('[REDACTED:ADDRESS]');
  });

  it('7.2 — "Piazza Duomo, 3" redacted', () => {
    expect(scrubPII('mi trovi in Piazza Duomo, 3')).toContain('[REDACTED:ADDRESS]');
  });

  it('7.3 — "Viale Garibaldi 12" redacted', () => {
    expect(scrubPII('Viale Garibaldi 12 Milano')).toContain('[REDACTED:ADDRESS]');
  });

  it('7.4 — no address keyword → no redaction', () => {
    expect(scrubPII('Roma è la capitale')).toBe('Roma è la capitale');
  });
});

describe('Combined inputs — realistic K-12 student message', () => {
  it('8.1 — Andrea audit example: kid types full identity', () => {
    const msg =
      'il mio nome è Mario Rossi, abito in via Roma 5, telefono 333 1234567, mail mario@scuola.it';
    const scrubbed = scrubPII(msg);
    expect(scrubbed).toContain('[REDACTED:NAME]');
    expect(scrubbed).toContain('[REDACTED:ADDRESS]');
    expect(scrubbed).toContain('[REDACTED:PHONE]');
    expect(scrubbed).toContain('[REDACTED:EMAIL]');
    // Original PII gone
    expect(scrubbed).not.toContain('Mario Rossi');
    expect(scrubbed).not.toContain('333 1234567');
    expect(scrubbed).not.toContain('mario@scuola.it');
  });

  it('8.2 — ELAB-only content preserved', () => {
    const msg =
      'Ragazzi, collegate il LED al pin 13 di Arduino Nano come dice Vol 1 cap 6 pag 12.';
    expect(scrubPII(msg)).toBe(msg);
  });

  it('8.3 — counts reflect mixed input', () => {
    const { redactions } = scrubPIIWithCounts(
      'Mario Rossi al 333 1234567 mail mario@b.it CF RSSMRA90A01H501Z',
    );
    expect(redactions.full_name).toBe(1);
    expect(redactions.phone).toBe(1);
    expect(redactions.email).toBe(1);
    expect(redactions.codice_fiscale).toBe(1);
  });

  it('8.4 — idempotent: scrubbing twice produces same result', () => {
    const msg = 'Mario Rossi 333 1234567';
    const once = scrubPII(msg);
    const twice = scrubPII(once);
    expect(twice).toBe(once);
  });
});

describe('containsPII — boolean fast-check', () => {
  it('9.1 — clean message returns false', () => {
    expect(containsPII('Cosa è un LED?')).toBe(false);
  });

  it('9.2 — message with phone returns true', () => {
    expect(containsPII('chiamami al 333 1234567')).toBe(true);
  });

  it('9.3 — null returns false', () => {
    expect(containsPII(null)).toBe(false);
  });

  it('9.4 — empty returns false', () => {
    expect(containsPII('')).toBe(false);
  });
});

describe('Adversarial inputs', () => {
  it('10.1 — 50000-char input does not crash', () => {
    const huge = 'x'.repeat(50000);
    expect(() => scrubPII(huge)).not.toThrow();
  });

  it('10.2 — special unicode chars do not crash', () => {
    expect(() => scrubPII('😀 αβγ Алексей')).not.toThrow();
  });

  it('10.3 — input with only spaces returns unchanged', () => {
    expect(scrubPII('       ')).toBe('       ');
  });
});
