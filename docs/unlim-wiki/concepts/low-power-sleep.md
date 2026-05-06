---
id: low-power-sleep
type: concept
title: "Low-power sleep — Arduino a batteria"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [low-power, sleep, batteria, atmega328p, vol-non-coperto]
---

## Definizione

Le modalita' **sleep** dell'ATmega328P (Arduino UNO/Nano) permettono di ridurre il consumo di corrente da ~30 mA (attivo) a < 1 µA (deep sleep). Sono fondamentali per progetti a batteria (sensore wireless, datalogger remoto, allarme antifurto). Si "sveglia" Arduino con un interrupt esterno, un timer, o il watchdog.

## Modalita' di sleep ATmega328P

| Modalita' | Consumo | Cosa sopravvive |
|---|---|---|
| IDLE | ~3 mA | tutto, solo CPU spenta |
| ADC noise reduction | ~1 mA | ADC + interrupt |
| Power-save | ~0.7 µA | Timer2, interrupt esterni |
| Standby | ~0.1 mA | oscillatore esterno |
| **Power-down** | **< 0.4 µA** | **interrupt esterni + watchdog** |

Per progetti a batteria si usa quasi sempre **Power-down** + sveglia da interrupt o watchdog.

## Esempio: Power-down + sveglia ogni 8 secondi

```cpp
#include <avr/sleep.h>
#include <avr/wdt.h>
#include <avr/interrupt.h>

ISR(WDT_vect) {
  wdt_disable();  // dopo il wake, disabilita
}

void andaDormire() {
  noInterrupts();
  wdt_enable(WDTO_8S);
  WDTCSR |= (1 << WDIE);  // abilita interrupt
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_enable();
  interrupts();
  sleep_cpu();
  // qui ci si sveglia
  sleep_disable();
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("Sveglio!");
  Serial.flush();  // svuota buffer prima di dormire
  delay(100);

  andaDormire();
}
```

## Esempio: sveglia da pulsante (interrupt esterno)

```cpp
#include <avr/sleep.h>

const int PULSANTE = 2;  // INT0 su Arduino UNO/Nano

void onWake() {}

void setup() {
  pinMode(PULSANTE, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  Serial.println("Premi il pulsante per dormire... e poi di nuovo per svegliarmi");
  delay(2000);

  attachInterrupt(digitalPinToInterrupt(PULSANTE), onWake, LOW);
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_enable();
  sleep_cpu();
  // wake here
  sleep_disable();
  detachInterrupt(digitalPinToInterrupt(PULSANTE));
}
```

## Riduzione consumo extra

In Power-down il chip consuma <1 µA, ma la **scheda** (Arduino UNO/Nano completa) consuma piu' per:
- LED di alimentazione (rimuovere o cortocircuitare resistore -> -3 mA)
- Regolatore on-board (sostituire con MCP1700 LDO -> -2 mA)
- USB-Serial chip (rimuovere alim. solo MCU "naked") -> da 30 µA a 0.5 µA

Per autonomia massima usare **ATmega328P "naked"** su breadboard alimentato direttamente da batteria (3 AA = 4.5 V), oppure **Arduino Pro Mini** che e' gia' minimo.

## Errori comuni

1. **`Serial.print` prima di sleep senza `Serial.flush()`** -> messaggi tronchi
2. **Interrupt esterno solo su LOW level**, non FALLING -> resta sempre sveglio
3. **Periferiche I2C/SPI/ADC accese durante sleep** -> consumano. Usare `power_adc_disable()`, `power_spi_disable()` ecc.
4. **Pin lasciati flottanti** -> consumo "fantasma" 0.5-2 mA. INPUT_PULLUP o impostare LOW
5. **Aspettarsi 30 nA con Arduino UNO completo** -> impossibile (LED+regolatore consumano sempre)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il "sonno profondo" di Arduino e' come quando voi dormite: il cervello e' spento, ma una piccola parte rimane in ascolto della sveglia (l'interrupt). Cosi' una pila piccola puo' durare mesi invece di ore.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per progetti a batteria (sensore in giardino, allarme bici)
- Far calcolare l'autonomia: 1000 mAh batteria / 0.001 mA = 1.000.000 ore di sleep (ma "wakes" consumano)
- Spiegare che ogni telecomando, sveglietta, rilevatore di fumo usa questa tecnica

**Sicurezza:**
- Batteria a litio -> protezione contro scarica profonda obbligatoria (TP4056 + DW01)
- Mai sleep con uscite HIGH che alimentano carichi -> consumi alti silenziosi
- Test consumo reale con multimetro in modalita' µA

## Link L1 (raw RAG queries)

- "Arduino sleep power-down ATmega328P"
- "wdt_enable WDIE wake interrupt"
- "Arduino Pro Mini batteria autonomia"
