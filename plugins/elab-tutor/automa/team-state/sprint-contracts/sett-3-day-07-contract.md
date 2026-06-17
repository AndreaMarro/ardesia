# Sprint 3 Day 07 Contract — sett-3-stabilize-v3 FINAL (Day 21 cumulative)

**Sprint**: 3/8 PDR 8-week
**Date**: 2026-04-22 (mer) — Day 07 local FINAL / Day 21 cumulative / end-week-gate
**Branch**: `feature/sett-3-stabilize-v3` (24 commits ahead origin/main, pushed `2b818ea`)
**Format**: Harness 2.0 Sprint Contract — FINAL day (gate + retro + PR)
**Commit start**: `2b818ea` chore(sett-3 Day 06): state + audit + handoff + claude-mem obs queue
**Baseline entering**: 12220 tests PASS, benchmark **4.75/10** (+0.63 Day 06 via worker_uptime metric wiring)

---

## Sprint Goal (Option B locked, carry from sprint-contract)

Debt-safe benchmark lift + integrity remediation + dashboard Phase 1.
NPM denied-by-default. Zero new runtime deps sprint-3.
End-week-gate Day 07 enforces: CoV PASS + build PASS + benchmark snapshot + E2E smoke + bundle invariant.

## Day 07 FINAL scope — gate + retrospective + PR + sprint-4 kickoff

### Task P0-1 — Sprint 3 Review + Retrospective (docs)

**Goal atomic**: scrivere 2 file markdown Harness 2.0 retro format.

**Deliverables**:
1. `docs/reviews/sprint-3-review.md` — sprint review: demo-able features, metrics delta, baseline ratchet, acceptance checklist per Epic sprint-3
2. `docs/retrospectives/sprint-3-retrospective.md` — Start/Stop/Continue + Learned patterns + 4-grading self-assessment honest

**Acceptance criteria**:
1. Review doc contains: benchmark 4.12 → 4.75 (+0.63) delta, test baseline 12201 → 12220 (+19), commits Day 01→07, Epic status (worker_uptime wired, E2E spec 15, unlimLatencyLog, ADR-003)
2. Retro doc contains: Start (≥3), Stop (≥3), Continue (≥3), 4-grading self (design/originality/craft/functionality), blockers closed vs carry-over
3. Zero self-inflation (CoV-compliant): claim numerici verified da `automa/state/benchmark.json` + `automa/baseline-tests.txt`
4. Cross-reference: link ADR-003, sett-3-sprint-contract.md, daily standups Day 01-07

**Owner**: inline TPM
**Estimate**: 35 min

### Task P0-2 — PR sett-3 created for Andrea merge decision

**Goal atomic**: `gh pr create` branch → main con body dettagliato NO auto-merge.

**Acceptance criteria**:
1. PR title: `feat(sett-3): debt-safe benchmark +0.63 + integrity remediation + dashboard Phase 1`
2. PR body include: Summary (3-5 bullet), Test plan checklist, Commits manifest (24 ahead), Benchmark snapshot, Blockers closed (13/13), Risk assessment (bundle size, regression count)
3. Base branch = `main`, head = `feature/sett-3-stabilize-v3`
4. Labels (se gh supports): `sprint-3`, `needs-review`
5. NO auto-merge flag (`--admin`, `--merge` forbidden — Andrea decides)
6. PR URL captured into handoff doc

**Owner**: inline TPM
**Estimate**: 15 min

### Task P0-3 — End-week gate enforcement + verdict PASS/FAIL

**Goal atomic**: eseguire gate checks inline (script opzionale) + scrivere verdict deterministic.

**Acceptance criteria**:
1. CoV 5x vitest: `for i in 1..5; do npx vitest run; done` → tutti PASS con count ≥ 12220 (bandwidth: allowed 3x se time-boxed ≤ 25 min)
2. `npm run build` PASS (exit 0)
3. `node scripts/benchmark.cjs --write` → snapshot in `automa/state/benchmark.json` ≥ 4.75
4. E2E smoke: `npx playwright test tests/e2e/15-dashboard-live.spec.js --list` parse OK (spec 15 still valid)
5. Bundle check: `ls -la dist/assets/*.js` max single chunk < 1.5MB (invariant sett-3)
6. Verdict scritto in `docs/audits/2026-04-22-sett-3-end-week-gate.md` con PASS/FAIL explicit + evidence links
7. Se FAIL: block PR creation (P0-2), open BLOCKER-013 in `blockers.md`, defer sprint-4 kickoff

**Owner**: inline AUDITOR role
**Estimate**: 30 min

---

## Test strategy

- **CoV**: 5x vitest target, bandwidth-adjusted 3x allowed
- **E2E smoke**: spec 15 `--list` parse check (no live run — deferred sprint-4)
- **Bundle**: size invariant check post-build
- **Benchmark**: `--write` mode fresh snapshot commit SHA tracking

## Rollback plan

- Gate FAIL P0-3 → NO PR creation, verdict doc written, BLOCKER-013 opened
- Sprint-4 kickoff DEFERRED to Day 08 fix-forward session
- Test regression (count < 12220) → `git stash` + investigate flake, no force-merge
- Build FAIL → `git log --oneline -10` scan, revert ultimo commit non-docs

## Success metrics 4-grading (self-assessment target FINAL)

| Grade | Target | Rationale |
|-------|--------|-----------|
| Design | 7.5/10 | Retro + review docs + ADR cross-refs clean |
| Originality | 6.5/10 | Worker-probe + ring-buffer latency log novel ma not groundbreaking |
| Craft | 8.0/10 | 24 atomic commits, zero --no-verify, CoV-compliant |
| Functionality | 8.0/10 | Benchmark +0.63, 12220 baseline, 13/13 blockers CLOSED, zero engine drift |
| **Media target** | **7.5/10** | FINAL sprint-3 self-rate honest |

## Stop conditions

- Gate FAIL → STOP PR + handoff only
- Quota 429 → STOP + contract checkpoint
- Context auto-compact 3x → STOP
- Merge = Andrea decision NOT automation

## Definition of Done Day 07 FINAL

- [ ] P0-1 review + retrospective docs scritti
- [ ] P0-2 PR created URL captured (se gate PASS)
- [ ] P0-3 gate verdict doc scritto PASS/FAIL
- [ ] CoV 3x+ vitest PASS
- [ ] Build PASS
- [ ] Benchmark snapshot ≥ 4.75 written
- [ ] Bundle invariant check PASS
- [ ] Handoff `docs/handoff/2026-04-22-sett-3-end-week.md`
- [ ] claude-mem obs queued Day 21

## Blockers reconcile Day 07 START

OPEN count: **0** (13/13 storici CLOSED)
Residual note (P3 doc-only): ADR-003 anon-key env provisioning pending Andrea (not blocking gate, carry sprint-4)
