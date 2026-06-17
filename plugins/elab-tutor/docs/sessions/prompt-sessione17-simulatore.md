# PROMPT SESSION 17 — SIMULATORE DEEP AUDIT

## OBIETTIVO
Audit completo del simulatore ELAB: verificare che ogni componente funzioni come un sistema fisico reale, che i pin combacino geometricamente sulla breadboard, che il NanoBreakout sia davvero collegato, che "Monta Tu" funzioni da zero in ogni esperimento, e che connessioni errate NON funzionino.

## FILOSOFIA
**NON si lavora per singoli esperimenti.** Il sistema deve basarsi su una LOGICA DI COMPONENTI che tra loro funzionano:
- **LOGICAMENTE**: circuito solver corretto (Union-Find → KCL/MNA)
- **FISICAMENTE**: pin reali con corrispondenza corretta (anode/cathode, VCC/GND)
- **GEOMETRICAMENTE**: ogni pin deve cadere ESATTAMENTE su un foro della breadboard

---

## DOVE TROVARE LE INFORMAZIONI

### Architettura Simulatore
| File | Cosa contiene | Righe |
|------|--------------|-------|
| `src/components/simulator/components/registry.js` | Registry componenti (registerComponent/getComponent/getPinDefinitions) | ~100 |
| `src/components/simulator/utils/pinComponentMap.js` | Union-Find pin mapping (Arduino → breadboard → componenti) | 198 |
| `src/components/simulator/engine/CircuitSolver.js` | Solver circuitale (Union-Find + KCL/MNA analysis) | ~400 |
| `src/components/simulator/canvas/WireRenderer.jsx` | Routing fili con snap breadboard | ~300 |
| `src/components/simulator/NewElabSimulator.jsx` | Orchestratore master | 2,686 |

### Componenti SVG (tutti in `src/components/simulator/components/`)
| File | Componente | Pin Names | Pin Spacing |
|------|-----------|-----------|-------------|
| `Led.jsx` | LED | anode, cathode | 7.5px (allineato) |
| `RgbLed.jsx` | **RGB LED** | **red(x=-4), common(x=-1,y=24), green(x=2), blue(x=5)** | **NON ALLINEATO — FIX NECESSARIO** |
| `Resistor.jsx` | Resistore | lead1, lead2 | 52.5px (7 colonne) |
| `Capacitor.jsx` | Condensatore | positive, negative | verificare |
| `Potentiometer.jsx` | Potenziometro | vcc, signal, gnd | verificare |
| `Buzzer.jsx` | Buzzer | positive, negative | verificare |
| `Motor.jsx` | Motore DC | positive, negative | verificare |
| `Button.jsx` | Pulsante | pin1a, pin1b, pin2a, pin2b | verificare |
| `Switch.jsx` | Interruttore | pin1, common, pin2 | verificare |
| `Diode.jsx` | Diodo | anode, cathode | verificare |
| `LDR.jsx` | Fotoresistenza | pin1, pin2 | verificare |
| `Thermistor.jsx` | Termistore | pin1, pin2 | verificare |
| `IRSensor.jsx` | Sensore IR | vcc, out, gnd | verificare |
| `PIRSensor.jsx` | Sensore PIR | vcc, out, gnd | verificare |
| `UltrasonicSensor.jsx` | Ultrasonico | vcc, trig, echo, gnd | verificare |
| `SevenSegment.jsx` | 7-segmenti | a-g, dp, common | verificare |
| `Multimeter.jsx` | Multimetro | probe-positive, probe-negative | verificare |
| `ServoMotor.jsx` | Servo | signal, vcc, gnd | verificare |
| `LCD.jsx` | Display LCD | verificare | verificare |
| `Relay.jsx` | Relè | coil+, coil-, NO, NC, COM | verificare |
| `NanoR4Board.jsx` | Arduino Nano | TOP_PINS, BOTTOM_PINS, WING_PINS | PIN_PITCH=4.572 |

### Breadboard
| File | Parametro | Valore |
|------|----------|--------|
| `BreadboardFull.jsx` | ROWS | 63 |
| `BreadboardFull.jsx` | COLS_PER_SIDE | 5 (a-e top, f-j bottom) |
| `BreadboardFull.jsx` | HOLE_SPACING | 7.5px |
| `BreadboardFull.jsx` | GAP (IC channel) | 10px |
| `BreadboardFull.jsx` | Bus naming | `bus-bot-plus/minus` NOT `bus-bottom-plus/minus` |

### NanoBreakout
| File | Parametro | Valore |
|------|----------|--------|
| `NanoR4Board.jsx` | SCALE | 1.8 |
| `NanoR4Board.jsx` | PIN_PITCH | 4.572 SVG units (= 2.54mm × 1.8) |
| `NanoR4Board.jsx` | Pin groups | TOP_PINS (D2-D13), BOTTOM_PINS (A0-A7, GND, 5V, 3.3V, RST), WING_PINS |
| MEMORY.md | Orientamento | Semicircle LEFT, Wing RIGHT. MUST sit ON breadboard |

### Dati Esperimenti
| File | Contenuto | Esperimenti |
|------|----------|-------------|
| `src/data/experiments-vol1.js` | Volume 1 | 38 (Cap. 6-14), 6,329 righe |
| `src/data/experiments-vol2.js` | Volume 2 | 18 (Cap. 6-12), 3,086 righe |
| `src/data/experiments-vol3.js` | Volume 3 | 13 (Cap. 6-8 + extras), 1,725 righe |
| `src/data/experiments-index.js` | Aggregatore | 121 righe |

### Monta Tu
| File | Ruolo |
|------|-------|
| `src/components/simulator/panels/BuildModeGuide.jsx` | UI step-by-step (266 righe) |
| `src/components/simulator/panels/ExperimentPicker.jsx` | Toggle "Già montato" / "Monta tu!" |
| `NewElabSimulator.jsx` | Gating visibilità componenti via `buildStepIndex` |

### Test
| File | Tipo |
|------|------|
| `src/data/__tests__/experiments.test.js` | 93 test su struttura dati esperimenti |

---

## PROBLEMI NOTI DA CORREGGERE

### P0 — RGB LED Pin Alignment
I pin del LED RGB NON sono allineati alla griglia breadboard:
- `red: x=-4, y=22`
- `common: x=-1, y=24` (lead più lungo!)
- `green: x=2, y=22`
- `blue: x=5, y=22`

Spacing tra pin: 3, 3, 3 SVG units. La breadboard ha `HOLE_SPACING=7.5px`.
**Il LED RGB deve avere pin distanziati di 7.5px** (o multipli) per cadere sui fori della breadboard.

Confronto con LED standard: `anode(x=-3.75), cathode(x=3.75)` = 7.5px. CORRETTO.

### P1 — NanoBreakout Connessione Breadboard
Il NanoBreakout deve:
1. Sedersi FISICAMENTE sulla breadboard (non floating)
2. I pin devono cadere sui fori della breadboard
3. Le connessioni dei pin devono propagarsi nel circuito solver via Union-Find
4. Verificare che `PIN_PITCH=4.572` corrisponda a `HOLE_SPACING=7.5px` — POTREBBE NON COMBACIARE

### P2 — Monta Tu End-to-End
Verificare per OGNI esperimento che:
1. Partendo da "Monta Tu" (board vuota)
2. Ogni buildStep aggiunga il componente corretto
3. I fili si colleghino ai pin giusti
4. Alla fine il circuito funzioni (LED si accende, buzzer suona, etc.)

### P3 — Connessioni Errate
Verificare che:
1. Collegare un LED al contrario NON lo accenda
2. Mettere resistenza sbagliata cambi il risultato
3. Pin non collegati = circuito aperto

### P4 — v1-cap13-esp2
Manca `pinAssignments` — unico esperimento su 69 con questo difetto.

---

## PROCEDURA DI AUDIT

### Fase 1: Verifica Geometrica (PRIMA di tutto)
Per OGNI tipo di componente SVG:
1. Leggere il file `.jsx`
2. Estrarre le coordinate dei pin
3. Calcolare lo spacing tra pin
4. Verificare che spacing sia multiplo di `HOLE_SPACING=7.5px`
5. Se NON allineato → **FIX IMMEDIATO**

### Fase 2: Verifica NanoBreakout
1. Leggere `NanoR4Board.jsx` in dettaglio
2. Verificare che `PIN_PITCH × n = HOLE_SPACING × m` per qualche n,m intero
3. Verificare posizionamento su breadboard
4. Testare con Chrome che il NanoBreakout sia realmente ON the breadboard
5. Verificare che i pin del Nano corrispondano ai fori della breadboard nella UI

### Fase 3: Verifica Esperimenti (UNO PER UNO — NO PARALLELO)
Per ciascuno dei 69 esperimenti, in Chrome:
1. Navigare all'esperimento
2. Selezionare "Monta Tu"
3. Seguire OGNI buildStep
4. Verificare che il circuito finale funzioni
5. **Screenshot** dello stato finale
6. Annotare qualsiasi problema

ORDINE: Vol1 Cap.6 → Vol1 Cap.14 → Vol2 Cap.6 → Vol2 Cap.12 → Vol3 Cap.6 → Vol3 Cap.8

### Fase 4: Test Connessioni Errate
Per almeno 5 esperimenti chiave:
1. Invertire la polarità del LED
2. Staccare un filo critico
3. Verificare che il circuito NON funzioni
4. Screenshot

### Fase 5: Circuit Solver Validation
1. Leggere `CircuitSolver.js` in dettaglio
2. Verificare la logica Union-Find
3. Testare net building con esperimento semplice (1 LED + 1 resistenza)
4. Tracciare il percorso: pin Arduino → breadboard row → filo → componente → GND

---

## CRITERI DI SUCCESSO

| Criterio | Pass | Fail |
|----------|------|------|
| Tutti i componenti hanno pin allineati alla griglia 7.5px | Pin spacing = n × 7.5 per tutti | Anche 1 componente disallineato |
| NanoBreakout ON breadboard | Pin cadono sui fori | Qualsiasi pin non sui fori |
| Monta Tu funziona in tutti 69 esperimenti | 69/69 completabili da zero | Anche 1 fallimento |
| Connessioni errate non funzionano | LED invertito = spento | LED invertito = acceso |
| Circuit Solver corretto | Net building tracciabile | Cortocircuiti o circuiti aperti errati |

---

## ACCOUNT PER TEST
| Role | Email | Password |
|------|-------|----------|
| Admin | `debug@test.com` | `Xk9#mL2!nR4` |

## URL
- Tutor: https://elab-builder.vercel.app
- Sito: https://funny-pika-3d1029.netlify.app

## DEPLOY
- Vercel: `cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes`
- Netlify: `cd "VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13`

---

## NOTE IMPORTANTI
1. **NON lavorare in parallelo sugli esperimenti** — verificare UNO ALLA VOLTA con screenshot
2. Il sistema deve funzionare per LOGICA DI COMPONENTI, non per hardcoding di singoli esperimenti
3. Se un pin non combacia → fix il COMPONENTE, non l'esperimento
4. Consultare `memory/MEMORY.md` per pin name map e decisioni architetturali
5. Consultare `memory/report-sessione16.md` per stato attuale e bug noti
