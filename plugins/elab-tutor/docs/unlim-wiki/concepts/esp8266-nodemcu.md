---
id: esp8266-nodemcu
type: concept
title: "NodeMCU ESP8266 — WiFi a basso costo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [esp8266, nodemcu, wifi, iot, vol-non-coperto]
---

## Definizione

Il **NodeMCU** e' una scheda di sviluppo basata sul chip **ESP8266** (Espressif). Costa pochissimo (3-5 €) e include WiFi 802.11 b/g/n integrato, USB-Serial onboard, alimentatore 3.3 V. E' il "nonno" dell'ESP32: meno potente ma piu' economico per progetti IoT semplici.

## Caratteristiche

| Aspetto | NodeMCU (ESP8266) |
|---|---|
| CPU | Tensilica L106 @ 80 MHz, 32 bit |
| RAM | ~50 KB utilizzabile |
| Flash | 4 MB |
| WiFi | 802.11 b/g/n |
| Bluetooth | NO (per BT serve ESP32) |
| GPIO utilizzabili | 9 (D0-D8) |
| ADC | 1 pin (0-1.0 V max!) |
| PWM | software, su tutti GPIO |
| Tensione logica | 3.3 V |

## Mappatura pin

I label "Dx" sulla NodeMCU NON corrispondono ai numeri GPIO interni:

| Label | GPIO | Note |
|---|---|---|
| D0 | 16 | no PWM, no interrupt |
| D1 | 5 | I2C SCL default |
| D2 | 4 | I2C SDA default |
| D3 | 0 | boot mode (HIGH richiesto) |
| D4 | 2 | LED on-board |
| D5-D8 | 14, 12, 13, 15 | OK, ma D8 (15) deve essere LOW al boot |

Nel codice Arduino IDE usare numero GPIO o `Dx` (entrambi mappati nel core).

## Esempio: ThingSpeak (cloud IoT gratuito)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "MIA_RETE";
const char* pwd  = "password";
const char* TS_KEY = "TUA_API_KEY";

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, pwd);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  int sensore = analogRead(A0);
  HTTPClient http;
  WiFiClient client;
  String url = "http://api.thingspeak.com/update?api_key=" + String(TS_KEY)
             + "&field1=" + String(sensore);
  http.begin(client, url);
  int code = http.GET();
  Serial.println(code);
  http.end();
  delay(20000);  // 1 update ogni 20s = limite gratuito
}
```

## ADC a 1 V max

Sull'ESP8266 originale il pin A0 sopporta solo 0-1.0 V (NON 0-3.3 V come sull'ESP32). La NodeMCU ha un divisore on-board che permette 0-3.3 V su A0, ma molti cloni cinesi NO -> sempre divisore esterno per sicurezza.

## Errori comuni

1. **5V su NodeMCU** -> chip si brucia (3.3 V max)
2. **GPIO0 LOW al boot** -> entra in modalita' flash, non parte sketch -> non collegare carichi su D3
3. **deep sleep senza GPIO16-RST** -> non si sveglia. Servono cavetto o resistore tra GPIO16 e RST
4. **WiFi.begin() prima di Serial.begin()** -> primo messaggio Serial perso
5. **delay(60000) durante WiFi** -> watchdog reset, usa `delay(1000); yield();` x60

## NodeMCU vs ESP32

NodeMCU = piu' economico, meno pin, no Bluetooth, ADC limitato. ESP32 = piu' potente, doppio core, BT integrato. Per progetti scuola IoT semplici (es. invio temperatura su cloud), NodeMCU e' perfetto. Per audio, telecamere, BLE -> ESP32.

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, NodeMCU e' un Arduino con WiFi integrato che costa pochissimo. E' la scheda che usano molti maker per fare progetti "IoT" -- Internet delle Cose -- come termometri smart, irrigazione automatica via app.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per progetti IoT (vedi anche `esp32-vs-arduino.md`)
- Esempio progetto-bonus: leggi temperatura DHT22 e inviala su un foglio Google via Apps Script
- Iniziare SEMPRE con Arduino (Vol.1-3) prima di passare a ESP8266/ESP32

**Sicurezza:**
- 3.3 V logica, 5 V ammessi solo sul pin VIN (con regolatore on-board)
- Antenna WiFi: tenere a 5 cm da metalli per buona portata

## Link L1 (raw RAG queries)

- "NodeMCU ESP8266 Arduino IDE configurazione"
- "ThingSpeak ESP8266 Arduino esempio"
- "GPIO mapping D0 D1 D2 NodeMCU"
