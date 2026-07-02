# GITHUB-REPO-MAP-LIVE

Audit window: 2026-07-01, **refreshed 2026-07-02 (sera)**.  
Source: `gh repo list AndreaMarro --limit 200` and selected `gh pr list` (re-run at refresh).  
Scope: mapping only. No archival, deletion, merge, or push.

## Summary

- GitHub auth: active as `AndreaMarro`.
- Repos returned: 32.
- Active repos: 17.
- Archived repos: 15.
- Main ARDESIA canonical target: `AndreaMarro/ardesia`.
- Monorepo candidate already exists locally on Mini as `~/ardesia-monorepo`, but GitHub canonical remains `AndreaMarro/ardesia` until Andrea decides otherwise.

## Repo Classification

| Repo | Archived | Default branch | Last push | Class | Action |
|---|---:|---|---|---|---|
| `ardesia` | no | `main` | 2026-07-02 | CANONICAL | keep as human/AI map and future monorepo target |
| `ardesia-lavagna` | no | `main` | 2026-06-30 | DEMO / PROTOTYPE / DEPLOY-SURFACE | preserve; current best Vercel demo surface |
| `elab-tutor` | no | `main` | 2026-06-29 | LINEAGE / PRODUCT-SEPARATE | preserve; later extract Simulation Plugin and ELAB Pack |
| `ardesia-simulator` | no | `main` | 2026-06-28 | PROTOTYPE | inspect for simulator salvage |
| `whiteboard-studio-sim` | no | `main` | 2026-06-28 | PROTOTYPE | inspect before merging ideas |
| `ardesia-wiki` | no | `main` | 2026-06-27 | KNOWLEDGE | import/keep as docs/wiki lineage |
| `lessonos` | no | `auto/main` | 2026-06-26 | ENGINE / FACTORY | preserve history; monorepo package candidate |
| `ardesia-tools` | no | `main` | 2026-06-25 | FACTORY-TOOLS | preserve; dirty live local copy needs dedicated pass |
| `ardesia-studio` | no | `main` | 2026-06-25 | STUDIO / LAVAGNA-LINEAGE | preserve; monorepo package candidate |
| `ardesia-vault` | no | `main` | 2026-06-17 | KNOWLEDGE / SOT-LINEAGE | preserve; docs/vault source |
| `numeria-lab` | no | `main` | 2026-06-09 | SEPARATE-PRODUCT | do not mix into ARDESIA |
| `numeria` | no | `auto/main` | 2026-06-08 | SEPARATE-PRODUCT | do not mix into ARDESIA |
| `numerical-lab-journey` | no | `codex/initial-mvp` | 2026-06-06 | SEPARATE/ELAB-RELATED | classify later; do not import blindly |
| `elab-volumi` | no | `main` | 2026-05-20 | ELAB-CONTENT | preserve as content lineage |
| `unlim-intelligente` | no | `main` | 2026-05-06 | ELAB/AI-LINEAGE | preserve, inspect for concepts only |
| `elab-galileo-nanobot` | no | `main` | 2026-04-11 | ELAB-LEGACY | preserve; do not use naming in ARDESIA product |
| `elab-website` | no | `main` | 2026-03-10 | LEGACY-WEB | leave separate |
| `claudeco` | yes | `main` | 2026-03-31 | ARCHIVE-CANDIDATE already archived | no action |
| `Apocalisse` | yes | unknown | 2026-03-15 | ARCHIVED/UNKNOWN | no action |
| `StressTest` | yes | `main` | 2025-11-26 | ARCHIVED/UNKNOWN | no action |
| `DM418Reasoning` | yes | `main` | 2025-09-15 | ARCHIVED/UNKNOWN | no action |
| `FILTRO` | yes | unknown | 2025-09-15 | ARCHIVED/UNKNOWN | no action |
| `BrutalDesignClone-3` | yes | `main` | 2025-07-11 | ARCHIVED/UNKNOWN | no action |
| `LASTversion` | yes | unknown | 2025-07-06 | ARCHIVED/UNKNOWN | no action |
| `WebMirrorClone-12` | yes | `main` | 2025-06-08 | ARCHIVED/UNKNOWN | no action |
| `cautious-giggle` | yes | unknown | 2025-06-08 | ARCHIVED/UNKNOWN | no action |
| `sturdy-disco` | yes | unknown | 2025-06-08 | ARCHIVED/UNKNOWN | no action |
| `symmetrical-octo-couscous` | yes | unknown | 2025-06-07 | ARCHIVED/UNKNOWN | no action |
| `woooo` | yes | `main` | 2025-03-23 | ARCHIVED/UNKNOWN | no action |
| `solid-octo-lamp` | yes | `master` | 2025-03-23 | ARCHIVED/UNKNOWN | no action |
| `sito` | yes | unknown | 2025-03-23 | ARCHIVED/UNKNOWN | no action |
| `COVID-19` | yes | `master` | 2020-04-07 | ARCHIVED/UNRELATED | no action |

## Open PRs Observed

Refresh 2026-07-02: su `ardesia` le PR #7-#15 (inventari, demo, canary runbook, slice esp.1 fixture+adapter) risultano MERGED e sono uscite dalla tabella; #8 (demo plan) e' tra queste. Le righe degli altri repo sono state ri-verificate e risultano invariate.

| Repo | PR | Draft | Branch | Base | Meaning | Action |
|---|---:|---:|---|---|---|---|
| `ardesia` | #24 | no | `feat/lessonos-eventlog-microslice-20260702` | `main` | LessonOS event-log micro-slice (4 file, 12 test) | review/merge |
| `ardesia` | #23 | no | `chore/studio-flaky-hunt-20260702` | `main` | fix flaky Room handleFile (race apiRef mock) | review/merge; sblocca lettura pulita evidenza #17 |
| `ardesia` | #22 | no | `docs/teacher-dashboard-spec-20260702` | `main` | TEACHER-DASHBOARD-SPEC (projection read-only) | review/merge |
| `ardesia` | #21 | no | `docs/import-ops-p0-maps-20260702` | `main` | import P0 mappe ops (incl. QUESTO file) | review/merge |
| `ardesia` | #20 | no | `docs/import-product-pack-specs-20260702` | `main` | import P1 docs/product (6 file) | review/merge |
| `ardesia` | #19 | no | `feat/elab-v1-cap6-esp1-book-topology` | `main` | fix fedelta'-libro esp1 (topologia 3 fili) | review/merge; poi rebase #16 |
| `ardesia` | #18 | no | `docs/claude-full-project-context-20260702` | `main` | mappa completa ARDESIA per sessioni AI | review/merge |
| `ardesia` | #17 | no | `ops/monorepo-command-surface-20260702-131120` | `main` | root command surface (verify eseguito, evidenza in commento) | review/merge |
| `ardesia` | #16 | yes | `test/sim-elab-v1-cap6-esp1-board-payload` | `main` | board payload contract (referenzia pin VECCHI) | post-merge #19: rebase + pin nuovi |
| `ardesia` | #6 | yes | `codex/add-codex-minimax-worker` | `main` | dual Hermes/Codex orchestration proposal | VIETATA (body!=files); design input only |
| `ardesia` | #5 | yes | `docs/canon-2026-06-27` | `main` | canon docs | reconcile into canonical docs |
| `ardesia` | #4 | yes | `docs/ops-maps-2026-06-26` | `main` | ops maps | reconcile, avoid duplication |
| `ardesia` | #2 | yes | `docs/knowledge-maps-2026-06-25` | `main` | knowledge maps | preserve as lineage |
| `ardesia` | #1 | yes | `session/long-2026-06-25` | `main` | knowledge fabric session | preserve as lineage |
| `ardesia-lavagna` | #1 | no | `feat/lavagna-p0-20260628` | `main` | marketplace/plugin manifest system | high-value prototype; verify build/tests before import |
| `ardesia-studio` | #2 | no | `auto/main` | `main` | ratify auto/main | needs current CI/context before merge |
| `lessonos` | #3 | no | `auto/main` | `main` | ratify auto/main | needs current gate/context before merge |
| `elab-tutor` | #200 | yes | `feature/numerical-lab-journey-completion` | `main` | numerical lab scaffold | separate from ARDESIA |
| `elab-tutor` | #199 | no | `feat/eslint-no-undef-gate` | `main` | lint gate fix | ELAB-only; evaluate separately |
| `elab-tutor` | #197 | no | `feat/gemini-tools-converter-eval` | `main` | UNLIM groundwork | ELAB-only; not ARDESIA core |
| `elab-tutor` | #196 | no | `fix/consent-gate-teacher-attested` | `main` | consent gate | ELAB-only; privacy relevant |
| `elab-tutor` | #195 | yes | `claude/elab-simulator-codebase-graph-mhT32` | `main` | simulator audit/model | useful for Simulation Plugin analysis |
| `elab-tutor` | #194 | no | `mission/elabcode-reupload-sim-unlim-2026-05-29` | `main` | ELAB resilience | ELAB-only |
| `elab-galileo-nanobot` | #1 | no | `feature/switch-to-gemini-only` | `main` | provider switch | legacy/nanobot |

## Monorepo Readiness

Candidate package mapping:

- `lessonos` -> `packages/engine`
- `ardesia-studio` -> `packages/studio`
- `ardesia-tools` -> `packages/tools`
- `ardesia-vault` -> `docs/vault`
- `ardesia-wiki` -> `docs/wiki`
- `ardesia-lavagna` -> either `packages/lavagna-demo` or a branch to harvest into `packages/studio`
- `ardesia-simulator` -> `packages/simulation-plugin` if code quality and tests justify it
- `elab-tutor` -> not imported wholesale; extract Simulation Plugin lineage and ELAB Pack later

No repo should be deleted or archived during this stage.

## COV

- Source commands: `gh auth status`, `gh repo list AndreaMarro --limit 200`, selected `gh pr list`.
- No GitHub mutation was performed.
- Counts are live as of 2026-07-01 audit window; PR/last-push refreshed firsthand 2026-07-02 (sera).
- Risk: PR content/diffs were not fully reviewed in this file; this is inventory, not merge approval.
