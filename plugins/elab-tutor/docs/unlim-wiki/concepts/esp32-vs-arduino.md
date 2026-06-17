---
id: esp32-vs-arduino
type: concept
title: "ESP32 vs Arduino UNO/Nano — quale scegliere"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [esp32, arduino, confronto, wifi, bluetooth, vol-non-coperto]
---

## Definizione

L'**ESP32** (Espressif Systems) e l'**Arduino UNO/Nano** (basato su Atmel ATmega328P) sono due piattaforme di prototipazione molto diffuse, ma molto diverse. La **prima** scelta nel kit ELAB e' Arduino Nano (Vol.3) per la sua semplicita' didattica. ESP32 e' propedeutico per progetti IoT, WiFi, Bluetooth, audio.

## Confronto rapido

| Aspetto | Arduino UNO/Nano | ESP32 |
|---|---|---|
| CPU | ATmega328P @ 16 MHz, 8 bit | Xtensa LX6 dual-core @ 240 MHz, 32 bit |
| RAM | 2 KB | 520 KB |
| Flash | 32 KB | 4 MB |
| WiFi | NO (richiede modulo) | INTEGRATO (802.11 b/g/n) |
| Bluetooth | NO | INTEGRATO (Classic + BLE) |
| Pin GPIO | 20 (di cui 6 PWM) | 36 (quasi tutti PWM, ADC, capacitive touch) |
| ADC | 10 bit | 12 bit |
| Tensione logica | 5 V | 3.3 V |
| Consumo deep sleep | ~50 µA | ~10 µA (con tutti i picchi spenti) |
| Costo (clone) | 3-8 € | 5-12 € |

## Quando preferire Arduino

- Primi passi (kit ELAB Vol.1-3, idealmente sul nostro Nano R4)
- Progetti che usano librerie con esempi 5V (LCD 16x2, sensori vintage)
- Robotica didattica con motori 5V
- "Hardware-first" focus: MCU semplice, capisci ogni byte

## Quando preferire ESP32

- IoT (invio dati su WiFi, MQTT, ThingSpeak, Firebase)
- Bluetooth audio o sensori BLE
- Capacitive touch (10+ pin senza componenti aggiuntivi)
- Doppio core: un thread legge sensori, l'altro gestisce WiFi
- Display OLED ad alta risoluzione (SPI ad alta velocita')

## Compatibilita' Arduino IDE

ESP32 si programma con Arduino IDE installando il "core ESP32" via Board Manager (https://espressif.com/...). La maggior parte degli sketch Arduino funziona, MA:

- `analogRead()` -> 0-4095 (12 bit) invece di 0-1023
- `digitalWrite()` -> 3.3 V invece di 5 V (sensori 5V-only non funzionano)
- `Serial.begin(9600)` -> usa porta dedicata, non interferisce con USB
- `delay()` durante WiFi puo' triggerare watchdog -> usa `vTaskDelay()` o `yield()`

## Esempio ESP32 — server web minimo

```cpp
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "MIA_RETE";
const char* pwd  = "password";

WebServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, pwd);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println(WiFi.localIP());

  server.on("/", []() { server.send(200, "text/plain", "Ciao da ESP32!"); });
  server.begin();
}

void loop() { server.handleClient(); }
```

## Errori comuni

1. **5V su pin ESP32** -> rompe il chip (3.3 V max)
2. **Sensori 5V-only** (HC-SR04 ping, alcuni LCD) -> funzionano stranamente, usa level shifter
3. **delay() lungo durante WiFi** -> watchdog reset
4. **Pin GPIO 0/2/12/15 in boot mode** -> alcuni pin hanno funzioni speciali al boot, leggi pinout
5. **Flash da 4 MB ma sketch grande** -> partition scheme va aggiornato (Tools menu)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, Arduino e' come una bicicletta: semplice, robusta, tutti possono usarla. ESP32 e' come una moto elettrica: piu' potente, piu' veloce, ma serve guidare con piu' attenzione. Per il nostro corso usiamo Arduino, ma sappiate che ESP32 esiste per progetti grossi.

**Cosa fare:**
- Per kit ELAB usare Arduino come da volumi (Vol.1, Vol.2, Vol.3)
- ESP32 come "step successivo" per chi vuole fare smart home, sensori WiFi, audio
- NON introdurre ESP32 prima di aver completato Vol.3 con Arduino

**Sicurezza:**
- ESP32 a 3.3 V -> attenzione a non bruciare con 5 V
- Antenna WiFi: NON tappare con metallo, ridurre a 1 cm da pareti metalliche

## Link L1 (raw RAG queries)

- "ESP32 vs Arduino UNO Nano confronto"
- "ESP32 WiFi server web esempio"
- "level shifter 5V 3.3V Arduino ESP32"
