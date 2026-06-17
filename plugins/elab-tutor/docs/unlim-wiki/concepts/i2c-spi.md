---
id: i2c-spi
type: concept
title: "I2C e SPI — protocolli per sensori avanzati"
locale: it
volume_ref: 3
pagina_ref: 145
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [i2c, spi, protocolli, sensori, comunicazione, avanzato, vol3]
---

## Definizione

**I2C** (Inter-Integrated Circuit) e **SPI** (Serial Peripheral Interface) sono i due protocolli di comunicazione usati da quasi tutti i sensori "intelligenti" e display moderni. Vol. 3 pag. 145 introduce nel capitolo avanzato: "se il sensore ha 4+ piedini etichettati SDA/SCL o MOSI/MISO/SCK/CS, parla I2C o SPI — Arduino può conversare con loro tramite librerie standard".

Tabella confronto:
| Caratteristica | I2C | SPI |
|----------------|-----|-----|
| Pin Arduino | 2 (SDA + SCL) | 4 (MOSI + MISO + SCK + CS) |
| Velocità | 100-400 kHz (fast 1 MHz) | 1-10 MHz (fino 50 MHz) |
| Dispositivi sullo stesso bus | Molti (indirizzi 7-bit) | Uno per CS pin (multi-CS) |
| Distanza | Breve (≤ 1m) | Brevissima (≤ 30cm) |
| Pull-up | Richiesti SDA/SCL (4.7-10 kΩ) | Non richiesti |
| Tipico kit ELAB | LCD I2C, RTC, IMU | Display SD card, ethernet |

## I2C — pin Arduino Nano

```
Arduino Nano:
  A4 = SDA (data)
  A5 = SCL (clock)
```

Pull-up esterni 4.7 kΩ tra SDA→Vcc e SCL→Vcc (alcuni moduli I2C hanno pull-up integrati).

**Vol. 3 pag. 145** primo esempio: LCD 16×2 I2C (modulo PCF8574). Indirizzo tipico 0x27 o 0x3F.

```cpp
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);  // indirizzo, colonne, righe

void setup() {
  Wire.begin();           // inizializza I2C
  lcd.init();
  lcd.backlight();
  lcd.print("Ciao ragazzi!");
}
```

## SPI — pin Arduino Nano

```
Arduino Nano:
  D11 = MOSI (Master Out, Slave In)
  D12 = MISO (Master In, Slave Out)
  D13 = SCK  (Serial Clock)
  D10 = SS/CS (Slave Select / Chip Select, qualsiasi pin)
```

**Vol. 3 pag. 148** primo esempio: SD card module (SPI).

```cpp
#include <SPI.h>
#include <SD.h>

const int CS_PIN = 10;

void setup() {
  Serial.begin(9600);
  if (!SD.begin(CS_PIN)) {
    Serial.println("SD init failed!");
    return;
  }
  File f = SD.open("log.txt", FILE_WRITE);
  if (f) {
    f.println("temperatura: 23.5");
    f.close();
  }
}
```

## Scanner I2C — trovare indirizzi sconosciuti

```cpp
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("Scanning I2C...");

  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found device at 0x");
      Serial.println(addr, HEX);
    }
  }
}

void loop() {}
```

Vol. 3 pag. 145 raccomanda lo scanner come **prima cosa** quando si lavora con un nuovo modulo I2C — l'indirizzo non è sempre quello previsto.

## Quando I2C, quando SPI

**Scegli I2C se:**
- Hai pochi pin disponibili (2 totali)
- Velocità non critica (sensori temperatura, RTC, EEPROM esterne)
- Multipli dispositivi sullo stesso bus
- Esempio: LCD + RTC + accelerometro tutti in 2 pin

**Scegli SPI se:**
- Velocità importante (display TFT, SD card alta velocità)
- Dispositivo singolo o pochi
- Vuoi full-duplex (ricevi + invii contemporaneamente)
- Esempio: SD card datalogger ad alta frequenza

## Errori comuni

1. **Pull-up I2C mancanti** — Sintomo: scanner trova niente, comunicazione random fallisce. Soluzione: 4.7-10 kΩ tra SDA→5V e SCL→5V (verificare se modulo li ha già — multimetro test resistenza).

2. **Indirizzo I2C sbagliato** — `LiquidCrystal_I2C lcd(0x27,...);` ma il modulo usa 0x3F. LCD non risponde. Sempre lanciare scanner I2C prima.

3. **SPI senza CS pin** — `SPI.begin()` non sufficiente. Serve `pinMode(CS, OUTPUT); digitalWrite(CS, LOW);` prima di trasmettere e `digitalWrite(CS, HIGH);` dopo.

4. **Mancanza Wire.begin()** o **SPI.begin()** — Sintomo: tutto compila ma nulla comunica. Inizializzazione richiesta in `setup()`.

5. **Conflitto pin SPI + altri usi** — D13 è SCK SPI MA anche LED built-in Nano. Quando SPI attivo, LED built-in lampeggia involontariamente. Evitare digitalWrite(13,...) se SPI in uso.

## Esperimenti correlati

- **Vol. 3 pag. 145** — Primo I2C: LCD 16×2 + scanner indirizzi
- **Vol. 3 pag. 148** — Primo SPI: SD card datalogger
- **Vol. 3 pag. 152** — RTC DS3231 I2C: orologio + allarme
- **Vol. 3 pag. 155** — IMU MPU6050 I2C: accelerometro + giroscopio (capstone)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 145):
> "Se il sensore ha 4+ piedini etichettati SDA/SCL o MOSI/MISO/SCK/CS, parla I2C o SPI — Arduino può conversare con loro tramite librerie standard."

**Cosa fare:**
- Vol. 3 pag. 145 raccomanda di insegnare I2C/SPI nel capitolo finale Vol. 3 — richiede maturità su `Wire.h`, indirizzi hex, pinout multipli
- Mostrate empiricamente: connettete LCD I2C con 2 pin (SDA+SCL+5V+GND) → 4 fili totali. Ragazzi confrontano con LCD parallelo che richiederebbe 6+ pin (RS+EN+D4-D7)
- Vol. 3 raccomanda lo scanner I2C come "primo strumento" — esegue, vede output indirizzo, capisce comunicazione
- Insegnate il concetto di "indirizzo" come "numero di porta" del condominio — tutti i dispositivi I2C condividono il filo (bus), ma ognuno risponde solo al proprio numero

**Sicurezza:**
- I2C livelli logici 5V Arduino vs 3.3V alcuni sensori → potrebbe danneggiare il sensore. Usare level shifter quando in dubbio.
- SPI a velocità alte richiede cavi corti (≤30cm). Cavi lunghi → segnali corrotti, dispositivo non risponde

**Cosa NON fare:**
- Non insegnate I2C/SPI prima del cap PROGMEM + array — concetto di indirizzi richiede maturità
- Non collegate dispositivi 3.3V a I2C 5V senza level shifter — possibile danno permanente
- Non lasciate CS SPI floating tra trasmissioni — il dispositivo può rispondere a comandi non destinati

## Link L1 (raw RAG queries)

- `"I2C Arduino SDA SCL pull-up"`
- `"SPI Arduino MOSI MISO SCK CS"`
- `"scanner I2C indirizzi"`
- `"LCD 16x2 I2C PCF8574"`
- `"differenza I2C SPI velocità pin"`
