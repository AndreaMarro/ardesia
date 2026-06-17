---
sprint: S
iter: 14 (proposed)
atom: D4
date: 2026-04-28
author: design-opus iter 13
mandate: PROPOSE-ONLY iter 13
loc_estimate: ~250
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.3 D4
depends_on: docs/audits/2026-04-28-iter-13-design-D1-raw-signals-audit.md (token leak findings)
sibling: docs/specs/2026-04-28-iter-14-LIM-legibility-typography-spec.md (D2 typography)
---

# D4 — Design tokens canonical extraction spec

## §1 Goal
Extract design tokens from `src/styles/design-system.css` (493 LOC mixed tokens + utility) into a canonical, single-purpose `src/styles/design-tokens.css` (proposed ~150 LOC pure tokens). Backward-compat preserved via aliases. Linted via stylelint forbidding hardcoded values in component CSS modules.

## §2 Current state inventory

`src/styles/design-system.css` 493 LOC contains:
- L14-348 — `:root` block ~330 LOC tokens (palette, neutrals, typography, spacing, borders, shadows, transitions, glassmorphism, z-index, touch, simulator-scoped, button states, gray scale, error/diagnostic, wire mode, overlays, code editor, syntax highlighting, volume gradients, blockly, chat, animations, neutral aliases, responsive notes).
- L354-383 — `.elab-simulator` scoped overrides (29 LOC).
- L389-465 — accessibility blocks (skip-to-content, focus-visible, reduced-motion, sr-only) (~75 LOC).
- L467-493 — utility classes (`.u-flex`, `.u-pointer`, etc.) (~25 LOC).
- L1-13 — header comments.

**Issues**:
1. Tokens + utility classes share file → can't import-only-tokens for stylelint pre-processing.
2. Token vocabulary is rich but adoption is partial — components leak hardcoded values (DashboardShell.module.css line 12,32,75,88,96 per D3.2 §7).
3. No formal contract/lint enforcing token usage.
4. Backward-compat aliases at end (L310-348) work but obscure canonical intent.
5. No documentation outside this audit on which token to use when.

## §3 Proposed structure — `src/styles/design-tokens.css` (NEW)

```
/* ELAB Tutor — Canonical Design Tokens v1
 * Single source of truth for ALL design primitives.
 * Inputs from CLAUDE.md §16/§17 + .impeccable.md + iter 14 D2 LIM legibility spec.
 * Consumers: imported by globals.css; referenced via var(--*) in all CSS modules.
 * Lint: stylelint declaration-property-value-disallowed-list forbids hardcoded values.
 */

:root {
  /* ──────────────────────────────────────────────────────────── */
  /* PALETTE — Volumes + Brand (CLAUDE.md regola 16)              */
  /* ──────────────────────────────────────────────────────────── */
  --color-primary:           #1E4D8C;  /* Navy — UNLIM brand + heading */
  --color-primary-hover:     #163A6B;
  --color-primary-light:     #E8EEF6;
  --color-primary-subtle:    rgba(30, 77, 140, 0.06);
  --color-accent:            #4A7A25;  /* Lime — Vol 1 */
  --color-accent-hover:      #3E6B1F;
  --color-accent-light:      #E8F5E9;
  --color-vol1:              #4A7A25;
  --color-vol2:              #E8941C;  /* Orange — Vol 2 */
  --color-vol2-text:         #996600;  /* Orange darkened, AA 4.94:1 on white */
  --color-vol3:              #E54B3D;  /* Red — Vol 3 */
  --color-vol3-text:         #C62828;  /* Red darkened, AA 7.1:1 on white */
  --color-danger:            #DC2626;
  --color-warning:           #EA580C;
  --color-success:           #16A34A;

  /* ──────────────────────────────────────────────────────────── */
  /* NEUTRALS                                                     */
  /* ──────────────────────────────────────────────────────────── */
  --color-bg:                #FFFFFF;
  --color-bg-secondary:      #F7F7F8;
  --color-bg-tertiary:       #ECECF1;
  --color-bg-canvas:         #F0F2F5;
  --color-border:            #E5E5EA;
  --color-border-hover:      #D1D1D6;
  --color-text:              #1A1A2E;
  --color-text-secondary:    #5A5A6B;  /* AA 4.6:1 */
  --color-text-tertiary:     #5A5A69;  /* AA 4.5:1 */
  --color-text-inverse:      #FFFFFF;
  --color-text-muted:        #475569;  /* AA 5.5:1 on F0F4F8 */

  /* ──────────────────────────────────────────────────────────── */
  /* TYPOGRAPHY (CLAUDE.md regola 17 + D2 LIM-targeted)           */
  /* ──────────────────────────────────────────────────────────── */
  --font-sans:    'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 'Oswald', -apple-system, sans-serif;
  --font-display: 'Oswald', 'Arial Narrow', Arial, sans-serif;
  --font-mono:    'Fira Code', 'SF Mono', 'Consolas', monospace;

  /* Font-size scale (rem-based, root 16px) — iter 14 D2 LIM-tuned */
  --font-size-label: 0.875rem;  /* 14px — minimum allowed (regola 8) */
  --font-size-xs:    0.875rem;  /* 14px — secondary label */
  --font-size-sm:    1.000rem;  /* 16px — body LIM-front-class */
  --font-size-base:  1.125rem;  /* 18px — body comfortable */
  --font-size-md:    1.250rem;  /* 20px — body emphasized */
  --font-size-lg:    1.375rem;  /* 22px — subtitle */
  --font-size-xl:    1.750rem;  /* 28px — H2 */
  --font-size-2xl:   2.250rem;  /* 36px — H1 */
  --font-size-3xl:   3.000rem;  /* 48px — display LIM hero */
  --font-size-code:  1.000rem;  /* 16px — Fira Code */

  --line-height-tight:  1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.65;

  --font-weight-normal:    400;
  --font-weight-medium:    500;
  --font-weight-semibold:  600;
  --font-weight-bold:      700;

  /* ──────────────────────────────────────────────────────────── */
  /* SPACING — 4px grid                                           */
  /* ──────────────────────────────────────────────────────────── */
  --space-0:  0px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-1-5: 6px;   /* half-step (Tailwind convention) */
  --space-2-5: 10px;

  /* ──────────────────────────────────────────────────────────── */
  /* RADII                                                        */
  /* ──────────────────────────────────────────────────────────── */
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* ──────────────────────────────────────────────────────────── */
  /* SHADOWS                                                      */
  /* ──────────────────────────────────────────────────────────── */
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md:  0 4px 8px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg:  0 10px 20px rgba(0, 0, 0, 0.07), 0 4px 8px rgba(0, 0, 0, 0.03);
  --shadow-xl:  0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
  --shadow-focus:        0 0 0 3px rgba(30, 77, 140, 0.15);
  --shadow-focus-accent: 0 0 0 3px rgba(124, 179, 66, 0.15);

  /* ──────────────────────────────────────────────────────────── */
  /* TRANSITIONS                                                  */
  /* ──────────────────────────────────────────────────────────── */
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
  --transition-spring: 300ms cubic-bezier(0.16, 1, 0.3, 1);

  /* ──────────────────────────────────────────────────────────── */
  /* TOUCH TARGETS (D2 LIM-tuned)                                 */
  /* ──────────────────────────────────────────────────────────── */
  --touch-primary:    56px;  /* LIM-front-class CTA */
  --touch-secondary:  44px;  /* iPad student / regola 9 minimum */
  --touch-decorative: 28px;  /* icon-inside-button (parent must be primary/secondary) */
  --touch-spacing-min: 8px;

  /* ──────────────────────────────────────────────────────────── */
  /* Z-INDEX SCALE                                                */
  /* ──────────────────────────────────────────────────────────── */
  --z-base:     1;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
  --z-max:      9999;

  /* ──────────────────────────────────────────────────────────── */
  /* GLASSMORPHISM                                                */
  /* ──────────────────────────────────────────────────────────── */
  --glass-bg:     rgba(255, 255, 255, 0.88);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur:   blur(12px);
  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

Total: ~150 LOC pure tokens. Excludes: utility classes, accessibility blocks, simulator-scoped overrides, button-state shades, blockly/scratch theme, syntax highlighting (those move to feature-scoped CSS module — `src/styles/design-tokens-extended-{simulator,blockly,chat,code-editor}.css` if needed for opt-in tree-shake).

## §4 Backward-compat aliases (separate file)

`src/styles/design-tokens-aliases.css` (~50 LOC) — preserves all legacy `--elab-*` and `--bg-*` `--text-*` aliases referenced today. Imported AFTER design-tokens.css. Allows incremental component migration.

```
:root {
  --elab-navy:        var(--color-primary);
  --elab-navy-dark:   var(--color-primary-hover);
  --elab-lime:        var(--color-accent);
  --elab-lime-dark:   var(--color-accent-hover);
  --elab-orange:      var(--color-vol2);
  --elab-red:         var(--color-danger);
  --elab-bg:          var(--color-bg-secondary);
  --elab-card:        var(--color-bg);
  --elab-text:        var(--color-text);
  --elab-muted:       var(--color-text-secondary);
  --elab-border:      var(--color-border);
  --elab-radius:      var(--radius-lg);
  --elab-shadow:      var(--shadow-sm);
  --elab-transition:  var(--transition-base);
  --bg-app:           var(--color-bg-secondary);
  --bg-sidebar:       var(--color-bg);
  --bg-canvas:        var(--color-bg-canvas);
  --bg-panel:         var(--color-bg);
  --bg-input:         var(--color-bg-secondary);
  --text-dark:        var(--color-text);
  --text-body:        var(--color-text);
  --text-secondary:   var(--color-text-secondary);
  --text-muted:       var(--color-text-tertiary);
  --text-light:       var(--color-text-inverse);
  --border-light:     var(--color-border);
  --border-medium:    var(--color-border-hover);
  --border-strong:    var(--color-border-strong);
  --font-body:        var(--font-sans);
  --font-code:        var(--font-mono);
  /* ...continue all aliases from design-system.css L310-348 */
}
```

## §5 Migration plan iter 14

### Step 1 — Ship NEW files
- `src/styles/design-tokens.css` (~150 LOC pure tokens, this spec §3)
- `src/styles/design-tokens-aliases.css` (~50 LOC backward-compat, §4)
- `src/styles/design-tokens-extended.css` (~120 LOC simulator/blockly/chat/syntax/buttons specialized) — extracted from current design-system.css L150-310.

### Step 2 — `src/styles/globals.css` imports tokens
Add at top: `@import './design-tokens.css'; @import './design-tokens-aliases.css';` THEN remaining utility classes + accessibility blocks remain in design-system.css (renamed to `globals-utility.css` optional iter 15).

### Step 3 — Codemod hardcoded values to tokens
`scripts/codemod/css-tokenize.mjs` — search/replace per file:
- `font-size: 12px` → `font-size: var(--font-size-xs)` (lifts to 14px)
- `font-size: 13px` → `font-size: var(--font-size-xs)` (lifts to 14px)
- `font-size: 14px` → `font-size: var(--font-size-sm)` (lifts to 16px LIM)
- `font-size: 0.875rem` → `font-size: var(--font-size-sm)` (lifts to 16)
- `min-height: 36px` interactive → `min-height: var(--touch-secondary)` (lifts to 44)
- `min-height: 44px` interactive in primary → `min-height: var(--touch-primary)` (lifts to 56)
- `border-radius: 8px` → `border-radius: var(--radius-md)` (10)
- color hex literals → `var(--color-*)` mapping (manual review per file)

Diff pre-merge per CSS module file. ~70 module.css files modified. ~100 commits squashable.

### Step 4 — stylelint enforcement (NEW `.stylelintrc.cjs`)

```javascript
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'declaration-property-value-disallowed-list': {
      'font-size': [
        '/^[0-9]+px$/',                  // forbid 12px, 14px etc.
        '/^[0-1]?\\.?[0-9]+rem$/',       // forbid 0.875rem, 1rem etc. (force token)
      ],
      'min-height': [/^[0-3][0-9]px$/],  // forbid <40px
      'min-width':  [/^[0-3][0-9]px$/],
    },
    'color-no-hex': true,                // force color tokens (warning only iter 14)
  },
  ignoreFiles: [
    'src/styles/design-tokens*.css',
    'src/styles/globals*.css',
    'node_modules/**',
  ],
};
```

`npm run lint:css` → `stylelint "src/**/*.css"` exit 0 = D4 success metric.

### Step 5 — Conformance test (NEW `tests/unit/design-tokens.test.js`)

```javascript
import { readFileSync } from 'fs';
import { glob } from 'glob';

describe('design tokens conformance', () => {
  test('no hardcoded font-size in CSS modules', async () => {
    const files = await glob('src/components/**/*.module.css');
    for (const f of files) {
      const content = readFileSync(f, 'utf-8');
      const violations = content.match(/font-size:\s*\d+px/g) || [];
      expect(violations, `hardcoded font-size in ${f}`).toEqual([]);
    }
  });

  test('no hex color literals in CSS modules', async () => { /* similar */ });
  test('no min-height < 44px in CSS modules', async () => { /* similar */ });
});
```

### Step 6 — Documentation
NEW `docs/design-tokens.md` (~150 LOC) — token reference + adoption guide for collaborators.

## §6 Iter 14 LOC + effort estimate

| Task | LOC | Effort (Opus) |
|------|----:|--------------:|
| design-tokens.css NEW | 150 | 1h |
| design-tokens-aliases.css NEW | 50 | 0.5h |
| design-tokens-extended.css NEW (split simulator/blockly/chat/syntax) | 120 | 1.5h |
| globals.css/design-system.css refactor | 100 (delete) | 1h |
| Codemod ~70 module.css files | 0 src LOC; ~80 LOC codemod script | 4h codemod + 4h manual review |
| stylelint config NEW | 30 | 0.5h |
| design-tokens.test.js NEW | 80 | 1h |
| docs/design-tokens.md | 150 | 2h |
| **Total D4 iter 14** | **~530 LOC NEW + 100 deleted + 80 codemod** | **~15h Opus** |

## §7 Success criteria iter 14

1. `src/styles/design-tokens.css` exists, ≥150 LOC pure tokens.
2. `src/styles/design-tokens-aliases.css` exists, all legacy aliases preserve.
3. `npx stylelint "src/**/*.css"` exit 0 — zero hardcoded font-size/min-height/min-width <44.
4. `npx vitest run tests/unit/design-tokens.test.js` PASS — conformance enforced.
5. `npx vitest run` ≥12599 (no broader regression).
6. `npm run build` PASS unchanged.
7. Visual regression Playwright LIM 1080p + 4K diff ≤2% (sibling D2).

## §8 Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Codemod misfires on `font-size: var(--something)` legitimate | LOW | LOW | Codemod only matches hardcoded `\d+px` or rem literal |
| Backward-compat alias broken — legacy CSS module lookup fails | MED | HIGH | Step 1 ships aliases file BEFORE migration |
| stylelint blocks valid usage (e.g. simulator-scoped specialized values) | MED | MED | `ignoreFiles` and inline `/* stylelint-disable */` exemptions for declared cases |
| New conformance test FLAKY due to timing | LOW | LOW | Sync filesystem read; not async-ratched |
| Performance regression: extra CSS file imports add ~5KB (3 files now) | LOW | LOW | Vite bundles inline; no perf cost |

## §9 Out-of-scope iter 14 (defer iter 15+)

- Token theme variants (dark mode, high-contrast mode).
- CSS-in-JS migration (keep CSS Modules + inline tokens).
- Design system documentation Storybook.
- Stylelint warning → error promotion (start warning iter 14 to ease migration; promote error iter 15).

## §10 Honesty caveats

1. The 493-LOC source `design-system.css` includes 200+ LOC simulator-specific tokens that may not need to be in primary `design-tokens.css` — split saves bundle size only if components don't all import the bundle (Vite tree-shake CSS limited; effective only if CSS modules opt-in).
2. Codemod step 3 effort 4+4h is OPTIMISTIC — real-world ~70 module files with edge cases likely takes 8-12h Opus.
3. Stylelint rules set conservative iter 14; tightening iter 15+.
4. Backward-compat aliases preserved 1:1 from existing — no semantic change.
5. No iter 13 ship of design-tokens.css — only this spec doc. Andrea/Tea ratify before iter 14.
6. Conformance test §5 is a starting point — real test suite needs more coverage (color, spacing, etc.).
7. Migration assumes all CSS Modules are Vite-imported correctly — no globals leak into `<style>` tag external CSS files (we have one: `ElabSimulator.css`, `tutor-responsive.css`, `TutorTools.css`, `ElabTutorV4.css` — non-module imports). Those need migration too, separate atom iter 14.
8. Spec preserves legacy `--touch-min: 56px` design-system.css:139 intent — RENAMED `--touch-primary` for clarity. Aliases preserve `--touch-min` available.
9. iter 14 effort 15h is design-tokens-only; combined with D2 typography migration ~25-30h additional = total ~40-45h iter 14 design pass.
10. design-tokens.css proposed file CAN be shipped iter 13 with ZERO src/ touch since it would be a NEW file — BUT contract mandates DOC ONLY, so even adding new file is deferred to iter 14 per anti-regression rule.

— design-opus iter 13 D4 atom, 2026-04-28.
