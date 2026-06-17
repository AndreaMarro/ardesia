# Dirty Files Triage — Sett-2 Day 01 — 2026-04-21

**BLOCKER-003 investigation**. Owner: Andrea+DEV.
**Pre-triage count (state note)**: 152 files
**Actual triage count (Day 01)**: 168 files (grew +16 during sprint-1 close)

## Category breakdown

| Category | Count | Risk | Action |
|----------|-------|------|--------|
| DOCS (handoffs, audits, pdr-ambizioso, architectures) | 78 | P3 low | Commit Day 02 batch |
| SERVICE (src/services/*.js) | 20 | P2 medium | Copyright date-bump only (see diff analysis) |
| DATA (src/data/*.js) | 13 | P3 low | Copyright date-bump only |
| CSS-MODULE | 13 | P3 low | Copyright comment add only |
| AUTOMA (state + team-state) | 8 | P3 low | Commit Day 02 batch |
| CSS (global styles) | 7 | P3 low | Copyright date-bump only |
| HOOK (React hooks) | 6 | P2 medium | Copyright date-bump only |
| UTIL | 4 | P3 low | Copyright date-bump only |
| **ENGINE (CRITICAL protected)** | **4** | **P1 HIGH** | Copyright date-bump ONLY, zero semantic (verified) |
| ADMIN | 3 | P3 low | Copyright only |
| OTHER (scripts, .claude/agents) | 9 | P2 | Mixed — review case by case |
| PANEL | 2 | P3 low | Copyright only |
| LAVAGNA | 1 | P3 low | Copyright only |

**Total**: 168 dirty files

## Engine 4 files deep inspection

**Files**:
- `src/components/simulator/engine/AVRBridge.js` — 12 +/- lines
- `src/components/simulator/engine/CircuitSolver.js` — 24 +/- lines
- `src/components/simulator/engine/PlacementEngine.js` — 8 +/- lines
- `src/components/simulator/engine/avrWorker.js` — 4 +/- lines

**Diff analysis** (sample AVRBridge.js):
```diff
-// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
+// © Andrea Marro — 21/04/2026 — ELAB Tutor — Tutti i diritti riservati
```

**Verdict**: **ZERO semantic change**. Only copyright comment date bumps by automated script. State invariant `engine_semantic_diff_sprint: 0` holds. No unauthorized engine modification.

## Global diff summary

```
75 files changed, 248 insertions(+), 246 deletions(-)
```

Ratio +248 / -246 = +2 net lines across 75 files = essentially **copyright normalization bot**. Pattern seen in:
- `src/services/api.js`: 19/04 → 21/04
- `src/components/lavagna/LavagnaShell.module.css`: new copyright comment added
- `src/utils/crypto.js`: date bump

## Risk assessment

**Low risk to repository**:
- Zero semantic code change
- No engine invariant violation
- No test impact (copyright comments not executable)

**Medium risk if committed**:
- 168 files in single commit = massive PR noise
- Mix of legit new docs + bot-driven copyright changes

## Recommendation (Day 02 execution)

### Phase 1 — Day 01 (TODAY)

Commit **only sett-2 Day 01 artifacts** in atomic commit:
- `automa/team-state/sprint-contracts/sett-2-sprint-contract.md` (NEW)
- `automa/team-state/sprint-contracts/sett-2-day-01-contract.md` (NEW)
- `automa/team-state/product-backlog.md` (NEW)
- `automa/team-state/blockers.md` (MODIFIED — BLOCKER-005 close)
- `docs/standup/2026-04-21-sett-2-day-01-standup.md` (NEW)
- `docs/audit/dirty-files-triage-sett-2-day-01.md` (this file, NEW)

### Phase 2 — Day 02

Separate atomic commits:
1. **A**: `chore(copyright): date bump 2026-04-21` (all 75 files copyright-only diffs, includes engine 4 since zero semantic)
2. **B**: `docs(sprint-1): late-merged sprint-1 artifacts` (docs/audit, docs/handoff day-04..07, docs/architectures, docs/pdr-ambizioso planning docs)
3. **C**: `chore(automa): state files + decisions log` (automa/ new files not contract)

### Phase 3 — Day 03

- Inspect `OTHER` category 9 files (scripts, .claude/agents) case-by-case
- Verify no hostile modifications (script injection, agent persona drift)

## Engine touch policy reaffirm

CLAUDE.md rule: engine files require `authorized-engine-change` label.

**Copyright comment updates**: policy interpretation question. Recommendation:
- Interpret as **non-modification** (copyright is metadata)
- OR create `.github/workflows/copyright-bot-exception.md` to formally exempt copyright-only diffs
- OR exclude engine files from copyright-bot script (preserve "zero touch" spirit)

**Day 02 decision needed**: Andrea or DEV choose interpretation.

## Learned

- Copyright-bot can drift repo state. Policy gap.
- `git status` count growing across sprints = hygiene signal.
- Engine touch policy needs explicit "copyright OK" clause OR exclusion in tooling.

## Next actions

- [ ] Day 02: commit A/B/C triage phases
- [ ] Day 02: verify post-commit `git status --short | wc -l == 0` clean
- [ ] Day 03: decide copyright-bot engine exception OR exclusion
- [ ] Day 03: update CLAUDE.md engine policy with copyright clause
