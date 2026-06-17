---
from: iter13-coordinator-opus
to: rotation-opus
iter: 13
sprint: S
date: 2026-04-28
timestamp: 053037
atoms_assigned: [R1, R2, R3, R4]
priority: 2 — Circuit rotation
file_ownership_rigid:
  WRITE_NEW:
    - docs/audits/2026-04-28-rotation-engine-audit.md
    - src/components/simulator/overlays/RotationHandle.jsx
    - tests/unit/SimulatorCanvas-rotation.test.jsx
    - tests/integration/rotation-persistence.test.js
  WRITE_MODIFY:
    - src/components/simulator/canvas/SimulatorCanvas.jsx (lines 2196-2342 + 2844-2846 ONLY)
    - src/components/simulator/components/NanoR4Board.jsx (lines 375, 649, 659 ONLY)
    - src/services/api.js (saveSession rotation field preserve VERIFY only)
  READ_ONLY: all_other_repo_files
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.2
loc_estimate: ~760 LOC (audit 200 + UI 200 + persistence 50 + test 250 + NanoR4Board fix 60)
time_estimate: 7h Opus dedicated
completion_msg_required: automa/team-state/messages/rotation-opus-iter13-to-orchestrator-2026-04-28-*.md
---

# Dispatch brief — rotation-opus iter 13

## Self-contained context (NO prior conversation memory)

You are rotation-opus, an Opus 4.7 1M-context agent dispatched by iter13-coordinator for **Sprint S iter 13** of ELAB Tutor. Working directory: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`. Repo HEAD: `9f589ba`.

ELAB has a **proprietary circuit simulator** (`src/components/simulator/`, ~30 components, CircuitSolver MNA/KCL + AVRBridge avr8js, 21 component types breadboard/LED/resistor/Arduino Nano R4 etc.). User Andrea Marro identified iter 13 **Priority 2**: components currently use translation-only positioning. Need rotation 90°/180°/270° support visible to users.

**CRITICAL FINDING from grep**: rotation INFRASTRUCTURE ALREADY EXISTS — this is NOT greenfield:
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (3149 LOC):
  - `getBBox` line 75-77 handles rotation 90/270 swap.
  - Lines 294-302, 407-415, 701-706 transform corners via rad math.
  - Line 2196-2342 render `<g transform={translate + rotate}>` already wired.
  - Line 2844-2846 context menu "rotate" cycles +90°.
- `src/components/simulator/NewElabSimulator.jsx:822-823` keyboard shortcut +90 mod 360.
- `src/components/simulator/utils/parentChild.js:10` layout schema includes rotation field.
- `src/components/simulator/canvas/PinOverlay.jsx:38-41` rotation-aware pin position.

**GAPS to address iter 13**:
- (a) UI affordance discoverability: no visible rotate handle (only hidden context menu + keyboard).
- (b) NanoR4Board (956 LOC) text labels at lines 375, 649, 659 use hardcoded `transform={rotate(-90,...)}` — they conflict when component itself rotates 90/180/270 (text becomes upside-down or sideways unreadable).
- (c) Persistence: verify Supabase `experiment.layout[id].rotation` round-trip (saveSession/loadSession) does NOT strip rotation field.
- (d) Test coverage missing for rotation paths.

CLAUDE.md constraints:
- Regola 9: Touch target ≥44x44px (RotationHandle drag arc).
- Regola 8: Font min 13px (handle label readable).
- File critici: `SimulatorCanvas.jsx` 3149 LOC + `NanoR4Board.jsx` 956 LOC — coordinamento OBBLIGATORIO. NO blanket modifications. Touch ONLY listed line ranges.

## Task scope detailed (4 atoms)

### R1 — Rotation engine extension audit + NanoR4Board text fix (~260 LOC)

Write `docs/audits/2026-04-28-rotation-engine-audit.md` (~200 LOC) covering:

1. All 11 grep findings cross-referenced (lines listed above).
2. Map 21 components in `src/components/simulator/components/` — identify which need parent-rotation-aware text counter-rotate. Prime candidates verified:
   - NanoR4Board (lines 375, 649, 659) CONFIRMED.
   - Servo (line 39) `rotate(${angle - 90})` — angle is param, conditional check needed.
   - Potentiometer (line 86) similar.
3. Schema parentChild.js layout `{ x, y, rotation, parentId? }`.
4. Iter 13 R2/R3/R4 plan.

MODIFY `src/components/simulator/components/NanoR4Board.jsx` lines 375, 649, 659 (~60 LOC):
- Pass `parentRotation` prop down from SimulatorCanvas (already available at line 2196 — `pos.rotation`).
- Conditional text rotate: if `parentRotation === 90` then text `rotate(-90)` becomes `rotate(0)`. If `parentRotation === 180`, text rotates `rotate(0)` (flip). Etc.
- Visual goal: pin labels readable at all 4 rotation states.

**Verify**: `wc -l docs/audits/2026-04-28-rotation-engine-audit.md` ≥200. Visual smoke (Andrea ratify): rotate NanoR4Board 90° → pin labels D2/D3/D4 still readable left-to-right.

### R2 — Rotation UI control (visible affordance) (~200 LOC)

Write NEW `src/components/simulator/overlays/RotationHandle.jsx` (~120 LOC):
- React component `<RotationHandle component={comp} pos={pos} onRotate={callback} />`.
- Renders 3 visible buttons (90° / 180° / 270°) OR drag arc (preferred — drag rotates continuously, releases snaps to nearest 0/90/180/270).
- Touch target each button ≥44px (CLAUDE.md regola 9).
- Visible only when component selected (selectedComponentId match).
- Snap math: `Math.round(continuousAngle / 90) * 90 % 360`.

MODIFY `src/components/simulator/canvas/SimulatorCanvas.jsx` lines 2196-2342 (~80 LOC):
- Render `<RotationHandle>` near selected component group (top-right corner offset).
- Wire `onRotate(newRotation)` → `onLayoutChange(comp.id, { ...pos, rotation: newRotation })` (existing handler line 2342).
- Keep existing context menu rotate (line 2844-2846) as keyboard-accessibility alternate path.

**Verify**: integration test (R4) covers handle click + drag arc snap.

### R3 — Rotation persistence Supabase + serialization (~50 LOC)

MODIFY `src/services/api.js` (1040 LOC, file critico — touch ONLY saveSession path):
- Locate `saveSession()` function. Verify `experiment.layout` is serialized as-is (rotation field present).
- If JSON.stringify path strips rotation, fix via explicit field whitelist.
- Add inline comment `// iter 13 R3: rotation field MUST round-trip Supabase`.

**Verify**: integration test (R4 `tests/integration/rotation-persistence.test.js`) round-trip 4 components rotations 0/90/180/270.

### R4 — Rotation tests unit + integration (~250 LOC)

Write NEW `tests/unit/SimulatorCanvas-rotation.test.jsx` ≥10 tests:
1. `getBBox(type, x, y, 0)` returns canonical w/h.
2. `getBBox(type, x, y, 90)` swaps w/h (line 77 logic).
3. `getBBox(type, x, y, 270)` swaps w/h.
4. Corner transform math (line 294-302) for rotation=90 returns 4 corners rotated 90°.
5. RotationHandle drag arc snaps to nearest 0/90/180/270.
6. Context menu rotate cycles +90 (line 2844-2846).
7. NanoR4Board pin label counter-rotate 90 → text `rotate(0)`.
8. NanoR4Board pin label counter-rotate 180 → text `rotate(0)` (flip handled).
9. Wire pin position via PinOverlay rotation-aware (line 38-41).
10. Collision detection rotated bbox (line 110 `getBBox` integrated).

Write NEW `tests/integration/rotation-persistence.test.js` ≥5 tests:
1. saveSession with rotation=90 → loadSession preserves rotation=90.
2. Round-trip 4 components 0/90/180/270 — all preserved.
3. Default rotation=0 when missing in payload (backward compat).
4. Layout schema validation accepts rotation 0-359 range.
5. Non-90 multiples persist (e.g., rotation=45 if RotationHandle continuous mode).

**Verify**: `npx vitest run tests/unit/SimulatorCanvas-rotation.test.jsx tests/integration/rotation-persistence.test.js` ≥15 PASS + global `npx vitest run | tail -5` ≥12614 PASS (12599 baseline + 15 new).

## Anti-regression mandate (CoV mandatory)

1. `npx vitest run` ≥12599 PASS (iter 12 baseline). Re-run 3× before declaring "tests pass".
2. `npx vitest run -c vitest.openclaw.config.ts` ≥129 PASS (iter 12 baseline) — RotationHandle should NOT touch openclaw, but verify NO accidental cross-contamination.
3. Build PASS check (`npm run build` ~14 min) — RotationHandle is NEW file, may affect bundle. If bundle size delta >5%, document. Orchestrator PHASE 3 runs full build.
4. ZERO touch other agents' files. SimulatorCanvas.jsx is YOUR exclusive WRITE iter 13 (lines 2196-2342 + 2844-2846 only — preserve all other 3000+ LOC unchanged).
5. NanoR4Board.jsx exclusive WRITE (lines 375, 649, 659 only).
6. `automa/baseline-tests.txt` delta ≥0.

## CoV requirements

- 3× verify rule.
- File system verify post-write: `ls -la <file>` each NEW file.
- LOC verify: `wc -l <file>` audit + tests + RotationHandle (estimates ±20%).
- Visual smoke documented (manual ratify Andrea ~1 min): rotate NanoR4Board + 1 other component (Servo or LED) verify pin labels + visuals correct all 4 rotations.
- NO inflation: do NOT claim "rotation is now perfect" — honest scope was extension not greenfield (audit must state this).

## Completion message expected output

Write `automa/team-state/messages/rotation-opus-iter13-to-orchestrator-2026-04-28-<HHMMSS>.md` per coordinator schema (status / atoms / loc / tests / vitest baseline). Honest gaps + ratify request Andrea visual smoke ~1 min.

## Honesty caveats expected in your audit + completion msg

1. **Rotation NOT greenfield**: state explicitly audit §1 "infrastructure exists, R1-R4 address gaps". Honest LOC ~760 (NOT inflated 2000 if greenfield).
2. **NanoR4Board fix scope**: lines 375 + 649 + 659 are pin labels + side text. If grep reveals ADDITIONAL hardcoded `rotate()` transforms in NanoR4Board (line 956 LOC total), document + extend fix accordingly.
3. **21 components in `src/components/simulator/components/`**: only NanoR4Board confirmed needs fix. Audit must verify other 20 (LED, Resistor, Servo, Potentiometer, MotorDC, Multimeter, ReedSwitch, Pushbutton, etc.) — most use simple geometric SVG, no text labels needing counter-rotation. Honest list which 0-5 others may need similar fix.
4. **RotationHandle continuous mode vs snap**: spec proposes drag arc continuous, snap on release. Alternative: 4 discrete buttons (90°/180°/270°/0°) — simpler impl ~80 LOC but less elegant. Choose based on time available.
5. **Persistence backward compat**: existing saved circuits in Supabase may have NO rotation field. R3 must ensure default `rotation: 0` when loading legacy data — test 3 in R4 covers this.
6. **Build PASS risk**: SimulatorCanvas.jsx is file critico (3149 LOC). Even surgical edit may trigger bundle delta. Document `npm run build` post-change pass/fail (orchestrator PHASE 3 verifies, but you can spot-check `npm run build 2>&1 | tail -20`).

## Pattern S race-cond mitigation reminder

You are 1 of 4 parallel OPUS agents (fumetto-opus, design-opus, omniscient-opus). Race-cond fix iter 5+ validated 5×. Iter 12 §7.2 protocol gap: 3/4 agents skipped completion msg emission. **MANDATORY iter 13**: emit completion msg BEFORE final response per §9 contract. Without your msg, scribe-opus PHASE 2 BLOCKED indefinitely (filesystem barrier 4/4).

NO inflation. Caveman mode preferred. ONESTÀ MASSIMA.

— iter13-coordinator-opus, 2026-04-28 05:30:37 CEST.
