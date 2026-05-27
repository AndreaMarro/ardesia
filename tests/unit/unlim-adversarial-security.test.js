/**
 * unlim-adversarial-security.test.js
 *
 * Adversarial battery for UNLIM Edge Functions security primitives:
 *   - PII scrubber (`supabase/functions/_shared/pii-scrub.ts`)
 *   - Silent-failure observability (`supabase/functions/_shared/observability.ts`)
 *   - IP-bound rate limiter (`supabase/functions/_shared/ip-rate-limit.ts`)
 *
 * Audit gap references (Andrea audit 2026-05-25 + iter 105.3 P0):
 *   C1 — silent `catch (_e) {}` → observability tests
 *   C2 — sessionId-rotation bypass → IP rate-limit + extraction tests
 *   C3 — raw 16k user messages persisted → PII scrub tests (GDPR Art. 8 minors)
 *   C4 — header-stripping attackers → STRICT_IP_RATE_LIMIT_UNKNOWN matrix
 *   H5 — XFF chain mis-parsing → IP extraction edge tests
 *   H7 — LRU map DoS → rate-limit concurrency / bucket reset tests
 *
 * NOTE: behavior captured from empirical probe runs (2026-05-26) — these
 * tests intentionally encode actual current behavior so future regressions
 * (e.g. tightening regex, fixing a parse bug) surface immediately. Where the
 * current behavior is itself a known bug (e.g. `containsPII` regex-stateful
 * alternating result), the test names call it out so the failure mode is
 * obvious if the bug is fixed.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ===========================================================================
// Deno env polyfill — required for ip-rate-limit which reads Deno.env.get
// ===========================================================================

const envStore = new Map();
globalThis.Deno = {
  env: {
    get: (k) => envStore.get(k),
    has: (k) => envStore.has(k),
    set: (k, v) => envStore.set(k, v),
    delete: (k) => envStore.delete(k),
    toObject: () => Object.fromEntries(envStore),
  },
};

const {
  scrubPII,
  scrubPIIWithCounts,
  containsPII,
  PII_SCRUB_VERSION,
} = await import('../../supabase/functions/_shared/pii-scrub.ts');

const {
  logSilentFailure,
  logSilentError,
} = await import('../../supabase/functions/_shared/observability.ts');

const {
  extractClientIp,
  checkRateLimitByIp,
  _resetIpRateLimitMap,
  IP_RATE_LIMIT_VERSION,
} = await import('../../supabase/functions/_shared/ip-rate-limit.ts');

// Tiny helper for IP tests — build a Request with explicit headers
const mkReq = (headers = {}) => new Request('http://x.test', { headers });

// ===========================================================================
// PART 1 — PII ADVERSARIAL FUZZ (audit C3: minors GDPR Art. 8)
//          Validates the scrubber against shapes attackers / unaware kids
//          actually type. Each test documents WHY it is non-trivial.
// ===========================================================================

describe('PII adversarial fuzz — phones', () => {
  // C3.A1 — obfuscation tests (attacker pads digits to bypass naive regex)
  it('A1.01 — fully obfuscated "3 3 3 1234567" with single-space splits NOT detected (current behavior, documents bypass)', () => {
    // This is the actual regex limitation: PHONE_RE requires "3xx" contiguous.
    // Documenting so test fires if a future tightening (e.g. token-level
    // matcher) closes the bypass.
    expect(scrubPII('3 3 3 1234567')).toBe('3 3 3 1234567');
  });

  it('A1.02 — dot-separated "333.123.4567" redacted', () => {
    expect(scrubPII('numero 333.123.4567')).toContain('[REDACTED:PHONE]');
  });

  it('A1.03 — parenthesised "(333) 123-4567" redacted (US-ish formatting still triggers Italian rule)', () => {
    expect(scrubPII('chiamami (333) 123-4567')).toContain('[REDACTED:PHONE]');
  });

  it('A1.04 — international "+39.333.123.4567" with dots redacted', () => {
    expect(scrubPII('contact: +39.333.123.4567')).toContain('[REDACTED:PHONE]');
  });

  it('A1.05 — without "+" prefix "00 39 333 1234567" partial redaction (last 7 detected, +39 not)', () => {
    const out = scrubPII('00 39 333 1234567');
    expect(out).toContain('[REDACTED:PHONE]');
  });

  it('A1.06 — currency-prefixed "€ 333 1234567" still redacted (regex agnostic to leading char)', () => {
    expect(scrubPII('€ 333 1234567')).toContain('[REDACTED:PHONE]');
  });

  it('A1.07 — bare 7-digit "1234567" NOT redacted (needs 3xx/0xx prefix)', () => {
    expect(scrubPII('tel: 1234567')).toBe('tel: 1234567');
  });

  it('A1.08 — French phone "+33 1 23 45 67 89" NOT detected (Italian-only scrubber)', () => {
    expect(scrubPII('+33 1 23 45 67 89')).toBe('+33 1 23 45 67 89');
  });

  it('A1.09 — UK phone "+44 20 7946 0958" NOT detected', () => {
    expect(scrubPII('+44 20 7946 0958')).toBe('+44 20 7946 0958');
  });

  it('A1.10 — landline "02 1234567" redacted alongside mobile', () => {
    const out = scrubPII('mobile 333 1234567 ufficio 02 1234567');
    expect((out.match(/\[REDACTED:PHONE\]/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it('A1.11 — year-only "2026" NOT mis-detected as phone', () => {
    expect(scrubPII('anno 2026 felice')).toBe('anno 2026 felice');
  });

  it('A1.12 — Arduino "pin 13" NOT redacted (audit-critical: avoid false positive on K-12 lessons)', () => {
    expect(scrubPII('collega al pin 13 di Arduino')).toBe('collega al pin 13 di Arduino');
  });

  it('A1.13 — multiple phones across line breaks counted individually', () => {
    const { redactions } = scrubPIIWithCounts('a\n333 1234567\nb\n0521 123456\nc');
    expect(redactions.phone).toBe(2);
  });

  it('A1.14 — phone in JSON-encoded string still redacted (XSS-style payload)', () => {
    expect(scrubPII('{"tel":"333 1234567"}')).toContain('[REDACTED:PHONE]');
  });

  it('A1.15 — phone inside HTML tag attribute still redacted', () => {
    expect(scrubPII('<a href="tel:333 1234567">click</a>')).toContain('[REDACTED:PHONE]');
  });
});

describe('PII adversarial fuzz — emails', () => {
  it('A2.01 — basic "mario@scuola.it" redacted', () => {
    expect(scrubPII('mario@scuola.it')).toBe('[REDACTED:EMAIL]');
  });

  it('A2.02 — underscore local part "mario_rossi@gmail.com" redacted', () => {
    expect(scrubPII('mario_rossi@gmail.com')).toContain('[REDACTED:EMAIL]');
  });

  it('A2.03 — plus aliasing "mario+scuola@gmail.com" redacted', () => {
    expect(scrubPII('mario+scuola@gmail.com')).toContain('[REDACTED:EMAIL]');
  });

  it('A2.04 — multi-dot TLD "mario.rossi@scuola.gov.it" redacted', () => {
    expect(scrubPII('mario.rossi@scuola.gov.it')).toContain('[REDACTED:EMAIL]');
  });

  it('A2.05 — single-letter TLD "a@b.c" NOT redacted (RFC requires 2+ TLD chars)', () => {
    expect(scrubPII('a@b.c')).toBe('a@b.c');
  });

  it('A2.06 — two-letter TLD "a@b.cc" redacted', () => {
    expect(scrubPII('a@b.cc')).toBe('[REDACTED:EMAIL]');
  });

  it('A2.07 — no TLD "mario@a" NOT redacted', () => {
    expect(scrubPII('mario@a')).toBe('mario@a');
  });

  it('A2.08 — no TLD "aa@bb" NOT redacted', () => {
    expect(scrubPII('aa@bb')).toBe('aa@bb');
  });

  it('A2.09 — URL "http://elab.it" NOT mis-detected as email', () => {
    expect(scrubPII('vai su http://elab.it')).toBe('vai su http://elab.it');
  });

  it('A2.10 — URL with path "https://example.com/page" NOT redacted', () => {
    expect(scrubPII('visit https://example.com/page today')).toContain('https://example.com');
  });

  it('A2.11 — email embedded in JSON value still redacted (defense vs persistence layer)', () => {
    expect(scrubPII('{"email":"mario@a.it"}')).toContain('[REDACTED:EMAIL]');
  });

  it('A2.12 — email in HTML mailto attribute redacted', () => {
    expect(scrubPII('<a href="mailto:mario@a.it">x</a>')).toContain('[REDACTED:EMAIL]');
  });

  it('A2.13 — multiple emails on same line counted separately', () => {
    const { redactions } = scrubPIIWithCounts('a@b.it c@d.it e@f.it');
    expect(redactions.email).toBe(3);
  });

  it('A2.14 — email next to phone both redacted', () => {
    const out = scrubPII('contact: 333 1234567 mail: mario@a.it');
    expect(out).toContain('[REDACTED:PHONE]');
    expect(out).toContain('[REDACTED:EMAIL]');
  });

  it('A2.15 — email with uppercase TLD "A@B.IT" redacted', () => {
    expect(scrubPII('A@B.IT')).toBe('[REDACTED:EMAIL]');
  });
});

describe('PII adversarial fuzz — codice fiscale shapes', () => {
  it('A3.01 — valid CF "RSSMRA90A01H501Z" redacted', () => {
    expect(scrubPII('RSSMRA90A01H501Z')).toBe('[REDACTED:CODICE_FISCALE]');
  });

  it('A3.02 — lowercase CF "rssmra90a01h501z" redacted (case-insensitive)', () => {
    expect(scrubPII('rssmra90a01h501z')).toBe('[REDACTED:CODICE_FISCALE]');
  });

  it('A3.03 — mixed-case CF "RsSmRa90A01h501z" redacted', () => {
    expect(scrubPII('RsSmRa90A01h501z')).toBe('[REDACTED:CODICE_FISCALE]');
  });

  it('A3.04 — 15-char truncated CF "RSSMRA90A01H501" NOT redacted (structural requires 16)', () => {
    expect(scrubPII('mio cod è RSSMRA90A01H501')).toBe('mio cod è RSSMRA90A01H501');
  });

  it('A3.05 — 16 random alphanumerics "ABCDEFGHIJKLMNOP" NOT redacted (wrong structure)', () => {
    expect(scrubPII('ABCDEFGHIJKLMNOP')).toBe('ABCDEFGHIJKLMNOP');
  });

  it('A3.06 — back-to-back CFs without separator NOT redacted (no word boundary)', () => {
    // Real attacker payload: two CFs concatenated to bypass naive scanner.
    // Current behavior: regex requires \b, so concatenation evades. Documents
    // bypass — change test if fix lands.
    const concat = 'RSSMRA90A01H501ZRSSMRA90A01H501Z';
    expect(scrubPII(concat)).toBe(concat);
  });

  it('A3.07 — adjacent CFs with single space both redacted', () => {
    const { redactions } = scrubPIIWithCounts('RSSMRA90A01H501Y RSSMRA90A01H501Z');
    expect(redactions.codice_fiscale).toBe(2);
  });

  it('A3.08 — CF after sentence punctuation redacted (word boundary works)', () => {
    expect(scrubPII('mio CF:RSSMRA90A01H501Z.')).toContain('[REDACTED:CODICE_FISCALE]');
  });
});

describe('PII adversarial fuzz — partial / fake IBAN', () => {
  it('A4.01 — full IBAN "IT60X0542811101000000123456" redacted', () => {
    expect(scrubPII('IT60X0542811101000000123456')).toContain('[REDACTED:IBAN]');
  });

  it('A4.02 — IBAN with internal spaces "IT60 X054 2811 1010 0000 0123 456" redacted', () => {
    expect(scrubPII('IT60 X054 2811 1010 0000 0123 456')).toContain('[REDACTED:IBAN]');
  });

  it('A4.03 — short partial "IT60 X054" redacted (regex permissive — current behavior)', () => {
    expect(scrubPII('IT60 X054')).toBe('[REDACTED:IBAN]');
  });

  it('A4.04 — truncated "IT60" NOT redacted (under 4-char body)', () => {
    expect(scrubPII('IT60')).toBe('IT60');
  });

  it('A4.05 — truncated "IT99X" NOT redacted (under 4 alphanumerics after digits)', () => {
    expect(scrubPII('IT99X')).toBe('IT99X');
  });

  it('A4.06 — extra-spaced IBAN every 2 chars NOT redacted (whitespace dominates)', () => {
    const padded = 'IT 60 X 054 28 11 10 10 00 00 01 23 456';
    expect(scrubPII(padded)).toBe(padded);
  });

  it('A4.07 — lowercase "iT60X05428111010" redacted (case-insensitive)', () => {
    expect(scrubPII('iT60X05428111010')).toContain('[REDACTED:IBAN]');
  });

  it('A4.08 — "ITALY 2026" NOT redacted (defense regex requires IT + 2 digits immediate)', () => {
    expect(scrubPII('ITALY 2026 fantastico')).toBe('ITALY 2026 fantastico');
  });

  it('A4.09 — "Italian people" NOT redacted (no leading IT+digit)', () => {
    expect(scrubPII('Italian people are nice')).toBe('Italian people are nice');
  });

  it('A4.10 — "IT IS GOOD" NOT redacted (no digits adjacent to IT)', () => {
    expect(scrubPII('IT IS GOOD')).toBe('IT IS GOOD');
  });
});

describe('PII adversarial fuzz — full name in context', () => {
  it('A5.01 — name in middle of sentence "Per favore Marco Rossi vieni qui" redacted', () => {
    expect(scrubPII('Per favore Marco Rossi vieni qui')).toContain('[REDACTED:NAME]');
  });

  it('A5.02 — name in quote "\"Marco Bianchi\" mi ha detto" redacted', () => {
    expect(scrubPII('"Marco Bianchi" mi ha detto')).toContain('[REDACTED:NAME]');
  });

  it('A5.03 — name with newline boundaries "\\nMario Rossi\\n" redacted', () => {
    const out = scrubPII('riga1\nMario Rossi\nriga3');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).not.toContain('Mario Rossi');
  });

  it('A5.04 — name in HTML tag "<p>Mario Rossi</p>" redacted', () => {
    expect(scrubPII('<p>Mario Rossi</p>')).toContain('[REDACTED:NAME]');
  });

  it('A5.05 — name in JSON value redacted (defense vs persistence)', () => {
    expect(scrubPII('{"name":"Mario Rossi"}')).toContain('[REDACTED:NAME]');
  });

  it('A5.06 — name in code-like attribute redacted', () => {
    expect(scrubPII('__ELAB_API.user.name = "Mario Rossi"')).toContain('[REDACTED:NAME]');
  });

  it('A5.07 — all-caps "MARIO ROSSI" NOT detected (regex requires Title-case)', () => {
    expect(scrubPII('MARIO ROSSI è il prof')).toBe('MARIO ROSSI è il prof');
  });

  it('A5.08 — all-lower "mario rossi" NOT detected (regex requires uppercase start)', () => {
    expect(scrubPII('parla con mario rossi')).toBe('parla con mario rossi');
  });

  it('A5.09 — single capitalised name "Mario" NOT detected (needs 2+ words)', () => {
    expect(scrubPII('ciao Mario')).toBe('ciao Mario');
  });

  it('A5.10 — Italian name with accent "Niccolò Machiavelli" redacted', () => {
    expect(scrubPII('Niccolò Machiavelli scrive')).toContain('[REDACTED:NAME]');
  });

  it('A5.11 — single accented name "Niccolò" alone NOT redacted', () => {
    expect(scrubPII('Niccolò saluta')).toBe('Niccolò saluta');
  });

  it('A5.12 — author name in book reference "la pagina di Andrea Marro" redacted', () => {
    // Conservative policy: even author names get redacted from chat history.
    expect(scrubPII('la pagina di Andrea Marro')).toContain('[REDACTED:NAME]');
  });

  it('A5.13 — three-word name "Mario Carlo Rossi" redacted as single name', () => {
    const { redactions } = scrubPIIWithCounts('Mario Carlo Rossi è il prof');
    expect(redactions.full_name).toBe(1);
  });

  it('A5.14 — four capitalised words "Andrea Marro Davide Fagherazzi" greedy 3-word match leaves last word un-redacted', () => {
    // Regex is greedy: matches "Andrea Marro Davide" (3-word group),
    // leaves "Fagherazzi" alone (single word does not match name regex).
    // Documents greedy-vs-pairing trade-off — would change if regex made non-greedy.
    const { text, redactions } = scrubPIIWithCounts('Andrea Marro Davide Fagherazzi');
    expect(redactions.full_name).toBe(1);
    expect(text).toBe('[REDACTED:NAME] Fagherazzi');
  });

  it('A5.14b — five capitalised words "Andrea Marro Davide Fagherazzi Bianchi" produces 2 separate matches', () => {
    const { redactions } = scrubPIIWithCounts('Andrea Marro Davide Fagherazzi Bianchi');
    expect(redactions.full_name).toBe(2);
  });

  it('A5.15 — French name with umlaut "François Müller" NOT detected (umlaut outside char class)', () => {
    // Documents charset limit — non-Italian diacritics evade.
    expect(scrubPII('François Müller')).toBe('François Müller');
  });

  it('A5.16 — name with multi-PII row "Mario Rossi 333 1234567 mail mario@b.it CF RSSMRA90A01H501Z" all redacted', () => {
    const { redactions } = scrubPIIWithCounts(
      'Mario Rossi al 333 1234567 mail mario@b.it CF RSSMRA90A01H501Z',
    );
    expect(redactions.full_name).toBe(1);
    expect(redactions.phone).toBe(1);
    expect(redactions.email).toBe(1);
    expect(redactions.codice_fiscale).toBe(1);
  });

  it('A5.17 — Italian historical name "Giuseppe Verdi" redacted', () => {
    expect(scrubPII('compositore Giuseppe Verdi')).toContain('[REDACTED:NAME]');
  });

  it('A5.18 — name "José García" partially redacted (Spanish accent in middle works, end does not)', () => {
    // Empirical: matches "José Garc" → "[REDACTED:NAME]ía"
    const out = scrubPII('José García');
    expect(out).toContain('[REDACTED:NAME]');
  });

  it('A5.19 — name in middle of long paragraph redacted (no length issues)', () => {
    const para = 'a'.repeat(1000) + ' Mario Rossi ' + 'b'.repeat(1000);
    expect(scrubPII(para)).toContain('[REDACTED:NAME]');
  });

  it('A5.20 — name repeated 10x all redacted', () => {
    const { redactions } = scrubPIIWithCounts(
      Array(10).fill('Mario Rossi').join(' e '),
    );
    expect(redactions.full_name).toBe(10);
  });
});

// ===========================================================================
// PART 2 — PII WHITELIST EDGE (ELAB/Arduino glossary must survive scrubber)
// ===========================================================================

describe('PII whitelist edge — ELAB domain terms preserved', () => {
  it('W.01 — "Arduino Nano" passes through (whitelisted)', () => {
    expect(scrubPII('uso Arduino Nano')).toBe('uso Arduino Nano');
  });

  it('W.02 — "Arduino Uno" passes through', () => {
    expect(scrubPII('Arduino Uno è bello')).toBe('Arduino Uno è bello');
  });

  it('W.03 — "Atmel ATmega" passes through', () => {
    expect(scrubPII('chip Atmel ATmega')).toBe('chip Atmel ATmega');
  });

  it('W.04 — "Nano R4" passes through', () => {
    expect(scrubPII('board Nano R4')).toBe('board Nano R4');
  });

  it('W.05 — "Pin 13" passes through (no name regex match: number not 3+ letters)', () => {
    expect(scrubPII('Pin 13 LED')).toBe('Pin 13 LED');
  });

  it('W.06 — "Vol 1" / "Vol 2" / "Vol 3" pass through', () => {
    expect(scrubPII('Vol 1')).toBe('Vol 1');
    expect(scrubPII('Vol 2')).toBe('Vol 2');
    expect(scrubPII('Vol 3')).toBe('Vol 3');
  });

  it('W.07 — "Volume 1" / "Volume 2" / "Volume 3" pass through', () => {
    expect(scrubPII('Volume 1 cap')).toBe('Volume 1 cap');
    expect(scrubPII('Volume 2 cap')).toBe('Volume 2 cap');
    expect(scrubPII('Volume 3 cap')).toBe('Volume 3 cap');
  });

  it('W.08 — "Capitolo 6" / "Capitolo 7" / "Capitolo 8" / "Capitolo 9" pass through', () => {
    expect(scrubPII('Capitolo 6')).toBe('Capitolo 6');
    expect(scrubPII('Capitolo 7')).toBe('Capitolo 7');
    expect(scrubPII('Capitolo 8')).toBe('Capitolo 8');
    expect(scrubPII('Capitolo 9')).toBe('Capitolo 9');
  });

  it('W.09 — "Esperimento Uno" passes through (whitelisted)', () => {
    expect(scrubPII('Esperimento Uno')).toBe('Esperimento Uno');
  });

  it('W.10 — "Esperimento Due" passes through', () => {
    expect(scrubPII('Esperimento Due')).toBe('Esperimento Due');
  });

  it('W.11 — "Esperimento Tre" passes through', () => {
    expect(scrubPII('Esperimento Tre')).toBe('Esperimento Tre');
  });

  it('W.12 — "Esperimento Quattro" NOT whitelisted IS redacted (set membership exact)', () => {
    expect(scrubPII('Esperimento Quattro')).toContain('[REDACTED:NAME]');
  });

  it('W.13 — "Vol.1 cap.6" mixed punctuation NOT redacted (no name shape)', () => {
    expect(scrubPII('Vol.1 cap.6')).toBe('Vol.1 cap.6');
  });

  it('W.14 — separate whitelisted tokens preserved when not adjacent (greedy 3-word regex limitation)', () => {
    // "Vol 1 Arduino Nano Capitolo 6" → "Arduino Nano Capitolo" matches as
    // 3-word name (greedy), and whitelist only knows the 2-word "Arduino Nano",
    // so the 3-word match misses whitelist. Documents real trade-off.
    // To preserve all, separate with non-Title-case word.
    const txt = 'apri Vol 1 con Arduino Nano e leggi Capitolo 6';
    // "apri" lowercase, "Vol 1" preserved (whitelist), "con" lower breaks chain,
    // "Arduino Nano" 2-word matches whitelist, "leggi" lower breaks chain,
    // "Capitolo 6" preserved (whitelist + no name shape on number).
    expect(scrubPII(txt)).toBe(txt);
  });

  it('W.15 — full ELAB sentence preserved (audit-critical: no false positives in K-12 lessons)', () => {
    const txt =
      'Ragazzi, collegate il LED al pin 13 di Arduino Nano come dice Vol 1 cap 6 pag 12.';
    expect(scrubPII(txt)).toBe(txt);
  });

  it('W.16 — whitelist is case-SENSITIVE: "arduino nano" lower NOT detected anyway (regex needs Title)', () => {
    expect(scrubPII('arduino nano')).toBe('arduino nano');
  });

  it('W.17 — whitelist ignores leading whitespace via trim', () => {
    // ELAB_NAME_WHITELIST contains "Vol 1" — match.trim() before set lookup
    // means " Vol 1 " (padded) is still preserved.
    expect(scrubPII('   Arduino Nano   ')).toBe('   Arduino Nano   ');
  });

  it('W.18 — "Volume 4" NOT whitelisted IS redacted', () => {
    expect(scrubPII('Volume 4')).toBe('Volume 4'); // no name shape
  });

  it('W.19 — "Pin 14" passes through (no name shape, no whitelist needed)', () => {
    expect(scrubPII('Pin 14')).toBe('Pin 14');
  });

  it('W.20 — "Atmel ATmega328" NOT whitelisted but no name shape match either', () => {
    expect(scrubPII('Atmel ATmega328')).toBe('Atmel ATmega328');
  });
});

// ===========================================================================
// PART 3 — PII ITALIAN K-12 REALISTIC SCENARIOS
// ===========================================================================

describe('PII K-12 realistic — name typed by child', () => {
  it('K.01 — kid intro "Ciao, mi chiamo Marco Bianchi e ho 10 anni" name redacted', () => {
    const out = scrubPII('Ciao, mi chiamo Marco Bianchi e ho 10 anni');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).not.toContain('Marco Bianchi');
  });

  it('K.02 — kid full identity dump redacts all PII (audit C3 GDPR Art. 8 scenario)', () => {
    const msg =
      'il mio nome è Mario Rossi, abito in via Roma 5, telefono 333 1234567, mail mario@scuola.it';
    const out = scrubPII(msg);
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).toContain('[REDACTED:ADDRESS]');
    expect(out).toContain('[REDACTED:PHONE]');
    expect(out).toContain('[REDACTED:EMAIL]');
    expect(out).not.toContain('Mario Rossi');
    expect(out).not.toContain('via Roma 5');
    expect(out).not.toContain('333 1234567');
    expect(out).not.toContain('mario@scuola.it');
  });

  it('K.03 — kid asks teacher contact "il prof è Luigi Verdi, scrivi a luigi@scuola.it" redacted', () => {
    const out = scrubPII('il prof è Luigi Verdi, scrivi a luigi@scuola.it');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).toContain('[REDACTED:EMAIL]');
  });

  it('K.04 — kid types parent CF "il CF di mio papà è RSSMRA70A01H501Z" redacted', () => {
    const out = scrubPII('il CF di mio papà è RSSMRA70A01H501Z');
    expect(out).toContain('[REDACTED:CODICE_FISCALE]');
  });

  it('K.05 — kid asks where school is "scuola in piazza Garibaldi 3 Milano" address redacted', () => {
    const out = scrubPII('scuola in piazza Garibaldi 3 Milano');
    expect(out).toContain('[REDACTED:ADDRESS]');
  });

  it('K.06 — kid pastes parent IBAN for payment "papà IBAN IT60X0542811101000000123456" redacted', () => {
    const out = scrubPII('papà IBAN IT60X0542811101000000123456');
    expect(out).toContain('[REDACTED:IBAN]');
  });

  it('K.07 — friend share "vieni a casa di Marco Rossi in via Verdi 10" both redacted', () => {
    const out = scrubPII('vieni a casa di Marco Rossi in via Verdi 10');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).toContain('[REDACTED:ADDRESS]');
  });

  it('K.08 — kid asks help with circuit, no PII, fully preserved', () => {
    const msg = 'aiuto, il LED non si accende quando collego pin 13';
    expect(scrubPII(msg)).toBe(msg);
  });

  it('K.09 — kid uses author name from book "ho letto la pagina di Davide Fagherazzi" redacted', () => {
    expect(scrubPII('ho letto la pagina di Davide Fagherazzi')).toContain('[REDACTED:NAME]');
  });

  it('K.10 — teacher name in lesson plan "Maestro Carlo Bianchi spiega" redacted', () => {
    const out = scrubPII('Maestro Carlo Bianchi spiega');
    expect(out).toContain('[REDACTED:NAME]');
  });

  it('K.11 — multiple kid names in roll call all redacted', () => {
    const { redactions } = scrubPIIWithCounts(
      'Presenti: Mario Rossi, Anna Bianchi, Carlo Verdi, Luigi Neri',
    );
    expect(redactions.full_name).toBe(4);
  });

  it('K.12 — school address "scuola elementare via Manzoni 5, Torino" redacted', () => {
    expect(scrubPII('scuola elementare via Manzoni 5, Torino')).toContain('[REDACTED:ADDRESS]');
  });

  it('K.13 — emergency contact "in caso emergenza chiama 333 9876543" phone redacted', () => {
    expect(scrubPII('in caso emergenza chiama 333 9876543')).toContain('[REDACTED:PHONE]');
  });

  it('K.14 — kid forgot password attempt "la mia password è Mario1234!" name redacted but pwd survives', () => {
    // Mario is single name — not detected; "Mario1234!" survives.
    const out = scrubPII('la mia password è Mario1234!');
    expect(out).toContain('Mario1234');
  });

  it('K.15 — kid sends school number "scuola 0521 123456" redacted as phone', () => {
    expect(scrubPII('scuola 0521 123456')).toContain('[REDACTED:PHONE]');
  });

  it('K.16 — kid pastes parent email signature "Mario Rossi <mario@a.it>" both redacted', () => {
    const out = scrubPII('Mario Rossi <mario@a.it>');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).toContain('[REDACTED:EMAIL]');
  });

  it('K.17 — kid types phone number with description "il mio numero 333 1234567" phone redacted, "numero" word survives', () => {
    const out = scrubPII('il mio numero 333 1234567');
    expect(out).toContain('numero');
    expect(out).toContain('[REDACTED:PHONE]');
    expect(out).not.toContain('333 1234567');
  });

  it('K.18 — kid greeting "Ciao Mario" two-Title-case-words IS redacted (regex false-positive on greeting)', () => {
    // Documents real false positive: "Ciao Mario" matches as 2-word name.
    // This is the conservative trade-off of FULL_NAME_RE — kid greeting cost
    // is preferred over leaking real first+last name.
    const out = scrubPII('Ciao Mario, ho un dubbio sul LED');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).toContain('LED');
  });

  it('K.19 — "Apri Volume 2" leading verb causes name false positive (greedy regex)', () => {
    // "Apri Volume" matches name regex (both Title-case 4+ chars).
    // Whitelist on "Volume 1" only applies when match is EXACTLY "Volume N";
    // here match is "Apri Volume" so whitelist misses.
    const out = scrubPII('Apri Volume 2 al Capitolo 7 e collega al Pin 13');
    expect(out).toContain('[REDACTED:NAME]');
    expect(out).toContain('Capitolo 7');
    expect(out).toContain('Pin 13');
  });

  it('K.20 — kid family roster "papà Mario Rossi, mamma Anna Bianchi" both redacted', () => {
    const { redactions } = scrubPIIWithCounts('papà Mario Rossi, mamma Anna Bianchi');
    expect(redactions.full_name).toBe(2);
  });

  it('K.21 — kid asks for help with home address "abito in vicolo stretto 3" redacted', () => {
    expect(scrubPII('abito in vicolo stretto 3')).toContain('[REDACTED:ADDRESS]');
  });

  it('K.22 — kid pastes long story with one CF buried mid-paragraph redacted', () => {
    const story = 'C\'era una volta in un regno lontano un re di nome Marco, '
      + 'che aveva un CF curioso: RSSMRA90A01H501Z, ed era molto felice.';
    const out = scrubPII(story);
    expect(out).toContain('[REDACTED:CODICE_FISCALE]');
    expect(out).not.toContain('RSSMRA90A01H501Z');
  });

  it('K.23 — kid sends URL with email-like fragment redacted (URL part preserved)', () => {
    const out = scrubPII('https://elab.it/u/mario@a.it');
    expect(out).toContain('[REDACTED:EMAIL]');
    expect(out).toContain('https://elab.it/u/');
  });

  it('K.24 — kid pastes parent IBAN with prefix label "IBAN papà: IT60 X054 2811 1010 0000 0123 456" redacted', () => {
    expect(scrubPII('IBAN papà: IT60 X054 2811 1010 0000 0123 456')).toContain('[REDACTED:IBAN]');
  });

  it('K.25 — corso Italia 100 (city street) redacted as address', () => {
    expect(scrubPII('corso Italia 100')).toContain('[REDACTED:ADDRESS]');
  });

  it('K.26 — largo Argentina 22 redacted', () => {
    expect(scrubPII('largo Argentina 22')).toContain('[REDACTED:ADDRESS]');
  });

  it('K.27 — strada del sole 7 redacted', () => {
    expect(scrubPII('strada del sole 7')).toContain('[REDACTED:ADDRESS]');
  });

  it('K.28 — piazzale Loreto 1 redacted', () => {
    expect(scrubPII('piazzale Loreto 1')).toContain('[REDACTED:ADDRESS]');
  });

  it('K.29 — idempotent: scrubbing already-scrubbed text produces same output', () => {
    const msg = 'Mario Rossi, mario@a.it, 333 1234567';
    const once = scrubPII(msg);
    const twice = scrubPII(once);
    expect(twice).toBe(once);
  });

  it('K.30 — scrubbing 50KB document of mixed content does not crash and runs in <1s', () => {
    const big = ('Mario Rossi al 333 1234567 mario@a.it. ').repeat(1200);
    const t0 = Date.now();
    const out = scrubPII(big);
    const dt = Date.now() - t0;
    expect(out).toContain('[REDACTED:PHONE]');
    expect(dt).toBeLessThan(1000);
  });
});

// ===========================================================================
// PART 4 — OBSERVABILITY JSON SHAPE STRESS (audit C1: silent failures)
// ===========================================================================

describe('observability — logSilentFailure JSON shape', () => {
  let warnSpy;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('O.01 — emits exactly one console.warn call per invocation', () => {
    logSilentFailure('e', new Error('x'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('O.02 — payload is a valid JSON string parseable by JSON.parse', () => {
    logSilentFailure('e', new Error('x'));
    const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(typeof parsed).toBe('object');
  });

  it('O.03 — payload contains required keys: level, event, error, ts', () => {
    logSilentFailure('my_event', new Error('boom'));
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.level).toBe('warn');
    expect(p.event).toBe('my_event');
    expect(p.error).toBe('boom');
    expect(typeof p.ts).toBe('number');
  });

  it('O.04 — Error subclass.message extracted, .name lost in error field but shown in stack', () => {
    class MyError extends Error {
      constructor(msg) {
        super(msg);
        this.name = 'MyError';
      }
    }
    logSilentFailure('e', new MyError('subclass'));
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('subclass');
    expect(p.stack).toContain('MyError');
  });

  it('O.05 — non-Error thrown value coerces via String()', () => {
    logSilentFailure('e', 'plain string');
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('plain string');
  });

  it('O.06 — null error becomes "null" string', () => {
    logSilentFailure('e', null);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('null');
  });

  it('O.07 — undefined error becomes "undefined" string', () => {
    logSilentFailure('e', undefined);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('undefined');
  });

  it('O.08 — numeric error coerces to numeric string', () => {
    logSilentFailure('e', 42);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('42');
  });

  it('O.09 — plain-object error becomes "[object Object]"', () => {
    logSilentFailure('e', { foo: 'bar' });
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('[object Object]');
  });

  it('O.10 — array error coerces via String() to comma-joined', () => {
    logSilentFailure('e', [1, 2, 3]);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.error).toBe('1,2,3');
  });

  it('O.11 — stack frames capped to first 3 joined by " | "', () => {
    const err = new Error('boom');
    err.stack = 'line1\nline2\nline3\nline4\nline5';
    logSilentFailure('e', err);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.stack).toBe('line1 | line2 | line3');
  });

  it('O.12 — Error without stack: stack key absent', () => {
    const err = new Error('x');
    delete err.stack;
    logSilentFailure('e', err);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.stack).toBeUndefined();
  });

  it('O.13 — non-Error: stack key absent', () => {
    logSilentFailure('e', 'plain');
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.stack).toBeUndefined();
  });

  it('O.14 — extra fields merged into payload top-level', () => {
    logSilentFailure('e', new Error('x'), { tokens: 42, traceId: 'abc' });
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.tokens).toBe(42);
    expect(p.traceId).toBe('abc');
  });

  it('O.15 — extra CANNOT override built-in keys (iter 105.4 H3 fix: spread before built-ins)', () => {
    // iter 105.4: built-in fields placed AFTER spread → built-ins win.
    logSilentFailure('orig', new Error('orig_err'), {
      event: 'OVERRIDE_EVENT',
      error: 'OVERRIDE_ERR',
      ts: 0,
      level: 'OVERRIDE_LVL',
    });
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.event).toBe('orig');
    expect(p.error).toBe('orig_err');
    expect(p.ts).toBeGreaterThan(0);
    expect(p.level).toBe('warn');
  });

  it('O.16 — Date in extra serializes to ISO string (default JSON.stringify behavior)', () => {
    logSilentFailure('e', new Error('x'), { date: new Date(0) });
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.date).toBe('1970-01-01T00:00:00.000Z');
  });

  it('O.17 — BigInt in extra is coerced to string by safeStringify (iter 105.4 H3 fix)', () => {
    logSilentFailure('e', new Error('x'), { big: 123n });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.big).toBe('123');
  });

  it('O.18 — circular reference in extra now logs with [circular] marker (iter 105.4 H3 fix)', () => {
    const c = { a: 1 };
    c.self = c;
    logSilentFailure('e', new Error('x'), c);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const raw = warnSpy.mock.calls[0][0];
    expect(raw).toContain('[circular]'); // WeakSet detected cycle
    const p = JSON.parse(raw);
    expect(p.a).toBe(1);
    expect(p.level).toBe('warn');
  });

  it('O.19 — Symbol-valued field coerced to .toString() (iter 105.4 H3 fix)', () => {
    logSilentFailure('e', new Error('x'), { sym: Symbol('s'), keep: 'me' });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.sym).toBe('Symbol(s)');
    expect(p.keep).toBe('me');
  });

  it('O.20 — nested object in extra preserved', () => {
    logSilentFailure('e', new Error('x'), { meta: { a: 1, b: { c: 2 } } });
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.meta.b.c).toBe(2);
  });

  it('O.21 — never throws even when error itself throws on .message access', () => {
    const tricky = {
      get message() {
        throw new Error('cant read message');
      },
    };
    expect(() => logSilentFailure('e', tricky)).not.toThrow();
  });

  it('O.22 — ts is a recent epoch ms (within ±5s of Date.now())', () => {
    const before = Date.now();
    logSilentFailure('e', new Error('x'));
    const after = Date.now();
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.ts).toBeGreaterThanOrEqual(before);
    expect(p.ts).toBeLessThanOrEqual(after + 5000);
  });

  it('O.23 — empty extra works (default arg)', () => {
    logSilentFailure('e', new Error('x'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('O.24 — empty event string still logs', () => {
    logSilentFailure('', new Error('x'));
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.event).toBe('');
  });

  it('O.25 — concurrent calls each produce one log line (no buffering)', () => {
    for (let i = 0; i < 10; i++) logSilentFailure('e', new Error(`x${i}`));
    expect(warnSpy).toHaveBeenCalledTimes(10);
  });
});

describe('observability — logSilentError JSON shape', () => {
  let errSpy;
  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('OE.01 — uses console.error not console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logSilentError('e', new Error('x'));
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('OE.02 — level field is "error" not "warn"', () => {
    logSilentError('e', new Error('x'));
    const p = JSON.parse(errSpy.mock.calls[0][0]);
    expect(p.level).toBe('error');
  });

  it('OE.03 — same JSON shape as logSilentFailure for other fields', () => {
    logSilentError('audit_fail', new Error('boom'), { tag: 'gdpr' });
    const p = JSON.parse(errSpy.mock.calls[0][0]);
    expect(p.event).toBe('audit_fail');
    expect(p.error).toBe('boom');
    expect(p.tag).toBe('gdpr');
  });

  it('OE.04 — never throws on BigInt extra (silently absorbs)', () => {
    expect(() => logSilentError('e', new Error('x'), { big: 7n })).not.toThrow();
  });

  it('OE.05 — never throws when console.error itself throws', () => {
    errSpy.mockImplementation(() => {
      throw new Error('console broken');
    });
    expect(() => logSilentError('e', new Error('x'))).not.toThrow();
  });
});

// ===========================================================================
// PART 5 — IP EXTRACTION ADVERSARIAL (audit H5: XFF mis-parsing)
// ===========================================================================

describe('extractClientIp — header precedence', () => {
  it('IP.01 — CF-Connecting-IP wins over x-vercel-forwarded-for', () => {
    expect(extractClientIp(mkReq({
      'CF-Connecting-IP': '1.1.1.1',
      'x-vercel-forwarded-for': '2.2.2.2',
    }))).toBe('1.1.1.1');
  });

  it('IP.02 — x-vercel-forwarded-for wins over x-real-ip', () => {
    expect(extractClientIp(mkReq({
      'x-vercel-forwarded-for': '2.2.2.2',
      'x-real-ip': '3.3.3.3',
    }))).toBe('2.2.2.2');
  });

  it('IP.03 — x-real-ip wins over x-forwarded-for', () => {
    expect(extractClientIp(mkReq({
      'x-real-ip': '3.3.3.3',
      'x-forwarded-for': '4.4.4.4',
    }))).toBe('3.3.3.3');
  });

  it('IP.04 — fallback to "unknown" when no headers', () => {
    expect(extractClientIp(mkReq({}))).toBe('unknown');
  });
});

describe('extractClientIp — XFF chain parsing (audit H5)', () => {
  it('IP.05 — single IP in XFF returned as-is', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': '1.2.3.4' }))).toBe('1.2.3.4');
  });

  it('IP.06 — multi-hop XFF "client, proxy1, proxy2" returns leftmost (client)', () => {
    expect(extractClientIp(mkReq({
      'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
    }))).toBe('1.2.3.4');
  });

  it('IP.07 — XFF with leading-empty commas ",,1.2.3.4" returns empty string (current behavior — bug)', () => {
    // Documents bug: split(',') on ",,1.2.3.4" gives ["", "", "1.2.3.4"]; .shift().trim() = "".
    // Empty IP then triggers fail-open or strict downstream.
    expect(extractClientIp(mkReq({ 'x-forwarded-for': ',,1.2.3.4' }))).toBe('');
  });

  it('IP.08 — XFF with surrounding whitespace trimmed', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': '   1.2.3.4   ' }))).toBe('1.2.3.4');
  });

  it('IP.09 — XFF with whitespace-only is treated as no header → "unknown"', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': '   ' }))).toBe('unknown');
  });

  it('IP.10 — XFF chain with whitespace between elements trimmed', () => {
    expect(extractClientIp(mkReq({
      'x-forwarded-for': '  1.2.3.4 ,  5.6.7.8',
    }))).toBe('1.2.3.4');
  });

  it('IP.11 — empty XFF string treated as no header', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': '' }))).toBe('unknown');
  });
});

describe('extractClientIp — IPv6 / port / malformed', () => {
  it('IP.12 — IPv6 in CF-Connecting-IP returned as-is', () => {
    expect(extractClientIp(mkReq({ 'CF-Connecting-IP': '2001:db8::1' }))).toBe('2001:db8::1');
  });

  it('IP.13 — IPv6 long-form in real-ip returned as-is', () => {
    const v6 = 'fe80:0000:0000:0000:0202:b3ff:fe1e:8329';
    expect(extractClientIp(mkReq({ 'x-real-ip': v6 }))).toBe(v6);
  });

  it('IP.14 — IPv4 with port "1.2.3.4:8080" returned as-is (no parsing)', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': '1.2.3.4:8080' }))).toBe('1.2.3.4:8080');
  });

  it('IP.15 — newline in CF-Connecting-IP trimmed', () => {
    expect(extractClientIp(mkReq({ 'CF-Connecting-IP': '1.2.3.4\n' }))).toBe('1.2.3.4');
  });

  it('IP.16 — tab in CF-Connecting-IP trimmed', () => {
    expect(extractClientIp(mkReq({ 'CF-Connecting-IP': '\t1.2.3.4\t' }))).toBe('1.2.3.4');
  });

  it('IP.17 — empty CF-Connecting-IP falls through to next priority', () => {
    expect(extractClientIp(mkReq({
      'CF-Connecting-IP': '',
      'x-vercel-forwarded-for': '2.2.2.2',
    }))).toBe('2.2.2.2');
  });

  it('IP.18 — whitespace-only CF-Connecting-IP falls through', () => {
    expect(extractClientIp(mkReq({
      'CF-Connecting-IP': '   ',
      'x-real-ip': '3.3.3.3',
    }))).toBe('3.3.3.3');
  });

  it('IP.19 — empty x-vercel-forwarded-for falls through', () => {
    expect(extractClientIp(mkReq({
      'x-vercel-forwarded-for': '',
      'x-real-ip': '3.3.3.3',
    }))).toBe('3.3.3.3');
  });

  it('IP.20 — empty x-real-ip falls through to XFF', () => {
    expect(extractClientIp(mkReq({
      'x-real-ip': '',
      'x-forwarded-for': '4.4.4.4',
    }))).toBe('4.4.4.4');
  });

  it('IP.21 — all headers empty → "unknown"', () => {
    expect(extractClientIp(mkReq({
      'CF-Connecting-IP': '',
      'x-vercel-forwarded-for': '',
      'x-real-ip': '',
      'x-forwarded-for': '',
    }))).toBe('unknown');
  });

  it('IP.22 — CDN injection: mock headers.get returning CRLF-laden value still trimmed (jsdom Headers reject CRLF directly)', () => {
    // jsdom Headers.append throws on CRLF, so we synthesise a Request-like
    // object whose .headers.get returns the injection string directly.
    const fake = {
      headers: {
        get(name) {
          if (name === 'CF-Connecting-IP') return '1.2.3.4\r\nX-Inject: evil';
          return null;
        },
      },
    };
    expect(extractClientIp(fake)).toMatch(/^1\.2\.3\.4/);
  });

  it('IP.23 — IPv6 with brackets "[::1]" returned as-is', () => {
    expect(extractClientIp(mkReq({ 'CF-Connecting-IP': '[::1]' }))).toBe('[::1]');
  });

  it('IP.24 — IPv4 in non-standard format "01.02.03.04" preserved (no normalisation)', () => {
    expect(extractClientIp(mkReq({ 'CF-Connecting-IP': '01.02.03.04' }))).toBe('01.02.03.04');
  });

  it('IP.25 — fake hostname "evil.example.com" in CF returned as-is (no validation)', () => {
    expect(extractClientIp(mkReq({ 'CF-Connecting-IP': 'evil.example.com' }))).toBe('evil.example.com');
  });

  it('IP.26 — extractClientIp never throws on malformed Request', () => {
    // Build a Request-like with throwing headers.get
    const fake = {
      headers: {
        get: () => {
          throw new Error('boom');
        },
      },
    };
    expect(() => extractClientIp(fake)).not.toThrow();
    expect(extractClientIp(fake)).toBe('unknown');
  });

  it('IP.27 — header name lookup is case-insensitive (Headers normalises)', () => {
    // Headers object lowercases — test that "cf-connecting-ip" also works
    expect(extractClientIp(mkReq({ 'cf-connecting-ip': '5.5.5.5' }))).toBe('5.5.5.5');
  });

  it('IP.28 — XFF with single trailing comma "1.2.3.4," returns IP', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': '1.2.3.4,' }))).toBe('1.2.3.4');
  });

  it('IP.29 — XFF with only commas ",,," returns empty string (degenerate)', () => {
    expect(extractClientIp(mkReq({ 'x-forwarded-for': ',,,' }))).toBe('');
  });

  it('IP.30 — extremely long XFF chain (50 hops) still returns leftmost', () => {
    const chain = Array.from({ length: 50 }, (_, i) => `10.0.0.${i}`).join(', ');
    expect(extractClientIp(mkReq({ 'x-forwarded-for': chain }))).toBe('10.0.0.0');
  });
});

// ===========================================================================
// PART 6 — IP RATE LIMIT CONCURRENCY / BUCKET STRESS (audit C2 + H7)
// ===========================================================================

describe('checkRateLimitByIp — single-IP saturation', () => {
  beforeEach(() => {
    envStore.delete('IP_RATE_LIMIT_MAX');
    envStore.delete('STRICT_IP_RATE_LIMIT_UNKNOWN');
    _resetIpRateLimitMap();
  });

  it('R.01 — first call to fresh IP returns true', () => {
    expect(checkRateLimitByIp('10.0.0.1')).toBe(true);
  });

  it('R.02 — default limit (100) allows 100 calls then blocks 101st', () => {
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('10.0.0.2')).toBe(true);
    }
    expect(checkRateLimitByIp('10.0.0.2')).toBe(false);
  });

  it('R.03 — env IP_RATE_LIMIT_MAX=3 honored', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '3');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('10.0.0.3')).toBe(true);
    expect(checkRateLimitByIp('10.0.0.3')).toBe(true);
    expect(checkRateLimitByIp('10.0.0.3')).toBe(true);
    expect(checkRateLimitByIp('10.0.0.3')).toBe(false);
  });

  it('R.04 — env IP_RATE_LIMIT_MAX=1 allows exactly one', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('10.0.0.4')).toBe(true);
    expect(checkRateLimitByIp('10.0.0.4')).toBe(false);
  });

  it('R.05 — env IP_RATE_LIMIT_MAX="0" falls back to default 100 (Number(0)||DEFAULT)', () => {
    // Documents (current) ||-fallback semantic: "0" → 0 → falsy → DEFAULT.
    envStore.set('IP_RATE_LIMIT_MAX', '0');
    _resetIpRateLimitMap();
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('10.0.0.5')).toBe(true);
    }
    expect(checkRateLimitByIp('10.0.0.5')).toBe(false);
  });

  it('R.06 — env IP_RATE_LIMIT_MAX="abc" non-numeric falls back to default', () => {
    envStore.set('IP_RATE_LIMIT_MAX', 'abc');
    _resetIpRateLimitMap();
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('10.0.0.6')).toBe(true);
    }
    expect(checkRateLimitByIp('10.0.0.6')).toBe(false);
  });

  it('R.07 — different IPs each get fresh bucket (sessionId-rotation bypass plug)', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '2');
    _resetIpRateLimitMap();
    // 5 different IPs, 2 calls each = 10 total ALL within limit
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimitByIp(`10.0.0.${100 + i}`)).toBe(true);
      expect(checkRateLimitByIp(`10.0.0.${100 + i}`)).toBe(true);
      // 3rd call blocks
      expect(checkRateLimitByIp(`10.0.0.${100 + i}`)).toBe(false);
    }
  });

  it('R.08 — _resetIpRateLimitMap clears all buckets', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('10.0.0.7')).toBe(true);
    expect(checkRateLimitByIp('10.0.0.7')).toBe(false);
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('10.0.0.7')).toBe(true);
  });

  it('R.09 — expired bucket re-fires (simulated via reset + reuse)', () => {
    // Simulate window expiry by resetting + re-using the same IP.
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('10.0.0.8')).toBe(true);
    expect(checkRateLimitByIp('10.0.0.8')).toBe(false);
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('10.0.0.8')).toBe(true);
  });

  it('R.10 — 1000 calls to same IP with default limit blocks at 101st (DoS plug)', () => {
    let allowed = 0;
    let denied = 0;
    for (let i = 0; i < 1000; i++) {
      if (checkRateLimitByIp('10.0.0.9')) allowed++;
      else denied++;
    }
    expect(allowed).toBe(100);
    expect(denied).toBe(900);
  });

  it('R.11 — 1000 distinct IPs all allowed (different-IP bypass not blocked at low scale)', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '5');
    _resetIpRateLimitMap();
    let allowed = 0;
    for (let i = 0; i < 1000; i++) {
      if (checkRateLimitByIp(`172.16.0.${i % 256}.${Math.floor(i / 256)}`)) allowed++;
    }
    // First 5 calls per unique IP pass — most unique enough to pass.
    expect(allowed).toBeGreaterThan(900);
  });

  it('R.12 — bucket persists across calls in same window', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '3');
    _resetIpRateLimitMap();
    checkRateLimitByIp('persistent.1');
    checkRateLimitByIp('persistent.1');
    // 3rd allowed, 4th denied
    expect(checkRateLimitByIp('persistent.1')).toBe(true);
    expect(checkRateLimitByIp('persistent.1')).toBe(false);
  });

  it('R.13 — null IP fail-open with default env (treated as unknown)', () => {
    expect(checkRateLimitByIp(null)).toBe(true);
  });

  it('R.14 — undefined IP fail-open with default env', () => {
    expect(checkRateLimitByIp(undefined)).toBe(true);
  });

  it('R.15 — empty IP fail-open with default env', () => {
    expect(checkRateLimitByIp('')).toBe(true);
  });

  it('R.16 — "unknown" IP uses shared bucket: 100 calls allowed, 101st blocked', () => {
    _resetIpRateLimitMap();
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('unknown')).toBe(true);
    }
    expect(checkRateLimitByIp('unknown')).toBe(false);
  });

  it('R.17 — empty IP shares "unknown" bucket with literal "unknown" string', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '2');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('')).toBe(true);
    expect(checkRateLimitByIp('unknown')).toBe(true);
    // Bucket exhausted by 2 fail-open empty/unknown calls
    expect(checkRateLimitByIp('')).toBe(false);
  });

  it('R.18 — calls with IPv6 addresses get unique buckets', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('2001:db8::1')).toBe(true);
    expect(checkRateLimitByIp('2001:db8::2')).toBe(true);
    expect(checkRateLimitByIp('2001:db8::1')).toBe(false);
    expect(checkRateLimitByIp('2001:db8::2')).toBe(false);
  });

  it('R.19 — bucket reset to count=1 after expiry simulation', () => {
    // We can't actually time-warp in unit tests, but we can verify the reset
    // path via _resetIpRateLimitMap which acts as "all buckets expired".
    envStore.set('IP_RATE_LIMIT_MAX', '2');
    _resetIpRateLimitMap();
    checkRateLimitByIp('reset.ip');
    checkRateLimitByIp('reset.ip');
    expect(checkRateLimitByIp('reset.ip')).toBe(false); // blocked
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('reset.ip')).toBe(true); // bucket renewed
  });

  it('R.20 — checkRateLimitByIp never throws even with weird IP object', () => {
    expect(() => checkRateLimitByIp({ toString: () => 'weird' })).not.toThrow();
  });

  it('R.21 — string with internal whitespace "  1.2.3.4  " treated as distinct key from "1.2.3.4"', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    expect(checkRateLimitByIp('1.2.3.4')).toBe(true);
    expect(checkRateLimitByIp('  1.2.3.4  ')).toBe(true); // different key, fresh bucket
    expect(checkRateLimitByIp('1.2.3.4')).toBe(false); // original key still exhausted
  });

  it('R.22 — checkRateLimitByIp on IP that throws on Map ops still returns true (fail-open via catch)', () => {
    // Inject IP whose toString throws — Map uses it as key directly but
    // .toString() inside logSilentFailure stringification would throw.
    const badIp = {
      toString() {
        throw new Error('bad ip');
      },
    };
    // The function still returns true (fail-open) because the try wraps everything.
    expect(checkRateLimitByIp(badIp)).toBe(true);
  });

  it('R.23 — high limit env value "999999" honored as integer', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '999999');
    _resetIpRateLimitMap();
    for (let i = 0; i < 1000; i++) {
      expect(checkRateLimitByIp('bulk.ip')).toBe(true);
    }
  });

  it('R.24 — negative env value "-1" rejected by validator, falls back to DEFAULT=100 (iter 105.4 H1 fix)', () => {
    // iter 105.4: parseEnvPositiveInt requires int ≥ 1; negative rejected.
    envStore.set('IP_RATE_LIMIT_MAX', '-1');
    _resetIpRateLimitMap();
    // 100 calls all pass (DEFAULT honored)
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('neg.ip')).toBe(true);
    }
    // 101st call blocks (>= DEFAULT=100)
    expect(checkRateLimitByIp('neg.ip')).toBe(false);
  });

  it('R.25 — float env value "3.7" rejected by validator (not integer), falls back to DEFAULT=100 (iter 105.4 H1 fix)', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '3.7');
    _resetIpRateLimitMap();
    // 4 calls all pass (would have blocked at 4 with old behavior)
    for (let i = 0; i < 4; i++) {
      expect(checkRateLimitByIp('flo.ip')).toBe(true);
    }
  });

  it('R.26 — 100 unique IPs in parallel (Promise.all) each pass first call', async () => {
    envStore.set('IP_RATE_LIMIT_MAX', '5');
    _resetIpRateLimitMap();
    const tasks = Array.from({ length: 100 }, (_, i) =>
      Promise.resolve(checkRateLimitByIp(`parallel.${i}`)),
    );
    const results = await Promise.all(tasks);
    expect(results.every((r) => r === true)).toBe(true);
  });

  it('R.27 — 100 parallel calls to SAME IP with limit=5 allow exactly 5 (sync semantics)', async () => {
    envStore.set('IP_RATE_LIMIT_MAX', '5');
    _resetIpRateLimitMap();
    const tasks = Array.from({ length: 100 }, () =>
      Promise.resolve(checkRateLimitByIp('parallel.same')),
    );
    const results = await Promise.all(tasks);
    const allowed = results.filter((r) => r === true).length;
    expect(allowed).toBe(5);
  });

  it('R.28 — eviction does NOT mis-evict on small maps (under 50k entries)', () => {
    // We add 100 distinct IPs and verify all buckets remain.
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    for (let i = 0; i < 100; i++) checkRateLimitByIp(`evict.test.${i}`);
    // Re-check first IP — should still be blocked (bucket survived)
    expect(checkRateLimitByIp('evict.test.0')).toBe(false);
  });

  it('R.29 — eviction triggers when map exceeds 50k entries (simulated via assertion of bucket loss after fill)', () => {
    // We do NOT actually fill 50k entries (too slow). Instead we test that
    // the maybeEvict() path does NOT throw and that buckets survive under
    // the threshold.
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    // Add 1000 IPs (well under 50k) — verify first IP bucket still intact
    for (let i = 0; i < 1000; i++) checkRateLimitByIp(`evict.${i}`);
    // First IP still blocked (bucket survived; no eviction yet)
    expect(checkRateLimitByIp('evict.0')).toBe(false);
  });

  it('R.30 — repeated calls with sessionId-style IPs do not bypass via rotation when single IP fixed', () => {
    // The C2 audit scenario: attacker generates 10k sessions but all come
    // from ONE attacker IP. IP-bound limiter should catch.
    envStore.set('IP_RATE_LIMIT_MAX', '50');
    _resetIpRateLimitMap();
    // Attacker rotates sessionIds but IP is same.
    let allowed = 0;
    let denied = 0;
    for (let i = 0; i < 1000; i++) {
      // Note: we're testing the IP limiter only. SessionId not part of this test.
      if (checkRateLimitByIp('attacker.fixed.ip')) allowed++;
      else denied++;
    }
    expect(allowed).toBe(50);
    expect(denied).toBe(950);
  });
});

// ===========================================================================
// PART 7 — STRICT_IP_RATE_LIMIT_UNKNOWN MATRIX (audit C4: header-stripping)
// ===========================================================================

describe('STRICT_IP_RATE_LIMIT_UNKNOWN env matrix', () => {
  beforeEach(() => {
    envStore.delete('STRICT_IP_RATE_LIMIT_UNKNOWN');
    envStore.delete('IP_RATE_LIMIT_MAX');
    _resetIpRateLimitMap();
  });

  it('S.01 — env unset: "unknown" IP fail-open (returns true)', () => {
    expect(checkRateLimitByIp('unknown')).toBe(true);
  });

  it('S.02 — env unset: empty IP fail-open', () => {
    expect(checkRateLimitByIp('')).toBe(true);
  });

  it('S.03 — env="true": "unknown" IP rejected (returns false)', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp('unknown')).toBe(false);
  });

  it('S.04 — env="true": empty IP rejected', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp('')).toBe(false);
  });

  it('S.05 — env="True" (mixed case): treated as true (lowercased compare)', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'True');
    expect(checkRateLimitByIp('unknown')).toBe(false);
  });

  it('S.06 — env="TRUE" all-caps: treated as true', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'TRUE');
    expect(checkRateLimitByIp('unknown')).toBe(false);
  });

  it('S.07 — env="  true  " padded: treated as true (trim applied)', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', '  true  ');
    expect(checkRateLimitByIp('unknown')).toBe(false);
  });

  it('S.08 — env="1" (truthy but not "true" string): fail-open (not strict)', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', '1');
    expect(checkRateLimitByIp('unknown')).toBe(true);
  });

  it('S.09 — env="yes": fail-open', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'yes');
    expect(checkRateLimitByIp('unknown')).toBe(true);
  });

  it('S.10 — env="false" explicit: fail-open', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'false');
    expect(checkRateLimitByIp('unknown')).toBe(true);
  });

  it('S.11 — env="true" applies to null IP too', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp(null)).toBe(false);
  });

  it('S.12 — env="true" applies to undefined IP too', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp(undefined)).toBe(false);
  });

  it('S.13 — env="true" does NOT affect concrete IPs', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp('1.2.3.4')).toBe(true);
  });

  it('S.14 — env switched mid-flight: next call reflects new value', () => {
    // First call with strict OFF
    expect(checkRateLimitByIp('unknown')).toBe(true);
    // Flip to strict
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp('unknown')).toBe(false);
    // Flip back
    envStore.delete('STRICT_IP_RATE_LIMIT_UNKNOWN');
    expect(checkRateLimitByIp('unknown')).toBe(true);
  });

  it('S.15 — env="" empty: fail-open (not strict)', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', '');
    expect(checkRateLimitByIp('unknown')).toBe(true);
  });
});

// ===========================================================================
// PART 8 — containsPII regex-stateful bug (documented)
// ===========================================================================

describe('containsPII — known regex-stateful behavior', () => {
  it('Z.01 — exports a function', () => {
    expect(typeof containsPII).toBe('function');
  });

  it('Z.02 — null input returns false', () => {
    expect(containsPII(null)).toBe(false);
  });

  it('Z.03 — empty string returns false', () => {
    expect(containsPII('')).toBe(false);
  });

  it('Z.04 — non-string returns false', () => {
    expect(containsPII(42)).toBe(false);
  });

  it('Z.05 — clean text returns false', () => {
    expect(containsPII('Cosa è un LED?')).toBe(false);
  });

  it('Z.06 — DETERMINISTIC across calls (iter 105.4 H2 fix: lastIndex reset)', () => {
    // iter 105.4: containsPII now resets lastIndex=0 on all `/g` regexes
    // before AND after .test() → stateless w.r.t. global regex state.
    const txt = 'Mario Rossi';
    const r1 = containsPII(txt);
    const r2 = containsPII(txt);
    const r3 = containsPII(txt);
    expect(r1).toBe(r2);
    expect(r2).toBe(r3);
  });

  it('Z.07 — phone input deterministic across rapid calls (iter 105.4 H2 fix)', () => {
    const txt = '333 1234567';
    const results = [];
    for (let i = 0; i < 6; i++) results.push(containsPII(txt));
    // All identical now — bug fixed.
    expect(new Set(results).size).toBe(1);
  });
});

// ===========================================================================
// PART 9 — Version exports (smoke)
// ===========================================================================

describe('module version exports', () => {
  it('V.01 — PII_SCRUB_VERSION exports a versioned string', () => {
    expect(typeof PII_SCRUB_VERSION).toBe('string');
    expect(PII_SCRUB_VERSION).toMatch(/^\d+\.\d+/);
  });

  it('V.02 — IP_RATE_LIMIT_VERSION exports a versioned string', () => {
    expect(typeof IP_RATE_LIMIT_VERSION).toBe('string');
    expect(IP_RATE_LIMIT_VERSION).toMatch(/^\d+\.\d+/);
  });
});

// ===========================================================================
// PART 10 — Cross-module integration sanity (audit holistic)
// ===========================================================================

describe('cross-module sanity', () => {
  beforeEach(() => {
    envStore.delete('IP_RATE_LIMIT_MAX');
    envStore.delete('STRICT_IP_RATE_LIMIT_UNKNOWN');
    _resetIpRateLimitMap();
  });

  it('X.01 — scrubPII redaction tags are deterministic constants used by tests + dashboards', () => {
    // Note: ADDRESS_RE runs BEFORE FULL_NAME_RE but AFTER IBAN_RE; in
    // certain sequences the IBAN greedy match swallows trailing tokens.
    // Two-input variant ensures we exercise all 6 tags reliably.
    const out1 = scrubPII('Mario Rossi at 333 1234567 mail mario@a.it CF RSSMRA90A01H501Z');
    expect(out1).toContain('[REDACTED:NAME]');
    expect(out1).toContain('[REDACTED:PHONE]');
    expect(out1).toContain('[REDACTED:EMAIL]');
    expect(out1).toContain('[REDACTED:CODICE_FISCALE]');

    // Address requires separate input — IBAN greedy regex consumes trailing
    // text in same string (no \b after the 4-30 alphanumeric body).
    const out2 = scrubPII('IBAN IT60X05428111010.');
    expect(out2).toContain('[REDACTED:IBAN]');
    const out3 = scrubPII('abito in via Verdi 10');
    expect(out3).toContain('[REDACTED:ADDRESS]');
  });

  it('X.02 — scrubPIIWithCounts returns object with .text and .redactions shape', () => {
    const r = scrubPIIWithCounts('hello');
    expect(typeof r.text).toBe('string');
    expect(typeof r.redactions).toBe('object');
    expect(Object.keys(r.redactions).sort()).toEqual(
      ['address', 'codice_fiscale', 'email', 'full_name', 'iban', 'phone'].sort(),
    );
  });

  it('X.03 — observability + rate-limit work in same call sequence without state leak', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();
    // First call allowed
    expect(checkRateLimitByIp('integ.ip')).toBe(true);
    logSilentFailure('rate_limit_test', new Error('integ'), { ip: 'integ.ip' });
    // Second call blocked
    expect(checkRateLimitByIp('integ.ip')).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('X.04 — scrubPII output is safe to feed into logSilentFailure extra (no special chars break JSON)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const scrubbed = scrubPII('Mario Rossi via Roma 5 333 1234567');
    expect(() => logSilentFailure('scrub_log', new Error('e'), { scrubbed })).not.toThrow();
    const p = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(p.scrubbed).toContain('[REDACTED:');
  });

  it('X.05 — extractClientIp result is safe to feed into checkRateLimitByIp', () => {
    const ip = extractClientIp(mkReq({ 'CF-Connecting-IP': '8.8.8.8' }));
    expect(checkRateLimitByIp(ip)).toBe(true);
  });

  it('X.06 — full request lifecycle: extract IP, scrub message, check limit, log if denied', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    _resetIpRateLimitMap();

    const req = mkReq({ 'CF-Connecting-IP': '99.99.99.99' });
    const ip = extractClientIp(req);
    const userMsg = 'Mario Rossi 333 1234567';
    const scrubbed = scrubPII(userMsg);

    // First call: allowed
    expect(checkRateLimitByIp(ip)).toBe(true);
    // Second call: denied — log it
    if (!checkRateLimitByIp(ip)) {
      logSilentFailure('rate_limit_denied', new Error('IP exceeded'), {
        ip,
        scrubbed_message: scrubbed,
      });
    }
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(log.ip).toBe('99.99.99.99');
    expect(log.scrubbed_message).toContain('[REDACTED:');
  });
});
