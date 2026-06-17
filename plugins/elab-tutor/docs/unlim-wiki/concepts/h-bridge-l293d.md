---
id: h-bridge-l293d
type: concept
title: "L293D — H-bridge per motori DC reversibili"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [l293d, h-bridge, motore-dc, motor-driver, vol-non-coperto]
---

## Definizione

L'**L293D** e' un integrato "H-bridge" che permette di controllare la **direzione** + **velocita'** di **due motori DC** (o un motore stepper bipolare). Ogni canale eroga fino a 600 mA (1.2 A picco), tensione motore 4.5-36 V. Include diodi flyback interni: comodissimo per progetti scuola.

H-bridge significa "ponte a H": 4 transistor in configurazione che permettono di invertire la polarita' del motore.

## Pinout DIP-16

```
       +---U---+
   1 (EN1)   16 (Vss = +5V logica)
   2 (IN1)   15 (IN4)
   3 (OUT1)  14 (OUT4)
   4 (GND)   13 (GND)
   5 (GND)   12 (GND)
   6 (OUT2)  11 (OUT3)
   7 (IN2)   10 (IN3)
   8 (Vs = motore)  9 (EN2)
       +-------+
```

- IN1, IN2 -> direzione motore A
- IN3, IN4 -> direzione motore B
- EN1, EN2 -> abilitazione (usabile come PWM per velocita')

## Tabella verita' motore A

| EN1 | IN1 | IN2 | Stato motore A |
|---|---|---|---|
| 0 | x | x | spento (free spin) |
| 1 | 0 | 0 | freno |
| 1 | 0 | 1 | gira avanti |
| 1 | 1 | 0 | gira indietro |
| 1 | 1 | 1 | freno |

PWM su EN1 = velocita'. IN1+IN2 = direzione.

## Schema collegamento (1 motore)

```
+5V (Arduino) --- Vss (16)
+9V (motore esterno) --- Vs (8)
GND comune --- 4, 5, 12, 13

Motore A --- OUT1 (3) e OUT2 (6)

Arduino:
  D5 (PWM) -> EN1 (1)
  D7 -> IN1 (2)
  D8 -> IN2 (7)
```

## Esempio Arduino

```cpp
const int EN1 = 5, IN1 = 7, IN2 = 8;

void setup() {
  pinMode(EN1, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void avanti(int velocita) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  analogWrite(EN1, velocita);
}

void indietro(int velocita) {
  digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);
  analogWrite(EN1, velocita);
}

void stop_() { analogWrite(EN1, 0); }

void loop() {
  avanti(200); delay(2000);
  stop_(); delay(500);
  indietro(200); delay(2000);
  stop_(); delay(500);
}
```

## Errori comuni

1. **Vs e Vss confusi** -> Vss = logica 5V, Vs = motore. Invertirli rompe l'IC
2. **GND non comune** -> nulla funziona
3. **EN1 a 0** -> il motore non parte mai (dimenticato)
4. **Corrente motore > 600 mA continui** -> L293D in protezione termica, motore rallenta
5. **Vs sopra 36V** -> distruzione

## L293D vs L298N

| | L293D | L298N |
|---|---|---|
| Corrente max | 600 mA continui, 1.2 A picco | 2 A continui, 3 A picco |
| Diodi flyback | INTERNI | ESTERNI (devi aggiungerli) |
| Tensione motore | 4.5-36 V | 5-46 V |
| Modulo classico | DIP-16 | breakout board (motor-driver-l298n.md) |
| Caso uso | piccoli motori, robot didattici | motori medi, robot 4 ruote |

Per kit ELAB iniziare con L293D (esiste gia' `motor-driver-l298n.md`).

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, l'L293D e' un "manubrio elettronico" per motori: con due interruttori (IN1, IN2) decidete il senso di rotazione, con un terzo (EN1) la velocita'. Lo stesso chip controlla due motori, perfetto per macchinine.

**Cosa fare:**
- NON e' nel kit ELAB base ma e' propedeutico per robotica didattica
- Per il kit ELAB usare il driver del volume corrispondente (es. L298N)
- Far disegnare la "tabella verita'" dei comandi motore prima di scrivere codice

**Sicurezza:**
- Alim. motore SEMPRE esterna, mai dal 5V Arduino
- GND comune obbligatorio
- Capacitatore 100 µF tra Vs e GND vicino all'IC -> stabilita'
- L293D scalda: dissipatore raccomandato sopra 400 mA

## Link L1 (raw RAG queries)

- "L293D H-bridge Arduino motore DC"
- "tabella verita IN1 IN2 EN1"
- "L293D vs L298N differenze"
