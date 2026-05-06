---
id: dht22-temperatura-umidita
type: concept
title: "DHT22 — sensore temperatura e umidita'"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [dht22, temperatura, umidita, sensore, vol-non-coperto]
---

## Definizione

Il **DHT22** (anche chiamato AM2302) e' un sensore digitale che misura **temperatura** (-40 a +80 °C, ±0.5 °C) e **umidita' relativa** (0-100%, ±2-5%). Comunica con Arduino tramite un protocollo proprietario "1-wire" su un solo filo dati. Risoluzione 0.1 °C / 0.1% RH.

## Pinout

| Pin | Funzione |
|---|---|
| 1 | VCC (3.3-5 V) |
| 2 | DATA |
| 3 | NC (non collegato) |
| 4 | GND |

Resistore pull-up 4.7 k tra DATA e VCC obbligatorio.

## Schema collegamento

```
+5V --- VCC
        |
        +--- 4.7k pull-up
        |
DATA --+--> Arduino D2

GND --- GND
```

## Esempio Arduino con libreria DHT

```cpp
#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Errore lettura DHT22");
    return;
  }

  Serial.print("Umidita': "); Serial.print(h); Serial.print("%  ");
  Serial.print("Temp: "); Serial.print(t); Serial.println(" C");
  delay(2000);
}
```

Libreria: "DHT sensor library" by Adafruit (Library Manager).

## Errori comuni

1. **Resistore pull-up assente** -> letture NaN intermittenti
2. **Letture < 2 secondi di intervallo** -> il DHT22 non riesce a campionare, restituisce NaN
3. **Cavo DATA > 1 m senza schermatura** -> rumore, errori
4. **DHT22 vs DHT11** -> DHT11 e' molto piu' impreciso (±2 °C / ±5%), si pilota uguale ma con `DHTTYPE DHT11`
5. **Alimentazione su 3.3 V con cavo lungo** -> serve VCC 5 V

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il DHT22 e' un sensore "due in uno": misura temperatura e umidita' dell'aria della stanza. Si collega con un solo filo dati (oltre a alimentazione e massa).

**Cosa fare:**
- Il DHT22 NON e' nel kit ELAB base -- e' propedeutico per progetti meteo, stazioni ambientali
- Per misurare temperatura nel kit ELAB usare il sensore previsto dal volume (LM35 o TMP36 a seconda del kit)
- Spiegare la differenza: LM35/TMP36 = analogico (1 pin ADC), DHT22 = digitale (1 pin con libreria)

**Sicurezza:**
- Sensore a basso consumo (~1.5 mA), nessun rischio termico
- Mai immergere in acqua (versione resistente all'umidita' = SHT3x)

## Link L1 (raw RAG queries)

- "DHT22 temperatura umidita Arduino libreria"
- "DHT22 vs DHT11 vs SHT3x"
- "pull-up 4.7k DHT22"
