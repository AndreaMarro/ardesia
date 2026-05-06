---
id: nrf24l01-radio
type: concept
title: "nRF24L01 — radio 2.4 GHz a basso costo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [nrf24l01, radio, 2.4ghz, wireless, vol-non-coperto]
---

## Definizione

Il **nRF24L01** (Nordic Semiconductor) e' un modulo radio 2.4 GHz a banda larga, full-duplex, ACK automatico, con 128 canali e portata 50-100 m (versione "PA+LNA" arriva a 1 km in linea d'aria). Costa poco (1-2 € il modulo), si pilota via SPI. Diffusissimo per radiocomandi, droni hobbistici, telemetria.

## Pinout modulo

| Pin | Funzione |
|---|---|
| VCC | **3.3 V** (NON 5V! sopporta solo 3.6 V max) |
| GND | massa |
| CE | chip enable |
| CSN | chip select SPI |
| SCK, MOSI, MISO | SPI |
| IRQ | interrupt (opzionale) |

## Schema collegamento Arduino UNO

```
nRF24L01     Arduino UNO
3.3V    ---> 3.3V (NON 5V)
GND     ---> GND
CE      ---> D9
CSN     ---> D10
SCK     ---> D13
MOSI    ---> D11
MISO    ---> D12
IRQ     ---> non collegato
```

**Importante**: il 3.3V di Arduino UNO eroga solo 50 mA tipici, e l'nRF24L01 ne consuma fino a 100 mA in TX. Soluzione: condensatore 10 µF tra VCC e GND del modulo, vicinissimo al modulo. Senza, errori di trasmissione misteriosi.

## Esempio mittente con libreria RF24

```cpp
#include <SPI.h>
#include <RF24.h>

RF24 radio(9, 10);  // CE, CSN
const byte addr[6] = "RX001";

void setup() {
  Serial.begin(9600);
  radio.begin();
  radio.openWritingPipe(addr);
  radio.setPALevel(RF24_PA_LOW);  // bassa potenza didattica
  radio.stopListening();
}

void loop() {
  int v = analogRead(A0);
  bool ok = radio.write(&v, sizeof(v));
  Serial.println(ok ? "OK" : "FAIL");
  delay(500);
}
```

## Esempio destinatario

```cpp
#include <SPI.h>
#include <RF24.h>

RF24 radio(9, 10);
const byte addr[6] = "RX001";

void setup() {
  Serial.begin(9600);
  radio.begin();
  radio.openReadingPipe(0, addr);
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening();
}

void loop() {
  if (radio.available()) {
    int v;
    radio.read(&v, sizeof(v));
    Serial.print("RX: "); Serial.println(v);
  }
}
```

Libreria: "RF24" by TMRh20 (Library Manager).

## Errori comuni

1. **5V su VCC modulo** -> chip si distrugge
2. **Cablaggio confuso** -> 7 fili, errore facile su MOSI/MISO/SCK
3. **Senza condensatore di disaccoppiamento** -> moduli "fantasma" che funzionano a malapena
4. **Indirizzo mismatch** -> modulo non riceve nulla (verifica `addr` identico mittente/destinatario)
5. **Doppio modulo sullo stesso Arduino** -> servono CSN diversi

## Confronto con ESP-NOW

| | nRF24L01 | ESP-NOW |
|---|---|---|
| Chip | nRF24L01 | ESP32/ESP8266 |
| Costo modulo | 1-2 € | 5-10 € (intera scheda) |
| Programmazione | libreria RF24 | esp-idf esp_now |
| Mesh | facile (tree) | possibile |
| Latenza | ~1-2 ms | ~3-5 ms |
| WiFi/Bluetooth coabita | NO (banda dedicata) | SI |

Per Arduino "puro" e budget basso: nRF24L01. Per progetti gia' su ESP: ESP-NOW.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, l'nRF24L01 e' un piccolo modulo radio che permette a due Arduino di parlarsi senza fili. E' come due piccioni viaggiatori: si scambiano messaggi a 50-100 m di distanza.

**Cosa fare:**
- NON e' nel kit ELAB base -- progetto avanzato che richiede 2 Arduino + 2 moduli
- Idea progetto: telecomando per LED in classe (Arduino A con pulsanti -> Arduino B con LED)
- Aiutare a capire perche' WiFi e' diverso (richiede router, indirizzi IP)

**Sicurezza:**
- 3.3 V SEMPRE -- mai 5V
- Antenna integrata: tenere a 5+ cm da oggetti metallici
- Banda 2.4 GHz e' libera ma puo' interferire con WiFi/Bluetooth domestici

## Link L1 (raw RAG queries)

- "nRF24L01 Arduino RF24 libreria"
- "modulo radio 2.4GHz Nordic"
- "PA+LNA 1km lungo raggio"
