# P32 — Risks

| # | Risk | Severity | Evidence / status | Mitigation |
|---|---|---|---|---|
| R1 | CI never runs Playwright → e2e regressions (like the reachability one) land silently on main | med | CI `ci.yml` has no browser job; caught only locally | D2: candidate CI smoke; meanwhile reachability + logic now asserted in-spec and run pre-merge |
| R2 | Concurrent writer on the shared `.git` (multiple worktrees, prior Codex sessions) | med | 28 worktrees; `VOLUME 3/ardesia` dirty on codex branch | Single-writer gate each iter (status+index.lock+HEAD); write only tutor-ux (D4) |
| R3 | Real-pointer *click-through* to embedded controls still unproven (logic uses `dispatchEvent`) | low | intentional; Excalidraw routing flake | montaggio-canvas covers real-mouse clicks post-activation on `[data-bb-hole]`; reachability now covers topmost-ness of the strip |
| R4 | Historical OpenAI key exposure noted in memory (pasted into prompts / png in a past rescue commit) | high (if unrotated) | memory: "ruotare chiave OpenAI storica"; **not** in this branch's diff (scan clean) | Andrea to rotate; not introduced or reachable via #150 |
| R5 | LessonOS "backend" is client-only (IndexedDB); Phases 3–4/8 are greenfield (no Supabase/Vercel config in repo) | med | no `supabase/`, no `vercel.json/.ts` | scope Phase 3 as ADR-first; keep secrets server-side; honest RED if unverifiable |
| R6 | Overclaiming parity (Tinkercad/GoodNotes/ElabTutor) | high (credibility) | NON-GOALS in loop brief | every doc states "trace v0 / no parity"; gates before claims |
| R7 | Full vitest (1574) not run this iter | low | e2e-spec-only diff; CI runs it on push | acceptable; re-run before any shared-code slice |
