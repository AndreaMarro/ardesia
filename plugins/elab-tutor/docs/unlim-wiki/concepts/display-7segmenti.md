---
id: display-7segmenti
type: concept
title: "Display 7-segmenti — visualizzare cifre con 7 LED"
locale: it
volume_ref: 3
pagina_ref: 138
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [7segmenti, display, multiplex, cifre, vol3]
---

## Definizione

Il **display 7-segmenti** è composto da 7 LED disposti a formare le cifre 0-9. Vol. 3 pag. 138 introduce: "ogni cifra del display è in realtà 7 piccoli LED che si accendono insieme per disegnare il numero. Saperli pilotare insieme = visualizzare numeri".

Layout segmenti:
```
   aaa
  f   b
  f   b
   ggg
  e   c
  e   c
   ddd  dp
```

Per cifra `8` accendere a+b+c+d+e+f+g.
Per cifra `1` solo b+c.

## Tipi: anodo comune (CC) vs catodo comune (CA)

| Tipo | Pin comune | Logica accensione | Comune kit ELAB |
|------|------------|-------------------|-----------------|
| Catodo comune (CC) | catodo→GND | segmento HIGH = acceso | sì (più comune) |
| Anodo comune (CA) | anodo→VCC | segmento LOW = acceso | meno comune |

Vol. 3 pag. 138 raccomanda CC per primo apprendimento (logica più intuitiva HIGH=acceso).

## Schema 1 cifra CC

```
Arduino → R 220Ω → segmento a
Arduino → R 220Ω → segmento b
... (7 LED, 7 resistenze)
catodo comune ────────→ GND
```

7 pin Arduino + 7 resistenze 220Ω + 1 GND. Display singolo "consuma" 7 pin (oltre 1 punto decimale opzionale).

## Tabella codifica binaria 0-9

```cpp
const byte CIFRE[10] = {
  // gfedcba (gfedcba bit, 0 = LSB = a)
  0b00111111,  // 0: a+b+c+d+e+f
  0b00000110,  // 1: b+c
  0b01011011,  // 2: a+b+d+e+g
  0b01001111,  // 3: a+b+c+d+g
  0b01100110,  // 4: b+c+f+g
  0b01101101,  // 5: a+c+d+f+g
  0b01111101,  // 6: a+c+d+e+f+g
  0b00000111,  // 7: a+b+c
  0b01111111,  // 8: tutti
  0b01101111,  // 9: a+b+c+d+f+g
};
```

## Codice Arduino — visualizzare cifra

```cpp
const int PIN_SEGMENTI[7] = {2, 3, 4, 5, 6, 7, 8};
// indice: 0=a, 1=b, 2=c, 3=d, 4=e, 5=f, 6=g

void setup() {
  for (int i = 0; i < 7; i++) pinMode(PIN_SEGMENTI[i], OUTPUT);
}

void mostraCifra(int n) {
  if (n < 0 || n > 9) return;
  byte pattern = CIFRE[n];
  for (int seg = 0; seg < 7; seg++) {
    bool acceso = (pattern >> seg) & 1;
    digitalWrite(PIN_SEGMENTI[seg], acceso);  // CC: HIGH = acceso
  }
}

void loop() {
  for (int i = 0; i <= 9; i++) {
    mostraCifra(i);
    delay(1000);
  }
}
```

## Multipli display — multiplexing

Per visualizzare 4 cifre (es. 1234), Arduino non ha 28 pin liberi. Soluzione: **multiplexing**.

Si accende una cifra alla volta velocissimo (>60 Hz), e l'occhio percepisce tutto contemporaneo (persistenza retinica).

```cpp
const int PIN_SEGMENTI[7] = {2, 3, 4, 5, 6, 7, 8};
const int PIN_DIGIT[4] = {9, 10, 11, 12};  // catodo comune di ogni display
int valoriDisplay[4] = {1, 2, 3, 4};

void setup() {
  for (int i = 0; i < 7; i++) pinMode(PIN_SEGMENTI[i], OUTPUT);
  for (int i = 0; i < 4; i++) {
    pinMode(PIN_DIGIT[i], OUTPUT);
    digitalWrite(PIN_DIGIT[i], HIGH);  // disabilitato a HIGH (CC)
  }
}

void loop() {
  for (int d = 0; d < 4; d++) {
    digitalWrite(PIN_DIGIT[d], LOW);  // abilita questa cifra
    mostraCifra(valoriDisplay[d]);
    delayMicroseconds(2000);          // 2 ms × 4 = 8 ms = 125 Hz refresh
    digitalWrite(PIN_DIGIT[d], HIGH); // disabilita
  }
}
```

Vol. 3 pag. 142 raccomanda 60-120 Hz refresh — sotto, sfarfallio visibile.

## Pin compression con 74HC595

Per ridurre pin Arduino: usare shift register (vedi `shift-register-74hc595.md`).

```
Arduino 3 pin → 74HC595 → 8 segmenti display
```

Aggiungendo 4 cifre con multiplex: 3 pin (74HC595 segmenti) + 4 pin (digit selector) = **7 pin totali** per 4 cifre.

## Errori comuni

1. **Resistenza segmento mancante** — Senza R 220Ω, ogni segmento riceve troppa corrente (>50 mA), pin Arduino brucia + LED degrada. SEMPRE 220Ω o 470Ω per segmento.

2. **Confondere CC con CA** — Programma con logica CC su display CA → tutti i segmenti restano accesi (logica invertita). Sintomo: display mostra "8" sempre.

3. **Multiplexing senza dela** — `delayMicroseconds()` mancante → Arduino "spara" troppo velocemente, pin non hanno tempo di stabilizzarsi. Sintomo: cifre fuse insieme.

4. **Pin digit lasciato attivo durante cambio segmenti** — Se accendete segmenti per cifra B prima di disabilitare cifra A, cifra A mostra brevemente cifra B sbagliata. Sequenza corretta: disable digit→ change segments → enable digit.

5. **dp (decimal point) dimenticato** — Punto decimale è 8° pin del display. Per cifre con virgola (es. "12.5") gestire bit dp separatamente.

## Esperimenti correlati

- **Vol. 3 pag. 138** — Primo display 7-segmenti: contatore 0-9 ogni secondo
- **Vol. 3 pag. 142** — 4 cifre multiplex: orologio HH:MM
- **Vol. 3 pag. 145** — Display + 74HC595: economia di pin
- **Vol. 3 pag. 148** — Termometro digitale (TMP36 + 7-seg)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 138):
> "Ogni cifra del display è in realtà 7 piccoli LED che si accendono insieme per disegnare il numero. Saperli pilotare insieme = visualizzare numeri."

**Cosa fare:**
- Vol. 3 pag. 138 raccomanda di insegnare 7-seg DOPO array + bit-wise (vedi `array-arduino.md` + `bit-byte.md`)
- Mostrate fisicamente: accendete UN solo segmento alla volta (es. solo `a`). Ragazzi vedono che la "linea superiore" è UN LED. Poi accendete più segmenti per disegnare cifre
- Disegnate sulla LIM la mappa segmenti a-g e fate ai ragazzi disegnare a mano i pattern delle cifre
- Multiplexing è concetto avanzato — Vol. 3 raccomanda di insegnarlo SOLO dopo che ragazzi padroneggiano singolo display

**Sicurezza:**
- Ogni segmento richiede R 220Ω. Senza → bruciore garantito.
- Multiplexing con frequenza < 60 Hz può causare disagio (sfarfallio visibile, alcuni ragazzi sensibili a flicker)

**Cosa NON fare:**
- Non usate display 7-seg senza resistenze — anche se "funziona" senza, brucia LED in giorni
- Non aspettatevi luminosità uguale tra display singolo e multiplex (multiplex riduce luminosità per duty cycle 25% per 4 cifre)
- Non insegnate multiplex prima di array + bit-wise + delayMicroseconds — concetti dipendenti

## Link L1 (raw RAG queries)

- `"display 7 segmenti Arduino"`
- `"catodo comune anodo comune"`
- `"multiplexing 4 cifre 7-seg"`
- `"persistenza retinica display"`
- `"74HC595 pin compression display"`
