# Tech Debt Comprehensive Audit — iter 77 A.5 (Sprint U scope post iter 76 PHASE 3 close)

**Data**: 2026-05-17 PM
**Agent**: BG 77-A.5 (Opus 4.7 1M context, code-review elite expert profile)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**HEAD analyzed**: `dd48ac0d` (docs PHASE3 close) on top of `21124635` (PHASE3 fixes)
**Baseline**: Vitest 14418 PASS + build PASS 22.01s + OpenAPI valid
**Score iter 76 PHASE 3 close**: 8.5/10 G45 cap (orchestrator self-report)
**Mandate Andrea iter 77 entrance**: "Non compiacermi" — honest assessment, no inflation
**Budget**: 2h ceiling (audit + commit) — actual ~75min

---

## Section 0 — Executive Summary

**Top 5 findings (severity-ranked)**:

1. **P0 — God classes 4 files >2400 LOC each** blocking developer velocity + cognitive load + safe refactor surface:
   - `src/data/experiments-vol1.js` **6860 LOC** (data file, semi-justified but no chunking)
   - `src/data/experiments-vol2.js` **4322 LOC** (same)
   - `src/components/teacher/TeacherDashboard.jsx` **3484 LOC** (UI god component, NOT data — concrete refactor target)
   - `src/components/simulator/canvas/SimulatorCanvas.jsx` **3173 LOC** (177 functions, 23 components — extraction candidate)
   - **Risk**: any iter 78+ change touching these files raises merge conflict probability ~3-5× vs ≤500 LOC files. TDD impossible at this granularity.

2. **P0 — Zero E2E coverage cross-compile chain end-to-end** despite being THE Sprint U flagship surface (iter 75-76 work):
   - `tests/e2e/` 22 specs, **NONE** covers compile→upload state machine
   - `tests/unit/compiler*.test.js` exists but only unit-level
   - Iter 77 P0.2 plans `tests/e2e/05-cross-compile-mock-board.spec.js` (~3h scope) — **NOT YET STARTED**
   - **Risk**: Sprint U close 9.5/10 cap blocked until first E2E mock landed. Riccardo demo regressions impossible to catch automatically.

3. **P0 — ADR-028 still PROPOSED iter 36 PHASE 1 → never ratified post iter 37 entrance** despite being the canonical INTENT dispatcher decision:
   - `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md:3` Status PROPOSED 2026-04-30
   - 40+ iter spent (37→77) without status update
   - 4 ADRs currently PROPOSED (ADR-028, ADR-030, ADR-031, ADR-033) vs 3 ACCEPTED in `docs/adrs/`
   - **Risk**: decision-making chain unclear which patterns are LIVE vs DRAFT. New BG agents may follow PROPOSED guidance assuming ACCEPTED.

4. **P1 — CLAUDE.md 3393 LOC + 854 "iter N" mentions** — context window pollution risk:
   - Single file violates "one ADR per decision" principle
   - 854 iter mentions = 25% references to *closed* sprints (G38-G45 condensed legacy)
   - Iter 78+ should split into `CLAUDE.md` (principles, ≤500 LOC) + `CLAUDE-SPRINT-LOG.md` (history archive)
   - **Risk**: BG agents loading 3393 LOC of context per dispatch = wasted tokens + harder pattern extraction.

5. **P1 — 92 handoffs in `docs/handoff/` mostly April 2026 (pre-Sprint-U)** = orphan archive:
   - 30+ files dated 2026-04-21 (day-08 through day-15) all <8KB each = micro-handoffs from cycle 1
   - Sprint U iter 41-76 handoffs supersede them entirely
   - **Risk**: human-readable archaeology cost. Code is unaffected but orchestrator pattern-extraction muddied.

**Sprint U close blockers count (per box matrix iter 76)**: **6 P0 blockers** outstanding before 9.5/10 cap reachable:
- (a) E2E mock USB Playwright spec (iter 77 P0.2 planned, ~3h)
- (b) Hardware UAT real dfu-util impl (iter 78+ B.2 ~10-15h)
- (c) Render cloud deploy decision (Andrea ratify, deferred iter 76 D.6)
- (d) Riccardo demo execution + screencast (Andrea schedule)
- (e) 94 esperimenti Playwright UNO-PER-UNO audit (Andrea iter 21+ Sprint V gate, NOT iter 77 scope)
- (f) Vol3 narrative refactor (iter 72 BG-A5 abandoned skeleton-first, defer Sprint V+)

---

## Section 1 — Tech Debt Inventory Matrix (6 areas)

### Area 1: Code debt

| ID | Issue | Evidence | Severity | Effort | ROI |
|----|-------|----------|----------|--------|-----|
| C1.1 | `experiments-vol1.js` 6860 LOC (data god file) | `wc -l src/data/experiments-vol1.js` | P2 | 6-8h (chunk per capitolo) | Low (data, rarely edited) |
| C1.2 | `TeacherDashboard.jsx` 3484 LOC, 23 components inline | `wc -l + grep -c "^const"` | P1 | 10-12h (extract Tabs → 5 files) | High (touched 4× iter 65-76) |
| C1.3 | `SimulatorCanvas.jsx` 3173 LOC, 177 fn declarations | `grep -c "function\|=>"` | P1 | 8-10h (extract WireRenderer-style 4 hooks) | High (regression hotspot) |
| C1.4 | `ElabTutorV4.jsx` 2747 LOC | `wc -l` | P2 | 6-8h (extract panels) | Med |
| C1.5 | `CircuitSolver.js` 2486 LOC | `wc -l` | P2 | 8h (extract MNA solver) | Low (mature, stable) |
| C1.6 | `api.js` 1433 LOC, 54 fn (was 1040 LOC iter 60+) | `wc -l + grep` | P1 | 6h (split per concern: chat, compile, supabase) | High (every iter touches it) |
| C1.7 | `AVRBridge.js` 1242 LOC ATmega328p simulator (no Cortex-M4) | `wc -l + ADR-048` | P3 | 40h+ Cortex-M4 (defer Sprint V) | Low |
| C1.8 | 24 files use ad-hoc `useState loading + setError` pattern | `grep -rln "useState.*loading" wc` | P2 | 3h (extract `useAsyncFetch` hook) | Med |
| C1.9 | Only 7 TODO/FIXME in entire src/ | `grep TODO\|FIXME wc` = **7** | P3 | N/A | N/A (this is GOOD — flag for praise, not debt) |
| C1.10 | `compileAgentDetect.js` legacy iter 65-66 LEGACY pattern dormant | `find src -name compileAgentDetect*` exists | P2 | 30min (archive OR delete + update imports) | Med (clarity win) |

### Area 2: Architecture debt

| ID | Issue | Evidence | Severity | Effort | ROI |
|----|-------|----------|----------|--------|-----|
| A2.1 | LOCAL+CLOUD compile chain contract unified iter 76 P0.4 — **VERIFY STILL CLEAN** | `infra/cloud-compile/server.js` + `src/services/elab-agent/http-server.js` (boardId+fqbn dual-accept) | P1 | 30min verify | High (Sprint U flagship) |
| A2.2 | INTENT dispatcher symmetry browser ↔ server | `src/components/lavagna/intentsDispatcher.js` 152 LOC + `_shared/onniscenza-bridge.ts` 674 LOC = **NOT symmetric** by design (server canonical) | P2 | doc only | Med |
| A2.3 | ClawBot composite handler L2 templates state | `_shared/clawbot-template-router.ts` LIVE iter 26 — verify still wired | P2 | 30min audit | Med |
| A2.4 | Onniscenza 7-layer aggregator wired prod | Backend LIVE `supabase/functions/_shared/onniscenza-bridge.ts` 674 LOC. Frontend has 2 *comment-only* references in `PercorsoCapitoloView.jsx` + `UpdatePrompt.jsx` — NO `ENABLE_ONNISCENZA` flag in `src/`. **Wiring is implicit via unlim-chat fn** | P2 | 30min doc clarify flag | Med |
| A2.5 | Galileo→UNLIM rename: 32 file matches remain (was 35 iter 66) | `grep -rn "Galileo" src wc` = **32** in 10 files | P2 | 2h safe-delete pass + alias-only check | Med |
| A2.6 | Renesas RA4M1 docs deferred iter 70+ scope | `docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md` flags AVRBridge ATmega328p only | P3 | Sprint V+ | N/A |
| A2.7 | Multiple ADR directories: `docs/adrs/`, `docs/adr/`, `docs/architectures/`, `docs/decisions/` | `find docs -name "ADR-*"` 4 different dirs | P2 | 1h consolidate single dir | Med (clarity) |
| A2.8 | `compileAgentDetect.js` LEGACY iter 65-66 pattern present | `find src -name compileAgentDetect.js` exists 13 fn | P2 | 30min decommission OR archive | Med |

### Area 3: Testing debt

| ID | Issue | Evidence | Severity | Effort | ROI |
|----|-------|----------|----------|--------|-----|
| T3.1 | E2E coverage cross-compile chain **ZERO** | `find tests/e2e -name "*compile*"` = empty | **P0** | 3h (mock USB Playwright) | **CRITICAL** (Sprint U flagship) |
| T3.2 | E2E WebUSB picker mock missing | Same as T3.1 | P0 | included in T3.1 | Critical |
| T3.3 | Hardware UAT mock missing | No `dfu-util` mock | P0 | 4h (mock command line tool) | High |
| T3.4 | Vitest baseline 14418 PASS — runtime trends not measured | No `vitest --bench` or runtime telemetry in CI | P2 | 2h add reporter | Med |
| T3.5 | Largest test files: `actionCommands.test.js` 1460 LOC, `voiceCommands.comprehensive.test.js` 1166 LOC | `find tests -exec wc -l + sort -rn` | P2 | 4h split per concern | Med |
| T3.6 | 11 `todo` tests + 15 `skipped` in baseline (14444 total - 14418 PASS = 26) | Handoff iter 76 PHASE 3 §1 | P2 | 2h triage close OR delete | Med |
| T3.7 | TDD discipline iter 76+ sample: PHASE 3 commit `21124635` shipped 6 fixes — verify tests-first | `git show --stat 21124635` (not run, recommend follow-up) | P2 | 30min audit | Med |
| T3.8 | E2E specs density: 22 specs, only 5 in iter 77 P0 plan | `ls tests/e2e/*.spec.js wc` = 22 | P2 | ongoing | Med |
| T3.9 | No flaky test detection mechanism (no `--retry` history) | No `.test-flake-log` or similar | P3 | 1h add `--retry 2` + report | Low |
| T3.10 | Test runtime tests >5s NOT measured | No data | P3 | included T3.4 | Low |

### Area 4: Documentation debt

| ID | Issue | Evidence | Severity | Effort | ROI |
|----|-------|----------|----------|--------|-----|
| D4.1 | CLAUDE.md 3393 LOC, 854 "iter N" mentions | `wc -l + grep -c "iter "` | **P1** | 4h split + index | **High** (BG agent context cost) |
| D4.2 | `docs/handoff/` 92 files, ~30 pre-Sprint-U April 21 micro-handoffs | `ls docs/handoff wc -l` = 92 | P1 | 2h archive `docs/handoff/_archive/2026-04-pre-sprint-u/` | High (clarity) |
| D4.3 | ADR-028 INTENT dispatcher **PROPOSED** iter 36 PHASE 1 — never ratified post iter 37 | `head -5 ADR-028.md` Status PROPOSED 2026-04-30 | **P0** | 30min Andrea ratify decision OR demote to PROPOSED-LIVE | High |
| D4.4 | ADR-029 LLM routing weights ACCEPTED iter 37 — clean | OK | N/A | N/A | N/A |
| D4.5 | OpenAPI shipped iter 76-D.3 1028 LOC `docs/api/openapi.yaml` + 970 LOC `infra/cloud-compile/openapi.yaml` (drift risk) | `wc -l` both files | P1 | 1h verify divergence + dedupe OR cross-link | High |
| D4.6 | Glossario Tea integration NOT clone (external URL `https://elab-tutor-glossario.vercel.app/glossario`) — Andrea mandate iter 67+ | `feedback_glossario_external_url.md` MEMORY.md | P1 | 4-6h iter 78+ atom | High |
| D4.7 | 4 ADR directories `docs/adrs/`, `docs/adr/`, `docs/architectures/`, `docs/decisions/` | `find` paths | P2 | 1h consolidate | Med |
| D4.8 | Iter 21 codemod claim "200 violations singolare→plurale closed iter 64+" — NOT empirically verified iter 77 | MEMORY.md `feedback_unlim_language_rules_10may2026.md` | P2 | 1h re-scan grep | Med |

### Area 5: Infrastructure debt

| ID | Issue | Evidence | Severity | Effort | ROI |
|----|-------|----------|----------|--------|-----|
| I5.1 | Vercel deploy automation: verified live post iter 32 key rotation — assume OK | `vercel.json` exists root | P2 | 30min curl verify | Low |
| I5.2 | Render cloud deploy DEFERRED iter 76 D.6 Andrea decision pending | Handoff iter 76 PHASE 3 §1 Andrea action 1 | **P0** | 10min Andrea + 30min CLI | High |
| I5.3 | Mac Mini autonomous loop launchctl service: only `com.elab.automa.watchdog` visible | `launchctl list \| grep elab` = 1 service | P1 | 1h SSH Tailscale verify alive | High |
| I5.4 | claude-mem CLI BROKEN local iter 69+: still aliased to bun script, status unclear | `which claude-mem` = aliased OK, but functionality unverified iter 77 | P2 | 30min smoke test | Med |
| I5.5 | Sentry + PostHog MCPs: 0 references in `src/` | `grep -rn "Sentry\|posthog" src wc` = **0** | P2 | Andrea OAuth iter 78+ | Med |
| I5.6 | Cron warmup unlim-chat: `.github/workflows/render-warmup.yml` exists | `ls .github/workflows/` | P2 | 30min verify last run | Med |
| I5.7 | Pre-commit hook quick-regression-check.sh BLOCKING ✓ + experiment-registry drift check ✓ | `.githooks/pre-commit` content | P3 | N/A (this is GOOD) | N/A |
| I5.8 | NO ESLint config visible at root, NO Prettier | `ls .eslintrc* eslint.config*` = empty | **P1** | 2h add config + fix violations | High (consistency) |
| I5.9 | 10 GitHub Actions workflows | `ls .github/workflows wc` = 10 | P2 | 1h audit which still active | Med |
| I5.10 | 55 shell scripts in `scripts/` | `find scripts -name "*.sh" wc` = 55 | P2 | 1h audit obsolete | Med |

### Area 6: Sprint U specific (post iter 76 PHASE 3 close)

| ID | Issue | Evidence | Severity | Effort | ROI |
|----|-------|----------|----------|--------|-----|
| S6.1 | HARDWARE_PICKED_AWAITING_FLASH iter 77+ real dfu-util impl path | Iter 76 PHASE 3 close + handoff §3 P0.2 | **P0** | iter 78+ B.2 ~10-15h | Critical (close 9.5/10) |
| S6.2 | WebUSB Nano R4 product filter narrow post hardware verify | Handoff §3 P0.5 productId 0x0070 | P1 | 30min iter 77 P0.5 | High |
| S6.3 | Riccardo demo execution + screencast capture | Handoff §1 PENDING action 2 | **P0** | Andrea schedule | Critical |
| S6.4 | 94 esperimenti Playwright UNO-PER-UNO audit | MEMORY `feedback_iter21_mandate_critical.md` | P0 | Sprint V gate (~40h+) | High |
| S6.5 | Vol3 narrative refactor Davide co-author | MEMORY iter 72 BG-A5 abandoned skeleton-first | P1 | iter 78+ ~8-12h | High |
| S6.6 | Linguaggio codemod 200 violations claim CLOSED iter 64+ — **NOT verified iter 77** | MEMORY `feedback_unlim_language_rules_10may2026.md` | P1 | 30min grep re-scan | High (Principio Zero) |
| S6.7 | OpenAPI machine-validated swagger-cli CI integration | Handoff §1 P0.6 | P1 | 15min iter 77 | High |
| S6.8 | Iter 76-D.2 audit recommendations close 76-D.2.1/2/3/4 | Handoff §3 P0.3 | P1 | 70-100min iter 77 | High |
| S6.9 | Cross-compile chain LOCAL+CLOUD contract divergence regression iter 78+ | A2.1 verify | P1 | 30min iter 78+ | High |
| S6.10 | Mock USBDevice Playwright sandbox test | Handoff §3 P0.2 = T3.1 | **P0** | 3h iter 77 | Critical |

---

## Section 2 — Quick Wins iter 78+ (≤30min each)

**Top 5 atomic fixes ROI ≥ effort × 5**:

1. **QW-1 — ADR-028 ratify Andrea decision** (30min) — D4.3. Convert PROPOSED→ACCEPTED OR PROPOSED-LIVE with clear status line. Unblocks 40+ iter ambiguity. *File: `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md`*

2. **QW-2 — Linguaggio codemod 200 violations re-scan** (30min) — S6.6. `grep -rEn "\\b(ragazzo|alunno|bambino|studente)\\b" src --include="*.js" --include="*.jsx" | grep -v test | wc -l`. Verify count matches iter 64+ claim. *No file changes, evidence only.*

3. **QW-3 — Render deploy decision dispatch** (10min Andrea + 30min CLI) — I5.2/S6.1. Unblocks Sprint U close path.

4. **QW-4 — Decommission `compileAgentDetect.js` LEGACY** (30min) — C1.10/A2.8. `git mv src/services/compileAgentDetect.js src/services/_archive/compileAgentDetect.js.iter65-66.bak` + remove imports + run tests. *Files: `src/services/compileAgentDetect.js` + 2-3 import sites.*

5. **QW-5 — Archive 30 pre-Sprint-U handoffs** (20min) — D4.2. `mkdir docs/handoff/_archive/2026-04-pre-sprint-u/ && git mv docs/handoff/2026-04-2[01]-* docs/handoff/_archive/2026-04-pre-sprint-u/`. Clarity win.

---

## Section 3 — Medium-Term Initiatives iter 78-85 (2-5h scope)

**Top 10 atoms 2-5h, ROI ≥ effort × 3**:

1. **MT-1 — E2E mock USB Playwright spec** (~3h) — T3.1/T3.2/S6.10. `tests/e2e/05-cross-compile-mock-board.spec.js`. **Sprint U flagship blocker**. Pattern S r3 file ownership exclusive `tests/e2e/05-cross-compile-mock-board.spec.js` + `tests/e2e/helpers.js` (extend mock USB helper).

2. **MT-2 — CLAUDE.md split** (~4h) — D4.1. `CLAUDE.md` ≤500 LOC principles + `docs/CLAUDE-SPRINT-LOG.md` history archive. File ownership: `CLAUDE.md` + NEW `docs/CLAUDE-SPRINT-LOG.md`.

3. **MT-3 — ESLint + Prettier setup** (~2h) — I5.8. Add `eslint.config.js` flat config + `.prettierrc` + `npm run lint --fix` initial pass. File ownership: NEW config files + `package.json` script verify.

4. **MT-4 — TeacherDashboard.jsx extraction** (~5h) — C1.2. Extract 5 tab files from monolith. File ownership: `src/components/teacher/TeacherDashboard.jsx` + NEW `src/components/teacher/tabs/*.jsx` (5 new files).

5. **MT-5 — api.js split per concern** (~3h) — C1.6. `api.js` 1433 LOC → `api/chat.js`, `api/compile.js`, `api/supabase-bridge.js`. File ownership: `src/services/api.js` + NEW `src/services/api/*.js`.

6. **MT-6 — useAsyncFetch hook extraction** (~3h) — C1.8. 24 files duplicate `setLoading + setError` pattern. New `src/hooks/useAsyncFetch.js` + apply top 5 callers. File ownership: NEW hook + 5 caller files exclusive.

7. **MT-7 — Glossario Tea clone integration** (~4-6h) — D4.6/Andrea mandate iter 67+. Internal route `#glossario` cloned from `https://elab-tutor-glossario.vercel.app/glossario`. File ownership: NEW `src/components/glossario/Glossario.jsx` + `src/data/glossario-terms.json` + router wire.

8. **MT-8 — OpenAPI dedupe + cross-link** (~3h) — D4.5. Verify `docs/api/openapi.yaml` 1028 LOC vs `infra/cloud-compile/openapi.yaml` 970 LOC divergence + machine-validated swagger-cli CI (S6.7). File ownership: 2 OpenAPI files + NEW `.github/workflows/openapi-validate.yml`.

9. **MT-9 — Handoff archive batch + ADR directory consolidation** (~2h) — D4.2/D4.7/A2.7. Move 30 pre-Sprint-U handoffs to `_archive/` + consolidate 4 ADR dirs → `docs/adrs/` canonical. File ownership: `docs/handoff/_archive/` + `docs/adrs/_imported/`.

10. **MT-10 — Galileo→UNLIM safe-delete pass** (~2h) — A2.5. 32 grep matches remain. Audit each: keep alias-only (browser localStorage migration) OR delete. File ownership: 10 files via grep list, plan iter 78+ B-RENAME atom exclusive scope.

---

## Section 4 — Long-Term Sprint V+ Initiatives (8h+ scope)

**Top 5**:

1. **LT-1 — Hardware UAT real dfu-util impl path** (~10-15h) — S6.1/B.2 iter 78+. Real USB flashing with avr-isp protocol layer. Sprint V foundational.

2. **LT-2 — SimulatorCanvas.jsx 3173 LOC extraction** (~10h) — C1.3. 23 internal components → 5-6 files. High-risk regression, needs full E2E coverage first (T3.1 prerequisite).

3. **LT-3 — 94 esperimenti Playwright UNO-PER-UNO audit** (~40h+) — S6.4/Andrea iter 21+ Sprint V gate. One-spec-per-esperimento.

4. **LT-4 — Vol3 narrative refactor Davide co-author** (~8-12h) — S6.5. Resume iter 72 BG-A5 with skeleton-first abandoned approach.

5. **LT-5 — Cortex-M4 Renesas RA4M1 simulator** (~40h+) — C1.7/A2.6. Replace AVRBridge.js ATmega328p-only with multi-arch. Sprint V+ only.

---

## Section 5 — Prevention Strategy

**Linters + pre-commit + continuous verify gaps**:

1. **GAP-1 — NO ESLint at root** (I5.8). Add `eslint.config.js` flat with rules: `max-lines-per-function: 50`, `complexity: 10`, `max-lines: 500` (with overrides for data files). Block new code violations.

2. **GAP-2 — Pre-commit currently runs Vitest + experiment-registry only** (I5.7 GOOD baseline). Add: ESLint --max-warnings 0 + size budget check (`size-limit` on dist/).

3. **GAP-3 — Codex Pattern V continuous verify** (iter 76 PHASE 3 close demonstrated value). Add scheduled GitHub Action: weekly Codex re-audit on `feat/iter-*` branches. Effort: 2h CI setup.

4. **GAP-4 — Bundle size budget enforcement** (handoff iter 76 mentions bundle ~4000KB 33 precache). Add `size-limit` package + CI failure if regression >50KB. Effort: 1h.

5. **GAP-5 — Test runtime regression** (T3.4/T3.10). Add `vitest --reporter=verbose --logHeapUsage` weekly + alert if any test >5s. Effort: 2h.

6. **GAP-6 — ADR lifecycle automation**. PROPOSED→ACCEPTED auto-bot or PR template with status update reminder. Effort: 1h template + 2h bot.

---

## Section 6 — ROI Projections (Honest)

**Effort vs Sprint U close 9.5/10 lift**:

| Bucket | Effort | Score lift estimate | Confidence |
|--------|--------|---------------------|------------|
| Quick wins (QW-1..5) | ~2.5h total | 8.5 → 8.6 (+0.1) | High |
| MT-1 E2E mock USB | 3h | 8.6 → 8.9 (+0.3) | High (Sprint U flagship) |
| MT-2 CLAUDE.md split | 4h | 8.9 → 9.0 (+0.1) | Med (developer velocity, indirect) |
| MT-3 ESLint setup | 2h | 9.0 → 9.05 (+0.05) | Med (long-tail catch rate) |
| LT-1 dfu-util real | 10-15h | 9.05 → 9.4 (+0.35) | High (Sprint U close gate) |
| LT-2 SimulatorCanvas extract | 10h | NO direct score lift (debt reduction) | Low score impact |
| LT-3 94 esperimenti audit | 40h | Sprint V scope, no Sprint U lift | N/A |

**Honest projection iter 77-85**: Sprint U close achievable 9.0-9.3/10 with ~30-40h of effort across QW + MT-1/MT-2/MT-3 + LT-1. **9.5/10 cap requires hardware UAT real** (LT-1 prerequisite + Andrea schedule Riccardo demo).

**Anti-inflation note**: orchestrator iter 76 self-report 8.5/10 G45 cap is plausible but lacks independent validation. Recommend iter 77 BG verification dispatch *before* claiming 9.0/10 in PHASE 4.

---

## Section 7 — Six Honesty Caveats (No Compiacenza)

1. **CAVEAT-1 — Did NOT run `vitest --coverage`**. Coverage % unknown iter 77 entrance. Section 3 (Testing debt) inferences based on file-system grep + spec counts. Recommend follow-up audit `npm run test:ci` + analyze `coverage/` output. *Effort: 30min.*

2. **CAVEAT-2 — Did NOT analyze full circular-dependency graph**. Sampled imports only. `madge --circular src/` not executed. Tight coupling claims in Area 1 are based on file size proxy. Real dep graph audit needed iter 78+. *Effort: 1h.*

3. **CAVEAT-3 — Iter 21 codemod 200 violations CLOSED claim NOT empirically verified**. MEMORY.md states closed iter 64+ but no grep evidence run this audit (QW-2 is the remediation, not the verification). High-risk if claim false: Principio Zero violation in production. *Effort: 30min grep re-scan.*

4. **CAVEAT-4 — Mac Mini autonomous loop liveness assumed from `launchctl list | grep elab` = 1 service**. SSH Tailscale verify not executed this audit (per Pattern S r3 read-only constraint). Status unclear. *Effort: 5min SSH ping.*

5. **CAVEAT-5 — Render cron warmup last execution NOT checked**. `.github/workflows/render-warmup.yml` exists but `gh run list --workflow=render-warmup.yml` not run. Could be silently failing. *Effort: 5min gh CLI.*

6. **CAVEAT-6 — Score projection (Section 6) is orchestrator-style estimate, NOT independent benchmark**. Sprint U close 9.5/10 cap = G45 ceiling. Real validation requires Codex Pattern V dispatch + Andrea ratify + Riccardo demo screencast. This audit cannot itself raise the score; it can only enumerate work. **Risk**: agent compiacenza if score lifted without independent verification dispatch.

---

## §8 — Atomization Recommendations (10 atoms iter 78+)

**Format**: `ATOM-{iter}-{phase}-{topic}` per `automa/tasks/pending/` convention. **DO NOT create the atom files this dispatch — list in audit only**.

| Atom ID | Scope | Effort | Dependencies | File ownership exclusive | Sprint U box |
|---------|-------|--------|--------------|--------------------------|--------------|
| ATOM-78-A.1 | E2E mock USB Playwright spec | 3h | None | `tests/e2e/05-cross-compile-mock-board.spec.js` + `tests/e2e/helpers.js` | Box 18 (E2E coverage cross-compile) |
| ATOM-78-A.2 | CLAUDE.md split principles vs history | 4h | None | `CLAUDE.md` + NEW `docs/CLAUDE-SPRINT-LOG.md` | Box 11 (docs) |
| ATOM-78-A.3 | ADR-028 ratify Andrea decision PROPOSED→ACCEPTED | 30min | Andrea ratify gate | `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` | Box 11 (decisions) |
| ATOM-78-A.4 | Decommission compileAgentDetect.js LEGACY | 30min | None | `src/services/compileAgentDetect.js` + 2-3 import sites | Box 18 (cross-compile clean) |
| ATOM-78-A.5 | ESLint + Prettier setup root | 2h | None | NEW `eslint.config.js` + `.prettierrc` + `package.json` script | Box 11 (governance) |
| ATOM-78-B.1 | TeacherDashboard.jsx tabs extraction (5 files) | 10h | ATOM-78-A.5 ESLint | `src/components/teacher/TeacherDashboard.jsx` + NEW `src/components/teacher/tabs/*.jsx` | Box 9 (dashboard) |
| ATOM-78-B.2 | Hardware UAT real dfu-util impl path | 10-15h | LT-1 + ATOM-78-A.1 E2E | `src/services/elab-agent/http-server.js` + `infra/cloud-compile/server.js` | Box 18 (Sprint U close) |
| ATOM-78-B.3 | OpenAPI dedupe + swagger-cli CI validate | 3h | None | `docs/api/openapi.yaml` + `infra/cloud-compile/openapi.yaml` + NEW `.github/workflows/openapi-validate.yml` | Box 19 (API governance) |
| ATOM-78-B.4 | Glossario Tea clone internal route | 4-6h | None | NEW `src/components/glossario/*` + `src/data/glossario-terms.json` + router wire | Box 13 (Andrea iter 67+ mandate) |
| ATOM-78-C.1 | Handoff archive 30 pre-Sprint-U + ADR dir consolidate | 2h | None | `docs/handoff/_archive/` + `docs/adrs/_imported/` | Box 11 (docs hygiene) |

**Pattern S r3 race-cond prevention**: each atom owns disjoint file sets per validated iter 76 22× consecutive zero overlap. Atoms A.1-A.5 + B.1-B.4 + C.1 = 10 atoms total, parallel-dispatchable max 6 BG agents per orchestrator policy (handoff §1 question D).

**Sprint U close box mapping** (per SPRINT_U_COMPLETE 25 boxes status iter 76 PHASE 3): atoms A.1+A.3+A.4+B.2+B.3 unblock 5/6 outstanding P0 blockers per Section 0. Box 18 (cross-compile E2E + hardware UAT real) requires both A.1 (immediate iter 78) + B.2 (iter 78-80).

---

## §9 — Verdict Sintetico

**Sprint U post iter 76 PHASE 3 close tech debt state**: **MODERATO-CONTROLLATO**.

**Positivi (anti-compiacenza compliant)**:
- Only 7 TODO/FIXME in entire src/ (C1.9) — exceptional discipline
- Supabase client centralized single source (no dup) — clean
- Pre-commit hook BLOCKS regressions (I5.7) — good gate
- Vitest 14418 baseline + delta tracking (`.test-count-baseline.json`) — TDD culture present
- 92 handoffs + 32 ADRs + 9 specs = high documentation density (D4.1 is volume not quality complaint)

**Negativi (mandate Andrea "non compiacermi")**:
- God classes 4 files >2400 LOC = velocity tax compound interest
- ZERO E2E cross-compile coverage = Sprint U flagship surface untested
- ADR-028 PROPOSED 40+ iter = decision-making latency
- CLAUDE.md 3393 LOC = BG agent context pollution
- NO ESLint root = inconsistency drift inevitable

**Iter 78+ orchestrator recommendation**: dispatch 5 atoms parallel iter 78 entrance: ATOM-78-A.1 (E2E mock USB) + A.2 (CLAUDE.md split) + A.3 (ADR-028 ratify) + A.4 (compileAgentDetect decommission) + A.5 (ESLint setup). Budget ~10h total + ~10h orchestrator coordination = 1 sprint iter 78-79.

**Sprint U close path 9.5/10**: requires ATOM-78-B.2 (dfu-util real) + Andrea Riccardo demo + Codex Pattern V independent verify. NOT achievable iter 78 alone. Realistic iter 80-85.

---

**Fine audit BG 77-A.5**. Commit + handoff orchestrator batch.
