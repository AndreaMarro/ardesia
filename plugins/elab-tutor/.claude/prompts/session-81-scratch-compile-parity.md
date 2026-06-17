# SESSION 81 — SCRATCH = C++ (Pari Dignita)

---

## TASK
I want to **make Scratch blocks a first-class citizen with equal dignity to Arduino C++** so that when a student drags blocks, the C++ translation appears in real-time, auto-compiles, and the simulation runs — identical workflow to typing C++ manually. Scope: **only Vol3 experiments** (13 experiments, 7 already have `scratchXml`). The remaining 6 Vol3 experiments get a universal default Scratch template.

---

## CONTEXT FILES
First, read these files completely before responding:

- `src/components/simulator/panels/ScratchEditor.jsx` — Blockly workspace, ELAB theme, onChange callback (387 lines)
- `src/components/simulator/panels/scratchGenerator.js` — Arduino C++ generator from Blockly blocks (304 lines, 18 custom blocks + 10 standard overrides)
- `src/components/simulator/panels/scratchBlocks.js` — 18 custom Arduino block definitions, pin dropdowns, tooltips in Italian (311 lines)
- `src/components/simulator/NewElabSimulator.jsx` — Master simulator: `editorMode` state, `codeNeedsCompileRef`, `handleCompileOnly()`, ScratchEditor onChange at line 3802, Scratch tab gating at line 3750 (`currentExperiment?.scratchXml`)
- `src/data/experiments-vol3.js` — 13 experiments, 7 with `scratchXml` field, 5 with `scratchSteps`. The 6 WITHOUT scratchXml need a default template
- `src/services/api.js` — `compileCode()` function, sends Arduino C++ to compiler endpoint
- `nanobot/prompts/scratch.yml` — Galileo's Scratch knowledge base (125 lines)
- `nanobot/prompts/code.yml` — Code specialist prompt, `scratch_editor` section added S80
- `nanobot/server.py` — Intent routing, Scratch keywords (lines 157-160), deterministic fallback (lines 962-971)
- `src/styles/design-system.css` — CSS tokens, palette, spacing scale

---

## REFERENCE
Here is what I want to achieve:

**Tinkercad Circuits block-to-code parity**: In Tinkercad, when you drag blocks in the visual editor, the C++ code appears side-by-side in real-time. You press "Start Simulation" and it compiles and runs. There is ZERO friction between visual blocks and textual code. Both are equal citizens.

Here's what makes this reference work (rules extracted):

- Always show real-time C++ preview when in Scratch mode — split view: blocks left (60%), generated code right (40%) with syntax highlighting
- Always auto-compile when the student presses Play (▶) — same flow as C++ mode, no extra steps
- Always show compilation status (success/error) identically for both Scratch and C++ modes
- Always allow the Scratch tab on ALL Vol3 experiments, not just those with `scratchXml` — create a universal `arduino_base` default template for the 6 Vol3 experiments without pre-built block XML
- Always sync bidirectionally: blocks → C++ (already works), AND switching from Scratch to Arduino tab preserves the generated code in the Arduino editor
- Always show compile errors in the Scratch view too — if the generated C++ has errors, display them below the blocks with line mapping hints
- Always debounce code generation (300ms) to avoid overwhelming the compiler on every block move
- Always persist Scratch workspace per experiment in localStorage (already partially done)
- Never gate the Scratch tab behind `scratchXml` for Vol3 — every Vol3 experiment gets a Scratch option with sensible defaults (Vol1/Vol2 remain Arduino-only for now)
- Never lose code when switching tabs — Arduino→Scratch preserves Arduino code, Scratch→Arduino shows generated C++ from blocks
- Never auto-compile on every block change (performance) — only on Play or explicit Compile button
- Always maintain the scratchSteps Passo Passo flow for experiments that have it (backward compatible)

---

## SUCCESS BRIEF

**Type of output + length:**
Production-ready JSX + CSS changes across 5-8 files. Core: ScratchEditor split-view, auto-compile on Play, Scratch tab ungating, code sync. No YAML/nanobot changes needed (S80 already complete).

**Recipient's reaction:**
"Finalmente! Trascino i blocchi, vedo il C++ generato, premo Play e funziona. Identico a scrivere codice a mano."

**Does NOT sound like:**
- A half-working prototype where Scratch is a second-class feature
- An editor that generates code but you can't actually run it
- A mode locked to 7 experiments when there are 13 in Vol3
- A visual toy disconnected from the real compiler pipeline

**Success means:**
1. Student opens ANY Vol3 experiment (13/13) → Scratch tab available
2. Student drags blocks → C++ code preview updates in real-time (split-view or tab toggle)
3. Student presses ▶ Play → code compiles + simulation starts (zero extra steps vs C++)
4. Compilation errors are visible in BOTH modes equally
5. Ralph Loop 3/3 PASS: (1) text "come uso scratch?" (2) action "apri i blocchi" → editor opens (3) drag blocks → compile → LED blinks

---

## RULES

My context file (MEMORY.md) contains my standards, constraints, and landmines. Read it fully before starting. Key rules:

1. **CRITICAL**: All projects under `PRODOTTO/` subfolder — Netlify folder is `PRODOTTO/newcartella` NOT `elab-website`
2. **CRITICAL**: All env var URL reads MUST use `.trim()` — Vercel env vars can contain trailing `\n`
3. **Chain of Verification (CoV)**: ogni componente/esperimento va verificato punto per punto col PDF prima di essere confermato
4. **Force-light theme**: static `data-theme="light"` on `<html>` tag
5. **Palette**: Navy `#1E4D8C`, Lime `#7CB342`, Vol1 `#7CB342`, Vol2 `#E8941C`, Vol3 `#E54B3D`
6. **Fonts**: Tutor uses Oswald + Open Sans + Fira Code
7. **Build mode selettore UNICO** (S32): solo la barra grande in `NewElabSimulator.jsx`
8. **0 build errors, 0 regressions** — 69 experiments MUST all still work
9. **Deploy**: Vercel (`npm run build && npx vercel --prod --yes`), `.vercelignore` excludes 2.3GB GGUF

If you're about to break one of my rules, stop and tell me.

---

## CONVERSATION

DO NOT start executing yet. Instead, ask me clarifying questions (use 'AskUserQuestion' tool) so we can refine the approach together step by step.

Before you write anything, list the **3 rules from my context file that matter most for this task**.

---

## EXECUTION PLAN (5 steps maximum)

Then give me your execution plan. Only begin work once we've aligned.

### FASE 0 — Scratch Tab Ungating for Vol3 + Default Template
Change the Scratch tab gate (line 3750) from `currentExperiment?.scratchXml` to `currentExperiment?.volume === 3` (or equivalent Vol3 check). Create a universal `getDefaultScratchXml()` that generates a sensible `arduino_base` template with empty Setup/Loop for the 6 Vol3 experiments without pre-built XML. All 13 Vol3 experiments get the Scratch tab.

### FASE 1 — Real-Time C++ Preview (Split View)
When `editorMode === 'scratch'`, show a read-only C++ preview panel below or beside the Blockly workspace. The preview updates on every block change (debounced 300ms). Uses the same syntax highlighting as the Arduino CodeMirror editor (or a lightweight `<pre>` with Arduino keywords highlighted). The student sees exactly what their blocks produce.

### FASE 2 — Compile Parity
Ensure `handlePlay()` treats Scratch identically to Arduino C++:
- `codeNeedsCompileRef` is already set `true` on Scratch block change (line 3806) ✅
- `setEditorCode(generatedCode)` already syncs generated C++ (line 3805) ✅
- `handlePlay()` already auto-compiles when `codeNeedsCompileRef.current === true` (line 1881) ✅
- **Missing**: compile error display in Scratch mode — add error banner below blocks
- **Missing**: "Compila" button in Scratch toolbar (not just on Play)
- **Missing**: compilation status indicator (spinner/checkmark/X) in Scratch mode header

### FASE 3 — Quality Audit + Ralph Loop
Run `/quality-audit` skill:
- Font sizes ≥ 12px in Scratch panels
- Touch targets ≥ 44px for Scratch toolbar buttons
- WCAG contrast on split-view code preview
- Bundle size delta (ScratchEditor already ~2MB chunk)

Run `/ralph-loop` 3/3:
1. **Text**: "come funziona scratch?" → Galileo explains blocks, suggests opening editor
2. **Action**: "apri i blocchi" → [AZIONE:openeditor] [AZIONE:switcheditor:scratch] → Scratch editor opens
3. **Full flow**: Open Blink experiment → Scratch tab → drag DigitalWrite block → see C++ preview → press Play → LED blinks in simulator

### FASE 4 — Deploy + MEMORY.md
- Build verification: `npm run build` → 0 errors
- Vercel deploy: `npx vercel --prod --yes`
- Update MEMORY.md: Scratch score 7/10 → target 9/10
- Update Scratch/Blockly Architecture section with S81 details

---

## ALIGNMENT

**Verify these 3 most-important rules before starting:**
1. `0 build errors, 0 regressions` — 69 experiments MUST all still work after Vol3 Scratch ungating
2. `codeNeedsCompileRef` flow is already wired for Scratch (lines 3806 + 1881) — do NOT reinvent the compile pipeline
3. `.vercelignore` must exclude heavy files — ScratchEditor is already lazy-loaded (~2MB chunk)

**Metrics for "done":**
- [ ] 13/13 Vol3 experiments show Scratch tab (Vol1/Vol2 unchanged)
- [ ] Blocks → C++ preview visible in real-time
- [ ] Play button compiles Scratch-generated code identically to Arduino C++
- [ ] Compile errors shown in Scratch mode
- [ ] Ralph Loop 3/3 PASS
- [ ] Quality Audit: font ≥12px, touch ≥44px, contrast ≥4.5:1
- [ ] Build 0 errors, Vercel deploy success
- [ ] Scratch score: 7/10 → 9/10
