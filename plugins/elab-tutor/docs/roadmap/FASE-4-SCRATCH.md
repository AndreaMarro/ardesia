# FASE 4: SCRATCH COMPLETAMENTO (S102–S103)
> Target: Scratch 10/10 mantenuto + copertura 12/12 + blocchi avanzati

## Stato Attuale
- 12/14 Vol3 esperimenti hanno Scratch tab (2 circuit-only esclusi)
- Solo 5/12 hanno `scratchSteps` guidati → **7 da completare**
- 1/12 manca `scratchXml` (morse) → **1 da creare**
- Blocchi attuali: 18 custom + standard Blockly → mancano LCD, Servo avanzato

---

## S102 — Scratch Steps per Tutti gli Esperimenti (~2h)

### Esperimenti da completare

#### v3-cap6-morse (3 steps + creare scratchXml)
1. Step 1: Blocco `digitalWrite(13, HIGH)` + `delay(200)` (punto)
2. Step 2: Aggiungere `delay(600)` per linea, `delay(400)` tra lettere
3. Step 3: Sequenza SOS completa (···—·—·—···)

#### v3-cap7-pullup (3 steps)
1. Step 1: `pinMode(2, INPUT_PULLUP)` nel Setup
2. Step 2: `digitalRead(2)` + if/else nel Loop
3. Step 3: LED si accende quando pulsante premuto

#### v3-cap7-pulsante (4 steps)
1. Step 1: Variabile `stato` + `pinMode` per pulsante e LED
2. Step 2: `digitalRead` per leggere pulsante
3. Step 3: if + toggle variabile `stato`
4. Step 4: `digitalWrite` per LED + debounce `delay(200)`

#### v3-cap7-mini (3 steps)
1. Step 1: `pinMode` per 3 pulsanti + 3 LED
2. Step 2: Primo `if(digitalRead) → digitalWrite`
3. Step 3: Tutti e 3 i pulsanti → LED corrispondenti

#### v3-cap8-pot (3 steps)
1. Step 1: `analogRead(A0)` nel Loop
2. Step 2: `Serial.println(valore)` per vedere il valore
3. Step 3: `map(valore, 0, 1023, 0, 255)` + `analogWrite` LED

#### v3-extra-lcd-hello (4 steps) — RICHIEDE nuovi blocchi LCD
1. Step 1: `lcd_init(16, 2)` nel Setup
2. Step 2: `lcd_set_cursor(0, 0)` + `lcd_print("Hello")`
3. Step 3: `lcd_set_cursor(0, 1)` + `lcd_print("World!")`
4. Step 4: `delay(2000)` + `lcd_clear` per animazione

#### v3-extra-servo-sweep (3 steps) — RICHIEDE nuovi blocchi Servo
1. Step 1: `servo_attach(9)` nel Setup
2. Step 2: for loop 0→180: `servo_write(angle)` + `delay(15)`
3. Step 3: for loop 180→0: `servo_write(angle)` + `delay(15)`

### Validazione Chrome (per ogni esperimento)
1. Caricare esperimento → Passo Passo
2. Avanzare fino a scelta Blocchi
3. Cliccare "Blocchi"
4. Avanzare tutti gli step codice
5. Compilare → ✅
6. Play → simulazione funziona

---

## S103 — Scratch Blocks + Generator Expansion (~2h)

### Nuovi Blocchi da Creare

#### LCD (4 blocchi)
```
[lcd_init] — Inizializza LCD (colonne, righe)
  → genera: `LiquidCrystal lcd(RS, EN, D4, D5, D6, D7);` + `lcd.begin(cols, rows);`

[lcd_print] — Scrivi testo su LCD
  → genera: `lcd.print("testo");`

[lcd_set_cursor] — Posiziona cursore (colonna, riga)
  → genera: `lcd.setCursor(col, row);`

[lcd_clear] — Cancella schermo LCD
  → genera: `lcd.clear();`
```

#### Servo (3 blocchi)
```
[servo_attach] — Collega servo al pin
  → genera: `Servo myServo;` (globale) + `myServo.attach(pin);` (setup)

[servo_write] — Imposta angolo (0-180)
  → genera: `myServo.write(angle);`

[servo_detach] — Scollega servo
  → genera: `myServo.detach();`
```

#### Analog (2 blocchi)
```
[analog_read] — Leggi valore analogico (pin A0-A5)
  → genera: `analogRead(pin)` (restituisce valore, usabile in espressioni)

[map_value] — Mappa valore da range a range
  → genera: `map(value, fromLow, fromHigh, toLow, toHigh)`
```

#### String/Serial (2 blocchi)
```
[serial_print_text] — Stampa testo su Serial (con/senza newline)
  → genera: `Serial.print("testo")` o `Serial.println("testo")`

[serial_print_value] — Stampa valore numerico su Serial
  → genera: `Serial.println(variabile)`
```

### File da modificare
- `src/components/simulator/panels/scratchBlocks.js` — definizioni blocchi (attuale: 310 righe)
- `src/components/simulator/panels/scratchGenerator.js` — generatori C++ (attuale: 317 righe)
- `src/components/simulator/panels/ScratchEditor.jsx` — nuove categorie nel toolbox

### Generator Quality Check
Per ogni nuovo blocco:
- [ ] Il C++ generato compila senza errori
- [ ] Includes necessari (`#include <Servo.h>`, `#include <LiquidCrystal.h>`)
- [ ] Variabili globali dichiarate correttamente (non duplicate)
- [ ] Indentazione corretta nel codice generato

### Validazione Chrome
1. Aprire Blocchi su esperimento LCD
2. Drag blocco `lcd_init` → workspace
3. Compilare → verificare C++ generato corretto
4. Play → LCD simulated mostra "Hello World"
5. Ripetere per Servo: attach → write(90) → verificare angolo visuale
