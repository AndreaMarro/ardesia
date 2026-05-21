/**
 * Compiler — Arduino Code Patterns Validation
 * Verifica che il codice Arduino negli esperimenti sia valido
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read experiment files as text and extract code blocks
function extractCodes() {
  const vol3Path = path.resolve('src/data/experiments-vol3.js');
  const content = fs.readFileSync(vol3Path, 'utf8');

  const codes = [];
  // Match code: `...` or code: "..." patterns
  const codeMatches = [...content.matchAll(/"?code"?:\s*`([\s\S]*?)`/g)];
  codeMatches.forEach(m => {
    codes.push({ code: m[1], source: 'vol3' });
  });

  // Also match code: "..." (single line)
  const codeStrMatches = [...content.matchAll(/"?code"?:\s*"((?:[^"\\]|\\.)*)"/g)];
  codeStrMatches.forEach(m => {
    if (m[1].includes('void')) {
      codes.push({ code: m[1].replace(/\\n/g, '\n'), source: 'vol3' });
    }
  });

  return codes;
}

describe('Arduino Code Patterns — Vol3', () => {
  const codes = extractCodes();

  test('at least 13 experiments have extractable Arduino code', () => {
    expect(codes.length).toBeGreaterThanOrEqual(13);
  });

  test('every code has void setup', () => {
    codes.forEach((c, i) => {
      expect(c.code, `code ${i} missing setup`).toMatch(/void\s+setup/);
    });
  });

  test('every code has void loop', () => {
    codes.forEach((c, i) => {
      expect(c.code, `code ${i} missing loop`).toMatch(/void\s+loop/);
    });
  });

  test('most codes use valid Arduino functions', () => {
    const validFns = ['pinMode', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead', 'delay', 'Serial', 'tone', 'map', 'constrain'];
    let withValid = 0;
    codes.forEach(c => {
      if (c.code.length > 50) {
        const hasValid = validFns.some(fn => c.code.includes(fn));
        if (hasValid) withValid++;
      }
    });
    expect(withValid / codes.length).toBeGreaterThan(0.8);
  });

  test('pin numbers are valid 0-19', () => {
    codes.forEach(c => {
      const pins = [...c.code.matchAll(/pinMode\((\d+)/g)];
      pins.forEach(m => {
        const pin = parseInt(m[1]);
        expect(pin).toBeGreaterThanOrEqual(0);
        expect(pin).toBeLessThanOrEqual(19);
      });
    });
  });

  test('delay values are 1-60000', () => {
    codes.forEach(c => {
      const delays = [...c.code.matchAll(/delay\((\d+)\)/g)];
      delays.forEach(m => {
        const val = parseInt(m[1]);
        expect(val).toBeGreaterThan(0);
        expect(val).toBeLessThanOrEqual(60000);
      });
    });
  });

  test('no dangerous system calls', () => {
    codes.forEach(c => {
      expect(c.code).not.toContain('system(');
    });
  });
});
