/**
 * git_hygiene regex unit test — benchmark.cjs metricGitHygiene
 *
 * Sprint 3 Day 03 (Day 17 cumulative) — Day 16 regex fix validation.
 * Mirrors regex literal from scripts/benchmark.cjs line 143.
 *
 * Purpose: prevent regression on git_hygiene signal detection:
 *   - conventional-commit prefix (feat/fix/chore/docs/...)
 *   - baseline tests count
 *   - CoV 3x/5x markers
 *   - BLOCKER-NNN references
 *   - Test: N/N PASS
 *
 * (c) Andrea Marro — 22/04/2026
 */

import { describe, it, expect } from 'vitest';

// Keep IN SYNC with scripts/benchmark.cjs metricGitHygiene regex.
// If the source regex changes, update here and in benchmark.cjs together.
const HYGIENE_SIGNALS = /(Test:?\s*\d+\/\d+\s*PASS|\b\d+\s*tests?\s*(PASS|passing|pass)\b|baseline\s+tests?\s+\d+|CoV\s*\d+x|BLOCKER-\d+|\b\d{4,}\b\s*PASS|^(feat|fix|chore|docs|style|refactor|test|perf|build|ci)(\([^)]+\))?:)/im;

describe('benchmark.cjs — git_hygiene regex', () => {
  describe('conventional-commit prefix', () => {
    it.each([
      'feat(unlim): add nudge voice',
      'fix(simulator): AVRBridge pin mapping',
      'chore(sett-3 Day 02): state reconcile',
      'docs(adr): ADR-004 Accepted',
      'style: css tokens',
      'refactor(api): extract retry helper',
      'test(e2e): add vitrina smoke',
      'perf(canvas): snap threshold',
      'build(vite): chunk split',
      'ci(workflows): dedupe deploy',
    ])('matches conventional prefix: %s', (msg) => {
      expect(HYGIENE_SIGNALS.test(msg)).toBe(true);
    });

    it('matches case-insensitive prefix', () => {
      expect(HYGIENE_SIGNALS.test('FEAT(area): something')).toBe(true);
    });

    it('rejects non-conventional prefix commits', () => {
      expect(HYGIENE_SIGNALS.test('wip some random change')).toBe(false);
      expect(HYGIENE_SIGNALS.test('updated code')).toBe(false);
    });
  });

  describe('test count signals', () => {
    it('matches Test: N/N PASS', () => {
      expect(HYGIENE_SIGNALS.test('Commit body\n\nTest: 12166/12166 PASS')).toBe(true);
      expect(HYGIENE_SIGNALS.test('Test:12166/12166 PASS')).toBe(true);
    });

    it('matches N tests passing', () => {
      expect(HYGIENE_SIGNALS.test('1578 tests passing')).toBe(true);
      expect(HYGIENE_SIGNALS.test('42 test PASS')).toBe(true);
    });

    it('matches baseline tests count', () => {
      expect(HYGIENE_SIGNALS.test('baseline tests 12166')).toBe(true);
      expect(HYGIENE_SIGNALS.test('baseline test 9846')).toBe(true);
    });

    it('matches large numeric PASS marker', () => {
      expect(HYGIENE_SIGNALS.test('12166 PASS')).toBe(true);
    });
  });

  describe('CoV + BLOCKER refs', () => {
    it('matches CoV Nx', () => {
      expect(HYGIENE_SIGNALS.test('CoV 3x preserved')).toBe(true);
      expect(HYGIENE_SIGNALS.test('ran CoV 5x')).toBe(true);
    });

    it('matches BLOCKER-NNN', () => {
      expect(HYGIENE_SIGNALS.test('resolves BLOCKER-011')).toBe(true);
      expect(HYGIENE_SIGNALS.test('closes BLOCKER-007')).toBe(true);
    });

    it('rejects BLOCKER without digits', () => {
      expect(HYGIENE_SIGNALS.test('BLOCKER: generic')).toBe(false);
    });
  });

  describe('no false positives on empty/noise commits', () => {
    it.each([
      '',
      'minor tweak',
      'stuff',
      'one more change',
    ])('rejects noise: %s', (msg) => {
      expect(HYGIENE_SIGNALS.test(msg)).toBe(false);
    });
  });

  describe('multiline commit bodies', () => {
    it('matches prefix on first line', () => {
      const msg = 'feat(sett-3): Edge Function scaffold\n\nBody details\nMore lines';
      expect(HYGIENE_SIGNALS.test(msg)).toBe(true);
    });

    it('matches signal in body even when header is non-conventional', () => {
      const msg = 'Day 16 closure\n\nCoV 3x verified, baseline 12166 preserved';
      expect(HYGIENE_SIGNALS.test(msg)).toBe(true);
    });
  });
});
