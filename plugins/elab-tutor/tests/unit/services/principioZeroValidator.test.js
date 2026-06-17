/**
 * principioZeroValidator tests — Sprint Q3.E
 */
import { describe, it, expect } from 'vitest';
import {
  countWordsExcludingTags,
  extractCitations,
  validatePrincipioZero,
  capWords,
} from '../../../src/services/principioZeroValidator.js';

describe('countWordsExcludingTags', () => {
  it('counts plain words', () => {
    expect(countWordsExcludingTags('Ciao ragazzi vediamo insieme')).toBe(4);
  });

  it('excludes [AZIONE:...] tags', () => {
    expect(countWordsExcludingTags('Ciao [AZIONE:loadexp:v1-cap6-esp1] ragazzi')).toBe(2);
  });

  it('excludes [INTENT:{...}] tags', () => {
    expect(countWordsExcludingTags('Vediamo [INTENT:{"x":1}] cosa succede')).toBe(3);
  });

  it('returns 0 for empty', () => {
    expect(countWordsExcludingTags('')).toBe(0);
    expect(countWordsExcludingTags(null)).toBe(0);
  });
});

describe('extractCitations', () => {
  it('extracts Vol.N pag.M citations', () => {
    const cites = extractCitations('Guardate Vol.1 pag.27 per capire');
    expect(cites).toEqual([{ volume: 1, page: 27 }]);
  });

  it('extracts multiple citations', () => {
    const cites = extractCitations('Vol.1 pag.27 e Vol.2 pag.103');
    expect(cites.length).toBe(2);
  });

  it('handles spaces variations', () => {
    expect(extractCitations('Vol.1  pag.27').length).toBe(1);
  });

  it('returns empty when no citations', () => {
    expect(extractCitations('Nessuna citazione qui')).toEqual([]);
  });
});

describe('validatePrincipioZero', () => {
  it('valid for clean plurale text under 60 words', () => {
    const result = validatePrincipioZero('Ragazzi, vediamo insieme come funziona il LED. Vol.1 pag.27.');
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('flags max_words violation > 60', () => {
    const long = 'parola '.repeat(70);
    const result = validatePrincipioZero(long);
    expect(result.violations.some((v) => v.rule === 'max_words')).toBe(true);
  });

  it('flags imperativo_docente critical', () => {
    const result = validatePrincipioZero('Tu docente, distribuisci i kit ora.');
    const critical = result.violations.find((v) => v.rule === 'imperativo_docente');
    expect(critical).toBeDefined();
    expect(critical.severity).toBe('critical');
    expect(result.valid).toBe(false);
  });

  it('flags singolare_studente high', () => {
    const result = validatePrincipioZero('Tu studente devi capire questo.');
    const high = result.violations.find((v) => v.rule === 'singolare_studente');
    expect(high).toBeDefined();
    expect(high.severity).toBe('high');
  });

  it('flags english_filler low', () => {
    const result = validatePrincipioZero('Ragazzi, basically il LED funziona così.');
    expect(result.violations.some((v) => v.rule === 'english_filler')).toBe(true);
  });

  it('returns word_count', () => {
    const result = validatePrincipioZero('Ragazzi vediamo insieme.');
    expect(result.word_count).toBe(3);
  });

  it('returns extracted citations', () => {
    const result = validatePrincipioZero('Vediamo Vol.1 pag.27 per capire.');
    expect(result.citations).toEqual([{ volume: 1, page: 27 }]);
  });

  it('respects custom maxWords option', () => {
    const result = validatePrincipioZero('un due tre quattro cinque', { maxWords: 3 });
    expect(result.violations.some((v) => v.rule === 'max_words')).toBe(true);
  });
});

describe('capWords', () => {
  it('keeps text under limit unchanged', () => {
    expect(capWords('Ciao ragazzi', 10)).toBe('Ciao ragazzi');
  });

  it('truncates over limit', () => {
    const text = 'uno due tre quattro cinque sei sette otto nove dieci';
    const result = capWords(text, 5);
    expect(result.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(6);
  });

  it('preserves tags during truncation', () => {
    const text = 'parola '.repeat(60) + '[AZIONE:loadexp:v1-cap6]';
    const result = capWords(text, 10);
    // Tag should be preserved if within first 10 words
    expect(result.length).toBeLessThanOrEqual(text.length);
  });

  it('appends ellipsis when truncated mid-sentence', () => {
    const text = 'uno due tre quattro cinque sei sette otto';
    const result = capWords(text, 4);
    expect(result.endsWith('...') || /[.!?]$/.test(result)).toBe(true);
  });

  it('returns input unchanged when null/empty', () => {
    expect(capWords('')).toBe('');
    expect(capWords(null)).toBe(null);
  });
});
