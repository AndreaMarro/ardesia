import { describe, it, expect } from 'vitest';
import { extractWireCount } from '../../e2e/helpers/wire-count.js';

/**
 * Iter-29 Task 29.2 PIVOT — wires_actual=0 root cause regression test.
 *
 * Task 29.1 investigation (docs/audits/iter-29-wires-root-cause.md) FALSIFIED
 * the original mountExperiment-schema-gap hypothesis. The real root cause:
 *
 *   - tests/e2e/29-92-esperimenti-audit.spec.js read `state?.wires`
 *   - src/components/simulator/hooks/useSimulatorAPI.js getCircuitState()
 *     returns `connections` (NOT `wires`)
 *   - Field name mismatch → actualWireCount === 0 for ALL 94 esperimenti
 *     (including known-working refs) → measurement artifact, not engine bug
 *
 * extractWireCount canonicalizes the read: connections is the canonical field
 * (per useSimulatorAPI.js:136), wires is a legacy fallback. This unit test
 * locks the contract so the harness cannot regress to the broken read.
 *
 * NO src/ change. Engine + mountExperiment are correct. Test harness only.
 */
describe('extractWireCount — audit harness wire count read source', () => {
  it('reads connections field (canonical, per useSimulatorAPI.js:136)', () => {
    const state = { connections: [{ from: 'a', to: 'b' }] };
    expect(extractWireCount(state)).toBe(1);
  });

  it('falls back to wires field when only legacy shape present', () => {
    const state = { wires: [{ from: 'a', to: 'b' }] };
    expect(extractWireCount(state)).toBe(1);
  });

  it('prefers connections over wires even when connections is empty array', () => {
    // connections is canonical: an empty array means "no wires", not "look elsewhere"
    const state = {
      connections: [],
      wires: [{ from: 'a', to: 'b' }],
    };
    expect(extractWireCount(state)).toBe(0);
  });

  it('returns 0 when state has neither field', () => {
    expect(extractWireCount({})).toBe(0);
  });

  it('returns 0 for null / undefined input (defensive)', () => {
    expect(extractWireCount(null)).toBe(0);
    expect(extractWireCount(undefined)).toBe(0);
  });
});
