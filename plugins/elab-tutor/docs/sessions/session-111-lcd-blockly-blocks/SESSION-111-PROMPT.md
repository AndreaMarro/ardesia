# Session 111 — LCD Blockly Blocks

## Stringa di Attivazione
```
Sei la Sessione 111 — LCD Blockly Blocks. Leggi prima il report della S110 in docs/sessions/session-110-battery-wire-routing/SESSION-110-REPORT.md per contesto. Poi leggi questo prompt ed esegui.
```

## Contesto
L'unico P1 rimasto nel simulatore ELAB: gli esperimenti LCD (come `v3-extra-lcd-hello`) richiedono C++ puro. Gli studenti che usano la modalità Scratch/Blockly non possono programmare il display LCD 16x2 perché mancano i blocchi corrispondenti.

### Architettura Scratch attuale (da rispettare — zero regressioni)
- **scratchBlocks.js**: `src/components/simulator/panels/scratchBlocks.js` — definisce blocchi Blockly con `Blockly.Blocks[...]`
- **scratchGenerator.js**: `src/components/simulator/panels/scratchGenerator.js` — genera codice C++ Arduino con `arduinoGenerator['...']`
- **ScratchEditor.jsx**: `src/components/simulator/panels/ScratchEditor.jsx` — editor con ELAB_THEME, Zelos renderer, ErrorBoundary
- **STYLES** in scratchBlocks.js: `{ BASE, IO, TIME, SERIAL, SOUND, SERVO }` — il nuovo stile LCD va aggiunto qui

### Blocchi esistenti (18 totali — NON toccare)
```
arduino_base, arduino_pin_mode, arduino_digital_write, arduino_digital_read,
arduino_analog_write, arduino_analog_read, arduino_delay, arduino_millis,
arduino_serial_begin, arduino_serial_print, arduino_tone, arduino_no_tone,
arduino_servo_attach, arduino_servo_write, arduino_servo_read,
arduino_variable_set, arduino_variable_get, arduino_random, arduino_map
```

### Esperimento LCD di riferimento
`v3-extra-lcd-hello` in `experiments-vol3.js` — usa `LiquidCrystal lcd(12, 11, 5, 10, 3, 6)` con pin RS=12, E=11, D4=5, D5=10, D6=3, D7=6. Metodi: `lcd.begin(16,2)`, `lcd.setCursor(col,row)`, `lcd.print("...")`, `lcd.clear()`.

## Task

### FASE 1 — Nuovi blocchi LCD in `scratchBlocks.js`

Aggiungi stile LCD alla mappa STYLES:
```javascript
LCD: 'arduino_lcd',  // Display LCD
```

Aggiungi 4 blocchi LCD:

1. **`arduino_lcd_init`** — Inizializza LCD
   - Input: RS pin, E pin, D4 pin, D5 pin, D6 pin, D7 pin (tutti Number, default 12,11,5,10,3,6)
   - Input: cols (default 16), rows (default 2)
   - Stile: `STYLES.LCD`
   - Tooltip: "Inizializza il display LCD con i pin specificati"

2. **`arduino_lcd_print`** — Stampa su LCD
   - Input: testo (String, value input per accettare anche variabili/espressioni)
   - Stile: `STYLES.LCD`
   - Tooltip: "Stampa testo sul display LCD"

3. **`arduino_lcd_set_cursor`** — Posiziona cursore
   - Input: colonna (Number, default 0), riga (Number, default 0)
   - Stile: `STYLES.LCD`
   - Tooltip: "Posiziona il cursore LCD alla colonna e riga specificate"

4. **`arduino_lcd_clear`** — Pulisci display
   - Nessun input
   - Stile: `STYLES.LCD`
   - Tooltip: "Pulisci il display LCD"

### FASE 2 — Generazione C++ in `scratchGenerator.js`

Per ogni blocco, genera il codice C++ corrispondente:

1. **`arduino_lcd_init`** → Aggiunge `#include <LiquidCrystal.h>` e `LiquidCrystal lcd(RS, E, D4, D5, D6, D7);` come variabili globali + `lcd.begin(cols, rows);` nel setup
2. **`arduino_lcd_print`** → `lcd.print(testo);`
3. **`arduino_lcd_set_cursor`** → `lcd.setCursor(col, row);`
4. **`arduino_lcd_clear`** → `lcd.clear();`

**ATTENZIONE** al generator per `lcd_init`: deve inserire l'include e la dichiarazione globale FUORI dal setup/loop. Verifica come gli altri blocchi (servo_attach, serial_begin) gestiscono le dichiarazioni globali in scratchGenerator.js e segui lo stesso pattern.

### FASE 3 — Registrazione categoria in `ScratchEditor.jsx`

Aggiungi la categoria LCD alla toolbox di Blockly in ScratchEditor.jsx:
- Nome: "LCD Display" (o "Display LCD")
- Blocchi: `arduino_lcd_init`, `arduino_lcd_print`, `arduino_lcd_set_cursor`, `arduino_lcd_clear`
- Colore: coerente con `ELAB_THEME.blockStyles.arduino_lcd`
- Posizione: dopo "Servo" nella toolbox

Aggiungi `arduino_lcd` a `ELAB_THEME.blockStyles` con un colore appropriato (es. `#5C6BC0` indigo — distinguibile dai colori esistenti).

### FASE 4 — scratchXml per esperimento LCD (opzionale)

Se il tempo lo permette, aggiungi campo `scratchXml` all'esperimento `v3-extra-lcd-hello` in `experiments-vol3.js` con un workspace Blockly pre-costruito che replica il codice C++ dell'esperimento:
```
lcd_init(12,11,5,10,3,6, 16,2)
lcd_set_cursor(0,0) → lcd_print("Hello World!")
lcd_set_cursor(0,1) → lcd_print("ELAB Simulator")
```

## CoV (Chain of Verification) — 8 punti

| # | Test | Cosa verificare |
|---|------|-----------------|
| 1 | `npm run build` → 0 errori | Build pulita |
| 2 | Carica esp. con Scratch tab → blocchi LCD visibili nella toolbox | Categoria LCD presente |
| 3 | Trascina `lcd_init` + `lcd_print("Hello")` → codice C++ generato corretto | Include + dichiarazione globale + begin + print |
| 4 | Trascina `lcd_set_cursor(5,1)` + `lcd_clear` → C++ corretto | setCursor + clear nel codice |
| 5 | Compila codice generato con blocchi LCD → 0 errori compilazione | Codice C++ valido |
| 6 | Blocchi esistenti (18) funzionano INVARIATI | Zero regressioni |
| 7 | Scratch tab su esperimento Vol3 AVR senza LCD → nessun blocco LCD auto-inserito | Non interferisce |
| 8 | (Se FASE 4) `v3-extra-lcd-hello` ha Scratch tab con workspace pre-costruito | XML caricato correttamente |

## Regressioni — ZERO TOLLERANZA

Prima di dichiarare completata ogni fase:
1. **Verifica tutti i 18 blocchi esistenti** — nessuno deve rompersi
2. **Verifica ScratchEditor** — tema ELAB, ErrorBoundary, lazy loading invariati
3. **Verifica side-by-side layout** — Blockly 60% + CodeEditor 40% invariato
4. **Verifica compilazione** — tutti gli esperimenti Vol3 AVR che compilavano prima devono continuare a compilare
5. **`npm run build` dopo ogni fase** — 0 errori

## Deliverables
- [ ] 4 blocchi LCD in scratchBlocks.js
- [ ] 4 generatori C++ in scratchGenerator.js
- [ ] Categoria LCD in ScratchEditor.jsx toolbox + ELAB_THEME
- [ ] (Opzionale) scratchXml per v3-extra-lcd-hello
- [ ] Skill: `.claude/skills/lcd-blockly-test.md`
- [ ] Build: 0 errori
- [ ] Deploy: Vercel production
- [ ] GitHub: commit pushed
- [ ] Report: `docs/sessions/session-111-lcd-blockly-blocks/SESSION-111-REPORT.md`
- [ ] Prompt Session 112
