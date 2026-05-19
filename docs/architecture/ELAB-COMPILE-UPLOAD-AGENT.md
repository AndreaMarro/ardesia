# ELAB Compile/Upload Agent — Architecture (ADR draft)

> Status: PROPOSED iter 62→iter 63. Andrea mandate verbatim 2026-05-15 PM.
> Scope: bridge Blockly ↔ Arduino Nano R4 via Arduino CLI. NO cross-compilatore from scratch.
> Anti-debito: massimizza uso toolchain ufficiale, minimizza superficie codice ELAB.

## 1. Decisione architetturale

**NON creare un cross-compilatore da zero**. Creare invece **ELAB Compile/Upload Agent** locale che riceve codice Arduino C++ generato da Blockly, crea sketch temporaneo, compila con Arduino CLI e carica sulla scheda.

```
ELAB Tutor / Blockly
       ↓
Generatore Arduino C++
       ↓
ELAB Local Agent
       ↓
Arduino CLI
       ↓
Core arduino:renesas_uno
       ↓
arm-none-eabi-gcc + dfu-util
       ↓
Arduino Nano R4 via USB
```

## 2. Board target — Arduino Nano R4

**Specifiche hardware** (verbatim Andrea):
- Renesas RA4M1
- Arm Cortex-M4 @ 48 MHz
- Flash 256 KB
- SRAM 32 KB
- ADC 14 bit
- DAC 12 bit (pin A0)
- Logic 5V

**Toolchain Arduino**:
- Core: `arduino:renesas_uno` (NON `arduino:renesas_nano`)
- FQBN: `arduino:renesas_uno:nanor4` (NON `arduino:renesas_uno:minima`, NON `arduino:renesas_uno:unor4wifi`)
- Compiler: `arm-none-eabi-gcc` (gestito da core)
- Upload tool: `dfu-util` (NON `bossac` come UNO R4 WiFi)
- Min core version: 1.5.0 (Arduino UNO R4 Boards 1.5.0+)

**ANTI-PATTERN VIETATI**:
- Trattare Nano R4 come "Nano vecchia" (AVR ATmega328p)
- Usare toolchain AVR
- Usare registri AVR: `PORTB`, `PORTC`, `PORTD`, `DDRB`, `DDRC`, `DDRD`, `TCCR*`, `OCR*`, `TIMSK*`
- Confondere Nano R4 con UNO R4 Minima OR UNO R4 WiFi
- Hardcodare COM3 OR `/dev/ttyACM0`

## 3. Componenti da implementare

### 3.1. BoardProfile JSON (canonical board description)

Path: `src/boards/arduino-nano-r4.json`

```json
{
  "id": "arduino-nano-r4",
  "name": "Arduino Nano R4",
  "fqbn": "arduino:renesas_uno:nanor4",
  "requiredCore": "arduino:renesas_uno",
  "minCoreVersion": "1.5.0",
  "architecture": "renesas",
  "mcu": "RA4M1",
  "compiler": "arm-none-eabi-gcc",
  "uploadTool": "dfu-util",
  "forbiddenPatterns": [
    "PORTB", "PORTC", "PORTD",
    "DDRB", "DDRC", "DDRD",
    "TCCR", "OCR", "TIMSK"
  ],
  "capabilities": {
    "adcResolutionBits": 14,
    "dacResolutionBits": 12,
    "hasDac": true,
    "dacPin": "A0",
    "logicVoltage": "5V"
  }
}
```

### 3.2. Generatore Arduino C++ (Blockly side)

**Principio separazione**: Blockly = livello visuale ONLY. Blocchi NON conoscono porte USB / compilazione / toolchain / upload.

**Blocchi Blockly emettono intenzioni** (esempio):
```js
generator.forBlock['elab_analog_read_14bit'] = function(block, generator) {
  generator.elabSetup.add('analogReadResolution(14);');
  const pin = block.getFieldValue('PIN');
  return [`analogRead(${pin})`, generator.ORDER_FUNCTION_CALL];
};
```

**SketchBuilder finale compone** (Andrea spec):
```js
const sketch = {
  includes: new Set(),
  globals: new Set(),
  setup: new Set(),
  loop: [],
  functions: new Set()
};
```

Output finale ordinato:
```cpp
#include <ArduinoIO.h>          // includes
const int LED_PIN = 13;          // globals
void setup() {
  analogReadResolution(14);      // setup
}
void loop() {
  int value = analogRead(A0);    // loop
}
void blinkOnce() { /* ... */ }   // functions
```

**Anti-debito**: blocco "leggi analogico avanzato" aggiunge `analogReadResolution(14)` UNA SOLA VOLTA nel setup, NOT ogni volta nel loop. Builder deduplica.

### 3.3. ELAB Local Agent (Node/TypeScript MVP, Electron/Tauri prodotto stabile)

**API minime**:
- `GET /health` — agent alive + arduino-cli version + core list
- `GET /boards` — `arduino-cli board list --json` (auto-detect connected boards)
- `POST /compile` — { code, fqbn } → compile only (return errors+warnings)
- `POST /upload` — { jobId, port } → upload pre-compiled sketch
- `POST /compile-and-upload` — { code, port } → compile + upload sequenziale
- `GET /jobs/:id` — job status (compile/upload/done/error)

**Regole sicurezza implementazione**:
- USA `spawn` o `execFile` con array argomenti, NEVER `exec` con stringhe shell (injection prevention)
- Ogni job in cartella temporanea isolata: `os.tmpdir()/elab-arduino/<uuid>/`
- `--build-path` esplicito + riusato compile→upload (Arduino CLI separa compile e upload, NON ricompila auto)
- Errori categorizzati separatamente:
  - `core_missing` (Renesas core non installato)
  - `board_missing` (FQBN non trovato)
  - `port_missing` (board non rilevata)
  - `compile_failed` (errori sketch)
  - `upload_failed` (USB issue)
  - `permission_denied` (Linux/macOS USB ACL)
  - `arduino_cli_absent` (binary not found)
- Tradurre errori tecnici in messaggi comprensibili docente (es. "Compilazione fallita: la riga 14 ha un punto e virgola mancante" NON `error: expected ';' before '}' token`)
- Log completo per developer (`/var/log/elab-agent.log` OR equivalent)

**Esempio implementazione** (Andrea-provided ref TypeScript):
```typescript
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const FQBN = "arduino:renesas_uno:nanor4";

function runArduinoCli(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("arduino-cli", args, { shell: false });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => stdout += chunk.toString());
    child.stderr.on("data", chunk => stderr += chunk.toString());
    child.on("close", code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject({ code, stdout, stderr });
    });
  });
}

async function compileAndUpload({ code, port }: { code: string; port: string }) {
  const jobId = crypto.randomUUID();
  const root = path.join(os.tmpdir(), "elab-arduino", jobId);
  const sketchDir = path.join(root, "ElabSketch");
  const buildDir = path.join(root, "build");
  const inoPath = path.join(sketchDir, "ElabSketch.ino");

  await fs.mkdir(sketchDir, { recursive: true });
  await fs.mkdir(buildDir, { recursive: true });
  await fs.writeFile(inoPath, code, "utf8");

  await runArduinoCli([
    "compile",
    "--fqbn", FQBN,
    "--build-path", buildDir,
    sketchDir
  ]);

  await runArduinoCli([
    "upload",
    "--fqbn", FQBN,
    "--build-path", buildDir,
    "-p", port,
    sketchDir
  ]);

  return { success: true, jobId };
}
```

### 3.4. Browser/Web Serial layer

Web Serial API (browser) NON sostituisce Arduino CLI:
- Web Serial = leggi/scrivi su dispositivo seriale (utile dopo upload per Serial Monitor)
- Arduino CLI = installa core, compila C++, lancia gcc, usa dfu-util

Quindi: **Blockly browser/app + agent locale nativo**. In sviluppo = server Node locale. In produzione scolastica = packaged Electron/Tauri (docente NON lancia terminali).

## 4. Diagnostica obbligatoria

L'agent deve esporre `/health` con:
```json
{
  "agent": "ok",
  "arduino_cli_version": "1.4.1",
  "core_renesas_uno_installed": true,
  "core_renesas_uno_version": "1.5.0",
  "boards_detected": [
    { "port": "/dev/cu.usbmodemR4001", "fqbn": "arduino:renesas_uno:nanor4" }
  ],
  "permissions_usb": "ok"
}
```

Comandi diagnostici:
```bash
arduino-cli version
arduino-cli core list
arduino-cli board list --json
arduino-cli board listall "Nano R4"
```

## 5. Test automatici (golden + integration)

**Test minimi MVP**:
- Compilare Blink minimal sketch (`pinMode + digitalWrite + delay`) per Nano R4 → exit 0
- Compilare ogni esperimento ELAB (es. v1-cap6-esp1 LED) → exit 0
- Caricare Blink su Nano R4 reale (manual UAT)
- Validare nessun blocco genera codice AVR-only (test forbidden patterns)
- Golden test: ogni blocco Blockly emette stringa C++ deterministica (snapshot test)

**Test forbidden AVR patterns** (esempio):
```js
test('no AVR registers in generated sketch', () => {
  const sketch = buildSketch(blocklyWorkspace);
  const forbidden = ['PORTB', 'PORTC', 'PORTD', 'DDRB', 'DDRC', 'DDRD', 'TCCR', 'OCR', 'TIMSK'];
  for (const pattern of forbidden) {
    expect(sketch).not.toContain(pattern);
  }
});
```

## 6. Setup sviluppo (per Mac local Andrea)

**Status verificato 2026-05-15**: Arduino CLI già installato Mac Andrea via Homebrew.

```bash
# Verify
arduino-cli version  # → arduino-cli  Versione: 1.4.1 ✓ (verified 2026-05-15)

# Setup base (one-time)
arduino-cli config init
arduino-cli core update-index
arduino-cli core install arduino:renesas_uno

# Verify board listable
arduino-cli board listall "Nano R4"
# Expected: nanor4    arduino:renesas_uno:nanor4

# Sketch test minimal
mkdir -p /tmp/elab-sketches/test-blink/ElabSketch
cat > /tmp/elab-sketches/test-blink/ElabSketch/ElabSketch.ino <<'EOF'
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
EOF

# Compile
arduino-cli compile \
  --fqbn arduino:renesas_uno:nanor4 \
  --build-path /tmp/elab-builds/test-blink \
  /tmp/elab-sketches/test-blink/ElabSketch

# Upload (post Andrea connect Nano R4 via USB)
arduino-cli board list --json  # detect port
arduino-cli upload \
  --fqbn arduino:renesas_uno:nanor4 \
  --build-path /tmp/elab-builds/test-blink \
  -p <PORT_FROM_ABOVE> \
  /tmp/elab-sketches/test-blink/ElabSketch
```

## 7. Vertical slice MVP (iter 63 P0)

**Scope MVP iter 63 raccomandato Andrea**:
1. `src/boards/arduino-nano-r4.json` BoardProfile (10 LOC JSON)
2. `src/services/elab-agent/sketch-builder.ts` SketchBuilder sezioni includes/globals/setup/loop/functions (~150 LOC)
3. `src/services/elab-agent/server.ts` endpoint `/health` + `/boards` (~120 LOC)
4. `src/services/elab-agent/server.ts` endpoint `/compile` per Blink (~80 LOC)
5. `tests/unit/elab-agent/sketch-builder.test.ts` golden tests (~150 LOC, 15+ tests)
6. `tests/unit/elab-agent/forbidden-avr-patterns.test.ts` forbidden patterns (~60 LOC, 10 tests)
7. `tests/integration/elab-agent/compile-blink-real.test.ts` real Arduino CLI compile (1 integration test, requires Arduino CLI installed)
8. `docs/elab-agent/ERROR-MESSAGES-DOCENTE.md` docente-friendly error mapping

**NOT in MVP** (defer iter 64+):
- Real upload to Nano R4 hardware (post compile stable)
- Electron/Tauri packaging
- Auto-update agent
- Multi-board support
- Library manager UI
- gRPC daemon mode

## 8. Roadmap full

| Fase | Soluzione | Perché |
|---|---|---|
| MVP iter 63-64 | Node.js local agent + Arduino CLI installato | Massima velocità, Andrea verifica già installato Mac |
| Beta scuole iter 65-70 | App desktop con agent integrato (Electron/Tauri) | Meno problemi docenti, NO terminale |
| Prodotto stabile iter 71+ | App desktop + gestione automatica core/librerie + diagnostica | Minimo attrito classe |
| Futuro iter 80+ | Arduino CLI gRPC daemon | Pulizia integrazione avanzata, NO parsing terminale |

## 9. Licenza

**Arduino CLI = GPL-3.0** con licenza commerciale opzionale (per repo ufficiale Arduino).

Decisione Andrea pending iter 63+:
- Lasciare arduino-cli installato separatamente da docente (NO redistribution issue)
- OPPURE distribuire bundled in Electron app (richiede verifica licenza commerciale Arduino)
- OPPURE prevedere doppia opzione: docente esperto = installa CLI, docente novizio = bundled app con licenza Arduino

**P1 Andrea iter 63+**: contattare Arduino sales per licenza commerciale Arduino CLI distribution rights.

## 10. Cross-link

- Andrea mandate verbatim: `SESSION-NEXT-ACTIVATION.md` sezione "NANO R4 — DECISIONE TECNICA"
- Iter 60 ultrathink brief Blockly Phase 1: `docs/audits/2026-05-15-iter-60-ultrathink-brief.md`
- Iter 60 acceptance test Blockly: `docs/tests/2026-05-15-iter-60-blockly-phase1-acceptance-test-plan.md`
- Spec iter 59 cross-compile UX: `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`
- Iter 60 api.js annotations: `docs/specs/2026-05-15-iter-60-api-js-annotations.md`
- BoardSelector skeleton iter 60: `src/components/simulator/panels/BoardSelector.jsx` (148 LOC, `disabled = true` default)
- Forbidden ALLOWED_COMPILE_BOARDS iter 60: `src/services/api.js:61-64`

## 11. Anti-debito tecnico — checklist iter 63 implementer

- [ ] BoardProfile letto da JSON canonical (NO hardcoded constants)
- [ ] Blockly generators import BoardProfile.forbiddenPatterns (NO duplicate list)
- [ ] SketchBuilder usa Set/Map (NO duplicates strings)
- [ ] Agent usa spawn/execFile (NO exec con strings)
- [ ] Job temp dir cleanup post-completion (NO disk leak)
- [ ] Errori categorizzati 7 tipi (NO single "error" string)
- [ ] Docente-friendly error mapping JSON (NO inline strings)
- [ ] Golden tests per ogni blocco Blockly (NO regression silently)
- [ ] Forbidden AVR patterns test mandatory (NO old-AVR code slip)
- [ ] Real compile test integration mandatory (NO mock-only validation)
- [ ] CHANGELOG entry per ogni nuova capability board (NO silent feature)
- [ ] License decision Andrea iter 63+ docs/business/ (NO blocker production undocumented)

## 12. NON COMPIACERE

- ZERO claim "Compile/Upload Agent LIVE" senza Andrea reale Nano R4 USB upload PASS
- ZERO claim "Blockly Phase 1 R1-R6 wired" senza unit tests + integration tests + Codex C-V CONFIRM
- ZERO claim "production-ready" senza beta scuole UAT
- License Andrea decision BLOCKING per redistribution commerciale
- Score gate: per claim Compile Agent ready, richiede Opus indipendente review G45 mandate
