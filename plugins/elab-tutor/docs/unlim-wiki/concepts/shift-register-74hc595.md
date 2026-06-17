---
id: shift-register-74hc595
type: concept
title: "74HC595 — shift register 8-bit per espansione pin"
locale: it
volume_ref: 3
pagina_ref: 120
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [74hc595, shift-register, espansione-pin, matrice-led, 7-segmenti, vol3]
---

## Definizione

Il 74HC595 è un **shift register seriale-parallelo 8-bit**: riceve dati 1 bit alla volta da Arduino su un pin, e li distribuisce su 8 uscite parallele.

Vol. 3 pag. 120 introduce: "Con 3 pin Arduino il 74HC595 controlla 8 LED. Concatenando più chip controlli 16, 24, 32... Quasi infinite uscite con pochi pin".

**Caso d'uso tipico**: Arduino Nano ha solo 14 pin digitali. Con 1 chip 74HC595 → 8 uscite extra. Con 4 chip in cascata → 32 uscite (matrice LED 4×8 o 8 display 7-segmenti).

## Pinout 74HC595 (DIP-16)

| Pin | Nome | Funzione |
|-----|------|----------|
| 1-7 | QB-QH | Output 1-7 (bit 1-7) |
| 8 | GND | Massa |
| 9 | QH' | Serial out (per cascata) |
| 10 | MR | Master Reset (active LOW, pull HIGH a Vcc) |
| 11 | SH_CP | Shift Clock (serial clock, da Arduino) |
| 12 | ST_CP | Storage/Latch Clock (latch, da Arduino) |
| 13 | OE | Output Enable (active LOW, pull a GND) |
| 14 | DS | Serial Data Input (da Arduino) |
| 15 | QA | Output 0 (bit 0) |
| 16 | Vcc | 5 V |

## Schema collegamento (Vol. 3 pag. 120)

```
Arduino     74HC595
  pin 11 ──→ DS (14)    Serial data
  pin 12 ──→ ST_CP (12) Latch clock
  pin 13 ──→ SH_CP (11) Shift clock
   GND  ──→ GND (8)
   GND  ──→ OE (13)     Enable always
   +5V  ──→ MR (10)     No reset
   +5V  ──→ Vcc (16)
```

8 LED su QA-QH (con resistenze 470Ω in serie).

## Codice Arduino — accendere pattern

Arduino ha `shiftOut()` integrata:
```cpp
const int PIN_DATA = 11;
const int PIN_LATCH = 12;
const int PIN_CLOCK = 13;

void setup() {
  pinMode(PIN_DATA, OUTPUT);
  pinMode(PIN_LATCH, OUTPUT);
  pinMode(PIN_CLOCK, OUTPUT);
}

void scriviPattern(byte valore) {
  digitalWrite(PIN_LATCH, LOW);                   // sblocca latch
  shiftOut(PIN_DATA, PIN_CLOCK, MSBFIRST, valore); // invia 8 bit
  digitalWrite(PIN_LATCH, HIGH);                   // chiudi latch (output appare)
}

void loop() {
  scriviPattern(0b10101010);   // LED dispari accesi
  delay(500);
  scriviPattern(0b01010101);   // LED pari accesi
  delay(500);
}
```

`MSBFIRST` invia bit 7 per primo (LED QH); `LSBFIRST` inverso. Vol. 3 pag. 120 raccomanda MSBFIRST per leggibilità (pattern binario letto da sinistra).

## Cascata di shift register (espansione)

Per 16 LED: 2 chip 74HC595 in cascata.
```
Arduino → DS chip1 → QH' chip1 → DS chip2 → QH' chip2 (libero)
            ↓                       ↓
          8 LED                   8 LED
```

Codice:
```cpp
digitalWrite(PIN_LATCH, LOW);
shiftOut(PIN_DATA, PIN_CLOCK, MSBFIRST, byteAlto);  // 8 bit per chip2 (esce per QH', va a chip1)
shiftOut(PIN_DATA, PIN_CLOCK, MSBFIRST, byteBasso); // 8 bit per chip1
digitalWrite(PIN_LATCH, HIGH);  // entrambi i chip latch insieme
```

Latch comune: tutti i chip mostrano output simultaneo → no flickering visibile.

## Esempio matrice LED 8×8

Vol. 3 pag. 125: matrice 8 righe × 8 colonne via 2 chip 74HC595 (1 per righe, 1 per colonne) con multiplexing.

```cpp
const byte PATTERN[8] = {0b00111100, 0b01000010, ... };  // bitmap

void disegnaMatrice() {
  for (int riga = 0; riga < 8; riga++) {
    digitalWrite(PIN_LATCH, LOW);
    shiftOut(PIN_DATA, PIN_CLOCK, MSBFIRST, PATTERN[riga]);  // colonne
    shiftOut(PIN_DATA, PIN_CLOCK, MSBFIRST, 1 << riga);      // riga attiva (1 sola)
    digitalWrite(PIN_LATCH, HIGH);
    delayMicroseconds(500);  // 60 Hz refresh = 1/60s / 8 righe = ~2 ms
  }
}

void loop() {
  disegnaMatrice();  // chiama in continuazione per refresh
}
```

Persistenza retinica fa apparire matrice fissa, anche se solo 1 riga è accesa per volta.

## Errori comuni

1. **Dimenticare il latch** — Senza `digitalWrite(LATCH, HIGH)`, l'output NON aggiorna. Sintomo: LED non cambiano. Sempre LOW prima, HIGH dopo `shiftOut`.

2. **OE pin floating** — Pin 13 OE deve essere a GND (output sempre abilitato) o controllato da Arduino. Se floating, output indeterminato.

3. **MR (Master Reset) non a Vcc** — Pin 10 MR deve essere HIGH. Se LOW (default), il chip è in reset → tutti output LOW.

4. **Resistenze LED mancanti** — Ogni LED collegato a uscita 74HC595 richiede resistenza 470Ω (corrente max 35 mA per uscita, ma tipico ≤ 25 mA). Senza resistenza → LED bruciato.

5. **Velocità shiftOut limitata** — `shiftOut` software è ~3 µs per bit = 24 µs per byte. Per refresh > 1 kHz preferire SPI hardware (Arduino MOSI/SCK) ~10× più veloce.

## Esperimenti correlati

- **Vol. 3 pag. 120** — Primo 74HC595: 8 LED contatore binario
- **Vol. 3 pag. 122** — Cascata 2 chip → 16 LED
- **Vol. 3 pag. 125** — Matrice LED 8×8 con multiplexing
- **Vol. 3 pag. 128** — Display 4-cifre 7-segmenti

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 120):
> "Con 3 pin Arduino il 74HC595 controlla 8 LED. Concatenando più chip controlli 16, 24, 32... Quasi infinite uscite con pochi pin."

**Cosa fare:**
- Vol. 3 pag. 120 raccomanda di insegnare 74HC595 DOPO ragazzi padroneggiano operatori bit-wise (vedi `bit-byte.md`) e shift `<<`/`>>`
- Mostrate empiricamente la limitazione: senza shift register, controllare 8 LED richiede 8 pin Arduino. Con 74HC595, solo 3 pin → libera 5 pin per altri scopi
- Disegnate sulla LIM "treno di vagoni" (cascata): ogni chip è un vagone, dati passano da un vagone all'altro
- Esempio iconico: contatore binario 0-255 visualizzato su 8 LED — ragazzi capiscono visivamente cosa fa il chip

**Sicurezza:**
- 74HC595 è robusto. Limite assoluto Vcc 7V. Sopra → distrugge.
- LED corrente max per output: 35 mA assoluti, 25 mA continuativi raccomandati. NON pilotare motori/relè direttamente da uscite — usare driver come ULN2803.

**Cosa NON fare:**
- Non insegnate 74HC595 prima del cap matrice LED + bit-wise
- Non collegate output direttamente a carichi induttivi (motori, relè) — distrugge il chip senza diodo flyback
- Non aspettatevi velocità SPI da `shiftOut()` software — è bit-banging, lento. Per high-speed usare SPI nativo

## Link L1 (raw RAG queries)

- `"74HC595 shift register Arduino"`
- `"shiftOut MSBFIRST LSBFIRST"`
- `"matrice LED 8x8 multiplexing"`
- `"cascata shift register 16 LED"`
- `"espansione pin Arduino chip"`
