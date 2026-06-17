---
id: eeprom
type: concept
title: "EEPROM Arduino — memoria persistente non volatile"
locale: it
volume_ref: 3
pagina_ref: 100
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [eeprom, memoria, persistente, datalogger, salvataggio, vol3]
---

## Definizione

L'**EEPROM** (Electrically Erasable Programmable Read-Only Memory) è memoria che **conserva i dati anche senza alimentazione**. ATmega328P ha **1024 byte (1 KB)** di EEPROM integrata.

Vol. 3 pag. 100 introduce: "L'EEPROM è il "diario" di Arduino: scriviamo dentro e quando lo riaccendiamo i dati sono ancora lì, mentre le variabili normali si cancellano".

Differenza memoria Arduino Nano:
| Tipo | Dimensione | Volatile? | Uso |
|------|-----------|-----------|-----|
| **Flash (programma)** | 32 KB | NO | Sketch compilato |
| **SRAM (variabili)** | 2 KB | SÌ (perde con OFF) | Variabili, stack, heap |
| **EEPROM** | 1 KB | NO | Dati persistenti tra reset |

## Sintassi base

```cpp
#include <EEPROM.h>

void setup() {
  // Scrivere
  EEPROM.write(0, 42);              // indirizzo 0, valore 42 (0-255)

  // Leggere
  int val = EEPROM.read(0);          // val = 42

  // Aggiornare (scrive solo se diverso, salva cicli)
  EEPROM.update(0, 100);             // scrive 100 solo se != 42
}
```

`write` e `update` accettano valori 0-255 (un byte). Per int (2 byte) o float (4 byte) usare `EEPROM.put()` / `EEPROM.get()`:

```cpp
int contatore = 1234;
EEPROM.put(0, contatore);            // scrive 2 byte (indirizzi 0 e 1)
int letto;
EEPROM.get(0, letto);                // letto = 1234

float temperatura = 23.5;
EEPROM.put(2, temperatura);          // scrive 4 byte (indirizzi 2-5)
```

## Esempio Vol. 3 — Datalogger temperatura

```cpp
#include <EEPROM.h>

const int N_CAMPIONI = 100;
const int INDIRIZZO_INDICE = 0;       // primo byte: indice corrente
const int INDIRIZZO_DATI = 4;         // dati a partire da byte 4

void setup() {
  Serial.begin(9600);
}

void salvaTemperatura(float t) {
  byte indice;
  EEPROM.get(INDIRIZZO_INDICE, indice);
  if (indice >= N_CAMPIONI) indice = 0;  // wrap circolare
  EEPROM.put(INDIRIZZO_DATI + indice * 4, t);
  indice++;
  EEPROM.put(INDIRIZZO_INDICE, indice);
}

void leggiTutto() {
  for (int i = 0; i < N_CAMPIONI; i++) {
    float t;
    EEPROM.get(INDIRIZZO_DATI + i * 4, t);
    Serial.print(i); Serial.print(": ");
    Serial.println(t);
  }
}

void loop() {
  float t = leggiTemperatura();      // funzione TMP36
  salvaTemperatura(t);
  delay(60000);                       // ogni minuto
}
```

Vol. 3 pag. 100 mostra questo come esempio iconico: Arduino spegne, si riaccende dopo giorni, dati ancora dentro.

## Limiti CRITICAL — cicli di scrittura

**EEPROM ATmega328 ha ~100,000 cicli di scrittura per byte**. Oltre quella soglia, la cella diventa inaffidabile.

Calcolo realistico:
- 100,000 cicli ÷ 1 scrittura/secondo = **27 ore** prima di rompere una cella
- Con `update()` (scrive solo se diverso) → vita molto più lunga

**Strategia wear leveling**: ruotare le scritture su indirizzi diversi (esempio datalogger sopra usa wrap circolare).

Vol. 3 pag. 100 regola: NON scrivere EEPROM in `loop()` senza condizione di delay (es. ogni minuto, ogni ora). Mai ad alta frequenza.

## Errori comuni

1. **Scritture continue in loop()** — `EEPROM.write(0, x)` chiamato 1000 volte/secondo brucia EEPROM in 100 secondi. Sempre `update()` + delay/condition.

2. **Dimenticare endianness con put/get** — `EEPROM.put(0, intValue)` e `EEPROM.put(0, floatValue)` scrivono BYTE diversi (2 vs 4). Leggere con tipo sbagliato → garbage.

3. **Out-of-bounds** — Indirizzi 0-1023 validi su Nano. `EEPROM.write(2000, x)` può corrompere altri dati o crashare.

4. **EEPROM "azzerata" all'upload sketch** — FALSO. EEPROM persiste anche tra upload sketch diversi. Per cancellare: `for (int i = 0; i < EEPROM.length(); i++) EEPROM.write(i, 0);`.

5. **Aspettarsi velocità di SRAM** — EEPROM scrittura prende ~3.3 ms per byte. Lettura ~1 µs. Differenza ~3000×. Per dati real-time usare SRAM (variabili globali).

## Esperimenti correlati

- **Vol. 3 pag. 100** — Primo EEPROM: contatore reset persistente
- **Vol. 3 pag. 103** — Datalogger temperatura 100 campioni
- **Vol. 3 pag. 107** — Salvare highscore di un gioco Simon Says
- **Vol. 3 pag. 110** — Calibrazione sensore: salvare valore zero in EEPROM

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 100):
> "L'EEPROM è il "diario" di Arduino: scriviamo dentro e quando lo riaccendiamo i dati sono ancora lì, mentre le variabili normali si cancellano."

**Cosa fare:**
- Mostrate empiricamente: sketch incrementa contatore in EEPROM ogni reset. Premete RESET 10 volte → contatore arriva a 10. Spegnete e riaccendete → contatore ancora a 10. Ragazzi VEDONO la persistenza
- Vol. 3 pag. 100 raccomanda di insegnare EEPROM DOPO array (richiede capire indirizzi)
- Spiegate la differenza con SRAM: "le variabili sono come un foglio temporaneo; EEPROM è il quaderno". Analogia chiara
- Insegnate `update()` come default sicuro per ridurre cicli scrittura

**Sicurezza:**
- 100K cicli sembrano tanti, ma in `loop()` senza delay si bruciano in minuti. Insegnare a SEMPRE limitare scritture
- Per progetti che richiedono >100K scritture (datalogger ad alta frequenza), usare SD card esterna invece di EEPROM

**Cosa NON fare:**
- Non usate EEPROM per dati che cambiano spesso (es. valore sensore live). Solo per dati "rari": calibrazioni, contatori, configurazione
- Non sovrappiate `EEPROM.put` di tipi diversi sullo stesso indirizzo senza calcolare offset
- Non confidate sui dati EEPROM dopo lunghi periodi (anni) senza refresh — cellule possono leggere "drift" lentamente

## Link L1 (raw RAG queries)

- `"EEPROM Arduino persistente"`
- `"EEPROM.put EEPROM.get tipo dati"`
- `"datalogger Arduino EEPROM"`
- `"cicli scrittura EEPROM 100K"`
- `"differenza SRAM EEPROM Flash Arduino"`
