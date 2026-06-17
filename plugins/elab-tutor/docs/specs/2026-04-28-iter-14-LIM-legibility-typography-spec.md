---
sprint: S
iter: 14 (proposed)
atom: D2
date: 2026-04-28
author: design-opus iter 13
mandate: PROPOSE-ONLY iter 13 — implementation deferred iter 14
loc_estimate: ~320
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.3 D2
depends_on: docs/audits/2026-04-28-iter-13-design-D1-raw-signals-audit.md
---

# D2 — Iter 14 LIM legibility typography spec

## §1 Scope and goals

Lift ELAB Tutor typography baseline so projection on 65-86" LIM at 3-5m student distance is unambiguously readable for docente AND ragazzi audience. Non-goals: redesign visual hierarchy concept, change brand voice (Affidabile/Didattico/Accogliente unchanged), introduce new fonts, change palette.

**Three success metrics** iter 14 close:
1. Zero CSS `font-size:` literal <14px in interactive primary surface (Lavagna/Esperimento/Dashboard/Onboarding) — diagnostic surfaces (debug badges) exempted.
2. Zero JSX inline `fontSize:` numeric literal <14 in interactive primary surface — values must use `var(--font-size-*)` or named constant.
3. All interactive controls used during LIM-front-class flow have hit-target ≥52×52px (LIM tap-distance teacher reach), preserving ≥44×44px elsewhere (iPad/student secondary surface).

## §2 LIM-distance physics rationale

A 65" 1080p LIM (display width ~144cm) at 3m student distance subtends ~26° horizontal field of view. 1 CSS px ≈ 0.75mm physical. Common readability thresholds:

| Distance | Min legible body | Min legible label | Source |
|---------:|-----------------:|------------------:|--------|
| 1m (docente at desk) | 14px | 11px | regola 8 baseline |
| 3m (front-row student) | 22px | 16px | Sloan vision research adjusted |
| 5m (back-row student) | 28px | 20px | (idem) |
| Comfortable read 3-5m | 24-28px body, 16-18px label | — | This spec target |

**Spec target**: a font-size scale tuned for 3-5m LIM-front-class — body 16-22px, titoli 24-36px, labels 14-16px secondary, code 14-16px monospace.

## §3 Proposed font-size scale (rem-based, root 16px)

The existing `src/styles/design-system.css` already exposes a scale (lines 54-61). Spec proposes an EXTENSION (not replace) — additive new tokens for LIM-mode + lift of existing values. Tokens added:

```
--font-size-xs:    14px / 0.875rem   (label secondario — was 14px, unchanged)
--font-size-sm:    16px / 1.000rem   (body LIM-front-class — was 15px, LIFT)
--font-size-base:  18px / 1.125rem   (body comfortable — was 16px, LIFT)
--font-size-md:    20px / 1.250rem   (body emphasized — was 17px, LIFT)
--font-size-lg:    22px / 1.375rem   (subtitle — was 18px, LIFT)
--font-size-xl:    28px / 1.750rem   (titolo H2 — was 24px, LIFT)
--font-size-2xl:   36px / 2.250rem   (titolo H1 — was 32px, LIFT)
--font-size-3xl:   48px / 3.000rem   (display LIM hero — was 40px, LIFT)
--font-size-code:  16px / 1.000rem   (Fira Code monospace — NEW canonical)
--font-size-label: 14px / 0.875rem   (label tertiary — NEW; min permitted)
```

`--line-height-{tight,normal,loose}` = 1.25 / 1.5 / 1.65 (preserved, regola 17 compliant).

**Backward compat**: `--font-size-base` lift 16→18 affects components using literal `var(--font-size-base)`. Migration script lists every consumer pre-merge iter 14. Acceptable break: ALL consumers gain readability; no consumer becomes UNREADABLE.

## §4 Touch-target proposal

Existing token `--touch-min: 56px` already defined design-system.css:139 — UNDER-USED. Spec adds:

```
--touch-primary:    56px   (LIM-front-class CTA — already exists, MUST be enforced)
--touch-secondary:  44px   (iPad student secondary action — regola 9 minimum)
--touch-decorative: 28px   (icon-only inside parent ≥44px container — fine)
--touch-spacing-min: 8px   (gap between adjacent touch targets, regola 9 supplement)
```

Mapping rules iter 14:
- Any element with `onClick`/`onKeyDown` handler in `src/components/lavagna/**` + `src/components/simulator/**` PRIMARY surface MUST satisfy `min-height: var(--touch-primary)` AND `min-width: var(--touch-primary)`.
- Decorative `<svg>` inside `<button>` MUST have parent button satisfy primary; inner SVG can be 24-28px.
- Toggle thumbs inside switch tracks (`unlim-mode-switch.module.css:48-49` 16×16) — track parent must be ≥44×24 (track) with thumb ≥20×20 — minor lift.

## §5 Color contrast proposal (WCAG AAA primary CTA only)

| Surface | Current target | Spec iter 14 target | Source |
|---------|----------------|---------------------|--------|
| Primary CTA bg vs text | AA 4.5:1 | **AAA 7:1** for `--color-primary` Navy + white text | LIM glare-tolerance |
| Body text on white | AA 4.5:1 | AA 4.5:1 (preserve) | regola 10 |
| Secondary metadata | AA 4.5:1 (currently `--color-text-secondary` 4.6:1) | AA 4.5:1 (preserve) | — |
| Disabled state | ≥3:1 | ≥3:1 (preserve) | WCAG |
| Volume indicators (Vol1/2/3) | Already documented `--color-vol2-text` 4.94:1 + `--color-vol3-text` 7.1:1 | Preserve, document Vol1 lime variant 5.5:1+ on white if missing | regola 16 |

**Action**: design-tokens.css NEW (per D4) explicitly tags AAA tokens:
```
--color-primary-on-white-aaa: #1E4D8C  /* 8.2:1 */
--color-text-cta-inverse-aaa: #FFFFFF  /* on Navy = 8.2:1 OK AAA */
```

## §6 Violation→target mapping table (≥10 entries D1 → D2)

| # | File | Line | Current | iter 14 target | Migration approach |
|--:|------|-----:|--------:|---------------:|--------------------|
| 1 | `lavagna/CapitoloPicker.module.css` | 120 | 11px | `var(--font-size-label)` 14px | direct swap; verify visual |
| 2 | `lavagna/CapitoloPicker.module.css` | 113 | 12px | `var(--font-size-xs)` 14px | direct swap |
| 3 | `lavagna/PercorsoCapitoloView.module.css` | 67 | 11px | `var(--font-size-label)` 14px | direct swap |
| 4 | `lavagna/LessonReader.module.css` | 83 | 0.75rem (12px) | `var(--font-size-xs)` 14px | rem→token |
| 5 | `lavagna/LessonReader.module.css` | 21 | 0.875rem (14px) | `var(--font-size-sm)` 16px | LIM body lift |
| 6 | `lavagna/LessonSelector.module.css` | 33 | 0.8125rem (13px) | `var(--font-size-xs)` 14px | rem→token |
| 7 | `dashboard/DashboardShell.module.css` | 25 | 14px | `var(--font-size-sm)` 16px | LIM body lift |
| 8 | `dashboard/DashboardShell.module.css` | 95 | 13px | `var(--font-size-xs)` 14px | direct |
| 9 | `dashboard/DashboardShell.module.css` | 31 | 12px | LEAVE 12px (diagnostic schema badge) | annotate exemption |
| 10 | `simulator/IncrementalBuildHint.module.css` | 28 | 12px | `var(--font-size-xs)` 14px | bulk swap (all 6 hits in file) |
| 11 | `lavagna/ExperimentPicker.module.css` | 252,264,436,446 | 12px | `var(--font-size-xs)` 14px | bulk swap |
| 12 | `lavagna/DocenteSidebar.module.css` | 49,65 | 11px | `var(--font-size-label)` 14px | direct |
| 13 | `lavagna/LavagnaShell.module.css` | 107 | 13px | `var(--font-size-xs)` 14px | direct |
| 14 | `simulator/ElabSimulator.css` | 549 | 0.875rem | `var(--font-size-sm)` 16px | rem→token + lift |
| 15 | `lavagna/SessionReportComic.module.css` | 35,56,136 | 0.9375rem | `var(--font-size-sm)` 16px | direct |
| 16 | JSX `App.jsx:457,470,483,496,509` | 5× | `fontSize: '14px'` | `fontSize: 'var(--font-size-sm)'` 16px | inline→token |
| 17 | JSX `LandingPNRR.jsx` | 39 hits | mostly 14-15px | tokenize all to `var(--font-size-sm)` 16 | bulk codemod |
| 18 | JSX `teacher/TeacherDashboard.jsx` | 109 hits | mostly 14 | tokenize + LIM-lift to `var(--font-size-sm)` 16 | codemod with manual review |
| 19 | JSX `simulator/NewElabSimulator.jsx:832` toolbar 14 | 14 | `var(--font-size-sm)` 16 | inline→token |
| 20 | CSS touch `unlim-mode-switch.module.css:31-32` 36×20 | track | parent track 44×24, thumb 20×20 | dim adjust |

(20 entries shown — full file:line list iter 14 implementation step generated by codemod.)

## §7 Iter 14 implementation roadmap atomic steps

### Step 1 — Ship `src/styles/design-tokens.css` NEW
Per D4 spec (separate file). Imports from `design-system.css` already exist; this step extracts canonical tokens into dedicated file. ~150 LOC.

### Step 2 — `src/styles/globals.css` (or `design-system.css`) migrate to tokens
Update existing `--font-size-{xs..3xl}` values per §3 above (LIFT pass). This is a *single-file edit* breaking nothing if all consumers used tokens. Risk: hardcoded users break — Step 3 fixes.

### Step 3 — 30 worst-offender file:line surgical fixes
Per D1 §3 + §4 + §6 tables. Each is direct swap `12px → var(--font-size-xs)` or `0.875rem → var(--font-size-sm)`. ~30 commits or one squash. Pre-commit hook + vitest baseline 12599 verify.

### Step 4 — Bulk codemod JSX inline fontSize → token
1192 JSX hits — split:
- ~700 are `fontSize: 14` literal → mechanical replace `fontSize: 'var(--font-size-sm)'` 16 (LIM lift).
- ~250 are `fontSize: 12` or `fontSize: 13` → mechanical to `fontSize: 'var(--font-size-xs)'` 14 (within-regola lift).
- ~100 are `fontSize: '20px'`/'24px' display sizes → `fontSize: 'var(--font-size-lg)'` etc. (preserve hierarchy, attach token).
- ~140 are admin/dev surfaces (low LIM exposure) — TOKENIZE but no LIM lift required (preserve current physical size).

Codemod proposed: `scripts/codemod/jsx-fontsize-tokenize.mjs` jscodeshift-based ~80 LOC. Dry-run + diff review per file group.

### Step 5 — Touch-target migration ~60 interactive offenders
Per D1 §6. Manual touch (no codemod — context-aware). Add `min-height: var(--touch-primary)` on interactive elements in primary surface; add `min-height: var(--touch-secondary)` on student-tier; preserve 24-28px on decorative SVG.

### Step 6 — Visual regression test (Playwright)
Capture LIM 1080p (1920×1080) + 4K (3840×2160) viewport screenshots BEFORE iter 14 + AFTER. Diff via `pixelmatch` ≤2% delta tolerance (accept layout shift from font lift). Spec NEW `tests/visual/lim-typography-baseline.spec.js`.

### Step 7 — stylelint rule (D4)
NEW `.stylelintrc.cjs` rule: `declaration-property-value-disallowed-list: { font-size: ['/^[0-9]+px$/', '/^[0-1]?\\.?[0-9]+rem$/'] }` with allow-list for tokens. Enforces no-hardcoded.

### Step 8 — vitest baseline preserve + benchmark.cjs delta
Iter 14 close: `npx vitest run` ≥12599 (no test added/removed by D2 alone — visual regression test in step 6 may add ~5 new). `node scripts/benchmark.cjs --write` delta ≥0.

## §8 NO code changes iter 13 — explicit confirmation

This document is SPEC ONLY. iter 13 ships:
- This `.md` file
- `D1` audit `.md`
- `D3` critique `.md`
- `D4` design-tokens spec `.md`

Zero `src/` change. Andrea/Tea review specs, ratify, iter 14 implements per Step 1-8. Effort iter 14: ~3520 LOC over 4-5 sessions × 6h.

## §9 Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Font-size lift breaks dashboard layouts (text overflow) | MED | MED | Step 6 visual regression catches; manual fix per file. |
| Codemod misfires on inline fontSize with conditional ternary | LOW | LOW | Manual review per ~700 JSX hits; codemod conservative pattern. |
| Touch lift breaks toolbar density (overflow) | MED | MED | Selective application — only LIM-primary surface; secondary 44px preserved. |
| AAA contrast 7:1 conflicts with brand Navy (already 8.2:1 on white = OK) | LOW | LOW | Confirmed ratio; no change to palette tokens. |
| Migration breaks legacy aliases (`--elab-navy` etc.) | LOW | HIGH | D4 preserves all aliases; tested in Step 8. |
| Vitest regression from CSS changes via snapshot tests | LOW | MED | CSS modules don't break vitest snapshots typically; `git stash + vitest` pre/post per iter 14 commit. |
| Scope creep mid-iter | HIGH | HIGH | This spec defines hard stop at Step 1-8; out-of-scope flagged early. |

## §10 Verification per CoV

When iter 14 complete:
1. `grep -rn "font-size:\s*\([0-9]\|1[0-3]\)px" src/ --include="*.css" | grep -v ".module.css" | wc -l` → expected 0 in primary surface (excluding decorative/diagnostic exemptions list).
2. `grep -rn "fontSize:\s*['\"]\?\([0-9]\|1[0-3]\)" src/ --include="*.jsx" | grep -v "admin/" | grep -v "dev/" | wc -l` → expected 0.
3. `grep -rnE "(min-(width|height)):\s*([0-3][0-9]|4[0-3])px" src/ --include="*.css" | wc -l` → expected ≤30 (decorative-only residue).
4. Stylelint clean: `npx stylelint "src/**/*.css"` exit 0.
5. Visual regression: `npx playwright test tests/visual/` PASS within ±2% delta.
6. Vitest: `npx vitest run` ≥12599 PASS preserved.
7. Build: `npm run build` PASS unchanged.

## §11 Out-of-scope iter 14 (defer to iter 15+)

- Dark mode preview / motion preferences alternate themes.
- Dynamic font-size scaling per user preference (root-em zoom 0.85/1.0/1.15).
- RTL/Arabic typography (no plan).
- Reading-rule line-length max-width 65ch enforcement (could be added cheaply iter 14, marked optional).

## §12 Honesty caveats

1. The 22-28px LIM 3m readability target is *recommendation* informed by Sloan optometric tables; not legally mandated. Andrea/Tea may push back lower (18-20px body) — spec preserves option in step 1 token values (Andrea decides 16 vs 18 base before Step 2 ship).
2. ~60% of 1192 JSX `fontSize` violations are intentional regola-8-compliant 14 — they are migration *targets* not *bugs*. Iter 14 reframes as a baseline shift, not a bug-fix sweep.
3. AAA 7:1 for primary CTA is gravy — current Navy on white is already 8.2:1 = passes AAA without lift; spec just *enforces* it (forbid inversion).
4. Codemod step 4 effort ~3-5h Opus + manual review ~3h. Touch step 5 is purely manual ~6h Opus. Total iter 14 25-30h.
5. No Playwright run iter 13 (env not configured); Step 6 deferred iter 14 setup.

— design-opus iter 13 D2 atom, 2026-04-28.
