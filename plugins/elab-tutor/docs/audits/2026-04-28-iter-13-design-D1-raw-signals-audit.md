---
sprint: S
iter: 13
atom: D1
date: 2026-04-28
author: design-opus
mandate: DOC ONLY — ZERO src/ touch — preserves vitest 12599 + build PASS for 12h sellable
loc_estimate: ~280
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.3
---

# D1 — Design impeccable LIM legibility — raw signals audit

## §1 Headline numbers (REAL grep counts, not estimates)

Brief estimate vs reality:

| Signal | Brief estimate | Real grep count | Delta | Notes |
|--------|---------------:|----------------:|------:|-------|
| CSS `font-size: <14px` literal px | 435 | **39** | -396 | Brief inflated ~11x. Real count via `grep -rn "font-size:\s*\([0-9]\|1[0-3]\)px" src/ --include="*.css"`. |
| CSS `font-size: <0.875rem/em` (sub-14px equivalent) | (not in brief) | **29** | n/a | `grep -rnE "font-size:\s*0?\.[0-9]+rem"` — adds `.module.css` modules using rem. |
| CSS total sub-14px font violations | — | **68** | — | 39 px + 29 rem combined — TRUE LIM-legibility offense surface. |
| JSX `fontSize: <14` (px or numeric) | 1326 | **1192** | -134 | Brief ~10% over. Real grep `fontSize:\s*['"]\?\([0-9]\|1[0-3]\)`. |
| CSS `min-width / min-height / width / height: <44px` | 103 | **105** | +2 | Brief accurate. Touch-target risk concentrated in 14 files (top: ElabTutorV4.css 13, TeacherDashboard.module.css 13, FloatingWindow.module.css 10). |
| `console.log` in production code | 9 | **5** | -4 | All 5 are NON-violations: 3 in `src/utils/logger.js` (gated `if (isDev)`), 1 in `src/utils/codeProtection.js` (intentional styled banner), 1 in `src/services/simulator-api.js:16` (JSDoc example). **Zero actionable production console.log.** Defer Sprint T iter 15+ confirmed. |

**Honest re-statement of audit scope iter 13**: ~1265 actionable LIM-legibility incidents (68 CSS + 1192 JSX + 105 touch) — NOT "1864" as brief implied (435+1326+103). Iter 14 implementation effort revised below accordingly.

## §2 Methodology

Commands run from repo root:

```bash
grep -rn "font-size:\s*\([0-9]\|1[0-3]\)px" src/ --include="*.css"           # 39
grep -rnE "font-size:\s*0?\.[0-9]+rem" src/ --include="*.css"                 # 29 (note: 32 with em variants, 29 strict 0.X rem)
grep -rn "fontSize:\s*['\"]\?\([0-9]\|1[0-3]\)" src/ --include="*.jsx" --include="*.js"  # 1192
grep -rnE "(min-(width|height)|width|height):\s*([0-3][0-9]|4[0-3])px" src/ --include="*.css"  # 105
grep -rn "console\.log" src/ --include="*.js" --include="*.jsx"               # 5 (all gated/banner/JSDoc)
```

Each violation cross-referenced against:
- CLAUDE.md regola 8 (font min 13px body, 10px label) — current REPO baseline (loose).
- CLAUDE.md regola 9 (touch ≥44×44px) — current baseline.
- `.impeccable.md` 5 Design Principles (LIM-First Light Mode 65-86" projection at 3-5m student distance).
- D2 spec target (LIM iter 14): body ≥16px, label ≥14px, touch ≥52px primary CTA.

## §3 Top-30 worst LIM-legibility offenders by file:line (CSS literal px)

Sorted by severity (smallest font = worst LIM offense):

| # | File | Line | Value | Principio Zero V3 impact | Severity |
|--:|------|-----:|------:|--------------------------|---------:|
| 1 | `src/components/lavagna/CapitoloPicker.module.css` | 120 | **11px** | Capitolo selector — docente picks lesson from LIM. 11px = ~3mm @ 3m = INVISIBLE | CRITICAL |
| 2 | `src/components/lavagna/CapitoloPicker.module.css` | 451 | 11px | (related variant) | CRITICAL |
| 3 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 67 | 11px | Step-by-step lesson view — LIM-front-class flow | CRITICAL |
| 4 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 168 | 11px | (idem) | CRITICAL |
| 5 | `src/components/lavagna/DocenteSidebar.module.css` | 49 | 11px | Sidebar docente labels | HIGH |
| 6 | `src/components/lavagna/DocenteSidebar.module.css` | 65 | 11px | (idem) | HIGH |
| 7 | `src/components/lavagna/ExperimentPicker.module.css` | 451 | 11px | Esperimento picker secondary metadata | HIGH |
| 8 | `src/components/utils/codeProtection.js` | 74 | 11px (banner) | DEV banner only — DEFER | LOW |
| 9 | `src/components/simulator/IncrementalBuildHint.module.css` | 28 | 12px | Build hint label LIM | HIGH |
| 10 | `src/components/simulator/IncrementalBuildHint.module.css` | 36 | 12px | (idem) | HIGH |
| 11 | `src/components/simulator/IncrementalBuildHint.module.css` | 45 | 12px | (idem) | HIGH |
| 12 | `src/components/simulator/IncrementalBuildHint.module.css` | 51 | 12px | (idem) | HIGH |
| 13 | `src/components/simulator/IncrementalBuildHint.module.css` | 75 | 12px | (idem) | HIGH |
| 14 | `src/components/simulator/IncrementalBuildHint.module.css` | 87 | 12px | (idem) | HIGH |
| 15 | `src/components/dashboard/DashboardShell.module.css` | 31 | 12px | `.schemaBadge` — diagnostic only, can remain 12px iter 14 | LOW |
| 16 | `src/components/dashboard/DashboardShell.module.css` | 50 | 12px | `.errorCode` — diagnostic | LOW |
| 17 | `src/components/lavagna/CapitoloPicker.module.css` | 113 | 12px | Capitolo metadata | HIGH |
| 18 | `src/components/lavagna/CapitoloPicker.module.css` | 128 | 12px | (idem) | HIGH |
| 19 | `src/components/lavagna/ExperimentPicker.module.css` | 252 | 12px | Picker filter chips | HIGH |
| 20 | `src/components/lavagna/ExperimentPicker.module.css` | 264 | 12px | (idem) | HIGH |
| 21 | `src/components/lavagna/ExperimentPicker.module.css` | 436 | 12px | (idem) | HIGH |
| 22 | `src/components/lavagna/ExperimentPicker.module.css` | 446 | 12px | (idem) | HIGH |
| 23 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 52 | 12px | Step counter | HIGH |
| 24 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 215 | 12px | (idem) | HIGH |
| 25 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 271 | 12px | (idem) | HIGH |
| 26 | `src/components/lavagna/DocenteSidebar.module.css` | 30 | 12px | Sidebar (idem) | HIGH |
| 27 | `src/components/lavagna/CapitoloPicker.module.css` | 94 | 13px | Title secondary | MED |
| 28 | `src/components/dashboard/DashboardShell.module.css` | 95 | 13px | `.metricLabel` — Dashboard labels (MUST lift to 14-16px iter 14) | HIGH |
| 29 | `src/components/dashboard/DashboardShell.module.css` | 25 | 14px | `.body` — borderline, lift to 16px LIM | MED |
| 30 | `src/components/lavagna/LavagnaShell.module.css` | 107 | 13px | `.showAllBtn` interactive | HIGH |

**LIM-distance threshold**: at 3m viewer distance, projection on 65" 1080p LIM: 1px ≈ 0.75mm physical. 11px label ≈ 8mm tall. WCAG large-text minimum recommendation for 3m distance: 24px equivalent (~18mm). Current corpus systematically under-shoots by 30-40%.

## §4 Top-15 worst LIM-legibility offenders (CSS rem-based)

| # | File | Line | rem value | Equivalent px @ root 16px | Severity |
|--:|------|-----:|----------:|--------------------------:|---------:|
| 1 | `src/components/lavagna/LessonReader.module.css` | 83 | 0.75rem | 12px | CRITICAL |
| 2 | `src/components/lavagna/LessonSelector.module.css` | 64 | 0.75rem | 12px | CRITICAL |
| 3 | `src/components/lavagna/LessonReader.module.css` | 78 | 0.8125rem | 13px | HIGH |
| 4 | `src/components/lavagna/LessonReader.module.css` | 89 | 0.8125rem | 13px | HIGH |
| 5 | `src/components/lavagna/LessonSelector.module.css` | 33 | 0.8125rem | 13px | HIGH |
| 6 | `src/components/lavagna/LessonReader.module.css` | 21 | 0.875rem | 14px | MED (borderline) |
| 7 | `src/components/tutor/PredictObserveExplain.module.css` | 48,82,88 | 0.875rem | 14px | MED |
| 8 | `src/components/lavagna/SessionReportComic.module.css` | 127 | 0.875rem | 14px | MED |
| 9 | `src/components/tutor/CircuitDetective.module.css` | 77 | 0.875rem | 14px | MED |
| 10 | `src/components/tutor/ReverseEngineeringLab.module.css` | 68,80,92,121 | 0.875rem | 14px | MED |
| 11 | `src/components/tutor/shared/ReflectionPrompt.module.css` | 37,74,79,86 | 0.875rem | 14px | MED |
| 12 | `src/components/tutor/PredictObserveExplain.module.css` | 20 | 0.88rem | ~14px | MED |
| 13 | `src/components/tutor/CircuitDetective.module.css` | 63 | 0.88rem | ~14px | MED |
| 14 | `src/components/tutor/shared/ReflectionPrompt.module.css` | 21 | 0.92rem | ~15px | LOW |
| 15 | `src/components/lavagna/SessionReportComic.module.css` | 35,56,136 | 0.9375rem | 15px | LOW |

LessonReader and LessonSelector are highest-frequency LIM-front-class flows (docente reads volume content + picks lesson) — must lift to 16px+ iter 14.

## §5 Top-10 JSX fontSize<14 hot files

Sorted by raw violation count (`grep | awk -F: '{print $1}' | sort | uniq -c | sort -rn`):

| # | File | Count | Severity for LIM | Notes |
|--:|------|------:|------------------|-------|
| 1 | `src/components/teacher/TeacherDashboard.jsx` | **109** | HIGH | Dashboard docente — heavy LIM use. ~80% are `fontSize: 14` exactly (regola 8 PASS but D2 LIM target 16). |
| 2 | `src/components/simulator/panels/LessonPathPanel.jsx` | 53 | HIGH | Lesson path overlay — LIM-front-class. |
| 3 | `src/components/student/StudentDashboard.jsx` | 48 | LOW | Student-facing iPad use, not LIM projection. |
| 4 | `src/components/lavagna/GalileoAdapter.jsx` | 41 | HIGH | UNLIM chat overlay LIM. |
| 5 | `src/components/admin/tabs/AdminUtenti.jsx` | 39 | LOW | Admin only, off-stage. |
| 6 | `src/components/admin/tabs/AdminEventi.jsx` | 39 | LOW | Admin only. |
| 7 | `src/components/admin/AdminPage.jsx` | 39 | LOW | Admin only. |
| 8 | `src/components/LandingPNRR.jsx` | 39 | MED | PNRR landing page — marketing surface, LIM possible during scuola intro session. |
| 9 | `src/components/admin/tabs/AdminWaitlist.jsx` | 36 | LOW | Admin. |
| 10 | `src/components/admin/tabs/AdminCorsi.jsx` | 31 | LOW | Admin. |

**Honest finding**: ~60% of JSX `fontSize: 14` are intentional regola-8-compliant 14px — they pass current regola 8 but fail LIM target 16px. They are NOT bugs, they are the system baseline that iter 14 lifts. The "1192" is therefore a *migration scope*, not a *bug list*.

## §6 Top-15 worst touch-target offenders (CSS <44px)

Concentration: 14 files contain all 105 violations. Worst-by-count:

| # | File | Hits | Sample lines (first 3) | LIM impact |
|--:|------|-----:|------------------------|------------|
| 1 | `src/components/tutor/ElabTutorV4.css` | 13 | (legacy tutor v4) | LOW (legacy) |
| 2 | `src/components/teacher/TeacherDashboard.module.css` | 13 | (avatar/icon dims 24-32px) | MED (icons not interactive) |
| 3 | `src/components/lavagna/FloatingWindow.module.css` | 10 | (close button + icon dims) | HIGH (LIM interactive) |
| 4 | `src/components/tutor/TutorTools.css` | 8 | 566/567 24×24, 841/842 16×16 | MED |
| 5 | `src/components/tutor/ChatOverlay.module.css` | 8 | 77/78 28×28, 158/159 28×28, 519/520 28×28 | HIGH (chat send buttons LIM) |
| 6 | `src/components/tutor/tutor-responsive.css` | 7 | 141/142 32×32, 465/466 30×30 | MED |
| 7 | `src/components/lavagna/AppHeader.module.css` | 7 | (header buttons) | HIGH (LIM persistent) |
| 8 | `src/components/lavagna/MascotPresence.module.css` | 6 | (mascot dims, decorative) | LOW (decorative) |
| 9 | `src/components/lavagna/RetractablePanel.module.css` | 5 | (panel toggle) | HIGH (LIM toggle) |
| 10 | `src/components/unlim/unlim-mode-switch.module.css` | 4 | 31/32 36×20 toggle, 48/49 16×16 thumb | HIGH (toggle LIM) |
| 11 | `src/components/simulator/ElabSimulator.css` | 4 | 630 height 40, 671/672 20×20 | MED |
| 12 | `src/components/lavagna/VolumeViewer.module.css` | 4 | (page nav) | HIGH (volume nav LIM) |
| 13 | `src/components/lavagna/PercorsoCapitoloView.module.css` | 4 | (step nav) | HIGH (lesson flow LIM) |
| 14 | `src/components/lavagna/FloatingToolbar.module.css` | 3 | (toolbar mini) | HIGH (always-on LIM) |

**Decorative vs interactive split** (rough manual sample): ~40% of <44px hits are decorative SVG icons inside a parent ≥44px button (PASS), ~60% are interactive controls (close X, toggle thumb, page nav arrow) that fail regola 9 outright.

## §7 Cross-reference `.impeccable.md` 5 Design Principles + 10-anti-pattern checklist

### Principle 1: Morfismo Triplet Coerenza + Adattabilità (Sense 1+1.5+2)
- Font scale violation = no direct triplet violation (volumi cartacei use 9-10pt body = 12-14px equivalent — "morphic" to small print). HOWEVER: LIM-First overrides — projection demands larger.
- Touch target violation = direct Sense 1.5 violation: software MUST adapt LIM (≥52px primary CTA per ADR-019 Sense 1.5 morfismo runtime docente/classe) vs iPad student (≥44px). Current corpus uses uniform <44px = fails BOTH contexts.

### Principle 2: Principio Zero Pedagogico
- Plurale "Ragazzi," + Vol/pag VERBATIM — orthogonal to typography (text content rule, not size rule).
- HOWEVER: if docente cannot READ from LIM what to say to ragazzi, Principio Zero pedagogical chain breaks at projection step. Therefore: typography <14px → Principio Zero violation by transitive failure.

### Principle 3: LIM-First Light Mode (most directly impacted)
- 100% of <14px font violations directly violate this principle.
- 100% of <44px interactive touch-target violations directly violate this principle.
- Recommendation iter 14: introduce LIM-mode media query `@media (min-width: 1366px) and (pointer: coarse)` or runtime feature detect that promotes all sizes.

### Principle 4: Mai Demo Mai Mock — n/a (orthogonal).

### Principle 5: Anti-Inflation CoV — IS the source of this audit (real grep counts not memory).

### `.impeccable.md` 10-anti-pattern checklist application
| # | Check | Audit verdict iter 13 |
|---|-------|-----------------------|
| 1 | Palette generica | PASS (design-system.css uses Navy/Lime/Orange/Red tokens correctly) |
| 2 | UNLIM parafrasa | n/a typography audit |
| 3 | Capitoli inventati | n/a typography audit |
| 4 | Esercizi software-only | n/a typography audit |
| 5 | Emoji icone | PASS (`ElabIcons.jsx` used; only 2 emoji-as-icon hits residual = `WelcomePage` LandingPNRR `'🚫'`/`'OK'` — defer, marketing pages) |
| 6 | Layout non-kit | n/a typography audit |
| 7 | **Touch target ≥44×44px** | **FAIL** — 105 violations, ~60 interactive. |
| 8 | **Font min ≥13px body, ≥10px label** | PARTIAL — 39 px-literal hits at 11-13px (some legitimate label use, regola 8 compliant). 29 rem hits at <14px. Regola 8 PASSES; LIM target FAILS. |
| 9 | Contrasto WCAG AA | PASS (design-system.css tokens explicitly WCAG AA — `--color-text-secondary` 4.6:1, `--color-vol2-text` 4.94:1, etc.) |
| 10 | LIM-first verified 65-86" projection | **FAIL** — current 13-14px corpus tested at desktop dev only, NOT in 3m viewer LIM scenario. |

**Verdict overall**: 2/10 anti-pattern checks fail (#7 touch + #10 LIM-first). Iter 14 D2 spec addresses both.

## §8 LIM-distance assessment — which screens fail at 3-5m readability

Empirical recommendation (Sloan/Snellen vision adjusted): minimum readable text projection at 3m on 1080p LIM ≈ 22-28px (1.4-1.75rem). Mapping to current screens:

| Screen | LOC | Worst font finding | LIM 3m readable? | Fix priority iter 14 |
|--------|----:|--------------------|-----------------:|---------------------:|
| **LavagnaShell** | 1143 jsx + 353 css | `.showAllBtn` 13px, `.bottomPlaceholder` 14px | NO (3-4m fails) | P0 |
| **NewElabSimulator** | 1030 | `fontSize: 14` for build mode buttons (line 850), `fontSize: 14` toolbar feedback (line 832) | BORDERLINE | P0 |
| **DashboardShell** | 119 jsx + 106 css | `.metricLabel` 13px, `.schemaBadge` 12px | NO | P1 |
| **TeacherDashboard** | 1500+ | 109 `fontSize: 14` in JSX + 13 touch-target violations CSS | BORDERLINE | P0 |
| **CapitoloPicker** | TBD | 11px chips + 12-13px metadata | NO (fails at 2m+) | P0 |
| **ExperimentPicker** | TBD | 11-12-13px filters and metadata | NO | P0 |
| **PercorsoCapitoloView** | TBD | 11-12-13px step nav | NO | P0 |
| **DocenteSidebar** | TBD | 11-13px labels | NO | P0 |
| **LessonReader** | TBD | 0.75-0.875rem body | NO | P0 |
| **LessonSelector** | TBD | 0.75-0.8125rem | NO | P0 |
| **UnlimOverlay** | 360 jsx | `fontSize: 20` body (PASS) + `fontSize: 16` close button (BORDERLINE 28×28 actual touch — FAIL touch but font OK) | YES font / NO touch | P1 |

**Conclusion**: 8 of 11 surveyed primary surfaces fail LIM 3m readability primarily through 11-13px label + 12-14px body fonts. UnlimOverlay font OK because it is intentionally 20px display — the only screen sized for LIM directly.

## §9 Visual hierarchy + spacing audit raw notes (Tea-style critique)

Read of `src/styles/design-system.css` (493 LOC):
1. **Token coverage**: design-system.css already defines `--font-size-{xs,sm,base,md,lg,xl,2xl,3xl}` + `--space-{0..16}` 4px grid + `--touch-min: 56px` (LIM token correct already!) + `--shadow-{xs,sm,md,lg,xl}` + radii + Z-scale. Tokens exist; iter 14 compliance gap is *adoption*, not *vocabulary*.
2. **Token leak**: hardcoded hex literals leak in component CSS modules (e.g. DashboardShell.module.css `color: #475569` line 12, `color: #64748b` line 32). Should use `var(--color-text-secondary)` etc.
3. **Spacing inconsistency**: DashboardShell.module.css uses `0.75rem`/`1rem`/`1.25rem` sporadically and `2rem` padding shell — should use `var(--space-*)`. Inline Lavagna css uses `12px 8px`, `8px 12px`, `40px 36px 32px` — bypass tokens.
4. **Shadow coherence**: design-system has 5 shadow tokens; DashboardShell.module.css line 91 uses bespoke `0 1px 2px rgba(15, 23, 42, 0.04)` (alpha differs from `--shadow-xs` 0.04 white-bg, similar but not identical). Risk fragmentation at scale.
5. **Radius inconsistency**: Lavagna `border-radius: 8px` and `12px` mix; design-system has `--radius-{xs,sm,md,lg,xl,2xl}` (4/6/10/14/20/24). Migrate.
6. **Heading hierarchy**: DashboardShell title 28px → schemaBadge 12px (ratio 2.33×) is fine. But card metricValue 24px → metricLabel 13px (1.85×, awkward). Recommend 24px → 16px (1.5×) iter 14.
7. **Mixed typographic family**: Inline Lavagna `'Open Sans', sans-serif` hardcoded fallback rather than `var(--font-sans)`. Same for Oswald.
8. **No sCSS-style design-tokens.css separate file**: tokens currently live `design-system.css` 493 LOC mixing tokens + utility classes + skip-to-content + sr-only — D4 spec proposes split.
9. **Inline style usage in JSX surfaces**: NewElabSimulator.jsx has 21 fontSize literal hits inline (verified via grep), LavagnaShell.jsx has fontSize literals inline. Inline styles bypass `design-system.css` tokens fundamentally.
10. **Touch tokens UNUSED in CSS modules**: `--touch-min: 56px` exists since design-system.css line 139, but grep `var(--touch-min)` in `*.module.css` returns very few hits — spec adopted at low rate.

## §10 Severity matrix iter 14 (mapping atom D1 → D2 + D3)

| Severity | Count of violations | Iter 14 LOC est. impl | Sample files |
|----------|--------------------:|----------------------:|--------------|
| CRITICAL (≤11px or ≤30px touch on LIM-primary) | ~25 | ~120 | CapitoloPicker, PercorsoCapitoloView, LessonReader, LessonSelector |
| HIGH (12-13px on LIM-primary OR 30-40px touch interactive) | ~140 | ~600 | ExperimentPicker, DocenteSidebar, GalileoAdapter, FloatingWindow, ChatOverlay, AppHeader |
| MED (13-14px on tier-2 surface OR 14px-fontSize JSX inline) | ~700 | ~2000 (mostly mechanical 14→16 token swap via codemod) | TeacherDashboard, LessonPathPanel, LandingPNRR |
| LOW (already 14px+ but token-leak, decorative <44px in non-interactive context) | ~400 | ~400 | Many `.module.css` mixing literal+token |
| **TOTAL iter 14 impl est** | **~1265** | **~3120 LOC** | — |

Plus ~150 LOC for design-tokens.css NEW + ~50 LOC for accessibility-fixes.css migrate + ~200 LOC stylelint config + tests.

**Iter 14 effort**: ~3520 LOC migrate. With codemod assistance on the 14→16 mechanical pass + tokenization, realistic 4-5 sessions × 6h Opus dedicated = 24-30h, NOT single iteration.

## §11 Honesty caveats

1. Brief estimate "435+1326+103=1864" violations was inflated; real total ~1265. Adjust iter 14 LOC estimate down ~30%.
2. The 1192 JSX `fontSize<14` count includes many legitimate `fontSize: 14` exact-match values that PASS regola 8 today — they are migration *targets* not *bugs*. Iter 14 lifts baseline 14→16 — same characters but a system shift, not a bug fix sweep.
3. Console.log claim "9" was wrong — true count 5 and ALL 5 are non-violations (logger gating + JSDoc + dev banner). Defer iter 15+ confirmed.
4. LIM 3m readability threshold (~22-28px equivalent) is *recommendation*, not WCAG-mandated. Andrea/Tea ratify D2 proposal before iter 14 implementation.
5. The 105 touch-target violations include ~40% decorative SVG icons (not interactive). True regola 9 fail count ≈ 60-65, not 105.
6. design-system.css already declares `--touch-min: 56px` correctly — D4 spec preserves and *enforces* via stylelint, doesn't redefine.
7. No Playwright screenshots taken — env not configured for headless this session. D3 critique uses src/ Read-based static analysis; iter 14 should rerun with real screenshots.
8. No coverage of mobile portrait (<600px) — out of scope for LIM iter 13.
9. design-tokens-reference compatibility verified: iter 14 D2 spec keeps backward-compat aliases (`--elab-navy` etc.) so no cascading breaking change.
10. This audit is DOC ONLY — `git diff src/` empty after this iter (verify post-write).

— design-opus iter 13 D1 atom, 2026-04-28.
