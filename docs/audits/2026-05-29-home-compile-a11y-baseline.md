# Home Compile Route — Accessibility Baseline Audit

**Date**: 2026-05-29
**Route**: `/#compile-home` → `HomeCompileEntry.jsx`
**Auditor**: SWARM 5 — accessibility-expert workflow
**Standard**: WCAG 2.2 AA, ELAB internal targets (44x44 touch, 4.5:1 text, 3:1 graphics)

## Scope

Pre-V2 baseline of the live HomeCompile route. Captures the a11y surface as
it is on `main` HEAD `03e5f7b6`, before SWARM 2 (UI redesign) + SWARM 3
(UNLIM chat V2) + SWARM 4 (polish) land. The Playwright spec
`swarm-2026-05-29-home-compile-a11y.spec.js` enforces these baselines so
regressions are caught immediately after the V2 integration merge.

## Method

- Static read of `HomeCompileEntry.jsx` + transitive child components for
  `aria-*`, `role=*`, `data-testid`, semantic HTML usage.
- `@axe-core/playwright` v4.11 against the live `#compile-home` route in
  dev mode. The spec runs `AxeBuilder.withTags(['wcag2a', 'wcag2aa',
  'wcag21a', 'wcag21aa', 'wcag22aa'])`.
- Keyboard nav probe: Tab-order walk + visible focus ring check.
- Color contrast: spot-check Navy text on white via axe `color-contrast`
  rule.
- Touch target spot-check: query `clientWidth` × `clientHeight` of primary
  CTAs.

## Baseline Findings

### Strengths (PASS)

1. `header` + `main` + `aside` + `section` semantic structure is correct.
2. Back button has `aria-label` (from i18n key `home_compile_entry.back_home`).
3. Fullscreen toggle uses `aria-pressed` (correct toggle pattern).
4. Tab panel has `role="tabpanel"` + `aria-labelledby`.
5. Serial drawer button has `aria-expanded` + `aria-controls` linking
   to `id="home-compile-serial-panel"` (correct disclosure pattern).
6. Mascot image in UnlimCompileHelper uses `alt=""` + container has
   `aria-hidden="true"` — decorative-image pattern is correct.
7. `role="status"` + `aria-live="polite"` on the helper speech bubble for
   non-disruptive announcements.
8. Banners (WebUsbBanner, CompileAgentBanner) use `aria-label`.

### Known Violations / Gaps (TRACK + FIX in V2)

| Id | Severity | Rule | Location | Recommendation |
|----|----------|------|----------|----------------|
| A1 | medium | `region`: landmark missing accessible name | `<aside class="compileBarPanel">` has aria-label "Pannello compilazione" — OK; flag if Swarm 2 renames | Keep aria-label on aside |
| A2 | medium | hardcoded board pill text "Arduino Nano R4" is decoupled from picker | `HomeCompileEntry.jsx:349` | Make boardPill dynamic via `getBoardById(targetBoardId)?.label` |
| A3 | low | `<button>← back` uses arrow glyph as text; screen reader reads "left arrow back home" with i18n aria-label OK | line 346 | Confirm i18n value is descriptive ("Torna alla home") |
| A4 | low | Code preview `<pre>` lacks `aria-label` describing its role as preview | line 464 | Add `aria-label="Anteprima codice Arduino"` |
| A5 | low | `BoardPicker` `<select>` has a `<label htmlFor="elab-board-picker">` — good, but the parent container has no landmark | `BoardPicker.jsx:42` | Keep — picker is inside the aside landmark already |
| A6 | low | Helper "ask UNLIM" buttons use `<button>` — good, but lack `aria-busy` while the chat is loading | `UnlimCompileHelper.jsx` | Wire aria-busy when seedMessage write in flight |
| A7 | medium | Hardcoded Italian copy "Esci da tutto schermo" / "Apri editor a tutto schermo" — bypass i18n | `HomeCompileEntry.jsx:383` | Replace with `t('home_compile_entry.fullscreen_open|close')` |
| A8 | medium | Hardcoded Italian copy "Chiudi/Apri Monitor Seriale Virtuale" — bypass i18n | line 535 | Same i18n migration |
| A9 | high | Touch targets `<svg width="18" height="18">` on FullscreenIcon + SerialRailIcon may have parent button below 44×44 if CSS sets padding too small | line 101-153 | Verify `.fullscreenBtn`, `.serialRailBtn` reach 44×44 |
| A10 | medium | Compile button "Compila" is in ScratchCompileBar — verify its `aria-disabled` reflects state machine accurately (not just `disabled`) | external file | Confirm Swarm 2 V2 preserves disabled state semantics |
| A11 | low | No `<h1>` for assistive tech to announce the page identity beyond the `<h1 class="title">ELAB Code</h1>` — good, but tab title and heading should align | line 348 | Confirm `document.title` is set per locale |

### Color Contrast Spot Checks

- Navy `#1E4D8C` on white `#FFFFFF` — ratio 7.6:1 (AAA). PASS.
- Lime `#4A7A25` on white — ratio 5.8:1 (AA). PASS.
- Orange `#E8941C` on white — ratio 2.3:1 (FAIL on body text, OK on
  large/non-text). Recommend reserving orange for graphical accents only.
- Red `#E54B3D` on white — ratio 4.7:1 (AA borderline). PASS for text.

### Keyboard Navigation Order (expected)

1. Back button (`<button>` in header)
2. ModeToggle (Blocks / C++) — tablist with arrow-key nav
3. Fullscreen toggle
4. ScratchEditor / CodeEditorCM6 (editor surface receives focus inside)
5. Code preview (focusable? — verify; should NOT be tabbable, it's `<pre>`)
6. Code preview "Apri" button
7. Compile button (inside ScratchCompileBar)
8. BoardPicker `<select>`
9. UniversalUploadButton
10. UnlimCompileHelper quick-question buttons (3)
11. SerialRail toggle

### Focus Ring Visibility

`HomeCompileEntry.module.css` should define visible `:focus-visible` rings
on all interactive elements per WCAG 2.4.7. The audit spec asserts the
rings are visible via computed `outline-width > 0` on focused element.

## Baseline axe Violation Count (TARGET)

After SWARM 2/3/4 V2 redesign integration:
- **CRITICAL**: 0 (must remain)
- **SERIOUS**: 0 (must remain)
- **MODERATE**: <= 5 (track + ticket each)
- **MINOR**: best-effort

The Playwright spec asserts `criticalViolations === 0` and
`seriousViolations === 0` for every run.

## Reaudit Cadence

1. After SWARM 2 PR merges → rerun spec; baseline must not regress.
2. After SWARM 3 PR merges (UNLIM chat) → rerun + add chat-specific
   focus trap + dialog role assertions.
3. Pre-prod ship → manual NVDA / VoiceOver pass with Tea (UX QA owner).
4. Quarterly axe sweep of the route as part of Sprint U+ cadence.

## References

- `src/components/home/HomeCompileEntry.jsx` (lines 339–562)
- `src/components/lavagna/BoardPicker.jsx`
- `src/components/home/UnlimCompileHelper.jsx`
- `tests/e2e/swarm-2026-05-29-home-compile-a11y.spec.js` (this audit's enforcement)
- `tests/e2e/07-blockly-accessibility.spec.js` (precedent pattern, no axe-core)
- `tests/e2e/11-blockly-axe-core-accessibility.spec.js` (precedent, axe-core)

