# Session 77 — Aesthetic Perfection Design

## Problem
S75 audit scored estetica 5/10. 820+ hardcoded colors, iPad layout broken (3/10).

## Approach: 4 Sequential Phases

### FASE A: Design Tokens Expansion
**File**: `src/styles/design-system.css`
Add ~25 missing tokens:
- Button states: active-primary, active-success, active-warning, active-danger
- Text grays: #333, #555, #666, #888, #999, #C0C0C0
- Error panel: bg, text, border
- Wire mode: bg, text
- Overlay: cream bg, divider
- Code editor extended: cursor, error-text, error-bg

### FASE B: CSS Migration (4 files)
Migrate ~63 hardcoded colors to `var(--...)`:
1. `ElabSimulator.css` — 45 instances (button states, gradients, animations)
2. `codeEditor.module.css` — 6 instances (borders, error panel)
3. `layout.module.css` — 5 instances (wire mode, galileo header)
4. `overlays.module.css` — 7 instances (backdrop, cream panels, dividers)

### FASE C: iPad Layout Redesign
**Target**: iPad portrait 768x1024, landscape 1024-1365px

Portrait strategy:
- Sidebar: collapsible toggle (not permanent 28dvh block)
- Canvas: min-height 65dvh when sidebar collapsed
- Editor: slide-over panel (not stacked below)

Landscape strategy:
- Sidebar: 140-160px (narrower)
- Canvas: flex 1 (≥70%)
- Editor: 200-240px (right panel)
- Scratch: overlay/modal instead of inline panel

### FASE D: Top JSX Migration
Priority order (by hardcoded count):
1. CodeEditorCM6.jsx (80) — CM theme to CSS vars
2. NewElabSimulator.jsx (47) — inline styles to classes
3. ExperimentPicker.jsx (47) — component list colors
4. QuizPanel.jsx (42) — quiz UI
5. SerialMonitor.jsx (34) — terminal styling
6. ExperimentGuide.jsx (30) — panel colors
7. PropertiesPanel.jsx (29) — property editors

## Success Criteria
- Estetica score: 5/10 → 7.5+/10
- iPad score: 3/10 → 6+/10
- 0 build errors, 0 visual regressions
- All toolbar buttons visible and functional on iPad
