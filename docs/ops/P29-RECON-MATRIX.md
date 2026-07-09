# P29 — RECON MATRIX (Truth Snapshot)

> Phase A of the P29 prompt. Read-only recon. No feature code written this session.
> Generated 2026-07-09. Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
> Branch `docs/simulation-plugin-v2-contract-20260707` @ `ab91e476` — **102 dirty files (uncommitted)**.

## 0. Ground truth (corrects the P29 prompt's assumptions)

The P29 prompt assumes a fresh `apps/studio` where the simulation post-it is a "text card"
and G0 "mount the real canvas" is the first slice. **This premise is STALE** — the same
pattern already logged for P+21 and the P28 foundation ("handoff 'not started' but already
built, just uncommitted"). Firsthand evidence below.

| Fact | Evidence | Note |
|---|---|---|
| CWD is not a git repo | env: `Is a git repository: false` | P29 git machinery must target the worktree, not CWD |
| Real monorepo checkout | `/Users/andreamarro/VOLUME 3/ardesia/.git` | dirty (codex branch) — use worktrees only |
| Active P29 worktree | `/Users/andreamarro/ardesia-wt/tutor-ux` | branch `docs/simulation-plugin-v2-contract-20260707`, 102 dirty files |
| Divergent second worktree | `/Users/andreamarro/VOLUME 3/ardesia-wt-lessonos-shell` | nav-launcher lane — **consolidation = Andrea's decision** |
| Sim source present | `apps/studio/sim/solver/{CircuitSolver.js,elabSolver.ts}`, `plugins/elab-tutor/.../SimulatorCanvas.jsx` | reuse-now (see REUSE-INVENTORY) |

## 1. Gate status — CLAIMED vs VERIFIED (claim-lock enforced)

Status legend: **BUILT** = code+test present (read firsthand) · **VERIFIED** = exercised this
session · **UNVERIFIED** = asserted by prior sessions/memory, not re-run here.

| Gate | Name | Status | Evidence (file:line) | Test present | Risk / next |
|---|---|---|---|---|---|
| G0 | Mount canvas | **BUILT** | `ToolCanvasEmbeddable.tsx:907,1131,1140` `data-elab-core-canvas-mounted="true"` + real `data-elab-core-canvas-host` | `ElabLab.test.tsx:56`, `ToolCanvasEmbeddable.test.tsx:175`, e2e `montaggio-canvas.spec.ts` | Run e2e to VERIFY render non-empty |
| G1 | Scene = source of truth | **BUILT** | `ToolCanvasEmbeddable.tsx:1132` `data-elab-canvas-source-of-truth="simulation-scene"`; marker `simulation-scene-v1`; `docs/architecture/simulation-plugin-v2.md` | e2e `montaggio-canvas.spec.ts:35` | Confirm SimulationSceneV2 shape vs prompt |
| G2 | Placement (pins/holes) | **BUILT** | palette tap-tap + `[data-bb-hole]` occupancy in `montaggio-canvas.spec.ts:69-85` (rejects occupied `bb1:i9`) | e2e yes | legacy panel still primary for tap-tap; core transposition pending |
| G3 | Wires (semantic) | **BUILT** | `ToolCanvasEmbeddable.tsx:1092,1101` typed wire ops; `inferCanvasWireColor:1150` | unit | verify waypoints/validation depth |
| G4 | Solver (CircuitSolver) | **UNVERIFIED** | `sim/solver/engine/CircuitSolver.js`, `sim/solver/elabSolver.ts` | golden tests exist (per memory 15.3mA) | re-run golden this cycle |
| G5 | AI typed operations | **PARTIAL** | wire ops present; `simulationPluginRegistry.ts`, `pluginFunctions.ts` | contract tests in `src/__tests__/` | confirm addComponent/connectPins/runSolve/diagnose/repair surface |
| G6 | ELABTutor pack + step mode | **BUILT** | `toolhost/simulationStepMode.ts`, `elabExperimentCatalog.ts` | e2e `sim-passo-passo.spec.ts` | verify First-LED experiment end-to-end |
| G7 | LessonOS / graph events | **UNVERIFIED** | lessonos MCP + toolhost session | — | enumerate typed events emitted |
| G8 | Export / reopen | **BUILT** | e2e `studentpack-artifact.spec.ts`, `saved-lessons.spec.ts` | e2e yes | verify .lesson + PDF/MD/HTML reopen-identical |
| G9 | iPad / LIM | **UNVERIFIED** | responsive tests `ResponsivePluginFunctions.test.ts` | unit | needs touch/zoom smoke |

## 2. Verification run this session

| Check | Command | Result |
|---|---|---|
| Literal secret scan | `rg 'sk-…{32,}\|sbp_…\|AKIA…'` | **0 hits** — no hardcoded keys |
| Typecheck | `npm --prefix apps/studio run typecheck` | RUNNING (bg) → see P29-RUN-REPORT.md |
| Dirty snapshot | `git diff > /tmp/ardesia-p29/pre-claude-tutor-ux.patch` | 5320 lines saved (rollback) |

## 3. Structural blocker (unchanged from CLAUDE-CONSOLIDATION-PLAN-20260708.md)

Two divergent, **both-uncommitted** worktrees (`tutor-ux` foundation + `ardesia-wt-lessonos-shell`
nav-launcher). Merging/committing them is a non-reversible decision reserved for Andrea.
Per directive "no-domande / no-rotture", this session does **not** commit, merge, or mutate
feature code — only read-only recon + additive docs. See P29-NEXT-PLAN.md for the decision.
