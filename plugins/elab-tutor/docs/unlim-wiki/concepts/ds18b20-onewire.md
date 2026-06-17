---
id: ds18b20-onewire
type: concept
title: "DS18B20 — termometro digitale 1-Wire"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [ds18b20, 1-wire, temperatura, sensore, vol-non-coperto]
---

## Definizione

Il **DS18B20** e' un sensore di temperatura digitale (-55 a +125 °C, ±0.5 °C tra -10 e +85 °C) con protocollo proprietario **1-Wire**. Ogni sensore ha un indirizzo unico a 64 bit -> si possono mettere **decine di sensori sullo stesso filo dati**, una particolarita' unica.

Versioni:
- **TO-92** (uguale a un transistor) -- dentro circuiti elettronici
- **Sonda waterproof** in acciaio inox con cavo 1 m -- per acquari, congelatori, esterno

## Pinout TO-92

Guardando il sensore con la parte piatta verso di te:
- 1 (sinistra) = GND
- 2 (centro) = DATA
- 3 (destra) = VCC (3-5 V)

## Schema base — modalita' "external power"

```
+5V ---+--- VCC
       |
       4.7k pull-up
       |
DATA --+--> Arduino D2

GND --- GND
```

## Esempio Arduino

```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

const int BUS = 2;
OneWire oneWire(BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(9600);
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  float t = sensors.getTempCByIndex(0);
  if (t == DEVICE_DISCONNECTED_C) {
    Serial.println("Errore: sensore non trovato");
  } else {
    Serial.print("T: "); Serial.print(t); Serial.println(" C");
  }
  delay(1000);
}
```

Librerie: "OneWire" + "DallasTemperature" (Library Manager).

## Multi-sensore sullo stesso filo

Cablaggio "stella" (tutti collegati allo stesso D2 + pull-up condiviso). `sensors.getDeviceCount()` restituisce quanti ne ha trovati. Si leggono per indice (0,1,2...) o per indirizzo univoco.

## Errori comuni

1. **Pull-up assente** -> letture -127 (DEVICE_DISCONNECTED_C)
2. **VCC al posto di DATA** sul filo lungo -> sensore non risponde
3. **Cavo > 10 m senza pull-up rinforzato** (4.7k -> 2.2k) -> rumore
4. **Modalita' "parasite power"** (solo DATA + GND) -> funziona ma fragile, preferire "external"

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il DS18B20 e' come un termometro che parla "in digitale" con Arduino. La cosa speciale: ne possiamo collegare tanti tutti sullo stesso filo, perche' ognuno ha un nome diverso (indirizzo a 64 bit).

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per progetti meteo, monitoraggio frigorifero, acquario
- Se disponibile, mostrare 2-3 DS18B20 collegati allo stesso pin D2 -> Arduino legge tutti
- Spiegare che 1-Wire e' alternativa a I2C (richiede 2 fili) e SPI (4 fili)

**Sicurezza:**
- Versione waterproof: cavo siliconico fino a 100 °C
- Mai applicare > 5.5 V su VCC

## Link L1 (raw RAG queries)

- "DS18B20 Arduino temperatura 1-Wire"
- "OneWire DallasTemperature multi-sensore"
- "parasite power vs external DS18B20"
