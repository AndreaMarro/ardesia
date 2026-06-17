# Antigravity — Design Document

**Data**: 03/03/2026 — Sessione 66 (completato 04/03/2026 — Sessione 67)
**Autore**: Andrea Marro + Claude
**Stato**: ✅ COMPLETATO — 8/8 fasi, 209 test, 0 regressioni
**Approccio**: Logical Parent-Child (Approccio A)

---

## Panoramica

Antigravity e' un'iniziativa unificata per portare il simulatore ELAB al livello successivo. Copre 6 aree interconnesse:

1. **Sistema Antigravity** — componenti seguono la breadboard durante il trascinamento
2. **Drag & Drop UX** — ghost preview, drop zone highlight, snap migliorato
3. **Mappatura BB <-> Solver** — pin assignment dinamico, validazione real-time
4. **Physics perfetti** — condensatore, transitori RC, precisione MNA, misure API
5. **Lab Notebook Report** — report PDF scientifico con cronologia, misure, estetica ELAB
6. **Galileo Onnipotente** — controllo totale simulatore + consapevolezza stato circuito

Implementazione incrementale per fase, design doc unificato per coerenza architetturale.

---

## Architettura Attuale (Contesto)

- Componenti usano **coordinate SVG assolute** — nessuna gerarchia padre-figlio DOM
- `pinAssignments` e' l'unico legame logico tra componenti e fori breadboard
- `CircuitSolver` usa Union-Find per costruire nets elettrici
- `WireRenderer` ricalcola posizioni da `resolvePinPosition()` ad ogni render
- 69 esperimenti esistenti, tutti funzionanti, tutti con quiz

File chiave:
- `SimulatorCanvas.jsx` (2,140 righe) — drag/drop orchestration
- `breadboardSnap.js` (214 righe) — snap-to-hole logic
- `PlacementEngine.js` (380 righe) — semantic placement
- `WireRenderer.jsx` (1,273 righe) — wire routing
- `CircuitSolver.js` (2,060 righe) — electrical simulation
- `SessionReportPDF.jsx` (357 righe) — PDF generation
- `NewElabSimulator.jsx` (3,085 righe) — main orchestrator

Costanti: `BB_HOLE_PITCH=7.5px`, `BB_PAD_X=14px`, `SNAP_THRESHOLD=4.5px`

---

## Sezione 1: Sistema Antigravity (Parent-Child Grouping)

### Concetto

Ogni componente nel `layout` ha un campo opzionale `parentId` che lo lega a un altro componente (tipicamente breadboard). Quando il parent viene trascinato, tutti i figli si muovono dello stesso delta.

### Modifiche

**`SimulatorCanvas.jsx` — `handleMouseMove`** (~10 righe):
- Se il componente trascinato e' una breadboard, trovare tutti i figli (`layout[x].parentId === bbId`)
- Applicare lo stesso `deltaX/deltaY` a tutti i figli

**`breadboardSnap.js` — `snapComponentToHole`** (~5 righe):
- Quando un componente snappa a una breadboard: `layout[compId].parentId = bbId`
- Quando si allontana da tutti i fori: rimuovere `parentId`

### Auto-parenting
- Avviene automaticamente quando i pin del componente si allineano ai fori (entro SNAP_THRESHOLD)
- L'utente non deve fare nulla di esplicito

### De-parenting
- Se l'utente trascina un singolo componente via dalla breadboard, `parentId` viene rimosso
- Il componente torna "libero"

### Fili
- Fili tra componenti dello stesso gruppo: si muovono naturalmente (resolvePinPosition ricalcola)
- Fili verso componenti esterni (es. Arduino fisso): si allungano elasticamente (Bezier si adatta)
- **Nessuna modifica a WireRenderer**

### Retrocompatibilita'
- I 69 esperimenti esistenti NON hanno `parentId` — funzionano come prima
- Per "Gia' Montato": `parentId` impostato automaticamente all'apertura da `pinAssignments`
- Per "Passo Passo": `parentId` impostato durante il build step

---

## Sezione 2: Drag & Drop User-Friendly

### A) Snap Preview (Ghost)
- Durante il drag vicino alla breadboard: ghost semitrasparente (opacity 0.3) nella posizione di snap
- Stroke `#7CB342` (lime ELAB)
- Scompare quando il mouse si allontana

### B) Drop Zone Highlight
- Fori disponibili (non occupati) si illuminano con cerchietti verdi durante il drag
- Usa `OccupancyMap` di `PlacementEngine` per sapere quali fori sono liberi

### C) Snap Magnetico Migliorato
- `SNAP_THRESHOLD`: 4.5px -> 7px (quasi un BB_HOLE_PITCH)
- Il ghost preview da' comunque il controllo visivo all'utente

### Escluso
- NO feedback sonoro
- NO modifiche a drag fili, palette, build mode

---

## Sezione 3: Mappatura Breadboard <-> Circuit Solver

### A) Pin Assignment Dinamico
Flusso:
1. Utente trascina componente su breadboard -> snap a fori
2. `computeAutoPinAssignment()` aggiorna `pinAssignments`
3. `CircuitSolver.loadExperiment()` re-invocato -> ricalcola nets
4. Componenti reagiscono in tempo reale

Gia' parzialmente implementato in build mode. Va reso robusto per qualsiasi drag in free-build.

### B) Validazione Circuito Real-Time
Dopo ogni aggiornamento di `pinAssignments`:
- OK: circuito valido
- WARNING: resistenza mancante, corto potenziale
- ERRORE: corto circuito, circuito aperto

### C) Indicatore Stato Circuito
Chip nella toolbar:
- Verde: "Circuito OK"
- Giallo: "1 warning"
- Rosso: "Errore circuito"
- Click -> popover con dettagli e suggerimento fix

---

## Sezione 4: Physics & Logic Perfetti

### A) Condensatore Statico (priorita' alta)
- Impedenza AC: `Xc = 1/(2*pi*f*C)`
- Per Vol3 con Arduino: modello passa-basso

### B) Transitori RC Animati (priorita' media)
- Curva carica/scarica: `V(t) = V0 * (1 - e^(-t/RC))`
- `CircuitSolver.solve()` restituisce oggetto `transient` con valori nel tempo
- Rendering interpola tra frame (LED si accende gradualmente)

### C) Precisione MNA (priorita' alta)
- Gestione pivot zero nella matrice
- Convergenza per circuiti non-lineari (MOSFET)
- Accuracy V/I vs SPICE/Tinkercad

### D) Misure API
```javascript
CircuitSolver.getNodeVoltages()    // { "node_1": 5.0, "node_2": 2.1 }
CircuitSolver.getComponentCurrents() // { "led1": 0.015, "r1": 0.015 }
```
Alimentano: Multimeter, Lab Notebook, Galileo.

### YAGNI
- NO simulazione SPICE completa
- NO circuiti AC con frequenze variabili
- NO analisi termica
- NO componenti fuori dal kit ELAB

---

## Sezione 5: Lab Notebook Report

### A) SessionRecorder

Nuovo React Context `<SessionRecorderProvider>` che traccia:

```
Timeline eventi (timestamp + tipo + dettagli):
  - component_placed { id, type, position, breadboardHole }
  - wire_connected { from, to }
  - simulation_started / stopped
  - measurement_taken { node, voltage, current }
  - code_compiled { success, errors }
  - code_uploaded
  - galileo_question { text }
  - galileo_answer { text }
  - quiz_answered { question, answer, correct }
  - error_occurred { type, message }
Snapshots circuito (stato completo a ogni milestone)
Misure elettriche (da CircuitSolver API)
```

Dati in memoria (non persistiti su server).

### B) Struttura PDF — 8 Sezioni

| # | Sezione | Contenuto |
|---|---------|-----------|
| 1 | Copertina | Logo ELAB, nome esperimento, volume, data, nome studente |
| 2 | Obiettivo | Descrizione esperimento dal JSON |
| 3 | Materiali | Lista componenti con valori |
| 4 | Schema Circuito | Screenshot SVG + schema pin assignments |
| 5 | Procedura | Timeline cronologica: ogni passo con timestamp |
| 6 | Misure | Tabella V/I/R + grafici transitori |
| 7 | Codice | Sorgente Arduino con syntax highlighting |
| 8 | Analisi | Chat Galileo + quiz + valutazione automatica |

### C) Estetica ELAB
- Font: Poppins (titoli) + Roboto (corpo)
- Colori header: Vol1 `#7CB342`, Vol2 `#E8941C`, Vol3 `#E54B3D`
- Watermark: `ELAB Tutor — Andrea Marro — DD/MM/YYYY`
- Footer: numero pagina + logo piccolo

### D) Generazione
- `@react-pdf/renderer` (gia' nel bundle, on-demand)
- Sezioni costruite dai dati di SessionRecorder

---

## Sezione 6: Galileo Onnipotente

### A) Circuit State API

```javascript
// CircuitStateAPI.js
getCircuitState() -> {
  components: [{ id, type, value, position, breadboardHole, parentId }],
  connections: [{ from, to, wireColor }],
  measurements: { "led1": { voltage: 2.1, current: 0.015 } },
  status: "ok" | "warning" | "error",
  errors: ["Corto circuito tra riga 5 e bus +"],
  isSimulating: true/false,
  arduinoCode: "void setup() { ... }" | null
}
```

Inviato come `circuitState` in ogni richiesta chat a nanobot.

### B) Nuovi Action Tags

| Tag | Effetto |
|-----|---------|
| `[AZIONE:placecomponent:led:rosso:bb1:a5]` | Piazza LED rosso su foro a5 |
| `[AZIONE:connectwire:bb1:a5:arduino:D13:rosso]` | Filo rosso da a5 a D13 |
| `[AZIONE:setvalue:r1:470]` | Imposta R1 a 470 ohm |
| `[AZIONE:measure:led1]` | Restituisce misure V/I |
| `[AZIONE:diagnose]` | Analisi circuito completa |
| `[AZIONE:stepcode:next]` | Debug Arduino passo-passo |

### C) Consapevolezza Contestuale
- `circuitState` incluso automaticamente in ogni messaggio
- Prompt nanobot.yml: "Hai accesso allo stato reale del circuito"
- "Non dire 'prova a controllare' — guarda tu stesso i connections"

### D) Modalita' "Galileo Costruisce"
- Utente: "costruiscimi un circuito con LED e resistenza"
- Galileo genera sequenza action tags
- Esecuzione sequenziale con delay 500ms per animazione

### Limiti YAGNI
- Galileo NON modifica codice Arduino direttamente
- Galileo NON fa deploy su board fisico
- Step-debug solo visuale (highlight riga), non debugger reale

---

## Fasi di Implementazione (ordine suggerito)

1. **Fase 1 — Antigravity Core**: parentId + drag propagation + auto-parenting
2. **Fase 2 — Drag UX**: ghost preview + drop zone highlight + snap migliorato
3. **Fase 3 — Mappatura dinamica**: pin assignment real-time + validazione + indicatore
4. **Fase 4 — Physics**: condensatore + transitori + MNA review + misure API
5. **Fase 5 — SessionRecorder**: context provider + event logging
6. **Fase 6 — Lab Notebook PDF**: 8 sezioni + estetica ELAB
7. **Fase 7 — Circuit State API**: getCircuitState() + integrazione nanobot
8. **Fase 8 — Galileo Actions**: nuovi action tags + consapevolezza contestuale

Ogni fase e' indipendente e deployabile. I 69 esperimenti devono passare dopo ogni fase (zero regressioni).

---

## Verifica

Per ogni fase:
1. `npm run build` — 0 errori
2. Chrome test manuale (drag, snap, solve, report, Galileo)
3. 69 esperimenti: apertura + simulazione senza crash
4. Ralph Loop 3/3 PASS (se tocca Galileo)
5. Deploy Vercel + test produzione

---

## Stato Fasi (Aggiornato 03/03/2026 — Sessione 66)

| Fase | Descrizione | Stato | Note |
|------|-------------|-------|------|
| **1** | Antigravity Core (parentId + drag) | ✅ COMPLETATA | `parentId` in layout, drag propagation, auto/de-parenting. SimulatorCanvas.jsx L963-965. Verificata non-regressione. |
| **2** | Drag UX (ghost + drop zone + snap) | ✅ COMPLETATA | `snapGhost` state, drop zone highlight (lime `#7CB342`), `SNAP_THRESHOLD = BB_HOLE_PITCH * 0.9`. SimulatorCanvas.jsx L475, L2417-2462. |
| **3** | Circuit Status Chip + validazione | ✅ COMPLETATA + BUG FIX | Chip in ControlBar (L193-231). **BUG CRITICO trovato e fixato**: `queueMicrotask` race condition sovrascriveva warnings dopo ~16ms. Fix: cycle-scoped arrays in useEffect closure (NewElabSimulator.jsx L938-959). 5 test unitari PASS. |
| **4** | Measurement APIs | ✅ COMPLETATA | `getNodeVoltages()` (L333-349) + `getComponentCurrents()` (L357-373) in CircuitSolver.js. Wraps `_mnaNodeVoltages` + `_supplyNets` fallback. 3 decimali V, 4 decimali A. 6 test unitari PASS. |
| **5** | SessionRecorder Context | ✅ COMPLETATA + FIX | Context: `SessionRecorderContext.jsx`. Provider wraps ElabTutorV4 (L1850). 5 `recordEvent` hooks in NewElabSimulator. **FIX**: `code_compiled` spostato fuori da `if(success)` per catturare ANCHE compilazioni fallite (L374). 9 test unitari PASS. |
| **6** | Lab Notebook PDF | ✅ COMPLETATA | PAGE 3.5 Procedura (timeline cronologica, 30 max, filtra report_generated) + PAGE 3.6 Misure Elettriche (tensioni V + correnti mA ×1000, tabelle alternate, 20 max). `formatElapsed`, `EVENT_LABELS` (9 tipi), `getEventDisplay`. NewElabSimulator: `getTimeline()` + `solverRef.current.getNodeVoltages()/getComponentCurrents()` in `handleGenerateReport`. 11 test unitari PASS. |
| **7** | Circuit State API | ✅ COMPLETATA | `buildStructuredState()` useCallback standalone (L1009-1067). Output duale `{ structured, text }` dal text bridge (L1190-1192). 3 nuovi ref sincronizzati (`circuitStatusRef`, `isRunningRef`, `buildStepIndexRef`). apiInstance.getCircuitState delegata (L1333). 5 punti in ElabTutorV4 aggiornati per formato duale (L255, L1178, L1212-1215, L1275-1277, L1921-1923). simulator-api.js: `getCircuitState()` preferisce structured (L373-375). 14 test unitari PASS. |
| **8** | Galileo Actions | ✅ COMPLETATA | 3 nuovi action tags: `setvalue` (PARAM_MAP con 7 alias IT/EN + fallback camelCase), `measure` (estrae V/mA da getCircuitState.measurements), `diagnose` (delega a handleDiagnoseCircuit). Backend: `format_circuit_context()` supporta 3 formati (dual/raw/legacy) + enrichment misure/status/warnings/arduinoCode. nanobot.yml: AUTOCOSCIENZA +3 capacita', CHECKLIST +3 items, nuovo blocco `[CONSAPEVOLEZZA CONTESTUALE — Fase 7+8]` con 5 regole. api.js: SOCRATIC_INSTRUCTION aggiornata. Build: 970KB, 0 errori. 12 test unitari PASS. |

### ✅ ANTIGRAVITY COMPLETE — 04/03/2026

**8/8 fasi completate**. Test suite finale: **209/209 PASS** (15 file, 0 regressioni).
Bundle: ElabTutorV4 970KB (+5KB totali su 8 fasi). Deploy pronto.

| Metrica | Pre-Antigravity | Post-Antigravity |
|---------|-----------------|------------------|
| Test unitari | 93 | 209 (+116) |
| Action tags | 19 | 22 (+3) |
| Circuit State format | text-only | dual (structured + text) |
| Session tracking | nessuno | full (events, snapshots, timeline) |
| Lab Notebook PDF | basic | scientifico (procedure, misure, cronologia) |
| Galileo consapevolezza | testo grezzo | dati strutturati real-time |

---

### Dettaglio Bug Fix Fase 3

**Problema**: L'implementazione originale usava `queueMicrotask` in `onStateChange` per risolvere lo status del circuito:
```
solve() chiama onWarning → setCircuitStatus({error}) [sync]
solve() chiama onStateChange → queueMicrotask(() → setCircuitStatus({ok})) [async]
```
Il microtask creava un batch React SEPARATO che sovrascriveva il warning/errore dopo ~16ms. Il chip lampeggiava un frame e scompariva.

**Fix**: Cycle-scoped `let` arrays nella closure dello `useEffect`:
- `let cycleWarnings = []` / `let cycleErrors = []`
- `onWarning` pusha sincrono negli array (con dedup via `includes()`)
- `onStateChange` legge gli array, chiama UN SOLO `setCircuitStatus`, poi resetta
- Nessuna race condition: tutto sincrono nello stesso batch React

### Test Suite (03/03/2026 — aggiornata dopo Fase 7)

```
Test Files  15 passed (15)
     Tests  197 passed (197)
  Duration  57.45s

Phase 3+4: CircuitSolver.phase3-4.test.js (11 test)
- T4.1-T4.6: Measurement APIs (empty solver, data after solve, precision, types)
- T3.1-T3.5: Circuit Status (short-circuit, valid, ordering, LED warning, getState)

Phase 5: SessionRecorder.test.js (9 test)
- T5.1: Module exports (Provider, hook, default)
- T5.2: Fallback no-op contract (6 funzioni, return defaults corretti)
- T5.3: recordEvent struct (timestamp, elapsed, type, spread details)
- T5.4: recordSnapshot deep-clone (no reference leaking)
- T5.5: recordSnapshot null-safe
- T5.6: getTimeline copy (mutation-safe)
- T5.7: resetSession clears everything
- T5.8: code_compiled captures success AND failure
- T5.9: elapsed monotonically non-decreasing

Phase 6: SessionRecorder.test.js (11 test)
- T6.1: formatElapsed converts ms to m:ss (8 casi: 0ms, 5s, 30s, 1m, 1m30, 2m05, 61m, sub-second)
- T6.2: EVENT_LABELS covers all 9 event types (icon + label)
- T6.3: getEventDisplay returns correct icon+detail (simulation, experiment, code ok/fail)
- T6.4: getEventDisplay fallback for unknown events (bullet + type name)
- T6.5: report_generated filtered from display timeline
- T6.6: timeline truncation at 30 events
- T6.7: currents ×1000 mA conversion (15mA, 3.4mA, 0.1mA)
- T6.8: COMPONENT_NAMES lookup strips trailing digits (led1→LED, battery9v→Batteria 9V)
- T6.9: empty measurements guard (no page rendered)
- T6.10: null measurements guard (no crash)
- T6.11: generateSessionReportPDF export + 5-arg signature (3 required)

Phase 7: SessionRecorder.test.js (14 test)
- T7.1: returns null when no experiment
- T7.2: returns correct shape with all 12 top-level fields
- T7.3: components map id, type, state, position, parentId (null-normalized)
- T7.4: connections map from, to, color (auto fallback)
- T7.5: measurements populated from solver (voltage + current per component)
- T7.6: measurements handle partial data (voltage-only, current-only)
- T7.7: buildMode maps mounted/guided/explore correctly
- T7.8: circuitStatus propagated (status, warnings, errors)
- T7.9: isSimulating + arduinoCode fields
- T7.10: dual-format output { structured, text }
- T7.11: backward-compatible ?.text accessor (old string vs new object vs null)
- T7.12: circuitState extraction for sendChat (both formats)
- T7.13: simulator-api.js delegation pattern (structured > componentStates)
- T7.14: diagnose prefers structured over text
```

### Bundle Size

Build production: **0 errori, 39.16s**
ElabTutorV4: 968KB (+1KB per buildStructuredState + ref sync)
Delta complessivo Fase 7: **+6 KB** rispetto a post-Fase 5 (trascurabile)
