# P29 — Reference Requirements Synthesis (Simulation Plugin first)

> Deep-research over the reference products, mapped to ARDESIA's roadmap. Sourced firsthand
> (agents read live pages + the official Tinkercad PDF). Generated 2026-07-09.
>
> **Method / access failures (honest):** Tinkercad `/blog` `/learn` are JS-rendered → authoritative
> content taken from the **Official Guide to Tinkercad Circuits PDF** (23pp, read firsthand). `labs-scratch.arduino.cc`
> and StudyFetch's domain are JS-SPA / Cloudflare-blocked → sourced from lineage docs + third-party reviews (flagged).
> **postit.ai is UNVERIFIABLE** — domain network-refused, not indexed; only indexed match is unrelated "Posit AI"
> (R/Python data-science). Do NOT design against postit.ai without a real URL/screenshot.

## Executive summary — steal-first for `io.ardesia.simulation`

The parity target is **Tinkercad Circuits**, and its whole value is a small set of concrete affordances,
most of which ARDESIA can add incrementally on top of the already-built scene/canvas:

1. **One giant "Start Simulation" button** that animates the board (LED glows, code runs). Highest ROI.
2. **Drag-in "Starters"**: pre-wired working circuits with editable code — remix, don't start blank. Maps to ELABTutor "già montato".
3. **Click-pin → drag → click** wiring; **number keys 0–9 recolor** the selected wire.
4. **Breadboard occupancy model**: rows a–e / f–j split by a center ravine, +/− power rails; hovering highlights electrically-shared holes. (ARDESIA already rejects occupied holes in `montaggio-canvas.spec.ts`.)
5. **Single-click Component Inspector** popup to set R / battery count / LED color inline.
6. **In-sim instruments**: multimeter (V-parallel / A-series / R), scope, Serial Monitor + Plotter — students *measure*.
7. **Tri-modal code view** Blocks → Blocks+Text → Text with **live C++ auto-gen** + one-way "Are you sure?" guardrail.
8. **Guided lesson**: left instruction sidebar + step counter ("5/7") + Next — wraps the free canvas as a tutorial.

From study-AI tools, the highest-leverage study loop is **one upload → full kit** with **page-anchored citations**
(pairs with ARDESIA's existing `document:sha256` PDF anchoring), plus **clickable step objects on the canvas**.

---

## A. Circuit simulation + block coding

### A1. Tinkercad Circuits — PARITY TARGET (exact mechanics)

| Feature | Mechanic (testable) | Source |
|---|---|---|
| Start Simulation | one toolbar button → static schematic becomes live-animated | Official Guide PDF p.5 |
| Starters | drag-in pre-built circuits: Basic / Arduino / Micro:bit / Assemblies; ship editable code | PDF p.5-7 |
| Component panel | right side, "Basic" curated set + dropdown "All Components" + search bar | PDF p.4-5 |
| Canvas | 2D; select-drag move; pan on empty drag; scroll/Cmd±/2-finger zoom; **F = zoom-to-fit** | PDF p.4 |
| Breadboard | outer +/− buses; interior rows split by ravine; cols a–e connected, f–j connected; hover reveals shared holes | mjvo tutorial |
| Wiring | click pin → drag → click; default green; **select wire + press 0–9 → recolor**; bendable ends | PDF p.20; trickycircuit |
| Inspector | **single-click component → inline popup**: resistance / battery count-voltage / LED color | mjvo; DigiKey |
| Shortcuts | **R** rotate · **N** note · **Shift+N** hide notes · **Shift+click** multi-select · **0–9** wire color | PDF p.20-21 |
| Code editor | **Blocks / Blocks+Text / Text**, live C++ auto-gen; blocks→text is one-way with "Are you sure?" modal | PDF p.8-10, p.14 |
| Instruments | multimeter (**V**=parallel/**A**=series/**R**=parallel-across); scope; function gen; **Serial Monitor + Plotter** | canadacad; makeabilitylab |
| Debugger | click line = breakpoint; auto-pause; **hover variable → value**; Step/Resume | PDF p.11, p.17 |
| Error console | auto-pops on error; message + **offending line highlighted red** (Arduino-IDE style) | PDF p.16 |
| Libraries | file-box icon → 11 built-ins (Servo, NeoPixel, LiquidCrystal, Wire…) each with Include | PDF p.15 |
| Correctness-as-signal | LED brightness encodes correctness: bright=right R, dim=R too high, blown=too low | mjvo |
| Guided lessons | left instruction sidebar + step counter "5/7" + Next; 28 Arduino lessons | PDF p.12, p.17 |
| Export/Share | PNG / .brd / EAGLE / Fusion; code → `.ino`; private-by-default; public → embeddable HTML | PDF p.14, p.21 |

### A2. Scratch-Arduino family (Arduino Lab for Scratch, PictoBlox, OttawaSTEM, dido18, cbecc)

**The one architectural takeaway** (consistent across all): **blocks are declared as data; a code
generator emits Arduino/C++; hardware is reached via a Firmata/serial bridge; always a real-time
mode vs upload/offline mode toggle; pins chosen from dropdowns inside blocks, not freehand wiring.**

| Product | Steal | Source |
|---|---|---|
| PictoBlox | Stage Mode (live) vs Upload Mode (transpile→flash); Board menu auto-loads matching palettes; AI blocks (face/speech/ML); Blocks↔Python parity + Junior Blocks | thestempedia; ai.thestempedia docs |
| Arduino Lab / S4A | board-as-sprite + live sensor watcher; fixed pin map as dropdown blocks; Firmata ~75ms | s4a.cat; blog.arduino.cc |
| OttawaSTEM | OpenBlock fork: `blocks_common/horizontal/vertical` + `generators` (codegen) + separate Link bridge app | github OttawaSTEM/scratch-arduino-blocks |
| dido18 | Scratch served on-board at `:7000`; custom Matrix-LED/Modulino blocks; hot-reload | github dido18 |
| cbecc | canonical browser-GUI ↔ local Java bridge ↔ Firmata board | github cbecc |

---

## B. Study-AI tools

| Product | Killer features (steal) | Source |
|---|---|---|
| **Studdy** | scan problem → step-by-step on infinite whiteboard; **tap any step to ask**; **tap concept → explanation+formula+example**; "graph it out"; generate extra practice; voice | studdyai.com; App Store listing |
| **StudyFetch** | **one upload → notes+flashcards+quiz+tests+audio**, scoped to that material; **chat cites back to source page**; spaced-rep flashcards (term/MCQ/fill/audio) with adaptive intervals; adaptive quiz + instant grade + "why right"; **audio Lecture vs Podcast**; notes in 3 depth levels; live-lecture capture; "Tutor Me" guided plan | studyfetch.com; ask-maeve review |
| **SchoolAI** | teacher-authored **Spaces** (code-join); **Dot** assistant (lesson/rubric/differentiation); **Mission Control** live per-student dashboard; sentiment; **smart grouping** by misconception; exit tickets with mastery colors; PowerUps | schoolai.com; teacher-dashboard blog; OpenAI case study |
| **Mixboard** | AI actions **attached to board objects**; in-place natural-language edit; **regenerate / "more like this"** per element; text generated **from board context**; zero-blank-page seed | blog.google Mixboard |

---

## C. ARDESIA requirement mapping

### P0 — First-LED usable in a lesson (on the already-built canvas)
- Big **Start/Stop Simulation** button on the sim post-it; animate LED on solve.
- **First-LED Starter**: battery+resistor+LED+breadboard pre-mounted (already have `elabExperimentCatalog`).
- Wiring: keep click-hole placement (built); add **0–9 wire recolor** + wire-color semantics (already infer red/black/green in `ToolCanvasEmbeddable.tsx:1150`).
- **Single-click component inspector** popup for resistance/LED color/battery.
- Solver diagnoses ≥3 errors (open wire, LED reversed, missing/dangerous R) with plain-language output.
- **Step mode** sidebar + "n/N" counter + Next/Back (built: `simulationStepMode.ts`, `sim-passo-passo.spec.ts`).
- **Volume citation anchored to page** via `document:sha256` (existing) — tap a step → "Vol.2 p.34".
- Export `.lesson`/PDF/MD/HTML + reopen identical (built e2e: `studentpack-artifact`, `saved-lessons`).

### P1 — didactic completion
- 8→20→40→88 experiments; per-experiment common-mistake catalog + diagnostics.
- **Spaced-repetition flashcards** + **adaptive quiz with rationale**, auto-generated from lesson graph.
- **Audio Lecture/Podcast** recap from lesson content; transcript segments linked to concepts.
- In-sim instruments (multimeter V/A/R, Serial Plotter) as measurement affordances.
- Tri-modal Blocks↔C++ code drawer (reuse Scratch-Arduino codegen pattern).

### P2 — plugin ecosystem (each reads graph.query, writes typed events)
WebSearch/Citations · HTML/Interactive · HD Charts · Math · Human Body · Audio/Transcript · Graph · Quiz/Rubric.
Teacher tier: **SchoolAI-style Space + live understanding dashboard + student pack** (ARDESIA "docente-pro").

---

## D. Steal-first shortlist (ranked) for the simulation plugin

1. One-button animated **Start Simulation**.
2. **0–9 wire recolor** + single-click **Component Inspector** popup (cheap, high perceived polish).
3. **Tap-a-step / tap-a-component → law + worked example** (Studdy pattern, native to the canvas).
4. **Page-anchored citations** on every AI claim (reuse `document:sha256`).
5. **First-LED Starter** + guided step sidebar with "n/N" counter.
6. Multimeter (V/A/R) read-out as a measurable number.
7. One-upload → flashcards + quiz + audio recap (StudyFetch loop) — P1.
8. Teacher Space + live dashboard + student pack (SchoolAI) — P1/P2.

## E. Open questions
- **postit.ai**: what is it actually? Need a real URL/screenshot before treating it as a reference.
- Block-coding: does ARDESIA want an in-board Blockly drawer now, or defer? (Scratch-Arduino codegen+Firmata is the proven pattern if yes.)
- Instruments: which does First-LED need (probably just an ammeter read-out to show the 15.3mA)?
