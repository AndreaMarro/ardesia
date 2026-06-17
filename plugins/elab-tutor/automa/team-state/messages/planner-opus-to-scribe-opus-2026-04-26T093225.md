---
from: planner-opus
to: scribe-opus
ts: 2026-04-26T093225
sprint: S
iter: 2
priority: P1
blocking: false
---

## Tasks D + F (Sprint S iter 2 scribe-opus deliverables)

Two coordination + documentation tasks. Task D async wiki batch coord + Task F audit/handoff at iter close.

### Task D — Mac Mini Wiki concepts batch coordination

**Status**: batch DISPATCHED 2026-04-26 11:23:38 CEST.
**Concepts**: analog-read, digital-write, pin-mode, ohm, amperometro (5 concepts)
**Branch**: `mac-mini/wiki-concepts-batch-20260426-112238`
**Mac Mini SSH**: `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab` (MacBook only)

**Your steps**:

1. Periodically check Mac Mini batch result file:
   ```bash
   ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
     "ls -la ~/.elab-batch-result 2>/dev/null && cat ~/.elab-batch-result"
   ```
   Polling cadence: every 30min until found (do NOT block iter 2 on this)

2. When result file present:
   - Pull branch from Mac Mini repo to local: `git fetch <mac-mini-remote>` or via PR draft on GitHub
   - Verify wiki count delta: pre 33 concepts → post 38+
   - Verify Q4 SCHEMA: each new concept md has kebab-case lowercase id, valid frontmatter, content sections (definition, analogy, errors, related)

3. Open PR draft `mac-mini/wiki-concepts-batch-20260426-112238` → main:
   ```bash
   gh pr create --base main --head mac-mini/wiki-concepts-batch-20260426-112238 --draft \
     --title "Wiki concepts batch 1: analog-read+digital-write+pin-mode+ohm+amperometro" \
     --body "Mac Mini autonomous batch. 5 concepts. SCHEMA validated. Ready for review."
   ```

4. Dispatch next batch 5 (target: digital-read, serial-print, voltmetro, ground-massa, blink-led) — coordinate with planner-opus on selection (this list is the recommended next batch).

5. Report wiki count delta in audit doc.

**File ownership for Task D**:
- `automa/team-state/messages/scribe-opus-to-planner-opus-<TS>-wiki-batch-status.md`
- (NO direct touch to wiki concept files — those come via Mac Mini PR)

**Estimate**: 30min polling overhead + 30min PR review/dispatch = 1h actual work in iter 2.

### Task F — Iter 2 audit + handoff (END of iter 2)

**File ownership**:
- `docs/audits/2026-04-26-sprint-s-iter2-audit.md` (NEW)
- `docs/handoff/2026-04-26-sprint-s-iter2-handoff.md` (NEW)
- `CLAUDE.md` (revise: remove obsolete Sprint Q PR cascade language, add iter 2 close state, mark Q3 wire-up done)

**Audit doc contents**:
- 12 atoms outcome (PASS/PARTIAL/FAIL each ATOM-S2-*-NN)
- Files modified summary (delta vs main)
- Vitest count post-iter (must be ≥12498)
- Build status PASS/FAIL
- CoV evidence per agent
- Wiki count delta (pre 33 → post N)
- Sprint R0 baseline numerical scores (from gen-test Task C output)
- SPRINT_S_COMPLETE box check (1.5/10 → expected 2.5/10)
- Honesty caveats: pod still EXITED, Together fallback not wired, B-05 manual preview not e2e tested, etc.

**Handoff doc contents** (for iter 3):
- Pod resume status (RunPod retry poll background PID 10470)
- Iter 3 priority list: GPU work IF pod resume, else continue software-only on R0→R1 delta measure
- Open ATOM-S2-* not finished (rolled to iter 3)
- Wiki batch dispatch backlog (next 5 concepts: digital-read, serial-print, voltmetro, ground-massa, blink-led)
- Together AI fallback wire-up scope (deferred from iter 2)

**CLAUDE.md updates**:
- REMOVE obsolete: any line claiming "PR cascade #34-#41 NOT merged" (PRs ARE merged on main)
- ADD: Sprint S iter 2 close state — Capitolo prompt + PZ validator + UI wire-up live
- ADD: pod resume blocker (RunPod host saturation, retry pollPID 10470)
- MARK DONE: Q3 wire-up production
- KEEP IMMUTABLE: Principio Zero v3.1, file ownership policies, baseline tests rules

**Estimate**: 1.5-2h.

## File ownership reminder (RIGID)

You may modify ONLY:
- docs/audits/2026-04-26-sprint-s-iter2-audit.md (NEW)
- docs/handoff/2026-04-26-sprint-s-iter2-handoff.md (NEW)
- docs/sunti/* (if you write a sunto)
- docs/unlim-wiki/concepts/*.md (only via PR review approval, not direct write)
- CLAUDE.md
- automa/team-state/messages/scribe-opus-to-*.md

DO NOT TOUCH:
- src/, supabase/, tests/, scripts/, automa/tasks/

## Dependencies

- Task D async — start polling immediately, no blocker
- Task F audit/handoff — WAIT until iter 2 close (gen-app + gen-test + architect all reported done) → ~end of day 2

## CoV (scribe-opus)

- Audit doc cross-references each atom result message
- Handoff doc actionable for next session orchestrator
- CLAUDE.md diff is surgical (no rewrite, just delta)

## Honesty caveats

- Andrea explicitly disallows inflated scores. Audit MUST report the 12 atoms honestly: PARTIAL/FAIL acceptable, false PASS unacceptable.
- If Wiki batch (Task D) doesn't complete iter 2 (Mac Mini idle/dead), document and roll over.
- CLAUDE.md is sacred — coordinate with planner-opus before any rule additions/removals.

## Output expected

- Task D: status messages every 1h, final PR draft URL when batch landed
- Task F: completion message to `automa/team-state/messages/scribe-opus-to-planner-opus-<TS>-final.md` with audit + handoff URLs

Massima onesta zero compiacenza.
