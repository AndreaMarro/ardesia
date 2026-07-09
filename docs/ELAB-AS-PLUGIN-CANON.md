# ARDESIA — ELAB-AS-PLUGIN-CANON (23/06/2026)

> Come ELAB diventa Pack/Plugin senza mangiarsi Ardesia. Verificato firsthand su `~/VOLUME 3/PRODOTTO/elab-builder` (`7681789d`) + `~/ardesia/plugins/elab-tutor`. Vedi [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md).

## 1. Stato attuale (brutale, verificato)
`plugins/elab-tutor` **NON è un plugin Ardesia decoupled** — è **l'intera app standalone copiata verbatim**:
- root-shell proprio (`App.jsx`,`main.jsx`,`index.html`,`ElabTutorV4.jsx`); README apre *"ELAB è un prodotto completo"*.
- **duplica OGNI concern di Core:** AUTH (`AuthContext`,`supabaseAuth` — confligge con l'identità Ardesia) · DASHBOARD (`TeacherDashboard` + gestionale ERP) · MEMORIA (`unlimMemory.js` localStorage+Supabase, schema **incompatibile** con engine SQLite) · AI (13 Edge fn Supabase `unlim-*` → Vertex/Gemini, **insegna contenuto** vs engine "NON-insegna") · REPORT (`SessionReportPDF` vs `recap_export.py`) · LAVAGNA (toolbar propria vs host studio).
- `package.json:2` ancora `name="elab-builder"`. `grep elab-tutor` in `apps/studio/src` = **vuoto** (non monta via host). L'unico "decoupling" avvenuto = **collocazione in directory** (1 subtree import `e108de2a`, nessun refactor dopo).

→ Conferma la tesi del vision: **se ELABTutor resta grosso, è una seconda app dentro Ardesia.** Lo è già.

## 2. Lo SPLIT (cosa è Plugin, cosa è Pack)
- **Simulation Plugin** (IP genuina, leaf-modules quasi self-contained, NO equivalente Core): `CircuitSolver.js` (2486 LOC, ibrido **MNA+path-tracing**+nonlinear+validators) · `WireRenderer.jsx` · `BreadboardHalf.jsx` · `registry.js` (22 componenti SVG self-registering) · `AVRBridge` (avr8js ATmega328p).
- **ELABTutor Pack** (dati, oggi fusi nell'app): 88 lesson-path + `volume-references.js` (88/88) + buildSteps + prompt UNLIM + 2 modalità.

## 3. SALVAGE (file-ref) — cosa portare
| ID | Cosa | Mappa al vision |
|---|---|---|
| S1 | 88 lesson-path JSON (`modes_supported`, 5-fasi `phases`, `intent{components,wires}` tipato, `book_reference`, `common_mistakes`) | = `DidacticActivity` + proto-`CircuitScene` |
| S2 | `volume-references.js` (88/88) | = `ManualRef` (sostanza) |
| S3 | `VolumeCitation.jsx` (badge Vol.N pag.M) | = `BoardCitation` (render verbatim) |
| S4 | `CircuitSolver.js` + validators (series-resistor/polarity/short/overload) | = solver del Simulation Plugin |
| S5 | domain-graph forge + 3 validators | = pipeline grafo del Pack |
| S6 | spec `CircuitScene v1` (`docs/architectures/circuit-scene-model.md`) | = contratto scena |

## 4. DO-NOT-PORT (nel primo plugin)
`NewElabSimulator` god-component (importa shell/pannelli/editor/serial/plotter/compile-API/analytics/Scratch/upload — miniera, non blocco) · accoppiamento `window.__ELAB_API` event · text-tag `[azione:...]` (tieni l'`intent{}` strutturato) · auth/dashboard/gestionale · 13 Edge-fn AI · memoria localStorage/Supabase · report PDF proprio · `bookCitation.js` morto · count stale 94/91 + dual book-ref · photo-map 3/88.

## 5. CAVEAT onesti (verificati)
- **CircuitScene provenance = spec-only**: `provenance{status,checks}` in **0/88** esperimenti; la regola *"solo scene `verified` guidano lezioni vere"* è **non costruita**. I validators del solver ESISTONO; manca **sedimentare il loro risultato come provenance di scena**.
- **`LessonMode` enum non esiste** (solo stringhe `buildMode complete/guided/sandbox` + `modes_supported`).
- **Chip mismatch:** `AVRBridge` emula **ATmega328p**, ma il Nano R4 fisico è **Renesas RA4M1** → NON presentare il comportamento ATmega come Nano R4.
- Da costruire pulito in Ardesia: provenance+gating, classificazione 9 esperimenti scene-less, 3 difetti di geometria, pipeline immagine→scena.

## 6. CONFINE DI DECOUPLING #1 (la regola da imporre per prima)
**HOST BOUNDARY.** ELAB diventa un **guest** che monta dentro lo Studio ToolHost e **cede shell/auth/memoria/report a Core**.
**LA REGOLA:** ELAB possiede **SOLO il contenuto simulatore/canvas** (`src/components/simulator/` — CircuitSolver, 22 componenti SVG, AVRBridge: l'unica IP senza equivalente Core). **Tutto il resto** (`App.jsx`/`main.jsx`/`index.html`, `auth/`, `dashboard/gestionale/`, `unlim/` AI, `report/`, memoria) è **VIETATO dentro il plugin** e va consumato da Core via contratto ToolHost.
**Perché questo confine per primo:** (1) è quello che l'architettura **già dichiara** (governance `08-FUNZIONALITA` RF-G assegna toolbar/state-sync/sandbox/kill allo Studio host) e quello **più violato** (il plugin non monta affatto); (2) fa **collassare ogni altro duplicato automaticamente** (senza `App.jsx`, ELAB non ha dove attaccare auth/toolbar/shell); (3) il simulatore è l'unico pezzo **senza equivalente Core** (seam pulito) — auth/memoria/report/AI hanno già un owner Core (engine/studio) → si **amputano**, non si rifondono.
**PRIMO PASSO MISURABILE:** `plugins/elab-tutor` espone **un solo `renderEmbeddable()`** consumato dall'host (= task **MOUNT-CANVAS** già in `ARDESIA-MAP`) + **lint/CI gate** che **fallisce la build** se riappaiono `plugins/elab-tutor/src/{App.jsx,main.jsx}`, `components/auth/`, `supabase/functions/`. **Senza quel gate, ogni run di fabbrica re-importa l'intera standalone.**
**Stato 2026-07-09:** il board embed del Simulation Plugin monta già `renderEmbeddable()` tramite adapter `SimulationScene -> ELABTutor canvas state`; gli eventi wire del canvas ELAB (`onConnectionAdd`, `onWireUpdate`, `onWireDelete`) sono bridgati in operazioni strutturate `connect-wire`, `edit-wire.replace-path` e `delete`; le operazioni AI/runtime mutanti passano ora da placement strutturato, `edit-wire`, occupancy, pin-vocabulary, provider solve, letture voltmeter/probe derivate da `SolverResult.voltages`, letture ammeter derivate da `SolverResult.currents`, operazioni `runInstrument` provider-bound per serial monitor/plotter, oscilloscope, SPICE/custom-chip, logic probe bloccato su runtime trace mancante, diagnostica runtime board-scoped che blocca il fallback Nano R4 -> ATmega328p, proiezione del montaggio libero persistito nel canvas core come `sandbox/monta-tu`, envelope `place-component` persistiti per i piazzamenti liberi legacy, e canale ToolHost `lesson.event.emit` per eventi LessonOS con evidence (`lesson.started/ended`, `material.cited`, `error.observed`, `exercise.completed`, `simulation.step.completed`). Resta parziale finché UI strumenti/probe avanzata, provider AVR/runtime eseguibili, persistenza completa e strumenti di montaggio libero nativi nel canvas core non passano tutti dalla stessa scena canonica.
**PRECONDIZIONE (P0 accoppiato):** l'host stesso va prima **wired in una route di produzione** (oggi unmounted) → "montare l'host in prod" + "montare ELAB attraverso di esso" sono il **P0 accoppiato**.
