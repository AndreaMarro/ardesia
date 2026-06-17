# Sprint 4 Contract — sett-4-intelligence-foundations (DRAFT Day 01 kickoff)

**Sprint**: 4/8 PDR 8-week
**Period**: 2026-04-29 (mar) → 2026-05-05 (lun), 7 days cumulative Day 22-28
**Branch**: `feature/sett-4-intelligence-foundations` (to create post sett-3 merge)
**Format**: Harness 2.0 + Agile Scrum
**Status**: DRAFT — pending Andrea kickoff approval + 5 decision points resolution
**Baseline**: sett-3 end state (tests 12220, benchmark 4.75, auditor avg 7.53)

---

## Sprint Theme

**INTELLIGENCE FOUNDATIONS** — first AI intelligence layer + deferred sprint-3 debt closure.

Per PDR 8-week roadmap: sett-4 opens intelligence track (Karpathy three-layer LLM Wiki evaluated Day 03 sett-3). Combined with sprint-3 spillover (3 stories, 5 SP).

---

## Sprint Goal Candidates (Andrea decision N4)

**Option A — Dashboard real-data first**: ship Phase 2 Dashboard with live Supabase data, defer Karpathy.
**Option B — Karpathy LLM Wiki proof-of-concept**: three-layer architecture skeleton (data ingestion + RAG + generation), defer Dashboard real-data to sprint-5.
**Option C — Both tracks parallel**: Dashboard DEV lane + Karpathy ARCHITECT lane (requires discipline, higher risk).

**TPM recommendation**: **Option C** contingent on MCP enforcement + daily reconciliation. Falls back to Option A if Day 03 reveals resource contention.

---

## Sprint Scope (Option C default, to re-contract if A/B selected)

### Epic 4.1 — Dashboard Phase 2 real data (5 SP carry-over + 3 new)

| Story | SP | Day target | Owner |
|-------|----|-----------|-------|
| S4.1.1 Supabase Edge Function `dashboard-data` deploy | 3 | Day 02 | DEV + Andrea env |
| S4.1.2 useDashboardData hook point to live endpoint | 2 | Day 03 | DEV |
| S4.1.3 E2E spec 15 adapt to live mode (vs mocks) | 2 | Day 04 | TEST |
| S4.1.4 Teacher JWT auth flow (from ADR-004) | 3 | Day 05 | DEV + security |

### Epic 4.2 — Benchmark uplift levers (8 SP)

| Story | SP | Day target | Owner |
|-------|----|-----------|-------|
| S4.2.1 axe-core install + Lighthouse a11y baseline | 3 | Day 03 IF Andrea Q5 approves | DEV + TEST |
| S4.2.2 accessibility_wcag metric wire | 2 | Day 04 | DEV |
| S4.2.3 unlim_latency_p95 runtime pipeline (Supabase `unlim_metrics` table) | 3 | Day 04-05 | DEV |

### Epic 4.3 — Karpathy LLM Wiki POC (8 SP)

| Story | SP | Day target | Owner |
|-------|----|-----------|-------|
| S4.3.1 Architecture ADR-006 three-layer detail | 3 | Day 02 | ARCHITECT |
| S4.3.2 Layer 1 data ingestion skeleton (volumi PDF → chunks) | 2 | Day 03-04 | DEV |
| S4.3.3 Layer 2 RAG query interface (reuse `rag-chunks.json`) | 2 | Day 05 | DEV |
| S4.3.4 Layer 3 generation prompt template + 5 integration tests | 1 | Day 06 | DEV + TEST |

### Epic 4.4 — Process + Integrity (5 SP)

| Story | SP | Day target | Owner |
|-------|----|-----------|-------|
| S4.4.1 A-403 PR #17 sprint-2 triage | 1 | Day 01 | Andrea+TPM |
| S4.4.2 A-401 PTC code_execution CoV 5x parallel | 1 | Day 01 | TPM |
| S4.4.3 A-402 Velocity tracking sett-3 backfill | 1 | Day 01 | TPM |
| S4.4.4 A-407 Watchdog noise suppression ADR-005 | 2 | Day 02 | DEV |

**Total**: ~29 SP (committed range 25-35 SP, 3 sprint rolling avg 24.7 SP).

---

## Day 01 P0 (kickoff)

1. Andrea decision points 5 (below) resolved via Slack/standup async
2. Create branch `feature/sett-4-intelligence-foundations` from main (post-merge)
3. Baseline snapshot `baseline-sett-4-day-01.json`
4. Sprint contract finalize (this doc → FINAL)
5. Daily standup Day 01 entry
6. Velocity tracking sett-3 backfill + sett-4 file create
7. PR #17 triage decision

---

## Definition of Ready (DoR) Epic 4.x

- [ ] Acceptance criteria 3-15 enumerated per story
- [ ] Story SP Fibonacci (1/2/3/5/8/13)
- [ ] Owner assigned
- [ ] Dependencies declared
- [ ] Test strategy noted
- [ ] Rollback plan (if destructive)
- [ ] Environment requirements (env vars, external deps)
- [ ] Andrea blocker escalation (if any) — **Day 01 header, not Day 06 discovery**

---

## Definition of Done Sprint 4

- [ ] Option C stories ≥ 70% complete OR Option A/B pivoted formally Day 03 max
- [ ] Tests PASS ≥ 12220 (no regression from sett-3 baseline)
- [ ] Benchmark ≥ 5.0 (sett-3 target met + buffer)
- [ ] Auditor avg ≥ 7.6 (+0.07 vs sett-3 7.53)
- [ ] CoV 5x daily Day 04+ (via PTC parallel)
- [ ] MCP calls ≥ 15/day enforced (red-flag < 10)
- [ ] ≥ 2 blockers closed
- [ ] 12 action items sprint-3 (A-401 to A-412) — ≥ 8 completed
- [ ] Retrospective + review + PR ready Day 07
- [ ] Zero engine semantic diff
- [ ] Zero PZ v3 violations

---

## Success metrics target

- Tests: ≥ 12250 (+30 from sett-3 end)
- Benchmark: ≥ 5.0
- Auditor avg: ≥ 7.6
- Blockers closed: ≥ 2
- Commits: 25-40 atomic
- PZ v3 violations: 0
- Engine diff: 0

---

## 4-grading target (sprint avg)

- Design: 7.8
- Originality: 7.0 (Karpathy layer 1 novel)
- Craft: 8.0
- Functionality: 7.8
- **Target media**: 7.65/10

---

## Stop conditions

- Sett-end-gate Day 07 FAIL → sprint-5 remedial
- Quota 429 persistent → session pause
- Context compact > 3x → handoff
- Blocker hard 5-retry-fail → pivot Option A/B
- Andrea 5 Qs unresolved Day 03 → scope fallback Option A

---

## Out of Scope Sprint 4

- Simulator engine changes (engine hard lock — sprint-8+ only)
- Major UI redesign beyond Dashboard Phase 2
- New NPM deps beyond Andrea pre-approved
- Mobile-native build (PWA preserved)
- Multi-language i18n (deferred sprint-6)

---

## Open Questions (Andrea Day 01 decisions)

1. **Sprint theme selection**: A / B / C (TPM recommends C)
2. **axe-core install** (A-405 from sprint-3 retro): approve / deny / defer
3. **PR #17 sprint-2**: merge / close / rebase / keep-draft
4. **ADR-003 anon key env provisioning**: Supabase anon key for probe + dashboard
5. **ADR-004 teacher JWT flow**: align Epic 4.1 S4.1.4 implementation details

---

## 3 Pilastri Scrum enforcement (inherited from sett-3 Day 01)

- **Trasparenza**: all artifacts in repo (docs/, automa/)
- **Ispezione**: daily auditor brutale + auto-critica ≥5
- **Adattamento**: 12 action items A-401..A-412 tracked in `automa/team-state/sprint-4-actions-tracker.json`

---

## Blocker escalation protocol (NEW sprint-4 A-409)

Any environment / credential / infrastructure blocker:
- **Day 01 standup**: declare in header "ENV BLOCKER DETECTED: <desc>"
- **Day 02 if unresolved**: open BLOCKER-XXX + Andrea notify explicit
- **Day 03 if unresolved**: raise severity P1 → P0 + scope pivot consideration
- **Day 04 if unresolved**: MUST pivot scope (Option A/B fallback) or defer feature

---

**End Sprint 4 Contract DRAFT.**

Status: awaiting Andrea 5 decision points + sett-3 merge + branch creation.
