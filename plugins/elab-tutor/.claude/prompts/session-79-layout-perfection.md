# SESSION 79 — LAYOUT PERFECTION

---

## TASK
I want to **fix the simulator layout so that Editor, Passo Passo, Serial Monitor and breadboard coexist without overlapping** so that a student on iPad or desktop can follow step-by-step build instructions while seeing both the circuit AND the code editor simultaneously.

---

## CONTEXT FILES
First, read these files completely before responding:

- `src/components/simulator/NewElabSimulator.jsx` — main simulator layout, panel orchestration, build mode state
- `src/components/simulator/NewElabSimulator.css` / `ElabSimulator.css` — all simulator layout CSS, panel dimensions, z-index, media queries
- `src/components/simulator/panels/ScratchEditor.jsx` — Blockly editor panel, width/height constraints
- `src/components/simulator/controls/ControlBar.jsx` — toolbar layout, button groups, overflow behavior
- `src/components/simulator/panels/SerialMonitor.jsx` — serial monitor panel, positioning, height
- `src/components/simulator/panels/BuildStepsPanel.jsx` — Passo Passo instructions panel
- `src/styles/design-system.css` — CSS tokens, breakpoints, spacing scale
- `.team-status/SESSION-78-VISUAL-QA-REPORT.md` — full QA results with 4 fixes already applied

---

## REFERENCE
Here is what I want to achieve:

**Tinkercad Circuits** is the gold standard: when code editor is open, the circuit shrinks proportionally but stays VISIBLE. Build instructions overlay on top as a floating card, never hiding the circuit. The serial monitor is a collapsible bottom drawer.

Here's what makes the reference work:

- Always keep the breadboard/circuit VISIBLE regardless of which panels are open
- Always use a split-panel layout where Editor takes max 40% width on desktop, 50% on tablet
- Always make Serial Monitor a collapsible bottom drawer (default: collapsed, 40px tab visible)
- Always make Passo Passo a floating overlay card (top-left, max 320px wide, draggable or dismissible)
- Never let two panels stack vertically on the same side and hide the circuit
- Never hardcode panel widths in px — use %, vw, clamp() with sensible min/max
- Always ensure Blockly workspace has minimum 350px width so block names are readable
- Never let toolbar buttons overflow — use icon-only mode below 1200px, hamburger below 900px
- Always test at these 3 viewports: 1280x800 (desktop), 1024x768 (iPad landscape), 768x1024 (iPad portrait)
- Never break the build flow — "Avanti/Indietro" buttons must ALWAYS be accessible (never covered by other panels)

---

## SUCCESS BRIEF

**Type of output + length:**
Production-ready CSS + JSX changes across 5-8 files, with before/after screenshots at each viewport.

**Recipient's reaction:**
"Finalmente posso vedere il circuito mentre seguo le istruzioni e il codice!" — a 12-year-old student on iPad.

**Does NOT sound like:**
- A hacky z-index war that works on one viewport and breaks another
- CSS `!important` scattered everywhere
- Layout that only works with chat panel hidden
- Pixel-perfect fixed positioning that collapses on any resize

**Success means:**
- Breadboard is ALWAYS visible (min 40% of viewport area) with any combination of panels
- Passo Passo instructions readable while circuit is visible
- Serial Monitor doesn't cover interactive elements
- Toolbar never overflows or truncates button labels
- All 3 viewports (desktop, iPad landscape, iPad portrait) pass visual inspection
- 0 build errors, 0 regressions on existing 69 experiments

---

## RULES

My context file (MEMORY.md) contains these standards, constraints, and landmines:

- **Palette**: Navy `#1E4D8C`, Lime `#7CB342`, Vol3 `#E54B3D`. All colors via CSS tokens from `design-system.css`
- **Force-light theme**: static `data-theme="light"` — never reference dark mode
- **CSS vars centralized** in `design-system.css` — `--font-sans`, `--font-display`, `--font-mono`
- **Build mode selector UNICO**: only the bar in `NewElabSimulator.jsx` (~line 2397). The one in `ExperimentPicker.jsx` was REMOVED
- **Touch targets**: minimum 44x44px (WCAG). Toolbar buttons already comply
- **iPad CSS (S74)**: `touch-action: none` on `.elab-simulator-canvas`, `touch-action: manipulation` on `.toolbar`
- **Blockly lazy-loaded (S75)**: `React.lazy()` + Suspense, ~2MB chunk. Don't break code splitting
- **Serial Monitor (S53)**: Font 15px Fira Code, line-height 1.75, panel height 280px/40dvh
- **CRITICAL**: `PRODOTTO/elab-builder` is the project folder, NOT `elab-website`
- **Deploy**: `npm run build && npx vercel --prod --yes`

If you're about to break one of these rules, stop and tell me.

---

## CONVERSATION

DO NOT start executing yet. Instead, ask me clarifying questions (use `AskUserQuestion` tool) so we can refine the approach together step by step.

Key decisions I need your input on:
1. Should Passo Passo become a floating card or stay as a side panel?
2. Should Editor auto-collapse when Passo Passo is active, or coexist?
3. iPad portrait: should we force landscape-only for the simulator, or design a stacked vertical layout?

---

## PLAN

Before you write anything, list the 3 rules from my context file that matter most for this task.

Then give me your execution plan (5 steps maximum).
Only begin work once we've aligned.
