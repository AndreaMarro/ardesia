---
id: watchdog-timer
type: concept
title: "Watchdog timer — riavvio automatico se Arduino si blocca"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [watchdog, reset, affidabilita, vol-non-coperto]
---

## Definizione

Il **watchdog timer** (WDT) e' un timer hardware che, se non viene "rinfrescato" entro un tempo prestabilito, **resetta automaticamente** Arduino. Serve a recuperare il sistema da blocchi imprevisti (loop infinito, sensore congelato, errore di lettura I2C, ecc.). E' fondamentale per progetti che devono funzionare H24 senza presenza umana (centraline IoT, monitoraggio remoto).

L'idea: il programma "dice ciao" al watchdog regolarmente con `wdt_reset()`. Se il programma si blocca e smette di salutare, il watchdog "abbaia" e fa partire il reset.

## Tempi disponibili (ATmega328P)

| WDTO_xxx | Timeout |
|---|---|
| WDTO_15MS | 15 ms |
| WDTO_30MS | 30 ms |
| WDTO_60MS | 60 ms |
| WDTO_120MS | 120 ms |
| WDTO_250MS | 250 ms |
| WDTO_500MS | 500 ms |
| WDTO_1S | 1 secondo |
| WDTO_2S | 2 secondi |
| WDTO_4S | 4 secondi |
| WDTO_8S | 8 secondi (massimo) |

## Esempio Arduino

```cpp
#include <avr/wdt.h>

void setup() {
  Serial.begin(9600);
  wdt_enable(WDTO_4S);  // si resetta dopo 4 secondi se non lo "rinfreschi"
}

void loop() {
  Serial.println("vivo!");
  // ... codice principale ...
  wdt_reset();  // dice "sono vivo" al watchdog
  delay(1000);
}
```

Se il `loop()` si blocca per piu' di 4 secondi (es. `while(1) {}` per errore), il watchdog resetta Arduino e il programma riparte da `setup()`.

## Bootloader sicuro

**ATTENZIONE**: alcuni bootloader Arduino vecchi (es. UNO R3 originale, ATmegaBOOT) hanno un bug: dopo un watchdog reset entrano in loop infinito. Soluzioni:
- Usare bootloader **Optiboot** (default UNO recenti, Nano Every)
- All'inizio di `setup()`, scrivere: `MCUSR = 0; wdt_disable();` per "uscire" da eventuale loop bootloader

```cpp
void setup() {
  MCUSR = 0;
  wdt_disable();    // breaks any leftover boot loop
  Serial.begin(9600);
  wdt_enable(WDTO_4S);
}
```

## Quando usare il WDT

- Centraline che funzionano per giorni/mesi senza riavvio
- Sistemi remoti (sensore ambientale in cantina)
- Robot autonomi
- Progetti che usano librerie problematiche (WiFi che a volte si pianta)

## Quando NON usare il WDT

- Prototipi sul banco -> disturba il debug
- Codice didattico che si vuole far vedere step-by-step (i delay > 4 s scatenano reset)

## Errori comuni

1. **Dimenticare `wdt_reset()`** -> Arduino resetta in continuazione (boot loop infinito)
2. **Timeout troppo breve** (15 ms) per loop con sensori lenti -> reset spurio
3. **`delay(8000)` dentro loop** con `WDTO_4S` -> reset
4. **Bootloader vecchio + watchdog reset** -> Arduino non riparte (vedi sopra)
5. **Confondere WDT con `millis()` overflow** -> sono problemi diversi

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il watchdog e' come un "cane da guardia" dentro Arduino: se voi non gli dite "sono qui!" ogni 4 secondi, lui pensa che vi siete addormentati e riavvia tutto. Serve nei progetti che devono funzionare da soli per giorni e giorni.

**Cosa fare:**
- NON introdurre prima che i ragazzi abbiano costruito un primo progetto duraturo (centralina, datalogger)
- Spiegare il pattern "alive heartbeat" -> esempio reale: monitor di rete, tastiere PC che hanno watchdog interno
- Esempio motivante: "perche' il modem internet ha un riavvio automatico settimanale? Watchdog software!"

**Sicurezza:**
- Watchdog non risolve **bug di codice** -- li nasconde. Trovare e correggere il bug, non solo "auto-restart"
- Test con scollegare un sensore deliberatamente -> verifica che il watchdog faccia ripartire correttamente

## Link L1 (raw RAG queries)

- "watchdog timer Arduino wdt_enable"
- "WDTO_4S avr/wdt.h"
- "Optiboot watchdog bootloader fix"
