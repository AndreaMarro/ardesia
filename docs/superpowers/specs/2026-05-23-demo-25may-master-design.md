# Demo Live 25/05 — Master Design Spec

- **Data:** 2026-05-23
- **Autore:** Andrea Marro (con Claude Code)
- **Stato:** Draft v1 — in attesa review utente + Codex adversarial review
- **Topic:** Master spec per demo live 25/05/2026 sera — 9 subsystem in 2 giorni
- **Sprint:** Demo-25may
- **Deadline:** 25/05/2026 sera (T-48h da 23/05 ore 23:00)
- **Branch target:** `feat/demo-25may` (da `main`)

---

## 1. Contesto e Vincoli

Prima demo live pubblica di **ELAB Tutor**. Audience: committenti (Giovanni Fagherazzi,
Omaric, Davide Fagherazzi) + potenziali partner scuole. Andrea è unico sviluppatore. La
reputazione di Andrea + futura adozione PNRR MePA dipendono da questa demo.

Vincoli:

- **2 giorni** (23/05 sera → 25/05 sera) per shippare 9 subsystem integrati.
- **Anti-regressione FERREA**: baseline tests `automa/baseline-tests.txt` non devono
  scendere. Build deve passare. No mock/demo dati. Live data only.
- **Morfismo Triplet** (CLAUDE.md): software ↔ kit Omaric ↔ volumi cartacei devono
  apparire come **stesso prodotto**. Demo è il test ultimo di questo principio.
- **Principio Zero**: docente è il tramite, UNLIM è strumento docente, studenti lavorano
  sul kit fisico. La demo deve mostrare DOCENTE che presenta alla classe (LIM proiezione).
- **Narrative Arc**: esperimenti collegati come nel libro stampato, NO card flat scollegate.
- **Onestà numerica** (CoV): nessuna inflazione score, nessun "quasi pronto" = 0%, ogni
  claim verificato con utente reale / test live.

## 1.5 Principi Guida ChatGPT Pro Integration (v1.2)

Deep research report ChatGPT Pro (39KB, integrato 23/05 23:55) ha rinforzato 7 principi
da applicare ad ogni subsystem:

1. **Convergence, NOT rewrite** — il repo ha già scaffold maturi in molte aree (S3
   cloud-compile, S4 CompileUploadButton, S5 unlimContextCollector, S6 unlim-fumetto
   function, S7 quiz/diary già in fumetto-prompt). Convergere su questi, NON rifare.
2. **Truthful UX** — usa stati esistenti `compile_only_no_board`, mostra byte
   flash/RAM, NON fingere upload se hardware assente. Demo onesta > demo magica.
3. **Browser gating** — WebUSB + Web Serial NON sono Baseline universale (MDN). Demo
   path = Chrome/Edge first-class. Safari = degraded `compile_only` mode esplicito.
4. **Volume = source of truth** — `volume-references.js` 94/94 enriched è il lesson
   graph. NON inventare contenuto, normalizzarlo + indicizzarlo + page anchors.
5. **Toolbox audit BEFORE wiring** — `scratchToolboxProgressive.js` ha block IDs
   FABBRICATI (warning esplicito iter 82 PHASE 5.5 "NOT FUNCTIONAL UNTIL iter 83+
   AUDIT"). NON cabled in Blockly.inject() finché audit + rename canonical
   (`arduino_*` prefix) non complete.
6. **UNLIM stateful pipeline 5-ruoli** — NON singolo prompt gigante. Pipeline:
   Planner → Retriever → Generator → Verifier → Formatter. Pattern ReAct + CoVe.
7. **Comic 3-phase** — NON one-shot "genera fumetto". Pipeline: panel script JSON
   → prompt per pannello + style bible → render (Gemini image gen).
8. **1 task = 1 branch = 1 PR = 1 artifact set = 1 review** (Andrea 24/05 01:35
   ChatGPT Pro framework). Atomic. NO "Claude sistema tutto".
9. **Mac principale = lead / merge / demo rehearsal** (Andrea). **Codex Desktop =
   primary S1 worker** (Andrea Mac, familiar env). **Mac mini = parallel test runner
   + nightly report + Playwright baseline + screenshot farm**. NO concurrent edits
   stesso file. NO auto merge.
10. **PR sections obbligatorie**: Demo impact / Scope / Screenshots / Tests / Known
    unknowns / Rollback. Missing section = no merge.

**Implicazione architettura**: 5 layer hub-and-spoke (da diagram report):

```
Frontend ELAB Tutor (React + Vite + Blockly)
  ├── Lesson Graph Engine (volume-references.js source of truth)
  ├── Simulator Engine (UI state + component model — NO MCU emulation Nano R4)
  ├── Compile Proxy same-origin → Cloud Compile Service (arduino-cli + board profiles)
  │     → HEX/BIN artifact
  ├── Upload Adapter capability-based:
  │     ├── WebUSB DFU → Nano R4 (Chrome/Edge)
  │     └── Web Serial → UNO/Nano AVR fallback
  ├── UNLIM Orchestrator: Planner → Retriever → Generator → Verifier → Formatter
  │     └── Retrieval Store (volumi + esperimento + memoria sessione)
  └── Media Services: Comic Generator + Quiz Generator + Diary Generator
        (tutti da stesso lesson state + session log)
```

**Conferma Nano R4 vs S4**: report conferma "Nano S4" è probabile refuso. Target
canonico demo = **Arduino Nano R4** (Renesas RA4M1, 256kB Flash, 32kB SRAM, USB-C, RTC,
DAC, CAN). Tutto codice + lesson-paths + FQBN `arduino:renesas_uno:nanor4`.

---

## 1.7 Re-scope v1.3 (CRITICAL — post mem-search + GitHub state audit)

Analisi history + PR state + worktree mapping rivela: **molti subsystem GIÀ SHIPPED in
PR recenti maggio 2026**. Spec v1.2 over-scoped. Re-scope v1.3:

| Subsystem | v1.2 scope | Realtà repo | v1.3 effort |
|---|---|---|---|
| **S1** Geometric fidelity 7 esp | Codex 7 esp refactor | **NESSUNA MERGE.** Vero gap. | **40% effort demo** (Codex Desktop overnight + Andrea hero esp) |
| **S2** Passo-passo in VolumeReader | Nuovo componente | iter 36 PM regression aperta, NO VolumeReader esistente. Vero gap. | **40% effort demo** (Andrea P1 + P2) |
| **S3** Compile/upload Nano R4 | Da costruire | **PR #148 #145 #146 #149 MERGED ieri 22/05.** WebUSB DFU instrumentato, cross-compile librerie OK, compile UX shipped. BROWSER DFU NON ancora provato su hardware reale (PR #148 honest scope). | **10% effort** (UAT live Riccardo/Tea + verify) |
| **S4** Blockly toolbox + restyle | AUDIT blocker priority 1 | iter 82 Blockly UX overhaul MERGED. `scratchToolboxProgressive.js` NON cabled in ScratchEditor (usa TOOLBOX_XML legacy preserved). | **IN SCOPE** (Andrea ratify 24/05 01:15+01:20 "deve funzionare", "no post demo"). MVP: audit block IDs + Arduino code generator custom + passo-passo code 1 esp + restyle EduKit. ~6-10h Codex+Andrea parallel. |
| **S5** UNLIM full awareness | 5-role pipeline da zero | **PR #135 awareness-flags Slice 1A MERGED.** Slice 1B vision iter 89+. | **5% effort** (enhance + 3 scenari pre-rehearsed) |
| **S6** Fumetto AI | 3-phase pipeline da costruire | **PR #144 #151 #152 #153 MERGED ieri.** Generazione fumetto completa iter 83 + 3 fix Gemini retry/payload/live context. Working. | **2% effort** (UI polish + asset rehearsed) |
| **S7** Quiz + diario | Da costruire | unlim-fumetto function GIÀ genera quiz+diary stesso output. UI wire-up trivial. | **2% effort** (UI mount in report) |
| **S8** Plugin/skill | Da costruire | Plugin/skill infrastructure necessario per workflow guardrails. | **1% effort** (MVP minimo) |
| **S9** Demo orch | 2 dry-run + asset prep | Necessario. | **+demo prep tempo** |

**Side critical**: 5 PR aperti Sprint B Code Kit (#154-158) — devono mergere ENTRO P0
sera o close+cherry-pick. Lasciarli aperti = merge conflicts in 24h su #compile-home.

**Implicazione timeline**: P1 24/05 INTERAMENTE dedicato a S1 + S2 (no time waste su
S3/S6/S7 già shipped). P2 25/05 AM = UAT live S3 hardware + S5 enhance + integration
test. P2 PM = dry-run + fallback prep + DEMO.

**Andrea ratify gate v1.3**: confermi questo re-scope? Se NO, dimmi dove sbaglio.

---

## 2. Obiettivo Demo

Mostrare in **~30 min** che ELAB Tutor:

1. È **identico ai volumi cartacei** (geometria componenti, ordine, pagine).
2. Integra **passo-passo dentro il volume stesso** (NON pannello separato).
3. **Compila + carica codice Arduino** da browser su Nano R4 fisico.
4. Ha **interfaccia Blockly+Arduino** in stile EduKit, con guida passo-passo per il codice.
5. **UNLIM è consapevole** dello stato corrente del circuito e della sessione, non dà
   risposte generiche.
6. Al termine della sessione genera **fumetto AI** + **quiz** + **diario** narrativo.

Output: 3 stakeholder (Giovanni, Omaric, Davide) dichiarano "questo è vendibile alle
scuole settembre 2026".

## 3. Esperimenti Selezionati (7)

Riduzione **temporanea** per demo. Resto dei 79 esperimenti restano in repo come
percorso completo del prodotto post-demo.

| # | ID | Titolo | Vol | Pag | Tipo | Demo highlight |
|---|---|---|---|---|---|---|
| 1 | `v1-cap6-esp1` | Accendi il tuo primo LED | 1 | (TBD) | hardware base | Geometria identica libro |
| 2 | `v1-cap6-esp2` | LED senza resistore (cosa NON fare!) | 1 | (TBD) | safety lesson | UNLIM diagnostica errore |
| 3 | `v1-cap6-esp3` | Cambia luminosità con resistenze diverse | 1 | (TBD) | parametric | Manipolazione live |
| 4 | `v2-cap7-esp1` | Scarica condensatore con multimetro | 2 | (TBD) | strumentazione | Multimetro live |
| 5 | `v2-cap7-esp2` | Scarica condensatore con LED rosso | 2 | (TBD) | fisica visibile | **LED fade = magic moment** |
| 6 | `v3-cap6-esp4` | Due LED che si alternano | 3 | (TBD) | embedded coordination intro | Compile+upload Nano R4 live (2 LED) |
| 7 | `v3-cap6-esp5` | Costruiamo un semaforo | 3 | 57 | embedded coordination 3-LED | 3 LED orchestrati pin 5/6/9 |

**Note operative (rev. v1.1 — Andrea ratify 2026-05-23 23:35):**

- Selezione vol3: **2 esperimenti consecutivi cap6** (esp4 + esp5) per narrative arc
  naturale "2 LED alternano → 3 LED semaforo" (Morfismo Sense 2 narrative continuity).
- Vol3 NON usa "SOS variant" (originale prompt v1) — sostituito perché esp5 cap6 e
  cap5-esp1 NON sono consecutivi, Andrea esplicita "2 consecutivi per volume".
- Distribuzione finale: 3 Vol1 + 2 Vol2 + 2 Vol3 = 7 esp totali.
- Vol1 = exception (3 esp), Vol2+Vol3 = regola (2 consecutivi cad).
- Page numbers `(TBD)` vanno popolati durante S2 da `src/data/volume-references.js`
  (94/94 enriched per CLAUDE.md).
- Tutti e 7 hanno `modes_supported = [percorso, passo-passo, gia-montato, libero]` già
  nel lesson-path JSON.

---

## 4. Subsystem S1→S9

### 4.1 S1 — Sim Geometric Fidelity (Morfismo Sense 2 visivo)

**Goal**: Ogni componente nei 7 esperimenti renderizzato **identico** al disegno del
volume: stessa orientazione, stesso colore cavo, stessa geometria del filo nello spazio,
stessa posizione su breadboard. Pila SENZA "strisci di cavi all'inizio" — solo rosso +
nero diretti.

**Stato attuale:**

- Componenti SVG presenti (21 totali): `src/components/simulator/components/`
- `PlacementEngine.js` (822 righe) auto-place
- `SimulatorCanvas.jsx` (3149 righe) rendering
- `lesson-paths/v*.json` hanno `build_circuit.intent.components` con type+id+position
- `NanoR4Board.jsx` SCALE=1.8 (regola immutabile CLAUDE.md)
- `BB_HOLE_PITCH = 7.5px`, `SNAP_THRESHOLD = 4.5px`

**Gap:**

- Posizionamento attuale **NON pixel-perfect** vs disegni libro.
- `Battery9V.jsx` ha attualmente "strisci di cavi" (utente lo vuole eliminato).
- Wire routing automatico → geometria del filo nello spazio diversa dal libro.
- Orientazione componente (resistori, LED) può non matchare i disegni Vol1/2/3.

**Design:**

1. **Reference extraction** (preparazione, P0 23/05 sera + P1 24/05 AM):
   - Per ogni esperimento, estrarre dal PDF la pagina con disegno circuito (è già in
     `src/data/volume-references.js` con bookText, ma serve anche **coordinate visive**
     dei componenti).
   - Salvare come `docs/demo-25may/circuit-references/<exp-id>.png` (screenshot pagina).
   - **Mac Mini task delegabile**: Tea o background agent estrae 7 immagini.

2. **Schema lesson-paths esteso** per i 7 esp (S1 P1):

   ```json
   "build_circuit": {
     "reference_image": "/docs/demo-25may/circuit-references/v1-cap6-esp1.png",
     "components": [
       {
         "type": "battery9v",
         "id": "bat1",
         "position": {"x": 50, "y": 100, "rotation": 0},
         "render_mode": "clip_simplified"
       },
       {
         "type": "led",
         "id": "led1",
         "position": {"x": 240, "y": 180, "rotation": 0},
         "anode_at": "d23",
         "cathode_at": "d24"
       }
     ],
     "wires": [
       {
         "from": "bat1.pos",
         "to": "rail.bus-top-plus.0",
         "color": "red",
         "path": [
           {"x": 60, "y": 110},
           {"x": 60, "y": 80},
           {"x": 100, "y": 80}
         ]
       }
     ]
   }
   ```

3. **Battery9V.jsx modifica** (S1 P1):
   - Aggiungere prop `renderMode: "clip_simplified" | "default"`.
   - In modalità `clip_simplified`: solo clip rossa + clip nera come connection points,
     NO strisci cavi pre-renderizzati. Wire renderizzati separatamente da `Wire.jsx`.

4. **Wire.jsx modifica** (S1 P1):
   - Accettare prop `path: Array<{x,y}>` per routing manuale (non auto).
   - Se `path` undefined → fallback auto-routing attuale.
   - Stroke color = `wire.color` (default: dichiarato in lesson-path).

5. **Move-aware passo-passo** (S1 P1):
   - Quando user sposta componente in passo-passo mode, sistema rileva delta vs posizione
     attesa.
   - Se delta < threshold: continua step successivo come se montato correttamente.
   - Se delta > threshold ma componente ancora **funzionalmente equivalente** (es. LED su
     riga adiacente breadboard ma stessa colonna): accetta + UNLIM commenta "Ottimo,
     funziona anche così!".
   - Logic in `PlacementEngine.js` o nuovo `StepValidationEngine.js`.

6. **Visual diff validation** (S1 P1, Mac Mini parallel):
   - Playwright spec `tests/e2e/demo-geometric-fidelity.spec.js`:
     - Per ogni 7 esp, mount circuit programmatically.
     - Screenshot SVG canvas.
     - Compare vs `circuit-references/<exp-id>.png` con tolerance (es. SSIM > 0.85).
     - Fail se delta significativo.
   - Run continuous su Mac Mini.

**MVP scope demo:** 3 esp PERFECT (v1-cap6-esp1, v2-cap7-esp2, v3-cap6-esp5 = i 3
"hero" della demo). Altri 4 "good enough" (riconoscibili ma non pixel-perfect).

**Owner:** Codex Desktop overnight 23/05 sera → 24/05 mattina (long refactor parallelo
7 esp). Andrea verifica output al mattino.

**Fallback:** Se Codex output non soddisfacente entro 24/05 ore 09:00 → Andrea fa 3 esp
hero a mano P1 24/05 AM, altri 4 restano con auto-routing attuale.

---

### 4.2 S2 — Passo-passo dentro Volume (integrazione narrativa)

**Goal**: Quando user entra in esperimento mode `passo-passo`:

- Vede **le pagine del libro** (PDF rendering visibile, ben leggibile).
- Vede **panel passo-passo accanto/sotto** con step current + button "Mostrami".
- Può **scrivere/annotare** sulla pagina del libro (manuale esistente preservato).
- Click "Avanti" all'ultimo step → **prossimo esperimento, ancora in passo-passo mode**.
- Se invece in mode `gia-montato`: volume si apre automaticamente sulla pagina relativa
  all'esperimento corrente (NO panel passo-passo).
- Campo input "Vai a pagina N" sempre visibile nel volume pane.

**Stato attuale:**

- `BuildModeGuide.jsx` esiste (regressione iter 36 PM nota — feedback Andrea 06/05).
- Volume PDFs in `public/volumes/volume1.pdf`, `volume2.pdf`, `volume3.pdf`.
- `volume-references.js` 94/94 enriched con bookText.
- NO componente esistente per PDF render.
- Mode switching parziale (lesson-paths hanno `modes_entry_state`).

**Design:**

1. **`VolumeReader.jsx`** (nuovo componente, S2 P1):
   - Wrapper `react-pdf` (npm install richiede approvazione Andrea — alternativa:
     `pdfjs-dist` raw, già in dependencies se presente).
   - Props: `volume: 1|2|3`, `page: number`, `onPageChange: (n) => void`.
   - Renderizza pagina singola con zoom adattivo (fit-width LIM).
   - Overlay annotazioni: canvas trasparente sopra pagina, salva tracciati per
     `(volume, page, session_id)` in Supabase `volume_annotations` table (nuova).
   - Input "Vai a pagina" + freccia avanti/indietro nel toolbar bottom.

2. **`PassoPassoVolumeBridge.jsx`** (nuovo componente, S2 P1):
   - Layout 60/40 split (volume sx, passo-passo dx) su LIM landscape; stack vertical su
     iPad portrait (futuro).
   - Sincronizza `VolumeReader.page` con `currentStep.volume_reference.page` dal
     lesson-path.
   - Render `<VolumeReader />` + `<BuildModeGuidePanel />` (refactor di
     `BuildModeGuide.jsx`).

3. **Mode switching logic** (S2 P1):
   - `NewElabSimulator.jsx` esistente legge `modes_entry_state[currentMode]` dal
     lesson-path.
   - In mode `passo-passo`: monta `<PassoPassoVolumeBridge />` con `currentStep = step_1`.
   - In mode `gia-montato`: monta `<VolumeReader />` solo (full width volume pane), con
     `page = experiment.volume_reference.page`. Simulator dietro shows final assembled
     circuit.
   - In mode `percorso`: behavior attuale (PercorsoCapitoloView).
   - In mode `libero`: behavior attuale (canvas freeform).

4. **Navigation "Avanti" all'ultimo step** (S2 P1):
   - In passo-passo mode, dopo step finale: button "Avanti al prossimo esperimento".
   - Legge `lesson-path.next_experiment.id`.
   - Naviga a `#esperimento/<next-id>` con state `mode = passo-passo` preservato.
   - **Critico**: NON switcha a già-montato (utente esplicito).

5. **Annotation persistence** (S2 P1):
   - Schema Supabase `volume_annotations`:
     ```sql
     CREATE TABLE volume_annotations (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       session_id UUID NOT NULL,
       volume INT NOT NULL CHECK (volume IN (1, 2, 3)),
       page INT NOT NULL,
       paths JSONB NOT NULL,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
     );
     CREATE INDEX volume_annotations_session_idx ON volume_annotations(session_id);
     ```
   - Migration applicata via `npx supabase db push` con SUPABASE_ACCESS_TOKEN.

**MVP scope demo:** Funziona per i 7 esp demo. Altri esp continuano con BuildModeGuide
attuale (no VolumeReader integration finché post-demo).

**Owner:** Andrea (main thread) P1 24/05 mattina-pomeriggio.

**Fallback:** Se PDF render fail (CORS, performance, dipendenze) → mostrare pagina come
immagine statica PNG estratta da PDF (pre-rendering one-time). VolumeReader degraded.

---

### 4.3 S3 — Compile + Upload Nano R4 (LEVERAGE existing scaffold)

**Goal**: User edita codice Arduino (o Blockly → genera Arduino) → click "Compile +
Upload" → in browser senza download nulla → HEX/binary flashato su Nano R4 fisico
collegato USB → LED fisico si accende.

**ChatGPT Pro report finding (v1.2)**: Repo HA GIÀ scaffold completo. Strategia
revised: **CONVERGERE su scaffold esistente, NON rifare**.

**Stato attuale esistente (asset preziosi):**

- ✅ `infra/cloud-compile/server.js` — scaffold cloud compile reale con arduino-cli,
  allowlist CORS, API key, rate limit, sandbox per job, ritorno hexBase64.
- ✅ `infra/cloud-compile/openapi.yaml` — contratto API definito.
- ✅ `infra/cloud-compile/Dockerfile` + `render.yaml` — deploy config Render-style.
- ✅ `src/components/lavagna/CompileUploadButton.jsx` — UI con **stati ONESTI già
  presenti**: `compile_only_no_board`, parsing flash/RAM bytes, vendor ID Arduino
  (0x2341), product IDs runtime/DFU Nano R4.
- ✅ `src/components/lavagna/CompileUploadButton.module.css` — styling.
- ✅ `dfu` npm package presente in `package.json` (per WebUSB DFU).
- ✅ Mock DFU device interno per simulazione upload onesta.
- Recent commits Sprint B "Code Kit": iter-103 DFU instrumentation `feat/iter-41`.
- `src/features/unlimScreenAgent/actions/fixCompileError.ts` per UNLIM error recovery.
- Compile endpoint fallback n8n: `https://n8n.srv1022317.hstgr.cloud/compile`.

**Critical risk (da report):**

- Arduino Nano R4 = **Renesas RA4M1 ARM Cortex-M4**, NON AVR.
- Verificare che cloud-compile server.js supporta FQBN `arduino:renesas_uno:nanor4`
  (core `arduino:renesas_uno` installato).
- WebUSB + Web Serial NON Baseline — solo Chrome/Edge first-class. Safari = degraded.

**Design:**

1. **Verifica endpoint compile target** (S3 P0 23/05 sera):
   - Test curl: `curl -X POST https://n8n.srv1022317.hstgr.cloud/compile -d '{"code":"void setup(){pinMode(13,OUTPUT);} void loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}","board":"nano_r4"}'`
   - Verificare risposta: HEX/BIN per ARM? Errore?
   - Se non supporta → **fallback path**: usare Nano standard (AVR ATmega328p) per
     demo, segnalare Nano R4 come "in arrivo prossima release".

2. **WebUSB DFU upload** (S3 P2 25/05 AM):
   - Audit `src/components/.../iter-103` DFU instrumentation. Identifica file:
     ```bash
     grep -r "WebUSB\|DFU\|claimInterface\|requestDevice" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" | head
     ```
   - Verificare flow end-to-end: requestDevice → open → claim interface → write DFU
     packets → reset.
   - Test su Nano R4 fisico (Andrea ha Nano R4 in dotazione? **VERIFICARE**).

3. **UI Compile + Upload button** (S3 P2 25/05 AM):
   - Singolo button "Compila e carica su Arduino" in Lavagna o Blockly panel.
   - Stati: idle → compiling (spinner) → uploading (progress %) → success (✓ LED check)
     → error (UNLIM helper popup).
   - On error: UNLIM `fixCompileError` flow.

4. **Demo flow specifico** (S3 P2 25/05 PM rehearsal):
   - Apri esperimento v3-cap6-esp4 "Due LED alternano" o cap6-esp5 Semaforo.
   - Codice già caricato da template lesson-path.
   - Click "Compila e carica".
   - 5-15s wait (n8n compile + WebUSB upload).
   - LED fisico inizia a lampeggiare → audience applauda.

**MVP scope demo:** UN esperimento live (v3-cap6-esp4 "Due LED alternano" preferito per
semplicità - solo 2 LED su pin digitali). Altri: solo compile success animation, no
upload fisico (per evitare disconnessione hardware mid-demo).

**Owner:** Parallel agent o Andrea 25/05 mattina.

**Fallback (multi-livello):**

- L1: Compile RA4M1 fail → use Nano AVR + emulation (avr8js already in repo).
- L2: WebUSB DFU fail → mostrare HEX pre-compilato + filosofia "questo va su hardware
  fisico" senza dimostrare upload live.
- L3: Tutto rotto → demo solo simulatore (LED virtuale che lampeggia in canvas SVG).

---

### 4.4 S4 — Blockly Toolbox AUDIT (P1.0) + Arduino Code Generator + Restyle EduKit + Passo-passo Code

**ChatGPT Pro report finding CRITICAL (v1.2)**: `scratchToolboxProgressive.js` ha
block IDs FABBRICATI (es. `digital_write`, `led_on_pin`, `delay`...) che NON sono
registrati in `scratchBlocks.js` (registry usa `arduino_*` prefix: `arduino_digital_write`,
`arduino_delay`, etc.). File ha warning esplicito:

> ⚠️ **iter 82 PHASE 5.5 — NOT FUNCTIONAL UNTIL iter 83+ AUDIT** ⚠️
> Se cabled in Blockly.inject() WITHOUT block ID rename, flyout throws "Unknown block
> type" errors at mount time.

Codex Pattern V (iter 82 BLOCK-PUSH MED-2) + code-reviewer (CRITICAL-3) entrambi
flaggati. Test T1-T5 misurano solo array shape, NOT Blockly compatibility. ScratchEditor
NON importa questo file. Iter 83+ atom MANDATORY: audit + rename + integration test.

**Reordered priorities S4 (audit FIRST, restyle LAST):**

**Goal**:

1. **Audit + rename block IDs** (BLOCKER per demo, P1 24/05 AM 1-2h).
2. Arduino code generator custom su Blockly ufficiale.
3. Passo-passo code per Blockly+Arduino (1 esp demo).
4. Restyle EduKit (LAST, secondario rispetto a funzionalità).

**Stato attuale:**

- ⚠️ `src/components/simulator/panels/scratchToolboxProgressive.js` — NON FUNZIONALE.
- `src/components/simulator/panels/scratchBlocks.js` — registry canonical `arduino_*`.
- `src/components/.../ScratchEditor.jsx` — usa `TOOLBOX_XML` legacy (preserved).
- Compile chain Blockly → Arduino esistente.
- Memory reference: `blockly-editor-inspiration.md` documenta edukits.co/code.
- Blockly 12.x in `package.json` (per report verification needed).

**Design:**

1. **AUDIT + rename block IDs** (S4 P1 24/05 AM, 1-2h, BLOCKER):
   - Read `scratchBlocks.js` registry canonical (probabilmente `arduino_digital_write`,
     `arduino_delay`, `arduino_tone`, `arduino_analog_read`, `arduino_setup`,
     `arduino_loop`, etc.).
   - Diff vs `scratchToolboxProgressive.js` fabricated IDs.
   - **Decision tree**:
     - Option A (preferita): rename toolbox IDs to canonical (Arduino prefix). Edit
       toolbox JSON to use registered block types.
     - Option B (fallback): add aliases in scratchBlocks for fabricated names.
   - **Integration test MANDATORY** (NEW `tests/unit/blockly-toolbox-coherence.test.js`):
     ```js
     import { TOOLBOX_LEVEL_1, TOOLBOX_LEVEL_2, TOOLBOX_LEVEL_3 }
       from '.../scratchToolboxProgressive.js';
     import Blockly from 'blockly/core';
     import '.../scratchBlocks.js'; // registers all canonical blocks
     [TOOLBOX_LEVEL_1, TOOLBOX_LEVEL_2, TOOLBOX_LEVEL_3].forEach((toolbox, level) => {
       test(`level ${level + 1} blocks registered`, () => {
         const types = extractBlockTypes(toolbox);
         types.forEach(type =>
           expect(Blockly.Blocks[type]).toBeDefined(`Block ${type} not registered`)
         );
       });
     });
     ```
   - Run test + verify GREEN before wiring toolbox in ScratchEditor.

2. **Arduino code generator custom** (S4 P1 24/05 PM, 2-3h):
   - Per Blockly docs ufficiali + ChatGPT Pro report: NON usare BlocklyDuino datato.
   - Costruire custom generator `src/services/arduino-code-generator.js`:
     ```js
     import * as Blockly from 'blockly/core';
     export const arduinoGenerator = new Blockly.Generator('Arduino');

     arduinoGenerator.forBlock['arduino_digital_write'] = function (block) {
       const pin = block.getFieldValue('PIN');
       const value = block.getFieldValue('VALUE');
       return `digitalWrite(${pin}, ${value});\n`;
     };

     arduinoGenerator.forBlock['arduino_delay'] = function (block) {
       const ms = block.getFieldValue('MS');
       return `delay(${ms});\n`;
     };

     arduinoGenerator.forBlock['arduino_setup'] = function (block) {
       const code = Blockly.Arduino.statementToCode(block, 'DO');
       return `void setup() {\n${code}}\n\n`;
     };

     arduinoGenerator.forBlock['arduino_loop'] = function (block) {
       const code = Blockly.Arduino.statementToCode(block, 'DO');
       return `void loop() {\n${code}}\n`;
     };
     // ... per ogni blocco canonico in scratchBlocks.js
     ```
   - Test unit: `arduinoGenerator.workspaceToCode(workspace)` deve produrre codice
     valido per esp demo (cap6-esp4 Due LED alternano).

3. **CSS restyling** (S4 P2 25/05 PM, LAST priority 2h):
   - Palette: Navy `#1E4D8C`, Lime `#4A7A25`, Orange `#E8941C`, Red `#E54B3D` (CLAUDE.md
     regola 16).
   - Font: titoli Oswald, body Open Sans, codice Fira Code (regola 17).
   - Spacing: generosità (line-height 1.5, padding 16-24px).
   - Block shape Blockly: rounded corners 8px, drop shadow `0 2px 8px rgba(0,0,0,0.1)`.
   - Color-coded categorie blocchi: input=Lime, output=Orange, control=Navy, math=Red.

3. **Schema `code_steps` esteso** in lesson-paths/v*.json (S4 P1+P2):
   ```json
   "code_steps": {
     "blockly": [
       {
         "step": 1,
         "instruction": "Trascina il blocco 'quando faccio partire' nell'area di lavoro",
         "block_id": "scratch_event_whenflagclicked",
         "highlight_target": {"category": "Eventi"},
         "explanation": "Questo è il punto di partenza del programma — come la prima parola di una frase"
       },
       {
         "step": 2,
         "instruction": "Trascina 'imposta pin 13 a HIGH' dentro il blocco precedente",
         "block_id": "arduino_digitalwrite",
         "params": {"pin": 13, "state": "HIGH"},
         "explanation": "Stai dicendo ad Arduino: accendi il LED collegato al pin 13"
       }
     ],
     "arduino": [
       {
         "step": 1,
         "line": "void setup() {",
         "explanation": "Setup viene eseguito UNA volta all'avvio"
       },
       {
         "step": 2,
         "line": "  pinMode(13, OUTPUT);",
         "explanation": "Configura il pin 13 come uscita (per pilotare il LED)"
       }
     ]
   }
   ```

4. **`BlocklyArduinoStepGuide.jsx`** (nuovo componente, S4 P2):
   - Panel laterale che mostra step current.
   - Highlight visivo del blocco/riga current (outline lime pulsante).
   - "Avanti" disabilitato finché user non completa step (validazione: blocco presente,
     codice contiene riga).
   - Sync Blockly ↔ Arduino: selezione blocco N → highlight righe codice generate.

5. **Validazione blocco/codice** (S4 P2):
   - Per Blockly: check `workspace.getAllBlocks()` contiene blocco target.
   - Per Arduino: regex match su righe `editor.getValue()`.

**MVP scope demo:**

- Restyle visibile a colpo d'occhio (palette + font + spacing).
- Passo-passo code per UN esperimento (v3-cap6-esp4 Due LED alternano) sia Blockly che
  Arduino.

**Owner:** Parallel agent o Andrea 25/05 mattina.

**Fallback:** Se restyle non finisce → skip CSS overhaul, mostrare solo passo-passo
code feature (utente dichiara "estetica polish prossima release").

---

### 4.5 S5 — UNLIM Full Awareness (Morfismo Sense 1 runtime + 5-role pipeline)

**Goal**: UNLIM è consapevole di tutto lo stato sessione + risponde coerente con stato
reale, NON generico.

**ChatGPT Pro report finding (v1.2)**: UNLIM **NON deve essere un singolo prompt
gigante**. Pipeline stateful 5-ruoli (pattern ReAct + Chain-of-Verification):

```
1. Planner      → decide quali fonti interrogare basandosi su domanda + stato
2. Retriever    → estrae lesson state, volume snippet, history sessione, errori
3. Generator    → produce bozza didattica tono adatto docente plurale
4. Verifier     → genera controlli su fatti + coerenza con volume + state diff
5. Formatter    → converte output in hint / quiz / diary / answer
```

Risponde **coerente con stato reale**, NON generico. Es. "Vedo che il LED non è
connesso al pin 13, prova a spostare il cavo rosso dalla riga 12 alla 13" (NON "il LED
non si accende perché manca corrente").

**Stato attuale:**

- `src/services/unlimContextCollector.js` (250 righe) raccoglie circuit, code,
  compilation, step, errors, pin states.
- `src/components/lavagna/useGalileoChat.js` (nome legacy) orchestra chat.
- Vision capability esistente (screenshot + Gemini Vision).
- RAG 549 chunks in `src/data/rag-chunks.json`.
- Routing Gemini 70/25/5 (Flash-Lite/Flash/Pro).

**Gap:**

- Context collector può non includere **history actions**, **mount/dismount events**,
  **wire change timeline**, **compile error history**.
- Prompt UNLIM può non essere ottimizzato per state-citation.

**Design:**

1. **Action history logger** (S5 P1 24/05):
   - Nuovo `src/services/sessionActionLog.js`:
     - In-memory queue + Supabase persistence (`session_actions` table).
     - Eventi tracked: `component:add`, `component:remove`, `wire:connect`,
       `wire:disconnect`, `code:edit`, `compile:start`, `compile:success`,
       `compile:error`, `upload:start`, `upload:success`, `upload:error`,
       `unlim:question`, `unlim:response`, `step:advance`, `step:retry`.
     - Each event: `{type, timestamp, payload, session_id}`.
   - Hook into existing event emitters in `__ELAB_API`:
     ```javascript
     window.__ELAB_API.on('circuitChange', (event) => sessionActionLog.record(event));
     window.__ELAB_API.on('serialOutput', (event) => sessionActionLog.record(event));
     window.__ELAB_API.on('componentInteract', (event) => sessionActionLog.record(event));
     window.__ELAB_API.on('experimentChange', (event) => sessionActionLog.record(event));
     ```

2. **UNLIM Pipeline 5-ruoli implementation** (S5 P1+P2):
   - `src/services/unlimPipeline.js` (NEW) orchestratore:
     ```js
     export async function unlimRespond({ question, sessionId }) {
       // 1. Planner — quali fonti?
       const plan = await callLLM('planner', { question, summary: getSessionSummary() });
       // 2. Retriever — fetch parallelo
       const retrieval = await Promise.all(plan.sources.map(fetchSource));
       // 3. Generator — bozza
       const draft = await callLLM('generator', { question, context: retrieval });
       // 4. Verifier — domande controllo
       const checks = await callLLM('verifier', { draft, context: retrieval });
       const verifiedAnswers = await Promise.all(checks.questions.map(verifyOne));
       // 5. Formatter — output finale
       return await callLLM('formatter', { draft, verifiedAnswers, format: plan.format });
     }
     ```
   - Routing modelli (Gemini 70/25/5 esistente):
     - Planner+Retriever: Gemini Flash-Lite (cheap).
     - Generator+Verifier: Gemini Flash (balanced).
     - Formatter: Gemini Flash-Lite.
     - Solo casi complessi → Gemini Pro.
   - Latency budget: 5-8s totale (parallelizzato).

3. **Enhanced `unlimContextCollector.collectFullContext()`** (S5 P1 24/05):
   - Append `action_history`: last 50 events from sessionActionLog.
   - Append `error_summary`: aggregated count + last 5 errors with messages.
   - Append `state_diff`: delta from expected state (per current step in lesson-path).
   - Append `wire_topology`: snapshot wires + nodes per CircuitSolver.
   - Append `attention_hints`: array of "things UNLIM should notice"
     (es. `["led1.cathode disconnected", "code uses pin 12, circuit uses pin 13"]`).

3. **Prompt engineering** (S5 P1+P2):
   - System prompt addition (Italian, plurale "Ragazzi"):
     ```
     Hai accesso allo stato REALE del circuito. Cita SEMPRE:
     - Componenti presenti per nome (es. "il LED su d23-d24")
     - Pin Arduino coinvolti (es. "il pin 13")
     - Errori specifici se presenti
     - Discrepanze codice↔circuito
     Riferisci SEMPRE alla pagina del Volume (Vol.X pag.Y).
     MAI dare risposte generiche tipo "controlla i collegamenti".
     ```
   - 60 parole max (regola UNLIM CLAUDE.md), MA può estendersi a 120 se ben formattato
     (feedback_unlim_language_rules_10may2026.md).

4. **Pre-rehearsed scenarios** (S5 P2 25/05 PM):
   - **Scenario 1**: User connette LED rovescio (anodo a GND invece di VCC). UNLIM detect
     via wire topology → suggerisce inversione.
   - **Scenario 2**: User codice usa pin 12, circuito su pin 13. UNLIM detect via
     state_diff → suggerisce match.
   - **Scenario 3**: User domanda "perché non funziona?" durante condensatore esp2 con
     pulsante non premuto → UNLIM spiega "premere pulsante per caricare condensatore,
     poi rilasciare per vedere scarica + LED fade".

5. **Demo moment scripted** (S5 P2 25/05 PM):
   - Andrea durante demo connette LED rovescio (deliberato).
   - Domanda UNLIM "perché non si accende?".
   - UNLIM risponde con state-citation diagnosis.
   - Audience vede AI che VEDE il circuito reale, non guess.

**MVP scope demo:** 3 scenari rehearsed work flawlessly. Random new scenarios may be
hit-or-miss (acceptable for demo, post-demo iteration).

**Owner:** Andrea main thread P1 24/05 + P2 25/05.

**Fallback:** Se enhanced collector non finisce → mostra UNLIM con behavior attuale + 1
scenario funzionante.

---

### 4.6 S6 — Fumetto AI Gemini + Image Gen

**Goal**: Al termine della sessione, generare fumetto con vignette + diario narrativo
basato su cosa è REALMENTE accaduto durante la sessione (cosa scritto, montato,
smontato, sbagliato, corretto, interazioni UNLIM).

**Stato attuale:**

- `supabase/functions/unlim-fumetto/index.ts` esiste già.
- Recent commits #151, #152, #153 fix Gemini retry + ground in live context + lean
  evidence pack.
- Worktree `elab-builder-iter83-fumetto/` per dev iterativo.
- Prompt + parser: `supabase/functions/_shared/fumetto-prompt.ts`.
- LLM client wrapper: `supabase/functions/_shared/llm-client.ts`.
- Function genera già panels + quiz + diary + image prompts (verified da head index.ts
  S6 base existing).

**Gap:**

- Image gen wiring: prompts generated MA images may not be actually called/rendered.
- UI comic layout: rendering 4-6 panels grid TBD.
- Latency masking: 5-15s per image × 4-6 panels = 20-90s totali = troppo lungo per demo
  live.

**Design:**

1. **Verifica funzione esistente** (S6 P0 23/05 sera):
   - Test deploy locale: `npx supabase functions serve unlim-fumetto`.
   - Test call con sessionEvidence mock → response panels + quiz + diary + image_prompts.

2. **3-phase fumetto pipeline** (S6 P1 24/05, da ChatGPT Pro report):

   Pipeline NON one-shot "genera fumetto". Tre fasi:

   - **Phase 1 — Panel script JSON** (Gemini Flash):
     ```json
     {
       "title": "Lezione 23 maggio — LED",
       "cast": ["UNLIM mascot", "studente 1", "docente"],
       "panels": [
         {
           "index": 1,
           "scene": "Studente collega LED a breadboard",
           "characters": ["studente 1"],
           "speech_bubble": "Ho collegato il LED!",
           "caption": "Inizio dell'esperimento",
           "intent": "introduce_assembly"
         }
       ]
     }
     ```

   - **Phase 2 — Style bible + per-panel prompts** (Gemini Flash):
     - Style bible: "fumetto educativo pulito, colori ELAB (Navy/Lime/Orange/Red),
       laboratorio scolastico, mascot UNLIM robot blu-verde rotondo, no testo fuori
       balloon".
     - Per ogni panel → prompt strutturato (cast + scene + style + composition).

   - **Phase 3 — Image generation** (Gemini Imagen 3 o Together AI Flux):
     - Call API per ogni panel prompt.
     - Cache result in Supabase `fumetto_images` table per `(session_id, panel_index)`.
     - SynthID watermark conservato (Gemini compliance).

3. **Image generation pipeline implementation** (S6 P1 24/05 sera, background agent):
   - Per ogni image_prompt da response:
     - Call Gemini image gen (Imagen 3 via Vertex AI / Gemini API) OR DALL-E OR
       Stable Diffusion via Together AI (CLAUDE.md menziona Together AI per teacher
       mode).
     - Style consistency: prompt include "AI-generated comic style, mascot UNLIM (round
       blue/green robot with friendly face), elementary school setting, vibrant colors,
       similar to Pixar concept art".
     - Cache result in Supabase `fumetto_images` table per `(session_id, panel_index)`.
   - Edge function `unlim-fumetto-images` (nuovo) orchestra image gen async.

3. **Comic UI component** (S6 P2 25/05 AM):
   - `src/components/report/FumettoReport.jsx` (refactor se esistente).
   - Layout 2x2 o 2x3 grid responsive.
   - Per panel: image + speech bubble + caption.
   - "Pagina diario" finale come bonus panel.
   - Loading animation: "UNLIM sta disegnando il vostro fumetto..." (10-60s).

4. **Latency masking** (S6 P2 25/05 PM, demo prep):
   - **Pre-generate** fumetto per sessione rehearsed durante dry-run.
   - Salvare in `public/demo-assets/fumetto-rehearsed-<scenario>.json` + immagini.
   - Demo: trigger fumetto → mostra animation 5s → reveal pre-generated (sembrerà live
     ma è cached).

5. **Live fallback** (S6 P2 25/05):
   - Se Gemini API fail durante demo → mostra pre-generated fallback senza panico.

**MVP scope demo:** Sessione rehearsed con scenario noto → fumetto 4-6 vignette + diario
shown live (con cache invisibile a audience). Quiz integrato nel report (vedi S7).

**Owner:** Background agent dispatched P1 24/05 sera. Supabase function già base.

**Fallback:** Fumetto pre-generato salvato come asset statico, mostrato senza claim "live
generated".

---

### 4.7 S7 — Quiz + Diario

**Goal**: Al termine della sessione, 3-5 quiz adatti a 12enni (NON banali) + pagina
diario riassuntiva.

**Stato attuale:**

- `unlim-fumetto` function GIÀ genera quiz + diary nello stesso response (vedi base
  function struct).

**Design:**

1. **Schema quiz** (già parte di fumetto-prompt.ts output):
   ```json
   "quiz": [
     {
       "question": "Cosa succede al LED se tolgo il resistore?",
       "options": [
         "Si accende più forte",
         "Si brucia perché passa troppa corrente",
         "Non cambia nulla",
         "Si spegne"
       ],
       "correct_index": 1,
       "explanation": "Il resistore limita la corrente. Senza, il LED riceve troppa corrente e si brucia (l'avete visto nell'esperimento 2!)."
     }
   ]
   ```

2. **Schema diario** (già parte di fumetto-prompt.ts output):
   ```json
   "diary": {
     "title": "Diario della lezione 23 maggio",
     "summary": "Oggi i ragazzi della 1A hanno scoperto come accendere un LED...",
     "key_concepts": ["LED ha polarità", "Resistore limita corrente", "Circuito chiuso"],
     "tomorrow_preview": "Domani vedremo come cambiare la luminosità con un potenziometro!"
   }
   ```

3. **Quiz UI component** (S7 P2 25/05 AM):
   - `src/components/report/QuizPanel.jsx`.
   - Renderizza 3-5 multiple choice.
   - Su click answer: feedback immediato (corretta / sbagliata + explanation).
   - Score finale + share.

4. **Diary UI component** (S7 P2 25/05 AM):
   - `src/components/report/DiaryPage.jsx`.
   - Style "handwritten note" con font script-like (es. Caveat o simile, già in repo? if
     not, fallback to Open Sans italic).
   - Allow docente to edit/customize before save.

5. **Integration con FumettoReport** (S7 P2):
   - Layout finale report:
     - Pages 1-N: comic vignettes (S6).
     - Page N+1: quiz (S7).
     - Page N+2: diary (S7).
   - Single "Save Report" → PDF export (existing `SessionReportPDF.jsx` extend).

**MVP scope demo:** Quiz + diary appear after fumetto. Docente demos answering 1 quiz
con audience.

**Owner:** Background agent dispatched P2 25/05 AM (parallelo a S6 UI).

**Fallback:** Quiz pre-scritti hardcoded (3 per esperimento demo). Diary statico per
sessione rehearsed.

---

### 4.8 S8 — Plugin/Skill Infrastructure (guardrails)

**Goal**: Plugin Claude Code custom + skill che enforce demo-day workflow. Prevent going
off rails. Andrea esplicita: "IMPEDISCIMI DI USCIRE DAI BINARI".

**Design:**

1. **Plugin `elab-demo-guardrails`** (S8 P0 23/05 sera):
   - Location: `.claude/plugins/elab-demo-guardrails/` (project-level).
   - File `plugin.json`:
     ```json
     {
       "name": "elab-demo-guardrails",
       "version": "1.0.0",
       "description": "Guardrails per demo 25/05 — anti-regressione, build gate, demo countdown"
     }
     ```
   - Hook PreToolUse Bash (`hooks/pre-bash-demo-branch.sh`):
     - Block `git reset --hard`, `git clean -fd`, `git push --force` quando branch =
       `feat/demo-25may` o ancestor.
     - Block `rm -rf src/`, `rm -rf node_modules` senza confirm.
   - Hook PreToolUse Edit/Write (`hooks/pre-edit-critical.sh`):
     - Warn (NON block) se editing critical files: `CircuitSolver.js`, `AVRBridge.js`,
       `NewElabSimulator.jsx`, `package.json`, `vite.config.js`.
   - Hook Stop (`hooks/stop-build-gate.sh`):
     - Run `npm run build` smoke (parziale, target solo deps changed).
     - Run `npx vitest run tests/unit/services/` (subset fast).
     - Block stop se fail.
   - Hook UserPromptSubmit (`hooks/demo-countdown.sh`):
     - Inject countdown: "DEMO IN X ORE (T-... ). Focus: <current phase>."

**1b. Subagent `book-parity-auditor`** (S8 P0 23/05 sera, ChatGPT Pro adopt):
   - Location: `.claude/agents/book-parity-auditor.md`.
   - Read-only (no edit tools). Verifica esperimento vs reference image libro.
   - Output strutturato:
     ```
     PASS/FAIL
     Componenti mancanti: [...]
     Componenti extra: [...]
     Cavi colore errato: [...]
     Geometria non fedele: [...]
     Pin mismatch: [...]
     BookRef mancante: [...]
     Screenshot richiesti: [...]
     ```
   - Usato da Andrea post-Codex S1 overnight output per verify 7 esp.

2. **Skill `elab-demo-check`** (S8 P0 23/05 sera):
   - Location: `.claude/skills/elab-demo-check/SKILL.md`.
   - Frontmatter:
     ```yaml
     ---
     name: elab-demo-check
     description: Run pre-demo readiness check. Use before claiming demo is ready. Trigger keywords - demo check, pre-demo, readiness, demo ready, skill ELAB demo.
     ---
     ```
   - Checklist:
     1. `npm run build` exits 0
     2. `npx vitest run` >= baseline `automa/baseline-tests.txt`
     3. 7 esp render: Playwright `tests/e2e/demo-geometric-fidelity.spec.js` pass
     4. Compile endpoint healthy: `curl POST n8n compile` returns HEX
     5. Gemini API key valid: test call
     6. Supabase healthy: query `session_actions` table
     7. Pre-rehearsed UNLIM scenarios: 3/3 pass
     8. Fallback assets present: HEX pre-compilato, fumetto rehearsed, screenshots
     9. Browser console: 0 errors full walkthrough
     10. Hardware Nano R4 detected: WebUSB requestDevice success
   - Output: PASS / WARN / FAIL with itemized.

**2b. Skill `elab-book-parity`** (S8 P0 23/05 sera, ChatGPT Pro adopt):
   - Location: `.claude/skills/elab-book-parity/SKILL.md`.
   - Companion al subagent: Andrea invoca skill per quick verify singolo esp.
   - Skill carica `git diff HEAD` + reference image path + lesson-path JSON,
     produce checklist parity (componenti/cavi/geometria/pin/bookRef).

**2c. UNLIM eval harness** (S5 rinforzo, ChatGPT Pro adopt):
   - File: `tests/fixtures/unlim-demo-evals.json` (~20 eval items).
   - Schema:
     ```json
     {
       "id": "led-no-resistor-warning",
       "experimentId": "v1-cap6-esp2",
       "mode": "guided",
       "userMessage": "perché non si accende?",
       "circuitState": { "components": [...], "connections": [...], "errors": [...] },
       "expected": {
         "mustMention": ["resistore", "troppa corrente", "LED"],
         "mustNotMention": ["220V", "semiconduttore passivo"],
         "actionTags": ["highlight:led1"]
       }
     }
     ```
   - Script: `npm run eval:unlim:demo` runs eval, classifies risposte (contestuale/
     generica/azione corretta/lessico tecnico/hallucination).

3. **Plugin creator + skill creator** (S8 P0 23/05 sera):
   - Use `plugin-dev:create-plugin` skill to scaffold `elab-demo-guardrails`.
   - Use `anthropic-skills:skill-creator` to scaffold `elab-demo-check`.

**MVP scope demo:** Both functional. Plugin = 4 hooks active. Skill = 10-item checklist
runnable. Used during P1+P2 to keep me on rails.

**Owner:** Andrea + Claude P0 23/05 sera (~1h).

**Fallback:** Se non finisce in P0, plugin/skill MVP = 1 hook anti-regressione + skill
manual checklist.

---

### 4.9 S9 — Demo Orchestration

**Goal**: Demo flow documented, rehearsed, contingencies prepared. Stopwatch dry-run 2x
prima della demo.

**Design:**

1. **Demo script** (S9 P2 25/05 AM):
   - `docs/demo-25may/demo-script.md`.
   - Step-by-step (target ~30 min):
     - 00:00 — Intro Andrea, contesto ELAB, problema (3 min).
     - 03:00 — Mostra Vol1 cap6-esp1 LED, modalità passo-passo dentro volume (5 min).
     - 08:00 — Errore voluto: LED senza R (esp2), UNLIM diagnostica (3 min).
     - 11:00 — Vol2 cap7-esp2 condensatore, fade magic moment (4 min).
     - 15:00 — Vol3 cap6-esp4 "Due LED alternano", Blockly → Arduino → compile → upload
       Nano R4 fisico (8 min).
     - 23:00 — Semaforo (3 LED orchestrati) (3 min).
     - 26:00 — Fumetto + quiz + diario generation (4 min).
     - 30:00 — Q&A.

2. **Asset checklist** (S9 P2 25/05 AM):
   - `docs/demo-25may/asset-checklist.md`.
   - Files:
     - `public/demo-assets/hex-blink-rehearsed.hex` (pre-compiled fallback).
     - `public/demo-assets/fumetto-rehearsed-led-session.json` + images.
     - `public/demo-assets/screenshots/` per ogni 7 esp.
   - Hardware:
     - Nano R4 fisico (Andrea checks possesso).
     - USB cable testato.
     - LIM/proiettore funzionante.
     - Backup laptop in caso primario fail.
   - Network:
     - Hotspot mobile backup.
     - Supabase reachable test.
     - n8n compile reachable test.

3. **Fallback decision tree** (S9 P2 25/05 PM):
   - `docs/demo-25may/fallback-tree.md`.
   - Per ogni 7 esp + cross-cutting:
     - "Se X fail → mostra Y instead".
     - "Se Y fail → narrate Z verbally".

4. **Dry-run 1** (S9 P2 25/05 16:00-17:00):
   - Andrea presenta intera demo a se stesso con stopwatch.
   - Note tempo per step + glitch + cose da migliorare.

5. **Dry-run 2** (S9 P2 25/05 18:00-19:00):
   - Andrea presenta a Tea o famiglia (audience test).
   - Note feedback comprehensibility + wow factor.

**MVP scope demo:** Documento + 2 dry-run minimum.

**Owner:** Andrea P2 25/05 PM.

**Fallback:** Skip dry-run 2 se tempo critico. Solo 1 dry-run.

---

## 5. Timeline Master

```
P0 — 23/05 sera (T-48h, ~4h reali)
├── 19:00 — User sposta deep-research-report.md in progetto (manuale, drag&drop Finder)
├── 19:00-21:00 — Spec write (questo doc, completion)
├── 21:00-21:30 — Codex review + adversarial review spec
├── 21:30-22:30 — Plugin elab-demo-guardrails + skill elab-demo-check creation
├── 22:30-23:00 — Branch feat/demo-25may + scaffold + Tests baseline snapshot
├── 23:00-23:30 — Brief Codex Desktop (overnight task S1 7 esp geometry refactor)

P1 — 24/05 (T-24h, 12-14h working)
├── 08:00-09:00 — Review Codex S1 output, run baseline tests, snapshot
├── 09:00-13:00 — S2 Volume Reader + PassoPassoBridge (Andrea main thread)
├── 13:00-13:30 — Lunch + kickoff background S6 fumetto agent
├── 14:00-18:00 — S5 UNLIM action history + context enrich (Andrea)
├── 18:00-18:30 — Kickoff background S7 quiz/diario agent
├── 19:00-22:00 — Integration test S1+S2+S5, manual smoke (Andrea)
├── 22:00-23:00 — Brief Codex Desktop overnight S6+S7 polish + S4 restyling
└── Mac Mini continuous: baseline tests every 30 min, Playwright visual diff snapshot

P2 — 25/05 (T-0, 10-12h working)
├── 08:00-09:00 — Review overnight Codex output, baseline check
├── 09:00-12:00 — S3 compile/upload Nano R4 (Andrea or parallel agent)
├── 09:00-12:00 — S4 EduKit Blockly + code passo-passo (parallel agent)
├── 12:00-13:00 — Lunch
├── 13:00-14:00 — S5 UNLIM final polish + 3 scenari rehearsed
├── 14:00-16:00 — Integration test FULL suite + skill elab-demo-check run
├── 16:00-17:00 — Dry-run 1 stopwatch (Andrea solo)
├── 17:00-18:00 — Adjust + fallback asset prep + bug fix urgenti
├── 18:00-19:00 — Dry-run 2 audience test (Tea/famiglia)
├── 19:00-19:30 — Pre-demo checklist FINAL (skill elab-demo-check)
├── 19:30-20:00 — Travel/setup at demo venue (if applicable)
└── 20:00 — DEMO LIVE
```

---

## 6. Workstream Allocation

| Workstream | Owner | Subsystem | Window | Output |
|---|---|---|---|---|
| WA1 | Codex Desktop | S1 7 esp geometry refactor | 23/05 sera → 24/05 mattina | Branch sub merged into demo |
| WA2 | Mac Mini bg | Baseline tests continuous + Playwright visual diff | P0 → P2 fine | Sentinella regression, alert su fail |
| WA3 | Andrea main thread | S2 + S5 (passo-passo + UNLIM) | P1 24/05 | Components shipped |
| WA4 | Andrea / parallel agent | S3 + S4 (compile/upload + EduKit) | P2 25/05 AM | Functional demo features |
| WA5 | Background agent | S6 fumetto image gen wiring | P1 sera → P2 AM | Comic UI + image cache |
| WA6 | Background agent | S7 quiz + diario UI | P2 AM | QuizPanel + DiaryPage |
| WA7 | Andrea + Tea | S9 dry-run + fallback prep | P2 PM | Demo ready package |
| WA8 | Andrea | S8 plugin + skill | P0 sera | Guardrails active |

**Codex Desktop** ricevera prompt strutturato in `docs/demo-25may/codex-brief-s1.md`
con:

- 7 esperimenti detail (lesson-path JSON references).
- Reference image expected (estratte da PDF).
- Schema target `build_circuit` esteso.
- Constraints: NON toccare `CircuitSolver.js`, `AVRBridge.js`, `PlacementEngine.js`
  core (solo aggiunte non-breaking). PR + branch per merge review.

**Mac Mini** riceve `docs/demo-25may/macmini-sentinella.md` con:

- Watch loop: `npx vitest run` ogni 30 min, alert se delta negativo vs baseline.
- Playwright `tests/e2e/demo-*.spec.js` run ogni hour.
- Telegram notify on fail (already configured per OpenClaw infra).

---

## 7. Risk Matrix

| ID | Rischio | Subsystem | Impact | Probability | Mitigation |
|---|---|---|---|---|---|
| R1 | Codex non finisce 7 esp geometry overnight | S1 | ALTO | MED | 3 hero esp Andrea a mano P1 AM |
| R2 | PDF render fail in browser | S2 | MED | LOW | PNG pre-rendered fallback |
| R3 | Nano R4 compile endpoint non supporta RA4M1 | S3 | ALTO | MED | Use Nano AVR + emulation, OR pre-compiled HEX |
| R4 | WebUSB DFU fail su Mac (driver issue) | S3 | ALTO | MED | Test on Chrome stable, fallback emulation |
| R5 | EduKit restyle scope creep | S4 | BASSO | MED | Skip CSS, focus passo-passo code only |
| R6 | UNLIM responses random (no state-awareness) | S5 | MED | LOW | 3 rehearsed scenarios + system prompt strict |
| R7 | Gemini image gen latency >60s | S6 | MED | HIGH | Pre-generated fumetto fallback |
| R8 | Gemini API quota exhausted | S6+S7 | ALTO | LOW | Together AI backup (teacher mode), Mistral EU backup |
| R9 | Quiz quality poor (banali) | S7 | BASSO | MED | Hardcoded backup quiz per esp |
| R10 | Build/tests regression | All | ALTO | MED | Mac Mini sentinella + plugin Stop hook + pre-commit hook |
| R11 | Demo venue network down | S9 | ALTO | LOW | Hotspot mobile backup + offline mode (PWA service worker) |
| R12 | Nano R4 hardware non disponibile | S3 | ALTO | MED | **VERIFICARE possesso Andrea ASAP** |
| R13 | Andrea exhaustion (2 giorni intensi) | All | MED | HIGH | Mac Mini + Codex automation + sleep 6h+ per notte |
| R14 | Spec drift mid-implementation | All | MED | HIGH | Plugin elab-demo-guardrails + skill check enforce |

**Top 3 risks da mitigare in P0:**

- R3 (Nano R4 compile): TESTARE endpoint stasera.
- R12 (Nano R4 hardware): VERIFICARE possesso Andrea stasera.
- R7+R8 (Gemini): Pre-generated fumetto ready in P1 sera.

---

## 8. Cross-Cutting Concerns

### 8.1 Branch Strategy

- `feat/demo-25may` branched da `main` in P0.
- All work goes here via atomic commits.
- Codex Desktop crea sub-branch `feat/demo-25may-s1-codex` → PR review prima del merge.
- Mai push diretto su `main`.
- Mai `--no-verify`.
- Merge to `main` solo POST demo (cleanup + production deploy).

### 8.2 Tests + Baseline

- Pre-P0 snapshot: `git tag baseline-demo-pre-23may`.
- Baseline file `automa/baseline-tests.txt` aggiornato dopo ogni atomic commit.
- Mac Mini sentinella: alert su Telegram se vitest delta negativo.
- Pre-commit hook (esistente) blocca commit se test count scende.

### 8.3 Commit Hygiene

- Format: `feat(demo): ...`, `fix(demo): ...`, `style(demo): ...`, `docs(demo): ...`,
  `chore(demo): ...`.
- Body include test count delta + build status.
- Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>.

### 8.4 Anti-Regression

- Pre-commit hook (esistente).
- Plugin Stop hook (S8): `npm run build` + `npx vitest run` smoke.
- Mac Mini sentinella continua (S8 WA2).
- Manual review prima di merge a main (POST demo).

### 8.5 Telemetria + Monitoring

- Supabase `session_actions` table popolata da S5 action logger.
- PostHog (se attivo) tracking demo events.
- Sentry per error catching durante demo.

---

## 9. Pre-Demo Readiness Checklist (T-2h)

Run skill `elab-demo-check`. All must be PASS:

- [ ] **B1** `npm run build` exits 0
- [ ] **B2** `npx vitest run` >= baseline (no regression)
- [ ] **B3** Playwright `tests/e2e/demo-*.spec.js` all pass
- [ ] **B4** 7 esp render correctly (visual diff SSIM > 0.85 vs reference)
- [ ] **B5** Compile endpoint n8n healthy (curl test return HEX)
- [ ] **B6** Gemini API key valid (test call succeed)
- [ ] **B7** Supabase healthy (query session_actions table)
- [ ] **B8** UNLIM scenario 1 (LED reverse) pass manual
- [ ] **B9** UNLIM scenario 2 (code/circuit mismatch) pass manual
- [ ] **B10** UNLIM scenario 3 (condensatore button) pass manual
- [ ] **B11** Fumetto rehearsed asset present + loadable
- [ ] **B12** Quiz hardcoded backup present
- [ ] **B13** HEX pre-compiled present per Due LED alternano fallback
- [ ] **B14** Hardware Nano R4 detected via Chrome WebUSB requestDevice
- [ ] **B15** Browser console 0 errors after 30-min smoke walkthrough
- [ ] **B16** Network: Supabase reachable, Gemini reachable, n8n reachable
- [ ] **B17** Hotspot mobile attivo + tested
- [ ] **B18** LIM/projector tested
- [ ] **B19** Demo script printed + reviewed
- [ ] **B20** Fallback decision tree printed + reviewed

If FAIL >2 items → demo POSTPONE o riduzione scope live.

---

## 10. Fallback Decision Tree

Per ogni step demo, alternative pronte:

| Step | Primary | Fallback L1 | Fallback L2 |
|---|---|---|---|
| Vol1 LED mount | Live drag componenti | Pre-mounted experiment | Screenshot statico |
| Vol2 Condensatore fade | Live press button | Pre-rehearsed video clip | Narrazione + screenshot |
| Vol3 Due LED compile | Live compile + WebUSB upload | Pre-compiled HEX + WebUSB upload | Simulator emulation (avr8js) |
| Vol3 Due LED upload | WebUSB DFU live | DFU dialog skipped, mostra come avverrebbe | Skip upload, narrate |
| Vol3 Semaforo | Live tutto | Pre-rehearsed video | Narrazione |
| UNLIM diagnose error | Live state-citation | Pre-rehearsed scripted response | Behavior attuale generic |
| Fumetto gen | Live trigger + cache reveal | Pre-generated asset display | Screenshot mockup |
| Quiz interaction | Live answer | Pre-scripted demo | Solo show, no interact |

---

## 11. Out of Scope DEMO (Andrea ratify 24/05 01:20 "no post demo")

**Nessun feature work deferred post-demo.** Andrea direttiva: tutto deve funzionare
per demo 25/05 sera.

Genuinamente fuori controllo Andrea entro 36h (NON feature work):

- **Privacy GDPR minorenni policy formalizzata** (Q13) — richiede consulenza legale.
  Mitigazione demo: disclaimer + opt-in temporaneo + data retention manual.
- **SBOM/OSS licenze inventory** (Q14) — compliance audit. Non blocca demo content.
- **72 esp geometry full polish** — per design demo ridotta a 7 esp.

Tutto il resto (Blockly EduKit completo, UNLIM scenari generalizzati, fumetto polish,
quiz adaptive, dashboard docente, Playwright E2E coverage, Promptfoo+BackstopJS install)
= **IN SCOPE** con MVP scope per stare nelle 36h. Vedi singoli S1-S9 §4 per scope MVP.

---

## 12. References

- `CLAUDE.md` — Morfismo Triplet, Principio Zero, Narrative Arc, file critici.
- `.impeccable.md` — Design context, 5 design principles, anti-pattern checklist.
- `src/data/volume-references.js` — 94/94 enriched, bookText per esperimento.
- `src/data/lesson-paths/v*.json` — 79 lesson-paths (38 Vol1 + 27 Vol2 + 14 Vol3).
- `src/components/simulator/components/` — 21 component SVG.
- `supabase/functions/unlim-fumetto/index.ts` — fumetto base function.
- `docs/superpowers/specs/2026-05-22-lavagna-layout-overhaul-design.md` — spec format
  reference.
- `feedback_passo_passo_regression_06may2026.md` — iter 36 PM regression note.
- `feedback_unlim_language_rules_10may2026.md` — UNLIM 120 parole + analogia opzionale.
- `feedback_iter21_mandate_critical.md` — esperimenti broken UNO PER UNO Playwright + NO
  compiacenza.
- `feedback_no_demo.md` — NO mock, NO dati finti, tutto live.
- `feedback_repo_audits_before_websearch.md` — grep audits + research PRIMA di
  WebSearch.
- `automa/baseline-tests.txt` — test count baseline.
- `automa/team-charter.md` (TBD) — team coordination protocol.

---

## 13. Open Questions / TBD

- [ ] **Q1** Nano R4 compile endpoint supports RA4M1? → TEST P0 23/05 sera.
- [ ] **Q2** Andrea ha Nano R4 fisico disponibile per demo? → VERIFICARE P0.
- [ ] **Q3** Gemini image gen API key + quota disponibile? → VERIFICARE P0.
- [ ] **Q4** Demo venue confermato? Internet reliable? LIM/proiettore disponibile? →
  VERIFICARE P0.
- [ ] **Q5** Tea disponibile per dry-run 2 25/05 18:00? → COORDINARE P1.
- [ ] **Q6** Page numbers esatti per ogni 7 esp da volumi cartacei (`(TBD)` in §3) →
  POPULATE durante S2 work P1.
- [x] **Q7** ~~"SOS" interpretation~~: **RESOLVED 2026-05-23 23:35** — Andrea ratify "2
  consecutivi per volume tranne Vol1". Vol3 = cap6-esp4 (Due LED alternano) + cap6-esp5
  (Semaforo). SOS variant scrapped.
- [x] **Q8** ~~Deep research report ChatGPT Pro~~: **RESOLVED 2026-05-23 23:55** —
  User incollato contenuto in chat. Integrato in spec v1.2: §1.5 Principi Guida + §4.3
  S3 leverage scaffold + §4.4 S4 toolbox audit first + §4.5 S5 pipeline 5-ruoli + §4.6
  S6 3-phase fumetto.
- [ ] **Q11** Browser matrix demo: Chrome stable primary, Edge backup. Safari NO
  WebUSB/Web Serial → `compile_only_no_board` state. Cosa testiamo prima demo?
  → DECIDE P0/P1.
- [ ] **Q12** Hardware access method demo: browser utente Andrea Mac, macchina docente
  altro, helper locale? → DECIDE P0.
- [ ] **Q13** Privacy minorenni: quiz + diary + UNLIM memorie + comic images = policy
  conservazione + revisione docente + cancellazione. → **DEMO mitigation**: disclaimer
  + opt-in temporaneo + data retention manual. GDPR formalizzato = legal advisor
  (fuori scope tecnico).
- [ ] **Q14** SBOM/OSS inventory: licenze `dfu`, `@axe-core/playwright`, `blockly`,
  altri. → **DEMO mitigation**: quick `npm ls --depth=0 | wc -l` snapshot. Audit
  formale compliance fuori scope tecnico (non blocca demo content).
- [ ] **Q15** Promptfoo + BackstopJS install: → **IN SCOPE P0**. Quick `npm i -D
  promptfoo backstopjs` + minimal config. Permette eval UNLIM scenari + visual diff
  harness Mac Mini.
- [ ] **Q9** Mac Mini autonomous control infrastructure attivo? Telegram notify
  configurato? → VERIFICARE P0 (CLAUDE.md menziona mac-mini-autonomous-design.md).
- [ ] **Q10** Worktree strategia: lavoro su `elab-builder/` o nuovo
  `elab-builder-demo25/`? → DECIDE P0 (raccomando worktree dedicato per isolation).

---

## Changelog

- **v1 (2026-05-23 23:30)**: Initial draft post-brainstorming. 9 subsystem MVP scoped
  per demo 25/05 sera. Approvato high-level da Andrea. Spec written full P0.
- **v1.1 (2026-05-23 23:35)**: Andrea ratify Vol3 selection: cap6-esp4 (Due LED
  alternano) + cap6-esp5 (Semaforo) consecutivi cap6. SOS variant scrapped.
  Distribuzione finale 3+2+2 = 7 esp. Q7 RESOLVED. Spec ready per integration deep
  research report ChatGPT Pro (Q8 pending move).
- **v1.2 (2026-05-23 23:55)**: Deep research report ChatGPT Pro integrato (Q8 RESOLVED).
  Major updates:
  - NEW §1.5 Principi Guida ChatGPT Pro Integration (7 principi + architettura
    hub-and-spoke).
  - §4.3 S3 — refactor "LEVERAGE existing scaffold": infra/cloud-compile/server.js +
    CompileUploadButton.jsx + dfu package + Mock DFU GIÀ esistenti. NON rifare,
    CONVERGERE.
  - §4.4 S4 — MAJOR REWRITE: scratchToolboxProgressive.js block IDs FABBRICATI
    (warning esplicito "NOT FUNCTIONAL UNTIL iter 83+ AUDIT"). AUDIT priority 1
    (rename + integration test), restyle = priority 4 LAST.
  - §4.5 S5 — UNLIM pipeline 5-ruoli: Planner → Retriever → Generator → Verifier →
    Formatter (pattern ReAct + CoVe). NON singolo prompt gigante.
  - §4.6 S6 — Fumetto 3-phase pipeline: Panel script JSON → Style bible + per-panel
    prompts → Image generation. NON one-shot.
  - §13 Q11-Q15 nuove open questions: browser matrix, hardware access, privacy
    minorenni, SBOM OSS, Promptfoo+BackstopJS install.
  - Nano R4 confermato canonical (S4 typo da report).
- **v1.6 (2026-05-24 01:35)**: Andrea pasta secondo ChatGPT Pro suggestion (Mac mini
  worker farm + 6 subagent + 7 skill + custom MCP + Claude account 2). Reading
  CRITICO + lima senza complicare:
  - **ADOPT**: principio "1 task=1 branch=1 PR=1 artifact=1 review" rinforzato.
    1 subagent `book-parity-auditor` read-only per verify S1 esp. 1 skill
    `elab-book-parity` companion (totale 2 skill con elab-demo-check). Stop hook
    report template (cosa cambiato/file/test/screenshot/rischi/next). UNLIM eval
    harness `tests/fixtures/unlim-demo-evals.json` + script `npm run eval:unlim:demo`
    (rinforza S5). PR sections obbligatorie (Demo impact / Scope / Screenshots /
    Tests / Known unknowns / Rollback). Mac mini parallel test runner + nightly
    report + Playwright baseline.
  - **REJECT** (over-engineering 36h): custom MCP server ELAB tools (8-12h build
    impossible demo), 6 subagent (1 basta), 7 skill (2 bastano), Chromatic +
    Storybook (user "LATER"), multiple MCP server custom.
  - **UNCERTAIN**: secondo Claude account = legal question, verifica Andrea
    licenza. Mac mini = NON primary worker switch (mantieni Codex Desktop primary
    S1, Mac mini = parallel test runner). Decisione finale post P0 Task 5 (Q9
    Mac Mini SSH live).
  - **CRITIQUE**: report dice "26" ripetuto, demo 25 sera Andrea ratify (corretto
    nel mio plan).
- **v1.5 (2026-05-24 01:20)**: Andrea ratify "no post demo". NESSUN feature work
  deferred. §11 Out of Scope riformulata: solo GDPR legal + SBOM formale + 72 esp
  full restano fuori (NON feature). Q13/Q14 marked "demo mitigation" (disclaimer/
  opt-in + npm ls snapshot). Q15 Promptfoo+BackstopJS IN SCOPE P0 quick install.
  Spec line 88 S4 table row fix applicato (era ancora "DEFERRED post-demo" da v1.2).
- **v1.4 (2026-05-24 01:15)**: Andrea ratify "S4 Blockly DEFERRED post-demo dovrà
  funzionare" → S4 BACK IN SCOPE. MVP S4 = audit block IDs (1-2h) + Arduino code
  generator custom (2-3h) + passo-passo code 1 esp v3-cap6-esp4 (2-3h) + restyle EduKit
  minimo (1h if time). Total ~6-10h. Workstream: Codex Desktop overnight aggiunge S4
  audit + generator allo S1 brief. Andrea P2 AM wire passo-passo code panel + restyle.
  Effort distribution v1.4: 35% S1 + 35% S2 + 15% S4 + 10% UAT/polish + 5% plugin/orch.
- **v1.3 (2026-05-24 00:30)**: CRITICAL re-scope post mem-search + GitHub state audit.
  Andrea richiamato "non compiacenza". Scoperto S3/S4/S5/S6/S7 MOSTLY shipped in PR
  recenti (#135, #144, #145, #146, #148, #149, #151-153 MERGED 21-22/05). Spec v1.2
  over-scoped. NEW §1.7 Re-scope con effort distribution corretto: 80% S1+S2 (veri
  gap), 20% altri (UAT + polish). S4 Blockly audit DEFERRED post-demo (ScratchEditor
  usa TOOLBOX_XML legacy, non blocker). 5 PR aperti #154-158 = MERGE entro P0 sera.
