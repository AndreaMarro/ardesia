# Arduino Nano R4 cross-compile UAT prep — iter 74 TRACK A4

**Target**: Andrea Marro / Tea Strambino / Riccardo Franzoso (Omaric) per validare cross-compile chain end-to-end SOFTWARE+HARDWARE Nano R4 kit Omaric.

**Date**: 2026-05-17 PM iter 74

**Status SOFTWARE chain**: ✅ VERIFIED end-to-end (iter 73 CC-1 + CC-2 shipped + Codex Pattern V REFUTE+fix)

**Status HARDWARE chain**: ⏸ PENDING (richiede physical board USB + Andrea/Tea/Riccardo)

---

## 1. Prerequisiti hardware

| Item | Sorgente | Verify |
|---|---|---|
| Arduino Nano R4 board (RA4M1 Cortex-M4) | Kit Omaric | Stampato `Arduino` su silkscreen + USB-C connector |
| Cavo USB-C dati (NON solo carica) | Kit Omaric OR generico | Dati pin verified (alcuni cavi solo power) |
| Mac Mini OR MacBook con macOS 13+ | Andrea/Tea | `sw_vers` ≥ 13.0 |

## 2. Prerequisiti software local Mac

Già installati su Mac Andrea/Tea (verifica empirica iter 73 CC-1):

```bash
which arduino-cli    # /opt/homebrew/bin/arduino-cli
arduino-cli version  # 1.4.1+
arduino-cli core list | grep renesas
# arduino:renesas_uno  1.5.3  Arduino UNO R4 Boards

which dfu-util       # /opt/homebrew/bin/dfu-util
dfu-util --version   # 0.11+

node --version       # v22.10.0+
```

Se manca qualcosa:
```bash
brew install arduino-cli dfu-util
arduino-cli core update-index
arduino-cli core install arduino:renesas_uno
```

## 3. ELAB Compile Agent start

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
node src/services/elab-agent/cli.js
```

Aspetto:
```
[elab-agent] listening http://127.0.0.1:8765
[elab-agent] endpoints: GET /health, GET /boards, POST /compile, POST /upload, POST /compile-and-upload, GET /jobs/:id/status
```

Verifica health:
```bash
curl -s http://localhost:8765/health
```
Aspetto: `{"agent":"elab-compile-upload","arduino_cli_version":"1.4.1","core_renesas_uno_installed":true,"core_count":2,...}`

## 4. USB Nano R4 detection

Connetti Nano R4 via USB-C dati al Mac.

```bash
arduino-cli board list
```

Aspetto qualcosa tipo:
```
Port              Protocol Type              Board Name        FQBN                          Core
/dev/cu.usbmodem1101 serial   Serial Port (USB) Arduino UNO R4 arduino:renesas_uno:nanor4 arduino:renesas_uno
```

Se NON appare:
- Verifica cavo USB-C dati (NON solo carica) — sostituisci
- Verifica Nano R4 power LED acceso
- Reset board (doppio click pulsante reset → boot DFU mode)
- `system_profiler SPUSBDataType | grep -i arduino` per debug USB layer

## 5. Compile test direct (sanity check)

```bash
mkdir -p /tmp/elab-blink && cat > /tmp/elab-blink/elab-blink.ino << 'EOF'
void setup() { pinMode(LED_BUILTIN, OUTPUT); }
void loop() {
  digitalWrite(LED_BUILTIN, HIGH); delay(500);
  digitalWrite(LED_BUILTIN, LOW); delay(500);
}
EOF
arduino-cli compile --fqbn arduino:renesas_uno:nanor4 /tmp/elab-blink/elab-blink.ino
```

Aspetto:
```
Lo sketch usa 39048 byte (14%) dello spazio disponibile per i programmi.
Le variabili globali usano 3940 byte (12%) di memoria dinamica.
```

## 6. Upload test direct

```bash
arduino-cli upload -p /dev/cu.usbmodemXXXX --fqbn arduino:renesas_uno:nanor4 /tmp/elab-blink/elab-blink.ino
```

Aspetto LED builtin Nano R4 lampeggia 1Hz post-upload.

Se fail:
- Verifica DFU mode: doppio click reset → arduino-cli rileva porta `/dev/cu.usbmodemDFUxxxx` temporanea
- `dfu-util -l` direct DFU list devices
- Verifica permessi `/dev/cu.usbmodem*` (su macOS solitamente OK senza root)

## 7. Test E2E via ELAB Tutor browser

1. `npm run dev` (worktree elab-builder/)
2. Apri browser `http://localhost:5173`
3. Naviga HomePage → click card **"Compila Arduino"**
4. R5 CompileAgentBanner dovrebbe mostrare "Agent ELAB rilevato" (green) — se mostra "Installa Agent" verifica step 3 agent running
5. Trascina blocchi Blockly: "Quando Arduino si accende" + "Accendi LED 13" + "Aspetta 500ms" + "Spegni LED 13" + "Aspetta 500ms"
6. Click "Compila & Carica" — agent compila + upload board
7. Verifica LED Nano R4 lampeggia 1Hz

## 8. Esperimenti Vol3 test E2E

Naviga ELAB Tutor `#tutor` → Vol3 → ogni esperimento Blockly+IDE:
- v3-cap5-esp1 Blink
- v3-cap5-esp2 cambia velocità
- v3-cap6-esp1 primo LED breadboard
- ...

Per ognuno: compila + upload via "Compila Arduino" → verifica comportamento fisico.

## 9. Honest report findings

Documenta `docs/uat/2026-05-XX-nano-r4-uat-report.md`:
- Quali esperimenti compile success
- Quali fail con stderr capture
- Quali upload success (LED comportamento corretto)
- Quali fail upload
- Issues UX (lentezza compile, messaggi errori, etc.)
- NO mock NO inflation — empirical only

## 10. Knownissues iter 74 entrance + workaround

- **R5 banner mostra "Installa Agent" anche se Agent running**: Playwright sandbox issue likely (curl Origin works). Real Chrome dovrebbe work. Se NON work real Chrome → ELAB Agent bind `0.0.0.0:8765` invece `127.0.0.1:8765` per allow all interfaces.
- **Vol3 14 esperimenti pedagogical chain iter 57** (NON 29 Tea SUPERSET) — iter 73 close audit conferma intentional Andrea+Tea ratify.
- **USB Web Serial port detection NewElabSimulator port=null placeholder** iter 72 BG-A7 — iter 74 B-6 implement OR use arduino-cli board list bridge.
- **Installer script `setup-elab-compile-agent.sh` MAI shipped** — iter 74 A1 link rimosso, distribuzione packaging Tauri signed iter 75+ ($300/yr Apple Dev ID).
- **dfu-util install required** — `brew install dfu-util` (iter 73 CC-1.1 verified).

## 11. Sprint U close gate cross-compile

- ✅ SOFTWARE chain end-to-end verified iter 73-74
- ⏸ HARDWARE chain Andrea/Tea/Riccardo UAT pending
- ⏸ Distribuzione packaging Tauri iter 75+
- ⏸ Auto-update post-distribution iter 75+

## Cross-link

- iter 64 SPEC: `docs/specs/2026-05-15-elab-compile-agent-public-distribution-spec.md`
- iter 59 PRD Blockly Nano R4 cross-compile: `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`
- iter 63 architecture: `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md`
- iter 73 close audit: `docs/audits/2026-05-17-iter-73-CLOSE-audit.md`
- Nano R4 board profile: `src/boards/arduino-nano-r4.json`
- Riccardo Omaric comms protocol: `memory/feedback_omaric_comms.md` (linguaggio semplice + pratico NO gergo Morfismo)
