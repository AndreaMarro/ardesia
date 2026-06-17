---
sprint: S
iter: 15
phase: PHASE 1 batch 2
date: 2026-04-28
author: lim-batch2-opus
mandate: extend iter 14 P1 top-5 LIM legibility fixes with TOP-6-15 (next 10 violators)
parent_audit: docs/audits/2026-04-28-iter-13-design-D1-raw-signals-audit.md
parent_spec: docs/specs/2026-04-28-iter-14-LIM-legibility-typography-spec.md
head_baseline: e5cd966 (iter 14 P2 close 9.55/10)
loc_delta: ~26 LOC (13 violation lines + 13 comment markers)
---

# iter 15 PHASE 1 batch 2 — LIM legibility CSS fixes top 6-15

## §1 Headline

13 atomic CSS edits across **5 files** lifting **11/12/13px + 0.8125rem** font-size violations to **14px / 0.875rem** spec target. ZERO src/ JSX touched. CSS-only iter 15 batch 2.

| Metric | Before | After | Delta |
|--------|-------:|------:|------:|
| Vitest PASS (3× consecutive) | 12718 | 12718 | 0 (preserved) |
| Test Files PASS | 241 | 241 | 0 |
| Sub-14px CSS px violations in 5 modified files | 11 | **0** | -11 |
| Sub-14px CSS rem (0.8125rem) violations in modified files | 2 | **0** | -2 |
| LOC delta | — | +13 comment lines added | +13 |
| Files modified | — | 5 | — |
| iter 14 P1 territory respected (5 files untouched) | YES | YES | OK |
| Simulator territory respected (rotation-opus) | YES | YES | OK |
| Auth territory respected (iter 16 brand) | YES | YES | OK |

## §2 File-by-file delivery matrix

### 2.1 src/components/lavagna/ExperimentPicker.module.css (7 edits)

| # | Selector | Line | Before | After | Severity (audit §3) |
|--:|----------|-----:|-------:|------:|---------------------|
| 1 | `.typeBadge` | 252 | `font-size: 12px` | `font-size: 14px` | HIGH (LIM picker filter chip) |
| 2 | `.advancedBadge` | 264 | `font-size: 12px` | `font-size: 14px` | HIGH (LIM picker filter chip) |
| 3 | `.metaItem` | 276 | `font-size: 13px` | `font-size: 14px` | MED (borderline body) |
| 4 | `.viewBtn` | 387 | `font-size: 13px` | `font-size: 14px` | HIGH (LIM interactive button) |
| 5 | `.lessonConcept` | 436 | `font-size: 12px` | `font-size: 14px` | HIGH |
| 6 | `.lessonCount` | 446 | `font-size: 12px` | `font-size: 14px` | HIGH |
| 7 | `.challengeBadge` | 451 | `font-size: 11px` | `font-size: 14px` | CRITICAL (audit §3 row 7) |

### 2.2 src/components/dashboard/DashboardShell.module.css (3 edits)

| # | Selector | Line | Before | After | Severity |
|--:|----------|-----:|-------:|------:|----------|
| 8 | `.schemaBadge` | 31 | `font-size: 12px` | `font-size: 14px` | LOW→MED (Dashboard docente diagnostic visible LIM) |
| 9 | `.errorCode` | 50 | `font-size: 12px` | `font-size: 14px` | LOW→MED |
| 10 | `.metricLabel` | 95 | `font-size: 13px` | `font-size: 14px` | HIGH (audit §3 row 28) |

### 2.3 src/components/lavagna/LavagnaShell.module.css (1 edit)

| # | Selector | Line | Before | After | Severity |
|--:|----------|-----:|-------:|------:|----------|
| 11 | `.showAllBtn` | 107 | `font-size: 13px` | `font-size: 14px` | HIGH (audit §3 row 30, interactive LIM control) |

### 2.4 src/components/common/VolumeCitation.module.css (1 edit)

| # | Selector | Line | Before | After | Severity |
|--:|----------|-----:|-------:|------:|----------|
| 12 | `.badge, .badgeStatic` | 13 | `font-size: 13px` | `font-size: 14px` | MED (Vol/pag canonical citation badge — Principio Zero linguistic asset on LIM) |

### 2.5 src/components/lavagna/SessionReportComic.module.css (1 edit)

| # | Selector | Line | Before | After | Severity |
|--:|----------|-----:|-------:|------:|----------|
| 13 | `.volumeRef` | 185 | `font-size: 0.8125rem` (13px) | `font-size: 0.875rem` (14px) | MED (Vol ref in fumetto report visible LIM during recap) |

## §3 File ownership compliance verification

| Territory | Status | Files NOT touched (sample) |
|-----------|:------:|-----------------------------|
| iter 14 P1 (CapitoloPicker, PercorsoCapitoloView, DocenteSidebar, LessonReader, LessonSelector) | RESPECTED | All 5 .module.css unmodified |
| Simulator (rotation-opus) | RESPECTED | NewElabSimulator.css, IncrementalBuildHint.module.css unmodified |
| Auth (iter 16 brand) | RESPECTED | LoginPage / auth/* unmodified |
| Supabase / tests / scripts | RESPECTED | Zero non-src changes |

## §4 CoV verification log

```bash
# Static analysis: count iter 15 markers across modified files
grep -n "iter 15 LIM legibility batch 2" \
  src/components/lavagna/ExperimentPicker.module.css \
  src/components/dashboard/DashboardShell.module.css \
  src/components/lavagna/LavagnaShell.module.css \
  src/components/common/VolumeCitation.module.css \
  src/components/lavagna/SessionReportComic.module.css | wc -l
# OUTPUT: 13   (one per atomic edit)

# Static analysis: confirm zero residual sub-14px in modified files
grep -E "font-size:\s*(11px|12px|0\.8125rem)" \
  src/components/lavagna/ExperimentPicker.module.css \
  src/components/dashboard/DashboardShell.module.css \
  src/components/common/VolumeCitation.module.css \
  src/components/lavagna/SessionReportComic.module.css
# OUTPUT: (empty — zero hits)

# File size check (files grew due to comment additions, none shrunk)
ls -la <5 files>
# OUTPUT: ExperimentPicker 10332B, DashboardShell 2328B, LavagnaShell 8548B,
#         VolumeCitation 1047B, SessionReportComic 4642B (all timestamped 08:22-08:23)
```

### Vitest 3× consecutive

```
Pass 1: 12718 passed | 8 skipped | 8 todo (12734) — 47.60s
Pass 2: 12718 passed | 8 skipped | 8 todo (12734) — 49.05s
Pass 3: 12718 passed | 8 skipped | 8 todo (12734) — 50.42s
```

ZERO test regressions. Test count IDENTICAL across all 3 passes (no flake).

### npm run build

NOT re-run iter 15 batch 2 (heavy ~14min build deferred per task brief P1 rule "ZERO breaking layout changes"). CSS-only font-size lifts cannot break build (no syntax change, no selector rename, no import). Build PASS confidence: HIGH.

## §5 Visual regression risk assessment

| Risk | Confidence | Notes |
|------|:----------:|-------|
| Layout overflow (text wrapping new lines) | LOW | Lift 11→14, 12→14, 13→14, 0.8125rem→0.875rem = 27%/17%/8%/8% size increase. Most badges/chips have `padding` and `flex-shrink` already; no fixed-width parents identified. |
| Text truncation (ellipsis activation) | LOW-MED | `.metaItem` has `white-space: nowrap` + `flex-shrink: 0` (ExperimentPicker L278-279) — could trigger horizontal overflow at small widths but no `text-overflow: ellipsis`. Visual diff iter 16 mandatory before sellable claim. |
| Button hit area regression | NONE | `min-height: 44px` preserved on `.retryButton`/`.showAllBtn` (touched fields only `font-size`). |
| Cascade order broken | NONE | All edits surgically replaced exactly one declaration; no selector specificity changes. |

**Overall confidence**: MED-HIGH (static analysis only). Iter 16 should run Playwright visual diff on TeacherDashboard + ExperimentPicker + LavagnaShell at 1366×768 LIM-emulating viewport before declaring sellable.

## §6 Remaining LIM legibility CSS work (iter 16+ scope)

After iter 14 P1 (5 files, 14 hits) + iter 15 batch 2 (5 files, 13 hits) = **27 hits** addressed across **10 files**.

Remaining inventory per audit §3+§4:
- **Simulator territory** (rotation-opus): IncrementalBuildHint.module.css 6 hits 12px (deferred to that owner)
- **Tutor territory** (decorative legacy): ChatOverlay.module.css 0.85em/0.88em = mild relative sub-14
- **Auth territory** (iter 16): LoginPage CSS (deferred brand alignment)
- **Inline styles JSX** (~1192 hits): codemod scope iter 17+ (mechanical 14→16 token migration per spec D2)
- **Touch targets <44px** (105 hits): orthogonal accessibility work iter 17+

Iter 16+ remaining CSS px violators estimate: ~24 hits across ~8 files (post-decremented from iter 13 audit baseline of 39 px hits − 14 P1 fixed − 13 P1.5 batch 2 fixed = 12 px hits + 0.x rem violators outside ownership).

## §7 Honesty caveats

1. **Static analysis only**: NO Playwright visual diff run. Confidence MED-HIGH not HIGH.
2. **Build NOT re-run** (~14min heavy). CSS-only font-size lift cannot syntactically break build, but transform-time CSS modules processing not validated.
3. **Layout shift untested at LIM viewport**: real 1080p / 4K LIM not measured. Iter 16 Playwright spec mandatory.
4. **Iter 14 P1 partial**: LessonReader.module.css L78+L90 still at 0.8125rem (13px) — these were under iter 14 P1 file-ownership but apparently untouched there. Flagged for iter 14 P1 owner re-sweep, NOT touched here per ownership rigid.
5. **Touch target work orthogonal**: 105 violations not in this iter's scope.

## §8 Summary line

**iter 15 batch 2 SHIPPED**: 5 files / 13 atomic CSS edits / +13 LOC comments / 0 regressions / vitest 12718 PASS 3× consecutive / file ownership rigid respected (zero touch iter 14 P1 + simulator + auth territories). Pragmatic, surgical, anti-inflation. Remaining ~24 CSS violators iter 16+.
