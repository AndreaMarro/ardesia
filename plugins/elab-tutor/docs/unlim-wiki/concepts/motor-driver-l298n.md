---
id: motor-driver-l298n
type: concept
title: "L298N — driver motore DC bidirezionale"
locale: it
volume_ref: 3
pagina_ref: 205
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [l298n, motor-driver, motore-dc, h-bridge, vol3]
---

## Definizione

L'**L298N** è un driver di motore DC bidirezionale a doppio H-bridge. Permette ad Arduino di controllare 2 motori DC (avanti/indietro/stop) o 1 motore stepper, con corrente fino a 2A per canale. Vol. 3 pag. 205 introduce: "L298N è il muscolo che permette ad Arduino di pilotare motori veri — Arduino dà ordini, L298N fornisce la forza".

## Perché serve un driver

Pin Arduino fornisce **40 mA max**. Motore DC tipico kit ELAB richiede **200-500 mA**. Senza driver: pin Arduino brucia.

L298N intermedia: Arduino → segnali logici 5V → L298N → potenza 6-46V al motore.

## Pinout L298N modulo (kit ELAB)

```
+12V    GND   +5V (out)    OUT1   OUT2  OUT3   OUT4

ENA  IN1  IN2  IN3  IN4  ENB
              (Arduino logic side)
```

Connessioni Arduino:
- **ENA, ENB**: PWM speed control (D9, D10 raccomandati)
- **IN1, IN2**: direzione motore A (D7, D8)
- **IN3, IN4**: direzione motore B (D5, D4)
- **+12V**: alimentazione motori (batteria 9-12V separata)
- **GND**: comune Arduino GND + alimentazione motori
- **+5V out**: regolatore interno L298N → può alimentare Arduino se jumper presente

## Tabella controllo motore A

| IN1 | IN2 | Motore A |
|-----|-----|----------|
| LOW | LOW | STOP (free wheel) |
| HIGH | LOW | Avanti |
| LOW | HIGH | Indietro |
| HIGH | HIGH | STOP (brake) |

**ENA**: PWM 0-255 controlla velocità (0=stop, 255=max).

## Codice Arduino base

```cpp
const int ENA = 9;   // PWM speed motore A
const int IN1 = 7;
const int IN2 = 8;

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void avanti(int velocita) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, velocita);  // 0-255
}

void indietro(int velocita) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, velocita);
}

void stop() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
}

void loop() {
  avanti(150);   delay(2000);
  indietro(200); delay(2000);
  stop();        delay(1000);
}
```

## Esempio Vol. 3 — RC car (capstone)

```cpp
#include <SoftwareSerial.h>
SoftwareSerial bt(3, 2);  // HC-05 Bluetooth

const int ENA = 9, IN1 = 7, IN2 = 8;   // motore SX
const int ENB = 10, IN3 = 5, IN4 = 4;  // motore DX

void setup() {
  bt.begin(9600);
  // pinMode tutti OUTPUT...
}

void loop() {
  if (bt.available()) {
    char c = bt.read();
    switch (c) {
      case 'F': avanti(200); break;            // Forward both
      case 'B': indietro(200); break;
      case 'L': giraSinistra(180); break;       // SX rallenta, DX avanza
      case 'R': giraDestra(180); break;
      case 'S': stop(); break;
    }
  }
}
```

Vol. 3 pag. 208 estende: aggiungi HC-SR04 ultrasonic per evita-ostacoli + LED freni.

## Errori comuni

1. **GND non comune** — Arduino e batteria motore DEVONO condividere GND. Senza, segnali IN1/IN2 fluttuanti, comportamento casuale.

2. **Alimentare L298N da pin 5V Arduino** — L298N consuma >100 mA logica + corrente motori. Brucia regolatore Arduino. Sempre alimentazione separata (batteria 9-12V).

3. **Diodi flyback mancanti** — L298N ha diodi integrati MA solo per protezione interna. Carichi induttivi grandi (motori >1A) richiedono diodi schottky esterni.

4. **PWM frequency conflicting** — PWM Arduino default 490 Hz su pin 5,6,9,10. Alcuni motori "fischiano" a queste frequenze (audible). Vol. 3 raccomanda pin 9/10 (timer 1) settabili a 25 kHz inaudibile.

5. **Surriscaldamento driver** — L298N dissipa molto (drop 1-3V vs MOSFET driver 0.1V). Per motori >1A continuo aggiungere heatsink.

6. **Cambio direzione brusco senza brake** — High to LOW direzione → motore inverte istantaneamente → pico corrente assorbita può resettare Arduino. Vol. 3 raccomanda short delay(100) tra direction change.

## Esperimenti correlati

- **Vol. 3 pag. 205** — Primo motore DC con L298N (avanti/indietro)
- **Vol. 3 pag. 208** — RC car wireless (HC-05 + 2 motori + chassis)
- **Vol. 3 pag. 212** — Robot evita-ostacoli (HC-SR04 + L298N)
- **Vol. 3 pag. 215** — PID controlled motor (capstone, con encoder feedback)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 205):
> "L298N è il muscolo che permette ad Arduino di pilotare motori veri — Arduino dà ordini, L298N fornisce la forza."

**Cosa fare:**
- Vol. 3 pag. 205 raccomanda di insegnare L298N DOPO `analogWrite` PWM (vedi `pwm.md`) e `digitalWrite`
- Mostrate empiricamente: Arduino direct → motore non gira (40mA insufficiente). L298N → gira pieno. Lezione di "perché serve un driver"
- RC car capstone iconic: ragazzi controllano da telefono → coinvolgimento massimo
- Spiegate la differenza alimentazione "logica" (Arduino 5V) vs "potenza" (motore 9-12V) — concetto fondamentale per sistemi embedded

**Sicurezza:**
- L298N è robusto, MA richiede alimentazione separata.
- Verificate polarità batteria: VIN+ → +12V terminal, VIN- → GND. Inversione brucia driver.
- Heatsink consigliato per uso continuo > 30 secondi a piena potenza.
- **Mai lasciare RC car senza supervisione** — motori possono trascinare cavi, urtare oggetti, ecc.

**Cosa NON fare:**
- Non usate L298N per servomotori (servo hanno driver interno + segnale PWM specifico) — sprecate canale.
- Non collegate motori industriali (>2A) — eccede limite L298N. Per quei carichi usare BTS7960 o moduli MOSFET dedicati.
- Non insegnate L298N prima di `analogWrite` PWM — ENA è PWM-driven.

## Link L1 (raw RAG queries)

- `"L298N motore DC Arduino driver"`
- `"H-bridge bidirezionale motore"`
- `"ENA ENB IN1 IN2 controllo direzione"`
- `"RC car Bluetooth L298N"`
- `"PWM frequency 25kHz inaudibile motore"`
