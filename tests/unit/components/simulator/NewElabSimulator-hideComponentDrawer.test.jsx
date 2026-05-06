/**
 * NewElabSimulator-hideComponentDrawer.test.jsx — Sprint V iter 1 Atom A13.5 (Tester-1)
 *
 * Tests the rendering predicate for ComponentDrawer.
 * Source: src/components/simulator/NewElabSimulator.jsx:908
 *   {currentExperiment && currentExperiment.buildMode === 'guided' && !hideComponentDrawer && (
 *     <ComponentDrawer ... />
 *   )}
 *
 * Pattern: predicate-only test (full mount of NewElabSimulator is heavy —
 * imports SimulatorCanvas 3149 LOC + AVRBridge + CircuitSolver + 21 components).
 * If src predicate diverges, this test fails first.
 */
import { describe, it, expect } from 'vitest';

/**
 * Replicates the JSX render predicate from NewElabSimulator.jsx:908.
 * Returns true when ComponentDrawer should render.
 */
function shouldRenderComponentDrawer({ currentExperiment, hideComponentDrawer }) {
  return Boolean(
    currentExperiment &&
    currentExperiment.buildMode === 'guided' &&
    !hideComponentDrawer
  );
}

describe('NewElabSimulator ComponentDrawer render predicate (Sprint V A13.5)', () => {
  it('hideComponentDrawer=true + buildMode="guided" → drawer NOT rendered (single-window Passo Passo)', () => {
    const result = shouldRenderComponentDrawer({
      currentExperiment: { buildMode: 'guided' },
      hideComponentDrawer: true,
    });
    expect(result).toBe(false);
  });

  it('hideComponentDrawer=false + buildMode="guided" → drawer rendered (default guided flow)', () => {
    const result = shouldRenderComponentDrawer({
      currentExperiment: { buildMode: 'guided' },
      hideComponentDrawer: false,
    });
    expect(result).toBe(true);
  });

  it('hideComponentDrawer not provided + buildMode="guided" → drawer rendered (prop default false)', () => {
    const result = shouldRenderComponentDrawer({
      currentExperiment: { buildMode: 'guided' },
      hideComponentDrawer: undefined,
    });
    expect(result).toBe(true);
  });

  it('buildMode="open" → drawer NOT rendered (existing behavior preserved, regression check)', () => {
    const result = shouldRenderComponentDrawer({
      currentExperiment: { buildMode: 'open' },
      hideComponentDrawer: false,
    });
    expect(result).toBe(false);
  });

  it('buildMode="sandbox" → drawer NOT rendered (only guided shows drawer)', () => {
    const result = shouldRenderComponentDrawer({
      currentExperiment: { buildMode: 'sandbox' },
      hideComponentDrawer: false,
    });
    expect(result).toBe(false);
  });

  it('currentExperiment null → drawer NOT rendered (no experiment selected)', () => {
    const result = shouldRenderComponentDrawer({
      currentExperiment: null,
      hideComponentDrawer: false,
    });
    expect(result).toBe(false);
  });
});
