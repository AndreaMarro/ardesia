---
id: gps-neo6m
type: concept
title: "GPS NEO-6M — geolocalizzazione satellitare"
locale: it
volume_ref: 3
pagina_ref: 260
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [gps, neo6m, geolocalizzazione, satellite, vol3]
---

## Definizione

Il **GPS NEO-6M** è un modulo geolocalizzazione satellitare che riceve segnali da satelliti GPS e calcola posizione (lat/lon), velocità, ora UTC. Vol. 3 pag. 260 introduce: "Il GPS è il sensore che dice ad Arduino DOVE siete con precisione di 2-5 metri — utile per logger di percorso, geocaching, trackers".

Pinout (4 pin):
- **VCC** — 3.3V o 5V (modulo ha LDO)
- **GND** — massa
- **TX** — Arduino RX (D4 SoftwareSerial raccomandato)
- **RX** — Arduino TX (D3 SoftwareSerial)

Antenna integrata (modulo standard) o esterna SMA (kit pro).

## Come funziona

GPS riceve segnali da ≥4 satelliti → triangolazione → posizione 3D + tempo. Output formato **NMEA 0183** ASCII, frasi tipo:

```
$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
        |       |          |          |   |  |   |    |
       UTC      Lat        Lon       Fix  Sat HDOP  Alt
```

GPGGA = Global Positioning System Fix Data (più importante).
GPRMC = Recommended Minimum (lat/lon/velocità/data).

## Schema collegamento

```
Arduino     NEO-6M
  +5V  ───→ VCC
  GND  ───→ GND
  D4   ←── TX (GPS → Arduino RX)
  D3   ───→ RX (Arduino TX → GPS, raramente usato)
```

## Codice Arduino con libreria TinyGPS++

```cpp
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

SoftwareSerial gpsSerial(4, 3);  // RX, TX
TinyGPSPlus gps;

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  Serial.println("GPS waiting fix...");
}

void loop() {
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        Serial.print("Lat: "); Serial.print(gps.location.lat(), 6);
        Serial.print(" Lon: "); Serial.print(gps.location.lng(), 6);
        Serial.print(" Sats: "); Serial.println(gps.satellites.value());
      } else {
        Serial.println("No fix");
      }
    }
  }

  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("GPS not detected — check wiring");
    while(true);
  }
}
```

**Cold start fix**: 30-60s prima di avere posizione (cielo aperto).
**Warm start fix**: 5-10s.

## Esempio Vol. 3 — datalogger percorso

```cpp
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <SD.h>

SoftwareSerial gpsSerial(4, 3);
TinyGPSPlus gps;
const int CS = 10;

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  SD.begin(CS);
}

void loop() {
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());

  if (gps.location.isUpdated()) {
    File f = SD.open("track.csv", FILE_WRITE);
    if (f) {
      f.print(gps.date.year()); f.print("-");
      f.print(gps.date.month()); f.print("-");
      f.print(gps.date.day()); f.print(" ");
      f.print(gps.time.hour()); f.print(":");
      f.print(gps.time.minute()); f.print(":");
      f.print(gps.time.second()); f.print(",");
      f.print(gps.location.lat(), 6); f.print(",");
      f.println(gps.location.lng(), 6);
      f.close();
    }
  }
}
```

Vol. 3 pag. 263 estende: estrai CSV, importa in Google Maps custom map → visualizza percorso.

## Errori comuni

1. **NO fix indoor** — GPS necessita cielo aperto. Indoor o sotto pioggia/foreste = nessun segnale. Test SEMPRE all'aperto.

2. **TX/RX swap** — Errore comune. NEO-6M TX → Arduino RX (NOT TX→TX). Sintomo: nessun byte arriva, library `gps.charsProcessed() == 0`.

3. **Baud rate sbagliato** — NEO-6M default 9600 baud. Cambiabile via UBX command (avanzato). Mismatch → garbage output.

4. **Antenna non collegata** (modulo SMA) — nessun fix. Verificare antenna avvitata correttamente.

5. **Cold start lungo** — Prima volta o dopo settimane → 30-60s. Pazienza. Library `gps.satellites.value()` mostra count.

6. **TinyGPS++ non installato** — Sketch non compila. Library Manager: cerca "TinyGPS++" by Mikal Hart, install.

## Esperimenti correlati

- **Vol. 3 pag. 260** — Primo GPS: Serial Monitor lat/lon
- **Vol. 3 pag. 263** — Datalogger percorso CSV su SD card
- **Vol. 3 pag. 266** — GPS + LCD: display posizione live
- **Vol. 3 pag. 270** — Geocaching: distanza da punto target con `gps.distanceBetween()`

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 260):
> "Il GPS è il sensore che dice ad Arduino DOVE siete con precisione di 2-5 metri — utile per logger di percorso, geocaching, trackers."

**Cosa fare:**
- Vol. 3 pag. 260 raccomanda di insegnare GPS DOPO `Serial.print` + `String` + SoftwareSerial
- Esperimento **OUTDOOR mandatory**: portare ragazzi in giardino scuola, GPS si connette → Serial Monitor mostra lat/lon
- Confrontare lat/lon Arduino con Google Maps lookup → ragazzi verificano accuracy
- Geocaching iconic: ragazzi nascondono "tesoro" + danno coordinate → altri lo trovano usando Arduino
- Spiegate i 4+ satelliti come "punti fissi nello spazio" — concetto di triangolazione

**Sicurezza:**
- GPS è ricevitore PASSIVO. Sicuro per ragazzi.
- Antenna NON deve essere coperta (mano, custodia metallica) — interrompe segnale.
- Privacy: GPS NON traccia ragazzi senza loro saperlo. Sempre informarli del logger.

**Cosa NON fare:**
- Non aspettatevi precisione sub-metro — NEO-6M è 2-5m tipico (peggio sotto edifici).
- Non usate GPS per indoor positioning — non funziona, usate WiFi RSSI o BLE beacon.
- Non insegnate GPS prima di SoftwareSerial + parsing stringa.

## Link L1 (raw RAG queries)

- `"GPS NEO-6M Arduino italiano"`
- `"TinyGPS++ libreria parsing NMEA"`
- `"datalogger percorso CSV SD card GPS"`
- `"cold start fix 30-60 secondi GPS"`
- `"geocaching Arduino distanza coordinate"`
