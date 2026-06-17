---
id: sd-card-spi
type: concept
title: "SD card SPI — datalogger persistente"
locale: it
volume_ref: 3
pagina_ref: 245
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [sd-card, spi, datalogger, storage, vol3]
---

## Definizione

Il modulo **SD card SPI** permette ad Arduino di leggere/scrivere file su scheda microSD. Vol. 3 pag. 245 introduce: "L'SD card è la memoria infinita di Arduino — dove EEPROM ha 1 KB, SD card ha 4 GB+. Per datalogger seri, è la scelta giusta".

Pinout (5 pin SPI):
- **VCC** — 5V (modulo ha regulator interno per 3.3V chip)
- **GND** — massa
- **MOSI** — Master Out Slave In (Arduino D11)
- **MISO** — Master In Slave Out (Arduino D12)
- **SCK** — Serial Clock (Arduino D13)
- **CS** — Chip Select (Arduino D10, qualsiasi pin)

## Capacità vs EEPROM

| Storage | Capacità | Velocità | Cicli scrittura |
|---------|----------|----------|-----------------|
| EEPROM Arduino | 1 KB | 3.3 ms/byte | 100K |
| SD card | 4 GB+ | ~100 KB/s | 1M+ (wear leveling FAT) |

Vol. 3 pag. 245: per >100 letture/scritture al giorno, SD card preferita.

## Schema collegamento

```
Arduino Nano   SD card module
  +5V    ───→ VCC
  GND    ───→ GND
  D11    ───→ MOSI
  D12    ←── MISO
  D13    ───→ SCK
  D10    ───→ CS
```

## Codice Arduino libreria SD.h

```cpp
#include <SPI.h>
#include <SD.h>

const int CS = 10;

void setup() {
  Serial.begin(9600);

  if (!SD.begin(CS)) {
    Serial.println("SD init failed!");
    return;
  }
  Serial.println("SD ready");

  // Scrivere
  File f = SD.open("log.txt", FILE_WRITE);
  if (f) {
    f.println("Boot " + String(millis()));
    f.close();
    Serial.println("Scritto");
  }

  // Leggere
  File f2 = SD.open("log.txt", FILE_READ);
  if (f2) {
    while (f2.available()) {
      Serial.write(f2.read());
    }
    f2.close();
  }
}

void loop() {}
```

## Modes file

| Mode | Sintassi | Effetto |
|------|----------|---------|
| Read | `SD.open("f", FILE_READ)` | Leggi inizio |
| Write append | `SD.open("f", FILE_WRITE)` | Append fine, crea se non esiste |
| Truncate | `SD.remove("f"); SD.open("f", FILE_WRITE)` | Cancella + nuovo |

## Esempio Vol. 3 — datalogger temperatura

```cpp
#include <SPI.h>
#include <SD.h>
#include <Wire.h>
#include <RTClib.h>  // se RTC disponibile, altrimenti millis()

const int CS = 10;
RTC_DS3231 rtc;

void setup() {
  Serial.begin(9600);
  SD.begin(CS);
  rtc.begin();
}

void salvaCampione(float temp) {
  DateTime now = rtc.now();
  File f = SD.open("temp.csv", FILE_WRITE);
  if (f) {
    f.print(now.unixtime()); f.print(",");
    f.println(temp);
    f.close();
  }
}

void loop() {
  float t = leggiTMP36();  // funzione separata
  salvaCampione(t);
  delay(60000);  // ogni minuto
}
```

Vol. 3 pag. 248 estende: leggi CSV su PC con Excel per grafico.

## Filesystem FAT16/FAT32

SD card formattata FAT16/FAT32 (≤32 GB).
- File names: 8.3 (es. `LOG.TXT`, `TEMP.CSV`)
- Sottocartelle supportate: `SD.open("/data/log.txt")`
- exFAT (>32 GB): NOT supportato library SD standard. Use SdFat library.

Vol. 3 pag. 245 raccomanda microSD ≤16 GB classe 10 per kit ELAB.

## Errori comuni

1. **Init failed** — Cause: scheda non inserita, formattata male, CS pin sbagliato. Verifica formato FAT16/32 + reformat se serve.

2. **File names lunghi** — `"data_lungo_2026.csv"` non funziona (8.3 limit). Use `"d2026.csv"`.

3. **Dimentica close()** — File aperto NON salva fino al `close()`. Sketch crash → dati persi. Sempre `close()` post scrittura.

4. **Scrittura simultanea con Serial** — SD usa pin 11/12/13 SPI. Pin 13 è ANCHE LED built-in Nano. Quando SD attiva, LED lampeggia involontariamente.

5. **Power loss durante write** — File system FAT corruption. Vol. 3 raccomanda capacitore 470µF su VCC SD per "soft shutdown".

6. **SD card incompatibile** — Schede economiche non testate spesso fallivano. Vol. 3 raccomanda SanDisk/Samsung classe 10.

## Esperimenti correlati

- **Vol. 3 pag. 245** — Primo SD card: log boot timestamp
- **Vol. 3 pag. 248** — Datalogger temperatura CSV
- **Vol. 3 pag. 252** — RTC + SD card timestamp accurato
- **Vol. 3 pag. 256** — Lettura config da SD (parsing key=value)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 245):
> "L'SD card è la memoria infinita di Arduino — dove EEPROM ha 1 KB, SD card ha 4 GB+. Per datalogger seri, è la scelta giusta."

**Cosa fare:**
- Vol. 3 pag. 245 raccomanda di insegnare SD card DOPO `String` + `Serial.print` + EEPROM (concetti memoria)
- Mostrate empiricamente: scrivete log.txt, estraete SD da Arduino, inserite in computer → vedete file su laptop. Magia connessione fisica/digitale
- Confronto con EEPROM: SD card 4 GB vs EEPROM 1 KB = 4 milioni di volte più capacità
- CSV iconic: ragazzi aprono file su laptop con Excel → grafico immediato dei dati raccolti
- Importanza `close()`: spiegate "se non chiudi, dati spariscono" come "se non chiudi quaderno, scivola fuori"

**Sicurezza:**
- SD card consume ~100 mA durante write. Pin 5V Arduino regge ma stretto.
- Per progetti long-running: alimentazione separata + capacitore decoupling.
- Mai estrarre SD durante write attiva → corruzione filesystem.

**Cosa NON fare:**
- Non aspettatevi velocità SSD-like — SD card SPI è ~100 KB/s max.
- Non usate file > 4 GB (FAT32 limit) — splittare in chunks.
- Non insegnate SD prima di Serial.print + variabili — concetti dipendenti.

## Link L1 (raw RAG queries)

- `"SD card SPI Arduino datalogger"`
- `"FAT16 FAT32 8.3 file name"`
- `"SD.open FILE_WRITE close"`
- `"datalogger temperatura CSV Excel"`
- `"capacitore decoupling SD card power loss"`
