---
id: arduino-port
type: concept
title: "PORT register Arduino — manipolazione diretta dei pin"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: claude-opus-4-7
fix_iter44_W2: "Pagine fabbricate Vol.3 pag.130/135/140/145 (Vol.3 max=95). Concept marcato general_knowledge_only — argomento avanzato non in capitolo dedicato dei volumi ELAB Tutor V0.13."
tags: [port, register, atmega328, low-level, prestazioni, avanzato, general_knowledge]
---

## Definizione

I **PORT register** sono celle di memoria del microcontrollore ATmega328P che controllano direttamente lo stato HIGH/LOW dei pin digitali. Argomento Arduino C++ avanzato, non trattato nei volumi ELAB Tutor.

ATmega328P ha **3 PORT**:
- **PORTB**: pin digitali 8-13
- **PORTC**: pin analogici A0-A5 (usabili anche come digitali)
- **PORTD**: pin digitali 0-7

Ogni PORT ha 3 register associati:
| Register | Funzione |
|----------|----------|
| `DDRx`  | Data Direction — 0=INPUT, 1=OUTPUT |
| `PORTx` | Output value — 0=LOW, 1=HIGH (o 1=enable pull-up se INPUT) |
| `PINx`  | Input read — bit corrispondente al pin |

`x` = B, C, o D.

## Esempio: blink con PORT

```cpp
// Equivalente di pinMode(13, OUTPUT) + digitalWrite(13, HIGH/LOW)
void setup() {
  DDRB |= (1 << 5);   // PB5 = pin 13 → OUTPUT
}

void loop() {
  PORTB |= (1 << 5);  // PB5 HIGH
  delay(500);
  PORTB &= ~(1 << 5); // PB5 LOW
  delay(500);
}
```

Codice equivalente con API Arduino:
```cpp
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
```

## Perché usare PORT direttamente

| Operazione | Tempo `digitalWrite` | Tempo PORT diretto |
|------------|---------------------|---------------------|
| 1 toggle | ~5 µs | ~125 ns |
| 1000 toggle | ~5 ms | ~125 µs |
| Speedup | — | **~40× più veloce** |

`digitalWrite` fa molto lavoro:
1. Cerca il pin nella tabella di mapping
2. Verifica se PWM è attivo, lo disabilita se sì
3. Calcola il bit corretto
4. Scrive sul PORT register

PORT diretto salta tutto: scrive UN bit in UN register.

Caso d'uso tipico: progetti capstone che richiedono switching ad alta frequenza (es. multiplex matrice LED, generatori d'onda, comunicazione bit-bang).

## Mappa pin → bit (ATmega328P / Arduino Nano)

| Arduino Pin | PORT.bit |
|-------------|----------|
| 0 | PD.0 |
| 1 | PD.1 |
| 2 | PD.2 |
| ... | ... |
| 7 | PD.7 |
| 8 | PB.0 |
| 9 | PB.1 |
| 10 | PB.2 |
| 11 | PB.3 |
| 12 | PB.4 |
| 13 | PB.5 |
| A0 | PC.0 |
| ... | ... |
| A5 | PC.5 |

## Operazioni bit-wise essenziali

```cpp
// Set bit n di reg → reg.n = 1
reg |= (1 << n);

// Clear bit n di reg → reg.n = 0
reg &= ~(1 << n);

// Toggle bit n di reg
reg ^= (1 << n);

// Read bit n di reg → 0 o 1
int val = (reg >> n) & 1;
```

## Errori comuni

1. **Manipolare bit del PORT senza configurare DDR** — Senza `DDRB |= (1<<5)`, il pin resta INPUT. Scrivere su PORTB non accende niente, attiva solo la pull-up interna.

2. **Confondere PORT con PIN** — Per **leggere** uno stato di input, usare `PINB & (1<<n)`, NON `PORTB`. Su INPUT, PORTB controlla pull-up; PINB legge.

3. **Bit-shift errato** — `1 << 13` per "pin 13" è SBAGLIATO. Pin 13 è PB.5, quindi `1 << 5`. Sempre consultare la mappa pin→PORT.bit prima di scrivere.

4. **Disabilitare interrupts mid-write** — Se un'interrupt scrive lo stesso PORT mentre il loop manipola un bit, può sovrascriversi. Per critiche atomiche:
```cpp
noInterrupts();
PORTB |= (1 << 5);
interrupts();
```

5. **Rompere funzioni Arduino dipendenti da PORT** — Se manipolate PORTD direttamente, occhio: pin 0-1 sono usati da Serial (USART). Scrivere lì rompe la comunicazione USB → debug impossibile.

## Esperimenti correlati

Argomento avanzato Arduino non coperto nei volumi ELAB Tutor V0.13. Riferimenti esterni consigliati: Arduino reference docs `https://docs.arduino.cc/learn/microcontrollers/digital-input-output` + AVR-libc `<avr/io.h>` headers.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi**:
> "Ragazzi, i PORT register sono il modo veloce di accendere e spegnere i pin, saltando il livello di Arduino. Sono per chi vuole capire COME funziona dentro."

**Cosa fare:**
- Argomento **avanzato** — adatto a ragazzi che hanno già padroneggiato `digitalWrite` e curiosi di prestazioni
- NON in capitolo dedicato dei volumi ELAB — concept generale Arduino C++
- Mostrate sull'oscilloscopio (se disponibile) la differenza: digitalWrite + delayMicroseconds(1) vs PORTB |= ... + delayMicroseconds(1). La forma d'onda è chiaramente più "pulita" con PORT
- Per le scuole elementari/prima media, restare su `digitalWrite` come API didattica
- Spiegate il trade-off: PORT è veloce ma confonde i principianti, riduce la portabilità tra board diverse, e bypassa le protezioni Arduino (es. PWM auto-disable)

**Sicurezza:**
- Manipolazione PORT può rompere comunicazione Serial (PD.0/PD.1) — debug Serial non funziona più
- Disabilitare interrupts a tempo lungo (>1 ms) può perdere eventi: timer overflow, Serial RX, etc.

**Cosa NON fare:**
- Non usate PORT register per progetti normali — `digitalWrite` è chiaro e leggibile
- Non mescolate digitalWrite + PORTB sullo stesso pin nello stesso programma — confusione manutentiva

## Link L1 (raw RAG queries)

- `"PORT register Arduino ATmega328"`
- `"digitalWrite vs PORT prestazioni"`
- `"DDRB PORTB PINB Arduino"`
- `"manipolazione bit pin Arduino"`
- `"speedup pin toggle PORT"`
