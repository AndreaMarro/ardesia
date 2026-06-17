# AGENT-03: UX/UI Audit -- ELAB Simulator

**Auditor**: AGENT-03 (UX Designer -- Children 8-14 + Digital Artist)
**Date**: 2026-02-13
**Scope**: Code-based read-only audit of the ELAB Simulator UI
**Target audience**: Children 8-12 years old (Italian-speaking)

---

## Executive Summary

The ELAB Simulator has a solid visual identity and thoughtful interactive features (drag-and-drop, wire mode, potentiometer knob rotation, LDR slider). However, it suffers from **systematically undersized touch targets**, **near-total absence of accessibility markup**, **font sizes too small for children**, and **inconsistent feedback states across inline-styled components**. The error translator is a genuine highlight -- child-friendly, encouraging, and well-patterned.

**Scores by Area:**

| Area | Score | Rating |
|---|---|---|
| Touch Targets | 3/10 | CRITICAL |
| Color Contrast | 6/10 | WARNING |
| Feedback Systems | 5/10 | WARNING |
| Layout & Breathing Space | 6/10 | WARNING |
| Typography | 3/10 | CRITICAL |
| Accessibility (a11y) | 1/10 | CRITICAL |
| Component Palette UX | 7/10 | GOOD |

**Overall UX Score: 4.4/10**

---

## 1. Touch Target Sizes

Apple HIG recommends **44pt minimum** for children. WCAG 2.5.8 requires 24px minimum for general use. For children aged 8-12, 44px is the floor.

### CRITICAL Issues

**C-01: ControlBar action buttons are 30px tall (btnStyle.height)**
- File: `/src/components/simulator/panels/ControlBar.jsx:392`
- `height: 30` with `padding: '4px 10px'`
- Play, Pause, Reset, Undo, Redo are all 30px -- 32% below the 44px minimum
- Children with developing motor skills will struggle to hit these reliably

**C-02: Toggle buttons in ControlBar are 28px tall**
- File: `/src/components/simulator/panels/ControlBar.jsx:439`
- `toggleBtnStyle.height: 28` -- 36% below minimum
- Wire Mode, Componenti, Editor Codice, BOM, Foto, Tasti buttons all affected

**C-03: Zoom buttons in SimulatorCanvas are 32x32px**
- File: `/src/components/simulator/canvas/SimulatorCanvas.jsx:1809-1822`
- `zoomBtnStyle: { width: 32, height: 32 }` -- 27% below minimum

**C-04: ComponentPalette rows are 32px tall**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:101-110`
- `styles.row.height: 32` -- drag targets for children
- These are the primary interaction points for building circuits

**C-05: SVG delete button on selected components is r=7 (14px diameter)**
- File: `/src/components/simulator/canvas/SimulatorCanvas.jsx:1436`
- `<circle r="7" fill="#E54B3D" .../>` -- 14px is 68% below minimum
- Rotate button is also r=7 (line 1455)

**C-06: Annotation delete button is r=5 (10px diameter)**
- File: `/src/components/simulator/components/Annotation.jsx:148`
- `<circle ... r="5" fill="#E54B3D" .../>` -- 10px is 77% below minimum

**C-07: Font size adjustment buttons in CodeEditor are tiny**
- File: `/src/components/simulator/codeEditor.module.css:36-46`
- `.fontSizeBtn: { font-size: 9px; padding: 1px 4px; }` -- effectively ~16px total, far below 44px

**C-08: BOM Panel close button lacks minimum size enforcement**
- File: `/src/components/simulator/panels/BomPanel.jsx:177-185`
- `closeBtnStyle: { padding: '0 4px' }` with no min-width/min-height set
- Computed size approximately 14x14px

**C-09: ExperimentGuide close and minimize buttons are 28x28px**
- File: `/src/components/simulator/overlays.module.css:154-167`
- `.guideCloseBtn: { min-width: 28px; min-height: 28px; }` -- 36% below minimum

### WARNING Issues

**W-01: ShortcutsPanel close button has no minimum size**
- File: `/src/components/simulator/panels/ShortcutsPanel.jsx:123-131`
- `closeBtnStyle: { padding: '0 4px' }` -- no min dimensions

**W-02: PropertiesPanel LED color picker buttons are 28x28px**
- File: `/src/components/simulator/panels/PropertiesPanel.jsx:111-116`
- `width: 28, height: 28` -- close but still 36% below minimum

**W-03: ElabSimulator.css attempts WCAG fix but sets 32px not 44px**
- File: `/src/components/simulator/ElabSimulator.css:339-344`
- Comment says "44px per WCAG" but rule sets `min-width: 32px; min-height: 32px`

---

## 2. Color Contrast

WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).

### WARNING Issues

**W-04: Timer text (#888 on #F0EDE6) has contrast ratio ~3.2:1**
- File: `/src/components/simulator/panels/ControlBar.jsx:451-458`
- `timerStyle: { color: '#888', background: '#F0EDE6' }` -- FAILS AA normal text (needs 4.5:1)

**W-05: Info meta text is #888 at 9px -- double failure (contrast + size)**
- File: `/src/components/simulator/panels/ControlBar.jsx:419-422`
- `infoMetaStyle: { fontSize: 9, color: '#888' }` -- both too small and too low contrast

**W-06: Guide description text (#555 on ~#FAFAF7) is borderline**
- File: `/src/components/simulator/overlays.module.css:169-176`
- `.desc: { color: '#555' }` on near-white bg -- contrast ~7:1, OK
- But `.concept: { color: '#888' }` at line 218 -- ~3.5:1, FAILS AA

**W-07: BOM table header text (#888 at 9px)**
- File: `/src/components/simulator/panels/BomPanel.jsx:199-210`
- `thStyle: { fontSize: 9, color: '#888' }` -- fails both contrast and size

**W-08: Footer text in BomPanel and ShortcutsPanel (#999 at 9-10px)**
- BomPanel line 257: `footerStyle: { fontSize: 9, color: '#999' }`
- ShortcutsPanel line 182: `footerStyle: { fontSize: 10, color: '#999' }`
- #999 on #FAFAF7 is ~2.8:1 -- FAILS AA

**W-09: Galileo footer timestamp (#999 at 9px)**
- File: `/src/components/simulator/panels/GalileoResponsePanel.jsx:46`
- `fontSize: 9, color: '#999'` -- fails both size and contrast

### SUGGESTION Issues

**S-01: Error text uses #F8A0A0 on #1a0a0a (codeEditor.module.css:88-97)**
- Contrast is ~5.5:1 -- passes AA, but the pinkish tone is not intuitive for "danger"
- Consider using #EF4444 (brighter red) or white text on red background for clarity

**S-02: Disabled button opacity is 0.5 (ControlBar.jsx:98)**
- Combined with already-low-contrast text, disabled state may be invisible to some children
- Consider using strikethrough or a clearer visual pattern instead of opacity

---

## 3. Feedback Systems

### What Works Well

**GOOD: Error translator is excellent for children**
- File: `/src/components/simulator/utils/errorTranslator.js`
- 20 GCC error patterns mapped to encouraging Italian messages
- Uses direct language: "Hai dimenticato un punto e virgola" instead of compiler jargon
- Includes line numbers: "Riga 5: ..."
- Tone is supportive, not punitive

**GOOD: Visual feedback during drag**
- Dragged component opacity reduces to 0.45 (ComponentPalette.jsx:195)
- Drag ghost preview shows "+" icon and "rilascia qui" text (SimulatorCanvas.jsx:1618-1625)
- Component placement animation exists in CSS (ElabSimulator.css:306-309)

**GOOD: Wire mode status indicator**
- Top-left banner shows context-sensitive messages (SimulatorCanvas.jsx:1753-1768)
- Color changes from green (#7CB342 = "click a pin") to orange (#E8941C = "click second pin")
- This is a good example of state-aware feedback

**GOOD: Selected component glow with animated dashed border**
- Green (#7CB342) animated border around selected components
- Drop-shadow glow effect (SimulatorCanvas.jsx:1415)

### WARNING Issues

**W-10: No hover states on ControlBar buttons (inline styles lack :hover)**
- File: `/src/components/simulator/panels/ControlBar.jsx:382-395`
- `btnStyle` has `transition` property but no hover state definition in inline styles
- The global `.elab-simulator button:hover { filter: brightness(0.95) }` (ElabSimulator.css:326) provides a minimal fallback, but it is barely perceptible
- Children need strong visual cues (color change, scale, shadow) to understand interactivity

**W-11: No hover states on toggle buttons in ControlBar**
- File: `/src/components/simulator/panels/ControlBar.jsx:429-442`
- `toggleBtnStyle` has `transition: 'all 0.15s'` but no hover differentiation in inline styles

**W-12: No success feedback after wire connection**
- When two pins are connected, the wire simply appears -- no sound, flash, or particle effect
- Children need confirmation that their action succeeded (e.g., brief green flash on both pins)

**W-13: No error feedback for invalid wire connections**
- Connecting two incompatible pins (e.g., two grounds) silently does nothing
- Should show a shake animation or brief red flash with a child-friendly message

**W-14: ComponentPalette "row hover" is a subtle background change (#F0EDE6)**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:112-114`
- Very subtle -- children may not notice it
- No scale change, no border highlight, no animation

### SUGGESTION Issues

**S-03: Add haptic/audio feedback for key actions**
- Play/Pause, wire connect, component place, delete -- all silent
- Even simple CSS animations (bounce, shake) would help

**S-04: Galileo loading state lacks progressive indication**
- GalileoResponsePanel.jsx shows a static hourglass emoji
- Consider a multi-step progress indicator: "Galileo sta leggendo..." then "Galileo sta pensando..."

---

## 4. Layout & Breathing Space

### WARNING Issues

**W-15: ControlBar gap is only 6px between action buttons**
- File: `/src/components/simulator/panels/ControlBar.jsx:370`
- `barStyle.gap: 6` -- very cramped for children
- Combined with 30px button height, creates a dense toolbar
- Recommended: 8-12px gap minimum for child interfaces

**W-16: Toggle button group gap is only 4px**
- File: `/src/components/simulator/panels/ControlBar.jsx:425`
- `toggleGroupStyle.gap: 4` -- extremely tight
- At 28px height and 4px gap, buttons blur together visually

**W-17: ComponentPalette category header padding is tight**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:78-92`
- `catHeader.padding: '6px 12px'` -- effective height ~30px
- Combined with 12px font size, feels cramped

**W-18: Code editor panel minimum width is 180px**
- File: `/src/components/simulator/layout.module.css:13`
- `.codeEditorPanel: { min-width: 180px }` -- very narrow for code editing
- At 12px font size (codeEditor.module.css:12), only ~15 characters visible

**W-19: ControlBar padding is only 6px 10px**
- File: `/src/components/simulator/panels/ControlBar.jsx:371`
- Minimal breathing room around the entire toolbar
- Recommended: 8px 16px minimum

### SUGGESTION Issues

**S-05: ExperimentGuide width is fixed 220px**
- File: `/src/components/simulator/overlays.module.css:114`
- On larger screens, this is quite narrow for step-by-step instructions
- Consider 260-280px or percentage-based width

**S-06: BomPanel has good spacing (280px width, clear headers)**
- File: `/src/components/simulator/panels/BomPanel.jsx:141-156`
- This is a positive example in the codebase -- well-spaced layout

---

## 5. Typography

For children aged 8-12, research recommends: body text 16px+, line-height 1.5+, sans-serif fonts.

### CRITICAL Issues

**C-10: ControlBar toggle label text is 10px**
- File: `/src/components/simulator/panels/ControlBar.jsx:444-449`
- `toggleLabelStyle: { fontSize: 10 }` -- 37.5% below the 16px recommendation
- These labels are how children identify panel functions

**C-11: ControlBar info title is 11px**
- File: `/src/components/simulator/panels/ControlBar.jsx:409-417`
- `infoTitleStyle: { fontSize: 11 }` -- experiment title shown at barely readable size

**C-12: ControlBar info meta is 9px**
- File: `/src/components/simulator/panels/ControlBar.jsx:419-422`
- `infoMetaStyle: { fontSize: 9 }` -- effectively invisible for young readers

**C-13: ComponentPalette row labels are 12px**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:123-129`
- `rowLabel: { fontSize: 12 }` -- 25% below recommendation

**C-14: ExperimentGuide step text is 11px**
- File: `/src/components/simulator/overlays.module.css:199-203`
- `.step: { font-size: 11px; line-height: 1.4 }` -- children reading instructions at 11px

**C-15: ExperimentGuide concept text is 10px italic**
- File: `/src/components/simulator/overlays.module.css:213-220`
- `.concept: { font-size: 10px; font-style: italic }` -- italic + small = very hard to read

**C-16: Code editor base font is 12px**
- File: `/src/components/simulator/codeEditor.module.css:12`
- `.root: { font-size: 12px }` -- code is harder to read than prose, needs 14px+

**C-17: Galileo response body text is 13px**
- File: `/src/components/simulator/layout.module.css:108-115`
- `.galileoBody: { font-size: 13px; line-height: 1.6 }` -- line-height is good, but font too small
- This is the AI tutor's main output -- children need to read it easily

**C-18: BOM table font sizes are 9-11px throughout**
- File: `/src/components/simulator/panels/BomPanel.jsx:193-263`
- Table headers: 9px, row names: 11px, values: 10px, footer: 9px
- An entire data panel at sub-readable sizes

**C-19: ShortcutsPanel key descriptions are 12px, kbd labels 10px**
- File: `/src/components/simulator/panels/ShortcutsPanel.jsx:162-180`
- `kbdStyle: { fontSize: 10 }`, `descStyle: { fontSize: 12 }`

**C-20: SVG component labels are 7px**
- File: `/src/components/simulator/canvas/SimulatorCanvas.jsx:1493`
- `fontSize="7"` for component ID labels (e.g., "R1", "LED1")
- These are illegible even for adults at normal zoom levels

**C-21: Pin tooltip text is 5px**
- File: `/src/components/simulator/canvas/SimulatorCanvas.jsx:1693`
- `fontSize="5"` -- SVG units, but at 1:1 zoom this is microscopic
- Pin labels in PinOverlay are also 5px (PinOverlay.jsx:113)

### WARNING Issues

**W-20: Annotation text is 8px in SVG**
- File: `/src/components/simulator/components/Annotation.jsx:111,125`
- `fontSize: '8px'` for both editing textarea and display text
- Notes that children write will be barely readable

**W-21: Wire mode indicator text is 11px**
- File: `/src/components/simulator/layout.module.css:34`
- `.wireModeIndicator: { font-size: 11px }` -- status messages should be clearly readable

### SUGGESTION Issues

**S-07: Font family consistency**
- The project declares Oswald + Open Sans + Fira Code as the official stack
- ElabTutorV4.css line 32 uses `'Inter', -apple-system, ...` instead of Open Sans
- Should unify to the declared stack for brand consistency

---

## 6. Accessibility (a11y)

### CRITICAL Issues

**C-22: ZERO aria-label attributes in the entire simulator directory**
- Searched all files in `/src/components/simulator/` -- zero matches for `aria-`
- Every button uses `title=""` for tooltips but no `aria-label` for screen readers
- Children with visual impairments cannot use this simulator at all

**C-23: ZERO role attributes in the simulator**
- No `role="button"`, `role="slider"`, `role="toolbar"`, or `role="dialog"`
- The SVG canvas has no `role="application"` or `role="img"`
- Modal overlays (PotOverlay, LdrOverlay, ShortcutsPanel, Galileo) lack `role="dialog"` and `aria-modal="true"`

**C-24: ZERO tabIndex attributes in the simulator**
- No keyboard navigation support for any interactive element
- SVG components, pins, wires -- none are keyboard-focusable
- Children who cannot use a mouse are completely excluded

**C-25: No focus trap in modal dialogs**
- ShortcutsPanel, GalileoResponsePanel, PotOverlay, LdrOverlay, PropertiesPanel all open as modals
- None trap focus within the modal -- Tab key will escape to elements behind the backdrop
- File references: ShortcutsPanel.jsx:44-72, GalileoResponsePanel.jsx:24-58

**C-26: Keyboard shortcuts require modifier keys children may not know**
- File: `/src/components/simulator/panels/ShortcutsPanel.jsx:9-41`
- Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, Ctrl+D, Ctrl+S, Ctrl+/, Alt+Drag
- No single-key alternatives (except F for fit-to-view and Esc)
- 8-year-olds are unlikely to discover or remember Ctrl+ combinations

**C-27: No skip navigation or landmark regions**
- The simulator has no `<main>`, `<nav>`, `<aside>` landmarks
- No skip links to jump between ControlBar, Canvas, CodeEditor, and Palette

### WARNING Issues

**W-22: Focus-visible styles exist but only in ElabTutorV4.css (line 1901-1911)**
- These only apply to elements within `.elab-v4` scope
- The simulator's inline-styled buttons may not receive these styles

**W-23: ElabSimulator.css has focus-visible on `.elab-simulator button` (line 334)**
- This is good but covers only `<button>` elements
- SVG interactive elements (component clicks, pin clicks, wire clicks) have no focus indication

**W-24: Color is the only differentiator for many states**
- Wire mode active: green vs white background (ControlBar.jsx:160-163)
- Palette toggle on/off: colored background vs white (ControlBar.jsx:175-179)
- Children with color vision deficiency cannot distinguish these states
- Should add icons, borders, or text labels to reinforce state

---

## 7. Component Palette UX

### What Works Well

**GOOD: Categories are well-organized and intuitive**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:14-22`
- 7 categories: Alimentazione, Passivi, Semiconduttori, Output, Input, Board, Strumenti
- Italian labels are age-appropriate
- Emoji icons provide quick visual identification

**GOOD: Search functionality works**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:267-274`
- Searches both label and type name
- Placeholder text "Cerca componente..." is clear

**GOOD: Collapsible categories**
- Categories toggle open/closed with chevron indicator
- State management is clean (useState collapsed map)

**GOOD: Drag-and-drop with visual feedback**
- Dragging opacity reduces to 0.45 (line 195)
- Drag handle icon visible on each row (line 202)
- Canvas shows drop preview ghost (SimulatorCanvas.jsx:1617-1625)

### WARNING Issues

**W-25: "Semiconduttori" is not a word an 8-year-old knows**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:17`
- Consider "Transistor" or "Elettronici Speciali" as alternatives

**W-26: Category header click target is the full row but looks like a label**
- No affordance (pointer cursor exists, but no hover color change defined in inline styles)
- Children may not discover that categories are collapsible

**W-27: Wire mode button at bottom of palette is easy to miss**
- File: `/src/components/simulator/panels/ComponentPalette.jsx:320-327`
- Full-width button in footer -- good size but may scroll out of view
- Duplicated in ControlBar and canvas overlay -- potentially confusing to have 3 wire mode toggles

### SUGGESTION Issues

**S-08: Add component thumbnails/mini-SVG previews**
- Currently shows only emoji icons and text labels
- A tiny SVG preview of each component would help children recognize what they are dragging

**S-09: Add tooltip on hover explaining what each component does**
- Currently only shows `title={Trascina "label" sul canvas}`
- A child-friendly description like "Il LED si illumina quando la corrente lo attraversa" would be educational

**S-10: Consider a "recently used" section at the top**
- Children often use the same components repeatedly (LED, resistor, wire)
- A pinned favorites section would speed up circuit building

---

## 8. Additional Findings

### SUGGESTION Issues

**S-11: No onboarding or first-use tutorial within the simulator**
- The ElabTutorV4.css has onboarding wizard styles (lines 1918-2070)
- But the simulator itself has no guided walkthrough
- Children need to learn: how to drag components, how to connect wires, how to run simulation

**S-12: Right-click to rotate is not discoverable by children**
- File: `/src/components/simulator/canvas/SimulatorCanvas.jsx:1195-1203`
- Right-click is not a natural gesture for 8-year-olds
- The rotate icon on selected components (line 1442-1457) is good but only visible when selected

**S-13: Selection hint text at bottom-left uses technical language**
- File: `/src/components/simulator/canvas/SimulatorCanvas.jsx:1784`
- Text: `"selectedComponent -- rotate -- elimina -- Esc deseleziona -- click = toggle"`
- Contains English characters and keyboard symbols children may not understand

**S-14: No undo feedback toast/notification**
- Ctrl+Z works but provides no visual confirmation
- Children may not know if undo succeeded

---

## Summary Table

| ID | Severity | Area | Component | Issue |
|---|---|---|---|---|
| C-01 | CRITICAL | Touch | ControlBar.jsx:392 | Action buttons 30px (need 44px) |
| C-02 | CRITICAL | Touch | ControlBar.jsx:439 | Toggle buttons 28px |
| C-03 | CRITICAL | Touch | SimulatorCanvas.jsx:1809 | Zoom buttons 32px |
| C-04 | CRITICAL | Touch | ComponentPalette.jsx:101 | Palette rows 32px |
| C-05 | CRITICAL | Touch | SimulatorCanvas.jsx:1436 | SVG delete button 14px |
| C-06 | CRITICAL | Touch | Annotation.jsx:148 | Annotation delete 10px |
| C-07 | CRITICAL | Touch | codeEditor.module.css:36 | Font size buttons ~16px |
| C-08 | CRITICAL | Touch | BomPanel.jsx:177 | Close button ~14px |
| C-09 | CRITICAL | Touch | overlays.module.css:154 | Guide close 28px |
| C-10 | CRITICAL | Type | ControlBar.jsx:444 | Toggle labels 10px |
| C-11 | CRITICAL | Type | ControlBar.jsx:409 | Info title 11px |
| C-12 | CRITICAL | Type | ControlBar.jsx:419 | Info meta 9px |
| C-13 | CRITICAL | Type | ComponentPalette.jsx:123 | Row labels 12px |
| C-14 | CRITICAL | Type | overlays.module.css:199 | Guide steps 11px |
| C-15 | CRITICAL | Type | overlays.module.css:213 | Concept 10px italic |
| C-16 | CRITICAL | Type | codeEditor.module.css:12 | Code editor 12px |
| C-17 | CRITICAL | Type | layout.module.css:108 | Galileo body 13px |
| C-18 | CRITICAL | Type | BomPanel.jsx:193 | BOM table 9-11px |
| C-19 | CRITICAL | Type | ShortcutsPanel.jsx:162 | Shortcuts 10-12px |
| C-20 | CRITICAL | Type | SimulatorCanvas.jsx:1493 | Component labels 7px SVG |
| C-21 | CRITICAL | Type | SimulatorCanvas.jsx:1693 | Pin tooltips 5px SVG |
| C-22 | CRITICAL | A11y | ALL simulator files | Zero aria-label attributes |
| C-23 | CRITICAL | A11y | ALL simulator files | Zero role attributes |
| C-24 | CRITICAL | A11y | ALL simulator files | Zero tabIndex attributes |
| C-25 | CRITICAL | A11y | Multiple modal files | No focus trap in modals |
| C-26 | CRITICAL | A11y | ShortcutsPanel.jsx:9 | Modifier keys children don't know |
| C-27 | CRITICAL | A11y | ALL simulator files | No landmarks or skip nav |
| W-01 | WARNING | Touch | ShortcutsPanel.jsx:123 | Close button no min size |
| W-02 | WARNING | Touch | PropertiesPanel.jsx:111 | LED color buttons 28px |
| W-03 | WARNING | Touch | ElabSimulator.css:339 | Comment says 44px, sets 32px |
| W-04 | WARNING | Color | ControlBar.jsx:451 | Timer #888 on #F0EDE6 ~3.2:1 |
| W-05 | WARNING | Color | ControlBar.jsx:419 | Meta #888 at 9px |
| W-06 | WARNING | Color | overlays.module.css:218 | Concept #888 ~3.5:1 |
| W-07 | WARNING | Color | BomPanel.jsx:199 | Table header #888 9px |
| W-08 | WARNING | Color | BomPanel/Shortcuts footers | Footer #999 9-10px ~2.8:1 |
| W-09 | WARNING | Color | GalileoResponsePanel.jsx:46 | Timestamp #999 9px |
| W-10 | WARNING | Feedback | ControlBar.jsx:382 | No hover on action buttons |
| W-11 | WARNING | Feedback | ControlBar.jsx:429 | No hover on toggle buttons |
| W-12 | WARNING | Feedback | SimulatorCanvas.jsx | No wire connect feedback |
| W-13 | WARNING | Feedback | SimulatorCanvas.jsx | No invalid wire feedback |
| W-14 | WARNING | Feedback | ComponentPalette.jsx:112 | Subtle row hover |
| W-15 | WARNING | Layout | ControlBar.jsx:370 | Gap 6px between buttons |
| W-16 | WARNING | Layout | ControlBar.jsx:425 | Toggle group gap 4px |
| W-17 | WARNING | Layout | ComponentPalette.jsx:78 | Category header tight |
| W-18 | WARNING | Layout | layout.module.css:13 | Code panel min-width 180px |
| W-19 | WARNING | Layout | ControlBar.jsx:371 | Bar padding 6px 10px |
| W-20 | WARNING | Type | Annotation.jsx:111 | Annotation text 8px SVG |
| W-21 | WARNING | Type | layout.module.css:34 | Wire indicator 11px |
| W-22 | WARNING | A11y | ElabTutorV4.css:1901 | Focus-visible scoped to .elab-v4 |
| W-23 | WARNING | A11y | ElabSimulator.css:334 | Focus-visible buttons only |
| W-24 | WARNING | A11y | ControlBar.jsx:160 | Color-only state differentiation |
| W-25 | WARNING | Palette | ComponentPalette.jsx:17 | "Semiconduttori" age-inappropriate |
| W-26 | WARNING | Palette | ComponentPalette.jsx:78 | Category headers lack hover affordance |
| W-27 | WARNING | Palette | ComponentPalette.jsx:320 | Wire button may scroll out of view |
| S-01 | SUGGESTION | Color | codeEditor.module.css:88 | Error text color choice |
| S-02 | SUGGESTION | Color | ControlBar.jsx:98 | Disabled opacity too subtle |
| S-03 | SUGGESTION | Feedback | General | Add audio/haptic feedback |
| S-04 | SUGGESTION | Feedback | GalileoResponsePanel | Progressive loading indicator |
| S-05 | SUGGESTION | Layout | overlays.module.css:114 | Guide panel width fixed 220px |
| S-06 | SUGGESTION | Layout | BomPanel.jsx:141 | BomPanel is well-spaced (positive) |
| S-07 | SUGGESTION | Type | ElabTutorV4.css:32 | Inter vs Open Sans inconsistency |
| S-08 | SUGGESTION | Palette | ComponentPalette.jsx | Add SVG thumbnails |
| S-09 | SUGGESTION | Palette | ComponentPalette.jsx | Add educational tooltips |
| S-10 | SUGGESTION | Palette | ComponentPalette.jsx | Add recently used section |
| S-11 | SUGGESTION | UX | Simulator | No in-simulator onboarding |
| S-12 | SUGGESTION | UX | SimulatorCanvas.jsx:1195 | Right-click not discoverable |
| S-13 | SUGGESTION | UX | SimulatorCanvas.jsx:1784 | Hint text uses symbols |
| S-14 | SUGGESTION | UX | General | No undo feedback toast |

---

## Recommended Priority Actions

### P0 -- Immediate (blocks child usability)
1. **Increase all touch targets to 44px minimum** (C-01 through C-09)
2. **Add aria-labels to all interactive elements** (C-22)
3. **Add role="dialog" and focus traps to modals** (C-23, C-25)
4. **Increase body text to 14px minimum, labels to 12px minimum** (C-10 through C-21)

### P1 -- Important (degrades experience)
5. **Add visible hover/active states to all buttons** (W-10, W-11, W-14)
6. **Fix contrast failures: replace #888/#999 text with #666 minimum** (W-04 through W-09)
7. **Add wire connection success/failure feedback** (W-12, W-13)
8. **Increase spacing in ControlBar** (W-15, W-16, W-19)
9. **Add tabIndex to key interactive elements** (C-24)

### P2 -- Nice to Have (polishes experience)
10. **Add component thumbnails to palette** (S-08)
11. **Add educational tooltips** (S-09)
12. **Add in-simulator guided tour** (S-11)
13. **Replace "Semiconduttori" with child-friendly label** (W-25)
14. **Add undo/action toast notifications** (S-14)

---

*Report generated by AGENT-03 -- UX Designer for children's interfaces.*
*Audit method: Static code analysis of JSX, CSS modules, and inline styles.*
*No runtime testing performed; findings based on computed sizes from source code.*
