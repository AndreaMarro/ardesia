# ARDESIA Full Traceability

Status: G0 mechanical seed, blocking ledger present before product writer.
Baseline:
- Canon mandate: `/Users/andreamarro/.codex/attachments/3765288a-1527-43c5-a5cb-13de9c2da1e6/pasted-text-1.txt`, SHA-256 `4a59deec58d0e1ca23720da3a958a6d30148e71224f4be15ebc18476ea86916b`
- Current addendum: `/Users/andreamarro/.codex/attachments/c1f75ee2-e5ee-467e-b69a-02ca9ddf9742/pasted-text.txt`, SHA-256 `17000115531d1bacc62d06025f89a3bea5e1ac0342f364dd00ff8805e0186a50`
- Coverage method for this seed: every non-empty source line is addressable by `CANON:L<line>` or `ADDENDUM:L<line>`; milestone rows below bind the approved convergence gates without changing the frozen baseline.

| ID | Source | Requirement | Milestone | Evidence | Status |
|---|---|---|---|---|---|
| G0-BASELINE | Goal §7 G0 | Verify frozen hashes, worktree status, concurrent writers/processes, secret exposure, and known bypasses before writer work. | G0 | `shasum -a 256` matched both frozen hashes; worktree branch `codex/m0-visual-rescue-slice-20260711` at `06e5eda7`; port/process review found Claude Vite on 5195 outside this worktree; secret scan produced documentation references only, no live key pattern in shipped client bundle. | VERIFIED |
| G0-TRACE | Goal §7 G0 | Traceability file exists before product writer and maps source requirements to milestones and proof. | G0 | This file. Full line-level expansion remains mechanical via source line IDs above; no baseline reinterpretation made. | VERIFIED |
| M0-UX | Goal §7 M0 | Simulation view must look and behave like a product for the teacher, with task hierarchy, one clear next action, canvas dominance, touch targets, visible status, and technical diagnostics outside the primary view. | M0 | Slice `codex/m0-visual-rescue-slice-20260711`: `SimulationPluginWorkbench` teacher surface, targeted vitest, Playwright screenshots desktop/iPad/LIM. | IN_PROGRESS |
| M1-PLUGIN | Goal §7 M1 | Knowledge Card/post-it hosts real interactive, persistent, installable plugins with lifecycle, capabilities, dependencies, permissions, failure states, export/delete. | M1 | Future slice evidence required. | UNKNOWN |
| M2-LED | Goal §7 M2 | LED circuit add/connect/disconnect/retarget/delete, undo/redo, deterministic solve, diagnosis, save/reopen, e2e boundaries. | M2 | Existing simulation primitives reused by M0; full gate evidence still required. | IN_PROGRESS |
| M3-BOOK | Goal §7 M3 | Book fidelity and Principio Zero for Vol.1 LED experiment, semantic/topological/visual/temporal parity and grounded tutor distinction. | M3 | Future slice evidence required. | UNKNOWN |
| M4-V1 | Goal §1/§6 | Teaching V1 matrix: lesson, notebook/canvas, Knowledge Card, imports, manual, simulation LED, LessonOS/graph/tutor/artifacts/export/reopen/iPad/LIM. | V1_GREEN | Future deploy matrix required. | UNKNOWN |
| FULL-GOAL | Goal §1 | V1 is only first release gate; terminal goal includes plugin ecosystem and full Tinkercad parity. | FULL_GOAL_GREEN | Future full matrix required; not reduced to V1/LED/M0. | UNKNOWN |
