/**
 * contentFilter — Tests for child-safe content validation and PII detection
 * Critical for GDPR/COPPA compliance and child safety.
 */
import { describe, it, expect } from 'vitest';
import {
  checkContent,
  checkPII,
  sanitizeOutput,
  getBlockMessage,
  validateMessage,
} from '../../src/utils/contentFilter';

describe('contentFilter', () => {
  describe('checkContent — inappropriate content detection', () => {
    it('returns safe for normal electronics text', () => {
      expect(checkContent('Come collego un LED al pin D13?').safe).toBe(true);
    });

    it('returns safe for null/undefined input', () => {
      expect(checkContent(null).safe).toBe(true);
      expect(checkContent(undefined).safe).toBe(true);
      expect(checkContent('').safe).toBe(true);
    });

    it('returns safe for very short input', () => {
      expect(checkContent('ab').safe).toBe(true);
    });

    it('detects Italian insults', () => {
      expect(checkContent('sei un cretino').safe).toBe(false);
      expect(checkContent('sei un cretino').reason).toBe('inappropriate');
    });

    it('detects vulgar language', () => {
      expect(checkContent('che stronzo').safe).toBe(false);
    });

    it('detects violent content', () => {
      expect(checkContent('voglio ammazzare qualcuno').safe).toBe(false);
    });

    it('detects adult content', () => {
      expect(checkContent('contenuto porno').safe).toBe(false);
    });

    it('is case insensitive', () => {
      expect(checkContent('SEI UN CRETINO').safe).toBe(false);
    });

    it('allows electronics terms that look suspicious but are safe', () => {
      expect(checkContent('resistenza da 220 ohm').safe).toBe(true);
      expect(checkContent('condensatore elettrolitico').safe).toBe(true);
    });
  });

  describe('checkPII — personal data detection', () => {
    it('returns no PII for normal text', () => {
      expect(checkPII('Collegare il LED al pin D13').hasPII).toBe(false);
    });

    it('returns no PII for null/undefined', () => {
      expect(checkPII(null).hasPII).toBe(false);
      expect(checkPII(undefined).hasPII).toBe(false);
    });

    it('detects email addresses', () => {
      const result = checkPII('scrivi a mario@scuola.it');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('email');
    });

    it('detects Italian phone numbers', () => {
      const result = checkPII('chiamami al +39 02 12345678');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('telefono');
    });

    it('detects codice fiscale', () => {
      const result = checkPII('il mio cf è RSSMRA85M01H501Z');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('codice_fiscale');
    });

    it('detects street addresses', () => {
      const result = checkPII('abito in via Roma 15');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('indirizzo');
    });
  });

  describe('sanitizeOutput — removes inappropriate words', () => {
    it('returns null/undefined unchanged', () => {
      expect(sanitizeOutput(null)).toBeNull();
      expect(sanitizeOutput(undefined)).toBeUndefined();
    });

    it('replaces inappropriate words with ***', () => {
      const result = sanitizeOutput('sei un cretino totale');
      expect(result).toContain('***');
      expect(result).not.toContain('cretino');
    });

    it('leaves clean text unchanged', () => {
      const clean = 'Il LED si accende quando la corrente scorre';
      expect(sanitizeOutput(clean)).toBe(clean);
    });
  });

  describe('getBlockMessage', () => {
    it('returns message for inappropriate', () => {
      const msg = getBlockMessage('inappropriate');
      expect(msg).toContain('parole gentili');
    });

    it('returns message for pii', () => {
      const msg = getBlockMessage('pii');
      expect(msg).toContain('sicurezza');
    });

    it('returns default message for unknown reason', () => {
      const msg = getBlockMessage('unknown_reason');
      expect(msg).toContain('riformulare');
    });
  });

  describe('validateMessage — full pipeline', () => {
    it('allows safe electronics questions', () => {
      const result = validateMessage('Come funziona un transistor?');
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it('blocks inappropriate content', () => {
      const result = validateMessage('sei uno stupido');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('parole gentili');
    });

    it('blocks PII (email)', () => {
      const result = validateMessage('la mia email è test@example.com');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('sicurezza');
    });

    it('blocks PII (phone)', () => {
      const result = validateMessage('il mio numero è +39 333 1234567');
      expect(result.allowed).toBe(false);
    });
  });
});
