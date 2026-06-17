import { friendlyError } from '../../src/components/simulator/utils/friendlyError';
import { describe, it, expect } from 'vitest';

describe('friendlyError', () => {
  it('traduce undefined variable', () => {
    const gcc = "sketch.ino:5:3: error: 'ledPin' was not declared in this scope";
    const friendly = friendlyError(gcc);
    expect(friendly).toContain('ledPin');
    expect(friendly).toContain('non esiste');
    expect(friendly).not.toContain('declared in this scope');
  });

  it('traduce missing semicolon', () => {
    const gcc = "sketch.ino:10:1: error: expected ';' before '}' token";
    const friendly = friendlyError(gcc);
    expect(friendly).toContain('punto e virgola');
  });

  it('traduce missing parenthesis', () => {
    const gcc = "sketch.ino:3:15: error: expected ')' before ';' token";
    const friendly = friendlyError(gcc);
    expect(friendly).toContain('parentesi');
  });

  it('restituisce originale se non riconosciuto', () => {
    const unknown = 'some unknown error that has no pattern';
    expect(friendlyError(unknown)).toBe(unknown);
  });

  it('gestisce null/undefined', () => {
    expect(friendlyError(null)).toBe(null);
    expect(friendlyError(undefined)).toBe(undefined);
    expect(friendlyError('')).toBe('');
  });

  it('include numero riga quando presente', () => {
    const gcc = "sketch.ino:7:5: error: 'x' was not declared in this scope";
    const friendly = friendlyError(gcc);
    expect(friendly).toContain('Riga 7');
  });
});
