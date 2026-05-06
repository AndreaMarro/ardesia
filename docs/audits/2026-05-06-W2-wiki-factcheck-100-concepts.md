# Audit W2 — Fact-check Wiki UNLIM concepts vs canonical Vol/pag

**Data:** 2026-05-06
**Iter:** 44 / W2
**Scope:** 126 wiki concepts in `docs/unlim-wiki/concepts/*.md` cross-referenced contro `src/data/volume-references.js` (canonical chapter→pag mapping) + `automa/state/tea-glossario-180.json` (180 termini Tea).
**Read-only:** SI — questo audit non modifica nessun file wiki.

---

## TL;DR

- **Concept totali:** 126 (CLAUDE.md claim era 100/100 + 26 nuovi MM1 = 126 → CONFERMATO).
- **Glossario Tea:** 180 termini in `automa/state/tea-glossario-180.json` (Web vetrina mostra 61 visibili, 30+30+. file locale 180).
- **Citazioni Vol/pag totali:** 295 su 126 concept.
- **MATCH:** 107 (36.3%)
- **TOLERATED** (vol giusto, pag in range cap diverso): 24 (8.1%)
- **UNVERIFIABLE** (concept fuori volumi ELAB / general_knowledge): 111 (37.6%)
- **MISMATCH** (errore citazione): 53 (18.0%)

**Concept declared `general_knowledge_only` o evidentemente fuori-volume:** 54
**Concept senza citazioni Vol/pag:** 2

## Verdict per concept

| Verdict | Count | Significato |
|---|---|---|
| GENERAL_KNOWLEDGE | 54 | Concept fuori volumi ELAB (sensori esterni, advanced) — non verificabile |
| OK | 42 | Tutte le citazioni MATCH (o miste MATCH/TOLERATED) |
| BROKEN | 14 | Tutte le citazioni MISMATCH — concept da riscrivere |
| PARTIAL | 14 | Mix MATCH + MISMATCH — concept da correggere puntualmente |
| NO_CITATIONS | 2 | Nessuna citazione Vol/pag nel testo |

---

## Issue critica #1 — Pagine fabricate (out-of-bounds)

**10 concept citano pagine che NON ESISTONO in nessun volume** (Vol1=114pp, Vol2=117pp, Vol3=95pp).
Si tratta di **allucinazioni dell'LLM batch** Mac Mini — pagine inventate con numeri plausibili ma fuori range.

| Concept | Citazioni fabricate |
|---|---|
| `arduino-port` | Vol.3 pag.130, Vol.3 pag.135, Vol.3 pag.140, Vol.3 pag.145 |
| `array-arduino` | Vol.3 pag.100, Vol.3 pag.105 |
| `bjt-saturation` | Vol.2 pag.138, Vol.2 pag.142, Vol.2 pag.148, Vol.2 pag.152 |
| `bjt-thermal` | Vol.2 pag.138, Vol.2 pag.142, Vol.2 pag.148 |
| `funzioni-arduino` | Vol.3 pag.110, Vol.3 pag.113, Vol.3 pag.115, Vol.3 pag.120 |
| `if-else` | Vol.3 pag.102 |
| `map-constrain` | Vol.3 pag.98, Vol.3 pag.102, Vol.3 pag.105 |
| `millis-vs-delay` | Vol.3 pag.100 |
| `random-arduino` | Vol.3 pag.115, Vol.3 pag.118, Vol.3 pag.122, Vol.3 pag.125 |
| `while-loop` | Vol.3 pag.100 |

**Recommendation P0:** questi 10 concept vanno riscritti URGENTEMENTE. Le pagine non esistono.

---

## Top 15 worst offenders (mismatches)

| # | Concept | Verdict | Mismatch | Match | % errore |
|---|---|---|---|---|---|
| 1 | `allarme` | BROKEN | 4 | 0 | 100% |
| 2 | `arduino-port` | BROKEN | 4 | 0 | 100% |
| 3 | `bjt-saturation` | BROKEN | 4 | 0 | 100% |
| 4 | `funzioni-arduino` | BROKEN | 4 | 0 | 100% |
| 5 | `random-arduino` | BROKEN | 4 | 0 | 100% |
| 6 | `bjt-thermal` | BROKEN | 3 | 0 | 100% |
| 7 | `zener` | BROKEN | 3 | 0 | 100% |
| 8 | `map-constrain` | PARTIAL | 3 | 1 | 75% |
| 9 | `loop-arduino` | PARTIAL | 2 | 2 | 50% |
| 10 | `array-arduino` | PARTIAL | 2 | 3 | 40% |
| 11 | `delay-millis` | PARTIAL | 2 | 3 | 40% |
| 12 | `millis-vs-delay` | PARTIAL | 2 | 3 | 40% |
| 13 | `analog-write` | BROKEN | 1 | 0 | 100% |
| 14 | `comunicazione-seriale-uart` | BROKEN | 1 | 0 | 100% |
| 15 | `diodo` | BROKEN | 1 | 0 | 100% |

---

## Tabella completa — 126 concept

| Concept | FM Vol | FM Pag | Status | Citations | M | X | T | U | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| `allarme` | 1 | 97 | - | 4 | - | 4 | - | - | BROKEN |
| `arduino-port` | 3 | 130 | - | 4 | - | 4 | - | - | BROKEN |
| `bjt-saturation` | 2 | 138 | - | 4 | - | 4 | - | - | BROKEN |
| `funzioni-arduino` | 3 | 110 | - | 4 | - | 4 | - | - | BROKEN |
| `random-arduino` | 3 | 115 | - | 4 | - | 4 | - | - | BROKEN |
| `bjt-thermal` | 2 | 142 | - | 3 | - | 3 | - | - | BROKEN |
| `zener` | 2 | 105 | - | 3 | - | 3 | - | - | BROKEN |
| `analog-write` | 3 | 89 | - | 1 | - | 1 | - | - | BROKEN |
| `comunicazione-seriale-uart` | 3 | 75 | - | 2 | - | 1 | 1 | - | BROKEN |
| `diodo` | 2 | 103 | - | 1 | - | 1 | - | - | BROKEN |
| `if-else` | 3 | 102 | - | 1 | - | 1 | - | - | BROKEN |
| `pin-analogici` | 3 | 63 | - | 1 | - | 1 | - | - | BROKEN |
| `pull-up-pulldown` | 1 | 78 | - | 2 | - | 1 | 1 | - | BROKEN |
| `resistenza` | 1 | 35 | - | 3 | - | 1 | 2 | - | BROKEN |
| `accelerometro-mpu6050` | 3 | 185 | - | 5 | - | - | - | 5 | GENERAL_KNOWLEDGE |
| `arduino-loop` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `arduino-setup` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `bit-byte` | 3 | 35 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `bluetooth-hc05` | 3 | 195 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `breadboard-bus` | null | null | general_knowledge_only | 3 | - | - | - | 3 | GENERAL_KNOWLEDGE |
| `buzzer-active` | null | null | general_knowledge_only | 2 | - | - | - | 2 | GENERAL_KNOWLEDGE |
| `buzzer-passive` | null | null | general_knowledge_only | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `condensatore-ceramico` | null | null | general_knowledge_only | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `cronometro` | 3 | - | - | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `display-7segmenti` | 3 | 138 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `eeprom` | 3 | 100 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `encoder-rotativo` | 3 | 175 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `fototransistor` | 2 | 85 | - | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `fusibile` | 2 | - | - | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `gps-neo6m` | 3 | 260 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `hc-sr04` | 3 | 130 | - | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `i2c` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `i2c-spi` | 3 | 145 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `infrarosso` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `joystick-2axis` | 3 | 155 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `keypad-matrix` | 3 | 215 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `kirchhoff-current` | null | null | general_knowledge_only | 2 | - | - | - | 2 | GENERAL_KNOWLEDGE |
| `lcd-display` | 3 | null | - | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `lcd16x2` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `ldr` | null | null | general_knowledge_only | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `lm35` | null | null | general_knowledge_only | 3 | - | - | - | 3 | GENERAL_KNOWLEDGE |
| `matrice-led-8x8` | 3 | 134 | - | 2 | - | - | - | 2 | GENERAL_KNOWLEDGE |
| `mosfet` | 2 | 109 | - | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `motor-dc` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `motor-driver-l298n` | 3 | 205 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `ohm-law` | null | null | general_knowledge_only | 5 | - | - | - | 5 | GENERAL_KNOWLEDGE |
| `oscilloscopio` | - | - | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `potentiometer` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `progmem` | 3 | 105 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `pull-up-resistor` | null | null | general_knowledge_only | 2 | - | - | - | 2 | GENERAL_KNOWLEDGE |
| `push-button` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `rele` | 2 | 84 | - | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `rfid-mfrc522` | 3 | 270 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `rgb-led` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `sd-card-spi` | 3 | 245 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `sensore-pir` | 3 | 165 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `series-parallel` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `servo` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `servo-motor` | 3 | null | - | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `shift-register-74hc595` | 3 | 120 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `spdt-switch` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `spi` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `stepper-motor` | 3 | 230 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `tmp36` | 3 | 92 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `transistor-bjt` | null | null | general_knowledge_only | 0 | - | - | - | - | GENERAL_KNOWLEDGE |
| `ultrasonic-hcsr04` | 3 | 130 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `voltage-divider` | null | null | general_knowledge_only | 1 | - | - | - | 1 | GENERAL_KNOWLEDGE |
| `zener-fail` | 2 | 112 | - | 4 | - | - | - | 4 | GENERAL_KNOWLEDGE |
| `corrente-alternata` | 1 | - | - | 0 | - | - | - | - | NO_CITATIONS |
| `semaforo` | 3 | - | - | 0 | - | - | - | - | NO_CITATIONS |
| `amperometro` | 1 | 25 | - | 4 | 3 | - | 1 | - | OK |
| `analog-read` | 3 | 77 | - | 5 | 5 | - | - | - | OK |
| `arduino` | 3 | 37 | - | 1 | 1 | - | - | - | OK |
| `arduino-power` | 3 | 22 | - | 4 | 4 | - | - | - | OK |
| `batteria-9v` | 1 | 25 | - | 1 | 1 | - | - | - | OK |
| `blink` | 3 | 47 | - | 1 | 1 | - | - | - | OK |
| `blink-led` | 3 | 47 | - | 4 | 4 | - | - | - | OK |
| `breadboard` | 1 | 21 | - | 1 | 1 | - | - | - | OK |
| `capacitor` | 2 | 63 | - | 1 | 1 | - | - | - | OK |
| `cicalino` | 1 | 93 | - | 1 | 1 | - | - | - | OK |
| `circuito-chiuso` | 1 | 27 | - | 1 | 1 | - | - | - | OK |
| `condensatore` | 2 | 63 | - | 1 | 1 | - | - | - | OK |
| `corrente` | 1 | 9 | - | 1 | 1 | - | - | - | OK |
| `corrente-continua` | 1 | 9 | - | 4 | 3 | - | 1 | - | OK |
| `debounce` | 2 | 55 | - | 2 | - | - | 2 | - | OK |
| `digital-read` | 3 | 63 | - | 3 | 3 | - | - | - | OK |
| `digital-write` | 3 | 47 | - | 5 | 5 | - | - | - | OK |
| `diode` | 1 | 27 | - | 1 | - | - | 1 | - | OK |
| `elettropongo` | 1 | 103 | - | 1 | 1 | - | - | - | OK |
| `fade-led` | 2 | 40 | - | 1 | - | - | 1 | - | OK |
| `for-loop` | 3 | 67 | - | 3 | 3 | - | - | - | OK |
| `fotoresistore` | 1 | 81 | - | 1 | 1 | - | - | - | OK |
| `ground` | 1 | 18 | - | 4 | 3 | - | 1 | - | OK |
| `ground-massa` | 1 | 18 | - | 4 | 2 | - | 2 | - | OK |
| `interrupt` | 3 | 92 | - | 1 | - | - | 1 | - | OK |
| `interruttore-magnetico` | 1 | 97 | - | 1 | 1 | - | - | - | OK |
| `led` | 1 | 27 | - | 2 | 1 | - | 1 | - | OK |
| `led-giallo` | 2 | 59 | - | 4 | 1 | - | 3 | - | OK |
| `led-rgb` | 1 | 35 | - | 1 | 1 | - | - | - | OK |
| `motore-dc` | 2 | 93 | - | 1 | 1 | - | - | - | OK |
| `multimetro` | 2 | 13 | - | 1 | 1 | - | - | - | OK |
| `pin-digitali` | 3 | 53 | - | 1 | 1 | - | - | - | OK |
| `polarita` | 1 | 25 | - | 1 | 1 | - | - | - | OK |
| `potenziometro` | 1 | 57 | - | 1 | 1 | - | - | - | OK |
| `pulsante` | 1 | 43 | - | 1 | 1 | - | - | - | OK |
| `pwm` | 2 | 40 | - | 2 | - | - | 2 | - | OK |
| `serial-monitor` | 3 | 75 | - | 1 | 1 | - | - | - | OK |
| `serial-print` | 3 | 75 | - | 3 | 3 | - | - | - | OK |
| `tensione` | 1 | 9 | - | 1 | 1 | - | - | - | OK |
| `transistor` | 2 | 75 | - | 1 | 1 | - | - | - | OK |
| `variabili-arduino` | 3 | 63 | - | 4 | 4 | - | - | - | OK |
| `voltmetro` | 1 | 22 | - | 3 | 2 | - | 1 | - | OK |
| `map-constrain` | 3 | 95 | - | 4 | 1 | 3 | - | - | PARTIAL |
| `array-arduino` | 3 | 78 | - | 5 | 3 | 2 | - | - | PARTIAL |
| `delay-millis` | 3 | 47 | - | 5 | 3 | 2 | - | - | PARTIAL |
| `loop-arduino` | 3 | 47 | - | 4 | 2 | 2 | - | - | PARTIAL |
| `millis-vs-delay` | 3 | 85 | - | 5 | 3 | 2 | - | - | PARTIAL |
| `circuito-aperto` | 1 | 28 | - | 5 | 3 | 1 | 1 | - | PARTIAL |
| `cortocircuito` | 1 | 32 | - | 4 | 3 | 1 | - | - | PARTIAL |
| `divisore-tensione` | 2 | 45 | - | 3 | 1 | 1 | 1 | - | PARTIAL |
| `legge-ohm` | 1 | 45 | - | 4 | 2 | 1 | 1 | - | PARTIAL |
| `ohm` | 1 | 35 | - | 4 | 3 | 1 | - | - | PARTIAL |
| `pin-mode` | 3 | 47 | - | 5 | 4 | 1 | - | - | PARTIAL |
| `string-arduino` | 3 | 82 | - | 5 | 4 | 1 | - | - | PARTIAL |
| `tone-notone` | 3 | 50 | - | 4 | 3 | 1 | - | - | PARTIAL |
| `while-loop` | 3 | 70 | - | 5 | 4 | 1 | - | - | PARTIAL |

---

## Dettaglio citazioni per concept BROKEN o PARTIAL

### `allarme` — BROKEN (mismatch=4, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 82 | MISMATCH | Vol.1 pag.82 fuori range atteso [(107, 114)] |
| 1 | 94 | MISMATCH | Vol.1 pag.94 fuori range atteso [(107, 114)] |
| 1 | 97 | MISMATCH | Vol.1 pag.97 fuori range atteso [(107, 114)] |
| 1 | 98 | MISMATCH | Vol.1 pag.98 fuori range atteso [(107, 114)] |

### `arduino-port` — BROKEN (mismatch=4, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 130 | MISMATCH | pag.130 fuori range Vol.3 (1–95) |
| 3 | 135 | MISMATCH | pag.135 fuori range Vol.3 (1–95) |
| 3 | 140 | MISMATCH | pag.140 fuori range Vol.3 (1–95) |
| 3 | 145 | MISMATCH | pag.145 fuori range Vol.3 (1–95) |

### `bjt-saturation` — BROKEN (mismatch=4, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 2 | 138 | MISMATCH | pag.138 fuori range Vol.2 (1–117) |
| 2 | 142 | MISMATCH | pag.142 fuori range Vol.2 (1–117) |
| 2 | 148 | MISMATCH | pag.148 fuori range Vol.2 (1–117) |
| 2 | 152 | MISMATCH | pag.152 fuori range Vol.2 (1–117) |

### `funzioni-arduino` — BROKEN (mismatch=4, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 110 | MISMATCH | pag.110 fuori range Vol.3 (1–95) |
| 3 | 113 | MISMATCH | pag.113 fuori range Vol.3 (1–95) |
| 3 | 115 | MISMATCH | pag.115 fuori range Vol.3 (1–95) |
| 3 | 120 | MISMATCH | pag.120 fuori range Vol.3 (1–95) |

### `random-arduino` — BROKEN (mismatch=4, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 115 | MISMATCH | pag.115 fuori range Vol.3 (1–95) |
| 3 | 118 | MISMATCH | pag.118 fuori range Vol.3 (1–95) |
| 3 | 122 | MISMATCH | pag.122 fuori range Vol.3 (1–95) |
| 3 | 125 | MISMATCH | pag.125 fuori range Vol.3 (1–95) |

### `bjt-thermal` — BROKEN (mismatch=3, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 2 | 138 | MISMATCH | pag.138 fuori range Vol.2 (1–117) |
| 2 | 142 | MISMATCH | pag.142 fuori range Vol.2 (1–117) |
| 2 | 148 | MISMATCH | pag.148 fuori range Vol.2 (1–117) |

### `map-constrain` — PARTIAL (mismatch=3, match=1)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 95 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.95 |
| 3 | 98 | MISMATCH | pag.98 fuori range Vol.3 (1–95) |
| 3 | 102 | MISMATCH | pag.102 fuori range Vol.3 (1–95) |
| 3 | 105 | MISMATCH | pag.105 fuori range Vol.3 (1–95) |

### `zener` — BROKEN (mismatch=3, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 2 | 105 | MISMATCH | Vol.2 pag.105 fuori range atteso [(53, 84)] |
| 2 | 108 | MISMATCH | Vol.2 pag.108 fuori range atteso [(53, 84)] |
| 2 | 112 | MISMATCH | Vol.2 pag.112 fuori range atteso [(53, 84)] |

### `array-arduino` — PARTIAL (mismatch=2, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 78 | MATCH | Vol.3 cap.8 "I Pin Analogici" pag.78 |
| 3 | 80 | MATCH | Vol.3 cap.8 "I Pin Analogici" pag.80 |
| 3 | 82 | MATCH | Vol.3 cap.8 "I Pin Analogici" pag.82 |
| 3 | 100 | MISMATCH | pag.100 fuori range Vol.3 (1–95) |
| 3 | 105 | MISMATCH | pag.105 fuori range Vol.3 (1–95) |

### `delay-millis` — PARTIAL (mismatch=2, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 47 | MISMATCH | Vol.3 pag.47 fuori range atteso [(53, 95)] |
| 3 | 49 | MISMATCH | Vol.3 pag.49 fuori range atteso [(53, 95)] |
| 3 | 57 | MATCH | Vol.3 cap.6 "I Pin Digitali: Le Dita di Arduino" pag.57 |
| 3 | 68 | MATCH | Vol.3 cap.7 "I Pin di Input: Arduino Ascolta e Decide" pag.68 |
| 3 | 77 | MATCH | Vol.3 cap.8 "I Pin Analogici" pag.77 |

### `loop-arduino` — PARTIAL (mismatch=2, match=2)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 47 | MATCH | Vol.3 cap.5 "Come è fatto un programma Arduino?" pag.47 |
| 3 | 49 | MATCH | Vol.3 cap.5 "Come è fatto un programma Arduino?" pag.49 |
| 3 | 58 | MISMATCH | Vol.3 pag.58 fuori range atteso [(47, 52)] |
| 3 | 90 | MISMATCH | Vol.3 pag.90 fuori range atteso [(47, 52)] |

### `millis-vs-delay` — PARTIAL (mismatch=2, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 1 | MISMATCH | Vol.3 pag.1 fuori range atteso [(53, 95)] |
| 3 | 85 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.85 |
| 3 | 88 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.88 |
| 3 | 95 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.95 |
| 3 | 100 | MISMATCH | pag.100 fuori range Vol.3 (1–95) |

### `analog-write` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 89 | MISMATCH | Vol.3 pag.89 fuori range atteso [(53, 84)] |

### `circuito-aperto` — PARTIAL (mismatch=1, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 27 | MATCH | Vol.1 cap.6 "Cos'è il diodo LED?" pag.27 |
| 1 | 28 | MATCH | Vol.1 cap.6 "Cos'è il diodo LED?" pag.28 |
| 1 | 35 | MATCH | Vol.1 cap.7 "Cos'è il LED RGB?" pag.35 |
| 2 | 8 | MISMATCH | atteso Vol.1, citato Vol.2 pag.8 |
| 3 | 75 | TOLERATED | Vol.3 cap.8 "I Pin Analogici" (atteso Vol.1) |

### `comunicazione-seriale-uart` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 2 | 55 | TOLERATED | Vol.2 cap.6 "Approfondiamo i LED" (atteso Vol.3) |
| 3 | 75 | MISMATCH | Vol.3 pag.75 fuori range atteso [(85, 95)] |

### `cortocircuito` — PARTIAL (mismatch=1, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 27 | MATCH | Vol.1 cap.6 "Cos'è il diodo LED?" pag.27 |
| 1 | 32 | MATCH | Vol.1 cap.6 "Cos'è il diodo LED?" pag.32 |
| 1 | 45 | MATCH | Vol.1 cap.8 "Cos'è un pulsante?" pag.45 |
| 2 | 8 | MISMATCH | atteso Vol.1, citato Vol.2 pag.8 |

### `diodo` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 2 | 103 | MISMATCH | Vol.2 pag.103 fuori range atteso [(53, 84)] |

### `divisore-tensione` — PARTIAL (mismatch=1, match=1)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 82 | TOLERATED | Vol.1 cap.10 "Cos'è un fotoresistore?" (atteso Vol.2) |
| 2 | 28 | MISMATCH | Vol.2 pag.28 fuori range atteso [(37, 46)] |
| 2 | 45 | MATCH | Vol.2 cap.4 "Approfondiamo le Resistenze" pag.45 |

### `if-else` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 102 | MISMATCH | pag.102 fuori range Vol.3 (1–95) |

### `legge-ohm` — PARTIAL (mismatch=1, match=2)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 45 | MATCH | Vol.1 cap.8 "Cos'è un pulsante?" pag.45 |
| 1 | 50 | MATCH | Vol.1 cap.8 "Cos'è un pulsante?" pag.50 |
| 2 | 8 | MISMATCH | atteso Vol.1, citato Vol.2 pag.8 |
| 2 | 30 | TOLERATED | Vol.2 cap.3 "Il Multimetro" (atteso Vol.1) |

### `ohm` — PARTIAL (mismatch=1, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 27 | MATCH | Vol.1 cap.6 "Cos'è il diodo LED?" pag.27 |
| 1 | 35 | MATCH | Vol.1 cap.7 "Cos'è il LED RGB?" pag.35 |
| 1 | 45 | MATCH | Vol.1 cap.8 "Cos'è un pulsante?" pag.45 |
| 2 | 8 | MISMATCH | atteso Vol.1, citato Vol.2 pag.8 |

### `pin-analogici` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 63 | MISMATCH | Vol.3 pag.63 fuori range atteso [(75, 84)] |

### `pin-mode` — PARTIAL (mismatch=1, match=4)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 47 | MATCH | Vol.3 cap.5 "Come è fatto un programma Arduino?" pag.47 |
| 3 | 53 | MATCH | Vol.3 cap.6 "I Pin Digitali: Le Dita di Arduino" pag.53 |
| 3 | 63 | MATCH | Vol.3 cap.7 "I Pin di Input: Arduino Ascolta e Decide" pag.63 |
| 3 | 65 | MATCH | Vol.3 cap.7 "I Pin di Input: Arduino Ascolta e Decide" pag.65 |
| 3 | 75 | MISMATCH | Vol.3 pag.75 fuori range atteso [(47, 74)] |

### `pull-up-pulldown` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 78 | TOLERATED | Vol.1 cap.9 "Cos'è un potenziometro?" (atteso Vol.2) |
| 3 | 45 | MISMATCH | atteso Vol.2, citato Vol.3 pag.45 |

### `resistenza` — BROKEN (mismatch=1, match=0)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 1 | 35 | TOLERATED | Vol.1 cap.7 "Cos'è il LED RGB?" (atteso Vol.2) |
| 1 | 50 | TOLERATED | Vol.1 cap.8 "Cos'è un pulsante?" (atteso Vol.2) |
| 2 | 8 | MISMATCH | Vol.2 pag.8 fuori range atteso [(37, 46)] |

### `string-arduino` — PARTIAL (mismatch=1, match=4)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 1 | MISMATCH | Vol.3 pag.1 fuori range atteso [(47, 95)] |
| 3 | 82 | MATCH | Vol.3 cap.8 "I Pin Analogici" pag.82 |
| 3 | 84 | MATCH | Vol.3 cap.8 "I Pin Analogici" pag.84 |
| 3 | 87 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.87 |
| 3 | 90 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.90 |

### `tone-notone` — PARTIAL (mismatch=1, match=3)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 50 | MISMATCH | Vol.3 pag.50 fuori range atteso [(53, 95)] |
| 3 | 53 | MATCH | Vol.3 cap.6 "I Pin Digitali: Le Dita di Arduino" pag.53 |
| 3 | 55 | MATCH | Vol.3 cap.6 "I Pin Digitali: Le Dita di Arduino" pag.55 |
| 3 | 60 | MATCH | Vol.3 cap.6 "I Pin Digitali: Le Dita di Arduino" pag.60 |

### `while-loop` — PARTIAL (mismatch=1, match=4)

| Vol | Pag | Status | Detail |
|---|---|---|---|
| 3 | 67 | MATCH | Vol.3 cap.7 "I Pin di Input: Arduino Ascolta e Decide" pag.67 |
| 3 | 70 | MATCH | Vol.3 cap.7 "I Pin di Input: Arduino Ascolta e Decide" pag.70 |
| 3 | 73 | MATCH | Vol.3 cap.7 "I Pin di Input: Arduino Ascolta e Decide" pag.73 |
| 3 | 95 | MATCH | Vol.3 cap.9 "Comunicazione Seriale" pag.95 |
| 3 | 100 | MISMATCH | pag.100 fuori range Vol.3 (1–95) |

---

## Methodology

### Canonical sources used

1. **`src/data/volume-references.js`** (1254 righe, 23 capitoli mappati): per ogni concept, il chapter→start_page è autorevole. Capitoli end_page calcolati come `next_chapter_start - 1` o `volume_total_pages`.
   - Vol.1 = 114 pp (Cap 6-14)
   - Vol.2 = 117 pp (Cap 3-12)
   - Vol.3 = 95 pp  (Cap 5-9)

2. **`automa/state/tea-glossario-180.json`** (180 termini, vol+cap+title+technical+kids): usato per associare term→capitolo dove `volume-references.js` non copre (es. concept narrativi pre-Cap 6 V1).

3. **`https://elab-tutor-glossario.vercel.app/glossario`**: consultato via WebFetch, mostra 30 di 61 termini visibili (SPA paginata) — NON espone numeri di pagina, solo termini Vol.1. Per questo audit usato il file locale 180-terms più completo.

### Decision tree per ogni citazione

```
Per ogni "Vol.X pag.Y" trovato nel concept:
  1. Vol fuori {1,2,3}                       → MISMATCH
  2. pag fuori range volume (1..VOL_PAGES)   → MISMATCH (FABRICATED)
  3. Concept in GENERAL_KNOWLEDGE / fm_status=general_knowledge_only → UNVERIFIABLE
  4. Concept in TOPIC_MAP:
     - Vol giusto + pag in expected_range    → MATCH
     - Vol giusto + pag fuori range          → MISMATCH
     - Vol diverso ma chapter trovato        → TOLERATED
  5. Concept fuori TOPIC_MAP                 → UNVERIFIABLE
```

### Limiti onesti dell'audit

- **TOPIC_MAP è LLM-built** (questa sessione, ~70 concepts mappati): un concept marcato MISMATCH potrebbe essere legittimo se la mappa è troppo restrittiva. La categoria TOLERATED mitiga questo.
- **No PDF binary check**: non sono stati aperti i PDF originali in `tmp/vol1-tresjolie.txt` (file mancante). La verifica è basata su `volume-references.js` come single source of truth — se quel file ha errori, l'audit li propaga.
- **Glossario web non espone pag**: i numeri di pagina canonici provengono SOLO da `volume-references.js`, non dal glossario Tea. Il glossario è stato usato solo per validare l'associazione term→capitolo.
- **Concept "narrativi" pre-Cap 6 V1**: tensione, corrente, ohm, batteria hanno range esteso (1-50) perché non sono mappati come capitolo singolo in `volume-references.js`. False positive possibili.

---

## Recommendations

### P0 — Riscrittura URGENTE (prossima iter)

I 10 concept con **pagine fabricate out-of-bounds** vanno riscritti in via prioritaria. Sono allucinazioni LLM — è impossibile che siano vere perché i volumi non hanno tante pagine:

- `docs/unlim-wiki/concepts/arduino-port.md`
- `docs/unlim-wiki/concepts/array-arduino.md`
- `docs/unlim-wiki/concepts/bjt-saturation.md`
- `docs/unlim-wiki/concepts/bjt-thermal.md`
- `docs/unlim-wiki/concepts/funzioni-arduino.md`
- `docs/unlim-wiki/concepts/if-else.md`
- `docs/unlim-wiki/concepts/map-constrain.md`
- `docs/unlim-wiki/concepts/millis-vs-delay.md`
- `docs/unlim-wiki/concepts/random-arduino.md`
- `docs/unlim-wiki/concepts/while-loop.md`

### P1 — Correzione mirata (1-2 iter successive)

- `allarme` (BROKEN, mm=4, m=0)
- `zener` (BROKEN, mm=3, m=0)
- `delay-millis` (PARTIAL, mm=2, m=3)
- `loop-arduino` (PARTIAL, mm=2, m=2)
- `analog-write` (BROKEN, mm=1, m=0)
- `circuito-aperto` (PARTIAL, mm=1, m=3)
- `comunicazione-seriale-uart` (BROKEN, mm=1, m=0)
- `cortocircuito` (PARTIAL, mm=1, m=3)
- `diodo` (BROKEN, mm=1, m=0)
- `divisore-tensione` (PARTIAL, mm=1, m=1)
- `legge-ohm` (PARTIAL, mm=1, m=2)
- `ohm` (PARTIAL, mm=1, m=3)
- `pin-analogici` (BROKEN, mm=1, m=0)
- `pin-mode` (PARTIAL, mm=1, m=4)
- `pull-up-pulldown` (BROKEN, mm=1, m=0)
- `resistenza` (BROKEN, mm=1, m=0)
- `string-arduino` (PARTIAL, mm=1, m=4)
- `tone-notone` (PARTIAL, mm=1, m=3)

### P2 — Considerare

- Aggiungere campo `source_status: general_knowledge_only` ai 25+ concept "advanced sensors" che oggi non lo hanno (gps-neo6m, accelerometro-mpu6050, rfid-mfrc522, ecc.) — in modo che lint possa skip-arli senza false MISMATCH.
- Aggiungere check pre-commit `scripts/wiki-lint.mjs` (citato in SCHEMA.md ma non ancora creato) che enforce rule "Vol/pag in range" automaticamente.
- Creare mapping canonico `term → vol+cap+pag_start` per ognuno dei 180 termini Tea, da usare come single source of truth per Lint.

---

## Anti-inflation honesty (G45 lesson)

- Audit **automatico** su 295 citazioni in 126 concept — nessun cherry-picking.
- TOPIC_MAP costruita in questa stessa sessione: **possibile bias** verso "expected ranges" troppo stretti. La metrica "MISMATCH" potrebbe essere sovrastimata; la metrica "MATCH" no (matching strict). La metrica "out-of-bounds page" è invece **rock-solid**: i volumi fisici hanno N pagine, sopra è impossibile.
- **Score audit affidabile sulle 10 concept fabbricate.** Per le altre 50+ MISMATCH serve review manuale Tea/Davide per confermare che le pagine canoniche siano davvero quelle attese.
- **NON ho aperto i PDF originali.** L'audit si fida di `volume-references.js`. Se quel file ha errori, questo audit li propaga.

## Output files

- Questo report: `docs/audits/2026-05-06-W2-wiki-factcheck-100-concepts.md`
- Raw data JSON: `/tmp/wiki_factcheck_data.json` (per re-render programmatico)
- Script audit: `/tmp/wiki_factcheck.py` (re-runnabile)
