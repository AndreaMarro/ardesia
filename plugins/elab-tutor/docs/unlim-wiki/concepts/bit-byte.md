---
id: bit-byte
type: concept
title: "Bit e Byte — unità di informazione digitale"
locale: it
volume_ref: 3
pagina_ref: 35
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [bit, byte, binario, digitale, dati, fondamentali, vol3]
---

## Definizione

Un **bit** è la più piccola unità di informazione digitale: vale **0 o 1** (acceso/spento, vero/falso, alto/basso).

Un **byte** è un gruppo di **8 bit** consecutivi. Vale 0-255 in decimale, 0x00-0xFF in esadecimale.

Vol. 3 pag. 35 introduce: "Tutto quello che Arduino fa è in realtà accendere e spegnere bit. Il byte è il primo "blocco" che permette di rappresentare numeri, lettere, e comandi".

## Tabella corrispondenze

| Bit | Decimale | Binario | Hex | Uso |
|-----|----------|---------|-----|-----|
| 1 bit | 0-1 | 0, 1 | 0x0-0x1 | digitalWrite stato |
| 4 bit (nibble) | 0-15 | 0000-1111 | 0x0-0xF | colore LED RGB componente |
| 8 bit (byte) | 0-255 | 00000000-11111111 | 0x00-0xFF | analogWrite PWM, lettura ADC byte |
| 10 bit | 0-1023 | — | — | ADC analogRead Arduino |
| 16 bit (int) | -32768 a 32767 | — | — | int Arduino UNO/Nano |
| 32 bit (long) | -2.1G a 2.1G | — | — | long, millis() return |

## Notazione binaria Arduino

Arduino IDE accetta:
```cpp
byte x = 42;            // decimale
byte x = 0b00101010;    // binario (prefisso 0b)
byte x = 0x2A;          // esadecimale (prefisso 0x)
byte x = '*';           // ASCII char (42 = asterisco)
```

Tutti questi valori sono identici. Vol. 3 pag. 35 raccomanda binario per pattern visivi (matrice LED), hex per registers, decimale per il resto.

## Operazioni bit-wise

Vol. 3 pag. 38 introduce:

| Operatore | Significato | Esempio |
|-----------|-------------|---------|
| `&` | AND | `0b1100 & 0b1010 = 0b1000` |
| `\|` | OR | `0b1100 \| 0b1010 = 0b1110` |
| `^` | XOR | `0b1100 ^ 0b1010 = 0b0110` |
| `~` | NOT | `~0b1100 = 0b...0011` (estende a int) |
| `<<` | Shift sinistra | `0b0001 << 3 = 0b1000` |
| `>>` | Shift destra | `0b1000 >> 2 = 0b0010` |

## Esempi pratici

**Set bit n** (accendere bit specifico):
```cpp
byte stato = 0b00000000;
stato |= (1 << 3);         // accende bit 3 → 0b00001000
```

**Clear bit n** (spegnere bit):
```cpp
stato &= ~(1 << 3);        // spegne bit 3
```

**Toggle bit n** (inverte):
```cpp
stato ^= (1 << 3);
```

**Read bit n** (legge):
```cpp
int valore = (stato >> 3) & 1;  // 0 o 1
```

**Vol. 3 pag. 130** (PORT register manipulation): tutti questi pattern sono fondamentali per scrittura diretta a PORTB/PORTC/PORTD.

## Esempio matrice LED 8×8 (Vol. 3 pag. 108)

Ogni riga è 1 byte. Il bit acceso = LED acceso:
```cpp
byte rigaCuore = 0b01100110;
// ──── 0=spento, 1=acceso
//   . X X . . X X .
```

8 byte rappresentano l'intera matrice 8×8 = 64 LED in soli 8 byte SRAM. Senza usare bit-packing servirebbero 64 byte.

## Conversioni utili

```cpp
// int 1023 → byte truncato
int adc = analogRead(A0);   // 0-1023
byte pwm = adc >> 2;         // /4 → 0-255 per analogWrite

// alto + basso byte di un int
int x = 0x1234;
byte alto = (x >> 8) & 0xFF;   // 0x12
byte basso = x & 0xFF;          // 0x34

// combinare 2 byte in int
int composto = ((int)alto << 8) | basso;   // 0x1234
```

## Errori comuni

1. **Confondere bit e byte** — "8 bit" ≠ "8 byte". 8 bit = 1 byte. 8 byte = 64 bit. Importante per dimensionare buffer e calcoli memoria.

2. **Shift di bit fuori range** — `byte x = 1 << 8;` shifta oltre il bit 7 → x = 0 (overflow byte). Per int usare `int x = 1 << 8;` (valore 256).

3. **AND/OR confusione** — `&` (bit-wise) ≠ `&&` (logico). `0b1010 & 0b0101 = 0b0000`. `0b1010 && 0b0101 = true` (entrambi non-zero).

4. **NOT esteso a int** — `~0b00001111` (8 bit) = `0b11110000` su byte, ma promosso a int: `0b11111111_11110000`. Mascherare con `& 0xFF` se serve byte.

5. **Confondere binario/hex/dec** — `0b101 = 5`, `0x101 = 257`, `101 = 101`. Sempre verificare prefisso. Vol. 3 pag. 35 raccomanda usare SEMPRE prefissi quando significativo (no `byte x = 11;` ambiguo, meglio `byte x = 0b1011;` o `byte x = 11;` con commento).

## Esperimenti correlati

- **Vol. 3 pag. 35** — Introduzione bit/byte, notazioni
- **Vol. 3 pag. 38** — Operatori bit-wise, esempi pratici
- **Vol. 3 pag. 108** — Matrice LED 8×8 con bitmap byte
- **Vol. 3 pag. 130** — PORT register manipulation (vedi `arduino-port.md`)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 35):
> "Tutto quello che Arduino fa è in realtà accendere e spegnere bit. Il byte è il primo "blocco" che permette di rappresentare numeri, lettere, e comandi."

**Cosa fare:**
- Disegnate sulla LIM 8 caselline = 1 byte. Riempite con 0/1: 0b01100110 = 102 decimale
- Vol. 3 pag. 35 raccomanda di iniziare con esempi concreti: cosa rappresenta `0b00001111`? (numero 15, anche basso nibble di 0xF0, anche pattern "metà-metà")
- Mostrate equivalenza dec/bin/hex con calcolatore in classe (la maggior parte dei calcolatori scientifici ha modalità bin/hex)
- Insegnate operatori bit-wise SOLO dopo aver consolidato la rappresentazione

**Sicurezza:**
- Niente specifico per bit/byte. Concetto puramente teorico.
- Errori bit-wise possono causare comportamenti runtime imprevisti (PORT manipulation sbagliata → componenti bruciati). Test sempre con LED prima di hardware delicato.

**Cosa NON fare:**
- Non insegnate bit-wise prima di logica `if`/`for` — concetto astratto richiede maturità
- Non spaventate ragazzi con "registri 16 bit" e "endianness" — solo dopo basi consolidate
- Non confondete con "bit" inteso come "piccolo pezzetto" (italiano colloquiale): in informatica è UNITÀ specifica

## Link L1 (raw RAG queries)

- `"bit byte unità informazione"`
- `"binario esadecimale Arduino"`
- `"operatori bit-wise AND OR XOR"`
- `"shift sinistra destra Arduino"`
- `"matrice LED bitmap byte"`
