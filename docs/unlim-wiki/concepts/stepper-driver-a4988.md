---
id: stepper-driver-a4988
type: concept
title: "A4988 — driver per motori passo-passo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [stepper, motore-passo-passo, a4988, driver, vol-non-coperto]
---

## Definizione

L'**A4988** e' un driver integrato per motori passo-passo bipolari (4 fili). Si pilota con due soli pin Arduino (`STEP` + `DIR`) e gestisce internamente le 4 bobine del motore con corrente regolabile via potenziometro on-board (Vref). E' lo stesso chip usato in stampanti 3D RepRap, CNC piccole, plotter.

## Pinout modulo A4988

| Pin | Funzione |
|---|---|
| VMOT | alim. motore (8-35 V) |
| GND | massa motore |
| 2B, 2A | bobina A motore |
| 1A, 1B | bobina B motore |
| VDD | logica (3.3-5 V da Arduino) |
| GND | massa logica |
| ENABLE | LOW = abilitato |
| MS1, MS2, MS3 | microstepping (full/half/quarter/eight/sixteenth) |
| RESET, SLEEP | uniti a +5V se non usati |
| STEP | impulso = 1 passo |
| DIR | senso rotazione |

## Esempio Arduino — 200 passi (1 giro completo)

```cpp
const int STEP = 3;
const int DIR  = 4;

void setup() {
  pinMode(STEP, OUTPUT);
  pinMode(DIR, OUTPUT);
  digitalWrite(DIR, HIGH);
}

void loop() {
  for (int i = 0; i < 200; i++) {
    digitalWrite(STEP, HIGH);
    delayMicroseconds(800);
    digitalWrite(STEP, LOW);
    delayMicroseconds(800);
  }
  delay(1000);
  digitalWrite(DIR, !digitalRead(DIR));  // inverti senso
}
```

## Regolazione corrente (Vref)

Vmotore = N * 0.8 A tipico. Ruotare il potenziometro sul modulo finche' la tensione tra il dito (GND) e il dischetto centrale del trimmer = Vref desiderata. Formula approssimata: I_max = Vref / 0.8 (a seconda del clone, leggere datasheet).

## Errori comuni

1. **Scollegare il motore con corrente attiva** -> brucia l'A4988 (kickback induttivo)
2. **VMOT senza condensatore** 100 µF da VMOT a GND -> il chip si resetta
3. **GND non comune** tra Arduino e VMOT -> motore non si muove
4. **Microstepping a 1/16 senza dissipatore** -> A4988 va in protezione termica
5. **STEP troppo veloce** (< 200 µs LOW) -> il motore "sgrana"

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, un motore passo-passo si muove "a scatti": ogni impulso fa girare l'albero di un piccolo angolo (1.8 gradi tipici, cioe' 200 passi al giro). L'A4988 e' come un domatore che gestisce le 4 bobine al posto vostro.

**Cosa fare:**
- NON costruire questo circuito senza un docente che ha gia' usato motori esterni
- Spiegare che il motore passo-passo e' usato in stampanti 3D, scanner, robot
- Il kit ELAB Vol. base non include A4988 -- e' propedeutico per progetti avanzati

**Sicurezza:**
- Alim. motore separata, mai dal 5V Arduino
- GND comune obbligatorio
- Mai scollegare il motore con alim. attiva
- Dissipatore raccomandato a partire da 800 mA

## Link L1 (raw RAG queries)

- "A4988 motore passo passo Arduino"
- "Vref regolazione corrente A4988"
- "microstepping MS1 MS2 MS3"
