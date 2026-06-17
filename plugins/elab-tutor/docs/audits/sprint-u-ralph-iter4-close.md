# Sprint U — Ralph Iter 4 Close
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Vitest**: 13473 PASS (1 pre-existing pixtral env skip — UNCHANGED)

---

## Honest Score: 7.8/10 (UNCHANGED from iter 3)

Iter 4 was an investigation-only iteration. No new fixes were shipped. All remaining deferred gaps require either live environment access or risky routing/UI code changes that are out of scope.

---

## What was done in iter 4

### F6-NOMOUNT Root Cause Investigation ✅ (investigation complete, fix deferred)

**Finding**: Both `v3-cap7-mini` and `v3-cap8-serial` have correct data in `experiments-vol3.js`. The "0 components on #tutor route" finding from Cycle 1 audit is a **rendering/routing issue**, not a data problem.

**Evidence**:
- `v3-cap7-mini` (line 5626): 5 components defined — breadboard-half (bb1), nano-r4 (nano1), potentiometer (pot1), resistor (r1, 470Ω), led (led1, green). Connections and pinAssignments present and correct.
- `v3-cap8-serial` (line 5768): 1 component defined — nano-r4 (nano1). No breadboard/wires: **intentional** (USB-only Serial Monitor experiment per Vol.3 pag.87).
- Both lesson-path JSONs: `experiment_id` field correctly set (`v3-cap7-mini` and `v3-cap8-serial`). All phases have proper plural language and Vol/pag references.
- `experiment_id` convention: all 94 lesson-paths use filename-as-id pattern, no `experimentId` camelCase field exists anywhere.

**Root cause**: The #tutor route renders lesson content (phases/teacher_messages) but may not auto-mount the lavagna/simulator the same way as #lavagna route. This is a routing/rendering concern in `LavagnaShell.jsx` or the tutor route logic — out of scope for this sprint (touches engine-adjacent routing code, high risk).

**v3-cap7-mini lesson content quality**: Good. All 5 phases use plural, proper Vol.3 pag.75 references, "Ragazzi," opener present. Content accurately describes potentiometer ADC + LED PWM experiment.

**v3-cap8-serial lesson content quality**: Good. All 5 phases use plural, Vol.3 pag.87 references, "Ragazzi," opener present. Correctly describes USB-only Serial Monitor experiment (no breadboard by design).

---

## Cumulative state (iter 1 + 3 + 4)

| Metric | State |
|--------|-------|
| vitest | 13473 PASS |
| Build | PASS (iter 1 verified) |
| Singolare violations | 0/94 |
| "Ragazzi," opener | 94/94 |
| Docente-framing | 0 "Lo studente sta" |
| JSON validity | 94/94 |
| L2 routing | Fixed (lesson-explain guard) |
| vol3 title mismatches | Fixed (esp3, esp5, esp6, cap8-serial) |
| v3-cap6-esp4 circuit | Redesigned + content + scratchXml |
| CSS palette fallbacks | 446 removed |
| CSS palette raw hex | ~20 remaining (gradient/rgba context) |
| JSX palette violations | ~491 remaining (inline styles) |
| Lighthouse perf | ~43 (systemic SPA issue) |
| F6-NOMOUNT | Data correct; routing issue deferred |

---

## Deferred gaps (iter 5 or later)

| Gap | Root cause | Risk | Priority |
|-----|-----------|------|----------|
| F6-NOMOUNT (#tutor route 0 components) | Routing/rendering in LavagnaShell | HIGH — routing code risky | P2 |
| JSX inline palette violations (491) | Constants extraction refactor needed | HIGH | P2 |
| Lighthouse perf 43→90 | Systemic SPA issue (FCP/LCP) | HIGH — SSR or bundle opt | P1 |
| UNLIM Vol/pag citation rate (≥95%) | Requires live Edge Function R5 re-bench | N/A (live env) | P1 |
| 94-experiment live Playwright sweep | Requires browser + live site | N/A (live env) | P1 |
| Persona simulation re-run | Requires live env | N/A (live env) | P2 |

---

## Anti-regression evidence

- vitest: 13473 PASS (UNCHANGED — no src/ changes in iter 4)
- 94 lesson-path JSON files: all valid JSON (no changes)
- `--no-verify`: NEVER used
- No engine files touched

---

## Iter 4 verdict

**Investigation complete. No new fixes possible without live environment or high-risk routing changes.**

Sprint U ralph loop has reached a natural stopping point for the current branch/environment. The PDR §8.1 criteria that remain open (Lighthouse ≥90, UNLIM Vol/pag ≥95%, Playwright live sweep, persona ≥8/10) all require live environment access that is not available in the current non-interactive session.

**Recommendation**: Merge PR #57 to main. The deferred P1/P2 items can be addressed in a future sprint with live environment access. The P0 blockers from Cycle 1 audit are all resolved:
- ✅ L2 routing fix (lesson-explain guard)
- ✅ 0 singolare violations
- ✅ 94/94 "Ragazzi," opener
- ✅ 0 docente-framing violations
- ✅ CSS palette fallbacks removed
