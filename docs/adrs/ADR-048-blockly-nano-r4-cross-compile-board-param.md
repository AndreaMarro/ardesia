# ADR-048 — Blockly Nano R4 Cross-Compile Board Param (Phase 1 R1+R2)

**Status**: DRAFT — pending Andrea ratify Q1+Q2+Q3 (~5-10 min Andrea action)
**Date**: 2026-05-15
**Iteration**: 60 (Phase 1 of PRD `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`)
**Architect**: ARCHITECT subagent (ultrathink coordinator dispatch)
**Numbering note**: requested slug `ADR-032-blockly-nano-r4-cross-compile-board-param.md` collides with existing `ADR-032-vertex-eu-frankfurt-migration.md`. Filed under next free slot ADR-048 to preserve production-active Vertex ADR. Andrea may rename if preferred.

---

## 1. Status

DRAFT. Three Andrea ratify questions block ACCEPTED transition:
- **Q1**: default board iter 59 = Nano R4 OR Nano classic AVR? (decision driver: backward compat vs current kit Omaric alignment)
- **Q2**: PREREQ — `arduino-cli core install arduino:renesas_uno` already installed on n8n compile server (`https://n8n.srv1022317.hstgr.cloud/compile`)?
- **Q3**: UNO R4 variant in allowlist — `arduino:renesas_uno:unor4wifi` OR `arduino:renesas_uno:minima` OR both?

Once Andrea answers Q1+Q2+Q3, ADR transitions to ACCEPTED. No code edits this ADR (read-only architecture).

---

## 2. Context

**Cross-compile mandate iter 58+59 doppia conferma** (Codex Pattern C-V + Lino+Riccardo iter 59):
- ELAB kit Omaric hardware = NanoBreakout V1.1 GP based on **Arduino Nano R4** (Renesas RA4M1 ARM Cortex-M4 48MHz, NOT AVR ATmega328p)
- Software simulator continues emulating AVR ATmega328p via `avr8js` (CPU emulation in-browser preserved)
- BUT firmware uploaded to physical kit MUST target Renesas Nano R4 (FQBN `arduino:renesas_uno:*`)
- Cross-compile = emulate AVR in-browser (avr8js) + compile-for-upload Renesas R4 server-side (arduino-cli n8n)

**Codex iter 58+59 cross-compile recon CONFIRM** (Pattern C-V verify-codegen-output):
- `src/components/simulator/panels/scratchGenerator.js:4` (`scratchGenerator.js:5` post-import comment) — custom `new Blockly.Generator('Arduino')` targets **GENERIC Arduino C++** — NO board-specific macros, NO `#ifdef __AVR__`, NO `#ifdef __RENESAS__`
- `scratchGenerator.js:37` `arduino_base` root SETUP+LOOP deterministic — no board branching
- Generic C++ output compiles equally on AVR and Renesas via arduino-cli with different FQBN parameter — **board param is purely a compile-target switch, not a codegen branch**
- Anti-pattern explicit (preserve iter 60+): do NOT add `#ifdef __RENESAS__` or board-specific helpers in scratchGenerator — keeps single codepath, single test surface, single mental model

**api.js compile chain facts** (`src/services/api.js`):
- L60 `DEFAULT_BOARD = 'arduino:avr:nano:cpu=atmega328old'`
- L61-64 `ALLOWED_COMPILE_BOARDS = new Set(['arduino:avr:nano:cpu=atmega328old', 'arduino:avr:uno'])`
- L1293 `compileCode(code, board = 'arduino:avr:nano:cpu=atmega328old')` — board param already plumbed
- L1294 `safeBoard = ALLOWED_COMPILE_BOARDS.has(board) ? board : DEFAULT_BOARD` — allowlist gate
- L1316 `body: JSON.stringify({ code, board: safeBoard })` — passed to compile endpoint
- L1340-L1376 fallback chain: Supabase proxy → n8n standalone server → backend webhook → local dev server (board param flows through all)

**Current UI state**:
- `src/components/simulator/panels/ScratchEditor.jsx` 506 LOC (27256 bytes, `wc -l` verified) — NO board selector UI present
- Default compile call uses DEFAULT_BOARD AVR Nano implicitly (no user selection)

---

## 3. Decision Drivers

- **Riccardo iter 59 mandate**: "termina prima resto" → Workstream B P0 PRIMARIO, Blockly Phase 1 = P0 QUICK WIN compatibile ~6-8h
- **Lino iter 59 mandate**: "strada più facile + chiudere loop velocemente" — pick simplest Phase 1, defer UX overhaul Phase 2+3 iter 66+ post Q8 pilot test gate
- **Andrea iter 60 mandate**: "padroni del prodotto" + G45 anti-inflation + zero regression vitest 13118 + validator 94/94
- **Cross-compile honest constraint**: NO web upload Phase 1 (avr8js emulates AVR not Renesas; physical upload still requires Arduino IDE locale + USB cable on docente machine)

---

## 4. Option A — Backward-Compat Default (RECOMMENDED)

**Q1 implied = AVR-default + extend allowlist + UI radio in compile region**

### Implementation surface
- `src/services/api.js:60` `DEFAULT_BOARD` **unchanged** = `'arduino:avr:nano:cpu=atmega328old'`
- `src/services/api.js:61` `ALLOWED_COMPILE_BOARDS` extend with 2 Renesas FQBN (Q3 dependent):
  ```js
  const ALLOWED_COMPILE_BOARDS = new Set([
      'arduino:avr:nano:cpu=atmega328old',  // legacy AVR (default)
      'arduino:avr:uno',                    // legacy AVR UNO
      'arduino:renesas_uno:unor4wifi',      // NEW iter 59 (if Q3=wifi or both)
      'arduino:renesas_uno:minima',         // NEW iter 59 (if Q3=minima or both)
  ]);
  ```
- New component `src/components/simulator/panels/BoardSelector.jsx` ~30 LOC — radio toggle 2-3 options in `ScratchEditor.jsx` compile region (above Compile button)
- localStorage persist `elab-compile-board` key (per-docente preference, restored on mount)
- Hook into `useSimulatorAPI.js` compile call → `compileCode(code, selectedBoard)`

### Pros
- **Zero regression risk** on existing 13 Vol3 esperimenti AVR path (default unchanged)
- **Minimal scope ~6h** (single new component + 1 line allowlist + localStorage glue)
- **Vitest 13118 + validator 94/94 preserved** (no codegen change, only compile-target switch)
- Lino "strada più facile" mandate ✓
- Riccardo "termina prima resto" mandate ✓ (P0 quick win compatibile Workstream B)
- Codex Pattern C-V verify-codegen-output remains identical (single generic C++ output, parametric per board-FQBN at compile endpoint)

### Cons
- Docente must **explicitly switch** to Nano R4 per lezione (extra click) — mitigated by localStorage persistence (one-time switch sticks across sessions)
- Default AVR no longer matches current Omaric kit hardware (mismatch flagged in UI, but no auto-correction)

### Scope estimate
~6h (component 2h + allowlist 0.5h + localStorage 0.5h + tests 1h + Codex Pattern C-V verify 1h + smoke prod n8n PREREQ verify 1h)

---

## 5. Option B — New-Direction Default

**Q1 implied = Nano-R4-default + Andrea Q3 single variant + UI dropdown in app settings**

### Implementation surface
- `src/services/api.js:60` `DEFAULT_BOARD` **changed** = `'arduino:renesas_uno:unor4wifi'` (or `:minima` per Q3)
- `src/services/api.js:61` AVR kept in allowlist as legacy fallback
- Dropdown selector in app settings panel (NOT compile region) — less ergonomic for per-lezione switch
- Default board now aligned with current Omaric kit hardware

### Pros
- **Aligned with current kit hardware** (Omaric NanoBreakout V1.1 GP = Renesas R4)
- No docente click required for new lezioni (default-correct out of box)

### Cons
- **BREAKS existing 13 Vol3 esperimenti AVR default path** (regression risk HIGH — every existing user flow now hits Renesas compile by default, including teachers with AVR kits from older Omaric batches OR Arduino UNO classic legacy)
- Vol3 esperimenti tested only on AVR path historically — Renesas compile may surface latent codegen incompatibilities (e.g., Renesas Arduino core handles `Servo.h` / `LiquidCrystal.h` library versions differently)
- Settings-panel dropdown UX less discoverable than compile-region radio
- Lino "strada più facile" mandate ✗ (more risk, longer regression sweep)

### Scope estimate
~8-10h (dropdown UI 3h + DEFAULT_BOARD swap 0.5h + regression sweep 13 Vol3 esperimenti × Renesas compile verify 4h + tests 2h)

---

## 6. Option C — Both Available + Smart Lesson-Path Detection

**Q3 implied = both Renesas FQBN + UI radio compile region + auto-detect via Vol context**

### Implementation surface
- Both Renesas FQBN in allowlist (Option A allowlist extension)
- Radio toggle compile region BUT defaults from lesson-path `targetBoard` JSON field (NEW field)
- Schema extension: `src/data/lesson-paths/*.json` (94 files) get new optional field:
  ```json
  { "targetBoard": "arduino:avr:nano:cpu=atmega328old" }  // Vol1, Vol2 (AVR legacy)
  { "targetBoard": "arduino:renesas_uno:unor4wifi" }      // Vol3 (Renesas R4)
  ```
- localStorage override per-docente (radio still wins over JSON default if user explicitly switched)

### Pros
- **Maximum flexibility + minimum surprise per chapter context** (Vol1/Vol2 stays AVR familiar, Vol3 auto-switches Renesas)
- Morfismo Sense 2 strengthened (lesson-path metadata richer + kit-coupled)
- No regression on Vol1/Vol2 (still AVR default)

### Cons
- **Scope creep ~10-12h** vs 6h Option A
- Requires **94 lesson-paths schema extension** (94 file edits + validator regression risk)
- Lino "strada più facile" mandate ✗ (most complex of 3)
- Riccardo "termina prima resto" mandate ✗ (longest delivery, blocks Workstream B P0)
- Validator 94/94 must extend schema regex check — non-trivial

### Scope estimate
~10-12h (Option A baseline 6h + 94 JSON edits 2h + validator schema extension 1h + auto-detect hook 1h + tests 2h)

---

## 7. Recommended: **Option A**

### Rationale
- Lino "strada più facile + chiudere loop velocemente" ✓ (6h scope vs 8-12h)
- Riccardo "termina prima resto" ✓ (Workstream B P0 PRIMARIO compatibile)
- Zero regression risk on existing 13 Vol3 esperimenti AVR path
- Vitest 13118 + validator 94/94 preserved without schema extension
- Codex Pattern C-V verify-codegen-output stays single-codepath (generic C++ + parametric FQBN at compile endpoint, NO `#ifdef` branching in `scratchGenerator.js`)
- Andrea Q3 can be `unor4wifi` (modal default WiFi variant) OR both (user selects per-lezione) — both compatible with Option A allowlist extension

### Trade-off accepted (onesto)
- Docente extra click per lezione on first switch — acceptable iter 60 Phase 1 (Phase 2+3 UX overhaul defer iter 66+ post Q8 pilot test gate per Lino directive)

---

## 8. Codegen Architecture (PRESERVE existing)

### Invariants iter 60+
- **PRESERVE** `src/components/simulator/panels/scratchGenerator.js` generic Arduino C++ output (`scratchGenerator.js:5` custom `new Blockly.Generator('Arduino')`)
- **NO** parallel `scratchGeneratorR4.js` file (single source of truth)
- **NO** `#ifdef __RENESAS__` or board-specific helpers in scratchGenerator
- Board parameter routes **ONLY** through `compileCode(code, board)` (`api.js:1293`) to n8n compile endpoint
- arduino-cli at endpoint handles FQBN-specific compilation (AVR vs Renesas) — codegen stays board-agnostic

### Why this matters
- Single test surface (94 esperimenti validator + Codex Pattern C-V verify-codegen-output run once per block-type, parametrized per board-FQBN at endpoint not at codegen)
- Single mental model for Andrea + Tea + future contributors
- Reduces test matrix from N_blocks × N_boards (combinatorial explosion) to N_blocks (codegen) + N_boards (compile-endpoint smoke)

### Anti-pattern explicit (BLOCK iter 60+)
- Adding `if (board.includes('renesas'))` branches inside `scratchGenerator.forBlock[*]`
- Creating `scratchGeneratorR4.js` parallel file
- Forking block definitions per-board in `blockly-toolbox.js`

---

## 9. Anti-Regression (Phase 1)

### Preserved invariants
- **vitest 13118 PRESERVED** (baseline `automa/baseline-tests.txt` mandate, Andrea iter 42 cleaned 5 pre-existing fails → 14294 PASS canonical iter 42+)
- **94/94 lesson-paths validator PRESERVED** (no schema extension Option A)
- **Codex Pattern C-V verify-codegen-output PRESERVED** parametric per block-type per board-FQBN (compile endpoint validation, not codegen branching)
- Existing 13 Vol3 esperimenti AVR default path UNTOUCHED (DEFAULT_BOARD unchanged Option A)

### New tests required iter 60 Phase 1
- `tests/unit/components/simulator/panels/BoardSelector.test.jsx` — unit test radio toggle, localStorage persist, keyboard nav, touch ≥44px target
- `tests/unit/services/api.test.js` extension — `ALLOWED_COMPILE_BOARDS` includes Renesas variants + `safeBoard` fallback to DEFAULT_BOARD when unknown FQBN passed

### Codex Pattern C-V verify-codegen-output extension iter 60
- Re-run scratchGenerator full block-type sweep with selected board params (AVR vs Renesas) — verify identical C++ source emitted (board-agnostic codegen invariant)
- Verify compile endpoint response success for both AVR and Renesas FQBN with sample blink program

---

## 10. Phase 1 R1-R6 Scope Finalization

### R1 — BoardSelector.jsx ~30 LOC
- New component `src/components/simulator/panels/BoardSelector.jsx`
- Touch ≥44px radio buttons (WCAG AA + CLAUDE.md Rule 9)
- Keyboard nav (Tab + Arrow keys WCAG 2.1.1)
- localStorage `elab-compile-board` persist + restore on mount
- ARIA `role="radiogroup" aria-label="Board di compilazione"`
- Palette CSS var Navy/Lime/Orange (CLAUDE.md Rule 16)

### R2 — api.js:61 ALLOWED_COMPILE_BOARDS extension
- Add 2 Renesas entries per Q3 answer:
  - Q3=wifi → add only `'arduino:renesas_uno:unor4wifi'`
  - Q3=minima → add only `'arduino:renesas_uno:minima'`
  - Q3=both → add both
- Preserve existing AVR entries (Option A backward compat invariant)
- DEFAULT_BOARD unchanged

### R3 — Andrea SSH verify n8n server core install (BLOCKING PREREQ)
- Andrea action ~3 min:
  ```bash
  ssh user@srv1022317.hstgr.cloud
  arduino-cli core list | grep renesas_uno
  # If absent:
  arduino-cli core install arduino:renesas_uno
  ```
- ADR cannot transition ACCEPTED until Q2 answered + verified

### R4 — OpenAPI yaml validate (compile endpoint schema)
- `npx @apidevtools/swagger-cli validate <openapi-spec>.yaml`
- Ensure `board` param documented with `enum` listing 2-4 allowed FQBN values

### R5 — API docs md update post Andrea Q1+Q2+Q3 answers
- `docs/api/compile-endpoint.md` (or equivalent) — document board param + allowlist + default + cross-compile semantics

### R6 — Anti-regression preserved
- Existing vitest 13118+ baseline preserved (mandate `automa/baseline-tests.txt`)
- New BoardSelector unit tests (R1) + api.js allowlist extension test (R2)
- Codex Pattern C-V re-run verify-codegen-output AVR vs Renesas parametric

---

## 11. Decision (pending Andrea ratify)

**ACCEPTED conditional on Andrea answering Q1+Q2+Q3 (~5-10 min action)**:

| Q | Question | Recommended answer (Option A aligned) |
|---|----------|----------------------------------------|
| Q1 | Default board iter 59? | **`arduino:avr:nano:cpu=atmega328old`** (backward compat — Option A) |
| Q2 | n8n server `arduino-cli core install arduino:renesas_uno` already installed? | **Andrea SSH verify ~3 min** (PREREQ blocking deploy) |
| Q3 | UNO R4 variant — wifi / minima / both? | **`unor4wifi`** (modal default WiFi variant, single entry minimum scope) OR **both** (user-selectable per-lezione, +0.5h scope) |

Post-ratify ACCEPTED transitions ADR to active design. Maker-1 iter 60 implements R1+R2 (~6h Option A scope).

---

## 12. Consequences — Positive

- **Quick win Phase 1 ~6h compatibile Workstream B P0** (Riccardo "termina prima resto" mandate ✓)
- **Zero regression** on existing 13 Vol3 esperimenti AVR path (vitest 13118 + validator 94/94 preserved)
- **Codegen architecture preserved** (single source of truth `scratchGenerator.js`, no board branching)
- **Morfismo Sense 1 runtime preserved** (board parameter is runtime variable, not compile-time codegen branch)
- **Deferred Phase 4 (browser-agent + dfu-util web upload) iter 70+ post pilot Q8** — Lino "step-by-step" + "chiudere loop velocemente" ✓
- Option A enables incremental migration: docenti switch to Renesas per lezione via UI, gradual usage data informs Phase 2+3 default-flip decision iter 66+

## 13. Consequences — Negative (Honest)

- **Docente still needs Arduino IDE locale + USB cable for upload to physical kit** (no web upload Phase 1 — avr8js emulates AVR not Renesas; physical Renesas upload requires arduino-cli host-side OR Arduino IDE manual)
- **Extra click per lezione** on first Renesas switch (mitigated by localStorage persistence)
- **n8n server PREREQ** — `arduino:renesas_uno` core install REQUIRED before deploy (Andrea SSH action Q2)
- **Renesas Arduino core library compat unknown** — `Servo.h` / `LiquidCrystal.h` / `Wire.h` may behave subtly differently vs AVR (smoke test required iter 60 entrance with sample blink + servo + lcd_hello programs)
- **Q3=both** adds 0.5h scope vs Q3=single variant (acceptable trade-off if Andrea wants user-selectable wifi/minima per-lezione)
- **Unknown risk**: arduino-cli n8n endpoint may have implicit AVR-only assumptions in pipeline (timeout values, output parser regex, HEX vs UF2 format handling) — Andrea SSH smoke test sample Renesas compile required iter 60 entrance gate

---

## Cross-references

- PRD: `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`
- Verified facts: `src/services/api.js:60-64,1293-1376` + `src/components/simulator/panels/scratchGenerator.js:4-49` + `src/components/simulator/panels/ScratchEditor.jsx` (506 LOC, no BoardSelector present)
- Codex Pattern C-V iter 58+59 cross-compile recon (referenced PRD §X)
- CLAUDE.md "Regole immutabili" rules 9 (touch 44px) + 16 (palette) + Anti-regressione mandate
- Related ADRs (preserve): ADR-028 INTENT dispatcher (server-side parse + browser dispatch) + ADR-030 Mistral function calling canonical
- Numbering collision note: requested `ADR-032` taken by Vertex Frankfurt migration; filed ADR-048 to preserve. Andrea may rename pre-merge.
