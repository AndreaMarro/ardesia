/**
 * unlimprompts-docente-minor.test.js
 *
 * Sprint U Cycle 2 Fix #4 MINOR — guards docente-framing residue
 * stays cleaned in src/data/experiments-vol{1,2,3}.js unlimPrompt strings.
 *
 * Pre-fix (Cycle 2 Fix #4 entrance): 5 occurrences in vol1.js only
 *   (lines 3586, 3794, 4023, 5912, 6561). vol2.js + vol3.js had 0.
 * Post-fix (Cycle 2 Fix #4 close): 0 occurrences across all 3 files.
 *
 * This test asserts the post-fix invariant + sampled 3 specific
 * unlimPrompt strings to ensure they keep "i ragazzi" / "docente"
 * plurale framing per PRINCIPIO ZERO.
 *
 * Companion codemod:
 *   scripts/codemod/sprint-u-unlimprompts-docente-framing-minor.mjs
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const FILES = [
  resolve(ROOT, 'src', 'data', 'experiments-vol1.js'),
  resolve(ROOT, 'src', 'data', 'experiments-vol2.js'),
  resolve(ROOT, 'src', 'data', 'experiments-vol3.js'),
];

// Read all 3 source files once.
const SOURCES = FILES.map((f) => ({ path: f, text: readFileSync(f, 'utf8') }));

// Extract unlimPrompt strings via String.matchAll (no exec / no shell).
function extractUnlimPrompts(text) {
  // Match `unlimPrompt: "<content>"` allowing escaped quotes inside content.
  const pattern = /unlimPrompt:\s*"((?:[^"\\]|\\.)*)"/g;
  const out = [];
  for (const match of text.matchAll(pattern)) {
    out.push(match[1]);
  }
  return out;
}

const ALL_PROMPTS = SOURCES.flatMap(({ path, text }) =>
  extractUnlimPrompts(text).map((content) => ({ path, content }))
);

describe('Sprint U Cycle 2 Fix #4 MINOR — docente-framing residue cleanup', () => {
  it('extracts a non-trivial number of unlimPrompt strings (sanity)', () => {
    // We expect dozens of unlimPrompts across 3 vol files; assert > 50 to
    // catch a regex regression that silently extracts 0.
    expect(ALL_PROMPTS.length).toBeGreaterThan(50);
  });

  it('NO unlimPrompt string contains "lo studente"', () => {
    const violators = ALL_PROMPTS.filter((p) => /\blo studente\b/.test(p.content));
    expect(violators, JSON.stringify(violators.slice(0, 3), null, 2)).toEqual([]);
  });

  it('NO unlimPrompt string contains "gli studenti"', () => {
    const violators = ALL_PROMPTS.filter((p) => /\bgli studenti\b/.test(p.content));
    expect(violators, JSON.stringify(violators.slice(0, 3), null, 2)).toEqual([]);
  });

  it('NO unlimPrompt string contains "allo studente"', () => {
    const violators = ALL_PROMPTS.filter((p) => /\ballo studente\b/.test(p.content));
    expect(violators, JSON.stringify(violators.slice(0, 3), null, 2)).toEqual([]);
  });

  it('NO unlimPrompt string contains "dello studente"', () => {
    const violators = ALL_PROMPTS.filter((p) => /\bdello studente\b/.test(p.content));
    expect(violators, JSON.stringify(violators.slice(0, 3), null, 2)).toEqual([]);
  });

  it('NO unlimPrompt string contains "agli studenti" or "degli studenti"', () => {
    const violators = ALL_PROMPTS.filter((p) =>
      /\bagli studenti\b/.test(p.content) || /\bdegli studenti\b/.test(p.content)
    );
    expect(violators, JSON.stringify(violators.slice(0, 3), null, 2)).toEqual([]);
  });

  it('NO unlimPrompt contains generic article+studente residue', () => {
    // Catch-all defense. Word "studente" with definite article OR preposition
    // is forbidden in pedagogical framing. "studente di seconda media" (bare,
    // no leading article) is allowed — pattern requires article/prep + studente.
    const PATTERN = /\b(lo|gli|allo|dello|degli|agli)\s+student[ei]\b/i;
    const violators = ALL_PROMPTS.filter((p) => PATTERN.test(p.content));
    expect(violators, JSON.stringify(violators.slice(0, 3), null, 2)).toEqual([]);
  });
});

describe('Sprint U Cycle 2 Fix #4 MINOR — sampled prompts retain plurale framing', () => {
  // Locate prompts post-fix by stable unique substrings from the experiment
  // titles. If the prompts get refactored later, these tests fail loudly.
  function findPromptContaining(needle) {
    return ALL_PROMPTS.find((p) => p.content.includes(needle));
  }

  it('Vol1 "Sfida: aggiungi pulsanti alla lampada" prompt uses docente+ragazzi', () => {
    const p = findPromptContaining("Sfida: aggiungi pulsanti alla lampada");
    expect(p, 'prompt not found').toBeDefined();
    expect(p.content).toMatch(/Aiuta il docente|i ragazzi|docente/);
    expect(p.content).not.toMatch(/\blo studente\b/);
  });

  it('Vol1 "Sfida: aggiungi pulsante all\'esp 8" prompt uses docente+ragazzi', () => {
    const p = findPromptContaining("Sfida: aggiungi pulsante all'esp 8");
    expect(p, 'prompt not found').toBeDefined();
    expect(p.content).toMatch(/Aiuta il docente|i ragazzi|docente/);
    expect(p.content).not.toMatch(/\blo studente\b/);
  });

  it('Vol1 "Il Primo Robot ELAB" prompt uses plurale "i ragazzi" complimento', () => {
    const p = findPromptContaining("Il Primo Robot ELAB");
    expect(p, 'prompt not found').toBeDefined();
    expect(p.content).toMatch(/Complimentati con i ragazzi/);
    expect(p.content).not.toMatch(/\blo studente\b/);
  });
});
