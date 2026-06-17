import { describe, it, expect } from 'vitest';
import { validatePZv3, isLocaleSupported, listSupportedLocales, detectLocale } from './pz-v3-validator.ts';

describe('validatePZv3 — Italian (production-ready)', () => {
  it('accepts plural-inclusive text with volume citation and no forbidden patterns', () => {
    const text = 'Ragazzi, il LED è come una piccola lampadina. Vediamo insieme sul Vol. 1 pag. 27 come funziona.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(true);
    expect(result.locale).toBe('it');
    expect(result.wordCount).toBeGreaterThan(5);
  });

  it('rejects missing plural marker', () => {
    const text = 'Il circuito funziona correttamente. Controlla i collegamenti.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/plural-inclusive/i);
  });

  it('rejects docente-meta phrase "Docente, leggi"', () => {
    const text = 'Docente, leggi ai ragazzi: il circuito è semplice.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/docente-meta/i);
  });

  it('rejects docente-meta phrase "Proietta sulla LIM"', () => {
    const text = 'Ragazzi, Proietta questo sulla LIM per vedere meglio.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
  });

  it('rejects singular second-person "hai fatto"', () => {
    const text = 'Ragazzi, hai fatto un bel circuito con il Vol. 1 pag. 27.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/singular/i);
  });

  it('rejects singular "il tuo LED"', () => {
    const text = 'Ragazzi, il tuo LED non è acceso. Ricordate Vol. 1 pag. 27.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/singular/i);
  });

  it('rejects LED concept mention without volume citation', () => {
    const text = 'Ragazzi, vediamo insieme come funziona il LED. È un componente importante.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/citation/i);
  });

  it('rejects resistor concept mention without citation', () => {
    const text = 'Ragazzi, provate a mettere la resistenza. Insieme possiamo farlo.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/citation/i);
  });

  it('accepts when citation uses "pag. N"', () => {
    const text = 'Ragazzi, osservate la resistenza. Leggete Vol. 2 pag. 8 insieme per capire.';
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(true);
  });

  it('rejects text exceeding maxWords (80)', () => {
    const padding = Array(90).fill('parola').join(' ');
    const text = `Ragazzi, ${padding} Vol. 1 pag. 27 LED`;
    const result = validatePZv3(text, 'it');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/words exceeds max/i);
  });

  it('returns wordCount for accepted text', () => {
    const text = 'Ragazzi, il circuito funziona bene. Vediamo insieme sul Vol. 1 pag. 15.';
    const result = validatePZv3(text, 'it');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.wordCount).toBeLessThan(20);
  });
});

describe('validatePZv3 — English (beta)', () => {
  it('accepts Kids + LED + page citation', () => {
    const text = "Kids, the LED is similar to a small lamp, page 27 explains it clearly.";
    const result = validatePZv3(text, 'en');
    expect(result.valid).toBe(true);
  });

  it('rejects English text without plural marker', () => {
    const text = 'The LED is broken. Check wires now.';
    const result = validatePZv3(text, 'en');
    expect(result.valid).toBe(false);
  });
});

describe('locale support', () => {
  it('isLocaleSupported returns true for IT/EN/ES/FR/DE', () => {
    for (const loc of ['it', 'en', 'es', 'fr', 'de']) {
      expect(isLocaleSupported(loc), loc).toBe(true);
    }
  });

  it('isLocaleSupported returns false for unknown', () => {
    expect(isLocaleSupported('zz')).toBe(false);
  });

  it('listSupportedLocales returns at least 5 locales', () => {
    expect(listSupportedLocales().length).toBeGreaterThanOrEqual(5);
  });

  it('detectLocale returns "it" for italian keywords', () => {
    expect(detectLocale('Ragazzi, vediamo insieme come funziona')).toBe('it');
  });

  it('detectLocale returns "en" for english keywords', () => {
    expect(detectLocale('Kids, let us see the and together class')).toBe('en');
  });

  it('detectLocale defaults to "it" on empty text', () => {
    expect(detectLocale('xyz abc qwerty')).toBe('it');
  });

  it('detectLocale returns "it" for unknown locale fallback', () => {
    expect(detectLocale('some random noise')).toBe('it');
  });
});
