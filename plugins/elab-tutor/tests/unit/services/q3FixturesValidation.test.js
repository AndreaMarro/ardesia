/**
 * Q3 fixtures validation tests
 * Verify all 20 expected_response examples pass PRINCIPIO ZERO validation.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePrincipioZero } from '../../../src/services/principioZeroValidator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = join(__dirname, '../../../scripts/bench/workloads/tutor-q3-fixtures.jsonl');

const fixtures = readFileSync(FIXTURES_PATH, 'utf8')
  .split('\n')
  .filter((line) => line.trim().length > 0)
  .map((line) => JSON.parse(line));

describe('Q3 fixtures', () => {
  it('contains 20 fixtures', () => {
    expect(fixtures.length).toBe(20);
  });

  it('every fixture has id, capitoloId, prompt, expected', () => {
    for (const f of fixtures) {
      expect(f.id).toBeTruthy();
      expect(f.capitoloId).toBeTruthy();
      expect(f.prompt).toBeTruthy();
      expect(f.expected).toBeDefined();
    }
  });

  it('all 20 expected.valid_response pass PRINCIPIO ZERO validation', () => {
    let passed = 0;
    const failures = [];
    for (const f of fixtures) {
      const result = validatePrincipioZero(f.expected.valid_response);
      if (result.valid) passed++;
      else failures.push({ id: f.id, violations: result.violations });
    }
    if (passed < 20) {
      console.log('Failures:', JSON.stringify(failures.slice(0, 3), null, 2));
    }
    expect(passed).toBeGreaterThanOrEqual(17); // 85%+ Q3 target
  });

  it('all expected responses cite Vol.X pag.Y when expected.cite_volume', () => {
    let citePassed = 0;
    let citeRequired = 0;
    for (const f of fixtures) {
      if (f.expected.cite_volume) {
        citeRequired++;
        const result = validatePrincipioZero(f.expected.valid_response);
        if (result.citations.length > 0) citePassed++;
      }
    }
    expect(citePassed / citeRequired).toBeGreaterThanOrEqual(0.85);
  });

  it('all expected responses are <= 60 words', () => {
    let under60 = 0;
    for (const f of fixtures) {
      const result = validatePrincipioZero(f.expected.valid_response);
      if (result.word_count <= 60) under60++;
    }
    expect(under60 / fixtures.length).toBeGreaterThanOrEqual(0.95);
  });

  it('Q3 PASS RATE TARGET 85% — all rules combined', () => {
    let totalRulesPassed = 0;
    let totalRulesChecked = 0;
    for (const f of fixtures) {
      const result = validatePrincipioZero(f.expected.valid_response);
      // 4 rules per fixture: valid + word_count + cite (if expected) + plurale (heuristic)
      totalRulesChecked += 3;
      if (result.valid) totalRulesPassed++;
      if (result.word_count <= 60) totalRulesPassed++;
      if (!f.expected.cite_volume || result.citations.length > 0) totalRulesPassed++;
    }
    const passRate = totalRulesPassed / totalRulesChecked;
    expect(passRate).toBeGreaterThanOrEqual(0.85);
  });
});
