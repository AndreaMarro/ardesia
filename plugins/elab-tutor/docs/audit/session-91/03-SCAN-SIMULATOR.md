# 03 — Simulator Scan (Vol1 + Vol3)
**Data**: 2026-03-08 | **Stato**: DONE | **Bug Count**: 10

## Bugs Found — Vol1 "Accendi il tuo primo LED" + Vol3 Scratch

| # | Sev | Area | Descrizione | Repro | Expected | Actual | Screenshot |
|---|-----|------|-------------|-------|----------|--------|------------|
| S1 | P1 | UX/Navigation | www.elabtutor.school redirects to Netlify vetrina.html instead of Vercel simulator | Navigate to www.elabtutor.school | Redirect to elab-builder.vercel.app | Redirects to funny-pika-3d1029.netlify.app/vetrina.html | ss_1675oz8c2 |
| S2 | P2 | UX/Layout | Experiment list panel stays visible alongside simulator, squeezing breadboard to ~600px | Load any experiment in simulator | Sidebar auto-collapses or full-width breadboard | Left panel (220px) + right panel share space with breadboard | ss_7668cpmlx |
| S3 | P2 | UX/Chat | Closing experiment info panel triggers Galileo chat to auto-appear in same area | Close experiment info panel (X button) | More breadboard space | Galileo chat replaces info panel, covering breadboard | ss_3800rsht1 |
| S4 | P2 | UX/Chat | Switching build mode triggers Galileo chat auto-open | Switch from Libero to Gia Montato or vice versa | Mode switch only, no chat change | Galileo chat appears covering right side of breadboard | ss_5723gelz5 |
| S5 | P2 | UX/Mode | "Gia Montato" shows green checkmark even when other modes active | Select "Libero" mode | Only active mode highlighted | Checkmark persists alongside "Libero" red button | ss_22134f77k |
| S6 | P3 | Estetica | "Libero" mode button uses RED color (danger semantic) instead of neutral/brand color | Select Libero mode | Brand color (navy/lime) for active mode | Red (#E54B3D-ish) button for sandbox mode | ss_22134f77k |
| S7 | P3 | A11y | Two experiment card buttons have NO accessible labels (ref_127, ref_133) | Read accessibility tree | All buttons have aria-label or text | Two buttons return empty label | Accessibility tree audit |
| S8 | P2 | UX/Chat | Switching editor tabs (Blocchi->Arduino C++) triggers Galileo auto-open | Switch from Blocchi to Arduino C++ tab | Tab switch only, no chat | Galileo chat covers code editor | ss_31183evky |
| S9 | P1 | Scratch/CodeGen | scratchGenerator.js produces broken C++ for simple-statement experiments | Load Cap.6 Esp.1 "LED Blink esterno", open Blocchi tab, click Compila | Valid C++ with loop body INSIDE void loop() {} | loop() braces close immediately (line 6), statements orphaned at file scope (lines 7-12). Compile error: "expected constructor, destructor, or type conversion before '(' token" | ss_02765b79x |
| S10 | P2 | UX/State | Compilation errors from previous experiment persist when loading new experiment | Compile failing experiment (Cap.6 Esp.1), then load Cap.7 Esp.2 | Error panel clears on experiment switch | Previous "Riga 7" errors still shown until fresh compile | ss_04711ff5p |

## Root Cause Analysis — S9

**File**: `src/utils/scratchGenerator.js`, lines 54-58
**Root cause**: Template string for `arduino_base` block has closing braces `}` on same line as `${loopCode}` variable without proper newline. When loop body contains only simple statements (DigitalWrite, delay), the closing `}` appears BEFORE the statements.

```javascript
// BROKEN (current):
return `${header}void setup() {
${setupCode}}

void loop() {
${loopCode}}`;

// FIXED would be:
return `${header}void setup() {
${setupCode}
}

void loop() {
${loopCode}
}`;
```

**Affected**: Experiments with ONLY simple statements in loop (e.g., Blink = DigitalWrite + delay)
**NOT affected**: Experiments with compound blocks (if/else, for) — these generate correct code (verified with Cap.7 Esp.2 "Pulsante accende LED" — compiles OK)

## Galileo Auto-Open Pattern (S3/S4/S8)

The Galileo chat auto-appears on multiple triggers:
1. Closing experiment info panel (S3)
2. Switching build modes (S4)
3. Switching editor tabs Blocchi <-> Arduino C++ (S8)
4. Clicking Compila & Carica (observed during testing)

**Root cause hypothesis**: The right-side panel area has a state machine that defaults to showing Galileo when no other panel is active. Any panel close/switch triggers the default state.

## Observations (Not Bugs)
- Toolbar buttons have good aria-labels
- LED glow effect works correctly in Gia Montato
- Component palette shows correct components per volume
- Timer (00:00) visible next to GALILEO button
- Wire mode shortcut (W) documented in button label
- Circuit-only experiment correctly has no Play/Pause buttons
- Scratch side-by-side layout works (Blockly ~60% + CodeEditor ~40%)
- 9 toolbox categories: Logica, Cicli, Matematica, Variabili, Testo, Input/Output, Suono, Servo, Tempo
- Pre-loaded Scratch blocks match experiment intent
- "Codice Generato" title visible in right panel
- Font size controls (A-, 13, A+) work in code panel
- Compound-block experiments (if/else) compile correctly from Scratch
