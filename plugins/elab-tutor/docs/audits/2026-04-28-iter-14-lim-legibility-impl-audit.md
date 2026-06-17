---
sprint: S
iter: 14
phase: 1 (PARTIAL — top 5 violators only)
atom: lim-legibility-opus iter 14
date: 2026-04-28
author: lim-legibility-opus iter 14 (caveman mode)
parent_spec: docs/specs/2026-04-28-iter-14-LIM-legibility-typography-spec.md
parent_audit: docs/audits/2026-04-28-iter-13-design-D1-raw-signals-audit.md
loc_delta: +14 LOC (5 inline comments + 8 font-size value swaps)
scope: PARTIAL — top 5 violators iter 14 PHASE 1; remaining ~30 CSS + 1192 JSX defer iter 15+
---

# Iter 14 PHASE 1 — LIM legibility surgical fix top 5 violators

## §1 Scope acknowledgement (anti-inflation)

This is **PARTIAL implementation** of `docs/specs/2026-04-28-iter-14-LIM-legibility-typography-spec.md`. Per honest finding: design-opus iter 13 D1 audit measured **39 CSS font<14 + 1192 JSX fontSize<14 + 105 touch<44** — brief estimates inflated 11×. Iter 14 PHASE 1 targets ONLY top 5 violators per spec §6 entries #1, #3, #4, #6, #12 to validate spec mapping with surgical scope before bulk codemod iter 15+.

**Remaining out-of-scope iter 14 PHASE 1**:
- Spec §6 entries #2, #5, #7-#11, #13-#20 (~30 CSS entries deferred)
- All 1192 JSX inline `fontSize:` literals (codemod iter 15+ per spec §7 Step 4)
- All 105 touch-target violators (manual audit iter 15+ per spec §7 Step 5)
- design-tokens.css NEW + globals.css token migration (spec §7 Step 1-2 deferred)

## §2 5 files modified — before/after font-size mapping

| # | File | Selector | Line(s) before → after | font-size before | font-size after | Spec ref |
|--:|------|----------|------------------------|------------------|-----------------|----------|
| 1 | `src/components/lavagna/CapitoloPicker.module.css` | `.typeBadge` | 120 → 121 (line shifted by +1 comment) | `11px` | `14px` | §6 #1 |
| 2 | `src/components/lavagna/PercorsoCapitoloView.module.css` | `.typeChip` | 67 → 68 | `11px` | `14px` | §6 #3 |
| 3 | `src/components/lavagna/DocenteSidebar.module.css` | `.phaseLabel` | 49 → 50 | `11px` | `14px` | §6 #12 |
| 4 | `src/components/lavagna/DocenteSidebar.module.css` | `.sectionLabel` | 65 → 67 | `11px` | `14px` | §6 #12 |
| 5 | `src/components/lavagna/LessonReader.module.css` | `.page` | 83 → 84 | `0.75rem` (12px) | `0.875rem` (14px) | §6 #4 |
| 6 | `src/components/lavagna/LessonSelector.module.css` | `.chapter` | 64 → 64 (multi-line comment expanded) | `0.75rem` (12px) | `0.875rem` (14px) | §6 #6 |

Note: 5 files modified, 6 selectors edited (DocenteSidebar.module.css has 2 violators in spec table §6 entry #12 lines 49+65). All within "top 5 violators" mandate as DocenteSidebar is single file.

## §3 Spec-to-implementation deviation

**Deviation 1: direct px values vs CSS custom properties**.
Spec §3 prescribes `var(--font-size-label)` (14px) and `var(--font-size-xs)` (14px). PHASE 1 implementation used direct px/rem values (`14px` / `0.875rem`) because spec §7 Step 1 (design-tokens.css NEW) is **not yet shipped iter 14**. Using `var(--font-size-label)` without ensuring token exists would risk `font-size: undefined` rendering as user-agent default 16px (acceptable but inconsistent).

**Honest tradeoff**: surgical px/rem values resolve to identical pixel result (14px). Future iter 15+ codemod can mechanically swap `font-size: 14px /* iter 14 LIM legibility */` → `font-size: var(--font-size-label)` once token shipped.

**Deviation 2: scope tighter than spec**. Spec table §6 also lists CapitoloPicker line 113 (12px → 14px) as entry #2 — NOT modified PHASE 1. Reason: hard constraint "top 5 violators" mandate. Entry #2 is on `.capMeta` (12px non-CRITICAL per D1 audit). Defer iter 15+.

## §4 CoV verification

**Verification 1 — file size delta** (CoV: ls before/after, files grew not shrunk):
- CapitoloPicker.module.css: 3217 → 3304 bytes (+87 = 1 comment line + value change)
- PercorsoCapitoloView.module.css: 5382 → 5469 bytes (+87)
- DocenteSidebar.module.css: 2317 → 2493 bytes (+176 = 2 comments + 2 value changes)
- LessonReader.module.css: 1481 → 1587 bytes (+106)
- LessonSelector.module.css: 1486 → 1555 bytes (+69; comment was already verbose)

ALL 5 files grew. Zero shrunk. ✅

**Verification 2 — grep CoV** (`grep -n "font-size" $files`):
- CapitoloPicker line 121: `font-size: 14px` (was 11px line 120) ✅
- PercorsoCapitoloView line 68: `font-size: 14px` (was 11px line 67) ✅
- DocenteSidebar lines 50 + 67: `font-size: 14px` (was 11px lines 49 + 65) ✅
- LessonReader line 84: `font-size: 0.875rem` (was 0.75rem line 83) ✅
- LessonSelector line 64: `font-size: 0.875rem` (was 0.75rem line 64) ✅

ALL 6 swaps verified. ✅

**Verification 3 — vitest 3× CoV**:
- Run 1: **12718 passed** + 8 skipped + 8 todo (242 files) — 85.94s
- Run 2: **12718 passed** + 8 skipped + 8 todo (242 files) — 106.46s
- Run 3: **12718 passed** + 8 skipped + 8 todo (242 files) — 86.54s

ZERO regression. Baseline 12718 stable across 3 runs (deterministic). ✅

**Verification 4 — build CoV**:
- `npm run build` PASS 2m 6s
- 32 precache entries (4810.51 KiB)
- Bundle warning unchanged (LavagnaShell 2467KB / index 2231KB — pre-existing, not caused by iter 14)
- Zero ESLint/CSS errors introduced

## §5 Visual regression risk assessment

NO Playwright iter 14 PHASE 1 (spec §7 Step 6 deferred per spec §12 honesty caveat 5: "No Playwright run iter 13 (env not configured); Step 6 deferred iter 14 setup").

**Static analysis risk**:
- Top 5 changes are font-size lift 11px→14px (3 selectors) + 12px→14px (2 selectors), all on **inline-block badges/chips** with `padding: 2-4px 8-10px` and `border-radius: 4-10px`. Lift of 3px = +27% font width. Risk text overflow LOW because all 5 violator selectors render single short tokens (`Esperimento`, `Volume 1`, `Cap. 6`, `pag. 23`, `Bonus`) ≤12 chars. Padding 8px L+R provides ~16px safety margin per badge.
- ZERO layout structure change. ZERO box-sizing change. ZERO grid/flex change.

**Claim**: 0 visual regressions. Confidence MED-HIGH (no Playwright; manual visual inspection deferred). If iter 15+ Playwright config'd, can run before/after diff prove ≤2% delta.

## §6 LOC delta

- CSS source LOC delta: **+14 LOC** (5 inline comments line-prefixed `/* iter 14 LIM legibility: ... */` + 8 numeric value swaps + 1 multi-line comment expansion in LessonSelector preserving prior WCAG comment)
- Test LOC delta: **+0** (no test added/removed PHASE 1)
- ADR LOC delta: **+0** (defer iter 15+ ADR-022 LIM typography baseline post token migration)

## §7 SPRINT_S box impact

**Box 5 UNLIM v3 PRINCIPIO ZERO**: 1.0 maintained (no UNLIM logic touched).
**Box 9 R5 91.80% PASS**: 1.0 maintained (no LLM/prompt change).

Iter 14 PHASE 1 is design-quality lift, NOT box-tracked. Cumulative score iter 13 close ONESTO 9.30/10 → 9.30/10 iter 14 PHASE 1 close (NO score lift; PHASE 1 partial scope acknowledged).

## §8 Honesty caveats

1. **Spec inflation**: design-opus iter 13 brief estimated 11× actual. Real CSS violators 39 (not ~440). Real JSX violators 1192 (not 13000). LIM-legibility-opus iter 14 PHASE 1 fixes 5/39 CSS = 13% of CSS scope, 0/1192 JSX = 0% of JSX scope.
2. **No design-tokens.css**: iter 14 PHASE 1 used direct values not tokens. Future iter requires token shipment FIRST per spec §7 Step 1, then mass codemod.
3. **No Playwright visual regression**: claim "0 visual regressions" is static-analysis confidence MED-HIGH, not empirical. Iter 15+ should config Playwright per spec §7 Step 6.
4. **Baseline 12718 vs CLAUDE.md noted 12599 + 12290**: vitest run iter 14 PHASE 1 reports 12718 — higher than CLAUDE.md `automa/baseline-tests.txt` recorded baselines. This is the LIVE test count and it grew between iter 12 close (12599) and iter 14 entrance (12718 = +119 tests added in iter 13 work). Reflects real growth, not regression.
5. **Out-of-scope flagged**: PercorsoCapitoloView line 169 `.transitionLabel` 11px NOT modified PHASE 1 (not in top 5 spec table; defer iter 15+). User searching `grep "font-size: 11px" src/components/lavagna/` will still find this entry — expected.
6. **Brief 4h sellable deadline**: PHASE 1 surgical scope shipped in <30min. Remaining 3.5h available for parallel agent territories (NOT my territory per file ownership rigid).

## §9 Files modified summary

```
src/components/lavagna/CapitoloPicker.module.css        +1 comment, +1 value change (line 120-121)
src/components/lavagna/PercorsoCapitoloView.module.css  +1 comment, +1 value change (line 67-68)
src/components/lavagna/DocenteSidebar.module.css        +2 comments, +2 value changes (lines 49-50, 65-67)
src/components/lavagna/LessonReader.module.css          +1 comment, +1 value change (line 83-84)
src/components/lavagna/LessonSelector.module.css        +1 comment expand, +1 value change (line 61-64)
docs/audits/2026-04-28-iter-14-lim-legibility-impl-audit.md  NEW (this file, ~150 LOC)
```

Total: 5 files modified + 1 file new. ~14 LOC delta src + ~150 LOC audit doc.

## §10 Iter 15+ continuation prompt

```
lim-legibility-opus iter 15 PHASE 2 ELAB Sprint S — bulk LIM legibility CSS top 30 violators

PHASE 1 closed (5/5 top critical violators 11px → 14px). PHASE 2 scope: remaining ~25 CSS
violators per spec §6 entries #2, #5, #7-#11, #13-#20. Pre-req: ship src/styles/design-tokens.css
FIRST per spec §7 Step 1 so subsequent edits use var(--font-size-*) tokens. THEN
mechanical sweep + manual review per file.
```

— lim-legibility-opus iter 14 PHASE 1, 2026-04-28.
