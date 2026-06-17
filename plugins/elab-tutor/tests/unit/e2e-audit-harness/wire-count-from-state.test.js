import { describe, it, expect } from 'vitest';
import { extractWireCount } from '../../e2e/helpers/wire-count.js';

/**
 * Iter-29 root-cause regression test (companion to
 * tests/unit/audit/wires-measurement-source.test.js).
 *
 * useSimulatorAPI.getCircuitState() returns `connections` (not `wires`).
 * Audit harness 29-92-esperimenti-audit.spec.js was reading `state.wires`,
 * which is undefined → ALL 94 esperimenti reported wires_actual=0.
 *
 * This file historically inlined a private getWireCount helper; iter-29
 * Task 29.2 PIVOT centralized the contract in tests/e2e/helpers/wire-count.js.
 * Both unit-test files import the canonical helper to guarantee single source
 * of truth.
 *
 * See docs/audits/iter-29-wires-root-cause.md for the falsified
 * mountExperiment-schema-gap hypothesis.
 */
describe('audit harness wire count extraction (companion regression)', () => {
  it('reads connections field when getCircuitState returns connections shape', () => {
    const state = { connections: [{ from: 'a', to: 'b' }, { from: 'c', to: 'd' }] };
    expect(extractWireCount(state)).toBe(2);
  });

  it('falls back to wires field for legacy shape', () => {
    const state = { wires: [{ from: 'a', to: 'b' }] };
    expect(extractWireCount(state)).toBe(1);
  });

  it('prefers connections over wires when both present', () => {
    const state = {
      connections: [{ from: 'a', to: 'b' }, { from: 'c', to: 'd' }],
      wires: [{ from: 'x', to: 'y' }],
    };
    expect(extractWireCount(state)).toBe(2);
  });

  it('returns 0 when neither field present', () => {
    expect(extractWireCount({})).toBe(0);
    expect(extractWireCount(null)).toBe(0);
    expect(extractWireCount(undefined)).toBe(0);
  });
});
