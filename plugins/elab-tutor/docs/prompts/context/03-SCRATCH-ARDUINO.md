# 03 — Scratch & Arduino

> Ultimo aggiornamento: Sprint 1.1 (11/03/2026)

## Architettura Scratch

### File Principali
- `ScratchEditor.jsx` — Componente React con Blockly workspace, ELAB_THEME, Zelos renderer, lazy-loaded (~2MB chunk)
- `scratchBlocks.js` — 22 custom Arduino blocks con `setStyle(STYLES.X)`
- `scratchGenerator.js` — Genera Arduino C++ valido da workspace Blockly (setup+loop+vars)

### 22 Blocchi Blockly Registrati

| # | Block ID | Categoria | Descrizione |
|---|----------|-----------|-------------|
| 1 | arduino_base | BASE | Setup + Loop (non eliminabile) |
| 2 | arduino_pin_mode | IO | PinMode (OUTPUT/INPUT/INPUT_PULLUP) |
| 3 | arduino_digital_write | IO | DigitalWrite (pin, HIGH/LOW) |
| 4 | arduino_digital_read | IO | DigitalRead (pin) |
| 5 | arduino_analog_write | IO | AnalogWrite (pin, 0-255) |
| 6 | arduino_analog_read | IO | AnalogRead (pin A0-A5) |
| 7 | arduino_delay | TIME | Delay (ms) |
| 8 | arduino_millis | TIME | Millis() |
| 9 | arduino_serial_begin | SERIAL | Serial.begin(baud) |
| 10 | arduino_serial_print | SERIAL | Serial.print/println |
| 11 | arduino_tone | SOUND | tone(pin, freq, duration) |
| 12 | arduino_no_tone | SOUND | noTone(pin) |
| 13 | arduino_servo_attach | SERVO | servo.attach(pin) |
| 14 | arduino_servo_write | SERVO | servo.write(angle) |
| 15 | arduino_servo_read | SERVO | servo.read() |
| 16 | arduino_lcd_init | LCD | lcd.begin(16,2) |
| 17 | arduino_lcd_print | LCD | lcd.print(text) |
| 18 | arduino_lcd_set_cursor | LCD | lcd.setCursor(col, row) |
| 19 | arduino_lcd_clear | LCD | lcd.clear() |
| 20 | arduino_variable_set | VARS | Imposta variabile |
| 21 | arduino_variable_get | VARS | Leggi variabile |
| 22 | arduino_random | VARS | random(min, max) |
| 23 | arduino_map | MATH_EXT | map(val, inMin, inMax, outMin, outMax) |

### Categorie Stile (ELAB_THEME)
```
arduino_io     — Teal (Digital/Analog I/O)
arduino_time   — Giallo (Delay, Millis)
arduino_serial — Verde (Serial)
arduino_sound  — Arancio (Tone/Buzzer)
arduino_servo  — Viola (Servo)
arduino_lcd    — Indaco (LCD)
variable_blocks — Rosso (Variabili)
math_blocks    — Blu (Map, Constrain)
```

## Gate Scratch

- Scratch tab appare SOLO per esperimenti con `simulationMode === 'avr'`
- 12/14 Vol3 esperimenti mostrano Scratch tab
- 2 circuit-only esclusi (v3-cap8-id, v3-cap8-pot)
- Esperimenti senza `scratchXml` usano default `arduino_base` block

## Layout Scratch (S93+)

- **Desktop/iPad**: Blockly workspace occupa 100% dell'area editor (NO code preview panel)
- ScratchCompileBar in fondo: status (Pronto/Compilazione.../OK/Errore) + bottone "Compila & Carica"
- Categorie blocchi a sinistra, workspace blocchi a destra
- iPad landscape (1024px): blocchi leggibili, dropdown leggermente troncati a destra
- iPad portrait (768px): layout stacked, categorie + blocchi visibili, Compila & Carica in fondo
- **Nota**: il layout side-by-side (Blockly 60% + CodeEditorCM6 40%) è stato rimosso in S93

## Compilazione

- Scratch genera C++ via `scratchGenerator.js`
- Compilazione inviata allo stesso endpoint Arduino C++ (n8n webhook su Hostinger)
- **10/12 AVR compilano** in modalita Scratch (Sprint 1.3 CoV, 11/03/2026)
- `simon` compila OK (5822 bytes, 18% flash) — precedente issue risolto
- **2 FAIL server-side**: `v3-extra-lcd-hello` (manca LiquidCrystal.h) e `v3-extra-servo-sweep` (manca Servo.h) — librerie non installate sul compile server, falliscono anche in modalita Arduino C++
- Gli stessi 2 esperimenti funzionano comunque via file .hex pre-compilati

## Passo Passo Code Steps

- `scratchSteps[]` in `experiments-vol3.js` per 5 esperimenti
- Merge con `buildSteps` in ComponentDrawer via `allSteps`
- Action tags: openeditor, closeeditor, switcheditor:scratch/arduino, loadblocks

## Problemi Noti

- ScratchEditor chunk ~2020 KB gzip ~904 KB (pesante)
- ~~Simon Says: code gen issue pre-esistente~~ RISOLTO (compila OK, 5822 bytes)
- Compile server manca: LiquidCrystal.h, Servo.h (2 esperimenti falliscono sia in Scratch che Arduino C++)
- Nessun blocco per: interrupts, I2C, SPI, EEPROM (non necessari per Vol3)
