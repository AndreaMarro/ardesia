/**
 * extractWireCount — canonical wire count read from circuit state.
 *
 * Iter-29 Task 29.2 PIVOT (docs/audits/iter-29-wires-root-cause.md).
 *
 * useSimulatorAPI.getCircuitState() (src/components/simulator/hooks/useSimulatorAPI.js:136)
 * returns the field `connections` — an array of `{from, to, color?}` objects.
 *
 * The audit harness `tests/e2e/29-92-esperimenti-audit.spec.js` previously read
 * `state.wires`, which does not exist on the canonical state shape. Result:
 * `actualWireCount === 0` for ALL 94 esperimenti (including known-working
 * reference experiments) — a measurement artifact, NOT an engine/mountExperiment
 * bug. The original Task 29.2 plan assumed mountExperiment was at fault; Task
 * 29.1 investigation FALSIFIED that hypothesis.
 *
 * This helper centralizes the read so the harness and its unit test share a
 * single source of truth. `connections` is canonical; `wires` is a legacy
 * fallback retained for forward-compat in case any older state shape surfaces.
 *
 * Contract:
 *   - connections: Array<{from, to, ...}> takes precedence (even if empty)
 *   - wires: Array<...> used only when connections is absent / non-array
 *   - null / undefined / missing fields → 0
 *
 * @param {object|null|undefined} state - circuit state object from getCircuitState()
 * @returns {number} wire count (length of connections, or wires fallback, or 0)
 */
export function extractWireCount(state) {
  if (!state) return 0;
  // connections is canonical (per useSimulatorAPI.js:136), wires is legacy fallback
  if (Array.isArray(state.connections)) return state.connections.length;
  if (Array.isArray(state.wires)) return state.wires.length;
  return 0;
}
