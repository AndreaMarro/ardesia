---
id: ADR-025
title: Modalità ELAB simplification — 4 modes canonical (Percorso default + Passo-Passo + Già Montato + Libero auto-Percorso) eliminate "guida da errore" mode (Sprint T iter 22 mandatory)
status: PROPOSED
date: 2026-04-29
deciders:
  - architect-opus (Sprint T iter 19 caveman mode, ralph loop /caveman dispatch ANDREA-MANDATES-ITER-18-PM-ADDENDUM §1)
  - Andrea Marro (final ratify iter 22 entrance — modalità simplification + Libero auto-Percorso UX behavior approve)
context-tags:
  - sprint-t-iter-22
  - sprint-t-iter-23
  - modalita-4-simplification
  - eliminate-guida-da-errore
  - libero-auto-percorso
  - ux-behavior-matrix-per-mode
  - lesson-paths-narrative-schema-support
  - principio-zero-v3-plurale-ragazzi
  - morfismo-sense-1.5-funzioni-finestre
  - volumi-narrative-continuum-cross-ref
related:
  - CLAUDE.md §0 DUE PAROLE D'ORDINE Principio Zero V3 + Morfismo Sense 1.5 (funzioni morfiche + finestre morfiche iter 10 estensione)
  - ADR-019 (Sense 1.5 Morfismo runtime docente + classe — modalità adattive per docente esperienza + classe età + kit tier + LIM)
  - ADR-009 (Principio Zero validator middleware V3 plurale Ragazzi + ≤60 parole — language INVARIANT cross-mode)
  - ADR-027 (Volumi narrative refactor schema — Percorso = narrative continuum reading sibling, lesson-paths v{N}-cap{M}.json schema support 4-mode metadata)
  - docs/pdr/2026-04-29-sprint-T-iter-18+/ANDREA-MANDATES-ITER-18-PM-ADDENDUM.md §1 (mandate iter 18 PM Andrea verbatim)
  - docs/pdr/2026-04-29-sprint-T-iter-18+/PDR-MASTER-2026-04-29.md (master plan iter 18-30)
input-files:
  - src/components/lavagna/ModalitaSwitch.jsx (modalità switch component, onLiberoClick handler current)
  - src/data/lesson-paths/*.json (92 file flat current — refactor coupled ADR-027)
  - src/components/lavagna/LavagnaShell.jsx (host modalità, mode setState dispatch)
  - src/services/simulator-api.js (window.__ELAB_API.unlim mountExperiment + getCircuitState — wire pre-execute per mode)
output-files:
  - docs/architectures/ADR-025-modalita-4-simplification-2026-04-29.md (THIS file, NEW)
  - Future iter 22+: src/components/lavagna/ModalitaSwitch.jsx EXTEND onLiberoClick → setMode('Percorso') + remove "guida da errore" UI affordance
  - Future iter 22+: src/data/lesson-paths-narrative/v{N}-cap{M}.json (schema 4-mode metadata, coupled ADR-027)
  - Future iter 23+: tests/integration/modalita-4-modes-end-to-end.test.js (E2E ogni mode entry/exit + Principio Zero V3 cross-mode)
---

# ADR-025 — Modalità ELAB simplification 4 modes Sprint T iter 22

> Codificare 4 modalità canonical ELAB Tutor (**Percorso** default narrative reading + **Passo-Passo** build sequenziale variazione + **Già Montato** pre-assembled diagnose + **Libero** auto-start Percorso) eliminando "guida da errore" mode confusing per docente. Default Libero → **auto-mounts Percorso** (NON sandbox vuoto). Diagnose flow integrato dentro **Già Montato** + **Passo-Passo** (NON modalità separata). Linguaggio INVARIANTE cross-mode (Principio Zero V3 plurale "Ragazzi" + Vol/pag VERBATIM). UX behavior matrix per mode (target user + linguaggio + primary action). Schema lesson-paths support 4-mode metadata (coupled ADR-027 narrative refactor). Andrea ratify iter 22 mandatory.

---

## 1. Status

**PROPOSED** — architect-opus iter 19 caveman mode 2026-04-29 propone modalità simplification canonical 4-mode per Sprint T iter 22 mandatory. Andrea ratify iter 22 entrance.

Sign-off chain previsto:
- architect-opus iter 19 caveman dispatch ADR-025 PROPOSED 4-mode canonical
- gen-app-opus iter 22 implement ModalitaSwitch.jsx onLiberoClick → setMode('Percorso') + remove "guida da errore" UI
- gen-test-opus iter 22-23 verify E2E ogni mode entry/exit + Principio Zero V3 cross-mode validation
- Davide Fagherazzi iter 22 co-review narrative continuum coupling ADR-027
- Andrea Marro iter 22 ratify modalità simplification + Libero auto-Percorso UX

---

## 2. Context

### 2.1 Andrea mandate iter 18 PM verbatim

ANDREA-MANDATES-ITER-18-PM-ADDENDUM §1 codifica mandato Sprint T iter 22+:

> "eliminare guida da errore come modalità. Default Libero → auto-start Percorso."

Razionale Andrea (paraphrase iter 18 PM cumulative messages):
- "guida da errore" mode confusing per docente — NON sa quando entrarci, sovrapposizione semantica con diagnose flow.
- Libero sandbox vuoto = docente paralizzato (NON sa cosa costruire).
- Percorso default = familiar lettura libro page-by-page → entry point intuitivo.
- Diagnose flow integrato dentro **Già Montato** (pre-assembled circuit show errori visivi) + **Passo-Passo** (verifica componente per componente con feedback errore inline).

### 2.2 Stato attuale modalità iter 18 (HEAD `e02eabb`)

Componenti modalità live ELAB iter 12+:
- **Percorso** (lettura libro page-by-page sequenziale): wired Lavagna shell, scroll narrativo capitolo
- **Passo-Passo** (build sequenziale variazione interno capitolo): wired, step navigation
- **Libero** (sandbox post-completamento): wired, auto-start sandbox vuoto current behavior
- **Guida da errore** (legacy mode iter 8-15): wired, MA confusing per docente (sovrapposizione diagnose semantica)

Componenti NON live (gap iter 22 mandatory):
- **Già Montato** (pre-assembled diagnose mode): NOT implemented current, scope iter 22 NEW
- **Libero auto-Percorso** behavior: current sandbox vuoto, mandate refactor onLiberoClick → setMode('Percorso')
- Schema lesson-paths support 4-mode metadata: coupled ADR-027 narrative refactor

### 2.3 Perché ADR adesso (iter 19 caveman)

Tre motivi cogenti:
1. **Sprint T iter 22 mandatory implementation richiede architettura codificata prima di toccare ModalitaSwitch.jsx**: gen-app+gen-test iter 22 partono da spec canonical, NO ad-hoc decisioni UX behavior matrix.
2. **Andrea mandate explicit iter 18 PM addendum §1**: senza ADR esplicita, scope ambiguo + risk regression Sense 1.5 morfismo (modalità adattive docente esperienza).
3. **Coupling ADR-027 Volumi narrative refactor**: modalità Percorso/Passo-Passo refactor UI iter 24 dipende schema lesson-paths-narrative coupled ADR-027 — codifica simultanea iter 19 evita drift.

### 2.4 Rischio non-codifica

Se ADR-025 non shipped iter 19 caveman:
- Implementazione iter 22 rischia divergenza UX behavior (chi decide cosa fa Libero auto-mount vs sandbox?)
- Risk regression Principio Zero V3 cross-mode (es. linguaggio Già Montato deve restare plurale "Ragazzi" INVARIANTE)
- Risk wire-up ModalitaSwitch.jsx onLiberoClick ad-hoc senza spec → revert iter 23 + perdita lavoro
- Risk decoupling ADR-027 narrative refactor → schema lesson-paths-narrative non supporta 4-mode metadata correttamente

---

## 3. Decision

**Modalità ELAB simplification = 4 modes canonical (Percorso default + Passo-Passo + Già Montato + Libero auto-Percorso) eliminate "guida da errore" mode + diagnose flow integrato dentro Già Montato + Passo-Passo.**

Architettura runtime ModalitaSwitch.jsx + LavagnaShell.jsx integration:
1. Switch UI mostra 4 affordance (Percorso ⭐ default + Passo-Passo + Già Montato + Libero)
2. **onPercorsoClick** → setMode('Percorso') + mountExperiment narrative continuum capitolo corrente (lesson-paths-narrative ADR-027)
3. **onPassoPassoClick** → setMode('Passo-Passo') + step navigation variazione interno capitolo
4. **onGiaMontatoClick** → setMode('Già Montato') + mountExperiment final state variazione capitolo + diagnose visual highlight errori (se circuit broken)
5. **onLiberoClick** → setMode('Percorso') + mountExperiment ultimo capitolo completato classe (auto-Percorso, NON sandbox vuoto)
6. **REMOVE** "guida da errore" UI affordance + handler — diagnose semantic integrated Già Montato + Passo-Passo
7. Linguaggio INVARIANTE cross-mode: Principio Zero V3 plurale "Ragazzi" + Vol/pag VERBATIM (post-LLM validation ADR-009 + ADR-026 content safety guard)

Non-goal:
- Mode "Sandbox vuoto" pure resta DEV-only (debug mode, flag `VITE_ENABLE_SANDBOX_PURE=true`), NON user-facing
- Mode "Capstone" (es. progetto finale Vol3 cap27) NON è separato mode, è sotto-stato Percorso variation_id='capstone' lesson-paths-narrative
- Multi-mode parallelo (es. Percorso + Già Montato split-screen) NON scope iter 22, defer iter 30+

---

## 4. UX Behavior Matrix per Mode

Matrice canonical 4 modes (target user + UX behavior + linguaggio + primary action). Implementation `ModalitaSwitch.jsx` + `LavagnaShell.jsx` mode dispatch.

### 4.1 Percorso ⭐ (default narrative reading)

| Aspetto | Spec |
|---------|------|
| **Target user** | Classe (lettura collettiva LIM) + Docente (occhio-scorre narrativo) |
| **UX behavior** | Lettura libro page-by-page sequenziale, scroll narrativo capitolo, mostra testo VERBATIM + immagini volume + circuit visual passive (NO build interaction) |
| **Linguaggio** | Plurale "Ragazzi," + Vol/pag VERBATIM + cita testo VERBATIM volume (NO parafrasi, ADR-009 INVARIANT) |
| **Primary action** | "Ragazzi, leggiamo insieme... [testo VERBATIM Vol.X pag.Y]" |
| **Entry point** | Default mode iter 22+, Libero auto-mount Percorso |
| **Exit condition** | Click "Passo-Passo" o "Già Montato" o capitolo end → propose next |
| **Circuit interaction** | Passive (visual only, NO drag-drop), highlight visual passi narrativi |
| **Voice UNLIM** | Wake word "Ehi UNLIM leggi" → TTS Isabella narratore volumi |

### 4.2 Passo-Passo (build sequenziale variazione)

| Aspetto | Spec |
|---------|------|
| **Target user** | Classe build kit fisico ELAB + Docente guida step-by-step |
| **UX behavior** | Step sequenziali variazione interno capitolo (variation_1 → variation_2 → variation_3 → variation_4 lesson-paths-narrative ADR-027), verifica componente per componente + feedback errore inline |
| **Linguaggio** | Plurale "Ragazzi," + istruzioni operative + analogia real-world (1 minimum, ADR-026 content safety) |
| **Primary action** | "Ragazzi, ora montiamo il LED — controllate breadboard fila E pin 13" |
| **Entry point** | Click "Passo-Passo" da Percorso (post lettura capitolo) o esplicito switch |
| **Exit condition** | Variation completed → propose next variation o "Già Montato" finale |
| **Circuit interaction** | Active (drag-drop componenti + connect wires), step verification real-time CircuitSolver MNA/KCL |
| **Diagnose flow** | Integrato inline (errore componente → feedback "Ragazzi, controlliamo la resistenza pin 13" + Vol/pag riferimento) |
| **Voice UNLIM** | Wake word "Ehi UNLIM verifica" → captureScreenshot + Vision Layer 5 ADR-023 |

### 4.3 Già Montato (pre-assembled diagnose)

| Aspetto | Spec |
|---------|------|
| **Target user** | Docente diagnose/spiegazione veloce + Classe focus comprensione (NON build) |
| **UX behavior** | Circuit pre-assembled mostra TUTTO già funzionante (final state variazione capitolo), focus spiegazione comportamento NON build, diagnose visual se broken |
| **Linguaggio** | Plurale "Ragazzi," + spiega comportamento + diagnose se broken (errore visual highlight + Vol/pag riferimento) |
| **Primary action** | "Ragazzi, guardate qui — il LED si accende perché [spiegazione VERBATIM Vol.X pag.Y]" |
| **Entry point** | Click "Già Montato" da Percorso (post lettura) o Passo-Passo (post completion) |
| **Exit condition** | Click "Passo-Passo" (build da zero) o "Percorso" (lettura) |
| **Circuit interaction** | Passive default (visual only), opt-in interactive (docente click componente → highlight + spiegazione) |
| **Diagnose flow** | PRIMARY (mode dedicated diagnose visual + verbal) |
| **Voice UNLIM** | Wake word "Ehi UNLIM spiega" → onniscenza Layer 1+2+3+6 ADR-023 |

### 4.4 Libero (auto-start Percorso)

| Aspetto | Spec |
|---------|------|
| **Target user** | Docente sperimentazione post-capitolo completato + Classe esplorazione guidata UNLIM proattivo |
| **UX behavior** | Click "Libero" → **mounts Percorso automatico** (NON sandbox vuoto), entry point ultimo capitolo completato classe (Layer 4 class_memory.capitolo_corrente ADR-023) |
| **Linguaggio** | Plurale "Ragazzi," + UNLIM proattivo wake word + voce Isabella Italian |
| **Primary action** | "Ragazzi, abbiamo completato il capitolo X — proviamo questa variazione: [auto-mount Percorso]" |
| **Entry point** | Click "Libero" da qualsiasi mode |
| **Exit condition** | Esplicito switch altro mode |
| **Circuit interaction** | Active (full freedom drag-drop), MA UNLIM proattivo suggerisce variazioni narrative continuum |
| **Diagnose flow** | Integrato (UNLIM osserva circuit_state Layer 7 ADR-023 + suggerisce fix) |
| **Voice UNLIM** | Wake word "Ehi UNLIM" sempre attivo + nudge proattivo dopo 30s inattività |

### 4.5 Mode REMOVED — "guida da errore"

❌ ~~"Guida da errore"~~ — eliminate iter 22 release.

Razionale removal:
- Confusing per docente (NON sa quando entrarci esplicitamente)
- Sovrapposizione semantica con diagnose flow Già Montato + Passo-Passo
- Mai usato spontaneamente per docenti pilota Tea iter 14-17 osservazioni (UAT feedback)
- Diagnose flow ora INTEGRATO inline ogni mode (Passo-Passo step verification real-time, Già Montato visual highlight errori)

Implementation removal:
- `ModalitaSwitch.jsx`: rimuovere UI affordance "Guida da errore" + handler `onGuidaErroreClick`
- `LavagnaShell.jsx`: rimuovere `case 'GuidaDaErrore'` mode dispatch
- Test: rimuovere `tests/integration/guida-da-errore-mode.test.js` (se presente) + verificare ZERO regression test suite

---

## 5. Implementation iter 22 step-by-step

### 5.1 Iter 22 P0 — ModalitaSwitch refactor + Libero auto-Percorso

Atoms:
1. **A1 architect-opus**: this ADR-025 PROPOSED ratify Andrea iter 22 entrance (~6 min Andrea decision Y/N + UX matrix review).
2. **A2 gen-app-opus**: `src/components/lavagna/ModalitaSwitch.jsx` refactor:
   - Add 4 affordance (Percorso ⭐ default visual marker + Passo-Passo + Già Montato + Libero)
   - Remove "Guida da errore" UI affordance + handler
   - Implement `onLiberoClick` → `setMode('Percorso')` + `mountExperiment(class_memory.capitolo_corrente)` (Layer 4 ADR-023)
   - Implement `onGiaMontatoClick` NEW → `setMode('GiaMontato')` + `mountExperiment(variation_final_state)` + visual diagnose highlight
3. **A3 gen-app-opus**: `src/components/lavagna/LavagnaShell.jsx` mode dispatch refactor:
   - Replace `case 'Libero'` sandbox vuoto → `case 'Libero'` auto-mount Percorso narrative
   - Add `case 'GiaMontato'` NEW pre-assembled mode dispatch
   - Remove `case 'GuidaDaErrore'` legacy
4. **A4 gen-test-opus**: `tests/integration/modalita-4-modes-end-to-end.test.js` E2E ogni mode entry/exit + Principio Zero V3 cross-mode validation (≤60 parole + plurale "Ragazzi" + Vol/pag VERBATIM).
5. **A5 gen-test-opus**: regression sweep — verificare ZERO breakage modalità existing (Percorso + Passo-Passo).

### 5.2 Iter 23 P1 — Schema lesson-paths support 4-mode metadata

Coupled ADR-027 Volumi narrative refactor. Atoms:
1. **B1 gen-app-opus**: schema lesson-paths-narrative `v{N}-cap{M}.json` extend con 4-mode metadata:
   ```json
   {
     "chapter": "vol1-cap6",
     "themes": ["LED", "resistenza", "Ohm"],
     "modes_supported": ["Percorso", "Passo-Passo", "GiaMontato", "Libero"],
     "variations": [
       {
         "step": 1,
         "components": [...],
         "instructions": "...",
         "expected": "...",
         "modes_entry_state": {
           "Percorso": "passive_view",
           "Passo-Passo": "build_step_1",
           "GiaMontato": "final_assembled_state",
           "Libero": "passive_view_with_proactive_unlim"
         }
       }
     ]
   }
   ```
2. **B2 gen-test-opus**: `tests/unit/lesson-paths-narrative-schema.test.js` schema validation 4-mode metadata + back-compat schema flat 92 file.

### 5.3 Iter 24 P1 — UI Percorso/Passo-Passo refactor narrative

Coupled ADR-027 §3 Step 3. Atoms:
1. **C1 gen-app-opus**: Percorso reader scroll page-by-page dentro capitolo (lesson-paths-narrative `chapter` field + `themes` ToC).
2. **C2 gen-app-opus**: Passo-Passo step navigation variation_1 → variation_2 → variation_3 → variation_4 dentro capitolo.
3. **C3 gen-app-opus**: Già Montato jump to final state variation (`modes_entry_state.GiaMontato`).
4. **C4 gen-test-opus**: Davide co-author validate narrative flow 27 capitoli (UAT iter 25).

---

## 6. Sense 1.5 Morfismo runtime alignment

Modalità 4 modes rispetta morfismo runtime ADR-019:

### 6.1 Per docente specifico (linguaggio INVARIATO, contesto adatta)

- **Linguaggio plurale "Ragazzi" + Vol/pag VERBATIM** = INVARIANTE cross-mode (Principio Zero V3 ADR-009 NON negoziabile).
- **Adatta dettagli per esperienza docente** (Layer 4 teacher_memory.esperienza_rilevata ADR-023):
  - Docente esperto Arduino → Già Montato default mode (mostra final state veloce, salta Passo-Passo verboso)
  - Docente principiante → Percorso default mode (lettura narrativa step-by-step rassicurante)
  - Memoria docente: mode preferito sessione precedente → suggerito default iter successivo

### 6.2 Per contesto classe specifico

- **Età studenti rilevata** (Layer 4 class_memory.eta_studenti):
  - 8-10 anni → Percorso primary (lettura libro narrativo con analogie esplicite)
  - 11-14 anni → Passo-Passo + Già Montato primary (build hands-on + diagnose)
- **Livello competenza classe** (Layer 4 class_memory.livello_competenza):
  - Base → Percorso + Passo-Passo guidati
  - Avanzato → Già Montato + Libero (sperimentazione + diagnose)
- **Kit specifico** (Layer 4 class_memory.kit_dotazione):
  - Omaric base → mode flow standard
  - Omaric avanzato → unlock Libero earlier (post-cap6 vs post-cap10 base)

### 6.3 Funzioni morfiche + finestre morfiche per mode

- **Percorso**: finestre wide screen LIM 5m readability (font 18-24px Oswald titoli + Open Sans body 16px), TTS Isabella narratore volumi protagonista.
- **Passo-Passo**: finestre split-screen (60% circuit canvas + 40% step instructions sidebar), highlight grosso colorato componente corrente.
- **Già Montato**: finestre full-screen circuit canvas (visual primary), spiegazione overlay bottom 30%.
- **Libero**: finestre full freedom canvas + UNLIM mascotte floating window proattivo (wake word + nudge 30s).
- **Toolbar morfica**: 4 strumenti core (Pen / Wire / Select / Delete) + AI command bar, layout adatta mode (Già Montato = Pen primary diagnose, Passo-Passo = Wire primary build).

---

## 7. Cross-reference

### 7.1 ADR-027 coupling — Volumi narrative refactor schema

ADR-025 modalità 4 modes coupled ADR-027 sibling iter 19 caveman:
- **Percorso** = narrative continuum reading lesson-paths-narrative `v{N}-cap{M}.json` schema (1 file per capitolo, multi-variazione interno) — NON 92 file flat current.
- **Passo-Passo** = variazione sequenziale interno capitolo (`variations[]` array ADR-027 schema).
- **Già Montato** = variazione final state (`variations[last].modes_entry_state.GiaMontato`).
- **Libero** = auto-Percorso entry point ultimo capitolo completato classe (`class_memory.capitolo_corrente`).

Refactor schema lesson-paths flat → narrative GROUPED scope ADR-027 §3 Step 1-4. Modalità 4 modes implementation iter 22 dipende ADR-027 schema iter 23+ (Percorso reader + Passo-Passo step navigation).

### 7.2 ADR-019 Sense 1.5 Morfismo runtime

Modalità adattive per docente esperienza + classe età + kit tier + LIM resolution = morphic runtime tuning Sense 1.5 ADR-019 §C funzioni morfiche + finestre morfiche iter 10 estensione. Modalità 4 modes default dispatch dipende `teacher_memory` + `class_memory` Layer 4 ADR-023.

### 7.3 ADR-009 Principio Zero validator middleware V3

Linguaggio cross-mode INVARIANTE plurale "Ragazzi" + Vol/pag VERBATIM + ≤60 parole = Principio Zero V3 ADR-009 post-LLM validation runtime. Ogni mode emit response → ADR-009 + ADR-026 content safety guard pre-emit.

### 7.4 ADR-023 Onniscenza completa 7-layer

Modalità mode dispatch reads onniscenza Layer 4 (teacher_memory + class_memory) + Layer 7 (state_current modules) pre-execute. Es. `onLiberoClick` → reads `class_memory.capitolo_corrente` → mountExperiment narrative continuum.

### 7.5 ADR-024 Onnipotenza ClawBot

ClawBot 80-tool dispatcher pilota mode dispatch via L2 templates `setMode-percorso` + `setMode-passo-passo` + `setMode-gia-montato` + `setMode-libero-auto-percorso`. Composite handler iter 22+ runtime sequential (es. mode-change → mountExperiment → highlight-step → speak Vol/pag).

---

## 8. Failure modes + graceful degradation

| Failure | Comportamento | Recovery |
|---------|---------------|----------|
| Libero auto-Percorso lesson-paths-narrative missing capitolo_corrente | Fallback: mount capitolo Vol1-cap1 (default entry) + nudge "Ragazzi, iniziamo dal capitolo 1" | Layer 4 class_memory write capitolo_corrente=vol1-cap1 |
| Già Montato mode lesson-paths-narrative variation_final_state missing | Fallback: mount Passo-Passo step finale + visual highlight "final state" | Schema lesson-paths-narrative iter 23 fix |
| ModalitaSwitch.jsx legacy "Guida da errore" handler residuo | Defensive: case 'GuidaDaErrore' → setMode('GiaMontato') (semantic mapping) | Code review iter 22 verificare removal completo |
| teacher_memory.esperienza_rilevata empty (nuovo docente) | Default mode: Percorso (entry point intuitivo) | Layer 4 ADR-023 graceful degradation |
| class_memory.eta_studenti empty | Default age: 10 anni → Percorso primary | Layer 4 ADR-023 graceful degradation |

**Test plan failure modes iter 23**: chaos engineering script `scripts/chaos/modalita-mode-switch-fail.mjs` simula stato Layer 4 missing + verifica fallback graceful + Principio Zero V3 valid response.

---

## 9. Andrea ratify queue iter 22 entrance

Andrea ratify queue iter 22 (~6 min decision):

1. **Modalità simplification 4 modes Y/N** (this ADR §3 decision)
2. **Libero auto-start Percorso behavior Y/N** (this ADR §4.4 decision)
3. **Già Montato new mode UX spec Y/N** (this ADR §4.3 decision)
4. **"Guida da errore" removal Y/N** (this ADR §4.5 decision)
5. **Coupling ADR-027 narrative refactor schema Y/N** (this ADR §7.1 decision)

Cross-ref ANDREA-MANDATES-ITER-18-PM-ADDENDUM §6 voci 1+2+3 ratify queue iter 22.

---

## 10. Activation iter 22 (final)

Andrea iter 22 entrance ratify (~6 min):
1. Approve ADR-025 status PROPOSED → ACCEPTED via comment commit message.
2. Approve gen-app-opus iter 22 ATOM-S22-A2 spawn (ModalitaSwitch.jsx refactor + LavagnaShell.jsx mode dispatch).
3. Approve gen-test-opus iter 22 ATOM-S22-A4 spawn (E2E modalità 4 modes test).
4. Coupled ADR-027 ratify simultaneo (narrative refactor schema iter 23-25).

**Iter 22 score target**: Modalità Box NEW = 0.6 (parziale, full coverage iter 25 close post Davide narrative flow validate UAT).

**Sprint T iter 25 close target ONESTO**: 9.95/10 (Modalità Box 1.0 + Onniscenza Box 1.0 ADR-023 + Onnipotenza Box 1.0 ADR-024 + Sense 1.5 morfismo runtime tuning live + Volumi narrative refactor ADR-027 closed).

**End ADR-025**.
