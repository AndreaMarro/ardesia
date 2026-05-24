# Deep Analysis — `v3-cap6-esp4` (Andrea 17-checkpoint)

**Sorgente**: PNG render Vol3 PDF V0.8.1 pag-pdf37 + textual + repo. Andrea NON COMPIACERMI.

---

## Identità

| Campo | Valore |
|-------|--------|
| Esp libro | ESPERIMENTO 4 — Cap.6 pin digitali Arduino |
| Pagine libro V0.8.1 | PDF pag.37 (printed page TBD) |
| Reference PNG | reference/vol3/v3-cap6-esp4/page-pdf37-37.png |
| Tipo | Arduino Nano R4 + due LED alternati (sirena polizia) |

---

## Pin assignment CONFIRMED verbatim libro V0.8.1

```
PROGRAMMA LUCI LAMPEGGIANTI STILE SIRENATO 2
Due LED: effetto "polizia"

Prova a usare:
  Colleghi:
    LED 1 → pin 8
    LED 2 → pin 9

Programma:
    uno acceso
    l'altro spento
    poi si scambiano

Risultato: luci lampeggianti stile sirena!
```

**Verbatim libro V0.8.1 = canone.** Codex adversarial review §22 era SBAGLIATO se claim diverso.

---

## Andrea 17-checkpoint

### 1. Breadboard

**Libro pdf37 visivo**:
- Orizzontale
- Half-size (~30 colonne, vs Vol2 full-size)
- Posizione: a destra dell'Arduino Nano + sotto il riquadro codice
- Rail visibili: 4 (top+ top− bot+ bot−)

**App attuale**:
- bb default half match Vol3 layout? — verify

### 2. Batteria 9V
- **N/A Vol3 esp4** — alimentazione via Arduino Nano USB
- NO batteria 9V visibile illustrazione

### 3. Arduino Nano R4 (CRITICA Vol3)

**Libro pdf37 visivo**:
- **Arduino Nano R4 breakout** illustrato grande (~30% larghezza pagina)
- Posizione: a SINISTRA della scena (vs bb destra)
- Orientamento: VERTICALE (asse lungo verticale, mostrato come fotorealistico con pin labels)
- Pin visibili labels:
  - Lato destro (visto dall'alto): D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13
  - Lato sinistro: A0, A1, A2, A3, A4, A5, 3V3, AREF, 5V, GND, RST, VIN
  - USB connector in alto

**App attuale (handoff)**:
- `NanoR4Board` SVG (file critico CircuitSolver path)
- Scale=1.8 (handoff)
- Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC (regola CLAUDE.md)
- **VERIFY**: SVG vs foto kit Omaric pixel-by-pixel match (workflow-v2 fase 5 asset-inspector mandate)

### 4. Orientamento componenti

#### 2 LED
**Libro pdf37 (illustrazione circuito)**:
- 2 LED inseriti sulla bb (zona destra)
- Orientamento verticale (gambe divaricate)
- Colori: difficili distinguere da illustration ma libro NON specifica colori esatti
- Convenzione kit Omaric Vol3 demo: probably 1 rosso + 1 blu (per effetto "polizia" sirena USA: rosso+blu)
- Posizione: ravvicinati (~5-10 colonne tra di loro)

#### 2 Resistori
**Libro pdf37**:
- 2 R in serie con LED (uno per LED)
- Default Vol3 Arduino: **220Ω** (forward bias LED 5V output Arduino, current limit)
- Orientamento: ORIZZONTALE corti (jumper-style angolare modulare Vol3)
- Bande: 220Ω = red-red-brown-gold E12

### 5. Dimensioni relative

| Componente | Libro proporzione |
|------------|-------------------|
| Arduino Nano | ~30% larghezza scena |
| Breadboard | ~40% larghezza scena |
| Codice riquadro | ~30% larghezza scena (top-right area) |
| LED + R | ~3-5% ciascuno |

### 6. Compatibilità SVG attuali

- `NanoR4Board.jsx` SVG: TBD verify proporzioni libro V0.8.1 + foto kit Omaric
- LED standard: match libro ✅ (gambe divaricate)
- R 220Ω: TBD verify orientamento orizzontale corto modulare Vol3 (vs Vol1 verticale OR Vol2 orizzontale lungo)

**Decisione P0**: SVG NanoR4Board audit vs foto Omaric kit obbligatorio Sprint D.

### 7. Numero cavi visibili libro

**Libro pdf37 illustrazione circuito**:
- Wire da pin D8 → R → LED1 anodo (1 wire pin→R + 1 wire R→LED OR singolo wire pin→R→LED visualmente continuous)
- Wire da pin D9 → R → LED2 anodo
- Wire LED1 catodo → GND
- Wire LED2 catodo → GND
- VCC + GND rail: 2 wire (5V Arduino → bb rail+, GND Arduino → bb rail−) — visibili come jumper Arduino-bb
- = **~6-8 wire visibili totali** (count esatto da illustrazione TBD)

**App attuale (handoff)**:
- Topology RESET base origin/main 4d75c0ca pre-demo
- NON pixel-perfect baked — Sprint D ribake mandatory

### 8. Colori cavi

- VCC: rosso
- GND: nero
- Signal pin → LED: colorato (giallo/orange?) jumper corto
- Catodo → GND: nero (o stesso colore segnale)

### 9. Punto partenza/arrivo libro

**Verbatim libro**: "Colleghi: LED 1 → pin 8, LED 2 → pin 9"

Pin connections:
- D8 (pin Arduino) → R1 → LED1 anodo (via bb column)
- D9 → R2 → LED2 anodo (via bb column)
- LED1 catodo → GND rail
- LED2 catodo → GND rail
- VCC Arduino 5V → bb rail+ (optional, alimentazione bb)
- GND Arduino → bb rail−

### 10. Curve cavi
- Vol3 style: **wire angolari corti modulari** (workflow-v2 fase 7 style "vol3-short-orthogonal-jumper")
- NON bezier morbide come Vol1
- Path: pin → orizzontale → 90° giù → bb foro

### 11. Angoli cavi
- 90° (modulari rigidi)

### 12. Sovrapposizioni
- Libro illustrazione: ordinata, no overlapping
- Layout compatto Arduino-bb

### 13. Compattezza
- Arduino-bb molto vicini
- Codice top-right separato (zona dedicata diversa scena)
- Componenti compatti

### 14. Compattezza su transform
- Arduino + bb come unità (anchor bb, Arduino satellite)
- TBD verify PlacementEngine behavior

### 15. Funzionamento elettrico

**Circuit**:
- pinMode(8, OUTPUT); pinMode(9, OUTPUT);
- Loop:
  - digitalWrite(8, HIGH); digitalWrite(9, LOW); delay(N);
  - digitalWrite(8, LOW); digitalWrite(9, HIGH); delay(N);
- Effetto: LED1 acceso → LED2 acceso → alternato → "sirena polizia"

**App solver + AVRBridge.js**:
- avr8js emula ATmega328p in browser
- Pin 8 = PORTB:0, Pin 9 = PORTB:1 (regola CLAUDE.md)
- digitalWrite toggles PORTB → solver propaga → LED brightness update

### 16. Coerenza codice (CRITICA Vol3)

**Libro pdf37 codice snippet visualizzato**:
```cpp
void setup() {
  pinMode(8, OUTPUT);  // LED 1
  pinMode(9, OUTPUT);  // LED 2
}

void loop() {
  digitalWrite(8, HIGH);
  digitalWrite(9, LOW);
  delay(...);  // valore delay TBD verbatim verify
  digitalWrite(8, LOW);
  digitalWrite(9, HIGH);
  delay(...);
}
```

**App lesson-path/experiments-vol3**:
- code sample TBD verify match libro verbatim
- Pin 8 + Pin 9 NON pin random

**Pin-code visual sync (workflow-v2 mandate)**:
- Quando AVRBridge emula `digitalWrite(8, HIGH)`, simulator deve evidenziare:
  - Pin D8 Arduino (highlight)
  - Wire pin8 → R1 → LED1 (highlight)
  - LED1 SVG brightness ON
- Stesso analogamente pin 9 + LED2
- TBD verify implementation `unlim.highlightPin([nano:D8])` API esiste

### 17. Classificazione P0/P1/P2

#### P0 bloccante
- **P0-1**: **Topology BAKE da zero** Sprint D — handoff esp4 RESET base
- **P0-2**: NanoR4Board SVG audit vs foto kit Omaric (workflow-v2 fase 5)
- **P0-3**: Pin assignment EXACT libro: D8 + D9 (NOT random)
- **P0-4**: Wire style "vol3-short-orthogonal-jumper" implementazione
- **P0-5**: Pin-code visual sync (digitalWrite event → highlight wire+LED)
- **P0-6**: Code sample experiments-vol3.js EXACT match libro verbatim
- **P0-7**: AVRBridge emulazione corretta loop alternato
- **P0-8**: Compile + upload flow end-to-end (n8n compiler + avr8js bridge)
- **P0-9**: Reference PNG pdf37 CAPTURED ✅

#### P1 importante
- **P1-1**: 2 LED colori diversi (rosso + blu convenzione "polizia"?)
- **P1-2**: R 220Ω bande SVG corrette
- **P1-3**: Codice IDE syntax highlighting visivo
- **P1-4**: UNLIM commentary alternanza + spiegazione pedagogica "sirena polizia"

#### P2
- P2-1: Sound effect sirena (opzionale, distracting?)
- P2-2: Animation transition LED ON/OFF morbido

## Verdetto

**NON PRONTO**. Topology RESET handoff + AVRBridge integration + NanoR4Board asset audit = Sprint D scope mandatory ribake da zero.

**Priorità Sprint D**:
1. NanoR4Board SVG vs foto Omaric verify
2. bookGeometry pixel-perfect bake LED1/LED2/Arduino/bb pose
3. Wire angolare corto modulare implementation
4. Pin-code visual sync via __ELAB_API.unlim.highlightPin events
5. Code sample experiments-vol3.js verbatim libro
6. avr8js end-to-end loop alternato funzionante
7. UNLIM commentary
