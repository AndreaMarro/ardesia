# Architecture & Best-Practices Review — feat/iter-41-sprint-u-cycle-2-real-user-fix (commits b5d21c5b…6a7c1027)

Reviewer: master-architect (read-only). Scope: 5 commits iter 58–60. G45 anti-inflation cap honored.

## 1. Architecture findings

### 1.1 Blockly cross-compile pivot — ADR-048 Option A backward-compat (SOUND)
- `docs/adrs/ADR-048-blockly-nano-r4-cross-compile-board-param.md:59-92` recommends Option A: DEFAULT_BOARD unchanged at `src/services/api.js:60` (`'arduino:avr:nano:cpu=atmega328old'`), allowlist `src/services/api.js:61` extended with two Renesas FQBN. This is the correct decoupling: codegen stays board-agnostic (`scratchGenerator.js:4` emits generic Arduino C++) and board becomes a pure compile-target param at `api.js:1294` (`safeBoard = ALLOWED_COMPILE_BOARDS.has(board) ? board : DEFAULT_BOARD`). Strategy-pattern, single test surface, zero regression risk on 13 Vol3 esperimenti. Verdict: ARCHITECTURALLY CORRECT.
- ADR slug-collision handling (`ADR-048-…md:7`) — original requested slot ADR-032 already taken by production-active Vertex EU Frankfurt migration; renumbered to next free slot. This prevents the well-known ADR-renumber anti-pattern (mutating accepted decisions). Good discipline.
- Option B (default-swap) correctly rejected (`ADR-048…md:95-117`): would break implicit AVR contract on every existing flow. Option C (lesson-path detection) deferred. Decision drivers cited verbatim from Lino/Riccardo iter 59 input — traceable.

### 1.2 Component boundaries — BoardSelector.jsx isolation (CLEAN)
- `src/components/simulator/panels/BoardSelector.jsx:1-148` is a self-contained presentational component: 148 LOC, no external state, no `__ELAB_API` coupling, no compile-call side effect. Persistence is delegated to a single localStorage key `elab-compile-board` (`BoardSelector.jsx:35,52`) — Sense 1.5 morfismo per-docente. Props contract `{value, onChange, availableBoards, disabled}` is minimal and testable.
- `disabled = true` default (`BoardSelector.jsx:28`) and ARIA `aria-disabled` (`:82`) implement a feature-flag-in-the-prop pattern — safe to land before Andrea ratifies Q1–Q3. Grep confirms ZERO importers under `src/` — dead code today by design, no leakage into `NewElabSimulator.jsx` or `ScratchEditor.jsx`. Verdict: textbook "ship the leaf, defer the wire-up" practice.
- Minor: inline styles (rule 17 noted in header comment, palette OK via `var(--elab-*)`) — acceptable for an isolated scaffold; migrate to CSS module on wire-up (iter 61). No emoji icons, touch ≥44px (`:115-116`), radiogroup ARIA semantics + arrow-key handler (`:60-76`) — accessibility built-in from day one.

### 1.3 API design — n8n compile contract OpenAPI 3.1 (PRODUCTION-READY)
- `docs/api/n8n-compile-openapi.yaml:1-80` documents three call-chain entry points (`/compile-proxy` Supabase Edge, direct n8n, localhost) with `servers:` and `tags:` correctly modeled. CORS constraint explicit (`:17`) — the Supabase proxy is the canonical browser path; direct n8n is non-browser-only. This formalizes the existing fallback chain at `src/services/api.js:1340-1376` rather than redesigning it. API-first done right.
- Allowlist enforcement documented as defense-in-depth (`openapi.yaml:22-23`): client (`api.js:61`) AND server validate `ALLOWED_COMPILE_BOARDS`. iter 59 R2 extends this Set without changing the gate logic — additive change, no anti-corruption layer needed.
- Timeout 65s explicit (`openapi.yaml:19-20`, sourced from `api.js:57`) — caller contract is honest about long tail. Recommend adding `429` rate-limit response code in iter 61 (currently absent in spec).

### 1.4 Codex Pattern C-V workflow institutionalization (PROCESS WIN)
- `docs/dev/CODEX-WORKFLOW.md:1-302` formalizes Claude+Codex parallel verification as a first-class engineering practice, with four parametric templates under `scripts/dev/codex-prompts/` (verify-anti-regression / verify-morfismo-compliance / verify-codegen-output / verify-lesson-path-edit). This is a verification-driven-development primitive: pre-commit independent cross-check on file:line claims, with documented stdin failure mode (BRE-vs-ERE regex bug, mitigation in iter-59 addendum). Architecture impact: shifts the team from self-assessment to evidence-based assertions — directly aligned with the G45 anti-inflation mandate.

## 2. Best practices

- **CLAUDE.md anti-regression FERREO**: enforced. All five commits preserve vitest baseline 13118 (iter 58 commit message confirms) — `b5d21c5b` 3 surgical JSON edits, `1951a06c…6a7c1027` zero src/ changes except the disabled BoardSelector stub. Pre-push hook never bypassed. NO `--no-verify`. Consistent with CLAUDE.md `Anti-regressione (FERREA)` rules.
- **Pattern C-V default**: applied iter 58 (Codex CONFIRM ×2), iter 59 (Codex C-V ×3 with 1 honest FAIL documented), iter 60 (anti-inflation correction commit `6a7c1027` actually invalidates a Research-subagent false claim — verification catching a real error, not theater).
- **NON COMPIACERE mandate**: visible in every commit footer. Each commit explicitly enumerates what was NOT done (Phase 2 deferred, Phase 1 R1-R6 not executed, codemod in audit-prep state, etc.). G45 scores stated as raw-then-capped (e.g., `1951a06c` raw 9.0 → capped 8.5).
- **4-gate per commit** (build / vitest / Codex C-V / Andrea-ratify-queue): observed in commit messages. Iter 60 entrance commit `6a7c1027` correctly flags `Q-CODEMOD-1/2/3` as BLOCKING before bulk apply — no premature codemod.

## 3. Critical issues

- **Critical**: none. Branch is doc/config/scaffold-heavy with zero production code changes beyond two JSON intro_text/num edits and one disabled-by-default leaf component.
- **High**: ADR-048 still in DRAFT status (`ADR-048-…md:3,13-17`) blocks Phase 1 R1-R6 execute. Three open questions (Q1 default board, Q2 arduino-cli core install prereq, Q3 R4 variant). Action: 5-10 min Andrea ratify unblocks ~6h implementation. Not a defect — a gate working as designed.
- **Medium**: `docs/specs/2026-05-15-iter-60-blockly-phase1-acceptance-test-plan.md` referenced in commit `07998140` message but not present at the cited path; only `docs/specs/2026-05-15-iter-60-api-js-annotations.md` exists in `docs/specs/`. Verify rename or add the missing acceptance test plan before Phase 1 execute.
- **Medium**: BoardSelector localStorage key `elab-compile-board` (`BoardSelector.jsx:35`) — on wire-up, ensure it cannot drift out of `ALLOWED_COMPILE_BOARDS` (currently `:36` validates against props.availableBoards, but on cold load before allowlist sync the persisted FQBN could be stale post-allowlist-shrink). Add server-side allowlist re-validation in iter 61.
- **Low**: OpenAPI spec lacks `429` rate-limit and `503` upstream-unavailable response codes (`docs/api/n8n-compile-openapi.yaml`) — Vertex/iter-43 evidence shows 503 is a real occurrence path. Add for completeness in iter 61.
- **Low**: codemod inventory `docs/audits/2026-05-15-iter-60-linguaggio-codemod-prep.md` flags 91 + 52 + 21 + 28 cross-volume violations and identifies Vol1/Vol2/Vol3 stylistic non-uniformity (singolare/plurale/infinito). Bulk apply correctly gated on Q-CODEMOD-1/2/3 — but recommend per-volume canary (Vol1 first, ratify, then Vol2+Vol3) rather than single bulk PR.

## 4. Score per dimension (0-10, G45 ONESTO cap)

| Dimension                             | Score | Note                                                                 |
|---------------------------------------|-------|----------------------------------------------------------------------|
| Architecture clarity (ADR-048)        | 8.5   | Option A correct; renumber discipline; codegen/compile decoupled.    |
| Component boundaries (BoardSelector)  | 8.5   | Leaf isolation, disabled-default, ARIA + touch + palette correct.    |
| API design (OpenAPI 3.1 n8n compile)  | 8.0   | Allowlist defense-in-depth; missing 429/503; CORS constraint clear.  |
| Process/workflow (Codex Pattern C-V)  | 8.5   | Real verification (caught a false claim iter 60); templates reusable.|
| Anti-regression discipline            | 9.0   | 13118 vitest preserved across 5 commits; zero `--no-verify`.         |
| Honesty & anti-inflation (G45)        | 9.0   | Raw→cap reported; deferred items enumerated; ratify gates blocking.  |
| Documentation traceability            | 8.0   | Acceptance test plan path mismatch (Medium) is the only gap.         |
| **Overall (G45 cap)**                 | **8.5** | Honest, surgical, no shipped src code yet — gate-state is healthy.  |

## 5. Verdict

- **Architecture**: ADR-048 Option A is the right pick — zero-regression backward-compat, codegen kept board-agnostic, compile-target is a pure parameter through the existing fallback chain. BoardSelector landed as a clean disabled leaf, ready to wire on Andrea Q1-Q3 ratify.
- **Best practices**: CLAUDE.md FERREO rules respected across all 5 commits; Codex Pattern C-V already producing value (caught a Research-subagent fabrication in iter 60); commit messages honor NON COMPIACERE with explicit defer lists.
- **Action items**: (1) Andrea ratify Q1+Q2+Q3 to flip ADR-048 to ACCEPTED; (2) resolve missing iter-60 acceptance-test-plan path; (3) add 429/503 to OpenAPI; (4) per-volume canary for linguaggio codemod once Q-CODEMOD-1/2/3 ratified.
