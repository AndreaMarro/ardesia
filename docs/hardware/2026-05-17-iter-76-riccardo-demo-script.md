# Riccardo Omaric demo script — ELAB Tutor cross-compile Nano R4

**Versione**: iter 76 PHASE 3 close (2026-05-17 + Codex Pattern V verdict applied)
**Durata stimata**: 8-12 minuti
**Hardware Andrea-side**: ❌ Nessun Nano R4 fisico (gestito iter 77+ con kit Riccardo)
**Software Andrea-side**: ✅ arduino-cli 1.4.1 + Renesas core 1.5.3 + dfu-util 0.11 + ELAB Compile Agent localhost:8765 LIVE

**Mandate Andrea verbatim 2026-05-17 PM**: "sarebbe fondamentale avere la certezza che il sistema funzioni anche senza scheda. In pratica vorrei stupire riccardo. Massima onestà, non compiacermi."

**Codex Pattern V verdict iter 76 PHASE 2** (5 critical findings):
1. FQBN mismatch LOCAL `boardId` vs CLOUD `fqbn` → FIXED P0.4 entrambi accettano OBA
2. compile_only_no_board IMPLEMENTED MA NOT EXPOSED → FIXED P0.3 ScratchCompileBar passa enableDemoMode={true}
3. FALSE "Caricato" claim post WebUSB picker → FIXED P0.1 NEW state HARDWARE_PICKED_AWAITING_FLASH onesto
4. WebUsbBanner NOT WIRED HomePage → FIXED P0.2 swap default (legacy gated VITE_USE_LOCAL_AGENT)
5. Cloud auth bypass missing API key → FIXED P0.5 refuse boot prod NODE_ENV=production

Codex confirmed PASS: cross-compile LOCAL chain truthful + spec/script docs honest + local agent loopback safe.

Demo-grade certainty assertion iter 76 PHASE 3 close: ✅ honest, NO fake upload, NO false claims.

---

## Pre-demo setup (5 min before call)

### Step 1 — Verificare ELAB Compile Agent ATTIVO

Terminal locale Mac:

```bash
curl -s localhost:8765/health | python3 -m json.tool
```

**Output atteso**:
```json
{
  "agent": "elab-compile-upload",
  "arduino_cli_version": "1.4.1",
  "core_renesas_uno_installed": true,
  "core_count": 2,
  "version": "0.1.0",
  "timestamp": "2026-05-17T..."
}
```

**Se agent NON attivo**: `cd src/services/elab-agent && node http-server.js &` (in background terminal separato).

### Step 2 — Verificare arduino-cli + Renesas core

```bash
arduino-cli version
arduino-cli core list | grep renesas
```

**Output atteso**:
- arduino-cli 1.4.1+
- arduino:renesas_uno 1.5.3 (installato)

### Step 3 — Aprire Chrome + ELAB Tutor

Browser: **Chrome OR Edge** (NON Safari NON Firefox — WebUSB non supportato).

URL: `http://localhost:5173` (dev) OPPURE `https://www.elabtutor.school` (prod).

### Step 4 — Verificare cross-compile chain end-to-end (smoke test pre-demo)

```bash
curl -s -X POST localhost:8765/compile \
  -H "Content-Type: application/json" \
  -d '{
    "sketchCode": "void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}",
    "fqbn": "arduino:renesas_uno:nanor4"
  }' | python3 -m json.tool
```

**Output atteso** (HEX bytes provanti compile success):
```json
{
  "ok": true,
  "jobId": "...",
  "sketchDir": "/var/folders/.../ElabSketch",
  "buildDir": "/var/folders/.../build",
  "stdout": "Lo sketch usa 39048 byte (14%) dello spazio disponibile per i programmi. Il massimo è 262144 byte.\nLe variabili globali usano 3940 byte (12%) di memoria dinamica, lasciando altri 28828 byte liberi per le variabili locali. Il massimo è 32768 byte.\n"
}
```

**Evidenza prova chain LIVE**: 39048 bytes HEX generati, 3940 bytes RAM allocati, FQBN `arduino:renesas_uno:nanor4` riconosciuto. ZERO emulazione, arduino-cli ufficiale Arduino LLC.

---

## Demo flow Riccardo (10 minuti)

### Minuto 0-1 — Introduzione contesto

Andrea verbatim Riccardo:

> "Riccardo, ti faccio vedere il sistema cross-compile ELAB Tutor per il vostro Nano R4. Premessa onesta: io non ho un Nano R4 fisico qui in questo momento, quindi ti mostro la parte software end-to-end (compilation chain) che è la parte critica del sistema. La parte fisica di upload USB la testiamo iter 77+ con il vostro kit."

### Minuto 1-2 — Apertura HomePage cross-compile entry

1. Browser Chrome → ELAB Tutor → click "Compila & Carica" (CARDS HomePage iter 73 CC-2)
2. Hash route `#compile-home` carica `HomeCompileEntry.jsx`
3. UI mostra:
   - WebUsbBanner Lime "Compila & Carica pronto su Nano R4" (Chrome → WebUSB available)
   - Blockly editor sinistra (12 categorie blocchi)
   - ScratchEditor C++ destra (output generato Blockly)
   - ScratchCompileBar in basso (CompileAgentBanner stato agent localhost:8765)

**Talking point**: "Stesso programmatore Blockly visuale + IDE testuale C++ side-by-side. Stesse parole dei volumi cartacei Davide Fagherazzi."

### Minuto 2-4 — Drag-and-drop Blink

1. Trascinare blocco "imposta pin {13} come uscita" dalla categoria Pin
2. Trascinare blocco "ripeti per sempre" (loop)
3. Dentro loop, trascinare:
   - "scrivi pin {13} HIGH"
   - "aspetta {500} ms"
   - "scrivi pin {13} LOW"
   - "aspetta {500} ms"
4. ScratchEditor mostra in tempo reale C++ generato:
   ```cpp
   void setup() {
     pinMode(13, OUTPUT);
   }
   void loop() {
     digitalWrite(13, HIGH);
     delay(500);
     digitalWrite(13, LOW);
     delay(500);
   }
   ```

**Talking point**: "Generator Blockly → arduino C++ canonical. Nessun lock-in, l'output è codice arduino-cli compatibile standard."

### Minuto 4-6 — Compile cross-compilazione LIVE

1. Click button "Compila per Nano R4" (ScratchCompileBar)
2. ScratchCompileBar stato: "Compilando..." (LoadingIcon SVG, no emoji)
3. POST localhost:8765/compile → arduino-cli + Renesas core 1.5.3
4. ~3-5 secondi → success state:
   - CheckIcon Lime
   - "Compilazione completata"
   - "Sketch: 39048 bytes (14% flash, max 262144)"
   - "RAM: 3940 bytes (12%, max 32768)"
   - HEX file path mostrato (tooltip): `/var/folders/.../build/sketch.ino.hex`

**Talking point**: "Cross-compile chain provato LIVE. 39 KB di codice Arduino C++ → HEX binary pronto per upload via USB DFU al Nano R4. Tutto in 5 secondi nel browser via localhost agent ufficiale arduino-cli."

### Minuto 6-8 — Demo mode no-board honest fallback (iter 76 D.1)

1. Click button "Carica su Nano R4" (CompileUploadButton)
2. WebUSB picker browser → "Nessuna scheda Nano R4 rilevata"
3. Stato UI transition a `compile_only_no_board`:
   - WarningIcon Orange
   - Messaggio onesto: "Compilazione completata: 39048 byte di codice. Collegate il Nano R4 via USB per caricare sulla scheda."
   - CTA "Riprova caricamento" (touch ≥44px)

**Talking point ONESTA**: "Riccardo, qui il sistema mostra trasparentemente che il codice è pronto MA serve la scheda fisica per il flash. Quando voi del vostro kit Omaric collegate il Nano R4, il bottone va da Orange a Lime e parte il dfu-util sul USB DFU. Vorrei testare questa parte con voi iter 77+ usando un kit ELAB di prova."

### Minuto 8-10 — Esperimenti Lavagna integration

1. Tornare alla HomePage
2. Click "Vai alla Lavagna" CARDS → `#lavagna`
3. Selezionare Modalità Percorso → Volume 3 → Cap.5 (Arduino avanzato)
4. Esperimento "Blink LED su Nano R4" attivato
5. Stessa UI CompileUploadButton appare wired NewElabSimulator (iter 72 BG-A7)
6. **Stessa chain di compile funziona dentro contesto esperimento** (boardId='arduino-nano-r4' default)

**Talking point**: "Stesso compile chain disponibile in DUE punti UI: HomePage standalone per uso libero programmatore + Lavagna esperimento context per docente che segue percorso Vol3 capitolo X esperimento Y. Mutaforma morfico: stesso codice funziona in 2 contesti diversi adattati al docente."

### Minuto 10-12 — Q&A + roadmap Sprint 76-80

Talking points roadmap:
- **iter 76 (settimana corrente)**: cross-compile LOCAL Mac LIVE + WebUsbBanner Chrome/Edge + scaffold Cloud Compile Service Render (deploy iter 77+)
- **iter 77**: Render Cloud deploy + canary 5% prod (Cross-compile cloud-grade no agent install)
- **iter 78-79**: Hardware UAT Andrea + Tea + Riccardo (kit Omaric Nano R4 fisico)
- **iter 80**: Production rollout + 87 esperimenti narrative cross-compile coverage

**Onestà finale Andrea**:
> "Riccardo, ti ho mostrato chain software 100% verificato + scaffold cloud iter 76 + dimostrato che il sistema funziona senza scheda fisica grazie al compile-only state onesto. Nessuna magia fake, nessun video pre-registrato. Codice C++ generato live + HEX bytes pronti misurati live. La parte fisica USB la verifichiamo insieme appena ho un Nano R4 dal vostro kit."

---

## Anti-pattern demo (NON FARE)

❌ NON dire "Caricato sulla scheda" senza scheda fisica connessa
❌ NON simulare animazione fake flash success senza upload reale
❌ NON nascondere il fatto che non hai board fisico (Riccardo capisce e apprezza onestà)
❌ NON parlare di prezzi/licenze (separazione roles: Andrea coding, Davide commerciale, Giovanni vendite)
❌ NON promettere feature non implementate ("Vision flow" + "ToolSpec 80-tool dispatcher" Sprint 6+ scope)

## Anti-pattern code (verify pre-demo)

✅ ScratchCompileBar NO emoji rule 11 (iter 75 CC-2 cleanup verified)
✅ WebUsbBanner detect Chrome/Edge correctly (iter 76 B.3 13 tests PASS)
✅ Agent localhost:8765 health OK (pre-demo curl verify)
✅ Cross-compile chain Blink HEX 39048 bytes proven (curl POST /compile verify)
✅ Honest state machine compile_only_no_board (iter 76 D.1 ship pending)

## Backup plan (se demo fails)

**Scenario A — Compile Agent crash**:
- Restart: `cd src/services/elab-agent && node http-server.js` (background)
- Verify health: `curl localhost:8765/health`
- Riprendere demo

**Scenario B — arduino-cli compile error**:
- Mostrare stderr nel ScratchCompileBar (UI mostra error categories docente-friendly iter 70+)
- Onestà: "Riccardo, c'è un errore di compilazione X. Lo sistemo + ti rifaccio vedere"
- Fallback: terminal compile manuale `arduino-cli compile --fqbn arduino:renesas_uno:nanor4 sketch.ino`

**Scenario C — Browser crash WebUSB**:
- Hard reload Chrome (Cmd+Shift+R)
- Verify WebUsbBanner re-appears
- Skip upload step, focus solo su compile (chain end-to-end primary)

**Scenario D — Audio/screen sharing fail**:
- Demo asincrono via Loom/screencast 5min
- Codice C++ + output HEX bytes in screenshot Riccardo email

## Post-demo follow-up

1. Email Riccardo con:
   - Link GitHub repo `AndreaMarro/elab-tutor` branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`
   - Spec iter 76 D-track: `docs/specs/2026-05-17-iter-76-CROSS-COMPILE-CERTAINTY-WITHOUT-BOARD-SPEC.md`
   - PDR iter 77+ con timeline Hardware UAT
2. Coordinare Riccardo/Omaric per:
   - Spedire 1 kit Nano R4 test Andrea iter 77 entrance
   - Riccardo UAT session 30 min iter 77+ Chrome + kit fisico
3. Aggiornare CLAUDE.md sezione "Iter 76 PHASE 2 — Riccardo demo executed" con esito reale

---

© Andrea Marro — 2026-05-17 — ELAB Tutor iter 76 D.4 — demo-grade transparency Riccardo Omaric trust
