---
id: bmp280-pressione
type: concept
title: "BMP280 — pressione e altitudine"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [bmp280, pressione, altitudine, i2c, sensore, vol-non-coperto]
---

## Definizione

Il **BMP280** e' un sensore digitale Bosch che misura **pressione atmosferica** (300-1100 hPa, ±1 hPa) e **temperatura** (-40 a +85 °C, ±1 °C). Comunica via I2C (default 0x76) o SPI. Da pressione assoluta + pressione di riferimento al livello del mare si calcola **altitudine** (precisione ±1 m).

Versioni:
- **BMP280** -- pressione + temperatura
- **BME280** -- aggiunge umidita' (sensore "completo")

## Pinout modulo I2C

| Pin | Funzione |
|---|---|
| VCC | 3.3 V (5 V tollerato su moduli con regolatore) |
| GND | massa |
| SCL | clock I2C |
| SDA | dati I2C |
| CSB | non collegato in I2C |
| SDO | indirizzo: GND = 0x76, VCC = 0x77 |

## Schema collegamento (Arduino UNO)

```
+5V ---- VCC (modulo con regolatore 3.3V interno)
GND ---- GND
A4 ---- SDA
A5 ---- SCL
```

## Esempio Arduino

```cpp
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 non trovato!");
    while (1);
  }
}

void loop() {
  Serial.print("T: "); Serial.print(bmp.readTemperature()); Serial.print(" C  ");
  Serial.print("P: "); Serial.print(bmp.readPressure() / 100.0); Serial.print(" hPa  ");
  Serial.print("Alt: "); Serial.print(bmp.readAltitude(1013.25)); Serial.println(" m");
  delay(1000);
}
```

Libreria: "Adafruit BMP280 Library".

## Calcolo altitudine

`readAltitude(P0)` dove P0 = pressione al livello del mare nel tuo punto (default 1013.25 hPa). Per accuratezza migliore aggiornarlo dal meteo locale.

## Errori comuni

1. **Indirizzo I2C sbagliato** -> 0x76 (SDO=GND, default cinesi) vs 0x77 (SDO=VCC, default Adafruit) -> sempre verifica con I2C scanner
2. **5V diretto su BMP280 senza modulo** -> rompe il chip (sopporta solo 3.3 V)
3. **Pull-up I2C assenti** -> i moduli economici tipicamente li hanno gia' on-board
4. **P0 sbagliato** -> altitudine errata di decine di metri

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il BMP280 misura la pressione atmosferica. Salendo in montagna l'aria si fa piu' rara e la pressione scende: misurando questo possiamo capire a che altitudine siamo, come fanno gli altimetri degli alpinisti.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per stazioni meteo, droni, escursionismo
- Se disponibile, fare l'esperimento "scala": misura pressione al piano terra, sali al 1° piano, vedi che e' diminuita di ~3-4 hPa (~30 m)
- Spiegare che il GPS misura altitudine in modo diverso (satelliti) -- BMP280 e' complementare

**Sicurezza:**
- Sensore sotto vetro/membrana, NON tappare il piccolo foro sul chip
- Range temperatura -40/+85, NON usare in forno

## Link L1 (raw RAG queries)

- "BMP280 Arduino I2C 0x76"
- "altitudine pressione livello mare 1013"
- "BMP280 vs BME280"
