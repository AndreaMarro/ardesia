# Product Backlog — ELAB PDR Ambizioso 8 settimane

**Owner**: Andrea Marro (Product Owner)
**Format**: Scrum-style Epic → Story → Task (DoR 8-check → DoD 7-check)
**Created**: 2026-04-21 sett-2 Day 01 (closes BLOCKER-004)
**Update cadence**: each sprint planning + mid-sprint refinement

## Epic overview (8 epic = 8 sprint PDR)

| Epic | Sprint | Goal | Status |
|------|--------|------|--------|
| E1 | sett-1 | Stabilize foundations | ✅ CLOSED 26/04 |
| E2 | sett-2 | Hygiene + process + backlog | 🟡 ACTIVE Day 01 |
| E3 | sett-3 | Dashboard feature logic (teacher-facing) | ⚪ pending |
| E4 | sett-4 | UNLIM quality + RAG enrichment | ⚪ pending |
| E5 | sett-5 | Simulator UX polish + a11y WCAG AAA | ⚪ pending |
| E6 | sett-6 | Volumes parity + book-text integration | ⚪ pending |
| E7 | sett-7 | Games + gamification loop | ⚪ pending |
| E8 | sett-8 | Deploy hardening + monitoring + launch | ⚪ pending |

---

## E1 — Stabilize foundations (sett-1, CLOSED)

### S1.1 — Lavagna T1 bug closure
- T1-001 toggleDrawing API stability ✅ Day 02
- T1-002 WhiteboardOverlay persistence ✅ Day 02
- T1-003 render warmup cron ✅ Day 05 (merged PR #16)
- T1-005 dashboard scaffold ✅ Day 07 (scaffold only)
- T1-009 PZ v3 immutable ✅ pre-sprint

### S1.2 — Process bootstrapping
- Harness 2.0 Sprint Contract format ✅ Day 04
- Blockers.md append-only log ✅ Day 01
- Daily Standup format ✅ Day 04
- Retrospective + Review format ✅ Day 07

### S1.3 — Baseline + anti-regression
- baseline.json ratcheted 11958→12164 ✅ Day 07
- no-regression-guard.sh 5 actions ✅ Day 04
- CoV 3x verified PASS ✅ Day 06

---

## E2 — Hygiene + process + backlog (sett-2, ACTIVE)

### S2.1 — Sprint artifacts formalization
- **T2.1.1** (3pt) Sprint 2 contract — ✅ Day 01
- **T2.1.2** (2pt) Day 01 standup + contract — ✅ Day 01
- **T2.1.3** (5pt) Product backlog gerarchico — 🟡 IN PROGRESS Day 01 (this file)
- **T2.1.4** (1pt) BLOCKER-005 close — 🟡 Day 01 (verified, pending doc close)

### S2.2 — Dirty files triage (BLOCKER-003)
- **T2.2.1** (3pt) Classify 152 files (engine/CSS/data/other) — Day 02
- **T2.2.2** (5pt) Commit staged: safe CSS modules — Day 02-03
- **T2.2.3** (8pt) Revert decisions: engine semantic changes — Day 03
- **T2.2.4** (3pt) Stash remainder with rationale doc — Day 03

### S2.3 — Post-merge main verify (BLOCKER-007/008)
- **T2.3.1** (2pt) render-warmup.yml first cron run verify — Day 02
- **T2.3.2** (2pt) grep `euqpdueopmlllqjmqnyb` canonical invariant — Day 02
- **T2.3.3** (1pt) update state + close blockers — Day 02

### S2.4 — Debt sett-1 paydown
- **T2.4.1** (5pt) Vision E2E CoV 3x (not 1x) — Day 03
- **T2.4.2** (2pt) MCP calls 10+/day enforce — daily Day 02-07
- **T2.4.3** (3pt) Commit "Test N" marker discipline — daily

### S2.5 — Dashboard feature logic (aspirational)
- **T2.5.1** (8pt) Routing wiring scaffold→functional — Day 04
- **T2.5.2** (13pt) Student progress API integration — Day 05
- **T2.5.3** (5pt) Export CSV implementation — Day 06

**Sprint Point budget**: ~70pt story points. Velocity sett-1 TBD (inline agent, no formal velocity). Conservative sett-2 = 50pt actual.

---

## E3 — Dashboard feature logic (sett-3, pending)

### S3.1 — Teacher dashboard MVP
- Student progress table + filters
- Nudge recommendations
- Export CSV
- Supabase integration real data

### S3.2 — Parent view (read-only)
- Email gating per GDPR/COPPA
- Scoped progress share

---

## E4 — UNLIM quality + RAG (sett-4, pending)

### S4.1 — RAG enrichment
- 549 chunk → 800+ chunk (errors + analogies expansion)
- Short-phrase kid fallback refine
- Nanobot cold start fix (18s → <3s)

### S4.2 — Vision live E2E
- 5/5 scenarios PASS → 10/10
- Edge cases: blurry, partial, dark

### S4.3 — Voice E2E
- Edge TTS VPS prod verification
- Wake word "Ehi UNLIM" accuracy test
- 36 voice commands integration test

---

## E5 — Simulator UX polish + a11y (sett-5, pending)

### S5.1 — WCAG AAA contrast
- Audit tutti componenti (Lavagna + Tutor + Dashboard)
- Fix hex color dove contrast <7:1

### S5.2 — Touch target 44x44
- Button audit mobile
- Tool panel resize responsive

---

## E6 — Volumes parity (sett-6, pending)

### S6.1 — Volume book-text complete
- 92/92 experiments enriched (Day 07 done sett-1)
- Verify live grep source
- UNLIM prompt inject book-text

### S6.2 — Lesson groups 27 alignment
- Matching book chapter structure
- UI lesson picker tree

---

## E7 — Games + gamification (sett-7, pending)

### S7.1 — 4 game polish
- Detective circuit
- POE (Predict-Observe-Explain)
- Reverse engineering
- Circuit review

### S7.2 — Score loop
- Badge system
- Progress bar classroom
- Leaderboard opt-in

---

## E8 — Deploy hardening (sett-8, pending)

### S8.1 — Monitoring
- Sentry rules + alerts
- Lighthouse CI gates
- Bundle size budget

### S8.2 — Launch readiness
- Commercial flow
- School onboarding docs
- Invoice + subscription

---

## Definition of Ready (DoR, 8-check, per Task)

- [ ] Acceptance criteria 3-15 bullets
- [ ] Story point estimate (Fibonacci 1-21)
- [ ] Owner assigned (or team role)
- [ ] Dependencies identified
- [ ] No blocker P0 open for this task
- [ ] Test strategy defined
- [ ] Rollback plan (if applicable)
- [ ] Demo scenario described

## Definition of Done (DoD, 7-check, per Story)

- [ ] All tasks CLOSED
- [ ] CoV 3x PASS
- [ ] Code review APPROVE
- [ ] E2E scenario tested (if UI)
- [ ] Documentation updated
- [ ] Commit + push + CI green
- [ ] Auto-critica ≥3 gap enumerated

## Velocity tracking

See `automa/state/velocity-tracking.json`.
Sett-1 velocity: TBD (inline agent format, no formal pt assignment sett-1).
Sett-2 target velocity: 40-50pt completed.

## Refinement cadence

- **Sprint planning (Day 1)**: select stories for sprint, define DoR
- **Mid-sprint (Day 4)**: adjust scope if drift >20%
- **Sprint review (Day 7)**: mark Done, move rest back to backlog
- **Retrospective**: learnings feed back to task grooming

## Backlog hygiene

- Tasks > 13pt → split
- Stories > 40pt → split
- Items not touched 2 sprints → re-evaluate or archive
- New requests from Andrea → add as "Inbox" → groom next sprint
