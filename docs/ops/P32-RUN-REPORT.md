# P32 — Run Report

## Iter 1 — Phase 0: P31 lockdown, close the pointer-reachability caveat

**Branch / SHA:** `p30/free-manipulation-trace-v0-20260709-185100` @ `6082555b` → +1 commit this iter.
**Single-writer:** clean (0 dirty, no index.lock, HEAD == anchor).
**Security:** diff secret scan 0 hits; CI hygiene secret_scan green.

### Goal
Make PR #150's one documented honesty caveat — real-pointer *reachability* of the
free-mode strip `[data-sim-break]` — either closed by a real test or an honest RED.
(P31 proved the *logic* via `dispatchEvent`; reachability was the open follow-up.)

### What changed
- `apps/studio/e2e/p30-free-manipulation.spec.ts` only:
  - `activateEmbed(page, anchor)` — raw-mouse `dblclick` to activate the Excalidraw
    embed (the single gesture Excalidraw requires; same model as montaggio-canvas).
  - `assertPointerReachable(target)` — after activation, `document.elementFromPoint`
    at the control's center must return the control (or a descendant): proves
    visible + enabled + **topmost** (not overlay/canvas-covered). No click/hover → deterministic.
  - Wired both before the existing break step; `dispatchEvent` retained for the
    **logic** click, labeled as such. Header honesty comment updated.
- No product/shared code touched.

### What was verified
See [P32-GATES.md](P32-GATES.md). Headlines: typecheck 0; p30 e2e ×3 = 3/3, ×5 = 5/5;
regression 2/2 (+1 pre-existing skip); PR #150 CI 4/4.

### Pass/fail table
| Check | Result |
|---|---|
| reachability probe (with activation) | pass |
| p30 trace ×3 / ×5 | 3/3 · 5/5 |
| regression (montaggio + first-led) | 2/2 (+1 skip pre-existing) |
| typecheck | 0 |
| console errors in test | none |

### Honest caveats
- The reachability test proves the break control is **topmost after standard
  activation**. It does not drive a full real-pointer *click-through* to the
  handler (logic still uses `dispatchEvent`) — intentional, to avoid the known
  Excalidraw pointer-routing flake; labeled in the spec header.
- `build` and full `vitest` were not run this iter (e2e-spec-only diff; CI covers them).
- **No Tinkercad parity claimed.** Still trace v0; wide palette / free wire
  connect-retarget / undo-redo / instruments / export remain absent.

### Remaining non-parity areas
Simulator (wide palette, wire first-class, retarget, undo/redo, netlist, DC across
arbitrary topologies), ElabTutor↔graph, LessonOS backend, GoodNotes lavagna, deploy.

### Next smallest slice
See [P32-NEXT.md](P32-NEXT.md). Candidate: un-Draft decision for #150 (Andrea) →
then Phase 1 state audit (read-only) → Phase 5 palette slice 1 (battery9v/wire first-class).

### Should continue? **Yes** — Phase 0 closed green; next is the read-only Phase 1 audit (no code risk).
