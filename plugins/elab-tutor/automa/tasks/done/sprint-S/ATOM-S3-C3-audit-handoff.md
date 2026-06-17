---
id: ATOM-S3-C3
parent_task: C3
sprint: S
iter: 3
priority: P2
assigned_to: scribe-opus
depends_on: [ATOM-S3-A1, ATOM-S3-A2, ATOM-S3-B1, ATOM-S3-B2, ATOM-S3-B3, ATOM-S3-C1, ATOM-S3-C2]
provides:
  - docs/audits/2026-04-26-sprint-s-iter3-audit.md (FINAL audit)
  - docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md (handoff next iter)
  - CLAUDE.md iter 3 close section appended
est_hours: 3.0
files_owned:
  - docs/audits/2026-04-26-sprint-s-iter3-audit.md
  - docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md
  - CLAUDE.md
acceptance_criteria:
  - Audit doc `docs/audits/2026-04-26-sprint-s-iter3-audit.md` con sections: TL;DR, State at iter 3 close, Per-task results (8 ATOMs), CoV verification, Honesty caveats (12 explicit), Score iter 3 close (target 3.5+/10)
  - Handoff doc `docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md` con activation string iter 4 + simple setup guide + iter 4 priorities + cost projection
  - CLAUDE.md append "Iter 3 (2026-04-26 close)" subsection con: deliverables shipped, box matrix update (target 3.5+/10), files iter 3 listed, activation prompt rimando handoff
  - Box matrix update SPRINT_S_COMPLETE 10 boxes (post-iter-3 status)
  - Honesty caveats minimum 12 explicit (NO inflation, NO score >3.5 senza verifica multi-agent)
  - 3x `npx vitest run` ≥12532 PASS preserved (no test changes)
  - `npm run build` PASS exit 0
  - All scribe-opus deliverables committed
references:
  - docs/audits/2026-04-26-sprint-s-iter2-audit.md (template iter 2, 246 righe)
  - docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md (template handoff)
  - automa/team-state/messages/*-to-orchestrator-*.md (per-agent completion summaries)
---

## Task

Audit + handoff iter 3 → iter 4. CLAUDE.md update. Aggregare risultati 7 ATOM precedenti in deliverables finali iter 3.

## Implementation outline

1. Read all 7 prerequisite ATOMs completion messages from `automa/team-state/messages/*-to-orchestrator-*.md`
2. Aggregate per-task results: pass/fail per ATOM, files shipped, CoV verified
3. Update box matrix:
   - Box 5 (UNLIM v3): post R0 re-run measure delta → keep ✅ if PASS or revert ⚠️ if FAIL
   - Box 4 (Wiki): update count delta from ATOM-S3-A2
   - Box 10 (Together fallback): NEW partial ✅ se ATOM-S3-B1 + ATOM-S3-B2 done
4. Generate audit doc 12 honesty caveats explicit (NO inflation, distinguere claim vs measure)
5. Generate handoff doc activation string iter 4 + setup guide
6. Append CLAUDE.md "Iter 3 (2026-04-26 close)" subsection
7. CoV verify 3x

## CoV before claim done

- All 3 deliverable files exist
- Audit doc word count >1500
- Handoff doc activation string present + paste-ready
- CLAUDE.md append section non-destructive (preserve iter 1-2 sections)
- 3x `npx vitest run` ≥12532 PASS preserved
- `npm run build` PASS exit 0
