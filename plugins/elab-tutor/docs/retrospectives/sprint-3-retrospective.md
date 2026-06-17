# Sprint 3 Retrospective — sett-3-stabilize-v3

**Sprint**: 3/8 (cumulative Day 15-21, local Day 01-07)
**Date**: 2026-04-22 (session real, simulated sprint close lun 28/04)
**Format**: Harness 2.0 compatible (Keep / Stop / Start + honest gap ledger + action items sprint-4)
**Attendees**: Andrea Marro (PO/dev), Claude Opus 4.7 (AI pair)

---

## TL;DR

Sprint-3 **PARTIAL PASS**. Benchmark lift achieved (3.95 → 4.75, +0.80) but target 5.0 missed by -0.25 due to Option B scope restriction. 3 blockers closed (target 2 ✅). Dashboard Phase 1 scaffold + E2E delivered, real-data wiring deferred sprint-4. Process discipline held: CoV 3x daily, zero regression, engine lock preserved, auditor avg 7.53 (+0.28 vs sett-2). 3 deferred stories (5 SP) flow to sprint-4 backlog.

**Key lesson**: scope discipline beats ambition. Option B small-steps produced shippable increment vs sett-2 silent NPM blocker pattern.

---

## Keep (what worked — do more)

### K1. Scope discipline via Option B
Pre-sprint locked Option B (zero-new-deps) preempted NPM blocker drift. When BLOCKER-011 resolved Day 02 (Andrea approve ai+zod), team preserved Option B discipline instead of scope-creeping. Result: zero scope churn mid-sprint.

**Apply sprint-4**: default to Option B unless explicit Andrea pre-sprint approval. Treat scope expansion as mid-sprint change request requiring formal re-contract.

### K2. Daily benchmark ratchet (even -0.03 noise)
Daily `benchmark.cjs --write` each handoff provides instant regression signal. Day 16 -0.03 honest regression surfaced (not hidden), Day 20 +0.63 uplift verified data-driven (worker_uptime).

**Apply sprint-4**: continue daily benchmark + flag delta > ±0.05 for investigation.

### K3. Regression guards via test (not just lint)
Commit `54b97a5` added 25-case vitest regression guard for `git_hygiene` regex. Future regex drift caught automatically. Pattern: **prefer test assertion over prose in ADR**.

**Apply sprint-4**: every benchmark metric regex/logic change = corresponding test case.

### K4. Atomic commits with `[TEST N]` tag
All 24 sett-3 commits atomic, `[TEST N]` tag present. Instant audit trail. Engine lock preserved via `git checkout HEAD -- src/` Day 09-style discipline.

**Apply sprint-4**: pre-commit hook enforcement of `[TEST \\d+]` pattern.

### K5. Brutal-honest daily audits + auto-critica
7/7 daily audits filed with ≥5 gap enumeration. Day 05-06 MCP deficit surfaced publicly, not hidden. Self-score avg 7.53 — neither inflated (sett-2 claim inflation pattern) nor deflated.

**Apply sprint-4**: maintain ≥5 gap auto-critica minimum; red-flag any audit with fewer.

### K6. End-day handoff standardization
Every day ended with `docs/handoff/YYYY-MM-DD-end-day.md`. State persistence via `automa/state/claude-progress.txt` survived context compacts. Recovery at Day 07 start was seamless.

**Apply sprint-4**: preserve handoff discipline as-is.

---

## Stop (what hurt — eliminate)

### S1. MCP calls deficit Day 05-06 (sprint debt)
Day 05-06 MCP external probes (Supabase, Vercel, Sentry, Context7) dropped below floor 15/day. TPM coordination dispatched inline instead. Hidden cost: less external live verification, more assumption-based decisions.

**Sprint-4 action**: MCP call count ≥ 15/day MANDATORY, logged in daily audit matrix. Red-flag < 10.

### S2. Watchdog commit noise (7 anomaly commits pre-sprint)
Branch `feature/sett-3-stabilize-v3` has 7 watchdog `chore(watchdog)` commits before sprint start. Noise in commit history, zero business value. Automated watchdog should append to log file, not git commits.

**Sprint-4 action**: modify watchdog to `--no-commit --append-log` mode. Document in ADR-005.

### S3. Dashboard real-data deferred (too late Day 07)
Scaffold + E2E delivered Day 03-05, real Supabase wiring never attempted. Root cause: ADR-003 anon-key env provisioning blocker opened Day 06 but not escalated to Andrea early.

**Sprint-4 action**: escalate environment/credential blockers in Day 01 standup, not Day 06. Document in handoff header.

### S4. CoV only 3x (below sprint-3 rules 5x target)
Daily CoV was 3x runs. Sprint-3 rules specify 5x Day 04+. Shortfall accepted due to vitest duration ~55s × 5 = 4.5min/day overhead.

**Sprint-4 action**: CoV 5x implemented as PTC code_execution parallel (3 concurrent workers = 3min total vs sequential 4.5min). Feature-gate in `scripts/cov-parallel.sh`.

### S5. Sprint-2 PR #17 stuck draft state
PR #17 referenced in sprint-2 but not merged nor closed. Dead-code artifact.

**Sprint-4 action**: Day 01 triage PR #17 → merge / close / rebase onto sett-4 (decision required Andrea).

---

## Start (what to introduce)

### N1. PTC code_execution for CoV + stress-test batch
Use Claude Programmatic Tool Calling `code_execution` container for:
- CoV 5x vitest parallel (3 workers concurrent)
- 50-prompt PZ v3 batch verify
- Lighthouse multi-page audit
- Playwright E2E shard parallel

Expected saving: -37% token, -50% wall-clock on batch ops.

**Sprint-4 Day 01**: `.claude/tools-config.json` `code_execution_enabled: true` + first batch op CoV 5x parallel.

### N2. Sprint-4 kickoff contract Day 01 MUST include
- 4 deferred sprint-3 stories explicit (dashboard real-data, accessibility_wcag, unlim_latency_p95, PR#17 triage)
- MCP call budget floor 15/day
- Environment blocker escalation protocol Day 01
- Watchdog noise suppression (ADR-005)

### N3. Velocity tracking file sett-3
Create `automa/state/velocity-tracking-sett-3.json` mirroring sett-1 + sett-2 format. Populate 7/7 daily entries retrospective (backfill from daily audits). Compute rolling 3-sprint avg.

### N4. Sprint 4 theme: INTELLIGENCE foundations
Per PDR 8-week: sett-4 = first AI intelligence layer. Candidates:
- Karpathy three-layer LLM Wiki (researched Day 03 commit `0413649`)
- UNLIM latency p95 telemetry pipeline
- Teacher Dashboard real data
- Accessibility WCAG tooling baseline

Andrea decision pre-sprint kickoff.

---

## Gap Ledger (honest debt)

| # | Gap | Severity | Carry | Owner |
|---|-----|----------|-------|-------|
| 1 | Benchmark 4.75 vs target 5.0 | P2 | sprint-4 levers | TPM/AUDITOR |
| 2 | Dashboard real Supabase data | P2 | sprint-4 Epic 4.1 | DEV |
| 3 | accessibility_wcag metric 0 | P2 | sprint-4 (axe-core Andrea Q5) | DEV + TEST |
| 4 | unlim_latency_p95 metric 0 | P2 | sprint-4 (runtime ingestion) | DEV |
| 5 | MCP calls < 15/day Day 05-06 | P3 | sprint-4 enforcement | TPM |
| 6 | Sprint-2 PR #17 triage | P3 | sprint-4 Day 01 | Andrea decision |
| 7 | ADR-003 anon-key env provisioning | P3 | sprint-4 Andrea env | Andrea |
| 8 | Supabase probe 401 | P3 | tied to gap #7 | resolves with #7 |
| 9 | Watchdog commit noise | P3 | sprint-4 ADR-005 | DEV |
| 10 | CoV only 3x vs rules 5x | P4 | sprint-4 PTC parallel | TPM |

---

## Action Items Sprint 4 (enforced, tracked)

| # | Action | Owner | Due | Tracking |
|---|--------|-------|-----|----------|
| A-401 | PTC code_execution CoV 5x parallel | TPM | Day 01 | `.claude/tools-config.json` |
| A-402 | Velocity tracking sett-3 file retrospective backfill | TPM | Day 01 | `automa/state/velocity-tracking-sett-3.json` |
| A-403 | Sprint-2 PR #17 triage (merge/close/rebase) | Andrea+TPM | Day 01 | `gh pr view 17` + decision note |
| A-404 | Dashboard real Supabase data wiring | DEV | Day 02-04 | Edge Function + hook integration |
| A-405 | Accessibility baseline (axe-core) | DEV+TEST | Day 03 | IF Andrea approves Q5 (else defer) |
| A-406 | UNLIM latency p95 runtime pipeline | DEV | Day 04-05 | Supabase table `unlim_metrics` + ingest |
| A-407 | Watchdog noise suppression ADR-005 | DEV | Day 01-02 | `.github/workflows/watchdog.yml` |
| A-408 | MCP calls ≥15/day enforcement (red-flag < 10) | TPM+AUDITOR | Daily | audit matrix |
| A-409 | Env blocker escalation protocol Day 01 standup | TPM | Every Day 01 | standup header |
| A-410 | Sprint-4 kickoff contract with 4 deferred stories explicit | TPM | Day 01 | `automa/team-state/sprint-contracts/sett-4-sprint-contract.md` |
| A-411 | 5 gap auto-critica minimum each audit | AUDITOR | Daily | audit matrix |
| A-412 | benchmark delta > ±0.05 investigation | TPM | Daily | handoff if triggered |

**12 action items** (vs sprint-3 planned but no formal tracking → sprint-4 enforces with `automa/team-state/sprint-4-actions-tracker.json`).

---

## 3 Pilastri Scrum — Sprint 3 enforcement verdict

| Pilastro | Status | Evidence |
|----------|--------|----------|
| **Trasparenza** | ✅ | Tutti handoff/audit/contract pubblici in repo. Blockers.md append-only. |
| **Ispezione** | ✅ | Auditor brutale daily 7/7. Score 7.53 honest. Auto-critica ≥5 gap/day. |
| **Adattamento** | ⚠️ PARTIAL | Sett-2 retro action items largely honored (Harness 2.0 daily, CoV discipline). But MCP floor enforcement missed Day 05-06 → sprint-4 A-408 mandatory. |

---

## Score finale Sprint 3 — self-assessment

| Dimensione | 1-10 | Rationale |
|-----------|------|-----------|
| Design | 7.2 | Brain/Hands decoupling ADR-003 solid; scoped Dashboard Phase 1 clear |
| Originality | 6.7 | Option B conservative; Karpathy LLM Wiki research forward-looking |
| Craft | 7.8 | 24 atomic commits, zero regression, CoV 3x daily, engine lock preserved |
| Functionality | 7.5 | Shippable increment, benchmark +0.80, 14/17 stories accepted |
| **Media** | **7.3/10** | (target 7.25 ✅) |

---

## Decision points for Andrea

1. **ACCEPT sprint-3 increment** → PR merge + deploy prod (TPM recommends)
2. **axe-core install** (A-405) → sprint-4 Day 03 lever
3. **PR #17 sprint-2 triage** (A-403) → merge / close / rebase decision
4. **Sprint-4 theme** (N4) → Karpathy LLM Wiki OR Dashboard real-data OR both
5. **ADR-003 env provisioning** (gap #7) → Supabase anon key for probe/dashboard

---

**End Sprint 3 Retrospective.**
