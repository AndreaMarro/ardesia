---
id: encoder-rotativo
type: concept
title: "Encoder rotativo — input quadratura per posizione angolare"
locale: it
volume_ref: 3
pagina_ref: 175
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [encoder, rotativo, quadratura, interrupt, vol3, input]
---

## Definizione

L'**encoder rotativo** è un input meccanico che genera impulsi digitali in quadratura quando ruota. Vol. 3 pag. 175 introduce: "L'encoder è come un interruttore che dice 'sto girando a destra' o 'sto girando a sinistra' un click alla volta — usatelo per menù, volumi, posizioni".

Pinout (5 pin tipo KY-040):
- **CLK** — canale A, segnale digital
- **DT** — canale B, segnale digital
- **SW** — pulsante interno (premendo l'asse)
- **+** — VCC 5V
- **GND** — massa

A differenza del potenziometro: encoder è **incrementale digitale**, NO valore assoluto. Conta click avanti/indietro.

## Principio quadratura

Due segnali sfasati 90°. Direzione si determina da quale fronte cambia per primo.

```
CW (orario):
  CLK ─┐ ┌─┐ ┌─┐ ┌─
       └─┘ └─┘ └─┘
  DT  ──┐ ┌─┐ ┌─┐ ┌
        └─┘ └─┘ └─┘  (DT shifted ~90° rispetto CLK)

CCW (antiorario): segnali invertiti
```

Logica: al fronte CLK falling → leggi DT.
- Se DT == HIGH → CW (+1)
- Se DT == LOW → CCW (-1)

## Schema collegamento

```
Arduino     KY-040 Encoder
  +5V  ───→ +
  GND  ───→ GND
  D2   ←── CLK (interrupt-capable pin!)
  D3   ←── DT
  D4   ←── SW (INPUT_PULLUP)
```

Vol. 3 pag. 175 raccomanda **D2 + D3** Arduino Nano (interrupt 0+1 hardware).

## Codice Arduino base (polling)

```cpp
const int PIN_CLK = 2;
const int PIN_DT = 3;
const int PIN_SW = 4;

int contatore = 0;
int CLK_lastState;

void setup() {
  pinMode(PIN_CLK, INPUT);
  pinMode(PIN_DT, INPUT);
  pinMode(PIN_SW, INPUT_PULLUP);
  Serial.begin(9600);
  CLK_lastState = digitalRead(PIN_CLK);
}

void loop() {
  int CLK_state = digitalRead(PIN_CLK);

  if (CLK_state != CLK_lastState && CLK_state == HIGH) {
    int DT_state = digitalRead(PIN_DT);
    if (DT_state == HIGH) contatore++;
    else contatore--;
    Serial.print("Contatore: "); Serial.println(contatore);
  }
  CLK_lastState = CLK_state;

  if (digitalRead(PIN_SW) == LOW) {
    contatore = 0;
    Serial.println("Reset");
    delay(200);  // debounce
  }
}
```

## Codice Arduino interrupt (più reattivo)

```cpp
volatile long contatore = 0;  // volatile perché modificato da ISR
const int PIN_CLK = 2;
const int PIN_DT = 3;

void aggiornaContatore() {
  if (digitalRead(PIN_DT) == HIGH) contatore++;
  else contatore--;
}

void setup() {
  pinMode(PIN_CLK, INPUT);
  pinMode(PIN_DT, INPUT);
  Serial.begin(9600);
  attachInterrupt(digitalPinToInterrupt(PIN_CLK), aggiornaContatore, RISING);
}

void loop() {
  static long ultimoContatore = 0;
  if (contatore != ultimoContatore) {
    ultimoContatore = contatore;
    Serial.println(contatore);
  }
}
```

Vol. 3 pag. 178 raccomanda interrupt per applicazioni real-time (volume audio, menù LCD, ecc).

## Esempio Vol. 3 — controllo luminosità LED PWM

```cpp
void aggiornaContatore() {
  // ISR: clamp contatore a 0-255 PWM range
  if (digitalRead(PIN_DT) == HIGH) contatore = min(255, contatore + 5);
  else contatore = max(0, contatore - 5);
}

void loop() {
  analogWrite(PIN_LED, contatore);  // luminosità segue rotazione
}
```

Vol. 3 pag. 180 estende: encoder + LCD I2C per menù navigazione visiva.

## Errori comuni

1. **Encoder bouncing** — Cattivi encoder economici hanno contatti rumorosi → letture multiple per click. Soluzione: capacitive debouncing 100nF + 10kΩ pull-up esterno hardware OR debounce software 5ms.

2. **Pin senza interrupt-capability** — Su Arduino Nano SOLO D2 + D3 supportano `attachInterrupt`. Usare pin diversi → polling slower.

3. **Pin mode INPUT senza pull-up** — Encoder KY-040 ha pull-up integrate, MA molti encoder generici no. Aggiungere `INPUT_PULLUP` se traccia segnali rumorosi.

4. **ISR troppo lunga** — `aggiornaContatore` deve essere SHORTEST possibile (no Serial.print, no delay). Mantenere logic dentro ISR < 5 µs.

5. **Confondere encoder con potenziometro** — Potenziometro = posizione assoluta 0-1023 ADC. Encoder = delta incremental. Use case diversi.

6. **Contatore overflow** — `int` 16-bit overflowa a 32767. Per contatore long-running usare `long` (32-bit).

## Esperimenti correlati

- **Vol. 3 pag. 175** — Primo encoder: contatore Serial Monitor
- **Vol. 3 pag. 178** — Encoder + interrupt: real-time
- **Vol. 3 pag. 180** — Encoder + LCD: navigazione menù
- **Vol. 3 pag. 183** — Encoder + servo: posizione angolare manuale

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 175):
> "L'encoder è come un interruttore che dice 'sto girando a destra' o 'sto girando a sinistra' un click alla volta — usatelo per menù, volumi, posizioni."

**Cosa fare:**
- Vol. 3 pag. 175 raccomanda di insegnare encoder DOPO `digitalRead` + `interrupt` concetti
- Mostrate empiricamente: ruotate encoder lentamente, vedete contatore Serial cambiare. Senso opposto = decremento
- Confronto con potenziometro: encoder ha "click" tattili, potenziometro è continuo
- Premete asse → SW = HIGH → reset contatore a 0
- Esempio menù LCD molto coinvolgente: ragazzi navigano ricette/setup con rotazione

**Sicurezza:**
- Encoder è componente meccanico passivo. Sicuro per uso ragazzi.
- Verificate VCC 5V (alcuni encoder economici 3.3V max).

**Cosa NON fare:**
- Non usate encoder per posizione assoluta — è incrementale, perde stato a power-off
- Non insegnate interrupt prima di polling — sequenza didattica importante
- Non mettete delay() in ISR — blocca tutto Arduino

## Link L1 (raw RAG queries)

- `"encoder rotativo Arduino quadratura"`
- `"KY-040 CLK DT SW pinout"`
- `"attachInterrupt encoder pin 2 3"`
- `"debounce encoder rumoroso"`
- `"ISR volatile long contatore"`
