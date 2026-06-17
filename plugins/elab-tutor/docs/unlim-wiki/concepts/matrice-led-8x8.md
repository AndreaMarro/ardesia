---
id: matrice-led-8x8
type: concept
title: "Matrice LED 8x8"
locale: it
volume_ref: 3
pagina_ref: 134
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe-opus
tags: [matrice-led, 8x8, max7219, multiplexing, animazioni, capstone]
---

## Definizione

Matrice LED 8x8 — display 64 LED organizzati in 8 righe × 8 colonne, controllati via driver MAX7219 (16-pin DIP) che gestisce multiplexing automatico. Permette animazioni, scritte scorrevoli, icone, giochi. Capstone Vol.3.

## Analogia per la classe

Ragazzi, immaginate uno stadio di calcio: ci sono 64 tifosi seduti in 8 file da 8. Per fare la "ola" non serve dirlo a tutti insieme — basta accendere una fila alla volta velocissima. Occhio nostro non vede stacco, vede onda continua. La matrice LED fa così: accende riga per riga 1000 volte al secondo, sembrano tutti accesi insieme.

## Pinout MAX7219

| Pin Driver | Nome | Connessione Arduino |
|------------|------|---------------------|
| DIN  (1)   | Data In   | D11 (MOSI) |
| LOAD (12)  | Chip Sel  | D10 (SS)   |
| CLK  (13)  | Clock     | D13 (SCK)  |
| VCC  (19)  | +5V       | 5V         |
| GND  (4,9) | Ground    | GND        |

NOTA: matrice si collega al MAX7219 tramite 16 pin allineati (8 righe + 8 colonne).

## Codice base (libreria LedControl)

```cpp
#include <LedControl.h>
LedControl lc = LedControl(11, 13, 10, 1);  // DIN, CLK, CS, n_devices

void setup() {
  lc.shutdown(0, false);     // wake up
  lc.setIntensity(0, 8);     // luminosità 0-15
  lc.clearDisplay(0);
}

void loop() {
  // accende cuore animato
  byte cuore[8] = {
    B01100110, B11111111, B11111111, B11111111,
    B01111110, B00111100, B00011000, B00000000
  };
  for (int r = 0; r < 8; r++) lc.setRow(0, r, cuore[r]);
}
```

## Errori comuni

- Display tutto acceso e fisso → MAX7219 in shutdown, manca `lc.shutdown(0, false)`
- Solo metà display funziona → connessioni saldature MAX7219 (16 pin allineati, controllare 8 colonne)
- Lampeggia solo una riga → loop blocca, manca refresh multiplexing (libreria gestisce automaticamente, verificare DIN/CLK/CS)
- Brillantezza eccessiva consuma corrente → `setIntensity` <= 8 per uso prolungato (max 15 brucia LED rapidamente)

## Esperimenti correlati

- Vedi Capitolo: `v3-cap-matrice-led-cuore-pulsante` (Vol.3 pag.134)
- Vedi Capitolo: `v3-cap-matrice-led-scritta-scorrevole` (Vol.3 pag.142)
- File: `src/data/capitoli/v3-cap-matrice-led-cuore-pulsante.json`

## Concetti correlati

- [shift-register-74hc595.md](shift-register-74hc595.md) — alternativa multiplexing
- [pwm.md](pwm.md) — luminosità intensity
- [for-loop.md](for-loop.md) — iterazione righe
- [array-arduino.md](array-arduino.md) — pattern bitmap byte[8]

## PRINCIPIO ZERO

Quando spiegate questo concetto alla classe:
- Parlate in plurale ("Vediamo insieme la matrice", "Provate a disegnare un cuore")
- Citate il volume di riferimento (Vol.3 pag.134 — capstone)
- Max 60 parole + 1 analogia concreta (stadio + ola)
- NO comandi diretti al docente — guida silenziosa
- Punto del libro: "i ragazzi vedono il cuore pulsare ed esultano"
