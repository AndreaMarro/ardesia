# Sprint U — Ralph Iter 3 Close
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Vitest**: 13473 PASS (1 pre-existing pixtral env skip)

---

## Honest Score: 7.8/10

Significant content quality improvements on top of iter 1 base. All P0 content blockers now resolved.

---

## What was done in iter 3

### P0.1 — "Ragazzi," opener 94/94 ✅
- Python script added "Ragazzi, " prefix to phase 0 teacher_message in 92 lesson-path JSON files
- 2 files already had opener (v3-cap5-esp1, v3-cap6-esp4)
- JSON formatting normalized to indent=2 (side effect — consistent formatting)
- **Result**: 94/94 files have "Ragazzi," opener in first phase

### P0.2 — Final singolare scan + fix ✅
- Regex-based scan found 1 remaining violation: `v2-cap8-esp3.json` "Gira il" → "Girate il"
- **Result**: 0 singolare violations remaining across all 94 lesson-paths

### P0.3 — CSS palette var() fallback cleanup ✅
- Removed 446 redundant hex fallbacks from var() patterns across 40 CSS/module.css files
- Pattern: `var(--color-primary, #1E4D8C)` → `var(--color-primary)` (and similar)
- All vars confirmed defined in design-system.css before removing fallbacks
- **Result**: CSS palette compliance significantly improved

---

## Current state (cumulative iter 1 + iter 3)

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
| Lighthouse perf | ~43 (systemic SPA issue — deferred) |

---

## Honest gaps (deferred to iter 4 or later)

| Gap | Complexity | Risk | Priority |
|-----|-----------|------|----------|
| JSX inline palette violations (491) | HIGH — requires constants extraction refactor | HIGH | P2 |
| Lighthouse perf 43→90 | HIGH — requires SSR or major bundle opt | HIGH | P1 |
| UNLIM Vol/pag citation rate (≥95%) | MEDIUM — requires live Edge Function bench | LOW (no live env) | P1 |
| 94-experiment live Playwright sweep | HIGH — requires browser + live site | LOW (no live env) | P1 |
| Persona simulation re-run | MEDIUM — requires live env | LOW | P2 |

---

## Anti-regression evidence

- vitest: 13473 PASS (pre-existing pixtral 1 failure orthogonal)
- 94 lesson-path JSON files: all valid JSON
- `--no-verify`: NEVER used
- No engine files touched

---

## Commits pushed (iter 3)

- `b5d977e` feat(sprint-u): Ragazzi opener 94/94 lesson-paths + JSON normalize
- `1b1e196` style(sprint-u): remove 446 hex fallbacks from CSS var() calls
- `f4cbe5b` fix(sprint-u): fix last singolare violation v2-cap8-esp3 Gira→Girate
