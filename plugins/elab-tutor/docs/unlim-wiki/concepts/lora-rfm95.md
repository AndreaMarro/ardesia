---
id: lora-rfm95
type: concept
title: "LoRa RFM95 — radio a lungo raggio"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [lora, rfm95, sx1276, radio, lungo-raggio, vol-non-coperto]
---

## Definizione

**LoRa** (Long Range) e' una tecnologia radio per comunicazioni a **basso bitrate** (qualche kbps) ma **lunghissimo raggio** (1-15 km in linea d'aria). Funziona nelle bande ISM 433 / 868 / 915 MHz a seconda della regione (in Europa: **868 MHz**). Il modulo piu' diffuso e' l'**RFM95** (chip Semtech SX1276).

LoRa e' molto diverso da WiFi/Bluetooth: meno dati, ma molta piu' distanza. Usato per sensori IoT in agricoltura, allarmi remoti, tracciamento mezzi.

## Pinout RFM95 (modulo nudo)

| Pin | Funzione |
|---|---|
| 3.3V | alim. (NO 5V!) |
| GND | massa |
| MOSI | SPI master out |
| MISO | SPI master in |
| SCK | SPI clock |
| NSS | chip select |
| RESET | reset (collegare a GPIO Arduino) |
| DIO0 | interrupt (collegare a GPIO con interrupt) |

## Schema collegamento Arduino UNO

```
RFM95          Arduino UNO
3.3V    --->   3.3V (NON 5V!)
GND     --->   GND
MOSI    --->   D11
MISO    --->   D12
SCK     --->   D13
NSS     --->   D10
RESET   --->   D9
DIO0    --->   D2 (interrupt)
```

Per Arduino UNO 5V serve **level shifter** sui pin SPI: il modulo 3.3V puo' essere danneggiato dal 5V Arduino. Su Nano 33 IoT / ESP32 (gia' 3.3V) non serve level shifter.

## Esempio mittente con LMIC / RadioHead

Libreria piu' semplice: **RadioHead RH_RF95** (no LoRaWAN, peer-to-peer).

```cpp
#include <SPI.h>
#include <RH_RF95.h>

#define RFM95_CS 10
#define RFM95_RST 9
#define RFM95_INT 2
#define RF95_FREQ 868.0  // MHz Europa

RH_RF95 rf95(RFM95_CS, RFM95_INT);

void setup() {
  Serial.begin(9600);
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, LOW); delay(10);
  digitalWrite(RFM95_RST, HIGH); delay(10);

  if (!rf95.init()) { Serial.println("RFM95 fail"); while (1); }
  rf95.setFrequency(RF95_FREQ);
  rf95.setTxPower(13, false);  // 13 dBm sicuro
}

void loop() {
  char msg[] = "Ciao da Arduino!";
  rf95.send((uint8_t*)msg, sizeof(msg));
  rf95.waitPacketSent();
  Serial.println("Inviato");
  delay(5000);
}
```

## Spreading factor (SF)

Parametro chiave LoRa: SF7 (veloce, breve raggio) -> SF12 (lentissimo, raggio massimo). Default RH_RF95 = SF7 BW125. Per progetti rurali a 5+ km usare `setModemConfig(Bw125Cr48Sf4096)`.

## LoRaWAN vs LoRa peer-to-peer

- **LoRa P2P** -- due moduli si parlano direttamente (esempio sopra)
- **LoRaWAN** -- protocollo standard con gateway (TheThingsNetwork, Helium) -> sensore -> gateway -> internet -> applicazione

LoRaWAN e' molto piu' complesso: keys, OTAA/ABP, downlink, ADR. Per progetti scuola partire da P2P.

## Errori comuni

1. **5V su RFM95** -> brucia (3.3 V max)
2. **Frequenza sbagliata** -> in EU usare 868 MHz, in US 915 MHz, in Asia 433 MHz (verificare regolamento)
3. **TX power oltre 14 dBm in EU 868** -> illegale per uso libero (ETSI 14 dBm max)
4. **Antenna mancante** -> raggio si riduce a metri
5. **No level shifter su Arduino UNO** -> errore intermittente, modulo si rompe nel tempo

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, LoRa e' come la radio CB dei camionisti, ma per i computer: poche parole al minuto, ma chilometri di distanza. Si usa per sensori in campagna, allarmi in zone senza WiFi, tracciamento di animali.

**Cosa fare:**
- NON e' nel kit ELAB base -- progetto avanzato, frequenze radio regolate
- Spiegare che LoRa NON e' "internet" -> e' un canale a banda strettissima
- Esempio bello: 2 LoRa, uno in cortile e uno in classe -> messaggi tra alunni a 200 m

**Sicurezza:**
- Rispettare i limiti ETSI EU868 (14 dBm = 25 mW max), 1% duty cycle nelle sotto-bande g2
- Non trasmettere su frequenze regolamentate (telefonia, TV, militari) -> serve modulo certificato
- Mai usare modulo senza antenna -> potrebbe danneggiare il finale RF

## Link L1 (raw RAG queries)

- "RFM95 SX1276 LoRa Arduino RadioHead"
- "LoRa 868 MHz Europa antenna"
- "spreading factor SF7 SF12 LoRa"
