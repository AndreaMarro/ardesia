/**
 * pii-scrub.ts — Sprint X iter 105.3 P0 (Andrea audit C3 fix)
 *
 * Italian PII scrubber for UNLIM persistence layer.
 *
 * Audit C3 (security-auditor 2026-05-25): `saveInteraction` /
 * `saveMessageHistory` persist raw 16k-char user messages to Supabase WITHOUT
 * PII scrub → GDPR Art. 8 (minors) over-collection. Italian phones, emails,
 * IBAN, codice fiscale, full names leak verbatim.
 *
 * This module exports `scrubPII(text)` that returns the text with PII tokens
 * redacted to `[REDACTED:KIND]`. Idempotent + never throws + pure.
 *
 * Usage:
 *   import { scrubPII } from '../_shared/pii-scrub.ts';
 *   await saveMessageHistory({...}, scrubPII(extractedUserMsg), ...);
 *
 * Wiring opt-in via env `ENABLE_PII_SCRUB='true'` per Andrea ratify gate.
 * Default OFF to preserve current behavior until benchmark on R7 fixture
 * confirms no semantic regression on memory recall queries.
 */

// ===========================================================================
// Regex patterns — Italian K-12 PII shapes
// ===========================================================================

/**
 * Italian mobile/landline numbers: prefix 3xx for mobile, 0xx for landline.
 * Catches "333 1234567", "333-123-4567", "+39 333 1234567", "0521 123456".
 *
 * Avoids matching Arduino pin numbers (D13, A0, pin 13) by requiring 3-digit
 * area code start (Italian phones).
 */
// iter 105.4 H2 fix (Andrea audit): drop `{1}` no-op quantifier (eliminates
// catastrophic-backtracking surface on adversarial 16k-char input). Each
// segment is now anchored directly without optional repetition.
const PHONE_RE =
  /(?:\+39[\s.-]?)?\(?(?:0\d{1,3}|3\d{2})\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

/** RFC 5322-lite email: chars@chars.tld */
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/**
 * Codice Fiscale (Italian tax ID): 16 alphanumeric chars, structured.
 * Format: 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 digits + 1 letter.
 */
const CODICE_FISCALE_RE = /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi;

/**
 * IBAN Italian: IT + 2 check digits + 22 alphanumeric.
 * Format: IT60 X054 2811 1010 0000 0123 456 (spaces optional).
 */
const IBAN_RE = /\bIT\d{2}[\sA-Z0-9]{4,30}\b/gi;

/**
 * Italian full name heuristic: 2-3 capitalized words back-to-back.
 * Conservative: requires both words start with uppercase + are 3+ chars +
 * NOT followed by common ELAB/Arduino terms (LED, Volume, Capitolo, ecc.)
 * which would be false positives.
 *
 * False-positive risk: "Andrea Marro" (Andrea = author name in some volumes).
 * Decision: redact. Author names in chat history serve no UNLIM purpose.
 */
const FULL_NAME_RE =
  /\b([A-ZÀÉÈÌÒÙ][a-zàéèìòù]{2,}\s+[A-ZÀÉÈÌÒÙ][a-zàéèìòù]{2,}(?:\s+[A-ZÀÉÈÌÒÙ][a-zàéèìòù]{2,})?)\b/g;

/**
 * Italian street addresses: "via/viale/piazza/corso/largo/strada + name + number".
 * Catches "via Roma 5", "Via Garibaldi 12", "piazza Duomo, 3".
 */
const ADDRESS_RE =
  /\b(?:via|viale|piazza|corso|largo|strada|vicolo|piazzale)\s+[A-ZÀÉÈÌÒÙa-zàéèìòù'\s]{2,30}[,\s]+\d{1,4}/gi;

// ===========================================================================
// Whitelist — Italian K-12 ELAB-domain terms that the name regex would
// false-positive on. These MUST NOT be redacted.
// ===========================================================================

const ELAB_NAME_WHITELIST = new Set([
  'Arduino Nano',
  'Arduino Uno',
  'Atmel ATmega',
  'Nano R4',
  'Vol 1',
  'Vol 2',
  'Vol 3',
  'Volume 1',
  'Volume 2',
  'Volume 3',
  'Pin 13',
  'Capitolo 6',
  'Capitolo 7',
  'Capitolo 8',
  'Capitolo 9',
  'Esperimento Uno',
  'Esperimento Due',
  'Esperimento Tre',
]);

function isWhitelisted(match: string): boolean {
  return ELAB_NAME_WHITELIST.has(match.trim());
}

// ===========================================================================
// Public API
// ===========================================================================

export interface ScrubResult {
  /** Text with PII redacted. */
  text: string;
  /** Counts per redaction kind (telemetry). */
  redactions: {
    phone: number;
    email: number;
    codice_fiscale: number;
    iban: number;
    full_name: number;
    address: number;
  };
}

/**
 * Scrub Italian PII from text. Returns redacted text + per-kind counts.
 *
 * Order matters: more-specific patterns first (codice fiscale before name
 * regex, IBAN before phone, etc.) to avoid partial-overlap mis-redactions.
 *
 * NEVER throws. Returns `{text: input, redactions: zeros}` for non-string.
 */
export function scrubPIIWithCounts(input: string | null | undefined): ScrubResult {
  const zeros = {
    phone: 0,
    email: 0,
    codice_fiscale: 0,
    iban: 0,
    full_name: 0,
    address: 0,
  };

  if (input == null || typeof input !== 'string' || input.length === 0) {
    return { text: input == null ? '' : String(input), redactions: { ...zeros } };
  }

  const counts = { ...zeros };
  let text = input;

  // 1. Codice fiscale (most specific structural pattern)
  text = text.replace(CODICE_FISCALE_RE, () => {
    counts.codice_fiscale++;
    return '[REDACTED:CODICE_FISCALE]';
  });

  // 2. IBAN (also structural)
  text = text.replace(IBAN_RE, (m) => {
    // Defense: IBAN regex is loose; require the matched span actually starts
    // with "IT" + 2 digits to avoid redacting e.g. "ITALY 2026".
    if (!/^IT\d{2}/i.test(m)) return m;
    counts.iban++;
    return '[REDACTED:IBAN]';
  });

  // 3. Email
  text = text.replace(EMAIL_RE, () => {
    counts.email++;
    return '[REDACTED:EMAIL]';
  });

  // 4. Phone (after structural to avoid eating codice-fiscale digits)
  text = text.replace(PHONE_RE, (m) => {
    // Defense: avoid 4-digit "years" like "2026" — phones are 7+ digits
    const digits = m.replace(/\D/g, '');
    if (digits.length < 7) return m;
    counts.phone++;
    return '[REDACTED:PHONE]';
  });

  // 5. Address (before name to avoid double-redacting "via Roma 5")
  text = text.replace(ADDRESS_RE, () => {
    counts.address++;
    return '[REDACTED:ADDRESS]';
  });

  // 6. Full name (last, most false-positive-prone)
  text = text.replace(FULL_NAME_RE, (m) => {
    if (isWhitelisted(m)) return m;
    counts.full_name++;
    return '[REDACTED:NAME]';
  });

  return { text, redactions: counts };
}

/**
 * Convenience: scrub PII and return only the redacted text.
 *
 * Drop-in replacement at `saveMessageHistory(..., scrubPII(userMsg), ...)`
 * callsites when telemetry counts not needed.
 */
export function scrubPII(input: string | null | undefined): string {
  return scrubPIIWithCounts(input).text;
}

/**
 * Returns true when the text contains ANY PII match. Useful for gating
 * whether to even attempt persistence, or for telemetry sampling.
 */
export function containsPII(input: string | null | undefined): boolean {
  if (input == null || typeof input !== 'string' || input.length === 0) return false;
  // iter 105.4 H2 fix (Andrea audit Z.06-Z.07): module-scope `/g` regexes
  // mutate `lastIndex` between `.test()` calls → same input alternates
  // true/false across consecutive containsPII() calls. Reset lastIndex=0
  // BEFORE each test to make function stateless w.r.t. global regex state.
  CODICE_FISCALE_RE.lastIndex = 0;
  IBAN_RE.lastIndex = 0;
  EMAIL_RE.lastIndex = 0;
  PHONE_RE.lastIndex = 0;
  ADDRESS_RE.lastIndex = 0;
  FULL_NAME_RE.lastIndex = 0;
  const hit = (
    CODICE_FISCALE_RE.test(input) ||
    IBAN_RE.test(input) ||
    EMAIL_RE.test(input) ||
    PHONE_RE.test(input) ||
    ADDRESS_RE.test(input) ||
    FULL_NAME_RE.test(input)
  );
  // Reset after to leave module state clean (any subsequent scrubPII via
  // .replace() also resets, but defensive reset removes coupling).
  CODICE_FISCALE_RE.lastIndex = 0;
  IBAN_RE.lastIndex = 0;
  EMAIL_RE.lastIndex = 0;
  PHONE_RE.lastIndex = 0;
  ADDRESS_RE.lastIndex = 0;
  FULL_NAME_RE.lastIndex = 0;
  return hit;
}

/** Module version for telemetry. */
export const PII_SCRUB_VERSION = '1.0-iter105.3';
