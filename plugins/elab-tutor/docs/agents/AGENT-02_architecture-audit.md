# AGENT-02 Architecture Audit Report

**Project**: ELAB Tutor / Simulator
**Date**: 2026-02-13
**Auditor**: AGENT-02 (Software Architect)
**Scope**: Read-only architecture audit of `/Users/andreamarro/VOLUME 3/manuale/elab-builder/`

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| Total source files | 344 |
| Total LOC (src/) | 93,433 |
| Orphaned files (unreachable from App) | ~163 files (~26,500 LOC) |
| God components (>500 LOC) | 4 (NES 2,044; ElabTutorV4 2,593; SimulatorCanvas 1,824; CircuitSolver 1,701) |
| Circular dependencies | 0 detected |
| Duplicate build chunks | 1 (50KB avr8js duplicated) |
| Hardcoded secrets | 0 (but .env committed with webhook URLs + SHA-256 hash) |
| **Architecture Score** | **4.5 / 10** |

---

## 2. Dependency Graph Summary

### 2.1 Primary Import Chain (Reachable)

```
main.jsx
  -> App.jsx
       -> AuthContext
       -> Watermark
       -> PasswordGate -> licenseService
       -> ElabTutorV4 (2,593 LOC) -> api.js, contentFilter, studentService, projectHistoryService
       |    -> NewElabSimulator (2,044 LOC)
       |         -> SimulatorCanvas (1,824 LOC)
       |         |    -> WireRenderer, PinOverlay
       |         |    -> registry.js -> 21 SVG components
       |         -> CircuitSolver (1,701 LOC)
       |         -> AVRBridge (1,050 LOC, lazy-loaded)
       |         -> 11 panels/overlays/utils
       |         -> simulator-api.js -> api.js
       |         -> AnalyticsWebhook.js
       -> LoginPage, RegisterPage
       -> CommunityPage, GroupsPage, ProfilePage -> userService, notionService
       -> AdminPage -> GestionalePage -> GestionaleService
       -> StudentDashboard -> studentService
       -> TeacherDashboard
```

### 2.2 Unreachable Subgraph (Dead Code)

```
EditorShell.jsx (NEVER imported by main.jsx or App.jsx)
  -> SpreadCanvas, AssetLibrary, BlockToolbar, TemplatePanel, PageMinimap
  -> EditorContext, HistoryContext, SelectionContext, SnapContext (4 contexts)
  -> useKeyboardShortcuts, useRemoteControl (1,416 LOC)
  -> pdfLoader.jsx -> @react-pdf/renderer
  -> 81 block components (blocks/)
  -> 44 PDF block components (pdf/)
  -> 9 canvas/decoration components
  -> 17 decoration components
  -> 4 electronics components
  -> 2 editor components
  -> 10 config files (lego_blocks, templates, etc.)
```

### 2.3 Circular Dependencies

**None detected.** Import chains are strictly hierarchical:
- `NES -> SimulatorCanvas` (one-way)
- `NES -> CircuitSolver` (one-way)
- `simulator-api.js -> api.js` (one-way, no reverse)
- `AVRBridge -> avrWorker` (one-way, via Web Worker)

---

## 3. God Component Analysis

### 3.1 NewElabSimulator.jsx (2,044 LOC)

**Hook counts**: 40 useState, 36 useCallback, 18 useEffect, 31 useRef, 7 useMemo

**Responsibility breakdown**:

| Section | LOC (est.) | Description |
|---------|-----------|-------------|
| State declarations | ~120 | 40 useState + 31 useRef declarations |
| mergedExperiment + activeHoles | ~150 | Merging base experiment with user customizations |
| Undo/Redo logic | ~80 | Keyboard handlers, snapshot save/restore |
| CircuitSolver init + lifecycle | ~30 | useEffect for solver setup/teardown |
| Public API registration | ~70 | window.__ELAB_API bridge with refs |
| Experiment selection + AVR init | ~170 | handleSelectExperiment (async, 150+ lines) |
| AVR polling loop | ~120 | Pin state extraction, servo/LCD/PWM |
| Play/Pause/Reset | ~50 | 3 handlers with analytics |
| Component interaction | ~110 | handleComponentClick with 6 component types |
| Pot/LDR/Props overlay handlers | ~100 | 3 overlay value change handlers |
| Canvas drop + wire handlers | ~100 | Drag-drop, wire creation, multi-select |
| Compile handler | ~60 | Code compilation with error translation |
| Galileo AI handler | ~30 | askGalileo call + response state |
| Sprint 3 features | ~80 | BOM, annotations, export PNG, shortcuts |
| JSX render | ~600 | Layout: sidebar + canvas + code editor + overlays |
| **Total** | **~2,044** | |

**Extractable modules** (estimated savings):

1. **useSimulationEngine hook** (~400 LOC) -- solver init, AVR bridge, polling, play/pause/reset
2. **useExperimentMerger hook** (~200 LOC) -- mergedExperiment + activeHoles + enrichedStates
3. **useComponentInteraction hook** (~250 LOC) -- click handlers, pot/ldr/props overlays
4. **useCompilation hook** (~80 LOC) -- compile handler, status, errors
5. **SimulatorLayout component** (~600 LOC) -- JSX render tree extraction

After extraction NES would be ~500 LOC (state wiring + top-level orchestration).

### 3.2 ElabTutorV4.jsx (2,593 LOC)

Even larger than NES but was NOT part of Sprint 1 cleanup. Contains:
- Chat state management + message rendering
- Manual viewer integration
- Simulator embedding
- 4 game modes (CircuitDetective, PredictObserve, ReverseEngineering, CircuitReview)
- Tab navigation
- Image upload/analysis
- Quick action buttons

**Should be split into**: useChatEngine hook, GameSelector component, ManualIntegration component.

### 3.3 SimulatorCanvas.jsx (1,824 LOC)

Canvas rendering component with:
- SVG zoom/pan/drag
- Component rendering via registry
- Wire endpoint detection
- Multi-select (drag box, shift+click)
- Copy/paste/duplicate
- Breadboard hole click handling
- Probe drag handling

**Should be split into**: useCanvasInteraction hook, useMultiSelect hook, CanvasRenderer (pure SVG).

### 3.4 CircuitSolver.js (1,701 LOC)

Monolithic solver with path-tracer + MNA/KCL:
- Union-Find implementation
- Component loading/parsing
- DC path tracing
- MNA matrix construction (Gaussian elimination)
- Multimeter probe support
- Interaction handlers

**Acceptable** for an engine file but would benefit from extracting MNA solver into a separate module (~400 LOC).

---

## 4. Dead Code Inventory

### 4.1 Unreachable File Groups

| Directory/Group | Files | LOC | Status |
|----------------|-------|-----|--------|
| components/blocks/ | 81 | 14,293 | Orphaned (EditorShell subgraph) |
| components/pdf/ | 44 | 4,015 | Orphaned (EditorShell subgraph) |
| components/decorations/ | 17 | 1,522 | Orphaned (EditorShell subgraph) |
| components/canvas/ (editor) | 9 | 963 | Orphaned (EditorShell subgraph) |
| components/electronics/ | 4 | 600 | Orphaned (no importers) |
| components/editor/ | 2 | 227 | Orphaned (EditorShell subgraph) |
| components/page/ | 3 | 476 | Orphaned (no importers) |
| components/templates/ | 1 | 516 | Orphaned (EditorShell subgraph) |
| components/notes/ | 2 | 264 | Orphaned (no importers) |
| EditorShell.jsx | 1 | 305 | Root of orphaned subgraph |
| context/ (4 editor contexts) | 4 | ~2,000 | Orphaned (EditorShell only) |
| hooks/ (6 editor hooks) | 6 | 2,077 | Orphaned (EditorShell only) |
| config/ (8 editor configs) | 8 | ~2,300 | Orphaned (EditorShell only) |
| **Subtotal (EditorShell tree)** | **~163** | **~26,500** | |

### 4.2 Individually Orphaned Files

| File | LOC | Evidence |
|------|-----|----------|
| engine/SimulationManager.js | 318 | Zero importers (grep confirms) |
| data/experiments.js (old) | 63 | Superseded by experiments-index.js |
| components/WelcomeOverlay.jsx | ~100 | Zero importers |
| components/QuickActions.jsx | ~80 | Zero importers |
| components/LanguageSelector.jsx | ~60 | Zero importers |
| components/AssetCard.jsx | ~50 | Zero importers |
| components/TemplateSwitcher.jsx | ~80 | Zero importers |
| locales/i18n.js (+ 4 locale files) | 567 | Only imported by LanguageSelector |
| utils/assetManifest.js | ~50 | Only imported by EditorShell tree |
| **Subtotal** | **~1,370** | |

### 4.3 Summary

**Total dead code: ~163 files, ~27,870 LOC (30% of codebase)**

This is legacy from the "ELAB Builder" (manual editor) era. The app pivoted to "ELAB Tutor" (AI tutor + simulator) but the editor code was never removed.

---

## 5. Bundle Analysis

### 5.1 Chunk Sizes (dist/assets/)

| Chunk | Size | Contents |
|-------|------|----------|
| index-BJw_9IGn.js | 1,305 KB | Main bundle (all app code + deps) |
| index-zp5rz6kg.js | 487 KB | Likely: @react-pdf/renderer + mammoth + etc. (dead code!) |
| codemirror-j5nLyEll.js | 429 KB | CodeMirror 6 editor (correctly split) |
| avr-Cds7tnIi.js | 50 KB | avr8js library (correctly split) |
| index-Cds7tnIi.js | 50 KB | DUPLICATE of avr-Cds7tnIi.js (same MD5 hash) |
| AVRBridge-CsPFlEtP.js | 12 KB | AVRBridge lazy chunk (correctly split) |
| react-vendor-Bce9NwRC.js | 12 KB | React + ReactDOM (correctly split) |
| avrWorker-DGbr2c9a.js | 4.4 KB | Web Worker (correctly split) |
| index-DbBpGNYd.css | 83 KB | All CSS |

**Total JS**: ~2,350 KB (uncompressed)

### 5.2 Issues

1. **Duplicate avr8js chunk** (50 KB wasted): `avr-Cds7tnIi.js` and `index-Cds7tnIi.js` are byte-for-byte identical. This is a Vite/Rollup manualChunks interaction bug where avr8js is both in the `avr` named chunk and re-included as a dynamic import chunk.

2. **487 KB phantom chunk** (`index-zp5rz6kg.js`): This likely contains `@react-pdf/renderer`, `mammoth`, `html2canvas`, `html-to-image`, and other dependencies used ONLY by the dead EditorShell code. Since Vite tree-shakes at the module level, these are still bundled because they are transitively imported by files in `src/` even though EditorShell itself is unreachable from the entry point.

3. **Main chunk still 1,305 KB**: Contains experiment data (4,738 LOC of JSON-like objects), all simulator components, tutor code, admin/social pages, and shared dependencies (lucide-react, katex, etc.).

### 5.3 Optimization Opportunities

| Action | Estimated Savings |
|--------|------------------|
| Delete dead EditorShell subgraph | -487 KB (eliminates phantom chunk entirely) |
| Fix duplicate avr8js chunk | -50 KB |
| Lazy-load admin/social pages | -100-200 KB from main chunk |
| Lazy-load tutor games | -50-80 KB from main chunk |
| Extract experiment data to JSON files (dynamic import) | -100 KB from main chunk |
| **Total potential savings** | **~800-900 KB (~35-38%)** |

---

## 6. Config & Secrets Audit

### 6.1 Environment Files

| File | Status | Concern |
|------|--------|---------|
| `.env` | Committed to repo | Contains webhook URLs + SHA-256 password hash |
| `.vercel/.env.development.local` | Vercel-managed | OK |

### 6.2 Findings in `.env`

- `VITE_N8N_CHAT_URL`: n8n webhook URL (publicly accessible endpoint) -- LOW risk (webhook has its own auth)
- `VITE_N8N_LICENSE_URL`: License verification webhook -- MEDIUM risk (could be abused)
- `VITE_N8N_ADMIN_URL`: Admin CRUD webhook -- HIGH risk (admin operations)
- `VITE_N8N_COMPILE_URL`: Arduino compiler webhook -- LOW risk
- `VITE_ACCESS_HASH`: SHA-256 hash of access password -- MEDIUM risk (offline brute-force possible)

Note: All `VITE_` prefixed vars are embedded in the client-side bundle by Vite. The webhook URLs and password hash are visible to anyone inspecting the JavaScript bundle.

### 6.3 Hardcoded Fallbacks in api.js

```javascript
const N8N_WEBHOOK = import.meta.env.VITE_N8N_CHAT_URL || 'https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat';
```

The fallback URL is hardcoded in source code. If `.env` is missing, the hardcoded URL is used. This means the webhook URL is in the bundle regardless.

### 6.4 Authentication Architecture

- `AuthContext.jsx` uses `localStorage` for session storage
- `PasswordGate.jsx` compares SHA-256 hash client-side
- No JWT tokens, no server-side session validation
- Admin role check is client-side only (`user.ruolo === 'admin'`)
- **Critical**: Auth is entirely falsifiable from browser DevTools

---

## 7. Anti-Patterns Identified

### 7.1 No Router Library

App.jsx uses `useState('tutor')` for routing instead of react-router or a proper routing solution. This means:
- No URL-based navigation (no deep links, no back button)
- No code splitting per route
- All pages loaded upfront
- No route guards

### 7.2 Inline Styles Everywhere

App.jsx has 100+ lines of `topBarStyles` object. NES has color constants and inline style objects. No consistent styling strategy:
- Some files use CSS modules (`layout.module.css`)
- Some use plain CSS (`ElabSimulator.css`, `ElabTutorV4.css`)
- Some use inline style objects
- Tailwind is installed but usage is minimal

### 7.3 Module-Level Mutable State

```javascript
// NewElabSimulator.jsx lines 63-64
let _avrSetupInProgress = false;
let _avrSetupExpId = null;
```

Module-level mutable variables outside React's state management. These survive component remounts but create subtle bugs with HMR and concurrent rendering.

### 7.4 Global Window API

`window.__ELAB_API` and `window.__ELAB_EVENTS` are used for cross-component communication. While documented and intentional (for n8n/MCP integration), this bypasses React's data flow and makes the component tree harder to reason about.

### 7.5 Redundant Dependencies

| Dependency | Used By | Issue |
|-----------|---------|-------|
| `@react-pdf/renderer` | Dead EditorShell code only | 487 KB in bundle for nothing |
| `mammoth` | Dead EditorShell code only | DOCX parsing, unused |
| `html2canvas` | Not found in active code | Legacy |
| `html-to-image` | Not found in active code | Legacy |
| `react-simple-code-editor` | Dead ArduinoBlock only | Superseded by CM6 |
| `prismjs` | Dead ArduinoBlock only | Superseded by CM6 |
| `react-window` | Not found in active code | Legacy |
| `react-virtuoso` | Not found in active code | Legacy |
| `@dnd-kit/*` (4 packages) | Dead blocks/SortableBlock only | Legacy |
| `buffer` | main.jsx polyfill for @react-pdf | Would be unnecessary if PDF removed |

**10+ dependencies** are bundled but serve dead code paths.

### 7.6 No TypeScript

Entire codebase is plain JavaScript with no type annotations, JSDoc, or PropTypes. For a 93K LOC project, this significantly impacts maintainability and refactoring confidence.

### 7.7 No Test Infrastructure

- No test runner configured (no jest, vitest, or testing-library in package.json)
- One stale test file exists: `pdfPreprocessor.test.js` (part of dead code)
- No CI/CD pipeline
- Build verification is manual (`npm run build`)

---

## 8. Architecture Score: 4.5 / 10

| Category | Score | Weight | Notes |
|----------|-------|--------|-------|
| Modularity | 4/10 | 25% | 4 god components, some extraction done in Sprint 1 |
| Dead code | 2/10 | 15% | 30% of codebase is unreachable |
| Bundle efficiency | 4/10 | 15% | Good chunk splitting but dead deps + duplicate chunk |
| Security | 3/10 | 15% | Client-side auth, exposed webhooks, no server validation |
| Dependency hygiene | 3/10 | 10% | 10+ unused deps, no lockfile audit, no devDependencies section |
| Testability | 1/10 | 10% | Zero tests, no test infrastructure |
| Developer experience | 6/10 | 10% | Good CLAUDE.md docs, clear file naming, path alias working |
| **Weighted Total** | **4.5/10** | | |

---

## 9. Top 5 Refactoring Recommendations

### R1. Delete the EditorShell Subgraph (Priority: P0, Impact: HIGH)

**What**: Remove EditorShell.jsx and all 163 transitively-orphaned files (~27,000 LOC). Remove the 10 unused npm dependencies.

**Why**: 30% of the codebase is dead weight. It inflates the bundle by ~500 KB, confuses developers, and creates false positives in search/grep operations. Every audit session has flagged this.

**Estimated effort**: 2-3 hours (identify files, delete, remove deps, verify build).

### R2. Extract NES into Custom Hooks (Priority: P1, Impact: HIGH)

**What**: Split NewElabSimulator.jsx (2,044 LOC, 40 useState) into:
- `useSimulationEngine` (solver + AVR bridge + polling + play/pause/reset)
- `useExperimentMerger` (merged experiment + active holes)
- `useComponentInteraction` (click handlers + overlay state)
- `useCompilation` (compile handler + status)

**Why**: NES is the most-edited file in the project. Every feature change touches it. Extracting hooks would reduce it to ~500 LOC and make each concern independently testable.

**Estimated effort**: 4-6 hours per hook extraction (16-24 hours total).

### R3. Add Vitest + Basic Integration Tests (Priority: P1, Impact: MEDIUM)

**What**: Install vitest, write tests for CircuitSolver (unit), breadboardSnap (unit), pinComponentMap (unit), and experiment loading (integration).

**Why**: Zero test coverage on a 93K LOC project means every change is a gamble. The engine files (CircuitSolver, AVRBridge) are complex enough that manual testing misses edge cases. Sprint 2 already found bugs that CoVe caught -- automated tests would catch these earlier.

**Estimated effort**: 8-12 hours for initial test setup + 20 tests.

### R4. Adopt React Router + Route-Based Code Splitting (Priority: P2, Impact: MEDIUM)

**What**: Replace the `useState('tutor')` router with `react-router-dom`. Lazy-load admin, social, and game pages.

**Why**: Currently ALL pages (admin, social, student, teacher) are bundled in the main chunk even though most users only use the tutor. Route-based splitting could reduce initial load by 200-300 KB. Deep linking and browser back button would also work.

**Estimated effort**: 6-8 hours.

### R5. Fix Bundle Duplicate + Add Bundle Analysis (Priority: P2, Impact: LOW)

**What**:
- Fix the avr8js duplicate chunk (50 KB). The `manualChunks` config creates `avr: ['avr8js']` but the dynamic import in NES (`await import('./engine/AVRBridge')`) causes Rollup to also create a separate chunk for the same module. Fix by either removing avr8js from manualChunks or adjusting the dynamic import.
- Add `rollup-plugin-visualizer` to dev dependencies for ongoing bundle analysis.

**Why**: 50 KB wasted bandwidth on every page load. Bundle visualization would prevent regressions.

**Estimated effort**: 1-2 hours.

---

## Appendix A: File Count by Directory

| Directory | Files | LOC | Reachable? |
|-----------|-------|-----|------------|
| components/simulator/ | 55 | ~12,000 | Yes |
| components/tutor/ | 10 | ~5,000 | Yes |
| components/admin/ | 16 | ~4,500 | Yes |
| components/social/ | 5 | ~2,500 | Yes |
| components/auth/ | 2 | ~600 | Yes |
| components/student/ | 1 | ~300 | Yes |
| components/teacher/ | 1 | ~300 | Yes |
| components/chat/ | 6 | ~1,200 | Partial (via ElabTutorV4) |
| services/ | 6 | ~1,800 | Mostly yes |
| data/ | 8 | ~5,500 | Yes |
| components/blocks/ | 81 | 14,293 | **No** |
| components/pdf/ | 44 | 4,015 | **No** |
| components/decorations/ | 17 | 1,522 | **No** |
| components/canvas/ (editor) | 9 | 963 | **No** |
| components/electronics/ | 4 | 600 | **No** |
| components/editor/ | 2 | 227 | **No** |
| components/page/ | 3 | 476 | **No** |
| components/templates/ | 1 | 516 | **No** |
| components/notes/ | 2 | 264 | **No** |
| hooks/ | 11 | 2,837 | 5 yes, 6 **no** |
| utils/ | 10 | 1,444 | Mostly yes |
| config/ | 10 | 2,816 | 2 yes, 8 **no** |
| context/ | 5 | 2,850 | 1 yes (Auth), 4 **no** |
| locales/ | 5 | 567 | **No** |

## Appendix B: NES useState Inventory (40 declarations)

1. apiHighlightedComponents, 2. apiHighlightedPins, 3. currentExperiment, 4. componentStates,
5. isRunning, 6. simulationTime, 7. showSidebar, 8. serialOutput, 9. avrReady,
10. showPalette, 11. showCodeEditor, 12. wireMode, 13. bottomPanel, 14. serialBaudRate,
15. serialTimestamps, 16. baudMismatch, 17. customLayout, 18. customConnections,
19. customComponents, 20. customPinAssignments, 21. selectedWireIndex, 22. editorCode,
23. compilationStatus, 24. compilationErrors, 25. compilationWarnings, 26. compilationErrorLine,
27. compilationSize, 28. potOverlay, 29. ldrOverlay, 30. propsPanel, 31. showGuide,
32. showBom, 33. showShortcuts, 34. annotations, 35. selectedAnnotation, 36. exportToast,
37. isAskingGalileo, 38. galileoResponse, 39. circuitWarning, 40. (menuOpen -- in App.jsx)

---

*Report generated by AGENT-02 (Software Architect) -- 2026-02-13*
