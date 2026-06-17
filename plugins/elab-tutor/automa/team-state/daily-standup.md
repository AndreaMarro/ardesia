# Daily Standup — Team ELAB

Prossimo standup: **Gio 23/04/2026 ore 9:00** (sprint-4 Day 01 kickoff IF gate PASS Day 07)

---

## Standup 2026-04-22 MATTINA — Day 07/56 FINAL sett-3 (mer 22/04 — Sprint sett-3 day 7/7 end-week-gate)

**Baseline**: test 12220 PASS | build PASS | benchmark 4.75/10 (+0.63 Day 06) | 24 commits ahead origin/main pushed `2b818ea` | branch `feature/sett-3-stabilize-v3`
**Sprint Contract**: `automa/team-state/sprint-contracts/sett-3-day-07-contract.md`
**Dispatch cap**: 4 (gate day, focused)

### Ieri Day 06 mar 21/04 (done verificato)
- Benchmark uplift **+0.63** (4.12 → 4.75) via `worker_uptime` metric wiring → `automa/state/worker-probe-latest.json`
- 2/3 worker live 200 (Nanobot + Edge TTS OK, Supabase 401 anon-key P3)
- End-day atomic commit `2b818ea` state + audit + handoff + claude-mem obs queue
- Day 05 deliverables consolidati: worker-probe.sh + unlimLatencyLog.js + E2E spec 15 Dashboard live
- Zero regression 12220 baseline preserved

### Oggi Day 07 FINAL (3 P0, end-week-gate, ~1.5h stima)
- **P0-1 TPM**: Sprint 3 Review + Retrospective docs (`docs/reviews/sprint-3-review.md` + `docs/retrospectives/sprint-3-retrospective.md`)
- **P0-2 TPM**: PR sett-3 create `gh pr create` base=main head=feature/sett-3-stabilize-v3 NO auto-merge
- **P0-3 AUDITOR**: End-week gate verdict PASS/FAIL (`docs/audits/2026-04-22-sett-3-end-week-gate.md`) — CoV 3x+ vitest + build + benchmark --write + bundle check + E2E spec 15 parse

### Blocker aperti carry-over
- **0 OPEN** (13/13 storici CLOSED)
- P3 residual doc-only: ADR-003 anon-key env provisioning pending Andrea (non-gate-blocking, carry sprint-4)

### Note
- Sprint-3 gate OGGI Day 07 — verdict binding for PR merge decision (Andrea only)
- Sprint-4 kickoff domani Day 08 IFF gate PASS, else DEFER fix-forward
- Benchmark 4.75 vs PDR target 8.0 → gap -3.25 (sprint-3 contribution +0.63 = 19% of closure needed)
- 4-grading self target FINAL: 7.5 media (design 7.5 / originality 6.5 / craft 8.0 / functionality 8.0)

---

## Standup 2026-04-23 MATTINA — Day 04/56 (gio 23/04 — Sprint sett-1 day 4/7)

**Baseline**: test 12164 PASS | build PASS | benchmark 4.07/10 | 1 unpushed e197d37 | branch `feature/t1-003-render-warmup`
**Sprint Contract**: `automa/team-state/sprint-contracts/day-04-contract.md`
**Dispatch cap**: 3 (headless loop economico)

### Ieri Day 03 mer 22/04 (done verificato)
- 3 commit: `8c9a0eb` TPM+velocity + `f5b071a` Vision skeleton + `2a0efb3` revert duplicate
- Test 12164 stable (skeleton reverted honest, zero inflation)
- E2E 12 spec confermati. CoV 3/3 PASS
- Auditor 7.0/10 post-fix (6.8 initial NOT READY → fix same-session)
- Reviewer APPROVE pre-revert f5b071a
- Discovery: dual playwright config (tests/e2e vs e2e) + duplicate spec → revert
- Handoff `docs/handoff/2026-04-22-end-day.md`

### Oggi Day 04 (3 task P0, ~2.5h stima, inline lavoro)
- **INLINE TPM**: sprint contract day-04 + blockers reconcile + velocity day 3 entry
- **INLINE/DEV**: ATOM-002 Dashboard a11y WCAG 2.1 AA P0+P1 (90min)
- **INLINE**: audit 20 metrics + CoV 5x + stress test post-deploy
- **INLINE**: JWT 401 ADR + MCP Supabase verify (20min)
- **18:00**: Tea onboarding Zoom (info only, not code)

### Blocker aperti carry-over
- P0 JWT 401 Edge CLI curl → ADR inline + MCP verify
- P1 velocity day 3 missing → fix inline
- P2 152 dirty files → decision: carry sett 2 (no blocco sprint)
- P2 Product backlog gerarchico non formal → carry sett 2
- P3 no-regression-guard.sh --dry-run → sett 2

### Note
- Branch feature/t1-003-render-warmup ha 1 unpushed (e197d37 ancora su origin — verifica CI)
- Sett gate Day 7 (dom 26/04) → 3 day ancora (Day 05 ven + Day 06 sab + Day 07 dom)
- Benchmark target sett 1 = 6.0/10 → serve +1.93 in 3 day (+0.64/day realistic ma alto)

---

## Standup 2026-04-22 SERA — Chiusura Day 03 (retroactive formal)

**Test count**: 12164 stable (0 net)
**Build**: PASS
**Benchmark**: 4.07/10 (+0.01 vs day 02)
**Commits sessione**: 3 (feature branch, 1 unpushed alla fine)
**Reviewer**: APPROVE (f5b071a pre-revert)
**Auditor**: 7.0/10 post-fix (6.8 iniziale corretto same-session)

### Fatto oggi (Day 03 mer 22/04)
- TPM `8c9a0eb`: standup entry + velocity tracking day 2 populated + baseline 12164 committed
- TESTER `f5b071a`: E2E skeleton Vision T1-004 3 case (fail-gracefully)
- DISCOVERY: 22-vision-flow.spec.js duplicato con scope T1-004 → decisione revert
- REVERT `2a0efb3`: rimozione duplicate Vision E2E skeleton (zero inflation)
- AUDITOR brutale: iniziale 6.8 NOT READY (dual config + duplicate) → fix same-session → 7.0 READY
- Handoff scritto `docs/handoff/2026-04-22-end-day.md`

### Domani Day 04 gio 23/04
- ATOM-002 Dashboard a11y WCAG (src work real)
- Blockers reconcile (velocity, backlog)
- JWT 401 ADR
- Audit + stress test aumentato

### Blocker aperti
- 1 unpushed (e197d37) → push-safe in STEP 5
- JWT 401 Edge curl (carry-over)
- Benchmark target sett 1 at-risk: 4.07 vs target 6.0 (+1.93 in 3 day)

---

## Standup 2026-04-22 MATTINA — Day 02 START

**Baseline**: test 12149 | build PASS 77s | benchmark 4.06/10 | 0 unpushed (verified) | SHA 109cb33
**Sprint Contract**: ratificato retroattivo `docs/sprints/sprint-1-contract.md`
**Dispatch cap oggi**: 5 (rigoroso, Day 01 era 7 overflow)

### Ieri Day 01 (done verificato)
- T1-001, T1-002, T1-009 merged (3 bug T1 P0 chiusi)
- FOUNDATIONS-CLI + FOUNDATIONS-TOGETHER merged (12 commits)
- REVIEWER APPROVE, AUDITOR 6.5/10 zero inflation
- Test +33, benchmark +1.29, PZ v3 preserved

### Oggi Day 02 (5 task P0-P1, 5h estimate + 3h buffer)
- DEV P0: T1-003 Render cold start warmup cron (2h)
- DEV P0: DAY02-SUPABASE-REF canonicalize vxvqalmxqtezvgiboxyv (10 min carry-over)
- DEV P1: DAY02-JWT-401 resolve (30 min, dep DAY02-SUPABASE-REF)
- DEV P1: DAY02-BENCH-WRITE persist + E2E assertions tighten (1h)
- DEV P1: DAY02-REVIEWER-MINOR batch 5 issues (1h)
- TPM P1: DAY02-VELOCITY seed velocity-tracking.json (done con questo standup)

### Blocker aperti
- P0: dual-supabase-ref (Andrea conferma vxvqalmxqtezvgiboxyv canonical)
- P1: JWT 401 edge functions
- P2: 152 dirty files carry-over (triage DAY02-DIRTY-TRIAGE)
- P3: no-regression-guard.sh --dry-run reale

### Note
- Day 03 mer 23/04 18:00 Tea onboarding Zoom 1h
- Next STEP 2 dependency: DAY02-SUPABASE-REF chiuso sblocca T1-005 dashboard

---

## Standup 2026-04-21 SERA — Chiusura Day 01

**Test count**: 12149 (delta +33 vs baseline 12116)
**Build**: PASS (77s)
**Benchmark**: 4.06/10 (up from 2.77)
**Commits sessione**: 12 (9 unpushed)
**Reviewer**: APPROVE
**Auditor**: 6.5/10 (corrected, zero inflation detected)

### Fatto oggi (Day 01)
- DEV: T1-001 lavagna toggleDrawing fix (commit 1c753c3)
- DEV: T1-002 whiteboard persistenza sandbox + auto-save (commit 4d512b7)
- DEV: T1-009 Tea autoflow CODEOWNERS + GH Action (commit 129f37c)
- DEV: 9 CLI autonomous scripts (no-regression-guard, verify-llm-switch, etc.)
- DEV: 12 E2E Playwright specs (31 tests, 3/3 verified running)
- DEV: llm-client.ts dispatcher Together AI (20/20 PZ v3 PASS)
- DEV: Gemini -> Together AI provider switch (system prompt untouched)
- REVIEWER: foundations-reviewer-verdict.md — APPROVE with 5 minor issues
- AUDITOR: foundations-brutal-audit — 6.5/10, zero inflation, GO for Tuesday

### Domani mar 22/04 (Day 02, 3 task)
- **P0**: git push 9 unpushed commits + CI watch (30min, MUST FIRST)
- **P0**: T1-003 Render cold start warmup cron (2h, dev)
- **P1**: Benchmark --write persist + tighten E2E homepage assertions (1h, dev)
- Note: Tea onboarding mer 23/04 18:00 Zoom

### Blocker aperti
- 9 unpushed commits — work at risk if machine fails
- JWT 401 on Supabase edge functions — cannot verify PZ v3 live via CLI
- Dual Supabase project refs (euqpdueopmlllqjmqnyb vs vxvqalmxqtezvgiboxyv) unresolved

---

## Standup 2026-04-21 (Day 01/56 — Sprint START)

**Owner**: Andrea solo (Tea onboarding mer 23/04)
**Capacity**: 8h (09:00-18:00, pausa 13-14)
**Baseline**: 12103 test PASS, build PASS, benchmark 2.77/10

### Ieri (prep day 20/04)
- TPM: 12 harness file creati, 6 ADR scritte, baseline verificata 12103 test
- TPM: setup automa/team-state/ (5 file), .claude/agents/ (6 file), tools-config.json
- TPM: T0-001 completato e chiuso

### Oggi (3 task P0, 8h totali)
- ARCHITECT: T1-001 lavagna vuota non selezionabile (3h, blueprint state machine)
- ARCHITECT: T1-002 scritti spariscono su Esci/persistenza (3h, batch con T1-001 stesso blueprint)
- DEV: T1-009 Tea autoflow CODEOWNERS + GH Action auto-merge (2h, infra, deadline mer 23/04)
- TESTER: test paralleli per T1-001 e T1-002 dopo blueprint (assegnato post-blueprint)

### Blocker
- Working tree dirty 60+ file (CSS + engine unstaged da sessioni precedenti) — non blocca sprint, carry-over deliberato
- Supabase potenzialmente PAUSED (401) — non blocca day 01 (nessun task DB oggi)

### Quota dispatch stima
- Mattina (09-13): 3 dispatch Opus (architect x2 batch, dev x1)
- Pomeriggio (14-18): 2 dispatch Opus (tester x1, review x1)
- Totale: ~5 dispatch, sotto cap 5/giorno

---

## Standup 2026-04-20 (Prep Day — domenica)

**Owner**: Andrea solo (Tea onboarding mer 23/04)

### Ieri
- (sabato recovery, no sessione)

### Oggi (prep day)
- Andrea: lettura 7 file pre-flight PDR (AUDIT + GENERALE + SETT_1 + GIORNO_01 + MULTI_AGENT + PTC + HARNESS)
- Andrea: verifica tooling (claude 2.1.114, node 22, npm 10.9, gh 2.89) OK
- Andrea: setup `.claude/agents/team-*.md` 6 file Opus
- Andrea: setup `automa/team-state/` 5 file (tasks-board, standup, decisions, blockers, roster)
- Andrea: setup `.claude/tools-config.json` PTC enabled
- Andrea: scrive handoff `docs/handoff/2026-04-20-prep-day-end.md`

### Blocker
- Nessuno (prep day strutturale, no impl)

### Note
- Working tree dirty da sessioni precedenti (CSS + engine unstaged) - NON committare, lasciare per sett 1 review
- Stop entro 21:00 recovery serale
- Sprint START official lun 21/04 9:00 via `PDR_GIORNO_01_LUN_21APR.md`

---

## Template standup prossimi giorni

```
## Standup YYYY-MM-DD

### Ieri
- TPM: [task done]
- ARCHITECT: [blueprint done]
- DEV: [PR aperte/mergiate]
- TESTER: [test scritti]
- REVIEWER: [review fatte]
- AUDITOR: [audit report]

### Oggi
- TPM: [assegnazioni]
- ARCHITECT: [design]
- DEV: [task in progress]
- TESTER: [test to write]
- REVIEWER: [PR to review]

### Blocker
- [...]
```

---

## Standup 2026-04-21 — Day 10 cumulative (sett-2 Day 03)

**Owner**: inline TPM (Andrea autopilot)
**Branch**: feature/sett-2-stabilize-v2
**Baseline**: 12164 test PASS, CoV 3x sett-2 Day 09, benchmark 3.95/10
**Previous day**: 4 blockers CLOSED (003/004/007/008), engine lock preserved

### Ieri (Day 09, chiuso)
- TPM: 4 blocker closed + handoff
- DEV: dirty files triage (152 → 0 semantic diff)
- TESTER: CoV 3x 12164 PASS
- AUDITOR: audit day-09 + blocker reconcile

### Oggi (Day 10, 5 task P0)
- TESTER: P0-1 Vision E2E spec scaffold (13-vision.spec.js) + CoV 3x
- DEV: P0-3 Dashboard scaffold (src/components/dashboard/, shell only, zero feature)
- TPM (inline): P0-2 MCP discipline log day-10 (10+ calls)
- AUDITOR: P0-4 audit matrix 20-dim day-10
- TPM (inline): P0-5 handoff + state + velocity Day 10

### Blocker
- Nessuno aperto sett-2 (Day 09 closed last 4)
- Watermark noise auto-reverted start Day 10 (0 dirty)

### Dispatch plan
- Mattina: tester + dev parallel sync (~90min totale)
- Pomeriggio: auditor (~20min) + handoff inline (~15min)
- Totale: 3 dispatch Opus + inline work

---

## Standup 2026-04-21 — Day 11 cumulative (sett-2 Day 04)

**Owner**: inline TPM (headless loop)
**Branch**: feature/sett-2-stabilize-v2
**Baseline**: 12166 test PASS Day 10, benchmark 3.95/10 fast-mode
**Previous day**: Day 10 closed 7.25/10, 4 commits (vision + dashboard + contract + finalize)
**Blocker carry-over**: NPM_DEPS_APPROVAL_PENDING (ai + zod) → **PIVOT DEBT-ONLY**

### Ieri (Day 10, chiuso)
- TPM: Sprint Contract Day 10 + standup + Audit + Handoff
- DEV: Dashboard scaffold (DashboardShell shell only)
- TESTER: Vision E2E spec 13-vision.spec.js scaffold
- AUDITOR: audit 20-dim Day 10 (score 7.25/10)

### Oggi (Day 11, 4 task P0 debt-only pivot)
- DEV (inline): P0-1 Dashboard route wiring `#dashboard-v2` → DashboardShell
- TPM (inline): P0-2 Velocity tracking sett-2 schema + Day 08-10 backfill
- DEV (inline): P0-3 Pre-commit watermark filter script (BLOCKER-003 mitigation)
- TPM+AUDITOR: P0-4 audit matrix 20-dim day-11 + handoff + state + CoV 5x

### Blocker
- OPEN: NPM_DEPS_APPROVAL (ai + zod) → Vercel AI SDK Day 12+ se approvato
- Watermark hook P3 debt → mitigato da P0-3 script today

### Pivot rationale
Day 11 original: Vercel AI SDK 5 tools. Blocker Andrea approval in headless loop. Pivot 3 debt items (zero new deps) progressano T1-005 + process hygiene. Day 12 revisit SDK se approvato.

---

## Standup 2026-04-21 — Day 12 cumulative (sett-2 Day 05)

**Owner**: inline TPM (headless loop)
**Branch**: feature/sett-2-stabilize-v2
**Baseline**: 12166 test PASS Day 11, benchmark 3.95/10 fast-mode, CoV 5x clean
**Previous day**: Day 11 closed 7.1/10, 3 fix-budget commits (route + filter + velocity) + 1 finalize
**Blocker carry-over**: NPM_DEPS_APPROVAL_PENDING (ai + zod) → **CONTINUE DEBT-ONLY PIVOT**

### Ieri (Day 11, chiuso)
- DEV inline: Dashboard `#dashboard-v2` route wiring (commit 297e969)
- DEV inline: Pre-commit watermark filter script 126+65 lines (commit 8b97720)
- TPM inline: Velocity sett-2 backfill Day 08-10 (commit 54513b3)
- TPM+AUDITOR inline: audit 20-dim + handoff + state (commit ded2e19 + bdb1fa7)
- Honest floor miss: MCP calls direct = 0 (target ≥10)

### Oggi (Day 12, 4 task P0 debt + MCP discipline recovery)
- DEV (inline): P0-1 Claude-mem MCP save wire helper script + doc → fix Day 11 floor miss
- TESTER (inline): P0-2 E2E dashboard-v2 smoke spec Playwright 14 → sett-2 contract Day 05 alignment
- DEV (inline): P0-3 Watermark filter CI integration analysis + doc
- TPM+AUDITOR (inline): P0-4 audit 20-dim day-12 + CoV 5x + handoff + state + velocity

### Blocker
- OPEN: NPM_DEPS_APPROVAL (ai + zod) → Vercel AI SDK Day 13+ se approvato
- Mitigation: debt pivot continues T1-005 progression + discipline hygiene

### Focus
Contract Day 05 "T1-005 Dashboard continue + E2E spec extension" matched by P0-2. MCP floor miss recovery P0-1. CI watermark enforcement path P0-3. Zero agent dispatch (inline, max-turns 200 budget).

### Dispatch plan
- All inline (TPM/DEV/TESTER/AUDITOR roles rotated)
- Zero Opus agent dispatch → keep context lean
- ~2h estimated total work
