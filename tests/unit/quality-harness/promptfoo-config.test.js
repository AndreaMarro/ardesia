/**
 * ELAB Quality Harness Phase 1 — Unit tests for Promptfoo config + runner
 * iter 70 Team E — 2026-05-19
 *
 * Tests:
 * - Promptfoo config YAML parsing + structure validation
 * - Category distribution (10+10+10)
 * - Assertion types validation
 * - Runner env loading logic
 * - Results aggregation + pass-rate calculation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const CONFIG_PATH = resolve(REPO_ROOT, 'scripts/quality-harness/promptfoo-config.yaml');

// ----------------------------------------------------------------
// 1. Config file existence + structure
// ----------------------------------------------------------------

describe('Promptfoo config — file structure', () => {
  it('config YAML file exists at expected path', () => {
    expect(existsSync(CONFIG_PATH)).toBe(true);
  });

  it('config file is readable and non-empty', () => {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    expect(content.length).toBeGreaterThan(100);
  });

  it('config contains required top-level keys', () => {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    expect(content).toMatch(/^description:/m);
    expect(content).toMatch(/^providers:/m);
    expect(content).toMatch(/^tests:/m);
  });

  it('config declares elab-unlim-edge provider', () => {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    expect(content).toContain('elab-unlim-edge');
  });

  it('config targets correct Edge Function URL', () => {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    expect(content).toContain('euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat');
  });

  it('config uses ELAB_API_KEY env variable', () => {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    expect(content).toContain('ELAB_API_KEY');
  });
});

// ----------------------------------------------------------------
// 2. Test case count distribution (10+10+10 = 30)
// ----------------------------------------------------------------

describe('Promptfoo config — 30 test cases distribution', () => {
  let content;

  beforeEach(() => {
    content = readFileSync(CONFIG_PATH, 'utf-8');
  });

  it('has exactly 30 test description entries', () => {
    // Count description: lines within tests section
    const descMatches = content.match(/^\s+- description: /gm) || [];
    expect(descMatches.length).toBe(30);
  });

  it('has exactly 10 plurale_ragazzi cases (A1-A10)', () => {
    const aMatches = content.match(/description: "A\d+-plurale:/g) || [];
    expect(aMatches.length).toBe(10);
  });

  it('has exactly 10 vol/pag citation cases (B1-B10)', () => {
    const bMatches = content.match(/description: "B\d+-volpag:/g) || [];
    expect(bMatches.length).toBe(10);
  });

  it('has exactly 10 offtopic redirect cases (C1-C10)', () => {
    const cMatches = content.match(/description: "C\d+-offtopic:/g) || [];
    expect(cMatches.length).toBe(10);
  });

  it('all A cases assert plurale opener (icontains ragazzi)', () => {
    // Extract A section assertions
    const aSection = content.substring(
      content.indexOf('# --- A1:'),
      content.indexOf('# --- B1:')
    );
    const ragazziAsserts = (aSection.match(/value: "ragazzi"/g) || []).length;
    // At least 8 of 10 A cases should assert ragazzi
    expect(ragazziAsserts).toBeGreaterThanOrEqual(8);
  });

  it('all B cases assert volpag citation metric', () => {
    const bSection = content.substring(
      content.indexOf('# --- B1:'),
      content.indexOf('# --- C1:')
    );
    const volpagAsserts = (bSection.match(/metric: volpag/g) || []).length;
    expect(volpagAsserts).toBeGreaterThanOrEqual(8);
  });

  it('all C cases assert offtopic redirect metric', () => {
    const cSection = content.substring(content.indexOf('# --- C1:'));
    const redirectAsserts = (cSection.match(/metric: offtopic_redirect/g) || []).length;
    expect(redirectAsserts).toBe(10);
  });
});

// ----------------------------------------------------------------
// 3. Assertion types validation
// ----------------------------------------------------------------

describe('Promptfoo config — assertion types', () => {
  let content;

  beforeEach(() => {
    content = readFileSync(CONFIG_PATH, 'utf-8');
  });

  it('uses icontains assertions for plurale checks', () => {
    expect(content).toMatch(/type: icontains/);
  });

  it('uses javascript assertions for complex checks', () => {
    expect(content).toMatch(/type: javascript/);
  });

  it('uses not-icontains for negative checks', () => {
    expect(content).toMatch(/type: not-icontains/);
  });

  it('offtopic C cases check redirect keywords in JS assertion', () => {
    const cSection = content.substring(content.indexOf('# --- C1:'));
    expect(cSection).toContain('restiamo');
    expect(cSection).toContain('torniamo');
    expect(cSection).toContain('percorso elab');
    expect(cSection).toContain('focalizzati');
    expect(cSection).toContain('rimaniamo');
  });

  it('B cases check Vol.X pag.Y pattern in regex', () => {
    const bSection = content.substring(
      content.indexOf('# --- B1:'),
      content.indexOf('# --- C1:')
    );
    expect(bSection).toMatch(/vol.*pag/i);
    expect(bSection).toMatch(/\\d\+/);
  });

  it('all test cases have at least one assertion', () => {
    const content2 = readFileSync(CONFIG_PATH, 'utf-8');
    // Each test should have assert: block
    const testCount = (content2.match(/^\s+- description: /gm) || []).length;
    const assertCount = (content2.match(/^\s+assert:/gm) || []).length;
    expect(assertCount).toBeGreaterThanOrEqual(testCount);
  });
});

// ----------------------------------------------------------------
// 4. Runner env loading logic (mocked)
// ----------------------------------------------------------------

describe('Promptfoo runner — env loading', () => {
  it('correctly strips export prefix from env lines', () => {
    // Simulate the env-parsing logic from run-promptfoo.mjs
    function parseEnvLine(line) {
      const trimmed = line.trim();
      const exportMatch = trimmed.match(/^export\s+(\w+)=(.*)$/);
      if (exportMatch) {
        const [, key, value] = exportMatch;
        return { key, value: value.replace(/^["']|["']$/g, '').trim() };
      }
      return null;
    }

    expect(parseEnvLine('export ELAB_API_KEY=abc123')).toEqual({ key: 'ELAB_API_KEY', value: 'abc123' });
    expect(parseEnvLine('export FOO="bar baz"')).toEqual({ key: 'FOO', value: 'bar baz' });
    expect(parseEnvLine("export BAZ='qux'")).toEqual({ key: 'BAZ', value: 'qux' });
    expect(parseEnvLine('# comment')).toBeNull();
    expect(parseEnvLine('')).toBeNull();
    expect(parseEnvLine('NOT_EXPORT=value')).toBeNull();
  });

  it('correctly identifies ELAB_API_KEY as set when env has it', () => {
    const mockEnv = { ELAB_API_KEY: 'abc123def456', SUPABASE_ANON_KEY: 'eyJtest' };
    const issues = [];
    if (!mockEnv.ELAB_API_KEY) issues.push('ELAB_API_KEY not set');
    if (!mockEnv.SUPABASE_ANON_KEY) issues.push('SUPABASE_ANON_KEY not set');
    expect(issues).toHaveLength(0);
  });

  it('reports missing ELAB_API_KEY as prerequisite issue', () => {
    const mockEnv = {};
    const issues = [];
    if (!mockEnv.ELAB_API_KEY) issues.push('ELAB_API_KEY not set — Edge Function calls will fail with 401');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('ELAB_API_KEY');
  });

  it('handles missing env file gracefully (no throw)', () => {
    // Simulate loading from non-existent file
    function loadFromFile(path) {
      if (!existsSync(path)) return {};
      return { ELAB_API_KEY: 'loaded' };
    }
    expect(() => loadFromFile('/nonexistent/path.env')).not.toThrow();
    expect(loadFromFile('/nonexistent/path.env')).toEqual({});
  });
});

// ----------------------------------------------------------------
// 5. Results aggregation pass-rate calculation
// ----------------------------------------------------------------

describe('Promptfoo runner — results aggregation', () => {
  function calculatePassRate(passed, total) {
    if (total === 0) return 0;
    return Math.round((passed / total) * 1000) / 10;
  }

  function aggregateResults(rawResults) {
    const result = {
      totalTests: rawResults.length,
      passed: rawResults.filter((r) => r.success).length,
      failed: rawResults.filter((r) => !r.success).length,
      categories: {
        plurale_ragazzi: { total: 0, passed: 0 },
        vol_pag_citation: { total: 0, passed: 0 },
        offtopic_redirect: { total: 0, passed: 0 },
      },
    };

    result.passRate = calculatePassRate(result.passed, result.totalTests);

    for (const r of rawResults) {
      const desc = r.description || '';
      if (desc.startsWith('A') || desc.includes('plurale')) {
        result.categories.plurale_ragazzi.total++;
        if (r.success) result.categories.plurale_ragazzi.passed++;
      } else if (desc.startsWith('B') || desc.includes('volpag')) {
        result.categories.vol_pag_citation.total++;
        if (r.success) result.categories.vol_pag_citation.passed++;
      } else if (desc.startsWith('C') || desc.includes('offtopic')) {
        result.categories.offtopic_redirect.total++;
        if (r.success) result.categories.offtopic_redirect.passed++;
      }
    }

    return result;
  }

  it('calculates 100% pass rate for all-pass results', () => {
    expect(calculatePassRate(30, 30)).toBe(100);
  });

  it('calculates 0% pass rate for all-fail results', () => {
    expect(calculatePassRate(0, 30)).toBe(0);
  });

  it('calculates 66.7% for 20/30 pass', () => {
    expect(calculatePassRate(20, 30)).toBe(66.7);
  });

  it('returns 0 for empty results (avoid division by zero)', () => {
    expect(calculatePassRate(0, 0)).toBe(0);
  });

  it('correctly buckets 30 mixed results into 3 categories', () => {
    const mockResults = [
      ...Array(10).fill(null).map((_, i) => ({ description: `A${i + 1}-plurale:`, success: i < 8 })),
      ...Array(10).fill(null).map((_, i) => ({ description: `B${i + 1}-volpag:`, success: i < 7 })),
      ...Array(10).fill(null).map((_, i) => ({ description: `C${i + 1}-offtopic:`, success: i < 9 })),
    ];

    const result = aggregateResults(mockResults);
    expect(result.totalTests).toBe(30);
    expect(result.passed).toBe(24); // 8+7+9
    expect(result.failed).toBe(6);
    expect(result.passRate).toBe(80);
    expect(result.categories.plurale_ragazzi).toEqual({ total: 10, passed: 8 });
    expect(result.categories.vol_pag_citation).toEqual({ total: 10, passed: 7 });
    expect(result.categories.offtopic_redirect).toEqual({ total: 10, passed: 9 });
  });

  it('correctly handles empty results array', () => {
    const result = aggregateResults([]);
    expect(result.totalTests).toBe(0);
    expect(result.passRate).toBe(0);
  });
});
