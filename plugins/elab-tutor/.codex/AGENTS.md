# AGENTS.md — ELAB Tutor (Codex repo-level guidance)

Durable guidance for Codex CLI (GPT-5.5) running in this repo. Read before any task.
Companion: `docs/dev/CODEX-WORKFLOW.md` (the full workflow). Source of truth for
product/architecture: `CLAUDE.md` (root).

When this subtree is changed inside the Ardesia monorepo, this guidance extends
the cross-boundary [`ADR-0004`](../../../docs/adr/ADR-0004-ai-native-evidence-authority.md)
and [`Canon Index`](../../../docs/CANON-INDEX.md); it cannot override their
authority boundary. Model output remains a typed, cited proposal. Scope,
consent, persistence and command application remain deterministic.

## What this repo is

ELAB Tutor — educational electronics tutor for kids 8-14. React 19 + Vite 7
frontend (no react-router — custom hash routing), Supabase Edge Functions
backend, proprietary circuit simulator. Live: https://www.elabtutor.school

## Repo layout (where things live)

- `src/components/` — React UI. `simulator/` (engine + canvas, CRITICAL),
  `lavagna/` (whiteboard redesign), `unlim/` (AI tutor UI), `tutor/`,
  `dashboard/`, `common/` (shared — ElabIcons, Toast).
- `src/services/` — `api.js` (all API calls + routing), `simulator-api.js`
  (global `window.__ELAB_API`), `principioZeroValidator.js`.
- `src/data/` — `lesson-paths/` (94 experiment JSONs), `capitoli/`,
  `volume-references.js` (verbatim book citations), `chapter-map.js`,
  `lesson-groups.js`, `rag-chunks.json`.
- `supabase/functions/` — Deno Edge Functions (`unlim-chat`, `unlim-tts`,
  `unlim-vision`, `_shared/`).
- `tests/unit/` + `tests/integration/` (Vitest), `tests/e2e/` (Playwright).
- `scripts/` — build/bench/backfill tooling. `scripts/epic1/` — narrative
  canon reconciliation. `scripts/dev/codex-bg.sh` — this workflow's wrapper.
- `docs/adrs/` — architecture decisions (latest ADR-047). `docs/audits/` — audits.

## Build / test / verify commands

```bash
npm run build        # vite build — MUST pass before any commit
npx vitest run       # full unit+integration suite — baseline in automa/baseline-tests.txt
npx vitest run tests/unit/services/   # one layer
npx playwright test --config tests/e2e/playwright.config.js   # E2E
```

How to verify work is good: `npx vitest run` count must be >= the baseline in
`automa/baseline-tests.txt` (currently 14342 PASS), and `npm run build` must
exit 0. A change that drops the test count or breaks the build is a regression —
revert it.

## Engineering conventions (hard rules)

1. **Anti-regression is FERREO**: `npx vitest run` before AND after changes. If
   tests drop → revert. `npm run build` must pass before commit.
2. Never `git add -A` blindly — stage specific files, check `git diff` first.
3. Never `--no-verify` on commits (pre-commit hook runs the regression check).
4. Never push to `main` — branch + PR only.
5. Never add npm dependencies without explicit owner approval.
6. Palette ONLY: Navy `#1E4D8C` / Lime `#4A7A25` / Orange `#E8941C` / Red
   `#E54B3D` + neutrals. No generic blue/red.
7. Icons: `src/components/common/ElabIcons.jsx` — never emoji as icons.
8. No fake/demo/mock data — everything works with real data.
9. The AI tutor is named **UNLIM**, never "Galileo".
10. CSS Modules preferred over inline styles.
11. Fonts: min 13px body / 10px secondary labels. Touch targets min 44x44px.
    WCAG AA contrast (4.5:1 text).

## Pedagogical canon (PRINCIPIO ZERO + MORFISMO)

- All class-facing text is plural-inclusive Italian: «Ragazzi,» / «Vediamo» —
  never imperative to the teacher («Distribuisci» ✗).
- Book citations are verbatim `Vol.X pag.Y «testo»` from `volume-references.js` —
  never paraphrase.
- The physical Omaric kit is always protagonist — never "proviamo nel
  simulatore" as a substitute.
- Software ↔ kit ↔ printed volumes must stay coherent (same names, order,
  pages). This is the competitive moat.

## Critical files — do NOT touch without explicit coordination

`src/components/simulator/engine/CircuitSolver.js`,
`src/components/simulator/engine/AVRBridge.js`,
`src/components/simulator/canvas/SimulatorCanvas.jsx`,
`src/services/api.js`, `src/services/simulator-api.js`,
`vite.config.js`, `package.json`.

## What Codex is asked to do here

Primary roles in this repo: parallel **implementer** (in its own worktree),
**verifier** (file/symbol/regex/dead-code checks), and **reviewer** (`codex exec review`).
Always structure tasks with goal / context / constraints / completion
criteria. For genuinely open-ended analytical synthesis, defer to the
orchestrator (Claude) — Codex returns best results on bounded, well-specified work.
