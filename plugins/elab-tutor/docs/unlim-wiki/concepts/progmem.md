---
id: progmem
type: concept
title: "PROGMEM — memorizzare dati nella flash anziché in RAM"
locale: it
volume_ref: 3
pagina_ref: 105
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [progmem, flash, memoria, sram, ottimizzazione, vol3, avanzato]
---

## Definizione

`PROGMEM` è una direttiva Arduino che memorizza dati **nella memoria Flash** (32 KB su Nano) anziché nella SRAM (2 KB). Vol. 3 pag. 105 introduce: "PROGMEM è il magazzino dove mettiamo le cose che non cambiano mai — testi, tabelle, immagini di matrici LED — per liberare la SRAM per le variabili che cambiano".

Memoria Arduino Nano ATmega328P:
| Tipo | Dimensione | Volatile | Modificabile runtime |
|------|-----------|----------|----------------------|
| Flash (PROGMEM) | 32 KB | NO | NO (read-only) |
| SRAM (variabili) | 2 KB | SÌ | SÌ |
| EEPROM | 1 KB | NO | SÌ (limitata cicli) |

## Sintassi base

```cpp
#include <avr/pgmspace.h>

// Memorizza in flash (read-only)
const char messaggio[] PROGMEM = "Ciao ragazzi, oggi parliamo di Arduino";

// Lettura dalla flash a SRAM (necessaria)
char buffer[60];
strcpy_P(buffer, messaggio);  // copia da PROGMEM a SRAM
Serial.println(buffer);
```

**ATTENZIONE**: i dati PROGMEM non si possono leggere come variabili normali. Vanno **letti con funzioni speciali** (`pgm_read_byte`, `pgm_read_word`, `strcpy_P`, `pgm_read_float`).

## Quando usare PROGMEM

**SÌ** — usare PROGMEM per:
- Stringhe testo lunghe (messaggi tutorial, prompt UNLIM)
- Tabelle di lookup (note musicali, sequenze pattern matrice LED)
- Frasi multilingua
- Array di costanti (mapping pin, frequenze note)

**NO** — non usare PROGMEM per:
- Variabili che cambiano (servono SRAM)
- Dati < 50 bytes (overhead pgmspace non vale la pena)
- Dati che leggi >100 volte/secondo (lettura PROGMEM lenta)

## Esempio Vol. 3 — frasi tutorial

```cpp
const char frase1[] PROGMEM = "Ragazzi, oggi accendiamo un LED.";
const char frase2[] PROGMEM = "Prendete una resistenza da 470 Ohm.";
const char frase3[] PROGMEM = "Collegate il LED in serie alla resistenza.";

const char* const frasi[] PROGMEM = {frase1, frase2, frase3};

void mostraFrase(int idx) {
  char buffer[80];
  strcpy_P(buffer, (PGM_P)pgm_read_word(&frasi[idx]));
  Serial.println(buffer);
}

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    mostraFrase(i);
    delay(2000);
  }
}
```

**Risparmio**: senza PROGMEM, 3 frasi × ~50 chars = 150 byte SRAM (7% del totale!). Con PROGMEM, occupano 0 byte SRAM.

## Esempio matrice LED 8×8 (Vol. 3 pag. 108)

Pattern bitmap memorizzato in flash:
```cpp
const byte cuore[8] PROGMEM = {
  0b01100110,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
  0b00111100,
  0b00011000,
  0b00000000
};

void disegnaCuore() {
  for (int riga = 0; riga < 8; riga++) {
    byte pattern = pgm_read_byte(&cuore[riga]);
    // ...invia pattern alla matrice via shift register
  }
}
```

8 pattern bitmap diversi = 64 byte. Senza PROGMEM = 64 byte di SRAM. Con PROGMEM = 0 byte SRAM.

## Funzioni di lettura PROGMEM

| Funzione | Tipo letto | Uso |
|----------|-----------|-----|
| `pgm_read_byte(addr)` | 1 byte | byte, bool, char |
| `pgm_read_word(addr)` | 2 byte | int, short |
| `pgm_read_dword(addr)` | 4 byte | long, int32 |
| `pgm_read_float(addr)` | 4 byte | float |
| `strcpy_P(dest, src)` | stringa | copia C-string |
| `strlen_P(src)` | length | lunghezza C-string |
| `strcmp_P(s1, s2)` | confronto | confronto stringhe |

## Errori comuni

1. **Leggere PROGMEM come variabile normale** — `Serial.println(messaggio);` con `messaggio` in PROGMEM stampa **garbage**. Usare `strcpy_P(buffer, messaggio); Serial.println(buffer);`.

2. **Buffer SRAM troppo piccolo** — `char buffer[20]; strcpy_P(buffer, frase50chars);` overflow + corruzione. Sempre buffer ≥ lunghezza max + 1 (terminatore '\0').

3. **Modificare PROGMEM runtime** — `messaggio[0] = 'X';` non compila o crash runtime. PROGMEM è read-only. Per dati modificabili usare SRAM o EEPROM.

4. **Dimenticare `#include <avr/pgmspace.h>`** — Compilazione fallisce con "PROGMEM not declared". Sempre include all'inizio.

5. **Scrivere stringa locale al pgm_read_word di array di puntatori** — Pattern complesso `pgm_read_word(&array[i])` ritorna l'ADDRESS della stringa in flash, non la stringa stessa. Serve un secondo `strcpy_P` per ottenere il contenuto.

## Risparmio realistico

Sketch tipico con 10 frasi tutorial × 80 chars = **800 byte**:
- Senza PROGMEM: 800 byte SRAM occupati (40% del totale 2 KB!)
- Con PROGMEM: 0 byte SRAM (frasi in flash)

Differenza pratica: il primo crash al limite di SRAM, il secondo gira con margine.

## Esperimenti correlati

- **Vol. 3 pag. 105** — Primo PROGMEM: messaggi tutorial in flash
- **Vol. 3 pag. 108** — Matrice LED 8×8 con pattern bitmap PROGMEM
- **Vol. 3 pag. 112** — Tabella lookup frequenze note (libreria `pitches.h`)
- **Vol. 3 pag. 115** — Multilingua: messaggi italiano + inglese in flash

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 105):
> "PROGMEM è il magazzino dove mettiamo le cose che non cambiano mai — testi, tabelle, immagini di matrici LED — per liberare la SRAM per le variabili che cambiano."

**Cosa fare:**
- PROGMEM è **avanzato** Vol. 3 — adatto a ragazzi che hanno fatto sketch lunghi e visto SRAM finita
- Mostrate empiricamente: sketch con 10 frasi normali → out-of-memory crash. Stesso sketch con PROGMEM → gira liscio. Lezione visiva potente
- Vol. 3 pag. 105 raccomanda di insegnare DOPO array (richiede comprensione di indirizzi) e DOPO `pinMode/digitalWrite` (basics)
- Disegnate sulla LIM "magazzino" (PROGMEM, grande ma leggi-solo) vs "scrivania" (SRAM, piccolo ma flessibile). Analogia operativa

**Sicurezza:**
- PROGMEM non corrompe dati (read-only). Sicuro per dati statici importanti
- Confondere puntatori PROGMEM/SRAM può causare crash o dati casuali. Verificare con strumenti di debug Serial

**Cosa NON fare:**
- Non usate PROGMEM per dati < 50 byte — overhead pgm_read non vale la pena
- Non scrivete codice "premature optimization" con PROGMEM ovunque — solo dove SRAM si avvicina ai 2 KB
- Non insegnate `__attribute__((progmem))` o sintassi ASM avanzate — solo `PROGMEM` macro

## Link L1 (raw RAG queries)

- `"PROGMEM Arduino flash memoria"`
- `"strcpy_P pgm_read_byte"`
- `"matrice LED bitmap PROGMEM"`
- `"risparmio SRAM Arduino testo lungo"`
- `"avr/pgmspace.h include"`
