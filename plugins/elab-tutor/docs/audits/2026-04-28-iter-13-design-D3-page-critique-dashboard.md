---
sprint: S
iter: 13
atom: D3 (2 of 4)
page: Dashboard (DashboardShell)
date: 2026-04-28
author: design-opus
files_audited:
  - src/components/dashboard/DashboardShell.jsx (119 LOC, full read)
  - src/components/dashboard/DashboardShell.module.css (106 LOC, full read)
  - src/components/teacher/TeacherDashboard.jsx (1500+ LOC, partial — sampled top 109 fontSize hits)
mandate: DOC ONLY
screenshot_path_placeholder: docs/specs/screenshots/dashboard-1080p-iter-14-baseline.png (DEFERRED)
---

# D3.2 — Dashboard design critique

## §1 Page summary
DashboardShell is a clean Day-10 scaffold (119 LOC JSX) progressively integrating useDashboardData hook (Day 18). Currently 4 metric cards (student_count / interactions / minutes / experiments_completed) + states {disabled, loading, error, ready}. Backward-compat shims preserved (`enabled={true}` opt-in).

A separate **TeacherDashboard.jsx** (1500+ LOC) is a parallel/legacy dashboard used in-product — this critique focuses on DashboardShell (canonical Day 10+) and notes TeacherDashboard fallout where applicable.

## §2 Visual hierarchy critique (5 items)
1. **Title hierarchy clear**: H1 `.title` 28px Oswald Navy → cards body 14px → metric value 24px Oswald Navy → metric label 13px gray. Reading order works at desk distance, but at LIM 3m, 13px label vanishes (D1 §3 row 28).
2. **Single H1 per shell ✓** — `<h1 className={styles.title}>Dashboard Docente</h1>` (line 53) — semantic correct.
3. **Card grid `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` (line 81)** — adapts well to viewport, but at 1080p LIM (1920w) yields 9 columns max — too dense. Iter 14: cap with `minmax(280px, 1fr)` + `max-width: 1200px` (line 9 ✓ already).
4. **No icon presence per metric card** — labels alone ("Studenti", "Interazioni", "Minuti medi sessione", "Esperimenti completati"). Adding ElabIcons (FlaskIcon for esperimenti, etc.) would aid LIM scan-ability (Tea-style Sense 2 icon-from-volumi). MissedSpec recommendation iter 14: add icon-prefix per card.
5. **Error state design good**: red bg + red border + retry button with focus ring (line 74-77) — accessibility solid. Loading state under-designed: bare `<p>Caricamento metriche...</p>` (line 63) — at LIM front-class, docente during load = bored class. Recommend skeleton card animation iter 14.

## §3 Spacing + alignment issues (5 items)
1. **`.shell` padding `2rem` (32px)** is generous but bypasses token (`var(--space-8)` = 32px). Iter 14: `padding: var(--space-8)` for canon. Inconsistency: rest of file uses rem (`0.75rem`, `1rem`) while shell uses `2rem` — mixed scale.
2. **`.card` padding `1rem 1.25rem` (line 90)** vs grid `gap: 1rem` (line 82). Card content edges match gap exactly = visually cards "kiss" with no breathing. Iter 14: increase gap to `var(--space-6)` 24px or pad cards more.
3. **`.metricLabel` margin-bottom `0.25rem` (line 97)** = 4px between label and value. At 1080p LIM = 3mm. Tight. Iter 14: lift to `var(--space-2)` 8px.
4. **`.title` margin-bottom `0.75rem` (line 20)** before body — very tight for hero title. iter 14: `var(--space-6)` 24px.
5. **`.retryButton` margin-left `0.75rem` (line 57)** is inline-block hack. Better: flex container with gap. Iter 14: wrap error message + button in flex `gap: var(--space-3)`.

## §4 Typography violations (3 items)
1. **`.body` font-size 14px (line 25)** — Used for "In sviluppo — disponibile Day 11+", "Caricamento metriche...". 14px LIM 3m = borderline 11mm. Iter 14: lift `var(--font-size-sm)` 16px.
2. **`.metricLabel` font-size 13px (line 95)** — 13px label ABOVE the metric value: docente glances LIM, sees only the big number, can't read label. CRITICAL. Iter 14: 14px → ideally 16px LIM-mode.
3. **`.schemaBadge` font-size 12px (line 31)** — diagnostic only, label "schema vN.M.K". Acceptable to remain 12px IF flagged as `data-diagnostic="true"`. Iter 14 spec: exempt diagnostic badges from font lift, add explicit comment in code.
4. (bonus) **`.errorCode` font-size 12px (line 50)** — error code suffix `[E_NETWORK]` etc. Diagnostic; same exemption.

## §5 Touch target failures with file:line refs (3 items)
1. **`.retryButton` `min-height: 44px; min-width: 44px` (lines 59-60)** — meets regola 9 minimum exactly. PASS iter 13. Iter 14 lift `var(--touch-primary)` 56px for LIM.
2. **`.title` H1 — non-interactive, no failure.**
3. **`.card` not interactive (data display)** — no touch target rule applies.

(Most touch concerns are in TeacherDashboard.jsx 1500-LOC sibling, NOT DashboardShell. TeacherDashboard.module.css separately has 13 touch<44 hits — top-2 worst offender per D1 §6. Audit those iter 14 in dedicated TeacherDashboard pass.)

## §6 LIM-distance readability score 1-10 honest

**6.0 / 10** — DashboardShell scaffold; TeacherDashboard is what's actually used today.

Breakdown:
- Hierarchy: 7/10 (cards clear)
- Typography: 5/10 (13-14px labels)
- Touch: 7/10 (44px floor)
- Spacing: 6/10 (cramped gaps)
- Color: 9/10 (palette compliant + WCAG AA)
- States: 7/10 (loading underwhelming, error well-designed)
- LIM-readability whole: 5/10 (not LIM-projected, more "manager standing at desk")

## §7 Top-5 actionable fixes prioritized

| # | Fix | File:line | Before | After | Effort |
|--:|-----|-----------|--------|-------|--------|
| 1 | Lift `.metricLabel` 13→14 (or 16 LIM) | DashboardShell.module.css:95 | `font-size: 13px;` | `font-size: var(--font-size-xs);` (14) | 1 line |
| 2 | Lift `.body` 14→16 LIM | DashboardShell.module.css:25 + 44 | `font-size: 14px;` | `font-size: var(--font-size-sm);` (16) | 2 lines |
| 3 | Tokenize hardcoded colors | DashboardShell.module.css:12,32,75,88,96 | `color: #475569;`, `color: #64748b;`, `outline: 3px solid #E8941C;`, `border: 1px solid #e2e8f0;`, `color: #64748b;` | `color: var(--color-text-body);`, `color: var(--color-text-secondary);`, `outline: 3px solid var(--color-vol2);`, `border: 1px solid var(--color-border);`, `color: var(--color-text-secondary);` | ~5 lines |
| 4 | Tokenize spacing rem→token | DashboardShell.module.css:8,20,57,82,83,90 | `2rem`, `0.75rem`, `0.75rem`, `1rem` (×3) | `var(--space-8)`, `var(--space-3)`, `var(--space-3)`, `var(--space-4)` (×3) | ~6 lines |
| 5 | Lift `.retryButton` min-height 44→56 LIM | DashboardShell.module.css:59-60 | `min-height: 44px; min-width: 44px;` | `min-height: var(--touch-primary); min-width: var(--touch-primary);` | 2 lines |

## §8 Brand alignment Affidabile/Didattico/Accogliente

- **Affidabile**: ✓ explicit error state with code + retry. Stable.
- **Didattico**: ◐ four metric cards good for at-a-glance, but no narrative ("Stai facendo bene questa settimana, +15% vs scorsa"). Iter 14 spec opportunity: add narrative summary card (LIM-friendly H2 sentence Tea voice).
- **Accogliente**: ◐ "Dashboard Docente" cold. Could be "Buongiorno, docente" or per-docente-name greeting via Sense 1.5 morfismo (ADR-019). Currently disabled-state copy "In sviluppo — disponibile Day 11+" is ambivalent (developer-facing message escaped to user-facing text). Iter 14 fix: hide entirely or rephrase.

## §9 Sense 2 Morfismo coherence kit Omaric + volumi cartacei

- **Sense 2 BORDERLINE**: 4 metric cards generic ("Studenti", "Esperimenti completati"). Could include Volume-attribution ("Esperimenti Vol.1 / Vol.2 / Vol.3") to bind to physical books. Iter 14 spec opportunity.
- **Sense 2 PASS palette**: Navy title + accent green for positive metrics + red for error — palette tokens compliant.
- **Sense 1.5 GAP**: no docente-specific dashboard adaptation visible iter 13. ADR-019 morfismo runtime is iter 12 prep — wire-up iter 14.

## §10 Note on TeacherDashboard.jsx (sibling, 1500 LOC)
Top of D1 JSX violation list (109 fontSize<14 hits). Mostly `fontSize: 14` exact-match (regola 8 PASS) but D2 LIM target 16. Iter 14 dedicated pass: split into 4 sub-components (StudentList, ClassWeather, MetricsGrid, NotificationFeed) for maintainability + selectively lift typography per LIM exposure (StudentList = 16px, ClassWeather = 18px). NOT in iter 13 scope.

## §11 Honesty caveats
1. DashboardShell read FULL 119 LOC. Module.css read FULL 106 LOC. Critique complete for Day-10 scaffold scope.
2. TeacherDashboard.jsx read partial only (109 fontSize hits sample). Full critique iter 14.
3. No Playwright screenshot — defer iter 14.
4. useDashboardData hook (line 25 import) NOT read — accept its contract from D1 typing.
5. Score 6/10 reflects scaffold maturity ~50%; mature TeacherDashboard scores 5.5/10 estimate.

— design-opus iter 13 D3 atom (2/4 dashboard), 2026-04-28.
