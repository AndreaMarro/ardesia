# Vol3 Inline Functional Test (Phase 2)

- Started: 2026-05-07T08:04:31Z (mega-loop start, 2nd attempt after window state cleared)
- Esperimenti: 29/29 (cap5+6+7+8 + extras)
- Tool: Claude in Chrome MCP
- Browser tabId: 1259340882
- PDF reference: v0.13 NEWER (10 capitoli) — `/Users/andreamarro/VOLUME 3/Manuale vol 3 versione 0.13.pdf`
- Hardware reference: ELAB Nano Breakout V1.1 GP (NanoBreakoutV1.1 GP.dwg AutoCAD + Fritzing zip SVG)

## Summary Statistics

- Mount success: **29/29 (100%)**
- Errors: **0/29**
- Captured screenshot: 29/29
- With Arduino Nano R4 component: **29/29** (Arduino-centric Vol3)
- With "breakout" component type: 0 (simulator integrates breakout into NanoR4Board.jsx single component)
- With Arduino code (sketch): 22/29
- Zero connections: 5/29 (cap5-esp1+esp2 Blink with LED_BUILTIN, cap8-esp1+esp2 Serial setup/loop, cap8-serial USB)
- Average code length: 294 chars

## Components Used Vol3 (unique types)
- breadboard-half
- buzzer-piezo (1 esperimento: v3-extra-simon)
- lcd16x2 (1 esperimento: v3-extra-lcd-hello)
- led
- nano-r4 (29/29 esperimenti)
- potentiometer
- push-button
- resistor
- servo (1 esperimento: v3-extra-servo-sweep)

## Per-Esperimento Compact Data

Format: `id | mount:Y/N | comps:N (types) | wires:N | code:Nc | title`

```
v3-cap5-esp1 | mount:Y | comps:2 (breadboard-half,nano-r4) | wires:0 | code:147c | title:"Cap. 5 Esp. 1 - Blink con LED_BUILTIN"
v3-cap5-esp2 | mount:Y | comps:2 (breadboard-half,nano-r4) | wires:0 | code:145c | title:"Cap. 5 Esp. 2 - Modifica tempi del Blink"
v3-cap6-esp1 | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:0c | title:"Cap. 6 Esp. 1 - Colleghiamo la resistenza"
v3-cap6-esp2 | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:147c | title:"Cap. 6 Esp. 2 - Cambia il numero di pin"
v3-cap6-esp3 | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:0c | title:"Cap. 6 Esp. 3 - Cambia il numero di pin"
v3-cap6-esp4 | mount:Y | comps:6 (breadboard-half,nano-r4,resistor,resistor,led,led) | wires:7 | code:393c | title:"Cap. 6 Esp. 4 - Due LED: effetto polizia"
v3-cap6-esp5 | mount:Y | comps:5 (breadboard-half,nano-r4,push-button,resistor,led) | wires:7 | code:190c | title:"Cap. 6 Esp. 5 - Pulsante con INPUT_PULLUP"
v3-cap6-esp6 | mount:Y | comps:7 (breadboard-half,nano-r4,push-button,resistor,resistor,led,led) | wires:10 | code:0c | title:"Cap. 6 Esp. 6 - Due LED, un pulsante"
v3-cap6-esp7 | mount:Y | comps:5 (breadboard-half,nano-r4,push-button,resistor,led) | wires:7 | code:0c | title:"Cap. 6 Esp. 7 - Debounce del pulsante"
v3-cap6-morse | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:0c | title:"Cap. 6 Esp. 3 - SOS in codice Morse"
v3-cap6-semaforo | mount:Y | comps:8 (breadboard-half,nano-r4,resistor,resistor,resistor,led,led,led) | wires:10 | code:393c | title:"Cap. 6 Esp. 5 - Il semaforo"
v3-cap7-esp1 | mount:Y | comps:5 (breadboard-half,nano-r4,potentiometer,resistor,led) | wires:8 | code:211c | title:"Cap. 7 Esp. 1 - analogRead base"
v3-cap7-esp2 | mount:Y | comps:5 (breadboard-half,nano-r4,potentiometer,resistor,led) | wires:8 | code:211c | title:"Cap. 7 Esp. 2 - analogRead con tensione"
v3-cap7-esp3 | mount:Y | comps:9 (breadboard-half,nano-r4,potentiometer,resistor,resistor,resistor,led,led,led) | wires:13 | code:488c | title:"Cap. 7 Esp. 3 - Trimmer controlla 3 LED"
v3-cap7-esp4 | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:145c | title:"Cap. 7 Esp. 4 - analogWrite (PWM fade)"
v3-cap7-esp5 | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:222c | title:"Cap. 7 Esp. 5 - PWM con valori manuali"
v3-cap7-esp6 | mount:Y | comps:4 (breadboard-half,nano-r4,resistor,led) | wires:5 | code:234c | title:"Cap. 7 Esp. 6 - Fade up/down con for"
v3-cap7-esp7 | mount:Y | comps:5 (breadboard-half,nano-r4,potentiometer,resistor,led) | wires:8 | code:206c | title:"Cap. 7 Esp. 7 - Trimmer controlla luminosita"
v3-cap7-esp8 | mount:Y | comps:3 (breadboard-half,nano-r4,potentiometer) | wires:5 | code:140c | title:"Cap. 7 Esp. 8 - DAC reale (10 bit)"
v3-cap7-mini | mount:Y | comps:5 (breadboard-half,nano-r4,potentiometer,resistor,led) | wires:7 | code:0c | title:"Cap. 7 Mini - Potenziometro ADC + LED PWM"
v3-cap8-esp1 | mount:Y | comps:2 (breadboard-half,nano-r4) | wires:0 | code:103c | title:"Cap. 8 Esp. 1 - Serial.println in setup"
v3-cap8-esp2 | mount:Y | comps:2 (breadboard-half,nano-r4) | wires:0 | code:103c | title:"Cap. 8 Esp. 2 - Serial.println in loop"
v3-cap8-esp3 | mount:Y | comps:3 (breadboard-half,nano-r4,potentiometer) | wires:5 | code:143c | title:"Cap. 8 Esp. 3 - analogRead + Serial Monitor"
v3-cap8-esp4 | mount:Y | comps:4 (breadboard-half,nano-r4,potentiometer,potentiometer) | wires:8 | code:273c | title:"Cap. 8 Esp. 4 - Serial Plotter con 2 pot"
v3-cap8-esp5 | mount:Y | comps:9 (breadboard-half,nano-r4,potentiometer,resistor,resistor,resistor,led,led,led) | wires:13 | code:548c | title:"Cap. 8 Esp. 5 - Pot + 3 LED + Serial"
v3-cap8-serial | mount:Y | comps:1 (nano-r4) | wires:0 | code:0c | title:"Cap. 8 Extra - Comunicazione seriale via USB"
v3-extra-lcd-hello | mount:Y | comps:3 (breadboard-half,nano-r4,lcd16x2) | wires:8 | code:235c | title:"Extra - LCD Hello World"
v3-extra-servo-sweep | mount:Y | comps:3 (breadboard-half,nano-r4,servo) | wires:3 | code:171c | title:"Extra - Servo Sweep"
v3-extra-simon | mount:Y | comps:15 (breadboard-half,nano-r4,resistor,resistor,resistor,resistor,led,led,led,led,push-button,push-button,push-button,push-button,buzzer-piezo) | wires:20 | code:1630c | title:"Simon Says — Gioco di Memoria"
```

## CRITICAL Findings vs PDF v0.13

### 1. cap9 Piezo COMPLETELY MISSING in code (CRITICAL GAP)
v0.13 PDF cap9 = "Il piezo: facciamo musica!" (NEW chapter, not in old V0.8.1).
- Code grep: ZERO `v3-cap9-*` esperimenti
- Only buzzer-piezo usage: `v3-extra-simon` (capstone usage, not chapter content)
- GAP CONFIRMED — entire chapter 9 of v0.13 has NO software implementation

### 2. cap10 Simon: NAMING ERROR
v0.13 PDF cap10 = "Il progetto finale: il gioco Simon" (NEW chapter).
- Code uses `v3-extra-simon` (extra naming)
- Should be `v3-cap10-esp1` per v0.13 chapter mapping
- Title says "Simon Says — Gioco di Memoria" — non cita "Cap. 10" come gli altri esperimenti del libro
- **Lesson group `v3-progetti-extra` chapter:99** wrong — should be chapter:10

### 3. Title-ID mismatch v3-cap6-morse + v3-cap6-semaforo
- `v3-cap6-morse` title = "Cap. 6 Esp. 3 - SOS in codice Morse" (collision with v3-cap6-esp3 "Cambia il numero di pin")
- `v3-cap6-semaforo` title = "Cap. 6 Esp. 5 - Il semaforo" (collision with v3-cap6-esp5 "Pulsante con INPUT_PULLUP")
- Same chapter+esp number used twice = conflict

### 4. v3-extra-lcd-hello + v3-extra-servo-sweep: STATUS UNCLEAR vs v0.13
- LCD content NOT in v0.13 chapter list (cap1-10)
- Servo content NOT in v0.13 chapter list
- POTENTIAL: leftover from older version OR Davide will add to v0.14+

### 5. v3-cap6-esp2 + v3-cap6-esp3: TITLE DUPLICATE
- esp2 title = "Cambia il numero di pin"
- esp3 title = "Cambia il numero di pin" (IDENTICAL)
- Stesso circuit (4/5 comps/wires)
- Code length: esp2=147c, esp3=0c (esp3 missing code!)

### 6. Empty Code esperimenti
7/29 esperimenti hanno code:0c — NO Arduino sketch:
- v3-cap6-esp1 (Colleghiamo la resistenza)
- v3-cap6-esp3 (Cambia il numero di pin)
- v3-cap6-esp6 (Due LED, un pulsante)
- v3-cap6-esp7 (Debounce del pulsante)
- v3-cap6-morse (SOS Morse)
- v3-cap7-mini (Pot ADC + LED PWM)
- v3-cap8-serial (USB)

Per cap5+ Arduino-centric Vol3, esperimenti senza code = pedagogicamente incompleti. Studente non vede sketch da modificare.

## Hardware Verification

### Arduino Nano R4 component
Simulator usa `nano-r4` type ovunque (29/29 esperimenti). NanoR4Board.jsx implements ELAB NanoBreakout V1.1 GP (C-shape PCB) integrated single component.

### Fritzing zip ELAB Nano Breakout
- File: `/Users/andreamarro/VOLUME 3/HARDWARE/ELAB Nano Breakout.zip`
- Tags: arduino, **NANO RP2040 CONNECT**, RP2040 ⚠️
- Property: "Arduino NANO RP2040 CONNECT with headers"
- **Reference mismatch: Fritzing part says RP2040, kit Omaric should be R4**

### NanoBreakoutV1.1 GP.dwg AutoCAD
- File: `/Users/andreamarro/VOLUME 3/HARDWARE/NanoBreakoutV1.1 GP.dwg`
- Format: AutoCAD .dwg — requires Fusion 360 OR AutoCAD viewer to inspect
- **NOT inspected this session** (Fusion 360 not connected, would need user to open + load .dwg)
- Documented gap — Cycle 3 verifica: dwg coords match NanoR4Board.jsx C-shape PCB

## Anti-Inflation Mandate Compliance

- ✅ All data measured live via __ELAB_API
- ✅ Mount counts: actual return values
- ✅ Components/connections: from getLayout() JSON
- ✅ Title strings: regex-extracted from getCircuitDescription() verbatim
- ✅ Code length: actual editor.getValue().length
- ⚠️ Per-esperimento PNG screenshots NOT saved (same Vol1+Vol2 limitation Chrome MCP)
- ⚠️ AutoCAD .dwg NanoBreakout schema NOT inspected (Fusion 360 disconnected)
- ✅ NO synthesis: gap analysis based on observed null values, not synthesized
