# QUALITY AUDIT — Session 81

**Date**: 2026-03-07
**Scope**: Post-Scratch Parity (S81) — full codebase audit
**Build**: `npm run build` — 0 errors, 1m 26s

---

## SCORE CARD

| Metrica | Valore | Target | Status |
|---------|--------|--------|--------|
| Font < 14px (CSS) | **2** | 0 | FAIL |
| Font < 14px (JSX string) | **267** | 0 | FAIL |
| Font < 14px (JSX numeric) | **99** | 0 | FAIL |
| **Font total (real violations)** | **368** | 0 | **FAIL** |
| Font legitimate exceptions (PDF/SVG) | 31 | — | OK |
| Touch targets < 44px | **47** | 0 | FAIL |
| Small padding (< 5px) | **120** | — | WARN |
| Bundle main (index) | 672 KB | < 1200 KB | **PASS** |
| Bundle largest (ScratchEditor) | 2096 KB | — | WARN |
| Bundle ElabTutorV4 | 1047 KB | < 1200 KB | **PASS** |
| Chunks > 1000 KB | 3 | 0 | FAIL |
| console.* statements | **27** | 0 | FAIL |
| console.* files affected | 8 | 0 | FAIL |
| Build time | 86s | < 120s | **PASS** |
| Build errors | 0 | 0 | **PASS** |
| WCAG contrast PASS | **4/8** | 8/8 | FAIL |
| WCAG contrast FAIL | **4/8** | 0/8 | FAIL |

### Overall: 5/11 PASS, 6/11 FAIL

---

## 1. FONT SIZE AUDIT (< 14px)

### Summary: 368 real violations across 46 files

**CSS violations (2)**:
- `ElabSimulator.css:118` — `font-size: 10px`
- `ElabSimulator.css:159` — `font-size: 13px`

**Heaviest offenders (JSX)**:
- `VetrinaSimulatore.jsx` — 15+ violations (10px, 11px, 12px, 13px)
- `AdminPage.jsx` — 10+ violations
- `TeacherDashboard.jsx` — 10+ violations
- `Navbar.jsx` — 8+ violations (11px, 12px)
- `ChatOverlay.jsx` — 8+ violations
- `CodeEditorCM6.jsx` — 6+ violations
- `ComponentDrawer.jsx` — 6+ violations
- `ComponentPalette.jsx` — 5+ violations
- Admin gestionale modules — 50+ violations total across 14 files

**Legitimate exceptions (31)** — NOT counted as violations:
- `SessionReportPDF.jsx` (21) — PDF rendering at 72dpi via react-pdf
- `ReportService.jsx` (9) — Gestionale PDF reports
- `Annotation.jsx` (1) — SVG canvas text label

---

## 2. TOUCH TARGET AUDIT

### Summary: 47 elements with height/minHeight < 44px across 20 files

**Simulator**:
- `ElabSimulator.css` — 2 violations
- `WhiteboardOverlay.jsx` — 4 violations

**Tutor**:
- `ChatOverlay.jsx` — 9 violations (input fields, buttons)
- `ElabTutorV4.css` — 7 violations
- `TutorTools.css` — 3 violations
- `tutor-responsive.css` — 3 violations

**Admin**:
- `AdminPage.jsx` — 2 violations
- `AdminDashboard.jsx` — 2 violations
- `AdminUtenti.jsx` — 2 violations
- Various gestionale modules — 8 violations

**Other**:
- `ErrorBoundary.jsx` — 2 violations
- `ConsentBanner.jsx` — 1 violation
- `Navbar.jsx` — 1 violation

---

## 3. BUNDLE SIZE AUDIT

### Chunks > 500 KB (sorted by size):

| Chunk | Size | Gzip |
|-------|------|------|
| ScratchEditor | 2,096 KB | 939 KB |
| react-pdf.browser | 1,486 KB | 497 KB |
| ElabTutorV4 | 1,047 KB | 244 KB |
| index (main) | 672 KB | 303 KB |
| mammoth | 500 KB | 130 KB |
| codemirror | 474 KB | 156 KB |

**3 chunks exceed 1000 KB warning** — ScratchEditor is already lazy-loaded (React.lazy), react-pdf is on-demand, ElabTutorV4 could benefit from splitting.

---

## 4. CONSOLE STATEMENT AUDIT

### Summary: 27 statements across 8 files

| File | Count | Type |
|------|-------|------|
| ElabTutorV4.jsx | 8 | warn, error, log |
| NewElabSimulator.jsx | 1 | error |
| CircuitSolver.js | 1 | warn |
| ScratchEditor.jsx | 2 | error |
| codeProtection.js | 1 | warn |
| AuthContext.jsx | 2 | warn (DEV only) |
| logger.js | 4 | log, warn, error (utility) |
| gdprService.js | 8 | error, warn |

**Note**: `AuthContext.jsx` console.warn is gated behind `import.meta.env.DEV` — acceptable. `logger.js` is the logging utility itself. `gdprService.js` uses console for privacy-related warnings. Most `console.error` calls are legitimate error handlers.

**Real cleanup candidates**: `ElabTutorV4.jsx` console.log statements (non-error).

---

## 5. WCAG CONTRAST AUDIT

### Passing (4/8):

| Combination | Ratio | Normal | Large |
|-------------|-------|--------|-------|
| Navy `#1E4D8C` on White | **8.42:1** | PASS | PASS |
| Text Primary `#1A2B4A` on White | **14.11:1** | PASS | PASS |
| Light `#C9D1D9` on Dark BG `#1E2530` | **9.99:1** | PASS | PASS |
| Navy `#1E4D8C` on Toolbar `#F0F4FF` | **7.65:1** | PASS | PASS |

### Failing (4/8):

| Combination | Ratio | Normal | Large | Fix |
|-------------|-------|--------|-------|-----|
| White on Lime `#7CB342` | **2.50:1** | FAIL | FAIL | Use dark text or darken to ~#4E7A25 |
| White on Vol2 Orange `#E8941C` | **2.42:1** | FAIL | FAIL | Use dark text or darken to ~#B5700A |
| White on Vol3 Red `#E54B3D` | **3.88:1** | FAIL | PASS | Darken to ~#C22E20 for normal text |
| Text Muted `#8899AA` on White | **2.92:1** | FAIL | FAIL | Darken to ~#6B7A8D |

**Critical**: White text on Lime/Orange buttons fails even the relaxed large-text threshold. These are high-frequency UI elements (volume badges, CTA buttons).

---

## RECOMMENDATIONS (Priority Order)

### P0 — Accessibility Blockers
1. **Fix WCAG contrast on Lime/Orange/Red buttons** — Use dark text (Navy) on colored backgrounds, or darken the background colors
2. **Fix Text Muted contrast** — Darken `#8899AA` → `#6B7A8D` or darker

### P1 — Font Size Cleanup
3. **Establish 14px minimum** — Add CSS custom property `--font-min: 14px` in design-system.css
4. **Fix simulator fonts** — ElabSimulator.css 10px/13px, CodeEditorCM6, ComponentPalette, ComponentDrawer
5. **Fix tutor fonts** — ChatOverlay, Navbar (11px/12px labels)
6. **Fix VetrinaSimulatore** — 15+ inline fontSize under 14px

### P2 — Touch Targets
7. **ChatOverlay buttons** — 9 elements under 44px min-height
8. **ElabTutorV4.css** — 7 interactive elements under 44px
9. **Admin panels** — Various small buttons/inputs

### P3 — Bundle & Code Quality
10. **Console cleanup** — Remove non-error console.log from ElabTutorV4.jsx
11. **ElabTutorV4 chunk splitting** — 1047 KB could be split (chat overlay, tools, games as sub-chunks)

---

*Quality Audit S81 — Andrea Marro, 07/03/2026*
