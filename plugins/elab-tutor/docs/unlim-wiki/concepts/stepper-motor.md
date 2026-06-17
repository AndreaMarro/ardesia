---
id: stepper-motor
type: concept
title: "Motore stepper — rotazione precisa per step"
locale: it
volume_ref: 3
pagina_ref: 230
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [stepper, motore, posizione, vol3, automation]
---

## Definizione

Il **motore stepper** ruota in piccoli incrementi discreti ("step") anziché continuamente. Ogni step = angolo fisso (tipico 1.8° = 200 step/giro). Vol. 3 pag. 230 introduce: "Lo stepper è il cugino preciso del motore DC: invece di girare liberamente, gira esattamente come gli dici — utile per stampanti 3D, plotter, robot precisi".

Tipo comune kit ELAB: **28BYJ-48** (5V, unipolare, 64 step × 64 reduction = 4096 step/giro).

## Driver ULN2003 (per 28BYJ-48)

Il 28BYJ-48 richiede driver ULN2003 (4 transistor Darlington). Modulo standard: 6 pin keypad-side, 5 wire motor-side.

Pinout ULN2003:
- **IN1, IN2, IN3, IN4** — segnali Arduino
- **+VCC** — 5V (modulo) o batteria 5-12V (motore)
- **GND** — comune

LED indicatori IN1-IN4 mostrano sequenza step.

## Schema collegamento

```
Arduino     ULN2003     28BYJ-48
  D8   ──→ IN1
  D9   ──→ IN2
  D10  ──→ IN3
  D11  ──→ IN4
  +5V  ──→ +
  GND  ──→ GND
              motor connector ──→ 28BYJ-48 (5 wire)
```

## Codice Arduino con libreria Stepper.h

```cpp
#include <Stepper.h>

const int STEPS_PER_REV = 4096;  // 28BYJ-48 con riduzione
Stepper motor(STEPS_PER_REV, 8, 10, 9, 11);  // ATTENZIONE ordine!

void setup() {
  motor.setSpeed(10);  // 10 RPM (max ~15 per 28BYJ-48)
  Serial.begin(9600);
}

void loop() {
  Serial.println("Giro completo orario");
  motor.step(STEPS_PER_REV);   // 1 giro completo
  delay(1000);

  Serial.println("Giro completo antiorario");
  motor.step(-STEPS_PER_REV);
  delay(1000);

  Serial.println("90° orario");
  motor.step(STEPS_PER_REV / 4);
  delay(1000);
}
```

**ATTENZIONE ordine pin**: Stepper.h vuole `(steps, A, C, B, D)` = pin `8, 10, 9, 11` per IN1-IN2-IN3-IN4. Ordine A-C-B-D NON A-B-C-D.

## Esempio Vol. 3 — controllo angolo via potenziometro

```cpp
const int PIN_POT = A0;
int ultimaPos = 0;

void loop() {
  int pot = analogRead(PIN_POT);              // 0-1023
  int targetStep = map(pot, 0, 1023, 0, STEPS_PER_REV);

  int delta = targetStep - ultimaPos;
  if (delta != 0) {
    motor.step(delta);
    ultimaPos = targetStep;
  }
  delay(50);
}
```

Vol. 3 pag. 233 estende: stepper + LCD per angolo numerico visualizzato.

## Stepper vs Servo vs DC

| Caratteristica | Stepper | Servo | DC |
|----------------|---------|-------|-----|
| Posizione precisa | ✅ (step) | ✅ (0-180°) | ❌ (no feedback) |
| Velocità continuativa | media | NO | ✅ alta |
| Coppia | media | media | alta |
| Pin Arduino | 4 + driver | 1 (PWM) | 2 + driver H-bridge |
| Use case | stampanti 3D, plotter | porta automatica, robot 180° | RC car, ventola |

## Modalità driver — full step / half step / micro-step

| Modo | Step/giro 28BYJ-48 | Coppia | Smoothness |
|------|---------------------|--------|------------|
| Full step (1-phase) | 2048 | media | bassa |
| Wave drive (2-phase) | 2048 | bassa | bassa |
| Half step (1-2 phase) | 4096 | media | media |
| Micro-step (PWM) | 65536+ | bassa | massima |

Library Stepper.h default = Half step (4096 step/giro per 28BYJ-48). Vol. 3 raccomanda half step come default didattico.

## Errori comuni

1. **Ordine pin sbagliato Stepper.h** — `Stepper(steps, 8, 9, 10, 11)` (A-B-C-D) non funziona. Usare `Stepper(steps, 8, 10, 9, 11)` (A-C-B-D). Sintomo: motore vibra ma non gira.

2. **Velocità troppo alta** — 28BYJ-48 max ~15 RPM con riduzione. `motor.setSpeed(100)` skipperà step → vibra senza girare. Iniziare con 10 RPM.

3. **Alimentazione insufficiente** — 28BYJ-48 consuma ~250 mA per fase. Da pin Arduino 5V → regolatore satura. Sempre alimentazione separata 5V (USB power bank, batteria) per ULN2003.

4. **Stepper hot dopo fermo** — Quando fermo, le bobine restano alimentate (per holding torque). Si scaldano. Per progetti long-running senza holding required, fare `motor.step(0)` non basta; servono strategie disable.

5. **Confusione step/giro** — 28BYJ-48 ha 64 step intrinsechi × 64 riduzione = 4096 effettivi. Library default usa 200 (NEMA17). Sempre verificare datasheet.

6. **Disturbi elettrici** — Bobine stepper generano back-EMF. Capacitore decoupling 100 nF tra VCC ULN2003 e GND obbligatorio.

## Esperimenti correlati

- **Vol. 3 pag. 230** — Primo stepper: rotazione 1 giro avanti/indietro
- **Vol. 3 pag. 233** — Controllo angolo via potenziometro
- **Vol. 3 pag. 236** — Posizione precisa via keypad input gradi
- **Vol. 3 pag. 240** — Plotter X-Y mini (capstone, 2 stepper + penna)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 230):
> "Lo stepper è il cugino preciso del motore DC: invece di girare liberamente, gira esattamente come gli dici — utile per stampanti 3D, plotter, robot precisi."

**Cosa fare:**
- Vol. 3 pag. 230 raccomanda di insegnare stepper DOPO motore DC + servo (vedi `motore-dc.md`, `servo-motor.md`)
- Mostrate fisicamente: stepper si muove a "scatti" visibili. Ragazzi vedono i 200/4096 step come ticchettio
- Confronto stepper vs servo: servo solo 0-180°, stepper qualsiasi angolo + giri continui
- Plotter X-Y capstone iconic: ragazzi disegnano numeri/lettere semplici → connessione stampante 3D
- Vol. 3 raccomanda di partire da rotazione 1 giro completo per "sentire" la precisione

**Sicurezza:**
- 28BYJ-48 corrente piccola (~250 mA), basso rischio.
- ULN2003 si scalda a uso prolungato → ventilazione adeguata.
- Verificate alimentazione separata: pin Arduino 5V NON sufficiente per stepper.

**Cosa NON fare:**
- Non insegnate stepper prima di servo + DC — sequenza didattica importante.
- Non aspettatevi alta velocità con 28BYJ-48 (~15 RPM max). Per high-speed usare NEMA17 + driver A4988.
- Non lasciate stepper fermo alimentato per ore — bobine si scaldano + spreco energia.

## Link L1 (raw RAG queries)

- `"stepper motor 28BYJ-48 ULN2003 Arduino"`
- `"Stepper.h libreria step per giro"`
- `"ordine pin A C B D stepper"`
- `"half step micro step modalità"`
- `"plotter XY 2 stepper Arduino"`
