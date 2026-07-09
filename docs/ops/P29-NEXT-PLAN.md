# P29 — NEXT PLAN

Control question for every change: **"Does it get Andrea to teach with Ardesia tomorrow?"** If no, not P0.

## Reframe (post-recon)
P0 is NOT "build the mount canvas" — that's BUILT. P0 is **verify the existing foundation and
make it safely runnable**, then close the smallest real gaps. Order below is non-destructive first.

## Completed
- [x] Phase A truth snapshot + secret scan (clean).
- [x] Typecheck blocker fixed (LessonGraphCanvas `plugin` kind) → green.
- [x] Reuse inventory + claim register + recon matrix.

## Verified
- [x] Typecheck green. [x] No hardcoded secrets. [x] Mount/scene are real (source-level).

## Still false / overclaim risk
- Any "parity" / "First-LED works e2e" / "solver golden passes" — UNVERIFIED. Keep locked.

## P0 (next slices — non-destructive, no commit/merge)
1. **Verify BUILT→VERIFIED**: `vitest` scoped to `ToolCanvasEmbeddable`, `ElabLab`, `SimulationPluginWorkbench`, step-mode; then `vite build`.
2. **First-LED e2e**: run `montaggio-canvas.spec.ts` + `sim-passo-passo.spec.ts` headless; capture pass/fail + screenshot.
3. **Solver golden**: re-run CircuitSolver golden (target ~15.3mA from memory) — confirm G4.
4. **Fold deep-research** (`docs/research/P29-REFERENCE-REQUIREMENTS-SYNTHESIS.md`) into a prioritized "steal-first" list for the sim plugin UX.

## P1
- 8→88 experiment progression; diagnostics ≥3 error classes; student pack; quiz/flashcards; per-experiment e2e.

## P2
- Plugin ecosystem: WebSearch/Citations, HTML/Interactive, HD Charts, Math, Human Body, Audio/Transcript, Graph, Quiz/Rubric. Each: reads graph.query, writes typed events, no parallel memory.

## ⚠️ Decision reserved for Andrea (do not auto-execute)
The `tutor-ux` (foundation) and `ardesia-wt-lessonos-shell` (nav-launcher) worktrees are **both
uncommitted and divergent**. Consolidating them (commit → integration branch off `origin/main` →
re-apply launcher) is irreversible and is Andrea's call — see `CLAUDE-CONSOLIDATION-PLAN-20260708.md`.
Per directive "no-domande/no-rotture" the loop will NOT commit or merge; it verifies and documents
until Andrea decides.

## Deploy recommendation
Not yet. After P0 slices 1–3 pass AND consolidation is decided.

## Certified backlog (post gate-certification wf_ced8cc60-666, 09jul)
Verified spine: **G0 G1 G2 G3 G4 G6**. PARTIAL gaps → concrete slices, ranked by "lesson tomorrow" (see P29-GATE-CERTIFICATION.md):

1. **[P0 — ✅ DONE for insert/mount] G9 iPad/LIM toolbar reachability.** Probe found + fixed the *real* blocker: at 810px the toolbar overflowed and the "sim" insert button was off-screen (hamburger only ≤768px). Fixed in `index.css` (collapsible menu extended to 769–1024px + `.st-bar z-index:500` above the Excalidraw canvas). `e2e/first-led-ipad-touch.spec.ts` #1 green — teacher inserts sim on iPad touch, canvas mounts, 0 errors. **Remaining P1:** (a) wire `simulationViewport` for in-post-it pinch-zoom; (b) **touch placement inside the LEGACY montaggio embed is blocked** — Excalidraw's interactive canvas intercepts taps and double-tap doesn't trigger the embed activation that mouse double-click does (test #2 is a documented `test.fixme`). Investigate Excalidraw touch embed-activation (tap/long-press), or route the student flow through the CORE canvas instead of the legacy panel.
2. **[DECISION-GATED] G7 diagnose-loop logging.** Investigation (`P29-G7-EMIT-SEAM-FINDING.md`) shows the gap is a **missing emit seam**, not missing types: the solve flow (`ToolCanvasEmbeddable.tsx:1293`) logs nothing, and `error.observed` + `exercise.completed{correctsErrorId}` + `simulation.step.completed` already model break→explain→fix. Recommended: reuse existing events + add a LessonOS emit seam for the embed; do NOT add redundant `simulation.error.observed`. **Needs Andrea's decision** on the seam owner (embed-via-RPC vs host-observes-solve) before writing — touches the canonical event model + a core seam.
3. **[P1] G5 `repair` operation.** Add `repair` to `sim/core/simulationAiApi.ts` + `SIMULATION_OPERATION_KINDS` (`compareToTarget` already computes drift; repair applies corrective ops). Then G5 → VERIFIED.
4. **[P1] G8 export breadth + e2e.** Add Markdown/HTML student-pack export (+ SVG/PNG board snapshot); add a real-browser e2e that exports `.lesson` → reopens → asserts identical (`.lesson` core is already reopen-identical at unit level).
5. **[P1] UX steals from synthesis** (additive, on the verified canvas): Start-Simulation button, 0–9 wire recolor, single-click Component Inspector, tap-step/tap-component→law+example, page-anchored citations via `document:sha256`.

Items 1–2 change whether Andrea can run a real iPad/LIM First-LED lesson with a logged break→explain loop — do them before P1 polish. NO commit/merge until Andrea decides consolidation.
