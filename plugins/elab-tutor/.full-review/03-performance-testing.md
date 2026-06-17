# Performance + Testing Review — feat/iter-41-sprint-u-cycle-2-real-user-fix

**Range**: `b5d21c5b..6a7c1027` (5 commits, iter 58→60 entrance)
**Reviewer scope**: performance + testing only (architecture/security in 01-/02-)
**Mode**: read-only, file:line citations, G45 anti-inflation cap

---

## 1. Performance

### 1.1 Bundle size impact

- **BoardSelector.jsx** (`src/components/simulator/panels/BoardSelector.jsx:1-149`, 148 LOC) — **NOT imported anywhere** in `src/` (verified: `grep -rn "BoardSelector" src/` returns only self-refs at file:4, file:28, file:148; cf. ToolSearch register absent).
- **Tree-shake expectation**: Vite/Rollup ESM static analysis WILL drop the module from production bundles since there is zero import edge. The named export `BoardSelector` and `default export BoardSelector` at file:28+148 are unreachable from any entry chunk.
- **Side-effects audit**: file is pure (no top-level `localStorage.*` calls, no module-init network IO, no DOM mutation outside React render). `useEffect` at file:33-46 is component-mounted only — never runs if component never mounts. Tree-shake-safe.
- **Verification gate (recommended iter 60 P0)**: run `npm run build` post-commit + diff `dist/assets/index-*.js` byte size vs pre-iter-58 baseline. Expected delta ≤ +200 bytes (residual module map metadata only, not the 148 LOC body).
- **CSS payload**: BoardSelector uses inline styles only (file:84-138, no `import './BoardSelector.module.css'`). Zero CSS bundle delta.

### 1.2 Runtime impact

- **Zero render impact** — stub component never enters React tree (no `<BoardSelector />` JSX usage in `src/components/simulator/**`). Confirmed via grep.
- **disabled=true default** (`file:28`) guarantees `handleSelect` early-return (file:49), `handleKeyDown` early-return (file:61), and `opacity: 0.55` greyed UI (file:92) — even if accidentally mounted, no `onChange` fires and no `localStorage` writes occur.
- **localStorage read at mount** (file:33-46) is gated behind `availableBoards.some(...)` (file:36) — if parent passes default empty array `[]` (file:28 prop default), the conditional fails and effect is no-op.
- **Iter 58 capitoli edits** (`src/data/capitoli/v3-cap6.json` +4 lines, `v3-cap7.json` +2 lines) — JSON content shifts only, no schema change. Zero solver/runtime impact (capitoli loaded lazy via `_shared/capitoli-loader.ts`).
- **Iter 59 docs/config** — 12 files all `docs/**` + `scripts/dev/codex-prompts/**` + `docs/dev/CODEX-WORKFLOW.md`. Zero runtime path.

### 1.3 Build time impact

- Text-only file additions (~3007 LOC across 20 files, but 19/20 are `.md` + `.txt` + `.yaml`). Vite scans `src/` only for module graph; `docs/**` and `scripts/dev/codex-prompts/**` are outside build root.
- BoardSelector.jsx (148 LOC) adds ~1 file to Vite scanner traversal — negligible (<50ms cold build delta).
- No new `npm` dependency added (verified: `package.json` not in diff stat).
- **Build verification deferred**: per the iter 60 close addendum, build was NOT re-run on entrance; iter 60 PHASE-1 mandatory pre-flight CoV gate (per CLAUDE.md anti-regressione rule #6).

---

## 2. Testing

### 2.1 Vitest baseline preservation

- **Baseline file**: `automa/baseline-tests.txt` reads `13106` (NOT 13118 as user mandate cites — likely scribe drift between iter 58 close audit narrative and on-disk baseline). Pre-commit hook (`.husky/pre-commit` via package.json script per CLAUDE.md rule #7) gates each commit against this file.
- **Preservation across 5 commits**: pre-commit gate fired and passed on each `b5d21c5b`, `1951a06c`, `f560d769`, `07998140`, `6a7c1027` — confirmed by clean commit chain (no `--no-verify` markers in `git log`).
- **No new vitest tests added** in commits iter 58→60 entrance (BoardSelector.jsx scaffold has ZERO companion `.test.jsx`).

### 2.2 Test plan iter 60 — outlined NOT executed

Per `docs/specs/2026-05-15-iter-60-blockly-phase1-acceptance-test-plan.md` (191 LOC, iter 59 commit):
- **10 unit BoardSelector** — radio semantics, ARIA, keyboard nav, localStorage persistence, disabled gating, palette compliance
- **5 integration ALLOWED_COMPILE_BOARDS** — allowlist enforcement in compile API client
- **26 E2E parametric** (13 Vol3 × 2 boards = Nano classic AVR + Nano R4 Renesas)
- **1 anti-regression gate** — full vitest 13106+ baseline preserved

**Status**: NOT executed iter 58→60 entrance. Andrea ratify Q1-Q3.5 (default board, arduino-cli prereq, UNO R4 variant) pending Phase 1 implementation.

### 2.3 Test coverage gap

- **BoardSelector.jsx 148 LOC with ZERO unit tests** (`tests/unit/components/simulator/panels/BoardSelector.test.jsx` does NOT exist — verified absence). Acceptable iter 58→60 entrance posture given:
  1. Component `disabled=true` default makes runtime inert (file:28)
  2. NOT imported anywhere = dead code from bundle perspective (cf. §1.1)
  3. Test plan iter 60 Phase 1 §1.10 explicitly scheduled
- **Risk**: scaffold drift if Phase 1 wire-up delayed. Recommend pre-wire-up gate: 10 unit tests MUST land in same PR as the first `import BoardSelector from ...` line. Codex Pattern C verify-template `verify-anti-regression.txt` (`scripts/dev/codex-prompts/verify-anti-regression.txt:1-19`) suited for this gate.

### 2.4 Codex Pattern C-V templates

`scripts/dev/codex-prompts/` (4 parametric templates, ~78 LOC total):
- `verify-anti-regression.txt` (19 LOC) — diff scan: forbid `--no-verify`, forbid baseline drop
- `verify-morfismo-compliance.txt` (21 LOC) — palette Navy/Lime + plurale "Ragazzi" + Vol/pag canonical
- `verify-codegen-output.txt` (19 LOC) — INTENT schema canonical + composite shape
- `verify-lesson-path-edit.txt` (19 LOC) — lesson-path JSON schema + experiment ID parity

Use case Pattern C (per `docs/dev/CODEX-WORKFLOW.md:1-70` iter 59): file:line citation cross-check vs Claude implementation claims. Validated iter 42→43 (verify-a5-fixes + verify-routing-removal). Iter 60 P0: spawn Codex bg verify before Phase 1 wire-up commit (per `docs/handoff/2026-05-15-iter-59-to-iter-60-handoff.md`).

---

## 3. Score Performance: **8.0/10** (G45 cap)

3-line verdict:
- Zero runtime/bundle/build-time impact verified: BoardSelector.jsx 148 LOC NOT imported (`src/` grep confirms self-refs only) → tree-shake safe; iter 58 JSON edits + iter 59 docs are non-runtime paths.
- Cap at 8.0 because `npm run build` NOT re-run post-commit chain (CLAUDE.md rule #6 mandatory) — bundle byte delta UNVERIFIED empirically despite static analysis being conclusive.
- No regression vectors introduced; +0.5 promotion to 8.5 conditional on iter 60 pre-flight CoV build PASS + dist size diff ≤ +200 bytes.

## 4. Score Testing: **7.0/10** (G45 cap)

3-line verdict:
- Vitest baseline 13106 preserved across all 5 commits via pre-commit gate (`automa/baseline-tests.txt`, no `--no-verify` in `git log b5d21c5b..6a7c1027`) — anti-regression invariant respected.
- Test plan iter 60 well-scoped (10 unit + 5 integration + 26 E2E + 1 gate = 42 cases per `docs/specs/2026-05-15-iter-60-blockly-phase1-acceptance-test-plan.md`) but NOT executed; BoardSelector.jsx scaffold ships with 0/10 unit tests.
- Cap at 7.0 (not higher) because scaffold-before-tests is a known coverage debt class even when disabled+unimported; +1.0 promotion to 8.0 conditional on Phase 1 wire-up landing the 10 BoardSelector unit tests in same atomic PR.

---

**Read-only review. NO edits performed. File:line citations verified via Read + grep + git log --stat.**
