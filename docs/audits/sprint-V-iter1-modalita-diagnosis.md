# Sprint V iter 1 — Atom D3 — Modalità Percorso + 2-window Passo-Passo Diagnosis

**Date**: 2026-05-05 PM
**Agent**: agent-teams:team-debugger (ab1d934)
**Confidence**: HIGH

## Bug 1: Percorso "non funziona" — Verdict HP1 + HP3 confirmed

### Root cause

`handleModalitaChange('percorso')` in `src/components/lavagna/LavagnaShell.jsx:621-646` esegue **SOLO** `setModalita(nextMode)` per `'percorso'`. Nessuna branch:
- monta/smonta esperimento (solo `'libero'` clear via `setCurrentExperiment(null)` + `clearAll()` linee 638-645)
- reset simulator buildMode
- triggera Onniscenza aggregator
- toggle UI panels

Render side `LavagnaShell.jsx:1322-1353` branch SOLO `passo-passo` (`FloatingWindowCommon` + `LessonReader`) e `gia-montato` (`setDiagnoseMode` :627-631). **`percorso` zero observable effect** — selezione cambia solo bottone attivo (`ModalitaSwitch.jsx:78-99` `data-active`).

Andrea mandate Sense 1.5 ("morfico contesto lezione+classe+sessioni precedenti, Onniscenza aggregator iter 31 wired") **NOT connesso**. Grep zero call `aggregateOnniscenza`, `state-snapshot-aggregator`, `onniscenza-bridge` da `handleModalitaChange` o percorso-conditional render. CLAUDE.md iter 29 audit: "aggregateOnniscenza NOT WIRED prod (scaffold only)" rimane vero per percorso flow.

### Falsificazione

- **HP2** (auto-mount) FALSIFIED — nessun useEffect tied `modalita==='percorso'`. Auto-load `:681-686` independent
- **HP4** (localStorage stale) FALSIFIED — `:440-449` reset legacy → canonical `'percorso'` (iter 36 Atom A4 fix)

### Conclusione Bug 1

Percorso è *visual default* ma conceptualmente **NULL mode** — docente clicca aspettando "free canvas + morphic guidance" (Andrea mandate vecchia "Libero" + Onniscenza), ma niente succede. Andrea correctly perceive "non funziona".

---

## Bug 2: 2 finestre passo-passo overlap — Verdict HW1 confirmed

### Root cause

`modalita === 'passo-passo'` AND `currentExperiment.buildMode === 'guided'` → **2 finestre indipendenti render simultaneo**:

1. **LEFT/draggable**: `FloatingWindowCommon` wrap `LessonReader` `LavagnaShell.jsx:1322-1353` (gate: `modalita==='passo-passo'` only — NO consult `buildMode`)
2. **RIGHT/embedded simulator**: `ComponentDrawer` `NewElabSimulator.jsx:906-911` (gate: `currentExperiment.buildMode==='guided'` only — NO consult `modalita`)

**Gates ortogonali non-coordinati**. `ExperimentPicker.jsx:202` sets `buildMode:'guided'` quando `hasBuildSteps` → ComponentDrawer triggera, LessonReader piggyback su modalita switch. **Both render → overlap**.

**HW2** confirmed contributory — `NewElabSimulator` unaware di `modalita` (zero `modalita` ref in `src/components/simulator/`).
**HW3** FALSIFIED — solo 1 `<FloatingWindowCommon>` instance (line 1323).

### Iter 42 mio SBAGLIATO confermato

Mio attempt rimuovere FloatingWindowCommon era WRONG. Andrea preferisce vecchia LessonReader text-based + window resizable. FloatingWindowCommon iter 36 = wrapper resizable+draggable+persisted size (`FloatingWindow.jsx:47-225`). Keeping it + suppressing ComponentDrawer = path corretto.

---

## Fix proposals

### A5 — Percorso morphic Onniscenza (4-6h, MEDIUM risk)
- **File**: `LavagnaShell.jsx:621` `handleModalitaChange`
- **Change**: when `nextMode==='percorso'`:
  - invoke `__ELAB_API.unlim.setMorphicMode?.('percorso')` (new)
  - clear pending experiment-mount MA **preserve canvas** (no `clearAll`)
  - trigger Onniscenza prefetch `aggregateOnniscenza({lesson, class_key, recent_sessions})` warm BASE_PROMPT next chat turn
- Add `<PercorsoMorphicHint>` floating banner (small dismissible): "Ragazzi, leggiamo insieme — UNLIM ascolta lezione + sessioni passate"
- **Anti-regression**: NO mutate `currentExperiment` per percorso. Linee 627-645 unchanged

### A6 — Suppress ComponentDrawer in passo-passo (1h, LOW risk) **PREFERRED**
- **File**: `NewElabSimulator.jsx:906` + `LavagnaShell.jsx:1186`
- **Change**: pass `hideComponentDrawer` prop from LavagnaShell:
  ```jsx
  <NewElabSimulator hideLessonPath hideComponentDrawer={modalita==='passo-passo'} />
  ```
- ComponentDrawer condition: `currentExperiment?.buildMode==='guided' && !hideComponentDrawer`
- **Anti-regression**: `gia-montato` + guided experiment still mount ComponentDrawer (condition `modalita==='passo-passo'` only suppresses passo-passo)

### A7 — Alternative: ComponentDrawer modalita-aware (2-3h, MEDIUM risk)
- Wire `modalita` LavagnaShell → NewElabSimulator → ComponentDrawer via prop drill OR window event
- Less surgical che A6, choose only se other simulator panels need modalita awareness future

### A8 — FloatingWindowCommon empty-experiment hint already correct
- No change. Linee 1333-1344 already plurale "Ragazzi, scegliete un esperimento"
- Validates iter 42 mio mistake — keep this code

---

## Anti-regression checklist

1. ✓ `gia-montato` + `buildMode==='guided'`: must still mount ComponentDrawer (A6 condition preserva)
2. ✓ `libero`: still clears experiment (linee 638-645 unchanged)
3. ✓ Default modalita fresh load `'percorso'` (linee 440-451 unchanged)
4. ✓ `FloatingWindowCommon` localStorage size persistence per-title (`FloatingWindow.jsx:19-44`) preserved
5. ✓ Vitest `tests/unit/lavagna/ModalitaSwitch.test.*` (6/6 PASS iter 36) green

---

## File:line citations

- ModalitaSwitch render: `src/components/lavagna/ModalitaSwitch.jsx:25,54-103`
- handleModalitaChange no-op percorso: `src/components/lavagna/LavagnaShell.jsx:621-646`
- modalita default + localStorage migration: `src/components/lavagna/LavagnaShell.jsx:440-451`
- Passo-Passo FloatingWindow render: `src/components/lavagna/LavagnaShell.jsx:1322-1353`
- Common FloatingWindow API: `src/components/common/FloatingWindow.jsx:47-225`
- LessonReader text reader: `src/components/lavagna/LessonReader.jsx:1-54`
- ComponentDrawer mount condition (concurrent): `src/components/simulator/NewElabSimulator.jsx:906-911`
- ExperimentPicker sets buildMode='guided': `src/components/simulator/panels/ExperimentPicker.jsx:202`
- Simulator unaware of modalita: confirmed via grep — zero refs in `src/components/simulator/`

## Order raccomandato

**A6 (1h surgical) → A5 (Percorso morphic 4-6h)**. A7 solo se simulator needs broader modalita coupling future.
