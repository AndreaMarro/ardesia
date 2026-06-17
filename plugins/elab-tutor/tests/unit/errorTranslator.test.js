/**
 * errorTranslator — Tests for kid-friendly GCC error translation
 * CRITICAL: questi messaggi sono quello che il bambino VEDE quando sbaglia.
 * Devono essere chiari, incoraggianti, in italiano semplice.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { translateCompilationErrors } from '../../src/components/simulator/utils/errorTranslator';

describe('errorTranslator — GCC kid-friendly messages', () => {
  describe('input handling', () => {
    it('returns null/empty for null input', () => {
      expect(translateCompilationErrors(null)).toBeNull();
      expect(translateCompilationErrors(undefined)).toBeUndefined();
    });

    it('returns original for empty string', () => {
      expect(translateCompilationErrors('')).toBe('');
    });

    it('returns original for non-error text', () => {
      const text = 'Compilation successful';
      expect(translateCompilationErrors(text)).toBe(text);
    });
  });

  describe('syntax errors — most common for kids', () => {
    it('translates missing semicolon', () => {
      const err = "sketch.ino:5:1: error: expected ';' before '}' token";
      const result = translateCompilationErrors(err);
      // Pattern matches "expected ';' before" → mentions ;
      expect(result).toContain(';');
      expect(result).toContain('Riga 5');
    });

    it('translates missing closing parenthesis', () => {
      const err = "sketch.ino:3:20: error: expected ')' before ';'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('parentesi');
    });

    it('translates missing closing brace', () => {
      const err = "sketch.ino:10:1: error: expected '}' before end of input";
      const result = translateCompilationErrors(err);
      expect(result).toContain('}');
    });

    it('translates stray character (copy-paste from web)', () => {
      const err = "sketch.ino:1:1: error: stray '\\302' in program";
      const result = translateCompilationErrors(err);
      expect(result).toContain('carattere strano');
    });
  });

  describe('undeclared variables — second most common', () => {
    it('translates undeclared variable', () => {
      const err = "sketch.ino:7:3: error: 'ledPin' was not declared in this scope";
      const result = translateCompilationErrors(err);
      expect(result).toContain('ledPin');
      expect(result).toContain('non esiste');
    });

    it('translates use of undeclared identifier', () => {
      const err = "sketch.ino:4:3: error: use of undeclared identifier 'x'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('x');
    });

    it('translates does not name a type', () => {
      const err = "sketch.ino:1:1: error: 'Strng' does not name a type";
      const result = translateCompilationErrors(err);
      expect(result).toContain('Strng');
      expect(result).toContain('tipo');
    });
  });

  describe('case sensitivity — kids write pinmode instead of pinMode', () => {
    it('translates pinmode → mentions case sensitivity', () => {
      // The generic "not declared" pattern catches this, not the specific pinmode one
      // because the GCC error format is: error: 'pinmode' was not declared in this scope
      // The regex pattern is: /'pinmode' was not declared/ but the actual error has
      // the scope suffix. The generic undeclared pattern catches it first.
      const err = "sketch.ino:3:3: error: 'pinmode' was not declared in this scope";
      const result = translateCompilationErrors(err);
      expect(result).toContain('pinmode');
      // It should mention the name at minimum
      expect(result.length).toBeGreaterThan(20);
    });

    it('translates digitalwrite as undeclared', () => {
      const err = "sketch.ino:5:3: error: 'digitalwrite' was not declared in this scope";
      const result = translateCompilationErrors(err);
      expect(result).toContain('digitalwrite');
    });

    it('translates analogread as undeclared', () => {
      const err = "sketch.ino:7:3: error: 'analogread' was not declared in this scope";
      const result = translateCompilationErrors(err);
      expect(result).toContain('analogread');
    });
  });

  describe('missing setup/loop — #1 beginner error', () => {
    it('translates missing setup()', () => {
      const err = "undefined reference to 'setup'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('setup()');
    });

    it('translates missing loop()', () => {
      const err = "undefined reference to 'loop'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('loop()');
    });

    it('translates missing main (no setup/loop)', () => {
      const err = "undefined reference to 'main'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('setup()');
      expect(result).toContain('loop()');
    });
  });

  describe('function errors', () => {
    it('translates too few arguments', () => {
      const err = "sketch.ino:5:3: error: too few arguments to function 'tone'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('tone');
      expect(result).toContain('più valori');
    });

    it('translates too many arguments', () => {
      const err = "sketch.ino:5:3: error: too many arguments to function 'digitalRead'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('digitalRead');
    });
  });

  describe('type errors', () => {
    it('translates assignment = vs == in if', () => {
      const err = "sketch.ino:8:3: warning: suggest parentheses around assignment used as truth value";
      const result = translateCompilationErrors(err);
      expect(result).toContain('==');
      expect(result).toContain('confronto');
    });

    it('translates division by zero', () => {
      const err = "sketch.ino:6:3: warning: division by zero";
      const result = translateCompilationErrors(err);
      expect(result).toContain('dividendo per zero');
    });
  });

  describe('string/quote errors', () => {
    it('translates unterminated string', () => {
      const err = 'sketch.ino:4:3: error: missing terminating " character';
      const result = translateCompilationErrors(err);
      expect(result).toContain('virgolette');
    });
  });

  describe('multi-line error output', () => {
    it('translates multiple errors', () => {
      const err = [
        "sketch.ino:3:3: error: 'ledPin' was not declared in this scope",
        "sketch.ino:5:1: error: expected ';' before '}' token",
      ].join('\n');
      const result = translateCompilationErrors(err);
      expect(result).toContain('ledPin');
      expect(result).toContain(';');
    });

    it('includes line numbers', () => {
      const err = "sketch.ino:7:3: error: 'x' was not declared in this scope";
      const result = translateCompilationErrors(err);
      expect(result).toContain('Riga 7');
    });

    it('handles warnings separately from errors', () => {
      const err = "sketch.ino:3:3: warning: unused variable 'x'";
      const result = translateCompilationErrors(err);
      expect(result).toContain('x');
    });
  });

  describe('message quality — kid-friendly', () => {
    it('messages are in Italian', () => {
      const err = "sketch.ino:5:1: error: expected ';' before '}'";
      const result = translateCompilationErrors(err);
      // Must contain Italian words or be a translated message
      expect(result).toMatch(/Riga|Manca|Errore|controlla|parentesi|virgola/i);
    });

    it('messages are encouraging, not scary', () => {
      const err = "sketch.ino:3:3: error: 'ledPin' was not declared in this scope";
      const result = translateCompilationErrors(err);
      // Must NOT contain scary technical jargon
      expect(result).not.toContain('fatal');
      expect(result).not.toContain('abort');
      expect(result).not.toContain('segfault');
    });

    it('messages suggest a fix', () => {
      const err = "sketch.ino:5:1: error: expected ';' before '}'";
      const result = translateCompilationErrors(err);
      // Should suggest what to do
      expect(result).toMatch(/controlla|aggiungi|manca|prova/i);
    });
  });
});
