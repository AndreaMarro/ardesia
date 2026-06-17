---
id: bluetooth-hc05
type: concept
title: "HC-05 — modulo Bluetooth seriale per Arduino"
locale: it
volume_ref: 3
pagina_ref: 195
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [bluetooth, hc-05, wireless, seriale, smartphone, vol3]
---

## Definizione

L'**HC-05** è un modulo Bluetooth Classic che fornisce comunicazione seriale wireless tra Arduino e smartphone/PC. Vol. 3 pag. 195 introduce: "HC-05 fa parlare Arduino con il telefono. Una volta accoppiato, è come se fossero collegati con un cavo invisibile".

Pinout (6 pin, ne servono 4):
- **VCC** — 5V (modulo ha regulator interno, chip lavora a 3.3V)
- **GND** — massa
- **TX** — Arduino RX (D0, ma usare SoftwareSerial)
- **RX** — Arduino TX (D1, ma usare SoftwareSerial) **VOLTAGE DIVIDER 5V→3.3V**
- KEY/EN — modalità AT (configurazione, opzionale)
- STATE — feedback connessione (LED esterno opzionale)

## Schema collegamento (con voltage divider)

```
Arduino                 HC-05
  +5V             ───→  VCC
  GND             ───→  GND
  D2 (TX SoftSerial) ─→ RX (via voltage divider 1kΩ + 2kΩ)
  D3 (RX SoftSerial) ←─ TX (direct OK, 3.3V level)

Voltage divider RX:
  Arduino TX ─[1kΩ]─┬─→ HC-05 RX
                    │
                  [2kΩ]
                    │
                   GND
```

Vol. 3 pag. 195 raccomanda voltage divider per protezione HC-05 RX (nominalmente 3.3V tolerant, sicuro).

## Codice Arduino base

```cpp
#include <SoftwareSerial.h>

SoftwareSerial bluetooth(3, 2);  // RX, TX (Arduino prospective)

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  Serial.println("HC-05 pronto. Pair: ELAB-Bluetooth, PIN 1234");
}

void loop() {
  // Smartphone → Arduino
  if (bluetooth.available()) {
    char c = bluetooth.read();
    Serial.print("RX: "); Serial.println(c);

    if (c == '1') digitalWrite(13, HIGH);
    if (c == '0') digitalWrite(13, LOW);
  }

  // Arduino → smartphone (echo Serial Monitor input)
  if (Serial.available()) {
    char c = Serial.read();
    bluetooth.write(c);
  }
}
```

## Pairing prima volta

1. Alimentare HC-05 (LED rosso lampeggia veloce ~2 Hz = pairing mode)
2. Smartphone Bluetooth → Cerca dispositivi → trova "HC-05" o "ELAB-Bluetooth"
3. PIN: **1234** (default) o **0000**
4. Post-pair: LED rosso lampeggia lento ~0.5 Hz = connected
5. App per inviare/ricevere: "Serial Bluetooth Terminal" (Android), "BLE Terminal" (iOS via BLE adapter)

## Modalità AT (configurazione)

Per cambiare nome, PIN, baud rate:

1. Spegnere HC-05
2. Tenere premuto KEY/EN, ricollegare alimentazione (LED lampeggia 1 Hz lento)
3. Comunicare a 38400 baud:
```cpp
bluetooth.begin(38400);  // baud AT mode
// Poi nel loop manda comandi AT:
bluetooth.println("AT+NAME=ELAB-MIO-NOME");
bluetooth.println("AT+PSWD=9876");
bluetooth.println("AT+UART=115200,0,0");
```

Vol. 3 pag. 198 lista comandi AT essenziali.

## Esempio Vol. 3 — controllo LED da smartphone

```cpp
#include <SoftwareSerial.h>
SoftwareSerial bt(3, 2);

const int LED_R = 9, LED_G = 10, LED_B = 11;

void setup() {
  bt.begin(9600);
  pinMode(LED_R, OUTPUT); pinMode(LED_G, OUTPUT); pinMode(LED_B, OUTPUT);
}

void loop() {
  if (bt.available()) {
    char c = bt.read();
    switch (c) {
      case 'R': digitalWrite(LED_R, !digitalRead(LED_R)); break;
      case 'G': digitalWrite(LED_G, !digitalRead(LED_G)); break;
      case 'B': digitalWrite(LED_B, !digitalRead(LED_B)); break;
      case 'X': digitalWrite(LED_R, LOW); digitalWrite(LED_G, LOW); digitalWrite(LED_B, LOW); break;
    }
    bt.print("OK ");
    bt.println(c);
  }
}
```

Smartphone manda 'R' → toggle LED rosso. Vol. 3 pag. 200 estende: app MIT App Inventor con button GUI.

## Errori comuni

1. **TX/RX swap** — Arduino TX → HC-05 RX (NOT TX→TX). Errore comune che impedisce comunicazione. Sintomo: pair OK ma nessun byte arriva.

2. **RX senza voltage divider** — Arduino TX 5V applicato direttamente a HC-05 RX 3.3V tolerant può danneggiare modulo nel tempo (anche se "funziona" inizialmente).

3. **SoftwareSerial 9600 OK, 115200 errori** — SoftwareSerial Arduino Nano è limitata. Per baud > 38400 usare HardwareSerial (ma occupa pin 0+1 = no Serial Monitor USB).

4. **Pair fallisce ripetutamente** — HC-05 default PIN 1234, alcuni cloni 0000. Provare entrambi. Verificare baud nel loop matches HC-05 (default 9600).

5. **HC-05 vs HC-06 vs ESP32 BT** — HC-05 = master/slave. HC-06 = slave only (più economico ma limitato). ESP32 = Bluetooth + WiFi (più potente ma più complesso). Kit ELAB tipico: HC-05.

6. **Latenza percepibile** — Bluetooth Classic non è real-time. Latenza 50-200ms tipica. Per applicazioni real-time (es. RC car) accettabile, per audio NO.

## Esperimenti correlati

- **Vol. 3 pag. 195** — Primo HC-05: echo Serial Monitor → smartphone
- **Vol. 3 pag. 198** — Comandi AT: cambia nome, PIN, baud
- **Vol. 3 pag. 200** — Controllo LED RGB da app smartphone
- **Vol. 3 pag. 205** — RC car wireless via HC-05 + motor driver L298N

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 195):
> "HC-05 fa parlare Arduino con il telefono. Una volta accoppiato, è come se fossero collegati con un cavo invisibile."

**Cosa fare:**
- Vol. 3 pag. 195 raccomanda di insegnare HC-05 dopo `Serial.print` + `if/else` basics
- Esperimento iconico: smartphone Andrea controlla LED Arduino → ragazzi vedono "magia wireless"
- Vol. 3 raccomanda di partire da app generica "Serial Bluetooth Terminal" (gratis Play Store) prima di custom app
- Spiegate Bluetooth come "WiFi più semplice ma più corto" — analogia accessibile
- Pairing una volta sola → ricordato dopo. Concetto importante per ragazzi (analogia "memorizzare un compagno")

**Sicurezza:**
- HC-05 emette ~3 mW potenza. Sicuro a livello esposizione umana.
- Range max 10m indoor. NO problema da campi medici (ospedali OK Bluetooth Classic).
- Verificare voltage divider su RX → protegge modulo lifetime.

**Cosa NON fare:**
- Non usate HC-05 per applicazioni high-bandwidth (video) — limitato 1 Mbit/s.
- Non insegnate HC-05 senza prima Serial Monitor — concetto base seriale required.
- Non lasciate HC-05 sempre in pairing mode (LED veloce) — security concern, qualcuno può collegarsi.

## Link L1 (raw RAG queries)

- `"HC-05 Bluetooth Arduino seriale"`
- `"voltage divider RX 5V 3.3V"`
- `"comandi AT HC-05 nome PIN"`
- `"SoftwareSerial vs HardwareSerial"`
- `"smartphone controllo LED Arduino Bluetooth"`
