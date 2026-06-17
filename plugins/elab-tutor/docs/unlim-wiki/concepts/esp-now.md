---
id: esp-now
type: concept
title: "ESP-NOW — comunicazione wireless senza WiFi"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [esp-now, wireless, esp32, esp8266, vol-non-coperto]
---

## Definizione

**ESP-NOW** e' un protocollo proprietario Espressif per comunicazione **diretta** tra schede ESP32/ESP8266, senza passare da un router WiFi. Latenza bassa (~3-5 ms), portata fino a ~200 m in linea d'aria, bassissimo consumo energetico (sleep tra messaggi). Ogni scheda usa il proprio MAC address come "indirizzo".

Casi d'uso tipici:
- Telecomandi wireless (un ESP32 manda comandi a un altro)
- Reti di sensori distribuite (mesh leggero)
- Sostituto di nRF24L01 dove gia' c'e' un ESP

## Architettura

- Scheda **mittente**: scopre MAC address del destinatario, invia pacchetto (max 250 byte)
- Scheda **destinataria**: riceve pacchetto in callback (interrupt-style)

## Esempio: invio numero da ESP32 A a ESP32 B

**Codice mittente (A)**:

```cpp
#include <esp_now.h>
#include <WiFi.h>

uint8_t MAC_B[] = {0x24, 0x6F, 0x28, 0x00, 0x00, 0x00};  // MAC scheda B

typedef struct {
  int valore;
} Pacchetto;

Pacchetto p;

void onSent(const uint8_t* mac, esp_now_send_status_t status) {
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "OK" : "FAIL");
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  esp_now_init();
  esp_now_register_send_cb(onSent);
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, MAC_B, 6);
  peer.channel = 0;
  esp_now_add_peer(&peer);
}

void loop() {
  p.valore = analogRead(34);
  esp_now_send(MAC_B, (uint8_t*)&p, sizeof(p));
  delay(1000);
}
```

**Codice destinatario (B)**:

```cpp
#include <esp_now.h>
#include <WiFi.h>

typedef struct { int valore; } Pacchetto;

void onRecv(const esp_now_recv_info_t* info, const uint8_t* data, int len) {
  Pacchetto* p = (Pacchetto*)data;
  Serial.print("Ricevuto: "); Serial.println(p->valore);
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  Serial.println(WiFi.macAddress());  // copia questo MAC nel codice A
  esp_now_init();
  esp_now_register_recv_cb(onRecv);
}

void loop() {}
```

## Errori comuni

1. **MAC sbagliato** -> pacchetti spariscono nel nulla, callback `onSent` ritorna FAIL
2. **WiFi.mode(WIFI_AP)** invece di STA -> ESP-NOW non funziona
3. **Canali diversi** tra mittente e destinatario -> entrambi devono usare lo stesso canale (default 0)
4. **Pacchetto > 250 byte** -> non viene inviato
5. **Coabitazione con WiFi normale** -> serve connettere a una rete e usare ESP-NOW sullo stesso canale (avanzato)

## Vantaggi vs alternative

| | ESP-NOW | WiFi normale | Bluetooth | nRF24L01 |
|---|---|---|---|---|
| Hardware | ESP integrato | ESP integrato | ESP32 only | modulo extra |
| Latenza | ~3-5 ms | ~50-200 ms (router) | ~30-100 ms | ~1-2 ms |
| Portata | ~200 m | dipende dal router | ~10 m | ~50-100 m |
| Mesh | possibile | NO | mesh BLE | facile |
| Codice | semplice | medio | medio | medio |

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, ESP-NOW e' un modo per far parlare due schede ESP senza usare il router WiFi di casa. E' come due walkie-talkie che si parlano direttamente. Veloce, semplice, lontano.

**Cosa fare:**
- NON e' nel kit ELAB base -- richiede 2 schede ESP32/ESP8266
- Idea progetto bonus: telecomando ESP-NOW per LED in classe (1 scheda con pulsanti, 1 scheda con LED)
- Mostrare il MAC address come "numero di telefono" delle schede

**Sicurezza:**
- ESP-NOW non e' criptato di default -> per dati sensibili aggiungi cifratura AES (esp_now_set_pmk)
- 2.4 GHz come WiFi -> coabita ma puo' interferire (sceglire canale poco usato)

## Link L1 (raw RAG queries)

- "ESP-NOW ESP32 esempio mittente destinatario"
- "MAC address WiFi.macAddress()"
- "ESP-NOW vs nRF24L01"
