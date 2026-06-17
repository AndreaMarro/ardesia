# ELAB Quality Audit Report -- Wave Delta
## Date: 2026-02-13
## Auditor: Quality Agent (Opus 4.6)

---

### SCORE CARD

| # | Metrica | Valore | Target | Status |
|---|---------|--------|--------|--------|
| 1 | Font < 14px (CSS) | 94 | 0 | FAIL |
| 2 | Font < 14px (JSX inline) | 472 | 0 | FAIL |
| 3 | Touch < 44px (CSS) | 7 | 0 | FAIL |
| 4 | Bundle main chunk | 1,305 KB | < 1,000 KB | FAIL |
| 5 | Bundle total (all JS) | 2,373 KB | < 2,000 KB | FAIL |
| 6 | console.error calls | 83 | justified | WARN |
| 7 | console.warn calls | 19 | justified | WARN |
| 8 | console.log calls | 0 | 0 | PASS |
| 9 | Orphaned source files | 6 (~1,227 LOC) | 0 | FAIL |
| 10 | Unused npm dependencies | 14 | 0 | FAIL |
| 11 | aria-label usage | 13 | > 50 | FAIL |
| 12 | Color contrast (Lime) | 2.50:1 | >= 4.5:1 | FAIL |
| 13 | Color contrast (Navy) | 8.42:1 | >= 4.5:1 | PASS |
| 14 | ErrorBoundary components | 0 | >= 1 | FAIL |
| 15 | Components > 500 LOC | 32 | < 10 | FAIL |
| 16 | CSS methodology count | 4 | 1-2 | FAIL |
| 17 | try/catch blocks | 212 | adequate | PASS |
| 18 | htmlFor on labels | 1 | ~88 | FAIL |
| 19 | Build time | 3.07s | < 10s | PASS |
| 20 | Module count | 555 | - | INFO |

---

### 1. FONT SIZE AUDIT

**Total violations: 566** (94 CSS + 472 JSX inline)

#### CSS violations (94 occurrences across 8 files):

| File | Count | Worst offender |
|------|-------|---------------|
| ElabTutorV4.css | 59 | 0.6rem (9.6px) |
| TutorTools.css | 17 | 0.68rem (10.9px) |
| MessageBubble.css | 6 | 0.5625rem (9px) |
| DropZone.css | 4 | 0.5rem (8px) |
| ChatPanel.css | 3 | 0.6875rem (11px) |
| ElabSimulator.css | 1 | 10px (watermark) |
| index.css | 1 | 11px |
| design-system.css | 0 (all >= 14px) | - |

#### JSX inline violations (472 occurrences across ~30 files):

Top offenders by file:
- `TeacherDashboard.jsx`: ~50 violations (fontSize: 9-13)
- `StudentDashboard.jsx`: ~40 violations (fontSize: 9-13)
- `AdminPage.jsx`: ~35 violations (fontSize: 10-13)
- `ProfilePage.jsx`: ~20 violations (fontSize: 10-13)
- `GroupsPage.jsx`: ~25 violations (fontSize: 11-13)
- `PostCard.jsx`: ~18 violations (fontSize: 10-13)
- `Navbar.jsx`: ~12 violations (fontSize: 9-13)
- `OrdiniVenditeModule.jsx`: ~15 violations (fontSize: 10-13)
- `DipendentiModule.jsx`: ~20 violations (fontSize: 11-13)
- `FatturazioneModule.jsx`: ~18 violations (fontSize: 10-13)
- Simulator components (NES, OnboardingWizard, etc.): ~30 combined

**Note**: The `Watermark.jsx` uses fontSize: 9px which is intentional for decorative watermark text. The `ElabSimulator.css:142` 10px is also a watermark exception (annotated in code).

---

### 2. TOUCH TARGET AUDIT

**Total violations: 7** (CSS-only; JSX inline targets not systematically auditable)

| File:Line | Element | Size | Required |
|-----------|---------|------|----------|
| ChatPanel.css:143 | textarea | height: 24px | 44px |
| ChatPanel.css:168 | .attach-button, .send-button | height: 36px | 44px |
| ChatPanel.css:196 | .send-button svg | height: 18px | 44px |
| codeEditor.module.css:48 | serial input | min-height: 32px | 44px |
| ElabTutorV4.css:589 | .v4-page-nav button | height: 30px | 44px |
| ElabTutorV4.css:1848 | .v4-mascot (mobile) | 30x30px | 44px |

**Note**: Many buttons/links in JSX use inline styles without explicit height, relying on padding for sizing. These are not systematically verifiable but likely include additional sub-44px targets.

---

### 3. BUNDLE SIZE ANALYSIS

**Build: 555 modules, 3.07s**

| Chunk | Size | Gzip |
|-------|------|------|
| index-DlkLdFhf.js (main) | 1,305.50 KB | 330.74 KB |
| index-DDspMrrG.js | 498.49 KB | 129.63 KB |
| codemirror-j5nLyEll.js | 439.14 KB | 144.07 KB |
| avr-Cds7tnIi.js | 51.05 KB | 13.19 KB |
| index-Cds7tnIi.js | 51.05 KB | 13.19 KB |
| AVRBridge-DGwbFvoX.js | 12.69 KB | 4.00 KB |
| react-vendor-Bce9NwRC.js | 11.97 KB | 4.29 KB |
| avrWorker-DGbr2c9a.js | 4.54 KB | - |
| index-xHjkxbfR.css | 68.09 KB | 13.02 KB |
| **Total JS** | **2,374.43 KB** | **639.11 KB** |

**Issues**:
- Main chunk at 1,305 KB exceeds the 1,000 KB warning threshold
- The `index-DDspMrrG.js` (498 KB) likely contains admin/gestionale modules that could be lazy-loaded
- Total gzipped: 639 KB -- acceptable for a feature-rich SPA

---

### 4. CONSOLE STATEMENT AUDIT

| Type | Count | Classification |
|------|-------|---------------|
| console.error | 83 | Most are proper error handling in catch blocks |
| console.warn | 19 | Mix of legitimate warnings + debug traces |
| console.log | 0 | Clean -- all removed |
| console.info | 0 | Clean |
| console.debug | 0 | Clean |
| **Total** | **102** | |

**console.error breakdown** (83 total):
- Admin/Gestionale modules: 49 (all in catch blocks -- legitimate)
- Simulator engine (AVRBridge, NES): 9 (legitimate error handling)
- Tutor (ElabTutorV4): 6 (file loading errors -- legitimate)
- Services (user, student, license, socket, project): 8 (legitimate)
- Admin tabs (eventi, waitlist, community): 15 (legitimate)

**console.warn breakdown** (19 total):
- NewElabSimulator.jsx: 8 (debug traces for AVR lifecycle -- should be removed)
- AVRBridge.js: 5 (fallback/error warnings -- legitimate)
- userService.js: 2 (security downgrade -- legitimate)
- i18n.js: 2 (missing translations -- legitimate)
- SimulationManager.js: 1 (hex not loaded -- legitimate)
- pinComponentMap.js: 1 (LCD mapping incomplete -- legitimate)

**Recommendation**: Remove 8 console.warn from NES that are debug traces, not user-facing warnings.

---

### 5. DEAD CODE DETECTION

#### Orphaned source files (6 files):

| File | LOC | Notes |
|------|-----|-------|
| `src/components/chat/ChatPanel.jsx` | ~150 | Never imported -- was replaced by ChatOverlay? |
| `src/components/chat/DropZone.jsx` | ~110 | Never imported -- component palette replaced it? |
| `src/components/simulator/engine/SimulationManager.js` | 302 | **CRITICAL**: Imported dynamically but not by filename match. May be loaded at runtime. Needs verification. |
| `src/components/simulator/panels/BuildModeGuide.jsx` | 520 | Never imported -- obsolete guide panel |
| `src/locales/i18n.js` | ~65 | i18n system defined but never imported |
| `src/services/socketService.js` | ~80 | WebSocket service never imported |

**Note on SimulationManager.js**: Verified that `SimulationManager` is NOT imported anywhere in the codebase. It was documented in CLAUDE.md as an "orchestrator" but is never actually used. True orphan count: **6 files, ~1,227 LOC dead code**.

#### Unused npm dependencies (14 genuinely unused):

| Package | Status |
|---------|--------|
| @dnd-kit/core | Never imported |
| @dnd-kit/modifiers | Never imported |
| @dnd-kit/sortable | Never imported |
| @dnd-kit/utilities | Never imported |
| html-to-image | Never imported |
| katex | Never imported |
| lucide-react | Never imported |
| prismjs | Never imported |
| react-icons | Never imported |
| react-simple-code-editor | Never imported |
| react-to-print | Never imported |
| react-virtuoso | Never imported |
| react-window | Never imported |
| tailwind-merge | Never imported |

**Note**: `@codemirror/autocomplete` and `@codemirror/lint` are transitive deps of `codemirror` meta-package -- not truly unused. `mammoth` is dynamically imported in ElabTutorV4.jsx. Build tools (vite, postcss, autoprefixer, @vitejs/plugin-react, @tailwindcss/postcss, tailwindcss) are correctly in dependencies for Vercel builds.

---

### 6. ACCESSIBILITY QUICK CHECK

#### Images (14 `<img>` tags):
All 14 `<img>` tags have `alt` attributes. However:
- 5 use `alt=""` (empty alt) -- acceptable only for decorative images
- `PostCard.jsx:134` uses `alt=""` for user-uploaded images -- should have descriptive alt

#### ARIA attributes:
- **Total aria-label/labelledby/describedby: 13** across 7 files
- **Estimated interactive elements: 500+** (buttons, links, inputs across all components)
- **Coverage: ~2.6%** -- severely insufficient

#### Form labels:
- `<label>` elements: 88 total
- `<input/select/textarea>` elements: 236 total
- `htmlFor` associations: **1** (AdminEventi.jsx only)
- **Label-input association rate: 0.4%** -- nearly all labels are visual only, not programmatically associated

#### Color Contrast (WCAG AA -- 4.5:1 for normal text):

| Combination | Ratio | Normal Text | Large Text |
|-------------|-------|-------------|------------|
| Navy #1E4D8C on White | 8.42:1 | PASS | PASS |
| Lime #7CB342 on White | 2.50:1 | **FAIL** | **FAIL** |
| Navy #1E4D8C on Cream #FFF8E7 | 7.95:1 | PASS | PASS |
| Orange #E8941C on White | 2.42:1 | **FAIL** | **FAIL** |
| Red #E54B3D on White | 3.88:1 | **FAIL** | PASS |

**Critical**: Lime (#7CB342) is used extensively for buttons, badges, and success states. At 2.50:1 it fails even the large text threshold (3.0:1). Needs darkening to at least #558B2F (~4.6:1) for normal text.

---

### 7. COMPONENT SIZE AUDIT

**32 files exceed 500 LOC** (target: < 10)

| File | LOC | Status |
|------|-----|--------|
| experiments-vol1.js (data) | 2,636 | DATA -- OK |
| ElabTutorV4.jsx | 2,355 | NEEDS DECOMPOSITION |
| NewElabSimulator.jsx | 2,107 | NEEDS DECOMPOSITION |
| SimulatorCanvas.jsx | 1,830 | NEEDS DECOMPOSITION |
| CircuitSolver.js | 1,768 | ACCEPTABLE (engine) |
| experiments-vol2.js (data) | 1,395 | DATA -- OK |
| AdminEventi.jsx | 1,364 | NEEDS DECOMPOSITION |
| AdminUtenti.jsx | 1,289 | NEEDS DECOMPOSITION |
| AdminWaitlist.jsx | 1,275 | NEEDS DECOMPOSITION |
| AdminOrdini.jsx | 1,157 | NEEDS DECOMPOSITION |
| AdminCorsi.jsx | 1,088 | NEEDS DECOMPOSITION |
| MarketingClientiModule.jsx | 1,067 | NEEDS DECOMPOSITION |
| AVRBridge.js | 1,049 | ACCEPTABLE (engine) |
| BurocraziaModule.jsx | 989 | NEEDS DECOMPOSITION |
| AdminCommunity.jsx | 976 | NEEDS DECOMPOSITION |
| TeacherDashboard.jsx | 940 | NEEDS DECOMPOSITION |
| experiments-vol3.js (data) | 922 | DATA -- OK |
| GestionaleService.js | 883 | NEEDS DECOMPOSITION |
| ImpostazioniModule.jsx | 826 | NEEDS DECOMPOSITION |
| AdminDashboard.jsx | 821 | NEEDS DECOMPOSITION |
| StudentDashboard.jsx | 820 | NEEDS DECOMPOSITION |
| NanoR4Board.jsx | 818 | SVG -- OK |
| WireRenderer.jsx | 800 | NEEDS DECOMPOSITION |
| userService.js | 788 | NEEDS DECOMPOSITION |
| FatturazioneModule.jsx | 597 | WARN |
| api.js | 590 | WARN |
| BuildModeGuide.jsx | 520 | ORPHANED |
| CodeEditorCM6.jsx | 517 | WARN |
| Navbar.jsx | 514 | WARN |
| BreadboardFull.jsx | 512 | SVG -- OK |
| GestionaleForm.jsx | 510 | WARN |
| BreadboardHalf.jsx | 504 | SVG -- OK |

**Summary**: 16 components over 800 LOC need decomposition. 6 are data/SVG files (acceptable). CircuitSolver and AVRBridge are engine files (acceptable at their size).

---

### 8. DEPENDENCY CHECK

| Metric | Value |
|--------|-------|
| Total dependencies | 39 |
| devDependencies | 0 |
| Truly unused dependencies | 14 |
| Build tool deps (correct) | 6 |
| Dynamic import deps | 1 (mammoth) |
| Transitive deps | 2 (@codemirror/autocomplete, @codemirror/lint) |

**Security-sensitive dependencies**:
- `buffer` (polyfill) -- used for avr8js hex parsing
- `uuid` -- used only in socketService.js (which is orphaned)

**Bundle waste from unused deps**: The 14 unused deps are tree-shaken by Vite and do NOT appear in the final bundle. However they:
- Increase `npm install` time
- Increase `node_modules` size
- Create false positive security audit noise

---

### 9. CSS METHODOLOGY AUDIT

**4 different approaches in use** (target: 1-2):

| Approach | Count | Files |
|----------|-------|-------|
| Regular .css files | 8 | ElabTutorV4.css, TutorTools.css, ElabSimulator.css, ChatPanel.css, MessageBubble.css, DropZone.css, index.css, design-system.css |
| CSS Modules (.module.css) | 3 | codeEditor.module.css, overlays.module.css, layout.module.css |
| Inline styles (style={{}}) | ~4,156 occurrences | Across virtually all JSX files |
| Tailwind (@apply) | 3 directives | index.css only |

**Analysis**:
- **Inline styles dominate** with 4,156 occurrences -- this is the primary styling approach
- CSS Modules are used correctly in the simulator (3 files)
- Regular CSS files handle tutor, chat, and simulator layout
- Tailwind is barely used (3 `@apply` directives) despite being installed
- No CSS-in-JS libraries (styled-components, emotion) found

**Problem**: The massive inline style count makes the codebase hard to maintain. Style objects defined in component files (e.g., `const styles = {...}`) are better than raw inline but still mix concerns. The Tailwind installation adds ~60KB to build config with almost zero usage.

---

### 10. ERROR HANDLING AUDIT

#### try/catch blocks:
- **212 total** across 44 files
- Highest concentration: NewElabSimulator.jsx (22), ElabTutorV4.jsx (19), GestionaleService.js (13), api.js (12)

#### React Error Boundaries:
- **NONE** -- No `ErrorBoundary` component exists anywhere in the codebase
- A crash in any component will bring down the entire application
- This is a **critical gap** for a production application

#### API error handling:
- `src/services/api.js`: 12 try/catch blocks -- all API calls properly wrapped
- Error messages in Italian: most are (e.g., "Errore caricamento ordini")
- Some error messages are in English (AVRBridge, SimulationManager) -- inconsistent

#### User-facing error messages:
- Admin/Gestionale: All in Italian -- GOOD
- Simulator engine: Mixed Italian/English -- NEEDS FIX
- Services: Mixed -- NEEDS FIX

---

### TOP 10 PRIORITY FIXES

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| **P0** | Add React ErrorBoundary (at least at App level) | Prevents white screen crashes | Low (1 file, ~50 LOC) |
| **P0** | Fix Lime color contrast (#7CB342 -> #558B2F or darker) | WCAG AA compliance | Medium (CSS variables + references) |
| **P1** | Remove 14 unused npm dependencies | Cleaner installs, smaller attack surface | Low (package.json edit) |
| **P1** | Delete 6 orphaned source files (~1,227 LOC dead code) | Reduces confusion, smaller bundle | Low |
| **P1** | Add aria-labels to interactive elements | Screen reader accessibility | High (hundreds of elements) |
| **P2** | Consolidate font sizes to >= 14px | Readability for target audience (kids 8-12) | High (566 violations) |
| **P2** | Associate labels with inputs (htmlFor) | Form accessibility | Medium (~88 labels) |
| **P2** | Fix touch targets to >= 44px | Mobile usability | Medium (7 CSS violations + JSX) |
| **P2** | Decompose god components (ElabTutorV4, NES, SimCanvas) | Maintainability | Very High |
| **P3** | Consolidate CSS methodology (pick 1-2 approaches) | Consistency, maintainability | Very High |

---

### ADDITIONAL OBSERVATIONS

1. **No devDependencies**: All 39 deps are in `dependencies`. Build tools like `vite`, `postcss`, `autoprefixer`, `@vitejs/plugin-react` should be in `devDependencies` for clarity (though Vercel handles both).

2. **No TypeScript**: The entire codebase is JavaScript without type checking. For a codebase of this size (132 source files, 555 Vite modules), TypeScript would significantly reduce runtime errors.

3. **No tests**: No test files (*.test.js, *.spec.js) found in the source tree. The E2E tests mentioned in memory are likely run externally.

4. **No linting enforcement**: While `eslint` is in scripts, there is no `.eslintrc` or ESLint config visible in the project root (may be in vite config).

5. **Inline styles concentration**: The social/ and admin/ directories account for the majority of inline style violations. These were likely built rapidly and never refactored to CSS.

6. **Orange (#E8941C) contrast**: Used for Volume 2 badges and warnings. At 2.42:1 on white, it fails all WCAG thresholds. Consider #C77700 or darker.

---

### OVERALL SCORE: 3.5/10

| Area | Score | Weight | Notes |
|------|-------|--------|-------|
| Accessibility | 1/10 | High | No ErrorBoundary, 13 aria-labels, 1 htmlFor, 3 color fails |
| Code Quality | 4/10 | High | 32 files > 500 LOC, 4 CSS approaches, 566 font violations |
| Bundle Health | 5/10 | Medium | Main chunk oversized but gzip OK, 14 unused deps |
| Error Handling | 6/10 | Medium | 212 try/catch but no ErrorBoundary |
| Dead Code | 5/10 | Low | 6 orphaned files, much improved from 93 (audit v1) |
| Console Hygiene | 8/10 | Low | 0 console.log, only legitimate error/warn |
| Build Performance | 9/10 | Low | 3.07s build, 555 modules |

**Weighted average: ~3.5/10**

The simulator engine (CircuitSolver, AVRBridge) is well-engineered. The main quality gaps are in UI accessibility, component decomposition, and CSS consistency -- primarily in the admin/social/tutor layers that were built rapidly.
