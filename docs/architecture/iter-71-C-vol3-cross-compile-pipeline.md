# Iter 71 TEAM C — Vol3 cross-compile pipeline + Error translator

**Date**: 2026-05-16
**Author**: Andrea Marro (orchestrator inline iter 71 TEAM C)
**Scope**: PART 1 Vol3 first-vertical-slice Blink + PART 2 Error translator 7 categories + PART 3 docs (this file)
**Hardware target**: Arduino Nano R4 (Renesas RA4M1 Cortex-M4 @ 48 MHz)
**FQBN**: `arduino:renesas_uno:nanor4`
**Provenance**: Davide Fagherazzi Volume 3 cap.5 esp.1 pag.5 (kit ELAB Omaric)

---

## 1. Flow diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ Lavagna UI: CompileUploadButton click (iter 63 A3 LIVE mainwt)      │
│   → ScratchCompileBar.jsx → sketch C++ string (Blockly generator)   │
│       OR                                                            │
│   → Vol3 lesson reader: experimentId "v3-cap5-esp1"                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────────────┐
            │  compileVol3Experiment(experimentId, opts)   │
            │  (vol3-experiments-pipeline.js — iter 71 C)  │
            └──────────────────┬───────────────────────────┘
                               │
                ┌──────────────┴───────────────┐
                ▼                              ▼
   ┌────────────────────────┐    ┌────────────────────────────┐
   │ VOL3_TEMPLATES         │    │ buildVol3ExperimentSketch  │
   │  registry lookup       │───▶│  (pure, idempotent)        │
   │  (Morfismo Sense 2:    │    │  → SketchBuilder API       │
   │   1:1 con libro Vol.3) │    │     - addGlobal LED_PIN=13 │
   └────────────────────────┘    │     - addSetup pinMode     │
                                 │     - addSetup Serial.begin│
                                 │     - addLoop digitalWrite │
                                 │     - addLoop delay(1000)  │
                                 │  → buildSketch() → C++ str │
                                 └─────────────┬──────────────┘
                                               │
                                               ▼
                       ┌──────────────────────────────────────┐
                       │ validateNoForbidden (sketch-builder) │
                       │  vs forbiddenPatterns 20 items       │
                       │  (arduino-nano-r4.json)              │
                       │  PORTB/DDRD/TCCR/OCR/TIMSK rejected  │
                       └─────────────┬────────────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                       (OK)                  (FAIL)
                          │                     │
                          ▼                     ▼
       ┌──────────────────────────────┐   ┌──────────────────────────────┐
       │ handleCompile (server.js)    │   │ Return { ok:false,           │
       │  - mkdir tmp sketchDir+build │   │   error: {                   │
       │  - write ElabSketch.ino      │   │     category:                │
       │  - spawn arduino-cli compile │   │       "forbidden_avr_pattern"│
       │      --fqbn arduino:renesas_ │   │     message: "Ragazzi,...",  │
       │             uno:nanor4       │   │     detail: violations       │
       │      --build-path <buildDir> │   │   }                          │
       │      <sketchDir>             │   │ }                            │
       │  - Renesas core gcc-arm      │   └──────────────────────────────┘
       │  - timeout 120s default      │
       └─────────────┬────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
       (code 0)              (code != 0)
          │                     │
          ▼                     ▼
   ┌─────────────────┐   ┌───────────────────────────────────────┐
   │ { ok: true,     │   │ translateArduinoCliError(stderr,code) │
   │   jobId,        │   │   (error-translator.js — iter 71 C)   │
   │   sketchDir,    │   │                                       │
   │   buildDir,     │   │   regex match 7 categories:           │
   │   stdout }      │   │     1. arduino_cli_absent             │
   │                 │   │     2. core_missing                   │
   │ → upload phase  │   │     3. board_missing                  │
   │   (iter 72+)    │   │     4. port_missing                   │
   └─────────────────┘   │     5. compile_failed (+ sub-hints)   │
                         │     6. upload_failed                  │
                         │     7. permission_denied              │
                         │     + unknown fallback                │
                         │                                       │
                         │   → docente-friendly message          │
                         │     "Ragazzi, ..." plurale            │
                         │     + suggestedFix kit ELAB fisico    │
                         │     + (compile_failed) errorLine +    │
                         │       lineNumber + specificHint       │
                         └──────────────┬────────────────────────┘
                                        │
                                        ▼
                       ┌──────────────────────────────────────┐
                       │ Lavagna UI: error overlay docente    │
                       │  "Ragazzi, manca un punto e virgola  │
                       │   alla riga 5 del nostro codice..."  │
                       │  (Principio Zero: docente read flow) │
                       └──────────────────────────────────────┘
```

---

## 2. 7 canonical categories (PART 2 detail)

Verbatim ELAB-COMPILE-UPLOAD-AGENT.md §3.3 iter 63 spec + iter 71 TEAM C
implementation in `src/services/elab-agent/error-translator.js`.

| # | Category | Trigger stderr regex (sample) | Docente message tema | suggestedFix tema |
|---|----------|-------------------------------|----------------------|-------------------|
| 1 | `arduino_cli_absent` | `command not found.*arduino-cli`, ENOENT spawn | "Arduino CLI non e' installato sul computer" | Installare da arduino.cc |
| 2 | `core_missing` | `platform.*not installed`, `core not installed` | "Manca il dizionario Renesas per Nano R4" | `arduino-cli core install arduino:renesas_uno` |
| 3 | `board_missing` | `invalid fqbn`, `no board id.*found` | "La scheda Nano R4 non viene riconosciuta" | Scollegare e ricollegare cavo USB-C kit ELAB |
| 4 | `port_missing` | `no port.*found`, `no dfu capable usb device available` | "Non trovo la porta USB della Nano R4" | Doppio-click reset (LED arancione lampeggia) |
| 5 | `compile_failed` | `\berror:`, `expected ';'`, `was not declared`, `no matching function` | "Il codice contiene un errore di scrittura" | Sub-hint specifico (semicolon/scope/brace/no-match) |
| 6 | `upload_failed` | `upload.*failed`, `dfu-util.*error`, `bootloader.*not responding` | "Compilato OK ma il caricamento sulla scheda e' fallito" | Doppio-click reset entro 8s |
| 7 | `permission_denied` | `permission denied`, `eacces`, `cannot access` | "Non abbiamo il permesso di parlare con la scheda" | Linux: `sudo usermod -a -G dialout $USER` |
| - | `unknown` (fallback) | (no match) | "Piccolo intoppo che non avevo previsto" | Scollega/ricollega + segnalazione supporto |

### 2.1 compile_failed sub-hints

`extractCompileFailedDetails(stderr)` matches first gcc/g++ canonical
`path:line:col: error: ...` line and emits:

- `errorLine`: messaggio errore (es. `"expected ';' before '}' token"`)
- `lineNumber`: numero riga sketch (es. `5`)
- `specificHint`: hint mirato:
  - **semicolon**: "Manca un punto e virgola (;) a fine riga..."
  - **scope** (`'X' was not declared in this scope`): "Il compilatore non conosce 'X'. Maiuscole/minuscole contano!"
  - **brace** (`expected '}' / '{'`): "Manca una parentesi graffa { o }..."
  - **no-matching-function**: "Argomenti sbagliati. Es. digitalWrite vuole 2 argomenti..."
  - **undefined-reference**: "Manca #include di una libreria..."

### 2.2 Operation-aware disambiguation

`translateArduinoCliError(stderr, code, { operation: 'compile' | 'upload' })`:

- `operation: 'upload'` + generic stderr + `exitCode !== 0` → `upload_failed` (NOT unknown)
- `operation: 'compile'` + `error:` substring → `compile_failed` + sub-hints

---

## 3. Renesas RA4M1 constraints (vs ATmega328p AVR)

Nano R4 mounts Renesas R7FA4M1AB3CFM **Arm Cortex-M4** core (NOT ATmega328p
AVR). Forbidden patterns in `src/boards/arduino-nano-r4.json` validated at
build-time by `validateNoForbidden`:

### 3.1 Forbidden AVR registers (20 patterns)

```
PORTB, PORTC, PORTD          ← AVR digital port registers (D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC su 328p)
DDRB, DDRC, DDRD             ← AVR data direction registers (pinMode bypass diretto)
TCCR0A/B, TCCR1A/B, TCCR2A/B ← AVR Timer/Counter Control Registers (PWM/timing low-level)
OCR0A/B, OCR1A/B, OCR2A/B    ← AVR Output Compare Registers (analogWrite duty cycle)
TIMSK0, TIMSK1, TIMSK2       ← AVR Timer Interrupt Mask Registers
```

Renesas RA4M1 usa registri DIVERSI (P0xx/P1xx/P2xx ports + AGT/GPT timers +
ICU interrupts). Sketch che usa `PORTB |= (1 << 5);` per accendere LED pin 13
funziona su Uno/Nano classico MA NON compila su Nano R4 — ARM cross-compiler
non riconosce simboli AVR.

### 3.2 Differenze hardware critiche

| Caratteristica | Nano R4 (RA4M1) | Nano classico (ATmega328p) |
|---|---|---|
| Core | Cortex-M4 @ 48 MHz | AVR8 @ 16 MHz |
| Flash | 256 KB | 32 KB |
| SRAM | 32 KB | 2 KB |
| Tensione logica | 5V | 5V |
| ADC | 14-bit (`analogReadResolution(14)`) | 10-bit |
| DAC | 12-bit hardware su A0 | nessuno |
| USB | USB-C (CDC nativo) | USB-B mini (CH340/FTDI seriale) |
| Bootloader | DFU (doppio-click reset, LED arancione) | optiboot (auto-reset DTR) |
| Upload tool | `dfu-util` | `avrdude` |
| Compiler | `arm-none-eabi-gcc` | `avr-gcc` |
| Core Arduino | `arduino:renesas_uno` | `arduino:avr` |

### 3.3 Bootloader DFU workflow (Nano R4 specific)

1. **Default mode**: sketch utente in esecuzione, NON accetta upload.
2. **DFU mode**: doppio-click veloce su pulsantino reset (vicino USB-C) →
   bootloader DFU si attiva → LED arancione integrato lampeggia LENTAMENTE
   (1 Hz) → finestra ~8 secondi per caricamento sketch.
3. `dfu-util` (incluso in core `arduino:renesas_uno`) carica via USB VID
   `0x2341` PID `0x0070` (vedi `uploadConfig` in `arduino-nano-r4.json`).
4. Dopo upload: scheda reset automatico → esegue nuovo sketch.

Errori comuni Nano R4 categorizzati da error-translator iter 71 TEAM C:
- "No DFU capable USB device available" → `port_missing` + suggested fix
  doppio-click reset
- "bootloader not responding" → `upload_failed` + suggested fix doppio-click reset

---

## 4. VOL3_TEMPLATES registry iter 71 TEAM C scope

Solo `v3-cap5-esp1` (Blink). Iter 72+ progressivo (vedi roadmap §5).

### 4.1 v3-cap5-esp1 canonical sketch

Single source of truth: `src/data/vol3-blink-canonical-sketch.txt`.

```c
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}
```

**Morfismo Sense 2 compliance**:
- `LED_PIN = 13` ← Davide libro Vol.3 cap.5 pag.5 testo canonico
- `Serial.begin(9600)` ← Davide libro: baud 9600 standard ELAB tutto Vol.3
- `delay(1000)` ON + `delay(1000)` OFF ← 1s/1s lampeggio (Vol.3 pag.5 esempio
  "lampeggia ogni secondo per vedere bene")
- LED pin 13 = `LED_BUILTIN` Nano R4 (vedi `arduino-nano-r4.json` capabilities)

### 4.2 Pipeline DI mock-friendly

```js
import { compileVol3Experiment } from './vol3-experiments-pipeline.js';

// Production
const result = await compileVol3Experiment('v3-cap5-esp1');

// Test: inject mock handleCompile (NO arduino-cli runtime)
const mockHandleCompile = vi.fn(async () => ({ ok: true, jobId: 'mock', ... }));
const result = await compileVol3Experiment('v3-cap5-esp1', {
  handleCompile: mockHandleCompile,
});
```

---

## 5. Roadmap iter 72+

| Iter | Atom | Scope | Effort |
|---|---|---|---|
| 71 | TEAM C PART 1 | v3-cap5-esp1 Blink only | 3h ✓ |
| 71 | TEAM C PART 2 | Error translator 7 cat | 3h ✓ |
| 71 | TEAM C PART 3 | docs (this file) | 30min ✓ |
| 72 | TEAM C2 | v3-cap5-esp2 (cambia velocità delay parametrico) | 2h |
| 72 | TEAM C3 | v3-cap6-esp1..8 (digital input pushbutton + potentiometer ADC 14-bit) | 6h |
| 72 | TEAM C4 | Andrea/Tea Nano R4 USB hardware UAT (kit Omaric reale) | 2h Andrea action |
| 73 | TEAM C5 | v3-cap7-esp1..8 (servo + tone + analogWrite + 14-bit ADC DAC) | 6h |
| 73 | TEAM C6 | v3-cap8-esp1..5 (Serial input + Serial.parseInt + capstone) | 4h |
| 74 | TEAM C7 | Vol3 extra: LCD I2C + Servo sweep + Simon game | 6h |

---

## 6. Honesty caveats critical 5 bullets

1. **NO arduino-cli runtime test iter 71**: tutto via DI mock `handleCompile`.
   Andrea/Tea iter 72+ UAT su kit Omaric Nano R4 reale richiede arduino-cli
   installato locale + scheda connessa USB-C + `arduino:renesas_uno` core
   1.5+ installato.

2. **NO Nano R4 USB hardware UAT iter 71**: Andrea + Tea iter 72+ azione P0:
   `arduino-cli compile --fqbn arduino:renesas_uno:nanor4` Blink sketch +
   `arduino-cli upload -p /dev/cu.usbmodem<XXXX>` su Nano R4 fisica kit ELAB
   + verifica LED pin 13 lampeggia 1s/1s.

3. **DFU mode reset timing**: bootloader Nano R4 finestra 8s post doppio-click.
   Se docente troppo lento → `port_missing` recovery loop. Iter 72+ UI Lavagna
   timer countdown + audio cue.

4. **Error translator regex incomplete**: 7 categories + ~30 pattern coprono
   ~80% errori frequenti arduino-cli + dfu-util Nano R4. Iter 72+ post UAT
   reale raccogliere stderr nuovi pattern (Windows `'arduino-cli' is not
   recognized` su VARIE shell encoding edge cases, Linux udev rules timing,
   macOS Sequoia 15.x privacy permissions USB).

5. **Vol3 schema iter 71 minimal**: `compiledSketchTemplate` field aggiunto SOLO
   `v3-cap5-esp1`. Resto 25 esperimenti Vol3 iter 72+ Davide co-author per
   each canonical sketch verbatim libro pag.X (no inferenza).

---

## 7. Cross-link iter 63 + iter 71 lineage

- **iter 63 spec**: `docs/architecture/ELAB-COMPILE-UPLOAD-AGENT.md` 13.4KB
  PROPOSED Andrea verbatim 2026-05-15 PM
- **iter 63 P0.5**: `src/services/elab-agent/{server.js,sketch-builder.js}`
  + `src/boards/arduino-nano-r4.json` (handlers MVP + SketchBuilder + board profile)
- **iter 70**: A2 HTTP server binding `http-server.js` 501 LOC Express +
  A3 `CompileUploadButton.jsx` 325 LOC wired ScratchCompileBar (mainwt merge `b88edd22`)
- **iter 71 TEAM C** (this work):
  - `src/services/elab-agent/vol3-experiments-pipeline.js` (NEW ~180 LOC)
  - `src/data/vol3-blink-canonical-sketch.txt` (NEW ~30 LOC reference)
  - `src/data/experiments-vol3.js` (MOD +13 LOC `compiledSketchTemplate` field)
  - `src/services/elab-agent/error-translator.js` (NEW ~280 LOC)
  - `src/services/elab-agent/server.js` (MOD import + handleCompile + handleUpload)
  - `tests/unit/services/elab-agent/vol3-experiments-pipeline.test.js` (NEW 18 tests)
  - `tests/unit/services/elab-agent/error-translator.test.js` (NEW 40 tests)
  - `docs/architecture/iter-71-C-vol3-cross-compile-pipeline.md` (NEW this file)
