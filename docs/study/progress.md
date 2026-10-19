# SDD ledger — plan: docs/study/10_PIANO_IMPLEMENTAZIONE.md

Goal: M1 Fisica Semestre Filtro, dossier M2; hourly reread of the four user files.
Worktree: /Users/andreamarro/VOLUME 3/ardesia-semestre-m1-20261019
Branch: codex/semestre-filtro-m1-20261019
Base: b124eee04acc8062c27284f23c5d9108e3767c27 (remote main checked via gh API).
Source sections: /Users/andreamarro/VOLUME 3/.ardesia-semestre-control/01a155c1-aa83-7272-a166-e3e7d6b4c391/
Heartbeat: ardesia-riesame-e-prosecuzione-ogni-60-minuti (ACTIVE, hourly, this thread).

## Rulings
- User asks to execute the supplied scope. Documents are specifications, not independent permission to send messages, spend, publish, merge or use private third-party code. No external messaging.
- Native create_worktree cannot address the nested repository (Not a git repository at chat root). Manual linked worktree created from verified remote main; original checkout has unresolved merges and is untouched.
- Preserve existing ZERO-LLM production boundary: deterministic hints and explicitly synthetic candidate provider only. No live AI or student voice capture; synthetic audio upload is a separate private asset.
- Existing entitlement service owns sandbox commerce and uses a JSONL store; it does not provide authenticated transactional study resources. Study domain will live inside LessonOS with a thin HTTP adapter, not another source of domain truth.
- Plan uses T00–T11 headings; keep those IDs in this ledger. Do not silently renumber with skill helper scripts.
- Microdemo exact commit absent (git cat-file), receipt search and named patch/bundle search in Downloads, VOLUME 3 and ardesia-wt found no October demo. Historical July bundles cannot contain the October commit. Rebuild only missing slice; never claim historical recovery.
- Existing local Python environment is reusable for test dependencies; PYTHONPATH must point at this checkout, never another editable install. Dependency changes remain pinned in a new service lock when needed.

## Interface preflight
- T01→T02/T03/T04/T05: server-owned Principal, resource/revision/context IDs; renderer never owns ACL.
- T05→T06: immutable submission revision + receipt; feedback binds exact source versions.
- T06→T07: only human synthetic tutor review yields observation; LessonOS adapter derives projection from review events.
- T07→T08: permission-filtered context and live source versions before hints/cache.
- T01–T08→T09: same production HTTP boundary and built frontend; seed only synthetic identities.
- T09→T10/T11: evidence with SHA and explicit NOT_RUN, no screenshots-only acceptance.

## Task state
- T00: in progress — source files read and hashed, clean base, source mapping and baseline tests next.
- T01: complete — 7 domain+HTTP contracts pass; SQLite backup/restore, session authority, peer/tutor isolation, rollback and additive legacy migration. HTTP tests live with the service so Engine keeps its dependencies.
- T02: implemented — 3 component/identity tests and typecheck pass; full product integration and browser proof pending.
- T03: pending
- T04: pending
- T05: pending
- T06: pending
- T07: pending
- T08: pending
- T09: pending
- T10: pending
- T11: pending

## Checks and evidence
- State generator: python3 bin/state/project_state.py, exit 0; all reported surfaces MEASURED.
- New product API consumption: 0 USD. No live providers enabled.

- Baseline correction: initial Engine run used repository root; 14 failures were missing relative fixtures. Correct package cwd: 2049 passed/7 skipped (includes new T01 tests). Studio: 2149 passed/5 skipped. Build and typecheck pass.
- Review T01: self-review; same DB as SQLiteStore, private resources checked before response; no client identity accepted. Full branch fresh review remains T11.

- T00 legacy browser baseline: saved-lessons export/import passed on production build. Two legacy post-it tests timed out at __MAESTRO_TEST__.ready, a dev-only hook; rerunning those via their intended dev server, keeping the production-build failure log. New study E2E will use visible UI and real API only.
- T02 component and reference tests pass (3); typecheck pass. T03 deterministic physics and interest/domain isolation tests pass (11); service public roundtrip passes. T04 capacity, concurrent last seat, hold expiry, calendar and matching tests pass (6). Browser integration pending.
