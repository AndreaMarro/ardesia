# Iter 29 Task 29.1 — `wires_actual=0` root cause investigation

**Date**: 2026-04-29
**Source audit**: `docs/audits/2026-04-29-iter-29-92-esperimenti-uno-per-uno-audit.md` (Agent D iter 28)
**Investigation**: read-only, file-system grounded only (Andrea iter 21 mandate "esperimenti broken UNO PER UNO")
**Status**: ROOT CAUSE FOUND — single-line API contract mismatch in test harness

---

## Executive summary

`wires_actual=0` is **NOT a production simulator bug**. It is a **harness-side field-name mismatch**:

- The Playwright audit harness (`tests/e2e/29-92-esperimenti-audit.spec.js:175,252`) reads `state.wires`.
- The simulator API (`getCircuitState()` in `src/components/simulator/hooks/useSimulatorAPI.js:136`) returns `connections`, NOT `wires`.
- Result: `state.wires === undefined` → `state?.wires?.length ?? 0 === 0` for **ALL 94 esperimenti** (WORKING + PARTIAL), regardless of underlying wire-rendering correctness.

This invalidates the audit's WORKING/PARTIAL split as a wires-rendering signal. The audit's "P1:no-wires-rendered" finding is a measurement artifact, not a render bug.

---

## Schema delta WORKING vs PARTIAL — H1 REJECTED

Both `v1-cap6-esp1.json` (WORKING ref) and `v1-cap10-esp1.json` (PARTIAL ref) use the **identical** `phases[1].build_circuit.intent.wires` array schema (verified via `node -e ...` direct file read):

```json
"build_circuit": {
  "intent": {
    "components": [ { "type": "...", "id": "..." }, ... ],
    "wires": [ { "from": "bat1:positive", "to": "bb1:bus-top-plus-1", "color": "red" }, ... ]
  }
}
```

WORKING phases[0] keys === PARTIAL phases[0] keys (verified). NO `actions[].type==='connect_wires'` array in either file. **H1 (schema gap) REJECTED — there is no schema delta.**

The harness (line 96-98) ALSO reads `intent.wires` correctly to compute `expectedWireCount`. So both producer + harness agree on `intent.wires` schema for wire-count expectations.

---

## mountExperiment dispatch trace — H2 REJECTED

`mountExperiment(experimentId)` lives at `src/services/simulator-api.js:264-270`:

```js
mountExperiment(experimentId) {
  if (!_simulatorRef?.selectExperiment) return false;
  const exp = findExperimentById(experimentId);  // <-- experiments-index.js, NOT lesson-paths
  if (!exp) return false;
  _simulatorRef.selectExperiment(exp);
  return true;
}
```

`findExperimentById` (in `src/data/experiments-index.js:30`) returns the experiment object from `experiments-vol1/2/3.js`, where wires are stored as `connections` (NOT `wires`). Verified via direct file read: `cap6esp1.connections.length === 6`, `cap6esp1.wires === undefined`, same for cap10-esp1.

`selectExperiment` → `handleSelectExperiment` (`src/components/simulator/hooks/useExperimentLoader.js:156-343`) dispatches the experiment to the simulator state. Custom-overlay arrays are reset (`setCustomConnections([])`) but the experiment's own `connections` array flows through `useMergedExperiment` (`src/components/simulator/hooks/useMergedExperiment.js:48-63`) into `mergedExperiment.connections`. With `buildMode === undefined` (verified for both cap6-esp1 and cap10-esp1), `buildStepIndex = Infinity` → `isBuildActive = false` → full 6-element `mergedConnections` array is returned (line 161-167).

`buildStructuredState()` (`src/components/simulator/hooks/useSimulatorAPI.js:95-151`) returns:

```js
{
  experiment: { id, title, chapter },
  components: [...],
  connections: conns.map(c => ({ from, to, color })),  // <-- "connections", NOT "wires"
  measurements: ...,
  ...
}
```

So mountExperiment DOES dispatch wires correctly into `mergedExperiment.connections`, and `getCircuitState()` DOES surface them — under the field name `connections`. **H2 (mountExperiment dispatch ignoring wires) REJECTED.**

---

## State-SVG divergence audit — H3 CHOSEN (variant: harness-side)

The audit's Playwright harness (`tests/e2e/29-92-esperimenti-audit.spec.js:164-181`):

```js
async function captureCircuitState(page) {
  return page.evaluate(() => {
    const api = window.__ELAB_API;
    const state = api.getCircuitState?.() || api.unlim?.getCircuitState?.() || null;
    return {
      state,
      desc,
      components: state?.components || [],
      wires: state?.wires || [],   // <-- BUG: API returns "connections", not "wires"
    };
  });
}
```

Line 252: `const actualWireCount = circuit?.wires?.length ?? 0;`

Since `getCircuitState()` returns `{ ..., connections: [...], ... }` (NEVER a `wires` key), `state?.wires` is always `undefined` and `actualWireCount` is always `0`. The harness then triggers `P1:no-wires-rendered` (line 298-302) for any esperimento where `expectedWireCount > 0 && actualCompCount > 1`, which matches all 94.

**Confirmed by audit text**: cap6-esp1 (the audit's nominal WORKING reference) reports `wires_actual=0` despite components present and `mount.ok=true`. There is no production esperimento where the audit reports `wires_actual > 0`.

This is **H3, variant**: the divergence is between the test harness's expected field name and the production API's actual field name — not between SVG render and circuit state.

---

## Recommended fix sketch (Task 29.2)

**Single-line fix in harness** — preferred minimal change:

```diff
--- a/tests/e2e/29-92-esperimenti-audit.spec.js
+++ b/tests/e2e/29-92-esperimenti-audit.spec.js
@@ -172,7 +172,7 @@ async function captureCircuitState(page) {
       return {
         state,
         desc,
         components: state?.components || [],
-        wires: state?.wires || [],
+        wires: state?.connections || state?.wires || [],
       };
```

The `|| state?.wires` retains forward-compatibility if the API ever adopts `wires` as a key (or for `api.unlim?.getCircuitState?.()` if it differs).

**Optional complementary fix** in `src/components/simulator/hooks/useSimulatorAPI.js:136` — add `wires` alias for symmetry (kit/volumi morfismo: wire is the user-facing word, connection is engineering-internal):

```diff
       connections: conns.map(conn => ({ from: conn.from, to: conn.to, color: conn.color || 'auto' })),
+      wires: conns.map(conn => ({ from: conn.from, to: conn.to, color: conn.color || 'auto' })),
```

Recommendation: ship harness fix only (Task 29.2 minimal scope). API alias is broader change deferred to follow-up if UNLIM context collector / OpenClaw consumers want the morfismo-aligned naming.

---

## Verification plan for Task 29.2 (do not execute here — Task 29.2)

1. Apply harness fix (`state?.connections || state?.wires`).
2. Re-run `npx playwright test tests/e2e/29-92-esperimenti-audit.spec.js` against production URL.
3. Confirm `wires_actual` matches `wires_expected` for ≥80% of esperimenti (allowing for genuinely non-functional esperimenti separately tracked).
4. Compare new audit JSON vs `2026-04-29-iter-29-92-esperimenti-uno-per-uno-audit.md` — expect WORKING count to climb significantly above 28/94.

---

## File-system evidence references

- Schema diff: `node -e "..."` direct read of `src/data/lesson-paths/v1-cap6-esp1.json` and `src/data/lesson-paths/v1-cap10-esp1.json` — both use `phases[1].build_circuit.intent.wires` (length 6 each).
- Source experiment data: `src/data/experiments-vol1.js` — `connections` (length 6), no `wires` key.
- API surface: `src/components/simulator/hooks/useSimulatorAPI.js:136` — `connections:` key.
- API mount path: `src/services/simulator-api.js:264-270` (mountExperiment) → `selectExperiment` → `handleSelectExperiment` (`src/components/simulator/hooks/useExperimentLoader.js:156-343`) → `mergedExperiment.connections` (`src/components/simulator/hooks/useMergedExperiment.js:48-63,161-167`).
- Harness consumer: `tests/e2e/29-92-esperimenti-audit.spec.js:164-181,252,298-302`.
- Audit source: `docs/audits/2026-04-29-iter-29-92-esperimenti-uno-per-uno-audit.md`.

---

## Open questions (for Task 29.2 reviewer)

1. After the harness fix unmasks true wire-render success, are there genuine PARTIAL esperimenti remaining? Re-running the audit will tell.
2. The 2 BROKEN esperimenti (`v3-cap7-mini`, `v3-cap8-serial`) likely have separate root causes unrelated to this contract bug. Re-audit needed post-fix.
3. Console errors (count 2 per esperimento in audit) are unrelated to this finding — orthogonal investigation.
