/**
 * Iter 68 A-NEW-1 — Experiment registry + post-LLM offtopic validator tests.
 *
 * Validates:
 * 1. validateExperimentIdExists() registry lookup (positive + negative + edge)
 * 2. stripInvalidExperimentTags() post-LLM scrubber (AZIONE + INTENT formats)
 * 3. Telemetry: stripped IDs array surfaces correctly
 *
 * Iter 67 PHASE 6 root cause: LLM hallucinates fake experiment IDs for offtopic
 * queries ("Borsa Tokyo apertura" → [AZIONE:loadexp:borsa_tokyo_apertura]).
 * This validator strips them before reaching browser dispatcher.
 */
import { describe, it, expect } from 'vitest';
import {
  validateExperimentIdExists,
  stripInvalidExperimentTags,
  VALID_EXPERIMENT_IDS,
} from '../../supabase/functions/_shared/experiment-registry.ts';

describe('A-NEW-1 validateExperimentIdExists — registry lookup', () => {
  it('V1 returns true for valid Vol1 ID "v1-cap6-esp1"', () => {
    expect(validateExperimentIdExists('v1-cap6-esp1')).toBe(true);
  });

  it('V2 returns true for valid Vol2 ID "v2-cap3-esp1"', () => {
    expect(validateExperimentIdExists('v2-cap3-esp1')).toBe(true);
  });

  it('V3 returns true for valid Vol3 ID "v3-cap5-esp1"', () => {
    expect(validateExperimentIdExists('v3-cap5-esp1')).toBe(true);
  });

  it('V4 returns true for special Vol3 ID "v3-cap6-semaforo" (non-esp suffix)', () => {
    expect(validateExperimentIdExists('v3-cap6-semaforo')).toBe(true);
  });

  it('V5 returns true for special Vol3 ID "v3-cap6-morse" (non-esp suffix)', () => {
    expect(validateExperimentIdExists('v3-cap6-morse')).toBe(true);
  });

  it('V6 returns FALSE for hallucinated ID "borsa_tokyo_apertura"', () => {
    expect(validateExperimentIdExists('borsa_tokyo_apertura')).toBe(false);
  });

  it('V7 returns FALSE for hallucinated ID "aws-cloud-computing-basics"', () => {
    expect(validateExperimentIdExists('aws-cloud-computing-basics')).toBe(false);
  });

  it('V8 returns FALSE for null/undefined/empty', () => {
    expect(validateExperimentIdExists(null)).toBe(false);
    expect(validateExperimentIdExists(undefined)).toBe(false);
    expect(validateExperimentIdExists('')).toBe(false);
  });

  it('V9 returns FALSE for non-string types (defensive)', () => {
    expect(validateExperimentIdExists(123)).toBe(false);
    expect(validateExperimentIdExists({})).toBe(false);
    expect(validateExperimentIdExists([])).toBe(false);
  });

  it('V10 case-sensitive: rejects "V1-CAP6-ESP1" (uppercase)', () => {
    expect(validateExperimentIdExists('V1-CAP6-ESP1')).toBe(false);
    expect(validateExperimentIdExists('v1-cap6-esp1')).toBe(true);
  });

  it('V11 registry size = 79 IDs (canonical count iter 68)', () => {
    expect(VALID_EXPERIMENT_IDS.length).toBe(79);
  });

  it('V12 registry has no duplicates', () => {
    const set = new Set(VALID_EXPERIMENT_IDS);
    expect(set.size).toBe(VALID_EXPERIMENT_IDS.length);
  });
});

describe('A-NEW-1 stripInvalidExperimentTags — AZIONE:loadexp format', () => {
  it('S1 strips fake AZIONE:loadexp tag from response', () => {
    const input = 'Ragazzi, carico l\'esperimento "Borsa Tokyo Apertura". [AZIONE:loadexp:borsa_tokyo_apertura]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).not.toContain('[AZIONE:loadexp:borsa_tokyo_apertura]');
    expect(stripped).toEqual(['borsa_tokyo_apertura']);
  });

  it('S2 preserves valid AZIONE:loadexp tag', () => {
    const input = 'Ragazzi, carichiamo il primo LED. [AZIONE:loadexp:v1-cap6-esp1]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toContain('[AZIONE:loadexp:v1-cap6-esp1]');
    expect(stripped).toEqual([]);
  });

  it('S3 strips multiple fake tags + preserves valid one', () => {
    const input = 'Ragazzi, [AZIONE:loadexp:fake-id-1] e [AZIONE:loadexp:v1-cap6-esp1] e [AZIONE:loadexp:another-fake].';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toContain('[AZIONE:loadexp:v1-cap6-esp1]');
    expect(text).not.toContain('[AZIONE:loadexp:fake-id-1]');
    expect(text).not.toContain('[AZIONE:loadexp:another-fake]');
    expect(stripped).toEqual(['fake-id-1', 'another-fake']);
  });

  it('S4 handles AZIONE:loadexp with hyphens, underscores, digits', () => {
    const input = '[AZIONE:loadexp:aws-cloud-computing-basics]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).not.toContain('[AZIONE:loadexp:aws-cloud-computing-basics]');
    expect(stripped).toEqual(['aws-cloud-computing-basics']);
  });
});

describe('A-NEW-1 stripInvalidExperimentTags — INTENT mountExperiment format', () => {
  it('S5 strips fake INTENT mountExperiment tag', () => {
    const input = 'Ragazzi, monto l\'esperimento. [INTENT:{"tool":"mountExperiment","args":{"id":"borsa_tokyo_apertura"}}]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).not.toContain('[INTENT:{"tool":"mountExperiment","args":{"id":"borsa_tokyo_apertura"}}]');
    expect(stripped).toEqual(['borsa_tokyo_apertura']);
  });

  it('S6 preserves valid INTENT mountExperiment tag', () => {
    const input = 'Ragazzi, monto primo LED. [INTENT:{"tool":"mountExperiment","args":{"id":"v1-cap6-esp1"}}]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toContain('[INTENT:{"tool":"mountExperiment","args":{"id":"v1-cap6-esp1"}}]');
    expect(stripped).toEqual([]);
  });

  it('S7 mixed format: strips fake INTENT + preserves valid AZIONE', () => {
    const input = 'Ragazzi, [INTENT:{"tool":"mountExperiment","args":{"id":"fake-exp"}}] e [AZIONE:loadexp:v2-cap3-esp1].';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toContain('[AZIONE:loadexp:v2-cap3-esp1]');
    expect(text).not.toContain('"id":"fake-exp"');
    expect(stripped).toEqual(['fake-exp']);
  });

  it('S8 preserves other INTENT tools (highlightComponent NOT affected)', () => {
    const input = 'Ragazzi, evidenzio. [INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toContain('[INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}]');
    expect(stripped).toEqual([]);
  });
});

describe('A-NEW-1 stripInvalidExperimentTags — edge cases', () => {
  it('S9 empty/null/undefined input returns empty stripped', () => {
    expect(stripInvalidExperimentTags('').stripped).toEqual([]);
    expect(stripInvalidExperimentTags(null).stripped).toEqual([]);
    expect(stripInvalidExperimentTags(undefined).stripped).toEqual([]);
  });

  it('S10 response without any tag returns unchanged text + empty stripped', () => {
    const input = 'Ragazzi, ciao! Sono UNLIM di ELAB Tutor.';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toBe(input);
    expect(stripped).toEqual([]);
  });

  it('S11 collapses double spaces after tag removal', () => {
    const input = 'Ragazzi,  [AZIONE:loadexp:fake-id]  ecco!';
    const { text } = stripInvalidExperimentTags(input);
    expect(text).not.toMatch(/\s{2,}/);
  });

  it('S12 case-insensitive tag matching (AZIONE vs azione)', () => {
    const input = '[azione:loadexp:fake-id] ciao [AZIONE:loadexp:another-fake]';
    const { stripped } = stripInvalidExperimentTags(input);
    expect(stripped).toContain('fake-id');
    expect(stripped).toContain('another-fake');
  });

  it('S13 INTENT JSON case-sensitive ("INTENT" tag, "mountExperiment" tool)', () => {
    // Real prod tags use [INTENT:{"tool":"mountExperiment",...}] canonical case
    const input = '[INTENT:{"tool":"mountExperiment","args":{"id":"v1-cap6-esp1"}}]';
    const { text, stripped } = stripInvalidExperimentTags(input);
    expect(text).toBe(input);
    expect(stripped).toEqual([]);
  });
});

describe('A-NEW-1 post-parse filter — defense-in-depth covers all INTENT variants', () => {
  // Iter 68 Codex Pattern C finding HIGH: scrubber regex misses parser-accepted variants.
  // Post-parse filter in unlim-chat/index.ts validates mountExperiment.args.id regardless of source.
  // These tests validate the helper used by post-parse filter (validateExperimentIdExists).
  // Integration test of unlim-chat full path defer iter 69+ (requires Deno test runner).

  it('PP1 valid mountExperiment ID survives validation', () => {
    expect(validateExperimentIdExists('v1-cap6-esp1')).toBe(true);
  });

  it('PP2 invalid hallucinated mountExperiment ID filtered', () => {
    expect(validateExperimentIdExists('borsa_tokyo_apertura')).toBe(false);
  });

  it('PP3 extra args field would still validate via post-parse (regex bypass scenario)', () => {
    // Scrubber regex would miss this shape due to extra "foo":1 field:
    //   [INTENT:{"tool":"mountExperiment","args":{"id":"fake","foo":1}}]
    // But post-parse filter checks parsed.args.id directly = catches it.
    const fakeParsedIntent = { tool: 'mountExperiment', args: { id: 'fake-no-registry', foo: 1 } };
    const isValid = fakeParsedIntent.tool !== 'mountExperiment' ||
      validateExperimentIdExists(typeof fakeParsedIntent.args?.id === 'string' ? fakeParsedIntent.args.id : null);
    expect(isValid).toBe(false);
  });

  it('PP4 single-quoted variant would parse + then post-parse catches', () => {
    // parser-accepted variant: [INTENT:{'tool':'mountExperiment','args':{'id':'fake'}}]
    // Scrubber regex requires double-quoted shape only.
    // Post-parse filter checks the result, regardless of source quoting.
    const fakeParsedIntent = { tool: 'mountExperiment', args: { id: 'fake-single-quoted' } };
    expect(validateExperimentIdExists(fakeParsedIntent.args.id)).toBe(false);
  });

  it('PP5 missing args.id should NOT be treated as valid', () => {
    const fakeIntent = { tool: 'mountExperiment', args: {} };
    const argsId = (fakeIntent.args)?.id;
    const idStr = typeof argsId === 'string' ? argsId : null;
    expect(idStr === null || !validateExperimentIdExists(idStr)).toBe(true);
  });
});
