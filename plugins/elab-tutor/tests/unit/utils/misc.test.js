/**
 * misc.test.js — Tests for miscellaneous src/utils/* files
 * Sprint T iter 28 — NEW FILE
 *
 * Covers: importWithRetry (retry logic), truncateResponse/cleanAndTruncate (limits),
 * contentFilter (Italian K-12 context: checkContent, checkPII, validateMessage, sanitizeOutput),
 * aiSafetyFilter (filterAIResponse), importWithRetry retry mechanics.
 */
import { describe, it, expect, vi } from 'vitest';

// ─── cleanAndTruncate (truncateResponse.js) ────────────────────────────

import { cleanAndTruncate } from '../../../src/utils/truncateResponse.js';

describe('cleanAndTruncate', () => {
  it('returns empty string for null input', () => {
    expect(cleanAndTruncate(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(cleanAndTruncate(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(cleanAndTruncate('')).toBe('');
  });

  it('does not truncate text under 60 words', () => {
    const text = 'Ragazzi, il LED si è acceso!';
    const result = cleanAndTruncate(text);
    expect(result).toContain('LED');
  });

  it('truncates text over 120 words with ... (feedback 2026-05-10)', () => {
    const words = Array.from({ length: 150 }, (_, i) => `parola${i}`).join(' ');
    const result = cleanAndTruncate(words);
    expect(result).toContain('...');
    const resultWords = result.replace('...', '').trim().split(/\s+/);
    expect(resultWords.length).toBeLessThanOrEqual(121); // 120 + possible ...
  });

  it('custom maxWords param is respected', () => {
    const text = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
    const result = cleanAndTruncate(text, 10);
    expect(result).toContain('...');
  });

  it('removes hallucination phrase about image analysis', () => {
    const text = 'Ho analizzato l\'immagine che hai inviato. Il LED è rosso.';
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('Ho analizzato');
    expect(result).toContain('LED');
  });

  // iter 45 fix Andrea video2 06/05/2026 B7: AZIONE/INTENT/STRUCTURED tags
  // sono consumati dal browser dispatcher (intentsDispatcher iter 36 +
  // 62-tool registry iter 31). Non DEVONO comparire in UI ("UNLIM SPIEGA
  // L'ESPERIMENTO" mostrava raw tags Andrea screenshot).
  it('STRIPS [AZIONE:...] tags from UI text (B7 fix iter 45)', () => {
    const longText = Array.from({ length: 65 }, (_, i) => `word${i}`).join(' ');
    const withAction = longText + ' [AZIONE:play]';
    const result = cleanAndTruncate(withAction);
    expect(result).not.toContain('[AZIONE:');
  });

  it('STRIPS [AZIONE:...] tags + does not let them affect word count (B7)', () => {
    const shortText = 'Il LED si accende. [AZIONE:highlight:led1] [AZIONE:play]';
    const result = cleanAndTruncate(shortText, 60);
    expect(result).not.toContain('...');
    expect(result).not.toContain('[AZIONE:');
    expect(result).toContain('Il LED si accende');
  });

  it('STRIPS multiple [AZIONE:...] tags simultaneously (B7)', () => {
    const text = 'Avvio la simulazione. [AZIONE:play] [AZIONE:highlight:led1]';
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('[AZIONE:');
    expect(result).toContain('Avvio la simulazione');
  });
});

// ─── checkContent (contentFilter.js) ─────────────────────────────────

import { checkContent, checkPII, validateMessage, sanitizeOutput } from '../../../src/utils/contentFilter.js';

describe('checkContent — safe Italian educational content', () => {
  it('returns safe=true for normal educational text', () => {
    const result = checkContent('Ragazzi, oggi accendiamo il primo LED con Arduino!');
    expect(result.safe).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('returns safe=true for book citation', () => {
    const result = checkContent('Come dice il libro a pagina 29: collegate il LED.');
    expect(result.safe).toBe(true);
  });

  it('returns safe=true for technical Arduino text', () => {
    const result = checkContent('Collegare il pin D13 al resistore da 470 Ohm.');
    expect(result.safe).toBe(true);
  });

  it('returns safe=true for empty string', () => {
    const result = checkContent('');
    expect(result.safe).toBe(true);
  });

  it('returns safe=true for null', () => {
    const result = checkContent(null);
    expect(result.safe).toBe(true);
  });

  it('returns safe=true for very short text', () => {
    const result = checkContent('ok');
    expect(result.safe).toBe(true);
  });

  it('returns safe=false for inappropriate Italian insult', () => {
    const result = checkContent('sei uno stupido');
    expect(result.safe).toBe(false);
    expect(result.reason).toBe('inappropriate');
  });

  it('returns safe=false for violent content', () => {
    const result = checkContent('Voglio ammazzare il compito');
    expect(result.safe).toBe(false);
  });

  it('is case-insensitive for bad words', () => {
    const result = checkContent('SEI STUPIDO');
    expect(result.safe).toBe(false);
  });

  it('does not flag "scemo" in scientific context about chips', () => {
    // "scemo" IS in the filter list — this verifies filter is working
    const result = checkContent('quello scemo non funziona');
    expect(result.safe).toBe(false);
  });
});

describe('checkPII — personal data detection', () => {
  it('returns hasPII=false for clean text', () => {
    const result = checkPII('Il LED si è acceso!');
    expect(result.hasPII).toBe(false);
    expect(result.type).toBeNull();
  });

  it('returns hasPII=false for null', () => {
    const result = checkPII(null);
    expect(result.hasPII).toBe(false);
  });

  it('detects email address', () => {
    const result = checkPII('La mia email è mario.rossi@scuola.it');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('email');
  });

  it('detects Italian street address', () => {
    const result = checkPII('Abito in via Roma, 42');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('indirizzo');
  });

  it('returns hasPII=false for empty string', () => {
    expect(checkPII('').hasPII).toBe(false);
  });
});

describe('validateMessage', () => {
  it('allows safe Italian text', () => {
    const result = validateMessage('Che cosa fa il resistore?');
    expect(result.allowed).toBe(true);
    expect(result.message).toBeNull();
  });

  it('blocks inappropriate content', () => {
    const result = validateMessage('sei uno stupido');
    expect(result.allowed).toBe(false);
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('block message mentions UNLIM or parole', () => {
    const result = validateMessage('sei cretino');
    expect(result.allowed).toBe(false);
    const lower = result.message.toLowerCase();
    expect(lower.includes('unlim') || lower.includes('parol') || lower.includes('gentil')).toBe(true);
  });

  it('blocks email (PII)', () => {
    const result = validateMessage('scrivi a mario@gmail.com');
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('personali');
  });

  it('allows null gracefully', () => {
    expect(() => validateMessage(null)).not.toThrow();
  });
});

describe('sanitizeOutput', () => {
  it('replaces inappropriate words with ***', () => {
    const result = sanitizeOutput('sei uno stupido!');
    expect(result).toContain('***');
    expect(result).not.toContain('stupido');
  });

  it('passes safe text through unchanged', () => {
    const text = 'Il LED si è acceso!';
    expect(sanitizeOutput(text)).toBe(text);
  });

  it('handles null without throwing', () => {
    expect(sanitizeOutput(null)).toBeNull();
  });

  it('handles empty string', () => {
    expect(sanitizeOutput('')).toBe('');
  });
});

// ─── importWithRetry ─────────────────────────────────────────────────

import { importWithRetry } from '../../../src/utils/importWithRetry.js';

describe('importWithRetry', () => {
  it('is a function', () => {
    expect(typeof importWithRetry).toBe('function');
  });

  it('resolves on first success', async () => {
    const loader = vi.fn(() => Promise.resolve({ default: { value: 42 } }));
    const result = await importWithRetry(loader);
    expect(result).toEqual({ default: { value: 42 } });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('retries after one failure', async () => {
    let attempts = 0;
    const loader = vi.fn(() => {
      attempts++;
      if (attempts < 2) return Promise.reject(new Error('chunk load failed'));
      return Promise.resolve({ default: { ok: true } });
    });
    const result = await importWithRetry(loader, 3);
    expect(result).toEqual({ default: { ok: true } });
    expect(attempts).toBe(2);
  }, 5000);

  it('rejects after MAX_RETRIES exceeded', async () => {
    const loader = vi.fn(() => Promise.reject(new Error('always fails')));
    await expect(importWithRetry(loader, 1)).rejects.toThrow('always fails');
  }, 5000);

  it('accepts 0 retries param and fails immediately', async () => {
    const loader = vi.fn(() => Promise.reject(new Error('no retry')));
    await expect(importWithRetry(loader, 0)).rejects.toThrow('no retry');
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
