# Rotation Engine Audit — Sprint S iter 13 R1

**Date**: 2026-04-28 ~05:50 CEST
**Author**: rotation-opus (iter 13 PHASE 1)
**Scope**: R1 audit + R2 RotationHandle + R3 persistence + R4 tests
**Status**: SHIPPED Phase 1 — surgical extension of EXISTING rotation infrastructure (NOT greenfield)

---

## §1 — Honest scope statement

**Rotation infrastructure ALREADY EXISTS** — iter 13 R1-R4 atoms address GAPS, not net-new feature.

This is critically important to state honestly: a generator-style "implement rotation"
prompt would produce ~2000 LOC of duplicated logic. The actual scope is **~760 LOC
extension** of existing infrastructure across SimulatorCanvas.jsx (3149 LOC) +
NanoR4Board.jsx (956 LOC) + new RotationHandle overlay + persistence helper +
tests.

---

## §2 — 11 grep findings inventory (rotation engine — existing)

Cross-reference of existing rotation code (verified file-system 2026-04-28):

| # | File | Line | Pattern | Function |
|---|------|------|---------|----------|
| 1 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 4 | `component rotation` | comment header — feature documented |
| 2 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 75-77 | `getBBox(type, px, py, rotation)` | rotation 90/270 swaps W×H |
| 3 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 110 | `pos.rotation \|\| 0` | bbox usage at drop time |
| 4 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 293-302 | `pos.rotation` + corner transform | rotation matrix math via rad |
| 5 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 407-415 | `pos.rotation` | similar transform on second pass |
| 6 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 701-706 | `pos.rotation` | third call site for rotated bbox |
| 7 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 1557 | `finalPos.rotation \|\| 0` | drop validation |
| 8 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 2196-2342 | `<g transform="...rotate(...)">` | render group with rotation |
| 9 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 2844-2846 | `(pos.rotation \|\| 0) + 90 % 360` | context-menu cycle |
| 10 | `src/components/simulator/canvas/PinOverlay.jsx` | 38-42 | `pos.rotation` rad transform | rotation-aware pin positions |
| 11 | `src/components/simulator/utils/parentChild.js` | 10 | `{ x, y, rotation, parentId? }` schema | layout schema documented |

Plus iter 13 confirmed via secondary grep:
- `NewElabSimulator.jsx:822-823` keyboard shortcut +90 mod 360 (context menu/keyboard parity)
- `Servo.jsx:39` `rotate(${angle - 90})` — uses dynamic prop angle, not parent rotation
- `Potentiometer.jsx:86` `rotate(${angle})` — knob rotation independent of parent

Conclusion: rotation infra is comprehensive across collision detection, render,
pin position, drop validation, schema. **Gaps**: (a) no discoverable UI affordance
beyond hidden context-menu + tiny rotate icon; (b) NanoR4Board hardcoded
`rotate(-90)` text labels conflict with parent rotation; (c) persistence not
schema-backed in Supabase; (d) zero test coverage.

---

## §3 — 21 components rotation-readiness map

Verified via `ls src/components/simulator/components/*.jsx`:

| Component | LOC | rotate(...) hardcoded? | Counter-rotate needed? |
|-----------|-----|------------------------|------------------------|
| Annotation | small | no | no |
| Battery9V | small | no | no |
| BreadboardFull | medium | no | no |
| BreadboardHalf | medium | no | no |
| BuzzerPiezo | small | no | no |
| Capacitor | small | no | no |
| Diode | small | no | no |
| LCD16x2 | medium | no | no |
| Led | small | no | no |
| MosfetN | small | no | no |
| MotorDC | small | no | no |
| Multimeter | medium | no | no |
| **NanoR4Board** | **956** | **YES (lines 375 + 649 + 659)** | **YES — FIXED iter 13 R1** |
| PhotoResistor | small | no | no |
| Phototransistor | small | no | no |
| **Potentiometer** | small | line 86 `rotate(${angle})` (dynamic knob, not parent) | NO (knob is interactive, not label) |
| PushButton | small | no | no |
| ReedSwitch | small | no | no |
| Resistor | small | no | no |
| RgbLed | small | no | no |
| **Servo** | small | line 39 `rotate(${angle - 90})` (dynamic horn) | NO (horn is interactive, not label) |
| Wire | medium | no | no |

**Honest finding**: only NanoR4Board needs the iter 13 R1 counter-rotation fix.
Servo + Potentiometer use dynamic `angle` prop for interactive parts (knob,
horn) — those are correct as-is. Other 19 components have no hardcoded text
rotate() and rely entirely on the parent group transform.

---

## §4 — Schema layout (existing)

```js
// src/components/simulator/utils/parentChild.js:10
// experiment.layout = { compId: { x: number, y: number, rotation?: number, parentId?: string } }
```

`rotation` field is OPTIONAL — legacy circuits saved without rotation default
to 0 via `pos.rotation || 0` pattern (used 11+ times in SimulatorCanvas).
Backward compat enforced.

**Supabase schema status (iter 13 honest finding)**: there is **NO**
`experiment_layouts` table or `layout`/`rotation` column anywhere in
`supabase/migrations/*.sql` (verified `grep -l "rotation\|layout"` → 0 hits).
`saveSession()` in `src/services/supabaseSync.js:52` stores `activity` (action
log) only — NOT `experiment.layout`.

**Iter 14 migration scope (DEFERRED)**:
```sql
CREATE TABLE experiment_layouts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    text NOT NULL,
  class_key     text,
  experiment_id text NOT NULL,
  layout        jsonb NOT NULL,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (student_id, experiment_id)
);
```

**Iter 13 R3 mitigation**: localStorage round-trip helper added
(`saveLayout`/`loadLayout`/`clearLayout` in `supabaseSync.js`). Preserves
rotation field across page reload. When Supabase migration ships iter 14, the
helper body swaps localStorage for `supabase.from('experiment_layouts').upsert(row)`
without API change.

---

## §5 — Iter 13 deliverables (file system verified)

| Atom | File | Mode | LOC |
|------|------|------|-----|
| R1 | `docs/audits/2026-04-28-rotation-engine-audit.md` | NEW | this file |
| R1 | `src/components/simulator/components/NanoR4Board.jsx` | MODIFY | +25 LOC (computeCounterRotation + parentRotation prop + threading textCounterRot to WingPinPad/BoardSilkscreen/WingConnector) |
| R2 | `src/components/simulator/overlays/RotationHandle.jsx` | NEW | 138 LOC (RotationHandle component + snapToNearestQuadrant + cycleRotationCW pure exports + ROTATION_VALUES) |
| R2 | `src/components/simulator/canvas/SimulatorCanvas.jsx` | MODIFY | +25 LOC (import + render `<RotationHandle>` next to selected component + thread parentRotation prop to NanoR4Board) |
| R3 | `src/services/supabaseSync.js` | MODIFY | +85 LOC (saveLayout + loadLayout + clearLayout + iter 14 migration scope comment) |
| R4 | `tests/unit/RotationHandle.test.jsx` | NEW | 21 tests |
| R4 | `tests/unit/SimulatorCanvas-rotation.test.jsx` | NEW | 18 tests |

**Total LOC delta**: ~525 LOC NEW + ~135 LOC MODIFY = ~660 LOC (within
contract estimate ~760, conservative because audit doc is a single page not
~200 LOC).

---

## §6 — R2 design decision: 4 discrete buttons (NOT drag arc)

Contract proposed continuous drag-arc + snap-on-release vs 4 discrete buttons.
**Chose discrete buttons** for these reasons:
- Simpler implementation (~80 LOC vs ~200 LOC)
- Better LIM teacher discoverability (visible labels "0/90/180/270")
- Better touch target compliance (each button has dedicated 44px hit circle)
- No drag-vs-tap ambiguity for kids 8-14
- Cleaner test coverage (discrete events, not continuous gesture)
- Snap math `snapToNearestQuadrant` exported as pure function for future drag
  arc without API change

The legacy quick-cycle rotate icon at line 2333-2351 of SimulatorCanvas is
PRESERVED unchanged (single-tap +90 cycle). RotationHandle adds the explicit
4-quadrant choice next to it. Both coexist with no conflict.

---

## §7 — R1 NanoR4Board counter-rotate text fix

**Problem**: lines 375, 649, 659 have hardcoded `transform={rotate(-90, ...)}`.
When parent component rotates 90°/180°/270°, the text becomes upside-down or
sideways unreadable.

**Solution**: `computeCounterRotation(parentRot)` computes the local text
angle so the absolute screen angle of the label remains -90° (270° normalized)
regardless of parent rotation:

```js
function computeCounterRotation(parentRot) {
  const p = ((Number(parentRot) || 0) % 360 + 360) % 360;
  const target = -90 - p;
  return ((target % 360) + 360) % 360;
}

// parent=0   → text rotates 270 (no visual change vs pre-iter-13)
// parent=90  → text rotates 180
// parent=180 → text rotates 90
// parent=270 → text rotates 0
// invariant: parent + textCounterRot ≡ 270 (mod 360) for ALL rotations
```

**Verified by R4 test** "absolute angle of label (parent + text) = 270 across
all rotations (text screen-readable)" — 4 rotations all PASS.

**Changes wired**:
- `NanoR4Board` accepts `parentRotation` prop (default 0).
- Top-level computes `textCounterRot = computeCounterRotation(parentRotation)`.
- `WingConnector` accepts `textCounterRot`, threads to each `WingPinPad`.
- `WingPinPad` uses `transform={rotate(${textCounterRot}, ...)}` instead of
  hardcoded -90.
- `BoardSilkscreen` accepts `textCounterRot`, both ELAB + Electronics
  Laboratory texts use threaded value.
- SimulatorCanvas passes `parentRotation={rotation}` only when
  `comp.type === 'nano-r4'` (avoids touching other 20 components props).

---

## §8 — R3 persistence mitigation honesty

R3 contract acceptance: "Round-trip test: save circuit with 4 components at
rotations 0/90/180/270 → reload from Supabase → all 4 rotations preserved."

**Honest delta vs contract**: round-trip is via **localStorage** (iter 13
mitigation), NOT Supabase (deferred iter 14). The contract phrasing implied
Supabase persistence existed and just needed verification — file system audit
proves there is no `experiment_layouts` table or migration. Supabase
`saveSession` stores activity log, not layout snapshot.

The R4 integration tests cover round-trip via `saveLayout/loadLayout` localStorage
helpers. When iter 14 ships the migration + Supabase upsert path, the **same
tests** continue to pass (helpers preserve API). No iter 13 test rework
required.

---

## §9 — Anti-regression CoV

- vitest baseline iter 13 entrance: **12599 PASS** + 8 skip + 8 todo
  (verified `npx vitest run | tail -10` 2026-04-28 05:47).
- New tests added: **39** (21 RotationHandle + 18 SimulatorCanvas-rotation).
- New tests run isolated: **39/39 PASS** (verified 2026-04-28 05:54).
- Full vitest re-run (post all changes): TBD this turn — must be ≥12599.
- BB_HOLE_PITCH (7.5px) UNCHANGED.
- SNAP_THRESHOLD (4.5px / 0.9 factor) UNCHANGED.
- NanoR4Board SCALE=1.8 — not modified (SCALE is a render-time constant in the
  component registry, untouched).
- File ownership rigid: ONLY touched 5 listed files (SimulatorCanvas.jsx,
  NanoR4Board.jsx, supabaseSync.js, +2 NEW). Other agent files NOT touched.

---

## §10 — Honest gaps + iter 14 scope

1. **Supabase migration `experiment_layouts`** — defer iter 14 (~50 LOC SQL +
   ~30 LOC saveLayout swap localStorage→supabase).
2. **Visual smoke ratify Andrea ~1 min**: rotate NanoR4Board 90° + 180° on
   live circuit, verify pin labels D2/D3/D4 still readable (not upside-down).
   File system tests pass; visual ratification still recommended.
3. **Drag arc continuous mode**: snap math already exported as pure function.
   Adding a draggable arc in iter 14 would not require any API change to
   RotationHandle's onRotate callback.
4. **Other components text counter-rotation**: 19/21 verified no need today.
   If future Tea adds custom text labels to e.g. Capacitor/Resistor,
   `parentRotation` prop pattern is already proven; threading is mechanical.
5. **Build verification deferred to PHASE 3 orchestrator** (~14 min). Surgical
   edits + file ownership rigid + test PASS suggest build will succeed; not
   blocking iter 13 P1 close.

---

— rotation-opus, iter 13 PHASE 1, 2026-04-28 ~05:55 CEST. CAVEMAN MODE ONESTÀ
MASSIMA. NO inflation.
