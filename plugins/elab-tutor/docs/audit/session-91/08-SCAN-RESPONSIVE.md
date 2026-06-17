# 08 — Responsive CSS Audit
**Data**: 2026-03-08 | **Stato**: DONE | **Bug Count**: 7

## Methodology
Code-based audit of all responsive CSS rules across:
- `ElabSimulator.css` (1112 lines)
- `layout.module.css`
- `overlays.module.css`
- `codeEditor.module.css`
- `design-system.css`

Visual testing was limited by Chrome extension constraints (window resize API failed on MacBook 1440x900 screen). iPad/mobile testing done via CSS analysis only.

## Bugs Found

| # | Sev | Area | Descrizione | Breakpoint | Impact |
|---|-----|------|-------------|-----------|--------|
| R1 | P2 | Layout/iPad | Code editor panel on iPad portrait has `height: 100dvh` — overlaps top navbar (44px) | 768-1023px | Editor covers top bar, loses navigation |
| R2 | P2 | Touch | Range slider track only 12px height vs 44px thumb | All | Kids miss slider on touch devices |
| R3 | P2 | Layout/iPad | Scratch panel width jumps 398px when crossing 1024px breakpoint | 1023→1024px | Jarring layout shift on iPad rotation |
| R4 | P3 | Font/WCAG | `.overflow-separator` at 0.65rem (~10.4px) violates 14px minimum | All | Unreadable on mobile |
| R5 | P3 | Layout/Mobile | Bottom panel has no max-height rule for <768px — default 200px may consume 50% of mobile screen | <768px | Pushes canvas out of view |
| R6 | P3 | Touch | Toolbar separator only 28px height (should be 44px or hidden) | All | Touch target below WCAG |
| R7 | P3 | Font | Watermark 10px, borderline illegible on iPad | All | Minor — decorative text |

## Breakpoint Coverage Matrix

| Breakpoint | Range | Score | Key Issues |
|------------|-------|-------|------------|
| Mobile Portrait | 0-599px | 6/10 | No bottom-panel max-height |
| Mobile Landscape | 600-767px | 7/10 | Clean stacking, minor touch gaps |
| iPad Portrait | 768-1023px | 5/10 | Code editor overlap, tight canvas, sidebar not responsive |
| iPad Landscape | 1024-1365px | 7/10 | Toolbar OK after S86 fix, label hiding works |
| Desktop | 1366px+ | 9/10 | Standard layout, no issues |

## Touch Target Compliance

| Element | Size | Status |
|---------|------|--------|
| `.toolbar-btn` | 44×44px | ✅ PASS |
| `.toolbar-separator` | 1×28px | ❌ FAIL (height) |
| `.toolbar-timer` icon | 14×14px | ⚠️ Container OK, icon small |
| Range slider thumb | 44×44px | ✅ PASS |
| Range slider track | 12px height | ❌ FAIL |
| `.closeBtn` (overlays) | 44×44px | ✅ PASS |
| `.collapsedBtn` (guide) | 44×44px | ✅ PASS |

## Font Size WCAG Compliance

| Selector | Size | Status |
|----------|------|--------|
| `.toolbar-btn__label` | 14px | ✅ |
| `.overflow-separator` | 10.4px | ❌ VIOLATION |
| `.elab-simulator__watermark` | 10px | ⚠️ Borderline |
| `.toolbar-timer` | 14px | ✅ |
| Code editor title | 14px | ✅ |
| Font size buttons | 14px | ✅ |
| Pin tooltip detail | 14px | ✅ (S76 fix) |

## Z-Index Hierarchy

| Layer | Element | Z-Index | Status |
|-------|---------|---------|--------|
| Canvas base | SVG elements | 20-80 | ✅ |
| Toolbar overflow | Menu dropdown | 100 | ✅ |
| Editor panel (iPad) | Code editor | 250 | ✅ |
| Chat/Galileo | Modal overlay | 400 | ✅ |
| Hints overlay | Tip cards | 1000 | ✅ |
| Max | Emergency modals | 9999 | ✅ |

**Note**: Main toolbar has NO explicit z-index (implicit). Recommend adding `z-index: 50`.

## Recommended Fix Priority

### P0 (Fix Immediately)
1. Code editor iPad portrait: Add `top: 44px` or `height: calc(100dvh - 44px)`
2. Range slider track: Increase from 12px to 24px
3. `.overflow-separator` font: Change 0.65rem → 0.875rem (14px)

### P1 (Fix Soon)
4. Bottom panel mobile: Add `max-height: min(120px, 20dvh)` for <768px
5. Scratch panel width: Smooth the 1023→1024px transition
6. Toolbar separator: Increase height to 40px
7. Toolbar explicit z-index: Add `z-index: 50`

### P2 (Polish)
8. Watermark: Increase to 12px or hide on <768px
9. Overflow menu: Account for notch/safe-area-inset on iPhone

## Overall Score: 6.8/10
Good coverage at desktop and large tablet sizes. iPad portrait and mobile have accumulating issues — mostly CSS-only fixes needed, no JS changes required.
