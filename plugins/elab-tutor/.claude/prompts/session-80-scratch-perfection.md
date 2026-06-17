# SESSION 80 — SCRATCH PERFECTION

---

## TASK
I want to **fix the Scratch/Blockly editor crash, integrate code step-by-step building into Passo Passo mode, and make Galileo fully Scratch-aware** so that a student can follow a guided build of BOTH hardware AND code/blocks — the complete experiment — without crashes, on PC and iPad, with everything readable and no visual chaos.

---

## CONTEXT FILES
First, read these files completely before responding:

- `src/components/simulator/panels/ScratchEditor.jsx` — Blockly workspace, ELAB theme, crash source (386 lines)
- `src/components/simulator/panels/scratchBlocks.js` — 18 custom Arduino block definitions, `blockly/core` import conflict
- `src/components/simulator/panels/scratchGenerator.js` — C++ code generator from Blockly blocks, missing generators
- `src/components/simulator/NewElabSimulator.jsx` — gating logic (line ~1561 `simulationMode === 'avr'`), Scratch lazy loading, tab toggle, build step progression
- `src/components/simulator/panels/ComponentDrawer.jsx` — Passo Passo floating card, step rendering, hardware-only steps
- `src/components/tutor/ElabTutorV4.jsx` — AI action tag dispatch (lines 1780-1810: openeditor, closeeditor, switcheditor, loadblocks)
- `nanobot/prompts/scratch.yml` — Galileo's Scratch knowledge (125 lines, injected at runtime)
- `nanobot/prompts/code.yml` — Code specialist (ZERO Blockly XML knowledge)
- `nanobot/prompts/circuit.yml` — Circuit specialist (lists Scratch tags, no examples)
- `nanobot/server.py` — deterministic fallbacks (lines 897-972), intent routing (missing Scratch verbs)
- `src/data/experiments-vol3.js` — experiment data with `scratchXml` field, buildSteps (hardware-only)
- `src/styles/design-system.css` — CSS tokens, palette, spacing scale
- `.team-status/SESSION-75-REPORT.md` — audit with Scratch 4/10, estetica 5/10, iPad 3/10

---

## REFERENCE
Here is what I want to achieve:

**Tinkercad Circuits + Scratch hybrid**: when a student follows "Passo Passo", the guided flow covers BOTH hardware assembly (place resistor, wire LED) AND code construction (drag digitalWrite block, connect to pin 13, add delay). The Scratch workspace updates step-by-step just like components appear on the breadboard. At the end, hardware + code are complete and ready to simulate.

Here's what makes this reference work (rules):

- Always wrap ScratchEditor in a React ErrorBoundary with graceful fallback ("Errore nell'editor blocchi. Prova Arduino C++")
- Always standardize ALL Blockly imports to `import * as Blockly from 'blockly'` (NOT `blockly/core`)
- Always guard `Blockly.Events.UI` with optional chaining: `event?.type === Blockly.Events?.UI`
- Always add missing generators (`logic_boolean`, `arduino_random`) before any other Scratch work
- Always restore Scratch workspace from localStorage on experiment change
- Always add a `type` field to buildSteps: `'hardware'` | `'code'` | `'scratch'`
- Always make code/scratch steps show a mini floating card with block instructions (same style as hardware Passo Passo card)
- Always make Scratch steps auto-open the editor AND switch to Blocchi tab via `[AZIONE:openeditor] [AZIONE:switcheditor:scratch]`
- Never hide the breadboard when Scratch editor is open — Editor max 40% width (Session 79 clamp rules)
- Never let Scratch workspace be smaller than 300px width — block names must be readable
- Always add `[AZIONE:loadblocks:XML]` generation capability to `code.yml` with Blockly XML examples
- Always add Scratch routing verbs to `server.py` intent detection ("blocchi", "scratch", "programma a blocchi")
- Always test at 1280x800, 1024x768, 768x1024 using Claude Control Chrome
- Always run Ralph Loop 3/3 after ALL changes: (1) text chat about Scratch, (2) action tag "apri i blocchi", (3) Passo Passo code step progression
- Always run Quality Audit after changes for font sizes, touch targets, WCAG compliance
- Never break existing 69 experiments — 0 build errors, 0 regressions

---

## SUCCESS BRIEF

**Type of output + length:**
Production-ready JSX + CSS + YAML changes across 10-15 files. Error boundary, crash fixes, buildSteps code progression, Galileo integration, visual verification at 3 viewports.

**Recipient's reaction:**
"Ora posso costruire il circuito E il programma passo dopo passo, senza crash!" — a 10-year-old student building their first LED blink with Scratch blocks on an iPad.

**Does NOT sound like:**
- A Blockly workspace that freezes or shows infinite spinner
- Code steps dumped all at once instead of progressive reveal
- Scratch editor that covers the entire screen hiding the breadboard
- AI that says "non conosco i blocchi" when asked about Scratch
- Font sizes below 12px or touch targets below 44px
- Layout chaos where panels overlap randomly on iPad

**Success means:**
- ScratchEditor loads WITHOUT crash on any experiment (Vol1/2/3)
- Passo Passo shows hardware steps THEN code/scratch steps in sequence
- Code steps update the Scratch workspace progressively (step 1: base block, step 2: add digitalWrite, etc.)
- Galileo can open/close/switch editor, suggest blocks, AND generate simple Blockly workspaces
- Ralph Loop 3/3 PASS: text + action + code-step progression
- Quality Audit PASS: fonts ≥12px, touch ≥44px, contrast ≥4.5:1
- Build 0 errors, deploy to https://www.elabtutor.school

---

## RULES

My context file (MEMORY.md) contains these standards, constraints, and landmines:

### The 3 rules that matter most for this task:

1. **Blockly lazy-loaded (S75)**: `React.lazy()` + Suspense, ~2MB chunk. Don't break code splitting. ScratchEditor must remain lazy-loaded
2. **buildSteps posizione finale (MEMORY)**: in "Passo Passo", ogni "Avanti" piazza il pezzo nella posizione FINALE del libro. The same principle applies to code steps — each step should show the FINAL code for that step, not intermediate states
3. **Chain of Verification (CoV)**: ogni componente/esperimento va verificato punto per punto. Apply this to code steps too — each code step must be verified against the expected Blockly XML

### Additional constraints:
- **Palette**: Navy `#1E4D8C`, Lime `#7CB342`. All colors via CSS tokens
- **Force-light theme**: static `data-theme="light"`
- **CSS vars centralized** in `design-system.css`
- **Fonts**: Oswald (display) + Open Sans (body) + Fira Code (code) in the simulator
- **Touch targets**: minimum 44x44px (WCAG)
- **iPad CSS (S74)**: `touch-action: none` on canvas, `touch-action: manipulation` on toolbar
- **Serial Monitor (S53)**: Font 15px Fira Code, panel height 280px/40dvh
- **Vision Identity Rule (S62+)**: Galileo NEVER reveals internal architecture
- **Deploy**: `cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes`
- **Nanobot deploy**: `cd "VOLUME 3/PRODOTTO/elab-builder/nanobot" && git add -A && git commit && git push` (auto-deploys on Render)

If you're about to break one of these rules, STOP and tell me.

---

## PLUGINS & VERIFICATION

Use ALL of these tools during the session:

### 🔧 Claude Control Chrome (Visual Verification)
After EACH phase, open the simulator in Chrome via `preview_start` (config: `elab-builder-dev`, port 5173):
1. Navigate to `http://localhost:5173/#tutor`
2. Click "Simulatore" tab → Vol3 → Capitolo 6 → Esp. 1
3. Verify at **3 viewports**: `preview_resize` to 1280x800, 1024x768, 768x1024
4. Take `preview_screenshot` at each viewport
5. Check `preview_console_logs` for errors

### 🔍 Quality Audit (skill: `quality-audit`)
Run after Phase 3 to verify:
- Font sizes ≥ 12px everywhere
- Touch targets ≥ 44x44px
- Color contrast ≥ 4.5:1
- Bundle size not regressed
- Build health: 0 errors, 0 warnings (except known chunk size)

### 🔄 Ralph Loop (skill: `ralph-loop:ralph-loop`)
Run after Phase 4 as final integration test:
1. **Text**: Ask Galileo "come funzionano i blocchi scratch?" → expect educational response about Blockly
2. **Action**: Say "apri i blocchi" → expect `[AZIONE:openeditor] [AZIONE:switcheditor:scratch]` → editor opens on Blocchi tab
3. **Code step**: Load experiment in "Passo Passo" → advance to code step → expect Scratch workspace updates

### 🧠 Serena (context persistence)
Use `write_memory` to save key decisions to memory after each phase. Use `read_memory` at session start.

---

## CONVERSATION

DO NOT start executing yet. Instead, ask me clarifying questions (use `AskUserQuestion` tool) so we can refine the approach together step by step.

Key decisions I need your input on:

1. **Scratch per Vol1/2**: Should Scratch be available for ALL experiments (remove `simulationMode === 'avr'` gate), or only for experiments that have a `scratchXml` field?
2. **Code steps in buildSteps**: Should code steps be defined per-experiment in `experiments-vol3.js` (manually authored), or auto-generated from the `scratchXml` field (split into progressive blocks)?
3. **Galileo Blockly XML generation**: Should Galileo be able to generate complete Blockly workspaces from natural language ("fai lampeggiare un LED"), or just suggest which blocks to drag?

---

## PLAN

Before you write anything, list the 3 rules from my context file that matter most for this task.

Then give me your execution plan (5 phases maximum), following this structure:

### FASE 0 — Crash Fix (BLOCCANTE)
Fix the 4 crash causes before touching anything else:
1. Standardize imports: `blockly/core` → `blockly` in scratchBlocks.js
2. Add ErrorBoundary wrapper around ScratchEditor in NewElabSimulator.jsx
3. Guard `Blockly.Events.UI` with optional chaining in ScratchEditor.jsx line 332
4. Add missing generators: `logic_boolean`, `arduino_random` in scratchGenerator.js
5. Restore Scratch localStorage on experiment change
6. **VERIFY**: Open Scratch on Vol3 experiment → no crash → `preview_screenshot`

### FASE 1 — Code Steps in Passo Passo
Extend buildSteps data structure to support code/scratch steps:
1. Add `type: 'hardware' | 'code' | 'scratch'` field to buildSteps
2. Add `scratchSteps` to 3-5 key Vol3 experiments (LED Blink, SOS Morse, Sirena 2 LED, Semaforo, Simon)
3. Modify ComponentDrawer to render code steps with different icon (🧩 instead of 🔧)
4. Auto-open editor + switch to Blocchi when advancing to a `type: 'scratch'` step
5. Progressive Scratch workspace: each code step loads cumulative XML
6. **VERIFY**: Passo Passo on LED Blink → hardware steps → code steps → Scratch updates → `preview_screenshot` at 3 viewports

### FASE 2 — Galileo + Scratch Integration
Make the AI fully Scratch-aware:
1. Add Blockly XML generation examples to `code.yml` (3 common patterns: blink, read, tone)
2. Add Scratch routing verbs to `server.py` intent detection
3. Add `[AZIONE:loadblocks:XML]` usage guidelines to `nanobot.yml` system prompt
4. Expand `deterministic_action_fallback` with Scratch patterns
5. **VERIFY**: Ralph Loop 3/3 → text + action + code step

### FASE 3 — Visual Polish + iPad
Ensure everything is readable on all viewports:
1. Scratch workspace min-width 300px, font ≥ 12px
2. Code step card styling (consistent with hardware Passo Passo card)
3. iPad landscape: editor + breadboard coexist (Session 79 clamp rules)
4. iPad portrait: RotateDeviceOverlay (Session 79)
5. **VERIFY**: Quality Audit skill → screenshots at 3 viewports → all pass

### FASE 4 — Deploy + Final Verification
1. `npm run build` — 0 errors
2. Deploy Vercel: `npx vercel --prod --yes`
3. Deploy nanobot: `git push` to Render
4. Ralph Loop 3/3 on production URL
5. Update MEMORY.md scores

---

## ALIGNMENT

Only begin work once we've aligned on:
- [ ] Crash fixes list confirmed
- [ ] Vol1/2 Scratch gating decision
- [ ] Code steps authoring approach (manual vs auto-generated)
- [ ] Galileo XML generation scope
- [ ] Phase execution order approved

Then execute phase by phase, with `preview_screenshot` verification after EACH phase.
